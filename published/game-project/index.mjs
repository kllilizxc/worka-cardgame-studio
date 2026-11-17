// provider/index.mjs
import { createHash } from "node:crypto";
import { join, sep } from "node:path";

// provider/project-process.mjs
import { EventEmitter } from "node:events";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";
var workerFile = fileURLToPath(new URL("./project-worker.mjs", import.meta.url));
var errorFrom = (value) => Object.assign(new Error(value?.message ?? "Project process failed"), value?.code ? { code: value.code } : {});
function createProjectProcess(host, { timeoutMs = 1e4, maxPending = 16, maxFrameBytes = 32 * 1024 * 1024, entry = workerFile } = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isInteger(maxPending) || maxPending < 1 || !Number.isInteger(maxFrameBytes) || maxFrameBytes < 1)
    throw new TypeError("Invalid project process limits");
  let current, retired = Promise.resolve(), closed = false, sequence = 0;
  const pending = new Map, watches = new Map;
  const subscribe = (stream, callback, onError) => {
    if (stream?.onData)
      return stream.onData(callback);
    if (!stream?.on)
      throw Error("Project process stream is unavailable");
    stream.on("data", callback);
    stream.on("error", onError);
    return () => {
      const off = stream.off ?? stream.removeListener;
      off?.call(stream, "data", callback);
      off?.call(stream, "error", onError);
    };
  };
  function finish(id, error, value) {
    const call = pending.get(id);
    if (!call)
      return;
    pending.delete(id);
    clearTimeout(call.timer);
    call.signal?.removeEventListener("abort", call.abort);
    error !== undefined ? call.reject(error) : call.resolve(value);
  }
  function reportWatch(watch, error) {
    for (const listener of watch.listeners("error")) {
      try {
        listener(error);
      } catch {}
    }
  }
  function fail(generation, error) {
    error ??= Error("Project process failed");
    if (generation.failed)
      return generation.retirement;
    generation.failed = true;
    if (current === generation)
      current = undefined;
    generation.retirement = generation.start.then(() => generation.process, () => generation.process).then(async (process) => {
      if (process) {
        await process.kill();
        await process.wait();
      } else
        await generation.previous;
    }).finally(() => {
      for (const stop of generation.stops)
        stop();
    });
    retired = generation.retirement;
    retired.catch(() => {});
    for (const [id, call] of pending)
      if (call.generation === generation)
        finish(id, error);
    for (const [root, set] of [...watches]) {
      for (const watch of [...set])
        if (watch.generation === generation) {
          watch.stopped = true;
          set.delete(watch);
          reportWatch(watch, error);
        }
      if (!set.size && watches.get(root) === set)
        watches.delete(root);
    }
    return retired;
  }
  function start() {
    if (current)
      return current;
    const generation = { failed: false, stops: [], previous: retired, start: undefined, retirement: undefined };
    current = generation;
    generation.start = (async () => {
      await generation.previous;
      if (closed || generation.failed)
        throw Error("Project process is closed");
      const spawn = host?.runtime?.subprocess?.spawn;
      if (!spawn)
        throw Error("Managed project process is unavailable");
      const process = await spawn.call(host.runtime.subprocess, { command: globalThis.process.execPath, args: [entry], cwd: host.dataRoot, env: { NODE_OPTIONS: "" } });
      generation.process = process;
      let buffer = "", decoder = new StringDecoder("utf8");
      generation.stops.push(subscribe(process.stdout, (chunk) => {
        if (generation.failed)
          return;
        buffer += typeof chunk === "string" ? chunk : decoder.write(Buffer.from(chunk));
        let newline;
        while ((newline = buffer.indexOf(`
`)) >= 0) {
          const line = buffer.slice(0, newline);
          buffer = buffer.slice(newline + 1);
          if (Buffer.byteLength(line) > maxFrameBytes) {
            fail(generation, Error("Project process frame exceeds limit"));
            return;
          }
          let message;
          try {
            message = JSON.parse(line);
          } catch {
            fail(generation, Error("Invalid project process response"));
            return;
          }
          if (message && typeof message === "object" && "watch" in message) {
            for (const watch of watches.get(message.watch) ?? []) {
              if (watch.stopped || watch.generation !== generation)
                continue;
              if (message.error)
                reportWatch(watch, errorFrom(message.error));
              else {
                try {
                  watch.listener(message.event, message.filename);
                } catch (error) {
                  reportWatch(watch, error);
                }
              }
            }
          } else if (message && typeof message.id === "number") {
            const call = pending.get(message.id);
            if (call?.generation === generation)
              finish(message.id, message.error ? errorFrom(message.error) : undefined, message.result);
          } else {
            fail(generation, Error("Invalid project process response"));
            return;
          }
        }
        if (Buffer.byteLength(buffer) > maxFrameBytes)
          fail(generation, Error("Project process frame exceeds limit"));
      }, (error) => fail(generation, error)));
      if (process.stderr)
        generation.stops.push(subscribe(process.stderr, () => {}, (error) => fail(generation, error)));
      process.wait().then(() => fail(generation, Error("Project process exited")), (error) => fail(generation, error)).catch(() => {});
      return process;
    })();
    generation.start.catch((error) => {
      fail(generation, error);
    });
    return generation;
  }
  function request(method, args, signal) {
    if (closed)
      return Promise.reject(Error("Project process is closed"));
    if (signal?.aborted)
      return Promise.reject(signal.reason ?? Error("Project request cancelled"));
    if (pending.size >= maxPending)
      return Promise.reject(Error("Project process is busy"));
    const generation = start(), id = ++sequence;
    return new Promise((resolve, reject) => {
      const checkout = method === "checkout";
      let sent = false;
      const abort = () => {
        if (!checkout) {
          fail(generation, signal.reason);
          return;
        }
        if (!sent) {
          finish(id, signal.reason);
          return;
        }
        generation.process.stdin.write(JSON.stringify({ cancel: id }) + `
`).catch((error) => fail(generation, error));
      };
      const timer = checkout ? undefined : setTimeout(() => fail(generation, Error("Project request timed out")), timeoutMs);
      pending.set(id, { generation, resolve, reject, timer, signal, abort });
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted)
        abort();
      generation.start.then(async (process) => {
        if (!pending.has(id) || generation.failed)
          return;
        const frame = JSON.stringify({ id, method, args }) + `
`;
        if (Buffer.byteLength(frame) > maxFrameBytes) {
          finish(id, Error("Project request frame exceeds limit"));
          return;
        }
        sent = true;
        await process.stdin.write(frame);
      }).catch((error) => {
        fail(generation, error);
      });
    });
  }
  function watch(root, _options, listener) {
    const handle = new EventEmitter;
    handle.listener = listener;
    handle.stopped = false;
    const set = watches.get(root) ?? new Set;
    const first = !set.size;
    watches.set(root, set);
    set.add(handle);
    handle.generation = current;
    handle.close = () => {
      if (handle.stopped)
        return;
      handle.stopped = true;
      set.delete(handle);
      if (!set.size) {
        watches.delete(root);
        if (!closed && current && current === handle.generation && !current.failed)
          request("unwatch", [root]).catch((error) => {
            fail(handle.generation, error);
          });
      }
    };
    if (first) {
      const ready = request("watch", [root]);
      handle.generation = current;
      ready.catch((error) => {
        for (const item of set) {
          item.stopped = true;
          reportWatch(item, error);
        }
        set.clear();
        if (watches.get(root) === set)
          watches.delete(root);
      });
    }
    return handle;
  }
  async function close() {
    if (!closed) {
      closed = true;
      for (const set of watches.values())
        for (const watch of set)
          watch.stopped = true;
      watches.clear();
      if (current)
        fail(current, Error("Project process is closed"));
    }
    await retired;
  }
  return { request, watch, close };
}

