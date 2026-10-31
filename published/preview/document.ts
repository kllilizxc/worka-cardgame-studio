import type {CandidateSpec} from './model';

/** Keep list rendering independent of log/report size; the full document remains canonical. */
export function candidateSummary(candidate: CandidateSpec): CandidateSpec {
  const {options: _options, argv: _argv, ...summary} = candidate;
  return {...summary, ...(candidate.status ? {status: Object.fromEntries(Object.entries(candidate.status).map(([name, status]) => {
    const {failure, verified, steps, ...rest} = status;
    const {log: _log, ...smallFailure} = failure ?? {};
    return [name, {...rest, ...(failure ? {failure: smallFailure} : {}),
      ...(verified ? {verified: {...verified, checks: verified.checks.map(({name, ok}) => ({name, ok}))}} : {}),
      ...(steps ? {steps: steps.map(({id, label, state}) => ({id, label, state}))} : {})}];
  }))} : {})} as CandidateSpec;
}
export function candidateDocument(candidate: CandidateSpec) {
  const {view: _view, id: _id, ...value} = candidate;
  return JSON.parse(JSON.stringify({...value, view: candidateSummary(value as CandidateSpec)}));
}
