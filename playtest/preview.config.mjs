import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gameEntry} from './entry.mjs';

const folder=dirname(fileURLToPath(import.meta.url));
export default {
  version:3,name:'CardGame',repos:{game:{required:true}},files:['entry.mjs','serve.mjs'],
  plan(ctx){
    const game=ctx.repos.game;
    const query=new URLSearchParams({workaProject:createHash('sha256').update(game.repo).digest('hex').slice(0,16),
      workaCandidate:ctx.key,workaCommit:game.commit,workaProfile:'studio'});
    return {
      surfaces:[{name:'game',title:'游戏',service:'game',path:'/?'+query}],
      prepare:[{name:'安装游戏依赖',cwd:game.dir,command:['npm','ci','--no-audit','--no-fund'],unless:'node_modules/vite/dist/node/index.js',timeoutMs:300000}],
      services:[{name:'game',cwd:game.dir,command:['node',join(folder,'serve.mjs')],env:{PORT:'{{port:game}}',STUDIO_COMMIT:game.commit,
        STUDIO_ENTRY:JSON.stringify(ctx.options.entry||null)},ready:{http:'/__worka_studio',timeoutMs:120000}}],
    };
  },
  isolation(ctx){
    const game=ctx.repos.game;
    const save=readFileSync(join(game.dir,'src/game/services/PreviewStorage.ts'),'utf8');
    const persistence=readFileSync(join(game.dir,'src/game/services/RunPersistence.ts'),'utf8');
    const story=readFileSync(join(game.dir,'src/game/services/StoryHubSessionPersistence.ts'),'utf8');
    return [{name:'试玩存档隔离',ok:/^[a-f0-9]{40}$/.test(game.commit)&&['workaProject','workaCandidate','workaCommit','workaProfile'].every(k=>save.includes(k))&&[persistence,story].every(s=>s.includes('gameStorage(')),
      evidence:'固定提交 '+game.commit+'；运行存档和剧情进度均使用游戏的 gameStorage，页面地址包含项目、候选、提交与玩家档案。'}];
  },
  check(ctx){const entry=gameEntry(ctx.repos.game.dir,ctx.options.entry);return [{name:'试玩起点',ok:true,detail:entry.scene}];},
  async verify(ctx,surface){
    const url=ctx.urls[surface],game=ctx.repos.game,expected=gameEntry(game.dir,ctx.options.entry);
    const paths=['/__worka_studio','/','/src/main.tsx','/src/GameApp.tsx','/src/game/scenes/Preloader.ts','/data/content-catalog.json'];
    const responses=await Promise.all(paths.map(p=>fetch(new URL(p,url))));
    if(responses.some(r=>!r.ok))return [{name:'游戏入口与模块',ok:false,detail:responses.map(r=>r.status).join(', ')}];
    const [identity,html,entry,app,preloader,catalog]=await Promise.all([responses[0].json(),...responses.slice(1,5).map(r=>r.text()),responses[5].json()]);
    return [
      {name:'运行版本及场景',ok:identity.commit===game.commit&&identity.scene===expected.scene,detail:identity.scene+' · '+identity.commit},
      {name:'React / Phaser 游戏入口',ok:html.includes('src/main.tsx')&&entry.includes('GameApp')&&app.includes('StartGame')&&preloader.includes(expected.scene)},
      {name:'游戏内容目录',ok:Array.isArray(catalog.resources)&&catalog.resources.some(r=>r.kind==='encounter')&&catalog.resources.some(r=>r.kind==='story')},
    ];
  },
};
