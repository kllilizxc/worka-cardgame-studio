import {useEffect,useRef,useState} from 'react';
import {useLocation as useRecordLocation,useMutation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime';
import {useLocation,useNavigate} from 'react-router';
import {Reader} from './reader';
import type {Scene} from './model';
import './story.css';

function remember(key:string,value?:string){
  try{if(value)sessionStorage.setItem(key,value);return sessionStorage.getItem(key)??'';}catch{return '';}
}
function sourcePath(href:string,from:string){
  if(/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith('//'))return '';
  try{return decodeURIComponent(new URL(href,'https://project.invalid'+from).pathname);}catch{return '';}
}

function ChapterFolder({folderKey,current,expanded,toggle,open}:{folderKey:string;current:string;expanded:Set<string>;
  toggle(key:string):void;open(id:string):void}){
  const {usePagedQuery}=useNote<typeof import('./actions')>();
  const page=usePagedQuery('storyTreePage',{folderKey});
  return <ul>{page.items.map(child=>child.kind==='folder'?<li key={child.key}>
    <button className="folder" aria-expanded={expanded.has(child.key)} onClick={()=>toggle(child.key)}>
      <span aria-hidden="true">{expanded.has(child.key)?'⌄':'›'}</span> {child.name}</button>
    {expanded.has(child.key)&&<ChapterFolder folderKey={child.key} current={current} expanded={expanded} toggle={toggle} open={open}/>}
  </li>:<li key={child.id}><button aria-current={current===child.id?'page':undefined} onClick={()=>open(child.id)}>{child.title}</button></li>)}
  {page.hasNext&&<li><button onClick={page.next}>更多</button></li>}</ul>;
}

type MapController={showFolder(key:string):void;drill(id:string):void};

function FolderMapChildren({folderKey,trail,control}:{folderKey:string;trail:string[];control:MapController}){
  const {usePagedQuery}=useNote<typeof import('./actions')>();
  const page=usePagedQuery('storyTreePage',{folderKey});
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set());
  if(!page.items.length)return null;
  return <ul>{page.items.map((item,index)=>{
    const nodeKey=item.kind==='folder'?'g:'+item.key:'s:'+item.id,unique=index+':'+nodeKey;
    const cyclic=trail.includes(nodeKey),isOpen=expanded.has(unique)&&!cyclic;
    const label=item.kind==='folder'?item.name:item.title;
    return <li key={unique}><span className="map-node">
      <button onClick={()=>item.kind==='folder'?control.showFolder(item.key):control.drill(item.id)}>{label}</button>
      {item.hasChildren&&!cyclic&&<button className="map-expand" aria-label={(isOpen?'收起 ':'展开 ')+label} aria-expanded={isOpen}
        onClick={()=>setExpanded(prev=>{const next=new Set(prev);if(next.has(unique))next.delete(unique);else next.add(unique);return next;})}>{isOpen?'−':'+'}</button>}
    </span>{isOpen&&(item.kind==='folder'?<FolderMapChildren folderKey={item.key} trail={[...trail,nodeKey]} control={control}/>:<SceneMapChildren sceneId={item.id} trail={[...trail,nodeKey]} control={control}/>)}</li>;
  })}{page.hasNext&&<li><button onClick={page.next}>更多</button></li>}</ul>;
}

