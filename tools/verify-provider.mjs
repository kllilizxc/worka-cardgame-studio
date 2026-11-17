// Called from the isolated native Worka import test when a real CardGame checkout is supplied.
import assert from 'node:assert/strict';
import {realpath} from 'node:fs/promises';
import {setTimeout as sleep} from 'node:timers/promises';
import {buildCatalog} from './catalog-index.mjs';
import {buildStory} from './story-index.mjs';

const catalogKeys=['map','encounter','cards','monsters','people','shop','media'];
const contentNotes=['story',...catalogKeys];

async function until(check,label){
  const deadline=Date.now()+20000;
  while(Date.now()<deadline){if(check())return;await sleep(20);}
  throw Error(label);
}

export async function verifyProvider({app,installed,engine,byKey,source}){
  if(!source)return;
  const root=await realpath(source);
  const [expectedStory,expectedCatalog]=await Promise.all([buildStory(root),Promise.resolve().then(()=>buildCatalog(root))]);
  const observed=new Map(),leases=[];
  const providerConnection={provider:'game-project',connectionId:'game-project',desktopId:installed.id};
  const sessionId='test-game-project-setup';
  await app.core.saveSession({id:sessionId,desktopId:installed.id,setupConnection:providerConnection,updatedAt:Date.now()});
  const invoke=(method,input)=>app.dispatch('extension.invoke',{extension:'game-project',method,input},{kind:'agent',sessionId});
  try{
    for(const key of contentNotes){
      const noteId=byKey.get(key);
      const scope={workspace:app.workspaceRoot,access:'user',providerConnection,noteId,caller:{kind:'user',controlNoteId:noteId,providerConnection}};
      leases.push(app.resources.subscribe({name:'extension.game-project.status',input:{}},scope,snapshot=>{if(snapshot.data)observed.set(key,snapshot.data);}));
    }
    await until(()=>contentNotes.every(k=>observed.get(k)?.configured===false),'部分便笺未发布初始未连接状态');
    const receipt=await invoke('bind',{source:root,noteId:byKey.get('story')});
    assert.equal(receipt.status,'accepted');
    await app.commands.wait(receipt.executionId);
    assert.equal((await app.core.getExecution(receipt.executionId))?.value.result?.root,root);
    await until(()=>contentNotes.every(k=>observed.get(k)?.ready&&observed.get(k)?.root===root),'已打开便笺未自动收到项目连接状态');
    for(const key of contentNotes){
      const noteId=byKey.get(key);
      const readiness=await app.resources.read({name:'note.readiness',input:{noteId}},{workspace:app.workspaceRoot,access:'user'});
      assert.equal(readiness.error,undefined,key);
      assert.equal(readiness.data.initialization.blocked,false,key+' remains blocked after binding');
      assert.equal(readiness.data.initialization.state,'verified',key+' did not verify');
    }
    for(const key of catalogKeys){
      const page=await engine.query(byKey.get(key),'collection',{sort:'name',page:1});
      assert.equal(page.configured,true);
      assert.equal(page.count,expectedCatalog[key].initialConfig.records.length,key+' bound record count');
      assert.ok(page.items.length>0&&page.items.length<=24);
      const detail=await engine.query(byKey.get(key),'record',{id:page.items[0].id});
      assert.equal(detail.title,page.items[0].title);
    }
    const storyId=byKey.get('story');
    const scenes=await engine.query(storyId,'scenes',{limit:20});
    assert.equal(scenes.configured,true);
    assert.equal(scenes.total,expectedStory.initialConfig.storyIndex.length);
    assert.ok(scenes.items.length<=20);
    const mdScene=expectedStory.initialConfig.storyIndex.find(s=>s.path.endsWith('.md'));
    assert(mdScene);
    const doc=await engine.query(storyId,'document',{path:mdScene.path,maxLines:25});
    assert(doc&&doc.content.length>0);
    console.log('项目 provider：同桌面 8 张内容便笺收到一次绑定的验证结果；按页实时读取、章节原文与实时引用均已核验。');
  }finally{
    for(const stop of leases)stop();
  }
}
