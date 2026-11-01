import type {RecordRow} from './model';

type Kind = RecordRow['refs'][number]['note'];
const audio=(row:RecordRow)=>row.facets['媒介']?.includes('声音') || /\.(?:mp3|aac|wav|oga|ogg|flac|m4a)$/i.test(row.source);
function cap(row:RecordRow):RecordRow{
  return {...row,body:row.body.slice(0,260),sections:row.sections.slice(0,6).map(s=>({...s,lines:s.lines.slice(0,7)})),
    refs:row.refs.slice(0,8),fields:row.fields.slice(0,12),diagram:row.diagram?.slice(0,7)};
}
/** Select a bounded record preview. IDs still navigate to the unchanged full index. */
export function homeRecords(kind:Kind,rows:RecordRow[]){
  let records:RecordRow[]=[];
  if(kind==='cards'){
    const cards=rows.filter(r=>r.group!=='牌组');
    const hasArt=new Set(cards.filter(r=>r.mediaKey||r.thumbnail).map(r=>r.id));
    const score=(row:RecordRow)=>row.refs.filter(ref=>ref.note==='cards'&&hasArt.has(ref.id)).length;
    const deck=rows.filter(r=>r.group==='牌组').sort((a,b)=>score(b)-score(a))[0];
    const pool=deck?cards.filter(r=>deck.refs.some(ref=>ref.note==='cards'&&ref.id===r.id)):cards;
    const pictured=pool.filter(r=>r.mediaKey||r.thumbnail),plain=pool.filter(r=>!r.mediaKey&&!r.thumbnail);
    records=[...(deck?[deck]:[]),...[...pictured,...plain].slice(0,6)];
  }else if(kind==='media'){
    const portrait=rows.find(r=>r.group==='人设'||r.group==='立绘'),background=rows.find(r=>r.group==='背景'),sound=rows.find(audio);
    records=[...new Set([portrait,background,sound,...rows].filter((r):r is RecordRow=>!!r))].slice(0,3);
  }else{
    const focus=(kind==='map'?rows.find(r=>r.diagram?.length):kind==='encounter'?rows.find(r=>r.portraits?.some(p=>p.mediaKey||p.thumbnail)):rows.find(r=>r.mediaKey||r.thumbnail))||rows[0];
    if(focus){
      records=[focus];
      if(kind==='shop'){
        const offer=rows.find(r=>r.group==='货架'&&r.refs.some(x=>x.note==='shop'&&x.id===focus.id));
        if(offer)records.push(offer);
      }
    }
  }
  return {kind,count:rows.length,records:records.map(cap)};
}
