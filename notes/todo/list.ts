import { z } from '@dsh-workbench/runtime';
import { sha256 } from '@dsh-workbench/runtime';
import { displaySourceSchema, normalizeStatus, todoImageSchema, type TodoItem } from './model';
import type { NoteQueryContext } from '@dsh-workbench/runtime';
import type { note } from './model';
import { attachmentsSchema } from './attachment-schema';

/** A list never inherits arbitrary integration payloads or attachment bytes. */
export const todoListItemSchema = z.object({
  id: z.string(), title: z.string(), status: z.enum(['todo', 'in_progress', 'blocking', 'done']),
  priority: z.enum(['low', 'medium', 'high']).optional(), category: z.string().optional(), startDate: z.string().optional(), dueDate: z.string().optional(),
  description: z.string().optional(), conclusion: z.string().optional(), imageCount: z.number(), attachmentCount: z.number(),
  source: z.object({ label: z.string(), url: z.string().optional() }).optional(),
  sources: z.array(displaySourceSchema).optional(),
  archived: z.boolean().optional(), sourceAutoUpdatedAt: z.string().optional(), taskId: z.string().optional(), primarySessionId: z.string().optional(), sessionCount: z.number().optional(), sourceLabel: z.string().optional(), hasDelegation: z.boolean(),
});
export type TodoListItem = z.infer<typeof todoListItemSchema>;
export type TodoDisplaySource = z.infer<typeof displaySourceSchema>;
type SourceItem = Pick<TodoItem, 'source' | 'taskSources'>;
type SourceContext = Pick<NoteQueryContext<typeof note>, 'note' | 'notes'>;
function messageSource(source: NonNullable<TodoItem['source']>) {
  return { label: source.label || source.title || ({ slack: 'Slack', wechat: '微信' }[source.kind] ?? '来源'), url: source.url };
}
/** Object identity, rather than an integration label, decides which icon to show. */
function sourceReferences(item: SourceItem, ownNoteId: string): TodoDisplaySource[] {
  const sources: TodoDisplaySource[] = (item.taskSources ?? []).filter(source => source.noteId !== ownNoteId);
  if (item.source?.noteId && item.source.noteId !== ownNoteId && !sources.some(source => source.noteId === item.source!.noteId)) {
    sources.push({ kind: 'note', key: 'note:' + item.source.noteId, noteId: item.source.noteId, itemId: item.source.itemId, name: item.source.label || item.source.title });
  }
  // A historical message may have no source note identity. Keep its original
  // provenance, without guessing a note or an integration-specific icon.
  if (!sources.length && item.source && item.source.noteId !== ownNoteId) {
    const message = messageSource(item.source);
    sources.push({ kind: 'unknown', key: 'message:' + item.source.kind + ':' + item.source.itemId, name: message.label, ...(message.url ? { url: message.url } : {}) });
  }
  return sources;
}
export async function resolveTodoSources(ctx: SourceContext, items: readonly SourceItem[]) {
  const references = items.map(item => sourceReferences(item, ctx.note.id));
  const ids = [...new Set(references.flatMap(sources => sources.flatMap(source => source.noteId ? [source.noteId] : [])))];
  const metadata = new Map((await Promise.all(ids.map(id => ctx.notes.lookup({ id })))).flat().map(source => [source.id, source]));
  return references.map(sources => sources.map(source => {
    const current = source.noteId ? metadata.get(source.noteId) : undefined;
    return { ...source, ...(current ? { name: current.name, ...(current.icon ? { icon: current.icon } : {}) } : {}) };
  }));
}
/** Both normal pages and location lookups resolve current source metadata. */
export async function projectTodoRows(ctx: SourceContext, rows: readonly (SourceItem & { id: string; view: Omit<TodoListItem, 'id'> })[]) {
  const sources = await resolveTodoSources(ctx, rows);
  return rows.map((row, index) => ({
    id: row.id, ...row.view,
    source: row.source?.noteId === ctx.note.id ? undefined : row.view.source,
    sources: sources[index],
    sourceLabel: [...new Set(sources[index]!.map(source => source.name).filter(Boolean))].join(' · ') || (row.source?.noteId === ctx.note.id ? undefined : row.view.source?.label),
  }));
}
const preview = (value: string | undefined, length: number) => value && value.length > length ? value.slice(0, length) + '…' : value;
export function todoListItem(item: TodoItem): TodoListItem {
  return {
    id: item.id, archived: item.archived ?? false, title: item.title, status: normalizeStatus(item), priority: item.priority, category: item.category, startDate: item.startDate, dueDate: item.dueDate,
    description: preview(item.description, 300), conclusion: preview(item.conclusion, 240), imageCount: item.images?.length ?? 0,
    attachmentCount: item.attachments?.length ?? 0,
    source: item.source ? messageSource(item.source) : undefined,
    sourceAutoUpdatedAt: item.sourceAutoUpdatedAt, taskId: item.taskId,
    primarySessionId: item.sessions?.find(link=>!link.archived)?.sessionId ?? item.sessions?.[0]?.sessionId, sessionCount: item.sessions?.length ?? 0, sourceLabel: item.taskSources?.map(source=>source.name).filter(Boolean).join(' · ') || undefined,
    hasDelegation: Boolean(item.sessions?.length || item.taskId || item.delegation || item.deliveryIntent || item.delegatedAt || item.delegatedRunStatus),
  };
}
export const todoFilterSchema = z.object({ category: z.string().optional(), search: z.string().optional() });
export type TodoFilter = z.infer<typeof todoFilterSchema>;
export function matchesTodo(item: TodoItem, filter: TodoFilter) {
  return (!filter.category || item.category === filter.category) && (!filter.search || item.title.toLocaleLowerCase().includes(filter.search.toLocaleLowerCase()));
}
export const requirementSchema = z.object({ title: z.string(), description: z.string(), images: z.array(todoImageSchema), attachments: attachmentsSchema,
  priority: z.enum(['low', 'medium', 'high']).optional(), category: z.string().optional(), startDate: z.string().optional(), dueDate: z.string().optional(),
});
export const todoRequirement = (item: TodoItem) => ({ title: item.title, description: item.description ?? '', images: item.images ?? [], attachments: item.attachments ?? [],
  priority: item.priority, category: item.category, startDate: item.startDate, dueDate: item.dueDate,
});
/** CAS covers exactly editable requirement fields, independent of status/order edits. */
export const todoRequirementFingerprint = (item: Pick<TodoItem, 'title' | 'description' | 'images' | 'attachments' | 'priority' | 'category' | 'startDate' | 'dueDate'>) => sha256(JSON.stringify([item.title, item.description ?? '', (item.images ?? []).map(image => [image.id, image.dataUrl, image.name ?? null, image.type ?? null, image.width ?? null, image.height ?? null]),
    item.attachments ?? [], item.priority ?? null, item.category ?? null, item.dueDate ?? null, ...(item.startDate === undefined ? [] : [item.startDate])]));
