import { z } from '@dsh-workbench/runtime';
export declare const assignmentContext: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    archived: z.ZodBoolean;
    fingerprint: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const assignPreparedSession: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    taskId: z.ZodString;
    sessionId: z.ZodString;
    title: z.ZodString;
    requestId: z.ZodString;
    fingerprint: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    sessionId: z.ZodString;
    revision: z.ZodString;
    duplicate: z.ZodBoolean;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    jobId: z.ZodOptional<z.ZodString>;
    reserved: z.ZodBoolean;
    requestId: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const commitAssignment: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    requestId: z.ZodString;
    jobId: z.ZodString;
    reservedRevision: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    sessionId: z.ZodString;
    revision: z.ZodString;
    duplicate: z.ZodBoolean;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    jobId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "mutation">;
export declare const assignmentDispatchUnknown: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    requestId: z.ZodString;
    error: z.ZodString;
}, z.core.$strip>, z.ZodNull, "mutation">;
export declare const assignmentCompleted: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    taskId: z.ZodString;
    requestId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    result: z.ZodObject<{
        runId: z.ZodString;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            completed: "completed";
            failed: "failed";
            "needs-input": "needs-input";
            queued: "queued";
            running: "running";
            unknown: "unknown";
        }>;
        value: z.ZodOptional<z.ZodJSONSchema>;
        text: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        interrupted: z.ZodOptional<z.ZodBoolean>;
        detail: z.ZodOptional<z.ZodString>;
        detailNextOffset: z.ZodOptional<z.ZodNumber>;
        detailTruncated: z.ZodOptional<z.ZodBoolean>;
        detailExpired: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodNull, "mutation">;
/** Native session allocation and durable dispatch are separate effects; reserve the intent before enqueueing. */
export declare const assignSession: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    sessionId: z.ZodString;
    revision: z.ZodString;
    duplicate: z.ZodBoolean;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    jobId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "action">;
