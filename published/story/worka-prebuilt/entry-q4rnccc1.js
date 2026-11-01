import{e,t,de,u,_,R,p,r,M}from"./entry-gjg7apff.js";var D="",E="",W="",B=[],A=new Map,F=e((i)=>_(i,r()),"sanitizeText"),b=e((i)=>{switch(i.type){case"terminal":return{...i,value:F(i.value)};case"nonterminal":return{...i,name:F(i.name)};case"sequence":return{...i,elements:i.elements.map(b)};case"choice":return{...i,alternatives:i.alternatives.map(b)};case"optional":return{...i,element:b(i.element)};case"repetition":return{...i,element:b(i.element),separator:i.separator?b(i.separator):void 0};case"special":return{...i,text:F(i.text)}}},"sanitizeAstNode"),j=e(()=>{D="",E="",W="",B.length=0,A.clear(),p(),t.debug("[Railroad] Database cleared")},"clear"),I=e((i)=>{D=F(i),t.debug("[Railroad] Title set:",i)},"setTitle"),X=e(()=>D,"getTitle"),K=e((i)=>{let o={...i,name:F(i.name),definition:b(i.definition),comment:i.comment?F(i.comment):void 0};if(t.debug("[Railroad] Adding rule:",o.name),A.has(o.name))t.warn(`[Railroad] Rule '${o.name}' is already defined. Overwriting.`);B.push(o),A.set(o.name,o)},"addRule"),J=e(()=>B,"getRules"),Q=e((i)=>A.get(i),"getRule"),Z=e((i)=>{E=F(i).replace(/^\s+/g,""),t.debug("[Railroad] Accessibility title set:",i)},"setAccTitle"),V=e(()=>E,"getAccTitle"),ee=e((i)=>{W=F(i).replace(/\n\s+/g,`
`),t.debug("[Railroad] Accessibility description set:",i)},"setAccDescription"),te=e(()=>W,"getAccDescription"),re=I,ie=X,G={clear:j,setTitle:I,getTitle:X,addRule:K,getRules:J,getRule:Q,setAccTitle:Z,getAccTitle:V,setAccDescription:ee,getAccDescription:te,setDiagramTitle:re,getDiagramTitle:ie},w={compactMode:!1,padding:10,verticalSeparation:8,horizontalSeparation:10,arcRadius:10,fontSize:14,fontFamily:"monospace",terminalFill:"#FFFFC0",terminalStroke:"#000000",terminalTextColor:"#000000",nonTerminalFill:"#FFFFFF",nonTerminalStroke:"#000000",nonTerminalTextColor:"#000000",lineColor:"#000000",strokeWidth:2,markerFill:"#000000",commentFill:"#E8E8E8",commentStroke:"#888888",commentTextColor:"#666666",specialFill:"#F0E0FF",specialStroke:"#8800CC",ruleNameColor:"#000066",showMarkers:!0,markerRadius:5},ne=/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$|^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\([\d\s%+,./-]+\)$|^[a-z]+$/i,ae=/^[\w "',.-]+$/,oe=new Set(["compactMode","padding","verticalSeparation","horizontalSeparation","arcRadius","fontSize","fontFamily","terminalFill","terminalStroke","terminalTextColor","nonTerminalFill","nonTerminalStroke","nonTerminalTextColor","lineColor","strokeWidth","markerFill","commentFill","commentStroke","commentTextColor","specialFill","specialStroke","ruleNameColor","showMarkers","markerRadius"]),H=e((i)=>{if(!i)return!1;return Object.keys(i).every((o)=>o==="railroad"||oe.has(o))},"isRailroadStyleOptions"),le=e((i)=>{if(!i)return{};if("railroad"in i&&i.railroad)return i.railroad;return H(i)?i:{}},"extractRailroadOverrides"),se=e((i)=>{if(!i||H(i))return{};let{railroad:o,svgId:s,theme:a,look:n,...l}=i;return l},"extractThemeOverrides"),f=e((i,o)=>{if(typeof i!=="string")return o;let s=i.trim();return ne.test(s)?s:o},"sanitizeColorValue"),q=e((i,o)=>{if(typeof i!=="string")return o;let s=i.trim();return ae.test(s)?s:o},"sanitizeFontFamilyValue"),z=e((i,o)=>{let s=typeof i==="number"?i:typeof i==="string"?Number.parseFloat(i):Number.NaN;return Number.isFinite(s)&&s>=0?s:o},"sanitizeNumberValue"),ce=e((i)=>{let o=typeof i==="number"?i:typeof i==="string"?Number.parseFloat(i):Number.NaN;return Number.isFinite(o)&&o>0?o:void 0},"parseThemeFontSize"),me=e((i)=>{let o=q(i.fontFamily,w.fontFamily),s=ce(i.fontSize)??w.fontSize;return{...w,fontFamily:o,fontSize:s,terminalFill:f(i.secondBkg??i.secondaryColor,w.terminalFill),terminalStroke:f(i.secondaryBorderColor??i.lineColor,w.terminalStroke),terminalTextColor:f(i.secondaryTextColor??i.textColor,w.terminalTextColor),nonTerminalFill:f(i.mainBkg??i.background,w.nonTerminalFill),nonTerminalStroke:f(i.primaryBorderColor??i.lineColor,w.nonTerminalStroke),nonTerminalTextColor:f(i.primaryTextColor??i.textColor,w.nonTerminalTextColor),lineColor:f(i.lineColor,w.lineColor),markerFill:f(i.lineColor,w.markerFill),commentFill:f(i.labelBackground??i.tertiaryColor,w.commentFill),commentStroke:f(i.tertiaryBorderColor??i.lineColor,w.commentStroke),commentTextColor:f(i.tertiaryTextColor??i.textColor,w.commentTextColor),specialFill:f(i.tertiaryColor??i.secondaryColor,w.specialFill),specialStroke:f(i.tertiaryBorderColor??i.secondaryBorderColor,w.specialStroke),ruleNameColor:f(i.titleColor??i.textColor,w.ruleNameColor)}},"buildThemeDefaults"),Y=e((i)=>{let o=u(),s={...de(),...o.themeVariables??{},...se(i)},a=me(s),n={...o.railroad??{},...le(i)};return{compactMode:n.compactMode??a.compactMode,padding:z(n.padding,a.padding),verticalSeparation:z(n.verticalSeparation,a.verticalSeparation),horizontalSeparation:z(n.horizontalSeparation,a.horizontalSeparation),arcRadius:z(n.arcRadius,a.arcRadius),fontSize:z(n.fontSize,a.fontSize),fontFamily:q(n.fontFamily,a.fontFamily),terminalFill:f(n.terminalFill,a.terminalFill),terminalStroke:f(n.terminalStroke,a.terminalStroke),terminalTextColor:f(n.terminalTextColor,a.terminalTextColor),nonTerminalFill:f(n.nonTerminalFill,a.nonTerminalFill),nonTerminalStroke:f(n.nonTerminalStroke,a.nonTerminalStroke),nonTerminalTextColor:f(n.nonTerminalTextColor,a.nonTerminalTextColor),lineColor:f(n.lineColor,a.lineColor),strokeWidth:z(n.strokeWidth,a.strokeWidth),markerFill:f(n.markerFill,a.markerFill),commentFill:f(n.commentFill,a.commentFill),commentStroke:f(n.commentStroke,a.commentStroke),commentTextColor:f(n.commentTextColor,a.commentTextColor),specialFill:f(n.specialFill,a.specialFill),specialStroke:f(n.specialStroke,a.specialStroke),ruleNameColor:f(n.ruleNameColor,a.ruleNameColor),showMarkers:n.showMarkers??a.showMarkers,markerRadius:z(n.markerRadius,a.markerRadius)}},"buildRailroadStyleOptions"),pt=e((i)=>{let{fontFamily:o,fontSize:s,terminalFill:a,terminalStroke:n,terminalTextColor:l,nonTerminalFill:T,nonTerminalStroke:m,nonTerminalTextColor:d,lineColor:x,strokeWidth:g,markerFill:h,commentFill:v,commentStroke:c,commentTextColor:C,specialFill:N,specialStroke:y,ruleNameColor:S}=Y(i);return`
  .railroad-diagram {
    font-family: ${o};
    font-size: ${s}px;
  }

  .railroad-terminal rect {
    fill: ${a};
    stroke: ${n};
    stroke-width: ${g}px;
  }

  .railroad-terminal text {
    fill: ${l};
    font-family: ${o};
    font-size: ${s}px;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .railroad-nonterminal rect {
    fill: ${T};
    stroke: ${m};
    stroke-width: ${g}px;
  }

  .railroad-nonterminal text {
    fill: ${d};
    font-family: ${o};
    font-size: ${s}px;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .railroad-line {
    stroke: ${x};
    stroke-width: ${g}px;
    fill: none;
  }

  .railroad-start circle,
  .railroad-end circle {
    fill: ${h};
  }

  .railroad-comment ellipse {
    fill: ${v};
    stroke: ${c};
    stroke-width: ${g}px;
  }

  .railroad-comment text {
    fill: ${C};
    font-style: italic;
    font-family: ${o};
    font-size: ${s}px;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .railroad-special rect {
    fill: ${N};
    stroke: ${y};
    stroke-width: ${g}px;
    stroke-dasharray: 5,3;
  }

  .railroad-special text {
    fill: ${d};
    font-family: ${o};
    font-size: ${s}px;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .railroad-rule-name {
    font-weight: bold;
    fill: ${S};
    font-family: ${o};
    font-size: ${s}px;
  }

  .railroad-group {
    /* Grouping container, no specific styles */
  }
`},"getStyles"),k=class{constructor(){this.d=""}static{e(this,"PathBuilder")}moveTo(i,o){return this.d+=`M ${i} ${o} `,this}lineTo(i,o){return this.d+=`L ${i} ${o} `,this}horizontalTo(i){return this.d+=`H ${i} `,this}verticalTo(i){return this.d+=`V ${i} `,this}arcTo(i,o,s,a,n,l,T){return this.d+=`A ${i} ${o} ${s} ${a?1:0} ${n?1:0} ${l} ${T} `,this}build(){return this.d.trim()}},he=class{constructor(i,o=Y()){this.textCache=new Map,this.svg=i,this.config=o}static{e(this,"RailroadRenderer")}measureText(i){if(this.textCache.has(i))return this.textCache.get(i);let o=this.svg.append("text").attr("font-family",this.config.fontFamily).attr("font-size",this.config.fontSize).text(i),s=o.node().getBBox(),a={width:s.width,height:s.height};return o.remove(),this.textCache.set(i,a),a}renderTerminal(i,o){let s=this.measureText(o),a=s.width+this.config.padding*2,n=s.height+this.config.padding*2,l=i.append("g").attr("class","railroad-terminal");return l.append("rect").attr("x",0).attr("y",0).attr("width",a).attr("height",n).attr("rx",10).attr("ry",10),l.append("text").attr("x",a/2).attr("y",n/2).text(o),{element:l.node(),dimensions:{width:a,height:n,up:n/2,down:n/2}}}renderNonTerminal(i,o){let s=this.measureText(o),a=s.width+this.config.padding*2,n=s.height+this.config.padding*2,l=i.append("g").attr("class","railroad-nonterminal");return l.append("rect").attr("x",0).attr("y",0).attr("width",a).attr("height",n),l.append("text").attr("x",a/2).attr("y",n/2).text(o),{element:l.node(),dimensions:{width:a,height:n,up:n/2,down:n/2}}}renderSequence(i,o){let s=o.map((d)=>this.renderExpression(i,d)),a=0,n=0,l=0;for(let d of s)a+=d.dimensions.width,n=Math.max(n,d.dimensions.up),l=Math.max(l,d.dimensions.down);a+=(s.length-1)*this.config.horizontalSeparation;let T=i.append("g").attr("class","railroad-sequence"),m=0;for(let d=0;d<s.length;d++){let x=s[d],g=n-x.dimensions.up;if(T.node().appendChild(x.element).setAttribute("transform",`translate(${m}, ${g})`),d<s.length-1){let v=m+x.dimensions.width,c=v+this.config.horizontalSeparation,C=n;T.append("path").attr("class","railroad-line").attr("d",new k().moveTo(v,C).lineTo(c,C).build())}m+=x.dimensions.width+this.config.horizontalSeparation}return{element:T.node(),dimensions:{width:a,height:n+l,up:n,down:l}}}renderChoice(i,o){let s=o.map((h)=>this.renderExpression(i,h)),a=0,n=0;for(let h of s)a=Math.max(a,h.dimensions.width),n+=h.dimensions.height;n+=(s.length-1)*this.config.verticalSeparation;let l=this.config.arcRadius,T=l*4,m=a+T,d=i.append("g").attr("class","railroad-choice"),x=0,g=n/2;for(let h of s){let v=x,c=v+h.dimensions.up,C=l*2+(a-h.dimensions.width)/2;d.node().appendChild(h.element).setAttribute("transform",`translate(${C}, ${v})`);let y=new k,S=c>g;if(c===g)y.moveTo(0,g).lineTo(C,c);else y.moveTo(0,g).arcTo(l,l,0,!1,S,l,g+(S?l:-l)).lineTo(l,c-(S?l:-l)).arcTo(l,l,0,!1,!S,l*2,c).lineTo(C,c);d.append("path").attr("class","railroad-line").attr("d",y.build());let O=new k,P=C+h.dimensions.width,U=m-l*2;if(c===g)O.moveTo(P,c).lineTo(m,g);else O.moveTo(P,c).lineTo(U,c).arcTo(l,l,0,!1,!S,m-l,c+(S?-l:l)).lineTo(m-l,g+(S?l:-l)).arcTo(l,l,0,!1,S,m,g);d.append("path").attr("class","railroad-line").attr("d",O.build()),x+=h.dimensions.height+this.config.verticalSeparation}return{element:d.node(),dimensions:{width:m,height:n,up:g,down:n-g}}}renderOptional(i,o){let s=this.renderExpression(i,o),a=this.config.arcRadius,n=a*2,l=s.dimensions.width+a*4,T=s.dimensions.height+n,m=i.append("g").attr("class","railroad-optional"),d=a*2,x=n;m.node().appendChild(s.element).setAttribute("transform",`translate(${d}, ${x})`);let h=x+s.dimensions.up,v=new k().moveTo(0,h).lineTo(a*2,h);m.append("path").attr("class","railroad-line").attr("d",v.build());let c=new k().moveTo(d+s.dimensions.width,h).lineTo(l,h);m.append("path").attr("class","railroad-line").attr("d",c.build());let C=new k().moveTo(0,h).arcTo(a,a,0,!1,!1,a,h-a).lineTo(a,a).arcTo(a,a,0,!1,!0,a*2,0).lineTo(l-a*2,0).arcTo(a,a,0,!1,!0,l-a,a).lineTo(l-a,h-a).arcTo(a,a,0,!1,!1,l,h);return m.append("path").attr("class","railroad-line").attr("d",C.build()),{element:m.node(),dimensions:{width:l,height:T,up:h,down:T-h}}}renderRepetition(i,o,s){let a=this.renderExpression(i,o),n=this.config.arcRadius,l=n*2,T=a.dimensions.width+n*4,m=s===0,d=a.dimensions.height+l+(m?l:0),x=i.append("g").attr("class","railroad-repetition"),g=n*2,h=m?l:0;x.node().appendChild(a.element).setAttribute("transform",`translate(${g}, ${h})`);let c=h+a.dimensions.up;x.append("path").attr("class","railroad-line").attr("d",new k().moveTo(0,c).lineTo(n*2,c).build()),x.append("path").attr("class","railroad-line").attr("d",new k().moveTo(g+a.dimensions.width,c).lineTo(T,c).build());let C=h+a.dimensions.height+n,N=new k().moveTo(g+a.dimensions.width,c).arcTo(n,n,0,!1,!0,g+a.dimensions.width+n,c+n).lineTo(g+a.dimensions.width+n,C).arcTo(n,n,0,!1,!0,g+a.dimensions.width,C+n).lineTo(n*2,C+n).arcTo(n,n,0,!1,!0,n,C).lineTo(n,c+n).arcTo(n,n,0,!1,!0,n*2,c);if(x.append("path").attr("class","railroad-line").attr("d",N.build()),m){let y=new k().moveTo(0,c).arcTo(n,n,0,!1,!1,n,c-n).lineTo(n,n).arcTo(n,n,0,!1,!0,n*2,0).lineTo(T-n*2,0).arcTo(n,n,0,!1,!0,T-n,n).lineTo(T-n,c-n).arcTo(n,n,0,!1,!1,T,c);x.append("path").attr("class","railroad-line").attr("d",y.build())}return{element:x.node(),dimensions:{width:T,height:d,up:c,down:d-c}}}renderSpecial(i,o){let s=this.measureText("? "+o+" ?"),a=s.width+this.config.padding*2,n=s.height+this.config.padding*2,l=i.append("g").attr("class","railroad-special");return l.append("rect").attr("x",0).attr("y",0).attr("width",a).attr("height",n),l.append("text").attr("x",a/2).attr("y",n/2).text("? "+o+" ?"),{element:l.node(),dimensions:{width:a,height:n,up:n/2,down:n/2}}}renderExpression(i,o){switch(o.type){case"terminal":return this.renderTerminal(i,o.value);case"nonterminal":return this.renderNonTerminal(i,o.name);case"sequence":return this.renderSequence(i,o.elements);case"choice":return this.renderChoice(i,o.alternatives);case"optional":return this.renderOptional(i,o.element);case"repetition":return this.renderRepetition(i,o.element,o.min);case"special":return this.renderSpecial(i,o.text);default:throw Error(`Unknown node type: ${o.type}`)}}renderRule(i,o){let s=this.svg.append("g").attr("class","railroad-rule").attr("transform",`translate(0, ${o})`),a=i.name+" =",n=this.measureText(a).width+20,l=n+20,T=s.append("g"),m=this.renderExpression(T,i.definition),d=Math.max(20,m.dimensions.up),x=d-m.dimensions.up;return T.attr("transform",`translate(${l}, ${x})`),s.append("g").attr("class","railroad-rule-name-group").append("text").attr("class","railroad-rule-name").attr("x",0).attr("y",d).text(a),s.append("g").attr("class","railroad-start").append("circle").attr("cx",n).attr("cy",d).attr("r",this.config.markerRadius),s.append("g").attr("class","railroad-end").append("circle").attr("cx",l+m.dimensions.width+10).attr("cy",d).attr("r",this.config.markerRadius),s.append("path").attr("class","railroad-line").attr("d",new k().moveTo(n+this.config.markerRadius,d).lineTo(l,d).build()),s.append("path").attr("class","railroad-line").attr("d",new k().moveTo(l+m.dimensions.width,d).lineTo(l+m.dimensions.width+10-this.config.markerRadius,d).build()),{height:Math.max(40,x+m.dimensions.height+this.config.padding*2),width:l+m.dimensions.width+10+this.config.markerRadius}}renderDiagram(i){let o=this.config.padding,s=0;for(let a of i){let n=this.renderRule(a,o);o+=n.height+this.config.verticalSeparation,s=Math.max(s,n.width)}return{width:s+this.config.padding*2,height:o+this.config.padding}}},L=e((i,o,s)=>{R(i,o.height,o.width,s),i.attr("viewBox",`0 0 ${o.width} ${o.height}`)},"configureRailroadSvgSize"),pe=e((i,o,s)=>{t.debug(`[Railroad] Rendering diagram
`+i);try{let a=M(o);a.attr("class","railroad-diagram");let l=u().railroad?.useMaxWidth??!0,T=G.getRules();if(t.debug(`[Railroad] Rendering ${T.length} rules`),T.length===0){t.warn("[Railroad] No rules to render"),L(a,{height:100,width:200},l);return}let d=new he(a,Y()).renderDiagram(T);L(a,d,l),t.debug("[Railroad] Render complete")}catch(a){throw t.error("[Railroad] Render error:",a),a}},"draw"),gt={draw:pe};
export{G,pt,gt};
