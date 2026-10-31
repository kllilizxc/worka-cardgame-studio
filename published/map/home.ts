import type {RecordRow} from './model';

type Kind = RecordRow['refs'][number]['note'];
const featured:Record<Kind,string[]> = {
  map:['jade-trial','phase01-jade-cave-map'],encounter:['jade-warden','mijing_boss_01'],
  monsters:['jade-fox','CR_001'],people:['fox-elder','npc.qa-fog-fox'],shop:['return-rope','tool.return-rope'],
  cards:['jade-mist-deck','deck:jade-mist-deck'],media:[],
};
const handOrder=[['jade-step-card','FD_006'],['jade-fox-card','CR_001'],['jade-sword','AR_001'],['jade-charm','AR_002'],['iron-armor','AR_003'],['spirit-seal','TL_001']];
const audio=(row:RecordRow)=>row.facets['媒介']?.includes('声音') || /\.(?:mp3|aac|wav|oga|ogg|flac|m4a)$/i.test(row.source);
function choose(rows:RecordRow[],ids:string[]){return ids.map(id=>rows.find(r=>r.id===id)).find((r):r is RecordRow=>!!r);}
function cap(row:RecordRow):RecordRow{
  return {...row,body:row.body.slice(0,260),sections:row.sections.slice(0,6).map(s=>({...s,lines:s.lines.slice(0,7)})),
    refs:row.refs.slice(0,8),fields:row.fields.slice(0,12),diagram:row.diagram?.slice(0,7)};
}
/** Select a bounded record preview. IDs still navigate to the unchanged full index. */
export function homeRecords(kind:Kind,rows:RecordRow[]){
  const first=choose(rows,featured[kind]);
  let records:RecordRow[]=[];
  if(kind==='cards'){
    const deck=first?.group==='牌组'?first:undefined;
    const cards=rows.filter(r=>r.group!=='牌组');
    const pool=deck?cards.filter(r=>deck.refs.some(ref=>ref.note==='cards'&&ref.id===r.id)):cards;
    const preferred=handOrder.map(ids=>choose(pool,ids)).filter((r):r is RecordRow=>!!r);
    records=[...(deck?[deck]:[]),...[...new Set([...preferred,...pool])].slice(0,6)];
  }else if(kind==='media'){
    const portrait=rows.find(r=>r.group==='人设'||r.group==='立绘'),background=rows.find(r=>r.group==='背景'&&r.source.includes('/qa-fog/apothecary-exterior'))||rows.find(r=>r.group==='背景'),sound=rows.find(audio);
    records=[...new Set([portrait,background,sound,...rows].filter((r):r is RecordRow=>!!r))].slice(0,3);
  }else{
    const focus=first||(kind==='map'?rows.find(r=>r.diagram?.length):undefined)||rows[0];
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
