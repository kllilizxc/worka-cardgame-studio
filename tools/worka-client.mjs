import {access,readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';

async function connection(path){
  const home=homedir(),data=process.env.WORKA_DESKTOP_DATA_DIR;
  const files=path?[path]:[
    data&&join(data,'dsh/workbench/connection.json'),
    join(home,'Library/Application Support/Worka/dsh/workbench/connection.json'),
    join(home,'.config/Worka/dsh/workbench/connection.json'),
    process.env.APPDATA&&join(process.env.APPDATA,'Worka/dsh/workbench/connection.json'),
    join(home,'.dsh/workbench/connection.json'),
  ].filter(Boolean);
  for(const f of files){try{await access(f)}catch{continue}return JSON.parse(await readFile(f,'utf8'));}
  throw Error('找不到运行中的 Worka，请用 --connection 指向本机 Worka 的 connection.json。');
}
export async function connectWorka(path){
  const conn=await connection(path), url=new URL(conn.url);
  if(!['http:','https:'].includes(url.protocol)||!['127.0.0.1','localhost','[::1]'].includes(url.hostname))throw Error('此命令只连接本机 Worka。');
  return async(method,input={})=>{
    const response=await fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(90000),headers:{'content-type':'application/json','x-workbench-token':conn.token},body:JSON.stringify({protocolVersion:conn.protocolVersion,method,input})});
    const result=await response.json();if(!response.ok||!result.ok)throw Error(method+' · '+(result.error?.message||response.status));return result.data;
  };
}
