import{N}from"./entry-1dbye6ry.js";import{e,t,de,T,u,R,p,g,y,m,v,w,b,M,I}from"./entry-gjg7apff.js";import{j}from"./entry-eegdx6ch.js";var L={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},E=32,F={axes:[],curves:[],options:L},A=structuredClone(F),H=T.radar,U=e(()=>I({...H,...u().radar}),"getConfig"),D=e(()=>A.axes,"getAxes"),X=e(()=>A.curves,"getCurves"),K=e(()=>A.options,"getOptions"),Y=e((n)=>{A.axes=n.map((a)=>({name:a.name,label:a.label??a.name}))},"setAxes"),Z=e((n)=>{A.curves=n.map((a)=>({name:a.name,label:a.label??a.name,entries:q(a.entries)}))},"setCurves"),q=e((n)=>{if(n[0].axis==null)return n.map((r)=>r.value);let a=D();if(a.length===0)throw Error("Axes must be populated before curves for reference entries");return a.map((r)=>{let s=n.find((o)=>o.axis?.$refText===r.name);if(s===void 0)throw Error("Missing entry for axis "+r.label);return s.value})},"computeCurveEntries"),J=e((n)=>{let a=n.reduce((r,s)=>(r[s.name]=s,r),{});if(A.options={showLegend:a.showLegend?.value??L.showLegend,ticks:a.ticks?.value??L.ticks,max:a.max?.value??L.max,min:a.min?.value??L.min,graticule:a.graticule?.value??L.graticule},A.options.ticks>E)t.warn(`Radar diagram ticks (${A.options.ticks}) exceeds maximum allowed (${E}). Using ${E} instead.`),A.options.ticks=E},"setOptions"),Q=e(()=>{p(),A=structuredClone(F)},"clear"),O={getAxes:D,getCurves:X,getOptions:K,setAxes:Y,setCurves:Z,setOptions:J,getConfig:U,clear:Q,setAccTitle:g,getAccTitle:y,setDiagramTitle:w,getDiagramTitle:b,getAccDescription:v,setAccDescription:m},tt=e((n)=>{N(n,O);let{axes:a,curves:r,options:s}=n;O.setAxes(a),O.setCurves(r),O.setOptions(s)},"populate"),et={parse:e(async(n)=>{let a=await j("radar",n);t.debug(a),tt(a)},"parse")},at=e((n,a,r,s)=>{let o=s.db,c=o.getAxes(),d=o.getCurves(),i=o.getOptions(),l=o.getConfig(),x=o.getDiagramTitle(),f=M(a),h=rt(f,l),C=i.max??Math.max(...d.map((_)=>Math.max(..._.entries))),S=i.min,k=Math.min(l.width,l.height)/2;nt(h,c,k,i.ticks,i.graticule),st(h,c,k,l),P(h,c,d,S,C,i.graticule,l),B(h,d,i.showLegend,l),h.append("text").attr("class","radarTitle").text(x).attr("x",0).attr("y",-l.height/2-l.marginTop)},"draw"),rt=e((n,a)=>{let r=a.width+a.marginLeft+a.marginRight,s=a.height+a.marginTop+a.marginBottom,o={x:a.marginLeft+a.width/2,y:a.marginTop+a.height/2};return R(n,s,r,a.useMaxWidth??!0),n.attr("viewBox",`0 0 ${r} ${s}`).attr("overflow","visible"),n.append("g").attr("transform",`translate(${o.x}, ${o.y})`)},"drawFrame"),nt=e((n,a,r,s,o)=>{if(o==="circle")for(let c=0;c<s;c++){let d=r*(c+1)/s;n.append("circle").attr("r",d).attr("class","radarGraticule")}else if(o==="polygon"){let c=a.length;for(let d=0;d<s;d++){let i=r*(d+1)/s,l=a.map((x,f)=>{let h=2*f*Math.PI/c-Math.PI/2,C=i*Math.cos(h),S=i*Math.sin(h);return`${C},${S}`}).join(" ");n.append("polygon").attr("points",l).attr("class","radarGraticule")}}},"drawGraticule"),st=e((n,a,r,s)=>{let o=a.length;for(let c=0;c<o;c++){let d=a[c].label,i=2*c*Math.PI/o-Math.PI/2,l=Math.cos(i),x=Math.sin(i);n.append("line").attr("x1",0).attr("y1",0).attr("x2",r*s.axisScaleFactor*l).attr("y2",r*s.axisScaleFactor*x).attr("class","radarAxisLine");let f=l>0.01?"start":l<-0.01?"end":"middle",h=x>0.01?"hanging":x<-0.01?"auto":"central",C=4;n.append("text").text(d).attr("x",r*s.axisLabelFactor*l+C*l).attr("y",r*s.axisLabelFactor*x+C*x).attr("text-anchor",f).attr("dominant-baseline",h).attr("class","radarAxisLabel")}},"drawAxes");function P(n,a,r,s,o,c,d){let i=a.length,l=Math.min(d.width,d.height)/2;r.forEach((x,f)=>{if(x.entries.length!==i)return;let h=x.entries.map((C,S)=>{let k=2*Math.PI*S/i-Math.PI/2,_=z(C,s,o,l),W=_*Math.cos(k),V=_*Math.sin(k);return{x:W,y:V}});if(c==="circle")n.append("path").attr("d",G(h,d.curveTension)).attr("class",`radarCurve-${f}`);else if(c==="polygon")n.append("polygon").attr("points",h.map((C)=>`${C.x},${C.y}`).join(" ")).attr("class",`radarCurve-${f}`)})}e(P,"drawCurves");function z(n,a,r,s){let o=Math.min(Math.max(n,a),r);return s*(o-a)/(r-a)}e(z,"relativeRadius");function G(n,a){let r=n.length,s=`M${n[0].x},${n[0].y}`;for(let o=0;o<r;o++){let c=n[(o-1+r)%r],d=n[o],i=n[(o+1)%r],l=n[(o+2)%r],x={x:d.x+(i.x-c.x)*a,y:d.y+(i.y-c.y)*a},f={x:i.x-(l.x-d.x)*a,y:i.y-(l.y-d.y)*a};s+=` C${x.x},${x.y} ${f.x},${f.y} ${i.x},${i.y}`}return`${s} Z`}e(G,"closedRoundCurve");function B(n,a,r,s){if(!r)return;let o=(s.width/2+s.marginRight)*3/4,c=-(s.height/2+s.marginTop)*3/4,d=20;a.forEach((i,l)=>{let x=n.append("g").attr("transform",`translate(${o}, ${c+l*d})`);x.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${l}`),x.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(i.label)})}e(B,"drawLegend");var ot={draw:at},it=e((n,a)=>{let r="";for(let s=0;s<n.THEME_COLOR_LIMIT;s++){let o=n[`cScale${s}`];r+=`
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
	`},"styles"),vt={parser:et,db:O,renderer:ot,styles:ct};export{vt as diagram};
