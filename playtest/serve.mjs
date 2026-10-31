// Vite runs the pinned game checkout. The optional entry changes only this in-memory scene transition.
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {gameEntry} from './entry.mjs';

const root=process.cwd(),port=Number(process.env.PORT);
const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
if(commit!==process.env.STUDIO_COMMIT||!Number.isInteger(port)||port<1||port>65535)throw Error('试玩版本或端口无效');
const entry=gameEntry(root,JSON.parse(process.env.STUDIO_ENTRY||'null'));
const {createServer}=await import(pathToFileURL(resolve(root,'node_modules/vite/dist/node/index.js')).href);
const server=await createServer({
  root,configFile:join(root,'vite/config.dev.mjs'),server:{host:'127.0.0.1',port,strictPort:true},
  plugins:[{name:'worka-studio-game',enforce:'pre',
    configureServer(server){
      server.middlewares.use('/__worka_studio',(_req,res)=>{
        res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
        res.end(JSON.stringify({commit,scene:entry.scene}));
      });
    },
    transform(source,id){
      if(entry.scene==='MainMenu'||!id.split('?')[0].endsWith('/src/game/scenes/Preloader.ts'))return;
      const start=/this\.scene\.start\(\s*['"]MainMenu['"]\s*\)/g;
      if([...source.matchAll(start)].length!==1)throw Error('游戏启动入口已变化，请更新试玩适配器。');
      return {code:source.replace(start,()=> 'this.scene.start('+JSON.stringify(entry.scene)+','+JSON.stringify(entry.payload)+')'),map:null};
    },
  }],
});
await server.listen();
async function stop(){await server.close();process.exit(0);}
process.once('SIGTERM',stop);process.once('SIGINT',stop);
