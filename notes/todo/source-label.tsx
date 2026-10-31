import { NoteIcon } from '@dsh-workbench/react';
import type { TodoListItem } from './list';
import { ui } from './messages';

/** The page query supplies identities and current metadata; cards do no lookup. */
export function TodoSourceLabel({ item, iconsOnly = false }: { item: Pick<TodoListItem, 'sources'>; iconsOnly?: boolean }) {
  const sources = [...new Map((item.sources ?? []).map(source => [source.noteId ?? source.key, source])).values()];
  if (!sources.length) return null;
  const names = sources.map(source => source.name || ui('来源')).join(' · ');
  return <span title={names} role={iconsOnly ? 'img' : undefined} aria-label={iconsOnly ? names : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: '100%', overflow: 'hidden', verticalAlign: 'middle' }}>
    {sources.map(source => <span key={source.noteId ?? source.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
      <NoteIcon icon={source.icon} size={14} />
      {!iconsOnly && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.name || ui('来源')}</span>}
    </span>)}
  </span>;
}
