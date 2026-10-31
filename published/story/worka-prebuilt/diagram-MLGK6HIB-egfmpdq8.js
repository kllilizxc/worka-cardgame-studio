import{D}from"./entry-m9ara8tg.js";import{e,t,T,u,L,p,g,y,m,b,w,v,M,I}from"./entry-1m1ab7gm.js";import{j}from"./entry-2pwp620f.js";var A=T.packet,P=class{constructor(){this.packet=[],this.setAccTitle=g,this.getAccTitle=y,this.setDiagramTitle=w,this.getDiagramTitle=v,this.getAccDescription=b,this.setAccDescription=m}static{e(this,"PacketDB")}getConfig(){let r=I({...A,...u().packet});if(r.showBits)r.paddingY+=10;return r}getPacket(){return this.packet}pushWord(r){if(r.length>0)this.packet.push(r)}clear(){p(),this.packet=[]}},W=1e4,_=e((r,a)=>{D(r,a);let i=-1,s=[],c=1,{bitsPerRow:d}=a.getConfig();for(let{start:o,end:l,bits:f,label:h}of r.blocks){if(o!==void 0&&l!==void 0&&l<o)throw Error(`Packet block ${o} - ${l} is invalid. End must be greater than start.`);if(o??=i+1,o!==i+1)throw Error(`Packet block ${o} - ${l??o} is not contiguous. It should start from ${i+1}.`);if(f===0)throw Error(`Packet block ${o} is invalid. Cannot have a zero bit field.`);l??=o+(f??1)-1,f??=l-o+1,i=l,t.debug(`Packet block ${o} - ${i} with label ${h}`);while(s.length<=d+1&&a.getPacket().length<W){let[k,n]=N({start:o,end:l,bits:f,label:h},c,d);if(s.push(k),k.end+1===c*d)a.pushWord(s),s=[],c++;if(!n)break;({start:o,end:l,bits:f,label:h}=n)}}a.pushWord(s)},"populate"),N=e((r,a,i)=>{if(r.start===void 0)throw Error("start should have been set during first phase");if(r.end===void 0)throw Error("end should have been set during first phase");if(r.start>r.end)throw Error(`Block start ${r.start} is greater than block end ${r.end}.`);if(r.end+1<=a*i)return[r,void 0];let s=a*i-1,c=a*i;return[{start:r.start,end:s,label:r.label,bits:s-r.start},{start:c,end:r.end,label:r.label,bits:r.end-c}]},"getNextFittingBlock"),z={parser:{yy:void 0},parse:e(async(r)=>{let a=await j("packet",r),i=z.parser?.yy;if(!(i instanceof P))throw Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");t.debug(a),_(a,i)},"parse")},Y=e((r,a,i,s)=>{let c=s.db,d=c.getConfig(),{rowHeight:o,paddingY:l,bitWidth:f,bitsPerRow:h}=d,k=c.getPacket(),n=c.getDiagramTitle(),B=o+l,x=B*(k.length+1)-(n?0:o),C=f*h+2,S=M(a);S.attr("viewBox",`0 0 ${C} ${x}`),L(S,x,C,d.useMaxWidth);for(let[E,F]of k.entries())O(S,F,E,d);S.append("text").text(n).attr("x",C/2).attr("y",x-B/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),O=e((r,a,i,{rowHeight:s,paddingX:c,paddingY:d,bitWidth:o,bitsPerRow:l,showBits:f})=>{let h=r.append("g"),k=i*(s+d)+d;for(let n of a){let B=n.start%l*o+1,x=(n.end-n.start+1)*o-c;if(h.append("rect").attr("x",B).attr("y",k).attr("width",x).attr("height",s).attr("class","packetBlock"),h.append("text").attr("x",B+x/2).attr("y",k+s/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(n.label),!f)continue;let C=n.end===n.start,S=k-2;if(h.append("text").attr("x",B+(C?x/2:0)).attr("y",S).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",C?"middle":"start").text(n.start),!C)h.append("text").attr("x",B+x).attr("y",S).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(n.end)}},"drawWord"),G={draw:Y},H={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},K=e(({packet:r}={})=>{let a=I(H,r);return`
	.packetByte {
		font-size: ${a.byteFontSize};
	}
	.packetByte.start {
		fill: ${a.startByteColor};
	}
	.packetByte.end {
		fill: ${a.endByteColor};
	}
	.packetLabel {
		fill: ${a.labelColor};
		font-size: ${a.labelFontSize};
	}
	.packetTitle {
		fill: ${a.titleColor};
		font-size: ${a.titleFontSize};
	}
	.packetBlock {
		stroke: ${a.blockStrokeColor};
		stroke-width: ${a.blockStrokeWidth};
		fill: ${a.blockFillColor};
	}
	`},"styles"),Z={parser:z,get db(){return new P},renderer:G,styles:K};export{Z as diagram};
