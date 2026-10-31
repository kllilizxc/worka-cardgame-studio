import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink} from 'node:fs/promises';
import {upgrade} from '../tools/upgrade.mjs';

const blob=text=>createHash('sha1').update('blob '+Buffer.byteLength(text)+'\0').update(text).digest('hex');
async function fixture(t){
  const temp=await mkdtemp(join(tmpdir(),'studio-upgrade-test-'));
  t.after(()=>rm(temp,{recursive:true,force:true}));
  const installed=join(temp,'author'),source=join(temp,'release');
  const keys=['ideas','todo'],base={};
  const oldDef=JSON.stringify({files:['compact.tsx','previous.css']}),newDef=JSON.stringify({files:['compact.tsx','new.css']});
  const template={version:'1.0.1',name:'卡牌游戏创作室',camera:{x:32,y:104,scale:1},notes:keys.map(key=>({key,source:{path:'published/'+key},layout:{x:10,y:1,width:266,height:148}}))};
  await mkdir(join(source,'tools'),{recursive:true});
  for(const key of keys){
    const a=join(installed,'published',key),b=join(source,'published',key);
    await Promise.all([mkdir(a,{recursive:true}),mkdir(b,{recursive:true})]);
    const old={'worka-note.json':oldDef,'compact.tsx':'old '+key,'previous.css':'old'},next={'worka-note.json':newDef,'compact.tsx':'new '+key,'new.css':'new'};
    for(const [name,value] of Object.entries(old))await writeFile(join(a,name),value);
    for(const [name,value] of Object.entries(next))await writeFile(join(b,name),value);
    await writeFile(join(a,'author-notes.md'),'keep');
    base[key]=Object.fromEntries(Object.entries(old).map(([n,v])=>[n,blob(v)]));
  }
  await writeFile(join(source,'tools/upgrade-base.json'),JSON.stringify(base));
  await writeFile(join(source,'desktop.json'),JSON.stringify(template));
  await writeFile(join(installed,'desktop.json'),JSON.stringify({...template,notes:template.notes.map(n=>({...n,layout:{...n.layout,width:200}})),custom:'keep'}));
  const calls=[];
  const rpc=async(method,input)=>{
    calls.push([method,input]);
    if(method==='desktop.source')return {directory:installed,noteIds:{ideas:'id-one',todo:'id-two'}};
    if(method==='code.activate')return {accepted:true};
    if(method==='canvas.layout.batch')return {results:input.items.map(()=>({accepted:true}))};
    if(method==='desktop.update')return {};
    throw Error(method);
  };
  return {source,installed,calls,rpc,temp};
}
test('conflicting author edits block all writes; retry activates the same IDs and keeps independent data',async t=>{
  const f=await fixture(t),todo=join(f.installed,'published/todo/compact.tsx');
  await writeFile(todo,'author edit');
  await assert.rejects(upgrade(f.rpc,f.source,'desk'),/本地改动/);
  assert.equal(await readFile(join(f.installed,'published/ideas/compact.tsx'),'utf8'),'old ideas');
  assert.ok(!f.calls.some(([m])=>m==='code.activate'));
  await writeFile(todo,'old todo');
  let failed=false;
  const flaky=async(m,input)=>{if(m==='code.activate'&&input.noteId==='id-two'&&!failed){failed=true;throw Error('lost receipt');}return f.rpc(m,input)};
  await assert.rejects(upgrade(flaky,f.source,'desk'),/lost receipt/);
  assert.equal(await upgrade(f.rpc,f.source,'desk'),2);
  assert.equal(await readFile(join(f.installed,'published/todo/author-notes.md'),'utf8'),'keep');
  assert.equal(await readFile(todo,'utf8'),'new todo');
  await assert.rejects(readFile(join(f.installed,'published/todo/previous.css')),e=>e.code==='ENOENT');
  const saved=JSON.parse(await readFile(join(f.installed,'desktop.json')));
  assert.equal(saved.custom,'keep');assert.equal(saved.notes[0].layout.width,266);
  assert.deepEqual(f.calls.filter(([m])=>m==='code.activate').slice(-2).map(v=>v[1]),[{noteId:'id-one',published:true},{noteId:'id-two',published:true}]);
});
test('reject collisions with new authored paths and symlinks before touching another member',async t=>{
  const f=await fixture(t),extra=join(f.installed,'published/todo/new.css');
  await writeFile(extra,'mine');await assert.rejects(upgrade(f.rpc,f.source,'desk'),/本地改动/);
  await rm(extra);await symlink(join(f.temp,'other'),extra);
  await assert.rejects(upgrade(f.rpc,f.source,'desk'),/符号链接/);
  assert.ok(!f.calls.some(([m])=>m==='code.activate'));
});
