import type { NoteMutationContext, NoteQueryContext } from '@dsh-workbench/runtime';
import { note, type TodoItem } from './model';
export type { TodoData as NoteState } from './model';
export type ReadContext = NoteQueryContext<typeof note> | NoteMutationContext<typeof note>;
export type WriteContext = NoteMutationContext<typeof note>;
export declare const counts: () => {
    todo: number;
    in_progress: number;
    blocking: number;
    done: number;
};
export declare const emptyStats: (name?: string) => {
    total: number;
    attachmentCount: number;
    counts: {
        todo: number;
        in_progress: number;
        blocking: number;
        done: number;
    };
    revision: number;
    name: string;
    firstPosition: string | undefined;
};
export declare const categoryKey: (name: string) => string;
export declare function importKey(item: Pick<TodoItem, 'title' | 'source'>): string | null;
/** Fractional lexical ranks permit insertion without rewriting an entire lane. */
export declare function between(a?: string, b?: string): string;
export declare function business(row: NonNullable<Awaited<ReturnType<ReadContext['db']['get']>>>): TodoItem;
export declare function getItem(ctx: ReadContext, id: string): Promise<import("@dsh-workbench/runtime/internal").CollectionRow<{
    readonly schema: import("zod").ZodObject<{
        assignment: import("zod").ZodOptional<import("zod").ZodObject<{
            requestId: import("zod").ZodString;
            fingerprint: import("zod").ZodString;
            sessionId: import("zod").ZodString;
            phase: import("zod").ZodEnum<{
                completed: "completed";
                failed: "failed";
                queued: "queued";
                reserved: "reserved";
                unknown: "unknown";
            }>;
            jobId: import("zod").ZodOptional<import("zod").ZodString>;
            error: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core").$strip>>;
        sessions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            taskId: import("zod").ZodString;
            sessionId: import("zod").ZodString;
            title: import("zod").ZodString;
            archived: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod/v4/core").$strip>>>;
        taskSources: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            kind: import("zod").ZodEnum<{
                inspection: "inspection";
                note: "note";
                unknown: "unknown";
            }>;
            key: import("zod").ZodString;
            noteId: import("zod").ZodOptional<import("zod").ZodString>;
            itemId: import("zod").ZodOptional<import("zod").ZodString>;
            name: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core").$strip>>>;
        archived: import("zod").ZodOptional<import("zod").ZodBoolean>;
        title: import("zod").ZodString;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        completed: import("zod").ZodOptional<import("zod").ZodBoolean>;
        priority: import("zod").ZodOptional<import("zod").ZodEnum<{
            high: "high";
            low: "low";
            medium: "medium";
        }>>;
        category: import("zod").ZodOptional<import("zod").ZodString>;
        startDate: import("zod").ZodOptional<import("zod").ZodString>;
        dueDate: import("zod").ZodOptional<import("zod").ZodString>;
        images: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            id: import("zod").ZodString;
            dataUrl: import("zod").ZodString;
            name: import("zod").ZodOptional<import("zod").ZodString>;
            type: import("zod").ZodOptional<import("zod").ZodEnum<{
                "image/gif": "image/gif";
                "image/jpeg": "image/jpeg";
                "image/png": "image/png";
                "image/webp": "image/webp";
            }>>;
            width: import("zod").ZodOptional<import("zod").ZodNumber>;
            height: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod/v4/core").$strip>>>;
        attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            id: import("zod").ZodString;
            name: import("zod").ZodString;
            mime: import("zod").ZodString;
            size: import("zod").ZodNumber;
            sha256: import("zod").ZodString;
        }, import("zod/v4/core").$strip>>>;
        source: import("zod").ZodOptional<import("zod").ZodObject<{
            kind: import("zod").ZodString;
            itemId: import("zod").ZodString;
            label: import("zod").ZodOptional<import("zod").ZodString>;
            url: import("zod").ZodOptional<import("zod").ZodString>;
            noteId: import("zod").ZodOptional<import("zod").ZodString>;
            title: import("zod").ZodOptional<import("zod").ZodString>;
            messageIds: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
            taskKey: import("zod").ZodOptional<import("zod").ZodString>;
            importedAt: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core").$loose>>;
        sourceAutoUpdatedAt: import("zod").ZodOptional<import("zod").ZodString>;
        autoDeliveryPending: import("zod").ZodOptional<import("zod").ZodString>;
        conclusion: import("zod").ZodOptional<import("zod").ZodString>;
        taskId: import("zod").ZodOptional<import("zod").ZodString>;
        delivery: import("zod").ZodOptional<import("zod").ZodString>;
        next: import("zod").ZodOptional<import("zod").ZodString>;
        deliveryIntent: import("zod").ZodOptional<import("zod").ZodObject<{
            requestId: import("zod").ZodString;
            fingerprint: import("zod").ZodString;
            payload: import("zod").ZodOptional<import("zod").ZodUnknown>;
            status: import("zod").ZodOptional<import("zod").ZodString>;
            requirementVersion: import("zod").ZodOptional<import("zod").ZodNumber>;
            updateStatus: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core").$strip>>;
        delegation: import("zod").ZodOptional<import("zod").ZodObject<{
            id: import("zod").ZodString;
            deskNoteId: import("zod").ZodString;
            stateRef: import("zod").ZodString;
        }, import("zod/v4/core").$strip>>;
        delegatedAt: import("zod").ZodOptional<import("zod").ZodString>;
        delegatedRunStatus: import("zod").ZodOptional<import("zod").ZodEnum<{
            accepted: "accepted";
            completed: "completed";
            queued: "queued";
            started: "started";
        }>>;
        createdAt: import("zod").ZodOptional<import("zod").ZodString>;
        status: import("zod").ZodEnum<{
            blocking: "blocking";
            done: "done";
            in_progress: "in_progress";
            todo: "todo";
        }>;
        position: import("zod").ZodString;
        revision: import("zod").ZodNumber;
        normalizedTitle: import("zod").ZodString;
        active: import("zod").ZodBoolean;
        view: import("zod").ZodObject<{
            title: import("zod").ZodString;
            status: import("zod").ZodEnum<{
                blocking: "blocking";
                done: "done";
                in_progress: "in_progress";
                todo: "todo";
            }>;
            priority: import("zod").ZodOptional<import("zod").ZodEnum<{
                high: "high";
                low: "low";
                medium: "medium";
            }>>;
            category: import("zod").ZodOptional<import("zod").ZodString>;
            startDate: import("zod").ZodOptional<import("zod").ZodString>;
            dueDate: import("zod").ZodOptional<import("zod").ZodString>;
            description: import("zod").ZodOptional<import("zod").ZodString>;
            conclusion: import("zod").ZodOptional<import("zod").ZodString>;
            imageCount: import("zod").ZodNumber;
            attachmentCount: import("zod").ZodNumber;
            source: import("zod").ZodOptional<import("zod").ZodObject<{
                label: import("zod").ZodString;
                url: import("zod").ZodOptional<import("zod").ZodString>;
            }, import("zod/v4/core").$strip>>;
            archived: import("zod").ZodOptional<import("zod").ZodBoolean>;
            sourceAutoUpdatedAt: import("zod").ZodOptional<import("zod").ZodString>;
            taskId: import("zod").ZodOptional<import("zod").ZodString>;
            primarySessionId: import("zod").ZodOptional<import("zod").ZodString>;
            sessionCount: import("zod").ZodOptional<import("zod").ZodNumber>;
            sourceLabel: import("zod").ZodOptional<import("zod").ZodString>;
            hasDelegation: import("zod").ZodBoolean;
        }, import("zod/v4/core").$strip>;
    }, import("zod/v4/core").$loose>;
    readonly indexes: readonly [readonly ["position"], readonly ["status", "position"], readonly ["active", "position"], readonly ["category", "position"], readonly ["category", "status", "position"], readonly ["normalizedTitle"]];
}>>;
export declare function saveItem(ctx: WriteContext, item: TodoItem | null, id: string, position?: string, publish?: boolean): Promise<string>;
/** Let the transaction host allocate the entity ID; author mutation code stays deterministic. */
export declare function insertItem(ctx: WriteContext, value: Omit<TodoItem, 'id'>): Promise<{
    item: {
        [x: string]: unknown;
        assignment?: {
            requestId: string;
            fingerprint: string;
            sessionId: string;
            phase: "completed" | "failed" | "queued" | "reserved" | "unknown";
            jobId?: string | undefined;
            error?: string | undefined;
        } | undefined;
        id: string;
        sessions?: {
            taskId: string;
            sessionId: string;
            title: string;
            archived?: boolean | undefined;
        }[] | undefined;
        taskSources?: {
            kind: "inspection" | "note" | "unknown";
            key: string;
            noteId?: string | undefined;
            itemId?: string | undefined;
            name?: string | undefined;
        }[] | undefined;
        archived?: boolean | undefined;
        title: string;
        description?: string | undefined;
        completed?: boolean | undefined;
        priority?: "high" | "low" | "medium" | undefined;
        category?: string | undefined;
        startDate?: string | undefined;
        dueDate?: string | undefined;
        images?: {
            id: string;
            dataUrl: string;
            name?: string | undefined;
            type?: "image/gif" | "image/jpeg" | "image/png" | "image/webp" | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[] | undefined;
        attachments?: {
            id: string;
            name: string;
            mime: string;
            size: number;
            sha256: string;
        }[] | undefined;
        source?: {
            [x: string]: unknown;
            kind: string;
            itemId: string;
            label?: string | undefined;
            url?: string | undefined;
            noteId?: string | undefined;
            title?: string | undefined;
            messageIds?: string[] | undefined;
            taskKey?: string | undefined;
            importedAt?: string | undefined;
        } | undefined;
        sourceAutoUpdatedAt?: string | undefined;
        autoDeliveryPending?: string | undefined;
        conclusion?: string | undefined;
        taskId?: string | undefined;
        delivery?: string | undefined;
        next?: string | undefined;
        deliveryIntent?: {
            requestId: string;
            fingerprint: string;
            payload?: unknown;
            status?: string | undefined;
            requirementVersion?: number | undefined;
            updateStatus?: string | undefined;
        } | undefined;
        delegation?: {
            id: string;
            deskNoteId: string;
            stateRef: string;
        } | undefined;
        delegatedAt?: string | undefined;
        delegatedRunStatus?: "accepted" | "completed" | "queued" | "started" | undefined;
        status?: "blocked" | "blocking" | "done" | "in_progress" | "todo" | undefined;
        createdAt?: string | undefined;
    };
    revision: string;
}>;