function SceneMapChildren({sceneId,choices,trail,control}:{sceneId:string;choices?:Scene['choices'];trail:string[];control:MapController}){
  const {useQuery}=useNote<typeof import('./actions')>();
  const loaded=useQuery('scene',{id:sceneId},{enabled:!choices});
  const list=choices??loaded.data?.scene?.choices??[];
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set());
  if(!list.length)return null;
  return <ul>{list.map((choice,index)=>{
    const nodeKey='s:'+choice.to,unique=index+':'+nodeKey;
    const cyclic=trail.includes(nodeKey),isOpen=expanded.has(unique)&&!cyclic;
    return <li key={unique}><span className="map-node">
      <button onClick={()=>control.drill(choice.to)}>{choice.label}{choice.title&&choice.title!==choice.label&&<small>{choice.title}</small>}</button>
      {choice.hasChildren&&!cyclic&&<button className="map-expand" aria-label={(isOpen?'收起 ':'展开 ')+choice.label} aria-expanded={isOpen}
        onClick={()=>setExpanded(prev=>{const next=new Set(prev);if(next.has(unique))next.delete(unique);else next.add(unique);return next;})}>{isOpen?'−':'+'}</button>}
    </span>{isOpen&&<SceneMapChildren sceneId={choice.to} trail={[...trail,nodeKey]} control={control}/>}</li>;
  })}</ul>;
}

function MindMap({row,bookKey,showFolder,showScene,drill}:{row:Scene;bookKey?:string;
  showFolder(key:string):void;showScene(id:string):void;drill(id:string):void}){
  const {useQuery}=useNote<typeof import('./actions')>();
  const folder=useQuery('storyTreePage',{folderKey:bookKey||'[]',limit:1},{enabled:!!bookKey});
  const trail=bookKey?(folder.data?.ancestors??[]):row.ancestors??[];
  const heading=bookKey?(folder.data?.name??'章节'):row.title;
  const control:MapController={showFolder,drill};
  return <section className="story-map"><nav aria-label="层级">{trail.map(f=><button key={f.key} onClick={()=>showFolder(f.key)}>{f.name} ›</button>)}</nav>
    <div className="map-stage"><strong>{heading}</strong>
      {bookKey?<FolderMapChildren folderKey={bookKey} trail={['g:'+bookKey]} control={control}/>:
        <SceneMapChildren sceneId={row.id} choices={row.choices} trail={['s:'+row.id]} control={control}/>}
    </div>
    {!bookKey&&<button className="text-link" onClick={()=>showScene(row.id)}>阅读此场景 ↗</button>}
    {!bookKey&&!row.choices.length&&<p>本场景没有后续分支。</p>}
  </section>;
}

