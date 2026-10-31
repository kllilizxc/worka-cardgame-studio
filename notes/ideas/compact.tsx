import {useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime/view';
import {Link} from 'react-router';
import './tile.css';

export default function Compact(){
  const note=useNote<typeof import('./actions')>(),query=note.useQuery('cover',{}),rows=query.data?.items||[],first=rows[0];
  const href=(id:string)=>noteHref(note.metadata.id,'/ideas/'+encodeURIComponent(id));
  return <section className="desk-note"><Link className="desk-title" to={noteHref(note.metadata.id)} aria-label="打开点子库"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8 14a6.4 6.4 0 1 1 8 0c-1.1 1-1 2-1 2H9s.1-1-1-2Z"/></svg>点子库 <small>{query.data?.countLabel} ›</small></Link>
    {first?<><Link className="idea-scrap" to={href(first.id)}><strong>“{first.title}”</strong>{first.category&&<em>{first.category}</em>}</Link>
      <ul>{rows.slice(1,4).map(r=><li key={r.id}><Link to={href(r.id)}>{r.title}</Link></li>)}</ul></>:<p>{query.error?'点子暂未载入':query.loading?'读取中…':'还没有点子'}</p>}</section>;
}
