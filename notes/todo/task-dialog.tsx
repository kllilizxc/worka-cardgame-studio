import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useMatch, useNavigate, useOutletContext, useParams } from 'react-router';
import { noteHref } from '@dsh-workbench/runtime';
import { Button } from '@heroui/react/button';
import { NoteDialog, QueryState, useMutation, useNote } from '@dsh-workbench/react';
import type { TodoListItem, TodoDisplaySource } from './list';
import { COLUMNS, ImageAttachments, PRIORITY_CONFIG, SvgTrash } from './view-shared';
import { RequirementEditor } from './requirement-editor';
import { FileAttachments } from './file-attachments';
import { TodoProgressTimeline } from './progress-timeline';
import { RelatedRecords, LinkGroup } from './record-links';
import { ui } from './messages';
import { TodoSourceLabel } from './source-label';

export type TodoSession = { taskId: string; sessionId: string; title?: string; archived?: boolean; progress?: { summary?: string; updatedAt?: number } };
export type TodoSource = TodoDisplaySource;
export type TodoCardItem = TodoListItem & { primarySessionId?: string; sessionCount?: number; sourceLabel?: string };

function RequirementDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 140 || text.split(/\r?\n/).length > 4;
  return <div className="folio-detail-description"><p className={`folio-detail-copy ${long && !expanded ? 'folio-detail-description-preview' : ''}`}>{text}</p>{long && <Button className="folio-description-toggle" variant="tertiary" aria-expanded={expanded} onPress={() => setExpanded(value => !value)}>{expanded ? ui('收起要求') : ui('展开完整要求')}</Button>}</div>;
}

type TaskContext = { item: TodoCardItem; onNavigate(open: () => Promise<unknown>): void };

/** A stable dialog layout: switching details/edit/history only changes its Outlet. */
export function TaskLayout() {
  const { taskId = '' } = useParams();
  return <TaskDialog key={taskId} taskId={taskId} />;
}

function TaskDialog({ taskId }: { taskId: string }) {
  const { metadata, useQuery, mutations, actions, host } = useNote<typeof import('./actions')>();
  const location = useLocation();
  const navigate = useNavigate();
  const itemQuery = useQuery('item', { itemId: taskId });
  const item = itemQuery.data?.item;
  const remove = useMutation(mutations.removeTodo);
  const archive = useMutation(mutations.setArchived);
  const delegation = useMutation(actions.assignSession);
  const action = useMutation();
  const focusTarget = useRef<HTMLElement>(null);
  const editing = Boolean(useMatch('/notes/:noteId/tasks/:taskId/edit'));
  useEffect(() => { if (!editing) queueMicrotask(() => focusTarget.current?.focus({ preventScroll: true })); }, [taskId, location.key, editing]);
  const closePage = () => navigate({ pathname: noteHref(metadata.id), search: location.search });
  const detailPath = noteHref(metadata.id, `/tasks/${encodeURIComponent(taskId)}`);
  const openPage = (child: string) => navigate({ pathname: detailPath + child, search: location.search });
  const onNavigate = (open: () => Promise<unknown>) => { void action.run(open); };
  const delegating = delegation.status === 'pending';
  const busy = action.pending || remove.status === 'pending' || archive.status === 'pending' || delegating;
  const status = COLUMNS.find(column => column.id === item?.status);
  const tools = item ? [
    { label: delegating ? ui('提交中…') : item.hasDelegation ? ui('继续交付') : ui('交办'), kind: 'assign' as const, run: () => void action.run(async()=>{const result=await delegation.mutate({itemId:item.id});if(result)await host.openSession(result.sessionId);}) },
    { label: item.archived ? ui('恢复待办') : ui('归档待办'), kind: item.archived ? 'restore' as const : 'archive' as const, run: () => void action.run(async () => { if (await archive.mutate({ itemId: item.id, archived: !item.archived })) closePage(); }) },
  ] : [];
  return <NoteDialog open routeOwned label={ui('待办详情')} className="folio-detail ui-palette" onOpenChange={open => { if (!open) closePage(); }}>
    <span className="folio-detail-tape" aria-hidden="true" />
    <header ref={focusTarget} tabIndex={-1} className="folio-detail-heading"><div>{editing && <span className="folio-edit-mode">{ui('编辑待办')}</span>}{item && <span className={`folio-item-state ${item.status}`}>{status?.title}</span>}{item?.archived && <span className="folio-detail-muted">{ui('已归档')}</span>}</div><div className="folio-detail-toolbar" role="toolbar" aria-label={ui('待办详情')}>
      {!editing && tools.map(tool => <span title={tool.label} key={tool.kind}><Button isIconOnly variant="tertiary" aria-label={tool.label} isDisabled={busy} onPress={tool.run}>{<DetailIcon kind={tool.kind} />}</Button></span>)}
      <span title={ui('关闭详情')}><Button isIconOnly variant="tertiary" aria-label={ui('关闭详情')} onClick={event => event.currentTarget.closest('dialog')?.requestClose()}><DetailIcon kind="close" /></Button></span>
    </div></header>
    <div className="folio-detail-body">
      <QueryState query={itemQuery}>{data => data.item
        ? <Outlet context={{ item: data.item, onNavigate } satisfies TaskContext} />
        : <p role="alert">{ui('这项待办已被删除。')}</p>}</QueryState>
      {delegation.status === 'success' && delegation.data?.itemId === taskId && <p role="status">{ui('已交给连线协调，可在连线详情查看进展')}</p>}
      {(action.error || remove.error || archive.error || delegation.error) && <p role="alert">{(action.error ?? remove.error ?? archive.error ?? delegation.error)?.message}</p>}
    </div>
  </NoteDialog>;
}

