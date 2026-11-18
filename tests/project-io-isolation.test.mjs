import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,realpath,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setTimeout as sleep} from 'node:timers/promises';
import {gameProject} from '../provider/index.mjs';
import {testSubprocess} from './subprocess-fixture.mjs';

test('four hung project realpaths cannot starve host file I/O; cancellation reaps child and next read recovers',async()=>{
  const root=await realpath(await mkdtemp(join(tmpdir(),'project-isolation-')));
  let provider;
  try{
    const dataRoot=join(root,'host');await mkdir(dataRoot);
    const asset=join(root,'blocked.png');await writeFile(asset,'test image');
    const local=join(dataRoot,'local.json');await writeFile(local,'host stays responsive');
    const preload=join(root,'stall.mjs');
    // Occupy all four libuv pool workers inside the project process while its
    // realpath never returns, modelling an unresponsive network filesystem.
    await writeFile(preload,`import fs from 'node:fs/promises';import {syncBuiltinESMExports} from 'node:module';import {pbkdf2} from 'node:crypto';const real=fs.realpath;fs.realpath=path=>String(path).endsWith('blocked.png')?(pbkdf2('x','y',1000000000,32,'sha256',()=>{}),process.stderr.write('BLOCKED\\n'),new Promise(()=>{})):real(path);syncBuiltinESMExports();`);
    let spawned=0,blocked=0,alive=0;
    const subprocess={async spawn(spec){
      const first=spawned++===0;
      const child=await testSubprocess.spawn({...spec,args:first?['--import',pathToFileURL(preload).href,...spec.args]:spec.args});
      alive++;void child.wait().finally(()=>alive--);
      child.stderr.on('data',chunk=>{blocked+=(String(chunk).match(/BLOCKED/g)||[]).length;});
      return child;
    }};
    const desktopId='desktop',noteId='note';
    provider=gameProject({dataRoot,runtime:{subprocess},app:{core:{
      getNote:async()=>({value:{desktopId}}),
      readRecord:async(_table,key)=>({value:key.endsWith(':config')?{kind:'media'}:{root}}),
    }}});
    const cancelled=new AbortController();
    const ctx={signal:cancelled.signal,scope:{noteId,providerConnection:{provider:'game-project',connectionId:'game-project',desktopId}}};
    const calls=Array.from({length:4},()=>provider.resources.asset.load({key:'blocked.png'},ctx));
    const outcomes=Promise.allSettled(calls);
    const start=Date.now();while(blocked<4&&Date.now()-start<1200)await sleep(10);
    assert.equal(blocked,4,'all four filesystem requests entered isolated worker');
    const readStart=Date.now();assert.equal(await readFile(local,'utf8'),'host stays responsive');
    assert(Date.now()-readStart<500,'host local I/O does not wait for the blocked project pool');
    const reason=Error('Cancelled blocked project reads');
    cancelled.abort(reason);
    for(const result of await outcomes){assert.equal(result.status,'rejected');assert.equal(result.reason,reason);}
    assert.equal(await provider.resources.asset.load({key:'blocked.png'},{scope:ctx.scope}),'data:image/png;base64,'+Buffer.from('test image').toString('base64'));
    assert.equal(spawned,2,'only a later request starts a replacement, no retry');
    await provider.close();assert.equal(alive,0,'all process generations exited');
  }finally{await provider?.close();await rm(root,{recursive:true,force:true});}
});
