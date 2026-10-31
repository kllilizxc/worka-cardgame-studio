import type { TodoListItem, TodoDisplaySource } from './list';
export type TodoSession = {
    taskId: string;
    sessionId: string;
    title?: string;
    archived?: boolean;
    progress?: {
        summary?: string;
        updatedAt?: number;
    };
};
export type TodoSource = TodoDisplaySource;
export type TodoCardItem = TodoListItem & {
    primarySessionId?: string;
    sessionCount?: number;
    sourceLabel?: string;
};
/** A stable dialog layout: switching details/edit/history only changes its Outlet. */
export declare function TaskLayout(): import("react").JSX.Element;
export declare function TaskDetails(): import("react").JSX.Element;
export declare function TaskEditor(): import("react").JSX.Element;
export declare function TaskHistory(): import("react").JSX.Element;
