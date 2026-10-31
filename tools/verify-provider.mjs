// Called from the isolated native Worka import test when a real CardGame checkout is supplied.
import assert from 'node:assert/strict';
import {realpath} from 'node:fs/promises';
import {setTimeout as sleep} from 'node:timers/promises';
import {catalogKeys,projectData,referenceNotes} from './studio.mjs';

async function until(check,label) {
  const deadline=Date.now()+20000;
  while(Date.now()<deadline){if(check())return;await sleep(20);}
  throw Error(label);
}
export async function verifyProvider({app,installed,engine,byKey,source}) {
  if(!source)return;
  const root=await realpath(source),expected=await projectData(root),observed=new Map(),leases=[];
  const providerConnection={provider:'game-project',connectionId:'game-project'};
  const invoke=(method,fields)=>app.dispatch('extension.invoke',{extension:'game-project',method,input:{desktopId:installed.id,...fields}},{kind:'user'});
  try{
    for(const key of referenceNotes){
      const noteId=byKey.get(key);
      const scope={workspace:app.workspaceRoot,access:'user',providerConnection,noteId,caller:{kind:'user',controlNoteId:noteId,providerConnection}};
      leases.push(app.resources.subscribe({name:'extension.game-project.status',input:{}},scope,snapshot=>{if(snapshot.data)observed.set(key,snapshot.data);}));
    }
    await until(()=>referenceNotes.every(k=>observed.get(k)?.configured===false),'部分便笺未发布初始未连接状态');
    const receipt=await invoke('bind',{source:root});
    assert.equal(receipt.commit,expected.commit);assert.equal(receipt.root,root);
    await until(()=>referenceNotes.every(k=>observed.get(k)?.ready&&observed.get(k)?.commit===expected.commit),'已打开便笺未自动收到项目连接状态');
    for(const key of catalogKeys){
      const index=await engine.query(byKey.get(key),'collection',{sort:'name',page:1});
      assert.equal(index.count,expected.catalog[key].initialConfig.records.length,key+' bound record count');
    }
    const storyId=byKey.get('story'),story=await engine.query(storyId,'projectIndex',{});
    assert.equal(story.storyIndex.length,expected.story.initialConfig.storyIndex.length);
    const row=story.storyIndex.find(s=>s.path.endsWith('.md'));
    assert(row);
    const doc=await engine.query(storyId,'document',{resourcePath:story.resources[0].path,path:row.path,maxLines:25});
    assert(doc.content.length>0);
    const preview=await engine.query(byKey.get('preview'),'gameInstallation',{});
    assert.equal(preview.gameRoot,root);assert.equal(preview.gameCommit,expected.commit);
    const fresh=await invoke('refresh',{});assert.equal(fresh.commit,receipt.commit);
    console.log('项目 provider：同桌面 9 个订阅收到一次绑定的验证结果；真实游戏内容、章节文件和固定 SHA 试玩入口均已核验。');
  }finally{for(const stop of leases)stop();}
}
