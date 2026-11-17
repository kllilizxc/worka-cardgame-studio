import { Input } from "@/components/ui/input";
import { useLocation as useRecordLocation, NoteDialog } from '@realiz3r/worka-react';
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { noteHref } from '@realiz3r/worka-runtime';
import { readTodoFilters, updateTodoFilter } from './route-state';
import { getLocale } from '@realiz3r/worka-runtime';
import { useMutation, useNote, useResource, useRouteSearch, QueryState } from '@realiz3r/worka-react';
import { Button } from '@/components/ui/button';
import { Toggle } from "@/components/ui/toggle";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TodoSourceLabel } from './source-label';
import { ui, categoryLabel } from './messages';
import type { TodoStatus } from './actions';
import { ALL_CATEGORIES, COLUMNS, SvgCheckMark, SvgSparkles } from './view-shared';
import type { TodoCardItem } from './task-dialog';
import { CreateTaskDialog } from './create-task-dialog';
import type { TodoListItem } from './list';
import { useUi } from '@realiz3r/worka-react';
import { useOptimisticMoves } from './use-optimistic-moves';
import { TodoTimeline } from './todo-timeline';
import { mobileLane as selectMobileLane } from './mobile-lane';
type RelatedBinding = {
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
const EMPTY_BINDINGS: RelatedBinding[] = [];
export default function TodoLayout() {
    const { actions, mutations, metadata, host: workbench, useQuery, usePagedQuery } = useNote<typeof import("./actions")>();
    const navigate = useNavigate();
    const location = useLocation();
    const { taskId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchInput = useRouteSearch();
    const { category: requestedCategory, search, archived: archivedView, view } = readTodoFilters(searchParams);
    const filterCategory = requestedCategory === '礼品' ? ALL_CATEGORIES : requestedCategory;
    const setFilterCategory = (value: string) => setSearchParams(updateTodoFilter(searchInput.flush(), 'category', value));
    const setSearch = searchInput.setValue;
    const setView = (value: string) => setSearchParams(updateTodoFilter(searchInput.flush(), 'view', value === 'board' ? '' : value));
    const setArchivedView = (value: boolean) => setSearchParams(updateTodoFilter(searchInput.flush(), 'archived', value ? '1' : ''));
    const categoryPage = usePagedQuery('categories', {});
    const filter = { category: filterCategory || undefined, search: search || undefined, archived: archivedView };
    const todoPage = usePagedQuery('itemPage', { ...filter, status: 'todo' });
    const doingPage = usePagedQuery('itemPage', { ...filter, status: 'in_progress' });
    const blockingPage = usePagedQuery('itemPage', { ...filter, status: 'blocking' });
    const donePage = usePagedQuery('itemPage', { ...filter, status: 'done' });
    const pages = { todo: todoPage, in_progress: doingPage, blocking: blockingPage, done: donePage };
    const summary = useQuery('summary', filter);
    useUi(ui);
    const openDetails = (item: TodoCardItem, edit = false) => navigate({
        pathname: noteHref(metadata.id, `/tasks/${encodeURIComponent(item.id)}${edit ? '/edit' : ''}`),
        search: searchInput.flush().toString() ? '?' + searchInput.params().toString() : '',
    });
    const [activeColumnInput, setActiveColumnInput] = useState<TodoStatus | null>(null);
    const compactCreate = searchParams.get('create') === 'todo';
    const createStatus = compactCreate ? 'todo' : activeColumnInput;
    const closeCreate = () => {
        setActiveColumnInput(null);
        if (compactCreate) {
            const next = new URLSearchParams(searchParams);
            next.delete('create');
            setSearchParams(next, { replace: true });
        }
    };
    const action = useMutation();
    const toggle = useMutation(mutations.toggleTodo, { query: summary, key: input => input.id });
    const remove = useMutation(mutations.removeTodo, { query: summary, key: input => input.id });
    const move = useMutation(mutations.moveTodo, { query: summary, key: input => input.id });
    const clear = useMutation(mutations.clearCompleted, { query: summary });
    const ai = useMutation(actions.generateSuggestions, { query: summary });
    const delegation = useMutation(actions.assignSession, { query: summary, key: input => input.itemId });
    const uncertainWrites = [...toggle.outcomes.filter(outcome => !outcome.pending && outcome.needsVerification).map(outcome => ({ key: 'toggle:' + outcome.key, retry: () => toggle.mutate(outcome.input) })), ...move.outcomes.filter(outcome => !outcome.pending && outcome.needsVerification).map(outcome => ({ key: 'move:' + outcome.key, retry: () => move.mutate(outcome.input) }))];
    const isAiLoading = ai.status === 'pending';
    const [toast, setToast] = useState<string | null>(null);
    const [delegatingItemId, setDelegatingItemId] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{
        lane: TodoStatus;
        index: number;
    } | null>(null);
    // This is a host-authorized UI projection, not another note's private state.
    const relatedObjects = useResource<RelatedBinding[]>('relatedObjects', {});
    const bindings = relatedObjects.data ?? EMPTY_BINDINGS;
    const tasksByItem = useMemo(() => {
        const result = new Map<string, Array<{
            noteId: string;
            taskId: string;
        }>>();
        for (const binding of bindings) {
            if (binding.kind !== 'delegation' || binding.source.noteId !== metadata.id)
                continue;
            const tasks = result.get(binding.source.objectId) ?? [];
            const next = { noteId: binding.target.noteId, taskId: binding.target.objectId };
            if (!tasks.some(task => task.noteId === next.noteId && task.taskId === next.taskId))
                tasks.push(next);
            result.set(binding.source.objectId, tasks);
        }
        return result;
    }, [bindings, metadata.id]);
    const authoritativeItems = [...todoPage.items, ...doingPage.items, ...blockingPage.items, ...donePage.items].map(item => {
        const taskId = tasksByItem.get(item.id)?.[0]?.taskId ?? item.taskId;
        return { ...item, taskId, hasDelegation: Boolean(taskId || item.hasDelegation) };
    });
    const optimistic = useOptimisticMoves(authoritativeItems, JSON.stringify([filter, ...Object.values(pages).map(page => page.pageIndex)]), summary.data);
    const items = optimistic.items;
    const activityItemIds = items.filter(item => !item.archived && (item.sessionCount ?? 0) > 0).map(item => item.id).sort();
    const sessionActivity = useQuery('sessionActivityPage', {itemIds:activityItemIds}, {enabled:view === 'board' && activityItemIds.length > 0});
    const runningItems = new Set(sessionActivity.data?.runningItemIds ?? []);
    const itemBusy = (id: string) => optimistic.busy(id) || [toggle.statusFor(id), move.statusFor(id)].some(status => status === 'pending' || status === 'unknown');
    const totalCount = summary.data?.total ?? 0, doneCount = optimistic.counts?.done ?? 0;
    const blockingCount = optimistic.counts?.blocking ?? 0;
    const progressRatio = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };
    const handleToggle = (id: string) => {
        const item = items.find(item => item.id === id);
        if (!item || itemBusy(id))
            return;
        const status = item.status === 'done' ? 'todo' : 'done';
        setMobileLane(status);
        return optimistic.run({ id, status }, () => toggle.mutate({ id }), () => Promise.all([pages[item.status].refresh(), pages[status].refresh()]).then(() => { }));
    };
    // ==========================================
    // 拖拽落位
    // 落点序号只描述当前页。提交稳定 beforeId/afterId，由后台在完整目标列中定位，
    // 筛选隐藏项和前后页不会改变真实排序含义。
    // ==========================================
    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, item: TodoListItem) => {
        if (itemBusy(item.id)) {
            event.preventDefault();
            return;
        }
        setDraggingId(item.id);
        setDropTarget(null);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.id);
    };
    const handleDragEnd = () => {
        setDraggingId(null);
        setDropTarget(null);
    };
    const handleLaneDragOver = (event: React.DragEvent<HTMLDivElement>, lane: TodoStatus) => {
        if (!draggingId)
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const list = event.currentTarget;
        const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-card-id]")).filter((node) => node.dataset.cardId !== draggingId);
        const y = event.clientY;
        let index = cards.length;
        for (let i = 0; i < cards.length; i += 1) {
            const rect = cards[i].getBoundingClientRect();
            if (y < rect.top + rect.height / 2) {
                index = i;
                break;
            }
        }
        setDropTarget((prev) => (prev && prev.lane === lane && prev.index === index ? prev : { lane, index }));
        // 贴着列上下沿时缓慢滚动，长列里不用松手也能拖到底
        const bounds = list.getBoundingClientRect();
        if (y < bounds.top + 26)
            list.scrollTop -= 8;
        else if (y > bounds.bottom - 26)
            list.scrollTop += 8;
    };
    const handleLaneDrop = async (event: React.DragEvent<HTMLDivElement>, lane: TodoStatus) => {
        event.preventDefault();
        const id = draggingId ?? event.dataTransfer.getData("text/plain");
        const target = dropTarget && dropTarget.lane === lane ? dropTarget : null;
        setDraggingId(null);
        setDropTarget(null);
        if (!id)
            return;
        const item = items.find((candidate) => candidate.id === id);
        if (!item || itemBusy(id))
            return;
        // 原地放下（同一列且落点没变）不发请求
        if (item.status === lane && target === null)
            return;
        const shownLane = visibleItems.filter(i => i.id !== id && i.status === lane);
        const anchor = target ? shownLane[target.index] : undefined;
        const last = shownLane[shownLane.length - 1];
        const input = { id, status: lane, ...(anchor ? { beforeId: anchor.id } : last ? { afterId: last.id } : {}) };
        setMobileLane(lane);
        const result = await optimistic.run(input, () => move.mutate(input), () => Promise.all([...new Set([item.status, lane])].map(status => pages[status].refresh())).then(() => { }));
        if (result)
            showToast(ui('已移到「{p0}」', { p0: COLUMNS.find(column => column.id === lane)?.title ?? lane }));
    };
    const handleClearDone = async () => {
        const result = await clear.mutate({});
        if (result)
            showToast(result.pending ? ui('已开始分批清理，其余完成项会继续移除。') : ui('已清理完成便签'));
    };
    const handleAiSuggest = async () => {
        const res = await ai.mutate({ prompt: ui('清晰高效的日常与项目待办') });
        if (res)
            showToast(ui('建议任务已提交，完成后会更新待办。'));
    };
    const handleDelegate = async (item: TodoListItem) => {
        if (delegation.status === 'pending')
            return;
        setDelegatingItemId(item.id);
        try {
            const result = await delegation.mutate({ itemId: item.id });
            if (result) {
                setMobileLane(result.status);
                showToast(ui('已分配对话并提交执行'));
                await action.run(() => workbench.openSession(result.sessionId));
            }
        }
        finally {
            setDelegatingItemId(null);
        }
    };
    const [chosenMobileLane, setMobileLane] = useState<TodoStatus | null>(null);
    const mobileLane = selectMobileLane(chosenMobileLane, optimistic.matched, items);
    const { recordId, requestId } = useRecordLocation();
    const locationQuery = useQuery('itemLocations', { id: recordId ?? '' }, { enabled: !!recordId });
    const [aliasChoice, setAliasChoice] = useState<string>();
    const [aliasDismissed, setAliasDismissed] = useState(false);
    useEffect(() => { setAliasChoice(undefined); setAliasDismissed(false); }, [recordId, requestId]);
    const locationChoices = locationQuery.data ?? [];
    const locationTarget = locationChoices.length === 1 ? locationChoices[0] : locationChoices.find(item => item.id === aliasChoice);
    const handledLocation = useRef<string | undefined>(undefined);
    const locationToken = JSON.stringify([recordId, requestId]);
    // Record targets resolve once to the same canonical page as a direct link.
    // A detail outside the loaded/filter-matching pages stays outside the list.
    const visibleItems = items;
    useEffect(() => {
        if (!recordId || handledLocation.current === locationToken || !locationQuery.data)
            return;
        if (!locationChoices.length) {
            handledLocation.current = locationToken;
            navigate({ pathname: noteHref(metadata.id), search: location.search }, { replace: true });
        }
        else if (locationTarget) {
            handledLocation.current = locationToken;
            setMobileLane(locationTarget.status);
            openDetails(locationTarget);
        }
    }, [locationToken, locationTarget?.id, locationQuery.data]);
    useEffect(() => {
        if (!taskId)
            return;
        const row = Array.from(document.querySelectorAll<HTMLElement>('[data-card-id]')).find(element => element.dataset.cardId === taskId);
        row?.scrollIntoView?.({ block: 'center' });
    }, [taskId]);
    const progress = <div className="folio-progress" role="progressbar" aria-label={ui("完成进度")} aria-valuenow={progressRatio} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progressRatio}%` }}/></div>;
    const openConversation = (item: TodoCardItem) => {
        if (item.primarySessionId && (item.sessionCount ?? 0) === 1)
            void action.run(() => workbench.openSession(item.primarySessionId!));
        else
            openDetails(item);
    };
    const renderCard = (item: TodoCardItem, index: number, lane: TodoStatus) => {
        const done = lane === "done";
        const laneOthers = visibleItems.filter(i => i.status === lane && i.id !== draggingId);
        const dropBefore = dropTarget?.lane === lane && laneOthers.findIndex(i => i.id === item.id) === dropTarget.index;
        return <div className={`folio-card ${done ? 'is-done' : ''} ${dropBefore ? 'drop-before' : ''}`} key={item.id} data-card-id={item.id} tabIndex={0} role="group" aria-label={ui('查看待办：{p0}', { p0: item.title })} onClick={event => {
                if (event.target instanceof Element && !event.target.closest('button,a,input,select,textarea,summary,[contenteditable="true"]'))
                    openDetails(item);
            }} onKeyDown={event => {
                if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    openDetails(item);
                }
            }} aria-current={taskId === item.id ? "true" : undefined} draggable={!itemBusy(item.id)} onDragStart={e => handleDragStart(e, item)} onDragEnd={handleDragEnd} style={{ opacity: draggingId === item.id ? .4 : 1, outline: taskId === item.id ? "2px solid var(--primary)" : undefined }}>
      <span className="folio-pin" aria-hidden="true"/>
      <div className="folio-card-top"><Toggle className="folio-check" disabled={itemBusy(item.id)} aria-label={`${done ? ui("重新打开") : ui("完成")}：${item.title}`} pressed={done} onPressedChange={() => void handleToggle(item.id)}><i aria-hidden="true">{done && <SvgCheckMark size={12}/>}</i></Toggle><Button className="folio-title-button" onClick={() => openDetails(item)} onDoubleClick={event => { event.stopPropagation(); openDetails(item, true); }} aria-label={ui('查看待办：{p0}', { p0: item.title })} variant="link"><h3>{item.title}</h3></Button>{!!item.sources?.length && <Button className="folio-title-source" onClick={() => openDetails(item)} aria-label={ui('查看来源：{p0}', { p0: item.sourceLabel || ui('来源') })} variant="link"><TodoSourceLabel item={item} iconsOnly/></Button>}</div>
      {(item.priority === 'high' || !!item.dueDate) && <div className="folio-card-context">{item.priority === 'high' && <span className="folio-urgent">{ui('紧急')}</span>}{item.dueDate && <time>{item.dueDate}</time>}</div>}
      <footer className="folio-card-footer"><span className={`folio-item-state ${lane}`}>{COLUMNS.find(column => column.id === lane)?.title}</span><div>{(item.sessionCount ?? 0) > 0 ? <Button size="sm" variant="ghost" className="folio-open-session" aria-label={ui(runningItems.has(item.id) ? '打开正在运行的对话：{p0}' : '打开对话：{p0}', { p0: item.title })} onClick={() => openConversation(item)}>{ui('对话')} {runningItems.has(item.id) ? <span role="status">{ui('运行中')}</span> : <span aria-hidden="true">↗</span>}</Button> : <Button size="sm" variant="ghost" className="folio-open-session" disabled={delegatingItemId !== null} onClick={() => void handleDelegate(item)}>{delegatingItemId === item.id ? ui('提交中…') : item.hasDelegation ? ui('继续交付 ↗') : ui('交办 ↗')}</Button>}</div></footer>
    </div>;
    };
    return <div><div className="folio ui-palette folio-expanded">
    <header className="folio-header">
      <div className="folio-heading"><span className="folio-pin" aria-hidden="true"/><span className="folio-kicker">{new Date().toLocaleDateString(getLocale(), { month: "long", day: "numeric", weekday: "short" })}</span><h1 title={metadata.name || ui("待办手帖")}>{metadata.name || ui("待办手帖")}<span className="folio-edition">{ui.rich("清单")}</span></h1><p>{archivedView ? ui('历史事项保留在这里') : <>{ui.rich("{p0} 项待处理", { p0: totalCount - doneCount })}<span>·</span>{ui.rich("{p0} 项已完成{p1}", { p0: doneCount, p1: blockingCount > 0 && <em> {ui.rich(" · {p0} 项阻塞", { p0: blockingCount })}</em> })}</>}</p></div>
      <div className="folio-tools" role="toolbar" aria-label={metadata.name || ui("待办手帖")}>{!archivedView && <div className="folio-meter">{progress}<span>{doneCount}/{totalCount}</span></div>}<Button variant="secondary" disabled={isAiLoading} onClick={() => void handleAiSuggest()}><SvgSparkles />{isAiLoading ? ui("规划中…") : ui("AI 拆解")}</Button><Button className="folio-main-action" variant="default" onClick={() => setActiveColumnInput('todo')}>{ui.rich("＋ 新任务")}</Button>{!archivedView && doneCount > 0 && <details className="folio-menu"><summary aria-label={ui("更多操作")}>···</summary><Button size="sm" variant="ghost" onClick={() => void handleClearDone()}>{ui.rich("清理已完成")}</Button></details>}</div>
    </header>
    <Outlet />
    {createStatus && <CreateTaskDialog status={createStatus} onClose={closeCreate} onCreated={() => showToast(ui('已添加任务'))}/>}
    {recordId && <QueryState query={locationQuery}>{targets => targets.length ? null : <p role="alert">目标待办不存在，可能已被删除。</p>}</QueryState>}
    {recordId && locationChoices.length > 1 && !aliasChoice && !aliasDismissed && <NoteDialog open label={ui('选择关联待办')} className="folio-detail ui-palette" onOpenChange={open => {
                if (!open)
                    setAliasDismissed(true);
            }}><header className="folio-detail-heading"><h2>{ui('选择关联待办')}</h2><Button aria-label={ui('关闭详情')} onClick={() => setAliasDismissed(true)} variant="ghost" size="icon">×</Button></header><div className="folio-detail-body">{locationChoices.map(item => <Button className="folio-title-button" key={item.id} onClick={() => { setAliasChoice(item.id); }} variant="link">{item.title}</Button>)}</div></NoteDialog>}
    {toast && <div className="folio-toast" role="status">{toast}</div>}
    {(action.error || toggle.error || remove.error || move.error || clear.error || ai.error || delegation.error) && <div role="alert">{(action.error ?? toggle.error ?? remove.error ?? move.error ?? clear.error ?? ai.error ?? delegation.error)?.message}</div>}
    <QueryState query={{ ...relatedObjects, refresh: relatedObjects.revalidate }}>{() => null}</QueryState>
    <QueryState query={summary}>{() => null}</QueryState>
    {activityItemIds.length > 0 && view === 'board' && <QueryState query={sessionActivity} empty={null}>{() => null}</QueryState>}
      <div className="folio-layout-switch" role="group" aria-label={ui('待办视图')}>
        <Button variant="ghost" aria-pressed={view === 'board'} onClick={() => setView('board')}>{ui('看板')}</Button>
        <Button variant="ghost" aria-pressed={view === 'timeline'} onClick={() => setView('timeline')}>{ui('排期')}</Button>
      </div>
      <div className="folio-index-row"><div className="folio-view-switch" role="group" aria-label={ui('事项范围')}><Toggle pressed={!archivedView} onPressedChange={() => setArchivedView(false)}>{ui('当前')}</Toggle><Toggle pressed={archivedView} onPressedChange={() => setArchivedView(true)}>{ui('归档')}</Toggle></div><div className="folio-category-filters">
        <div className="folio-index" role="group" aria-label={ui('按标签筛选待办')}><Toggle pressed={filterCategory === ALL_CATEGORIES} onPressedChange={() => setFilterCategory(ALL_CATEGORIES)}>{ui('全部')}</Toggle>{filterCategory !== ALL_CATEGORIES && !categoryPage.items.includes(filterCategory) && <Toggle pressed onPressedChange={() => setFilterCategory(filterCategory)}>{categoryLabel(filterCategory)}</Toggle>}<QueryState query={categoryPage}>{() => categoryPage.items.filter(cat => cat !== '礼品').map(cat => <Toggle key={cat} pressed={filterCategory === cat} onPressedChange={() => setFilterCategory(cat)}>{categoryLabel(cat)}</Toggle>)}</QueryState></div>
        {(categoryPage.hasPrevious || categoryPage.hasNext) && <div className="folio-category-pages"><Button size="sm" variant="ghost" aria-label={ui('上一页分类')} disabled={!categoryPage.hasPrevious || categoryPage.loading} onClick={categoryPage.previous}>{ui('上一页')}</Button><span>{ui('第 {p0} 页', { p0: categoryPage.pageIndex + 1 })}</span><Button size="sm" variant="ghost" aria-label={ui('下一页分类')} disabled={!categoryPage.hasNext || categoryPage.loading} onClick={categoryPage.next}>{ui('下一页')}</Button></div>}
      </div><div className="folio-search"><Input {...searchInput.inputProps} placeholder={ui("搜索任务…")} value={searchInput.value} aria-label={ui("搜索任务")} onChange={event => setSearch(event.target.value)} type="search"/><Button aria-label={ui("清空搜索")} type="button" variant="ghost" onClick={() => setSearch("")}>×</Button></div></div>
      {view === 'timeline' && <TodoTimeline filter={filter} onOpen={openDetails}/>}
      <div hidden={view !== 'board'} className="folio-board-view">
      <div className="folio-mobile-lanes" role="group" aria-label={ui("选择任务状态")}>{COLUMNS.map(col => <Toggle key={col.id} pressed={mobileLane === col.id} onPressedChange={() => setMobileLane(col.id)}>{col.title}{!archivedView && <span>{optimistic.matched?.[col.id] ?? '—'}</span>}</Toggle>)}</div>
      {(optimistic.error || toggle.error || move.error) && <div role="alert">{(optimistic.error ?? toggle.error ?? move.error)?.message}{uncertainWrites.map(write => <Button key={write.key} size="sm" variant="ghost" onClick={() => void write.retry()}>{ui("核对保存结果")}</Button>)}{optimistic.retryRefresh && <Button size="sm" variant="ghost" onClick={() => void optimistic.retryRefresh?.()}>{ui("重试刷新")}</Button>}</div>}
      <main className="folio-board" style={{ gridTemplateColumns: COLUMNS.map(() => "minmax(0, 1fr)").join(" ") }}>{COLUMNS.map((col) => {
            const laneItems = visibleItems.filter(i => i.status === col.id);
            const isDropLane = dropTarget?.lane === col.id;
            return <section key={col.id} className={`folio-lane ${mobileLane === col.id ? 'mobile-active' : ''} ${col.emphasized ? 'blocking-lane' : ''}`} aria-label={col.title}>
          <header className="folio-lane-heading"><div><h2>{col.title}</h2>{!archivedView && <span className="folio-count">{optimistic.matched?.[col.id] ?? '—'}</span>}</div><Button size="sm" variant="ghost" aria-label={ui("添加{p0}任务", { p0: col.title })} onClick={() => { setActiveColumnInput(col.id); }}>＋</Button></header>
          <div className={`folio-lane-body ${isDropLane ? 'drop-lane' : ''}`} onDragOver={e => handleLaneDragOver(e, col.id)} onDrop={e => void handleLaneDrop(e, col.id)}>
            <QueryState query={pages[col.id]}>{() => <>{laneItems.map((item, index) => renderCard(item, index, col.id))}</>}</QueryState>
            {(pages[col.id].hasPrevious || pages[col.id].hasNext) && <div className="folio-card-actions"><Button size="sm" variant="ghost" disabled={!pages[col.id].hasPrevious || pages[col.id].loading} onClick={pages[col.id].previous}>{ui('上一页')}</Button><span>{ui('第 {p0} 页', { p0: pages[col.id].pageIndex + 1 })}</span><Button size="sm" variant="ghost" disabled={!pages[col.id].hasNext || pages[col.id].loading} onClick={pages[col.id].next}>{ui('下一页')}</Button></div>}
            {isDropLane && dropTarget.index === laneItems.filter(i => i.id !== draggingId).length && <div className="folio-drop-end"/>}
            {!pages[col.id].loading && !pages[col.id].error && !laneItems.length && <div className="folio-empty"><span aria-hidden="true">{col.id === 'done' ? '✓' : '—'}</span><p>{search || filterCategory !== ALL_CATEGORIES ? (pages[col.id].hasNext ? ui("本页没有匹配任务，请继续下一页。") : ui("本页没有匹配任务。")) : col.id === 'blocking' ? ui("暂无阻塞") : col.id === 'done' ? ui("完成的事，收在这里") : ui("留给下一件事")}</p><Button size="sm" variant="ghost" onClick={() => { setActiveColumnInput(col.id); }}>{ui.rich("＋ 添加任务")}</Button></div>}
          </div>
        </section>;
        })}</main></div>
  </div></div>;
}
