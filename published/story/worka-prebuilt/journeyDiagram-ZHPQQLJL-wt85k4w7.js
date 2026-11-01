import{e,R,p,g,y,m,v,w,b,r,s}from"./entry-gjg7apff.js";import{Pt,Zr,aa,Be}from"./entry-7jqgn55x.js";import{st}from"./entry-06006tte.js";import{_e}from"./entry-h80vzb3f.js";var nt=function(){var t=e(function(d,a,l,c){for(l=l||{},c=d.length;c--;l[d[c]]=a);return l},"o"),i=[6,8,10,11,12,14,16,17,18],o=[1,9],_=[1,10],n=[1,11],f=[1,12],T=[1,13],h=[1,14],S={trace:e(function(){},"trace"),yy:{},symbols_:{error:2,start:3,journey:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NEWLINE:10,title:11,acc_title:12,acc_title_value:13,acc_descr:14,acc_descr_value:15,acc_descr_multiline_value:16,section:17,taskName:18,taskData:19,$accept:0,$end:1},terminals_:{2:"error",4:"journey",6:"EOF",8:"SPACE",10:"NEWLINE",11:"title",12:"acc_title",13:"acc_title_value",14:"acc_descr",15:"acc_descr_value",16:"acc_descr_multiline_value",17:"section",18:"taskName",19:"taskData"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,2]],performAction:e(function(a,l,c,x,k,u,I){var C=u.length-1;switch(k){case 1:return u[C-1];case 2:this.$=[];break;case 3:u[C-1].push(u[C]),this.$=u[C-1];break;case 4:case 5:this.$=u[C];break;case 6:case 7:this.$=[];break;case 8:x.setDiagramTitle(u[C].substr(6)),this.$=u[C].substr(6);break;case 9:this.$=u[C].trim(),x.setAccTitle(this.$);break;case 10:case 11:this.$=u[C].trim(),x.setAccDescription(this.$);break;case 12:x.addSection(u[C].substr(8)),this.$=u[C].substr(8);break;case 13:x.addTask(u[C-1],u[C]),this.$="task";break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(i,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:o,12:_,14:n,16:f,17:T,18:h},t(i,[2,7],{1:[2,1]}),t(i,[2,3]),{9:15,11:o,12:_,14:n,16:f,17:T,18:h},t(i,[2,5]),t(i,[2,6]),t(i,[2,8]),{13:[1,16]},{15:[1,17]},t(i,[2,11]),t(i,[2,12]),{19:[1,18]},t(i,[2,4]),t(i,[2,9]),t(i,[2,10]),t(i,[2,13])],defaultActions:{},parseError:e(function(a,l){if(l.recoverable)this.trace(a);else{var c=Error(a);throw c.hash=l,c}},"parseError"),parse:e(function(a){var l=this,c=[0],x=[],k=[null],u=[],I=this.table,C="",z=0,ct=0,ht=0,vt=2,ut=1,wt=u.slice.call(arguments,1),P=Object.create(this.lexer),O={yy:{}};for(var Q in this.yy)if(Object.prototype.hasOwnProperty.call(this.yy,Q))O.yy[Q]=this.yy[Q];if(P.setInput(a,O.yy),O.yy.lexer=P,O.yy.parser=this,typeof P.yylloc>"u")P.yylloc={};var D=P.yylloc;u.push(D);var Tt=P.options&&P.options.ranges;if(typeof O.yy.parseError==="function")this.parseError=O.yy.parseError;else this.parseError=Object.getPrototypeOf(this).parseError;function St(V){c.length=c.length-2*V,k.length=k.length-V,u.length=u.length-V}e(St,"popStack");function yt(){var V=x.pop()||P.lex()||ut;if(typeof V!=="number"){if(V instanceof Array)x=V,V=x.pop();V=l.symbols_[V]||V}return V}e(yt,"lex");var A,tt,Y,F,Ht,et,q={},Z,j,dt,J;while(!0){if(Y=c[c.length-1],this.defaultActions[Y])F=this.defaultActions[Y];else{if(A===null||typeof A>"u")A=yt();F=I[Y]&&I[Y][A]}if(typeof F>"u"||!F.length||!F[0]){var rt="";J=[];for(Z in I[Y])if(this.terminals_[Z]&&Z>vt)J.push("'"+this.terminals_[Z]+"'");if(P.showPosition)rt="Parse error on line "+(z+1)+`:
`+P.showPosition()+`
Expecting `+J.join(", ")+", got '"+(this.terminals_[A]||A)+"'";else rt="Parse error on line "+(z+1)+": Unexpected "+(A==ut?"end of input":"'"+(this.terminals_[A]||A)+"'");this.parseError(rt,{text:P.match,token:this.terminals_[A]||A,line:P.yylineno,loc:D,expected:J})}if(F[0]instanceof Array&&F.length>1)throw Error("Parse Error: multiple actions possible at state: "+Y+", token: "+A);switch(F[0]){case 1:if(c.push(A),k.push(P.yytext),u.push(P.yylloc),c.push(F[1]),A=null,!tt){if(ct=P.yyleng,C=P.yytext,z=P.yylineno,D=P.yylloc,ht>0)ht--}else A=tt,tt=null;break;case 2:if(j=this.productions_[F[1]][1],q.$=k[k.length-j],q._$={first_line:u[u.length-(j||1)].first_line,last_line:u[u.length-1].last_line,first_column:u[u.length-(j||1)].first_column,last_column:u[u.length-1].last_column},Tt)q._$.range=[u[u.length-(j||1)].range[0],u[u.length-1].range[1]];if(et=this.performAction.apply(q,[C,ct,z,O.yy,F[1],k,u].concat(wt)),typeof et<"u")return et;if(j)c=c.slice(0,-1*j*2),k=k.slice(0,-1*j),u=u.slice(0,-1*j);c.push(this.productions_[F[1]][0]),k.push(q.$),u.push(q._$),dt=I[c[c.length-2]][c[c.length-1]],c.push(dt);break;case 3:return!0}}return!0},"parse")},M=function(){var d={EOF:1,parseError:e(function(l,c){if(this.yy.parser)this.yy.parser.parseError(l,c);else throw Error(l)},"parseError"),setInput:e(function(a,l){if(this.yy=l||this.yy||{},this._input=a,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges)this.yylloc.range=[0,0];return this.offset=0,this},"setInput"),input:e(function(){var a=this._input[0];this.yytext+=a,this.yyleng++,this.offset++,this.match+=a,this.matched+=a;var l=a.match(/(?:\r\n?|\n).*/g);if(l)this.yylineno++,this.yylloc.last_line++;else this.yylloc.last_column++;if(this.options.ranges)this.yylloc.range[1]++;return this._input=this._input.slice(1),a},"input"),unput:e(function(a){var l=a.length,c=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-l),this.offset-=l;var x=this.match.split(/(?:\r\n?|\n)/g);if(this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),c.length-1)this.yylineno-=c.length-1;var k=this.yylloc.range;if(this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:c?(c.length===x.length?this.yylloc.first_column:0)+x[x.length-c.length].length-c[0].length:this.yylloc.first_column-l},this.options.ranges)this.yylloc.range=[k[0],k[0]+this.yyleng-l];return this.yyleng=this.yytext.length,this},"unput"),more:e(function(){return this._more=!0,this},"more"),reject:e(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:e(function(a){this.unput(this.match.slice(a))},"less"),pastInput:e(function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(a.length>20?"...":"")+a.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:e(function(){var a=this.match;if(a.length<20)a+=this._input.substr(0,20-a.length);return(a.substr(0,20)+(a.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:e(function(){var a=this.pastInput(),l=Array(a.length+1).join("-");return a+this.upcomingInput()+`
`+l+"^"},"showPosition"),test_match:e(function(a,l){var c,x,k;if(this.options.backtrack_lexer){if(k={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges)k.yylloc.range=this.yylloc.range.slice(0)}if(x=a[0].match(/(?:\r\n?|\n).*/g),x)this.yylineno+=x.length;if(this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:x?x[x.length-1].length-x[x.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length},this.yytext+=a[0],this.match+=a[0],this.matches=a,this.yyleng=this.yytext.length,this.options.ranges)this.yylloc.range=[this.offset,this.offset+=this.yyleng];if(this._more=!1,this._backtrack=!1,this._input=this._input.slice(a[0].length),this.matched+=a[0],c=this.performAction.call(this,this.yy,this,l,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input)this.done=!1;if(c)return c;else if(this._backtrack){for(var u in k)this[u]=k[u];return!1}return!1},"test_match"),next:e(function(){if(this.done)return this.EOF;if(!this._input)this.done=!0;var a,l,c,x;if(!this._more)this.yytext="",this.match="";var k=this._currentRules();for(var u=0;u<k.length;u++)if(c=this._input.match(this.rules[k[u]]),c&&(!l||c[0].length>l[0].length)){if(l=c,x=u,this.options.backtrack_lexer)if(a=this.test_match(c,k[u]),a!==!1)return a;else if(this._backtrack){l=!1;continue}else return!1;else if(!this.options.flex)break}if(l){if(a=this.test_match(l,k[x]),a!==!1)return a;return!1}if(this._input==="")return this.EOF;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:e(function(){var l=this.next();if(l)return l;else return this.lex()},"lex"),begin:e(function(l){this.conditionStack.push(l)},"begin"),popState:e(function(){var l=this.conditionStack.length-1;if(l>0)return this.conditionStack.pop();else return this.conditionStack[0]},"popState"),_currentRules:e(function(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1])return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;else return this.conditions.INITIAL.rules},"_currentRules"),topState:e(function(l){if(l=this.conditionStack.length-1-Math.abs(l||0),l>=0)return this.conditionStack[l];else return"INITIAL"},"topState"),pushState:e(function(l){this.begin(l)},"pushState"),stateStackSize:e(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:e(function(l,c,x,k){var u=k;switch(x){case 0:break;case 1:break;case 2:return 10;case 3:break;case 4:break;case 5:return 4;case 6:return 11;case 7:return this.begin("acc_title"),12;break;case 8:return this.popState(),"acc_title_value";break;case 9:return this.begin("acc_descr"),14;break;case 10:return this.popState(),"acc_descr_value";break;case 11:this.begin("acc_descr_multiline");break;case 12:this.popState();break;case 13:return"acc_descr_multiline_value";case 14:return 17;case 15:return 18;case 16:return 19;case 17:return":";case 18:return 6;case 19:return"INVALID"}},"anonymous"),rules:[/^(?:%(?!\{)[^\n]*)/i,/^(?:[^\}]%%[^\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:#[^\n]*)/i,/^(?:journey\b)/i,/^(?:title\s[^#\n;]+)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:section\s[^#:\n;]+)/i,/^(?:[^#:\n;]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[12,13],inclusive:!1},acc_descr:{rules:[10],inclusive:!1},acc_title:{rules:[8],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,9,11,14,15,16,17,18,19],inclusive:!0}}};return d}();S.lexer=M;function E(){this.yy={}}return e(E,"Parser"),E.prototype=S,S.Parser=E,new E}();nt.parser=nt;var $t=nt,X="",lt=[],G=[],H=[],Mt=e(function(){lt.length=0,G.length=0,X="",H.length=0,p()},"clear"),Et=e(function(t){X=t,lt.push(t)},"addSection"),Ct=e(function(){return lt},"getSections"),It=e(function(){let t=ft(),i=100,o=0;while(!t&&o<i)t=ft(),o++;return G.push(...H),G},"getTasks"),At=e(function(){let t=[];return G.forEach((o)=>{if(o.people)t.push(...o.people)}),[...new Set(t)].sort()},"updateActors"),Ft=e(function(t,i){let o=i.substr(1).split(":"),_=0,n=[];if(o.length===1)_=Number(o[0]),n=[];else _=Number(o[0]),n=o[1].split(",");let f=n.map((h)=>h.trim()),T={section:X,type:X,people:f,task:t,score:_};H.push(T)},"addTask"),Vt=e(function(t){let i={section:X,type:X,description:t,task:t,classes:[]};G.push(i)},"addTaskOrg"),ft=e(function(){let t=e(function(o){return H[o].processed},"compileTask"),i=!0;for(let[o,_]of H.entries())t(o),i=i&&_.processed;return i},"compileTasks"),Rt=e(function(){return At()},"getActors"),pt={getConfig:e(()=>r().journey,"getConfig"),clear:Mt,setDiagramTitle:w,getDiagramTitle:b,setAccTitle:g,getAccTitle:y,setAccDescription:m,getAccDescription:v,addSection:Et,getSections:Ct,getTasks:It,addTask:Ft,addTaskOrg:Vt,getActors:Rt},Lt=e((t)=>`.label {
    font-family: ${t.fontFamily};
    color: ${t.textColor};
  }
  .mouth {
    stroke: #666;
  }

  line {
    stroke: ${t.textColor}
  }

  .legend {
    fill: ${t.textColor};
    font-family: ${t.fontFamily};
  }

  .label text {
    fill: #333;
  }
  .label {
    color: ${t.textColor}
  }

  .face {
    ${t.faceColor?`fill: ${t.faceColor}`:"fill: #FFF8DC"};
    stroke: #999;
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${t.mainBkg};
    stroke: ${t.nodeBorder};
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${t.arrowheadColor};
  }

  .edgePaths .path {
    stroke: ${t.lineColor};
    stroke-width: 1.5px;
  }

  .flowchart-link {
    stroke: ${t.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${t.edgeLabelBackground};
    rect {
      opacity: 0.5;
    }
    text-align: center;
  }

  .cluster rect {
  }

  .cluster text {
    fill: ${t.titleColor};
  }

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${t.fontFamily};
    font-size: 12px;
    background: ${t.tertiaryColor};
    border: 1px solid ${t.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .task-type-0, .section-type-0  {
    ${t.fillType0?`fill: ${t.fillType0}`:""};
  }
  .task-type-1, .section-type-1  {
    ${t.fillType0?`fill: ${t.fillType1}`:""};
  }
  .task-type-2, .section-type-2  {
    ${t.fillType0?`fill: ${t.fillType2}`:""};
  }
  .task-type-3, .section-type-3  {
    ${t.fillType0?`fill: ${t.fillType3}`:""};
  }
  .task-type-4, .section-type-4  {
    ${t.fillType0?`fill: ${t.fillType4}`:""};
  }
  .task-type-5, .section-type-5  {
    ${t.fillType0?`fill: ${t.fillType5}`:""};
  }
  .task-type-6, .section-type-6  {
    ${t.fillType0?`fill: ${t.fillType6}`:""};
  }
  .task-type-7, .section-type-7  {
    ${t.fillType0?`fill: ${t.fillType7}`:""};
  }

  .actor-0 {
    ${t.actor0?`fill: ${t.actor0}`:""};
  }
  .actor-1 {
    ${t.actor1?`fill: ${t.actor1}`:""};
  }
  .actor-2 {
    ${t.actor2?`fill: ${t.actor2}`:""};
  }
  .actor-3 {
    ${t.actor3?`fill: ${t.actor3}`:""};
  }
  .actor-4 {
    ${t.actor4?`fill: ${t.actor4}`:""};
  }
  .actor-5 {
    ${t.actor5?`fill: ${t.actor5}`:""};
  }
  ${_e()}
`,"getStyles"),Bt=Lt,ot=e(function(t,i){return Pt(t,i)},"drawRect"),jt=e(function(t,i){let _=t.append("circle").attr("cx",i.cx).attr("cy",i.cy).attr("class","face").attr("r",15).attr("stroke-width",2).attr("overflow","visible"),n=t.append("g");n.append("circle").attr("cx",i.cx-5).attr("cy",i.cy-5).attr("r",1.5).attr("stroke-width",2).attr("fill","#666").attr("stroke","#666"),n.append("circle").attr("cx",i.cx+5).attr("cy",i.cy-5).attr("r",1.5).attr("stroke-width",2).attr("fill","#666").attr("stroke","#666");function f(S){let M=st().startAngle(Math.PI/2).endAngle(3*(Math.PI/2)).innerRadius(7.5).outerRadius(6.8181818181818175);S.append("path").attr("class","mouth").attr("d",M).attr("transform","translate("+i.cx+","+(i.cy+2)+")")}e(f,"smile");function T(S){let M=st().startAngle(3*Math.PI/2).endAngle(5*(Math.PI/2)).innerRadius(7.5).outerRadius(6.8181818181818175);S.append("path").attr("class","mouth").attr("d",M).attr("transform","translate("+i.cx+","+(i.cy+7)+")")}e(T,"sad");function h(S){S.append("line").attr("class","mouth").attr("stroke",2).attr("x1",i.cx-5).attr("y1",i.cy+7).attr("x2",i.cx+5).attr("y2",i.cy+7).attr("class","mouth").attr("stroke-width","1px").attr("stroke","#666")}if(e(h,"ambivalent"),i.score>3)f(n);else if(i.score<3)T(n);else h(n);return _},"drawFace"),xt=e(function(t,i){let o=t.append("circle");if(o.attr("cx",i.cx),o.attr("cy",i.cy),o.attr("class","actor-"+i.pos),o.attr("fill",i.fill),o.attr("stroke",i.stroke),o.attr("r",i.r),o.class!==void 0)o.attr("class",o.class);if(i.title!==void 0)o.append("title").text(i.title);return o},"drawCircle"),kt=e(function(t,i){return aa(t,i)},"drawText"),Nt=e(function(t,i){function o(n,f,T,h,S){return n+","+f+" "+(n+T)+","+f+" "+(n+T)+","+(f+h-S)+" "+(n+T-S*1.2)+","+(f+h)+" "+n+","+(f+h)}e(o,"genPoints");let _=t.append("polygon");_.attr("points",o(i.x,i.y,50,20,7)),_.attr("class","labelBox"),i.y=i.y+i.labelMargin,i.x=i.x+0.5*i.labelMargin,kt(t,i)},"drawLabel"),zt=e(function(t,i,o){let _=t.append("g"),n=Be();n.x=i.x,n.y=i.y,n.fill=i.fill,n.width=o.width*i.taskCount+o.diagramMarginX*(i.taskCount-1),n.height=o.height,n.class="journey-section section-type-"+i.num,n.rx=3,n.ry=3,ot(_,n),bt(o)(i.text,_,n.x,n.y,n.width,n.height,{class:"journey-section section-type-"+i.num},o,i.colour)},"drawSection"),at=-1,Wt=e(function(t,i,o,_){let n=i.x+o.width/2,f=t.append("g");at++;let T=450;f.append("line").attr("id",_+"-task"+at).attr("x1",n).attr("y1",i.y).attr("x2",n).attr("y2",T).attr("class","task-line").attr("stroke-width","1px").attr("stroke-dasharray","4 2").attr("stroke","#666"),jt(f,{cx:n,cy:300+(5-i.score)*30,score:i.score});let h=Be();h.x=i.x,h.y=i.y,h.fill=i.fill,h.width=o.width,h.height=o.height,h.class="task task-type-"+i.num,h.rx=3,h.ry=3,ot(f,h);let S=i.x+14;i.people.forEach((M)=>{let E=i.actors[M].color,d={cx:S,cy:i.y,r:7,fill:E,stroke:"#000",title:M,pos:i.actors[M].position};xt(f,d),S+=10}),bt(o)(i.task,f,h.x,h.y,h.width,h.height,{class:"task"},o,i.colour)},"drawTask"),Ot=e(function(t,i){Zr(t,i)},"drawBackgroundRect"),bt=function(){function t(n,f,T,h,S,M,E,d){let a=f.append("text").attr("x",T+S/2).attr("y",h+M/2+5).style("font-color",d).style("text-anchor","middle").text(n);_(a,E)}e(t,"byText");function i(n,f,T,h,S,M,E,d,a){let{taskFontSize:l,taskFontFamily:c}=d,x=n.split(/<br\s*\/?>/gi);for(let k=0;k<x.length;k++){let u=k*l-l*(x.length-1)/2,I=f.append("text").attr("x",T+S/2).attr("y",h).attr("fill",a).style("text-anchor","middle").style("font-size",l).style("font-family",c);I.append("tspan").attr("x",T+S/2).attr("dy",u).text(x[k]),I.attr("y",h+M/2).attr("dominant-baseline","central").attr("alignment-baseline","central"),_(I,E)}}e(i,"byTspan");function o(n,f,T,h,S,M,E,d){let a=f.append("switch"),c=a.append("foreignObject").attr("x",T).attr("y",h).attr("width",S).attr("height",M).attr("position","fixed").append("xhtml:div").style("display","table").style("height","100%").style("width","100%");c.append("div").attr("class","label").style("display","table-cell").style("text-align","center").style("vertical-align","middle").text(n),i(n,a,T,h,S,M,E,d),_(c,E)}e(o,"byFo");function _(n,f){for(let T in f)if(T in f)n.attr(T,f[T])}return e(_,"_setTextAttrs"),function(n){return n.textPlacement==="fo"?o:n.textPlacement==="old"?t:i}}(),Yt=e(function(t,i){at=-1,t.append("defs").append("marker").attr("id",i+"-arrowhead").attr("refX",5).attr("refY",2).attr("markerWidth",6).attr("markerHeight",4).attr("orient","auto").append("path").attr("d","M 0,0 V 4 L6,2 Z")},"initGraphics"),U={drawRect:ot,drawCircle:xt,drawSection:zt,drawText:kt,drawLabel:Nt,drawTask:Wt,drawBackgroundRect:Ot,initGraphics:Yt},qt=e(function(t){Object.keys(t).forEach(function(o){B[o]=t[o]})},"setConf"),N={},K=0;function _t(t){let i=r().journey,o=i.maxLabelWidth;K=0;let _=60;Object.keys(N).forEach((n)=>{let f=N[n].color,T={cx:20,cy:_,r:7,fill:f,stroke:"#000",pos:N[n].position};U.drawCircle(t,T);let h=t.append("text").attr("visibility","hidden").text(n),S=h.node().getBoundingClientRect().width;h.remove();let M=[];if(S<=o)M=[n];else{let E=n.split(" "),d="";if(h=t.append("text").attr("visibility","hidden"),E.forEach((a)=>{let l=d?`${d} ${a}`:a;if(h.text(l),h.node().getBoundingClientRect().width>o){if(d)M.push(d);if(d=a,h.text(a),h.node().getBoundingClientRect().width>o){let x="";for(let k of a)if(x+=k,h.text(x+"-"),h.node().getBoundingClientRect().width>o)M.push(x.slice(0,-1)+"-"),x=k;d=x}}else d=l}),d)M.push(d);h.remove()}M.forEach((E,d)=>{let a={x:40,y:_+7+d*20,fill:"#666",text:E,textMargin:i.boxTextMargin??5},c=U.drawText(t,a).node().getBoundingClientRect().width;if(c>K&&c>i.leftMargin-c)K=c}),_+=Math.max(20,M.length*20)})}e(_t,"drawActorLegend");var B=r().journey,W=0,Xt=e(function(t,i,o,_){let n=r(),f=n.journey.titleColor,T=n.journey.titleFontSize,h=n.journey.titleFontFamily,S=n.securityLevel,M;if(S==="sandbox")M=s("#i"+i);let E=S==="sandbox"?s(M.nodes()[0].contentDocument.body):s("body");L.init();let d=E.select("#"+i);U.initGraphics(d,i);let a=_.db.getTasks(),l=_.db.getDiagramTitle(),c=_.db.getActors();for(let z in N)delete N[z];let x=0;c.forEach((z)=>{N[z]={color:B.actorColours[x%B.actorColours.length],position:x},x++}),_t(d),W=B.leftMargin+K,L.insert(0,0,W,Object.keys(N).length*50),Gt(d,a,0,i);let k=L.getBounds();if(l)d.append("text").text(l).attr("x",W).attr("font-size",T).attr("font-weight","bold").attr("y",25).attr("fill",f).attr("font-family",h);let u=k.stopy-k.starty+2*B.diagramMarginY,I=W+k.stopx+2*B.diagramMarginX;R(d,u,I,B.useMaxWidth),d.append("line").attr("x1",W).attr("y1",B.height*4).attr("x2",I-W-4).attr("y2",B.height*4).attr("stroke-width",4).attr("stroke","black").attr("marker-end","url(#"+i+"-arrowhead)");let C=l?70:0;d.attr("viewBox",`${k.startx} -25 ${I} ${u+C}`),d.attr("preserveAspectRatio","xMinYMin meet"),d.attr("height",u+C+25)},"draw"),L={data:{startx:void 0,stopx:void 0,starty:void 0,stopy:void 0},verticalPos:0,sequenceItems:[],init:e(function(){this.sequenceItems=[],this.data={startx:void 0,stopx:void 0,starty:void 0,stopy:void 0},this.verticalPos=0},"init"),updateVal:e(function(t,i,o,_){if(t[i]===void 0)t[i]=o;else t[i]=_(o,t[i])},"updateVal"),updateBounds:e(function(t,i,o,_){let n=r().journey,f=this,T=0;function h(S){return e(function(E){T++;let d=f.sequenceItems.length-T+1;if(f.updateVal(E,"starty",i-d*n.boxMargin,Math.min),f.updateVal(E,"stopy",_+d*n.boxMargin,Math.max),f.updateVal(L.data,"startx",t-d*n.boxMargin,Math.min),f.updateVal(L.data,"stopx",o+d*n.boxMargin,Math.max),S!=="activation")f.updateVal(E,"startx",t-d*n.boxMargin,Math.min),f.updateVal(E,"stopx",o+d*n.boxMargin,Math.max),f.updateVal(L.data,"starty",i-d*n.boxMargin,Math.min),f.updateVal(L.data,"stopy",_+d*n.boxMargin,Math.max)},"updateItemBounds")}e(h,"updateFn"),this.sequenceItems.forEach(h())},"updateBounds"),insert:e(function(t,i,o,_){let n=Math.min(t,o),f=Math.max(t,o),T=Math.min(i,_),h=Math.max(i,_);this.updateVal(L.data,"startx",n,Math.min),this.updateVal(L.data,"starty",T,Math.min),this.updateVal(L.data,"stopx",f,Math.max),this.updateVal(L.data,"stopy",h,Math.max),this.updateBounds(n,T,f,h)},"insert"),bumpVerticalPos:e(function(t){this.verticalPos=this.verticalPos+t,this.data.stopy=this.verticalPos},"bumpVerticalPos"),getVerticalPos:e(function(){return this.verticalPos},"getVerticalPos"),getBounds:e(function(){return this.data},"getBounds")},{sectionFills:it,sectionColours:gt}=B,Gt=e(function(t,i,o,_){let n=r().journey,f="",T=n.height*2+n.diagramMarginY,h=o+T,S=0,M="#CCC",E="black",d=0;for(let[a,l]of i.entries()){if(f!==l.section){M=it[S%it.length],d=S%it.length,E=gt[S%gt.length];let x=0,k=l.section;for(let I=a;I<i.length;I++)if(i[I].section==k)x=x+1;else break;let u={x:a*n.taskMargin+a*n.width+W,y:50,text:l.section,fill:M,num:d,colour:E,taskCount:x};U.drawSection(t,u,n),f=l.section,S++}let c=l.people.reduce((x,k)=>{if(N[k])x[k]=N[k];return x},{});l.x=a*n.taskMargin+a*n.width+W,l.y=h,l.width=n.diagramMarginX,l.height=n.diagramMarginY,l.colour=E,l.fill=M,l.num=d,l.actors=c,U.drawTask(t,l,n,_),L.insert(l.x,l.y,l.x+l.width+n.taskMargin,450)}},"drawTasks"),mt={setConf:qt,draw:Xt},ee={parser:$t,db:pt,renderer:mt,styles:Bt,init:e((t)=>{mt.setConf(t.journey),pt.clear()},"init")};export{ee as diagram};
