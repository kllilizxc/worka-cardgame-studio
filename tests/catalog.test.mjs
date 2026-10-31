import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCatalog,catalogLinks} from '../tools/catalog-index.mjs';
import {search} from '../notes/catalog/search.ts';
const game=process.env.CARDGAME_ROOT;
test('query covers the full collection, limits page and facet output, and composes filters',()=>{
  const rows=Array.from({length:1256},(_,i)=>({id:'A'+i,title:'card '+i,group:'卡牌',body:'',source:'data/cards.json',fields:[],sections:[{title:'牌效',lines:[i===1030?'命中后撤离':'抽牌']}],facets:{阵营:[i%2?'乙':'甲'],费用:[String(i%5)],标签:['标签'+i]}}));
  const hits=search(rows,{q:'撤离',filters:{费用:['0','1'],阵营:['甲']}});
  assert.equal(hits.items[0].id,'A1030');assert.equal(hits.count,1);
  assert.equal(search(rows,{q:'撤离',filters:{费用:['0'],阵营:['乙']}}).count,0);
  const end=search(rows,{page:10000});assert.equal(end.items.at(-1).id,'A1255');assert.equal(end.page,53);
  const tags=search(rows,{}).facets.find(f=>f.key==='标签');assert.equal(tags.options.length,30);assert.ok(tags.hasMore);
  assert.equal(search(rows,{facetQuery:'标签1255'}).facets.find(f=>f.key==='标签').options[0].value,'标签1255');
});
test('materializes real domain values, media keys and traversable native links from the supplied checkout',{skip:!game},()=>{
  const catalog=buildCatalog(game), rows=Object.fromEntries(Object.entries(catalog).map(([k,v])=>[k,v.initialConfig.records]));
  assert.deepEqual(Object.keys(rows).sort(),['cards','encounter','map','media','monsters','people','shop']);
  const room=rows.map.find(r=>r.id.endsWith('::battle.tutorial-qingyun-mist-fox'));
  assert.ok(room.refs.some(r=>r.note==='encounter'&&r.id==='tutorial.qingyun-encounter-mist-fox'));
  const encounter=rows.encounter.find(r=>r.id==='tutorial.qingyun-encounter-mist-fox');
  assert.ok(encounter.sections[0].lines.some(l=>l.includes('青云山灵狐')));
  assert.ok(rows.shop.some(r=>r.fields.some(f=>f.name==='灵石售价'&&f.value==='8')));
  assert.ok(rows.people.find(r=>r.id==='npc.qa-fog-fox').mediaKey);
  assert.ok(rows.cards.find(r=>r.id==='CR_001').thumbnail);
  const foxFace=rows.media.filter(r=>r.source.includes('/card-faces/CR_001/'));
  assert.deepEqual(foxFace.map(r=>r.title).sort(),['原画','玉牌预览','玉牌实装','卷轴预览','卷轴实装'].map(role=>'青云山灵狐 · '+role).sort());
  assert.ok(search(rows.media,{q:foxFace[0].source.split('/').pop()}).items.some(r=>r.id===foxFace[0].id));
  const links=catalogLinks(catalog);
  const addresses=new Set(Object.entries(rows).flatMap(([note,records])=>records.map(r=>note+'|'+r.id)));
  for(const {source,target} of links){assert.ok(addresses.has(source.noteId+'|'+source.recordId));assert.ok(addresses.has(target.noteId+'|'+target.recordId));}
  assert.equal(new Set(links.map(l=>JSON.stringify([l.source,l.target]))).size,links.length);
  for(const r of rows.media){
    const hash=createHash('sha256').update(readFileSync(game+'/'+r.source)).digest('hex');
    assert.equal(r.mediaKey,r.source+'?v='+hash.slice(0,16));
  }
});
