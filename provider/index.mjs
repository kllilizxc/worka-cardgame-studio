import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createRequire} from 'node:module';
import {watch as watchFs} from 'node:fs';
import {access,mkdir,mkdtemp,readFile,realpath,rename,rm,stat} from 'node:fs/promises';
import {dirname,extname,isAbsolute,join,relative,sep} from 'node:path';
import {buildCatalog,catalogLinks} from '../tools/catalog-index.mjs';
import {buildStory} from '../tools/story-index.mjs';
import {search} from '../notes/catalog/search.ts';
import {homeRecords} from '../notes/catalog/home.ts';
import {ancestors,storyTree} from '../notes/story/story-tree.ts';

export const name='game-project';
export const inject=['worka'];

const catalogKinds=['map','encounter','cards','monsters','people','shop','media'];
const contentKinds=['story',...catalogKinds];
const digest=value=>createHash('sha256').update(value).digest('hex');
const run=promisify(execFile);
const defaultRepo='https://github.com/kllilizxc/CardGame';
const missingMessage=`只问用户一个问题来选择 CardGame 游戏来源（默认仓库 ${defaultRepo}，会自动克隆；也可选择本机已检出的 CardGame 目录），然后用 extension.invoke({extension:"game-project",method:"bind",input:{source}}) 绑定。`;

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
  const url=regularRemote(source),managed=join(dir,'repos',digest(url));
  await mkdir(dirname(managed),{recursive:true});
  try{
    await access(managed);
    if(await git(['-C',managed,'config','--get','remote.origin.url'],signal)!==url)throw Error('已有托管检出的来源不匹配');
    return await realpath(managed);
  }catch(err){if(err.code!=='ENOENT')throw err;}
  const temp=await mkdtemp(join(dirname(managed),'.clone-'));
  try{
    try{
      await git(['clone','--no-checkout','--no-recurse-submodules','--',url,temp],signal);
      const names=await git(['-C',temp,'config','--name-only','--get-regexp','^filter\\..*\\.(clean|smudge|process|required)$'],signal)
        .catch(error=>{if(error.code===1)return '';throw error;});
      const overrides=names.split(/\r?\n/).filter(Boolean).flatMap(key=>['-c',key+(key.endsWith('.required')?'=false':'=')]);
      await git(['-C',temp,...overrides,'-c','submodule.recurse=false','checkout','--force','HEAD','--','.'],signal);
    }catch(error){signal?.throwIfAborted();throw Error(error.killed?'获取游戏仓库超时。':'无法获取游戏仓库，请确认本机 Git 可以访问该地址。');}
    await rename(temp,managed);
  }finally{await rm(temp,{recursive:true,force:true});}
  return await realpath(managed);
}

const recordKey=id=>'cardgame.project/'+digest(id);
async function binding(app,id){return id?(await app.core.readRecord('states',recordKey(id)))?.value:undefined;}

function writable(caller){
  if(!caller||caller.readOnly||caller.dryRun||caller.replay||!['user','agent'].includes(caller.kind))throw Error('需要可写调用');
}
async function desktopForCommand(app,caller,requested){
  writable(caller);
  const connection=caller.providerConnection;
  if(connection&&(connection.provider!==name||connection.connectionId!==name||!connection.desktopId))throw Error('当前对话未绑定此游戏项目连接');
  let desktopId=connection?.desktopId;
  const noteId=caller.controlNoteId||caller.noteId;
  if(noteId){
    const note=(await app.core.getNote(noteId))?.value;
    if(!note?.desktopId||note.archived)throw Error('游戏便笺不可用');
    if(desktopId&&desktopId!==note.desktopId)throw Error('游戏项目连接不属于当前桌面');
    desktopId=note.desktopId;
  }
  if(caller.sessionId){
    const s=(await app.core.getSession(caller.sessionId))?.value;
    const sessionDesktop=s?.desktopId||(s?.noteId?(await app.core.getNote(s.noteId))?.value?.desktopId:undefined);
    if(sessionDesktop){
      if(desktopId&&desktopId!==sessionDesktop)throw Error('游戏项目连接不属于当前桌面');
      desktopId=sessionDesktop;
    }
  }
  if(typeof requested==='string'&&requested.trim()){
    if(desktopId&&desktopId!==requested.trim())throw Error('请选择当前桌面');
    desktopId=requested.trim();
  }
  if(!desktopId)throw Error('请选择目标桌面');
  return desktopId;
}

