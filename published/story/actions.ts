import {z} from '@dsh-workbench/runtime';
import {ancestorSchema,documentReadSchema,note,readInputSchema,sceneSchema,storyConfigSchema,treeItemSchema} from './model';
export {note} from './model';

async function readStory<T>(ctx:import('@dsh-workbench/runtime').NoteQueryContext<typeof note>,input:Record<string,unknown>):Promise<{data:T|null;revision:string}>{
  const config=storyConfigSchema.parse(await ctx.config.read());
  if(!config.connections?.game)return {data:null,revision:'unbound'};
  const snap=await ctx.resources.read<T|null>({name:'extension.game-project.story',connection:'game',input:input as import('@dsh-workbench/runtime').JsonValue});
  if(snap.error)throw Error(snap.error);
  return {data:snap.data??null,revision:`${snap.epoch}:${snap.version}`};
}

export const scenes=note.query({
  visibility:'public',
  description:'按名称、正文、对白或 ID 分页检索剧情；保留 next 可继续翻页。',
  input:z.object({
    query:z.string().optional(),
    cursor:z.string().optional(),
    offset:z.number().int().min(0).optional(),
    limit:z.number().int().min(1).max(50).optional(),
  }),
  output:z.object({configured:z.boolean(),total:z.number(),items:z.array(sceneSchema),revision:z.string(),next:z.string().optional()}),
},async(ctx,input)=>{
  const {data,revision}=await readStory<{total:number;items:z.infer<typeof sceneSchema>[];next?:string}>(ctx,{op:'scenes',...input});
  if(!data)return {configured:false,total:0,items:[],revision};
  return {configured:true,total:data.total,items:z.array(sceneSchema).parse(data.items),revision,...(data.next?{next:data.next}:{})};
});

export const storyTreePage=note.query({
  visibility:'private',
  description:'按目录路径分页读取章节目录项与场景。',
  input:z.object({folderKey:z.string().optional(),cursor:z.string().optional(),limit:z.number().int().min(1).max(50).optional()}),
  output:z.object({
    configured:z.boolean(),
    key:z.string(),
    name:z.string(),
    ancestors:z.array(ancestorSchema),
    items:z.array(treeItemSchema),
    hasMore:z.boolean(),
    revision:z.string(),
    next:z.string().optional(),
  }),
},async(ctx,input)=>{
  const {data,revision}=await readStory<{key:string;name:string;ancestors:z.infer<typeof ancestorSchema>[];items:z.infer<typeof treeItemSchema>[];hasMore:boolean;next?:string}>(ctx,{op:'tree',...input});
  if(!data)return {configured:false,key:input.folderKey||'[]',name:'全书',ancestors:[],items:[],hasMore:false,revision};
  return {
    configured:true,
    key:data.key,
    name:data.name,
    ancestors:z.array(ancestorSchema).parse(data.ancestors),
    items:z.array(treeItemSchema).parse(data.items),
    hasMore:data.hasMore,
    revision,
    ...(data.next?{next:data.next}:{}),
  };
});

export const scene=note.query({
  visibility:'public',
  description:'按稳定 ID 读取单条场景的元数据、选项分支与实时引用（省略 ID 时返回主线入口场景）。',
  input:z.object({id:z.string().optional()}),
  output:z.object({configured:z.boolean(),initialScene:z.string(),scene:sceneSchema.nullable()}),
},async(ctx,input)=>{
  const {data}=await readStory<{initialScene:string;scene:unknown}>(ctx,{op:'scene',...(input.id?{id:input.id}:{})});
  if(!data)return {configured:false,initialScene:'',scene:null};
  return {configured:true,initialScene:data.initialScene,scene:data.scene?sceneSchema.parse(data.scene):null};
});

export const storyHome=note.query({
  visibility:'private',
  description:'读取紧凑卡片所需的主线起始场景与相邻分支。',
  input:z.object({}),
  output:z.object({configured:z.boolean(),current:sceneSchema.nullable(),branches:z.array(sceneSchema)}),
},async ctx=>{
  const {data}=await readStory<{current:unknown;branches:unknown[]}>(ctx,{op:'home'});
  if(!data)return {configured:false,current:null,branches:[]};
  return {
    configured:true,
    current:data.current?sceneSchema.parse(data.current):null,
    branches:z.array(sceneSchema).parse(data.branches),
  };
});

export const sceneAsset=note.query({
  visibility:'private',
  description:'读取场景声明的背景图。',
  input:z.object({sceneId:z.string()}),
  output:z.string().nullable(),
},async(ctx,{sceneId})=>{
  const {data:current}=await readStory<{scene:z.infer<typeof sceneSchema>|null}>(ctx,{op:'scene',id:sceneId});
  const id=current?.scene?.backgroundAssetId;
  if(!id)return null;
  const asset=await ctx.resources.read<string|null>({name:'extension.game-project.asset',connection:'game',input:{id}});
  if(asset.error)throw Error(asset.error);
  return asset.data??null;
});

export const document=note.query({
  visibility:'public',
  description:'按项目内相对路径和行范围实时读取剧情原文件。',
  input:readInputSchema,
  output:documentReadSchema.nullable(),
},async(ctx,input)=>{
  const config=storyConfigSchema.parse(await ctx.config.read());
  if(!config.connections?.game)return null;
  const snap=await ctx.resources.read({name:'extension.game-project.document',connection:'game',input});
  if(snap.error)throw Error(snap.error);
  return snap.data?documentReadSchema.parse(snap.data):null;
});
