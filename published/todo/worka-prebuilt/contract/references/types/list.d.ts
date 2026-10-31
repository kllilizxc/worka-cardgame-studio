import { z } from '@dsh-workbench/runtime';
import { displaySourceSchema, type TodoItem } from './model';
import type { NoteQueryContext } from '@dsh-workbench/runtime';
import type { note } from './model';
/** A list never inherits arbitrary integration payloads or attachment bytes. */
export declare const todoListItemSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    conclusion: z.ZodOptional<z.ZodString>;
    imageCount: z.ZodNumber;
    attachmentCount: z.ZodNumber;
    source: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    sources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            inspection: "inspection";
            note: "note";
            unknown: "unknown";
        }>;
        key: z.ZodString;
        noteId: z.ZodOptional<z.ZodString>;
        itemId: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"emoji">;
            value: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"svg">;
            src: z.ZodString;
            monochrome: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>]>>;
        url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    archived: z.ZodOptional<z.ZodBoolean>;
    sourceAutoUpdatedAt: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    primarySessionId: z.ZodOptional<z.ZodString>;
    sessionCount: z.ZodOptional<z.ZodNumber>;
    sourceLabel: z.ZodOptional<z.ZodString>;
    hasDelegation: z.ZodBoolean;
}, z.core.$strip>;
export type TodoListItem = z.infer<typeof todoListItemSchema>;
export type TodoDisplaySource = z.infer<typeof displaySourceSchema>;
type SourceItem = Pick<TodoItem, 'source' | 'taskSources'>;
type SourceContext = Pick<NoteQueryContext<typeof note>, 'note' | 'notes'>;
export declare function resolveTodoSources(ctx: SourceContext, items: readonly SourceItem[]): Promise<{
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
}[][]>;
/** Both normal pages and location lookups resolve current source metadata. */
export declare function projectTodoRows(ctx: SourceContext, rows: readonly (SourceItem & {
    id: string;
    view: Omit<TodoListItem, 'id'>;
})[]): Promise<{
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
    archived?: boolean | undefined;
    sourceAutoUpdatedAt?: string | undefined;
    taskId?: string | undefined;
    primarySessionId?: string | undefined;
    sessionCount?: number | undefined;
    hasDelegation: boolean;
    id: string;
    source: {
        label: string;
        url?: string | undefined;
    } | undefined;
    sources: {
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
    }[];
    sourceLabel: string | undefined;
}[]>;
export declare function todoListItem(item: TodoItem): TodoListItem;
export declare const todoFilterSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TodoFilter = z.infer<typeof todoFilterSchema>;
export declare function matchesTodo(item: TodoItem, filter: TodoFilter): boolean;
export declare const requirementSchema: z.ZodObject<{
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
    attachments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        mime: z.ZodString;
        size: z.ZodNumber;
        sha256: z.ZodString;
    }, z.core.$strip>>;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const todoRequirement: (item: TodoItem) => {
    title: string;
    description: string;
    images: {
        id: string;
        dataUrl: string;
        name?: string | undefined;
        type?: "image/gif" | "image/jpeg" | "image/png" | "image/webp" | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }[];
    attachments: {
        id: string;
        name: string;
        mime: string;
        size: number;
        sha256: string;
    }[];
    priority: "high" | "low" | "medium" | undefined;
    category: string | undefined;
    startDate: string | undefined;
    dueDate: string | undefined;
};
/** CAS covers exactly editable requirement fields, independent of status/order edits. */
export declare const todoRequirementFingerprint: (item: Pick<TodoItem, 'title' | 'description' | 'images' | 'attachments' | 'priority' | 'category' | 'startDate' | 'dueDate'>) => string;
export {};
