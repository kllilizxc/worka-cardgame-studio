import {useEffect,useRef,useState} from 'react';
import {QueryState,useLinks,useLocation as useRecordLocation,useMutation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime';
import {Link,useLocation,useNavigate,useParams,useRoutes,useSearchParams} from 'react-router';
import type {RecordRow} from './model';
import {getMedia} from './media';
import {catalogKind,SymbolIcon,CategoryArt} from './visual';
import './style.css';
type Api=typeof import('./actions');
const recordPath=(id:string)=>'records/'+encodeURIComponent(id).replace(/~/g,'%7E');
function mediaType(path:string){return /\.(mp3|m4a|aac|flac|wav|ogg|opus|oga)$/i.test(path.split('?v=')[0])?'audio':'image';}
function Artwork({file,link,title,large=false}:{file?:string|null;link?:string|null;title:string;large?:boolean}){
  const note=useNote<Api>(),asset=note.useQuery('asset',{key:file||''},{enabled:!!file});
  const [content,setContent]=useState<{file:string;uri:string|null}|null>(null);
  const audio=file&&mediaType(file)==='audio';
  useEffect(()=>{
    let live=true;
    if(file&&(!audio||large))getMedia(file).then(uri=>{if(live)setContent({file,uri});}).catch(()=>{if(live)setContent({file,uri:null});});
    return ()=>{live=false;};
  },[file,audio,large]);
  if(audio&&!large)return <span className="cg-sound">♫</span>;
  const src=asset.data||(file?(content?.file===file?content.uri||link:null):link);
  if(!src)return null;
  return audio?<audio controls aria-label={title} preload="none" src={src}/>:<img loading="lazy" decoding="async" alt={large?title:''} src={src}/>;
}
function NativeLinks({id}:{id:string}){
  const query=useLinks(id),run=useMutation(),{navigation}=useNote<Api>();
  return <QueryState query={query}>{()=>query.links.length?<div className="cg-links">{query.links.map(l=><button key={l.id} onClick={()=>void run.run(()=>navigation.open(l.target))}>{l.label} ↗</button>)}{run.error&&<p role="alert">{run.error.message}</p>}</div>:null}</QueryState>;
}
function RoomGraph({rooms}:{rooms:NonNullable<RecordRow['diagram']>}){
  const {metadata}=useNote<Api>(),navigate=useNavigate(),{search}=useLocation();
  const levels=[...new Set(rooms.map(r=>r.layer))].sort((a,b)=>a-b);
  const [start,setStart]=useState(0);
  const visible=levels.slice(start,start+4);
  const grouped=visible.map(l=>rooms.filter(r=>r.layer===l));
  const width=Math.max(200,visible.length*150),height=Math.max(1,...grouped.map(g=>g.length))*64+12;
  const pos=new Map(grouped.flatMap((group,i)=>group.map((r,j)=>[r.id,{x:i*150+3,y:6+j*64,r}] as const)));
  return <div className="cg-graph"><svg aria-label="秘境房间与路线" viewBox={`0 0 ${width} ${height}`} style={{minWidth:Math.min(600,width)}}>
    {[...pos.values()].flatMap(({x,y,r})=>r.to.map(id=>{const target=pos.get(id);return target?<path key={r.id+id} d={`M ${x+120} ${y+23} C ${x+142} ${y+23} ${target.x-20} ${target.y+23} ${target.x} ${target.y+23}`} fill="none" stroke="currentColor" opacity=".4"/>:null;}))}
    {[...pos.values()].map(({x,y,r})=><g key={r.id} transform={`translate(${x} ${y})`} role="link" tabIndex={0} aria-label={r.label} onClick={()=>void navigate(noteHref(metadata.id,'/'+recordPath(r.id))+search)} onKeyDown={e=>{if(e.key==='Enter')void navigate(noteHref(metadata.id,'/'+recordPath(r.id))+search);}}>
      <title>{r.label}</title><rect width="120" height="46" rx="6"/><text x="8" y="17" fontSize="9">{r.kind} · 第 {r.layer} 层</text><text x="8" y="35" fontSize="12">{r.label.length>8?r.label.slice(0,8)+'…':r.label}</text>
    </g>)}</svg>{levels.length>4&&<div className="cg-pages"><button disabled={start===0} onClick={()=>setStart(Math.max(0,start-3))}>前几层</button><button disabled={start+4>=levels.length} onClick={()=>setStart(start+3)}>后几层</button></div>}</div>;
}
function eventText(section:string,line:string){
  if(section!=='特殊事件')return line;
  try {
    const event=JSON.parse(line);
    const title=event.title||event.name||event.id,turn=event.turn??event.round;
    return typeof title==='string'?[turn!=null?'回合 '+turn:'',title,event.effect||''].filter(Boolean).join(' · '):line;
  } catch {return line;}
}
function Detail(){
  const {id=''}=useParams(),{search}=useLocation(),{useQuery,metadata}=useNote<Api>(),r=useQuery('record',{id});
  const params=new URLSearchParams(search),section=params.get('section'),lineIndex=Number(params.get('line'));
  const highlighted=useRef<HTMLLIElement>(null);
  useEffect(()=>{highlighted.current?.scrollIntoView({block:'nearest'});},[id,section,lineIndex,r.data]);
  params.delete('section');params.delete('line');const overviewSearch=params.size?'?'+params:'';
  return <main className="cg cg-detail"><Link to={noteHref(metadata.id,'/')+overviewSearch}>‹ {metadata.name}</Link><QueryState query={r}>{record=>record?<article>
    <header><small>{record.group}</small><h2>{record.title}</h2></header>
    {record.mediaKey&&<div className="cg-hero"><Artwork file={record.mediaKey} link={record.mediaUrl||record.thumbnail} title={record.title} large/></div>}
    {record.body&&<p>{record.body}</p>}
    {record.diagram?.length?<RoomGraph rooms={record.diagram}/>:null}
    <dl>{record.fields.map(f=><div key={f.name}><dt>{f.name}</dt><dd>{f.value}</dd></div>)}</dl>
    {record.sections.map(s=><section key={s.title}><h3>{s.title}</h3><ul>{s.lines.map((line,i)=>{
      const active=s.title===section&&i===lineIndex;
      return <li key={i} ref={active?highlighted:undefined} aria-current={active?'location':undefined}>{eventText(s.title,line)}</li>;
    })}</ul></section>)}
    <NativeLinks id={id}/><details><summary>来源</summary><code>{record.source}</code>{record.mediaUrl&&<p><a href={record.mediaUrl} target="_blank" rel="noreferrer">打开原始素材 ↗</a></p>}</details>
  </article>:<p>这条记录已不在当前游戏索引中。</p>}</QueryState></main>;
}
function Collection(){
  const {useQuery,metadata,config}=useNote<Api>(),[params,setParams]=useSearchParams();
  const kind=catalogKind(config.kind,metadata.name);
  const q=params.get('q')||'',sort=params.get('sort')==='name'?'name':'default',page=Math.max(1,parseInt(params.get('p')||'1')||1),isList=params.get('view')==='list';
  const filters:Record<string,string[]>={};
  for(const [k,v] of params)if(k.startsWith('filter.'))(filters[k.slice(7)]??=[]).push(v);
  const [findFacet,setFindFacet]=useState(''),[showFilters,setShowFilters]=useState(false);
  const query=useQuery('collection',{q,filters,page,sort,facetQuery:findFacet});
  function edit(fn:(p:URLSearchParams)=>void,resetPage=true){setParams(previous=>{const next=new URLSearchParams(previous);if(resetPage)next.delete('p');fn(next);return next;},{replace:true});}
  function pick(k:string,v:string){edit(p=>{const key='filter.'+k;if(p.getAll(key).includes(v))p.delete(key,v);else p.append(key,v);});}
  function quickPick(k:string,value?:string){
    edit(p=>{const key='filter.'+k,selected=p.getAll(key);p.delete(key);if(value&&(selected.length!==1||selected[0]!==value))p.set(key,value);});
  }
  return <main className="cg"><h1>{metadata.name}</h1><div className="cg-tools">
    <label className="cg-search"><SymbolIcon name="search"/><input aria-label={'搜索'+metadata.name} type="search" value={q} placeholder={'搜索'+metadata.name} onChange={e=>edit(p=>e.target.value?p.set('q',e.target.value):p.delete('q'))}/></label>
    <div className="cg-controls"><button aria-expanded={showFilters} aria-controls="cg-filters" onClick={()=>{setShowFilters(!showFilters);if(showFilters)setFindFacet('');}}><SymbolIcon name="filters"/>筛选</button>
      <select aria-label="排序" value={sort} onChange={e=>edit(p=>p.set('sort',e.target.value))}><option value="default">默认排序</option><option value="name">按名称</option></select>
      <div className="cg-switch"><button aria-label="网格" title="网格" aria-pressed={!isList} onClick={()=>edit(p=>p.delete('view'),false)}><SymbolIcon name="grid"/></button><button aria-label="列表" title="列表" aria-pressed={isList} onClick={()=>edit(p=>p.set('view','list'),false)}><SymbolIcon name="list"/></button></div></div>
    </div>
    <QueryState query={query}>{data=>{
      const primary=data.facets[0],filtered=Object.keys(filters).length>0;
      return <>
      {primary&&primary.options.length>1&&<div className="cg-quick" aria-label={primary.key}>
        <button aria-pressed={!filters[primary.key]?.length} onClick={()=>quickPick(primary.key)}>全部</button>
        {primary.options.slice(0,6).map(o=><button key={o.value} aria-pressed={filters[primary.key]?.includes(o.value)||false} onClick={()=>quickPick(primary.key,o.value)}>{o.value}<small>{o.count}</small></button>)}
      </div>}
      {showFilters&&<section id="cg-filters" className="cg-filters"><input aria-label="查找分类" type="search" value={findFacet} onChange={e=>setFindFacet(e.target.value)} placeholder="查找分类…"/>{data.facets.map(f=>
        <div key={f.key}><strong>{f.key}</strong><span>{f.options.map(o=><button key={o.value} aria-pressed={filters[f.key]?.includes(o.value)||false} onClick={()=>pick(f.key,o.value)}>{o.value} <small>{o.count}</small></button>)}{f.hasMore&&<small>输入分类名可继续查找</small>}</span></div>
      )}</section>}
      {filtered&&<div className="cg-chips">{Object.entries(filters).flatMap(([k,vs])=>vs.map(v=><button key={k+v} onClick={()=>pick(k,v)}>{k} · {v} ×</button>))}</div>}
      <p className="cg-count">{q||filtered?data.count+' / ':''}{data.total} 项</p>
      <div className={'cg-records '+(isList?'cg-list':'cg-grid')}>{data.items.map(row=><Link key={row.id} to={{pathname:recordPath(row.id),search:params.toString()}}>
        <span className="cg-thumb">{row.mediaKey?<Artwork file={row.mediaKey} link={row.thumbnail} title={row.title}/>:<CategoryArt kind={kind}/>}</span>
        <span className="cg-copy"><b>{row.title}</b>{row.body&&<span className="cg-excerpt">{row.body}</span>}<span className="cg-meta"><small>{row.group}</small>{row.summary&&<small>{row.summary}</small>}</span></span>
      </Link>)}</div>
      {!data.count&&<p>没有匹配的记录。{(q||Object.keys(filters).length>0)&&<button onClick={()=>setParams({})}>清除搜索与筛选</button>}</p>}
      {data.pages>1&&<nav className="cg-pages"><button disabled={data.page<=1} onClick={()=>edit(p=>p.set('p',String(data.page-1)),false)}>上一页</button>
        <label>第 <input key={data.page} type="number" min={1} max={data.pages} defaultValue={data.page} aria-label="跳到页码" onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}} onBlur={e=>{const n=Math.max(1,Math.min(Number(e.target.value)||1,data.pages));edit(p=>p.set('p',String(n)),false);}}/> / {data.pages} 页</label>
        <button disabled={data.page>=data.pages} onClick={()=>edit(p=>p.set('p',String(data.page+1)),false)}>下一页</button></nav>}
    </>;}}</QueryState></main>;
}
export default function Expanded(){
  const {metadata}=useNote<Api>(),location=useRecordLocation(),navigate=useNavigate(),handled=useRef('');
  useEffect(()=>{if(!location.recordId)return;const token=JSON.stringify([location.recordId,location.requestId]);if(handled.current===token)return;handled.current=token;void navigate(noteHref(metadata.id,'/'+recordPath(location.recordId)),{replace:true});},[location.recordId,location.requestId,metadata.id,navigate]);
  return useRoutes([{index:true,element:<Collection/>},{path:'records/:id',element:<Detail/>},{path:'*',element:<p>页面不存在。<Link to={noteHref(metadata.id,'/')}>返回总览</Link></p>}]);
}
