import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {buildStory} from './story-index.mjs';
import {buildCatalog,catalogLinks} from './catalog-index.mjs';

export const catalogKeys=['map','encounter','cards','monsters','people','shop','media'];
export const name='卡牌游戏创作室';
// The middle row gives the expedition map and its encounter a shared sightline.
const tiles = [
  ['ideas','点子库',0,0,238,213],['todo','制作待办',245,0,234,213],
  ['preview','试玩',486,0,351,213],['story','剧情知识库',844,0,388,213],
  ['map','秘境地图',0,220,779,282],['encounter','战斗关卡',786,220,446,282],
  ['cards','卡牌与牌组',0,509,399,219],['monsters','怪物',406,509,180,219],
  ['people','人物志',593,509,195,219],['shop','物品与商店',795,509,192,219],
  ['media','素材库',994,509,238,219],
];
export const referenceNotes=['story',...catalogKeys,'preview'];
export const alias=note=>'STUDIO_NOTE_'+note.toUpperCase()+'_ID';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
export async function projectData(root){
  const commit=execFileSync('git',['-C',root,'rev-parse','--verify','HEAD^{commit}'],{encoding:'utf8'}).trim();
  const [story,catalog,registry]=await Promise.all([buildStory(root),buildCatalog(root),json(join(root,'public/data/content-catalog.json'))]);
  const links=catalogLinks(catalog);
  const graph=(n,id,t,other,label)=>links.push({source:{noteId:n,recordId:id},target:{noteId:t,recordId:other},label});
  const play=(n,id,entry,label)=>graph(n,id,'preview','play:'+JSON.stringify(entry),label);
  const records=Object.fromEntries(Object.entries(catalog).map(([key,n])=>[key,new Map(n.initialConfig.records.map(row=>[row.id,row]))]));
  for(const scene of story.initialConfig.storyIndex){
    for(const ref of scene.refs||[]){
      const target=records[ref.note]?.get(ref.id);if(!target)continue;
      graph('story',scene.id,ref.note,ref.id,target.title);
      graph(ref.note,ref.id,'story',scene.id,scene.title);
    }
    if(scene.nodeId&&scene.storyId)play('story',scene.id,{kind:'story',resourceId:scene.storyId,nodeId:scene.nodeId},'试玩此场景');
  }
  const byPath=new Map(registry.resources.map(r=>['public/'+r.publicPath.replace(/^\/+/,''),r]));
  for(const key of ['map','encounter']){
    for(const row of records[key].values()){
      const [file,pointer]=row.source.split('#'),resource=byPath.get(file);
      if(!resource)continue;
      const encounter=key==='map'&&pointer&&row.refs.find(x=>x.note==='encounter');
      if(encounter){const battle=records.encounter.get(encounter.id);const entry=byPath.get(battle?.source.split('#')[0]);if(entry){play(key,row.id,{kind:'encounter',resourceId:entry.resourceId},'试玩此战斗');continue;}}
      play(key,row.id,{kind:key,resourceId:resource.resourceId},key==='encounter'?'试玩此战斗':'从秘境入口试玩');
    }
  }
  return {commit,catalog,story,links};
}
export function referenceCode(links){
  const declarations=links.map(({source,target,label})=>({source:{...source,noteId:alias(source.noteId)},target:{...target,noteId:alias(target.noteId)},label}));
  return "import {defineConnection} from '@dsh-workbench/runtime/connection';\nexport default defineConnection({roles:{},on:{},links:[\n"+declarations.map(link=>'  '+JSON.stringify(link)).join(',\n')+"\n]});\n";
}
export async function portableDesktop(repo,{catalog,story}){
  const flow=await json(join(repo,'connections/relations.json'));
  return {schemaVersion:6,version:'2.0.0',name,extensions:[{path:'published/game-project'}],camera:{x:32,y:104,scale:1},
    notes:tiles.map(([key,title,x,y,width,height])=>({key,name:title,source:{path:'published/'+key},
      layout:{x,y,width,height,autoHeight:false,expandedWidth:key==='preview'?1420:1180,expandedHeight:800},
      ...(referenceNotes.includes(key)?{initialConfig:{...(key==='story'?{...story.initialConfig,resources:[]}:catalog[key]?.initialConfig),connections:{game:{provider:'game-project',connectionId:'game-project'}}}}:{})})),
    relations:[...flow,{key:'references',name:'内容引用',goal:'导航到游戏记录、原文及可试玩的起点。',nodeKeys:referenceNotes,enabled:true,subscriptions:[],source:{path:'connections/references',noteBindings:Object.fromEntries(referenceNotes.map(key=>[alias(key),key]))}}],
    sourceFiles:['AGENTS.md','README.md','LICENSE','docs/worka-home.png','playtest/preview.config.mjs','playtest/entry.mjs','playtest/serve.mjs','tools/catalog-index.mjs','tools/story-index.mjs','tools/studio.mjs','tools/setup.mjs','tools/worka-client.mjs','connections/relations.json']};
}
