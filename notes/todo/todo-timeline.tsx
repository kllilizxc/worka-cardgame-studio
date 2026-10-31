import React, { useMemo } from 'react';
import { Button } from '@heroui/react/button';
import { Link } from '@heroui/react/link';
import { ToggleButton } from '@heroui/react/toggle-button';
import { QueryState, useNote } from '@dsh-workbench/react';
import { getLocale } from '@dsh-workbench/runtime';
import { useSearchParams } from 'react-router';
import type { TodoListItem } from './list';
import { ui } from './messages';
import { COLUMNS } from './view-shared';
import { scheduleDay, schedulePlacement, scheduleWindow, shiftScheduleMonth } from './schedule';
import { updateTodoFilter } from './route-state';

export function TodoTimeline({ filter, onOpen }: { filter: { category?: string; search?: string; archived?: boolean }; onOpen: (item: TodoListItem, edit?: boolean) => void }) {
  const [params, setParams] = useSearchParams();
  const incomplete = params.get('timelineStatus') !== 'all';
  const page = useNote<typeof import('./actions')>().usePagedQuery('itemPage', { ...filter, active: incomplete || undefined });
  const window = scheduleWindow(params.get('month') ?? '');
  const today = new Date(), todayDay = scheduleDay(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)!;
  const changeMonth = (key: string) => setParams(updateTodoFilter(params, 'month', key));
  const groups = useMemo(() => {
    const grouped = new Map<string, TodoListItem[]>();
    for (const item of page.items) {
      const key = item.category || ui('待办');
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
    return [...grouped];
  }, [page.items]);
  const dateLabel = (date: string) => new Date(date + 'T00:00:00').toLocaleDateString(getLocale(), { month: 'short', day: 'numeric' });
  const ticks = Array.from({ length: window.days }, (_, i) => window.start + i).filter(day => new Date(day * 86400000).getUTCDay() === 1);
  return <section className="folio-timeline" aria-label={ui('任务排期')}>
    <header className="folio-timeline-tools">
      <div className="folio-timeline-month"><Button className="folio-timeline-nav" isIconOnly variant="ghost" aria-label={ui('上一月')} onPress={() => changeMonth(shiftScheduleMonth(window.key, -1))}>‹</Button><h2>{window.months[0]!.label} — {window.months[2]!.label}</h2><Button className="folio-timeline-nav" isIconOnly variant="ghost" aria-label={ui('下一月')} onPress={() => changeMonth(shiftScheduleMonth(window.key, 1))}>›</Button><Button size="sm" variant="ghost" onPress={() => changeMonth(scheduleWindow('').key)}>{ui('本月')}</Button></div>
      <ToggleButton isSelected={incomplete} onChange={selected => setParams(previous => { const next = new URLSearchParams(previous); if (selected) next.delete('timelineStatus'); else next.set('timelineStatus', 'all'); next.delete('cursor'); return next; })}>{ui('只看未完成')}</ToggleButton>
    </header>
    <div className="folio-timeline-scroll" tabIndex={0} aria-label={ui('任务排期')}>
      <div className="folio-timeline-canvas" style={{ '--week-width': `${700 / window.days}%` } as React.CSSProperties}>
        {todayDay >= window.start && todayDay < window.end && <div className="folio-timeline-today" aria-hidden="true" title={ui('今天')}><div /><div><i style={{ left: `${(todayDay - window.start + .5) / window.days * 100}%` }} /></div></div>}
        <div className="folio-timeline-axis folio-timeline-row"><div className="folio-timeline-label">{ui('任务')}</div><div className="folio-timeline-scale"><div className="folio-timeline-months">{window.months.map(month => <span key={month.label} style={{ width: `${(month.end - month.start) / window.days * 100}%` }}>{new Date(month.label + '-01T00:00:00').toLocaleDateString(getLocale(), { year: 'numeric', month: 'long' })}</span>)}</div><div className="folio-timeline-weeks">{ticks.map(day => <span key={day} style={{ left: `${(day - window.start) / window.days * 100}%` }}>{new Date(day * 86400000).toLocaleDateString(getLocale(), { month: 'numeric', day: 'numeric' })}</span>)}</div></div></div>
        <QueryState query={page}>{() => <>{groups.map(([category, items]) => <section className="folio-timeline-group" key={category} aria-label={category}>
          <h3><i aria-hidden="true" />{category}<small>{items.length}</small></h3>
          {items.map(item => {
            const placement = schedulePlacement(item, window);
            const status = COLUMNS.find(column => column.id === item.status)!.title;
            const dates = [item.startDate, item.dueDate].filter(Boolean).join(' → ');
            const pointLabel = item.startDate ? ui('仅开始日期') : ui('仅截止日期');
            const label = `${item.title} · ${status}${dates ? ' · ' + dates : ''}${placement.kind === 'point' ? ' · ' + pointLabel : ''}`;
            return <div className={`folio-timeline-row is-${item.status}`} key={item.id} data-timeline-id={item.id}>
              <div className="folio-timeline-label" title={item.title}><Link onPress={() => onOpen(item)}>{item.title}</Link><span className={`folio-item-state ${item.status}`}>{status}</span></div>
              <div className="folio-timeline-rail">
                {ticks.map(day => <i aria-hidden="true" className="folio-timeline-week" key={day} style={{ left: `${(day - window.start) / window.days * 100}%` }} />)}
                {placement.kind === 'bar' || placement.kind === 'point' ? <Link className={`folio-timeline-bar ${placement.kind === 'point' ? 'is-point' : ''} ${placement.clippedStart ? 'continues-before' : ''} ${placement.clippedEnd ? 'continues-after' : ''}`} style={{ left: `${placement.left}%`, width: placement.kind === 'bar' ? `${placement.width}%` : undefined }} onPress={() => onOpen(item)} aria-label={label}><span title={label}>{placement.kind === 'point' ? '◆' : `${dateLabel(item.startDate!.slice(0, 10))} — ${dateLabel(item.dueDate!.slice(0, 10))}`}</span></Link> : <Button className="folio-timeline-unset" size="sm" variant="ghost" onPress={() => onOpen(item, true)}>{placement.kind === 'unscheduled' ? ui('设置排期') : placement.kind === 'invalid' ? ui('排期无效，请修改日期') : ui('当前月份以外')}<span>{dates}</span></Button>}
              </div>
            </div>;
          })}
        </section>)}{!page.items.length && <div className="folio-timeline-empty"><h3>{ui('本页暂无任务')}</h3><p>{ui('编辑任务可设置开始与截止日期。')}</p></div>}</>}</QueryState>
      </div>
    </div>
    <footer className="folio-timeline-footer"><p>{ui('编辑任务可设置开始与截止日期。')}</p><div><Button size="sm" variant="ghost" isDisabled={!page.hasPrevious || page.loading} onPress={page.previous}>{ui('上一页')}</Button><span>{ui('第 {p0} 页 · 排期按当前页任务展示', { p0: page.pageIndex + 1 })}</span><Button size="sm" variant="ghost" isDisabled={!page.hasNext || page.loading} onPress={page.next}>{ui('下一页')}</Button></div></footer>
  </section>;
}
