import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export type { CandidateInput, CandidateSpec, SurfaceStatus, SurfacePhase, SurfaceStep, SurfaceFailure, Feedback, Data } from './model';
export declare const changed: Readonly<import("@dsh-workbench/runtime").NoteEvent<z.ZodObject<{
    key: z.ZodString;
    title: z.ZodString;
    revision: z.ZodString;
    removed: z.ZodBoolean;
}, z.core.$strip>>>;
export declare const feedbackReported: Readonly<import("@dsh-workbench/runtime").NoteEvent<z.ZodObject<{
    deliveryBlocked: z.ZodOptional<z.ZodString>;
    deliveryAttempt: z.ZodOptional<z.ZodNumber>;
    attemptedAt: z.ZodOptional<z.ZodNumber>;
    id: z.ZodString;
    delegationId: z.ZodOptional<z.ZodString>;
    standalone: z.ZodOptional<z.ZodBoolean>;
    autoRepair: z.ZodOptional<z.ZodBoolean>;
    kind: z.ZodLiteral<"delivery-feedback">;
    status: z.ZodEnum<{
        failed: "failed";
        passed: "passed";
        unchecked: "unchecked";
    }>;
    subject: z.ZodString;
    summary: z.ZodString;
    userRequested: z.ZodOptional<z.ZodBoolean>;
    observedAt: z.ZodOptional<z.ZodNumber>;
    source: z.ZodOptional<z.ZodString>;
    candidateKey: z.ZodString;
    revision: z.ZodString;
    commits: z.ZodOptional<z.ZodArray<z.ZodString>>;
    surface: z.ZodString;
    runId: z.ZodString;
    diagnostics: z.ZodString;
    repairable: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    project: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodNullable<z.ZodString>;
}, z.core.$loose>>>;
export declare const receive: import("@dsh-workbench/runtime").NoteOperation<z.ZodUnion<readonly [z.ZodObject<{
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
export declare const start: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
export declare const stop: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
export declare const verify: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
}, z.core.$loose>, "action">;
export declare const check: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
}, z.core.$loose>, "action">;
export declare const lan: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    url: z.ZodString;
}, z.core.$strip>, "action">;
export declare const attach: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    attached: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    key: z.ZodString;
    attached: z.ZodBoolean;
}, z.core.$loose>, "action">;
export declare const archive: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    archived: z.ZodBoolean;
    key: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const archiveByFeature: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    featureId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    repos: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
    matched: z.ZodArray<z.ZodString>;
    skipped: z.ZodArray<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const restore: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    restored: z.ZodBoolean;
    key: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const forget: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    removed: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const refresh: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodOptional<z.ZodBoolean>;
    count: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>, "action">;
export declare const triggers: import("@dsh-workbench/runtime").NoteTriggers;
export declare const requestRepair: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    accepted: z.ZodBoolean;
    session: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "action">;
export declare const refreshFeedback: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    checked: z.ZodBoolean;
}, z.core.$loose>, "action">;
/** A relation records the verified Desk handling state for one exact failed pass. */
export declare const recordFeedback: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodString;
    runId: z.ZodString;
    reportId: z.ZodString;
    handling: z.ZodString;
    summary: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    stored: z.ZodBoolean;
    key: z.ZodString;
    runId: z.ZodString;
    duplicate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$loose>, "mutation">;
