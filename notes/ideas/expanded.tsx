import {useState} from 'react';
import {Link,useMatch} from 'react-router';
import {useLinks,useLocation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime/view';
import './ideas.css';

function Detail({id}:{id:string}){
  const note=useNote<typeof import('./actions')>(),query=note.useQuery('idea',{id}),links=useLinks(id),row=query.data;
  return <div className="idea-detail-shell"><Link className="idea-return" to={noteHref(note.metadata.id)}>‹ {note.metadata.name||'点子库'}</Link>
    <article className="idea-detail">
      {query.error?<p role="alert">{query.error.message}</p>:row?<>
        <header className="idea-detail-head">
          {row.category&&<span className="idea-pill">{row.category}</span>}
          <h1>{row.title}</h1>
          {!!row.tags.length&&<div className="idea-tags">{row.tags.map(tag=><small key={tag}>#{tag}</small>)}</div>}
        </header>
        <p className="idea-body">{row.text}</p>
        {!!links.links.length&&<footer>{links.links.map(l=><button type="button" key={l.id} onClick={()=>void note.navigation.open({noteId:l.target.noteId,recordId:l.target.recordId})}>{l.label} ↗</button>)}</footer>}
      </>:<p className="idea-empty">{query.loading?'读取中…':'点子不存在'}</p>}
    </article>
  </div>;
}

function Catalog(){
  const note=useNote<typeof import('./actions')>();
  const [text,setText]=useState(''),[category,setCategory]=useState(''),[grid,setGrid]=useState(true);
  const page=note.usePagedQuery('findIdeas',{text,category});
  return <>
    <header className="idea-top">
      <div className="idea-heading">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8 14a6.4 6.4 0 1 1 8 0c-1.1 1-1 2-1 2H9s.1-1-1-2Z"/></svg>
        <h1>{note.metadata.name||'点子库'}</h1>
      </div>
      <div className="idea-tools">
        <label className="idea-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>
          <input type="search" aria-label="搜索点子" placeholder="搜索原话、标题或标签…" value={text} onChange={e=>setText(e.target.value)}/>
        </label>
        <input className="idea-category" aria-label="筛选分类" placeholder="按分类筛选" value={category} onChange={e=>setCategory(e.target.value)}/>
        <div className="idea-switch" role="group" aria-label="视图">
          <button type="button" aria-pressed={grid} onClick={()=>setGrid(true)}>网格</button>
          <button type="button" aria-pressed={!grid} onClick={()=>setGrid(false)}>列表</button>
        </div>
      </div>
    </header>
    <div className={'idea-records '+(grid?'grid':'list')}>
      {page.items.map(r=><Link className="idea-record" key={r.id} to={noteHref(note.metadata.id,'/ideas/'+encodeURIComponent(r.id))}>
        <strong>{r.title}</strong>
        <p>{r.text.slice(0,180)}</p>
        <span className="idea-meta">
          {r.category&&<em>{r.category}</em>}
          {r.tags.length>0&&<small>{r.tags.join(' · ')}</small>}
        </span>
      </Link>)}
    </div>
    {page.error?<p role="alert">{page.error.message}</p>:!page.items.length&&<p className="idea-empty">{page.loading?'读取中…':text||category?'没有匹配的点子':'还没有点子，随时在对话中记下一句想法。'}</p>}
    {(page.hasNext||page.hasPrevious)&&<footer className="idea-pager"><button type="button" disabled={!page.hasPrevious} onClick={page.previous}>上一页</button><span>第 {page.pageIndex+1} 页</span><button type="button" disabled={!page.hasNext} onClick={page.next}>下一页</button></footer>}
  </>;
}

export default function Expanded(){
  const match=useMatch('/notes/:noteId/ideas/:id'),location=useLocation(),id=match?.params.id||location.recordId;
  return <main className="idea-room">{id?<Detail id={id}/>:<Catalog/>}</main>;
}
