import {useLocation as useRecordLocation} from '@dsh-workbench/react';
import {useLocation, useMatch, useNavigate, useSearchParams} from 'react-router';
import {noteHref, withSession} from '@dsh-workbench/runtime';
import {composeQueries,useMutation,useResource,useUi,type QueryStateSource} from '@dsh-workbench/react';
import {ui} from './messages';
import { Button } from '@heroui/react/button';
import {previewRows as hostRows,rowState} from './projection';
type PreviewTask={id:string;label:string;surfaces:string[];status:'pending'|'running'|'completed'|'failed'|'unknown'|'skipped';error?:string};
import type {PreviewProgress} from '@dsh-workbench/runtime';
import {useEffect,useRef,useState} from 'react';
import {useNote} from '@dsh-workbench/react';
import type {CandidateSpec,Feedback} from './model';
type PreviewSummary={title:string;feedbackError:string|null};
const selectPreviewSummary=(data:PreviewSummary)=>({title:data.title,feedbackError:data.feedbackError});
const samePreviewSummary=(a:PreviewSummary,b:PreviewSummary)=>a.title===b.title&&a.feedbackError===b.feedbackError;
export type CandidateSummary=CandidateSpec;
export type FeedbackSummary=Pick<Feedback,'id'|'candidateKey'|'subject'|'summary'|'status'|'deliveryBlocked'|'title'>;
type DisplayCandidate=CandidateSpec|CandidateSummary;
type DisplayStatus=NonNullable<DisplayCandidate['status']>[string];
type DisplayData={title:string;candidates:DisplayCandidate[];archivedCandidates?:DisplayCandidate[];outbox?:Array<Feedback|FeedbackSummary>;feedbackError?:string|null};

export const STATUS:Record<string,string>={get coordinating(){return ui("连线处理中");},get repairPending(){return ui("正在交给连线…");},get repairUnknown(){return ui("修复状态需要核对");},get repairing() { return ui("自动修复中"); },get waiting() { return ui("需要你处理"); },get stopFailed() { return ui("停止失败"); },get checking() { return ui("检查中"); },get unchecked() { return ui("已启动，未核验"); },get verificationFailed() { return ui("检查失败"); },get unverified() { return ui("版本待核验"); },get blocked() { return ui("依赖阻塞"); },get stale() { return ui("版本待更新"); },get declared() { return ui("待启动"); },get ready() { return ui("可预览"); },get starting() { return ui("启动中"); },get stopped() { return ui("已停止"); },get stopping() { return ui("停止中"); },get failed() { return ui("启动失败"); },get unknown() { return ui("需要核对"); },get disconnected() { return ui("待启动"); }};
export const TONE:Record<string,string>={coordinating:'var(--wb-accent)',repairPending:'var(--wb-accent)',repairUnknown:'var(--wb-warning)',repairing:'var(--wb-accent)',waiting:'var(--wb-warning)',checking:'var(--wb-accent)',unchecked:'var(--wb-warning)',verificationFailed:'var(--wb-danger)',unverified:'var(--wb-warning)',blocked:'var(--wb-danger)',stale:'var(--wb-warning)',declared:'var(--wb-warning)',ready:'var(--wb-success)',starting:'var(--wb-accent)',stopped:'var(--wb-muted-light)',stopping:'var(--wb-muted-light)',failed:'var(--wb-danger)',unknown:'var(--wb-warning)',disconnected:'var(--wb-muted-light)'};
export const TONE_BG:Record<string,string>={coordinating:'var(--wb-accent-pale)',repairPending:'var(--wb-accent-pale)',repairUnknown:'var(--wb-warning-pale)',repairing:'var(--wb-accent-pale)',waiting:'var(--wb-warning-pale)',checking:'var(--wb-accent-pale)',unchecked:'var(--wb-warning-pale)',verificationFailed:'var(--wb-danger-pale)',unverified:'var(--wb-warning-pale)',blocked:'var(--wb-danger-pale)',stale:'var(--wb-warning-pale)',declared:'var(--wb-surface-deep)',ready:'var(--wb-success-pale)',starting:'var(--wb-accent-pale)',stopped:'var(--wb-surface-deep)',stopping:'var(--wb-surface-deep)',failed:'var(--wb-danger-pale)',unknown:'var(--wb-warning-pale)',disconnected:'var(--wb-surface-deep)'};
/** Matches the workbench shell so the note does not look like a foreign panel. */
export const FONT='var(--wb-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif)';
export const MONO='ui-monospace, SFMono-Regular, Menlo, monospace';
export const DEVICES=[
  {key:'desktop',label:'desktop',maxWidth:'none'},
  {key:'phone',label:'phone',maxWidth:'390px'},
  {key:'pad',label:'pad',maxWidth:'768px'},
] as const;
type DeviceKey=typeof DEVICES[number]['key'];

