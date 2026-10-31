import {z} from '@dsh-workbench/runtime';
import {indexSchema,kindSchema,note,recordSchema} from './model';
import {search} from './search';
import {homeRecords} from './home';
export {note} from './model';
export const projectIndex=note.query({visibility:'private',description:'当前工作树的索引；首次连接前可查看发行样例。',output:indexSchema},readIndex);
async function readIndex(ctx:import('@dsh-workbench/runtime').NoteQueryContext<typeof note>){
  const config=indexSchema.parse({kind:'cards',records:[],revision:'',...await ctx.config.read()});
  if(!config.connections?.game)return config;
  const snap=await ctx.resources.read({name:'extension.game-project.index',connection:'game',input:{}});
  if(snap.error)throw Error(snap.error);
  return snap.data==null?config:indexSchema.parse(snap.data);
}
const criteria=z.object({facetQuery:z.string().max(512).optional(),q:z.string().max(1000).optional(),filters:z.record(z.string(),z.array(z.string())).optional(),page:z.number().int().positive().optional(),sort:z.enum(['default','name']).optional()});
const summary=z.object({id:z.string(),title:z.string(),group:z.string(),body:z.string(),thumbnail:z.string().nullable(),mediaKey:z.string().nullable(),summary:z.string()});
export const collection=note.query({
  description:'全库搜索卡牌游戏记录，按多个分类筛选，返回分页摘要和分类计数。',input:criteria,
  output:z.object({total:z.number(),count:z.number(),page:z.number(),pages:z.number(),items:z.array(summary),facets:z.array(z.object({key:z.string(),hasMore:z.boolean(),options:z.array(z.object({value:z.string(),count:z.number()}))}))}),
},async(ctx,input)=>search((await readIndex(ctx)).records||[],input));
export const home = note.query({visibility:'private',description:'桌面首页的当前内容和进度。',input:z.object({}),
  output:z.object({kind:kindSchema,count:z.number(),records:z.array(recordSchema)})},async ctx=>{
  const config=await readIndex(ctx);
  return homeRecords(config.kind,config.records);
});
export const overview=note.query({description:'桌面便笺摘要。',output:z.object({count:z.number(),items:z.array(z.string())})},async ctx=>{
  const rows=(await readIndex(ctx)).records||[];return {count:rows.length,items:rows.slice(0,3).map(r=>r.title)};
});
export const record=note.query({description:'按稳定 ID 读取字段、引用与游戏文件中的具体路径。',input:z.object({id:z.string()}),output:recordSchema.nullable()},
  async(ctx,{id})=>(await readIndex(ctx)).records?.find(r=>r.id===id)||null);
export const indexRevision=note.query({description:'读取当前游戏索引版本，供刷新时核对。',output:z.object({revision:z.string()})},async ctx=>({revision:(await readIndex(ctx)).revision||''}));
export const replaceIndex=note.mutation({
  visibility:'public',description:'将此库原子更新为指定游戏工作树重新生成的索引。先读取 indexRevision，再传 expectedRevision。',
  input:indexSchema.omit({connections:true}).extend({expectedRevision:z.string()}),output:z.object({revision:z.string(),count:z.number()})
},async(ctx,{expectedRevision,...next})=>{
  const current=await ctx.config.read();
  if(next.kind!==current.kind)throw new Error('便笺类型不匹配');
  if(current.revision!==next.revision){
    if((current.revision||'')!==expectedRevision)throw new Error('索引已更新，请重读版本');
    if(new Set(next.records.map(r=>r.id)).size!==next.records.length)throw new Error('索引包含重复 ID');
    await ctx.config.update(next);
  }
  return {revision:next.revision,count:next.records.length};
});
