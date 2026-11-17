import {useMutation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime/view';
import type {Scene} from './model';
import './story-compact.css';

function SceneImage({scene}:{scene:Scene}){
  const note=useNote<typeof import('./actions')>(),asset=note.useQuery('sceneAsset',{sceneId:scene.id});
  return asset.data?<img src={asset.data} alt=""/>:null;
}
export default function Compact(){
  const note=useNote<typeof import('./actions')>(),home=note.useQuery('storyHome',{}),nav=useMutation();
  const current=home.data?.current??null,branches=home.data?.branches??[];
  const unbound=!home.loading&&home.data?.configured===false;
  function open(id?:string){void nav.run(()=>note.navigation.open({href:noteHref(note.metadata.id,id?'/scenes/'+encodeURIComponent(id):'/')}));}
  function step(scene:Scene){return <button type="button" key={scene.id} className="cr-step" onClick={()=>open(scene.id)}><SceneImage scene={scene}/><b>{scene.title}</b></button>;}
  return <section className="atlas-panel atlas-story"><header className="cr-head"><h2><button aria-label={note.metadata.name} onClick={()=>open()}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/></svg><span className="cr-title-label">{note.metadata.name}</span><span style={{marginLeft:'auto'}}>›</span></button></h2></header>
    {unbound?<p><button type="button" onClick={()=>void nav.run(()=>note.host.openSetup())}>连接游戏仓库 →</button></p>:current?<><button className="cr-chapter" onClick={()=>open(current.id)}><span className="cr-chapter-copy"><strong>{current.title}</strong><span>{current.excerpt||''}</span></span><span className="cr-chapter-image"><SceneImage scene={current}/></span></button>
      <div className="cr-branch">{step(current)}{branches.length>0&&<><svg className="cr-wires" aria-hidden="true" viewBox="0 0 30 48" preserveAspectRatio="none"><path d={branches.length===1?'M0 24h28m-4-3 4 3-4 3':'M0 24h7q5 0 5-6v-1q0-5 5-5h11m-4-3 4 3-4 3M7 24q5 0 5 6v1q0 5 5 5h11m-4-3 4 3-4 3'}/></svg><div className="cr-choices">{branches.map(r=>step(r))}</div></>}</div></>:<p>{home.loading?'读取中…':'暂无章节'}</p>}
    {nav.error&&<small role="alert">{nav.error.message}</small>}</section>;
}
