# Candidate preview

An ABI 4 note whose native collections are its only business store. `model.ts` declares each row schema; the host uses the published contract to commit candidate and event records through one native transaction. Actions call the preview provider, explicit queries drive the React view. The install trigger reconnects the host observer; note workers do not remain resident.

New projects must use a version:3 `preview.config.mjs` with evidence-backed
`isolation` and per-surface `verify` hooks. Start from `templates/preview-project`
and consult the types exported by `@realiz3r/worka-runtime/preview`. Worka owns workspaces, ports, cancellation,
processes and cleanup.

`candidates` are launch options for a project preview. They can be delivered over a
registered work connection by a linked Todo task, or registered standalone by any
note or conversation: the sender verifies the actual candidate commit/worktree and
supplies `{key, adapter, repos}` (or `{key, adapter, cwd, revision}` for one repository). A candidate synced from a
delegation also carries `originNoteId` and `delegationId`; those are optional
provenance, used to resolve the current owning task session and to let the
view jump back to its delegation. Delegation-sourced candidates use the delegation
id as their key (additional options use `delegationId#2`, `delegationId#3`, …);
standalone candidates use a self-chosen stable key. `title` names the option in the
list. Provenance is optional but never silently dropped: an update or retry reuses
the same key and, when it already exists, the same source identity.
`status[surface]` is written only by the host: phase, steps, URL, project checks and failure facts and logs. The view renders it as-is.
`attached` is a durable record maintained by `attach({key, attached})` and cleared
by `forget`. The current interface retains up to two pages opened in this session;
it does not automatically restore historical `attached` entries.

Expanded mode groups short surface tabs by `featureId`, falling back to the producing
note/delegation. Groups fold while keeping the selected tab visible. Adapter launch
options disappear from the tab strip once their surfaces exist. The toolbar contains
one play/stop control, page reload, an editable URL (Enter navigates, Escape resets),
fullscreen, and a More menu for source, process refresh, archive/restore/delete and
a visible link for opening another browser tab. Address edits are local to this view and never alter
launch/readiness URLs. Only HTTP(S) navigation is accepted; the selected running page displays inline without an embed declaration.
Starting immediately displays an in-flight spinner and prevents duplicate actions;
a separate loading indicator remains until the embedded frame loads. Fullscreen
requires the host note iframe to allow fullscreen and exits with Escape.
Compact mode stays a small light list: title, counts, and one status row per
option.

The host serves note views from the loopback alias the interface itself does not
use (interface on `127.0.0.1`, views on `localhost`), and gives
the isolated alias `sandbox allow-scripts allow-same-origin allow-forms
allow-popups allow-popups-to-escape-sandbox` while the canonical alias keeps the
opaque sandbox. An embedded frame therefore keeps its own origin, so
localStorage, cookies and forms work, and the interface origin and its API token
stay out of reach. Measured against a real candidate: embedded from the isolated
alias the app renders and `sessionStorage` works; embedded from the canonical
alias it stays blank (`typeof sessionStorage` throws in a sandboxed document).
A `sandbox` attribute on the nested element cannot restore either behaviour.

## Lifecycle

Recording is not running. `receive` stores the candidate; `start: true` (or the play
button) sets the desired state to running, and the host converges on it:
materialize Worka-owned worktrees at the exact commits, allocate ports, run the
project's preflight and preparation, start services in dependency order, wait for
readiness, then run the project's checks. `stop` sets the desired state to stopped
and preempts a start in flight. The host keeps converging afterwards: a crashed
service is restarted, a host restart restores running previews, and orphans left by
a host crash are reclaimed when they provably belong to the candidate's workspace.

Never start your own dev server for a candidate: the host owns every process, port
and workspace, and a stray process only makes the host move to another port.

## Failures

The runner retains failure facts, diagnostics and check results. The registering agent reads them directly. For later help, send an ordinary message from the expanded note's composer to the record owner; the session target chip also opens that conversation.

Start and stop apply to the whole candidate. Docker containers survive host shutdown;
explicit stop or archive releases them. The page is available as soon as its service is
ready, while business checks run separately. Project startup must rebuild from exact
source commits when caches are missing.

Controls from the source task: `receive({operation:'stop'|'restart', key, originNoteId,
delegationId})` must match the saved source. Renaming uses
`receive({operation:'rename', originNoteId, delegationId, title})` or
`receive({operation:'rename', key, title})` and never touches the lifecycle.

The contract for project modules, state and failure handling is in
`@realiz3r/worka-runtime/preview` types and `templates/preview-project`.


## On-demand reads and retained views

- The owner interface uses explicit `summary` and `candidates` queries with page sizes bounded by the host budget. Previous and next page controls are explicit; the first page is not the whole history.
- To locate a candidate across pages, bounded `candidateDetail` projects its summary by primary key without scanning every page. Loading, read failure and missing candidates are shown explicitly; none is replaced with another first-page candidate.
- `archivedCandidates` is read only when the archive menu opens. The preview interface neither shows a diagnostics panel nor subscribes to diagnostic reports. Checks, steps and logs remain available through the existing query contract for connection troubleshooting.
- Compact and expanded use the same SDK iframe and on-demand entry. Until expanded, the detail module is not imported, previews are not instantiated, and archive or diagnostic fields are not read. Shared access continues through the authorization-filtered `view` query and cannot call owner collection interfaces.
- The current session retains at most two previews actually opened by the user; historical `attached` entries do not automatically restore. Switching to an open page updates recency. Opening a third releases the least recently used page and its embedded reference. Ordinary collapse and pagination retain both pages. Reopening an evicted page reloads it and may reset unsaved forms and scroll position. Closing a preview closes only the page; use the existing stop action to stop the process.
- A user start preempts an earlier cold-start slot, and the preempted candidate continues in the background. Ready containers are reused. Only one starting candidate is preempted at a time; rapid switching changes only the owner of the next slot.
- Candidate IDs and start/stop/check/archive actions remain. Existing candidate rows tolerate unknown legacy fields.

## Shared local previews

An instance may configure `previewDesk: {home, cli}` with absolute paths to an existing preview-desk data directory and its CLI. The shared desk owns registration and service processes; Worka uses its own note actions and keeps a display projection and task associations. Independent previews appear in the same list. Closing Worka releases its subscription, while the shared desk continues running.

The bundled extension's `previewDesk` option supplies the same default for all preview notes, including newly created ones; a note can explicitly override it. Keep the directory and CLI in the user's local profile, not the published package.

Before enabling this for an existing instance, export its active and archived candidate sources, stop its native previews, register the pinned sources with the shared desk, and retain a recovery snapshot. Set the configuration only after both runtimes support the shared registration API. Do not copy live PIDs, ready flags, or process records into the new owner. Only resume previews whose actual running services were confirmed before the handoff.

## Routes

In `routes.tsx`, `/candidates/:candidateId` uses the real candidate key. `surface` selects the preview surface, `tab=logs` shows checks and diagnostics, and `device=phone|pad` and `archived=1` restore presentation. `candidateDetail` can locate a candidate by ID outside the current page or in the archive. Opening a URL only reads state; starting, stopping and archiving remain explicit user actions.
