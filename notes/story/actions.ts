import {z} from '@dsh-workbench/runtime';
import type {JsonValue} from '@dsh-workbench/runtime';
import {note,documentReadSchema,readInputSchema,referenceConfigSchema,resourceSchema,type DocumentRead} from './model';
export type {Data,Resource} from './model';
export {note} from './model';
export const projectIndex=note.query({visibility:'private',description:'已连接工作树的剧情导航。',output:referenceConfigSchema},readIndex);
async function readIndex(ctx:import('@dsh-workbench/runtime').NoteQueryContext<typeof note>){
  const config=referenceConfigSchema.parse({resources:[],...await ctx.config.read()});
  if(!config.connections?.game)return config;
  const snap=await ctx.resources.read({name:'extension.game-project.index',connection:'game',input:{}});
  if(snap.error)throw Error(snap.error);
  return snap.data==null?config:{...referenceConfigSchema.parse(snap.data),connections:config.connections};
}

export const sceneAsset=note.query({visibility:'private',description:'读取场景明确指定的背景图。',input:z.object({sceneId:z.string()}),output:z.string().nullable()},async(ctx,{sceneId})=>{
  const config=await readIndex(ctx),scene=config.storyIndex?.find(row=>row.id===sceneId);
  if(!config.connections?.game||!scene)return null;
  let id=scene.backgroundAssetId;
  if(!id){
    const doc=await ctx.resources.read<DocumentRead>({name:'extension.game-project.document',connection:'game',input:{path:scene.path,maxLines:500,pages:100}});
    if(doc.error)throw Error(doc.error);
    const text=doc.data?.content??'';
    let background:string|undefined;
    if(scene.path.endsWith('.json')){
      try{background=JSON.parse(text).nodes?.find((node:{id:string})=>node.id===scene.nodeId)?.backgroundAsset;}catch{}
    }else{
      const header=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1]??'';
      background=/^backgroundAsset:\s*(.*?)\s*$/m.exec(header)?.[1]?.replace(/^(['"])([\s\S]*)\1$/,'$2');
    }
    if(typeof background==='string'&&/\.(png|jpe?g|webp|svg|avif)$/i.test(background)){
      const path=background.startsWith('public/')?background:'public/'+background.replace(/^\//,'');
      id=scene.refs?.find(ref=>ref.note==='media'&&(ref.id==='asset:'+path||ref.id.endsWith(':'+path)))?.id;
    }
  }
  if(!id||!scene.refs?.some(ref=>ref.note==='media'&&ref.id===id))return null;
  const asset=await ctx.resources.read<string|null>({name:'extension.game-project.asset',connection:'game',input:{id}});
  if(asset.error)throw Error(asset.error);
  return asset.data??null;
});

export const document = note.query({visibility:'public',description:'按已登记资料路径和行范围读取原文件内容。',input:readInputSchema.extend({pages:z.number().int().min(1).max(100).optional()}),output:documentReadSchema.loose()}, async (ctx, input) => {
    if((await ctx.config.read()).connections?.game){
      const snap=await ctx.resources.read({name:'extension.game-project.document',connection:'game',input});
      if(snap.error)throw Error(snap.error);
      if(snap.data)return documentReadSchema.parse(snap.data);
    }
    const startLine=input.startLine??1,maxLines=input.maxLines??240,pages=input.pages??1;
    if(!Number.isInteger(startLine)||startLine<1||!Number.isInteger(maxLines)||maxLines<1||maxLines>500||!Number.isInteger(pages)||pages<1||pages>100)throw new Error('Invalid document line range');
    const snapshot=await ctx.resources.read<Omit<DocumentRead,'startLine'|'endLine'>>({name:'extension.reference.file',input:{resourcePath:input.resourcePath,...(input.path?{path:input.path}:{}),...(input.from?{from:input.from}:{})} as JsonValue});
    if(snapshot.error)throw new Error(snapshot.error);
    const source=snapshot.data;
    if(!source) throw new Error('资料尚未读入，请调用 refreshDocument 后重试。');
    return {...source,content:source.content.split(/\r?\n/).slice(startLine-1,startLine-1+maxLines*pages).join('\n'),startLine,endLine:Math.min(source.totalLines,startLine-1+maxLines*pages)};
  });

/** Reading local bytes belongs to an action, not the snapshot-only document query. */
export const refreshDocument = note.action({ visibility:'public', description:'读取已登记的本机资料并发布快照；首次读取或需要最新磁盘版本时调用。',
  input:readInputSchema.extend({pages:z.number().int().min(1).max(100).optional()}), output:documentReadSchema.loose(),
}, async (ctx,input) => {
  const config=await ctx.runQuery(projectIndex,{});
  if(config.connections?.game){
    await ctx.resources.revalidate({name:'extension.game-project.document',connection:'game',input});
    return ctx.runQuery(document,input);
  }
  const snapshot = await ctx.resources.revalidate({name:'extension.reference.file',input:{resourcePath:input.resourcePath,...(input.path?{path:input.path}:{}),...(input.from?{from:input.from}:{})}});
  if(snapshot.error || !snapshot.data) throw new Error(snapshot.error ?? '资料尚未就绪');
  return ctx.runQuery(document,input);
});

/** Explicit registration validates readability before changing the configuration. */
export const addResource = note.action({description:'登记一份可读取的本机文件或资料目录。', input:z.object({path:z.string(),title:z.string().optional()}), output:resourceSchema, visibility:'private',requiresConfig:false}, async (ctx, input) => {
  const resource=resourceSchema.parse(await ctx.host.extensions.request('reference','inspectResource',input));
  await ctx.runMutation(registerResource, resource);
  return resource;
});

/** The transaction rechecks uniqueness against the current configuration. */
export const registerResource = note.mutation({ input: resourceSchema, output: resourceSchema }, async (ctx, resource) => {
  const config = await ctx.config.read();
  const resources = config.resources ?? [];
  if (resources.some(item => item.path === resource.path)) throw new Error('这份资料已经登记，可以直接在列表中打开。');
  await ctx.config.update({ resources: [...resources, resource] });
  return resource;
});

import {sceneSchema} from './model';
const indexInput=z.object({storyIndex:z.array(sceneSchema),initialScene:z.string()});
export const setStoryIndex=note.mutation({
  visibility:'public',description:'更新来自已绑定 CardGame 检出的剧情导航索引；正文仍由 document 读取。',
  input:indexInput,output:z.object({count:z.number()}),
},async(ctx,input)=>{
  const ids=new Set(input.storyIndex.map(row=>row.id));
  if(ids.size!==input.storyIndex.length || (input.initialScene&&!ids.has(input.initialScene))) throw Error('剧情索引包含重复或缺失的场景');
  await ctx.config.update(input);
  return {count:ids.size};
});
const recordInfo=sceneSchema.omit({search:true,body:true});
export const scenes=note.query({visibility:'public',description:'按名称、正文、对白或 ID 检索剧情；返回原文件与分支目标。',
  input:z.object({query:z.string().optional(),offset:z.number().int().min(0).optional(),limit:z.number().int().min(1).max(100).optional()}),
  output:z.object({total:z.number(),items:z.array(recordInfo)})},async(ctx,input)=>{
  const rows=(await readIndex(ctx)).storyIndex??[];
  const words=(input.query??'').normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const resolved=rows.filter(row=>{const text=[row.id,row.title,...row.folders,row.search].join(' ').normalize('NFKC').toLowerCase();return words.every(w=>text.includes(w));});
  const offset=input.offset??0;
  return {total:resolved.length,items:resolved.slice(offset,offset+(input.limit??30)).map(({search,body,...info})=>info)};
});
