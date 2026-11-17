import { QueryState, composeQueries, useMutation, useNote, useResource, useUi } from '@realiz3r/worka-react';
import { noteHref } from '@realiz3r/worka-runtime';
import { Button } from '@/components/ui/button';
import React from 'react';
import type { TodoCardItem } from './task-dialog';
import { ui } from './messages';
import { TodoSourceLabel } from './source-label';
type Binding = {
    kind: string;
    source: {
        noteId: string;
        objectId: string;
    };
    target: {
        noteId: string;
        objectId: string;
    };
};
export default function Compact() {
    useUi(ui);
    const { useQuery, usePagedQuery, metadata, host, navigation } = useNote<typeof import('./actions')>();
    const page = usePagedQuery('itemPage', { active: true });
    const summary = useQuery('summary', {});
    const query = composeQueries({ page, summary });
    const related = useResource<Binding[]>('relatedObjects', {});
    const action = useMutation();
    const items = page.items;
    const total = summary.data?.total ?? 0, done = summary.data?.counts.done ?? 0;
    const blocking = summary.data?.counts.blocking ?? 0;
    const attachmentCount = summary.data?.attachmentCount ?? 0;
    const progress = total ? Math.round(done / total * 100) : 0;
    const error = action.error;
    const openConversation = (item: TodoCardItem) => void action.run(() => item.primarySessionId && item.sessionCount === 1 ? host.openSession(item.primarySessionId) : navigation.open({ href: noteHref(metadata.id, `/tasks/${encodeURIComponent(item.id)}`) }));
    return <div className="folio-cutout" onClick={event => { if (event.target === event.currentTarget)
        event.stopPropagation(); }}><div className={`folio ui-palette folio-compact${error ? ' has-quick-feedback' : ''}`}>
    <span className="folio-pin" aria-hidden="true"/>
    <header className="folio-header">
      <div className="folio-heading"><h1 title={metadata.name || ui('待办手帖')}>{metadata.name || ui('待办手帖')}</h1><p className="folio-mini-summary">{ui.rich('{p0} 项待处理', { p0: total - done })}{blocking > 0 && <em>{ui.rich(' · {p0} 项阻塞', { p0: blocking })}</em>}</p></div>
      {total > 0 && <span className="folio-percent" title={`${done}/${total}`} aria-label={ui('完成进度')}>{progress}<small>%</small></span>}
    </header>
    <div className="folio-progress" role="progressbar" aria-label={ui('完成进度')} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }}/></div>
    <QueryState query={{ ...related, refresh: related.revalidate }}>{() => null}</QueryState>
    <QueryState query={query}>{() => <div className="folio-mini-list">{items.filter(item => item.status !== 'done').slice(0, 3).map(item => <div className="folio-mini-row" key={item.id} role="group" tabIndex={0} aria-label={ui('查看待办：{p0}', { p0: item.title })} onClick={event => { if (event.target instanceof Element && !event.target.closest('button,a,input,select,textarea,summary'))
                void action.run(() => navigation.open({ href: noteHref(metadata.id, `/tasks/${encodeURIComponent(item.id)}`) })); }} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                void action.run(() => navigation.open({ href: noteHref(metadata.id, `/tasks/${encodeURIComponent(item.id)}`) }));
            } }}>
      <span className="folio-mini-content"><span className="folio-mini-title-line"><span className="folio-mini-title" title={item.title}>{item.title}</span>{!!item.sources?.length && <span className="folio-mini-source"><TodoSourceLabel item={item} iconsOnly/></span>}</span>{item.status === 'blocking' && <em className="folio-mini-blocked">{ui.rich('阻塞')}</em>}</span>
      {((item as TodoCardItem).sessionCount ?? 0) > 0 && <Button variant="ghost" size="sm" className="folio-mini-session" aria-label={ui('打开对话：{p0}', { p0: item.title })} onClick={() => openConversation(item as TodoCardItem)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 1V11.5a8.5 8.5 0 1 1 18 0Z"/><path d="M8 10h8M8 14h5"/></svg></Button>}
    </div>)}{total === done && <p className="folio-empty-copy">{total ? ui('手边的事，都完成了。') : ui('从一件小事开始。')}</p>}</div>}</QueryState>
    <div className="folio-quick"><Button variant="secondary" size="sm" onClick={() => void action.run(() => navigation.open({ href: noteHref(metadata.id, '/?create=todo') }))}>{ui.rich('添加任务')}</Button></div>
    {error && <div className="folio-compact-feedback" role="alert">{error.message}</div>}
    <footer className="folio-mini-footer"><span>{total ? ui('{p0} 项记录', { p0: total }) : ui('还没有记录')}{attachmentCount > 0 && <span title={ui('{p0} 个附件', { p0: attachmentCount })}> · <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 11-8 8a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8L15 6"/></svg><span aria-label={ui('{p0} 个附件', { p0: attachmentCount })}>{attachmentCount}</span></span>}</span><Button variant="ghost" size="sm" onClick={() => void action.run(() => host.openNote(metadata.id))}>{ui.rich('打开手帖 ↗')}</Button></footer>
  </div></div>;
}
