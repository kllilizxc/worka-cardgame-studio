import type { TodoListItem } from './list';
import type { TodoStatus } from './model';
type Counts = Record<TodoStatus, number>;
type Move = {
    id: string;
    status: TodoStatus;
    beforeId?: string;
    afterId?: string;
};
/** Only unconfirmed UI intent is local; the native pages remain authoritative. */
export declare function useOptimisticMoves(items: TodoListItem[], scope: string, summary: {
    counts: Counts;
    matched: Counts | null;
    revision: string;
} | undefined): {
    items: {
        id: string;
        title: string;
        status: "blocking" | "done" | "in_progress" | "todo";
        priority?: "high" | "low" | "medium" | undefined;
        category?: string | undefined;
        startDate?: string | undefined;
        dueDate?: string | undefined;
        description?: string | undefined;
        conclusion?: string | undefined;
        imageCount: number;
        attachmentCount: number;
        source?: {
            label: string;
            url?: string | undefined;
        } | undefined;
        sources?: {
            kind: "inspection" | "note" | "unknown";
            key: string;
            noteId?: string | undefined;
            itemId?: string | undefined;
            name?: string | undefined;
            icon?: {
                type: "emoji";
                value: string;
            } | {
                type: "svg";
                src: string;
                monochrome?: boolean | undefined;
            } | undefined;
            url?: string | undefined;
        }[] | undefined;
        archived?: boolean | undefined;
        sourceAutoUpdatedAt?: string | undefined;
        taskId?: string | undefined;
        primarySessionId?: string | undefined;
        sessionCount?: number | undefined;
        sourceLabel?: string | undefined;
        hasDelegation: boolean;
    }[];
    counts: {
        blocking: number;
        done: number;
        in_progress: number;
        todo: number;
    } | undefined;
    matched: {
        blocking: number;
        done: number;
        in_progress: number;
        todo: number;
    } | undefined;
    busy: (id: string) => boolean;
    run: (input: Move, submit: () => Promise<{
        revision: string;
    } | undefined>, refresh: () => Promise<void>) => Promise<boolean>;
    error: Error | undefined;
    retryRefresh: (() => Promise<void>) | undefined;
};
export {};
