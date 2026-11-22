// Project filesystem access belongs to this process, never the Worka host.
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {watch} from 'node:fs';
import {access,readFile,realpath,stat} from 'node:fs/promises';
import {extname,isAbsolute,join,relative,sep} from 'node:path';
import {createInterface} from 'node:readline';
import {buildCatalog,catalogLinks} from '../tools/catalog-index.mjs';
import {buildStory} from '../tools/story-index.mjs';
const digest=value=>createHash('sha256').update(value).digest('hex');
function contained(root,file){
  const part=relative(root,file);
  if(isAbsolute(part)||part==='..'||part.startsWith('..'+sep))throw Error('文件必须位于选定项目内');
  return file;
}
async function inside(root,path){return contained(root,await realpath(join(root,path)));}
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
  async resolveRoot(source,top){
    const root=await realpath(source);
    if(await realpath(top)!==root)throw Error('请选择 Git 工作树的根目录');
    return root;
  },
  async validate(root){
    for(const path of ['public','public/data','knowledge','public/data/content-catalog.json','knowledge/index.md']){
      try{await inside(root,path);}
      catch(error){
        if(error.code!=='ENOENT')throw error;
        throw Error(`当前 CardGame 检出缺少 ${path}。请选择包含剧情和内容索引的检出，或更新当前分支后重试。`,{cause:error});
      }
    }
    for(const path of ['public/assets','public/assets/asset-manifest.json','art-references']){
      try{await inside(root,path);}catch(error){if(error.code!=='ENOENT')throw error;}
    }
    caches.delete(root);
    return true;
  },
  async status(root){
    await access(await inside(root,'public/data/content-catalog.json'));
    await access(await inside(root,'knowledge/index.md'));
    return true;
  },
  async build(root,gitSnapshot){
    let cache=caches.get(root);
    if(!cache){cache={hashCache:new Map(),gitCache:{}};caches.set(root,cache);}
    const [story,catalog]=await Promise.all([buildStory(root),Promise.resolve().then(()=>buildCatalog(root,{...cache,gitSnapshot}))]);
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
input.on('close',()=>{
  for(const watcher of watchers.values())watcher.close();
  watchers.clear();
});
