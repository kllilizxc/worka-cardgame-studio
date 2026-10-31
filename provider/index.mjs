import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {access,lstat,mkdir,mkdtemp,readFile,readdir,realpath,rename,rm,writeFile} from 'node:fs/promises';
import {dirname,extname,isAbsolute,join,relative,resolve,sep} from 'node:path';
import {projectData,referenceCode,referenceNotes} from '../tools/studio.mjs';
import {boundStoryConfig} from '../tools/story-index.mjs';

export const name='game-project';
export const inject=['worka'];
const digest=value=>createHash('sha256').update(value).digest('hex');
const run=promisify(execFile);
const missingMessage='在本桌面对话选择已有 CardGame 的绝对路径，或确认默认仓库 https://github.com/kllilizxc/CardGame。使用 extension.invoke，extension 为 game-project，method 为 bind，input.source 为选定的目录或 HTTPS GitHub 地址。';
function contained(root,file){
  const part=relative(root,file);
  if(isAbsolute(part)||part==='..'||part.startsWith('..'+sep))throw Error('文件必须位于选定项目内');
  return file;
}
async function inside(root,path){return contained(root,await realpath(join(root,path)));}
function regularRemote(value){
  const url=new URL(value);
  if(url.protocol!=='https:'||url.hostname!=='github.com'||url.port||url.username||url.password||url.search||url.hash||!/^\/[a-z\d_.-]+\/[a-z\d_.-]+\/?$/i.test(url.pathname))throw Error('请提供本机绝对路径或不含凭据的 HTTPS GitHub 仓库地址');
  return url.origin+url.pathname.replace(/\/$/,'').replace(/\.git$/,'')+'.git';
}
async function git(args,signal){
  const result=await run('git',['-c','core.fsmonitor=false','-c','core.hooksPath='+(process.platform==='win32'?'NUL':'/dev/null'),...args],
    {signal,encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GIT_LFS_SKIP_SMUDGE:'1'}});
  return result.stdout.trim();
}
async function checkout(source,dir,signal){
  if(isAbsolute(source)){
    const root=await realpath(source);
    if(await realpath(await git(['-C',root,'rev-parse','--show-toplevel'],signal))!==root)throw Error('请选择 Git 工作树的根目录');
    return root;
  }
  const url=regularRemote(source), managed=join(dir,'repos',digest(url));
  await mkdir(dirname(managed),{recursive:true});
  try{
    await access(managed);
    if(await git(['-C',managed,'config','--get','remote.origin.url'],signal)!==url)throw Error('已有托管检出的来源不匹配');
    return await realpath(managed);
  }catch(err){if(err.code!=='ENOENT')throw err;}
  const temp=await mkdtemp(join(dirname(managed),'.clone-'));
  try{
    try{
      // A repository can select locally installed filter programs using .gitattributes.
      // Materialize the requested tree without hooks, recursive submodules, or these programs.
      await git(['clone','--no-checkout','--no-recurse-submodules','--',url,temp],signal);
      const names=await git(['-C',temp,'config','--name-only','--get-regexp','^filter\\..*\\.(clean|smudge|process|required)$'],signal)
        .catch(error=>{if(error.code===1)return '';throw error;});
      const overrides=names.split(/\r?\n/).filter(Boolean).flatMap(key=>['-c',key+(key.endsWith('.required')?'=false':'=')]);
      await git(['-C',temp,...overrides,'-c','submodule.recurse=false','checkout','--force','HEAD','--','.'],signal);
    }catch(error){signal?.throwIfAborted();throw Error(error.killed?'获取游戏仓库超时。':'无法获取游戏仓库，请确认本机 Git 可以访问该地址。');}
    await rename(temp,managed);
  }
  finally{await rm(temp,{recursive:true,force:true});}
  return await realpath(managed);
}
// This provider accepts one connection ID, game-project, per imported desktop.
const recordKey=id=>'cardgame.project/'+digest(id);
const kindOf=(project,noteId)=>referenceNotes.find(key=>project?.noteIds?.[key]===noteId);
const sourceOf=(app,id,caller,signal)=>app.dispatch('desktop.source',{desktopId:id},caller,signal);
function writable(caller){
  if(!caller||caller.readOnly||caller.dryRun||caller.replay||caller.skillCause||!['user','agent'].includes(caller.kind))throw Error('需要当前桌面的可写用户对话');
}
async function desktopForCommand(app,caller,requested){
  writable(caller);
  if(caller.noteId||caller.controlNoteId)throw Error('请选择桌面级的游戏项目设置');
  const connection=caller.providerConnection;
  if(connection&&(caller.kind!=='agent'||!caller.sessionId||connection.provider!==name||connection.connectionId!==name||!connection.desktopId))throw Error('当前对话未绑定此游戏项目连接');
  if(caller.kind==='user'&&!caller.sessionId){if(typeof requested!=='string'||!requested.trim())throw Error('请选择目标桌面');return requested;}
  const s=(await app.core.getSession(caller.sessionId))?.value;
  if(!s?.desktopId||s.noteId||s.skillConnectionId||s.delegationId||s.purpose||s.contextMode==='task'||s.agentObject||s.parentSessionId||caller.noteId||requested&&requested!==s.desktopId)throw Error('请通过当前桌面的原生对话连接项目');
  if(connection&&connection.desktopId!==s.desktopId)throw Error('游戏项目连接不属于当前桌面');
  return s.desktopId;
}
async function binding(app,id){return (await app.core.readRecord('states',recordKey(id)))?.value;}
async function replaceSource(file,code){
  const tmp=await mkdtemp(join(dirname(file),'.references-'));
  try{await writeFile(join(tmp,'connection.ts'),code);await rename(join(tmp,'connection.ts'),file);}
  finally{await rm(tmp,{recursive:true,force:true});}
}
async function links(app,caller,project,items,signal){
  const id=project.relationIds?.references, path=project.relationPaths?.references;
  if(!id||!path)return; // A partial desktop can omit the optional links relation.
  const root=await realpath(project.directory), parent=await inside(root,path);
  const file=join(parent,'connection.ts');
  if(!(await lstat(file)).isFile())throw Error('引用文件必须是当前桌面作者目录中的普通文件');
  const code=referenceCode(items.filter(l=>project.noteIds[l.source.noteId]&&project.noteIds[l.target.noteId]));
  const prior=await readFile(file,'utf8');
  if(prior && !prior.startsWith(referenceCode([]).split('links:[')[0]+'links:['))throw Error('内容引用脚本已修改，请先单独保存再重建游戏索引');
  const rel=await app.dispatch('connection.get',{id},caller,signal);
  const activate=async signal=>{
    const latest=await app.dispatch('connection.get',{id},caller,signal);
    if(latest.enabled!==false)await app.dispatch('connection.update',{id,revision:latest.revision,change:{enabled:true}},caller,signal);
  };
  const changed=prior!==code;
  if(changed)await replaceSource(file,code);
  const undo=async()=>{
    if(!changed||await readFile(file,'utf8')!==code)return;
    await replaceSource(file,prior);
    if(rel.enabled!==false)await activate();
  };
  try{if(rel.enabled!==false)await activate(signal);}
  catch(error){await undo();throw error;}
  return undo;
}
function projectFiles(data,root,adapter){
  return {...Object.fromEntries(Object.entries(data.catalog).map(([k,v])=>[k,v.initialConfig])),
    story:boundStoryConfig(data.story.initialConfig),preview:{gameCommit:data.commit,gameRoot:root,adapter}};
}
export function gameProject(host){
  const app=host.app,pending=new Map();
  function directory(id){return join(host.dataRoot,'providers',name,digest(id));}
  // Membership comes from the runtime-resolved connection and the imported instance's note map.
  async function member(ctx){
    const {noteId,providerConnection:connection}=ctx.scope;
    if(!noteId||connection?.provider!==name||connection.connectionId!=='game-project')throw Error('此便笺没有选择游戏项目连接');
    const note=(await app.core.getNote(noteId))?.value;
    if(!note?.desktopId||note.archived)throw Error('游戏便笺已移除');
    if(connection.desktopId!==note.desktopId)throw Error('游戏项目连接不属于当前桌面');
    const b=await binding(app,note.desktopId),kind=b&&kindOf(b,noteId);
    if(b&&!kind)throw Error('便笺不属于已绑定桌面的内容库');
    return {id:note.desktopId,kind,b};
  }
  async function readIndex(id,kind,b){
    if(!b)return null;
    try{return JSON.parse(await readFile(join(directory(id),'snapshots',b.snapshot,kind+'.json'),'utf8'));}
    catch(error){
      if(error.code!=='ENOENT')throw error;
      const current=await binding(app,id);
      if(!current||current.snapshot===b.snapshot)throw error;
      return readIndex(id,kind,current);
    }
  }
  async function status(_,ctx){
    const {id,b}=await member(ctx);
    if(!b)return {configured:false,ready:false,message:missingMessage};
    try{
      await access(await inside(b.root,'public/data/content-catalog.json'));
      await access(join(directory(id),'snapshots',b.snapshot,'story.json'));
      return {ready:true,configured:true,verifiedAt:b.verifiedAt,label:'游戏仓库',commit:b.commit};
    }catch{return {configured:false,ready:false,message:'无法读取已绑定的游戏目录。'+missingMessage};}
  }
  async function index(_,ctx){const {id,kind,b}=await member(ctx);return readIndex(id,kind,b);}
  async function doc(input,ctx){
    const {id,kind,b}=await member(ctx);
    if(!b)return null;
    if(kind!=='story')throw Error('只有剧情便笺可读取项目原文');
    if(typeof input?.path!=='string'||!input.path)throw Error('缺少剧情文档路径');
    const path=input.path.replace(/^\/+/,''),file=await inside(b.root,path);
    const allowed=relative(b.root,file).split(sep).join('/'),format=extname(file).toLowerCase();
    const inKnowledge=allowed.startsWith('knowledge/')&&['.md','.markdown','.mdown'].includes(format);
    if(!inKnowledge){
      if(format!=='.json'||!allowed.startsWith('public/data/'))throw Error('不支持的剧情文档');
      const story=await readIndex(id,'story',b);
      if(!story.storyIndex.some(s=>s.path===allowed))throw Error('文件不在已登记的剧情内');
    }
    const content=await readFile(file,'utf8'), rows=content.split(/\r?\n/);
    const start=Math.max(1,Math.trunc(input.startLine)||1),count=Math.min(500,Math.max(1,Math.trunc(input.maxLines)||240))*Math.min(100,Math.max(1,Math.trunc(input.pages)||1));
    return {resourcePath:join(b.root,'knowledge','index.md'),path:allowed,displayPath:allowed,format,content:rows.slice(start-1,start-1+count).join('\n'),revision:digest(content),startLine:start,endLine:Math.min(rows.length,start+count-1),totalLines:rows.length};
  }
  async function prepare(id,source,caller,signal){
    const prior=await binding(app,id),origin=source??prior?.source;
    if(typeof origin!=='string'||!origin.trim())throw Error(missingMessage);
    const dir=directory(id),project=await sourceOf(app,id,caller,signal);
    if(!project||!referenceNotes.some(k=>project.noteIds?.[k]))throw Error('当前桌面没有游戏项目便笺');
    const members={};
    for(const key of referenceNotes){
      const noteId=project.noteIds[key];
      if(!noteId)continue;
      const saved=(await app.core.readRecord('states',noteId+':config'))?.value?.connections?.game;
      if(saved?.provider===name&&saved.connectionId==='game-project')members[key]=noteId;
    }
    if(!Object.keys(members).length)throw Error('此桌面的便笺未选择游戏项目连接');
    const root=await checkout(origin.trim(),dir,signal);
    for(const path of ['public','public/data','knowledge','public/data/content-catalog.json','knowledge/index.md'])await inside(root,path);
    for(const path of ['public/assets','public/assets/asset-manifest.json','art-references']){
      try{await inside(root,path);}catch(error){if(error.code!=='ENOENT')throw error;}
    }
    const data=await projectData(root), adapter=project.noteIds.preview?await inside(await realpath(project.directory),'playtest/preview.config.mjs'):'';
    const files=projectFiles(data,root,adapter),snapshot=digest(JSON.stringify(files)),snapshots=join(dir,'snapshots');
    await mkdir(snapshots,{recursive:true});
    const dest=join(snapshots,snapshot);
    try{await access(dest);}catch(err){
      if(err.code!=='ENOENT')throw err;
      const temp=await mkdtemp(join(snapshots,'.stage-'));
      try{
        for(const [key,index] of Object.entries(files)){
          const bytes=JSON.stringify(index);
          if(Buffer.byteLength(bytes)>5.9*1024*1024)throw Error('便笺 '+key+' 索引超过 5.9 MiB 上限');
          await writeFile(join(temp,key+'.json'),bytes);
        }
        await rename(temp,dest);
      }finally{await rm(temp,{recursive:true,force:true});}
    }
    signal?.throwIfAborted();
    const undo=await links(app,caller,{...project,noteIds:members},data.links,signal);
    const value={source:origin,root,snapshot,commit:data.commit,verifiedAt:Date.now(),noteIds:members};
    try{await app.core.writeRecord('states',recordKey(id),value);}
    catch(error){
      // A lost receipt may follow a durable publish. Restore the previous links only if the new snapshot wasn't published.
      if((await binding(app,id))?.snapshot!==snapshot){await undo?.();throw error;}
    }
    // A racing reader can finish on the previous generation. Stale readers recover via readIndex.
    for(const file of await readdir(snapshots)){
      if(/^[a-f0-9]{64}$/.test(file)&&file!==snapshot&&file!==prior?.snapshot)await rm(join(snapshots,file),{recursive:true,force:true}).catch(()=>{});
    }
    return {root,commit:data.commit,scenes:files.story.storyIndex.length,links:data.links.length};
  }
  // CoreStore reads register dependency stamps, invalidated by the committed write above.
  const resource=load=>({access:'owner',version:'1',load,query:{load}});
  return {
    resources:{status:resource(status),index:resource(index),document:resource(doc)},
    initializers:{status:async()=>{}},
    async invoke(method,input,caller,signal){
      if(method!=='bind'&&method!=='refresh')throw Error('未知游戏项目操作 '+method);
      const id=await desktopForCommand(app,caller,input?.desktopId);
      const source=method==='bind'?input?.source:undefined;
      if(method==='bind'&&(typeof source!=='string'||!source.trim()))throw Error(missingMessage);
      const current=pending.get(id);
      if(current){if(current.source===source)return current.work;throw Error('当前桌面正在准备另一个游戏项目');}
      const work=prepare(id,source,caller,signal);pending.set(id,{source,work});
      try{return await work;}finally{pending.delete(id);}
    },
    async close(){await Promise.allSettled([...pending.values()].map(v=>v.work));},
  };
}
export async function apply(ctx){const dispose=await ctx.worka.register(name,gameProject(ctx.worka));ctx.effect(()=>dispose,'CardGame project');}
