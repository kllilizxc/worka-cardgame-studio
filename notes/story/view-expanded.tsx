import {useEffect,useMemo,useRef,useState} from 'react';
import {useLinks,useMutation,useLocation as useRecordLocation,useNote} from '@dsh-workbench/react';
import {noteHref} from '@dsh-workbench/runtime';
import {useLocation,useNavigate} from 'react-router';
import {ancestors,storyTree,type Branch} from './story-tree';
import {Reader} from './reader';
import type {Scene} from './model';
import './story.css';

const PAGE=40;
function remember(key:string,value?:string){
  try{if(value)sessionStorage.setItem(key,value);return sessionStorage.getItem(key)??'';}catch{return '';}
}
function sourcePath(href:string,from:string){
  if(/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith('//'))return '';
  try{return decodeURIComponent(new URL(href,'https://project.invalid'+from).pathname);}catch{return '';}
}
function Chapter({branch,current,expanded,toggle,open}:{branch:Branch;current:string;expanded:Set<string>;
  toggle(key:string):void;open(id:string):void}){
  const [limit,setLimit]=useState(PAGE), contents=[...branch.folders.values(),...branch.scenes];
  return <ul>{contents.slice(0,limit).map(child=>'key' in child?<li key={child.key}>
    <button className="folder" aria-expanded={expanded.has(child.key)} onClick={()=>toggle(child.key)}>
      <span aria-hidden="true">{expanded.has(child.key)?'⌄':'›'}</span> {child.name}</button>
    {expanded.has(child.key)&&<Chapter branch={child} current={current} expanded={expanded} toggle={toggle} open={open}/>}
    </li>:<li key={child.id}><button aria-current={current===child.id?'page':undefined} onClick={()=>open(child.id)}>{child.title}</button></li>)}
    {contents.length>limit&&<li><button onClick={()=>setLimit(n=>n+PAGE)}>更多（{contents.length-limit}）</button></li>}</ul>;
}
type MapNode={label:string;folder?:Branch;scene?:Scene};
type MapController={target(id:string):Scene|undefined;showFolder(node:Branch):void;drill(id:string):void};
function nextNodes(folder:Branch|undefined,scene:Scene|undefined,target:MapController['target']):MapNode[]{
  if(folder)return [...Array.from(folder.folders.values(),f=>({label:f.name,folder:f})),...folder.scenes.map(s=>({label:s.title,scene:s}))];
  return (scene?.choices??[]).map(c=>({label:c.label,scene:target(c.to)}));
}
function MapBranches({items,trail,control}:{items:MapNode[];trail:string[];control:MapController}){
  const [limit,setLimit]=useState(PAGE),[expanded,setExpanded]=useState<Set<string>>(()=>new Set());
  if(!items.length)return null;
  return <ul>{items.slice(0,limit).map((item,index)=>{
    const key=item.folder?'g:'+item.folder.key:'s:'+item.scene?.id,unique=index+':'+key;
    const hasChildren=item.folder?item.folder.scenes.length||item.folder.folders.size:item.scene?.choices.length;
    const cyclic=trail.includes(key);
    const isOpen=expanded.has(unique)&&!cyclic;
    return <li key={unique}><span className="map-node">
      <button disabled={!item.folder&&!item.scene} onClick={()=>item.folder?control.showFolder(item.folder):item.scene&&control.drill(item.scene.id)}>
        {item.label}{item.scene?.title!==item.label&&<small>{item.scene?.title}</small>}</button>
      {!!hasChildren&&!cyclic&&<button className="map-expand" aria-label={(isOpen?'收起 ':'展开 ')+item.label} aria-expanded={isOpen}
        onClick={()=>setExpanded(prev=>{const next=new Set(prev);if(next.has(unique))next.delete(unique);else next.add(unique);return next;})}>{isOpen?'−':'+'}</button>}
    </span>{isOpen&&<MapBranches items={nextNodes(item.folder,item.scene,control.target)} trail={[...trail,key]} control={control}/>}</li>;
  })}{items.length>limit&&<li><button onClick={()=>setLimit(n=>n+PAGE)}>更多</button></li>}</ul>;
}
function MindMap({row,book,root,parent,showFolder,showScene,drill,target}:{row:Scene;book?:Branch;root:Branch;parent?:Branch;
  showFolder(node:Branch):void;showScene(id:string):void;drill(id:string):void;target(id:string):Scene|undefined}){
  const items=nextNodes(book,row,target),trail=ancestors(book??parent);
  return <section className="story-map"><nav aria-label="层级">{trail.map(f=><button key={f.key} onClick={()=>showFolder(f)}>{f===root?'全书':f.name} ›</button>)}</nav>
    <div className="map-stage"><strong>{book?.name??row.title}</strong><MapBranches items={items} trail={[book?'g:'+book.key:'s:'+row.id]} control={{target,showFolder,drill}}/></div>
    {!book&&<button className="text-link" onClick={()=>showScene(row.id)}>阅读此场景 ↗</button>}
    {!book&&!items.length&&<p>本场景没有后续分支。</p>}
  </section>;
}
function ScenePlay({id}:{id:string}){
  const {navigation}=useNote<typeof import('./actions')>();
  const links=useLinks(id),follow=useMutation();
  const play=links.links.find(link=>link.target.recordId.startsWith('play:'));
  if(!play)return null;
  return <><button className="story-play" onClick={()=>void follow.run(()=>navigation.open(play.target))}>试玩此场景 ↗</button>{follow.error&&<small role="alert">{follow.error.message}</small>}</>;
}

