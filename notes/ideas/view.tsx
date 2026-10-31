import {useEffect,useState} from 'react';
import {defineNoteView,useNote} from '@dsh-workbench/react';
const View = defineNoteView({compactSurface:'transparent',compact:()=>import('./compact'),expanded:()=>import('./expanded')});

export default function StudioView(){
  const {config,metadata,mutations}=useNote<typeof import('./actions')>();
  const install=mutations.installExampleWork;
  const enabled=config.includeExampleWork && metadata.access?.kind!=='shared';
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!enabled)return;
    let active=true;
    void install({}).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:String(cause));});
    return ()=>{active=false;};
  },[enabled,install]);
  return <>{enabled&&error&&<p role="alert">{error}</p>}<View/></>;
}
