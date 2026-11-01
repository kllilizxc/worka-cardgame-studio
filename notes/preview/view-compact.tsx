import {Link} from 'react-router';
import {noteHref} from '@dsh-workbench/runtime/view';
import {useMutation,useNote} from '@dsh-workbench/react';
import './preview-compact.css';

export default function Compact(){
  const note=useNote<typeof import('./actions')>();
  const shared=note.metadata.access?.kind==='shared';
  const page=note.usePagedQuery('candidates',{}),latest=page.items[0];
  const installation=note.useQuery('gameInstallation',{}, {enabled:!shared});
  const cover=note.useQuery('gameCover',{}, {enabled:!shared});
  const setup=useMutation();
  const commit=latest?.repos?.game?.commit||latest?.revision||installation.data?.gameCommit;
  const loading=page.loading||(!shared&&installation.loading);
  const unbound=!shared&&!latest&&!commit&&!loading;
  const subtitle=page.error?'版本暂未载入':commit?'版本 · '+commit.slice(0,7):loading?'读取中…':shared?'暂无可试玩版本':'尚未绑定游戏';
  const action=latest?'继续试玩':commit?'开始试玩':unbound?'连接游戏':'查看试玩';
  const scene=<>{cover.data&&<img src={cover.data} alt=""/>}<span className="preview-caption"><strong>{latest?.title||'游戏工作树'}</strong><small>{subtitle}</small><b>{action}　→</b></span></>;
  return <section className="desk-note">
    <Link className="desk-title" to={noteHref(note.metadata.id)} aria-label="打开试玩"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10q3 0 4 4l1 5q0 4-3 2l-3-3H8l-3 3q-3 2-3-2l1-5q1-4 4-4Zm0 4v3m-1.5-1.5h3m7-1h.1m2 2h.1"/></svg><span className="desk-title-label">试玩</span><small>{latest?'候选 ›':'›'}</small></Link>
    {unbound
      ?<button className="preview-scene" type="button" aria-label="连接游戏" onClick={()=>void setup.run(()=>note.host.openSetup())}>{scene}</button>
      :<Link className="preview-scene" to={noteHref(note.metadata.id,latest?'/candidates/'+encodeURIComponent(latest.key):'/')} aria-label={action}>{scene}</Link>}
    {setup.error&&<small role="alert">{setup.error.message}</small>}
  </section>;
}
