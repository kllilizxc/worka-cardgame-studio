import {useState} from 'react';
import { Button } from '@heroui/react/button';
import {useNote,useUi,QueryState} from '@dsh-workbench/react';
import type {CandidateSpec} from './model';
import type {FeedbackSummary} from './view-model';
import {ui} from './messages';

function FieldValue({value}:{value:unknown}) {
  if(value===undefined||value===null)return <p role="status">{ui('详细字段不存在')}</p>;
  return <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:220,overflow:'auto',fontSize:12}}>{typeof value==='string'?value:JSON.stringify(value,null,2)}</pre>;
}
function FeedbackDetail({id}:{id:string}) {
  const {useQuery}=useNote<typeof import('./actions')>();
  const result=useQuery('feedbackReport',{id});
  return <QueryState query={result}>{value=><FieldValue value={value?.diagnostics}/>}</QueryState>;
}
export function FeedbackReport({item}:{item:FeedbackSummary}) {
  const [open,setOpen]=useState(false);
  return <section><Button variant="tertiary" size="sm" className="preview-quiet-button" aria-expanded={open} onPress={()=>setOpen(value=>!value)}>{item.subject||item.id}</Button>{open&&<FeedbackDetail id={item.id}/>}</section>;
}
/** Mounted only when the user opens a report; list queries never transfer logs. */
export function CandidateReport({candidate,surface}:{candidate:CandidateSpec;surface?:string}) {
  useUi(ui);
  const {useQuery}=useNote<typeof import('./actions')>();
  const result=useQuery('report',{key:candidate.key,...(surface===undefined?{}:{surface})});
  return <section aria-label={ui('查看检查与诊断')}><QueryState query={result}>{value=><FieldValue value={value}/>}</QueryState></section>;
}
