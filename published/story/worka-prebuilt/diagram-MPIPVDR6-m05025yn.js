import{D}from"./entry-m9ara8tg.js";import{e,t,de,T,u,L,p,g,y,m,b,w,v,M,I}from"./entry-1m1ab7gm.js";import{j}from"./entry-2pwp620f.js";var S={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},E=32,F={axes:[],curves:[],options:S},A=structuredClone(F),U=T.radar,X=e(()=>I({...U,...u().radar}),"getConfig"),P=e(()=>A.axes,"getAxes"),K=e(()=>A.curves,"getCurves"),N=e(()=>A.options,"getOptions"),Y=e((n)=>{A.axes=n.map((a)=>({name:a.name,label:a.label??a.name}))},"setAxes"),Z=e((n)=>{A.curves=n.map((a)=>({name:a.name,label:a.label??a.name,entries:q(a.entries)}))},"setCurves"),q=e((n)=>{if(n[0].axis==null)return n.map((r)=>r.value);let a=P();if(a.length===0)throw Error("Axes must be populated before curves for reference entries");return a.map((r)=>{let s=n.find((o)=>o.axis?.$refText===r.name);if(s===void 0)throw Error("Missing entry for axis "+r.label);return s.value})},"computeCurveEntries"),J=e((n)=>{let a=n.reduce((r,s)=>(r[s.name]=s,r),{});if(A.options={showLegend:a.showLegend?.value??S.showLegend,ticks:a.ticks?.value??S.ticks,max:a.max?.value??S.max,min:a.min?.value??S.min,graticule:a.graticule?.value??S.graticule},A.options.ticks>E)t.warn(`Radar diagram ticks (${A.options.ticks}) exceeds maximum allowed (${E}). Using ${E} instead.`),A.options.ticks=E},"setOptions"),Q=e(()=>{p(),A=structuredClone(F)},"clear"),R={getAxes:P,getCurves:K,getOptions:N,setAxes:Y,setCurves:Z,setOptions:J,getConfig:X,clear:Q,setAccTitle:g,getAccTitle:y,setDiagramTitle:w,getDiagramTitle:v,getAccDescription:b,setAccDescription:m},tt=e((n)=>{D(n,R);let{axes:a,curves:r,options:s}=n;R.setAxes(a),R.setCurves(r),R.setOptions(s)},"populate"),et={parse:e(async(n)=>{let a=await j("radar",n);t.debug(a),tt(a)},"parse")},at=e((n,a,r,s)=>{let o=s.db,c=o.getAxes(),d=o.getCurves(),i=o.getOptions(),l=o.getConfig(),x=o.getDiagramTitle(),f=M(a),h=rt(f,l),C=i.max??Math.max(...d.map((_)=>Math.max(..._.entries))),k=i.min,O=Math.min(l.width,l.height)/2;nt(h,c,O,i.ticks,i.graticule),st(h,c,O,l),z(h,c,d,k,C,i.graticule,l),W(h,d,i.showLegend,l),h.append("text").attr("class","radarTitle").text(x).attr("x",0).attr("y",-l.height/2-l.marginTop)},"draw"),rt=e((n,a)=>{let r=a.width+a.marginLeft+a.marginRight,s=a.height+a.marginTop+a.marginBottom,o={x:a.marginLeft+a.width/2,y:a.marginTop+a.height/2};return L(n,s,r,a.useMaxWidth??!0),n.attr("viewBox",`0 0 ${r} ${s}`).attr("overflow","visible"),n.append("g").attr("transform",`translate(${o.x}, ${o.y})`)},"drawFrame"),nt=e((n,a,r,s,o)=>{if(o==="circle")for(let c=0;c<s;c++){let d=r*(c+1)/s;n.append("circle").attr("r",d).attr("class","radarGraticule")}else if(o==="polygon"){let c=a.length;for(let d=0;d<s;d++){let i=r*(d+1)/s,l=a.map((x,f)=>{let h=2*f*Math.PI/c-Math.PI/2,C=i*Math.cos(h),k=i*Math.sin(h);return`${C},${k}`}).join(" ");n.append("polygon").attr("points",l).attr("class","radarGraticule")}}},"drawGraticule"),st=e((n,a,r,s)=>{let o=a.length;for(let c=0;c<o;c++){let d=a[c].label,i=2*c*Math.PI/o-Math.PI/2,l=Math.cos(i),x=Math.sin(i);n.append("line").attr("x1",0).attr("y1",0).attr("x2",r*s.axisScaleFactor*l).attr("y2",r*s.axisScaleFactor*x).attr("class","radarAxisLine");let f=l>0.01?"start":l<-0.01?"end":"middle",h=x>0.01?"hanging":x<-0.01?"auto":"central",C=4;n.append("text").text(d).attr("x",r*s.axisLabelFactor*l+C*l).attr("y",r*s.axisLabelFactor*x+C*x).attr("text-anchor",f).attr("dominant-baseline",h).attr("class","radarAxisLabel")}},"drawAxes");function z(n,a,r,s,o,c,d){let i=a.length,l=Math.min(d.width,d.height)/2;r.forEach((x,f)=>{if(x.entries.length!==i)return;let h=x.entries.map((C,k)=>{let O=2*Math.PI*k/i-Math.PI/2,_=G(C,s,o,l),V=_*Math.cos(O),H=_*Math.sin(O);return{x:V,y:H}});if(c==="circle")n.append("path").attr("d",B(h,d.curveTension)).attr("class",`radarCurve-${f}`);else if(c==="polygon")n.append("polygon").attr("points",h.map((C)=>`${C.x},${C.y}`).join(" ")).attr("class",`radarCurve-${f}`)})}e(z,"drawCurves");function G(n,a,r,s){let o=Math.min(Math.max(n,a),r);return s*(o-a)/(r-a)}e(G,"relativeRadius");function B(n,a){let r=n.length,s=`M${n[0].x},${n[0].y}`;for(let o=0;o<r;o++){let c=n[(o-1+r)%r],d=n[o],i=n[(o+1)%r],l=n[(o+2)%r],x={x:d.x+(i.x-c.x)*a,y:d.y+(i.y-c.y)*a},f={x:i.x-(l.x-d.x)*a,y:i.y-(l.y-d.y)*a};s+=` C${x.x},${x.y} ${f.x},${f.y} ${i.x},${i.y}`}return`${s} Z`}e(B,"closedRoundCurve");function W(n,a,r,s){if(!r)return;let o=(s.width/2+s.marginRight)*3/4,c=-(s.height/2+s.marginTop)*3/4,d=20;a.forEach((i,l)=>{let x=n.append("g").attr("transform",`translate(${o}, ${c+l*d})`);x.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${l}`),x.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(i.label)})}e(W,"drawLegend");var ot={draw:at},it=e((n,a)=>{let r="";for(let s=0;s<n.THEME_COLOR_LIMIT;s++){let o=n[`cScale${s}`];r+=`
		.radarCurve-${s} {
			color: ${o};
			fill: ${o};
			fill-opacity: ${a.curveOpacity};
			stroke: ${o};
			stroke-width: ${a.curveStrokeWidth};
		}
		.radarLegendBox-${s} {
			fill: ${o};
			fill-opacity: ${a.curveOpacity};
			stroke: ${o};
		}
		`}return r},"genIndexStyles"),lt=e((n)=>{let a=de(),r=u(),s=I(a,r.themeVariables),o=I(s.radar,n);return{themeVariables:s,radarOptions:o}},"buildRadarStyleOptions"),ct=e(({radar:n}={})=>{let{themeVariables:a,radarOptions:r}=lt(n);return`
	.radarTitle {
		font-size: ${a.fontSize};
		color: ${a.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${r.axisColor};
		stroke-width: ${r.axisStrokeWidth};
	}
	.radarAxisLabel {
		font-size: ${r.axisLabelFontSize}px;
		color: ${r.axisColor};
	}
	.radarGraticule {
		fill: ${r.graticuleColor};
		fill-opacity: ${r.graticuleOpacity};
		stroke: ${r.graticuleColor};
		stroke-width: ${r.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${r.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${it(a,r)}
	`},"styles"),vt={parser:et,db:R,renderer:ot,styles:ct};export{vt as diagram};
