import { z } from '@dsh-workbench/runtime';
import { candidateInputSchema, candidateSchema, dataSchema, feedbackSchema } from './schemas';
export { validateCandidateIdentity, previewRows, rowState } from './projection';
export type { PreviewRow } from './projection';
/** The schema is the only source for persisted candidates and provider-owned status. */
export type CandidateInput = z.infer<typeof candidateInputSchema>;
export type CandidateSpec = z.infer<typeof candidateSchema>;
export type SurfaceStatus = NonNullable<CandidateSpec['status']>[string];
export type SurfacePhase = SurfaceStatus['phase'];
export type SurfaceStep = NonNullable<SurfaceStatus['steps']>[number];
export type SurfaceFailure = NonNullable<SurfaceStatus['failure']>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type Data = z.infer<typeof dataSchema>;
export declare const note: import("@dsh-workbench/runtime").NoteModel<{
    readonly candidates: {
        readonly schema: z.ZodObject<{
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
        }, z.core.$loose>;
        readonly indexes: readonly [readonly ["receivedAt"], readonly ["originNoteId", "delegationId"], readonly ["featureId"]];
    };
    readonly archivedCandidates: {
        readonly schema: z.ZodObject<{
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
        }, z.core.$loose>;
        readonly indexes: readonly [readonly ["receivedAt"], readonly ["originNoteId", "delegationId"], readonly ["featureId"]];
    };
    readonly outbox: {
        readonly schema: z.ZodObject<{
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
        }, z.core.$loose>;
        readonly indexes: readonly [readonly ["candidateKey"], readonly ["observedAt"]];
    };
    readonly feedbackHistory: {
        readonly schema: z.ZodObject<{
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
        }, z.core.$strip>;
        readonly indexes: readonly [readonly ["observedAt"]];
    };
    readonly metadata: {
        schema: z.ZodObject<{
            title: z.ZodString;
            attached: z.ZodArray<z.ZodString>;
            feedbackError: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    };
}, z.ZodObject<{
    connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        provider: z.ZodString;
        connectionId: z.ZodString;
    }, z.core.$strip>>>;
    gameRoot: z.ZodOptional<z.ZodString>;
    gameCommit: z.ZodOptional<z.ZodString>;
    adapter: z.ZodOptional<z.ZodString>;
    previewDesk: z.ZodOptional<z.ZodObject<{
        home: z.ZodString;
        cli: z.ZodString;
    }, z.core.$strip>>;
    feedbackInTodo: z.ZodOptional<z.ZodBoolean>;
    projectId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodObject<{
        todo: z.ZodOptional<z.ZodString>;
        execution: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>>;
