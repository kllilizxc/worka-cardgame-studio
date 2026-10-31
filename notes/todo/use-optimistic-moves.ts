import {useRef,useState} from 'react';
import type {TodoListItem} from './list';
import type {TodoStatus} from './model';

type Counts=Record<TodoStatus,number>;
type Move={id:string;status:TodoStatus;beforeId?:string;afterId?:string};
type Intent=Move&{item:TodoListItem;scope:string;summaryRevision?:string;committedRevision?:string;retryRefresh?:()=>Promise<void>;readError?:Error};
/** Only unconfirmed UI intent is local; the native pages remain authoritative. */
export function useOptimisticMoves(items:TodoListItem[],scope:string,summary:{counts:Counts;matched:Counts|null;revision:string}|undefined){
 const intents=useRef(new Map<string,Intent>()),[,redraw]=useState(0);
 const [error,setError]=useState<Error>();
 const changed=()=>redraw(value=>value+1);
 const visible=[...intents.current.values()].filter(intent=>intent.scope===scope);
 const projected=[...items];
 for(const intent of visible){
  const current=projected.find(item=>item.id===intent.id)??intent.item;
  // Source and destination subscriptions can briefly overlap during reconciliation.
  for(let index=projected.length-1;index>=0;index--)if(projected[index]!.id===intent.id)projected.splice(index,1);
  const before=projected.findIndex(item=>item.id===intent.beforeId),after=projected.findIndex(item=>item.id===intent.afterId);
  projected.splice(before>=0?before:after>=0?after+1:projected.length,0,{...current,status:intent.status});
 }
 const adjust=(counts:Counts|undefined)=>{
  if(!counts)return counts;
  const next={...counts};
  for(const intent of visible){
   const reflectedInPage=items.some(item=>item.id===intent.id&&item.status===intent.status);
   const reflected=intent.committedRevision!==undefined&&Number(summary?.revision)>=Number(intent.committedRevision)
    ||reflectedInPage&&summary?.revision!==intent.summaryRevision;
   if(!reflected&&intent.item.status!==intent.status){next[intent.item.status]--;next[intent.status]++;}
  }
  return next;
 };
 const run=async(input:Move,submit:()=>Promise<{revision:string}|undefined>,refresh:()=>Promise<void>)=>{
  if(intents.current.has(input.id))return false;
  const item=items.find(item=>item.id===input.id);if(!item)return false;
  const intent:Intent={...input,item,scope,summaryRevision:summary?.revision};
  intents.current.set(input.id,intent);setError(undefined);changed();
  const remove=()=>{if(intents.current.get(input.id)===intent){intents.current.delete(input.id);changed();}};
  let result;
  try{result=await submit();}catch(cause){setError(cause instanceof Error?cause:Error(String(cause)));remove();return false;}
  if(!result){remove();return false;}
  intent.committedRevision=result.revision;changed();
  const finish=async()=>{await refresh();remove();};
  try{await finish();}catch(cause){intent.readError=cause instanceof Error?cause:Error(String(cause));intent.retryRefresh=finish;changed();}
  return true;
 };
 return {items:projected,counts:adjust(summary?.counts),matched:adjust(summary?.matched??undefined),busy:(id:string)=>intents.current.has(id),run,error:visible.find(intent=>intent.readError)?.readError??error,
  retryRefresh:visible.some(intent=>intent.retryRefresh)?async()=>{await Promise.all(visible.filter(intent=>intent.retryRefresh).map(async intent=>{try{await intent.retryRefresh!();}catch(cause){intent.readError=cause instanceof Error?cause:Error(String(cause));changed();}}));}:undefined};
}
