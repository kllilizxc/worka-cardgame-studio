import {spawn} from 'node:child_process';
export const testSubprocess={
  async spawn(spec){
    const child=spawn(spec.command,spec.args,{cwd:spec.cwd,env:{...process.env,...spec.env},stdio:['pipe','pipe','pipe']});
    const done=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(code,signal)=>resolve({code,signal}));});
    child.stdin.on('error',()=>{});
    return {stdin:{write:data=>new Promise((resolve,reject)=>child.stdin.write(data,error=>error?reject(error):resolve())),end:()=>child.stdin.end()},stdout:child.stdout,stderr:child.stderr,wait:()=>done,kill:async()=>{child.kill('SIGKILL');await done;}};
  },
};
