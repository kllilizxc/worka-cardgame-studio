import {candidateSchema,feedbackSchema,receiveInputSchema,renameInputSchema} from './schemas';
import {z,isNoteController,sha256} from '@dsh-workbench/runtime';
import { note, type SurfaceFailure } from './model';
import {candidateDocument} from './document';
export { note } from './model';
import type {NoteActionContext} from '@dsh-workbench/runtime';
type ActionContext = NoteActionContext<typeof note>;
export type {CandidateInput,CandidateSpec,SurfaceStatus,SurfacePhase,SurfaceStep,SurfaceFailure,Feedback,Data} from './model';

export const changed = note.event({visibility:'public',name:'candidates.changed',description:"候选登记、来源、标题、运行意图或移除发生变化；检查结果由反馈事件报告。",payload:z.object({key:z.string(),title:z.string(),revision:z.string(),removed:z.boolean()}),objectRef:'/key',objectLabel:'/title',revision:'/revision'});

export const feedbackReported = note.event({visibility:'public',name:'candidates.feedbackReported',description:"候选检查的明确结果或用户授权修复请求，需要与原任务核对。",payload:feedbackSchema.extend({originNoteId:z.string().nullable()}),objectRef:'/candidateKey',objectLabel:'/title',revision:'/runId'});

async function command(name:string,input:unknown,ctx:ActionContext){
  if(!ctx.host.previews.command)throw Error('请更新宿主以启用持久预览运行器');
  return ctx.host.previews.command(name,input as any);
}
export const receive = note.action({visibility:'public',"description":"接收或更新同一 key 的执行候选；接收不代表启动或验收通过。","objectRef":"/candidate/key","receipt":"queryable",input:receiveInputSchema,output:z.union([z.looseObject({renamed:z.number()}),z.looseObject({candidate:z.object({key:z.string()}),accepted:z.boolean(),startRequested:z.boolean(),started:z.literal(false)}),z.looseObject({accepted:z.boolean(),key:z.string(),desired:z.enum(['running','stopped'])})])}, async (ctx, input) => {
  return input?.operation==='rename'?renameCandidates(ctx,input):command('receive',input,ctx);
});
export const start = note.action({"description":"启动或重启整个候选容器组。","visibility":"public",input:z.object({key:z.string(),surface:z.string().optional(),restart:z.boolean().optional()}),output:z.looseObject({accepted:z.boolean(),key:z.string(),desired:z.enum(['running','stopped'])})}, async (ctx, input) => {
  return command('start',input,ctx);
});
export const stop = note.action({"description":"停止整个候选容器组。","visibility":"public",input:z.object({key:z.string(),surface:z.string().optional()}),output:z.looseObject({accepted:z.boolean(),key:z.string(),desired:z.enum(['running','stopped'])})}, async (ctx, input) => {
  return command('stop',input,ctx);
});
export const verify = note.action({"description":"请求核验候选的项目验收检查。","visibility":"private",input:z.object({key:z.string(),surface:z.string().optional()}),output:z.looseObject({accepted:z.boolean()})}, async (ctx, input) => {
  return command('verify',input,ctx);
});
export const check = note.action({"description":"请求运行候选的项目检查。","visibility":"private",input:z.object({key:z.string(),surface:z.string().optional()}),output:z.looseObject({accepted:z.boolean()})}, async (ctx, input) => {
  return command('check',input,ctx);
});
export const lan = note.action({description:'获取当前端的局域网预览地址。',visibility:'private',input:z.object({key:z.string(),surface:z.string().min(1)}),output:z.object({url:z.string().url()})},async(ctx,input)=>{
  return command('lan',input,ctx);
});
export const attach = note.action({"description":"设置候选是否在预览区展示。","visibility":"private",input:z.object({key:z.string(),attached:z.boolean().optional()}),output:z.looseObject({key:z.string(),attached:z.boolean()})}, async (ctx, input) => {
  return command('attach',input,ctx);
});
export const archive = note.action({"description":"停止并归档一个候选。","visibility":"private",input:z.object({key:z.string()}),output:z.looseObject({archived:z.boolean(),key:z.string().optional(),reason:z.string().optional()})}, async (ctx, input) => {
  return command('archive',input,ctx);
});
export const archiveByFeature = note.action({visibility:'public',"description":"按明确 feature ID 归档对应候选并停止预览进程。","receipt":"queryable",input:z.object({featureId:z.string().optional(),title:z.string().optional(),repos:z.array(z.string()).optional()}),output:z.looseObject({accepted:z.boolean(),matched:z.array(z.string()),skipped:z.array(z.string())})}, async (ctx, input) => {
  const featureId=input.featureId?.trim();
  if(!featureId)throw new Error('归档预览需要明确的 featureId');
  return command('archiveByFeature',{featureId},ctx);
});
export const restore = note.action({"description":"从归档区恢复一个候选。","visibility":"private",input:z.object({key:z.string()}),output:z.looseObject({restored:z.boolean(),key:z.string().optional(),reason:z.string().optional()})}, async (ctx, input) => {
  return command('restore',input,ctx);
});
export const forget = note.action({"description":"删除已归档候选的登记记录。","visibility":"private",input:z.object({key:z.string()}),output:z.looseObject({removed:z.boolean(),reason:z.string().optional()})}, async (ctx, input) => {
  return command('forget',input,ctx);
});
export const refresh = note.action({description:'恢复预览宿主观察。', visibility:'private', input:z.object({}), output:z.looseObject({accepted:z.boolean().optional(),count:z.number().optional()})}, ctx => command('refresh', {}, ctx));
export const triggers = note.triggers([{id:'preview-install',on:{type:'install'},run:refresh,input:{}}]);

