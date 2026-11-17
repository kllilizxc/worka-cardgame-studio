import { z } from '@realiz3r/worka-runtime';
import { candidateInputSchema, candidateSchema, dataSchema } from './schemas';
export { validateCandidateIdentity, previewRows, rowState } from './projection';
export type { PreviewRow } from './projection';
/** The schema is the only source for persisted candidates and provider-owned status. */
export type CandidateInput = z.infer<typeof candidateInputSchema>;
export type CandidateSpec = z.infer<typeof candidateSchema>;
export type SurfaceStatus = NonNullable<CandidateSpec['status']>[string];
export type SurfacePhase = SurfaceStatus['phase'];
export type SurfaceStep = NonNullable<SurfaceStatus['steps']>[number];
export type SurfaceFailure = NonNullable<SurfaceStatus['failure']>;
export type Data = z.infer<typeof dataSchema>;
export declare const note: import("@realiz3r/worka-runtime").NoteModel<{
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
        }, z.core.$loose>;
        readonly indexes: readonly [readonly ["receivedAt"], readonly ["originNoteId", "delegationId"], readonly ["featureId"]];
    };
    readonly metadata: {
        schema: z.ZodObject<{
            title: z.ZodString;
            attached: z.ZodArray<z.ZodString>;
        }, z.core.$loose>;
    };
}, z.ZodObject<{
    previewDesk: z.ZodOptional<z.ZodObject<{
        home: z.ZodString;
        cli: z.ZodString;
    }, z.core.$strip>>;
    notes: z.ZodOptional<z.ZodObject<{
        todo: z.ZodOptional<z.ZodString>;
        execution: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>>;
