import type { TodoStatus } from './model';

const order: TodoStatus[] = ['todo', 'in_progress', 'blocking', 'done'];
/** An explicit selection survives subsequent data and filter changes. */
export function mobileLane(choice: TodoStatus | null, counts: Partial<Record<TodoStatus, number>> | undefined, items: { status: TodoStatus }[]): TodoStatus {
  return choice ?? order.find(status => (counts?.[status] ?? 0) > 0 || items.some(item => item.status === status)) ?? 'todo';
}
