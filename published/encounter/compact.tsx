import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {useLinks,useMutation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime/view';
import {SymbolIcon,type Kind,catalogKind} from './visual';
import type {RecordRow} from './model';
import art from './campaign-art.json';
import {getMedia} from './media';
import './compact.css';

type Art=keyof typeof art;
type Open=(id?:string,section?:string,line?:number)=>void;
const field=(r:RecordRow|undefined,key:string)=>r?.fields.find(f=>f.name===key)?.value;
const lines=(r:RecordRow,key:string)=>r.sections.find(s=>s.title===key)?.lines||[];
const rotation=[-16.5,-10.5,-3.1,5.7,12.2,17];
const spacing=[-2.24,-1.46,-.48,.5,1.45,2.25];
const depth=[2,.85,0,.75,1.5,2.1];
const covers:Record<string,Art>={'jade-step-card':'grass','FD_006':'grass','jade-fox-card':'fox','CR_001':'fox','jade-sword':'sword','AR_001':'sword','jade-charm':'jade','AR_002':'jade','iron-armor':'armor','AR_003':'armor','spirit-seal':'talisman','TL_001':'talisman','jade-fox':'fox','fox-elder':'elder','npc.qa-fog-fox':'elder','return-rope':'rope','tool.return-rope':'rope'};
const kindArt:Record<string,Art>={'单位牌':'minion','法器':'sword','符箓':'talisman','技能':'grass','场地':'atlas','丹药':'jade'};
function Header({name,kind,count,right,open}:{name:string;kind:Kind;count?:number;right?:ReactNode;open:Open}){
  return <header className="atlas-header"><button aria-label={name} onClick={()=>open()}><SymbolIcon name={kind}/>{name}</button>{right||<button className="atlas-more" aria-label={'打开'+name} onClick={()=>open()}>{count} ›</button>}</header>;
}
function ArtImage({row,fallback}:{row:RecordRow;fallback?:Art}){
  const [image,setImage]=useState<{key:string;src:string|null}>();
  useEffect(()=>{
    const key=row.mediaKey;if(!key||fallback)return;
    let live=true;getMedia(key).then(src=>{if(live)setImage({key,src});}).catch(()=>{});
    return ()=>{live=false;};
  },[row.mediaKey,fallback]);
  const src=fallback?art[fallback]:row.thumbnail||(image?.key===row.mediaKey?image?.src:undefined)||row.mediaUrl;
  return src?<img alt="" draggable={false} src={src}/>:<span className="atlas-empty-art">◇</span>;
}
function Hand({records,open}:{records:RecordRow[];open:Open}){
  const cards=records.filter(r=>r.group!=='牌组');
  return <div className="cr-fan">{cards.map((r,i)=>{
    const offset=cards.length===6?spacing[i]:i-(cards.length-1)/2;
    const distance=cards.length===6?depth[i]:Math.abs(offset);
    const angle=cards.length===6?rotation[i]:offset*8;
    const style={'--fan-pos':offset,'--fan-dist':distance,'--fan-angle':angle+'deg','--fan-z':Math.round(100-distance*15),'--fan-scale':1-distance*.078} as CSSProperties;
    return <button className="cr-card" key={r.id} onClick={()=>open(r.id)} style={style} title={r.title} aria-label={r.title}>
      <span className="cr-card-in"><span className="cr-card-art"><ArtImage row={r} fallback={covers[r.id]||(!r.mediaKey&&!r.thumbnail?kindArt[r.group]:undefined)}/></span><span className="cr-card-caption"><strong>{r.title}</strong><small>{lines(r,'牌效')[0]||r.body||r.group}</small></span></span><span className="cr-card-cost" aria-hidden="true">{field(r,'费用')||'✧'}</span></button>;
  })}</div>;
}
function Atlas({row,open}:{row:RecordRow;open:Open}){
  const rooms=row.diagram||[],levels=[...new Set(rooms.map(n=>n.layer))].sort((a,b)=>a-b);
  const points=new Map(rooms.map(n=>{
    const rank=levels.indexOf(n.layer),layer=rooms.filter(r=>r.layer===n.layer),index=layer.indexOf(n);
    const y=layer.length===1?(rank===0?72:48):19+64*index/(layer.length-1);
    return [n.id,{x:9+82*rank/Math.max(1,levels.length-1),y}];
  }));
  const tone=(kind:string)=>kind==='撤离'?'exit':['首领','战斗'].includes(kind)?'fight':'loot';
  return <><img className="atlas-landscape" alt="" src={art.atlas}/><div className="atlas-map-title"><button onClick={()=>open(row.id)}>{row.title}</button><small>{row.body}</small></div>
    <aside className="atlas-legend"><span>● 探索</span><span>◆ 遭遇</span><span>⌖ 撤离</span></aside>
    <div className="atlas-routes"><svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">{rooms.flatMap(n=>n.to.map(id=>{
      const a=points.get(n.id),b=points.get(id),target=rooms.find(r=>r.id===id);if(!a||!b||!target)return null;
      const mid=(a.x+b.x)*5,d=`M ${a.x*10},${a.y*3} C ${mid},${a.y*3} ${mid},${b.y*3} ${b.x*10},${b.y*3}`;
      return <g key={n.id+'-'+id} className={tone(target.kind)}><path d={d}/><path d={d}/></g>;
    }))}</svg>{rooms.map((n,i)=><button className={'atlas-pin '+tone(n.kind)} key={n.id} style={{left:points.get(n.id)!.x+'%',top:points.get(n.id)!.y+'%'}} onClick={()=>open(n.id)}><i>{i+1}</i><b>{n.label}</b><small>{n.kind}</small></button>)}</div><small className="atlas-compass" aria-hidden="true">北<br/>✧</small></>;
}
function eventLabel(line:string){
  try{const e=JSON.parse(line);return {label:String(e.title||e.name||e.type||e.id||''),turn:e.turn??e.round,kind:e.kind||e.type};}catch{return {label:line,turn:undefined,kind:''};}
}
function Encounter({row,open}:{row:RecordRow;open:Open}){
  const {navigation}=useNote(),navigate=useMutation(),links=useLinks(row.id),refs=row.refs.filter(r=>r.note==='monsters');
  const units=lines(row,'敌方阵位'),events=lines(row,'特殊事件').slice(0,5).map(eventLabel);
  const reinforcement=events.find(e=>e.label.includes('增援')||e.kind==='增援');
  return <><div className="atlas-battle-title"><button onClick={()=>open(row.id)}>{row.title}</button><small>{field(row,'难度')?'难度 '+field(row,'难度'):row.group}</small>{reinforcement&&<small className="red">{reinforcement.turn?'回合 '+reinforcement.turn+' · ':''}增援</small>}</div>
    <div className="atlas-lineup">{units.slice(0,3).map((line,i)=>{
      const parts=line.split(' · '),name=parts[1]||line,id=refs[i]?.id,link=links.links.find(l=>l.target.recordId===id);
      const face=/狐/.test(name)?'fox':/守关|金丹/.test(name)?'guardian':'minion';
      return <button key={i} title={line} onClick={()=>link?void navigate.run(()=>navigation.open(link.target)):open(row.id)}><span><img alt="" src={art[face]}/><small>{parts[0]}</small></span><b>{name}</b></button>;
    })}<button className="atlas-reserve" onClick={()=>open(row.id,'敌方阵位',0)}><span>◇</span><b>阵位图</b></button></div>
    {events.length?<div className="atlas-timeline">{events.map((e,i)=><button key={i} className={e===reinforcement?'red':''} onClick={()=>open(row.id,'特殊事件',i)} title={e.label}><i/><b>{e.turn?'回合 '+e.turn:'事件 '+(i+1)}</b><small>{e.label}</small></button>)}</div>:<p className="atlas-summary">{row.body||'暂无特殊事件'}</p>}</>;
}
function Specimen({records,kind,open}:{records:RecordRow[];kind:Kind;open:Open}){
  const [row,offer]=records,detail=kind==='monsters'?[['攻',field(row,'攻击')],['血',field(row,'气血')]]:kind==='shop'?[['',field(offer,'灵石售价')||field(row,'灵石售价')]]:[];
  const badge=row.facets['身份']?.[0]||row.facets['种族']?.[0]||field(row,'用途')||row.group;
  return <button className="atlas-specimen" onClick={()=>open(row.id)}><span className="atlas-thumbnail"><ArtImage row={row} fallback={covers[row.id]}/></span><span className="atlas-sheet"><strong>{row.title}</strong><em>{badge}</em>{detail.some(([,v])=>v)&&<b>{detail.filter(([,v])=>v).map(([k,v])=>k? k+' '+v:v+' 灵石').join('　')}</b>}<span>{row.body}</span>{kind==='people'&&field(row,'目标')&&<small>{field(row,'目标')}</small>}</span></button>;
}
function AudioSample({row,open}:{row:RecordRow;open:Open}){
  const player=useRef<HTMLAudioElement>(null),mounted=useRef(true),[playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
  async function toggle(){
    const el=player.current;if(!el)return;
    if(!el.paused){el.pause();return;}
    try{
      const url=(row.mediaKey&&await getMedia(row.mediaKey))||row.mediaUrl;
      if(!url||!mounted.current)return;
      if(el.getAttribute('src')!==url)el.src=url;
      await el.play();if(mounted.current)setFailed(false);
    }catch{if(mounted.current)setFailed(true);}
  }
  return <div className="audio-sample"><button className="atlas-sound" aria-label={(playing?'暂停':'播放')+row.title} aria-pressed={playing} onClick={()=>void toggle()}>{playing?'Ⅱ':'▶'}　▂▅▃▆▂▅▃</button>
    <button onClick={()=>open(row.id)} title={row.title}>{failed?'打开音频':row.title}</button><audio ref={player} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setFailed(true)} preload="none"/></div>;
}
function Media({records,open}:{records:RecordRow[];open:Open}){
  return <div className="atlas-media-strip">{records.map(row=>{
    const audio=/\.(mp3|ogg|wav|flac|m4a|opus|oga|aac)$/i.test(row.source)||row.facets['媒介']?.includes('声音');
    return audio?<AudioSample key={row.id} row={row} open={open}/>:<button key={row.id} onClick={()=>open(row.id)} title={row.title}><span className="atlas-thumbnail"><ArtImage row={row}/></span><small>{row.group}</small></button>;
  })}</div>;
}
export default function Compact(){
  const note=useNote<typeof import('./actions')>(),query=note.useQuery('home',{}),target=useMutation();
  const kind=query.data?.kind||catalogKind(note.config.kind,note.metadata.name),rows=query.data?.records||[],row=rows[0];
  const open:Open=(id,section,line)=>{
    const path=id?'/records/'+encodeURIComponent(id).replace(/~/g,'%7E'):'/';
    const search=section?'?'+new URLSearchParams({section,line:String(line??0)}):'';
    void target.run(()=>note.navigation.open({href:noteHref(note.metadata.id,path)+search}));
  };
  const deck=kind==='cards'&&row?.group==='牌组'?row:undefined;
  return <section className={'atlas-panel atlas-'+kind}><Header kind={kind} name={note.metadata.name} count={query.data?.count} open={open}
    right={deck?<button className="atlas-more" onClick={()=>open(deck.id)}>{deck.title} · {field(deck,'总张数')} 张 ›</button>:undefined}/>
    {!row?<p className="atlas-summary">{query.error?'内容暂未载入':query.loading?'读取中…':'暂无内容'}</p>:kind==='cards'?<Hand records={rows} open={open}/>:kind==='map'?<Atlas row={row} open={open}/>:kind==='encounter'?<Encounter row={row} open={open}/>:kind==='media'?<Media records={rows} open={open}/>:<Specimen records={rows} kind={kind} open={open}/>}
    {target.error&&<small role="alert">{target.error.message}</small>}
  </section>;
}
