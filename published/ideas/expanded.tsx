import {useState} from 'react';
import {Link,useMatch} from 'react-router';
import {useLinks,useLocation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime/view';
import './ideas.css';

function Detail({id}:{id:string}){
  const note=useNote<typeof import('./actions')>(),query=note.useQuery('idea',{id}),links=useLinks(id),row=query.data;
  return <article className="idea-detail"><Link className="idea-return" to={noteHref(note.metadata.id)}>‹ 点子库</Link>
    {query.error?<p role="alert">{query.error.message}</p>:row?<><h1>{row.title}</h1><small>{[row.category,...row.tags].join(' · ')}</small><p className="idea-body">{row.text}</p><footer>{links.links.map(l=><button key={l.id} onClick={()=>void note.navigation.open({noteId:l.target.noteId,recordId:l.target.recordId})}>{l.label} ↗</button>)}</footer></>:<p>{query.loading?'读取中…':'点子不存在'}</p>}
  </article>;
}
function Catalog(){
  const note=useNote<typeof import('./actions')>();
  const [text,setText]=useState(''),[category,setCategory]=useState(''),[grid,setGrid]=useState(true);
  const page=note.usePagedQuery('findIdeas',{text,category});
  return <><h1>点子库</h1><header className="idea-tools"><label className="idea-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input type="search" aria-label="搜索点子" placeholder="搜索原话、标题或标签" value={text} onChange={e=>setText(e.target.value)}/></label><input className="idea-category" aria-label="筛选分类" placeholder="分类" value={category} onChange={e=>setCategory(e.target.value)}/><div role="group" aria-label="视图"><button aria-pressed={grid} onClick={()=>setGrid(true)}>网格</button><button aria-pressed={!grid} onClick={()=>setGrid(false)}>列表</button></div></header>
    <div className={'idea-records '+(grid?'grid':'list')}>
      {page.items.map(r=><Link className="idea-record" key={r.id} to={noteHref(note.metadata.id,'/ideas/'+encodeURIComponent(r.id))}><strong>{r.title}</strong><p>{r.text.slice(0,180)}</p><small>{[r.category,...r.tags].join(' · ')}</small></Link>)}
    </div>{page.error?<p role="alert">{page.error.message}</p>:!page.items.length&&<p className="idea-empty">{page.loading?'读取中…':text||category?'没有匹配的点子':'还没有点子'}</p>}
    {(page.hasNext||page.hasPrevious)&&<footer className="idea-pager"><button disabled={!page.hasPrevious} onClick={page.previous}>上一页</button> {page.pageIndex+1} <button disabled={!page.hasNext} onClick={page.next}>下一页</button></footer>}</>;
}
export default function Expanded(){
  const match=useMatch('/notes/:noteId/ideas/:id'),location=useLocation(),id=match?.params.id||location.recordId;
  return <main className="idea-room">{id?<Detail id={id}/>:<Catalog/>}</main>;
}
