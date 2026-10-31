export type ProgressStatus = 'todo' | 'in_progress' | 'blocking' | 'done';
export type ProgressSource = 'recordProgress' | 'feedback' | 'current';
export type ProgressEntry = {
    id: string;
    itemId: string;
    status?: ProgressStatus;
    summary: string;
    conclusion?: string;
    recordedAt?: number;
    revision?: string;
    source: ProgressSource;
    taskId?: string;
    sourceId?: string;
};
/** Equality ignores formatting, never changes the preserved original. */
export declare const progressTextIdentity: (text?: string) => string;
export declare function sameProgress(a: {
    status?: string;
    conclusion?: string;
}, b: {
    status?: string;
    conclusion?: string;
}): boolean;
export declare const progressSummaryLimit: (text: string) => 100 | 180;
/** A bounded excerpt, not an inferred verdict. The complete conclusion stays separate. */
export declare function shortProgressText(text: string): string;
/** Preserve repeated results at different times; collapse only the same stored/observed fact. */
export declare function projectProgressEntries(entries: readonly ProgressEntry[]): ProgressEntry[];