type PendingOperation={status:string};
type Row={operationId?:string;activeOperation?:boolean;tasks?:PreviewTask[];tasksDeferred?:boolean;diagnostics?:{stage?:string;log?:string};logPath?:string;startedAt?:number;progress?:PreviewProgress;feedback?:{state:string;summary?:string;checkedAt?:number};surface?:string;spec:DisplayCandidate;owner:DisplayCandidate;name:string;group:string;groupName:string;status:string;url:string;error?:string;live:boolean;host?:DisplayStatus};

function surfaceName(name:string, candidate:DisplayCandidate):string{
  const commit=candidate.repos?.game?.commit;
  return commit&&/^[0-9a-f]{40}$/i.test(commit)?`${name} · ${commit.slice(0,8)}`:name;
}

/** Rows render the host's status as-is; the view never infers process state. */
export function previewRows(data:DisplayData,pending:Record<string,PendingOperation>={}):Row[]{
  return hostRows(data).map(row=>{
    const host=row.status;const owner=row.candidate;
    const local=pending[owner.key];
    const awaiting=Boolean(local);
    const live=Boolean(host&&(host.phase==='ready'||host.phase==='verifying'||host.phase==='failed'&&host.failure?.step==='verify'));
    const known=owner.surfaces?.find(s=>s.name===row.surface);
    return {
      spec:{...owner,key:row.surface?`${owner.key}:${row.surface}`:owner.key},owner,surface:row.surface||undefined,name:surfaceName(known?.title||row.name,owner),host,
      group:owner.featureId||`${owner.originNoteId??''}:${owner.delegationId||owner.key}`,
      groupName:owner.title?.replace(/\s*[（(]适配器[：:].*$/,'').replace(/\s+四端预览$/,'')||owner.featureId||ui("未关联需求"),
      status:awaiting?local.status:rowState(row),url:row.url??'',live,
      tasks:Array.isArray(host?.steps)?host.steps.map(step=>({id:step.id,label:step.label,surfaces:[row.surface],status:step.state,error:step.detail})):undefined,
      tasksDeferred:Boolean(host?.steps&&!Array.isArray(host.steps)),
      progress:host?.message?{stage:host.phase,message:host.message,receivedAt:host.updatedAt,stageStartedAt:host.since}:undefined,
      startedAt:host?.since,error:host?.failure?.message,
      diagnostics:host?.failure?{stage:host.failure.step,log:typeof host.failure.log==='string'?host.failure.log:undefined}:undefined,
      logPath:host?.logDir,
      feedback:host?.failure?.handling?{state:host.failure.handling,summary:host.failure.handlingNote,checkedAt:host.failure.at}:undefined,
      activeOperation:awaiting||Boolean(host&&['queued','preparing','starting','verifying','stopping'].includes(host.phase)),
      operationId:host?.pass,
    };
  });
}

export function feedbackLabel(state:string){
  if(state==='coordinating')return ui('连线处理中');
  if(state==='delivery-failed')return ui('连线未接收故障');
  if(state==='agent-pending')return ui("正在交给连线…");
  if(state==='agent-unknown')return ui("修复状态需要核对");
  return ({'awaiting-approval':ui("等待你确认交给 Agent 修复"),retrying:ui("Worka 正在自动重试"),agent:ui("已交给 Agent 修复"),'agent-done':ui("修复任务已结束"),'waiting-user':ui("等待手动重试或授权 Agent 修复"),exhausted:ui("自动修复已用完，需要你查看"),pending:ui("正在将反馈送回原任务"),delivered:ui("原任务已收到失败反馈"),queued:ui("反馈已排队，等待当前轮结束"),running:ui("原任务正在处理预览问题"),paused:ui("原任务已暂停，反馈已保留"), 'needs-input':ui("等待手动重试或授权 Agent 修复"),completed:ui("原任务本轮已结束，预览仍未通过"),unreceived:ui("尚未确认原任务收到反馈"),unknown:ui("暂时无法获取原任务状态")} as Record<string,string>)[state]??ui("原任务已收到反馈");
}

export function canViewPreview(status:string){return ['ready','unchecked','verificationFailed'].includes(status);}

export function featureStatus(rows:Row[],operations:Record<string,PendingOperation>={}):string{
  const operation=rows.map(row=>operations[row.owner.key]).find(Boolean);
  if(operation)return operation.status;
  const statuses=new Set(rows.map(row=>row.status));
  return ['starting','checking','stopping','repairing','coordinating','repairPending','repairUnknown','waiting','failed','verificationFailed','ready','unchecked','stopped']
    .find(status=>statuses.has(status))??'stopped';
}

/** Compact lists show what is running or needs attention before stopped candidates. */
export function compactRank(rows:{status:string}[]):number{
  if(rows.some(row=>['starting','checking','stopping','repairing','repairPending'].includes(row.status)))return 0;
  if(rows.some(row=>canViewPreview(row.status)))return 1;
  if(rows.some(row=>['waiting','failed','repairUnknown'].includes(row.status)))return 2;
  return 3;
}

export function featureTitle(value:string):string{
  return value.replace(/\s*[·•]\s*todo-[^\s]+.*$/i,'').replace(/\s+todo-[^\s]+.*$/i,'').trim()||value;
}

export function navigationUrl(value:string,base:string){
  const url=new URL(value,base);
  if(!['http:','https:'].includes(url.protocol))throw Error(ui("请输入 http 或 https 地址"));
  return url.href;
}


export const GLYPH={
  play:'M8 5.5v13l11-6.5z',
  stop:'M7 7h10v10H7z',
  reload:'M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5',
  external:'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  link:'M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1 1M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1-1',
  close:'M6 6l12 12M18 6L6 18',
  fullscreen:'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',
  more:'M5 12h.01M12 12h.01M19 12h.01',
  deviceDesktop:'M4 5h16v11H4zM8 20h8M12 16v4',
  devicePhone:'M8 3.5h8v17H8zM11 17.5h2',
  devicePad:'M5 3.5h14v17H5zM11 17.5h2',
  refresh:'M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5',
  warning:'M12 3.5 21 19H3zM12 9v4.5M12 16.5h.01',
  report:'M9 4.5h6v3H9zM7.5 6H5.5v14.5h13V6h-2M9 13.5l2 2 4-4.5',
} as const;

export function Glyph({path,size=15,filled=false}:{path:string;size?:number;filled?:boolean}){
  useUi(ui);
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{display:'block'}}
    fill={filled?'currentColor':'none'} stroke={filled?'none':'currentColor'} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={path}/>
  </svg>;
}