/** Rename one standalone candidate by key, or every candidate of one source task. Preview lifecycle is untouched. */
export declare const rename: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    renamed: z.ZodNumber;
}, z.core.$loose>, "action">;
export declare const catalog: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@dsh-workbench/runtime").PageSchema<import("@dsh-workbench/runtime").ProjectedSchema<z.ZodObject<{
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
        feedbackSignature: z.ZodOptional<z.ZodObject<{
            signature: z.ZodString;
            reportId: z.ZodString;
        }, z.core.$strip>>;
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
            handling: z.ZodOptional<z.ZodEnum<{
                agent: "agent";
                "agent-done": "agent-done";
                "agent-pending": "agent-pending";
                "agent-unknown": "agent-unknown";
                "awaiting-approval": "awaiting-approval";
                coordinating: "coordinating";
                "delivery-failed": "delivery-failed";
                exhausted: "exhausted";
                retrying: "retrying";
                "waiting-user": "waiting-user";
            }>>;
            handlingNote: z.ZodOptional<z.ZodString>;
            retryAt: z.ZodOptional<z.ZodNumber>;
            reportId: z.ZodOptional<z.ZodString>;
            session: z.ZodOptional<z.ZodString>;
            delegationId: z.ZodOptional<z.ZodString>;
            at: z.ZodNumber;
        }, z.core.$strip>>;
        source: z.ZodOptional<z.ZodString>;
        logDir: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
    repair: z.ZodOptional<z.ZodObject<{
        rounds: z.ZodNumber;
        source: z.ZodString;
        delegationId: z.ZodOptional<z.ZodString>;
        lastFailure: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
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
            feedbackSignature: z.ZodOptional<z.ZodObject<{
                signature: z.ZodString;
                reportId: z.ZodString;
            }, z.core.$strip>>;
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
                handling: z.ZodOptional<z.ZodEnum<{
                    agent: "agent";
                    "agent-done": "agent-done";
                    "agent-pending": "agent-pending";
                    "agent-unknown": "agent-unknown";
                    "awaiting-approval": "awaiting-approval";
                    coordinating: "coordinating";
                    "delivery-failed": "delivery-failed";
                    exhausted: "exhausted";
                    retrying: "retrying";
                    "waiting-user": "waiting-user";
                }>>;
                handlingNote: z.ZodOptional<z.ZodString>;
                retryAt: z.ZodOptional<z.ZodNumber>;
                reportId: z.ZodOptional<z.ZodString>;
                session: z.ZodOptional<z.ZodString>;
                delegationId: z.ZodOptional<z.ZodString>;
                at: z.ZodNumber;
            }, z.core.$strip>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
        repair: z.ZodOptional<z.ZodObject<{
            rounds: z.ZodNumber;
            source: z.ZodString;
            delegationId: z.ZodOptional<z.ZodString>;
            lastFailure: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$loose>;
}, z.core.$loose>, "cwd" | "key" | "receivedAt" | "repos" | "revision" | "surfaces" | "title">>, "query">;
export declare const feedbackHistory: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@dsh-workbench/runtime").PageSchema<import("@dsh-workbench/runtime").RecordSchema<z.ZodObject<{
    report: z.ZodObject<{
        deliveryBlocked: z.ZodOptional<z.ZodString>;
        deliveryAttempt: z.ZodOptional<z.ZodNumber>;
        attemptedAt: z.ZodOptional<z.ZodNumber>;
        id: z.ZodString;
        delegationId: z.ZodOptional<z.ZodString>;
        standalone: z.ZodOptional<z.ZodBoolean>;
        autoRepair: z.ZodOptional<z.ZodBoolean>;
        kind: z.ZodLiteral<"delivery-feedback">;
        status: z.ZodEnum<{
            failed: "failed";
            passed: "passed";
            unchecked: "unchecked";
        }>;
        subject: z.ZodString;
        summary: z.ZodString;
        userRequested: z.ZodOptional<z.ZodBoolean>;
        observedAt: z.ZodOptional<z.ZodNumber>;
        source: z.ZodOptional<z.ZodString>;
        originNoteId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        candidateKey: z.ZodString;
        revision: z.ZodString;
        commits: z.ZodOptional<z.ZodArray<z.ZodString>>;
        surface: z.ZodString;
        runId: z.ZodString;
        diagnostics: z.ZodString;
        repairable: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
    observedAt: z.ZodNumber;
    userRequested: z.ZodBoolean;
}, z.core.$strip>>>, "query">;
export declare const candidate: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
            feedbackSignature: z.ZodOptional<z.ZodObject<{
                signature: z.ZodString;
                reportId: z.ZodString;
            }, z.core.$strip>>;
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
                handling: z.ZodOptional<z.ZodEnum<{
                    agent: "agent";
                    "agent-done": "agent-done";
                    "agent-pending": "agent-pending";
                    "agent-unknown": "agent-unknown";
                    "awaiting-approval": "awaiting-approval";
                    coordinating: "coordinating";
                    "delivery-failed": "delivery-failed";
                    exhausted: "exhausted";
                    retrying: "retrying";
                    "waiting-user": "waiting-user";
                }>>;
                handlingNote: z.ZodOptional<z.ZodString>;
                retryAt: z.ZodOptional<z.ZodNumber>;
                reportId: z.ZodOptional<z.ZodString>;
                session: z.ZodOptional<z.ZodString>;
                delegationId: z.ZodOptional<z.ZodString>;
                at: z.ZodNumber;
            }, z.core.$strip>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
        repair: z.ZodOptional<z.ZodObject<{
            rounds: z.ZodNumber;
            source: z.ZodString;
            delegationId: z.ZodOptional<z.ZodString>;
            lastFailure: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$loose>;
    revision: z.ZodString;
}, z.core.$strip>>, "query">;
export declare const summary: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    title: z.ZodString;
    feedbackError: z.ZodNullable<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const candidates: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
            feedbackSignature: z.ZodOptional<z.ZodObject<{
                signature: z.ZodString;
                reportId: z.ZodString;
            }, z.core.$strip>>;
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
                handling: z.ZodOptional<z.ZodEnum<{
                    agent: "agent";
                    "agent-done": "agent-done";
                    "agent-pending": "agent-pending";
                    "agent-unknown": "agent-unknown";
                    "awaiting-approval": "awaiting-approval";
                    coordinating: "coordinating";
                    "delivery-failed": "delivery-failed";
                    exhausted: "exhausted";
                    retrying: "retrying";
                    "waiting-user": "waiting-user";
                }>>;
                handlingNote: z.ZodOptional<z.ZodString>;
                retryAt: z.ZodOptional<z.ZodNumber>;
                reportId: z.ZodOptional<z.ZodString>;
                session: z.ZodOptional<z.ZodString>;
                delegationId: z.ZodOptional<z.ZodString>;
                at: z.ZodNumber;
            }, z.core.$strip>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
        repair: z.ZodOptional<z.ZodObject<{
            rounds: z.ZodNumber;
            source: z.ZodString;
            delegationId: z.ZodOptional<z.ZodString>;
            lastFailure: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$loose>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const archivedCandidates: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
            feedbackSignature: z.ZodOptional<z.ZodObject<{
                signature: z.ZodString;
                reportId: z.ZodString;
            }, z.core.$strip>>;
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
                handling: z.ZodOptional<z.ZodEnum<{
                    agent: "agent";
                    "agent-done": "agent-done";
                    "agent-pending": "agent-pending";
                    "agent-unknown": "agent-unknown";
                    "awaiting-approval": "awaiting-approval";
                    coordinating: "coordinating";
                    "delivery-failed": "delivery-failed";
                    exhausted: "exhausted";
                    retrying: "retrying";
                    "waiting-user": "waiting-user";
                }>>;
                handlingNote: z.ZodOptional<z.ZodString>;
                retryAt: z.ZodOptional<z.ZodNumber>;
                reportId: z.ZodOptional<z.ZodString>;
                session: z.ZodOptional<z.ZodString>;
                delegationId: z.ZodOptional<z.ZodString>;
                at: z.ZodNumber;
            }, z.core.$strip>>;
            source: z.ZodOptional<z.ZodString>;
            logDir: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>>;
        repair: z.ZodOptional<z.ZodObject<{
            rounds: z.ZodNumber;
            source: z.ZodString;
            delegationId: z.ZodOptional<z.ZodString>;
            lastFailure: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$loose>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const candidateDetail: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
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
        feedbackSignature: z.ZodOptional<z.ZodObject<{
            signature: z.ZodString;
            reportId: z.ZodString;
        }, z.core.$strip>>;
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
            handling: z.ZodOptional<z.ZodEnum<{
                agent: "agent";
                "agent-done": "agent-done";
                "agent-pending": "agent-pending";
                "agent-unknown": "agent-unknown";
                "awaiting-approval": "awaiting-approval";
                coordinating: "coordinating";
                "delivery-failed": "delivery-failed";
                exhausted: "exhausted";
                retrying: "retrying";
                "waiting-user": "waiting-user";
            }>>;
            handlingNote: z.ZodOptional<z.ZodString>;
            retryAt: z.ZodOptional<z.ZodNumber>;
            reportId: z.ZodOptional<z.ZodString>;
            session: z.ZodOptional<z.ZodString>;
            delegationId: z.ZodOptional<z.ZodString>;
            at: z.ZodNumber;
        }, z.core.$strip>>;
        source: z.ZodOptional<z.ZodString>;
        logDir: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>>;
    repair: z.ZodOptional<z.ZodObject<{
        rounds: z.ZodNumber;
        source: z.ZodString;
        delegationId: z.ZodOptional<z.ZodString>;
        lastFailure: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$loose>>, "query">;
export declare const outbox: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@dsh-workbench/runtime").PageSchema<import("@dsh-workbench/runtime").ProjectedSchema<z.ZodObject<{
    deliveryBlocked: z.ZodOptional<z.ZodString>;
    deliveryAttempt: z.ZodOptional<z.ZodNumber>;
    attemptedAt: z.ZodOptional<z.ZodNumber>;
    delegationId: z.ZodOptional<z.ZodString>;
    standalone: z.ZodOptional<z.ZodBoolean>;
    autoRepair: z.ZodOptional<z.ZodBoolean>;
    kind: z.ZodLiteral<"delivery-feedback">;
    status: z.ZodEnum<{
        failed: "failed";
        passed: "passed";
        unchecked: "unchecked";
    }>;
    subject: z.ZodString;
    summary: z.ZodString;
    userRequested: z.ZodOptional<z.ZodBoolean>;
    observedAt: z.ZodOptional<z.ZodNumber>;
    source: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    candidateKey: z.ZodString;
    revision: z.ZodString;
    commits: z.ZodOptional<z.ZodArray<z.ZodString>>;
    surface: z.ZodString;
    runId: z.ZodString;
    diagnostics: z.ZodString;
    repairable: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    project: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "candidateKey" | "deliveryBlocked" | "status" | "subject" | "summary" | "title">>, "query">;
export declare const report: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
    surface: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodUnknown, "query">;
export declare const feedbackReport: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodObject<{
    deliveryBlocked: z.ZodOptional<z.ZodString>;
    deliveryAttempt: z.ZodOptional<z.ZodNumber>;
    attemptedAt: z.ZodOptional<z.ZodNumber>;
    id: z.ZodString;
    delegationId: z.ZodOptional<z.ZodString>;
    standalone: z.ZodOptional<z.ZodBoolean>;
    autoRepair: z.ZodOptional<z.ZodBoolean>;
    kind: z.ZodLiteral<"delivery-feedback">;
    status: z.ZodEnum<{
        failed: "failed";
        passed: "passed";
        unchecked: "unchecked";
    }>;
    subject: z.ZodString;
    summary: z.ZodString;
    userRequested: z.ZodOptional<z.ZodBoolean>;
    observedAt: z.ZodOptional<z.ZodNumber>;
    source: z.ZodOptional<z.ZodString>;
    originNoteId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    candidateKey: z.ZodString;
    revision: z.ZodString;
    commits: z.ZodOptional<z.ZodArray<z.ZodString>>;
    surface: z.ZodString;
    runId: z.ZodString;
    diagnostics: z.ZodString;
    repairable: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    project: z.ZodOptional<z.ZodString>;
}, z.core.$loose>>, "query">;
export declare const gameInstallation: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    adapter: z.ZodOptional<z.ZodString>;
    gameRoot: z.ZodOptional<z.ZodString>;
    gameCommit: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const playGame: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    commit: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    entry: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<{
            encounter: "encounter";
            map: "map";
            story: "story";
        }>;
        resourceId: z.ZodString;
        nodeId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    originNoteId: z.ZodOptional<z.ZodString>;
    delegationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    candidate: z.ZodObject<{
        key: z.ZodString;
    }, z.core.$strip>;
    accepted: z.ZodBoolean;
}, z.core.$loose>, "action">;
