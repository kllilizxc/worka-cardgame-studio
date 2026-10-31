import {useMutation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime/view';
import type {Scene} from './model';
import art from './campaign-art.json';
import './story-compact.css';

function sceneLabel(scene:Scene){return scene.folders.slice(-2).reverse().join(' · ')||scene.title;}
function summary(scene:Scene){
  const text=scene.body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').split(/\r?\n/).find(line=>line.trim()&&!/^[\s#>{[\]-]/.test(line));
  return text?.slice(0,150)||scene.search.replace(scene.title,'').trim().slice(0,140);
}
function painting(scene:Scene,first=false){
  if(first||scene.title.includes('桥')||scene.title.includes('铃'))return art.bridge;
  return /草|采|药|林/.test(scene.title)?art.grass:art.clash;
}
export default function Compact(){
  const note=useNote<typeof import('./actions')>(),project=note.useQuery('projectIndex',{}),nav=useMutation();
  const rows=project.data?.storyIndex??note.config.storyIndex??[];
  const current=rows.find(r=>r.title==='桥下的倒铃')||rows.find(r=>r.choices.length>=2)||rows.find(r=>r.id===note.config.initialScene)||rows[0];
  function open(id?:string){void nav.run(()=>note.navigation.open({href:noteHref(note.metadata.id,id?'/scenes/'+encodeURIComponent(id):'/')}));}
  const branches=current?.choices.map(c=>rows.find(r=>r.id===c.to||r.nodeId===c.to)).filter((r):r is Scene=>!!r).slice(0,2)||[];
  function step(scene:Scene,first=false){return <button type="button" key={scene.id} className="cr-step" onClick={()=>open(scene.id)}><img src={painting(scene,first)} alt=""/><b>{scene.title}</b></button>;}
  return <section className="atlas-panel atlas-story"><header className="cr-head"><h2><button aria-label={note.metadata.name} onClick={()=>open()}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/></svg>{note.metadata.name}<span style={{marginLeft:'auto'}}>›</span></button></h2></header>
    {current?<><button className="cr-chapter" onClick={()=>open(current.id)}><span className="cr-chapter-copy"><strong>{sceneLabel(current)}</strong><span>{summary(current)}</span></span><span className="cr-chapter-image"><img alt="" src={art.bridge}/></span></button>
      <div className="cr-branch">{step(current,true)}{branches.length>0&&<><svg className="cr-wires" aria-hidden="true" viewBox="0 0 30 48" preserveAspectRatio="none"><path d={branches.length===1?'M0 24h28m-4-3 4 3-4 3':'M0 24h7q5 0 5-6v-1q0-5 5-5h11m-4-3 4 3-4 3M7 24q5 0 5 6v1q0 5 5 5h11m-4-3 4 3-4 3'}/></svg><div className="cr-choices">{branches.map(r=>step(r))}</div></>}</div></>:<p>{project.loading?'读取中…':'暂无章节'}</p>}
    {nav.error&&<small role="alert">{nav.error.message}</small>}</section>;
}
