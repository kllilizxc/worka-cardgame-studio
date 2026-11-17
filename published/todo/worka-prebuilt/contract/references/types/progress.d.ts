import { type z } from '@realiz3r/worka-runtime';
import type { unblockProposalSchema, TodoItem } from './model';
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
/** Preserve an existing receipt identity when the same blocker is recorded again. */
export declare function unblockForProgress(item: TodoItem, proposal: z.infer<typeof unblockProposalSchema> | undefined, noteId: string, revision: string): {
    label: string;
    target: {
        noteId: string;
    };
    request: string;
    requestId: string;
} | undefined;
