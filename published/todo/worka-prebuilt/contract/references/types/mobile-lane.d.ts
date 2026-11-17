import type { TodoStatus } from './model';
/** An explicit selection survives subsequent data and filter changes. */
export declare function mobileLane(choice: TodoStatus | null, counts: Partial<Record<TodoStatus, number>> | undefined, items: {
    status: TodoStatus;
}[]): TodoStatus;
