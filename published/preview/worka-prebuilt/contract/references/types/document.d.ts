import type { CandidateSpec } from './model';
/** Keep list rendering independent of log/report size; the full document remains canonical. */
export declare function candidateSummary(candidate: CandidateSpec): CandidateSpec;
export declare function candidateDocument(candidate: CandidateSpec): any;
