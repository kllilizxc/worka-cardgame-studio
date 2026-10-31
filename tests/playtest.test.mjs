import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import project from '../playtest/preview.config.mjs';
import {gameEntry} from '../playtest/entry.mjs';

test('a note links to the precise game resource or fails explicitly',t=>{
  const root=mkdtempSync(join(tmpdir(),'studio-entry-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const dir=join(root,'public','data');mkdirSync(dir,{recursive:true});
  const write=(name,value)=>writeFileSync(join(dir,name+'.json'),JSON.stringify(value));
  const resources=[['story','s'],['encounter','e'],['deck','deck.starter'],['expeditionMap','m'],['worldMap','world']].map(([kind,resourceId])=>({kind,resourceId,publicPath:'data/'+resourceId+'.json'}));
  write('content-catalog',{resources});
  write('s',{storyId:'s',entryNodeId:'opening',nodes:[{id:'opening'},{id:'ship',locationId:'quay'}]});
  write('e',{id:'real-encounter'});write('deck.starter',{cards:[{id:'talisman',count:3}]});
  write('m',{mapId:'m'});write('world',{destinations:[{kind:'expedition',id:'cave',mapResourceId:'m'}]});
  const story=gameEntry(root,{kind:'story',resourceId:'s',nodeId:'ship'});
  assert.equal(story.scene,'StoryScene');assert.equal(story.payload.storyState.currentNodeId,'ship');
  assert.equal(story.payload.storyState.currentLocationId,'quay');
  assert.equal(gameEntry(root,{kind:'map',resourceId:'m'}).payload.destinationId,'cave');
  assert.deepEqual(gameEntry(root,{kind:'encounter',resourceId:'e'}).payload.runDeck,[{id:'talisman',count:3}]);
  assert.throws(()=>gameEntry(root,{kind:'story',resourceId:'s',nodeId:'gone'}),/剧情节点/);
  assert.throws(()=>gameEntry(root,{kind:'map',resourceId:'e'}),/没有这个试玩资源/);
});

test('the served frame namespaces save data by the full game commit and candidate',()=>{
  const commit='d'.repeat(40);
  const ctx={key:'case-1',repos:{game:{repo:'/game',dir:'/worktree',commit}},options:{}};
  const {services,surfaces}=project.plan(ctx);
  const query=new URL(surfaces[0].path,'http://preview').searchParams;
  for(const key of ['workaProject','workaCandidate','workaCommit','workaProfile'])assert.ok(query.get(key));
  assert.equal(query.get('workaCommit'),commit);assert.equal(query.get('workaCandidate'),'case-1');
  assert.equal(services[0].cwd,'/worktree');assert.equal(services[0].env.STUDIO_COMMIT,commit);
});

test('the actual CardGame catalog resolves story, map and encounter launch payloads',{skip:!process.env.CARDGAME_ROOT},()=>{
  const root=process.env.CARDGAME_ROOT;
  const rows=JSON.parse(readFileSync(join(root,'public/data/content-catalog.json'),'utf8')).resources;
  for(const [kind,resourceKind,scene] of [['story','story','StoryScene'],['map','expeditionMap','ExpeditionScene'],['encounter','encounter','BattleScene']]){
    const real=rows.filter(r=>r.kind===resourceKind);
    assert.ok(real.length);
    for(const r of real)assert.equal(gameEntry(root,{kind,resourceId:r.resourceId}).scene,scene);
  }
});
