import { z } from '@realiz3r/worka-runtime';
export { note } from './model';
export type { CandidateInput, CandidateSpec, SurfaceStatus, SurfacePhase, SurfaceStep, SurfaceFailure, Data } from './model';
export declare const changed: Readonly<import("@realiz3r/worka-runtime").NoteEvent<z.ZodObject<{
    key: z.ZodString;
    title: z.ZodString;
    revision: z.ZodString;
    removed: z.ZodBoolean;
}, z.core.$strip>>>;
export declare const receive: import("@realiz3r/worka-runtime").NoteOperation<z.ZodUnion<readonly [z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    operation: z.ZodLiteral<"rename">;
}, z.core.$strip>, z.ZodObject<{
    operation: z.ZodEnum<{
        restart: "restart";
        stop: "stop";
    }>;
    key: z.ZodString;
    originNoteId: z.ZodString;
    delegationId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    key: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    featureId: z.ZodOptional<z.ZodString>;
    adapter: z.ZodOptional<z.ZodString>;
    repos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        repo: z.ZodString;
        commit: z.ZodString;
    }, z.core.$strip>>>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    cwd: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodString>;
    argv: z.ZodOptional<z.ZodArray<z.ZodString>>;
    url: z.ZodOptional<z.ZodString>;
    readinessPath: z.ZodOptional<z.ZodString>;
    embed: z.ZodOptional<z.ZodBoolean>;
    start: z.ZodOptional<z.ZodBoolean>;
    surface: z.ZodOptional<z.ZodString>;
    operation: z.ZodOptional<z.ZodNever>;
}, z.core.$strip>]>, z.ZodUnion<readonly [z.ZodObject<{
    renamed: z.ZodNumber;
}, z.core.$loose>, z.ZodObject<{
    candidate: z.ZodObject<{
        key: z.ZodString;
    }, z.core.$strip>;
    accepted: z.ZodBoolean;
    startRequested: z.ZodBoolean;
    started: z.ZodLiteral<false>;
}, z.core.$loose>, z.ZodObject<{
    accepted: z.ZodBoolean;
    key: z.ZodString;
    desired: z.ZodEnum<{
        running: "running";
        stopped: "stopped";
    }>;
}, z.core.$loose>]>, "action">;
export declare const start: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
    restart: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
    key: z.ZodString;
    desired: z.ZodEnum<{
        running: "running";
        stopped: "stopped";
    }>;
}, z.core.$loose>, "action">;
export declare const stop: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
    key: z.ZodString;
    desired: z.ZodEnum<{
        running: "running";
        stopped: "stopped";
    }>;
}, z.core.$loose>, "action">;
export declare const verify: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
}, z.core.$loose>, "action">;
export declare const check: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
}, z.core.$loose>, "action">;
export declare const lan: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    url: z.ZodString;
}, z.core.$strip>, "action">;
export declare const attach: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    attached: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    key: z.ZodString;
    attached: z.ZodBoolean;
}, z.core.$loose>, "action">;
export declare const archive: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    archived: z.ZodBoolean;
    key: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const archiveByFeature: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    featureId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    repos: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
    matched: z.ZodArray<z.ZodString>;
    skipped: z.ZodArray<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const restore: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    restored: z.ZodBoolean;
    key: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const forget: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    removed: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const refresh: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodOptional<z.ZodBoolean>;
    count: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>, "action">;
