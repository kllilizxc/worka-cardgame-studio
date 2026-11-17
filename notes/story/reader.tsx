import {useState} from 'react';
import {useLinks,useMutation,useNote} from '@dsh-workbench/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {MarkdownPre} from './mermaid';
import type {LiveLink,Scene} from './model';

type StoryJson={nodes:{id:string;title?:string;body?:string;detail?:string;summary?:string;dialogues?:{speakerName?:string;text?:string}[]}[]};

function mergeLinks(live:readonly LiveLink[]=[],host:readonly {id:string;label:string;target:{noteId:string;recordId:string}}[]=[]):LiveLink[]{
  const byTarget=new Map<string,LiveLink>();
  for(const item of [...live,...host]){
    const key=item.target.noteId+'\0'+item.target.recordId;
    if(!byTarget.has(key))byTarget.set(key,{id:item.id,label:item.label,target:item.target});
  }
  return [...byTarget.values()];
}

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
  return <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{pre:MarkdownPre,
    a:({href,children})=>href&&/^(https?:\/\/|mailto:)/i.test(href)?<a href={href} target="_blank" rel="noreferrer">{children}</a>:
       <a href={href||'#'} onClick={e=>{e.preventDefault();if(href)onLink(href,'/'+path);}}>{children}</a>,
    img:({alt})=><span>{alt}</span>,
  }}>{text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'')}</Markdown>;
}
export function Reader({row,open,externalPath,resolveLink}:{row:Scene;open(id:string):void;
  externalPath?:string;resolveLink(path:string,source:string):void}){
  const {useQuery,navigation}=useNote<typeof import('./actions')>();
  const isJson=!externalPath&&!!row.nodeId&&row.path.endsWith('.json');
  const [pages,setPages]=useState(1);
  const targetPath=externalPath||row.path;
  const query=useQuery('document',{path:targetPath,maxLines:isJson?500:240,pages:isJson?100:pages});
  const links=useLinks(row.id),follow=useMutation(),doc=query.data;
  const related=mergeLinks(row.links,links.links);
  const text=doc?.content;
  const markdown=doc?['.md','.markdown','.mdown'].includes(doc.format):targetPath.endsWith('.md');
  return <article className="story-prose">
    {text!==undefined?(isJson?<GameScene text={text} row={row} open={open}/>:<Article text={text} path={doc?.displayPath??targetPath} markdown={markdown} onLink={resolveLink}/>):
      <p>{query.error?'无法读取原文：'+query.error.message:'正在读取原文…'}</p>}
    {!isJson&&doc&&doc.endLine<doc.totalLines&&pages<100&&<button onClick={()=>setPages(p=>p+1)}>继续阅读</button>}
    {!externalPath&&!isJson&&!markdown&&row.choices.length>0&&<ul>{row.choices.map(choice=>
      <li key={choice.to}><button onClick={()=>open(choice.to)}>{choice.label} →</button></li>)}</ul>}
    {!externalPath&&!!related.length&&<nav aria-label="关联记录">{related.map(link=><button key={link.id} onClick={()=>void follow.run(()=>navigation.open(link.target))}>{link.label} ↗</button>)}</nav>}
    {follow.error&&<p role="alert">{follow.error.message}</p>}
  </article>;
}
