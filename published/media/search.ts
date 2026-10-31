import type {RecordRow} from './model';
export type Criteria={q?:string;facetQuery?:string;filters?:Record<string,string[]>;page?:number;sort?:'default'|'name';size?:number};
const normalized=(text:string)=>text.normalize('NFKC').toLocaleLowerCase().trim();
const compare=(a:string,b:string)=>a.localeCompare(b,'zh-CN',{numeric:true});
export function search(rows:RecordRow[],criteria:Criteria){
  const q=normalized(criteria.q||''), words=q.split(/\s+/).filter(Boolean),filters=criteria.filters||{};
  const found:{row:RecordRow;rank:number}[]=[], counts=new Map<string,Map<string,number>>();
  const dimensions=new Set<string>();
  for(const row of rows){
    for(const field of Object.keys(row.facets))dimensions.add(field);
    const text=normalized([row.title,row.id,row.source,row.body,...Object.values(row.facets).flat(),...row.fields.map(f=>f.value),...row.sections.flatMap(s=>s.lines)].join(' '));
    if(!words.every(w=>text.includes(w)))continue;
    const missing=Object.keys(filters).filter(k=>filters[k]?.length&&!filters[k]!.some(v=>row.facets[k]?.includes(v)));
    if(missing.length>1)continue;
    for(const [k,opts] of Object.entries(row.facets)){
      if(missing.length&&missing[0]!==k)continue;
      if(!counts.has(k))counts.set(k,new Map());
      const group=counts.get(k)!;
      for(const value of opts)group.set(value,(group.get(value)||0)+1);
    }
    if(!missing.length){
      const name=normalized(row.title),id=normalized(row.id);
      found.push({row,rank:q&&(name===q||id===q)?3:q&&name.includes(q)?2:q&&id.includes(q)?1:0});
    }
  }
  if(criteria.sort==='name')found.sort((a,b)=>compare(a.row.title,b.row.title));
  else if(q)found.sort((a,b)=>b.rank-a.rank);
  const size=Math.max(1,Math.min(48,criteria.size||24)),pages=Math.max(1,Math.ceil(found.length/size)),page=Math.max(1,Math.min(pages,criteria.page||1));
  const facetNeedle=normalized(criteria.facetQuery||'');
  const facets=[...dimensions].map(key=>{
    const choices=[...new Set([...(filters[key]||[]),...(counts.get(key)?.keys()||[])])].filter(v=>normalized(v).includes(facetNeedle));
    const options=choices.map(value=>({value,count:counts.get(key)?.get(value)||0})).sort((a,b)=>b.count-a.count||compare(a.value,b.value));
    return {key,options:options.slice(0,30),hasMore:options.length>30};
  });
  const items=found.slice((page-1)*size,page*size).map(({row})=>({id:row.id,title:row.title,group:row.group,body:row.body.slice(0,150),mediaKey:row.mediaKey||null,thumbnail:row.thumbnail||null,summary:row.fields.slice(0,2).filter(f=>f.name!=='文件').map(f=>f.name+' '+f.value).join(' · ')}));
  return {total:rows.length,count:found.length,page,pages,items,facets};
}
