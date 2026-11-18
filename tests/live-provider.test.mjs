import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,readdir,realpath,writeFile,rm,symlink} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {testSubprocess} from './subprocess-fixture.mjs';
import {gameProject} from '../provider/index.mjs';

const reference={provider:'game-project',connectionId:'game-project'};
const git=(dir,...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8'}).trim();

async function until(check,label,timeoutMs=8000){
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){if(await check())return;await sleep(25);}
  throw Error(label);
}

let nextBind = 0;
function runBind(provider,input,caller) {
  const desktop = input.desktopId ?? (caller.sessionId==='desktop-two'?'two':'one');
  const noteId = caller.noteId ?? `${desktop}-story`;
  return provider.commands.bind.run(input,{noteId,caller,executionId:`command:bind-${++nextBind}`,signal:new AbortController().signal});
}
async function createFixture(dir){
  const game=join(dir,'game'),records=new Map(),notes=new Map(),coreListeners=new Set();
  for(const path of ['public/data/cards','public/data/decks','public/assets','knowledge'])await mkdir(join(game,path),{recursive:true});
  await writeFile(join(game,'public/assets/test.png'),'image-v1');
  await writeFile(join(game,'public/data/cards/units.json'),JSON.stringify({units:[
    {id:'FOX_01',kind:'unit',name:'测试灵狐',cost:3,attack:2,health:3,cardFace:{artwork:'public/assets/test.png'}},
    {id:'SWORD_01',kind:'talisman',name:'飞剑符',cost:2,description:'造成 4 点伤害'},
  ]}));
  await writeFile(join(game,'public/data/decks/starter.json'),JSON.stringify({name:'起始牌组',cards:[{id:'FOX_01',count:2}]}));
  await writeFile(join(game,'public/data/content-catalog.json'),JSON.stringify({resources:[]}));
  await writeFile(join(game,'knowledge/index.md'),'---\nscene: true\nnodeId: forest_gate\ntitle: 雾林山门\ncardId: FOX_01\n---\n# 雾林山门\n\n原本的雾气。\n');
  git(game,'init','-q','-b','main');
  git(game,'add','.');
  git(game,'-c','user.name=Fixture','-c','user.email=test@example.invalid','-c','commit.gpgsign=false','commit','-qm','initial');

  for(const id of ['one','two']){
    for(const kind of ['story','cards','media']){
      const noteId=`${id}-${kind}`;
      notes.set(noteId,{id:noteId,desktopId:id});
      records.set(`states/${noteId}:config`,{kind,connections:{game:reference}});
    }
  }
  const emit=(table,key)=>{for(const fn of [...coreListeners])fn({changes:[{table,key}]});};
  await mkdir(join(dir,'worka-data'),{recursive:true});
  const host={
    runtime:{subprocess:testSubprocess},
    dataRoot:join(dir,'worka-data'),
    app:{
      core:{
        readRecord:async(table,k)=>records.has(table+'/'+k)?{value:records.get(table+'/'+k)}:undefined,
        writeRecord:async(table,k,v)=>{records.set(table+'/'+k,v);emit(table,k);},
        getNote:async id=>notes.has(id)?{value:notes.get(id)}:undefined,
        listNotes:async({desktopId}={})=>[...notes.entries()].filter(([,v])=>!desktopId||v.desktopId===desktopId).map(([key,value])=>({key,value})),
        getExecution:async()=>undefined,
        getSession:async id=>({value:id==='desktop-one'?{desktopId:'one'}:id==='cards-chat-one'?{desktopId:'one',noteId:'one-cards',delegationId:'task-1'}:id==='desktop-two'?{desktopId:'two'}:undefined}),
        subscribe:fn=>{coreListeners.add(fn);return()=>coreListeners.delete(fn);},
      },
      skillConnections:{
        list:async desktopId=>[{
          id:`${desktopId}-refs`,
          enabled:true,
          archived:false,
          nodeIds:['story','cards','media'].map(k=>`${desktopId}-${k}`),
        }],
      },
      dispatch:async(method,input)=>{
        if(method==='desktop.source')return {directory:dir,noteIds:Object.fromEntries(['story','cards','media'].map(k=>[k,`${input.desktopId}-${k}`]))};
        throw Error('unexpected dispatch: '+method);
      },
    },
  };
  return {game,host};
}

