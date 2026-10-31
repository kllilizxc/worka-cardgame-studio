import type { WriteContext } from './state';
import type { TodoItem } from './model';
import { normalizeStatus } from './model';
import { sha256 } from '@dsh-workbench/runtime';
import { progressTextIdentity, shortProgressText } from './progress';

/** Called inside the same native mutation as saveItem; a failed append rolls both back. */
export async function appendProgress(ctx: WriteContext, item: TodoItem, revision: string,
  source: 'recordProgress' | 'feedback', input: { summary?: string; conclusion?: string }) {
  const status=normalizeStatus(item),conclusion=input.conclusion?.trim();
  const label={todo:'待办',in_progress:'进行中',blocking:'受阻',done:'完成'}[status];
  await ctx.db.put('progressEntries', `progress:${item.id}:${revision}`, {
    itemId: item.id, status, summary: shortProgressText(input.summary?.trim() || conclusion || `状态改为${label}`),
    ...(conclusion ? { conclusion,conclusionKey:sha256(progressTextIdentity(conclusion)) } : {}), recordedAt: Date.now(), revision, source,
  });
}
