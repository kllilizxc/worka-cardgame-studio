import talisman from './art/talisman.svg' with {type:'text'};
import ghost from './art/ghost.svg' with {type:'text'};
import ferryman from './art/ferryman.svg' with {type:'text'};
import salt from './art/salt.svg' with {type:'text'};
import sound from './art/sound.svg' with {type:'text'};
import map from './art/map.svg' with {type:'text'};
import encounter from './art/fight.svg' with {type:'text'};
import type {RecordRow} from './model';

export type Kind = RecordRow['refs'][number]['note'];
const illustration:Record<Kind,string> = {map,encounter,cards:talisman,monsters:ghost,people:ferryman,shop:salt,media:sound};
const names:Record<string,Kind> = {'秘境地图':'map','战斗关卡':'encounter','卡牌与牌组':'cards','怪物':'monsters','人物志':'people','物品与商店':'shop','素材库':'media'};
export function catalogKind(value:Kind|undefined,name:string):Kind {return value ?? names[name] ?? 'cards';}
const paths={
  map:'M3 5l6-2 6 3 6-2v15l-6 2-6-3-6 2Zm6-2v15m6-12v15',
  encounter:'M4 3l12 12m-4 2 5-5m-3 2 5 6 2-2-6-5M20 3l-5 6M4 20l5-6m-4-2 6 5',
  cards:'M8 4h12v16H8zM5 7l-2 1 2 13 3-1m6-12 3 4-3 4-3-4z',
  monsters:'M5 9 4 3l6 4 4-1 6-3-1 7 1 4-4 6-4 1-5-3-3-5zM8 11l3 1m3 0 3-2m-8 6 3 2 3-2',
  people:'M16 8a4 4 0 1 1-8 0 4 4 0 1 1 8 0zM4 21v-2c0-7 16-7 16 0v2m-9-5 2 4 2-4',
  shop:'M3 10l2-6h14l2 6a3 3 0 0 1-5 2 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-3-2zm2 3v7h14v-7m-10 7v-5h5v5',
  media:'M3 3h18v18H3zM4 18l5-5 3 3 4-6 4 6M11 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z',
  open:'M7 17 18 6M9 6h9v9', grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list:'M4 5h16M4 12h16M4 19h16', search:'M16 10a6 6 0 1 1-12 0 6 6 0 1 1 12 0zm-1 5 6 6',
  filters:'M3 7h5m5 0h8M3 17h10m5 0h3M13 7a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0zm5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z',
};
export function SymbolIcon({name}:{name:keyof typeof paths}){
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]}/></svg>;
}
const covers = Object.fromEntries(Object.entries(illustration).map(([kind,svg])=>[kind,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)]));
export function CategoryArt({kind}:{kind:Kind}){
  return <img alt="" draggable={false} src={covers[kind]}/>;
}
