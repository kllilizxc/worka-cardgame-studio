// Resolve actual CardGame content before starting the isolated game. Fail closed on a stale resource.
import {readFileSync, realpathSync} from 'node:fs';
import {join,resolve,relative,isAbsolute} from 'node:path';

export function gameEntry(root, entry) {
  if (!entry) return {scene:'MainMenu'};
  const publicRoot=realpathSync(join(root,'public'));
  function readFile(path){
    const absolute=realpathSync(resolve(publicRoot,path)), local=relative(publicRoot,absolute);
    if(local==='..'||local.startsWith('..'+'/')||isAbsolute(local)||!local.endsWith('.json'))throw Error('游戏资源路径无效');
    return JSON.parse(readFileSync(absolute,'utf8'));
  }
  const resources=readFile('data/content-catalog.json').resources;
  const kinds={story:'story',map:'expeditionMap',encounter:'encounter'};
  const item=resources.find(r=>r.resourceId===entry.resourceId&&r.kind===kinds[entry.kind]);
  if(!item)throw Error('该提交没有这个试玩资源：'+entry.resourceId);
  const data=readFile(item.publicPath);
  if(entry.kind==='story'){
    const id=entry.nodeId||data.entryNodeId, node=data.nodes.find(n=>n.id===id);
    if(!node)throw Error('该提交没有这个剧情节点：'+id);
    const payload={storyResourceId:item.resourceId,storyGraphFile:item.publicPath};
    if(entry.nodeId){
      const initial=data.initialState||{};
      payload.storyState={...initial,storyId:data.storyId,currentNodeId:id,currentLocationId:node.locationId||initial.locationId,
        currentSublocationId:node.sublocationId||initial.sublocationId,flags:initial.flags||{},attributes:initial.attributes||{},
        relations:initial.relations||{},visitedNodeIds:[id],triggeredDialogueIds:[]};
    }
    return {scene:'StoryScene',payload};
  }
  if(entry.nodeId)throw Error('此类资源从游戏定义的入口开始，请提供剧情节点或省略 nodeId。');
  if(entry.kind==='map'){
    const route=resources.filter(r=>r.kind==='worldMap').flatMap(r=>readFile(r.publicPath).destinations)
      .find(d=>d.kind==='expedition'&&d.mapResourceId===item.resourceId);
    if(!route)throw Error('缺少连接这个秘境的世界地图入口：'+item.resourceId);
    return {scene:'ExpeditionScene',payload:{...route,source:'worldMap',destinationId:route.id}};
  }
  const deck=resources.find(r=>r.resourceId==='deck.starter'&&r.kind==='deck');
  if(!deck)throw Error('战斗试玩需要游戏的起始牌组 deck.starter');
  return {scene:'BattleScene',payload:{runId:'worka-preview',nodeId:'battle.preview',nodeType:'battle',encounterId:data.id,
    encounterResourceId:item.resourceId,encounterFile:item.publicPath,runDeck:readFile(deck.publicPath).cards}};
}