function ignoredWatchPath(filename){
  if(!filename)return false;
  const normalized=String(filename).split(sep).join('/');
  if(normalized==='node_modules'||normalized.startsWith('node_modules/'))return true;
  if(normalized==='.git'||normalized.startsWith('.git/')){
    return !(normalized==='.git/HEAD'||normalized==='.git/packed-refs'||normalized.startsWith('.git/refs/'));
  }
  return false;
}

function excerpt(text='',fallback=''){
  const line=text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').split(/\r?\n/).find(item=>item.trim()&&!/^[\s#>{[\]-]/.test(item));
  return (line?.slice(0,150)||fallback.slice(0,140)).trim();
}

const formats={
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.bmp':'image/bmp','.svg':'image/svg+xml',
  '.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.oga':'audio/ogg','.m4a':'audio/mp4','.aac':'audio/aac','.flac':'audio/flac','.opus':'audio/ogg',
};

export function gameProject(host,{onBuild}={}){
  const app=host.app,pending=new Map(),roots=new Map(),fileCaches=new Map();
  let closing=false;
  function directory(id){return join(host.dataRoot,'providers',name,digest(id));}

  function cachesFor(root){
    let entry=fileCaches.get(root);
    if(!entry){entry={hashCache:new Map(),gitCache:{}};fileCaches.set(root,entry);}
    return entry;
  }

  async function computeProjection(root){
    onBuild?.(root);
    const {hashCache,gitCache}=cachesFor(root);
    const [story,catalog]=await Promise.all([buildStory(root),Promise.resolve().then(()=>buildCatalog(root,{hashCache,gitCache}))]);
    const catalogByKind=Object.fromEntries(catalogKinds.map(k=>[k,catalog[k].initialConfig.records]));
    const catalogMap=Object.fromEntries(catalogKinds.map(k=>[k,new Map(catalogByKind[k].map(r=>[r.id,r]))]));
    const scenes=story.initialConfig.storyIndex;
    const sceneMap=new Map(scenes.map(s=>[s.id,s]));
    const tree=storyTree(scenes);
    const edges=catalogLinks(catalog);
    const push=(fromKind,fromId,toKind,toId,label)=>{
      if(fromKind===toKind&&fromId===toId)return;
      edges.push({source:{noteId:fromKind,recordId:fromId},target:{noteId:toKind,recordId:toId},label:String(label||toId).slice(0,160)});
    };
    for(const scene of scenes){
      for(const ref of scene.refs||[]){
        const target=catalogMap[ref.note]?.get(ref.id);
        if(!target)continue;
        push('story',scene.id,ref.note,ref.id,target.title);
        push(ref.note,ref.id,'story',scene.id,scene.title);
      }
    }
    const linksBySource=new Map();
    for(const edge of edges){
      const key=edge.source.noteId+'\0'+edge.source.recordId;
      let list=linksBySource.get(key);
      if(!list){list=new Map();linksBySource.set(key,list);}
      const targetKey=edge.target.noteId+'\0'+edge.target.recordId;
      if(!list.has(targetKey))list.set(targetKey,edge);
    }
    return {root,catalogByKind,catalogMap,scenes,sceneMap,initialScene:story.initialConfig.initialScene,tree,linksBySource};
  }

  function ensureRoot(root){
    let entry=roots.get(root);
    if(entry)return entry;
    entry={listeners:new Set(),timer:undefined,fsWatcher:undefined,epoch:0,cached:null};
    if(!closing){
      try{
        entry.fsWatcher=watchFs(root,{recursive:true},(_event,filename)=>{
          if(ignoredWatchPath(filename))return;
          entry.epoch++;
          entry.cached=null;
          clearTimeout(entry.timer);
          entry.timer=setTimeout(()=>{
            entry.timer=undefined;
            for(const fn of [...entry.listeners])fn();
          },25);
        });
        entry.fsWatcher.on('error',()=>{entry.epoch++;entry.cached=null;});
      }catch{
        entry.fsWatcher=undefined;
      }
    }
    roots.set(root,entry);
    return entry;
  }

  async function projection(root){
    const entry=ensureRoot(root);
    if(!entry.fsWatcher)return computeProjection(root);
    if(!entry.cached){
      const startEpoch=entry.epoch;
      const work=computeProjection(root).catch(err=>{if(entry.cached===work)entry.cached=null;throw err;});
      if(entry.epoch===startEpoch)entry.cached=work;
    }
    return entry.cached;
  }

  async function desktopNoteMap(desktopId){
    const map={};
    if(typeof app.core.listNotes!=='function')return map;
    const rows=await app.core.listNotes({desktopId});
    for(const row of rows){
      if(row.value.archived)continue;
      const cfg=(await app.core.readRecord('states',row.key+':config'))?.value;
      if(cfg?.connections?.game?.provider===name&&cfg.connections.game.connectionId===name&&contentKinds.includes(cfg.kind)){
        map[cfg.kind]=row.key;
      }
    }
    return map;
  }

  async function allowedTargets(desktopId,noteId,noteIds){
    if(typeof app.skillConnections?.list!=='function')return new Set(Object.values(noteIds));
    const relations=await app.skillConnections.list(desktopId);
    const peers=new Set();
    for(const rel of relations){
      if(!rel.enabled||rel.archived||!rel.nodeIds.includes(noteId))continue;
      for(const peerId of rel.nodeIds)if(peerId!==noteId)peers.add(peerId);
    }
    return peers;
  }

  async function linkResolver(desktopId,noteId,kind,data){
    const noteIds=await desktopNoteMap(desktopId);
    const peers=await allowedTargets(desktopId,noteId,noteIds);
    return recordId=>{
      const raw=data.linksBySource.get(kind+'\0'+recordId);
      if(!raw)return [];
      const result=[];
      for(const edge of raw.values()){
        const targetNoteId=noteIds[edge.target.noteId];
        if(!targetNoteId||(targetNoteId!==noteId&&!peers.has(targetNoteId)))continue;
        if(targetNoteId===noteId&&edge.target.recordId===recordId)continue;
        const id='ref_'+digest(JSON.stringify([noteId,recordId,targetNoteId,edge.target.recordId])).slice(0,24);
        result.push({id,label:edge.label,target:{noteId:targetNoteId,recordId:edge.target.recordId}});
      }
      return result;
    };
  }

  async function member(ctx){
    const {noteId,providerConnection:connection}=ctx.scope;
    if(!noteId||connection?.provider!==name||connection.connectionId!==name)throw Error('此便笺没有选择游戏项目连接');
    const noteRecord=typeof ctx.note==='function'?await ctx.note():undefined;
    const stored=(await app.core.getNote(noteId))?.value;
    if(!stored?.desktopId||stored.archived)throw Error('游戏便笺已移除');
    if(connection.desktopId!==stored.desktopId)throw Error('游戏项目连接不属于当前桌面');
    const config=noteRecord?.config??(await app.core.readRecord('states',noteId+':config'))?.value;
    const kind=config?.kind;
    if(!contentKinds.includes(kind))throw Error('便笺不属于游戏内容库');
    const b=await binding(app,stored.desktopId);
    return {id:stored.desktopId,noteId,kind,b};
  }

  function subscribeProject(_input,invalidate,ctx){
    const noteId=ctx.scope.noteId,desktopId=ctx.scope.providerConnection?.desktopId;
    if(!noteId||!desktopId||closing)return ()=>{};
    let disposed=false,stopRoot=()=>{},currentRoot='';
    const syncWatcher=async()=>{
      if(disposed||closing)return;
      const b=await binding(app,desktopId).catch(()=>undefined);
      const nextRoot=b?.root||'';
      if(disposed||closing||nextRoot===currentRoot)return;
      stopRoot();currentRoot=nextRoot;
      if(nextRoot){
        const entry=ensureRoot(nextRoot),fn=()=>invalidate();
        entry.listeners.add(fn);
        stopRoot=()=>{entry.listeners.delete(fn);};
      }else{
        stopRoot=()=>{};
      }
    };
    void syncWatcher();
    const key=recordKey(desktopId);
    const stopCore=typeof app.core.subscribe==='function'?app.core.subscribe(event=>{
      if(disposed)return;
      if(event.changes.some(c=>c.table==='notes'||c.table==='connections'||(c.table==='states'&&c.key===key))){
        void syncWatcher().then(()=>invalidate());
      }
    }):()=>{};
    return ()=>{disposed=true;stopRoot();stopCore();};
  }

  async function status(_,ctx){
    const {b}=await member(ctx);
    if(!b?.root)return {configured:false,ready:false,message:missingMessage};
    try{
      await access(await inside(b.root,'public/data/content-catalog.json'));
      await access(await inside(b.root,'knowledge/index.md'));
      const commit=await git(['-C',b.root,'rev-parse','--verify','HEAD^{commit}'],ctx.signal).catch(()=>b.commit||'');
      return {ready:true,configured:true,verifiedAt:b.verifiedAt,label:'游戏仓库',root:b.root,...(commit?{commit}:{})};
    }catch{
      return {configured:false,ready:false,message:'无法读取已绑定的游戏目录。'+missingMessage};
    }
  }

  async function catalogResource(input,ctx){
    const {id,noteId,kind,b}=await member(ctx);
    if(!catalogKinds.includes(kind))throw Error('此便笺不是目录内容库');
    if(!b?.root)return null;
    const data=await projection(b.root);
    const rows=data.catalogByKind[kind]||[];
    const op=input?.op||'page';
    if(op==='overview')return {count:rows.length,items:rows.slice(0,3).map(r=>r.title)};
    if(op==='home'){
      const home=homeRecords(kind,rows);
      const linksOf=await linkResolver(id,noteId,kind,data);
      return {...home,records:home.records.map(row=>({...row,links:linksOf(row.id)}))};
    }
    if(op==='record'){
      const target=typeof input?.id==='string'?data.catalogMap[kind]?.get(input.id):undefined;
      if(!target)return null;
      const linksOf=await linkResolver(id,noteId,kind,data);
      return {...target,links:linksOf(target.id)};
    }
    if(op==='cursor'){
      const start=Math.max(0,Number.parseInt(String(input?.cursor||'0'),10)||0);
      const size=Math.min(50,Math.max(1,Math.trunc(Number(input?.limit)||50)));
      const slice=rows.slice(start,start+size).map(r=>({id:r.id,title:r.title}));
      return {items:slice,...(start+size<rows.length?{next:String(start+size)}:{})};
    }
    return search(rows,input||{});
  }

  async function storyResource(input,ctx){
    const {id,noteId,kind,b}=await member(ctx);
    if(kind!=='story')throw Error('只有剧情知识库可读取剧情导航');
    if(!b?.root)return null;
    const data=await projection(b.root);
    const op=input?.op||'scenes';
    const strip=({search:_s,body:_b,refs:_r,...info})=>info;
    if(op==='home'){
      const current=data.sceneMap.get(data.initialScene)||data.scenes.find(r=>r.nodeId)||data.scenes[0];
      if(!current)return {current:null,branches:[]};
      const branches=current.choices.map(c=>data.sceneMap.get(c.to)||data.scenes.find(r=>r.nodeId===c.to)).filter(Boolean).slice(0,2);
      const card=s=>({...strip(s),excerpt:excerpt(s.body,s.search.replace(s.title,''))});
      return {current:card(current),branches:branches.map(card)};
    }
    if(op==='scene'){
      const targetId=typeof input?.id==='string'&&input.id?input.id:data.initialScene;
      const row=data.sceneMap.get(targetId)||(input?.id?undefined:data.scenes[0]);
      if(!row)return {scene:null,initialScene:data.initialScene};
      const trail=ancestors(data.tree.parents.get(row.id)).map(branch=>({key:branch.key,name:branch===data.tree.root?'全书':branch.name}));
      const choices=row.choices.map(c=>{
        const target=data.sceneMap.get(c.to);
        return {label:c.label,to:c.to,...(target?{title:target.title,hasChildren:target.choices.length>0}:{})};
      });
      const linksOf=await linkResolver(id,noteId,'story',data);
      return {
        initialScene:data.initialScene,
        scene:{...strip(row),choices,ancestors:trail,links:linksOf(row.id)},
      };
    }
    if(op==='tree'){
      const folderKey=typeof input?.folderKey==='string'&&input.folderKey?input.folderKey:'[]';
      const branch=data.tree.branches.get(folderKey);
      if(!branch)return {key:folderKey,name:'全书',ancestors:[],items:[],hasMore:false};
      const trail=ancestors(branch).map(node=>({key:node.key,name:node===data.tree.root?'全书':node.name}));
      const all=[
        ...[...branch.folders.values()].map(child=>({kind:'folder',key:child.key,name:child.name,hasChildren:Boolean(child.folders.size||child.scenes.length)})),
        ...branch.scenes.map(scene=>({kind:'scene',id:scene.id,title:scene.title,hasChildren:scene.choices.length>0})),
      ];
      const start=Math.max(0,Number.parseInt(String(input?.cursor||'0'),10)||0);
      const size=Math.min(50,Math.max(1,Math.trunc(Number(input?.limit)||40)));
      const items=all.slice(start,start+size);
      return {
        key:branch.key,name:branch===data.tree.root?'全书':branch.name,ancestors:trail,items,
        total:all.length,hasMore:start+size<all.length,...(start+size<all.length?{next:String(start+size)}:{}),
      };
    }
    const words=String(input?.query??'').normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const resolved=words.length?data.scenes.filter(row=>{
      const text=[row.id,row.title,...row.folders,row.search].join(' ').normalize('NFKC').toLowerCase();
      return words.every(w=>text.includes(w));
    }):data.scenes;
    const start=input?.cursor!==undefined?Math.max(0,Number.parseInt(String(input.cursor),10)||0):Math.max(0,Math.trunc(Number(input?.offset)||0));
    const limit=Math.min(50,Math.max(1,Math.trunc(Number(input?.limit)||30)));
    const nextOffset=start+limit;
    return {
      total:resolved.length,
      items:resolved.slice(start,nextOffset).map(strip),
      ...(nextOffset<resolved.length?{next:String(nextOffset)}:{}),
    };
  }

  async function doc(input,ctx){
    const {b}=await member(ctx);
    if(!b?.root)return null;
    if(typeof input?.path!=='string'||!input.path.trim())throw Error('缺少项目文档路径');
    const rawPath=input.path.replace(/^\/+/,''),file=await inside(b.root,rawPath);
    const allowed=relative(b.root,file).split(sep).join('/'),format=extname(file).toLowerCase();
    if(!['.md','.markdown','.mdown','.json'].includes(format))throw Error('不支持的项目文档格式');
    const content=await readFile(file,'utf8'),rows=content.split(/\r?\n/);
    const start=Math.max(1,Math.trunc(Number(input.startLine))||1);
    const count=Math.min(500,Math.max(1,Math.trunc(Number(input.maxLines))||240))*Math.min(100,Math.max(1,Math.trunc(Number(input.pages))||1));
    return {
      resourcePath:join(b.root,'knowledge','index.md'),path:allowed,displayPath:allowed,format,
      content:rows.slice(start-1,start-1+count).join('\n'),revision:digest(content),
      startLine:start,endLine:Math.min(rows.length,start+count-1),totalLines:rows.length,
    };
  }

  async function asset(input,ctx){
    const {b}=await member(ctx);
    if(!b?.root||(typeof input?.key!=='string'&&typeof input?.id!=='string'))return null;
    let sourcePath='';
    if(typeof input.key==='string'&&input.key){
      sourcePath=input.key.split('?v=')[0].replace(/^\/+/,'');
    }else if(typeof input.id==='string'&&input.id){
      if(input.id.startsWith('asset:'))sourcePath=input.id.slice(6).replace(/^\/+/,'');
      else{
        const data=await projection(b.root);
        sourcePath=data.catalogMap.media?.get(input.id)?.source||'';
      }
    }
    if(!sourcePath)return null;
    const mime=formats[extname(sourcePath).toLowerCase()];
    if(!mime)return null;
    let file;
    try{file=await inside(b.root,sourcePath);}catch{return null;}
    const info=await stat(file).catch(()=>null);
    if(!info||!info.isFile())return null;
    if(info.size>32*1024*1024)throw Error('素材超过预览大小上限');
    const bytes=await readFile(file);
    let preview=bytes,previewMime=mime;
    if(mime.startsWith('image/')&&mime!=='image/svg+xml'&&bytes.length>256*1024){
      const require=createRequire(import.meta.url);
      const sharp=createRequire(require.resolve('@realiz3r/worka/package.json'))('sharp');
      preview=await sharp(bytes,{animated:false}).rotate().resize({width:600,height:600,fit:'inside',withoutEnlargement:true}).webp({quality:65,effort:2}).toBuffer();
      previewMime='image/webp';
    }
    if(preview.length>700*1024)return null;
    return 'data:'+previewMime+';base64,'+preview.toString('base64');
  }

  async function bind(id,source,caller,signal){
    const origin=typeof source==='string'&&source.trim()?source.trim():defaultRepo;
    const dir=directory(id);
    const root=await checkout(origin,dir,signal);
    for(const path of ['public','public/data','knowledge','public/data/content-catalog.json','knowledge/index.md'])await inside(root,path);
    for(const path of ['public/assets','public/assets/asset-manifest.json','art-references']){
      try{await inside(root,path);}catch(error){if(error.code!=='ENOENT')throw error;}
    }
    const commit=await git(['-C',root,'rev-parse','--verify','HEAD^{commit}'],signal);
    const members=await desktopNoteMap(id);
    if(!Object.keys(members).length)throw Error('当前桌面没有绑定游戏项目连接的便笺');
    fileCaches.delete(root);
    const existing=roots.get(root);
    if(existing){existing.epoch++;existing.cached=null;}
    signal?.throwIfAborted();
    await app.core.writeRecord('states',recordKey(id),{source:origin,root,commit,verifiedAt:Date.now()});
    return {root,commit};
  }

  const liveResource=load=>({access:'owner',version:'2',load,subscribe:subscribeProject,query:{load,subscribe:subscribeProject}});

  return {
    resources:{
      status:liveResource(status),
      catalog:liveResource(catalogResource),
      story:liveResource(storyResource),
      document:liveResource(doc),
      asset:liveResource(asset),
    },
    async noteContext(note){
      if(!note?.desktopId)return [];
      const b=await binding(app,note.desktopId);
      if(!b?.root)return [];
      let adapter='';
      if(typeof app.dispatch==='function'){
        const src=await app.dispatch('desktop.source',{desktopId:note.desktopId},{kind:'user'}).catch(()=>null);
        if(src?.directory){
          try{adapter=await inside(await realpath(src.directory),'playtest/preview.config.mjs');}catch{}
        }
      }
      return [`已绑定 CardGame 仓库：${b.root}${adapter?`；试玩适配器：${adapter}`:''}。`];
    },
    async invoke(method,input,caller,signal){
      if(method!=='bind')throw Error('未知游戏项目操作 '+method);
      const id=await desktopForCommand(app,caller,input?.desktopId);
      const source=typeof input?.source==='string'&&input.source.trim()?input.source.trim():defaultRepo;
      const current=pending.get(id);
      if(current){if(current.source===source)return current.work;throw Error('当前桌面正在绑定另一个游戏仓库');}
      const work=bind(id,source,caller,signal);
      pending.set(id,{source,work});
      try{return await work;}finally{pending.delete(id);}
    },
    beginClose(){
      closing=true;
      for(const state of roots.values()){
        clearTimeout(state.timer);
        state.fsWatcher?.close();
        state.cached=null;
      }
      roots.clear();
    },
    async close(){
      this.beginClose();
      await Promise.allSettled([...pending.values()].map(v=>v.work));
      fileCaches.clear();
    },
  };
}
export async function apply(ctx){const dispose=await ctx.worka.register(name,gameProject(ctx.worka));ctx.effect(()=>dispose,'CardGame project');}