export function TransportButton({path,filled,label,primary,onClick,disabled,loading}:{path:string;filled?:boolean;label:string;primary?:boolean;onClick:()=>void;disabled?:boolean;loading?:boolean}){
  useUi(ui);
  return <Button variant="tertiary" size="sm" type="button" className={`preview-transport-button${primary?' preview-transport-primary':''}`} aria-label={label} isDisabled={disabled} onClick={onClick}
    style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:primary?36:32,height:primary?36:32,borderRadius:primary?18:16,border:0,background:primary?'var(--wb-accent)':'var(--wb-surface)',color:primary?'var(--wb-accent-foreground)':disabled?'var(--wb-muted-light)':'var(--wb-ink-soft)',cursor:disabled?'default':'pointer',padding:0,fontFamily:'inherit',flexShrink:0}}>
    <span title={label} className={loading?'preview-spinner':undefined}><Glyph path={loading?GLYPH.reload:path} filled={!loading&&filled} size={primary?16:14}/></span>
  </Button>;
}

export function DeviceSwitcher({device,onClick}:{device:DeviceKey;onClick:()=>void}){
  useUi(ui);
  const current=DEVICES.find(item=>item.key===device)??DEVICES[0];
  const next=DEVICES[(DEVICES.findIndex(item=>item.key===current.key)+1)%DEVICES.length];
  const icon=current.key==='desktop'?GLYPH.deviceDesktop:current.key==='phone'?GLYPH.devicePhone:GLYPH.devicePad;
  const label=ui("切换设备：当前 {p0}，点击切换到 {p1}", { p0: current.label, p1: next.label });
  return <Button variant="tertiary" size="sm" type="button" className="preview-transport-button preview-device-switcher" aria-label={label} onClick={onClick}
    style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:32,height:32,border:0,borderRadius:16,background:'var(--wb-surface)',color:'var(--wb-ink-soft)',cursor:'pointer',padding:0,fontFamily:'inherit',flexShrink:0}}>
    <Glyph path={icon} size={14}/>
  </Button>;
}

