#!/usr/bin/env node
import {readFile,writeFile,realpath,rename,unlink} from 'node:fs/promises';
import {connectWorka} from './worka-client.mjs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {parseArgs} from 'node:util';
import {projectData,portableDesktop,referenceCode,name} from './studio.mjs';

const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const {values:args}=parseArgs({options:{game:{type:'string'},desktop:{type:'string'},connection:{type:'string'},release:{type:'boolean'},help:{type:'boolean'}}});
if(args.help||(args.release&&!args.game)){
  console.log('node tools/setup.mjs [--game <本机路径或 GitHub URL>] [--desktop <桌面 ID>] [--connection <connection.json>]\n作者更新发行数据：增加 --release');
  process.exit(args.help?0:1);
}
async function writeChanged(path,contents){
  if(await readFile(path,'utf8').catch(()=>null)===contents)return false;
  const temp=path+'.'+randomUUID()+'.tmp';
  try {await writeFile(temp,contents,{flag:'wx'});await rename(temp,path);}
  finally {await unlink(temp).catch(()=>{});}
  return true;
}
// Leave room for the host envelope around a published desktop.
const portableBytes=Math.floor(1.9*1024*1024);
function checkSize(label,value,limit) {
  const size=Buffer.byteLength(JSON.stringify(value),'utf8');
  if(size>limit)throw Error(label+' 需要 '+size+' 字节，超过当前安全上限 '+limit+' 字节。');
}
async function main(){
  if(args.release){
    const root=await realpath(args.game);
    const data=await projectData(root),code=referenceCode(data.links);
    const manifest=await portableDesktop(repo,data);
    checkSize('发行桌面，请减少随包的初始记录，再用 --game 绑定完整项目。',manifest,portableBytes);
    await writeChanged(join(repo,'connections/references/connection.ts'),code);
    await writeChanged(join(repo,'desktop.json'),JSON.stringify(manifest,null,2)+'\n');
    console.log('发行桌面：'+manifest.notes.length+' 张便笺，'+data.links.length+' 条记录引用，游戏 '+data.commit);return;
  }
  const rpc=await connectWorka(args.connection);
  let id=args.desktop;
  if(!id){
    const desks=(await rpc('desktop.list')).filter(d=>!d.archived&&d.name===name);
    if(desks.length!==1)throw Error('请在 Worka 导入卡牌游戏创作室，并用 --desktop 指定目标桌面 ID。');
    id=desks[0].id;
  }
  const receipt=await rpc('extension.invoke',{extension:'game-project',method:args.game?'bind':'refresh',input:{desktopId:id,...(args.game?{source:args.game}:{})}});
  console.log('已连接 '+receipt.root+' @ '+receipt.commit.slice(0,10)+' · '+receipt.scenes+' 条剧情 · '+receipt.links+' 条引用');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
