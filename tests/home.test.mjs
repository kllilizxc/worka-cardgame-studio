import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRecords} from '../notes/catalog/home.ts';

const row=(id,group,extra={})=>({id,title:id,body:'',group,source:id,fields:[],sections:[],refs:[],facets:{},...extra});
test('the fanned hand links to real deck members and lets other game indexes show their own cards',()=>{
  const ids=['jade-step-card','jade-fox-card','jade-sword','jade-charm','iron-armor','spirit-seal'];
  const deck=row('jade-mist-deck','牌组',{refs:ids.map(id=>({note:'cards',id})),fields:[{name:'总张数',value:'24'}]});
  const all=[deck,row('unrelated','牌'),...ids.toReversed().map(id=>row(id,'牌'))];
  assert.deepEqual(homeRecords('cards',all).records.map(r=>r.id),[deck.id,...ids.toReversed()]);
  const custom=Array.from({length:1200},(_,i)=>row('own-'+i,'牌'));
  const home=homeRecords('cards',custom);
  assert.equal(home.count,1200);assert.deepEqual(home.records.map(r=>r.id),custom.slice(0,6).map(r=>r.id));
});
test('the home hand prefers a real deck whose cards have game artwork',()=>{
  const card=row('dragon','单位牌',{mediaKey:'public/assets/dragon.png?v=123'});
  const plain=row('plain','单位牌');
  const first=row('first','牌组',{refs:[{note:'cards',id:plain.id}]});
  const illustrated=row('illustrated','牌组',{refs:[{note:'cards',id:card.id}]});
  assert.deepEqual(homeRecords('cards',[first,illustrated,plain,card]).records.map(r=>r.id),['illustrated','dragon']);
});
test('home spotlights records with actual artwork where available',()=>{
  const first=row('first','人物');
  const withArt=row('fox','人物',{mediaKey:'public/assets/fox.png?v=123'});
  assert.equal(homeRecords('people',[first,withArt]).records[0].id,'fox');
  const encounter=row('battle','战斗',{portraits:[{id:'fox',mediaKey:withArt.mediaKey}]});
  assert.equal(homeRecords('encounter',[row('other','战斗'),encounter]).records[0].id,'battle');
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

test('the importable desktop has real records and no seeded example work', async()=>{
  const {readFile,access}=await import('node:fs/promises');
  const root=new URL('../',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('desktop.json',root),'utf8'));
  await Promise.all(manifest.sourceFiles.map(file=>access(new URL(file,root))));
  const notes=Object.fromEntries(manifest.notes.map(n=>[n.key,n.initialConfig]));
  assert(!notes.ideas?.includeExampleWork && !notes.todo?.includeExampleWork);
  for(const key of ['cards','map','encounter','monsters','people','shop','media']) {
    assert(notes[key].records.length>0);
    assert(notes[key].records.every(row=>!row.source.startsWith('examples/')));
  }
  assert(notes.story.storyIndex.every(scene=>!scene.path.startsWith('examples/')));
  const [deck,...cards]=homeRecords('cards',notes.cards.records).records;
  assert.equal(deck.group,'牌组');
  const fullDeck=notes.cards.records.find(row=>row.id===deck.id);
  assert(cards.every(card=>fullDeck.refs.some(ref=>ref.note==='cards'&&ref.id===card.id)));
});
