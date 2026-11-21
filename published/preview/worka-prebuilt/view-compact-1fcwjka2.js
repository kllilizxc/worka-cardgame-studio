import{e,a,p,v,n,t,g,l,f,d}from"./entry-06d5wg15.js";import{NoteIcon as F,QueryState as I,useUi as J}from"@realiz3r/worka-react";import{Button as K}from"@/components/ui/button";import{jsx as i,jsxs as c}from"react/jsx-runtime";function L(){J(e);let u=d(),{shared:B,metadata:b,groups:s,rows:q,operations:y,attach:M,startAndAttach:A,error:k}=u,{query:E,queryLoading:N,queryError:H,page:O,layout:S}=u,P=(S?.width||innerWidth)<=400,R=Math.max(1,Math.min(3,Math.floor(((S?.maxHeight||innerHeight)-52)/(P?46:42)))),w=[...s].sort((m,r)=>l(m.rows)-l(r.rows)).slice(0,R),z=s.length-w.length;return c("section",{className:"preview-compact",children:[i("style",{children:`
        .preview-compact{
          --pv-bg:#faf8f2;--pv-card:#ffffff;--pv-hover:#f1efe7;--pv-ink:#17241e;--pv-muted:#495850;
          --pv-edge:rgba(23,36,30,.11);--pv-hairline:rgba(23,36,30,.09);--pv-accent:#1b634c;--pv-wash:#dff0e9;
          position:relative;isolation:isolate;box-sizing:border-box;width:100%;height:100dvh;overflow:hidden;
          background-color:var(--pv-bg);border:1px solid var(--pv-edge);border-radius:var(--radius,16px);
          padding:0 12px 10px;font-family:${n};font-size:13px;color:var(--pv-ink);min-width:0;
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
      `}),c("div",{className:"preview-compact-header",children:[c("div",{className:"preview-compact-brand",children:[i("span",{className:"preview-compact-logo","aria-hidden":"true",children:i(F,{icon:b.icon,size:12})}),i("strong",{className:"preview-compact-title",children:b.name||e("候选预览")})]}),i("span",{className:"preview-compact-count",title:z>0||O.hasNext?e("点击卡片展开查看全部功能"):void 0,children:N?e("正在加载候选…"):z>0?e("显示 {p0}/{p1} 个功能",{p0:w.length,p1:s.length}):e("本页 {p0} 个功能",{p0:s.length})})]}),!N&&!H&&!q.length&&i("p",{className:"preview-compact-empty",style:{fontSize:12,lineHeight:1.65,color:"var(--pv-muted)",margin:"6px 0 0"},children:e.rich("关联 Todo 产出可运行版本后会自动同步到这里。")}),i("div",{className:"preview-compact-list",children:w.map((m)=>{let r=m.rows,h=g(r,y),G=r.filter((o)=>t(o.status)).length,Q=r.some((o)=>["stopped","failed","waiting"].includes(o.status)),C=r.some((o)=>Boolean(y[o.owner.key])),U=r.every((o)=>o.status==="ready")?e("可预览"):G?e("可查看 · 待核验"):a[h]??h,x=f(r[0].groupName),T=p[h]??"var(--pv-muted)",V=v[h]??"var(--muted)";return c("div",{className:"preview-compact-row",title:x,onClick:()=>{let o=r.find((j)=>t(j.status))??r[0];M(o.spec.key)},children:[c("div",{className:"preview-compact-meta",children:[i("span",{className:"preview-status-dot",style:{width:6,height:6,borderRadius:3,background:T,flexShrink:0}}),i("span",{className:"preview-compact-name",children:x})]}),c("div",{className:"preview-compact-tail",children:[i("span",{className:"preview-compact-badge",style:{color:T,background:V},children:U}),Q&&!B?i(K,{variant:"ghost",size:"sm",className:"preview-compact-action",type:"button","aria-label":e("启动 {p0}",{p0:x}),disabled:C,onClick:(o)=>{o?.stopPropagation?.(),A(r[0].spec.key)},children:C?e("启动中…"):e("启动")}):null]})]},m.key)})}),i(I,{query:E,empty:null,children:()=>null}),k&&i("p",{role:"alert",style:{fontSize:12,color:"var(--destructive)",margin:"4px 0 0"},children:k})]})}export{L as default};
