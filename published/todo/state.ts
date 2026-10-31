import { validateSchedule } from './schedule';
import { sha256 } from '@dsh-workbench/runtime';
import type { NoteMutationContext, NoteQueryContext } from '@dsh-workbench/runtime';
import { note, normalizeStatus, type TodoItem } from './model';
import { todoListItem } from './list';
import { changed } from './contracts';
export type { TodoData as NoteState } from './model';
export type ReadContext = NoteQueryContext<typeof note> | NoteMutationContext<typeof note>;
export type WriteContext = NoteMutationContext<typeof note>;
export const counts = () => ({ todo: 0, in_progress: 0, blocking: 0, done: 0 });
export const emptyStats = (name = '') => ({ total: 0, attachmentCount: 0, counts: counts(), revision: 0, name, firstPosition: undefined as string | undefined });
export const categoryKey = (name: string) => sha256(name);
export function importKey(item: Pick<TodoItem, 'title' | 'source'>): string | null {
  return item.source ? sha256(JSON.stringify({ kind: item.source.kind, itemId: item.source.itemId, task: item.source.taskKey ?? item.title.trim().toLocaleLowerCase() })) : null;
}
/** Fractional lexical ranks permit insertion without rewriting an entire lane. */
export function between(a = '', b?: string): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  if (b !== undefined && a >= b) throw new Error('Invalid task order');
  let prefix = '';
  for (let i = 0; i < 128; i++) {
    const low = i < a.length ? alphabet.indexOf(a[i]!) : 0;
    const high = b !== undefined && i < b.length ? alphabet.indexOf(b[i]!) : 61;
    if (low < 0 || high < 0) throw new Error('Invalid task position');
    if (high - low > 1) return prefix + alphabet[Math.floor((low + high) / 2)];
    prefix += alphabet[low];
    if (low < high) b = undefined;
  }
  throw new Error('Task order exceeds the supported precision');
}
export function business(row: NonNullable<Awaited<ReturnType<ReadContext['db']['get']>>>): TodoItem {
  const { view: _view, position: _position, revision: _revision, normalizedTitle: _title, active: _active, ...item } = row as any;
  return item;
}
export async function getItem(ctx: ReadContext, id: string) {
  const row = await ctx.db.get('items', id);
  if (!row) throw new Error('找不到待办条目');
  return row;
}
export async function saveItem(ctx: WriteContext, item: TodoItem | null, id: string, position?: string, publish = true) {
  const previous = id ? await ctx.db.get('items', id) : null;
  if (item && (item.startDate !== previous?.startDate || item.dueDate !== previous?.dueDate)) validateSchedule(item);
  const all = structuredClone(await ctx.db.get('totals', 'all') ?? emptyStats());
  if (!item && !previous) return String(all.revision);
  const projected=item?todoListItem(item):undefined;
  const {id:_projectedId,...projectedView}=projected??{};
  if (item && previous && [...new Set([...Object.keys(previous.view),...Object.keys(projectedView)])].every(key=>JSON.stringify((previous.view as any)[key])===JSON.stringify((projectedView as any)[key])) && JSON.stringify(business(previous ?? { id } as never)) === JSON.stringify(item) && (position === undefined || position === previous?.position)) return String(previous!.revision);
  // Real updates move to the front; explicit drag positions still take precedence.
  const nextPosition = position ?? (item ? between('', all.firstPosition) : previous!.position);
  const nextRevision = all.revision + 1;
  const adjust = (stats: Omit<ReturnType<typeof emptyStats>, 'firstPosition'> & { firstPosition?: string }, value: TodoItem, sign: number) => {
    if(value.archived)return;
    stats.total += sign; stats.counts[normalizeStatus(value)] += sign;
    stats.attachmentCount += sign * (value.attachments?.length ?? 0); stats.revision = nextRevision;
  };
  if (previous) adjust(all, business(previous), -1);
  if (item) adjust(all, item, 1);
  all.revision = nextRevision;
  if (!all.firstPosition || nextPosition < all.firstPosition) all.firstPosition = nextPosition;
  const { id: _allId, ...allValue } = all as typeof all & { id?: string };
  await ctx.db.put('totals', 'all', allValue);
  for (const category of new Set([previous?.category, item?.category].filter((value): value is string => typeof value === 'string' && !!value))) {
    const key = categoryKey(category);
    const stats = structuredClone(await ctx.db.get('categories', key) ?? emptyStats(category));
    if (previous?.category === category) adjust(stats, business(previous), -1);
    if (item?.category === category) adjust(stats, item, 1);
    const { id: _id, ...value } = stats as typeof stats & { id?: string };
    if (value.total) await ctx.db.put('categories', key, value); else await ctx.db.delete('categories', key);
  }
  const oldImport = previous ? importKey(business(previous)) : null, nextImport = item ? importKey(item) : null;
  if (oldImport && oldImport !== nextImport) await ctx.db.delete('imports', oldImport);
  if (item) {
    const { id: _id, ...value } = item;
    const { id: _viewId, ...view } = todoListItem(item);
    const record={ ...value, archived:item.archived??false, status: normalizeStatus(item), active: normalizeStatus(item) !== 'done', position: nextPosition,
      revision: nextRevision, normalizedTitle: item.title.trim().toLocaleLowerCase(), view };
    if(id)await ctx.db.put('items',id,record);else {id=await ctx.db.insert('items',record);item.id=id;}
  } else {
    await ctx.db.delete('items', id);
    for(const link of previous?.sessions??[])await ctx.db.delete('sessionIndex',JSON.stringify([link.taskId,id]));
  }
  if(nextImport)await ctx.db.put('imports',nextImport,{itemId:id});
  if(publish)await changed.publish(ctx, { itemId: id, title: item?.title ?? previous!.title, revision: String(nextRevision) }, { key: `${id}:${nextRevision}` });
  return String(nextRevision);
}

/** Let the transaction host allocate the entity ID; author mutation code stays deterministic. */
export async function insertItem(ctx:WriteContext,value:Omit<TodoItem,'id'>){const item={...value,id:''} as TodoItem;const revision=await saveItem(ctx,item,'');return {item,revision};}
