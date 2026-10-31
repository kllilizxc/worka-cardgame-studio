import assert from 'node:assert/strict';
import test from 'node:test';

// Exercise the exact ABI bundle that Worka imports, including the schema and indexed writers.
for (const [name, collection, first] of [
  ['ideas', 'ideas', 'idea-bell-exit'],
  ['todo', 'items', 'guardian-support'],
]) {
  test(name + ' examples are editable native records consumed only on an opted-in empty import', async () => {
    const {dispatch} = await import('../published/' + name + '/worka-prebuilt/actions.mjs');
    const config = {}, rows = new Map();
    const storage = key => { if (!rows.has(key)) rows.set(key,new Map()); return rows.get(key); };
    const data = {
      getConfig: async () => structuredClone(config),
      patchConfig: async patch => { Object.assign(config,patch); },
      get: async (key,id) => structuredClone(storage(key).get(id) ?? null),
      page: async key => ({items:structuredClone([...storage(key).values()]),revision:'1'}),
      put: async (key,id,value) => { storage(key).set(id,{id,...structuredClone(value)}); },
      delete: async (key,id) => { storage(key).delete(id); },
    };
    const run=(operation,executionKind='mutation',input={})=>dispatch(
      {method:'execute',name:operation,input},{executionKind,note:{id:name,version:'1'},caller:{kind:'user'},data,notes:{lookup:async()=>[]}}
    );
    await run('installExampleWork');
    assert.equal(storage(collection).size,0);

    config.includeExampleWork=true;
    await run('installExampleWork');
    assert.equal(storage(collection).size,4);
    assert.equal(config.includeExampleWork,false);
    const detail=name==='ideas'?await run('idea','query',{id:first}):await run('requirement','query',{itemId:first});
    assert.equal(name==='ideas'?detail.title:detail.item.title,name==='ideas'?'让铃声暴露撤离点':'调整守关者增援');
    if(name==='todo')assert.equal(storage('totals').get('all').total,4);

    // A route remount after an edit or deletion must retain the user's collection exactly.
    storage(collection).get(first).title='我改过的标题';
    await run('installExampleWork');
    assert.equal(storage(collection).get(first).title,'我改过的标题');
    storage(collection).clear();
    await run('installExampleWork');
    assert.equal(storage(collection).size,0);

    // Do not add examples to an existing user's populated note even if handed an opt-in config.
    storage(collection).set('mine',{id:'mine'});
    config.includeExampleWork=true;
    await run('installExampleWork');
    assert.deepEqual([...storage(collection).keys()],['mine']);
    assert.equal(config.includeExampleWork,false);
  });
}