export function PreviewLoading({progress,status,startedAt,tasks,tasksDeferred}:{progress?:PreviewProgress;status:string;startedAt?:number;tasks?:PreviewTask[];tasksDeferred?:boolean}){
  useUi(ui);
  const total=tasks?.length??0;
  const completed=tasks?.filter(t=>t.status==='completed').length??0;
  const [mountedAt]=useState(Date.now());
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const elapsed=Math.max(0,Math.floor((now-(startedAt??mountedAt))/1000));
  const silent=progress?Math.max(0,Math.floor((now-progress.receivedAt)/1000)):0;
  return <div role="status" className="preview-loading" style={{display:'grid',justifyItems:'center',gap:10,maxWidth:440,color:'var(--wb-ink-soft)',textAlign:'center'}}>
    <strong className="preview-loading-title" style={{fontSize:13,fontWeight:500}}>{progress?.message||ui("{p0}，请稍候…", { p0: STATUS[status] })}</strong>
    <span className="preview-loading-meta" aria-hidden="true" style={{fontSize:12}}>{ui.rich("总耗时 {p0} 秒", { p0: elapsed })}</span>
    {total>0?<>
      <div className="preview-progress-track" role="progressbar" aria-label={ui("预览总进度")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(completed/total*100)} style={{width:260,maxWidth:'100%',height:8,borderRadius:4,overflow:'hidden',background:'var(--wb-line)'}}>
        <div className="preview-progress-value" style={{height:'100%',width:`${completed/total*100}%`,background:'var(--wb-accent)',transition:'width .3s ease'}}/>
      </div>
      <span className="preview-loading-meta" aria-hidden="true" style={{fontSize:12}}>{ui.rich("总进度 {p0}/{p1} · {p2}%", { p0: completed, p1: total, p2: Math.floor(completed/total*100) })}</span>
    </>:<span className="preview-loading-meta" aria-hidden="true" style={{fontSize:12}}>{tasksDeferred?ui("启动中…"):ui.rich("未提供总进度")}</span>}
    {silent>=30&&<span className="preview-loading-warning" style={{fontSize:12,color:'var(--wb-warning)'}}>{ui.rich("暂时没有新进度；仍在等待结果。")}</span>}
  </div>;
}

export function failureMessage(row:Row,error:string){
  const reason=error||(row.diagnostics?.log?.includes('stderr:')?row.diagnostics.log.split('stderr:').at(-1)!.trim():undefined)||row.error||'';
  const detail=reason.replace(/^Error:\s*/i,'').trim().slice(0,400);
  if(/版本|revision/i.test(reason))return {title:ui("候选版本需要核对"),description:ui("当前运行版本与候选要求不一致，请核对后重新启动。"),reason:detail};
  const note=row.host?.failure?.handlingNote;
  if(row.host?.failure?.handling==='agent-pending')return {title:ui("正在交给连线…"),description:note||'',reason:detail};
  if(row.host?.failure?.handling==='agent-unknown')return {title:ui("修复状态需要核对"),description:note||'',reason:detail};
  return {title:row.status==='repairing'?ui("正在自动修复"):ui("预览暂时无法启动"),description:note||ui("具体原因见下方；可重新启动当前端。"),reason:detail};
}

/** Structured handoff keeps arbitrary candidate/surface names unambiguous. */
export function previewFocus(key:string,surface?:string){return 'preview:'+encodeURIComponent(JSON.stringify([key,surface??null]));}
function parsePreviewFocus(focus:string|undefined):{key:string;surface?:string;structured:boolean}{
  if(focus?.startsWith('preview:'))try{const value:unknown=JSON.parse(decodeURIComponent(focus.slice(8)));if(Array.isArray(value)&&value.length===2&&typeof value[0]==='string'&&(value[1]===null||typeof value[1]==='string'))return {key:value[0],surface:value[1]??undefined,structured:true};}catch{}
  return {key:focus??'',structured:false};
}

