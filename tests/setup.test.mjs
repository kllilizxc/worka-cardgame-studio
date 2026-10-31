import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink} from 'node:fs/promises';
import {execFileSync,spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gameProject} from '../provider/index.mjs';

const repo=fileURLToPath(new URL('..',import.meta.url));
const reference={provider:'game-project',connectionId:'game-project'};
const git=(dir,...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8'}).trim();
async function fixture(dir){
  const game=join(dir,'game'),desks={},records=new Map(),notes=new Map();
  for(const path of ['public/data/cards','knowledge'])await mkdir(join(game,path),{recursive:true});
  await writeFile(join(game,'public/data/cards/units.json'),JSON.stringify({units:[{id:'UNIT',kind:'unit',name:'测试灵狐',attack:2,health:3}]}));
  await writeFile(join(game,'public/data/content-catalog.json'),'{"resources":[]}');
  await writeFile(join(game,'knowledge/index.md'),'# 雾林\n\n原本的剧情');
  git(game,'init','-q');git(game,'add','.');git(game,'-c','user.name=Fixture','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-qm','fixture');
  for(const id of ['one','two']){
    const directory=join(dir,id),noteIds=Object.fromEntries(['cards','preview','story'].map(k=>[k,id+'-'+k]));
    await mkdir(join(directory,'playtest'),{recursive:true});await writeFile(join(directory,'playtest/preview.config.mjs'),'export default {};');
    await mkdir(join(directory,'connections/references'),{recursive:true});await writeFile(join(directory,'connections/references/connection.ts'),'');
    desks[id]={directory,noteIds,relationIds:{references:id+'-links'},relationPaths:{references:'connections/references'}};
    for(const noteId of Object.values(noteIds)){notes.set(noteId,{desktopId:id,id:noteId});records.set('states/'+noteId+':config',{connections:{game:reference}});}
    records.set('records/'+id+':publication',{noteIds});
  }
  const values=new Map(),host={dataRoot:join(dir,'worka-data'),app:{
    core:{readRecord:async(table,k)=>({value:records.get(table+'/'+k)}),writeRecord:async(table,k,v)=>records.set(table+'/'+k,v),
      getNote:async id=>({value:notes.get(id)}),getSession:async id=>({value:id==='desktop-one'?{desktopId:'one'}:id==='note-one'?{desktopId:'one',noteId:'one-cards'}:undefined})},
    dispatch:async(method,input)=>{if(method==='desktop.source')return desks[input.desktopId];
      if(method==='connection.get')return {enabled:true,revision:1};
      if(method==='connection.update'){values.set(input.id,(values.get(input.id)||0)+1);return {};}throw Error(method);}
  }};
  return {game,host,desks,notes,values};
}
const asDesktop={kind:'agent',sessionId:'desktop-one'};
function ctx(noteId){return {scope:{noteId,caller:{kind:'user'},providerConnection:reference},signal:new AbortController().signal};}
function status(provider,id){return provider.resources.status.load({},ctx(id));}
function index(provider,id){return provider.resources.index.query.load({},ctx(id));}
test('one binding projects each selected note, restarts and refreshes dirty files without crossing desktops',async()=>{
 const root=await mkdtemp(join(tmpdir(),'game-project-'));
 try{
  const f=await fixture(root),provider=gameProject(f.host);
  assert.equal((await status(provider,'one-story')).configured,false);
  assert.equal(await index(provider,'one-story'),null);
  const [r,r2]=await Promise.all([provider.invoke('bind',{source:f.game},asDesktop),provider.invoke('bind',{source:f.game},asDesktop)]);
  assert.equal(r.commit,git(f.game,'rev-parse','HEAD'));assert.deepEqual(r,r2);
  assert.equal(f.values.get('one-links'),1);
  for(const note of ['one-story','one-cards','one-preview'])assert.equal((await status(provider,note)).ready,true);
  assert.equal((await status(provider,'two-cards')).ready,false);
  assert.equal((await index(provider,'one-preview')).gameRoot,f.game);
  assert.equal((await index(provider,'one-preview')).gameCommit,r.commit);
  const rows=await index(provider,'one-cards');assert.equal(rows.records[0].title,'测试灵狐');
  const original=await index(provider,'one-story');assert.equal(original.storyIndex[0].body,'');
  const disk=await provider.resources.document.query.load({path:'knowledge/index.md'},ctx('one-story'));
  assert.match(disk.content,/原本的剧情/);
  await provider.close();
  const restored=gameProject(f.host);
  assert.equal((await status(restored,'one-cards')).ready,true);
  await writeFile(join(f.game,'public/data/cards/units.json'),JSON.stringify({units:[{id:'UNIT',kind:'unit',name:'工作稿',attack:9,health:3}]}));
  const before=git(f.game,'status','--porcelain'),m=await restored.invoke('refresh',{},asDesktop);
  assert.equal(m.commit,r.commit);assert.equal(git(f.game,'status','--porcelain'),before);assert.equal((await index(restored,'one-cards')).records[0].title,'工作稿');
  await assert.rejects(restored.invoke('bind',{source:f.game,desktopId:'two'},asDesktop),/当前桌面/);
  await assert.rejects(restored.invoke('bind',{source:f.game},{kind:'agent',sessionId:'note-one'}),/当前桌面/);
  await assert.rejects(restored.invoke('bind',{source:f.game},{...asDesktop,readOnly:true}),/可写用户/);
  await assert.rejects(restored.invoke('bind',{source:'https://example.com/repo'},asDesktop),/GitHub/);
  await assert.rejects(restored.resources.document.query.load({path:'../../etc/passwd'},ctx('one-story')));
  const escaped=join(root,'outside.md');await writeFile(escaped,'unrelated');
  await symlink(escaped,join(f.game,'knowledge/escaped.md'));
  await assert.rejects(restored.resources.document.query.load({path:'knowledge/escaped.md'},ctx('one-story')),/项目内/);
  await assert.rejects(restored.resources.index.load({},ctx('not-a-member')));
  await assert.rejects(restored.resources.status.load({},{scope:{noteId:'one-story'},signal:new AbortController().signal}));
  const many=Array.from({length:3000},(_,i)=>({id:'C'+i,kind:'unit',name:'样本'+i,description:'草药试验',attack:i%5+1,health:3}));
  await writeFile(join(f.game,'public/data/cards/units.json'),JSON.stringify({units:many}));
  await restored.invoke('refresh',{},asDesktop);
  assert.equal((await index(restored,'one-cards')).records.length,3000);
  const oversized=many.map(c=>({...c,description:'大'.repeat(760)}));
  await writeFile(join(f.game,'public/data/cards/units.json'),JSON.stringify({units:oversized}));
  await assert.rejects(restored.invoke('refresh',{},asDesktop),/cards.*上限/);
  assert.equal((await index(restored,'one-cards')).records.length,3000);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('partial link activation restores the prior source and retry commits once',async()=>{
 const root=await mkdtemp(join(tmpdir(),'game-project-rollback-'));
 try{
  const f=await fixture(root),dispatch=f.host.app.dispatch;
  let fail=true;
  f.host.app.dispatch=async(method,input,...args)=>{
    if(method==='connection.update'&&fail){fail=false;throw Error('activation interrupted');}
    return dispatch(method,input,...args);
  };
  const p=gameProject(f.host),file=join(f.desks.one.directory,'connections/references/connection.ts');
  await assert.rejects(p.invoke('bind',{source:f.game},asDesktop),/activation interrupted/);
  assert.equal(await readFile(file,'utf8'),'');
  assert.equal((await status(p,'one-story')).configured,false);
  await p.invoke('bind',{source:f.game},asDesktop);
  assert.equal((await status(p,'one-story')).ready,true);
  const custom='export default {on:{},roles:{},links:[]};';
  await writeFile(file,custom);
  await assert.rejects(p.invoke('refresh',{},asDesktop),/已修改/);
  assert.equal(await readFile(file,'utf8'),custom);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('GitHub URL uses a reusable managed checkout and never rewrites its working tree',async()=>{
 const root=await mkdtemp(join(tmpdir(),'game-project-remote-'));
 const key='GIT_CONFIG_GLOBAL',previous=process.env[key];
 try{
  const f=await fixture(root),provider=gameProject(f.host),url='https://github.com/example/cardgame-fixture.git';
  const config=join(root,'gitconfig');process.env[key]=config;
  execFileSync('git',['config','--file',config,'url.file://'+f.game+'.insteadOf',url]);
  await writeFile(join(f.game,'.gitattributes'),'knowledge/index.md filter=project-test\n');
  git(f.game,'add','.gitattributes');git(f.game,'-c','user.name=Fixture','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-qm','filter fixture');
  // A game may request a locally installed filter. No filter executable runs while binding.
  const marker=join(root,'FILTER_EXECUTED');
  execFileSync('git',['config','--file',config,'filter.project-test.smudge','touch "'+marker+'"; cat']);
  execFileSync('git',['config','--file',config,'filter.project-test.required','true']);
  const args={desktopId:'one',source:url},received=await provider.invoke('bind',args,{kind:'user'});
  await assert.rejects(readFile(marker),{code:'ENOENT'});
  assert.notEqual(received.root,f.game);assert.equal(received.commit,git(f.game,'rev-parse','HEAD'));
  await writeFile(join(received.root,'knowledge/index.md'),'# 托管目录中的未提交内容');
  await provider.invoke('bind',args,{kind:'user'});
  assert.match(await readFile(join(received.root,'knowledge/index.md'),'utf8'),/未提交内容/);
 }finally{if(previous==null)delete process.env[key];else process.env[key]=previous;await rm(root,{recursive:true,force:true});}
});
test('setup CLI delivers the source once to the selected desktop provider, refresh needs no path',async()=>{
 const root=await mkdtemp(join(tmpdir(),'cardgame-cli-')),calls=[];
 const rpc=createServer(async(req,res)=>{let text='';for await(const c of req)text+=c;const request=JSON.parse(text);calls.push(request);
  assert.equal(req.headers['x-workbench-token'],'test-token');res.end(JSON.stringify({ok:true,data:request.method==='desktop.list'?[{id:'one',name:'卡牌游戏创作室'}]:{root:'/tmp/game',commit:'1234567890',scenes:7,links:12}}));});
 try{
  rpc.listen(0,'127.0.0.1');await once(rpc,'listening');
  const conn=join(root,'connection.json');await writeFile(conn,JSON.stringify({url:'http://127.0.0.1:'+rpc.address().port+'/workbench/api',token:'test-token',protocolVersion:'test'}));
  for(const args of [['--game','https://github.com/kllilizxc/CardGame'],['--desktop','one']]){
    const child=spawn(process.execPath,[join(repo,'tools/setup.mjs'),'--connection',conn,...args]);assert.equal((await once(child,'close'))[0],0);
  }
  assert.deepEqual(calls.filter(c=>c.method==='extension.invoke').map(c=>c.input),[
    {extension:'game-project',method:'bind',input:{desktopId:'one',source:'https://github.com/kllilizxc/CardGame'}},
    {extension:'game-project',method:'refresh',input:{desktopId:'one'}}
  ]);
 }finally{rpc.closeAllConnections();await new Promise(resolve=>rpc.close(resolve));await rm(root,{recursive:true,force:true});}
});
