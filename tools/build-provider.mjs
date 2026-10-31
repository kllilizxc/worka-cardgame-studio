import {copyFile,mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
if(!process.versions.bun||!process.argv[2])throw Error('bun tools/build-provider.mjs <Worka source>');
const {prepareDesktopExtension,readDesktopExtension}=await import(pathToFileURL(resolve(process.argv[2],'src/desktop-extension-publication.ts')).href);
const stage=await mkdtemp(join(tmpdir(),'cardgame-project-build-'));
try {
 for(const file of ['package.json','cordis.patch.yml'])await copyFile(join(root,'provider',file),join(stage,file));
 await copyFile(join(root,'LICENSE'),join(stage,'LICENSE'));
 const built=await Bun.build({entrypoints:[join(root,'provider/index.mjs')],outdir:stage,naming:'index.mjs',target:'node',minify:{whitespace:false,syntax:false,identifiers:false}});
 if(!built.success)throw Error(built.logs.map(String).join('\n'));
 const out=join(root,'published','game-project');
 await rm(out,{force:true,recursive:true});await mkdir(out,{recursive:true});
 await prepareDesktopExtension(stage,out,{entry:'index.mjs',capabilities:['game-project']});
 console.log('game-project '+(await readDesktopExtension(out)).integrity);
} finally {await rm(stage,{force:true,recursive:true});}
