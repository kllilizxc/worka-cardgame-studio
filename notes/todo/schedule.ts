const DAY = 86_400_000;
/** Calendar-day arithmetic is independent of the browser's timezone and DST. */
export function scheduleDay(value?: string): number | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return;
  const date = value.slice(0, 10), time = Date.parse(date + 'T00:00:00Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== date) return;
  return time / DAY;
}
export const dayString = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);
export function validateSchedule(item: { startDate?: string; dueDate?: string }) {
  const start = scheduleDay(item.startDate), end = scheduleDay(item.dueDate);
  if (item.startDate && start === undefined || item.dueDate && end === undefined) throw new Error('排期需要有效日期（YYYY-MM-DD）');
  if (start !== undefined && end !== undefined && start > end) throw new Error('截止日期不能早于开始日期');
}
export function scheduleWindow(month: string, today = new Date()) {
  const fallback = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const key = /^\d{4}-(0[1-9]|1[0-2])$/.test(month) && scheduleDay(month + '-01') !== undefined ? month : fallback;
  const [year, index] = key.split('-').map(Number) as [number, number];
  const starts = [0, 1, 2, 3].map(offset => Date.UTC(year, index - 1 + offset, 1) / DAY);
  return { key, start: starts[0]!, end: starts[3]!, days: starts[3]! - starts[0]!, months: starts.slice(0, 3).map((start, i) => ({ start, end: starts[i + 1]!, label: dayString(start).slice(0, 7) })) };
}
export function shiftScheduleMonth(month: string, offset: number) {
  const window = scheduleWindow(month), date = new Date(window.start * DAY);
  return dayString(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1) / DAY).slice(0, 7);
}
export function schedulePlacement(item: { startDate?: string; dueDate?: string }, window: { start: number; end: number; days: number }) {
  const start = scheduleDay(item.startDate), end = scheduleDay(item.dueDate);
  if (item.startDate && start === undefined || item.dueDate && end === undefined || start !== undefined && end !== undefined && start > end) return { kind: 'invalid' as const };
  if (start === undefined && end === undefined) return { kind: 'unscheduled' as const };
  const from = start ?? end!, to = end ?? start!;
  if (to < window.start || from >= window.end) return { kind: 'outside' as const };
  return { kind: start === undefined || end === undefined ? 'point' as const : 'bar' as const,
    left: (Math.max(from, window.start) - window.start) / window.days * 100,
    width: (Math.min(to + 1, window.end) - Math.max(from, window.start)) / window.days * 100,
    clippedStart: from < window.start, clippedEnd: to >= window.end };
}
