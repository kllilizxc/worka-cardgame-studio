/** The effective list state is read from the URL; category-menu search remains local. */
export function readTodoFilters(params: URLSearchParams) {
  return { search: params.get('q') ?? '', category: params.get('category') ?? '', archived: params.get('archived') === '1', view: params.get('view') === 'timeline' ? 'timeline' as const : 'board' as const };
}

export function updateTodoFilter(previous: URLSearchParams, key: 'q' | 'category' | 'archived' | 'view' | 'month', value: string) {
  const next = new URLSearchParams(previous);
  if (value) next.set(key, value); else next.delete(key);
  // No page cursor from the former filter may select a page in the new result.
  next.delete('cursor');
  return next;
}
