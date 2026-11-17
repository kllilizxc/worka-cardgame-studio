import { NoteIcon, QueryState, useUi } from '@realiz3r/worka-react';
import { Button } from '@/components/ui/button';
import { ui } from './messages';
import { usePreviewModel, FONT, STATUS, TONE, TONE_BG, compactRank, featureStatus, featureTitle, canViewPreview } from './view-model';
export default function CompactView() {
    useUi(ui);
    const model = usePreviewModel();
    const { shared, metadata, groups, rows, operations, attach, startAndAttach, error } = model;
    const { query, queryLoading, queryError, page, layout } = model;
    // Only whole rows: header and padding take 70px; a row is 36px (40px on phones) plus a 6px gap.
    const phone = (layout?.width || innerWidth) <= 400;
    const fit = Math.max(1, Math.min(4, Math.floor(((layout?.maxHeight || innerHeight) - 70 + 6) / (phone ? 46 : 42))));
    const visible = [...groups].sort((a, b) => compactRank(a.rows) - compactRank(b.rows)).slice(0, fit);
    const hidden = groups.length - visible.length;
    {
        return <section className="preview-compact" style={{ boxSizing: 'border-box', width: '100%', height: '100dvh', overflow: 'hidden', background: 'var(--background)', borderRadius: 16, padding: '14px 16px 12px', fontFamily: FONT, fontSize: 13, color: 'var(--foreground)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{`
        .preview-compact-header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:10px;box-shadow:0 1px 0 var(--border)}
        .preview-compact-brand{display:flex;align-items:center;gap:8px;min-width:0}
        .preview-compact-logo{width:24px;height:24px;border-radius:6px;background:var(--accent);color:var(--primary);display:grid;place-items:center;flex-shrink:0}
        .preview-compact-title{font-size:14px;font-weight:650;color:var(--foreground);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .preview-compact-count{font-size:12px;color:var(--muted-foreground);white-space:nowrap;flex-shrink:0}
        .preview-compact-list{display:flex;flex-direction:column;gap:6px;min-width:0}
        .preview-compact-row{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;height:36px;box-sizing:border-box;flex-shrink:0;padding:0 5px 0 10px;border-radius:8px;background:var(--card);transition:background .18s ease;cursor:pointer}
        .preview-compact-row:hover{background:var(--muted)}
        .preview-compact-meta{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
        .preview-compact-name{font-size:13px;font-weight:500;line-height:1.4;color:var(--foreground);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .preview-compact-tail{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .preview-compact-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:12px;line-height:1.4;white-space:nowrap;font-weight:500}
        .preview-compact-action{height:26px!important;min-height:26px!important;padding:0 10px!important;border-radius:7px!important;font-size:12px!important;font-weight:600!important;background:var(--accent)!important;color:var(--primary)!important;border:none!important;box-shadow:none!important;transition:background .18s ease,color .18s ease!important}
        .preview-compact-action:hover:not(:disabled){background:var(--primary)!important;color:var(--primary-foreground)!important}
        .preview-compact-action:disabled{opacity:.5}
        @media(max-width:400px){.preview-compact-row{height:40px;padding:0 0 0 10px}.preview-compact-action{height:40px!important;min-height:40px!important;min-width:48px}.preview-compact-count{display:none}}
      `}</style>
      <div className="preview-compact-header">
        <div className="preview-compact-brand">
          <span className="preview-compact-logo" aria-hidden="true"><NoteIcon icon={metadata.icon} size={13}/></span>
          <strong className="preview-compact-title">{metadata.name || ui("候选预览")}</strong>
        </div>
        <span className="preview-compact-count" title={hidden > 0 || page.hasNext ? ui("点击卡片展开查看全部功能") : undefined}>{queryLoading ? ui('正在加载候选…') : hidden > 0 ? ui('显示 {p0}/{p1} 个功能', { p0: visible.length, p1: groups.length }) : ui('本页 {p0} 个功能', { p0: groups.length })}</span>
      </div>
      {!queryLoading && !queryError && !rows.length && <p className="preview-compact-empty" style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>{ui.rich("关联 Todo 产出可运行版本后会自动同步到这里。")}</p>}
      <div className="preview-compact-list">
        {visible.map(group => {
                const featureRows = group.rows;
                const status = featureStatus(featureRows, operations);
                const available = featureRows.filter(row => canViewPreview(row.status)).length;
                const needsStart = featureRows.some(row => ['stopped', 'failed', 'waiting'].includes(row.status));
                const operating = featureRows.some(row => Boolean(operations[row.owner.key]));
                const summary = featureRows.every(row => row.status === 'ready') ? ui("可预览") : available ? ui("可查看 · 待核验") : STATUS[status] ?? status;
                const displayName = featureTitle(featureRows[0].groupName);
                const dotColor = TONE[status] ?? 'var(--muted-foreground)';
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
      {error && <p role="alert" style={{ fontSize: 11.5, color: 'var(--destructive)', margin: '4px 0 0' }}>{error}</p>}
    </section>;
    }
}
