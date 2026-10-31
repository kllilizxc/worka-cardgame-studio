#!/usr/bin/env node
import {createHash,randomUUID} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,rename,unlink,writeFile} from 'node:fs/promises';
import {dirname,isAbsolute,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';
import {connectWorka} from './worka-client.mjs';

const release=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const blob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
async function optional(file){
  try{return await readFile(file);}catch(error){if(error.code==='ENOENT')return null;throw error;}
}
async function ensurePath(root,path){
  if(!path||isAbsolute(path)||/[\\:\x00-\x1f]/.test(path)||path.split('/').some(p=>!p||p==='..'||p==='.'))throw Error('无效的源码相对路径 '+path);
  let file=root;
  for(const part of path.split('/')){
    file=join(file,part);
    try{if((await lstat(file)).isSymbolicLink())throw Error('源码路径含符号链接 '+file);}
    catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return file;
}
async function atomic(file,contents){
  await mkdir(dirname(file),{recursive:true});
  const temp=file+'.'+randomUUID()+'.tmp';
  try{await writeFile(temp,contents,{flag:'wx'});await rename(temp,file);}
  finally{await unlink(temp).catch(()=>{});}
}
async function currentHash(file){
  const value=await optional(file);
  return value===null?null:blob(value);
}

export async function upgrade(rpc,repo=release,desktopId){
  const manifest=await json(join(repo,'desktop.json')),base=await json(join(repo,'tools/upgrade-base.json'));
  if(manifest.extensions?.length)throw Error('此版本包含随桌面安装的后台，请在 Worka 中通过仓库地址导入新版桌面。');
  if(!desktopId){
    const choices=(await rpc('desktop.list')).filter(row=>!row.archived&&row.name===manifest.name);
    if(choices.length!==1)throw Error('请通过 --desktop 指定要更新的已安装桌面 ID。');
    desktopId=choices[0].id;
  }
  const project=await rpc('desktop.source',{desktopId});
  if(!project?.directory||!project.noteIds)throw Error('未找到桌面的作者目录。');
  const installed=await realpath(project.directory);
  if(installed===await realpath(repo))throw Error('请从解压后的新版仓库运行；当前目录已经是要更新的作者项目。');
  const manifestFile=await ensurePath(installed,'desktop.json');
  const originalManifest=await readFile(manifestFile,'utf8'),local=JSON.parse(originalManifest);
  const plans=[];
  for(const note of manifest.notes){
    const previous=local.notes.find(n=>n.key===note.key),id=project.noteIds[note.key];
    if(!previous||!id||previous.source?.path!==note.source.path)throw Error('桌面便笺绑定与发行包不符：'+note.key);
    const dir=await ensurePath(installed,previous.source.path),src=await ensurePath(repo,note.source.path);
    const next=await json(join(src,'worka-note.json')),old=base[note.key]||base.cards;
    const nextFiles=new Set(['worka-note.json',...next.files]),changes=[];
    for(const path of new Set([...Object.keys(old),...nextFiles])){
      const file=await ensurePath(dir,path),source=nextFiles.has(path)?await ensurePath(src,path):null;
      const desired=source?blob(await readFile(source)):null,existing=await currentHash(file);
      if(desired===existing)continue;
      if(existing!==(old[path]??null))throw Error('发现本地改动，已在升级前停止：'+file);
      changes.push({file,source,existing,desired});
    }
    plans.push({id,key:note.key,previous,layout:note.layout,changes});
  }
  // Preflight every member before changing any of them. Every path may be at
  // either release on retry, including after a lost activation receipt.
  for(const {id,key,changes} of plans){
    for(const {file,source,existing,desired} of changes){
      if(await currentHash(file)!==existing)throw Error('源码在升级期间发生变化：'+file);
      if(source){
        const bytes=await readFile(source);
        if(blob(bytes)!==desired)throw Error('新版发行文件在升级期间变化：'+source);
        await atomic(file,bytes);
      }else await unlink(file);
    }
    const result=await rpc('code.activate',{noteId:id,published:true});
    if(!result?.accepted)throw Error(key+' 激活失败：'+(result?.message||'请检查 Worka 的便笺诊断后重试。'));
  }
  const fields=['x','y','width','height','expandedWidth','expandedHeight'];
  const layouts=plans.map(p=>({kind:'note',input:{noteId:p.id,...Object.fromEntries(fields.filter(k=>p.layout[k]!==undefined).map(k=>[k,p.layout[k]]))}}));
  const moved=await rpc('canvas.layout.batch',{items:layouts});
  if(moved?.results?.length!==layouts.length||moved.results.some(r=>!r.accepted))throw Error('部分便笺布局未能应用，可重新运行升级。');
  if(manifest.camera)await rpc('desktop.update',{desktopId,camera:manifest.camera});
  // Only the visual fields belong to this migration. Keep the user's links, game binding and authored changes.
  if(await readFile(manifestFile,'utf8')!==originalManifest)throw Error('桌面清单在升级期间发生变化，请重新运行升级。');
  for(const p of plans)p.previous.layout={...p.previous.layout,...Object.fromEntries([...fields,'autoHeight'].filter(k=>p.layout[k]!==undefined).map(k=>[k,p.layout[k]]))};
  local.camera=manifest.camera;
  local.version=manifest.version;
  await atomic(manifestFile,JSON.stringify(local,null,2)+'\n');
  return plans.length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const {values}=parseArgs({options:{connection:{type:'string'},desktop:{type:'string'},help:{type:'boolean'}}});
  if(values.help)console.log('node tools/upgrade.mjs [--desktop <现有桌面ID>] [--connection <本机 connection.json>]');
  else try{const rpc=await connectWorka(values.connection);console.log('已在原桌面激活 '+await upgrade(rpc,release,values.desktop)+' 张便笺并更新布局。');}
  catch(error){console.error(error.message);process.exitCode=1;}
}
