import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,mkdir,copyFile,symlink,rm,readdir,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,relative,sep} from 'node:path';
import {pathToFileURL} from 'node:url';

const host=process.env.WORKA_HOST_ROOT,game=process.env.CARDGAME_ROOT;
test('a large real game image produces a preview within the display limit without prebuilt snapshots', {skip:!host||!game}, async t=>{
  const root=await mkdtemp(join(tmpdir(),'game-preview-'));
  try {
    const sharp=createRequire(join(host,'package.json'))('sharp');
    const assets=join(game,'public/assets');
    const entries=await readdir(assets,{recursive:true,withFileTypes:true});
    const candidates=entries.filter(entry=>entry.isFile()&&/\.png$/i.test(entry.name)).map(entry=>join(entry.parentPath,entry.name)).sort();
    let file;
    for(const path of candidates){if((await stat(path)).size>256*1024){file=path;break;}}
    if(!file){t.skip('The selected game has no large PNG asset');return;}
    const source=relative(game,file).split(sep).join('/');
    await mkdir(join(root,'node_modules/@realiz3r'),{recursive:true});
    await symlink(host,join(root,'node_modules/@realiz3r/worka'),'dir');
    await copyFile(new URL('../published/game-project/index.mjs',import.meta.url),join(root,'index.mjs'));
    const {gameProject}=await import(pathToFileURL(join(root,'index.mjs')).href);
    const desktopId='fixture',noteId='cards';
    const binding={root:game,noteIds:{cards:noteId}};
    const app={core:{
      getNote:async()=>({value:{desktopId}}),
      readRecord:async(_table,key)=>key.endsWith(':config')?({value:{kind:'cards',connections:{game:{provider:'game-project',connectionId:'game-project'}}}}):({value:binding}),
    }};
    const provider=gameProject({dataRoot:root,app});
    try{
      const data=await provider.resources.asset.query.load({key:source+'?v=stale-digest'},{scope:{noteId,providerConnection:{provider:'game-project',connectionId:'game-project',desktopId}}});
      assert.match(data,/^data:image\/webp;base64,/);
      assert(Buffer.byteLength(JSON.stringify(data))<1024*1024-4096);
      const image=Buffer.from(data.split(',')[1],'base64'),meta=await sharp(image).metadata();
      assert(meta.width<=600&&meta.height<=600);
    }finally{await provider.close();}
  } finally {await rm(root,{recursive:true,force:true});}
});