export const requestRepair = note.action({"description":"重新投递当前故障给连线；沿用原报告，不创建另一轮修复任务。","visibility":"private",input:z.object({key:z.string(),surface:z.string().optional()}),output:z.looseObject({accepted:z.boolean(),session:z.string().optional(),reason:z.string().optional()})}, async (ctx, input) => {
  return command('requestRepair',input,ctx);
});
export const refreshFeedback = note.action({"description":"重试投递候选的待处理反馈。","visibility":"private",input:z.object({key:z.string()}),output:z.looseObject({checked:z.boolean()})}, async (ctx, input) => {
  return command('refreshFeedback',input,ctx);
});

/** A relation records the verified Desk handling state for one exact failed pass. */
export const recordFeedback = note.mutation({visibility:'public',"description":"核对候选失败轮次后保存原任务的修复处理状态。","receipt":"queryable",input:z.object({key:z.string(),surface:z.string(),runId:z.string(),reportId:z.string(),handling:z.string(),summary:z.string().optional(),delegationId:z.string().optional(),sessionId:z.string().optional()}),output:z.looseObject({stored:z.boolean(),key:z.string(),runId:z.string(),duplicate:z.boolean().optional()})}, async (ctx, input) => {
  if(!isNoteController(ctx.caller,ctx.note.id)&&!ctx.caller.skillCause?.chain.length)throw Error('需要所属便笺或已登记联动的操作授权');
  if(!input?.key?.trim()||!input.runId?.trim()||!input.reportId?.trim())throw Error('需要候选和失败轮次');
  const handling:{[key:string]:string}={coordinating:'coordinating',unreceived:'agent-unknown',superseded:'coordinating',queued:'agent',running:'agent',paused:'waiting-user','needs-input':'waiting-user',completed:'agent-done'};
  const nextHandling=handling[input.handling];
  if(!nextHandling)throw Error('未知反馈处理状态');
  const candidate = await ctx.db.get('candidates', input.key);
  const surface = candidate?.status?.[input.surface];
  if (!candidate || !surface?.failure || surface.pass !== input.runId)
    throw Error('候选失败轮次已变化，请重新核对');
  if (surface.failure.reportId !== input.reportId)
    return { stored: false, key: input.key, runId: input.runId };
  const withReceipt = (failure: SurfaceFailure): SurfaceFailure => ({
    ...failure, handling: nextHandling as SurfaceFailure['handling'],
    handlingNote: input.handling === 'queued' ? '原任务已接收修复请求，正在排队' : input.handling === 'running' ? '原任务正在处理修复' : input.summary?.trim().slice(0, 300) || failure.handlingNote,
    reportId: input.reportId,
    ...(input.sessionId ? { session: input.sessionId } : {}),
    ...(input.delegationId ? { delegationId: input.delegationId } : {}),
  });
  const updated = {...candidate, status: Object.fromEntries(Object.entries(candidate.status ?? {}).map(([name, entry]) => [name,
    entry.pass === input.runId && entry.phase === 'failed' && entry.failure ? {...entry, failure:withReceipt(entry.failure)} : entry,
  ]))};
  const acknowledged = input.handling !== 'unreceived' && (!['queued', 'running'].includes(input.handling) || Boolean(input.sessionId));
  const pending = acknowledged ? await ctx.db.get('outbox', input.reportId) : null;
  if (JSON.stringify(updated.status) === JSON.stringify(candidate.status) && !pending)
    return {stored:true,key:input.key,runId:input.runId,duplicate:true};
  await ctx.db.put('candidates', input.key, candidateDocument(updated));
  if (pending) await ctx.db.delete('outbox', input.reportId);
  if (input.handling === 'completed') await ctx.scheduler.runAfter(0, refresh, {});
  return { stored: true, key: input.key, runId: input.runId };
});

