import { z, type TaskOutcomeSource } from '@dsh-workbench/runtime';
import { delegateTodoInputSchema, importItemInputSchema, importItemResultSchema, importItemsInputSchema, moveTodoInputSchema, todoItemSchema } from './contracts';
import { type WriteContext } from './state';
import type { TodoStatus } from './model';
export type { TodoData, TodoImage, TodoItem, TodoItemSource, TodoPriority, TodoStatus } from './model';
export { normalizeStatus } from './model';
export type DelegateTodoInput = z.infer<typeof delegateTodoInputSchema>;
declare const progressFeedbackInputSchema: z.ZodObject<{
    itemId: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    conclusion: z.ZodString;
    expectedRevision: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type FeedbackInput = z.infer<typeof progressFeedbackInputSchema>;
export type MoveTodoInput = z.infer<typeof moveTodoInputSchema>;
export declare function effectiveDelegatedStatus(task: TaskOutcomeSource): TodoStatus;
export declare function todoItemPath(itemId: string): string;
export declare const moveTodo: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    index: z.ZodOptional<z.ZodNumber>;
    beforeId: z.ZodOptional<z.ZodString>;
    afterId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    index: z.ZodNumber;
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const commitEdit: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    images: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dataUrl: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            "image/gif": "image/gif";
            "image/jpeg": "image/jpeg";
            "image/png": "image/png";
            "image/webp": "image/webp";
        }>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    baseFingerprint: z.ZodString;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        mime: z.ZodString;
        size: z.ZodNumber;
        sha256: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const editTodo: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    images: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dataUrl: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            "image/gif": "image/gif";
            "image/jpeg": "image/jpeg";
            "image/png": "image/png";
            "image/webp": "image/webp";
        }>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>>>;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    baseFingerprint: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    revision: z.ZodString;
}, z.core.$strip>, "action">;
export declare const feedback: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    conclusion: z.ZodString;
    expectedRevision: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
declare const createTodoInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodObject<{
        kind: z.ZodString;
        itemId: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        noteId: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        messageIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        taskKey: z.ZodOptional<z.ZodString>;
        importedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    status: z.ZodOptional<z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>>;
}, z.core.$strip>;
export declare function createTodoItem(input: z.infer<typeof createTodoInputSchema>, identity: {
    id: string;
    createdAt: string;
}): z.infer<typeof todoItemSchema>;
export type ImportItemInput = z.infer<typeof importItemInputSchema>;
export type ImportItemsInput = z.infer<typeof importItemsInputSchema>;
export type ImportItemResult = z.infer<typeof importItemResultSchema>;
/** Ordinary helper: shared transaction logic, never an exported operation invoked directly. */
export declare function importInTransaction(ctx: WriteContext, input: ImportItemsInput): Promise<{
    results: {
        itemId: string;
        deduped?: boolean | undefined;
        updated?: boolean | undefined;
        delegation?: {
            status: string;
        } | undefined;
        error?: string | undefined;
    }[];
}>;
export declare const importItems: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        priority: z.ZodOptional<z.ZodEnum<{
            high: "high";
            low: "low";
            medium: "medium";
        }>>;
        category: z.ZodOptional<z.ZodString>;
        dueDate: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodObject<{
            kind: z.ZodString;
            itemId: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            noteId: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            messageIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
            taskKey: z.ZodOptional<z.ZodString>;
            importedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
    }, z.core.$strip>>;
    mode: z.ZodOptional<z.ZodEnum<{
        append: "append";
        upsert: "upsert";
    }>>;
    autoDelegate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        deduped: z.ZodOptional<z.ZodBoolean>;
        updated: z.ZodOptional<z.ZodBoolean>;
        delegation: z.ZodOptional<z.ZodObject<{
            status: z.ZodString;
        }, z.core.$strip>>;
        error: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, "mutation">;
