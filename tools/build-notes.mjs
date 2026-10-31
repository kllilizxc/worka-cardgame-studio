import { access, cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (!process.versions.bun || !args[0]) throw Error('用 bun tools/build-notes.mjs <Worka 源码目录> [ideas todo preview story catalog] 构建发行包');
const host = resolve(args[0]);
const load = file => import(pathToFileURL(join(host, file)).href);
const { officialSourceHash } = await load('src/runtime/official-artifacts.ts');
const { BunNoteBuilder } = await load('src/runtime/build.ts');
const { packagePublishedArtifact, preparePublishedNote, readPublishedArtifact } = await load('src/runtime/published-artifact.ts');
const { readNotePublication, copyPublication } = await load('src/note-publication.ts');
const stage = await mkdtemp(join(tmpdir(), 'worka-studio-build-'));
const keys = args.length > 1 ? args.slice(1) : ['ideas','todo','preview','story','catalog'];
const catalogKeys = ['cards','monsters','people','shop','media','map','encounter'];
const filesystem = {
  exists: path => access(path).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; }),
  readFile: path => readFile(path, 'utf8'), writeFile,
  mkdir: path => mkdir(path, {recursive:true}),
};
const commandRunner = {async run({command,args,cwd}) {
  const child = Bun.spawn([command,...args], {cwd,stdout:'pipe',stderr:'pipe'});
  const [exitCode,stdout,stderr] = await Promise.all([child.exited,new Response(child.stdout).text(),new Response(child.stderr).text()]);
  return {exitCode,stdout,stderr};
}};
try {
  await symlink(join(host, 'node_modules'), join(stage, 'node_modules'), 'dir');
  for (const [source, output] of [['src/runtime/tailwind-helper.ts','tailwind-helper.mjs'],['scripts/build-note-contract.ts','build-note-contract.mjs']]) {
    const built = await Bun.build({entrypoints:[join(host,source)],outdir:stage,naming:output,target:'node',packages:'external'});
    if (!built.success) throw Error(built.logs.map(String).join('\n'));
  }
  const builder = new BunNoteBuilder({fileSystem:filesystem,commandRunner,bunExecutable:process.execPath,installDependencies:false,
    tailwindHelper:join(stage,'tailwind-helper.mjs'),contractHelper:join(stage,'build-note-contract.mjs')});
  for (const key of keys) {
    if (!['ideas','todo','preview','story','catalog'].includes(key)) throw Error('未知源码 '+key);
    const source = join(repo,'notes',key), active = join(stage,'src-'+key), target = join(stage,'published-'+key);
    const def = await readNotePublication(source);
    await copyPublication(source,active,def);
    await builder.build({noteId:key,version:await officialSourceHash(active),directory:active,outputDirectory:join(active,'output')});
    // Bun's action bundle labels modules with relative checkout paths. Runtime code
    // does not use those comments; leave machine-specific directories out of releases.
    const actionsPath=join(active,'output/actions.mjs');
    const actions=await readFile(actionsPath,'utf8');
    await writeFile(actionsPath,actions.replace(/^\/\/ (?:\.\.\/)+[^\n]+$/gm,''));
    await preparePublishedNote(active,target);
    await packagePublishedArtifact(active,target);
    await readPublishedArtifact(target);
    const contract = JSON.parse(await readFile(join(target,'worka-prebuilt/contract/manifest.json'),'utf8'));
    if (contract.status!=='ready'||contract.typeErrors?.length) throw Error(key+' capability contract: '+JSON.stringify([...(contract.diagnostics||[]),...(contract.typeErrors||[])]));
    for (const member of key==='catalog'?catalogKeys:[key]) {
      const dest = join(repo,'published',member);
      // Replace an entire generated tree so removed chunks cannot leak into a release.
      await rm(dest,{recursive:true,force:true});
      await cp(target,dest,{recursive:true});
    }
    console.log(key+' · '+(await readdir(join(target,'worka-prebuilt'))).length+' outputs · ABI '+(await readPublishedArtifact(target)).capabilityAbi);
  }
} finally { await rm(stage,{recursive:true,force:true}); }