/** Rename one standalone candidate by key, or every candidate of one source task. Preview lifecycle is untouched. */
export const rename = note.action({visibility:'public',"description":"按原任务或候选 key 更新显示名称，不影响预览运行状态。","receipt":"queryable",input:renameInputSchema,output:z.looseObject({renamed:z.number()})}, (ctx, input) => renameCandidates(ctx, input));

async function renameCandidates(ctx: ActionContext, input: z.infer<typeof renameInputSchema>) {
  const title = input.title.trim();
  const key = input.key?.trim();
  const originNoteId = input.originNoteId?.trim();
  const delegationId = input.delegationId?.trim();
  if (!title || (!key && !(originNoteId && delegationId))) throw Error("预览命名需要候选 key 或来源任务，以及标题");
  return command('rename',{key,originNoteId,delegationId,title},ctx);
}

const pageInput = z.object({cursor:z.string().optional()});
const candidatePageSchema = z.object({items:z.array(candidateSchema),revision:z.string(),next:z.string().optional()});
const catalogFields = ['key','title','repos','cwd','revision','receivedAt','surfaces'] as const;
const feedbackFields = ['candidateKey','subject','summary','status','deliveryBlocked','title'] as const;
export const catalog = note.query({visibility:'public',description:'分页列出未归档预览的身份、代码版本和入口。',input:pageInput,
    output:note.collections.candidates.pageSchema(catalogFields)}, (ctx,input) => ctx.db.page('candidates', {...input,select:catalogFields}));

export const feedbackHistory = note.query({visibility:'public',description:'分页读取每次预览检查的完整原始结果。',input:pageInput,
    output:note.collections.feedbackHistory.pageSchema()}, (ctx,input) => ctx.db.page('feedbackHistory', {...input,orderBy:{observedAt:'desc'}}));

export const candidate = note.query({visibility:'public',description:'按稳定候选 key 读取配置、检查和运行结果。',objectRef:'/candidate/key',revision:'/revision',
    input:z.object({key:z.string().min(1)}),output:z.object({candidate:candidateSchema,revision:z.string()}).nullable()}, async(ctx,input) => {
      const row=await ctx.db.get('candidates',input.key); if(!row)return null;
      const {id:_id,view:_view,...candidate}=row;
      return {candidate,revision:sha256(JSON.stringify(candidate))};
    });

export const summary = note.query({visibility:'private',description:'读取看板标题和反馈状态。',input:z.object({}),output:z.object({title:z.string(),feedbackError:z.string().nullable()})}, async ctx => {
    const metadata=await ctx.db.get('metadata','root');return {title:metadata?.title??'',feedbackError:metadata?.feedbackError??null};
  });

export const candidates = note.query({visibility:'private',description:'分页读取候选列表摘要。',input:pageInput,output:candidatePageSchema}, async(ctx,input) => {
    let cursor=input.cursor;
    for(;;){
      const page=await ctx.db.page('candidates',{cursor,orderBy:{receivedAt:'desc'},select:['view']});
      const items=page.items.map(row=>row.view).filter(row=>!row.key.startsWith('studio-entry-'));
      if(items.length||!page.next)return {...page,items};
      cursor=page.next;
    }
  });

export const archivedCandidates = note.query({visibility:'private',description:'分页读取已归档候选摘要。',input:pageInput,output:candidatePageSchema}, async(ctx,input) => {
    const page=await ctx.db.page('archivedCandidates',{...input,orderBy:{receivedAt:'desc'},select:['view']});return {...page,items:page.items.map(row=>row.view)};
  });

export const candidateDetail = note.query({visibility:'private',description:'按稳定 key 读取候选摘要。',input:z.object({key:z.string()}),output:candidateSchema.nullable()}, async(ctx,input) => {
    if(!input.key)return null;return (await ctx.db.page('candidates',{where:{id:input.key},select:['view']})).items[0]?.view??null;
  });

