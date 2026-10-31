// Import the distributable in an isolated Worka host. Run with Bun and a Worka source checkout.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

if(!process.versions.bun||!process.argv[2])throw Error('bun tools/verify-worka.mjs <Worka 源码目录>');
const host=resolve(process.argv[2]),repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const moduleAt=file=>import(pathToFileURL(join(host,file)).href);
const [{CoreStore},{MemoryRecordStorage},{Workbench},{DesktopTemplates,validateTemplate},{NoteIntegration},{createNote},{readPublishedArtifact},{registerSkillConnectionRecipes}]=await Promise.all([
  'src/core/store.ts','tests/fixtures/record-storage.ts','src/service.ts','src/desktop-template.ts','src/notes.ts','src/note-create.ts',
  'src/runtime/published-artifact.ts','plugins/skill-connections/registration.ts',
].map(moduleAt));
const manifest=validateTemplate(JSON.parse(await readFile(join(repo,'desktop.json'),'utf8')));
const root=await mkdtemp(join(tmpdir(),'cardgame-worka-import-')),workerRoot=join(root,'runtime'),worker=join(workerRoot,'dist/worker.js');
const nodes=Bun.which('node'),bun=process.execPath;
if(!nodes)throw Error('Worka 运行时需要 Node.js');
const shutdown=[];
let spawns=0;
try{
  await mkdir(dirname(worker),{recursive:true});
  const built=await Bun.build({entrypoints:[join(host,'src/worker-entry.ts')],target:'node',format:'esm',outdir:dirname(worker),naming:'worker.js'});
  if(!built.success)throw Error(built.logs.map(String).join('\n'));
  const forbidden=()=>{throw Error('该隔离验收不启用模型或外部执行器。');};
  const require=createRequire(join(host,'package.json'));
  const {Context}=await import(pathToFileURL(require.resolve('@deepseek-ai/cordis')).href);
  const loaderRequire=createRequire(require.resolve('@deepseek-ai/cordis-plugin-include'));
  const {Loader}=await import(pathToFileURL(loaderRequire.resolve('@deepseek-ai/cordis-plugin-loader')).href);
  const {PluginReload}=await moduleAt('src/plugin-reload.ts');
  const {createExtensionHost}=await moduleAt('src/extension-host.ts');
  const {bindExtensionHostRegistration}=await moduleAt('src/extension-host-registration.ts');
  const context=new Context(),plugins=new PluginReload(context);
  const native={
    installPlugin:(input,hooks,signal)=>plugins.install(input,hooks,signal),
    releaseInstalledPlugins:(root,owner,hooks)=>plugins.release(root,owner,hooks),
    retainProviderClaims:(root,owner,activation,hooks)=>plugins.retainProviderClaims(root,owner,activation,hooks),
    installedPlugins:(root,owner)=>plugins.installed(root,owner),
    onUserPrompt(){},async metadata(){return {cwd:root,hasMessages:false};},async ensureWorkspace(){},enableWorkbenchContext(){},async restoreSession(){},async archiveSession(){},async rename(){},async ensureContext(){},interactions:()=>[],isRunning:()=>false,hasRunningAgents:()=>false,logger:{error(){},warn(){}},
    async spawn(spec){
      assert.equal(spec.argv[0],nodes);assert.ok(spec.argv.includes(worker));spawns++;
      const child=spawn(spec.argv[0],spec.argv.slice(1),{cwd:spec.cwd,env:{...process.env,...spec.env},stdio:'pipe'});
      const done=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(exitCode,signal)=>resolve({exitCode,signal}));});
      return {stdin:child.stdin,stdout:child.stdout,stderr:child.stderr,done,terminate:()=>child.kill(),waitForExit:()=>done};
    },backgroundPrompt:forbidden,prompt:forbidden,create:forbidden,complete:forbidden,
  };
  const core=await CoreStore.open(new MemoryRecordStorage()),app=new Workbench(core,native,root,root,{desktopSourcesRoot:join(root,'authors')});
  shutdown.push(()=>core.close(),()=>app.market.close(),()=>app.marketPublisher.close(),()=>app.desktopTemplates.close());
  shutdown.push(await registerSkillConnectionRecipes({skillRecipes:app.skillRecipes,register:async (_name,resource)=>resource.close},host));
  let engine;
  try{process.execPath=nodes;engine=new NoteIntegration(app.noteRuntimeCapabilities(),workerRoot,bun);}
  finally{process.execPath=bun;}
  app.engine=engine;shutdown.push(()=>engine.close());
  const extensionHost=createExtensionHost(app,engine.host,async()=>{});
  context.provide('worka',bindExtensionHostRegistration(extensionHost,context));
  await context.plugin(Loader,{baseUrl:pathToFileURL(root+'/').href});
  shutdown.push(()=>context.fiber.dispose(),()=>plugins.close());
  const remote=process.env.WORKA_QA_DESKTOP_URL;
  const checkout=remote ? (await moduleAt('src/git-source.ts')).checkout : async(_address,destination)=>{
    await cp(process.env.WORKA_QA_UPGRADE_FROM||repo,destination,{recursive:true,filter:path=>!['.git','node_modules'].includes(path.slice(path.lastIndexOf('/')+1))});
    return {root:destination};
  };
  const importer=new DesktopTemplates({checkout,core,desktopExtensions:app.desktopExtensions,providerDependencies:app.providerDependencies,dataRoot:root,desktopSourcesRoot:join(root,'authors'),desktops:app.desktops,engine,requireEngine:()=>engine,
    createNote:(input,caller)=>createNote({core,dataRoot:root,desktopSources:importer.sources,desktops:app.desktops,notePorts:app.notePorts,
      noteView:app.noteView,engine,requireEngine:()=>engine},input,caller),
    notePorts:app.notePorts,noteLinks:app.noteLinks,skillConnections:app.skillConnections,skillLifecycle:app.skillLifecycle,skillRecipes:app.skillRecipes,skillSources:app.skillSources});
  shutdown.push(()=>importer.close());
  const installed=await importer.install(remote||'https://github.com/kllilizxc/worka-cardgame-studio','isolated-release',false,undefined,false,false,{kind:'user'});
  if(process.env.WORKA_QA_UPGRADE_FROM){
    const {upgrade}=await import('./upgrade.mjs');
    const source=await importer.sources.get(installed.id), ids={...source.noteIds};
    const rpc=(method,input)=>method==='desktop.source'?importer.sources.get(input.desktopId):app.dispatch(method,input);
    const original={id:'upgrade-sentinel',title:'旧桌面的灵感',text:'留在原来的点子库',tags:[],category:'机制'};
    await engine.invoke(ids.ideas,'remember',original,{kind:'user',requestId:'verify-existing-idea'});
    const before=await engine.query(ids.ideas,'idea',{id:original.id}),config=await rpc('note.config.get',{noteId:ids.preview});
    await upgrade(rpc,repo,installed.id);
    assert.deepEqual((await importer.sources.get(installed.id)).noteIds,ids);
    assert.deepEqual(await engine.query(ids.ideas,'idea',{id:original.id}),before);
    assert.deepEqual(await rpc('note.config.get',{noteId:ids.preview}),config);
    for(const def of manifest.notes){
      const layout=(await core.getLayout(ids[def.key])).value;
      for(const field of ['x','y','width','height'])assert.equal(layout[field],def.layout[field],def.key+' '+field);
    }
  }
  const notes=await core.listNotes({desktopId:installed.id});
  assert.equal(notes.length,manifest.notes.length);
  assert.ok(!installed.skipped?.length,JSON.stringify(installed.skipped));
  const byKey=new Map();
  for(const def of manifest.notes){
    const row=notes.find(n=>n.value.name===def.name);assert.ok(row,def.name);byKey.set(def.key,row.key);
    assert.ok(row.value.activeDirectory,def.key+' not activated');
    const artifact=await readPublishedArtifact(row.value.codePath);
    assert.equal(artifact.capabilityAbi,3);assert.ok(row.value.viewEntry);
    const desc=await app.contracts.describe(row.key);
    assert.equal(desc.status,'ready',def.key+' '+JSON.stringify(desc.diagnostics));
    if(Array.isArray(def.initialConfig?.records)){
      const page=await engine.query(row.key,'collection',{sort:'name',page:1});
      assert.equal(page.count,def.initialConfig.records.length,def.key+' full native page count');
      const home=await engine.query(row.key,'home',{});
      assert.equal(home.count,page.count);assert.ok(home.records.every(record=>def.initialConfig.records.some(r=>r.id===record.id)));
      assert.ok(page.items.length>0);
      const detail=await engine.query(row.key,'record',{id:page.items[0].id});
      assert.equal(detail.title,page.items[0].title);
    }
  }
  const connections=await app.skillConnections.list(installed.id);
  assert.equal(connections.length,manifest.relations.length);
  assert.ok(connections.every(c=>c.enabled));
  if(manifest.extensions?.length){
    assert.ok(app.extensions.has('game-project'),'imported desktop registered its packaged provider');
    assert.ok((await plugins.installed(root,installed.id)).some(p=>p.capabilities.includes('game-project')));
  }
  const storyConfig=manifest.notes.find(n=>n.key==='story').initialConfig;
  const authored=storyConfig.storyIndex.find(scene=>scene.id===storyConfig.initialScene);
  assert.ok(authored?.choices.length&&authored.choices.every(choice=>storyConfig.storyIndex.some(scene=>scene.id===choice.to)),'first chapter has real linked choices');
  const entry=storyConfig.storyIndex.find(scene=>scene.nodeId&&scene.storyId)?.id;
  assert.ok(entry,'packaged game contains a playable story scene');
  const story=await engine.query(byKey.get('story'),'scenes',{query:entry,limit:5});
  assert.ok(story.items.some(r=>r.id===entry),'native story query');
  const links=await app.noteLinks.list(byKey.get('story'),entry);
  assert.ok(links.some(link=>link.target.noteId===byKey.get('preview')&&link.target.recordId.startsWith('play:')));
  assert.ok(spawns>0);
  const bindGame=process.env.CARDGAME_ROOT?async()=>{
    const {verifyProvider}=await import('./verify-provider.mjs');
    await verifyProvider({app,installed,engine,byKey,source:process.env.CARDGAME_ROOT});
    return (await engine.query(byKey.get('preview'),'gameInstallation',{})).gameCommit;
  }:undefined;
  if (process.env.WORKA_QA_SCREENSHOT) {
    const {captureWorkbench}=await import('./capture-worka.mjs');
    await captureWorkbench({app,host,desktopId:installed.id,notes,output:resolve(process.env.WORKA_QA_SCREENSHOT),bindGame});
  }else if(bindGame){await bindGame();}
  console.log('Worka 原生导入通过：'+notes.length+' 张便笺激活、'+connections.length+' 条连线启用、'+links.length+' 个场景链接、'+spawns+' 次原生 worker 启动。');
}finally{
  for(const close of shutdown.reverse())await close();
  await rm(root,{recursive:true,force:true});
}
