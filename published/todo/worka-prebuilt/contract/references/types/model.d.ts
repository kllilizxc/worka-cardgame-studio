import { z } from '@dsh-workbench/runtime';
export declare const todoStatusSchema: z.ZodEnum<{
    blocking: "blocking";
    done: "done";
    in_progress: "in_progress";
    todo: "todo";
}>;
export declare const todoPrioritySchema: z.ZodEnum<{
    high: "high";
    low: "low";
    medium: "medium";
}>;
export declare const progressSourceSchema: z.ZodEnum<{
    current: "current";
    feedback: "feedback";
    recordProgress: "recordProgress";
}>;
export declare const progressEntrySchema: z.ZodObject<{
    itemId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>>;
    summary: z.ZodString;
    conclusion: z.ZodOptional<z.ZodString>;
    recordedAt: z.ZodNumber;
    revision: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<{
        current: "current";
        feedback: "feedback";
        recordProgress: "recordProgress";
    }>;
    taskId: z.ZodOptional<z.ZodString>;
    sourceId: z.ZodOptional<z.ZodString>;
    conclusionKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const todoImageSchema: z.ZodObject<{
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
}, z.core.$strip>;
export declare const todoItemSourceSchema: z.ZodObject<{
    kind: z.ZodString;
    itemId: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    noteId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    messageIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    taskKey: z.ZodOptional<z.ZodString>;
    importedAt: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const sessionLinkSchema: z.ZodObject<{
    taskId: z.ZodString;
    sessionId: z.ZodString;
    title: z.ZodString;
    archived: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const taskSourceSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        inspection: "inspection";
        note: "note";
        unknown: "unknown";
    }>;
    key: z.ZodString;
    noteId: z.ZodOptional<z.ZodString>;
    itemId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const sourceIconSchema: z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodLiteral<"emoji">;
    value: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"svg">;
    src: z.ZodString;
    monochrome: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>]>;
export declare const displaySourceSchema: z.ZodObject<{
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
}, z.core.$strip>;
export declare const todoItemSchema: z.ZodObject<{
    assignment: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        fingerprint: z.ZodString;
        sessionId: z.ZodString;
        phase: z.ZodEnum<{
            completed: "completed";
            failed: "failed";
            queued: "queued";
            reserved: "reserved";
            unknown: "unknown";
        }>;
        jobId: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    id: z.ZodString;
    sessions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        taskId: z.ZodString;
        sessionId: z.ZodString;
        title: z.ZodString;
        archived: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>;
    taskSources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            inspection: "inspection";
            note: "note";
            unknown: "unknown";
        }>;
        key: z.ZodString;
        noteId: z.ZodOptional<z.ZodString>;
        itemId: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    archived: z.ZodOptional<z.ZodBoolean>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    createdAt: z.ZodString;
    completed: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        mime: z.ZodString;
        size: z.ZodNumber;
        sha256: z.ZodString;
    }, z.core.$strip>>>;
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
    sourceAutoUpdatedAt: z.ZodOptional<z.ZodString>;
    autoDeliveryPending: z.ZodOptional<z.ZodString>;
    conclusion: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    delivery: z.ZodOptional<z.ZodString>;
    next: z.ZodOptional<z.ZodString>;
    deliveryIntent: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        fingerprint: z.ZodString;
        payload: z.ZodOptional<z.ZodUnknown>;
        status: z.ZodOptional<z.ZodString>;
        requirementVersion: z.ZodOptional<z.ZodNumber>;
        updateStatus: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    delegation: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        deskNoteId: z.ZodString;
        stateRef: z.ZodString;
    }, z.core.$strip>>;
    delegatedAt: z.ZodOptional<z.ZodString>;
    delegatedRunStatus: z.ZodOptional<z.ZodEnum<{
        accepted: "accepted";
        completed: "completed";
        queued: "queued";
        started: "started";
    }>>;
}, z.core.$loose>;
export declare const storedTodoItemSchema: z.ZodObject<{
    assignment: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        fingerprint: z.ZodString;
        sessionId: z.ZodString;
        phase: z.ZodEnum<{
            completed: "completed";
            failed: "failed";
            queued: "queued";
            reserved: "reserved";
            unknown: "unknown";
        }>;
        jobId: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    id: z.ZodString;
    sessions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        taskId: z.ZodString;
        sessionId: z.ZodString;
        title: z.ZodString;
        archived: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>;
    taskSources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            inspection: "inspection";
            note: "note";
            unknown: "unknown";
        }>;
        key: z.ZodString;
        noteId: z.ZodOptional<z.ZodString>;
        itemId: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    archived: z.ZodOptional<z.ZodBoolean>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    completed: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        mime: z.ZodString;
        size: z.ZodNumber;
        sha256: z.ZodString;
    }, z.core.$strip>>>;
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
    sourceAutoUpdatedAt: z.ZodOptional<z.ZodString>;
    autoDeliveryPending: z.ZodOptional<z.ZodString>;
    conclusion: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    delivery: z.ZodOptional<z.ZodString>;
    next: z.ZodOptional<z.ZodString>;
    deliveryIntent: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        fingerprint: z.ZodString;
        payload: z.ZodOptional<z.ZodUnknown>;
        status: z.ZodOptional<z.ZodString>;
        requirementVersion: z.ZodOptional<z.ZodNumber>;
        updateStatus: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    delegation: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        deskNoteId: z.ZodString;
        stateRef: z.ZodString;
    }, z.core.$strip>>;
    delegatedAt: z.ZodOptional<z.ZodString>;
    delegatedRunStatus: z.ZodOptional<z.ZodEnum<{
        accepted: "accepted";
        completed: "completed";
        queued: "queued";
        started: "started";
    }>>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>, z.ZodLiteral<"blocked">]>>;
    createdAt: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export declare const todoDataSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        assignment: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            fingerprint: z.ZodString;
            sessionId: z.ZodString;
            phase: z.ZodEnum<{
                completed: "completed";
                failed: "failed";
                queued: "queued";
                reserved: "reserved";
                unknown: "unknown";
            }>;
            jobId: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        id: z.ZodString;
        sessions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            taskId: z.ZodString;
            sessionId: z.ZodString;
            title: z.ZodString;
            archived: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>>;
        taskSources: z.ZodOptional<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                inspection: "inspection";
                note: "note";
                unknown: "unknown";
            }>;
            key: z.ZodString;
            noteId: z.ZodOptional<z.ZodString>;
            itemId: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        archived: z.ZodOptional<z.ZodBoolean>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        completed: z.ZodOptional<z.ZodBoolean>;
        priority: z.ZodOptional<z.ZodEnum<{
            high: "high";
            low: "low";
            medium: "medium";
        }>>;
        category: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        dueDate: z.ZodOptional<z.ZodString>;
        images: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }, z.core.$strip>>>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            mime: z.ZodString;
            size: z.ZodNumber;
            sha256: z.ZodString;
        }, z.core.$strip>>>;
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
        sourceAutoUpdatedAt: z.ZodOptional<z.ZodString>;
        autoDeliveryPending: z.ZodOptional<z.ZodString>;
        conclusion: z.ZodOptional<z.ZodString>;
        taskId: z.ZodOptional<z.ZodString>;
        delivery: z.ZodOptional<z.ZodString>;
        next: z.ZodOptional<z.ZodString>;
        deliveryIntent: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            fingerprint: z.ZodString;
            payload: z.ZodOptional<z.ZodUnknown>;
            status: z.ZodOptional<z.ZodString>;
            requirementVersion: z.ZodOptional<z.ZodNumber>;
            updateStatus: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        delegation: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            deskNoteId: z.ZodString;
            stateRef: z.ZodString;
        }, z.core.$strip>>;
        delegatedAt: z.ZodOptional<z.ZodString>;
        delegatedRunStatus: z.ZodOptional<z.ZodEnum<{
            accepted: "accepted";
            completed: "completed";
            queued: "queued";
            started: "started";
        }>>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<{
            blocking: "blocking";
            done: "done";
            in_progress: "in_progress";
            todo: "todo";
        }>, z.ZodLiteral<"blocked">]>>;
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    filter: z.ZodOptional<z.ZodEnum<{
        active: "active";
        all: "all";
        completed: "completed";
    }>>;
    summary: z.ZodOptional<z.ZodString>;
    executionDesk: z.ZodOptional<z.ZodObject<{
        noteId: z.ZodOptional<z.ZodString>;
        stateRef: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$loose>;
export declare const todoSnapshotSchema: z.ZodObject<{
    value: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            assignment: z.ZodOptional<z.ZodObject<{
                requestId: z.ZodString;
                fingerprint: z.ZodString;
                sessionId: z.ZodString;
                phase: z.ZodEnum<{
                    completed: "completed";
                    failed: "failed";
                    queued: "queued";
                    reserved: "reserved";
                    unknown: "unknown";
                }>;
                jobId: z.ZodOptional<z.ZodString>;
                error: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            id: z.ZodString;
            sessions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                taskId: z.ZodString;
                sessionId: z.ZodString;
                title: z.ZodString;
                archived: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>>;
            taskSources: z.ZodOptional<z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    inspection: "inspection";
                    note: "note";
                    unknown: "unknown";
                }>;
                key: z.ZodString;
                noteId: z.ZodOptional<z.ZodString>;
                itemId: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            archived: z.ZodOptional<z.ZodBoolean>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            completed: z.ZodOptional<z.ZodBoolean>;
            priority: z.ZodOptional<z.ZodEnum<{
                high: "high";
                low: "low";
                medium: "medium";
            }>>;
            category: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            dueDate: z.ZodOptional<z.ZodString>;
            images: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
            }, z.core.$strip>>>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                mime: z.ZodString;
                size: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strip>>>;
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
            sourceAutoUpdatedAt: z.ZodOptional<z.ZodString>;
            autoDeliveryPending: z.ZodOptional<z.ZodString>;
            conclusion: z.ZodOptional<z.ZodString>;
            taskId: z.ZodOptional<z.ZodString>;
            delivery: z.ZodOptional<z.ZodString>;
            next: z.ZodOptional<z.ZodString>;
            deliveryIntent: z.ZodOptional<z.ZodObject<{
                requestId: z.ZodString;
                fingerprint: z.ZodString;
                payload: z.ZodOptional<z.ZodUnknown>;
                status: z.ZodOptional<z.ZodString>;
                requirementVersion: z.ZodOptional<z.ZodNumber>;
                updateStatus: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            delegation: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                deskNoteId: z.ZodString;
                stateRef: z.ZodString;
            }, z.core.$strip>>;
            delegatedAt: z.ZodOptional<z.ZodString>;
            delegatedRunStatus: z.ZodOptional<z.ZodEnum<{
                accepted: "accepted";
                completed: "completed";
                queued: "queued";
                started: "started";
            }>>;
            status: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<{
                blocking: "blocking";
                done: "done";
                in_progress: "in_progress";
                todo: "todo";
            }>, z.ZodLiteral<"blocked">]>>;
            createdAt: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
        filter: z.ZodOptional<z.ZodEnum<{
            active: "active";
            all: "all";
            completed: "completed";
        }>>;
        summary: z.ZodOptional<z.ZodString>;
        executionDesk: z.ZodOptional<z.ZodObject<{
            noteId: z.ZodOptional<z.ZodString>;
            stateRef: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$loose>;
    revision: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
    origin: z.ZodOptional<z.ZodObject<{
        chain: z.ZodArray<z.ZodString>;
        deliveryId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const revisionOutputSchema: z.ZodObject<{
    revision: z.ZodString;
}, z.core.$strip>;
export declare const todoConfigSchema: z.ZodObject<{
    includeExampleWork: z.ZodOptional<z.ZodBoolean>;
    filter: z.ZodOptional<z.ZodEnum<{
        active: "active";
        all: "all";
        completed: "completed";
    }>>;
}, z.core.$loose>;
export type TodoStatus = z.infer<typeof todoStatusSchema>;
export type TodoPriority = z.infer<typeof todoPrioritySchema>;
export type TodoImage = z.infer<typeof todoImageSchema>;
export type TodoItemSource = z.infer<typeof todoItemSourceSchema>;
export type TodoItem = z.infer<typeof storedTodoItemSchema>;
export type TodoData = z.infer<typeof todoDataSchema>;
export declare function normalizeStatus(item: {
    status?: string;
    completed?: boolean;
}): TodoStatus;
export declare const countsSchema: z.ZodObject<{
    todo: z.ZodNumber;
    in_progress: z.ZodNumber;
    blocking: z.ZodNumber;
    done: z.ZodNumber;
}, z.core.$strip>;
export declare const note: import("@dsh-workbench/runtime").NoteModel<{
    readonly items: {
        readonly schema: z.ZodObject<{
            assignment: z.ZodOptional<z.ZodObject<{
                requestId: z.ZodString;
                fingerprint: z.ZodString;
                sessionId: z.ZodString;
                phase: z.ZodEnum<{
                    completed: "completed";
                    failed: "failed";
                    queued: "queued";
                    reserved: "reserved";
                    unknown: "unknown";
                }>;
                jobId: z.ZodOptional<z.ZodString>;
                error: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            sessions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                taskId: z.ZodString;
                sessionId: z.ZodString;
                title: z.ZodString;
                archived: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>>;
            taskSources: z.ZodOptional<z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    inspection: "inspection";
                    note: "note";
                    unknown: "unknown";
                }>;
                key: z.ZodString;
                noteId: z.ZodOptional<z.ZodString>;
                itemId: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            archived: z.ZodOptional<z.ZodBoolean>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            completed: z.ZodOptional<z.ZodBoolean>;
            priority: z.ZodOptional<z.ZodEnum<{
                high: "high";
                low: "low";
                medium: "medium";
            }>>;
            category: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            dueDate: z.ZodOptional<z.ZodString>;
            images: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
            }, z.core.$strip>>>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                mime: z.ZodString;
                size: z.ZodNumber;
                sha256: z.ZodString;
            }, z.core.$strip>>>;
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
            sourceAutoUpdatedAt: z.ZodOptional<z.ZodString>;
            autoDeliveryPending: z.ZodOptional<z.ZodString>;
            conclusion: z.ZodOptional<z.ZodString>;
            taskId: z.ZodOptional<z.ZodString>;
            delivery: z.ZodOptional<z.ZodString>;
            next: z.ZodOptional<z.ZodString>;
            deliveryIntent: z.ZodOptional<z.ZodObject<{
                requestId: z.ZodString;
                fingerprint: z.ZodString;
                payload: z.ZodOptional<z.ZodUnknown>;
                status: z.ZodOptional<z.ZodString>;
                requirementVersion: z.ZodOptional<z.ZodNumber>;
                updateStatus: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            delegation: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                deskNoteId: z.ZodString;
                stateRef: z.ZodString;
            }, z.core.$strip>>;
            delegatedAt: z.ZodOptional<z.ZodString>;
            delegatedRunStatus: z.ZodOptional<z.ZodEnum<{
                accepted: "accepted";
                completed: "completed";
                queued: "queued";
                started: "started";
            }>>;
            createdAt: z.ZodOptional<z.ZodString>;
            status: z.ZodEnum<{
                blocking: "blocking";
                done: "done";
                in_progress: "in_progress";
                todo: "todo";
            }>;
            position: z.ZodString;
            revision: z.ZodNumber;
            normalizedTitle: z.ZodString;
            active: z.ZodBoolean;
            view: z.ZodObject<{
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
                archived: z.ZodOptional<z.ZodBoolean>;
                sourceAutoUpdatedAt: z.ZodOptional<z.ZodString>;
                taskId: z.ZodOptional<z.ZodString>;
                primarySessionId: z.ZodOptional<z.ZodString>;
                sessionCount: z.ZodOptional<z.ZodNumber>;
                sourceLabel: z.ZodOptional<z.ZodString>;
                hasDelegation: z.ZodBoolean;
            }, z.core.$strip>;
        }, z.core.$loose>;
        readonly indexes: readonly [readonly ["position"], readonly ["status", "position"], readonly ["active", "position"], readonly ["category", "position"], readonly ["category", "status", "position"], readonly ["normalizedTitle"]];
    };
    readonly sessionIndex: {
        readonly schema: z.ZodObject<{
            taskId: z.ZodString;
            itemId: z.ZodString;
        }, z.core.$strip>;
        readonly indexes: readonly [readonly ["taskId"]];
    };
    readonly progressEntries: {
        readonly schema: z.ZodObject<{
            itemId: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<{
                blocking: "blocking";
                done: "done";
                in_progress: "in_progress";
                todo: "todo";
            }>>;
            summary: z.ZodString;
            conclusion: z.ZodOptional<z.ZodString>;
            recordedAt: z.ZodNumber;
            revision: z.ZodOptional<z.ZodString>;
            source: z.ZodEnum<{
                current: "current";
                feedback: "feedback";
                recordProgress: "recordProgress";
            }>;
            taskId: z.ZodOptional<z.ZodString>;
            sourceId: z.ZodOptional<z.ZodString>;
            conclusionKey: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly indexes: readonly [readonly ["itemId", "recordedAt"], readonly ["itemId", "conclusionKey"]];
    };
    readonly totals: {
        readonly schema: z.ZodObject<{
            total: z.ZodNumber;
            attachmentCount: z.ZodNumber;
            counts: z.ZodObject<{
                todo: z.ZodNumber;
                in_progress: z.ZodNumber;
                blocking: z.ZodNumber;
                done: z.ZodNumber;
            }, z.core.$strip>;
            revision: z.ZodNumber;
            name: z.ZodString;
            firstPosition: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly indexes: readonly [readonly ["name"]];
    };
    readonly categories: {
        readonly schema: z.ZodObject<{
            total: z.ZodNumber;
            attachmentCount: z.ZodNumber;
            counts: z.ZodObject<{
                todo: z.ZodNumber;
                in_progress: z.ZodNumber;
                blocking: z.ZodNumber;
                done: z.ZodNumber;
            }, z.core.$strip>;
            revision: z.ZodNumber;
            name: z.ZodString;
            firstPosition: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly indexes: readonly [readonly ["name"]];
    };
    readonly imports: {
        schema: z.ZodObject<{
            itemId: z.ZodString;
        }, z.core.$strip>;
    };
}, z.ZodObject<{
    includeExampleWork: z.ZodOptional<z.ZodBoolean>;
    filter: z.ZodOptional<z.ZodEnum<{
        active: "active";
        all: "all";
        completed: "completed";
    }>>;
}, z.core.$loose>>;