export const outbox = note.query({visibility:'private',description:'分页读取待投递报告摘要。',input:pageInput,output:note.collections.outbox.pageSchema(feedbackFields)},
    (ctx,input)=>ctx.db.page('outbox',{...input,select:feedbackFields}));

export const report = note.query({visibility:'private',description:'打开候选后读取完整日志、核验和步骤。',input:z.object({key:z.string(),surface:z.string().optional()}),output:z.unknown()}, async(ctx,input)=>{
    const candidate=await ctx.db.get('candidates',input.key)??await ctx.db.get('archivedCandidates',input.key);
    if(!candidate)return null;
    const status=input.surface===undefined?Object.values(candidate.status??{}):[candidate.status?.[input.surface]];
    return status.filter(Boolean).map(entry=>({log:entry?.failure?.log??null,checks:entry?.verified?.checks??[],steps:entry?.steps??[]}));
  });

export const feedbackReport = note.query({visibility:'private',description:'打开一条完整反馈报告。',input:z.object({id:z.string()}),output:feedbackSchema.nullable()}, async(ctx,input)=>{
    const pending=await ctx.db.get('outbox',input.id);if(pending)return pending;
    return (await ctx.db.get('feedbackHistory',input.id))?.report??null;
  });

const gameEntry = z.object({kind:z.enum(['story','map','encounter']),resourceId:z.string().min(1),nodeId:z.string().optional()});
const installation=z.object({adapter:z.string().optional(),gameRoot:z.string().optional(),gameCommit:z.string().optional(),coverAsset:z.string().optional()});
export const gameInstallation=note.query({visibility:'private',description:'读取本机绑定的 CardGame 仓库与预览适配器。',output:installation},readInstallation);
async function readInstallation(ctx:import('@dsh-workbench/runtime').NoteQueryContext<typeof note>){
  const config=await ctx.config.read();
  if(!config.connections?.game)return installation.parse(config);
  const snapshot=await ctx.resources.read({name:'extension.game-project.index',connection:'game',input:{}});

  if(snapshot.error)throw Error(snapshot.error);
  return installation.parse(snapshot.data??{});
}
export const gameCover=note.query({visibility:'private',description:'读取已连接游戏的背景素材。',output:z.string().nullable()},async ctx=>{
  const {coverAsset}=await readInstallation(ctx);
  if(!coverAsset)return null;
  const snap=await ctx.resources.read<string|null>({name:'extension.game-project.asset',connection:'game',input:{id:coverAsset}});
  if(snap.error)throw Error(snap.error);
  return snap.data??null;
});
export const playGame=note.action({
  visibility:'public',description:'从绑定的真实 CardGame 仓库登记并运行一个完整提交，可指定剧情、秘境或战斗资源。无参数打开安装时的基线。',
  input:z.object({key:z.string().min(1).optional(),commit:z.string().regex(/^[0-9a-f]{40}$/).optional(),title:z.string().optional(),entry:gameEntry.optional(),originNoteId:z.string().optional(),delegationId:z.string().optional()}),
  output:z.looseObject({candidate:z.object({key:z.string()}),accepted:z.boolean()}),objectRef:'/candidate/key',receipt:'queryable',
},async(ctx,input)=>{
  const {adapter,gameRoot,gameCommit}=await ctx.runQuery(gameInstallation,{});
  const commit=input.commit||gameCommit;
  if(!adapter||!gameRoot||!commit)throw Error('请在桌面对话中连接游戏仓库。');
  const identity=input.entry?[commit,input.entry.kind,input.entry.resourceId,input.entry.nodeId||'']:null;
  const key=input.key||input.delegationId||(identity?'studio-entry-'+sha256(JSON.stringify(identity)).slice(0,40):'baseline-'+commit);
  if(!input.key&&!input.delegationId){
    const existing=await ctx.runQuery(candidate,{key});
    if(existing){
      if(!Object.values(existing.candidate.desired||{}).includes('running'))await command('start',{key},ctx);
      return {candidate:{key},accepted:true};
    }
  }
  return command('receive',{key,adapter,repos:{game:{repo:gameRoot,commit}},title:input.title||'CardGame · '+commit.slice(0,7),
    options:input.entry?{entry:input.entry}:{},...(input.originNoteId?{originNoteId:input.originNoteId}:{}),
    ...(input.delegationId?{delegationId:input.delegationId}:{}),start:true,embed:true},ctx);
});
