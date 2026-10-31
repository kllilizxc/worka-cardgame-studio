import { Button } from '@heroui/react/button';
import { QueryState, useMutation, useNote } from '@dsh-workbench/react';
import { getLocale } from '@dsh-workbench/runtime';
import { COLUMNS } from './view-shared';
import { ui } from './messages';

/** Every node is a recorded fact; missing historical dates stay absent. */
export function TodoProgressTimeline({ itemId }: { itemId: string }) {
  const { usePagedQuery, host } = useNote<typeof import('./actions')>();
  const page = usePagedQuery('progressTimeline', { itemId });
  const copy = useMutation();
  const date = new Intl.DateTimeFormat(getLocale(), { timeZone: 'Asia/Shanghai', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return <QueryState query={page} empty={null}>{() => page.items.length > 0 && <section className="folio-detail-section folio-progress-section">
    <h4>{ui('进展')}</h4>
    <ol className="folio-timeline">{page.items.map(entry => <li key={entry.id}>
      <div className="folio-timeline-meta">
        {entry.status && <span className={`folio-item-state ${entry.status}`}>{COLUMNS.find(column => column.id === entry.status)?.title}</span>}
        {entry.recordedAt !== undefined && <time dateTime={new Date(entry.recordedAt).toISOString()}>{date.format(entry.recordedAt)}</time>}
        {entry.conclusion && entry.conclusion !== entry.summary && <span className="folio-progress-copy" title={ui('复制进展原文')}><Button isIconOnly variant="tertiary" aria-label={ui('复制进展原文')} isDisabled={copy.pending} onPress={() => void copy.run(() => host.copyText(entry.conclusion!))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></Button></span>}
      </div>
      <p>{entry.summary}</p>
    </li>)}</ol>
    {(page.hasPrevious || page.hasNext) && <nav className="folio-progress-pages" aria-label={ui('进展')}><Button variant="tertiary" isDisabled={!page.hasPrevious || page.loading} onPress={page.previous}>{ui('较新进展')}</Button><Button variant="tertiary" isDisabled={!page.hasNext || page.loading} onPress={page.next}>{ui('更早进展')}</Button></nav>}
    {copy.error && <p role="alert">{copy.error.message}</p>}
  </section>}</QueryState>;
}
