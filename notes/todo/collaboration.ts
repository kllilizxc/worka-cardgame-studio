import { DEFAULT_CATEGORY } from './default-category';
import { validateAttachments, attachmentsSchema } from './attachment-schema';
import { taskOutcome, z, type TaskOutcomeSource } from '@realiz3r/worka-runtime';
import { note, delegateTodoInputSchema, editTodoInputSchema, feedbackInputSchema, importItemInputSchema,
  importItemResultSchema, importItemsInputSchema, moveTodoInputSchema, todoStatusSchema, todoItemSchema, delegationRequested } from './contracts';
import { getItem, business, saveItem, insertItem, importKey, between, type WriteContext } from './state';
import { todoRequirementFingerprint } from './list';
import type { TodoImage, TodoItem, TodoStatus } from './model';
import { sameProgress, unblockForProgress } from './progress';
import { appendProgress } from './progress-store';
import { announceChangeSessions } from './sessions';
export type { TodoData, TodoImage, TodoItem, TodoItemSource, TodoPriority, TodoStatus } from './model';
export { normalizeStatus } from './model';
export type DelegateTodoInput = z.infer<typeof delegateTodoInputSchema>;
const progressFeedbackInputSchema = feedbackInputSchema.extend({ summary: z.string().optional() });
export type FeedbackInput = z.infer<typeof progressFeedbackInputSchema>;
export type MoveTodoInput = z.infer<typeof moveTodoInputSchema>;
export function effectiveDelegatedStatus(task: TaskOutcomeSource): TodoStatus {
  return ['blocked', 'failed', 'unknown', 'needs-input'].includes(task.status) ? 'blocking' : taskOutcome(task).todoStatus;
}
export function todoItemPath(itemId: string): string { return `/items/${itemId.replaceAll('~','~0').replaceAll('/','~1')}`; }

export const moveTodo = note.mutation({ description: '将待办移动到目标状态列和列内位置。', input: moveTodoInputSchema,
  output: z.object({ id: z.string(), status: todoStatusSchema, index: z.number(), revision: z.string() }),
}, async (ctx, input) => {
  const moving = await getItem(ctx, input.id);
  if (input.beforeId && input.afterId) throw new Error('移动只能指定一个目标锚点');
  const anchor = input.beforeId ?? input.afterId;
  if (anchor) {
    const target = await getItem(ctx, anchor);
    if (target.status !== input.status || target.id === input.id) throw new Error('目标待办已移动，请重新读取后拖放');
  }
  let cursor: string | undefined, previous: string | undefined, next: string | undefined, index = 0, targetIndex: number | undefined;
  const requested = input.index === undefined ? Infinity : Math.max(0, Math.round(input.index));
  do {
    const page = await ctx.db.page('items', { where: { status: input.status }, orderBy: { position: 'asc' }, select: ['position'], cursor });
    for (const row of page.items) {
      if (row.id === input.id) continue;
      if (targetIndex !== undefined || input.beforeId === row.id || !anchor && index === requested) { next = row.position; targetIndex ??= index; break; }
      previous = row.position;
      index++;
      if (input.afterId === row.id) targetIndex = index;
    }
    if (next !== undefined) break;
    cursor = page.next;
  } while (cursor);
  const item = { ...business(moving), status: input.status, completed: input.status === 'done' };
  return { id: input.id, status: input.status, index: targetIndex ?? index, revision: await saveItem(ctx, item, input.id, between(previous, next)) };
});
function validateTodoImages(images: TodoImage[] | undefined): void {
  if (images === undefined) return;
  if (!Array.isArray(images) || images.length > 3) throw new Error("最多添加 3 张图片");
  let totalLength = 0;
  for (const image of images) {
    if (!image || typeof image.dataUrl !== "string" || !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(image.dataUrl)) throw new Error("图片附件格式无效");
    if (image.dataUrl.length > 600_000) throw new Error("图片压缩后仍然过大，请换一张图片");
    totalLength += image.dataUrl.length;
  }
  if (totalLength > 900_000) throw new Error("图片附件总大小过大，请减少图片数量或换小图");
}


