import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProjectProcess } from '../provider/project-process.mjs';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check) { const end = Date.now() + 3000; while (!check()) { if (Date.now() > end) throw Error('Expected event did not arrive'); await delay(10); } }
const fixture = `import {createInterface} from 'node:readline';
createInterface({input:process.stdin}).on('line',line=>{const m=JSON.parse(line);const send=v=>process.stdout.write(JSON.stringify(v)+'\\n');
if(m.method==='hang')return;if(m.method==='slow')return setTimeout(()=>send({id:m.id,result:m.args.slice(1)}),m.args[0]);if(m.method==='exit')process.exit(0);if(m.method==='bad')return process.stdout.write('not-json\\n');
if(m.method==='large')return process.stdout.write('x'.repeat(4096));
if(m.method==='watch'){send({id:m.id,result:true});setTimeout(()=>send({watch:m.args[0],event:'change',filename:'asset.png'}),30);return;}
if(m.method==='fail'){send({id:m.id,error:{message:'missing',code:'ENOENT'}});return;}
send({id:m.id,result:m.args});});`;
async function setup(t, options = {}, spawnDelay = 0, killDelay = 0) {
  const root = await mkdtemp(join(tmpdir(), 'project-client-'));
  const entry = join(root, 'worker.mjs'); await writeFile(entry, fixture);
  const children = []; let alive = 0, maxAlive = 0;
  const host = { dataRoot: root, runtime: { subprocess: { async spawn(spec) {
    if (spawnDelay) await delay(spawnDelay);
    const child = spawn(spec.command, spec.args, {cwd:spec.cwd,env:{...process.env,...spec.env},stdio:'pipe'});
    children.push(child); alive++; maxAlive = Math.max(alive,maxAlive);
    const done = new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',(code,signal)=>{alive--;resolve({code,signal});});});
    return {stdin:{write: data=>new Promise((resolve,reject)=>child.stdin.write(data,error=>error?reject(error):resolve()))},stdout:child.stdout,stderr:child.stderr,wait:()=>done,kill:async()=>{if(killDelay)await delay(killDelay);child.kill('SIGKILL');await done;}};
  } } } };
  const client = createProjectProcess(host, {entry,...options});
  t.after(async()=>{await client.close();await rm(root,{recursive:true,force:true});});
  return {client,root,children,get maxAlive(){return maxAlive;}};
}
test('lazy start, shared process, error codes and close', async t=>{
 const s=await setup(t); assert.equal(s.children.length,0);
 assert.deepEqual(await s.client.request('echo',['hello']),['hello']);
 await assert.rejects(s.client.request('fail',[]),{code:'ENOENT'});
 assert.deepEqual(await s.client.request('echo',[2]),[2]); assert.equal(s.children.length,1);
 await s.client.close(); await assert.rejects(s.client.request('echo',[]),/closed/);
});
test('cancelling a non-checkout request retires its process without overlapping children',async t=>{
 const s=await setup(t);const controller=new AbortController();
 const a=s.client.request('hang',[],controller.signal), b=s.client.request('hang',[]);
 const rejected=Promise.all([assert.rejects(a,/cancelled/),assert.rejects(b,/cancelled/)]);
 controller.abort(Error('cancelled'));await rejected;
 assert.deepEqual(await s.client.request('echo',[3]),[3]); assert.equal(s.maxAlive,1);
});
test('pending admission rejects overflow without killing accepted call',async t=>{
 const s=await setup(t,{maxPending:1});const pending=s.client.request('slow',[50,'accepted']);
 await assert.rejects(s.client.request('echo',[]),/busy/); assert.deepEqual(await pending,['accepted']);
});
test('cancellation during delayed spawn cleans late child before replacement',async t=>{
 const s=await setup(t,{},60);const controller=new AbortController();
 const pending=s.client.request('hang',[],controller.signal);await delay(10);controller.abort(Error('cancelled'));
 await assert.rejects(pending,/cancelled/); assert.deepEqual(await s.client.request('echo',[4]),[4]);assert.equal(s.maxAlive,1);
});
test('clean exit and malformed/oversized frames fail pending then recover',async t=>{
 const s=await setup(t,{maxFrameBytes:1024});
 for(const method of ['exit','bad','large']) {await assert.rejects(s.client.request(method,[]));assert.deepEqual(await s.client.request('echo',[method]),[method]);}
});
test('watch events, error on process failure, close does not restart child',async t=>{
 const s=await setup(t); const events=[], errors=[];
 const watcher=s.client.watch('/external',{},(...args)=>events.push(args));watcher.on('error',e=>errors.push(e));
 await until(()=>events.length);assert.deepEqual(events,[['change','asset.png']]);
 await assert.rejects(s.client.request('exit',[]));assert.equal(errors.length,1);watcher.close();
 await delay(30);assert.equal(s.children.length,1);
});
test('external hung operation does not delay host local file reads',async t=>{
 const s=await setup(t);const pending=s.client.request('slow',[200,'finished']);
 await delay(40);const start=performance.now();await readFile(join(s.root,'worker.mjs'));assert.ok(performance.now()-start<100);
 assert.deepEqual(await pending,['finished']);
});
test('missing managed runtime rejects without fallback or leaked rejection',async()=>{
 const client=createProjectProcess({});await assert.rejects(client.request('echo',[]),/unavailable/);await client.close();
});

test('watch error reentry waits for prior process termination',async t=>{
 const s=await setup(t,{},0,70); let recovery;
 s.client.watch('/external',{},()=>{}).on('error',()=>{recovery=s.client.request('echo',['recovered']);});
 await delay(50);await assert.rejects(s.client.request('exit',[]),/exited/);
 assert.deepEqual(await recovery,['recovered']);assert.equal(s.maxAlive,1);
});
test('close during spawn awaits the late process and leaves none alive',async t=>{
 const s=await setup(t,{},70);const pending=s.client.request('hang',[]);const checked=assert.rejects(pending,/closed/);
 await delay(10);await s.client.close();await checked;assert.equal(s.children.length,1);assert.notEqual(s.children[0].signalCode,null);
});
test('failed cleanup remains a restart barrier',async()=>{
 let count=0;const stream={onData(){return ()=>{};}};
 const client=createProjectProcess({dataRoot:tmpdir(),runtime:{subprocess:{async spawn(){count++;return {stdin:{write(){}},stdout:stream,wait:()=>new Promise(()=>{}),kill:async()=>{throw Error('kill failed');}};}}}});
 const controller=new AbortController();
 const pending=assert.rejects(client.request('hang',[],controller.signal),/cancelled/);
 await until(()=>count===1);controller.abort(Error('cancelled'));await pending;
 await assert.rejects(client.request('echo',[]),/kill failed/);
 await assert.rejects(client.request('echo',[]),/kill failed/);
 await assert.rejects(client.close(),/kill failed/);assert.equal(count,1);
});
