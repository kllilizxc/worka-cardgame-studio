import {z,pageInput,sha256} from '@dsh-workbench/runtime';
import {note,sessionLinkSchema,todoStatusSchema,sourceIconSchema,displaySourceSchema,progressEntrySchema} from './model';
import {business,getItem,saveItem,type WriteContext} from './state';
import {resolveTodoSources} from './list';
import { projectProgressEntries, progressTextIdentity, shortProgressText, type ProgressEntry } from './progress';
const sourceReference=z.object({noteId:z.string().min(1),itemId:z.string().optional()});
export const sessionLinked=note.event({name:'items.sessionLinked',visibility:'public',description:'事项关联了原生会话。关联不等于开始执行或业务完成。',payload:z.object({itemId:z.string(),title:z.string(),taskId:z.string(),sessionId:z.string(),revision:z.string()}),objectRef:'/itemId',objectLabel:'/title',revision:'/revision'});
const sessionIdentity=z.object({itemId:z.string().min(1),taskId:z.string().min(1),sessionId:z.string().min(1),title:z.string(),source:sourceReference.optional()});
export const linkSession=note.mutation({visibility:'public',description:'把已准备的原生会话关联到本事项，保留稳定任务身份和已核实来源；不会发送要求或恢复工作。',input:sessionIdentity,output:z.object({itemId:z.string(),taskId:z.string(),sessionId:z.string(),revision:z.string(),duplicate:z.boolean()}),objectRef:'/itemId',revision:'/revision'},async(ctx,input)=>{
 return saveSessionLink(ctx,input);
});
/** Save the session identity and optional assignment state in one native transaction. */
export async function saveSessionLink(ctx:WriteContext,input:z.output<typeof sessionIdentity>,assigned=false,assignment?:import('./model').TodoItem['assignment']){
 const row=await getItem(ctx,input.itemId),item=business(row),sessions=[...(item.sessions??[])];
 if(assigned&&item.archived)throw Error('请先恢复这项待办再交办');
 const previous=sessions.find(link=>link.taskId===input.taskId);
 if(previous&&previous.sessionId!==input.sessionId)throw Error('原任务已关联其他会话，请先核对原会话接续关系');
 const source=input.source?{kind:'note' as const,key:'note:'+input.source.noteId,...input.source}:undefined;
 const sources=[...(item.taskSources??[])];
 if(source&&!sources.some(old=>old.noteId===source.noteId&&old.itemId===source.itemId))sources.push(source);
 if(!previous)sessions.push({taskId:input.taskId,sessionId:input.sessionId,title:input.title});
 const duplicate=!!previous&&JSON.stringify(sources)===JSON.stringify(item.taskSources??[])&&(!assigned||item.status==='in_progress')&&assignment===undefined;
 if(duplicate)return {itemId:row.id,taskId:input.taskId,sessionId:input.sessionId,revision:String(row.revision),duplicate:true};
 const revision=await saveItem(ctx,{...item,sessions,taskSources:sources,...(assignment?{assignment}:{}),...(assigned?{status:'in_progress' as const,completed:false}:{})},row.id);
 await ctx.db.put('sessionIndex',JSON.stringify([input.taskId,row.id]),{taskId:input.taskId,itemId:row.id});
 await sessionLinked.publish(ctx,{itemId:row.id,title:item.title,taskId:input.taskId,sessionId:input.sessionId,revision});
 return {itemId:row.id,taskId:input.taskId,sessionId:input.sessionId,revision,duplicate:false};
}
const itemSessionSchema=z.object({itemId:z.string(),title:z.string(),status:todoStatusSchema,sessions:z.array(sessionLinkSchema),archived:z.boolean().optional()});
export const sessionItems=note.query({visibility:'public',description:'分页读取事项与它们关联的会话；不会查询或启动原生执行。',input:pageInput,output:z.object({items:z.array(itemSessionSchema),revision:z.string(),next:z.string().optional()})},async(ctx,input)=>{
 const page=await ctx.db.page('items',{cursor:input.cursor,orderBy:{position:'asc'},select:['title','status','sessions','archived']});
 return {...page,items:page.items.map(row=>({itemId:row.id,title:row.title,status:row.status,sessions:row.sessions??[],...(row.archived===undefined?{}:{archived:row.archived})}))};
});
export const sessionTask=note.query({visibility:'public',description:'由保留的任务身份定位所有相关事项，保留历史多对多关系。',input:z.object({taskId:z.string()}),output:z.object({items:z.array(itemSessionSchema)})},async(ctx,{taskId})=>{
 const page=await ctx.db.page('sessionIndex',{where:{taskId}});if(page.next)throw Error('该任务关联事项超出单次查询预算');
 const rows=await Promise.all(page.items.map(index=>ctx.db.get('items',index.itemId)));
 return {items:rows.flatMap(row=>row?[{itemId:row.id,title:row.title,status:row.status,sessions:row.sessions??[],...(row.archived===undefined?{}:{archived:row.archived})}]:[])};
});
export const sourceMetadata=note.query({visibility:'private',input:z.object({ids:z.array(z.string()).max(25)}),output:z.array(z.object({id:z.string(),name:z.string(),icon:sourceIconSchema.optional()}))},async(ctx,{ids})=>(await Promise.all([...new Set(ids)].map(id=>ctx.notes.lookup({id})))).flat());
export const executionDetails=note.query({visibility:'public',description:'按事项查看全部关联会话和准确来源。',input:z.object({itemId:z.string()}),output:z.object({sessions:z.array(sessionLinkSchema),sources:z.array(displaySourceSchema)})},async(ctx,{itemId})=>{
 const row=await getItem(ctx,itemId),[sources]=await resolveTodoSources(ctx,[row]);
 return {sessions:row.sessions??[],sources:sources!};
});
const timelineEntrySchema=progressEntrySchema.omit({conclusionKey:true}).extend({id:z.string(),recordedAt:z.number().int().nonnegative().optional()});
export const progressTimeline=note.query({visibility:'private',description:'分页读取真实进展记录，原文保留；没有时间的当前结论不补造时间。',
 input:pageInput.extend({itemId:z.string()}),output:z.object({items:z.array(timelineEntrySchema),revision:z.string(),next:z.string().optional()})},async(ctx,input)=>{
 const row=await getItem(ctx,input.itemId);
 const page=await ctx.db.page('progressEntries',{where:{itemId:input.itemId},orderBy:{recordedAt:'desc'},cursor:input.cursor});
 const entries:ProgressEntry[]=[...page.items];
 if(!input.cursor){
  const conclusion=row.conclusion?.trim(),recorded=conclusion?await ctx.db.page('progressEntries',{where:{itemId:input.itemId,conclusionKey:sha256(progressTextIdentity(conclusion))},select:['summary']}):undefined;
  if(conclusion&&!recorded?.items.length&&!entries.some(entry=>progressTextIdentity(entry.conclusion)===progressTextIdentity(conclusion)))entries.unshift({
   id:`current:${input.itemId}`,itemId:input.itemId,source:'current',status:row.status,
   summary:shortProgressText(conclusion),conclusion:row.conclusion??conclusion,
  });
 }
 return {items:projectProgressEntries(entries).map(entry=>timelineEntrySchema.parse({...entry,summary:shortProgressText(entry.summary)})),revision:`${page.revision}:${row.revision}`,...(page.next?{next:page.next}:{})};
});
export const setArchived=note.mutation({visibility:'private',input:z.object({itemId:z.string(),archived:z.boolean()}),output:z.object({revision:z.string()})},async(ctx,{itemId,archived})=>{const row=await getItem(ctx,itemId);return {revision:await saveItem(ctx,{...business(row),archived},itemId)};});
