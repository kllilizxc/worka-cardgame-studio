import { type QueryStateSource } from '@dsh-workbench/react';
type PreviewTask = {
    id: string;
    label: string;
    surfaces: string[];
    status: 'pending' | 'running' | 'completed' | 'failed' | 'unknown' | 'skipped';
    error?: string;
};
import type { PreviewProgress } from '@dsh-workbench/runtime';
import type { CandidateSpec, Feedback } from './model';
export type CandidateSummary = CandidateSpec;
export type FeedbackSummary = Pick<Feedback, 'id' | 'candidateKey' | 'subject' | 'summary' | 'status' | 'deliveryBlocked' | 'title'>;
type DisplayCandidate = CandidateSpec | CandidateSummary;
type DisplayStatus = NonNullable<DisplayCandidate['status']>[string];
type DisplayData = {
    title: string;
    candidates: DisplayCandidate[];
    archivedCandidates?: DisplayCandidate[];
    outbox?: Array<Feedback | FeedbackSummary>;
    feedbackError?: string | null;
};
export declare const STATUS: Record<string, string>;
export declare const TONE: Record<string, string>;
export declare const TONE_BG: Record<string, string>;
/** Matches the workbench shell so the note does not look like a foreign panel. */
export declare const FONT = "var(--wb-font-family, -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", sans-serif)";
export declare const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
export declare const DEVICES: readonly [{
    readonly key: 'desktop';
    readonly label: 'desktop';
    readonly maxWidth: 'none';
}, {
    readonly key: 'phone';
    readonly label: 'phone';
    readonly maxWidth: '390px';
}, {
    readonly key: 'pad';
    readonly label: 'pad';
    readonly maxWidth: '768px';
}];
type DeviceKey = typeof DEVICES[number]['key'];
type PendingOperation = {
    status: string;
};
type Row = {
    operationId?: string;
    activeOperation?: boolean;
    tasks?: PreviewTask[];
    tasksDeferred?: boolean;
    diagnostics?: {
        stage?: string;
        log?: string;
    };
    logPath?: string;
    startedAt?: number;
    progress?: PreviewProgress;
    feedback?: {
        state: string;
        summary?: string;
        checkedAt?: number;
    };
    surface?: string;
    spec: DisplayCandidate;
    owner: DisplayCandidate;
    name: string;
    group: string;
    groupName: string;
    status: string;
    url: string;
    error?: string;
    live: boolean;
    host?: DisplayStatus;
};
/** Rows render the host's status as-is; the view never infers process state. */
export declare function previewRows(data: DisplayData, pending?: Record<string, PendingOperation>): Row[];
export declare function feedbackLabel(state: string): string;
export declare function canViewPreview(status: string): boolean;
export declare function featureStatus(rows: Row[], operations?: Record<string, PendingOperation>): string;
/** Compact lists show what is running or needs attention before stopped candidates. */
export declare function compactRank(rows: {
    status: string;
}[]): number;
export declare function featureTitle(value: string): string;
export declare function navigationUrl(value: string, base: string): string;
export declare const GLYPH: {
    readonly play: 'M8 5.5v13l11-6.5z';
    readonly stop: 'M7 7h10v10H7z';
    readonly reload: 'M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5';
    readonly external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6';
    readonly link: 'M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1 1M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1-1';
    readonly close: 'M6 6l12 12M18 6L6 18';
    readonly fullscreen: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5';
    readonly more: 'M5 12h.01M12 12h.01M19 12h.01';
    readonly deviceDesktop: 'M4 5h16v11H4zM8 20h8M12 16v4';
    readonly devicePhone: 'M8 3.5h8v17H8zM11 17.5h2';
    readonly devicePad: 'M5 3.5h14v17H5zM11 17.5h2';
    readonly refresh: 'M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5';
    readonly warning: 'M12 3.5 21 19H3zM12 9v4.5M12 16.5h.01';
    readonly report: 'M9 4.5h6v3H9zM7.5 6H5.5v14.5h13V6h-2M9 13.5l2 2 4-4.5';
};
export declare function Glyph({ path, size, filled }: {
    path: string;
    size?: number;
    filled?: boolean;
}): import("react").JSX.Element;
export declare function TransportButton({ path, filled, label, primary, onClick, disabled, loading }: {
    path: string;
    filled?: boolean;
    label: string;
    primary?: boolean;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
}): import("react").JSX.Element;
export declare function DeviceSwitcher({ device, onClick }: {
    device: DeviceKey;
    onClick: () => void;
}): import("react").JSX.Element;
export declare function PreviewLoading({ progress, status, startedAt, tasks, tasksDeferred }: {
    progress?: PreviewProgress;
    status: string;
    startedAt?: number;
    tasks?: PreviewTask[];
    tasksDeferred?: boolean;
}): import("react").JSX.Element;
export declare function failureMessage(row: Row, error: string): {
    title: string;
    description: string;
    reason: string;
};
/** Structured handoff keeps arbitrary candidate/surface names unambiguous. */
export declare function previewFocus(key: string, surface?: string): string;
export declare function usePreviewModel(): {
    reportOpen: boolean;
    setReportOpen: (value: boolean) => void;
    copyLanAddress: () => Promise<void>;
    lanCopying: boolean;
    mutations: {
        start: import("@dsh-workbench/react").Mutation<{
            key: string;
            surface?: string | undefined;
            restart?: boolean | undefined;
        }, {
            [x: string]: unknown;
            accepted: boolean;
            key: string;
            desired: "running" | "stopped";
        }>;
        repair: import("@dsh-workbench/react").Mutation<{
            key: string;
            surface?: string | undefined;
        }, {
            [x: string]: unknown;
            accepted: boolean;
            session?: string | undefined;
            reason?: string | undefined;
        }>;
        verify: import("@dsh-workbench/react").Mutation<{
            key: string;
            surface?: string | undefined;
        }, {
            [x: string]: unknown;
            accepted: boolean;
        }>;
        stop: import("@dsh-workbench/react").Mutation<{
            key: string;
            surface?: string | undefined;
        }, {
            [x: string]: unknown;
            accepted: boolean;
            key: string;
            desired: "running" | "stopped";
        }>;
        check: import("@dsh-workbench/react").Mutation<{
            key: string;
            surface?: string | undefined;
        }, {
            [x: string]: unknown;
            accepted: boolean;
        }>;
        archive: import("@dsh-workbench/react").Mutation<{
            key: string;
        }, {
            [x: string]: unknown;
            archived: boolean;
            key?: string | undefined;
            reason?: string | undefined;
        }>;
        restore: import("@dsh-workbench/react").Mutation<{
            key: string;
        }, {
            [x: string]: unknown;
            restored: boolean;
            key?: string | undefined;
            reason?: string | undefined;
        }>;
        forget: import("@dsh-workbench/react").Mutation<{
            key: string;
        }, {
            [x: string]: unknown;
            removed: boolean;
            reason?: string | undefined;
        }>;
    };
    focusPending: boolean;
    focusLoading: boolean;
    focusError: Error | undefined;
    focusMissing: boolean;
    dismissFocus: () => void;
    previewTarget: (row: Row) => string;
    query: QueryStateSource<unknown>;
    queryLoading: boolean;
    queryError: Error | undefined;
    page: import("@dsh-workbench/react").PagedQueryResult<{
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
    }>;
    archivePage: import("@dsh-workbench/react").PagedQueryResult<{
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
    }>;
    embedRows: Row[];
    closePreview: (key: string) => void;
    shared: boolean;
    config: Readonly<Partial<{
        connections?: Record<string, {
            provider: string;
            connectionId: string;
        }> | undefined;
        gameRoot?: string | undefined;
        gameCommit?: string | undefined;
        adapter?: string | undefined;
        coverAsset?: string | undefined;
        previewDesk?: {
            home: string;
            cli: string;
        } | undefined;
        feedbackInTodo?: boolean | undefined;
        projectId?: string | undefined;
        notes?: {
            todo?: string | undefined;
            execution?: string | undefined;
        } | undefined;
    }>>;
    gameInstallation: import("@dsh-workbench/react").QueryResult<{
        adapter?: string | undefined;
        gameRoot?: string | undefined;
        gameCommit?: string | undefined;
        coverAsset?: string | undefined;
    }, {
        adapter?: string | undefined;
        gameRoot?: string | undefined;
        gameCommit?: string | undefined;
        coverAsset?: string | undefined;
    }>;
    refreshState: () => Promise<void>;
    mode: import("@dsh-workbench/react/internal").WidgetMode;
    data: DisplayData;
    actions: import("@dsh-workbench/react").NoteActions<typeof import("./actions"), "action">;
    workbench: {
        openLinkedNote: (key: string, direction: "source" | "target") => Promise<void>;
        openSetup: () => Promise<void>;
        setCompactSurface: (surface: "card" | "transparent") => Promise<void>;
        openSession: (sessionId: string) => Promise<void>;
        openNote: (noteId: string, itemId?: string) => Promise<void>;
        copyText: (text: string) => Promise<void>;
        openExternal: (url: string) => Promise<void>;
        holdBackground: (spec: Parameters<import("@dsh-workbench/runtime/internal").Runtime["background"]["hold"]>[0]) => Promise<{
            accepted: boolean;
            key: string;
        }>;
        releaseBackground: (key: string) => Promise<{
            released: boolean;
            key: string;
        }>;
        listBackground: () => Promise<import("@dsh-workbench/runtime/internal").BackgroundEntry[]>;
        resources: import("@dsh-workbench/runtime/internal").ResourcesClient;
        resolvePreviewUrl: (url: string) => Promise<string>;
    };
    stage: import("react").RefObject<HTMLDivElement | null>;
    operations: Record<string, PendingOperation>;
    collapsed: string[];
    setCollapsed: import("react").Dispatch<import("react").SetStateAction<string[]>>;
    menu: boolean;
    setMenu: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    showAddress: boolean;
    setShowAddress: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    showArchive: boolean;
    setShowArchive: (value: boolean) => void;
    setUrls: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>;
    draft: string;
    setDraft: import("react").Dispatch<import("react").SetStateAction<string>>;
    fullscreen: boolean;
    device: "desktop" | "pad" | "phone";
    error: string;
    setError: (value: string) => void;
    setActiveKey: (key: string | undefined) => void;
    loaded: string[];
    reload: Record<string, number>;
    confirmForget: string | null;
    setConfirmForget: import("react").Dispatch<import("react").SetStateAction<string | null>>;
    run: (fn: () => Promise<unknown>) => void;
    archived: {
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
    }[];
    rows: Row[];
    current: Row | undefined;
    currentIsCandidate: boolean;
    resolvedUrls: Record<string, string>;
    accessKey: (row: Row) => string;
    currentUrl: string;
    accessError: string;
    activeDevice: {
        readonly key: 'desktop';
        readonly label: 'desktop';
        readonly maxWidth: 'none';
    } | {
        readonly key: 'phone';
        readonly label: 'phone';
        readonly maxWidth: '390px';
    } | {
        readonly key: 'pad';
        readonly label: 'pad';
        readonly maxWidth: '768px';
    };
    cycleDevice: () => void;
    groups: {
        key: string;
        rows: Row[];
    }[];
    availableFeatures: number;
    effectiveStatus: string;
    repairButton: (row: Row) => import("react").JSX.Element | null;
    label: (spec: DisplayCandidate) => string;
    attach: (key: string) => void;
    reloadFrame: (key: string) => void;
    startAndAttach: (key: string) => void;
    startGroupAndAttach: (rows: Row[], selected: Row) => void;
    openDelegation: (spec: DisplayCandidate) => void;
    draftTodo: () => void;
    attachedHere: boolean;
    layout: Readonly<import("@dsh-workbench/react/internal").WidgetLayout>;
    metadata: import("@dsh-workbench/runtime").NoteMetadata & {
        id: string;
    };
};
export type PreviewModel = ReturnType<typeof usePreviewModel>;
export {};
