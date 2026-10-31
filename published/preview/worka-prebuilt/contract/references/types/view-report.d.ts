import type { CandidateSpec } from './model';
import type { FeedbackSummary } from './view-model';
export declare function FeedbackReport({ item }: {
    item: FeedbackSummary;
}): import("react").JSX.Element;
/** Mounted only when the user opens a report; list queries never transfer logs. */
export declare function CandidateReport({ candidate, surface }: {
    candidate: CandidateSpec;
    surface?: string;
}): import("react").JSX.Element;
