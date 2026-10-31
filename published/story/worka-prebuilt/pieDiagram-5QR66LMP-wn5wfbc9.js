import{D}from"./entry-m9ara8tg.js";import{e,t,T,L,p,g,y,m,b,w,v,r,ee,cr,hn,M,Ie,I}from"./entry-1m1ab7gm.js";import{j}from"./entry-2pwp620f.js";import{Pe}from"./entry-3pxsxfkx.js";import{st}from"./entry-h3dmq973.js";function rt(a,l){return l<a?-1:l>a?1:l>=a?0:NaN}function at(a){return a}function nt(){var a=at,l=rt,O=null,_=ee(0),d=ee(cr),S=ee(0);function s(n){var o,u=(n=hn(n)).length,A,W,N=0,C=Array(u),c=Array(u),P=+_.apply(this,arguments),V=Math.min(cr,Math.max(-cr,d.apply(this,arguments)-P)),G,Z=Math.min(Math.abs(V)/u,S.apply(this,arguments)),h=Z*(V<0?-1:1),F;for(o=0;o<u;++o)if((F=c[C[o]=o]=+a(n[o],o,n))>0)N+=F;if(l!=null)C.sort(function(U,k){return l(c[U],c[k])});else if(O!=null)C.sort(function(U,k){return O(n[U],n[k])});for(o=0,W=N?(V-u*h)/N:0;o<u;++o,P=G)A=C[o],F=c[A],G=P+(F>0?F*W:0)+h,c[A]={data:n[A],index:o,value:F,startAngle:P,endAngle:G,padAngle:Z};return c}return s.value=function(n){return arguments.length?(a=typeof n==="function"?n:ee(+n),s):a},s.sortValues=function(n){return arguments.length?(l=n,O=null,s):l},s.sort=function(n){return arguments.length?(O=n,l=null,s):O},s.startAngle=function(n){return arguments.length?(_=typeof n==="function"?n:ee(+n),s):_},s.endAngle=function(n){return arguments.length?(d=typeof n==="function"?n:ee(+n),s):d},s.padAngle=function(n){return arguments.length?(S=typeof n==="function"?n:ee(+n),s):S},s}var dt=T.pie,it={sections:new Map,showData:!1,config:dt},{sections:K,showData:ot}=it,St=structuredClone(dt),yt=e(()=>structuredClone(St),"getConfig"),wt=e(()=>{K=new Map,ot=it.showData,p()},"clear"),At=e(({label:a,value:l})=>{if(l<0)throw Error(`"${a}" has invalid value: ${l}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);if(!K.has(a))K.set(a,l),t.debug(`added new section: ${a}, with value: ${l}`)},"addSection"),Ct=e(()=>K,"getSections"),$t=e((a)=>{ot=a},"setShowData"),Dt=e(()=>ot,"getShowData"),pt={getConfig:yt,clear:wt,setDiagramTitle:w,getDiagramTitle:v,setAccTitle:g,getAccTitle:y,setAccDescription:m,getAccDescription:b,addSection:At,getSections:Ct,setShowData:$t,getShowData:Dt},Tt=e((a,l)=>{D(a,l),l.setShowData(a.showData),a.sections.map(l.addSection)},"populateDb"),bt={parse:e(async(a)=>{let l=await j("pie",a);t.debug(l),Tt(l,pt)},"parse")},kt=e((a)=>`
  .pieCircle{
    stroke: ${a.pieStrokeColor};
    stroke-width : ${a.pieStrokeWidth};
    opacity : ${a.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${a.pieOuterStrokeColor};
    stroke-width: ${a.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${a.pieTitleTextSize};
    fill: ${a.pieTitleTextColor};
    font-family: ${a.fontFamily};
  }
  .slice {
    font-family: ${a.fontFamily};
    fill: ${a.pieSectionTextColor};
    font-size:${a.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${a.pieLegendTextColor};
    font-family: ${a.fontFamily};
    font-size: ${a.pieLegendTextSize};
  }
`,"getStyles"),zt=kt,Et=e((a)=>{let l=[...a.values()].reduce((d,S)=>d+S,0),O=[...a.entries()].map(([d,S])=>({label:d,value:S})).filter((d)=>d.value/l*100>=1);return nt().value((d)=>d.value).sort(null)(O)},"createPieArcs"),Mt=e((a,l,O,_)=>{t.debug(`rendering pie chart
`+a);let d=_.db,S=r(),s=I(d.getConfig(),S.pie),n=40,o=18,u=4,A=450,W=A,N=M(l),C=N.append("g");C.attr("transform","translate("+W/2+","+A/2+")");let{themeVariables:c}=S,[P]=Ie(c.pieOuterStrokeWidth);P??=2;let{legendPosition:V,textPosition:G}=s,Z=s.donutHole>0&&s.donutHole<=0.9?s.donutHole:0,h=Math.min(W,A)/2-n,F=st().innerRadius(Z*h).outerRadius(h),U=st().innerRadius(h*G).outerRadius(h*G),k=C.append("g");k.append("circle").attr("cx",0).attr("cy",0).attr("r",h+P/2).attr("class","pieOuterCircle");let q=d.getSections(),ft=Et(q),ht=[c.pie1,c.pie2,c.pie3,c.pie4,c.pie5,c.pie6,c.pie7,c.pie8,c.pie9,c.pie10,c.pie11,c.pie12],Q=0;q.forEach((i)=>{Q+=i});let lt=ft.filter((i)=>(i.data.value/Q*100).toFixed(0)!=="0"),Y=Pe(ht).domain([...q.keys()]);k.selectAll("mySlices").data(lt).enter().append("path").attr("d",F).attr("fill",(i)=>Y(i.data.label)).attr("class",(i)=>{let f="pieCircle";if(s.highlightSlice==="hover")f+=" highlightedOnHover";else if(s.highlightSlice===i.data.label)f+=" highlighted";return f}),k.selectAll("mySlices").data(lt).enter().append("text").text((i)=>(i.data.value/Q*100).toFixed(0)+"%").attr("transform",(i)=>"translate("+U.centroid(i)+")").style("text-anchor","middle").attr("class","slice");let mt=C.append("text").text(d.getDiagramTitle()).attr("x",0).attr("y",-(A-50)/2).attr("class","pieTitleText"),X=[...q.entries()].map(([i,f])=>({label:i,value:f})),H=C.selectAll(".legend").data(X).enter().append("g").attr("class","legend");H.append("rect").attr("width",o).attr("height",o).style("fill",(i)=>Y(i.label)).style("stroke",(i)=>Y(i.label)),H.append("text").attr("x",o+u).attr("y",o-u).text((i)=>{if(d.getShowData())return`${i.label} [${i.value}]`;return i.label});let B=Math.max(...H.selectAll("text").nodes().map((i)=>i?.getBoundingClientRect().width??0)),J=A,tt=W+n,x=o+u,et=X.length*x;switch(V){case"center":H.attr("transform",(i,f)=>{let z=x*X.length/2,E=-B/2-(o+u),R=f*x-z;return"translate("+E+","+R+")"});break;case"top":J+=et,H.attr("transform",(i,f)=>{let z=h,E=-B/2-(o+u),R=f*x-z;return`translate(${E}, ${R})`}),k.attr("transform",()=>`translate(0, ${et+x})`);break;case"bottom":J+=et,H.attr("transform",(i,f)=>{let z=-h-x,E=-B/2-(o+u),R=f*x-z;return"translate("+E+","+R+")"});break;case"left":tt+=o+u+B,H.attr("transform",(i,f)=>{let z=x*X.length/2,E=-h-(o+u),R=f*x-z;return"translate("+E+","+R+")"}),k.attr("transform",()=>`translate(${B+o+u}, 0)`);break;case"right":default:tt+=o+u+B,H.attr("transform",(i,f)=>{let z=x*X.length/2,E=12*o,R=f*x-z;return"translate("+E+","+R+")"});break}let ct=mt.node()?.getBoundingClientRect().width??0,vt=W/2-ct/2,xt=W/2+ct/2,ut=Math.min(0,vt),gt=Math.max(tt,xt)-ut;N.attr("viewBox",`${ut} 0 ${gt} ${J}`),L(N,J,gt,s.useMaxWidth)},"draw"),Rt={draw:Mt},Jt={parser:bt,db:pt,renderer:Rt,styles:zt};export{Jt as diagram};
