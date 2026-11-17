import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,realpath,writeFile,rm,symlink} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {gameProject} from '../provider/index.mjs';

const reference={provider:'game-project',connectionId:'game-project'};
const git=(dir,...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8'}).trim();

async function until(check,label,timeoutMs=8000){
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){if(await check())return;await sleep(25);}
  throw Error(label);
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
      records.set(`states/${noteId}:config`,{...(kind==='story'?{}:{kind}),connections:{game:reference}});
    }
  }
  const emit=(table,key)=>{for(const fn of [...coreListeners])fn({changes:[{table,key}]});};
  const host={
    dataRoot:join(dir,'worka-data'),
    app:{
      core:{
        readRecord:async(table,k)=>records.has(table+'/'+k)?{value:records.get(table+'/'+k)}:undefined,
        writeRecord:async(table,k,v)=>{records.set(table+'/'+k,v);emit(table,k);},
        getNote:async id=>notes.has(id)?{value:notes.get(id)}:undefined,
        listNotes:async({desktopId}={})=>[...notes.entries()].filter(([,v])=>!desktopId||v.desktopId===desktopId).map(([key,value])=>({key,value})),
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
        provider.invoke('bind',{source:f.game},{kind:'agent',sessionId:'cards-chat-one',noteId:'one-cards',controlNoteId:'one-cards'}),
        provider.invoke('bind',{source:f.game},{kind:'agent',sessionId:'desktop-one'}),
      ]);
      assert.deepEqual(b1,b2);
      assert.equal(b1.root,await realpath(f.game));
      assert.equal((await provider.resources.status.load({},ctx('one-cards'))).ready,true);
      assert.equal((await provider.resources.status.load({},ctx('two-cards'))).configured,false);
      await assert.rejects(provider.invoke('bind',{source:f.game,desktopId:'two'},{kind:'agent',sessionId:'cards-chat-one'}),/当前桌面/);
      await assert.rejects(provider.invoke('bind',{source:f.game},{kind:'agent',sessionId:'cards-chat-one',readOnly:true}),/可写/);

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
      await provider.invoke('bind',{desktopId:'one',source:f.game},{kind:'user'});
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
