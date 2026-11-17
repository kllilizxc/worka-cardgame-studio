import { Input } from "@/components/ui/input";
import { Outlet, useMatch, useRoutes } from 'react-router';
import { routes } from './routes';
import { CandidateReport } from './view-report';
import { RelatedRecords } from './record-links';
import { ManagedEmbed, QueryState, useUi } from '@realiz3r/worka-react';
import { ui } from './messages';
import { Button } from '@/components/ui/button';
import { NoteGuidance, NoteIcon } from '@realiz3r/worka-react';
import type { CSSProperties } from 'react';
import { STATUS, TONE, FONT, MONO, GLYPH, Glyph, TransportButton, DeviceSwitcher, PreviewLoading, failureMessage, canViewPreview, navigationUrl, previewEmbedKey } from './view-model';
import { usePreviewModel } from './view-model';
export default function ExpandedView() { return useRoutes(routes); }
export function PreviewLayout() {
    const model = usePreviewModel();
    useUi(ui);
    const { reportOpen, setReportOpen, copyLanAddress, lanCopying, mutations, shared, config, refreshState, data, workbench, stage, collapsed, setCollapsed, menu, setMenu, showAddress, setShowAddress, showArchive, setShowArchive, setUrls, draft, setDraft, fullscreen, device, error, setError, setActiveKey, confirmForget, setConfirmForget, run, archived, rows, current, currentIsCandidate, currentUrl, accessError, activeDevice, cycleDevice, groups, effectiveStatus, label, attach, reloadFrame, startAndAttach, openDelegation, attachedHere, layout, metadata } = model;
    const { focusPending, focusLoading, focusError, focusMissing, dismissFocus, query, queryLoading, queryError, page, archivePage, embedRows, closePreview, startGroupAndAttach } = model;
    const matches = [useMatch('/notes/:noteId/'), useMatch('/notes/:noteId/candidates/:candidateId')];
    const urlsFor = (row: typeof rows[number]) => model.previewTarget(row);
    // An unresolved command has receipt-check actions, not the provider failure's restart action.
    const uncertainCommands = Object.entries(mutations).flatMap(([name, mutation]) => mutation.outcomes
        .filter(outcome => outcome.input.key === current?.owner.key && mutation.statusFor(outcome.key) === 'unknown')
        .map(outcome => ({ key: `${name}:${outcome.key}`, error: outcome.readError ?? outcome.error, verify: () => mutation.mutate(outcome.input) })));
    const commandUnknown = uncertainCommands.length > 0;
    const busy = !commandUnknown && ['starting', 'stopping', 'checking'].includes(effectiveStatus);
    const cancellable = commandUnknown || Boolean(current?.activeOperation) || ['starting', 'stopping', 'checking', 'unknown'].includes(effectiveStatus);
    const playing = canViewPreview(effectiveStatus) && current?.live && attachedHere;
    const toggle = () => { if (!current)
        return; if (playing || cancellable) {
        void mutations.stop.mutate({ key: current.owner.key }).then(result => { if (result?.accepted)
            closePreview(current.spec.key); });
    }
    else if (canViewPreview(current.status))
        attach(current.spec.key);
    else
        startAndAttach(current.spec.key); };
    const showFailure = Boolean(current && (commandUnknown || !busy && !canViewPreview(current.status) && (current.error || error)));
    const failure = commandUnknown ? { title: ui('操作结果需要核对'), description: ui('尚未确认操作结果，请先核对回执；不会重新发送原操作。'), reason: uncertainCommands[0].error?.message } : current ? failureMessage(current, error) : undefined;
    const toggleFullscreen = () => run(() => document.fullscreenElement ? document.exitFullscreen() : stage.current?.requestFullscreen() ?? Promise.reject(new Error(ui("预览画面尚未就绪"))));
    if (!matches.some(Boolean))
        return <Outlet />;
    return <section className="preview-player" style={{ boxSizing: 'border-box', width: '100%', height: layout?.maxHeight, minHeight: 300, background: 'var(--background)', borderRadius: 14, padding: 10, fontFamily: FONT, fontSize: 13, color: 'var(--foreground)', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, overflow: 'hidden', position: 'relative' }}>
    <style>{`
            .preview-player{--preview-radius:var(--radius,16px);--preview-radius-small:var(--radius-sm,8px)}
      .preview-layout{display:flex;flex:1;min-width:0;min-height:0;gap:14px}
      .preview-tabs{display:flex;flex:0 0 236px;width:236px;min-width:0;min-height:0;overflow-y:auto;overflow-x:hidden;flex-direction:column;align-items:stretch;gap:0;padding:8px 10px 8px 8px;background:var(--card);border-radius:var(--preview-radius-small);box-shadow:var(--shadow-sm);scrollbar-width:thin}
      .preview-sidebar-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:2px 8px 11px;color:var(--foreground);font-size:12px;letter-spacing:.02em;font-weight:600}
      .preview-sidebar-heading span:last-child{min-width:22px;padding:3px 6px;border-radius:999px;background:var(--muted);color:var(--muted-foreground);font-size:12px;text-align:center;font-weight:500;letter-spacing:0}
      .preview-tab-list{display:flex;flex-direction:column;gap:14px;min-width:0}
      .preview-tab-group{display:flex;flex-direction:column;align-items:stretch;gap:5px;padding:0;flex-shrink:0;min-width:0}
      .preview-tab-group-head{display:flex;align-items:center;gap:6px;min-width:0}
      .preview-group-toggle{display:flex;align-items:center;gap:7px;flex:1;min-width:0;border:0;border-radius:9px;background:color-mix(in srgb,var(--preview-tab-color) 12%,transparent);color:var(--preview-tab-color);padding:8px 9px;font:inherit;font-size:12px;cursor:pointer;text-align:left;transition:background .18s ease,color .18s ease,transform .18s ease}
      .preview-group-toggle:hover{background:color-mix(in srgb,var(--preview-tab-color) 19%,transparent);transform:translateX(1px)}
      .preview-group-toggle[aria-expanded="true"]{font-weight:600}
      .preview-group-chevron{flex:0 0 auto;font-size:12px}
      .preview-group-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .preview-group-count{flex:0 0 auto;padding:2px 5px;border-radius:999px;background:color-mix(in srgb,var(--preview-tab-color) 15%,transparent);font-size:12px;line-height:1.2;opacity:.82;white-space:nowrap}
      .preview-group-action{flex:0 0 auto;display:grid;place-items:center;width:32px;height:32px;min-width:32px;border:0;border-radius:9px;background:transparent;color:var(--primary);padding:0;cursor:pointer;transition:background .18s ease,color .18s ease}
      .preview-group-action:hover:not(:disabled){background:var(--accent);color:var(--primary)}
      .preview-group-action:disabled{color:var(--muted-foreground)}
      .preview-tab-row{display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;box-sizing:border-box;min-width:0;min-height:34px;border:0;border-radius:9px;background:transparent;color:var(--muted-foreground);padding:6px 10px;font:inherit;font-size:12px;cursor:pointer;text-align:left;transition:background .18s ease,color .18s ease,transform .18s ease}
      .preview-tab-row:hover:not(:disabled){background:var(--muted);color:var(--foreground);transform:translateX(2px)}
      .preview-tab-row[aria-pressed="true"]{background:var(--muted);color:var(--foreground);font-weight:600;box-shadow:var(--shadow-sm)}
      .preview-status-dot{width:7px;height:7px;flex:0 0 auto;border-radius:999px;background:var(--preview-status-color)}
      .preview-tab-row-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .preview-tab-row::after{content:attr(data-status);margin-left:auto;padding-left:8px;flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;color:var(--preview-status-color)}
      .preview-tab-row[data-tone="stopped"]::after{color:var(--muted-foreground);font-weight:400}
      .preview-pagination{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:auto;padding:12px 2px 2px;color:var(--muted-foreground);font-size:12px}
      .preview-quiet-button{min-height:30px!important;height:30px!important;padding:0 10px!important;border-radius:8px!important;background:transparent!important;color:var(--foreground)!important;font-size:12px!important;font-weight:500!important;box-shadow:none!important;transition:background .18s ease,color .18s ease!important}
      .preview-quiet-button:hover:not(:disabled){background:var(--muted)!important;color:var(--foreground)!important}
      .preview-opened{display:flex;flex-direction:column;gap:6px;padding:12px 8px 2px}
      .preview-opened>span{color:var(--muted-foreground);font-size:12px}
      .preview-opened>div{display:flex;flex-wrap:wrap;gap:6px}
      .preview-opened .preview-quiet-button{background:var(--background)!important;box-shadow:var(--shadow-sm)!important}
      .preview-controls-end{margin-left:auto;display:flex;align-items:center;gap:7px;min-width:0}
      .preview-embed{display:flex;flex-direction:column}
      .preview-embed>iframe{flex:1;min-height:0;width:100%;border:0;background:var(--background)}
      .preview-embed>p{margin:auto;color:var(--muted-foreground);font-size:12.5px}
      .preview-embed>button{align-self:flex-end;margin:6px 8px;min-height:30px;border:0;border-radius:8px;background:transparent;color:var(--muted-foreground);padding:0 10px;font:inherit;font-size:12px;cursor:pointer;transition:background .18s ease,color .18s ease}
      .preview-embed>button:hover{background:var(--muted);color:var(--foreground)}
      .preview-sidebar-empty{padding:12px 8px;color:var(--muted-foreground);font-size:12px}
      .preview-main{display:flex;flex:1;min-width:0;min-height:0;flex-direction:column;gap:10px}
      .preview-controls{padding:0 2px 2px;min-height:36px}
      .preview-execution-button{min-height:34px;border:0;border-radius:10px;background:var(--accent);color:var(--primary);padding:0 12px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;box-shadow:var(--shadow-sm);transition:background .18s ease,color .18s ease,transform .18s ease}
      .preview-execution-button:hover{background:var(--primary);color:var(--primary-foreground);transform:translateY(-1px);box-shadow:var(--shadow-card)}
      .preview-execution-button:active{transform:translateY(0)}
      .preview-transport-button{transition:background .18s ease,color .18s ease,box-shadow .18s ease,transform .18s ease}
      .preview-transport-button:not(:disabled){box-shadow:var(--shadow-sm)}
      .preview-transport-button:not(:disabled):hover{background:var(--muted)!important;transform:translateY(-1px);box-shadow:var(--shadow-card)}
      .preview-transport-button.preview-transport-primary:not(:disabled):hover{background:var(--primary)!important;color:var(--primary-foreground)!important}
      .preview-transport-button:active:not(:disabled){transform:translateY(0)}
      .preview-stage{background:var(--card);box-shadow:var(--shadow-card)}
      .preview-stage:fullscreen{width:100vw!important;height:100vh!important;min-height:0!important;max-width:none!important;max-height:none!important;border-radius:0!important}
      @keyframes preview-spin {to{transform:rotate(360deg)}}
      .preview-spinner{display:inline-flex;animation:preview-spin 1s linear infinite}
      .preview-player button:focus-visible,.preview-player input:focus-visible,.preview-player a:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
      .preview-player button:disabled{opacity:.5;cursor:default}
      .preview-player summary{cursor:pointer}
      .preview-retry{font:inherit}
      .preview-action{min-height:42px;border:0;border-radius:11px;padding:0 16px;font-size:12.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background .18s ease,color .18s ease,box-shadow .18s ease,transform .18s ease}
      .preview-action-primary{background:var(--primary);color:var(--primary-foreground);box-shadow:var(--shadow-sm)}
      .preview-action-secondary{background:var(--muted);color:var(--foreground)}
      .preview-action:not(:disabled):hover{transform:translateY(-1px);box-shadow:var(--shadow-card)}
      .preview-action-primary:not(:disabled):hover{background:var(--primary)}
      .preview-action-secondary:not(:disabled):hover{background:var(--background);color:var(--foreground)}
      .preview-action:active:not(:disabled){transform:translateY(0)}
      .preview-notice{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 14px;padding:10px 12px;font-size:12px;color:var(--muted-foreground);background:var(--card);border-radius:var(--preview-radius-small);box-shadow:var(--shadow-sm)}
      .preview-notice strong{color:var(--foreground);font-weight:600}
      .preview-notice button{border:0;background:transparent;color:var(--primary);font:inherit;font-size:12px;cursor:pointer;padding:4px 0}
      .preview-notice details{flex:1 1 100%;min-width:0}
      .preview-notice summary{color:var(--foreground)}
      .preview-notice p{margin:8px 0 0;color:var(--muted-foreground);line-height:1.6;max-height:180px;overflow:auto}
      .preview-address-popover input{font:inherit}
      .preview-menu button{border:0;background:transparent;color:inherit;text-align:left;padding:9px 12px;min-height:36px;font:inherit;cursor:pointer;border-radius:8px;transition:background .18s ease,color .18s ease}
      .preview-menu button:hover{background:var(--muted);color:var(--foreground)}
      .preview-menu button:disabled{cursor:default}
      .preview-frame-loading{position:absolute;top:12px;left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;padding:9px 14px;border-radius:999px;background:var(--background);color:var(--foreground);box-shadow:var(--shadow-popover);white-space:nowrap}
      .preview-stage-operation{position:absolute;top:10px;right:10px;z-index:2;background:var(--card);padding:12px;border-radius:var(--preview-radius-small);box-shadow:var(--shadow-sm)}
      .preview-stage-overlay{position:absolute;inset:0;display:grid;place-items:center;padding:24px;background:var(--card)}
      .preview-loading-shell{display:grid;justify-items:center;gap:18px}
      .preview-failure-overlay{align-content:center;justify-items:center;background:var(--card)}
      .preview-failure{width:100%;max-width:500px;margin:0 auto;box-sizing:border-box;display:grid;justify-items:center;gap:14px;padding:30px 32px;background:var(--background);border-radius:var(--preview-radius);box-shadow:var(--shadow-card);text-align:center}
      .preview-failure-mark{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:var(--warning-muted);color:var(--warning);box-shadow:var(--shadow-sm)}
      .preview-failure-eyebrow{font-size:12px;letter-spacing:.06em;color:var(--muted-foreground);text-transform:uppercase}
      .preview-failure h2{margin:0;color:var(--foreground);font-size:21px;line-height:1.3;font-weight:650;letter-spacing:-.025em}
      .preview-failure-description{margin:0;max-width:420px;color:var(--foreground);font-size:13px;line-height:1.7}
      .preview-failure-detail{width:100%;box-sizing:border-box;display:grid;gap:6px;padding:11px 13px;text-align:left;background:var(--muted);border-radius:var(--preview-radius-small);overflow:hidden}
      .preview-failure-detail-label{font-size:12px;color:var(--muted-foreground)}
      .preview-failure-detail code{display:block;color:var(--foreground);font:12px/1.6 ${MONO};overflow-wrap:anywhere;max-height:120px;overflow:auto}
      .preview-failure-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;width:100%}
      .preview-failure-overlay[data-status="failed"] .preview-failure-mark,.preview-failure-overlay[data-status="verificationFailed"] .preview-failure-mark{background:var(--destructive-muted);color:var(--destructive)}
      .preview-failure-overlay[data-status="failed"] .preview-action-primary,.preview-failure-overlay[data-status="verificationFailed"] .preview-action-primary{background:var(--destructive);color:var(--primary-foreground)}
      .preview-empty-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}
      .preview-empty-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}
      .preview-start-button{width:62px;height:62px;border:0;border-radius:31px;background:var(--primary);color:var(--primary-foreground);display:grid;place-items:center;cursor:pointer;box-shadow:var(--shadow-card);transition:transform .18s ease,background .18s ease,box-shadow .18s ease}
      .preview-start-button:hover{background:var(--primary);transform:translateY(-2px);box-shadow:var(--shadow-popover)}
      .preview-empty-copy{font-size:12.5px;color:var(--muted-foreground);max-width:560px;line-height:1.7}
      .preview-loading-title{color:var(--foreground);font-weight:600!important}
      .preview-loading-meta{color:var(--muted-foreground)}
      .preview-progress-track{background:var(--border)!important}
      .preview-progress-value{border-radius:inherit}
      .preview-loading-warning{font-weight:550}
      .preview-tabs::-webkit-scrollbar{height:3px;width:3px}
      .preview-tabs::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
      @media(max-width:680px){
        .preview-player{min-height:0!important;padding:8px!important;border-radius:0!important}
        .preview-layout{flex-direction:column!important;gap:10px!important}
        .preview-tabs{flex:0 0 auto!important;width:auto!important;max-height:80px;flex-direction:row!important;overflow-x:auto!important;overflow-y:hidden!important;gap:0!important;padding:0 0 2px!important;align-items:stretch!important;background:transparent;box-shadow:none;border-radius:0}
        .preview-sidebar-heading{flex:0 0 auto;max-width:160px;gap:6px;padding:0 8px 0 0}
        .preview-sidebar-heading span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .preview-tab-list{flex-direction:row!important;gap:14px!important;min-width:max-content}
        .preview-tab-group{flex-direction:row!important;align-items:center!important;border-bottom:2px solid var(--preview-tab-color);padding:0 0 4px!important;gap:4px!important;min-width:max-content}
        .preview-tab-group-head{display:contents}
        .preview-group-toggle{width:auto!important;max-width:210px!important;flex:0 0 auto;min-height:40px}
        .preview-group-action{width:40px;height:40px;min-width:40px}
        .preview-tab-row::after{display:none}
        .preview-pagination,.preview-opened{display:none}
        /* One toolbar row: the stage is already phone-width, and the source task stays in the More menu. */
        .preview-controls{flex-wrap:nowrap!important;gap:6px!important}
        .preview-controls>.preview-device-switcher,.preview-controls-end>.preview-execution-button{display:none!important}
        .preview-controls-end{gap:6px}
        .preview-controls-end>button{width:40px;min-height:40px;height:40px;padding:0!important;justify-content:center}
        .preview-controls-end>button>.preview-button-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
        .preview-embed>button{min-height:40px}
        .preview-tab-row{min-height:40px;max-width:170px;width:auto}
        .preview-controls{flex-wrap:wrap}
        .preview-controls>button{width:40px!important;height:40px!important}
        .preview-controls>.preview-device-switcher{width:40px!important;height:40px!important;padding:0!important}
        .preview-address-popover{top:142px!important;left:8px!important;right:8px!important}
        .preview-address-popover input{font-size:16px!important}
        .preview-menu{top:142px!important}
        .preview-tabs button{min-height:40px}
        .preview-player .button--sm{min-height:40px}
        .preview-notice{flex-direction:column;align-items:flex-start}
        .preview-failure{max-width:calc(100vw - 36px);padding:24px 18px;box-shadow:var(--shadow-sm)}
        .preview-failure h2{font-size:19px}
        .preview-failure-actions>*{flex:1 1 150px;min-width:0}
      }
      .preview-controls.preview-controls-shared>button{width:auto!important;height:auto!important;min-height:40px;padding:8px 12px}
      @media(prefers-reduced-motion:reduce){
        .preview-spinner{animation:none}
        .preview-transport-button,.preview-action,.preview-start-button{transition:none}
      }
    `}</style>
    {!shared && current && <RelatedRecords recordId={current.owner.key} className="preview-controls"/>}
    <div className="preview-layout">
      <aside className="preview-tabs" aria-label={ui("按需求分组的预览")}>
        <div className="preview-sidebar-heading"><span>{metadata.name || ui("候选预览")}</span><span>{rows.length}</span></div>
        <div className="preview-tab-list">
        {groups.map((group, index) => {
            const closed = collapsed.includes(group.key);
            const selected = group.rows.find(row => row.spec.key === current?.spec.key);
            const color = ['var(--primary)', 'var(--chart-3, var(--primary))', 'var(--success)', 'var(--warning)'][index % 4];
            return <section key={group.key} className="preview-tab-group" style={{ '--preview-tab-color': color } as CSSProperties}>
            <div className="preview-tab-group-head">
              <Button variant="ghost" size="sm" className="preview-group-toggle" type="button" aria-expanded={!closed} onClick={() => setCollapsed(value => closed ? value.filter(key => key !== group.key) : [...value, group.key])}>
                <span className="preview-group-chevron" aria-hidden="true">{closed ? '▸' : '▾'}</span><span className="preview-group-title">{group.rows[0].groupName}</span><span className="preview-group-count">{group.rows.filter(row => canViewPreview(row.status)).length}/{group.rows.length}</span>
              </Button>
              {!shared && <Button variant="ghost" size="sm" className="preview-group-action" type="button" aria-label={ui("启动全部端")} onClick={() => startGroupAndAttach(group.rows, selected ?? group.rows[0])}><Glyph path={GLYPH.play} filled size={13}/></Button>}
            </div>
            {(!closed ? group.rows : selected ? [selected] : []).map(row => <Button variant="ghost" size="sm" className="preview-tab-row" type="button" key={row.spec.key} data-candidate-id={row.owner.key} data-status={STATUS[row.status] ?? row.status} data-tone={['stopped', 'stopping', 'disconnected'].includes(row.status) ? 'stopped' : undefined} style={{ '--preview-status-color': TONE[row.status] ?? 'var(--muted-foreground)' } as CSSProperties} aria-pressed={row.spec.key === current?.spec.key} onClick={() => { setError(''); if (canViewPreview(row.status))
                    attach(row.spec.key);
                else {
                    setActiveKey(row.spec.key);
                    if (row.host?.phase === 'queued')
                        void mutations.start.mutate({ key: row.owner.key });
                } setMenu(false); }}>
              <span className="preview-status-dot"/><span className="preview-tab-row-title">{row.name}</span>
            </Button>)}
          </section>;
        })}
        </div>
        {!queryLoading && !queryError && !rows.length && <span className="preview-sidebar-empty">{ui.rich("暂无候选")}</span>}
        {!shared && (page.hasPrevious || page.hasNext || page.error) && <div className="preview-pagination"><Button variant="ghost" size="sm" className="preview-quiet-button" disabled={!page.hasPrevious} onClick={page.previous}>{ui('上一页')}</Button><span>{ui('第 {p0} 页', { p0: page.pageIndex + 1 })}</span><Button variant="ghost" size="sm" className="preview-quiet-button" disabled={!page.hasNext} onClick={page.next}>{ui('下一页')}</Button>{page.error && <Button variant="ghost" size="sm" className="preview-quiet-button" onClick={page.reset}>{ui('回到第一页')}</Button>}</div>}
        {embedRows.length > 1 && <div className="preview-opened"><span>{ui('本次打开的预览')}</span><div>{embedRows.map(row => <Button variant="ghost" size="sm" className="preview-quiet-button" key={row.spec.key} aria-pressed={row.spec.key === current?.spec.key} onClick={() => setActiveKey(row.spec.key)}>{row.name}</Button>)}</div></div>}
      </aside>
      <div className="preview-main">
    <header className="preview-controls" style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
      {shared ? <><Button variant="ghost" size="sm" disabled={!currentUrl} onClick={() => run(() => workbench.openExternal(currentUrl))}>{ui.rich("打开当前预览")}</Button><Button variant="ghost" size="sm" onClick={() => run(() => refreshState())}>{ui.rich("刷新状态")}</Button></> : <>
      <TransportButton primary path={playing || cancellable ? GLYPH.stop : GLYPH.play} filled={!playing && !cancellable} label={cancellable ? ui("停止本次启动或检查") : busy ? `${STATUS[effectiveStatus]}…` : playing ? ui("停止候选预览") : ui("启动全部端并播放")} disabled={!current || showFailure && !cancellable} loading={effectiveStatus === 'stopping'} onClick={toggle}/>
      <TransportButton path={GLYPH.reload} label={ui("刷新页面")} disabled={!attachedHere || busy} onClick={() => reloadFrame(current!.spec.key)}/>
      <TransportButton path={GLYPH.link} label={showAddress ? ui("关闭地址编辑") : ui("编辑预览地址")} disabled={!current || !canViewPreview(current.status)} onClick={() => { setShowAddress(value => !value); setMenu(false); }}/>
      <DeviceSwitcher device={device} onClick={cycleDevice}/>
      {current && canViewPreview(current.status) && <TransportButton path={GLYPH.external} label={ui("在新标签页打开预览")} disabled={!currentUrl} onClick={() => run(() => workbench.openExternal(currentUrl))}/>}
      <TransportButton path={GLYPH.link} label={lanCopying ? ui('正在复制局域网地址…') : ui('复制局域网地址')} disabled={!current?.surface || current.host?.phase !== 'ready' || lanCopying} loading={lanCopying} onClick={() => void copyLanAddress()}/>
      <TransportButton path={GLYPH.fullscreen} label={fullscreen ? ui("退出全屏") : ui("全屏")} onClick={toggleFullscreen}/>
      <TransportButton path={GLYPH.more} label={ui("更多操作")} onClick={() => { setMenu(!menu); setShowArchive(false); setShowAddress(false); }}/>
      <div className="preview-controls-end">
        {current?.owner.originNoteId && current.owner.delegationId && <Button variant="ghost" size="sm" type="button" className="preview-execution-button" aria-label={ui("回到原任务")} onClick={() => openDelegation(current.owner)}><Glyph path={GLYPH.external} size={14}/><span className="preview-button-label" aria-hidden="true">{ui.rich("回到原任务")}</span></Button>}
      </div>
      </>}
    </header>
    <Outlet />
    {current && <Button variant="ghost" size="sm" aria-pressed={reportOpen} onClick={() => setReportOpen(!reportOpen)}>{ui('查看检查与诊断')}</Button>}
    {reportOpen && current && <CandidateReport candidate={current.owner} surface={current.surface}/>}
    {focusLoading && <p role="status">{ui('正在读取指定候选…')}</p>}
    {focusError && <p role="alert">{focusError.message}<Button size="sm" onClick={dismissFocus}>{ui('返回当前页')}</Button></p>}
    {focusMissing && <p role="status">{ui('指定候选不存在或不可见')}<Button size="sm" onClick={dismissFocus}>{ui('返回当前页')}</Button></p>}
    <QueryState query={query} empty={null}>{() => null}</QueryState>
    {!shared && showAddress && current && <form className="preview-address-popover" onSubmit={event => { event.preventDefault(); try {
            const url = navigationUrl(draft, currentUrl);
            setUrls(value => ({ ...value, [current.spec.key]: url }));
            setDraft(url);
            setError('');
            attach(current.spec.key);
            reloadFrame(current.spec.key);
            setShowAddress(false);
        }
        catch (error) {
            setError(String(error));
        } }} style={{ position: 'absolute', top: 52, left: 10, right: 10, zIndex: 6, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--background)', border: 0, borderRadius: 10, padding: 8, boxShadow: 'var(--shadow-popover)' }}>
      <Input autoFocus aria-label={ui("预览地址")} placeholder={ui("输入 URL 后访问")} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') {
            setDraft(currentUrl);
            setShowAddress(false);
            event.currentTarget.blur();
        } }} style={{ width: '100%', minWidth: 0, border: 0, outline: 'none', background: 'transparent', color: 'var(--foreground)', fontFamily: MONO, fontSize: 12 }}/>
      <Button variant="ghost" size="sm" type="submit" aria-label={ui("访问预览地址")} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 0, borderRadius: 16, background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer', padding: 0, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}><Glyph path={GLYPH.external} size={14}/></Button>
    </form>}
    {!shared && menu && <><div onClick={event => { event.stopPropagation(); setMenu(false); }} style={{ position: 'absolute', inset: 0, zIndex: 4 }}/><div className="preview-menu" style={{ position: 'absolute', right: 10, top: 52, zIndex: 5, width: showArchive ? 360 : 220, maxWidth: 'calc(100% - 20px)', maxHeight: '70%', overflow: 'auto', display: 'grid', padding: 6, background: 'var(--background)', border: 0, borderRadius: 10, boxShadow: 'var(--shadow-popover)' }}>
      {current?.owner.originNoteId && current.owner.delegationId && <Button variant="ghost" size="sm" onClick={() => { openDelegation(current.owner); setMenu(false); }}>{ui.rich("查看来源需求")}</Button>}
      {current?.owner.adapter && <Button variant="ghost" size="sm" onClick={() => { mutations.verify.mutate({ key: current.owner.key, ...(current.surface ? { surface: current.surface } : {}) }); setMenu(false); }}>{ui.rich("重新检查预览")}</Button>}
      <Button variant="ghost" size="sm" onClick={() => { run(refreshState); setMenu(false); }}>{ui.rich("同步进程状态")}</Button>
      {current?.live && <Button variant="ghost" size="sm" onClick={() => { void mutations.stop.mutate({ key: current.owner.key }).then(result => { if (result)
            closePreview(current.spec.key); }); setMenu(false); }}>{ui.rich("停止候选预览")}</Button>}
      {current?.owner.adapter && <Button variant="ghost" size="sm" onClick={() => { mutations.check.mutate({ key: current.owner.key, ...(current.surface ? { surface: current.surface } : {}) }); setMenu(false); }}>{ui.rich("检查候选依赖")}</Button>}
      {currentIsCandidate && <Button variant="ghost" size="sm" onClick={() => { mutations.archive.mutate({ key: current!.owner.key }); setMenu(false); }}>{ui.rich("归档当前候选及其预览")}</Button>}
      <Button variant="ghost" size="sm" aria-expanded={showArchive} onClick={() => setShowArchive(!showArchive)}>{ui.rich("已归档 ")}<span style={{ opacity: .6 }}>({showArchive ? archived.length : '…'})</span> {showArchive ? '▾' : '▸'}</Button>
      {showArchive && <div style={{ marginTop: 4, padding: '10px 6px 6px' }}>
        <QueryState query={archivePage} empty={<p style={{ color: 'var(--muted-foreground)' }}>{ui.rich("暂无归档候选")}</p>}>{() => <>
        {!archived.length && <p style={{ color: 'var(--muted-foreground)' }}>{ui.rich("暂无归档候选")}</p>}
        {archived.map(spec => <div key={spec.key} style={{ padding: '8px 0' }}><div title={label(spec)} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)' }}>{label(spec)}</div><div style={{ display: 'flex' }}>
          <Button variant="ghost" size="sm" onClick={() => mutations.restore.mutate({ key: spec.key })}>{ui.rich("恢复")}</Button>
          <Button variant="ghost" size="sm" style={{ color: confirmForget === spec.key ? 'var(--destructive)' : 'var(--muted-foreground)' }} onClick={() => { if (confirmForget === spec.key) {
                        setConfirmForget(null);
                        mutations.forget.mutate({ key: spec.key });
                    }
                    else
                        setConfirmForget(spec.key); }}>{confirmForget === spec.key ? ui("确认永久删除") : ui("删除")}</Button>
          {confirmForget === spec.key && <Button variant="ghost" size="sm" onClick={() => setConfirmForget(null)}>{ui.rich("取消")}</Button>}
        </div></div>)}
        </>}</QueryState>
        <Button size="sm" disabled={!archivePage.hasPrevious} onClick={archivePage.previous}>{ui('上一页')}</Button><Button size="sm" disabled={!archivePage.hasNext} onClick={archivePage.next}>{ui('下一页')}</Button>
      </div>}
    </div></>}

    {current && !showFailure && (current.error || error || accessError) && <div className="preview-notice" role="status">
      <span>{accessError || error || (current.status === 'verificationFailed' ? current.error : '')}</span>
    </div>}
    {/* stage */}
    <div ref={stage} className="preview-stage" data-candidate-id={current?.owner.key} style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden' }}>
      {shared ? <div className="preview-empty-state"><NoteIcon icon={metadata.icon} size={32}/><strong>{current?.name ?? ui('暂无候选')}</strong><span className="preview-empty-copy">{!current ? ui('主人尚未添加预览候选。') : !metadata.access?.previews ? ui('主人尚未允许打开关联预览。') : canViewPreview(current.status) ? ui('预览将在独立页面打开，可直接操作页面内容。') : ui('当前状态：{p0}，等待主人处理。', { p0: STATUS[current.status] ?? current.status })}</span>{current && canViewPreview(current.status) && <Button size="sm" disabled={!currentUrl} onClick={() => run(() => workbench.openExternal(currentUrl))}>{ui('在新标签页打开预览')}</Button>}</div> : <>
      {embedRows.filter(row => canViewPreview(row.status)).map(row => { const embedKey = previewEmbedKey(row.spec.key, model.accessKey(row)); return <ManagedEmbed key={embedKey} embedKey={embedKey} className="preview-embed" target={urlsFor(row)} title={ui("{p0} 内嵌预览", { p0: label(row.spec) })} onClose={() => closePreview(row.spec.key)} style={{ position: 'absolute', top: 0, left: '50%', width: '100%', maxWidth: activeDevice.maxWidth, height: '100%', transform: 'translateX(-50%)', background: 'var(--background)', display: current?.spec.key === row.spec.key ? 'flex' : 'none' }}/>; })}
      {showFailure && current && failure && <div className="preview-failure-overlay" data-status={current.status} role="alert" aria-labelledby="preview-failure-title" aria-describedby="preview-failure-description" style={{ position: 'absolute', inset: 0, overflow: 'auto', display: 'grid', alignItems: 'center', padding: '32px 24px', boxSizing: 'border-box' }}>
        <div className="preview-failure" key={current.spec.key}>
          <div className="preview-failure-mark" aria-hidden="true"><Glyph path={GLYPH.warning} size={22}/></div>
          <span className="preview-failure-eyebrow">{ui.rich("预览状态 · {p0}", { p0: STATUS[current.status] ?? ui("需要核对") })}</span>
          <h2 id="preview-failure-title">{failure.title}</h2>
          <p id="preview-failure-description" className="preview-failure-description">{failure.description}</p>
          {failure.reason && <div className="preview-failure-detail"><span className="preview-failure-detail-label">{ui.rich("错误信息")}</span><code>{failure.reason}</code></div>}
          {commandUnknown && current.error && current.error !== failure.reason && <p className="preview-failure-detail">{current.error}</p>}
          <div className="preview-failure-actions">{commandUnknown ? uncertainCommands.map(command => <Button key={command.key} variant="ghost" size="sm" onClick={() => void command.verify()}>{ui('核对操作结果')}</Button>) : <><Button variant="ghost" size="sm" type="button" className="preview-retry preview-action preview-action-primary" onClick={() => startAndAttach(current.spec.key)}><Glyph path={GLYPH.reload} size={14}/>{ui.rich("重新启动")}</Button></>}</div>
        </div>
      </div>}
      {current?.activeOperation && !busy && !commandUnknown && <div className="preview-stage-operation"><PreviewLoading key={current.operationId ?? current.spec.key} progress={current.progress} tasks={current.tasks} tasksDeferred={current.tasksDeferred} status="starting" startedAt={current.startedAt}/>{cancellable && <Button variant="ghost" size="sm" type="button" className="preview-action preview-action-secondary" onClick={toggle}>{ui.rich("停止")}</Button>}</div>}
      {current && busy && <div className="preview-stage-overlay"><div className="preview-loading-shell"><PreviewLoading key={current.operationId ?? current.spec.key} progress={current.progress} tasks={current.tasks} tasksDeferred={current.tasksDeferred} status={effectiveStatus} startedAt={current.startedAt}/>{cancellable && <Button variant="ghost" size="sm" type="button" className="preview-action preview-action-secondary" onClick={toggle}>{ui.rich("停止")}</Button>}</div></div>}
      {!focusPending && !busy && !attachedHere && !showFailure && <div className="preview-empty-state">
        {current && !canViewPreview(current.status) && !busy &&
                    <Button variant="ghost" size="sm" type="button" className="preview-start-button" onClick={() => startAndAttach(current.spec.key)} aria-label={ui("启动全部端并播放")}>
            <NoteIcon icon={metadata.icon} size={24}/>
          </Button>}
        <span className="preview-empty-copy">
          {!current
                    ? <NoteGuidance title={ui("还没有预览候选")} description={ui("关联 Todo 产出可运行版本后会出现在这里。")} action={{ label: ui("查看 Todo"), onPress: () => workbench.openLinkedNote("preview", "source") }} secondary={{ label: ui("连接来源"), onPress: () => workbench.openSetup() }}/>
                    : canViewPreview(current.status)
                        ? <Button size="sm" onClick={() => attach(current.spec.key)}>{ui('打开当前预览')}</Button>
                        : ui("启动全部端，逐端就绪后即可查看")}
        </span>
      </div>}
      </>}
      </div>
      </div>
    </div>


  </section>;
}