export function usePreviewModel(){
  useUi(ui);
  const { config, actions, useQuery, usePagedQuery, host: workbench, mode, layout, metadata } = useNote<typeof import('./actions')>();
  const shared=metadata.access?.kind==='shared';
  const gameInstallation=useQuery('gameInstallation',{}, {enabled:!shared});
  const navigate=useNavigate();
  const location=useLocation();
  const [params,setParams]=useSearchParams();
  const route=useMatch('/notes/:noteId/candidates/:candidateId');
  const showArchive=params.get('archived')==='1';
  const setShowArchive=(value:boolean)=>setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set('archived','1');else next.delete('archived');return next;},{replace:true});
  const reportOpen=params.get('tab')==='logs';
  const setReportOpen=(value:boolean)=>setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set('tab','logs');else next.delete('tab');return next;});
  const startMutation=useMutation(actions.start,{key:input=>input.key});
  const stopMutation=useMutation(actions.stop,{key:input=>input.key});
  const repairMutation=useMutation(actions.requestRepair,{key:input=>JSON.stringify([input.key,input.surface??''])});
  // Command admission belongs to the SDK; process progress belongs to the provider.
  const operations:Record<string,PendingOperation>={};
  for(const [mutation,status] of [[startMutation,'starting'],[stopMutation,'stopping']] as const)
    for(const outcome of mutation.outcomes)if(outcome.pending||outcome.needsVerification)
      operations[outcome.key]={status:outcome.pending?status:'unknown'};
  const sharedView=useResource<DisplayData>('view',{}, {enabled:shared});
  const root=useQuery('summary',{}, {enabled:!shared,select:selectPreviewSummary,isEqual:samePreviewSummary});
  const page=usePagedQuery('candidates',{},{enabled:!shared});
  const archivePage=usePagedQuery('archivedCandidates',{},{enabled:!shared&&mode==='expanded'&&showArchive});
  const [handledFocus,setHandledFocus]=useState<string>();
  const {recordId:recordFocus,requestId:focusRequestId}=useRecordLocation();
  const routeId=route?.params.candidateId;
  const handledRecordFocus=useRef<string|undefined>(undefined);
  const recordFocusToken=recordFocus?JSON.stringify([recordFocus,focusRequestId]):undefined;
  const unhandledRecordFocus=Boolean(recordFocusToken)&&handledRecordFocus.current!==recordFocusToken;
  const focus=unhandledRecordFocus?recordFocus:routeId?previewFocus(routeId,params.get('surface')??undefined):undefined;
  const focusToken=focus?JSON.stringify([unhandledRecordFocus?focusRequestId:location.key,focus]):undefined;
  const pendingFocus=mode==='expanded'&&Boolean(focusToken)&&(Boolean(routeId)||handledFocus!==focusToken);
  const targetFocus=parsePreviewFocus(focus);
  const visibleCandidates=shared?sharedView.data?.candidates:page.data?.items;
  const knownFocusCandidate=visibleCandidates?.find(candidate=>candidate.key===targetFocus.key)
    ??(!targetFocus.structured?visibleCandidates?.find(candidate=>previewRows({title:'',candidates:[candidate]}).some(row=>row.spec.key===focus)):undefined);
  // Keep the already subscribed bounded fallback while a candidate:surface
  // jump becomes its canonical URL. Do not tear it down and reread the same ID.
  const fallbackRouteKey=useRef<string|undefined>(undefined);
  const retainedFallback=Boolean(routeId)&&routeId===fallbackRouteKey.current&&targetFocus.key===routeId;
  const focusLookup=mode==='expanded'&&!shared&&Boolean(focus)&&!knownFocusCandidate&&!retainedFallback;
  const focusDetail=useQuery('candidateDetail',{key:targetFocus.key},{enabled:focusLookup});
  // Record links use candidate:surface. Exact candidate keys take precedence;
  // after an explicit miss, make at most one bounded suffix lookup.
  const fallbackFocusKey=retainedFallback?routeId:!targetFocus.structured&&targetFocus.key.includes(':')?targetFocus.key.slice(0,targetFocus.key.lastIndexOf(':')):undefined;
  const fallbackLookup=mode==='expanded'&&!shared&&Boolean(focus)&&!knownFocusCandidate&&Boolean(fallbackFocusKey)&&(retainedFallback||focusLookup&&focusDetail.data===null);
  const fallbackDetail=useQuery('candidateDetail',{key:fallbackFocusKey??''},{enabled:fallbackLookup});
  if(fallbackLookup&&fallbackDetail.data?.key===fallbackFocusKey)fallbackRouteKey.current=fallbackFocusKey;
  const focusedCandidate=knownFocusCandidate??(focusLookup?focusDetail.data:undefined)??(fallbackLookup?fallbackDetail.data:undefined);
  const focusedRows=focusedCandidate?previewRows({title:'',candidates:[focusedCandidate]},operations):[];
  const focusedRow=targetFocus.structured?focusedRows.find(row=>targetFocus.surface===undefined||row.surface===targetFocus.surface)
    :focusedRows.find(row=>row.spec.key===focus)??focusedRows.find(row=>row.owner.key===focus);
  const focusLoading=pendingFocus&&(focusLookup&&focusDetail.loading||fallbackLookup&&fallbackDetail.loading);
  const focusError=pendingFocus?((focusLookup?focusDetail.error:undefined)??(fallbackLookup?fallbackDetail.error:undefined)):undefined;
  const focusMissing=pendingFocus&&!focusLoading&&!focusError&&!focusedRow;

  const data:DisplayData=shared?(sharedView.data??{title:metadata.name,candidates:[]}):{
    title:root.data?.title??metadata.name,candidates:page.data?.items??[],archivedCandidates:archivePage.data?.items,
    feedbackError:root.data?.feedbackError,
  };
  // A title or archive read must not hide an already usable candidate page.
  const query:QueryStateSource<unknown>=shared?sharedView:composeQueries({candidates:page},{summary:root,...(mode==='expanded'&&showArchive?{archive:archivePage}:{}),...(focusLookup?{focus:focusDetail}:{}),...(fallbackLookup?{fallback:fallbackDetail}:{})});
  const queryLoading=query.loading;
  const queryError=query.error;
  const refreshState=async()=>{await query.refresh?.();};
  const stage=useRef<HTMLDivElement>(null);
  const [collapsed,setCollapsed]=useState<string[]>([]);
  const [menu,setMenu]=useState(false);
  const [showAddress,setShowAddress]=useState(false);
  const [urls,setUrls]=useState<Record<string,string>>({});
  const [draft,setDraft]=useState('');
  const [fullscreen,setFullscreen]=useState(false);
  const device:DeviceKey=params.get('device')==='phone'?'phone':params.get('device')==='pad'?'pad':'desktop';
  const setDevice=(update:DeviceKey|((previous:DeviceKey)=>DeviceKey))=>{const value=typeof update==='function'?update(device):update;setParams(previous=>{const next=new URLSearchParams(previous);if(value==='desktop')next.delete('device');else next.set('device',value);return next;},{replace:true});};
  useEffect(()=>{const change=()=>setFullscreen(document.fullscreenElement===stage.current);document.addEventListener('fullscreenchange',change);return()=>document.removeEventListener('fullscreenchange',change);},[]);
  const action=useMutation();
  const verifyMutation=useMutation(actions.verify,{key:input=>input.key});
  const checkMutation=useMutation(actions.check,{key:input=>input.key});
  const lanMutation=useMutation(actions.lan,{key:input=>JSON.stringify([input.key,input.surface])});
  const lanPending=useRef(false);
  const [lanCopying,setLanCopying]=useState(false);
  const archiveMutation=useMutation(actions.archive,{key:input=>input.key});
  const restoreMutation=useMutation(actions.restore,{key:input=>input.key});
  const forgetMutation=useMutation(actions.forget,{key:input=>input.key});
  const mutations={start:startMutation,repair:repairMutation,verify:verifyMutation,stop:stopMutation,check:checkMutation,archive:archiveMutation,restore:restoreMutation,forget:forgetMutation};
  const [notice,setNotice]=useState('');
  const setError=(value:string)=>{action.clearError();Object.values(mutations).forEach(mutation=>{if(mutation.status==='error'||mutation.status==='unknown')mutation.reset();});setNotice(value);};
  const [activeKey,updateActiveKey]=useState<string|undefined>(undefined);
  const setActiveKey=(key:string|undefined)=>{
    if(recordFocusToken)handledRecordFocus.current=recordFocusToken;
    setHandledFocus(focusToken);updateActiveKey(key);
    const row=key?(selectableRows.find(value=>value.spec.key===key)??openedRows[key]):undefined;
    if(mode==='expanded'&&(!row||routeId!==row.owner.key||(params.has('surface')?params.get('surface')!==row.surface:current?.spec.key!==key)||unhandledRecordFocus)) {
      const next=new URLSearchParams(params);
      if(row?.surface)next.set('surface',row.surface);else next.delete('surface');
      const pathname=noteHref(metadata.id,row?'/candidates/'+encodeURIComponent(row.owner.key).replace(/~/g,'%7E'):'/');
      const search=next.size?'?'+next.toString():'';
      if(pathname!==location.pathname||search!==location.search)void navigate({pathname,search});
    }
    if(key)setOpenedRows(value=>{if(!value[key])return value;const next={...value};delete next[key];return {...next,[key]:value[key]};});
  };
  const dismissFocus=()=>setActiveKey(undefined);
  // Keep the current page and the most recently used alternative. Object order
  // is the LRU order; removing a row unmounts ManagedEmbed and releases its lease.
  const [openedRows,setOpenedRows]=useState<Record<string,Row>>({});
  const loaded=Object.keys(openedRows);
  const pendingAttach=useRef(new Set<string>());
  const [reload,setReload]=useState<Record<string,number>>({});
  const [confirmForget,setConfirmForget]=useState<string|null>(null);
  const run=(fn:()=>Promise<unknown>)=>{setNotice('');void action.run(fn);};

  const archived=(data.archivedCandidates??[]).filter(spec=>!(data.candidates??[]).some(active=>active.key===spec.key));
  const rows=previewRows(data,operations);
  const selectableRows=[...rows,...focusedRows.filter(row=>!rows.some(visible=>visible.spec.key===row.spec.key))];
  const current=mode==='expanded'?(pendingFocus?focusedRow:rows[0]):activeKey?(selectableRows.find(row=>row.spec.key===activeKey)??openedRows[activeKey]):rows[0];
  const mutationError=Object.values(mutations).flatMap(mutation=>mutation.outcomes.filter(outcome=>outcome.input.key===current?.owner.key&&['error','unknown'].includes(mutation.statusFor(outcome.key))))
    .map(outcome=>outcome.readError??outcome.error).find(Boolean);
  const error=notice||(action.error||mutationError||lanMutation.error?String(action.error??mutationError??lanMutation.error):'');
  const embedRows=loaded.map(key=>selectableRows.find(row=>row.spec.key===key)??openedRows[key]).filter((row):row is Row=>Boolean(row));
  const currentIsCandidate=Boolean(current&&selectableRows.some(row=>row.owner.key===current.owner.key));
  const [resolvedUrls,setResolvedUrls]=useState<Record<string,string>>({});
  const [accessErrors,setAccessErrors]=useState<Record<string,string>>({});
  const accessKey=(row:Row)=>JSON.stringify([urls[row.spec.key]??row.url,row.host?.pass,reload[row.spec.key]??0]);
  const requestedUrls=JSON.stringify(!shared&&mode==='expanded'&&current?[current].filter(row=>canViewPreview(row.status)).map(row=>({url:urls[row.spec.key]??row.url,key:accessKey(row)})):[]);
  useEffect(()=>{
    let cancelled=false;
    const requested=JSON.parse(requestedUrls) as Array<{url:string;key:string}>;
    const wanted=new Set(requested.map(item=>item.key));
    setResolvedUrls(value=>Object.fromEntries(Object.entries(value).filter(([key])=>wanted.has(key))));setAccessErrors({});
    for(const {url,key} of requested.filter(item=>item.url)) {
      void workbench.resolvePreviewUrl(url).then(href=>{if(!cancelled)setResolvedUrls(value=>({...value,[key]:href}));},error=>{if(!cancelled)setAccessErrors(value=>({...value,[key]:String(error)}));});
    }
    return()=>{cancelled=true;};
  },[workbench,requestedUrls]);
  const selectedAccess=current?accessKey(current):'';
  const currentUrl=shared?(metadata.access?.previews?current?.url??'':''):resolvedUrls[selectedAccess]??'';
  const accessError=accessErrors[selectedAccess];
  const activeDevice=DEVICES.find(item=>item.key===device)??DEVICES[0];
  const cycleDevice=()=>setDevice(currentDevice=>DEVICES[(DEVICES.findIndex(item=>item.key===currentDevice)+1)%DEVICES.length].key);
  useEffect(()=>setDraft(currentUrl),[current?.spec.key,currentUrl]);
  const groups=[...new Set(rows.map(row=>row.group))].map(key=>({key,rows:rows.filter(row=>row.group===key)}));
  const availableFeatures=groups.filter(group=>group.rows.some(row=>canViewPreview(row.status))).length;
  const effectiveStatus=current?.status??'';


  const requestRepair=async(row:Row)=>{
    setNotice('');
    const result=await repairMutation.mutate({key:row.owner.key,surface:row.surface??''});
    if(result?.accepted===false)setError(result.reason??ui("连线未接收故障"));
    else if(result?.session)void navigate(withSession(location.pathname+location.search,result.session));
  };
  /** Explicit help uses the existing connection; observation alone never starts another Agent. */
  const repairButton=(row:Row)=>{
    const failure=row.host?.failure;
    if(!failure)return null;
    if(failure.session)return <Button variant="tertiary" size="sm" onPress={()=>void navigate(withSession(location.pathname+location.search,failure.session!))}>{ui("查看修复会话")}</Button>;
    if(!failure.handling||['delivery-failed','agent-unknown','awaiting-approval','exhausted'].includes(failure.handling))return <Button variant="tertiary" size="sm" isDisabled={repairMutation.statusFor(JSON.stringify([row.owner.key,row.surface??'']))==='pending'||row.activeOperation} onPress={()=>void requestRepair(row)}>{ui(failure.handling?"重新通知连线":"交给 Agent 修复")}</Button>;
    return null;
  };

  const label=(spec:DisplayCandidate)=>spec.title||spec.key;
  const attach=(key:string)=>{
    if(mode==='compact'){const row=rows.find(value=>value.spec.key===key);const search=new URLSearchParams(params);if(row?.surface)search.set('surface',row.surface);else search.delete('surface');void navigate({pathname:noteHref(metadata.id,'/candidates/'+encodeURIComponent(row?.owner.key??key).replace(/~/g,'%7E')),search:search.size?'?'+search.toString():''});return;}
    setActiveKey(key);
    if(shared)return;
    const row=selectableRows.find(value=>value.spec.key===key)??openedRows[key];
    if(!row)return;
    if(!canViewPreview(row.status)){pendingAttach.current.add(key);return;}
    pendingAttach.current.delete(key);
    setError('');
    setOpenedRows(value=>Object.fromEntries([...Object.entries(value).filter(([id])=>id!==key),[key,row]].slice(-2)));
  };
  const closePreview=(key:string)=>{pendingAttach.current.delete(key);setOpenedRows(value=>{const next={...value};delete next[key];return next;});};
  useEffect(()=>{if(pendingFocus&&focusedRow)attach(focusedRow.spec.key);},[focusToken,mode,pendingFocus,focusedRow?.spec.key,focusDetail.data,fallbackDetail.data,page.data]);
  useEffect(()=>{for(const key of pendingAttach.current){if(selectableRows.some(row=>row.spec.key===key&&canViewPreview(row.status)))attach(key);}},[page.data,focusDetail.data,fallbackDetail.data]);
  const reloadFrame=(key:string)=>{const row=selectableRows.find(value=>value.spec.key===key);if(row)setOpenedRows(value=>value[key]?{...value,[key]:row}:value);setReload(state=>({...state,[key]:(state[key]??0)+1}));};
  /** Not-ready play starts the process and remembers the frame, so it appears once ready. */
  const startAndAttach=(key:string)=>{
    const row=selectableRows.find(item=>item.spec.key===key);if(!row)return;
    setNotice('');
    void startMutation.mutate({key:row.owner.key}).then(result=>{
      if(result?.accepted)attach(key);
      return result;
    });
  };
  const startGroupAndAttach=(rows:Row[],selected:Row)=>{
    const keys=new Set(rows.map(row=>row.owner.key));
    keys.delete(selected.owner.key);keys.add(selected.owner.key);
    setNotice('');
    for(const key of keys)void startMutation.mutate({key}).then(result=>{
      if(result?.accepted&&selected.owner.key===key)attach(selected.spec.key);
      return result;
    });
  };
  const openDelegation=(spec:DisplayCandidate)=>{if(spec.originNoteId&&spec.delegationId)void navigate(noteHref(spec.originNoteId,'/tasks/'+encodeURIComponent(spec.delegationId).replace(/~/g,'%7E')));};
  const draftTodo=()=>{
    if(!config?.feedbackInTodo||!config.notes?.todo)return;
    const context=current?{ref:{projectId:config.projectId,kind:'preview',id:current.owner.key,revision:current.owner.revision,...(current.surface?{surface:current.surface}:{})}}:undefined;
    void workbench.openNote(config.notes.todo,'cg:'+encodeURIComponent(JSON.stringify({projectId:config.projectId,kind:'todo',intent:'draft',...(context?{context}:{})}))).catch(e=>setError(String(e)));
  };
  const attachedHere=Boolean(current&&loaded.includes(current.spec.key)&&canViewPreview(current.status));

  const copyLanAddress=async()=>{
    if(lanPending.current||!current?.surface||current.host?.phase!=='ready')return;
    lanPending.current=true;setLanCopying(true);setNotice('');action.clearError();
    try {
      const result=await lanMutation.mutate({key:current.owner.key,surface:current.surface});
      if(result)await action.run(async()=>{await workbench.copyText(result.url);setNotice(ui('局域网地址已复制'));});
    } finally {lanPending.current=false;setLanCopying(false);}
  };

  const previewTarget=(row:Row)=>urls[row.spec.key]??row.url;
  return {reportOpen,setReportOpen,copyLanAddress,lanCopying,mutations,focusPending:pendingFocus,focusLoading,focusError,focusMissing,dismissFocus,previewTarget,query,queryLoading,queryError,page,archivePage,embedRows,closePreview,shared,config,gameInstallation,refreshState,mode,data,actions,workbench,stage,operations,collapsed,setCollapsed,menu,setMenu,showAddress,setShowAddress,showArchive,setShowArchive,setUrls,draft,setDraft,fullscreen,device,error,setError,setActiveKey,loaded,reload,confirmForget,setConfirmForget,run,archived,rows,current,currentIsCandidate,resolvedUrls,accessKey,currentUrl,accessError,activeDevice,cycleDevice,groups,availableFeatures,effectiveStatus,repairButton,label,attach,reloadFrame,startAndAttach,startGroupAndAttach,openDelegation,draftTodo,attachedHere,layout,metadata};
}
export type PreviewModel = ReturnType<typeof usePreviewModel>;

