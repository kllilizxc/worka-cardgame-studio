import {candidateSchema,receiveInputSchema,renameInputSchema} from './schemas';
import {z,sha256} from '@realiz3r/worka-runtime';
import { note } from './model';
import {candidateDocument} from './document';
export { note } from './model';
import type {NoteActionContext} from '@realiz3r/worka-runtime';
type ActionContext = NoteActionContext<typeof note>;
export type {CandidateInput,CandidateSpec,SurfaceStatus,SurfacePhase,SurfaceStep,SurfaceFailure,Data} from './model';

export const changed = note.event({visibility:'public',name:'candidates.changed',description:"候选登记、来源、标题、运行意图或移除发生变化；检查结果与日志由运行器记录。",payload:z.object({key:z.string(),title:z.string(),revision:z.string(),removed:z.boolean()}),objectRef:'/key',objectLabel:'/title',revision:'/revision'});


async function command(name:string,input:unknown,ctx:ActionContext){
  if(!ctx.host.previews.command)throw Error('请更新宿主以启用持久预览运行器');
  return ctx.host.previews.command(name,input as any);
}
export const receive = note.action({visibility:'public',"description":"接收或更新同一 key 的执行候选；接收不代表启动或验收通过。","objectRef":"/candidate/key","receipt":"queryable",input:receiveInputSchema,output:z.union([z.looseObject({renamed:z.number()}),z.looseObject({candidate:z.object({key:z.string()}),accepted:z.boolean(),startRequested:z.boolean(),started:z.literal(false)}),z.looseObject({accepted:z.boolean(),key:z.string(),desired:z.enum(['running','stopped'])})])}, async (ctx, input) => {
  if (input?.operation === 'rename') return renameCandidates(ctx, input);
  const hasOwner = Boolean(input?.originNoteId?.trim() && input?.delegationId?.trim());
  if (!hasOwner) {
    const existing = input?.key ? (await ctx.runQuery(candidate, { key: input.key }))?.candidate : null;
    if (!existing?.originNoteId || !existing?.delegationId) {
      throw Error('试玩候选必须关联「制作待办」事项：请先在「制作待办」创建并绑定本会话的事项（addTodo + linkSession + recordProgress），再传入 originNoteId 与 delegationId（key 使用该 itemId）登记试玩。');
    }
  }
  return command('receive',input,ctx);
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
export const catalog = note.query({visibility:'public',description:'分页列出未归档预览的身份、代码版本和入口。',input:pageInput,
    output:note.collections.candidates.pageSchema(catalogFields)}, (ctx,input) => ctx.db.page('candidates', {...input,select:catalogFields}));

export const candidate = note.query({visibility:'public',description:'按稳定候选 key 读取配置、检查和运行结果。',objectRef:'/candidate/key',revision:'/revision',
    input:z.object({key:z.string().min(1)}),output:z.object({candidate:candidateSchema,revision:z.string()}).nullable()}, async(ctx,input) => {
      const row=await ctx.db.get('candidates',input.key); if(!row)return null;
      const {id:_id,view:_view,...candidate}=row;
      return {candidate,revision:sha256(JSON.stringify(candidate))};
    });

export const summary = note.query({visibility:'private',description:'读取看板标题。',input:z.object({}),output:z.object({title:z.string()})}, async ctx => {
    const metadata=await ctx.db.get('metadata','root');return {title:metadata?.title??''};
  });

export const candidates = note.query({visibility:'private',description:'分页读取候选列表摘要。',input:pageInput,output:candidatePageSchema}, async(ctx,input) => {
    const page=await ctx.db.page('candidates',{...input,orderBy:{receivedAt:'desc'},select:['view']});return {...page,items:page.items.map(row=>row.view)};
  });

export const archivedCandidates = note.query({visibility:'private',description:'分页读取已归档候选摘要。',input:pageInput,output:candidatePageSchema}, async(ctx,input) => {
    const page=await ctx.db.page('archivedCandidates',{...input,orderBy:{receivedAt:'desc'},select:['view']});return {...page,items:page.items.map(row=>row.view)};
  });

export const candidateDetail = note.query({visibility:'private',description:'按稳定 key 读取候选摘要。',input:z.object({key:z.string()}),output:candidateSchema.nullable()}, async(ctx,input) => {
    if(!input.key)return null;return (await ctx.db.page('candidates',{where:{id:input.key},select:['view']})).items[0]?.view??null;
  });

export const report = note.query({visibility:'private',description:'打开候选后读取完整日志、核验和步骤。',input:z.object({key:z.string(),surface:z.string().optional()}),output:z.unknown()}, async(ctx,input)=>{
    const candidate=await ctx.db.get('candidates',input.key)??await ctx.db.get('archivedCandidates',input.key);
    if(!candidate)return null;
    const status=input.surface===undefined?Object.values(candidate.status??{}):[candidate.status?.[input.surface]];
    return status.filter(Boolean).map(entry=>({log:entry?.failure?.log??null,checks:entry?.verified?.checks??[],steps:entry?.steps??[]}));
  });
