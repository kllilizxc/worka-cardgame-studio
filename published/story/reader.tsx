import {useEffect,useRef,useState} from 'react';
import {useLinks,useMutation,useNote} from '@dsh-workbench/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {MarkdownPre} from './mermaid';
import type {Scene} from './model';

type Target={resourcePath:string;path:string;from?:string};
type StoryJson={nodes:{id:string;title?:string;body?:string;detail?:string;summary?:string;dialogues?:{speakerName?:string;text?:string}[]}[]};

function GameScene({text,row,open}:{text:string;row:Scene;open(id:string):void}){
  let graph:StoryJson;
  try{graph=JSON.parse(text);}catch{return <p role="alert">场景文件尚未完整载入，或不是有效的 JSON。</p>;}
  const scene=graph.nodes?.find(node=>node.id===row.nodeId);
  if(!scene)return <p role="alert">这个场景已从原文件移除。</p>;
  return <><h1>{scene.title||row.title}</h1><p>{scene.body||scene.detail||scene.summary}</p>
    {scene.dialogues?.map((line,i)=><blockquote key={i}>{line.speakerName&&<strong>{line.speakerName}　</strong>}{line.text}</blockquote>)}
    {!!row.choices.length&&<ul>{row.choices.map((c,i)=><li key={i}><button onClick={()=>open(c.to)}>{c.label} →</button></li>)}</ul>}</>;
}
function Article({text,path,markdown,onLink}:{text:string;path:string;markdown:boolean;onLink(href:string,from:string):void}){
  if(!markdown)return <pre>{text}</pre>;
  return <Markdown remarkPlugins={[remarkGfm]} components={{pre:MarkdownPre,
    a:({href,children})=>href&&/^(https?:\/\/|mailto:)/i.test(href)?<a href={href} target="_blank" rel="noreferrer">{children}</a>:
       <a href={href||'#'} onClick={e=>{e.preventDefault();if(href)onLink(href,'/'+path);}}>{children}</a>,
    img:({alt})=><span>{alt}</span>,
  }}>{text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'')}</Markdown>;
}
export function Reader({row,open,resourcePath,external,resolveLink}:{row:Scene;open(id:string):void;resourcePath:string;
  external?:Target;resolveLink(path:string,source:string):void}){
  const {useQuery,actions,navigation}=useNote<typeof import('./actions')>();
  const isJson=!external&&!!row.nodeId&&row.path.endsWith('.json');
  const [pages,setPages]=useState(1);
  const target=external??{resourcePath,path:row.path};
  const input={...target,maxLines:isJson?500:240,pages:isJson?100:pages};
  const query=useQuery('document',input,{enabled:!!resourcePath});
  const load=useMutation(actions.refreshDocument,{query,key:(args)=>JSON.stringify([args.resourcePath,args.path,args.from])});
  const attempted=useRef(false);
  useEffect(()=>{
    if(resourcePath&&!query.loading&&!query.data&&!attempted.current){attempted.current=true;void load.mutate(input);}
  },[query.loading,query.data,load.mutate,input.resourcePath,input.from,input.path]);
  const links=useLinks(row.id), follow=useMutation(), doc=resourcePath?query.data:undefined;
  const related=links.links.filter(link=>!link.target.recordId.startsWith('play:'));
  const imported=!external&&row.body?row.body:undefined;
  const text=doc?.content??imported;
  const markdown=doc?['.md','.markdown'].includes(doc.format):row.path.endsWith('.md');
  const error=resourcePath&&(load.error||query.error);
  return <article className="story-prose">
    {text!==undefined?(isJson?<GameScene text={text} row={row} open={open}/>:<Article text={text} path={doc?.displayPath??row.path} markdown={markdown} onLink={resolveLink}/>):
      <p>{!resourcePath?'连接项目后可读取这份外部资料。':error?'无法读取原文。':'正在读取原文…'}</p>}
    {!isJson&&doc&&doc.endLine<doc.totalLines&&pages<100&&<button onClick={()=>setPages(p=>p+1)}>继续阅读</button>}
    {!external&&!isJson&&!markdown&&row.choices.length>0&&<ul>{row.choices.map(choice=>
      <li key={choice.to}><button onClick={()=>open(choice.to)}>{choice.label} →</button></li>)}</ul>}
    {!doc&&imported!==undefined&&<small>{resourcePath?(error?'原文暂不可用 · 显示导入快照':'正在连接原文 · 显示导入快照'):'导入快照'}</small>}
    {!!error&&<button onClick={()=>void load.mutate(input)}>重新读取</button>}
    {!external&&!!related.length&&<nav aria-label="关联记录">{related.map(link=><button key={link.id} onClick={()=>void follow.run(()=>navigation.open(link.target))}>{link.label} ↗</button>)}</nav>}
    {follow.error&&<p role="alert">{follow.error.message}</p>}
  </article>;
}
