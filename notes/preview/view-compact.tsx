import { NoteIcon, QueryState, useUi } from '@realiz3r/worka-react';
import { Button } from '@/components/ui/button';
import { ui } from './messages';
import { usePreviewModel, FONT, STATUS, TONE, TONE_BG, compactRank, featureStatus, featureTitle, canViewPreview } from './view-model';
export default function CompactView() {
    useUi(ui);
    const model = usePreviewModel();
    const { shared, metadata, groups, rows, operations, attach, startAndAttach, error } = model;
    const { query, queryLoading, queryError, page, layout } = model;
    const phone = (layout?.width || innerWidth) <= 400;
    const fit = Math.max(1, Math.min(3, Math.floor(((layout?.maxHeight || innerHeight) - 52) / (phone ? 46 : 42))));
    const visible = [...groups].sort((a, b) => compactRank(a.rows) - compactRank(b.rows)).slice(0, fit);
    const hidden = groups.length - visible.length;
    return <section className="preview-compact">
      <style>{`
        .preview-compact{
          --pv-bg:#faf8f2;--pv-card:#ffffff;--pv-hover:#f1efe7;--pv-ink:#17241e;--pv-muted:#495850;
          --pv-edge:rgba(23,36,30,.11);--pv-hairline:rgba(23,36,30,.09);--pv-accent:#1b634c;--pv-wash:#dff0e9;
          position:relative;isolation:isolate;box-sizing:border-box;width:100%;height:100dvh;overflow:hidden;
          background-color:var(--pv-bg);border:1px solid var(--pv-edge);border-radius:var(--radius,16px);
          padding:0 12px 10px;font-family:${FONT};font-size:13px;color:var(--pv-ink);min-width:0;
          display:flex;flex-direction:column;gap:8px;color-scheme:light;
        }
        .preview-compact::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(120% 90% at 50% 0%,rgba(255,255,255,.55),transparent 72%)}
        :root[data-theme="dark"] .preview-compact{
          --pv-bg:#242933;--pv-card:#2c3340;--pv-hover:#333b4a;--pv-ink:#eaedf3;--pv-muted:#a3acb9;
          --pv-edge:rgba(234,237,243,.085);--pv-hairline:rgba(234,237,243,.08);--pv-accent:#7ce4be;--pv-wash:#1e3832;
          color-scheme:dark;
        }
        :root[data-theme="dark"] .preview-compact::after{background:radial-gradient(115% 85% at 50% 0%,rgba(124,228,190,.045),transparent 68%)}
        .preview-compact-header{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;height:36px;flex-shrink:0}
        .preview-compact-header::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,var(--pv-hairline) 12%,var(--pv-hairline) 88%,transparent);pointer-events:none}
        .preview-compact-brand{display:flex;align-items:center;gap:6px;min-width:0}
        .preview-compact-logo{width:20px;height:20px;border-radius:6px;background-color:var(--pv-wash);color:var(--pv-accent);display:grid;place-items:center;flex-shrink:0}
        .preview-compact-title{font:700 14px/1.2 "Songti SC","Noto Serif CJK SC",Georgia,serif;color:var(--pv-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .preview-compact-count{font-size:12px;font-variant-numeric:tabular-nums;color:var(--pv-muted);white-space:nowrap;flex-shrink:0}
        .preview-compact-list{display:flex;flex-direction:column;gap:6px;min-width:0}
        .preview-compact-row{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;height:38px;box-sizing:border-box;flex-shrink:0;padding:0 6px 0 10px;border-radius:9px;border:1px solid var(--pv-edge);background-color:var(--pv-card);transition:background-color .16s ease,border-color .16s ease;cursor:pointer}
        .preview-compact-row:hover{background-color:var(--pv-hover);border-color:color-mix(in srgb,var(--pv-accent) 36%,var(--pv-edge))}
        .preview-compact-meta{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
        .preview-compact-name{font-size:12.5px;font-weight:500;line-height:1.4;color:var(--pv-ink);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .preview-compact-tail{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .preview-compact-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:12px;line-height:1.35;white-space:nowrap;font-weight:600}
        .preview-compact-action{height:26px!important;min-height:26px!important;padding:0 10px!important;border-radius:999px!important;font-size:12px!important;font-weight:600!important;background-color:var(--pv-wash)!important;color:var(--pv-accent)!important;border:none!important;box-shadow:none!important;transition:filter .16s ease!important}
        .preview-compact-action:hover:not(:disabled){filter:brightness(1.06)}
        .preview-compact-action:disabled{opacity:.5}
        @media(max-width:400px),(pointer:coarse){.preview-compact-header{height:40px}.preview-compact-row{height:42px;padding:0 4px 0 10px}.preview-compact-action{height:40px!important;min-height:40px!important;min-width:48px}.preview-compact-count{display:none}}
      `}</style>
      <div className="preview-compact-header">
        <div className="preview-compact-brand">
          <span className="preview-compact-logo" aria-hidden="true"><NoteIcon icon={metadata.icon} size={12}/></span>
          <strong className="preview-compact-title">{metadata.name || ui("候选预览")}</strong>
        </div>
        <span className="preview-compact-count" title={hidden > 0 || page.hasNext ? ui("点击卡片展开查看全部功能") : undefined}>{queryLoading ? ui('正在加载候选…') : hidden > 0 ? ui('显示 {p0}/{p1} 个功能', { p0: visible.length, p1: groups.length }) : ui('本页 {p0} 个功能', { p0: groups.length })}</span>
      </div>
      {!queryLoading && !queryError && !rows.length && <p className="preview-compact-empty" style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--pv-muted)', margin: '6px 0 0' }}>{ui.rich("关联 Todo 产出可运行版本后会自动同步到这里。")}</p>}
      <div className="preview-compact-list">
        {visible.map(group => {
                const featureRows = group.rows;
                const status = featureStatus(featureRows, operations);
                const available = featureRows.filter(row => canViewPreview(row.status)).length;
                const needsStart = featureRows.some(row => ['stopped', 'failed', 'waiting'].includes(row.status));
                const operating = featureRows.some(row => Boolean(operations[row.owner.key]));
                const summary = featureRows.every(row => row.status === 'ready') ? ui("可预览") : available ? ui("可查看 · 待核验") : STATUS[status] ?? status;
                const displayName = featureTitle(featureRows[0].groupName);
                const dotColor = TONE[status] ?? 'var(--pv-muted)';
                const badgeBg = TONE_BG[status] ?? 'var(--muted)';
                return <div className="preview-compact-row" key={group.key} title={displayName} onClick={() => { const target = featureRows.find(row => canViewPreview(row.status)) ?? featureRows[0]; attach(target.spec.key); }}>
            <div className="preview-compact-meta">
              <span className="preview-status-dot" style={{ width: 6, height: 6, borderRadius: 3, background: dotColor, flexShrink: 0 }}/>
              <span className="preview-compact-name">{displayName}</span>
            </div>
            <div className="preview-compact-tail">
              <span className="preview-compact-badge" style={{ color: dotColor, background: badgeBg }}>
                {summary}
              </span>
              {needsStart && !shared
                        ? <Button variant="ghost" size="sm" className="preview-compact-action" type="button" aria-label={ui("启动 {p0}", { p0: displayName })} disabled={operating} onClick={event => { (event as any)?.stopPropagation?.(); startAndAttach(featureRows[0].spec.key); }}>{operating ? ui("启动中…") : ui("启动")}</Button>
                        : null}
            </div>
          </div>;
            })}
      </div>
      <QueryState query={query} empty={null}>{() => null}</QueryState>
      {error && <p role="alert" style={{ fontSize: 12, color: 'var(--destructive)', margin: '4px 0 0' }}>{error}</p>}
    </section>;
}
