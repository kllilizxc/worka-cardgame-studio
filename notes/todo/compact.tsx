import {Link} from 'react-router';
import {useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime/view';
import './tile.css';

const states={todo:'待开始',in_progress:'进行中',blocking:'待处理',done:'已完成'};
export default function Compact(){
  const note=useNote<typeof import('./actions')>(),page=note.usePagedQuery('itemPage',{}),totals=note.useQuery('summary',{});
  const rows=page.items.filter(t=>!t.archived).slice(0,4);
  return <section className="desk-note"><Link className="desk-title" to={noteHref(note.metadata.id)} aria-label="打开制作待办"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="m8 12 2 2 5-5M9 4V2h6v2"/></svg>制作待办 <small>{totals.data?.total} ›</small></Link>
    {rows.length?<ul>{rows.map(row=><li key={row.id}><Link data-status={row.status} to={noteHref(note.metadata.id,'/tasks/'+encodeURIComponent(row.id))}><i aria-hidden="true">{row.status==='done'?'✓':''}</i><b>{row.title}</b><em>{states[row.status]}</em></Link></li>)}</ul>:<p>{page.error?'待办暂未载入':page.loading?'读取中…':'暂无制作事项'}</p>}</section>;
}
