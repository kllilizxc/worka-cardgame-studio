import {z,agentCompletionInput} from '@realiz3r/worka-runtime';
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
 const {sessionId}=await ctx.host.agent.prepare(item.sessionId?{sessionId:item.sessionId,noteId:ctx.note.id}:{noteId:ctx.note.id,newSession:true,creationRequestId:taskId,initialTitle:item.title});
 const requestId=assignmentKey(itemId,item.fingerprint)+':'+ctx.idempotencyKey;
 const reservation=await ctx.runMutation(assignPreparedSession,{itemId,taskId,sessionId,title:item.title,requestId,fingerprint:item.fingerprint});
 if(!reservation.reserved){const {reserved,requestId:_requestId,...result}=reservation;return result;}
 let job;
 try{
  job=await ctx.jobs.runAgent({sessionId,noteId:ctx.note.id,requestId,prompt:`这项待办已交办，请处理。\n便笺ID：${ctx.note.id}\n事项ID：${itemId}\n标题：${item.title}\n要求摘录：${(item.description??'').slice(0,6000)}\n本次交办需求版本：${item.fingerprint}。先用该便笺 requirement 查询（itemId 为上述事项ID）读取完整要求与附件，并核对返回 revision 等于该版本；若不一致，停止执行新草稿并报告需求已变化，不自行扩展本次交办。仅处理该事项，沿用真实身份与现有授权；有实际进展后用 workbench 的 action.invoke 写回原事项：设置 method 为 action.invoke，input 为 {noteId:${JSON.stringify(ctx.note.id)},action:"recordProgress",input:{itemId:${JSON.stringify(itemId)},status:实际状态,summary:简短进展,conclusion:实际结果}}；不要使用 note.action。开始执行时写入 in_progress；核实要求已完成且成果已保存后写入 done，在 conclusion 写入成果及可打开的便笺链接。用户只要求草稿时，保存可用草稿即写 done；未发送、待审阅或标明的合理占位不使草稿继续进行，除非用户实际要求后续行动或缺失事实使草稿不可交付。只有真正需要用户行动时才写 blocking；用户可重新打开任务。不得把本次模型回合结束等同于任务完成。若工具返回对外操作确认 proposal，立即结束本次尝试：在 recordProgress 写 blocking，并把 proposal.label、proposal.target 和 proposal.request 原样写入 unblockAction；不要修改参数、重试或自动发送。其他受阻且同桌某张便笺能采取明确下一步时，也可在 unblockAction 中给出按钮名、目标 noteId 和用户可审核的具体请求；不要自动发送。\n\n回答项目、术语或流程问题时，先从知识便笺的公开 resources 查询或已提供的上下文取得已登记入口和根目录，在登记根目录内用原生本地搜索和读取；未登记根目录的入口只读取该入口文件。不复制整个知识库。只有本地搜索没有命中时才查公开资料，并在回答中说明。给用户的最终回复先直接回答结果；通常一两句话即可。引用资料时，对实际查阅的相关项目入口或索引以及支持回答的实质资料分别给出路径和行号范围；资料位于 Git 仓库且可取得提交时给出 commit，存在相关未提交修改时说明。这些是可核对的依据，不是内部标识。实际受阻称「受阻」并说明原因和具体下一步。除非用户主动询问，不复述原始状态值、字段名、坐标、时区、内部标识或工具名。`},{onComplete:assignmentCompleted});
 }catch(error){await ctx.runMutation(assignmentDispatchUnknown,{itemId,requestId,error:error instanceof Error?error.message:String(error)});throw error;}
 return ctx.runMutation(commitAssignment,{itemId,requestId,jobId:job.id,reservedRevision:reservation.revision});
});