// notes/catalog/search.ts
var normalized = (text) => text.normalize("NFKC").toLocaleLowerCase().trim();
var compare = (a, b) => a.localeCompare(b, "zh-CN", { numeric: true });
function search(rows, criteria) {
  const q = normalized(criteria.q || ""), words = q.split(/\s+/).filter(Boolean), filters = criteria.filters || {};
  const found = [], counts = new Map;
  const dimensions = new Set;
  for (const row of rows) {
    for (const field of Object.keys(row.facets))
      dimensions.add(field);
    const text = normalized([row.title, row.id, row.source, row.body, ...Object.values(row.facets).flat(), ...row.fields.map((f) => f.value), ...row.sections.flatMap((s) => s.lines)].join(" "));
    if (!words.every((w) => text.includes(w)))
      continue;
    const missing = Object.keys(filters).filter((k) => filters[k]?.length && !filters[k].some((v) => row.facets[k]?.includes(v)));
    if (missing.length > 1)
      continue;
    for (const [k, opts] of Object.entries(row.facets)) {
      if (missing.length && missing[0] !== k)
        continue;
      if (!counts.has(k))
        counts.set(k, new Map);
      const group = counts.get(k);
      for (const value of opts)
        group.set(value, (group.get(value) || 0) + 1);
    }
    if (!missing.length) {
      const name = normalized(row.title), id = normalized(row.id);
      found.push({ row, rank: q && (name === q || id === q) ? 3 : q && name.includes(q) ? 2 : q && id.includes(q) ? 1 : 0 });
    }
  }
  if (criteria.sort === "name")
    found.sort((a, b) => compare(a.row.title, b.row.title));
  else if (q)
    found.sort((a, b) => b.rank - a.rank);
  const size = Math.max(1, Math.min(48, criteria.size || 24)), pages = Math.max(1, Math.ceil(found.length / size)), page = Math.max(1, Math.min(pages, criteria.page || 1));
  const facetNeedle = normalized(criteria.facetQuery || "");
  const facets = [...dimensions].map((key) => {
    const choices = [...new Set([...filters[key] || [], ...counts.get(key)?.keys() || []])].filter((v) => normalized(v).includes(facetNeedle));
    const options = choices.map((value) => ({ value, count: counts.get(key)?.get(value) || 0 })).sort((a, b) => b.count - a.count || compare(a.value, b.value));
    return { key, options: options.slice(0, 30), hasMore: options.length > 30 };
  });
  const items = found.slice((page - 1) * size, page * size).map(({ row }) => ({ id: row.id, title: row.title, group: row.group, body: row.body.slice(0, 150), mediaKey: row.mediaKey || null, thumbnail: row.thumbnail || null, summary: row.fields.slice(0, 2).filter((f) => f.name !== "文件").map((f) => f.name + " " + f.value).join(" · ") }));
  return { total: rows.length, count: found.length, page, pages, items, facets };
}

