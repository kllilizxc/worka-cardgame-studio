import { readFile, readdir, realpath } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

async function listMarkdown(root, dir = 'knowledge') {
  const entries = await readdir(join(root, dir), {withFileTypes:true});
  const groups = await Promise.all(entries.sort((a,b) => a.name.localeCompare(b.name)).map(entry => {
    const path = dir + '/' + entry.name;
    if (entry.isDirectory()) return listMarkdown(root, path);
    return entry.isFile() && /\.md(?:own|arkdown)?$/i.test(entry.name) ? [path] : [];
  }));
  return groups.flat();
}

function frontmatter(text) {
  const header = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!header) return {};
  return Object.fromEntries(header[1].split(/\r?\n/).flatMap(line => {
    const pair = /^([\w-]+):\s*(.*?)\s*$/.exec(line);
    return pair ? [[pair[1], pair[2].replace(/^(['"])([\s\S]*)\1$/, '$2')]] : [];
  }));
}
function plain(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/<!--[\s\S]*?-->/g, '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, '').replace(/\s+/g, ' ').trim();
}
function choiceLinks(text, source) {
  const section = /^##\s+选项\s*$([\s\S]*?)(?=^#{1,2}\s|$(?![\s\S]))/m.exec(text)?.[1] ?? '';
  return Array.from(section.matchAll(/^\s*(?:[-*+]\s+|\d+\.\s+)\[([^\]]+)\]\(([^)]+)\)/gm), ([,label,url]) =>
    ({label, path:resolve(dirname(source), decodeURIComponent(url.split('#')[0]))}));
}
function inside(root, path) {
  const part = relative(root, path);
  if (part === '..' || part.startsWith('..'+sep)) throw Error('剧情源超出项目范围：'+path);
  return part.split(sep).join('/');
}

function backgroundAsset(value, assets) {
  if (typeof value !== 'string' || !/\.(png|jpe?g|webp|svg|avif)$/i.test(value)) return undefined;
  const path = value.startsWith('public/') ? value : 'public/' + value.replace(/^\//, '');
  return assets.get(path) || 'asset:' + path;
}

function sceneRefs(source,assets) {
  const ids = {speakerId:'people',npcId:'people',actorId:'people',relationId:'people',cardId:'cards',itemId:'shop',encounterId:'encounter',encounterResourceId:'encounter'};
  const refs = new Map();
  function visit(value) {
    if(!value || typeof value!=='object')return;
    for(const [key,v] of Object.entries(value)){
      if(typeof v==='string'){
        let note=ids[key],id=v;
        if((key.endsWith('Asset')||key==='portrait') && /\.(png|jpe?g|webp|svg|avif|mp3|ogg|wav)$/i.test(v)){
          const path=v.startsWith('public/')?v:'public/'+v.replace(/^\//,'');
          note='media';id=assets.get(path)||'asset:'+path;
        }
        if(note&&id!=='player')refs.set(note+':'+id,{note,id});
      }else visit(v);
    }
  }
  visit(source);return [...refs.values()];
}
function markdownRefs(content,meta,assets){
  const values=[meta];
  const parse=text=>{try{values.push(JSON.parse(text));}catch{}};
  Object.values(meta).filter(v=> /^[{[]/.test(v)).forEach(parse);
  for(const m of content.matchAll(/<!--\s*story-[\w-]+:\s*([\s\S]*?)\s*-->/g))parse(m[1]);
  return sceneRefs(values,assets);
}

/** Read only the declared checkout. An authored Markdown scene overrides its compiled runtime copy. */
export async function buildStory(gameRoot) {
  const root=await realpath(gameRoot);
  const catalog=JSON.parse(await readFile(join(root,'public/data/content-catalog.json'),'utf8'));
  const assetsFile=join(root,'public/assets/asset-manifest.json');
  const assets=await readFile(assetsFile,'utf8').then(text=>new Map(JSON.parse(text).assets.map(a=>[a.path,a.id])),err=>{
    if(err.code==='ENOENT')return new Map();throw err;
  });
  const graphs=[], byNode=new Map();
  for (const resource of catalog.resources.filter(r => r.kind === 'story' || /^(storygraph|storycontent)$/i.test(r.kind))) {
    const file=await realpath(resolve(root,'public',resource.publicPath));
    const path=inside(root,file);
    const graph=JSON.parse(await readFile(file,'utf8'));
    if(!Array.isArray(graph.nodes)) continue;
    const book=graph.title || resource.resourceId;
    graphs.push({book,path,resource,graph});
    for (const node of graph.nodes) {
      const list=byNode.get(node.id) ?? [];
      list.push({storyId:resource.resourceId,book});
      byNode.set(node.id,list);
    }
  }
  const rows=[], docs=new Map(), authored=new Set(), ids=new Set(), pending=new Map();
  for (const path of await listMarkdown(root)) {
    const file=await realpath(join(root,path));
    inside(root,file);
    const text=await readFile(file,'utf8'), meta=frontmatter(text), scene=meta.scene === 'true' && !!meta.nodeId;
    const matches=scene?byNode.get(meta.nodeId)??[]:[];
    const graph=matches.find(m=>m.storyId===meta.storyId) ?? (matches.length===1?matches[0]:undefined);
    const storyId=meta.storyId || graph?.storyId || '';
    const id=scene ? meta.nodeId : path;
    if (docs.has(file) || ids.has(id)) throw Error('重复剧情记录：'+id);
    const group=relative('knowledge',dirname(path)).split(sep).filter(Boolean);
    const folders=scene?[graph?.book || meta.storyTitle || storyId || '未归卷剧情', ...(group.length?group:[]), meta.chapter||'未分章', ...(meta.act?[meta.act]:[])] : ['资料',...group];
    const title=meta.title || /^#\s+(.+)$/m.exec(text)?.[1] || path.split('/').pop();
    const row={id,title,path,folders,body:text,search:plain(text),choices:[],refs:markdownRefs(text,meta,assets),backgroundAssetId:backgroundAsset(meta.backgroundAsset,assets),...(scene?{storyId,nodeId:meta.nodeId}:{})};
    rows.push(row);docs.set(file,row);ids.add(id);
    if(scene && storyId) authored.add(JSON.stringify([storyId,meta.nodeId]));
    if(scene) pending.set(row,choiceLinks(text,file));
  }
  for(const [row,targets] of pending) {
    row.choices=targets.flatMap(edge=>docs.has(edge.path)?[{label:edge.label,to:docs.get(edge.path).id}]:[]);
  }
  for(const {book,path,graph,resource} of graphs) {
    const route=(id)=>authored.has(JSON.stringify([resource.resourceId,id]))?id:resource.resourceId+'::'+id;
    for(const node of graph.nodes) {
      if(authored.has(JSON.stringify([resource.resourceId,node.id])))continue;
      const choices=(graph.choices??[]).filter(c=>c.from===node.id);
      const words=[node.title,node.summary,node.detail,node.body,...(node.dialogues??[]).flatMap(d=>[d.speakerName,d.text]),...choices.map(c=>c.text)];
      rows.push({id:route(node.id),title:node.title||node.id,path,folders:[book,node.chapter||'正文',...(node.act?[node.act]:[])],
        refs:sceneRefs([node,...choices],assets),backgroundAssetId:backgroundAsset(node.backgroundAsset,assets),body:JSON.stringify({nodes:[node],choices}),search:words.filter(Boolean).join(' '),choices:choices.map(c=>({label:c.text||c.id,to:route(c.to)})),
        storyId:resource.resourceId,nodeId:node.id});
    }
  }
  const launched=[];
  for(const resource of catalog.resources.filter(r=>r.kind==='hub')) {
    const file=await realpath(resolve(root,'public',resource.publicPath));
    inside(root,file);
    const hub=JSON.parse(await readFile(file,'utf8'));
    const locations=Array.isArray(hub.locations)?hub.locations:[];
    for(const location of [...locations.filter(l=>l.id===hub.defaultLocationId),...locations.filter(l=>l.id!==hub.defaultLocationId)])
      for(const action of location.actions??[])if(action.kind==='startStory'&&typeof action.storyResourceId==='string')launched.push(action.storyResourceId);
  }
  const isMainline=({graph})=>{
    const tags=graph.nodes.find(node=>node.id===graph.entryNodeId)?.tags??[];
    return tags.includes('主线')&&!tags.some(tag=>['教学','教程','示例'].includes(tag));
  };
  const ordered=[...graphs.filter(g=>launched.includes(g.resource.resourceId)&&isMainline(g)),...graphs.filter(isMainline),...graphs];
  const initialId=ordered.map(({graph,resource})=>rows.find(row=>row.storyId===resource.resourceId&&row.nodeId===graph.entryNodeId)?.id).find(Boolean) || rows.find(row=>row.nodeId)?.id || rows[0]?.id;
  return {initialState:{},initialConfig:{
    resources:[{title:'CardGame',path:join(root,'knowledge/index.md'),root,linkBase:root}],
    storyIndex:rows,initialScene:initialId??''
  }};
}

/** A connected note reads originals from Worka reference resources; keep only its searchable navigation index. */
export function boundStoryConfig(config) {
  if(!config.resources?.length)throw Error('剧情知识库缺少已绑定的项目资料入口。');
  return {...config,storyIndex:config.storyIndex.map(row=>({...row,body:''}))};
}