function ctx(noteId){
  const desktopId=noteId.split('-')[0];
  return {
    scope:{noteId,caller:{kind:'user'},providerConnection:{...reference,desktopId}},
    signal:new AbortController().signal,
  };
}

test('live paginated reads, fs.watch invalidation, note-session callers, and live reciprocal references work without refresh',async()=>{
  const root=await mkdtemp(join(tmpdir(),'live-game-project-'));
  try{
    const f=await createFixture(root),provider=gameProject(f.host);
    try{
      assert.equal((await provider.resources.status.load({},ctx('one-cards'))).configured,false);
      assert.equal(await provider.resources.catalog.query.load({op:'page'},ctx('one-cards')),null);

      // Note sessions and task sessions on the same desktop are allowed (no desktop-chat-only gate), while cross-desktop and readOnly are rejected.
      const [b1,b2]=await Promise.all([
        runBind(provider,{source:f.game},{kind:'agent',sessionId:'cards-chat-one',noteId:'one-cards',controlNoteId:'one-cards'}),
        runBind(provider,{source:f.game},{kind:'agent',sessionId:'desktop-one'}),
      ]);
      assert.deepEqual(b1,b2);
      assert.equal(b1.root,await realpath(f.game));
      assert.equal((await provider.resources.status.load({},ctx('one-cards'))).ready,true);
      assert.equal((await provider.resources.status.load({},ctx('two-cards'))).configured,false);
      await assert.rejects(runBind(provider,{source:f.game,desktopId:'two'},{kind:'agent',sessionId:'cards-chat-one'}),/当前桌面/);
      await assert.rejects(runBind(provider,{source:f.game},{kind:'agent',sessionId:'cards-chat-one',readOnly:true}),/可写/);

      // Paginated catalog read returns only this note's kind, a page at a time, plus live reciprocal links.
      const page1=await provider.resources.catalog.query.load({op:'page',size:1,page:1,sort:'name'},ctx('one-cards'));
      assert.equal(page1.total,3);
      assert.equal(page1.items.length,1);
      assert.equal(page1.pages,3);

      const fox=await provider.resources.catalog.query.load({op:'record',id:'FOX_01'},ctx('one-cards'));
      assert.equal(fox.fields.find(x=>x.name==='费用').value,'3');
      // FOX_01 has live reciprocal links to deck:starter (cards), forest_gate (story), and test.png (media) — computed live!
      assert(fox.links.some(l=>l.target.noteId==='one-cards'&&l.target.recordId==='deck:starter'));
      assert(fox.links.some(l=>l.target.noteId==='one-story'&&l.target.recordId==='forest_gate'));
      assert(fox.links.some(l=>l.target.noteId==='one-media'&&l.target.recordId==='asset:public/assets/test.png'));

      // Subscribe to cards & story; edit files on disk and verify automatic invalidation + live reads with NO refresh call.
      let cardEvents=0,storyEvents=0;
      const stopCards=provider.resources.catalog.query.subscribe({op:'record',id:'FOX_01'},()=>{cardEvents++;},ctx('one-cards'));
      const stopStory=provider.resources.document.query.subscribe({path:'knowledge/index.md'},()=>{storyEvents++;},ctx('one-story'));
      try{
        await sleep(80);
        await writeFile(join(f.game,'public/data/cards/units.json'),JSON.stringify({units:[
          {id:'FOX_01',kind:'unit',name:'测试灵狐',cost:1,attack:2,health:3,cardFace:{artwork:'public/assets/test.png'}},
          {id:'SWORD_01',kind:'talisman',name:'飞剑符',cost:2,description:'造成 4 点伤害'},
        ]}));
        await until(()=>cardEvents>0,'expected fs.watch invalidation after card edit');
        const cheaper=await provider.resources.catalog.query.load({op:'record',id:'FOX_01'},ctx('one-cards'));
        assert.equal(cheaper.fields.find(x=>x.name==='费用').value,'1');

        const beforeStoryEvents=storyEvents;
        await writeFile(join(f.game,'knowledge/index.md'),'---\nscene: true\nnodeId: forest_gate\ntitle: 雾林新山门\ncardId: SWORD_01\n---\n# 雾林新山门\n\n浓雾散开。\n');
        await until(()=>storyEvents>beforeStoryEvents,'expected fs.watch invalidation after story edit');
        const doc=await provider.resources.document.query.load({path:'knowledge/index.md'},ctx('one-story'));
        assert.match(doc.content,/浓雾散开/);
        const sceneRes=await provider.resources.story.query.load({op:'scene',id:'forest_gate'},ctx('one-story'));
        assert.equal(sceneRes.scene.title,'雾林新山门');
        // Live reference moved from FOX_01 to SWORD_01 automatically!
        assert(sceneRes.scene.links.some(l=>l.target.noteId==='one-cards'&&l.target.recordId==='SWORD_01'));
        assert(!sceneRes.scene.links.some(l=>l.target.recordId==='FOX_01'));

        // Asset updates live on disk without throwing a stale-index error, and escapes are contained.
        await writeFile(join(f.game,'public/assets/test.png'),'image-v2');
        const asset=await provider.resources.asset.query.load({id:'asset:public/assets/test.png'},ctx('one-cards'));
        assert.equal(asset,'data:image/png;base64,'+Buffer.from('image-v2').toString('base64'));
        assert.equal(await provider.resources.asset.query.load({id:'asset:../../etc/passwd'},ctx('one-cards')),null);
        const outside=join(root,'secret.md');
        await writeFile(outside,'outside');
        await symlink(outside,join(f.game,'knowledge/escaped.md'));
        await assert.rejects(provider.resources.document.query.load({path:'knowledge/escaped.md'},ctx('one-story')),/项目内/);
      }finally{
        stopCards();
        stopStory();
      }
    }finally{
      await provider.close();
    }
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});

test('worktree branch commit and OK merge into main push to remote and update bound live reads',async()=>{
  const root=await mkdtemp(join(tmpdir(),'live-branch-merge-'));
  try{
    const f=await createFixture(root),remote=join(root,'remote.git'),worktree=join(root,'wt-feature');
    execFileSync('git',['init','--bare','-q',remote]);
    git(f.game,'remote','add','origin',remote);
    git(f.game,'push','-q','-u','origin','main');

    const provider=gameProject(f.host);
    try{
      await runBind(provider,{desktopId:'one',source:f.game},{kind:'user'});
      let invalidations=0;
      const stop=provider.resources.catalog.query.subscribe({op:'page'},()=>{invalidations++;},ctx('one-cards'));
      try{
        await sleep(80);
        // Simulate work item building on an isolated branch/worktree: main checkout does NOT have the card yet.
        git(f.game,'worktree','add','-q','-b','feat/bell-card',worktree,'main');
        await writeFile(join(worktree,'public/data/cards/units.json'),JSON.stringify({units:[
          {id:'FOX_01',kind:'unit',name:'测试灵狐',cost:3,attack:2,health:3},
          {id:'BELL_01',kind:'artifact',name:'雾隐铜铃',cost:1,description:'撤离提示'},
        ]}));
        git(worktree,'add','public/data/cards/units.json');
        git(worktree,'-c','user.name=Worker','-c','user.email=worker@example.invalid','-c','commit.gpgsign=false','commit','-qm','add bell card');
        const branchSha=git(worktree,'rev-parse','HEAD');
        assert.equal(await provider.resources.catalog.query.load({op:'record',id:'BELL_01'},ctx('one-cards')),null);

        // User replies "OK": merge branch into main, push to remote, clean up worktree, and verify live read updates automatically.
        const beforeMergeEvents=invalidations;
        git(f.game,'merge','--ff-only','feat/bell-card');
        git(f.game,'push','-q','origin','main');
        git(f.game,'worktree','remove','--force',worktree);
        git(f.game,'branch','-d','feat/bell-card');

        await until(()=>invalidations>beforeMergeEvents,'expected invalidation when branch merges into main');
        assert.equal(git(remote,'rev-parse','refs/heads/main'),branchSha);
        const merged=await provider.resources.catalog.query.load({op:'record',id:'BELL_01'},ctx('one-cards'));
        assert.equal(merged?.title,'雾隐铜铃');
      }finally{
        stop();
      }
    }finally{
      await provider.close();
    }
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});

test('N reads share one cached projection until a file change triggers exactly one rebuild, and home resolves peers once',async()=>{
  const root=await mkdtemp(join(tmpdir(),'live-projection-cache-'));
  try{
    const f=await createFixture(root);
    let builds=0,listNotesCalls=0,connectionsCalls=0;
    const origListNotes=f.host.app.core.listNotes,origConnections=f.host.app.skillConnections.list;
    f.host.app.core.listNotes=async(...args)=>{listNotesCalls++;return origListNotes(...args);};
    f.host.app.skillConnections.list=async(...args)=>{connectionsCalls++;return origConnections(...args);};

    const provider=gameProject(f.host,{onBuild:()=>{builds++;}});
    try{
      await runBind(provider,{desktopId:'one',source:f.game},{kind:'user'});
      assert.equal(builds,0);

      let invalidations=0;
      const stop=provider.resources.catalog.query.subscribe({op:'page'},()=>{invalidations++;},ctx('one-cards'));
      try{
        await sleep(80);
        // Perform 8 reads across catalog, story, and asset: must trigger only 1 projection build!
        listNotesCalls=0;connectionsCalls=0;
        const home=await provider.resources.catalog.query.load({op:'home'},ctx('one-cards'));
        assert.equal(home.records.length,2); // deck + FOX_01
        assert.equal(listNotesCalls,1);
        assert.equal(connectionsCalls,1);

        await Promise.all([
          provider.resources.catalog.query.load({op:'page',page:1},ctx('one-cards')),
          provider.resources.catalog.query.load({op:'record',id:'FOX_01'},ctx('one-cards')),
          provider.resources.catalog.query.load({op:'overview'},ctx('one-cards')),
          provider.resources.story.query.load({op:'scenes'},ctx('one-story')),
          provider.resources.story.query.load({op:'scene',id:'forest_gate'},ctx('one-story')),
          provider.resources.story.query.load({op:'home'},ctx('one-story')),
          provider.resources.asset.query.load({id:'asset:public/assets/test.png'},ctx('one-cards')),
        ]);
        assert.equal(builds,1);

        // Modify a file on disk: watcher clears the cache, and subsequent N reads trigger exactly 1 rebuild!
        const beforeInvalidations=invalidations;
        await writeFile(join(f.game,'public/data/cards/units.json'),JSON.stringify({units:[
          {id:'FOX_01',kind:'unit',name:'缓存更新灵狐',cost:1,attack:5,health:3,cardFace:{artwork:'public/assets/test.png'}},
        ]}));
        await until(()=>invalidations>beforeInvalidations,'expected watcher invalidation after file change');

        const [rec,page,scene]=await Promise.all([
          provider.resources.catalog.query.load({op:'record',id:'FOX_01'},ctx('one-cards')),
          provider.resources.catalog.query.load({op:'page',page:1},ctx('one-cards')),
          provider.resources.story.query.load({op:'scene',id:'forest_gate'},ctx('one-story')),
        ]);
        assert.equal(rec.title,'缓存更新灵狐');
        assert.equal(page.total,2);
        assert.equal(scene.scene.id,'forest_gate');
        assert.equal(builds,2);
      }finally{
        stop();
      }
    }finally{
      await provider.close();
    }
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});

test('rebinding a desktop closes the old root watcher only after its last desktop leaves',async()=>{
  const {watch:watchFs}=await import('node:fs');
  const root=await mkdtemp(join(tmpdir(),'live-rebind-watcher-'));
  try{
    const f=await createFixture(root),second=join(root,'game-two');
    git(root,'clone','-q',f.game,second);
    const gameA=await realpath(f.game),gameB=await realpath(second);
    const activeWatchers=new Map();
    const watch=(dir,opts,listener)=>{
      const raw=watchFs(dir,opts,listener);
      const tracked={closed:false};
      activeWatchers.set(dir,tracked);
      const origClose=raw.close.bind(raw);
      raw.close=()=>{tracked.closed=true;return origClose();};
      return raw;
    };

    const provider=gameProject(f.host,{watch});
    try{
      await runBind(provider,{desktopId:'one',source:gameA},{kind:'user'});
      await runBind(provider,{desktopId:'two',source:gameA},{kind:'user'});
      await provider.resources.catalog.query.load({op:'overview'},ctx('one-cards'));
      assert.equal(activeWatchers.get(gameA)?.closed,false);

      // Desktop 'one' rebinds to gameB while desktop 'two' still uses gameA -> gameA watcher stays open!
      await runBind(provider,{desktopId:'one',source:gameB},{kind:'user'});
      await provider.resources.catalog.query.load({op:'overview'},ctx('one-cards'));
      assert.equal(activeWatchers.get(gameA)?.closed,false);
      assert.equal(activeWatchers.get(gameB)?.closed,false);

      // Desktop 'two' now also rebinds to gameB -> no desktop uses gameA -> gameA watcher is closed!
      await runBind(provider,{desktopId:'two',source:gameB},{kind:'user'});
      assert.equal(activeWatchers.get(gameA)?.closed,true);
      assert.equal(activeWatchers.get(gameB)?.closed,false);
    }finally{
      await provider.close();
      assert.equal(activeWatchers.get(gameB)?.closed,true);
    }
  }finally{
    await rm(root,{recursive:true,force:true});
  }
});



test('a cancelled clone clears its temporary checkout and a later bind can proceed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cardgame-clone-cancel-'));
  try {
    const {game,host} = await createFixture(root);
    const bin=join(root,'bin'), marker=join(root,'git-started');
    const realGit=execFileSync('which',['git'],{encoding:'utf8'}).trim();
    await mkdir(bin);
    await writeFile(join(bin,'git'),`#!${process.execPath}
const {writeFileSync}=require('node:fs');
const {spawnSync}=require('node:child_process');
if(process.argv.includes('clone')){
  writeFileSync(${JSON.stringify(marker)},String(process.pid));
  setInterval(()=>{},1000);
}else{
  const result=spawnSync(${JSON.stringify(realGit)},process.argv.slice(2),{stdio:'inherit'});
  process.exit(result.status??1);
}
`,{mode:0o700});
    host.runtime.subprocess={spawn:spec=>testSubprocess.spawn({...spec,env:{...spec.env,PATH:`${bin}:${process.env.PATH}`}})};
    const provider=gameProject(host);
    try {
      const controller=new AbortController();
      const running=provider.commands.bind.run({desktopId:'one'},{noteId:'one-story',caller:{kind:'user'},executionId:'command:cancel-clone',signal:controller.signal});
      const rejected=assert.rejects(running);
      try {
        await until(()=>readFile(marker).then(()=>true,()=>false),'clone did not start');
        const status=await provider.resources.status.load({},ctx('one-cards'));
        assert.equal(status.executionId,'command:cancel-clone');
        assert.equal(status.ready,false);
      } finally {
        controller.abort();
        await rejected;
      }
      const pid=Number(await readFile(marker,'utf8'));
      await until(()=>{try{process.kill(pid,0);return false;}catch(error){return error.code==='ESRCH';}},'cancelled Git process did not exit');
      const [desktop]=await readdir(join(host.dataRoot,'providers','game-project'));
      assert.deepEqual(await readdir(join(host.dataRoot,'providers','game-project',desktop,'repos')),[]);
      assert.equal((await provider.resources.status.load({},ctx('one-cards'))).executionId,undefined);
      const ready=await runBind(provider,{desktopId:'one',source:game},{kind:'user'});
      assert.equal(ready.root,await realpath(game));
    } finally {await provider.close();}
  } finally {await rm(root,{recursive:true,force:true});}
});
