// Worka's remote iframe can read same-origin chunks. Embed reduced artwork; load audio only on demand.
import {mkdir,readFile,writeFile,readdir,unlink} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {buildCatalog} from './catalog-index.mjs';
const audioMime={'.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.oga':'audio/ogg','.m4a':'audio/mp4','.aac':'audio/aac','.flac':'audio/flac','.opus':'audio/ogg'};
export async function prepareCatalogMedia(root,noteDir,{sharp,catalog}={}){
  if(!sharp)sharp=(await import('sharp')).default;
  const media=(catalog||buildCatalog(root)).media.initialConfig.records, directory=join(noteDir,'previews');
  await mkdir(directory,{recursive:true});
  const chunks=new Map();
  for(const r of media){
    const mime=audioMime[extname(r.source).toLowerCase()];
    const data=mime?await readFile(join(root,r.source)):await sharp(join(root,r.source),{animated:false}).rotate().resize({width:420,height:420,fit:'inside',withoutEnlargement:true}).webp({quality:65,effort:2}).toBuffer();
    const id=createHash('sha256').update(r.source).digest('hex'), bucket=mime?id.slice(0,12):id.slice(0,1);
    if(!chunks.has(bucket))chunks.set(bucket,{});
    chunks.get(bucket)[r.mediaKey]='data:'+(mime||'image/webp')+';base64,'+data.toString('base64');
  }
  const loads=[],keys={};
  for(const [key,data] of chunks){
    await writeFile(join(directory,key+'.json'),JSON.stringify(data)+'\n');
    loads.push(JSON.stringify(key)+':()=>import('+JSON.stringify('./previews/'+key+'.json')+').then(m=>m.default)');
    for(const path of Object.keys(data))keys[path]=key;
  }
  for(const f of await readdir(directory))if(/^[a-f0-9]+\.json$/.test(f)&&!chunks.has(f.slice(0,-5)))await unlink(join(directory,f));
  await writeFile(join(noteDir,'media.ts'),'// Generated from the selected game checkout.\nconst keys:Record<string,string>='+JSON.stringify(keys)+';\nconst loads:Record<string,()=>Promise<Record<string,string>>>={'+loads.join(',\n')+'};\nexport async function getMedia(path:string){const load=loads[keys[path]];return load?(await load())[path]:null;}\n');
  const manifestPath=join(noteDir,'worka-note.json'),manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  manifest.files=[...manifest.files.filter(f=>!f.startsWith('previews/')),...[...chunks.keys()].sort().map(k=>'previews/'+k+'.json')];
  await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
}

// Build-time only. Resolve sharp from the same installed Worka development checkout.
if(process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href){
  const [game,host]=process.argv.slice(2);
  if(!game||!host)throw Error('node tools/catalog-media.mjs <CardGame> <Worka>');
  const {resolve,dirname}=await import('node:path');
  const {createRequire}=await import('node:module');
  const {fileURLToPath}=await import('node:url');
  await prepareCatalogMedia(resolve(game),resolve(dirname(fileURLToPath(import.meta.url)),'../notes/catalog'),{sharp:createRequire(resolve(host,'package.json'))('sharp')});
}
