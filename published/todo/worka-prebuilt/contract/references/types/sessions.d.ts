import { z } from '@dsh-workbench/runtime';
import { type WriteContext } from './state';
export declare const sessionLinked: Readonly<import("@dsh-workbench/runtime").NoteEvent<z.ZodObject<{
    itemId: z.ZodString;
    title: z.ZodString;
    taskId: z.ZodString;
    sessionId: z.ZodString;
    revision: z.ZodString;
}, z.core.$strip>>>;
declare const sessionIdentity: z.ZodObject<{
    itemId: z.ZodString;
    taskId: z.ZodString;
    sessionId: z.ZodString;
    title: z.ZodString;
    source: z.ZodOptional<z.ZodObject<{
        noteId: z.ZodString;
        itemId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const linkSession: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    taskId: z.ZodString;
    sessionId: z.ZodString;
    title: z.ZodString;
    source: z.ZodOptional<z.ZodObject<{
        noteId: z.ZodString;
        itemId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    taskId: z.ZodString;
    sessionId: z.ZodString;
    revision: z.ZodString;
    duplicate: z.ZodBoolean;
}, z.core.$strip>, "mutation">;
/** Save the session identity and optional assignment state in one native transaction. */
export declare function saveSessionLink(ctx: WriteContext, input: z.output<typeof sessionIdentity>, assigned?: boolean, assignment?: import('./model').TodoItem['assignment']): Promise<{
    itemId: string;
    taskId: string;
    sessionId: string;
    revision: string;
    duplicate: boolean;
}>;
export declare const sessionItems: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<{
            blocking: "blocking";
            done: "done";
            in_progress: "in_progress";
            todo: "todo";
        }>;
        sessions: z.ZodArray<z.ZodObject<{
            taskId: z.ZodString;
            sessionId: z.ZodString;
            title: z.ZodString;
            archived: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        archived: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const sessionTask: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    taskId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<{
            blocking: "blocking";
            done: "done";
            in_progress: "in_progress";
            todo: "todo";
        }>;
        sessions: z.ZodArray<z.ZodObject<{
            taskId: z.ZodString;
            sessionId: z.ZodString;
            title: z.ZodString;
            archived: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        archived: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const sourceMetadata: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    ids: z.ZodArray<z.ZodString>;
}, z.core.$strip>, z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    icon: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"emoji">;
        value: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"svg">;
        src: z.ZodString;
        monochrome: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>]>>;
}, z.core.$strip>>, "query">;
export declare const executionDetails: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    sessions: z.ZodArray<z.ZodObject<{
        taskId: z.ZodString;
        sessionId: z.ZodString;
        title: z.ZodString;
        archived: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    sources: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const progressTimeline: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    itemId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<{
            blocking: "blocking";
            done: "done";
            in_progress: "in_progress";
            todo: "todo";
        }>>;
        summary: z.ZodString;
        conclusion: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodString>;
        source: z.ZodEnum<{
            current: "current";
            feedback: "feedback";
            recordProgress: "recordProgress";
        }>;
        taskId: z.ZodOptional<z.ZodString>;
        sourceId: z.ZodOptional<z.ZodString>;
        id: z.ZodString;
        recordedAt: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const setArchived: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    archived: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
export {};
