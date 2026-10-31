import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRecords} from '../notes/catalog/home.ts';

const row=(id,group,extra={})=>({id,title:id,body:'',group,source:id,fields:[],sections:[],refs:[],facets:{},...extra});
test('the fanned hand links to real deck members and lets other game indexes show their own cards',()=>{
  const ids=['jade-step-card','jade-fox-card','jade-sword','jade-charm','iron-armor','spirit-seal'];
  const deck=row('jade-mist-deck','牌组',{refs:ids.map(id=>({note:'cards',id})),fields:[{name:'总张数',value:'24'}]});
  const all=[deck,row('unrelated','牌'),...ids.toReversed().map(id=>row(id,'牌'))];
  assert.deepEqual(homeRecords('cards',all).records.map(r=>r.id),[deck.id,...ids]);
  const custom=Array.from({length:1200},(_,i)=>row('own-'+i,'牌'));
  const home=homeRecords('cards',custom);
  assert.equal(home.count,1200);assert.deepEqual(home.records.map(r=>r.id),custom.slice(0,6).map(r=>r.id));
});
test('a map compact is bounded and an empty library keeps a real empty state',()=>{
  const rooms=Array.from({length:200},(_,i)=>({id:'r'+i,label:'r'+i,layer:i,kind:'事件',to:[]}));
  const graph=row('map','地图',{diagram:rooms});
  assert.equal(homeRecords('map',[graph]).records[0].diagram.length,7);
  assert.equal(graph.diagram.length,200);
  assert.deepEqual(homeRecords('map',[]).records,[]);
});
test('a shop price appears only for the featured item’s actual offer',()=>{
  const item=row('tool.return-rope','物品');
  const unrelated=row('other-offer','货架',{refs:[{note:'shop',id:'other'}]});
  const offer=row('rope-offer','货架',{refs:[{note:'shop',id:item.id}]});
  assert.deepEqual(homeRecords('shop',[item,unrelated,offer]).records.map(r=>r.id),[item.id,offer.id]);
});

test('the importable authoring sample links its deck, rooms, chapter branches and shop to stored records', async()=>{
  const {readFile,access}=await import('node:fs/promises');
  const root=new URL('../',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('desktop.json',root),'utf8'));
  await Promise.all(manifest.sourceFiles.map(file=>access(new URL(file,root))));
  const notes=Object.fromEntries(manifest.notes.map(n=>[n.key,n.initialConfig]));
  const deck=homeRecords('cards',notes.cards.records).records;
  assert.equal(deck[0].fields.find(f=>f.name==='总张数').value,'24');
  assert.deepEqual(deck.slice(1).map(c=>c.title),['清风步','灵狐札','青云剑','聚灵小坠','玄铁护甲','引魂符']);
  const map=homeRecords('map',notes.map.records).records[0],ids=new Set(notes.map.records.map(r=>r.id));
  assert.equal(map.diagram.length,6);
  for(const room of map.diagram)assert([room.id,...room.to].every(id=>ids.has(id)));
  const battle=homeRecords('encounter',notes.encounter.records).records[0];
  assert(battle.sections.find(s=>s.title==='特殊事件').lines.map(v=>JSON.parse(v)).some(e=>e.turn===4&&e.kind==='增援'));
  const [,offer]=homeRecords('shop',notes.shop.records).records;
  assert.equal(offer.fields.find(f=>f.name==='灵石售价').value,'120');
  const scenes=notes.story.storyIndex,scene=scenes.find(s=>s.id===notes.story.initialScene);
  assert.deepEqual(scene.choices.map(c=>scenes.find(s=>s.id===c.to)?.title),['雾中交锋','白叶草坡']);
});
