// Authored design examples live in the imported desktop. Binding a real game replaces this projection.
import {readFile} from 'node:fs/promises';
import {catalogLinks} from './catalog-index.mjs';
const directory=new URL('../examples/qingyun/',import.meta.url);
export const exampleFiles=['campaign.json','portrait.webp','shrine.webp','mist-wind.mp3'].map(f=>'examples/qingyun/'+f);
export async function withPortableDemo(data) {
  const example=JSON.parse(await readFile(new URL('campaign.json',directory),'utf8'));
  const {map,deck,battle,scenes}=example;
  const source='examples/qingyun/campaign.json';
  const ref=(note,id)=>({note,id});
  const field=(name,value)=>({name,value:String(value)});
  const record=(id,title,group,body,fields=[],refs=[])=>({id,title,group,body,source:source+'#'+id,fields,refs,facets:{类型:[group],来源:['创作室示例']},sections:[]});
  const rows=key=>data.catalog[key].initialConfig.records;
  const diagram=map.rooms.map(([id,label,kind,layer,to])=>({id,label,kind,layer,to}));
  const rooms=diagram.map(r=>record(r.id,r.label,r.kind,r.label+' · '+map.title,[],[...r.to.map(id=>ref('map',id)),...(r.kind==='战斗'?[ref('encounter',battle.id)]:[])]));
  rows('map').unshift({...record(map.id,map.title,'秘境',map.body,[field('房间数',rooms.length)],rooms.map(r=>ref('map',r.id))),diagram},...rooms);
  rows('cards').push(...example.cards.map(([id,title,group,body])=>record(id,title,group,body)));
  const shop=example.shop;
  if(rows('shop').some(r=>r.id===shop.item))rows('shop').push(record(shop.id,shop.title,'货架','雾林药铺的撤离物品。',[field('灵石售价',shop.price)],[ref('shop',shop.item)]));
  const cards=new Map(rows('cards').map(r=>[r.id,r]));
  const entries=deck.cards.filter(([id])=>cards.has(id));
  if(entries.length===deck.cards.length){
    const r=record(deck.id,deck.title,'牌组','进入雾林时携带的试炼牌组。',[field('总张数',entries.reduce((sum,[,n])=>sum+n,0))],entries.map(([id])=>ref('cards',id)));
    r.sections.push({title:'构筑',lines:entries.map(([id,n])=>cards.get(id).title+' × '+n)});rows('cards').unshift(r);
  }
  const foes=[...new Map(battle.units.map(u=>[u[0],u])).values()];
  rows('monsters').push(...foes.map(([id,title,atk,hp])=>record(id,title,'敌方单位','盘踞青玉洞的守卫。',[field('攻击',atk),field('气血',hp)])));
  const enc=record(battle.id,battle.title,'精英',battle.body,[],battle.units.map(([id])=>ref('monsters',id)));
  enc.sections=[{title:'敌方阵位',lines:battle.units.map(([,title,atk,hp],i)=>'位置 '+(i+1)+' · '+title+' · 攻 '+atk+' / 血 '+hp)},
    {title:'特殊事件',lines:battle.events.map(([turn,kind,title])=>JSON.stringify({turn,kind,title}))}];rows('encounter').unshift(enc);
  const story=data.story.initialConfig;
  story.storyIndex.unshift(...scenes.map(scene=>({...scene,folders:['雾林药铺','第一章'],path:source,search:scene.title+' '+scene.body,
    refs:scene.id==='studio-mist-clash'?[ref('encounter',battle.id)]:[]})));
  story.initialScene=scenes[0].id;
  const art=await Promise.all([['portrait.webp','雾林行者','人设','image/webp'],['shrine.webp','雾林药铺','背景','image/webp'],['mist-wind.mp3','雾林风声','环境声','audio/mpeg']].map(async ([file,title,group,mime])=>{
    const r=record('example:'+file,title,group,'雾林试炼 · '+title);
    const url='data:'+mime+';base64,'+(await readFile(new URL(file,directory))).toString('base64');
    r.source='examples/qingyun/'+file;r.mediaUrl=url;if(mime.startsWith('image/'))r.thumbnail=url;
    if(mime.startsWith('audio/'))r.facets['媒介']=['声音'];return r;
  }));rows('media').unshift(...art);
  const existing=new Set(data.links.map(r=>JSON.stringify([r.source,r.target])));
  for(const edge of catalogLinks(data.catalog)){
    if(!existing.has(JSON.stringify([edge.source,edge.target])))data.links.push(edge);
  }
  data.links.push({source:{noteId:'story',recordId:'studio-mist-clash'},target:{noteId:'encounter',recordId:battle.id},label:battle.title});
  return data;
}
