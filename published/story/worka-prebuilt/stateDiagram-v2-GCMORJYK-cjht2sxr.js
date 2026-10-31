import{e,t,be,l,p,g,y,m,b,w,v,r,s,Ji,k,te,X,Q,it,le,ce}from"./entry-1m1ab7gm.js";import{vt}from"./entry-v5bt29f3.js";import{se}from"./entry-2k0037k0.js";import{J}from"./entry-82rzphvp.js";var Vt=function(){var i=e(function(et,u,E,c){for(E=E||{},c=et.length;c--;E[et[c]]=u);return E},"o"),a=[1,2],d=[1,3],n=[1,4],S=[2,4],T=[1,9],D=[1,11],C=[1,16],h=[1,17],L=[1,18],I=[1,19],Y=[1,33],V=[1,20],j=[1,21],F=[1,22],_=[1,23],M=[1,24],P=[1,26],z=[1,27],W=[1,28],K=[1,29],R=[1,30],nt=[1,31],mt=[1,32],bt=[1,35],kt=[1,36],Tt=[1,37],Et=[1,38],ot=[1,34],A=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],_t=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],Ut=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],Ot={trace:e(function(){},"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:e(function(u,E,c,x,N,o,lt){var f=o.length-1;switch(N){case 3:return x.setRootDoc(o[f]),o[f];break;case 4:this.$=[];break;case 5:if(o[f]!="nl")o[f-1].push(o[f]),this.$=o[f-1];break;case 6:case 7:this.$=o[f];break;case 8:this.$="nl";break;case 12:this.$=o[f];break;case 13:let Ct=o[f-1];Ct.description=x.trimColon(o[f]),this.$=Ct;break;case 14:this.$={stmt:"relation",state1:o[f-2],state2:o[f]};break;case 15:let At=x.trimColon(o[f]);this.$={stmt:"relation",state1:o[f-3],state2:o[f-1],description:At};break;case 19:this.$={stmt:"state",id:o[f-3],type:"default",description:"",doc:o[f-1]};break;case 20:var q=o[f],Z=o[f-2].trim();if(o[f].match(":")){var ut=o[f].split(":");q=ut[0],Z=[Z,ut[1]]}this.$={stmt:"state",id:q,type:"default",description:Z};break;case 21:this.$={stmt:"state",id:o[f-3],type:"default",description:o[f-5],doc:o[f-1]};break;case 22:this.$={stmt:"state",id:o[f],type:"fork"};break;case 23:this.$={stmt:"state",id:o[f],type:"join"};break;case 24:this.$={stmt:"state",id:o[f],type:"choice"};break;case 25:this.$={stmt:"state",id:x.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:o[f-1].trim(),note:{position:o[f-2].trim(),text:o[f].trim()}};break;case 29:this.$=o[f].trim(),x.setAccTitle(this.$);break;case 30:case 31:this.$=o[f].trim(),x.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:o[f-3],url:o[f-2],tooltip:o[f-1]};break;case 33:this.$={stmt:"click",id:o[f-3],url:o[f-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:o[f-1].trim(),classes:o[f].trim()};break;case 36:this.$={stmt:"style",id:o[f-1].trim(),styleClass:o[f].trim()};break;case 37:this.$={stmt:"applyClass",id:o[f-1].trim(),styleClass:o[f].trim()};break;case 38:x.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:x.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:x.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:x.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:o[f].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:o[f-2].trim(),classes:[o[f].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:o[f-2].trim(),classes:[o[f].trim()],type:"default",description:""};break}},"anonymous"),table:[{3:1,4:a,5:d,6:n},{1:[3]},{3:5,4:a,5:d,6:n},{3:6,4:a,5:d,6:n},i([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],S,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:T,5:D,8:8,9:10,10:12,11:13,12:14,13:15,16:C,17:h,19:L,22:I,24:Y,25:V,26:j,27:F,28:_,29:M,32:25,33:P,35:z,37:W,38:K,41:R,45:nt,48:mt,51:bt,52:kt,53:Tt,54:Et,57:ot},i(A,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:C,17:h,19:L,22:I,24:Y,25:V,26:j,27:F,28:_,29:M,32:25,33:P,35:z,37:W,38:K,41:R,45:nt,48:mt,51:bt,52:kt,53:Tt,54:Et,57:ot},i(A,[2,7]),i(A,[2,8]),i(A,[2,9]),i(A,[2,10]),i(A,[2,11]),i(A,[2,12],{14:[1,40],15:[1,41]}),i(A,[2,16]),{18:[1,42]},i(A,[2,18],{20:[1,43]}),{23:[1,44]},i(A,[2,22]),i(A,[2,23]),i(A,[2,24]),i(A,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},i(A,[2,28]),{34:[1,49]},{36:[1,50]},i(A,[2,31]),{13:51,24:Y,57:ot},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},i(_t,[2,44],{58:[1,56]}),i(_t,[2,45],{58:[1,57]}),i(A,[2,38]),i(A,[2,39]),i(A,[2,40]),i(A,[2,41]),i(A,[2,6]),i(A,[2,13]),{13:58,24:Y,57:ot},i(A,[2,17]),i(Ut,S,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},i(A,[2,29]),i(A,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},i(A,[2,14],{14:[1,71]}),{4:T,5:D,8:8,9:10,10:12,11:13,12:14,13:15,16:C,17:h,19:L,21:[1,72],22:I,24:Y,25:V,26:j,27:F,28:_,29:M,32:25,33:P,35:z,37:W,38:K,41:R,45:nt,48:mt,51:bt,52:kt,53:Tt,54:Et,57:ot},i(A,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},i(A,[2,34]),i(A,[2,35]),i(A,[2,36]),i(A,[2,37]),i(_t,[2,46]),i(_t,[2,47]),i(A,[2,15]),i(A,[2,19]),i(Ut,S,{7:78}),i(A,[2,26]),i(A,[2,27]),{5:[1,79]},{5:[1,80]},{4:T,5:D,8:8,9:10,10:12,11:13,12:14,13:15,16:C,17:h,19:L,21:[1,81],22:I,24:Y,25:V,26:j,27:F,28:_,29:M,32:25,33:P,35:z,37:W,38:K,41:R,45:nt,48:mt,51:bt,52:kt,53:Tt,54:Et,57:ot},i(A,[2,32]),i(A,[2,33]),i(A,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:e(function(u,E){if(E.recoverable)this.trace(u);else{var c=Error(u);throw c.hash=E,c}},"parseError"),parse:e(function(u){var E=this,c=[0],x=[],N=[null],o=[],lt=this.table,f="",q=0,Z=0,ut=0,Ct=2,At=1,ke=o.slice.call(arguments,1),O=Object.create(this.lexer),rt={yy:{}};for(var Rt in this.yy)if(Object.prototype.hasOwnProperty.call(this.yy,Rt))rt.yy[Rt]=this.yy[Rt];if(O.setInput(u,rt.yy),rt.yy.lexer=O,rt.yy.parser=this,typeof O.yylloc>"u")O.yylloc={};var $t=O.yylloc;o.push($t);var Te=O.options&&O.options.ranges;if(typeof rt.yy.parseError==="function")this.parseError=rt.yy.parseError;else this.parseError=Object.getPrototypeOf(this).parseError;function Ee(H){c.length=c.length-2*H,N.length=N.length-H,o.length=o.length-H}e(Ee,"popStack");function Ht(){var H=x.pop()||O.lex()||At;if(typeof H!=="number"){if(H instanceof Array)x=H,H=x.pop();H=E.symbols_[H]||H}return H}e(Ht,"lex");var B,Ft,at,U,ts,Pt,ct={},xt,tt,zt,Lt;while(!0){if(at=c[c.length-1],this.defaultActions[at])U=this.defaultActions[at];else{if(B===null||typeof B>"u")B=Ht();U=lt[at]&&lt[at][B]}if(typeof U>"u"||!U.length||!U[0]){var Bt="";Lt=[];for(xt in lt[at])if(this.terminals_[xt]&&xt>Ct)Lt.push("'"+this.terminals_[xt]+"'");if(O.showPosition)Bt="Parse error on line "+(q+1)+`:
`+O.showPosition()+`
Expecting `+Lt.join(", ")+", got '"+(this.terminals_[B]||B)+"'";else Bt="Parse error on line "+(q+1)+": Unexpected "+(B==At?"end of input":"'"+(this.terminals_[B]||B)+"'");this.parseError(Bt,{text:O.match,token:this.terminals_[B]||B,line:O.yylineno,loc:$t,expected:Lt})}if(U[0]instanceof Array&&U.length>1)throw Error("Parse Error: multiple actions possible at state: "+at+", token: "+B);switch(U[0]){case 1:if(c.push(B),N.push(O.yytext),o.push(O.yylloc),c.push(U[1]),B=null,!Ft){if(Z=O.yyleng,f=O.yytext,q=O.yylineno,$t=O.yylloc,ut>0)ut--}else B=Ft,Ft=null;break;case 2:if(tt=this.productions_[U[1]][1],ct.$=N[N.length-tt],ct._$={first_line:o[o.length-(tt||1)].first_line,last_line:o[o.length-1].last_line,first_column:o[o.length-(tt||1)].first_column,last_column:o[o.length-1].last_column},Te)ct._$.range=[o[o.length-(tt||1)].range[0],o[o.length-1].range[1]];if(Pt=this.performAction.apply(ct,[f,Z,q,rt.yy,U[1],N,o].concat(ke)),typeof Pt<"u")return Pt;if(tt)c=c.slice(0,-1*tt*2),N=N.slice(0,-1*tt),o=o.slice(0,-1*tt);c.push(this.productions_[U[1]][0]),N.push(ct.$),o.push(ct._$),zt=lt[c[c.length-2]][c[c.length-1]],c.push(zt);break;case 3:return!0}}return!0},"parse")},me=function(){var et={EOF:1,parseError:e(function(E,c){if(this.yy.parser)this.yy.parser.parseError(E,c);else throw Error(E)},"parseError"),setInput:e(function(u,E){if(this.yy=E||this.yy||{},this._input=u,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges)this.yylloc.range=[0,0];return this.offset=0,this},"setInput"),input:e(function(){var u=this._input[0];this.yytext+=u,this.yyleng++,this.offset++,this.match+=u,this.matched+=u;var E=u.match(/(?:\r\n?|\n).*/g);if(E)this.yylineno++,this.yylloc.last_line++;else this.yylloc.last_column++;if(this.options.ranges)this.yylloc.range[1]++;return this._input=this._input.slice(1),u},"input"),unput:e(function(u){var E=u.length,c=u.split(/(?:\r\n?|\n)/g);this._input=u+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-E),this.offset-=E;var x=this.match.split(/(?:\r\n?|\n)/g);if(this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),c.length-1)this.yylineno-=c.length-1;var N=this.yylloc.range;if(this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:c?(c.length===x.length?this.yylloc.first_column:0)+x[x.length-c.length].length-c[0].length:this.yylloc.first_column-E},this.options.ranges)this.yylloc.range=[N[0],N[0]+this.yyleng-E];return this.yyleng=this.yytext.length,this},"unput"),more:e(function(){return this._more=!0,this},"more"),reject:e(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:e(function(u){this.unput(this.match.slice(u))},"less"),pastInput:e(function(){var u=this.matched.substr(0,this.matched.length-this.match.length);return(u.length>20?"...":"")+u.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:e(function(){var u=this.match;if(u.length<20)u+=this._input.substr(0,20-u.length);return(u.substr(0,20)+(u.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:e(function(){var u=this.pastInput(),E=Array(u.length+1).join("-");return u+this.upcomingInput()+`
`+E+"^"},"showPosition"),test_match:e(function(u,E){var c,x,N;if(this.options.backtrack_lexer){if(N={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges)N.yylloc.range=this.yylloc.range.slice(0)}if(x=u[0].match(/(?:\r\n?|\n).*/g),x)this.yylineno+=x.length;if(this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:x?x[x.length-1].length-x[x.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+u[0].length},this.yytext+=u[0],this.match+=u[0],this.matches=u,this.yyleng=this.yytext.length,this.options.ranges)this.yylloc.range=[this.offset,this.offset+=this.yyleng];if(this._more=!1,this._backtrack=!1,this._input=this._input.slice(u[0].length),this.matched+=u[0],c=this.performAction.call(this,this.yy,this,E,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input)this.done=!1;if(c)return c;else if(this._backtrack){for(var o in N)this[o]=N[o];return!1}return!1},"test_match"),next:e(function(){if(this.done)return this.EOF;if(!this._input)this.done=!0;var u,E,c,x;if(!this._more)this.yytext="",this.match="";var N=this._currentRules();for(var o=0;o<N.length;o++)if(c=this._input.match(this.rules[N[o]]),c&&(!E||c[0].length>E[0].length)){if(E=c,x=o,this.options.backtrack_lexer)if(u=this.test_match(c,N[o]),u!==!1)return u;else if(this._backtrack){E=!1;continue}else return!1;else if(!this.options.flex)break}if(E){if(u=this.test_match(E,N[x]),u!==!1)return u;return!1}if(this._input==="")return this.EOF;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:e(function(){var E=this.next();if(E)return E;else return this.lex()},"lex"),begin:e(function(E){this.conditionStack.push(E)},"begin"),popState:e(function(){var E=this.conditionStack.length-1;if(E>0)return this.conditionStack.pop();else return this.conditionStack[0]},"popState"),_currentRules:e(function(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1])return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;else return this.conditions.INITIAL.rules},"_currentRules"),topState:e(function(E){if(E=this.conditionStack.length-1-Math.abs(E||0),E>=0)return this.conditionStack[E];else return"INITIAL"},"topState"),pushState:e(function(E){this.begin(E)},"pushState"),stateStackSize:e(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:e(function(E,c,x,N){function o(){let f=c.yytext.indexOf("%%");if(f===0)return!1;if(f>0){let q=c.yytext.slice(0,f),Z=c.yytext.slice(f);if(Z)E.lexer.unput(Z);c.yytext=q}return!0}e(o,"processId");var lt=N;switch(x){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;break;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;break;case 17:return this.popState(),"acc_title_value";break;case 18:return this.begin("acc_descr"),35;break;case 19:return this.popState(),"acc_descr_value";break;case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;break;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";break;case 25:return this.popState(),this.pushState("CLASSDEFID"),42;break;case 26:return this.popState(),43;break;case 27:return this.pushState("CLASS"),48;break;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;break;case 29:return this.popState(),50;break;case 30:return this.pushState("STYLE"),45;break;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;break;case 32:return this.popState(),47;break;case 33:return this.pushState("SCALE"),17;break;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),c.yytext=c.yytext.slice(0,-8).trim(),25;break;case 38:return this.popState(),c.yytext=c.yytext.slice(0,-8).trim(),26;break;case 39:return this.popState(),c.yytext=c.yytext.slice(0,-10).trim(),27;break;case 40:return this.popState(),c.yytext=c.yytext.slice(0,-8).trim(),25;break;case 41:return this.popState(),c.yytext=c.yytext.slice(0,-8).trim(),26;break;case 42:return this.popState(),c.yytext=c.yytext.slice(0,-10).trim(),27;break;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";break;case 49:if(!o())return;return this.popState(),"ID";break;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:throw Error('Error: State name must be a single word. Found: "'+c.yytext.trim()+'"');case 53:return 19;case 54:this.popState();break;case 55:return this.popState(),this.pushState("struct"),20;break;case 56:return this.popState(),21;break;case 57:break;case 58:return this.begin("NOTE"),29;break;case 59:return this.popState(),this.pushState("NOTE_ID"),59;break;case 60:return this.popState(),this.pushState("NOTE_ID"),60;break;case 61:this.popState(),this.pushState("FLOATING_NOTE");break;case 62:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";break;case 63:break;case 64:return"NOTE_TEXT";case 65:if(!o())return;return this.popState(),"ID";break;case 66:if(!o())return;return this.popState(),this.pushState("NOTE_TEXT"),24;break;case 67:return this.popState(),c.yytext=c.yytext.substr(2).trim(),31;break;case 68:return this.popState(),c.yytext=c.yytext.slice(0,-8).trim(),31;break;case 69:return 6;case 70:return 6;case 71:return 16;case 72:return 57;case 73:if(!o())return;return 24;case 74:return c.yytext=c.yytext.trim(),14;break;case 75:return 15;case 76:return 28;case 77:return 58;case 78:return 5;case 79:return"INVALID"}},"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:\w+\s+\w+.*?\{)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,56,57,58,72,73,74,75,76,77],inclusive:!1},FLOATING_NOTE_ID:{rules:[65],inclusive:!1},FLOATING_NOTE:{rules:[62,63,64],inclusive:!1},NOTE_TEXT:{rules:[67,68],inclusive:!1},NOTE_ID:{rules:[66],inclusive:!1},NOTE:{rules:[59,60,61],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54,55],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,55,58,69,70,71,72,73,74,75,77,78,79],inclusive:!0}}};return et}();Ot.lexer=me;function Dt(){this.yy={}}return e(Dt,"Parser"),Dt.prototype=Ot,Ot.Parser=Dt,new Dt}();Vt.parser=Vt;var _e=Vt,ve="TB",ee="TB",Kt="dir",dt="state",ht="root",Mt="relation",De="classDef",Ce="style",Ae="applyClass",gt="default",re="divider",ie="fill:none",ae="fill: #333",ne="c",oe="markdown",he="normal",Gt="rect",Yt="rectWithTitle",xe="stateStart",Le="stateEnd",Wt="divider",Xt="roundedWithTitle",we="note",Ie="noteGroup",yt="statediagram",Ne="state",Oe=`${yt}-${Ne}`,de="transition",Re="note",$e="note-edge",Fe=`${de} ${$e}`,Pe=`${yt}-${Re}`,Be="cluster",Ge=`${yt}-${Be}`,Ye="cluster-alt",Ve=`${yt}-${Ye}`,ue="parent",fe="note",Me="state",jt="----",We=`${jt}${fe}`,Jt=`${jt}${ue}`,It=new Map,st=0,pe=0,ft=new Map,je=e((i,a,d,n)=>{if(i===Wt&&d?.id!==void 0&&ft.has(d.id)){let D=ft.get(d.id);return ft.set(a,D),D}let S=pe++,T=n?void 0:S;return ft.set(a,T),T},"colorSlotFor");function Nt(i="",a=0,d="",n=jt){let S=d!==null&&d.length>0?`${n}${d}`:"";return`${Me}-${i}${S}-${a}`}e(Nt,"stateDomId");var Ue=e((i,a,d,n,S,T,D,C)=>{t.trace("items",a),a.forEach((h)=>{switch(h.stmt){case dt:St(i,h,d,n,S,T,D,C);break;case gt:St(i,h,d,n,S,T,D,C);break;case Mt:{St(i,h.state1,d,n,S,T,D,C),St(i,h.state2,d,n,S,T,D,C);let L=D==="neo",I={id:"edge"+st,start:h.state1.id,end:h.state2.id,arrowhead:"normal",arrowTypeEnd:L?"arrow_barb_neo":"arrow_barb",style:ie,labelStyle:"",label:l.sanitizeText(h.description??"",r()),arrowheadStyle:ae,labelpos:ne,labelType:oe,thickness:he,classes:de,look:D};S.push(I),st++}break}})},"setupDoc"),qt=e((i,a=ee)=>{let d=a;if(i.doc){for(let n of i.doc)if(n.stmt==="dir")d=n.value}return d},"getDir");function pt(i,a,d){if(!a.id||a.id==="</join></fork>"||a.id==="</choice>")return;if(a.cssClasses){if(!Array.isArray(a.cssCompiledStyles))a.cssCompiledStyles=[];a.cssClasses.split(" ").forEach((S)=>{let T=d.get(S);if(T)a.cssCompiledStyles=[...a.cssCompiledStyles??[],...T.styles]})}let n=i.find((S)=>S.id===a.id);if(n)Object.assign(n,a);else i.push(a)}e(pt,"insertOrUpdateNode");function Se(i){return i?.classes?.join(" ")??""}e(Se,"getClassesFromDbInfo");function ge(i){return i?.styles??[]}e(ge,"getStylesFromDbInfo");var St=e((i,a,d,n,S,T,D,C)=>{let h=a.id,L=d.get(h),I=Se(L),Y=ge(L),V=r(),j=I.trim()!==""||Y.length>0;if(t.info("dataFetcher parsedItem",a,L,Y),h!=="root"){let F=Gt;if(a.start===!0)F=xe;else if(a.start===!1)F=Le;if(a.type!==gt)F=a.type;if(!It.get(h))It.set(h,{id:h,shape:F,description:l.sanitizeText(h,V),cssClasses:`${I} ${Oe}`,cssStyles:Y});let _=It.get(h);if(a.description){if(Array.isArray(_.description))_.shape=Yt,_.description.push(a.description);else if(_.description?.length&&_.description.length>0)if(_.shape=Yt,_.description===h)_.description=[a.description];else _.description=[_.description,a.description];else _.shape=Gt,_.description=a.description;_.description=l.sanitizeTextOrArray(_.description,V)}if(_.description?.length===1&&_.shape===Yt)if(_.type==="group")_.shape=Xt;else _.shape=Gt;if(!_.type&&a.doc)t.info("Setting cluster for XCX",h,qt(a)),_.type="group",_.isGroup=!0,_.dir=qt(a),_.shape=a.type===re?Wt:Xt,_.colorIndex=je(_.shape,h,i,j),_.cssClasses=`${_.cssClasses} ${Ge} ${T?Ve:""}`;let M={labelStyle:"",shape:_.shape,label:_.description,cssClasses:_.cssClasses,cssCompiledStyles:[],cssStyles:_.cssStyles,id:h,dir:_.dir,domId:Nt(h,st),type:_.type,isGroup:_.type==="group",colorIndex:_.colorIndex,padding:8,rx:10,ry:10,look:D,labelType:"markdown"};if(M.shape===Wt)M.label="";if(i&&i.id!=="root")t.trace("Setting node ",h," to be child of its parent ",i.id),M.parentId=i.id;if(M.centerLabel=!0,a.note){let P={labelStyle:"",shape:we,label:a.note.text,labelType:"markdown",cssClasses:Pe,cssStyles:[],cssCompiledStyles:[],id:h+We+"-"+st,domId:Nt(h,st,fe),type:"node",isGroup:!1,padding:V.flowchart?.padding,look:D,position:a.note.position},z=h+Jt,W={labelStyle:"",shape:Ie,label:a.note.text,cssClasses:_.cssClasses,cssStyles:[],id:h+Jt,domId:Nt(h,st,ue),type:"group",isGroup:!0,padding:16,look:D,position:a.note.position};st++,W.id=z,P.parentId=z,pt(n,W,C),pt(n,P,C),pt(n,M,C);let K=h,R=P.id;if(a.note.position==="left of")K=P.id,R=h;S.push({id:K+"-"+R,start:K,end:R,arrowhead:"none",arrowTypeEnd:"",style:ie,labelStyle:"",classes:Fe,pattern:"dashed",arrowheadStyle:ae,labelpos:ne,labelType:oe,thickness:he,look:D})}else pt(n,M,C)}if(a.doc)t.trace("Adding nodes children "),Ue(a,a.doc,d,n,S,!T,D,C)},"dataFetcher"),He=e(()=>{It.clear(),st=0,pe=0,ft.clear()},"reset"),ye=e((i,a=ee)=>{if(!i.doc)return a;let d=a;for(let n of i.doc)if(n.stmt==="dir")d=n.value;return d},"getDir"),ze=e(function(i,a){return a.db.getClasses()},"getClasses"),Ke=e(async function(i,a,d,n){t.info("REF0:"),t.info("Drawing state diagram (v2)",a);let{securityLevel:S,state:T,layout:D}=r();n.db.extract(n.db.getRootDocV2());let C=n.db.getData(),h=se(a,S);if(C.type=n.type,C.layoutAlgorithm=ce(D),C.nodeSpacing=T?.nodeSpacing||50,C.rankSpacing=T?.rankSpacing||50,r().look==="neo")C.markers=["barbNeo"];else C.markers=["barb"];C.diagramId=a,await le(C,h);let I=8;try{(typeof n.db.getLinks==="function"?n.db.getLinks():new Map).forEach((V,j)=>{let F=typeof j==="string"?j:typeof j?.id==="string"?j.id:"",_=C.nodes.find((R)=>R.id===F);if(!F){t.warn("⚠️ Invalid or missing stateId from key:",JSON.stringify(j));return}let M=h.node()?.querySelectorAll("g.node, g.rough-node"),P;if(M?.forEach((R)=>{let nt=R.textContent?.trim();if(R.id===_?.domId||nt===F)P=R}),!P){t.warn("⚠️ Could not find node matching text:",F);return}let z=P.parentNode;if(!z){t.warn("⚠️ Node has no parent, cannot wrap:",F);return}let W=document.createElementNS("http://www.w3.org/2000/svg","a"),K=V.url.replace(/^"+|"+$/g,"");if(W.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",K),W.setAttribute("target","_blank"),V.tooltip){let R=V.tooltip.replace(/^"+|"+$/g,"");W.setAttribute("title",R),P.setAttribute("title",R)}z.replaceChild(W,P),W.appendChild(P),t.info("\uD83D\uDD17 Wrapped node in <a> tag for:",F,V.url)})}catch(Y){t.error("❌ Error injecting clickable links:",Y)}k.insertTitle(h,"statediagramTitleText",T?.titleTopMargin??25,n.db.getDiagramTitle()),J(h,I,yt,T?.useMaxWidth??!0)},"draw"),Xe={getClasses:ze,draw:Ke,getDir:ye},G={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},Qt=e(()=>new Map,"newClassesList"),Zt=e(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),wt=e((i)=>JSON.parse(JSON.stringify(i)),"clone"),Je=class{constructor(i){this.version=i,this.nodes=[],this.edges=[],this.rootDoc=[],this.classes=Qt(),this.documents={root:Zt()},this.currentDocument=this.documents.root,this.startEndCount=0,this.dividerCnt=0,this.links=new Map,this.funs=[],this.getAccTitle=y,this.setAccTitle=g,this.getAccDescription=b,this.setAccDescription=m,this.setDiagramTitle=w,this.getDiagramTitle=v,this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this),this.bindFunctions=this.bindFunctions.bind(this)}static{e(this,"StateDB")}static{this.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3}}extract(i){this.clear(!0);for(let n of Array.isArray(i)?i:i.doc)switch(n.stmt){case dt:this.addState(n.id.trim(),n.type,n.doc,n.description,n.note);break;case Mt:this.addRelation(n.state1,n.state2,n.description);break;case De:this.addStyleClass(n.id.trim(),n.classes);break;case Ce:this.handleStyleDef(n);break;case Ae:this.setCssClass(n.id.trim(),n.styleClass);break;case"click":this.addLink(n.id,n.url,n.tooltip);break}let a=this.getStates(),d=r();He(),St(void 0,this.getRootDocV2(),a,this.nodes,this.edges,!0,d.look,this.classes);for(let n of this.nodes){if(!Array.isArray(n.label))continue;if(n.description=n.label.slice(1),n.isGroup&&n.description.length>0)throw Error(`Group nodes can only have label. Remove the additional description for node [${n.id}]`);n.label=n.label[0]}}handleStyleDef(i){let a=i.id.trim().split(","),d=i.styleClass.split(",");for(let n of a){let S=this.getState(n);if(!S){let T=n.trim();this.addState(T),S=this.getState(T)}if(S)S.styles=d.map((T)=>T.replace(/;/g,"")?.trim())}}setRootDoc(i){if(t.info("Setting root doc",i),this.rootDoc=i,this.version===1)this.extract(i);else this.extract(this.getRootDocV2())}docTranslator(i,a,d){if(a.stmt===Mt){this.docTranslator(i,a.state1,!0),this.docTranslator(i,a.state2,!1);return}if(a.stmt===dt)if(a.id===G.START_NODE)a.id=i.id+(d?"_start":"_end"),a.start=d;else a.id=a.id.trim();if(a.stmt!==ht&&a.stmt!==dt||!a.doc)return;let n=[],S=[];for(let T of a.doc)if(T.type===re){let D=wt(T);D.doc=wt(S),n.push(D),S=[]}else S.push(T);if(n.length>0&&S.length>0){let T={stmt:dt,id:Ji(),type:"divider",doc:wt(S)};n.push(wt(T)),a.doc=n}a.doc.forEach((T)=>this.docTranslator(a,T,!0))}getRootDocV2(){return this.docTranslator({id:ht,stmt:ht},{id:ht,stmt:ht,doc:this.rootDoc},!0),{id:ht,doc:this.rootDoc}}addState(i,a=gt,d=void 0,n=void 0,S=void 0,T=void 0,D=void 0,C=void 0){let h=i?.trim();if(!this.currentDocument.states.has(h))t.info("Adding state ",h,n),this.currentDocument.states.set(h,{stmt:dt,id:h,descriptions:[],type:a,doc:d,note:S,classes:[],styles:[],textStyles:[]});else{let L=this.currentDocument.states.get(h);if(!L)throw Error(`State not found: ${h}`);if(!L.doc)L.doc=d;if(!L.type)L.type=a}if(n)t.info("Setting state description",h,n),(Array.isArray(n)?n:[n]).forEach((I)=>this.addDescription(h,I.trim()));if(S){let L=this.currentDocument.states.get(h);if(!L)throw Error(`State not found: ${h}`);L.note=S,L.note.text=l.sanitizeText(L.note.text,r())}if(T)t.info("Setting state classes",h,T),(Array.isArray(T)?T:[T]).forEach((I)=>this.setCssClass(h,I.trim()));if(D)t.info("Setting state styles",h,D),(Array.isArray(D)?D:[D]).forEach((I)=>this.setStyle(h,I.trim()));if(C)t.info("Setting state styles",h,D),(Array.isArray(C)?C:[C]).forEach((I)=>this.setTextStyle(h,I.trim()))}clear(i){if(this.nodes=[],this.edges=[],this.funs=[this.setupToolTips.bind(this)],this.documents={root:Zt()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=Qt(),!i)this.links=new Map,p()}getState(i){return this.currentDocument.states.get(i)}getStates(){return this.currentDocument.states}logDocuments(){t.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(i,a,d){this.links.set(i,{url:a,tooltip:d}),t.warn("Adding link",i,a,d)}getLinks(){return this.links}startIdIfNeeded(i=""){if(i===G.START_NODE)return this.startEndCount++,`${G.START_TYPE}${this.startEndCount}`;return i}startTypeIfNeeded(i="",a=gt){return i===G.START_NODE?G.START_TYPE:a}endIdIfNeeded(i=""){if(i===G.END_NODE)return this.startEndCount++,`${G.END_TYPE}${this.startEndCount}`;return i}endTypeIfNeeded(i="",a=gt){return i===G.END_NODE?G.END_TYPE:a}addRelationObjs(i,a,d=""){let n=this.startIdIfNeeded(i.id.trim()),S=this.startTypeIfNeeded(i.id.trim(),i.type),T=this.startIdIfNeeded(a.id.trim()),D=this.startTypeIfNeeded(a.id.trim(),a.type);this.addState(n,S,i.doc,i.description,i.note,i.classes,i.styles,i.textStyles),this.addState(T,D,a.doc,a.description,a.note,a.classes,a.styles,a.textStyles),this.currentDocument.relations.push({id1:n,id2:T,relationTitle:l.sanitizeText(d,r())})}addRelation(i,a,d){if(typeof i==="object"&&typeof a==="object")this.addRelationObjs(i,a,d);else if(typeof i==="string"&&typeof a==="string"){let n=this.startIdIfNeeded(i.trim()),S=this.startTypeIfNeeded(i),T=this.endIdIfNeeded(a.trim()),D=this.endTypeIfNeeded(a);this.addState(n,S),this.addState(T,D),this.currentDocument.relations.push({id1:n,id2:T,relationTitle:d?l.sanitizeText(d,r()):void 0})}}addDescription(i,a){let d=this.currentDocument.states.get(i),n=a.startsWith(":")?a.replace(":","").trim():a;d?.descriptions?.push(l.sanitizeText(n,r()))}cleanupLabel(i){return i.startsWith(":")?i.slice(2).trim():i.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(i,a=""){if(!this.classes.has(i))this.classes.set(i,{id:i,styles:[],textStyles:[]});let d=this.classes.get(i);if(a&&d)a.split(G.STYLECLASS_SEP).forEach((n)=>{let S=n.replace(/([^;]*);/,"$1").trim();if(RegExp(G.COLOR_KEYWORD).exec(n)){let D=S.replace(G.FILL_KEYWORD,G.BG_FILL).replace(G.COLOR_KEYWORD,G.FILL_KEYWORD);d.textStyles.push(D)}d.styles.push(S)})}getClasses(){return this.classes}setupToolTips(i){let a=vt();s(i).select("svg").selectAll("g.node, g.rough-node").on("mouseover",(S)=>{let T=s(S.currentTarget),D=T.attr("title");if(D===null)return;let C=S.currentTarget?.getBoundingClientRect();a.transition().duration(200).style("opacity",".9"),a.style("left",window.scrollX+C.left+(C.right-C.left)/2+"px").style("top",window.scrollY+C.bottom+"px"),a.html(be.sanitize(D)),T.classed("hover",!0)}).on("mouseout",(S)=>{a.transition().duration(500).style("opacity",0),s(S.currentTarget).classed("hover",!1)})}setCssClass(i,a){i.split(",").forEach((d)=>{let n=this.getState(d);if(!n){let S=d.trim();this.addState(S),n=this.getState(S)}n?.classes?.push(a)})}setStyle(i,a){this.getState(i)?.styles?.push(a)}setTextStyle(i,a){this.getState(i)?.textStyles?.push(a)}bindFunctions(i){this.funs.forEach((a)=>{a(i)})}getDirectionStatement(){return this.rootDoc.find((i)=>i.stmt===Kt)}getDirection(){return this.getDirectionStatement()?.value??ve}setDirection(i){let a=this.getDirectionStatement();if(a)a.value=i;else this.rootDoc.unshift({stmt:Kt,value:i})}trimColon(i){return i.startsWith(":")?i.slice(1).trim():i.trim()}getData(){let i=r();for(let a of this.nodes)if(a.wrappingWidth??=i.state?.wrappingWidth,!a.isGroup)a.minWidth??=i.state?.minNodeWidth;return{nodes:this.nodes,edges:this.edges,other:{},config:i,direction:ye(this.getRootDocV2())}}getConfig(){return r().state}},qe=e((i)=>{let{theme:a,bkgColorArray:d,borderColorArray:n}=i;if(!X(a,n))return"";let S=Q(i.look),T=te(d),D="";for(let C=0;C<it(n);C++){let h=n[C],L=T?`fill: ${d[C%d.length]};`:"",I=`[data-look="${S}"][data-color-id="color-${C}"]`;D+=`

    /* The title strip: \`rect.outer\` spans the whole composite and \`rect.inner\` covers
       the body, so what stays visible of \`outer\` is the band behind the label. */
    ${I}.statediagram-cluster rect.outer {
      stroke: ${h};
      ${L}
    }

    ${I}.statediagram-cluster rect.inner {
      stroke: ${h};
    }

    /* Concurrency regions. Siblings of one composite share a slot, so a divided composite
       reads as one thing split into parts rather than as several composites. */
    ${I}.statediagram-cluster rect.divider {
      stroke: ${h};
      ${L}
    }

    /* handDrawn draws the same container as roughjs shapes rather than plain rects, so it
       needs its own rules. \`roundedWithTitle\` and \`divider\` name those groups \`outer\`,
       \`inner\` and \`divider\` to match the classic branch, which is what lets these
       discriminate -- a bare \`.statediagram-cluster path\` rule reached the body as well and
       tinted the whole composite, losing \`compositeBackground\` and diverging from what
       classic and neo do.

       roughjs emits two paths per shape and marks them: the filled shape carries
       \`stroke="none"\` and the sketched outline carries \`fill="none"\`. Splitting on that is
       what keeps \`fill\` off the outline -- a rough outline is open squiggles, not a closed
       region, so filling it produces smears -- and keeps \`stroke\` off the fill shape, which
       would otherwise gain an edge it was drawn without. */
    ${I}.statediagram-cluster .outer path[stroke='none'] {
      ${L}
    }

    ${I}.statediagram-cluster .outer path[fill='none'] {
      stroke: ${h};
    }

    /* No \`.inner\` rule on purpose. The body shape is left entirely alone under handDrawn,
       where a rect's \`inner\` counterpart cannot be recoloured safely: roughjs draws a
       hachure fill as *stroked* lines, so its fill paths carry \`fill="none"\` exactly like
       the outline and no selector separates them. An \`.inner\` stroke rule therefore
       repainted the hatching of every alt composite in the palette colour instead of
       leaving it on \`altBackground\`. The container still reads as palette-coloured: the
       \`outer\` shape spans the whole composite, so its outline already frames the body. */

    /* Regions split the same way, which is why \`divider\` fills solid rather than taking
       roughjs's default hachure -- see the note on that call. Hatched, both of its paths
       carried \`fill="none"\` and these two rules degenerated: the tint matched nothing and
       the border rule repainted the hatching. */
    ${I}.statediagram-cluster .divider path[stroke='none'] {
      ${L}
    }

    ${I}.statediagram-cluster .divider path[fill='none'] {
      stroke: ${h};
    }
    `}return D},"genColor"),Qe=e((i)=>`
${qe(i)}
defs [id$="-barbEnd"] {
    fill: ${i.transitionColor};
    stroke: ${i.transitionColor};
  }
g.stateGroup text {
  fill: ${i.nodeBorder};
  stroke: none;
  font-size: 10px;
}
g.stateGroup text {
  fill: ${i.textColor};
  stroke: none;
  font-size: 10px;

}
g.stateGroup .state-title {
  font-weight: bolder;
  fill: ${i.stateLabelColor};
}

g.stateGroup rect {
  fill: ${i.mainBkg};
  stroke: ${i.nodeBorder};
}

g.stateGroup line {
  stroke: ${i.lineColor};
  stroke-width: ${i.strokeWidth||1};
}

.transition {
  stroke: ${i.transitionColor};
  stroke-width: ${i.strokeWidth||1};
  fill: none;
}

.stateGroup .composit {
  fill: ${i.background};
  border-bottom: 1px
}

.stateGroup .alt-composit {
  fill: #e0e0e0;
  border-bottom: 1px
}

.state-note {
  stroke: ${i.noteBorderColor};
  fill: ${i.noteBkgColor};

  text {
    fill: ${i.noteTextColor};
    stroke: none;
    font-size: 10px;
  }
}

.stateLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${i.mainBkg};
  opacity: 0.5;
}

.edgeLabel .label rect {
  fill: ${i.labelBackgroundColor};
  opacity: 0.5;
}
.edgeLabel {
  background-color: ${i.edgeLabelBackground};
  p {
    background-color: ${i.edgeLabelBackground};
  }
  rect {
    opacity: 0.5;
    background-color: ${i.edgeLabelBackground};
    fill: ${i.edgeLabelBackground};
  }
  text-align: center;
}
.edgeLabel .label text {
  fill: ${i.transitionLabelColor||i.tertiaryTextColor};
}
.label div .edgeLabel {
  color: ${i.transitionLabelColor||i.tertiaryTextColor};
}

.stateLabel text {
  fill: ${i.stateLabelColor};
  font-size: 10px;
  font-weight: bold;
}

.node circle.state-start {
  fill: ${i.specialStateColor};
  stroke: ${i.specialStateColor};
}

.node .fork-join {
  fill: ${i.specialStateColor};
  stroke: ${i.specialStateColor};
}

.node circle.state-end {
  fill: ${i.innerEndBackground};
  stroke: ${i.background};
  stroke-width: 1.5
}
.end-state-inner {
  fill: ${i.compositeBackground||i.background};
  // stroke: ${i.background};
  stroke-width: 1.5
}

.node rect {
  fill: ${i.stateBkg||i.mainBkg};
  stroke: ${i.stateBorder||i.nodeBorder};
  stroke-width: ${i.strokeWidth||1}px;
}
.node polygon {
  fill: ${i.mainBkg};
  stroke: ${i.stateBorder||i.nodeBorder};;
  stroke-width: ${i.strokeWidth||1}px;
}
[id$="-barbEnd"] {
  fill: ${i.lineColor};
}

.statediagram-cluster rect {
  fill: ${i.compositeTitleBackground};
  stroke: ${i.stateBorder||i.nodeBorder};
  stroke-width: ${i.strokeWidth||1}px;
}

.cluster-label, .nodeLabel {
  color: ${i.stateLabelColor};
  // line-height: 1;
}

.statediagram-cluster rect.outer {
  rx: 5px;
  ry: 5px;
}
.statediagram-state .divider {
  stroke: ${i.stateBorder||i.nodeBorder};
}

.statediagram-state .title-state {
  rx: 5px;
  ry: 5px;
}
.statediagram-cluster.statediagram-cluster .inner {
  fill: ${i.compositeBackground||i.background};
}
.statediagram-cluster.statediagram-cluster-alt .inner {
  fill: ${i.altBackground?i.altBackground:"#efefef"};
}

.statediagram-cluster .inner {
  rx:0;
  ry:0;
}

.statediagram-state rect.basic {
  rx: 5px;
  ry: 5px;
}
.statediagram-state rect.divider {
  stroke-dasharray: 10,10;
  fill: ${i.altBackground?i.altBackground:"#efefef"};
}

.note-edge {
  stroke-dasharray: 5;
}

.statediagram-note rect {
  fill: ${i.noteBkgColor};
  stroke: ${i.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}
.statediagram-note rect {
  fill: ${i.noteBkgColor};
  stroke: ${i.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}

.statediagram-note text {
  fill: ${i.noteTextColor};
}

.statediagram-note .nodeLabel {
  color: ${i.noteTextColor};
}
.statediagram .edgeLabel {
  color: red; // ${i.noteTextColor};
}

[id$="-dependencyStart"], [id$="-dependencyEnd"] {
  fill: ${i.lineColor};
  stroke: ${i.lineColor};
  stroke-width: ${i.strokeWidth||1};
}

.statediagramTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${i.textColor};
}

[data-look="neo"].statediagram-cluster rect {
  fill: ${i.mainBkg};
  stroke: ${i.useGradient?"url("+i.svgId+"-gradient)":i.stateBorder||i.nodeBorder};
  stroke-width: ${i.strokeWidth??1};
}
[data-look="neo"].statediagram-cluster rect.outer {
  rx: ${i.radius}px;
  ry: ${i.radius}px;
  filter: ${i.dropShadow?i.dropShadow.replace("url(#drop-shadow)",`url(${i.svgId}-drop-shadow)`):"none"}
}
`,"getStyles"),Ze=Qe,ks={parser:_e,get db(){return new Je(2)},renderer:Xe,styles:Ze,init:e((i)=>{if(!i.state)i.state={};i.state.arrowMarkerAbsolute=i.arrowMarkerAbsolute},"init")};export{ks as diagram};
