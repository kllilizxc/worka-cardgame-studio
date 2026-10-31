# Candidate preview

An ABI 3 note whose native collections are its only business store. `model.ts` declares each row schema; the host uses the published contract to commit candidate, outbox, history and event records through one native transaction. Actions call the preview provider, mutations record feedback receipts, and explicit queries drive the React view. The install trigger reconnects the host observer; note workers do not remain resident.

New projects must use a version:3 `preview.config.mjs` with evidence-backed
`isolation` and per-surface `verify` hooks. Start from `templates/preview-project`
and consult the types exported by `@dsh-workbench/runtime/preview`. Worka owns workspaces, ports, cancellation,
processes and cleanup.

`candidates` are launch options for a project preview. They can be delivered over a
registered work connection by a linked Todo task, or registered standalone by any
note or conversation: the sender verifies the actual candidate commit/worktree and
supplies `{key, adapter, repos}` (or `{key, adapter, cwd, revision}` for one repository). A candidate synced from a
delegation also carries `originNoteId` and `delegationId`; those are optional
provenance, used to route failure feedback back to the source task and to let the
view jump back to its delegation. Delegation-sourced candidates use the delegation
id as their key (additional options use `delegationId#2`, `delegationId#3`, …);
standalone candidates use a self-chosen stable key. `title` names the option in the
list. Provenance is optional but never silently dropped: an update or retry reuses
the same key and, when it already exists, the same source identity.
`status[surface]` is written only by the host: phase, steps, URL, project checks and, on failure, who is handling it. The view renders it as-is.
`attached` is the durable set of options the user opened in the embedded frame:
closing the detail destroys the note view, so the set — not React state — is what
lets the frame come back on reopen while the selected running page opens automatically.
`attach({key, attached})` maintains it; `forget` clears it with the option.

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

Every actual failure is reported once to the existing connection. The connection inspects
the current candidate and logs, then either invokes preview start/stop for an environment
problem or sends a code problem to the execution task. Preview does not run a separate
repair scheduler or poll task acknowledgements. Failed delivery retains its original
report ID and specific error for an explicit transport retry.

Start and stop apply to the whole candidate. Docker containers survive host shutdown;
explicit stop or archive releases them. The page is available as soon as its service is
ready, while business checks run separately. Project startup must rebuild from exact
source commits when caches are missing.

Controls from the source task: `receive({operation:'stop'|'restart', key, originNoteId,
delegationId})` must match the saved source. Renaming uses
`receive({operation:'rename', originNoteId, delegationId, title})` or
`receive({operation:'rename', key, title})` and never touches the lifecycle.

The contract for project modules, state and failure handling is in
`@dsh-workbench/runtime/preview` types and `templates/preview-project`.


## 按需读取与前端保留

- 所有者界面使用显式 `summary` 与 `candidates` 查询，页大小由宿主预算控制。页面明确提供上一页、下一页；第一页不代表全部历史。
- 跨页定位使用有界 `candidateDetail` 按主键投影读取指定候选摘要；不会扫描所有分页。加载中、读取失败与候选不存在会明确显示，不会替换成第一页的其他候选。
- 归档菜单打开后才读取 `archivedCandidates`。预览界面不显示诊断面板，也不订阅诊断报告；检查、步骤和日志仍由原查询契约提供给连线定位故障。
- compact 与 expanded 使用 SDK 的同一 iframe 与按需入口。未展开不会导入详情模块、实例化预览或读取归档／诊断字段。共享访问继续走原来的授权裁剪 `view` 查询，不能调用所有者集合接口。
- 本次会话只保留用户实际打开的最多两个预览，历史 `attached` 不会自动恢复。切换到已打开页面会更新最近使用顺序；打开第三个时自动释放最久未使用的页面及其嵌入引用。普通收起与分页保留这两个页面，淘汰后重新打开会重载，未提交表单和滚动位置可能重置。关闭预览只关闭页面，停止进程仍用原来的停止操作。
- 用户启动抢占较早的冷启动名额，被抢占的候选回到后台继续；已就绪的容器直接复用。一次只撤销一个正在启动的候选，快速切换只更新下一个名额的归属。
- 候选 ID、启动／停止／检查／修复／归档动作保留；旧 state 与 KV 数据须显式迁移到集合，更新不保留双写镜像。

## Shared local previews

An instance may configure `previewDesk: {home, cli}` with absolute paths to an existing preview-desk data directory and its CLI. The shared desk owns registration and service processes; Worka uses its own note actions and keeps a display projection and task associations. Independent previews appear in the same list. Closing Worka releases its subscription, while the shared desk continues running.

The bundled extension's `previewDesk` option supplies the same default for all preview notes, including newly created ones; a note can explicitly override it. Keep the directory and CLI in the user's local profile, not the published package.

Before enabling this for an existing instance, export its active and archived candidate sources, stop its native previews, register the pinned sources with the shared desk, and retain a recovery snapshot. Set the configuration only after both runtimes support the shared registration API. Do not copy live PIDs, ready flags, or process records into the new owner. Only resume previews whose actual running services were confirmed before the handoff.

## 页面地址

`routes.tsx` 的 `/candidates/:candidateId` 使用真实候选 key，`surface` 指定预览端，`tab=logs` 显示检查与诊断；`device=phone|pad` 与 `archived=1` 可恢复展示。按 ID 的 `candidateDetail` 可以定位分页外或归档候选。打开地址只读取状态，启动、停止和归档仍由用户显式操作。
