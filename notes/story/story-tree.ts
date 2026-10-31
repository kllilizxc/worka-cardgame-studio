import type {Scene} from './model';
export interface Branch {key:string;name:string;folders:Map<string,Branch>;scenes:Scene[];parent?:Branch}
export function storyTree(rows:readonly Scene[]){
  const root:Branch={key:'[]',name:'全书',folders:new Map(),scenes:[]};
  const branches=new Map([[root.key,root]]),parents=new Map<string,Branch>();
  for(const row of rows){
    let here=root;const names:string[]=[];
    for(const name of row.folders){
      names.push(name);const key=JSON.stringify(names);
      if(!here.folders.has(name)){
        const item:Branch={key,name,parent:here,folders:new Map(),scenes:[]};
        here.folders.set(name,item);branches.set(key,item);
      }
      here=here.folders.get(name)!;
    }
    here.scenes.push(row);parents.set(row.id,here);
  }
  return {root,branches,parents};
}
export function ancestors(node?:Branch){
  const result:Branch[]=[];
  while(node){result.unshift(node);node=node.parent;}
  return result;
}
