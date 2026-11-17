import {z} from '@dsh-workbench/runtime';
import {configSchema,kindSchema,note,recordSchema} from './model';
export {note} from './model';

async function readCatalog<T>(ctx:import('@dsh-workbench/runtime').NoteQueryContext<typeof note>,input:Record<string,unknown>):Promise<T|null>{
  const config=configSchema.parse({kind:'cards',...await ctx.config.read()});
  if(!config.connections?.game)return null;
  const snap=await ctx.resources.read<T|null>({name:'extension.game-project.catalog',connection:'game',input:input as import('@dsh-workbench/runtime').JsonValue});
  if(snap.error)throw Error(snap.error);
  return snap.data??null;
}

export const asset=note.query({visibility:'private',description:'读取已绑定游戏中的实际素材。',input:z.object({key:z.string()}),output:z.string().nullable()},async(ctx,input)=>{
  const config=await ctx.config.read();
  if(!config.connections?.game)return null;
  const snap=await ctx.resources.read<string|null>({name:'extension.game-project.asset',connection:'game',input});
  if(snap.error)throw Error(snap.error);
  return snap.data??null;
});

const criteria=z.object({facetQuery:z.string().max(512).optional(),q:z.string().max(1000).optional(),filters:z.record(z.string(),z.array(z.string())).optional(),page:z.number().int().positive().optional(),sort:z.enum(['default','name']).optional()});
const summary=z.object({id:z.string(),title:z.string(),group:z.string(),body:z.string(),thumbnail:z.string().nullable(),mediaKey:z.string().nullable(),summary:z.string()});
const pageOutput=z.object({
  configured:z.boolean(),
  total:z.number(),count:z.number(),page:z.number(),pages:z.number(),
  items:z.array(summary),
  facets:z.array(z.object({key:z.string(),hasMore:z.boolean(),options:z.array(z.object({value:z.string(),count:z.number()}))})),
});

export const collection=note.query({
  description:'按本便笺所属类别分页搜索游戏记录，返回当前页摘要和筛选项计数。',
  input:criteria,
  output:pageOutput,
},async(ctx,input)=>{
  const data=await readCatalog<Omit<z.infer<typeof pageOutput>,'configured'>>(ctx,{op:'page',...input});
  if(!data)return {configured:false,total:0,count:0,page:1,pages:1,items:[],facets:[]};
  return {...pageOutput.omit({configured:true}).parse(data),configured:true};
});

export const recordsPage=note.query({
  description:'按游标分页列出本便笺记录身份与标题。',
  input:z.object({cursor:z.string().optional()}),
  output:z.object({items:z.array(z.object({id:z.string(),title:z.string()})),next:z.string().optional()}),
},async(ctx,input)=>{
  const data=await readCatalog<{items:{id:string;title:string}[];next?:string}>(ctx,{op:'cursor',...(input.cursor?{cursor:input.cursor}:{})});
  return data?{items:data.items,...(data.next?{next:data.next}:{})}:{items:[]};
});

export const home=note.query({
  visibility:'private',
  description:'读取桌面紧凑卡片所需的当前内容。',
  input:z.object({}),
  output:z.object({configured:z.boolean(),kind:kindSchema,count:z.number(),records:z.array(recordSchema)}),
},async ctx=>{
  const config=configSchema.parse({kind:'cards',...await ctx.config.read()});
  const data=await readCatalog<{kind:z.infer<typeof kindSchema>;count:number;records:z.infer<typeof recordSchema>[]}>(ctx,{op:'home'});
  if(!data)return {configured:false,kind:config.kind,count:0,records:[]};
  return {configured:true,kind:kindSchema.parse(data.kind),count:data.count,records:z.array(recordSchema).parse(data.records)};
});

export const overview=note.query({
  description:'读取本便笺的记录数与前三条标题。',
  output:z.object({count:z.number(),items:z.array(z.string())}),
},async ctx=>{
  const data=await readCatalog<{count:number;items:string[]}>(ctx,{op:'overview'});
  return data??{count:0,items:[]};
});

export const record=note.query({
  description:'按稳定 ID 实时读取单条记录的字段、引用与游戏源文件路径。',
  input:z.object({id:z.string()}),
  output:recordSchema.nullable(),
},async(ctx,{id})=>{
  const data=await readCatalog<unknown>(ctx,{op:'record',id});
  return data?recordSchema.parse(data):null;
});
