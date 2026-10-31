import type { TodoPriority, TodoStatus } from './actions';
import type { TodoFormValue } from './task-fields';
export type TodoComposerValue = TodoFormValue & {
    category: string;
    priority: TodoPriority;
    status: TodoStatus;
};
/** A creation form has a local blank baseline, not a remote item to overwrite. */
export declare function useTodoComposer(key: string): {
    value: TodoComposerValue;
    dirty: boolean;
    saving: boolean;
    conflicted: boolean;
    error: Error | undefined;
    recoveryWarning?: Error;
    set: (value: ((previous: TodoComposerValue) => TodoComposerValue) | TodoComposerValue) => void;
    reset: () => void;
    save: () => Promise<boolean>;
    result: {
        itemId: string;
        revision: string;
    } | undefined;
    getResult: () => {
        itemId: string;
        revision: string;
    } | undefined;
};