export default function Expanded(){
  const {config:packaged,metadata,useQuery}=useNote<typeof import('./actions')>();
  const currentProject=useQuery('projectIndex',{}), config=currentProject.data??packaged;
  const location=useLocation(),navigate=useNavigate(),incoming=useRecordLocation();
  const rootPath=noteHref(metadata.id), key='worka-card-story:'+metadata.id;
  const params=new URLSearchParams(location.search), mode=params.get('view')==='map'?'map':'doc';
  const rows=config.storyIndex??[], indexed=useMemo(()=>new Map(rows.map(row=>[row.id,row])),[rows]);
  const tree=useMemo(()=>storyTree(rows),[rows]);
  const inboundPath=location.pathname.slice(rootPath.length).replace(/^\//,'');
  let routeId='';
  if(inboundPath.startsWith('scenes/')){try{routeId=decodeURIComponent(inboundPath.slice(7));}catch{}}
  const saved=remember(key);
  const id=routeId||(indexed.has(saved)?saved:config.initialScene)||rows[0]?.id||'';
  const row=indexed.get(id), [query,setQuery]=useState(''),[hits,setHits]=useState(PAGE);
  const [folds,setFolds]=useState<Map<string,boolean>>(()=>new Map());
  const path=ancestors(tree.parents.get(id)),expanded=new Set(path.map(f=>f.key));
  for(const [k,v] of folds)v?expanded.add(k):expanded.delete(k);
  const consumed=useRef('');
  const root=config.resources?.[0];
  const resourcePath=root?.path??'';
  const documentPath=params.get('file')||'';
  const bookKey=params.get('folder')||'';
  const book=tree.branches.get(bookKey);
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
  useEffect(()=>{if(row){remember(key,row.id);setFolds(prev=>{
    const next=new Map(prev);for(const f of ancestors(tree.parents.get(row.id)))next.delete(f.key);return next;
  });}},[id,tree]);
  const words=query.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches=useMemo(()=>words.length?rows.filter(r=>{
    const searchable=[r.id,r.title,...r.folders,r.search].join(' ').normalize('NFKC').toLowerCase();
    return words.every(w=>searchable.includes(w));
  }):[],[rows,query]);
  function toggle(k:string){setFolds(prev=>new Map(prev).set(k,!expanded.has(k)));}
  const targetByPath=useMemo(()=>new Map(rows.filter(row=>row.path.endsWith('.md')).map(row=>[row.path,row.id])),[rows]);
  const pane=useRef<HTMLElement>(null);
  useEffect(()=>{pane.current?.scrollTo(0,0);},[id,mode,documentPath,bookKey]);
  if(!row){
    return <section className="story-app"><p>{routeId?'找不到这条剧情记录。':'连接 CardGame 项目后即可阅读剧情。'}</p>{routeId&&<button onClick={()=>navigate(rootPath)}>返回章节</button>}</section>;
  }
  return <div className="story-app">
    <div className="story-toolbar"><div className="story-tabs"><button aria-pressed={mode==='doc'} onClick={()=>open(id,'doc')}>章节文档</button><button aria-pressed={mode==='map'} onClick={()=>open(id,'map')}>脑图</button></div>{row.nodeId&&!documentPath&&<ScenePlay id={id}/>}</div>
    <div className="story-layout"><aside aria-label="剧情目录"><input type="search" aria-label="搜索章节、场景或对白" placeholder="搜章节、场景或对白" value={query} onChange={e=>{setQuery(e.target.value);setHits(PAGE);}}/>
      {words.length?<ul aria-label="搜索结果">{matches.slice(0,hits).map(r=><li key={r.id}><button onClick={()=>open(r.id)} aria-current={r.id===id?'page':undefined}>{r.title}<small>{r.folders.join(' › ')}</small></button></li>)}
        {!matches.length&&<li>没有匹配的剧情</li>}{matches.length>hits&&<li><button onClick={()=>setHits(n=>n+PAGE)}>更多结果</button></li>}</ul>:
        <Chapter branch={tree.root} current={id} expanded={expanded} toggle={toggle} open={target=>open(target)}/>}</aside>
      <main ref={pane}>{mode==='map'?<MindMap key={bookKey+id} row={row} book={book} root={tree.root} parent={tree.parents.get(id)}
        showFolder={f=>open(id,'map',f.key)} showScene={target=>open(target,'doc')} drill={target=>open(target,'map')} target={target=>indexed.get(target)}/>:
        <Reader key={documentPath||row.id} row={row} open={target=>open(target,'doc')} resourcePath={resourcePath}
          external={documentPath?{resourcePath,path:documentPath}:undefined} resolveLink={(href,from)=>{
            if(href.startsWith('#')){const slug=decodeURIComponent(href.slice(1));const headings=pane.current?.querySelectorAll('h1,h2,h3,h4');for(const h of headings??[]){if((h.textContent??'').trim().toLowerCase().replace(/\s+/g,'-')===slug){h.scrollIntoView();break;}}return;}
            const absolute=sourcePath(href,from);if(!absolute)return;
            const relative=absolute.slice(1), target=targetByPath.get(relative);
            if(target)open(target,'doc');else open(id,'doc',undefined,relative);
          }}/>}</main></div></div>;
}
