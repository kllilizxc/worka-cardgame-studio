import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildStory} from '../tools/story-index.mjs';

test('story backgrounds come from the current scene, never from a portrait or another scene',async()=>{
  const root=await mkdtemp(join(tmpdir(),'story-background-'));
  try {
    await mkdir(join(root,'knowledge'),{recursive:true});
    await mkdir(join(root,'public/data'),{recursive:true});
    await mkdir(join(root,'public/assets'),{recursive:true});
    await writeFile(join(root,'public/data/content-catalog.json'),JSON.stringify({resources:[{kind:'story',resourceId:'story',publicPath:'data/story.json'}]}));
    await writeFile(join(root,'public/data/story.json'),JSON.stringify({entryNodeId:'entry',nodes:[{id:'entry'},{id:'other',portrait:'assets/portrait.png'}]}));
    await writeFile(join(root,'public/assets/asset-manifest.json'),JSON.stringify({assets:[{path:'public/assets/bg.png',id:'bg'},{path:'public/assets/portrait.png',id:'portrait'}]}));
    await writeFile(join(root,'knowledge/entry.md'),'---\nscene: true\nnodeId: entry\nstoryId: story\ntitle: Entrance\nbackgroundAsset: assets/bg.png\nportrait: assets/portrait.png\n---\n# Entrance\n');
    const {initialConfig}=await buildStory(root);
    assert.equal(initialConfig.initialScene,'entry');
    assert.equal(initialConfig.storyIndex.find(scene=>scene.id==='entry').backgroundAssetId,'bg');
    assert.equal(initialConfig.storyIndex.find(scene=>scene.nodeId==='other').backgroundAssetId,undefined);
    assert(initialConfig.storyIndex.find(scene=>scene.nodeId==='other').refs.some(ref=>ref.id==='portrait'));
  } finally { await rm(root,{recursive:true,force:true}); }
});


test('the home starts at the playable mainline instead of an earlier example or QA scene',async()=>{
  const root=await mkdtemp(join(tmpdir(),'story-mainline-'));
  try {
    await mkdir(join(root,'knowledge'),{recursive:true});await mkdir(join(root,'public/data'),{recursive:true});
    await writeFile(join(root,'public/data/content-catalog.json'),JSON.stringify({resources:[
      {kind:'story',resourceId:'example',publicPath:'data/example.json'},
      {kind:'story',resourceId:'main',publicPath:'data/main.json'},
      {kind:'story',resourceId:'qa',publicPath:'data/qa.json'},
      {kind:'hub',resourceId:'hub',publicPath:'data/hub.json'},
    ]}));
    await writeFile(join(root,'public/data/example.json'),JSON.stringify({entryNodeId:'example',nodes:[{id:'example',tags:['示例']}]}));
    await writeFile(join(root,'public/data/main.json'),JSON.stringify({entryNodeId:'start',nodes:[{id:'start',tags:['主线']}]}));
    await writeFile(join(root,'public/data/qa.json'),JSON.stringify({entryNodeId:'qa',nodes:[{id:'qa'}]}));
    await writeFile(join(root,'public/data/hub.json'),JSON.stringify({defaultLocationId:'gate',locations:[{id:'gate',actions:[{kind:'startStory',storyResourceId:'main'}]}]}));
    await writeFile(join(root,'knowledge/qa.md'),'---\nscene: true\nnodeId: qa\nstoryId: qa\n---\n# QA\n');
    const {initialConfig}=await buildStory(root);
    assert.equal(initialConfig.initialScene,'main::start');
  } finally { await rm(root,{recursive:true,force:true}); }
});