// notes/catalog/home.ts
var audio = (row) => row.facets["媒介"]?.includes("声音") || /\.(?:mp3|aac|wav|oga|ogg|flac|m4a)$/i.test(row.source);
function cap(row) {
  return {
    ...row,
    body: row.body.slice(0, 260),
    sections: row.sections.slice(0, 6).map((s) => ({ ...s, lines: s.lines.slice(0, 7) })),
    refs: row.refs.slice(0, 8),
    fields: row.fields.slice(0, 12),
    diagram: row.diagram?.slice(0, 7)
  };
}
function homeRecords(kind, rows) {
  let records = [];
  if (kind === "cards") {
    const cards = rows.filter((r) => r.group !== "牌组");
    const hasArt = new Set(cards.filter((r) => r.mediaKey || r.thumbnail).map((r) => r.id));
    const score = (row) => row.refs.filter((ref) => ref.note === "cards" && hasArt.has(ref.id)).length;
    const deck = rows.filter((r) => r.group === "牌组").sort((a, b) => score(b) - score(a))[0];
    const pool = deck ? cards.filter((r) => deck.refs.some((ref) => ref.note === "cards" && ref.id === r.id)) : cards;
    const pictured = pool.filter((r) => r.mediaKey || r.thumbnail), plain = pool.filter((r) => !r.mediaKey && !r.thumbnail);
    records = [...deck ? [deck] : [], ...[...pictured, ...plain].slice(0, 6)];
  } else if (kind === "media") {
    const portrait = rows.find((r) => r.group === "人设" || r.group === "立绘"), background = rows.find((r) => r.group === "背景"), sound = rows.find(audio);
    records = [...new Set([portrait, background, sound, ...rows].filter((r) => !!r))].slice(0, 3);
  } else {
    const focus = (kind === "map" ? rows.find((r) => r.diagram?.length) : kind === "encounter" ? rows.find((r) => r.portraits?.some((p) => p.mediaKey || p.thumbnail)) : rows.find((r) => r.mediaKey || r.thumbnail)) || rows[0];
    if (focus) {
      records = [focus];
      if (kind === "shop") {
        const offer = rows.find((r) => r.group === "货架" && r.refs.some((x) => x.note === "shop" && x.id === focus.id));
        if (offer)
          records.push(offer);
      }
    }
  }
  return { kind, count: rows.length, records: records.map(cap) };
}

// notes/story/story-tree.ts
function storyTree(rows) {
  const root = { key: "[]", name: "全书", folders: new Map, scenes: [] };
  const branches = new Map([[root.key, root]]), parents = new Map;
  for (const row of rows) {
    let here = root;
    const names = [];
    for (const name of row.folders) {
      names.push(name);
      const key = JSON.stringify(names);
      if (!here.folders.has(name)) {
        const item = { key, name, parent: here, folders: new Map, scenes: [] };
        here.folders.set(name, item);
        branches.set(key, item);
      }
      here = here.folders.get(name);
    }
    here.scenes.push(row);
    parents.set(row.id, here);
  }
  return { root, branches, parents };
}
function ancestors(node) {
  const result = [];
  while (node) {
    result.unshift(node);
    node = node.parent;
  }
  return result;
}