export const commitEdit = note.mutation({ input: editTodoInputSchema.extend({ attachments: attachmentsSchema.optional() }), output: z.object({ itemId: z.string(), revision: z.string() }) }, async (ctx, input) => {
  const row = await getItem(ctx, input.itemId), item = business(row);
  if (todoRequirementFingerprint(item) !== input.baseFingerprint) throw new Error('该需求已被修改，请重新打开编辑');
  const next = { ...item, title: input.title.trim(), description: input.description.trim() };
  if (input.images.length) next.images = input.images; else delete next.images;
  if (input.attachments !== undefined) { if (input.attachments.length) next.attachments = input.attachments; else delete next.attachments; }
  if (input.priority !== undefined) next.priority = input.priority;
  for (const field of ['category', 'startDate', 'dueDate'] as const) if (input[field] !== undefined) {
    if (input[field].trim()) next[field] = input[field].trim(); else delete next[field];
  }
  await saveItem(ctx, next, item.id);
  return { itemId: item.id, revision: todoRequirementFingerprint(next) };
});
export const editTodo = note.action({ description: '保存待办需求草稿并拒绝覆盖并发修改。', input: editTodoInputSchema, output: z.object({ itemId: z.string(), revision: z.string() }) }, async (ctx, input) => {
  if (!input.title.trim()) throw new Error('需求标题不能为空');
  validateTodoImages(input.images);
  const attachments = input.attachments === undefined ? undefined : await validateAttachments(ctx, input.attachments);
  return ctx.runMutation(commitEdit, { ...input, attachments });
});
export const feedback = note.mutation({ description: '将结果和结论写回原待办，保留其他状态字段。', input: progressFeedbackInputSchema,
  output: z.object({ itemId: z.string(), status: todoStatusSchema, revision: z.string() }),
}, async (ctx, input) => {
  if (!input.conclusion.trim()) throw new Error('反馈需要 conclusion');
  const row = await getItem(ctx, input.itemId);
  if (input.expectedRevision && input.expectedRevision !== String(row.revision)) throw new Error('待办版本已变化，请重新读取');
  if (input.unblockAction && input.status !== 'blocking') throw Error('解除阻塞操作只能用于阻塞中的待办');
  const current=business(row), unblockAction=input.status==='blocking' ? unblockForProgress(current,input.unblockAction,ctx.note.id,String(row.revision)) : undefined;
  if (sameProgress(current, {status:input.status,conclusion:input.conclusion}) && JSON.stringify(current.unblockAction??null)===JSON.stringify(unblockAction??null)) return {itemId:row.id,status:row.status,revision:String(row.revision)};
  const {unblockAction:_oldAction,...withoutAction}=current;
  const item = { ...withoutAction, status: input.status, completed: input.status === 'done', conclusion: input.conclusion.trim(), ...(unblockAction?{unblockAction}:{}),
    delegatedAt: row.delegatedAt ?? new Date().toISOString(), delegatedRunStatus: 'completed' as const };
  const revision = await saveItem(ctx, item, item.id);
  await appendProgress(ctx, item, revision, 'feedback', {summary:input.summary,conclusion:input.conclusion});
  return { itemId: item.id, status: input.status, revision };
});
const createTodoInputSchema = importItemInputSchema.extend({ status: todoStatusSchema.optional() });
export function createTodoItem(
  input: z.infer<typeof createTodoInputSchema>,
  identity: { id: string; createdAt: string },
): z.infer<typeof todoItemSchema> {
  const status = input.status ?? "todo";
  return {
    id: identity.id,
    title: input.title.trim(),
    status,
    completed: status === "done",
    ...(input.workKind ? {workKind: input.workKind} : {}),
    priority: input.priority ?? "medium",
    category: input.category?.trim() || DEFAULT_CATEGORY,
    ...(input.dueDate ? { dueDate: input.dueDate } : {}),
    createdAt: identity.createdAt,
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
    ...(input.source ? { source: { ...input.source, importedAt: input.source.importedAt ?? identity.createdAt } } : {}),
  };
}

export type ImportItemInput = z.infer<typeof importItemInputSchema>;
export type ImportItemsInput = z.infer<typeof importItemsInputSchema>;
export type ImportItemResult = z.infer<typeof importItemResultSchema>;


/** Ordinary helper: shared transaction logic, never an exported operation invoked directly. */
export async function importInTransaction(ctx: WriteContext, input: ImportItemsInput) {
  const results: ImportItemResult[] = [];
  const delegations = new Map<string, { item: TodoItem; revision: string; results: ImportItemResult[] }>();
  for (const entry of input.items) {
    const title = entry.title.trim();
    if (!title) { results.push({ itemId: '', error: '导入项缺少标题' }); continue; }
    const key = importKey(entry), pointer = key ? await ctx.db.get('imports', key) : null;
    const existing = pointer ? await ctx.db.get('items', pointer.itemId) : null;
    let item: TodoItem, revision: string, result: ImportItemResult;
    if (existing) {
      item = business(existing); revision = String(existing.revision);
      const description = entry.description?.trim() ?? '';
      // An omitted deadline keeps the current one; an empty deadline from the source clears it.
      const dueDate = entry.dueDate === undefined ? item.dueDate : entry.dueDate.trim() || undefined;
      const promote = entry.workKind === 'change' && item.workKind !== 'change';
      const reannounce = promote && item.workKind === 'answer';
      if (input.mode !== 'upsert' || !promote && item.title === title && (item.description ?? '') === description && item.dueDate === dueDate) {
        results.push({ itemId: item.id, deduped: true }); continue;
      }
      const { dueDate: _previousDueDate, ...current } = item;
      item = { ...current, title, description, ...(dueDate ? { dueDate } : {}), ...(promote ? {workKind:'change' as const} : {}), sourceAutoUpdatedAt: new Date().toISOString() };
      revision = await saveItem(ctx, item, item.id);
      if (reannounce) await announceChangeSessions(ctx, item, revision);
      result = { itemId: item.id, updated: true };
    } else {
      const created=await insertItem(ctx,createTodoItem(entry,{id:'',createdAt:new Date().toISOString()}));
      item=created.item;revision=created.revision;result={itemId:item.id};
    }
    if (input.autoDelegate) {
      const pending = delegations.get(item.id);
      delegations.set(item.id, { item, revision, results: [...pending?.results ?? [], result] });
    }
    results.push(result);
  }
  // One durable event per changed item, carrying the final snapshot of this transaction.
  for (const { item, revision, results: delegated } of delegations.values()) {
    await delegationRequested.publish(ctx, { itemId: item.id, title: item.title, revision, item, goal: `处理待办：${item.title}`,
      scope: ['仅处理这一个待办', '保留可核对结论', '不要自动合并、发布或扩大范围'] }, { key: `${item.id}:${revision}:import-delegate`, exclusive: true });
    for (const result of delegated) result.delegation = { status: 'queued' };
  }
  return { results };
}
export const importItems = note.mutation({ description: '按来源身份去重或更新导入的待办，可请求自动交办。', input: importItemsInputSchema,
  output: z.object({ results: z.array(importItemResultSchema) }) }, importInTransaction);
