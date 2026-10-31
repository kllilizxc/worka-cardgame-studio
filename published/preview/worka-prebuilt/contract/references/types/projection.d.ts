import type { CandidateInput, CandidateSpec, SurfaceStatus, Data } from './model';
/**
 * Candidates may be registered standalone (any note or conversation) or synced from a delegation.
 * Standalone keys are self-chosen; delegation-sourced keys stay anchored to that delegation so
 * results route back to the original task. Provenance is optional metadata, never a requirement.
 */
export declare function validateCandidateIdentity(input: Partial<Pick<CandidateInput, 'key' | 'delegationId' | 'originNoteId'>>): void;
/** One row per surface, exactly as the host reported it. */
type RowStatus = Pick<SurfaceStatus, 'phase' | 'url' | 'pass' | 'since' | 'updatedAt'> & {
    verified?: {
        ok: boolean;
    };
    failure?: Pick<NonNullable<SurfaceStatus['failure']>, 'step' | 'handling'>;
};
type RowCandidate = Pick<CandidateSpec, 'key' | 'title' | 'surfaces' | 'desired'> & {
    status?: Record<string, RowStatus>;
};
export type PreviewRow<C extends RowCandidate = CandidateSpec> = {
    candidate: C;
    surface: string;
    name: string;
    url?: string;
    status?: NonNullable<C['status']>[string];
    desired: NonNullable<CandidateSpec['desired']>[string];
};
export declare function previewRows<C extends RowCandidate>(data: {
    candidates: C[];
}): PreviewRow<C>[];
/** Stable display state derived only from host status. */
export declare function rowState<C extends RowCandidate>(row: PreviewRow<C>): 'stopped' | 'starting' | 'checking' | 'ready' | 'unchecked' | 'verificationFailed' | 'failed' | 'stopping' | 'repairing' | 'coordinating' | 'repairPending' | 'repairUnknown' | 'waiting';
/** Shared stable-identity projection used by the public query and update checks. */
export declare function candidateSnapshot(state: {
    value: Data;
    revision: string;
}, key: string): {
    candidate: {
        [x: string]: unknown;
        key: string;
        title?: string | undefined;
        originNoteId?: string | undefined;
        delegationId?: string | undefined;
        featureId?: string | undefined;
        adapter?: string | undefined;
        repos?: Record<string, {
            repo: string;
            commit: string;
        }> | undefined;
        options?: Record<string, unknown> | undefined;
        cwd?: string | undefined;
        revision?: string | undefined;
        argv?: string[] | undefined;
        url?: string | undefined;
        readinessPath?: string | undefined;
        embed?: boolean | undefined;
        receivedAt: number;
        desired?: Record<string, "running" | "stopped"> | undefined;
        surfaces?: {
            [x: string]: unknown;
            name: string;
            title?: string | undefined;
            url: string;
        }[] | undefined;
        status?: Record<string, {
            [x: string]: unknown;
            feedbackSignature?: {
                signature: string;
                reportId: string;
            } | undefined;
            phase: "failed" | "preparing" | "queued" | "ready" | "starting" | "stopped" | "stopping" | "verifying";
            url?: string | undefined;
            pass: string;
            since: number;
            updatedAt: number;
            message?: string | undefined;
            steps?: {
                id: string;
                label: string;
                state: "completed" | "failed" | "pending" | "running" | "skipped";
                detail?: string | undefined;
            }[] | undefined;
            verified?: {
                ok: boolean;
                at: number;
                checks: {
                    name: string;
                    ok: boolean;
                    detail?: string | undefined;
                    fix?: string | undefined;
                    evidence?: string | undefined;
                    owner?: "project" | "user" | undefined;
                }[];
            } | undefined;
            failure?: {
                message: string;
                owner: "framework" | "project" | "user";
                step?: string | undefined;
                log?: string | undefined;
                attempts: number;
                handling?: "agent" | "agent-done" | "agent-pending" | "agent-unknown" | "awaiting-approval" | "coordinating" | "delivery-failed" | "exhausted" | "retrying" | "waiting-user" | undefined;
                handlingNote?: string | undefined;
                retryAt?: number | undefined;
                reportId?: string | undefined;
                session?: string | undefined;
                delegationId?: string | undefined;
                at: number;
            } | undefined;
            source?: string | undefined;
            logDir?: string | undefined;
        }> | undefined;
        repair?: {
            rounds: number;
            source: string;
            delegationId?: string | undefined;
            lastFailure?: string | undefined;
        } | undefined;
    };
    revision: string;
} | null;
export {};