// provider/index.mjs
var name = "game-project";
var inject = ["worka"];
var catalogKinds = ["map", "encounter", "cards", "monsters", "people", "shop", "media"];
var contentKinds = ["story", ...catalogKinds];
var digest = (value) => createHash("sha256").update(value).digest("hex");
var defaultRepo = "https://github.com/kllilizxc/CardGame";
var missingMessage = "请选择游戏来源：使用默认仓库，或选择本机已检出的 CardGame 目录。";
var recordKey = (id) => "cardgame.project/" + digest(id);
async function binding(app, id) {
  return id ? (await app.core.readRecord("states", recordKey(id)))?.value : undefined;
}
function writable(caller) {
  if (!caller || caller.readOnly || caller.dryRun || caller.replay || !["user", "agent"].includes(caller.kind))
    throw Error("需要可写调用");
}
async function desktopForCommand(app, caller, requested) {
  writable(caller);
  const connection = caller.providerConnection;
  if (connection && (connection.provider !== name || connection.connectionId !== name || !connection.desktopId))
    throw Error("当前对话未绑定此游戏项目连接");
  let desktopId = connection?.desktopId;
  const noteId = caller.controlNoteId || caller.noteId;
  if (noteId) {
    const note = (await app.core.getNote(noteId))?.value;
    if (!note?.desktopId || note.archived)
      throw Error("游戏便笺不可用");
    if (desktopId && desktopId !== note.desktopId)
      throw Error("游戏项目连接不属于当前桌面");
    desktopId = note.desktopId;
  }
  if (caller.sessionId) {
    const s = (await app.core.getSession(caller.sessionId))?.value;
    const sessionDesktop = s?.desktopId || (s?.noteId ? (await app.core.getNote(s.noteId))?.value?.desktopId : undefined);
    if (sessionDesktop) {
      if (desktopId && desktopId !== sessionDesktop)
        throw Error("游戏项目连接不属于当前桌面");
      desktopId = sessionDesktop;
    }
  }
  if (typeof requested === "string" && requested.trim()) {
    if (desktopId && desktopId !== requested.trim())
      throw Error("请选择当前桌面");
    desktopId = requested.trim();
  }
  if (!desktopId)
    throw Error("请选择目标桌面");
  return desktopId;
}
function ignoredWatchPath(filename) {
  if (!filename)
    return false;
  const normalized = String(filename).split(sep).join("/");
  if (normalized === "node_modules" || normalized.startsWith("node_modules/"))
    return true;
  if (normalized === ".git" || normalized.startsWith(".git/")) {
    return !(normalized === ".git/HEAD" || normalized === ".git/packed-refs" || normalized.startsWith(".git/refs/"));
  }
  return false;
}
function excerpt(text = "", fallback = "") {
  const line = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").split(/\r?\n/).find((item) => item.trim() && !/^[\s#>{[\]-]/.test(item));
  return (line?.slice(0, 150) || fallback.slice(0, 140)).trim();
}
function gameProject(host, { onBuild, watch: watchOverride, processOptions } = {}) {
  const project = createProjectProcess(host, processOptions), watch = watchOverride ?? project.watch;
  const app = host.app, pending = new Map, roots = new Map, desktopRoots = new Map;
  const stopping = new AbortController;
  let closing = false;
  function directory(id) {
    return join(host.dataRoot, "providers", name, digest(id));
  }
  async function readDesktopBinding(id) {
    const b = await binding(app, id);
    if (b?.root)
      desktopRoots.set(id, b.root);
    else
      desktopRoots.delete(id);
    return b;
  }
  async function computeProjection(root) {
    onBuild?.(root);
    const { story, catalog, links: edges } = await project.request("build", [root]);
    const catalogByKind = Object.fromEntries(catalogKinds.map((k) => [k, catalog[k].initialConfig.records]));
    const catalogMap = Object.fromEntries(catalogKinds.map((k) => [k, new Map(catalogByKind[k].map((r) => [r.id, r]))]));
    const scenes = story.initialConfig.storyIndex;
    const sceneMap = new Map(scenes.map((s) => [s.id, s]));
    const tree = storyTree(scenes);
    const push = (fromKind, fromId, toKind, toId, label) => {
      if (fromKind === toKind && fromId === toId)
        return;
      edges.push({ source: { noteId: fromKind, recordId: fromId }, target: { noteId: toKind, recordId: toId }, label: String(label || toId).slice(0, 160) });
    };
    for (const scene of scenes) {
      for (const ref of scene.refs || []) {
        const target = catalogMap[ref.note]?.get(ref.id);
        if (!target)
          continue;
        push("story", scene.id, ref.note, ref.id, target.title);
        push(ref.note, ref.id, "story", scene.id, scene.title);
      }
    }
    const linksBySource = new Map;
    for (const edge of edges) {
      const key = edge.source.noteId + "\x00" + edge.source.recordId;
      let list = linksBySource.get(key);
      if (!list) {
        list = new Map;
        linksBySource.set(key, list);
      }
      const targetKey = edge.target.noteId + "\x00" + edge.target.recordId;
      if (!list.has(targetKey))
        list.set(targetKey, edge);
    }
    return { root, catalogByKind, catalogMap, scenes, sceneMap, initialScene: story.initialConfig.initialScene, tree, linksBySource };
  }
  function closeRoot(root) {
    const state = roots.get(root);
    if (state) {
      clearTimeout(state.timer);
      state.fsWatcher?.close();
      state.cached = null;
      roots.delete(root);
    }
  }
  function ensureRoot(root) {
    let entry = roots.get(root);
    if (entry?.fsWatcher)
      return entry;
    entry ??= { listeners: new Set, timer: undefined, fsWatcher: undefined, epoch: 0, cached: null };
    if (!closing) {
      try {
        entry.fsWatcher = watch(root, { recursive: true }, (_event, filename) => {
          if (ignoredWatchPath(filename))
            return;
          entry.epoch++;
          entry.cached = null;
          clearTimeout(entry.timer);
          entry.timer = setTimeout(() => {
            entry.timer = undefined;
            for (const fn of [...entry.listeners])
              fn();
          }, 25);
        });
        entry.fsWatcher.on("error", () => {
          entry.epoch++;
          entry.cached = null;
          entry.fsWatcher?.close();
          entry.fsWatcher = undefined;
        });
      } catch {
        entry.fsWatcher = undefined;
      }
    }
    roots.set(root, entry);
    return entry;
  }
  async function projection(root) {
    const entry = ensureRoot(root);
    if (!entry.fsWatcher)
      return computeProjection(root);
    if (!entry.cached) {
      const startEpoch = entry.epoch;
      const work = computeProjection(root).catch((err) => {
        if (entry.cached === work)
          entry.cached = null;
        throw err;
      });
      if (entry.epoch === startEpoch)
        entry.cached = work;
    }
    return entry.cached;
  }
  async function desktopNoteMap(desktopId) {
    const map = {};
    if (typeof app.core.listNotes !== "function")
      return map;
    const rows = await app.core.listNotes({ desktopId });
    for (const row of rows) {
      if (row.value.archived)
        continue;
      const cfg = (await app.core.readRecord("states", row.key + ":config"))?.value;
      if (cfg?.connections?.game?.provider === name && cfg.connections.game.connectionId === name && contentKinds.includes(cfg.kind)) {
        map[cfg.kind] = row.key;
      }
    }
    return map;
  }
  async function allowedTargets(desktopId, noteId, noteIds) {
    if (typeof app.skillConnections?.list !== "function")
      return new Set(Object.values(noteIds));
    const relations = await app.skillConnections.list(desktopId);
    const peers = new Set;
    for (const rel of relations) {
      if (!rel.enabled || rel.archived || !rel.nodeIds.includes(noteId))
        continue;
      for (const peerId of rel.nodeIds)
        if (peerId !== noteId)
          peers.add(peerId);
    }
    return peers;
  }
  async function linkResolver(desktopId, noteId, kind, data) {
    const noteIds = await desktopNoteMap(desktopId);
    const peers = await allowedTargets(desktopId, noteId, noteIds);
    return (recordId) => {
      const raw = data.linksBySource.get(kind + "\x00" + recordId);
      if (!raw)
        return [];
      const result = [];
      for (const edge of raw.values()) {
        const targetNoteId = noteIds[edge.target.noteId];
        if (!targetNoteId || targetNoteId !== noteId && !peers.has(targetNoteId))
          continue;
        if (targetNoteId === noteId && edge.target.recordId === recordId)
          continue;
        const id = "ref_" + digest(JSON.stringify([noteId, recordId, targetNoteId, edge.target.recordId])).slice(0, 24);
        result.push({ id, label: edge.label, target: { noteId: targetNoteId, recordId: edge.target.recordId } });
      }
      return result;
    };
  }
  async function member(ctx) {
    const { noteId, providerConnection: connection } = ctx.scope;
    if (!noteId || connection?.provider !== name || connection.connectionId !== name)
      throw Error("此便笺没有选择游戏项目连接");
    const noteRecord = typeof ctx.note === "function" ? await ctx.note() : undefined;
    const stored = (await app.core.getNote(noteId))?.value;
    if (!stored?.desktopId || stored.archived)
      throw Error("游戏便笺已移除");
    if (connection.desktopId !== stored.desktopId)
      throw Error("游戏项目连接不属于当前桌面");
    const config = noteRecord?.config ?? (await app.core.readRecord("states", noteId + ":config"))?.value;
    const kind = config?.kind;
    if (!contentKinds.includes(kind))
      throw Error("便笺不属于游戏内容库");
    const b = await readDesktopBinding(stored.desktopId);
    return { id: stored.desktopId, noteId, kind, b };
  }
  function subscribeProject(_input, invalidate, ctx) {
    const noteId = ctx.scope.noteId, desktopId = ctx.scope.providerConnection?.desktopId;
    if (!noteId || !desktopId || closing)
      return () => {};
    let disposed = false, stopRoot = () => {}, currentRoot = "";
    const syncWatcher = async () => {
      if (disposed || closing)
        return;
      const b = await readDesktopBinding(desktopId).catch(() => {
        return;
      });
      const nextRoot = b?.root || "";
      if (disposed || closing || nextRoot === currentRoot)
        return;
      if (nextRoot && desktopRoots.get(desktopId) !== nextRoot)
        return;
      stopRoot();
      currentRoot = nextRoot;
      if (nextRoot) {
        const entry = ensureRoot(nextRoot), fn = () => invalidate();
        entry.listeners.add(fn);
        stopRoot = () => {
          entry.listeners.delete(fn);
        };
      } else {
        stopRoot = () => {};
      }
    };
    syncWatcher();
    const key = recordKey(desktopId);
    const stopCore = typeof app.core.subscribe === "function" ? app.core.subscribe((event) => {
      if (disposed)
        return;
      if (event.changes.some((c) => c.table === "notes" || c.table === "connections" || c.table === "states" && c.key === key)) {
        syncWatcher().then(() => invalidate());
      }
    }) : () => {};
    return () => {
      disposed = true;
      stopRoot();
      stopCore();
    };
  }
  async function status(_, ctx) {
    const { b } = await member(ctx);
    if (b?.job) {
      const status = (await app.core.getExecution(b.job.id))?.value?.status;
      if (!status || ["accepted", "running", "cancel-requested"].includes(status))
        return { configured: false, ready: false, executionId: b.job.id, message: b.job.message };
      if (!b.root)
        return { configured: false, ready: false, message: "获取游戏仓库中断了，可以重新选择游戏来源。" };
    }
    if (!b?.root)
      return { configured: false, ready: false, message: b?.message ?? missingMessage };
    try {
      const commit = await project.request("status", [b.root, b.commit], ctx.signal);
      return { ready: true, configured: true, verifiedAt: b.verifiedAt, label: "游戏仓库", root: b.root, ...commit ? { commit } : {} };
    } catch {
      return { configured: false, ready: false, message: "无法读取已绑定的游戏目录。" + missingMessage };
    }
  }
  async function catalogResource(input, ctx) {
    const { id, noteId, kind, b } = await member(ctx);
    if (!catalogKinds.includes(kind))
      throw Error("此便笺不是目录内容库");
    if (!b?.root)
      return null;
    const data = await projection(b.root);
    const rows = data.catalogByKind[kind] || [];
    const op = input?.op || "page";
    if (op === "overview")
      return { count: rows.length, items: rows.slice(0, 3).map((r) => r.title) };
    if (op === "home") {
      const home = homeRecords(kind, rows);
      const linksOf = await linkResolver(id, noteId, kind, data);
      return { ...home, records: home.records.map((row) => ({ ...row, links: linksOf(row.id) })) };
    }
    if (op === "record") {
      const target = typeof input?.id === "string" ? data.catalogMap[kind]?.get(input.id) : undefined;
      if (!target)
        return null;
      const linksOf = await linkResolver(id, noteId, kind, data);
      return { ...target, links: linksOf(target.id) };
    }
    if (op === "cursor") {
      const start = Math.max(0, Number.parseInt(String(input?.cursor || "0"), 10) || 0);
      const size = Math.min(50, Math.max(1, Math.trunc(Number(input?.limit) || 50)));
      const slice = rows.slice(start, start + size).map((r) => ({ id: r.id, title: r.title }));
      return { items: slice, ...start + size < rows.length ? { next: String(start + size) } : {} };
    }
    return search(rows, input || {});
  }
  async function storyResource(input, ctx) {
    const { id, noteId, kind, b } = await member(ctx);
    if (kind !== "story")
      throw Error("只有剧情知识库可读取剧情导航");
    if (!b?.root)
      return null;
    const data = await projection(b.root);
    const op = input?.op || "scenes";
    const strip = ({ search: _s, body: _b, refs: _r, ...info }) => info;
    if (op === "home") {
      const current = data.sceneMap.get(data.initialScene) || data.scenes.find((r) => r.nodeId) || data.scenes[0];
      if (!current)
        return { current: null, branches: [] };
      const branches = current.choices.map((c) => data.sceneMap.get(c.to) || data.scenes.find((r) => r.nodeId === c.to)).filter(Boolean).slice(0, 2);
      const card = (s) => ({ ...strip(s), excerpt: excerpt(s.body, s.search.replace(s.title, "")) });
      return { current: card(current), branches: branches.map(card) };
    }
    if (op === "scene") {
      const targetId = typeof input?.id === "string" && input.id ? input.id : data.initialScene;
      const row = data.sceneMap.get(targetId) || (input?.id ? undefined : data.scenes[0]);
      if (!row)
        return { scene: null, initialScene: data.initialScene };
      const trail = ancestors(data.tree.parents.get(row.id)).map((branch) => ({ key: branch.key, name: branch === data.tree.root ? "全书" : branch.name }));
      const choices = row.choices.map((c) => {
        const target = data.sceneMap.get(c.to);
        return { label: c.label, to: c.to, ...target ? { title: target.title, hasChildren: target.choices.length > 0 } : {} };
      });
      const linksOf = await linkResolver(id, noteId, "story", data);
      return {
        initialScene: data.initialScene,
        scene: { ...strip(row), choices, ancestors: trail, links: linksOf(row.id) }
      };
    }
    if (op === "tree") {
      const folderKey = typeof input?.folderKey === "string" && input.folderKey ? input.folderKey : "[]";
      const branch = data.tree.branches.get(folderKey);
      if (!branch)
        return { key: folderKey, name: "全书", ancestors: [], items: [], hasMore: false };
      const trail = ancestors(branch).map((node) => ({ key: node.key, name: node === data.tree.root ? "全书" : node.name }));
      const all = [
        ...[...branch.folders.values()].map((child) => ({ kind: "folder", key: child.key, name: child.name, hasChildren: Boolean(child.folders.size || child.scenes.length) })),
        ...branch.scenes.map((scene) => ({ kind: "scene", id: scene.id, title: scene.title, hasChildren: scene.choices.length > 0 }))
      ];
      const start = Math.max(0, Number.parseInt(String(input?.cursor || "0"), 10) || 0);
      const size = Math.min(50, Math.max(1, Math.trunc(Number(input?.limit) || 40)));
      const items = all.slice(start, start + size);
      return {
        key: branch.key,
        name: branch === data.tree.root ? "全书" : branch.name,
        ancestors: trail,
        items,
        total: all.length,
        hasMore: start + size < all.length,
        ...start + size < all.length ? { next: String(start + size) } : {}
      };
    }
    const words = String(input?.query ?? "").normalize("NFKC").trim().toLowerCase().split(/\s+/).filter(Boolean);
    const resolved = words.length ? data.scenes.filter((row) => {
      const text = [row.id, row.title, ...row.folders, row.search].join(" ").normalize("NFKC").toLowerCase();
      return words.every((w) => text.includes(w));
    }) : data.scenes;
    const start = input?.cursor !== undefined ? Math.max(0, Number.parseInt(String(input.cursor), 10) || 0) : Math.max(0, Math.trunc(Number(input?.offset) || 0));
    const limit = Math.min(50, Math.max(1, Math.trunc(Number(input?.limit) || 30)));
    const nextOffset = start + limit;
    return {
      total: resolved.length,
      items: resolved.slice(start, nextOffset).map(strip),
      ...nextOffset < resolved.length ? { next: String(nextOffset) } : {}
    };
  }
  async function doc(input, ctx) {
    const { b } = await member(ctx);
    if (!b?.root)
      return null;
    if (typeof input?.path !== "string" || !input.path.trim())
      throw Error("缺少项目文档路径");
    return project.request("document", [b.root, input], ctx.signal);
  }
  async function asset(input, ctx) {
    const { b } = await member(ctx);
    if (!b?.root || typeof input?.key !== "string" && typeof input?.id !== "string")
      return null;
    let sourcePath = "";
    if (typeof input.key === "string" && input.key) {
      sourcePath = input.key.split("?v=")[0].replace(/^\/+/, "");
    } else if (typeof input.id === "string" && input.id) {
      if (input.id.startsWith("asset:"))
        sourcePath = input.id.slice(6).replace(/^\/+/, "");
      else {
        const data = await projection(b.root);
        sourcePath = data.catalogMap.media?.get(input.id)?.source || "";
      }
    }
    if (!sourcePath)
      return null;
    return project.request("asset", [b.root, sourcePath], ctx.signal);
  }
  async function rootUsedElsewhere(root, excludeId) {
    const desktopIds = new Set(desktopRoots.keys());
    if (typeof app.core.listNotes === "function") {
      for (const row of await app.core.listNotes()) {
        if (row.value?.desktopId && !row.value.archived)
          desktopIds.add(row.value.desktopId);
      }
    }
    for (const otherId of desktopIds) {
      if (otherId === excludeId)
        continue;
      if ((await readDesktopBinding(otherId))?.root === root)
        return true;
    }
    return false;
  }
  async function bind(id, origin, signal, executionId) {
    const prior = await readDesktopBinding(id);
    const dir = directory(id);
    const message = origin.startsWith("https:") ? "正在克隆游戏仓库…" : "正在检查游戏目录…";
    await app.core.writeRecord("states", recordKey(id), { ...prior, job: { id: executionId, message } });
    let root, commit;
    try {
      root = await project.request("checkout", [origin, dir], signal);
      commit = await project.request("validate", [root], signal);
      signal.throwIfAborted();
    } catch (error) {
      const { job: _job, ...previous } = prior ?? {};
      const message = signal.aborted ? "已取消获取游戏仓库。" : error.message;
      await app.core.writeRecord("states", recordKey(id), { ...previous, message });
      throw error;
    }
    const existing = roots.get(root);
    if (existing) {
      existing.epoch++;
      existing.cached = null;
    }
    await app.core.writeRecord("states", recordKey(id), { source: origin, root, commit, executionId, verifiedAt: Date.now() });
    desktopRoots.set(id, root);
    if (prior?.root && prior.root !== root && !await rootUsedElsewhere(prior.root, id)) {
      closeRoot(prior.root);
    }
    return { root, commit };
  }
  const liveResource = (load) => ({ access: "owner", version: "2", load, subscribe: subscribeProject, query: { load, subscribe: subscribeProject } });
  return {
    resources: {
      status: liveResource(status),
      catalog: liveResource(catalogResource),
      story: liveResource(storyResource),
      document: liveResource(doc),
      asset: liveResource(asset)
    },
    async noteContext(note) {
      if (!note?.desktopId)
        return [];
      const b = await readDesktopBinding(note.desktopId);
      if (!b?.root)
        return [];
      let adapter = "";
      if (typeof app.dispatch === "function") {
        const src = await app.dispatch("desktop.source", { desktopId: note.desktopId }, { kind: "user" }).catch(() => null);
        if (src?.directory) {
          try {
            adapter = await project.request("adapter", [src.directory]);
          } catch {}
        }
      }
      return [`已绑定 CardGame 仓库：${b.root}${adapter ? `；试玩适配器：${adapter}` : ""}。`];
    },
    commands: { bind: {
      idempotent: true,
      async run(input, context) {
        const { caller, noteId, executionId } = context;
        const id = await desktopForCommand(app, caller, input?.desktopId ?? (noteId && (await app.core.getNote(noteId))?.value?.desktopId));
        const members = await desktopNoteMap(id);
        if (!Object.values(members).includes(noteId))
          throw Error("请选择当前桌面的游戏内容便笺");
        const source = typeof input?.source === "string" && input.source.trim() ? input.source.trim() : defaultRepo;
        const current = pending.get(id);
        if (current) {
          if (current.source === source)
            return current.work;
          throw Error("当前桌面正在绑定另一个游戏仓库");
        }
        const signal = AbortSignal.any([context.signal, stopping.signal]);
        signal.throwIfAborted();
        const work = bind(id, source, signal, executionId);
        pending.set(id, { source, work });
        try {
          return await work;
        } finally {
          pending.delete(id);
        }
      },
      async reconcile(_input, { noteId, executionId }) {
        const note = noteId && (await app.core.getNote(noteId))?.value;
        const saved = note?.desktopId && await binding(app, note.desktopId);
        if (saved?.executionId === executionId)
          return { status: "completed", result: { root: saved.root, commit: saved.commit } };
        return { status: "failed", error: "获取游戏仓库中断了，可以重新选择游戏来源。" };
      }
    } },
    async invoke(method) {
      throw Error("未知游戏项目操作 " + method);
    },
    beginClose() {
      closing = true;
      stopping.abort(Error("Game project is closing"));
    },
    async close() {
      this.beginClose();
      await Promise.allSettled([...pending.values()].map((v) => v.work));
      for (const root of [...roots.keys()])
        closeRoot(root);
      desktopRoots.clear();
      await project.close();
    }
  };
}
async function apply(ctx) {
  const dispose = await ctx.worka.register(name, gameProject(ctx.worka));
  ctx.effect(() => dispose, "CardGame project");
}
export {
  apply,
  gameProject,
  inject,
  name
};