export default function Expanded(){
  const {metadata,useQuery,usePagedQuery,host}=useNote<typeof import('./actions')>(),setup=useMutation();
  const location=useLocation(),navigate=useNavigate(),incoming=useRecordLocation();
  const rootPath=noteHref(metadata.id),storageKey='worka-card-story:'+metadata.id;
  const params=new URLSearchParams(location.search),mode=params.get('view')==='map'?'map':'doc';
  const inboundPath=location.pathname.slice(rootPath.length).replace(/^\//,'');
  let routeId='';
  if(inboundPath.startsWith('scenes/')){try{routeId=decodeURIComponent(inboundPath.slice(7));}catch{}}
  const saved=remember(storageKey);
  const requestedId=routeId||saved||undefined;
  const active=useQuery('scene',{...(requestedId?{id:requestedId}:{})});
  const fallback=useQuery('scene',{}, {enabled:!routeId&&!!saved&&active.data?.configured===true&&!active.data.scene});
  const resolved=active.data?.scene?active.data:fallback.data??active.data;
  const row=resolved?.scene??null;
  const id=row?.id||routeId||'';

  const [query,setQuery]=useState('');
  const words=query.normalize('NFKC').trim();
  const searchPage=usePagedQuery('scenes',{query:words},{enabled:words.length>0});

  const [folds,setFolds]=useState<Map<string,boolean>>(()=>new Map());
  const expanded=new Set((row?.ancestors??[]).map(f=>f.key));
  expanded.add('[]');
  for(const [k,v] of folds)v?expanded.add(k):expanded.delete(k);

  const consumed=useRef('');
  const documentPath=params.get('file')||'';
  const bookKey=params.get('folder')||'';

  function open(target:string,view:'doc'|'map'=mode,folder?:string,file?:string,replace=false){
    const search=new URLSearchParams();
    if(view==='map')search.set('view','map');
    if(folder)search.set('folder',folder);
    if(file)search.set('file',file);
    navigate({pathname:noteHref(metadata.id,'/scenes/'+encodeURIComponent(target)),search:search.toString()},{replace});
  }
  useEffect(()=>{
    if(!incoming.recordId)return;
    const token=JSON.stringify([incoming.recordId,incoming.requestId]);
    if(consumed.current===token)return;
    consumed.current=token;open(incoming.recordId,'doc',undefined,undefined,true);
  },[incoming.recordId,incoming.requestId]);
  useEffect(()=>{if(row){remember(storageKey,row.id);setFolds(prev=>{
    const next=new Map(prev);for(const f of row.ancestors??[])next.delete(f.key);return next;
  });}},[row?.id]);

  function toggle(k:string){setFolds(prev=>new Map(prev).set(k,!expanded.has(k)));}
  const pane=useRef<HTMLElement>(null);
  useEffect(()=>{pane.current?.scrollTo(0,0);},[id,mode,documentPath,bookKey]);

  if(active.loading&&!resolved)return <section className="story-app"><p>读取中…</p></section>;
  if(resolved?.configured===false){
    return <section className="story-app"><div className="story-unbound"><p>连接 CardGame 仓库后即可实时阅读与编辑剧情。</p><button type="button" onClick={()=>void setup.run(()=>host.openSetup())}>连接游戏仓库</button>{setup.error&&<p role="alert">{setup.error.message}</p>}</div></section>;
  }
  if(!row){
    return <section className="story-app"><p>{routeId?'找不到这条剧情记录。':'当前仓库暂无剧情记录。'}</p>{routeId&&<button onClick={()=>navigate(rootPath)}>返回章节</button>}</section>;
  }
  return <div className="story-app">
    <div className="story-toolbar"><div className="story-tabs"><button aria-pressed={mode==='doc'} onClick={()=>open(id,'doc')}>章节文档</button><button aria-pressed={mode==='map'} onClick={()=>open(id,'map')}>脑图</button></div></div>
    <div className="story-layout"><aside aria-label="剧情目录"><input type="search" aria-label="搜索章节、场景或对白" placeholder="搜章节、场景或对白" value={query} onChange={e=>setQuery(e.target.value)}/>
      {words.length?<ul aria-label="搜索结果">{searchPage.items.map(r=><li key={r.id}><button onClick={()=>open(r.id)} aria-current={r.id===id?'page':undefined}>{r.title}<small>{r.folders.join(' › ')}</small></button></li>)}
        {!searchPage.loading&&!searchPage.items.length&&<li>没有匹配的剧情</li>}{searchPage.hasNext&&<li><button onClick={searchPage.next}>更多结果</button></li>}</ul>:
        <ChapterFolder folderKey="[]" current={id} expanded={expanded} toggle={toggle} open={target=>open(target)}/>}
    </aside>
      <main ref={pane}>{mode==='map'?<MindMap key={bookKey+id} row={row} bookKey={bookKey||undefined}
        showFolder={key=>open(id,'map',key==='[]'?undefined:key)} showScene={target=>open(target,'doc')} drill={target=>open(target,'map')}/>:
        <Reader key={documentPath||row.id} row={row} open={target=>open(target,'doc')}
          externalPath={documentPath||undefined} resolveLink={(href,from)=>{
            if(href.startsWith('#')){const slug=decodeURIComponent(href.slice(1));const headings=pane.current?.querySelectorAll('h1,h2,h3,h4');for(const h of headings??[]){if((h.textContent??'').trim().toLowerCase().replace(/\s+/g,'-')===slug){h.scrollIntoView();break;}}return;}
            const absolute=sourcePath(href,from);if(!absolute)return;
            const rel=absolute.slice(1);
            const linked=row.choices.find(c=>c.to===rel);
            if(linked)open(linked.to,'doc');else open(id,'doc',undefined,rel);
          }}/>}</main></div></div>;
}
