import {z} from '@dsh-workbench/runtime';
import {note,row,fields} from './model';
export {note} from './model';

const idSchema=z.string().regex(/^[\w.-]{1,128}$/);
const recordSchema=row.extend({id:idSchema});

export const idea=note.query({visibility:'public',description:'读取点子的原话、标题、分类与标签。',input:z.object({id:idSchema}),output:recordSchema.nullable(),objectRef:'/id'},
  (ctx,{id})=>ctx.db.get('ideas',id));

export const cover=note.query({visibility:'private',input:z.object({}),output:z.object({title:z.string(),countLabel:z.string(),items:z.array(z.object({id:z.string(),title:z.string(),category:z.string()}))})},
  async ctx=>{
    const page=await ctx.db.page('ideas',{orderBy:{updatedAt:'desc'},select:['title','category']});
    return {items:page.items.slice(0,4).map(({id,title,category})=>({id,title,category})),title:page.items[0]?.title||'',countLabel:String(page.items.length)+(page.next?'+':'')};
  });

const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase();
export const findIdeas=note.query({visibility:'public',description:'搜索标题、原话、分类和标签；空搜索按最近修改分页浏览。保留 next 即仍有后页。',
  input:z.object({text:z.string().optional(),category:z.string().optional(),cursor:z.string().optional()}),output:note.collections.ideas.pageSchema()},
  async(ctx,input)=>{
    const words=normalize(input.text||'').trim().split(/\s+/).filter(Boolean);
    let cursor=input.cursor;
    for(;;){
      const page=await ctx.db.page('ideas',{where:input.category?{category:input.category}:{},orderBy:{updatedAt:'desc'},cursor});
      const items=words.length?page.items.filter(r=>{const haystack=normalize([r.title,r.text,r.category,...r.tags].join(' '));return words.every(word=>haystack.includes(word));}):page.items;
      if(items.length||!page.next)return {...page,items};
      cursor=page.next;
    }
  });

export const remember=note.mutation({visibility:'public',description:'按稳定 ID 保存一条点子原话。更新已有记录时传 expectedRevision。',
  input:z.object({id:idSchema,...fields,expectedRevision:z.number().int().nonnegative().optional()}),output:recordSchema,objectRef:'/id'},
  async(ctx,input)=>{
    const {id,expectedRevision,...values}=input;
    const previous=await ctx.db.get('ideas',id);
    if(previous&&previous.title===values.title&&previous.text===values.text&&previous.category===values.category&&JSON.stringify(previous.tags)===JSON.stringify(values.tags))return previous;
    if((previous?.revision??0)!==(expectedRevision??0))throw Error('这条点子已有更新，请重新读取。');
    const next={...values,revision:(previous?.revision??0)+1,updatedAt:Date.now()};
    await ctx.db.put('ideas',id,next);
    return {id,...next};
  });
