import {z,agentCompletionInput} from '@dsh-workbench/runtime';
import {note,todoStatusSchema} from './model';
import {business,getItem,saveItem} from './state';
import {saveSessionLink} from './sessions';
import {todoRequirementFingerprint} from './list';

const resultSchema=z.object({itemId:z.string(),sessionId:z.string(),revision:z.string(),duplicate:z.boolean(),status:todoStatusSchema,jobId:z.string().optional()});
const assignmentKey=(itemId:string,fingerprint:string)=>`todo-assign:${encodeURIComponent(itemId)}:${fingerprint}`;
export const assignmentContext=note.query({visibility:'private',input:z.object({itemId:z.string()}),output:z.object({title:z.string(),description:z.string().optional(),archived:z.boolean(),fingerprint:z.string(),sessionId:z.string().optional(),taskId:z.string().optional()})},async(ctx,{itemId})=>{
 const item=business(await getItem(ctx,itemId)),session=item.sessions?.find(link=>!link.archived);
 return {title:item.title,description:item.description,archived:item.archived??false,fingerprint:todoRequirementFingerprint(item),...(session?{sessionId:session.sessionId,taskId:session.taskId}:{})};
});
export const assignPreparedSession=note.mutation({visibility:'private',input:z.object({itemId:z.string(),taskId:z.string(),sessionId:z.string(),title:z.string(),requestId:z.string(),fingerprint:z.string()}),output:resultSchema.extend({reserved:z.boolean(),requestId:z.string()})},async(ctx,input)=>{
 const row=await getItem(ctx,input.itemId),item=business(row);
 if(item.archived)throw Error('请先恢复这项待办再交办');
 if(todoRequirementFingerprint(item)!==input.fingerprint)throw Error('该需求已被修改，请确认最新要求后重新交办');
 if(item.assignment?.fingerprint===input.fingerprint&&['reserved','queued','unknown'].includes(item.assignment.phase)){
  if(item.assignment.phase==='reserved'||item.assignment.phase==='unknown')throw Error('原交办的启动结果尚未确认，请查看原会话与执行记录；不会重复开工');
  return {itemId:row.id,sessionId:item.assignment.sessionId,revision:String(row.revision),duplicate:true,reserved:false,status:row.status,jobId:item.assignment.jobId,requestId:item.assignment.requestId};
 }
 const saved=await saveSessionLink(ctx,input,false,{requestId:input.requestId,fingerprint:input.fingerprint,sessionId:input.sessionId,phase:'reserved'});
 return {...saved,reserved:true,status:row.status,requestId:input.requestId};
});
export const commitAssignment=note.mutation({visibility:'private',input:z.object({itemId:z.string(),requestId:z.string(),jobId:z.string(),reservedRevision:z.string()}),output:resultSchema},async(ctx,input)=>{
 const row=await getItem(ctx,input.itemId),item=business(row),assignment=item.assignment;
 if(!assignment||assignment.requestId!==input.requestId)throw Error('交办要求已变化，请查看原执行记录');
 const status:z.output<typeof todoStatusSchema>=assignment.phase==='failed'?'blocking':row.status==='done'&&String(row.revision)!==input.reservedRevision?'done':'in_progress';
 const revision=await saveItem(ctx,{...item,status,completed:status==='done',assignment:{...assignment,jobId:input.jobId,phase:assignment.phase==='reserved'?'queued':assignment.phase}},row.id);
 return {itemId:row.id,sessionId:assignment.sessionId,revision,duplicate:false,status,jobId:input.jobId};
});
export const assignmentDispatchUnknown=note.mutation({visibility:'private',input:z.object({itemId:z.string(),requestId:z.string(),error:z.string()}),output:z.null()},async(ctx,input)=>{
 const row=await getItem(ctx,input.itemId),item=business(row);
 if(item.assignment?.requestId===input.requestId)await saveItem(ctx,{...item,assignment:{...item.assignment,phase:'unknown',error:input.error}},row.id);
 return null;
});
export const assignmentCompleted=note.mutation({visibility:'private',input:agentCompletionInput,output:z.null()},async(ctx,input)=>{
 const match=input.requestId?.match(/^todo-assign:([^:]+):/);if(!match)return null;
 const row=await ctx.db.get('items',decodeURIComponent(match[1]!));if(!row)return null;
 const item=business(row),assignment=item.assignment;
 if(!assignment||assignment.requestId!==input.requestId||assignment.jobId&&assignment.jobId!==input.taskId)return null;
 const failed=['failed','cancelled','unknown','needs-input'].includes(input.result.status);
 const status=failed&&row.status==='in_progress'?'blocking':row.status;
 await saveItem(ctx,{...item,status,completed:status==='done',assignment:{...assignment,jobId:input.taskId,phase:failed?'failed':'completed',...(input.result.error?{error:input.result.error}:{})}},row.id);
 return null;
});

/** Native session allocation and durable dispatch are separate effects; reserve the intent before enqueueing. */
export const assignSession=note.action({visibility:'public',objectRef:'/itemId',revision:'/revision',description:'直接分配原生会话并立即执行当前要求，受理后移到进行中；重复点击不重复开工。',input:z.object({itemId:z.string()}),output:resultSchema},async(ctx,{itemId})=>{
 const item=await ctx.runQuery(assignmentContext,{itemId});if(item.archived)throw Error('请先恢复这项待办再交办');
 const taskId=item.taskId??`todo-assignment:${ctx.note.id}:${itemId}`;
 if(!ctx.host.agent.prepare)throw Error('宿主没有提供会话分配能力');
 const {sessionId}=await ctx.host.agent.prepare(item.sessionId?{sessionId:item.sessionId,noteId:ctx.note.id}:{noteId:ctx.note.id,newSession:true,creationRequestId:taskId});
 const requestId=assignmentKey(itemId,item.fingerprint)+':'+ctx.idempotencyKey;
 const reservation=await ctx.runMutation(assignPreparedSession,{itemId,taskId,sessionId,title:item.title,requestId,fingerprint:item.fingerprint});
 if(!reservation.reserved){const {reserved,requestId:_requestId,...result}=reservation;return result;}
 let job;
 try{
  job=await ctx.jobs.runAgent({sessionId,noteId:ctx.note.id,requestId,prompt:`用户已点击 Assign，立即处理这一项待办。\n便笺ID：${ctx.note.id}\n事项ID：${itemId}\n标题：${item.title}\n要求摘录：${(item.description??'').slice(0,6000)}\n本次交办需求版本：${item.fingerprint}。先用该便笺 requirement 查询（itemId 为上述事项ID）读取完整要求与附件，并核对返回 revision 等于该版本；若不一致，停止执行新草稿并报告需求已变化，不自行扩展本次交办。先查看关联点子库，结合制作连线提供的旧灵感向作者推荐；仅将已授权内容实施到游戏仓库。沿用真实身份与现有授权；有实际进展后通过 recordProgress 写回原事项，任务卡只能由用户确认完成；不得自行写 done，也不得调用状态切换或导入接口绕过。认为本次要求已完成时移到 blocking，并在进展中说明待用户 review。不得把本次模型回合结束等同于任务完成。`},{onComplete:assignmentCompleted});
 }catch(error){await ctx.runMutation(assignmentDispatchUnknown,{itemId,requestId,error:error instanceof Error?error.message:String(error)});throw error;}
 return ctx.runMutation(commitAssignment,{itemId,requestId,jobId:job.id,reservedRevision:reservation.revision});
});
