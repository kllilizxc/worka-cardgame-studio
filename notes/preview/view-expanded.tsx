import {Harbor} from './harbor';
import './preview.css';
import {useEffect,useRef,useState} from 'react';
import {useRoutes} from 'react-router';
import {ManagedEmbed,useLocation,useMutation,useNote} from '@dsh-workbench/react';
import {routes} from './routes';
import {usePreviewModel,canViewPreview,STATUS} from './view-model';
import {RelatedRecords} from './record-links';
export default function ExpandedView(){return useRoutes(routes);}

type GameEntry={kind:'story'|'map'|'encounter';resourceId:string;nodeId?:string};
function parseEntry(id:string):GameEntry|null {
  try{
    const value=JSON.parse(id.slice(5));
    if(!['story','map','encounter'].includes(value.kind)||typeof value.resourceId!=='string'||!value.resourceId||(value.nodeId!==undefined&&typeof value.nodeId!=='string'))return null;
    return {kind:value.kind,resourceId:value.resourceId,...(value.nodeId?{nodeId:value.nodeId}:{})};
  }catch{return null;}
}
function EntryLaunch({recordId}:{recordId:string}){
  const note=useNote<typeof import('./actions')>();
  const [error,setError]=useState(''),attempted=useRef(false);
  const entry=parseEntry(recordId);
  const shared=note.metadata.access?.kind==='shared';
  const installation=note.useQuery('gameInstallation',{}, {enabled:!shared});
  const configured=Boolean(installation.data?.gameRoot&&installation.data?.gameCommit&&installation.data?.adapter);
  const run=async()=>{
    if(!entry||!configured||shared)return;
    setError('');
    try{
      const result=await note.actions.playGame({entry,title:entry.nodeId||entry.resourceId});
      await note.navigation.open({noteId:note.metadata.id,recordId:result.candidate.key});
    }catch(e){setError(e instanceof Error?e.message:String(e));}
  };
  useEffect(()=>{if(configured&&!attempted.current){attempted.current=true;void run();}},[configured]);
  return <section style={{padding:18}}>{!entry?'试玩起点无效':shared?'请从已交付的版本打开试玩。':installation.error?<p role="alert">{installation.error.message}</p>:installation.loading?'读取游戏项目…':!configured?'在 Worka 对话中说「绑定我的 CardGame 仓库」，然后打开试玩。':error?<><p role="alert">{error}</p><button onClick={()=>void run()}>重试</button></>:'正在打开试玩…'}</section>;
}
export function PreviewLayout(){
  const loc=useLocation();
  const record=loc.recordId;
  if(record?.startsWith('play:'))return <EntryLaunch key={(loc.requestId||'')+record} recordId={record}/>;
  return <GameView/>;
}
function GameView(){
  const m=usePreviewModel(),row=m.current;
  const baseline=useMutation(m.actions.playGame);
  const attempted=useRef('');
  const key=row?.owner.key;
  const project=m.gameInstallation.data;
  const baselineKey=project?.adapter&&project?.gameRoot&&project?.gameCommit?'baseline:'+project.gameCommit:'';
  const busy=['queued','starting','checking','stopping','repairing'].includes(m.effectiveStatus);
  const ready=!!row&&canViewPreview(row.status);
  const selected=m.rows.filter((r,i,rs)=>rs.findIndex(other=>other.owner.key===r.owner.key)===i);
  if(row&&!selected.some(r=>r.owner.key===key))selected.push(row);
  useEffect(()=>{
    if(m.shared||m.queryLoading||m.queryError||m.focusError||m.focusMissing||m.focusLoading)return;
    if(!row){
      if(!m.focusPending&&baselineKey&&!m.gameInstallation.loading&&!m.gameInstallation.error&&attempted.current!==baselineKey){
        attempted.current=baselineKey;void baseline.mutate({});
      }
      return;
    }
    if(attempted.current===key)return;
    attempted.current=key||'';
    if(['stopped','declared','disconnected'].includes(row.status))m.startAndAttach(row.spec.key);
  },[key,row?.status,m.queryLoading,m.queryError,m.focusError,m.focusMissing,m.focusLoading,m.focusPending,m.shared,baselineKey,m.gameInstallation.loading,m.gameInstallation.error]);
  const error=m.focusError||m.queryError||(!row&&!m.shared?m.gameInstallation.error:undefined)||baseline.error||m.error;
  return <section className="play-room">
    <header style={{display:'flex',alignItems:'center',gap:8}}>{new Set(selected.map(r=>r.owner.repos?.game?.commit||r.owner.key)).size>1?<select aria-label="切换试玩版本" value={key||''} onChange={e=>{const next=selected.find(r=>r.owner.key===e.target.value);if(next)m.setActiveKey(next.spec.key);}}>{selected.map(r=><option key={r.owner.key} value={r.owner.key}>{r.owner.title||r.owner.key}</option>)}</select>:<strong>{row?.owner.title||'试玩'}</strong>}
      {m.page.hasNext&&<button onClick={m.page.next}>更早版本</button>}{m.page.hasPrevious&&<button onClick={m.page.previous}>较新版本</button>}
      {row&&<small>{row.owner.repos?.game?.commit?.slice(0,7)}</small>}</header>
    {(error||m.focusMissing)&&<p role="alert">{String(error instanceof Error?error.message:error||'该试玩版本不存在')}</p>}
    {m.focusMissing?<button onClick={m.dismissFocus}>当前试玩</button>:row?<>
      {ready?(m.shared?<button disabled={!m.currentUrl||!m.metadata.access?.previews} onClick={()=>m.run(()=>m.workbench.openExternal(m.currentUrl))}>打开试玩</button>:
        <ManagedEmbed key={m.accessKey(row)} embedKey={row.spec.key+':'+m.accessKey(row)} target={m.previewTarget(row)} title={row.owner.title||'游戏试玩'} style={{width:'100%',flex:1,minHeight:240}}/>):
        <div role="status" style={{margin:'auto',textAlign:'center'}}><p>{row.error||STATUS[m.effectiveStatus]||m.effectiveStatus}</p>{!m.shared&&!busy&&<button onClick={()=>m.startAndAttach(row.spec.key)}>启动试玩</button>}</div>}
      {!m.shared&&<details><summary>版本信息</summary><p>{row.owner.repos?.game?.commit}</p>{row.host?.verified?.checks?.map(c=><p key={c.name}>{c.ok?'✓':'×'} {c.name} {c.detail}</p>)}<RelatedRecords recordId={row.owner.key}/></details>}
    </>:!error&&<div className="play-placeholder"><Harbor/><p role="status">{m.queryLoading||m.focusLoading||(!m.shared&&m.gameInstallation.loading)?'读取中…':m.shared?'暂无可试玩版本':baselineKey?'正在准备游戏…':'在 Worka 对话中说「绑定我的 CardGame 仓库」，然后打开试玩。'}</p></div>}
    {baseline.error&&!row&&<button disabled={baseline.status==='pending'} onClick={()=>void baseline.mutate({})}>重试</button>}
  </section>;
}
