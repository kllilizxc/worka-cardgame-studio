import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export { linkSession, executionDetails, sessionItems, sessionLinked, sessionTask, sourceMetadata, setArchived, progressTimeline } from './sessions';
export { changed, delegationRequested } from './contracts';
export { editTodo, commitEdit, feedback, moveTodo, importItems } from './collaboration';
export type { DelegateTodoInput, FeedbackInput, MoveTodoInput, ImportItemInput, ImportItemsInput, ImportItemResult, TodoItemSource, TodoData, TodoImage, TodoItem, TodoPriority, TodoStatus } from './collaboration';
export declare const upsertExternalItem: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    source: z.ZodObject<{
        kind: z.ZodString;
        itemId: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        taskKey: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    revision: z.ZodString;
    created: z.ZodBoolean;
    updated: z.ZodBoolean;
}, z.core.$strip>, "mutation">;
export declare const requestDelegation: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    goal: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodArray<z.ZodString>>;
    requestId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    eventId: z.ZodString;
    duplicate: z.ZodBoolean;
}, z.core.$strip>, "mutation">;
export declare const recordProgress: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    conclusion: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    expectedRevision: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
    revision: z.ZodString;
    duplicate: z.ZodBoolean;
}, z.core.$strip>, "mutation">;
export declare const saveNewTodo: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
}, z.core.$loose>, z.ZodObject<{
    itemId: z.ZodString;
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const addTodo: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    title: z.ZodString;
    priority: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    category: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>>;
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
    description: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>, z.ZodObject<{
    itemId: z.ZodString;
    revision: z.ZodString;
}, z.core.$strip>, "action">;
export declare const updateStatus: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>;
}, z.core.$strip>, z.ZodObject<{
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const toggleTodo: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const removeTodo: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    revision: z.ZodString;
}, z.core.$strip>, "mutation">;
export declare const clearCompleted: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    revision: z.ZodString;
    pending: z.ZodBoolean;
}, z.core.$strip>, "mutation">;
export declare const itemPage: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        blocking: "blocking";
        done: "done";
        in_progress: "in_progress";
        todo: "todo";
    }>>;
    active: z.ZodOptional<z.ZodBoolean>;
    archived: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const categories: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    items: z.ZodArray<z.ZodString>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const summary: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    total: z.ZodNumber;
    attachmentCount: z.ZodNumber;
    counts: z.ZodObject<{
        todo: z.ZodNumber;
        in_progress: z.ZodNumber;
        blocking: z.ZodNumber;
        done: z.ZodNumber;
    }, z.core.$strip>;
    matched: z.ZodNullable<z.ZodObject<{
        todo: z.ZodNumber;
        in_progress: z.ZodNumber;
        blocking: z.ZodNumber;
        done: z.ZodNumber;
    }, z.core.$strip>>;
    revision: z.ZodString;
}, z.core.$strip>, "query">;
export declare const itemLocations: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodArray<z.ZodObject<{
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
}, z.core.$strip>>, "query">;
export declare const itemLocation: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodObject<{
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
}, z.core.$strip>>, "query">;
export declare const item: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    item: z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>;
    revision: z.ZodString;
    requirementRevision: z.ZodNullable<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const requirement: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    item: z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>;
    revision: z.ZodString;
}, z.core.$strip>, "query">;
export declare const itemField: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodString;
    field: z.ZodEnum<{
        attachments: "attachments";
        conclusion: "conclusion";
        images: "images";
    }>;
}, z.core.$strip>, z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
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
}, z.core.$strip>>, z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    mime: z.ZodString;
    size: z.ZodNumber;
    sha256: z.ZodString;
}, z.core.$strip>>, z.ZodString]>, "query">;
export declare const suggestionContext: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const suggestionsCompleted: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
}, z.core.$strict>, undefined, "mutation">;
export declare const generateSuggestions: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    prompt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    status: z.ZodLiteral<"queued">;
}, z.core.$strip>, "action">;
export declare const list: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
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
    revision: z.ZodString;
}, z.core.$strip>, "query">;
export declare const items: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    itemId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
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
    revision: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    item: z.ZodObject<{
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
    revision: z.ZodString;
}, z.core.$strip>]>, "query">;
export { assignmentContext, assignPreparedSession, assignSession, commitAssignment, assignmentDispatchUnknown, assignmentCompleted } from './assignment';
/** Import examples through the normal indexed store, without dispatching work to other notes. */
export declare const installExampleWork: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodNull, "mutation">;
