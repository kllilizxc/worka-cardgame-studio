import {useEffect,useRef} from 'react';
import {Link,Outlet,useNavigate,useSearchParams} from 'react-router';
import {noteHref} from '@dsh-workbench/runtime';
import {useLocation,useNote} from '@dsh-workbench/react';
import type {TodoStatus} from './actions';
import './folio.css';

const states={todo:'待处理',in_progress:'制作中',blocking:'待确认',done:'完成'};
export default function TodoLayout(){
  const note=useNote<typeof import('./actions')>(),[params,setParams]=useSearchParams(),navigate=useNavigate();
  const text=params.get('q')||'',category=params.get('category')||'',status=params.get('status')||'',grid=params.get('view')==='grid',archived=params.get('archived')==='1';
  const where={search:text,category,archived,...(status in states?{status:status as TodoStatus}:{})};
  const page=note.usePagedQuery('itemPage',where),loc=useLocation(),handled=useRef('');
  const matches=note.useQuery('itemLocations',{id:loc.recordId||''},{enabled:!!loc.recordId});
  const token=JSON.stringify([loc.recordId,loc.requestId]);
  const open=(id:string)=>navigate({pathname:noteHref(note.metadata.id,'/tasks/'+encodeURIComponent(id)),search:params.toString()});
  useEffect(()=>{if(loc.recordId&&matches.data?.length===1&&handled.current!==token){handled.current=token;void open(matches.data[0].id);}},[token,matches.data]);
  const filter=(key:string,value:string)=>setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set(key,value);else next.delete(key);return next;},{replace:true});
  return <main style={{padding:18,color:'var(--wb-ink)'}}>
    <header style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}><strong>制作待办</strong>
      <input type="search" aria-label="搜索制作事项" placeholder="搜索事项、要求或来源" value={text} onChange={e=>filter('q',e.target.value)}/>
      <select aria-label="制作状态" value={status} onChange={e=>filter('status',e.target.value)}><option value="">全部状态</option>{Object.entries(states).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
      <input aria-label="制作分类" placeholder="分类" value={category} onChange={e=>filter('category',e.target.value)}/>
      <button onClick={()=>filter('archived',archived?'':'1')} aria-pressed={archived}>归档</button><button onClick={()=>filter('view',grid?'':'grid')}>{grid?'列表':'网格'}</button>
    </header>
    {loc.recordId&&handled.current!==token&&matches.data?.length===0&&<p role="status">关联的事项不存在</p>}
    {loc.recordId&&handled.current!==token&&(matches.data?.length||0)>1&&<div>{matches.data?.map(r=><button key={r.id} onClick={()=>{handled.current=token;open(r.id);}}>{r.title}</button>)}</div>}
    <div style={{display:'grid',gap:8,marginTop:16,gridTemplateColumns:grid?'repeat(auto-fill,minmax(min(100%,208px),1fr))':'1fr'}}>
      {page.items.map(row=><Link key={row.id} to={{pathname:noteHref(note.metadata.id,'/tasks/'+encodeURIComponent(row.id)),search:params.toString()}} style={{border:'1px solid var(--wb-border)',borderRadius:8,padding:10,textDecoration:'none',color:'inherit'}}><strong>{row.title}</strong><small style={{marginLeft:8}}>{[states[row.status],row.category,row.sourceLabel].filter(Boolean).join(' · ')}</small>{grid&&row.description&&<p>{row.description.slice(0,96)}</p>}</Link>)}
    </div>
    {page.error?<p role="alert">{page.error.message}</p>:!page.items.length&&<p>{page.loading?'读取中…':'没有匹配的事项'}</p>}
    {(page.hasNext||page.hasPrevious)&&<div><button disabled={!page.hasPrevious} onClick={page.previous}>上一页</button> {page.pageIndex+1} <button disabled={!page.hasNext} onClick={page.next}>下一页</button></div>}
    <Outlet/>
  </main>;
}
