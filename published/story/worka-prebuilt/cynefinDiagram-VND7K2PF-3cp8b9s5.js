import{N}from"./entry-1dbye6ry.js";import{e,t,de,T,u,R,p,g,y,m,v,w,b,M,I}from"./entry-gjg7apff.js";import{j}from"./entry-eegdx6ch.js";var ht=e(()=>({domains:new Map,transitions:[]}),"createDefaultData"),ot=ht(),St=e(()=>ot.domains,"getDomains"),Mt=e(()=>ot.transitions,"getTransitions"),zt=e((n)=>{if(!n)return;for(let o of n){let a=o.domain,r=(o.items??[]).map((l)=>({label:l.label}));ot.domains.set(a,{name:a,items:r})}},"setDomains"),Lt=e((n)=>{if(!n)return;ot.transitions=n.filter((o)=>{if(o.from===o.to)return t.warn(`Cynefin: self-loop transition on domain "${o.from}" is not meaningful and will be skipped.`),!1;return!0}).map((o)=>({from:o.from,to:o.to,label:o.label||void 0}))},"setTransitions"),Nt=e(()=>I({...T.cynefin,...u().cynefin}),"getConfig"),Pt=e(()=>{p(),ot=ht()},"clear"),it={getDomains:St,getTransitions:Mt,setDomains:zt,setTransitions:Lt,getConfig:Nt,clear:Pt,setAccTitle:g,getAccTitle:y,setDiagramTitle:w,getDiagramTitle:b,getAccDescription:v,setAccDescription:m},It=e((n)=>{N(n,it),it.setDomains(n.domains),it.setTransitions(n.transitions)},"populate"),Wt={parse:e(async(n)=>{let o=await j("cynefin",n);t.debug(o),It(o)},"parse")};function nt(n){let o=n+1831565813|0;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),((o^o>>>14)>>>0)/4294967296}e(nt,"seededRandom");function xt(n){let o=0;for(let a=0;a<n.length;a++){let r=n.charCodeAt(a);o=(o<<5)-o+r,o|=0}return o}e(xt,"hashString");function $t(n,o){if(typeof n==="number"&&Number.isFinite(n)&&n!==0)return n;return xt(o)}e($t,"resolveSeed");function bt(n,o,a,r){let l=n/2,x=r??n*0.015,at=7,Z=o/7,f=[];for(let i=0;i<=7;i++){let C=nt(a+i*17)*x*2-x;f.push({x:l+C,y:i*Z})}let F=`M${f[0].x},${f[0].y}`;for(let i=0;i<f.length-1;i++){let C=f[i],c=f[i+1],h=(C.y+c.y)/2,L=i%2===0?1:-1,A=x*1.5*L*nt(a+i*31+7),J=C.x+A,K=h,tt=c.x-A;F+=` C${J},${K} ${tt},${h} ${c.x},${c.y}`}return F}e(bt,"generateFoldPath");function wt(n,o,a,r){let l=o/2,x=r??o*0.015,at=7,Z=n/7,f=[];for(let i=0;i<=7;i++){let C=nt(a+i*23)*x*2-x;f.push({x:i*Z,y:l+C})}let F=`M${f[0].x},${f[0].y}`;for(let i=0;i<f.length-1;i++){let C=f[i],c=f[i+1],h=(C.x+c.x)/2,L=i%2===0?1:-1,A=x*1.5*L*nt(a+i*37+11),J=h,K=C.y+A,tt=h,O=c.y-A;F+=` C${J},${K} ${tt},${O} ${c.x},${c.y}`}return F}e(wt,"generateHorizontalBoundary");function Ct(n,o){let a=n/2,r=o*0.5,l=o,x=n*0.03;return[`M${a},${r}`,`C${a+x},${r+(l-r)*0.2}`,`${a-x*1.5},${r+(l-r)*0.55}`,`${a+x*0.5},${r+(l-r)*0.75}`,`C${a-x},${r+(l-r)*0.85}`,`${a+x*0.3},${r+(l-r)*0.95}`,`${a},${l}`].join(" ")}e(Ct,"generateCliffPath");function vt(n,o,a,r){return[`M${n-a},${o}`,`A${a},${r} 0 1,1 ${n+a},${o}`,`A${a},${r} 0 1,1 ${n-a},${o}`,"Z"].join(" ")}e(vt,"generateConfusionPath");var gt={complex:{model:"Probe → Sense → Respond",practice:"Emergent Practices"},complicated:{model:"Sense → Analyse → Respond",practice:"Good Practices"},clear:{model:"Sense → Categorise → Respond",practice:"Best Practices"},chaotic:{model:"Act → Sense → Respond",practice:"Novel Practices"},confusion:{model:"",practice:"Disorder"}},Rt=e((n,o)=>{let a=n/2,r=o/2;return{complex:{cx:a/2,cy:r/2,x:0,y:0,w:a,h:r},complicated:{cx:a+a/2,cy:r/2,x:a,y:0,w:a,h:r},chaotic:{cx:a/2,cy:r+r/2,x:0,y:r,w:a,h:r},clear:{cx:a+a/2,cy:r+r/2,x:a,y:r,w:a,h:r},confusion:{cx:a,cy:r,x:a*0.7,y:r*0.7,w:a*0.6,h:r*0.6}}},"getDomainLayouts"),Ft=e(()=>{let n=de(),o=u();return I(n,o.themeVariables).cynefin},"getCynefinDomainColors"),lt=3,Vt=e((n,o,a,r)=>{let l=r.db,x=l.getDomains(),at=l.getTransitions(),Z=l.getDiagramTitle(),f=l.getAccTitle(),F=l.getAccDescription(),i=l.getConfig(),C=Ft();t.debug("Rendering Cynefin diagram");let{width:c,height:h,padding:L,showDomainDescriptions:A,boundaryAmplitude:J}=i,K=c+L*2,tt=h+L*2,O={complex:C.complexBg,complicated:C.complicatedBg,clear:C.clearBg,chaotic:C.chaoticBg,confusion:C.confusionBg},V=M(o);if(R(V,tt,K,i.useMaxWidth??!0),V.attr("viewBox",`0 0 ${K} ${tt}`),f)V.append("title").text(f);if(F)V.append("desc").text(F);let _=V.append("g").attr("transform",`translate(${L}, ${L})`),et=Rt(c,h),dt=$t(i.seed,o),Dt=_.append("g").attr("class","cynefin-backgrounds"),st=["complex","complicated","chaotic","clear"];for(let d of st){let s=et[d];Dt.append("rect").attr("class","cynefinDomain").attr("x",s.x).attr("y",s.y).attr("width",s.w).attr("height",s.h).attr("fill",O[d]).attr("fill-opacity",0.4).attr("stroke","none")}let ct=_.append("g").attr("class","cynefin-boundaries");ct.append("path").attr("class","cynefinBoundary").attr("d",bt(c,h,dt,J)).attr("fill","none"),ct.append("path").attr("class","cynefinBoundary").attr("d",wt(c,h,dt+100,J)).attr("fill","none"),ct.append("path").attr("class","cynefinCliff").attr("d",Ct(c,h)).attr("fill","none");let kt=c*0.15,Tt=h*0.15;_.append("path").attr("class","cynefinConfusion").attr("d",vt(c/2,h/2,kt,Tt)).attr("fill",O.confusion).attr("fill-opacity",0.5);let ft=_.append("g").attr("class","cynefin-labels");for(let d of st){let s=et[d];ft.append("text").attr("class","cynefinDomainLabel").attr("x",s.cx).attr("y",A?s.cy-30:s.cy).attr("text-anchor","middle").attr("dominant-baseline","middle").text(d.charAt(0).toUpperCase()+d.slice(1))}if(ft.append("text").attr("class","cynefinDomainLabel").attr("x",c/2).attr("y",A?h/2-10:h/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text("Confusion"),A){let d=_.append("g").attr("class","cynefin-subtitles");for(let s of st){let k=et[s],D=gt[s];d.append("text").attr("class","cynefinSubtitle").attr("x",k.cx).attr("y",k.cy-10).attr("text-anchor","middle").attr("dominant-baseline","middle").text(D.model),d.append("text").attr("class","cynefinSubtitle").attr("x",k.cx).attr("y",k.cy+5).attr("text-anchor","middle").attr("dominant-baseline","middle").text(D.practice)}d.append("text").attr("class","cynefinSubtitle").attr("x",c/2).attr("y",h/2+8).attr("text-anchor","middle").attr("dominant-baseline","middle").text(gt.confusion.practice)}let mt=_.append("g").attr("class","cynefin-items"),E=26,pt=10,At=["complex","complicated","chaotic","clear","confusion"];for(let d of At){let s=x.get(d);if(!s||s.items.length===0)continue;let k=et[d],D=d==="confusion",X=s.items,q=0;if(D&&s.items.length>lt)q=s.items.length-lt,X=s.items.slice(0,lt);let H;if(D){let S=A?22:14;H=k.cy+S}else H=k.cy+(A?25:15);if([...X].forEach((S,G)=>{let P=H+G*(E+4),Y=mt.append("g"),U=Y.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",E/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(S.label),z=S.label.length*7,B=U.node();if(B&&typeof B.getBBox==="function"){let rt=B.getBBox();if(rt.width>0)z=rt.width}let W=z+pt*2,Q=k.cx-W/2;Y.attr("transform",`translate(${Q}, ${P})`),Y.insert("rect","text").attr("class","cynefinItem").attr("x",0).attr("y",0).attr("width",W).attr("height",E).attr("rx",4).attr("ry",4).attr("fill",O[d]).attr("fill-opacity",0.95),U.attr("x",W/2).attr("y",E/2)}),q>0){let S=H+X.length*(E+4),G=`+${q} more`,P=mt.append("g"),Y=P.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",E/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(G),U=G.length*7,z=Y.node();if(z&&typeof z.getBBox==="function"){let Q=z.getBBox();if(Q.width>0)U=Q.width}let B=U+pt*2,W=k.cx-B/2;P.attr("transform",`translate(${W}, ${S})`),P.insert("rect","text").attr("class","cynefinItemOverflow").attr("x",0).attr("y",0).attr("width",B).attr("height",E).attr("rx",4).attr("ry",4).attr("fill",O[d]).attr("fill-opacity",0.6),Y.attr("x",B/2).attr("y",E/2)}}if(at.length>0){let d=V.select("defs").empty()?V.append("defs"):V.select("defs"),s=`cynefin-arrow-${o}`;d.append("marker").attr("id",s).attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto-start-reverse").append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("class","cynefinArrowHead");let k=_.append("g").attr("class","cynefin-arrows");at.forEach((D)=>{let X=et[D.from],q=et[D.to];if(!X||!q)return;if(D.from===D.to){t.warn(`Cynefin renderer: skipping self-loop on domain "${D.from}"`);return}let{cx:H,cy:S}=X,{cx:G,cy:P}=q,Y=(H+G)/2,U=(S+P)/2,z=G-H,B=P-S,W=Math.sqrt(z*z+B*B),Q=W*0.15,rt=-B/W,Bt=z/W,yt=Y+rt*Q,ut=U+Bt*Q;if(k.append("path").attr("class","cynefinArrowLine").attr("d",`M${H},${S} Q${yt},${ut} ${G},${P}`).attr("fill","none").attr("marker-end",`url(#${s})`),D.label)k.append("text").attr("class","cynefinArrowLabel").attr("x",yt).attr("y",ut-6).attr("text-anchor","middle").attr("dominant-baseline","auto").text(D.label)})}if(Z)_.append("text").attr("class","cynefinTitle").attr("x",c/2).attr("y",-L/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text(Z)},"draw"),_t={draw:Vt},Et=e(()=>{let n=de(),o=u();return I(n,o.themeVariables).cynefin},"getCynefinTheme"),Ht=e(()=>{let n=Et();return`
	.cynefinDomain {
		stroke: none;
	}
	.cynefinDomainLabel {
		font-size: ${n.domainFontSize}px;
		font-weight: bold;
		fill: ${n.labelColor};
	}
	.cynefinSubtitle {
		font-size: ${n.itemFontSize-1}px;
		fill: ${n.textColor};
		font-style: italic;
	}
	.cynefinItem {
		fill-opacity: 0.95;
		stroke: ${n.boundaryColor};
		stroke-width: 1;
	}
	.cynefinItemText {
		font-size: ${n.itemFontSize}px;
		fill: ${n.textColor};
	}
	.cynefinItemOverflow {
		fill-opacity: 0.6;
		stroke: ${n.boundaryColor};
		stroke-width: 1;
		stroke-dasharray: 3 2;
	}
	.cynefinBoundary {
		stroke: ${n.boundaryColor};
		stroke-width: ${n.boundaryWidth};
		stroke-dasharray: 6 3;
	}
	.cynefinCliff {
		stroke: ${n.cliffColor};
		stroke-width: ${n.cliffWidth};
	}
	.cynefinConfusion {
		stroke: ${n.boundaryColor};
		stroke-width: 1.5;
		stroke-dasharray: 4 2;
	}
	.cynefinArrowLine {
		stroke: ${n.arrowColor};
		stroke-width: ${n.arrowWidth};
		fill: none;
	}
	.cynefinArrowHead {
		fill: ${n.arrowColor};
		stroke: none;
	}
	.cynefinArrowLabel {
		font-size: ${n.itemFontSize-1}px;
		fill: ${n.textColor};
	}
	.cynefinTitle {
		font-size: ${n.domainFontSize+2}px;
		font-weight: bold;
		fill: ${n.labelColor};
	}
	`},"styles"),Gt=Ht,Zt={parser:Wt,db:it,renderer:_t,styles:Gt};export{Zt as diagram};
