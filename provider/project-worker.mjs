// Project filesystem access belongs to this process, never the Worka host.
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createRequire} from 'node:module';
import {watch} from 'node:fs';
import {access,mkdir,mkdtemp,readFile,realpath,rename,rm,stat} from 'node:fs/promises';
import {dirname,extname,isAbsolute,join,relative,sep} from 'node:path';
import {createInterface} from 'node:readline';
import {buildCatalog,catalogLinks} from '../tools/catalog-index.mjs';
import {buildStory} from '../tools/story-index.mjs';
const digest=value=>createHash('sha256').update(value).digest('hex');
const run=promisify(execFile);
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

const formats={
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.bmp':'image/bmp','.svg':'image/svg+xml',
  '.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.oga':'audio/ogg','.m4a':'audio/mp4','.aac':'audio/aac','.flac':'audio/flac','.opus':'audio/ogg',
};

async function document(root,input){
    if(typeof input?.path!=='string'||!input.path.trim())throw Error('缺少项目文档路径');
    const rawPath=input.path.replace(/^\/+/,''),file=await inside(root,rawPath);
    const allowed=relative(root,file).split(sep).join('/'),format=extname(file).toLowerCase();
    if(!['.md','.markdown','.mdown','.json'].includes(format))throw Error('不支持的项目文档格式');
    const content=await readFile(file,'utf8'),rows=content.split(/\r?\n/);
    const start=Math.max(1,Math.trunc(Number(input.startLine))||1);
    const count=Math.min(500,Math.max(1,Math.trunc(Number(input.maxLines))||240))*Math.min(100,Math.max(1,Math.trunc(Number(input.pages))||1));
    return {
      resourcePath:join(root,'knowledge','index.md'),path:allowed,displayPath:allowed,format,
      content:rows.slice(start-1,start-1+count).join('\n'),revision:digest(content),
      startLine:start,endLine:Math.min(rows.length,start+count-1),totalLines:rows.length,
    };
  }

async function asset(root,sourcePath){
    const mime=formats[extname(sourcePath).toLowerCase()];
    if(!mime)return null;
    let file;
    try{file=await inside(root,sourcePath);}catch{return null;}
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

const watchers=new Map(), caches=new Map();
const send=value=>process.stdout.write(JSON.stringify(value)+'\n');
const errorValue=error=>({message:String(error?.message||error),...(typeof error?.code==='string'?{code:error.code}:{})});
const operations={
  checkout,
  async validate(root){
    for(const path of ['public','public/data','knowledge','public/data/content-catalog.json','knowledge/index.md'])await inside(root,path);
    for(const path of ['public/assets','public/assets/asset-manifest.json','art-references']){
      try{await inside(root,path);}catch(error){if(error.code!=='ENOENT')throw error;}
    }
    caches.delete(root);
    return git(['-C',root,'rev-parse','--verify','HEAD^{commit}']);
  },
  async status(root,commit){
    await access(await inside(root,'public/data/content-catalog.json'));
    await access(await inside(root,'knowledge/index.md'));
    return git(['-C',root,'rev-parse','--verify','HEAD^{commit}']).catch(()=>commit||'');
  },
  async build(root){
    let cache=caches.get(root);
    if(!cache){cache={hashCache:new Map(),gitCache:{}};caches.set(root,cache);}
    const [story,catalog]=await Promise.all([buildStory(root),Promise.resolve().then(()=>buildCatalog(root,cache))]);
    return {story,catalog,links:catalogLinks(catalog)};
  },
  document,asset,
  async adapter(directory){return inside(await realpath(directory),'playtest/preview.config.mjs');},
  watch(root){
    if(watchers.has(root))return true;
    const watcher=watch(root,{recursive:true},(event,filename)=>send({watch:root,event,filename:String(filename||'')}));
    watcher.on('error',error=>{watcher.close();watchers.delete(root);caches.delete(root);send({watch:root,error:errorValue(error)});});
    watchers.set(root,watcher);
    return true;
  },
  unwatch(root){watchers.get(root)?.close();watchers.delete(root);caches.delete(root);return true;},
};
const input=createInterface({input:process.stdin,crlfDelay:Infinity});
input.on('line',line=>{
  let request;
  try{request=JSON.parse(line);}catch{process.exitCode=1;input.close();return;}
  const {id,method,args}=request;
  Promise.resolve().then(()=>{
    if(!Object.hasOwn(operations,method)||!Array.isArray(args))throw Error('Unknown project operation');
    return operations[method](...args);
  }).then(result=>send({id,result}),error=>send({id,error:errorValue(error)}));
});
input.on('close',()=>{for(const watcher of watchers.values())watcher.close();watchers.clear();process.exit();});
