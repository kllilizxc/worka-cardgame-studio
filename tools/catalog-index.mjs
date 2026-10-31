// Translate CardGame's authoring files into read-only Worka records. Game files remain authoritative.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const kinds = ['map','encounter','cards','monsters','people','shop','media'];
const cardKinds={unit:'单位牌',artifact:'法器',talisman:'符箓',pill:'丹药',field:'场地',skill:'技能'};
const rarities={common:'普通',uncommon:'优秀',rare:'稀有',epic:'史诗',legendary:'传说'};
const nodeKinds={battle:'战斗',boss:'首领',event:'事件',shop:'商店',extract:'撤离',entrance:'入口',rest:'休整'};
const image=/\.(?:png|jpe?g|webp|gif|avif|svg|bmp)$/i;
const audio=/\.(?:mp3|aac|oga|ogg|wav|m4a|flac|opus)$/i;
const values=v=>Array.isArray(v)?v:v==null?[]:[v];
const words=v=>values(v).map(x=>typeof x==='string'?x:typeof x==='number'?String(x):JSON.stringify(x)).filter(Boolean);
const labels=obj=>Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,[...new Set(words(v))]]).filter(([,v])=>v.length));
const fields=obj=>Object.entries(obj).filter(([,v])=>v!==null&&v!==undefined&&v!=='').map(([name,v])=>({name,value:words(v).join(' · ')}));
const section=(title,lines)=>({title,lines:words(lines)});
const ref=(note,id)=>({note,id});
function walk(root,dir) {
  if(!existsSync(join(root,dir)))return [];
  return readdirSync(join(root,dir),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(e=>{
    const path=dir+'/'+e.name;
    return e.isDirectory()?walk(root,path):e.isFile()?[path]:[];
  });
}
const parse=(root,file)=>JSON.parse(readFileSync(join(root,file),'utf8'));
function git(root,...args){try{return execFileSync('git',['-c','core.fsmonitor=false','-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64*1024*1024}).trimEnd();}catch{return '';}}
const mark=(...parts)=>'/'+parts.map(x=>String(x).replace(/~/g,'~0').replace(/\//g,'~1')).join('/');
const encodePath=p=>p.split('/').map(encodeURIComponent).join('/');
function visitStrings(value,visit) {
  if(typeof value==='string')visit(value);
  else if(Array.isArray(value))value.forEach(v=>visitStrings(v,visit));
  else if(value&&typeof value==='object')Object.values(value).forEach(v=>visitStrings(v,visit));
}
function assetType(path,meta) {
  const music=/music|bgm|soundtrack|配乐|音乐/i, voice=/voice|dialogue|对白|配音/i;
  if(audio.test(path))return music.test(path+' '+meta)?'音乐':voice.test(path+' '+meta)?'配音':'音效';
  if(/card-face|card.art|卡面/i.test(path+' '+meta))return '卡面';
  if(/portrait|character[-_ /]|人设|立绘|disciple-reference/i.test(path+' '+meta))return '人设';
  if(/background|backdrop|场景|背景|exterior|interior|clearing|\/bg[._/]/i.test(path+' '+meta))return '背景';
  return '素材图';
}
export function buildCatalog(root){
  const rows=Object.fromEntries(kinds.map(k=>[k,new Map()]));
  const head=git(root,'rev-parse','HEAD');
  const remote=git(root,'config','--get','remote.origin.url').match(/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i);
  const tracked=new Map(git(root,'ls-tree','-rz','HEAD','--','public','art-references').split('\0').flatMap(line=>{
    const match=/^100\d+ blob ([a-f0-9]+)\t([\s\S]+)$/.exec(line);return match?[[match[2],match[1]]]:[];
  }));
  const base=remote&&head?'https://raw.githubusercontent.com/'+remote[1]+'/'+remote[2]+'/'+head+'/':'';
  function add(note,id,title,group,source,body=''){
    if(typeof id!=='string'||!id.length)throw new Error('Missing record ID: '+source);
    if(rows[note].has(id))throw new Error('Duplicate '+note+' ID '+id+' in '+source);
    const record={id,title:String(title||id),group,source,body:String(body||''),facets:{},fields:[],sections:[],refs:[]};
    rows[note].set(id,record);return record;
  }
  const data=walk(root,'public/data').filter(f=>f.endsWith('.json'));
  if(!data.includes('public/data/cards/units.json'))throw new Error('CardGame 项目缺少 public/data/cards/units.json');
  const jsons=new Map(data.map(f=>[f,parse(root,f)]));
  const dataFiles=dir=>[...jsons].filter(([f])=>f.startsWith('public/data/'+dir+'/'));
  const manifest=existsSync(join(root,'public/assets/asset-manifest.json'))?parse(root,'public/assets/asset-manifest.json'):{};
  const assetMeta=new Map((manifest.assets||[]).map(a=>[a.path,a]));
  const assetByPath=new Map(), titlesByUse=new Map();
  // References include in-game assets and art direction files kept outside the runtime.
  for(const f of [...walk(root,'public'),...walk(root,'art-references')].filter(f=>image.test(f)||audio.test(f))){
    const a=assetMeta.get(f), usage=assetType(f,JSON.stringify(a?.metadata||{})), id=a?.id||'asset:'+f;
    const row=add('media',id,a?.metadata?.name||a?.metadata?.title||basename(f),usage,f);
    const bytes=readFileSync(join(root,f)),digest=createHash('sha256').update(bytes).digest('hex').slice(0,16);
    row.mediaKey=f+'?v='+digest;
    row.facets=labels({'媒介':audio.test(f)?'声音':'图像','用途':usage,'格式':extname(f).slice(1).toUpperCase(),'目录':f.split('/').slice(0,3).join('/'),'标签':a?.tags});
    row.fields=fields({'文件':f,'大小':statSync(join(root,f)).size+' B','当前版本':a?.currentVersionId});
    const oid=tracked.get(f);
    if(base&&oid&&createHash(oid.length===64?'sha256':'sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')===oid)row.mediaUrl=base+encodePath(f);
    row.sections=[section('版本',(a?.versions||[]).map(v=>v.path+' · '+v.revision.slice(0,12)))];
    assetByPath.set(f,row);
  }
  function assetAt(path){
    if(typeof path!=='string')return undefined;
    const local=path.replace(/^\//,'');
    return assetByPath.get(local)||assetByPath.get('public/'+local);
  }
  function titleForUse(path,owner,role){
    const asset=assetAt(path);
    if(!asset||!owner)return;
    const metadata=assetMeta.get(asset.source)?.metadata;
    if(metadata?.name||metadata?.title)return;
    if(!titlesByUse.has(asset))titlesByUse.set(asset,new Set());
    titlesByUse.get(asset).add(owner+' · '+role);
  }
  function mediaRefs(r,v){
    visitStrings(v,s=>{
      const asset=assetAt(s);
      if(asset){r.refs.push(ref('media',asset.id));if(!r.mediaKey&&image.test(asset.source)){r.mediaKey=asset.mediaKey;if(asset.mediaUrl)r.thumbnail=asset.mediaUrl;}}
    });
  }
  const unitCards=new Map();
  for(const [file,doc] of dataFiles('cards')){
    for(const [group,entries] of Object.entries(doc))if(Array.isArray(entries))entries.forEach((c,i)=>{
      const src=file+'#'+mark(group,i),kind=cardKinds[c.kind]||group,rarity=rarities[c.rarity]||c.rarity;
      const r=add('cards',c.id,c.name,kind,src,c.description);
      r.facets=labels({'类型':kind,'稀有度':rarity,'阵营':c.factionId,'标签':c.labels});
      r.fields=fields({'费用':c.cost,'攻击':c.attack,'气血':c.health,'装备攻击加成':c.attackBonus,'携带上限':c.limitPerDeck,'境界':c.realmId,'种族':c.race,'品阶':c.gradeId||c.grade,'灵根':c.linggen,'冷却':c.cooldownType});
      r.sections=[section('牌效',(c.effects||[]).map(e=>e.text||JSON.stringify(e)))];
      mediaRefs(r,c.cardFace||c);
      if(c.cardFace){
        titleForUse(c.cardFace.artwork,c.name,'原画');
        for(const [kind,label] of [['jade','玉牌'],['scroll','卷轴']]){
          const variant=c.cardFace.variants?.[kind];
          titleForUse(variant?.preview,c.name,label+'预览');
          titleForUse(variant?.texture,c.name,label+'实装');
        }
      }
      if(c.kind==='unit')unitCards.set(c.id,{c,r});
    });
  }
  for(const [file,d] of dataFiles('decks')){
    if(!Array.isArray(d.cards))continue;
    const id='deck:'+basename(file,'.json'),r=add('cards',id,d.name,'牌组',file,d.description);
    r.facets=labels({'类型':'牌组'});r.fields=fields({'总张数':d.cards.reduce((n,c)=>n+(c.count??1),0)});
    r.sections=[section('组成',d.cards.map(c=>(rows.cards.get(c.id)?.title||c.id)+' × '+(c.count??1)))];
    r.refs=d.cards.map(c=>ref('cards',c.id));
  }
  for(const [f,e] of dataFiles('encounters')){
    const enemies=e.enemies||e.units||[];
    const r=add('encounter',e.id,e.name,'战斗',f,e.description);
    r.facets=labels({'难度':e.difficulty,'敌人':enemies.map(u=>unitCards.get(u.cardId)?.c.name||u.cardId),'特殊事件':(e.events||[]).map(v=>v.name||v.type||v.id)});
    r.fields=fields({'难度':e.difficulty,'出场单位':enemies.length});
    r.sections=[section('敌方阵位',enemies.map(u=>{
      const def=unitCards.get(u.cardId)?.c??{};
      if(!rows.monsters.has(u.cardId)&&unitCards.has(u.cardId)){
        const card=unitCards.get(u.cardId), m=add('monsters',u.cardId,def.name,'敌方单位',card.r.source,def.description);
        m.facets=labels({'种族':def.race,'阵营':def.factionId,'稀有度':rarities[def.rarity]||def.rarity});
        m.fields=card.r.fields;m.sections=card.r.sections;m.thumbnail=card.r.thumbnail;m.mediaKey=card.r.mediaKey;m.refs.push(ref('cards',u.cardId));
      }
      r.refs.push(ref('monsters',u.cardId));
      return '位置 '+u.position+' · '+(def.name||u.cardId)+' · 攻 '+(u.attack??def.attack??'—')+' / 血 '+(u.health??def.health??'—');
    })),section('波次',e.waves),section('特殊事件',e.events)];
  }
  const stock=jsons.get('public/data/world/items.artifacts.json')||{};
  for(const [k,list] of Object.entries(stock))if(Array.isArray(list))list.forEach((o,i)=>{
    const f='public/data/world/items.artifacts.json',r=add('shop',o.id,o.name,'物品',f+'#'+mark(k,i),o.description);
    r.facets=labels({'类型':'物品','用途':o.type,'品阶':o.grade});r.fields=fields({'品阶':o.grade,'用途':o.type,'阵营':o.factionId,'可丢弃':o.droppable});
    mediaRefs(r,o);
    titleForUse(o.iconAsset,o.name,'图标');
  });
  const people=jsons.get('public/data/world/npcs.json')?.npcs||[];
  people.forEach((o,i)=>{
    const r=add('people',o.id,o.name,'人物','public/data/world/npcs.json#'+mark('npcs',i),o.description);
    r.facets=labels({'阵营':o.factionId,'身份':o.roles,'标签':o.tags,'境界':o.realm});
    r.fields=fields({'身份':o.roles,'境界':o.realm,'性别':o.gender,'阵营':o.factionId,'目标':o.goal,...o.abilities});
    mediaRefs(r,o);
    titleForUse(o.portraitAsset,o.name,'立绘');
  });
  // A shared image need not have a canonical owner. Keep the filename when uses disagree.
  for(const [asset,titles] of titlesByUse)if(titles.size===1)asset.title=[...titles][0];
  const shopSources=new Map(),mapEvents=new Map();
  for(const [f,d] of dataFiles('mijing')){
    for(const [node,o] of Object.entries(d.shopsByNodeId||{})){
      const sid='shop:'+d.id+':'+node,source=f+'#'+mark('shopsByNodeId',node);
      const s=add('shop',sid,o.title,'商店',source,o.description);
      s.facets=labels({'类型':'商店'});s.fields=fields({'货架数':o.offers?.length||0});
      shopSources.set(f+'#'+node,sid);
      (o.offers||[]).forEach((offer,i)=>{
        const id=sid+':'+offer.id,cost=offer.cost?.spiritStones;
        const r=add('shop',id,offer.label,'货架',source+mark('offers',i),offer.description);
        r.facets=labels({'类型':'货架','商店':o.title,'价格':cost});r.fields=fields({'灵石售价':cost,'库存':offer.stock,'商人':o.title});
        for(const c of offer.rewards?.cards||[])r.refs.push(ref('cards',c.id));
        for(const c of offer.rewards?.items||[])r.refs.push(ref('shop',c.id));
        r.sections=[section('购得物品',[...(offer.rewards?.cards||[]),...(offer.rewards?.items||[])].map(v=>(rows.cards.get(v.id)?.title||rows.shop.get(v.id)?.title||v.id)+' × '+(v.count??1)))];
        s.refs.push(ref('shop',id));
      });
    }
    for(const [node,event] of Object.entries(d.eventsByNodeId||{}))mapEvents.set(f+'#'+node,event);
  }
  for(const [f,m] of dataFiles('mijing'))if(Array.isArray(m.nodes)){
    const project=add('map',m.id,m.name,'秘境',f,m.description);
    project.facets=labels({'类型':'秘境','地图':m.name});project.fields=fields({'房间数':m.nodes.length,'起点':m.entryNodeId});
    project.diagram=m.nodes.map(n=>({id:m.id+'::'+n.id,label:n.label||n.id,layer:n.layer??0,kind:nodeKinds[n.type]||n.type,to:(n.outgoingNodeIds||[]).map(id=>m.id+'::'+id)}));
    m.nodes.forEach((n,i)=>{
      const id=m.id+'::'+n.id,kind=nodeKinds[n.type]||n.type,p=n.payloadRef||{};
      const r=add('map',id,n.label||n.id,kind,f+'#'+mark('nodes',i),n.description);
      r.facets=labels({'类型':kind,'地图':m.name,'层级':n.layer});r.fields=fields({'类型':kind,'层级':n.layer,'地图':m.name});
      r.refs=(n.outgoingNodeIds||[]).map(id=>ref('map',m.id+'::'+id));project.refs.push(ref('map',id));
      if(p.kind==='encounter')r.refs.push(ref('encounter',p.encounterResourceId||p.ref));
      const key='public/'+String(p.contentFile||'').replace(/^\/?(?:public\/)?/,'')+'#'+p.ref;
      if(shopSources.has(key))r.refs.push(ref('shop',shopSources.get(key)));
      const ev=mapEvents.get(key);
      if(ev){r.body=ev.description||r.body;r.sections.push(section('事件结果',(ev.pool||[]).map(v=>v.label+' · '+(v.description||'')+'（权重 '+(v.weight??1)+'）')));}
    });
  }
  const hash=createHash('sha256');
  for(const [kind,dict] of Object.entries(rows))for(const row of dict.values()){
    // A target must exist in this exact checkout; discarded references never become broken host links.
    const seen=new Set();row.refs=row.refs.filter(t=>{const key=t.note+'\0'+t.id;if(!rows[t.note]?.has(t.id)||seen.has(key))return false;seen.add(key);return true;});
    row.sections=row.sections.filter(s=>s.lines.length);
    if(!row.thumbnail)delete row.thumbnail;
    hash.update(kind+'\0'+JSON.stringify(row));
  }
  const revision=hash.digest('hex');
  return Object.fromEntries(kinds.map(kind=>[kind,{initialState:{},initialConfig:{kind,revision,records:[...rows[kind].values()]}}]));
}
export function catalogLinks(catalog){
  const all=new Map(), result=new Map();
  for(const [note,{initialConfig:c}] of Object.entries(catalog))for(const row of c.records)all.set(note+'\0'+row.id,row);
  function connect(note,recordId,to,targetId,label){
    const k=[note,recordId,to,targetId].join('\0');
    if(!result.has(k))result.set(k,{source:{noteId:note,recordId},target:{noteId:to,recordId:targetId},label:label.slice(0,160)});
  }
  for(const [note,{initialConfig:c}] of Object.entries(catalog))for(const row of c.records)for(const t of row.refs){
    const target=all.get(t.note+'\0'+t.id);
    if(target){connect(note,row.id,t.note,t.id,target.title);connect(t.note,t.id,note,row.id,row.title);}
  }
  return [...result.values()];
}