export function TaskDetails() {
  const { item, onNavigate } = useOutletContext<TaskContext>();
  const { host, useQuery } = useNote<typeof import('./actions')>();
  const { search } = useLocation();
  const requirement = useQuery('requirement', { itemId: item.id });
  const execution = useQuery('executionDetails', { itemId: item.id });
  return <>
    <section className="folio-detail-section folio-detail-requirement">
      <div className="folio-detail-title-line"><h3>{item.title}</h3>{!!item.sources?.length && <TodoSourceLabel item={item} iconsOnly />}</div>
      {(item.category || item.priority || item.dueDate) && <div className="folio-detail-metadata">{item.category && <span>{item.category}</span>}{item.priority && <span>{PRIORITY_CONFIG[item.priority].label}</span>}{item.dueDate && <time>{item.dueDate}</time>}</div>}
      <QueryState query={requirement}>{data => data.item ? <>
        {data.item.description && <RequirementDescription text={data.item.description} />}
        {data.item.images.length > 0 && <ImageAttachments images={data.item.images} />}
        {data.item.attachments.length > 0 && <FileAttachments attachments={data.item.attachments} />}
      </> : <p role="alert">{ui('这项待办已被删除。')}</p>}</QueryState>
    </section>
    <QueryState query={execution}>{data => <section className="folio-detail-section folio-detail-context" aria-label={ui('来源与对话')}>
      <RelatedRecords recordId={item.id} sources={data.sources} originalSource={item.source?.url ? { label: ui('原始记录'), url: item.source.url } : undefined} onNavigate={onNavigate} className="folio-detail-links" />
      {data.sessions.length > 0 && <LinkGroup label={ui('对话')} icon={null} links={data.sessions.map((session: TodoSession, index: number) => ({ key: session.taskId, label: `${session.title && session.title !== item.title ? session.title : data.sessions.length > 1 ? ui('对话 {p0}', {p0:index + 1}) : ui('打开对话')}${session.archived ? ` · ${ui('已归档')}` : ''}`, onOpen: () => host.openSession(session.sessionId) }))} />}
    </section>}</QueryState>
    <TodoProgressTimeline itemId={item.id} />
    <Link to={{ pathname: 'history', search }}>{ui('查看历史')}</Link>
  </>;
}

export function TaskEditor() {
  const { item } = useOutletContext<TaskContext>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const closeEditor = useCallback(() => { void navigate({ pathname: '..', search }, { relative: 'route' }); }, [navigate, search]);
  return <section className="folio-detail-section"><RequirementEditor item={item} onClose={closeEditor} /></section>;
}

export function TaskHistory() {
  const { item } = useOutletContext<TaskContext>();
  const { search } = useLocation();
  return <><Link to={{ pathname: '..', search }} relative="route">{ui('返回详情')}</Link><h3>{item.title}</h3><TodoProgressTimeline itemId={item.id} /></>;
}

function DetailIcon({ kind }: { kind: 'edit' | 'assign' | 'archive' | 'restore' | 'close' }) {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind === 'edit' ? <><path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m14 5 5 5"/></> : kind === 'assign' ? <><path d="m21 3-7 18-4-7-7-4Z"/><path d="m10 14 6-6"/></> : kind === 'archive' ? <><path d="M4 8h16v13H4zM3 3h18v5H3zM10 12h4"/></> : kind === 'restore' ? <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/></> : <path d="m6 6 12 12M6 18 18 6"/>}</svg>;
}