export declare const triggers: import("@realiz3r/worka-runtime").NoteTriggers;
/** Rename one standalone candidate by key, or every candidate of one source task. Preview lifecycle is untouched. */
export declare const rename: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    renamed: z.ZodNumber;
}, z.core.$loose>, "action">;
export declare const catalog: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@realiz3r/worka-runtime").PageSchema<import("@realiz3r/worka-runtime").ProjectedSchema<z.ZodObject<{
    key: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    featureId: z.ZodOptional<z.ZodString>;
    adapter: z.ZodOptional<z.ZodString>;
    repos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        repo: z.ZodString;
        commit: z.ZodString;
    }, z.core.$strip>>>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    cwd: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodString>;
    argv: z.ZodOptional<z.ZodArray<z.ZodString>>;
    url: z.ZodOptional<z.ZodString>;
    readinessPath: z.ZodOptional<z.ZodString>;
    embed: z.ZodOptional<z.ZodBoolean>;
    receivedAt: z.ZodNumber;
    desired: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
        running: "running";
        stopped: "stopped";
    }>>>;
    surfaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodString;
    }, z.core.$loose>>>;
    status: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        phase: z.ZodEnum<{
            failed: "failed";
            preparing: "preparing";
            queued: "queued";
            ready: "ready";
            starting: "starting";
            stopped: "stopped";
            stopping: "stopping";
            verifying: "verifying";
        }>;
        url: z.ZodOptional<z.ZodString>;
        pass: z.ZodString;
        since: z.ZodNumber;
        updatedAt: z.ZodNumber;
        message: z.ZodOptional<z.ZodString>;
        steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            state: z.ZodEnum<{
                completed: "completed";
                failed: "failed";
                pending: "pending";
                running: "running";
                skipped: "skipped";
            }>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        verified: z.ZodOptional<z.ZodObject<{
            ok: z.ZodBoolean;
            at: z.ZodNumber;
            checks: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                ok: z.ZodBoolean;
                detail: z.ZodOptional<z.ZodString>;
                fix: z.ZodOptional<z.ZodString>;
                evidence: z.ZodOptional<z.ZodString>;
                owner: z.ZodOptional<z.ZodEnum<{
                    project: "project";
                    user: "user";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        failure: z.ZodOptional<z.ZodObject<{
            message: z.ZodString;
            owner: z.ZodEnum<{
                framework: "framework";
                project: "project";
                user: "user";
            }>;
            step: z.ZodOptional<z.ZodString>;
            log: z.ZodOptional<z.ZodString>;
            attempts: z.ZodNumber;
            at: z.ZodNumber;
        }, z.core.$loose>>;
        source: z.ZodOptional<z.ZodString>;
        logDir: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
    view: z.ZodObject<{
        key: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        originNoteId: z.ZodOptional<z.ZodString>;
        delegationId: z.ZodOptional<z.ZodString>;
        featureId: z.ZodOptional<z.ZodString>;
        adapter: z.ZodOptional<z.ZodString>;
        repos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            repo: z.ZodString;
            commit: z.ZodString;
        }, z.core.$strip>>>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        cwd: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodString>;
        argv: z.ZodOptional<z.ZodArray<z.ZodString>>;
        url: z.ZodOptional<z.ZodString>;
        readinessPath: z.ZodOptional<z.ZodString>;
        embed: z.ZodOptional<z.ZodBoolean>;
        receivedAt: z.ZodNumber;
        desired: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
            running: "running";
            stopped: "stopped";
        }>>>;
        surfaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            url: z.ZodString;
        }, z.core.$loose>>>;
        status: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            phase: z.ZodEnum<{
                failed: "failed";
                preparing: "preparing";
                queued: "queued";
                ready: "ready";
                starting: "starting";
                stopped: "stopped";
                stopping: "stopping";
                verifying: "verifying";
            }>;
            url: z.ZodOptional<z.ZodString>;
            pass: z.ZodString;
            since: z.ZodNumber;
            updatedAt: z.ZodNumber;
            message: z.ZodOptional<z.ZodString>;
            steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                state: z.ZodEnum<{
                    completed: "completed";
                    failed: "failed";
                    pending: "pending";
                    running: "running";
                    skipped: "skipped";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            verified: z.ZodOptional<z.ZodObject<{
                ok: z.ZodBoolean;
                at: z.ZodNumber;
                checks: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    ok: z.ZodBoolean;
                    detail: z.ZodOptional<z.ZodString>;
                    fix: z.ZodOptional<z.ZodString>;
                    evidence: z.ZodOptional<z.ZodString>;
                    owner: z.ZodOptional<z.ZodEnum<{
                        project: "project";
                        user: "user";
                    }>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            failure: z.ZodOptional<z.ZodObject<{
                message: z.ZodString;
                owner: z.ZodEnum<{
                    framework: "framework";
                    project: "project";
                    user: "user";
                }>;
                step: z.ZodOptional<z.ZodString>;
                log: z.ZodOptional<z.ZodString>;
                attempts: z.ZodNumber;
                at: z.ZodNumber;
            }, z.core.$loose>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, z.core.$loose>, "cwd" | "key" | "receivedAt" | "repos" | "revision" | "surfaces" | "title">>, "query">;
export declare const candidate: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodObject<{
    candidate: z.ZodObject<{
        key: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        originNoteId: z.ZodOptional<z.ZodString>;
        delegationId: z.ZodOptional<z.ZodString>;
        featureId: z.ZodOptional<z.ZodString>;
        adapter: z.ZodOptional<z.ZodString>;
        repos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            repo: z.ZodString;
            commit: z.ZodString;
        }, z.core.$strip>>>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        cwd: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodString>;
        argv: z.ZodOptional<z.ZodArray<z.ZodString>>;
        url: z.ZodOptional<z.ZodString>;
        readinessPath: z.ZodOptional<z.ZodString>;
        embed: z.ZodOptional<z.ZodBoolean>;
        receivedAt: z.ZodNumber;
        desired: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
            running: "running";
            stopped: "stopped";
        }>>>;
        surfaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            url: z.ZodString;
        }, z.core.$loose>>>;
        status: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            phase: z.ZodEnum<{
                failed: "failed";
                preparing: "preparing";
                queued: "queued";
                ready: "ready";
                starting: "starting";
                stopped: "stopped";
                stopping: "stopping";
                verifying: "verifying";
            }>;
            url: z.ZodOptional<z.ZodString>;
            pass: z.ZodString;
            since: z.ZodNumber;
            updatedAt: z.ZodNumber;
            message: z.ZodOptional<z.ZodString>;
            steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                state: z.ZodEnum<{
                    completed: "completed";
                    failed: "failed";
                    pending: "pending";
                    running: "running";
                    skipped: "skipped";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            verified: z.ZodOptional<z.ZodObject<{
                ok: z.ZodBoolean;
                at: z.ZodNumber;
                checks: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    ok: z.ZodBoolean;
                    detail: z.ZodOptional<z.ZodString>;
                    fix: z.ZodOptional<z.ZodString>;
                    evidence: z.ZodOptional<z.ZodString>;
                    owner: z.ZodOptional<z.ZodEnum<{
                        project: "project";
                        user: "user";
                    }>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            failure: z.ZodOptional<z.ZodObject<{
                message: z.ZodString;
                owner: z.ZodEnum<{
                    framework: "framework";
                    project: "project";
                    user: "user";
                }>;
                step: z.ZodOptional<z.ZodString>;
                log: z.ZodOptional<z.ZodString>;
                attempts: z.ZodNumber;
                at: z.ZodNumber;
            }, z.core.$loose>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    revision: z.ZodString;
}, z.core.$strip>>, "query">;
export declare const summary: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    title: z.ZodString;
}, z.core.$strip>, "query">;
export declare const candidates: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        originNoteId: z.ZodOptional<z.ZodString>;
        delegationId: z.ZodOptional<z.ZodString>;
        featureId: z.ZodOptional<z.ZodString>;
        adapter: z.ZodOptional<z.ZodString>;
        repos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            repo: z.ZodString;
            commit: z.ZodString;
        }, z.core.$strip>>>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        cwd: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodString>;
        argv: z.ZodOptional<z.ZodArray<z.ZodString>>;
        url: z.ZodOptional<z.ZodString>;
        readinessPath: z.ZodOptional<z.ZodString>;
        embed: z.ZodOptional<z.ZodBoolean>;
        receivedAt: z.ZodNumber;
        desired: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
            running: "running";
            stopped: "stopped";
        }>>>;
        surfaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            url: z.ZodString;
        }, z.core.$loose>>>;
        status: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            phase: z.ZodEnum<{
                failed: "failed";
                preparing: "preparing";
                queued: "queued";
                ready: "ready";
                starting: "starting";
                stopped: "stopped";
                stopping: "stopping";
                verifying: "verifying";
            }>;
            url: z.ZodOptional<z.ZodString>;
            pass: z.ZodString;
            since: z.ZodNumber;
            updatedAt: z.ZodNumber;
            message: z.ZodOptional<z.ZodString>;
            steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                state: z.ZodEnum<{
                    completed: "completed";
                    failed: "failed";
                    pending: "pending";
                    running: "running";
                    skipped: "skipped";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            verified: z.ZodOptional<z.ZodObject<{
                ok: z.ZodBoolean;
                at: z.ZodNumber;
                checks: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    ok: z.ZodBoolean;
                    detail: z.ZodOptional<z.ZodString>;
                    fix: z.ZodOptional<z.ZodString>;
                    evidence: z.ZodOptional<z.ZodString>;
                    owner: z.ZodOptional<z.ZodEnum<{
                        project: "project";
                        user: "user";
                    }>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            failure: z.ZodOptional<z.ZodObject<{
                message: z.ZodString;
                owner: z.ZodEnum<{
                    framework: "framework";
                    project: "project";
                    user: "user";
                }>;
                step: z.ZodOptional<z.ZodString>;
                log: z.ZodOptional<z.ZodString>;
                attempts: z.ZodNumber;
                at: z.ZodNumber;
            }, z.core.$loose>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const archivedCandidates: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        originNoteId: z.ZodOptional<z.ZodString>;
        delegationId: z.ZodOptional<z.ZodString>;
        featureId: z.ZodOptional<z.ZodString>;
        adapter: z.ZodOptional<z.ZodString>;
        repos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            repo: z.ZodString;
            commit: z.ZodString;
        }, z.core.$strip>>>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        cwd: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodString>;
        argv: z.ZodOptional<z.ZodArray<z.ZodString>>;
        url: z.ZodOptional<z.ZodString>;
        readinessPath: z.ZodOptional<z.ZodString>;
        embed: z.ZodOptional<z.ZodBoolean>;
        receivedAt: z.ZodNumber;
        desired: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
            running: "running";
            stopped: "stopped";
        }>>>;
        surfaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            url: z.ZodString;
        }, z.core.$loose>>>;
        status: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            phase: z.ZodEnum<{
                failed: "failed";
                preparing: "preparing";
                queued: "queued";
                ready: "ready";
                starting: "starting";
                stopped: "stopped";
                stopping: "stopping";
                verifying: "verifying";
            }>;
            url: z.ZodOptional<z.ZodString>;
            pass: z.ZodString;
            since: z.ZodNumber;
            updatedAt: z.ZodNumber;
            message: z.ZodOptional<z.ZodString>;
            steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                state: z.ZodEnum<{
                    completed: "completed";
                    failed: "failed";
                    pending: "pending";
                    running: "running";
                    skipped: "skipped";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            verified: z.ZodOptional<z.ZodObject<{
                ok: z.ZodBoolean;
                at: z.ZodNumber;
                checks: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    ok: z.ZodBoolean;
                    detail: z.ZodOptional<z.ZodString>;
                    fix: z.ZodOptional<z.ZodString>;
                    evidence: z.ZodOptional<z.ZodString>;
                    owner: z.ZodOptional<z.ZodEnum<{
                        project: "project";
                        user: "user";
                    }>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            failure: z.ZodOptional<z.ZodObject<{
                message: z.ZodString;
                owner: z.ZodEnum<{
                    framework: "framework";
                    project: "project";
                    user: "user";
                }>;
                step: z.ZodOptional<z.ZodString>;
                log: z.ZodOptional<z.ZodString>;
                attempts: z.ZodNumber;
                at: z.ZodNumber;
            }, z.core.$loose>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const candidateDetail: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodObject<{
    key: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    featureId: z.ZodOptional<z.ZodString>;
    adapter: z.ZodOptional<z.ZodString>;
    repos: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        repo: z.ZodString;
        commit: z.ZodString;
    }, z.core.$strip>>>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    cwd: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodString>;
    argv: z.ZodOptional<z.ZodArray<z.ZodString>>;
    url: z.ZodOptional<z.ZodString>;
    readinessPath: z.ZodOptional<z.ZodString>;
    embed: z.ZodOptional<z.ZodBoolean>;
    receivedAt: z.ZodNumber;
    desired: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
        running: "running";
        stopped: "stopped";
    }>>>;
    surfaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodString;
    }, z.core.$loose>>>;
    status: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        phase: z.ZodEnum<{
            failed: "failed";
            preparing: "preparing";
            queued: "queued";
            ready: "ready";
            starting: "starting";
            stopped: "stopped";
            stopping: "stopping";
            verifying: "verifying";
        }>;
        url: z.ZodOptional<z.ZodString>;
        pass: z.ZodString;
        since: z.ZodNumber;
        updatedAt: z.ZodNumber;
        message: z.ZodOptional<z.ZodString>;
        steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            state: z.ZodEnum<{
                completed: "completed";
                failed: "failed";
                pending: "pending";
                running: "running";
                skipped: "skipped";
            }>;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        verified: z.ZodOptional<z.ZodObject<{
            ok: z.ZodBoolean;
            at: z.ZodNumber;
            checks: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                ok: z.ZodBoolean;
                detail: z.ZodOptional<z.ZodString>;
                fix: z.ZodOptional<z.ZodString>;
                evidence: z.ZodOptional<z.ZodString>;
                owner: z.ZodOptional<z.ZodEnum<{
                    project: "project";
                    user: "user";
                }>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        failure: z.ZodOptional<z.ZodObject<{
            message: z.ZodString;
            owner: z.ZodEnum<{
                framework: "framework";
                project: "project";
                user: "user";
            }>;
            step: z.ZodOptional<z.ZodString>;
            log: z.ZodOptional<z.ZodString>;
            attempts: z.ZodNumber;
            at: z.ZodNumber;
        }, z.core.$loose>>;
        source: z.ZodOptional<z.ZodString>;
        logDir: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
}, z.core.$loose>>, "query">;
export declare const report: import("@realiz3r/worka-runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodUnknown, "query">;
