// provider/index.mjs
import { createHash as createHash2 } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { watch as watchFs } from "node:fs";
import { access, mkdir, mkdtemp, readFile as readFile2, realpath as realpath2, rename, rm, stat } from "node:fs/promises";
import { dirname as dirname2, extname as extname2, isAbsolute, join as join3, relative as relative2, sep as sep2 } from "node:path";

// tools/catalog-index.mjs
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
var kinds = ["map", "encounter", "cards", "monsters", "people", "shop", "media"];
var cardKinds = { unit: "单位牌", artifact: "法器", talisman: "符箓", pill: "丹药", field: "场地", skill: "技能" };
var rarities = { common: "普通", uncommon: "优秀", rare: "稀有", epic: "史诗", legendary: "传说" };
var nodeKinds = { battle: "战斗", boss: "首领", event: "事件", shop: "商店", extract: "撤离", entrance: "入口", rest: "休整" };
var image = /\.(?:png|jpe?g|webp|gif|avif|svg|bmp)$/i;
var audio = /\.(?:mp3|aac|oga|ogg|wav|m4a|flac|opus)$/i;
var values = (v) => Array.isArray(v) ? v : v == null ? [] : [v];
var words = (v) => values(v).map((x) => typeof x === "string" ? x : typeof x === "number" ? String(x) : JSON.stringify(x)).filter(Boolean);
var labels = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, [...new Set(words(v))]]).filter(([, v]) => v.length));
var fields = (obj) => Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== "").map(([name, v]) => ({ name, value: words(v).join(" · ") }));
var section = (title, lines) => ({ title, lines: words(lines) });
var ref = (note, id) => ({ note, id });
function walk(root, dir) {
  if (!existsSync(join(root, dir)))
    return [];
  return readdirSync(join(root, dir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, "en")).flatMap((e) => {
    const path = dir + "/" + e.name;
    return e.isDirectory() ? walk(root, path) : e.isFile() ? [path] : [];
  });
}
var parse = (root, file) => JSON.parse(readFileSync(join(root, file), "utf8"));
function git(root, ...args) {
  try {
    return execFileSync("git", ["-c", "core.fsmonitor=false", "-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 }).trimEnd();
  } catch {
    return "";
  }
}
var mark = (...parts) => "/" + parts.map((x) => String(x).replace(/~/g, "~0").replace(/\//g, "~1")).join("/");
var encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");
function visitStrings(value, visit) {
  if (typeof value === "string")
    visit(value);
  else if (Array.isArray(value))
    value.forEach((v) => visitStrings(v, visit));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => visitStrings(v, visit));
}
function assetType(path, meta) {
  const music = /music|bgm|soundtrack|配乐|音乐/i, voice = /voice|dialogue|对白|配音/i;
  if (audio.test(path))
    return music.test(path + " " + meta) ? "音乐" : voice.test(path + " " + meta) ? "配音" : "音效";
  if (/card-face|card.art|卡面/i.test(path + " " + meta))
    return "卡面";
  if (/portrait|character[-_ /]|人设|立绘|disciple-reference/i.test(path + " " + meta))
    return "人设";
  if (/background|backdrop|场景|背景|exterior|interior|clearing|\/bg[._/]/i.test(path + " " + meta))
    return "背景";
  return "素材图";
}
function buildCatalog(root, { hashCache, gitCache } = {}) {
  const rows = Object.fromEntries(kinds.map((k) => [k, new Map]));
  const head = git(root, "rev-parse", "HEAD");
  let base = "", tracked = new Map;
  if (gitCache && gitCache.head === head) {
    base = gitCache.base;
    tracked = gitCache.tracked;
  } else {
    const remote = git(root, "config", "--get", "remote.origin.url").match(/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i);
    tracked = new Map(git(root, "ls-tree", "-rz", "HEAD", "--", "public", "art-references").split("\x00").flatMap((line) => {
      const match = /^100\d+ blob ([a-f0-9]+)\t([\s\S]+)$/.exec(line);
      return match ? [[match[2], match[1]]] : [];
    }));
    base = remote && head ? "https://raw.githubusercontent.com/" + remote[1] + "/" + remote[2] + "/" + head + "/" : "";
    if (gitCache) {
      gitCache.head = head;
      gitCache.base = base;
      gitCache.tracked = tracked;
    }
  }
  function add(note, id, title, group, source, body = "") {
    if (typeof id !== "string" || !id.length)
      throw new Error("Missing record ID: " + source);
    if (rows[note].has(id))
      throw new Error("Duplicate " + note + " ID " + id + " in " + source);
    const record = { id, title: String(title || id), group, source, body: String(body || ""), facets: {}, fields: [], sections: [], refs: [] };
    rows[note].set(id, record);
    return record;
  }
  const data = walk(root, "public/data").filter((f) => f.endsWith(".json"));
  if (!data.includes("public/data/cards/units.json"))
    throw new Error("CardGame 项目缺少 public/data/cards/units.json");
  const jsons = new Map(data.map((f) => [f, parse(root, f)]));
  const dataFiles = (dir) => [...jsons].filter(([f]) => f.startsWith("public/data/" + dir + "/"));
  const manifest = existsSync(join(root, "public/assets/asset-manifest.json")) ? parse(root, "public/assets/asset-manifest.json") : {};
  const assetMeta = new Map((manifest.assets || []).map((a) => [a.path, a]));
  const assetByPath = new Map, titlesByUse = new Map;
  for (const f of [...walk(root, "public"), ...walk(root, "art-references")].filter((f) => image.test(f) || audio.test(f))) {
    const a = assetMeta.get(f), usage = assetType(f, JSON.stringify(a?.metadata || {})), id = a?.id || "asset:" + f;
    const row = add("media", id, a?.metadata?.name || a?.metadata?.title || basename(f), usage, f);
    const full = join(root, f), st = statSync(full), oid = tracked.get(f);
    let cached = hashCache?.get(f);
    if (!cached || cached.size !== st.size || cached.mtimeMs !== st.mtimeMs || cached.oidKind !== (oid?.length || 0)) {
      const bytes = readFileSync(full);
      const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
      const blobOid = oid ? createHash(oid.length === 64 ? "sha256" : "sha1").update("blob " + bytes.length + "\x00").update(bytes).digest("hex") : "";
      cached = { size: st.size, mtimeMs: st.mtimeMs, digest, oidKind: oid?.length || 0, blobOid };
      hashCache?.set(f, cached);
    }
    row.mediaKey = f + "?v=" + cached.digest;
    row.facets = labels({ "媒介": audio.test(f) ? "声音" : "图像", "用途": usage, "格式": extname(f).slice(1).toUpperCase(), "目录": f.split("/").slice(0, 3).join("/"), "标签": a?.tags });
    row.fields = fields({ "文件": f, "大小": st.size + " B", "当前版本": a?.currentVersionId });
    if (base && oid && cached.blobOid === oid)
      row.mediaUrl = base + encodePath(f);
    row.sections = [section("版本", (a?.versions || []).map((v) => v.path + " · " + v.revision.slice(0, 12)))];
    assetByPath.set(f, row);
  }
  function assetAt(path) {
    if (typeof path !== "string")
      return;
    const local = path.replace(/^\//, "");
    return assetByPath.get(local) || assetByPath.get("public/" + local);
  }
  function titleForUse(path, owner, role) {
    const asset = assetAt(path);
    if (!asset || !owner)
      return;
    const metadata = assetMeta.get(asset.source)?.metadata;
    if (metadata?.name || metadata?.title)
      return;
    if (!titlesByUse.has(asset))
      titlesByUse.set(asset, new Set);
    titlesByUse.get(asset).add(owner + " · " + role);
  }
  function mediaRefs(r, v) {
    visitStrings(v, (s) => {
      const asset = assetAt(s);
      if (asset) {
        r.refs.push(ref("media", asset.id));
        if (!r.mediaKey && image.test(asset.source)) {
          r.mediaKey = asset.mediaKey;
          if (asset.mediaUrl)
            r.thumbnail = asset.mediaUrl;
        }
      }
    });
  }
  const unitCards = new Map;
  for (const [file, doc] of dataFiles("cards")) {
    for (const [group, entries] of Object.entries(doc))
      if (Array.isArray(entries))
        entries.forEach((c, i) => {
          const src = file + "#" + mark(group, i), kind = cardKinds[c.kind] || group, rarity = rarities[c.rarity] || c.rarity;
          const r = add("cards", c.id, c.name, kind, src, c.description);
          r.facets = labels({ "类型": kind, "稀有度": rarity, "阵营": c.factionId, "标签": c.labels });
          r.fields = fields({ "费用": c.cost, "攻击": c.attack, "气血": c.health, "装备攻击加成": c.attackBonus, "携带上限": c.limitPerDeck, "境界": c.realmId, "种族": c.race, "品阶": c.gradeId || c.grade, "灵根": c.linggen, "冷却": c.cooldownType });
          r.sections = [section("牌效", (c.effects || []).map((e) => e.text || JSON.stringify(e)))];
          mediaRefs(r, c.cardFace || c);
          if (c.cardFace) {
            titleForUse(c.cardFace.artwork, c.name, "原画");
            for (const [kind, label] of [["jade", "玉牌"], ["scroll", "卷轴"]]) {
              const variant = c.cardFace.variants?.[kind];
              titleForUse(variant?.preview, c.name, label + "预览");
              titleForUse(variant?.texture, c.name, label + "实装");
            }
          }
          if (c.kind === "unit")
            unitCards.set(c.id, { c, r });
        });
  }
  for (const [file, d] of dataFiles("decks")) {
    if (!Array.isArray(d.cards))
      continue;
    const id = "deck:" + basename(file, ".json"), r = add("cards", id, d.name, "牌组", file, d.description);
    r.facets = labels({ "类型": "牌组" });
    r.fields = fields({ "总张数": d.cards.reduce((n, c) => n + (c.count ?? 1), 0) });
    r.sections = [section("组成", d.cards.map((c) => (rows.cards.get(c.id)?.title || c.id) + " × " + (c.count ?? 1)))];
    r.refs = d.cards.map((c) => ref("cards", c.id));
  }
  for (const [f, e] of dataFiles("encounters")) {
    const enemies = e.enemies || e.units || [];
    const r = add("encounter", e.id, e.name, "战斗", f, e.description);
    r.portraits = enemies.map((u) => {
      const card = unitCards.get(u.cardId)?.r;
      return { id: u.cardId, ...card?.mediaKey ? { mediaKey: card.mediaKey } : {}, ...card?.thumbnail ? { thumbnail: card.thumbnail } : {} };
    });
    r.facets = labels({ "难度": e.difficulty, "敌人": enemies.map((u) => unitCards.get(u.cardId)?.c.name || u.cardId), "特殊事件": (e.events || []).map((v) => v.name || v.type || v.id) });
    r.fields = fields({ "难度": e.difficulty, "出场单位": enemies.length });
    r.sections = [section("敌方阵位", enemies.map((u) => {
      const def = unitCards.get(u.cardId)?.c ?? {};
      if (!rows.monsters.has(u.cardId) && unitCards.has(u.cardId)) {
        const card = unitCards.get(u.cardId), m = add("monsters", u.cardId, def.name, "敌方单位", card.r.source, def.description);
        m.facets = labels({ "种族": def.race, "阵营": def.factionId, "稀有度": rarities[def.rarity] || def.rarity });
        m.fields = card.r.fields;
        m.sections = card.r.sections;
        m.thumbnail = card.r.thumbnail;
        m.mediaKey = card.r.mediaKey;
        m.refs.push(ref("cards", u.cardId));
      }
      r.refs.push(ref("monsters", u.cardId));
      return "位置 " + u.position + " · " + (def.name || u.cardId) + " · 攻 " + (u.attack ?? def.attack ?? "—") + " / 血 " + (u.health ?? def.health ?? "—");
    })), section("波次", e.waves), section("特殊事件", e.events)];
  }
  const stock = jsons.get("public/data/world/items.artifacts.json") || {};
  for (const [k, list] of Object.entries(stock))
    if (Array.isArray(list))
      list.forEach((o, i) => {
        const f = "public/data/world/items.artifacts.json", r = add("shop", o.id, o.name, "物品", f + "#" + mark(k, i), o.description);
        r.facets = labels({ "类型": "物品", "用途": o.type, "品阶": o.grade });
        r.fields = fields({ "品阶": o.grade, "用途": o.type, "阵营": o.factionId, "可丢弃": o.droppable });
        mediaRefs(r, o);
        titleForUse(o.iconAsset, o.name, "图标");
      });
  const people = jsons.get("public/data/world/npcs.json")?.npcs || [];
  people.forEach((o, i) => {
    const r = add("people", o.id, o.name, "人物", "public/data/world/npcs.json#" + mark("npcs", i), o.description);
    r.facets = labels({ "阵营": o.factionId, "身份": o.roles, "标签": o.tags, "境界": o.realm });
    r.fields = fields({ "身份": o.roles, "境界": o.realm, "性别": o.gender, "阵营": o.factionId, "目标": o.goal, ...o.abilities });
    mediaRefs(r, o);
    titleForUse(o.portraitAsset, o.name, "立绘");
  });
  for (const [asset, titles] of titlesByUse)
    if (titles.size === 1)
      asset.title = [...titles][0];
  const shopSources = new Map, mapEvents = new Map;
  for (const [f, d] of dataFiles("mijing")) {
    for (const [node, o] of Object.entries(d.shopsByNodeId || {})) {
      const sid = "shop:" + d.id + ":" + node, source = f + "#" + mark("shopsByNodeId", node);
      const s = add("shop", sid, o.title, "商店", source, o.description);
      s.facets = labels({ "类型": "商店" });
      s.fields = fields({ "货架数": o.offers?.length || 0 });
      shopSources.set(f + "#" + node, sid);
      (o.offers || []).forEach((offer, i) => {
        const id = sid + ":" + offer.id, cost = offer.cost?.spiritStones;
        const r = add("shop", id, offer.label, "货架", source + mark("offers", i), offer.description);
        r.facets = labels({ "类型": "货架", "商店": o.title, "价格": cost });
        r.fields = fields({ "灵石售价": cost, "库存": offer.stock, "商人": o.title });
        for (const c of offer.rewards?.cards || [])
          r.refs.push(ref("cards", c.id));
        for (const c of offer.rewards?.items || [])
          r.refs.push(ref("shop", c.id));
        r.sections = [section("购得物品", [...offer.rewards?.cards || [], ...offer.rewards?.items || []].map((v) => (rows.cards.get(v.id)?.title || rows.shop.get(v.id)?.title || v.id) + " × " + (v.count ?? 1)))];
        s.refs.push(ref("shop", id));
      });
    }
    for (const [node, event] of Object.entries(d.eventsByNodeId || {}))
      mapEvents.set(f + "#" + node, event);
  }
  for (const [f, m] of dataFiles("mijing"))
    if (Array.isArray(m.nodes)) {
      const project = add("map", m.id, m.name, "秘境", f, m.description);
      project.facets = labels({ "类型": "秘境", "地图": m.name });
      project.fields = fields({ "房间数": m.nodes.length, "起点": m.entryNodeId });
      project.diagram = m.nodes.map((n) => ({ id: m.id + "::" + n.id, label: n.label || n.id, layer: n.layer ?? 0, kind: nodeKinds[n.type] || n.type, to: (n.outgoingNodeIds || []).map((id) => m.id + "::" + id) }));
      m.nodes.forEach((n, i) => {
        const id = m.id + "::" + n.id, kind = nodeKinds[n.type] || n.type, p = n.payloadRef || {};
        const r = add("map", id, n.label || n.id, kind, f + "#" + mark("nodes", i), n.description);
        r.facets = labels({ "类型": kind, "地图": m.name, "层级": n.layer });
        r.fields = fields({ "类型": kind, "层级": n.layer, "地图": m.name });
        r.refs = (n.outgoingNodeIds || []).map((id) => ref("map", m.id + "::" + id));
        project.refs.push(ref("map", id));
        if (p.kind === "encounter")
          r.refs.push(ref("encounter", p.encounterResourceId || p.ref));
        const key = "public/" + String(p.contentFile || "").replace(/^\/?(?:public\/)?/, "") + "#" + p.ref;
        if (shopSources.has(key))
          r.refs.push(ref("shop", shopSources.get(key)));
        const ev = mapEvents.get(key);
        if (ev) {
          r.body = ev.description || r.body;
          r.sections.push(section("事件结果", (ev.pool || []).map((v) => v.label + " · " + (v.description || "") + "（权重 " + (v.weight ?? 1) + "）")));
        }
      });
    }
  for (const [kind, dict] of Object.entries(rows))
    for (const row of dict.values()) {
      const seen = new Set;
      row.refs = row.refs.filter((t) => {
        const key = t.note + "\x00" + t.id;
        if (!rows[t.note]?.has(t.id) || seen.has(key))
          return false;
        seen.add(key);
        return true;
      });
      row.sections = row.sections.filter((s) => s.lines.length);
      if (!row.thumbnail)
        delete row.thumbnail;
    }
  return Object.fromEntries(kinds.map((kind) => [kind, { initialState: {}, initialConfig: { kind, records: [...rows[kind].values()] } }]));
}
function catalogLinks(catalog) {
  const all = new Map, result = new Map;
  for (const [note, { initialConfig: c }] of Object.entries(catalog))
    for (const row of c.records)
      all.set(note + "\x00" + row.id, row);
  function connect(note, recordId, to, targetId, label) {
    const k = [note, recordId, to, targetId].join("\x00");
    if (!result.has(k))
      result.set(k, { source: { noteId: note, recordId }, target: { noteId: to, recordId: targetId }, label: label.slice(0, 160) });
  }
  for (const [note, { initialConfig: c }] of Object.entries(catalog))
    for (const row of c.records)
      for (const t of row.refs) {
        const target = all.get(t.note + "\x00" + t.id);
        if (target) {
          connect(note, row.id, t.note, t.id, target.title);
          connect(t.note, t.id, note, row.id, row.title);
        }
      }
  return [...result.values()];
}

// tools/story-index.mjs
import { readFile, readdir, realpath } from "node:fs/promises";
import { dirname, join as join2, relative, resolve, sep } from "node:path";
async function listMarkdown(root, dir = "knowledge") {
  const entries = await readdir(join2(root, dir), { withFileTypes: true });
  const groups = await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map((entry) => {
    const path = dir + "/" + entry.name;
    if (entry.isDirectory())
      return listMarkdown(root, path);
    return entry.isFile() && /\.md(?:own|arkdown)?$/i.test(entry.name) ? [path] : [];
  }));
  return groups.flat();
}
function frontmatter(text) {
  const header = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!header)
    return {};
  return Object.fromEntries(header[1].split(/\r?\n/).flatMap((line) => {
    const pair = /^([\w-]+):\s*(.*?)\s*$/.exec(line);
    return pair ? [[pair[1], pair[2].replace(/^(['"])([\s\S]*)\1$/, "$2")]] : [];
  }));
}
function plain(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").replace(/<!--[\s\S]*?-->/g, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#>*_`]/g, "").replace(/\s+/g, " ").trim();
}
function choiceLinks(text, source) {
  const section = /^##\s+选项\s*$([\s\S]*?)(?=^#{1,2}\s|$(?![\s\S]))/m.exec(text)?.[1] ?? "";
  return Array.from(section.matchAll(/^\s*(?:[-*+]\s+|\d+\.\s+)\[([^\]]+)\]\(([^)]+)\)/gm), ([, label, url]) => ({ label, path: resolve(dirname(source), decodeURIComponent(url.split("#")[0])) }));
}
function inside(root, path) {
  const part = relative(root, path);
  if (part === ".." || part.startsWith(".." + sep))
    throw Error("剧情源超出项目范围：" + path);
  return part.split(sep).join("/");
}
function backgroundAsset(value, assets) {
  if (typeof value !== "string" || !/\.(png|jpe?g|webp|svg|avif)$/i.test(value))
    return;
  const path = value.startsWith("public/") ? value : "public/" + value.replace(/^\//, "");
  return assets.get(path) || "asset:" + path;
}
function sceneRefs(source, assets) {
  const ids = { speakerId: "people", npcId: "people", actorId: "people", relationId: "people", cardId: "cards", itemId: "shop", encounterId: "encounter", encounterResourceId: "encounter" };
  const refs = new Map;
  function visit(value) {
    if (!value || typeof value !== "object")
      return;
    for (const [key, v] of Object.entries(value)) {
      if (typeof v === "string") {
        let note = ids[key], id = v;
        if ((key.endsWith("Asset") || key === "portrait") && /\.(png|jpe?g|webp|svg|avif|mp3|ogg|wav)$/i.test(v)) {
          const path = v.startsWith("public/") ? v : "public/" + v.replace(/^\//, "");
          note = "media";
          id = assets.get(path) || "asset:" + path;
        }
        if (note && id !== "player")
          refs.set(note + ":" + id, { note, id });
      } else
        visit(v);
    }
  }
  visit(source);
  return [...refs.values()];
}
function markdownRefs(content, meta, assets) {
  const values = [meta];
  const parse = (text) => {
    try {
      values.push(JSON.parse(text));
    } catch {}
  };
  Object.values(meta).filter((v) => /^[{[]/.test(v)).forEach(parse);
  for (const m of content.matchAll(/<!--\s*story-[\w-]+:\s*([\s\S]*?)\s*-->/g))
    parse(m[1]);
  return sceneRefs(values, assets);
}
async function buildStory(gameRoot) {
  const root = await realpath(gameRoot);
  const catalog = JSON.parse(await readFile(join2(root, "public/data/content-catalog.json"), "utf8"));
  const assetsFile = join2(root, "public/assets/asset-manifest.json");
  const assets = await readFile(assetsFile, "utf8").then((text) => new Map(JSON.parse(text).assets.map((a) => [a.path, a.id])), (err) => {
    if (err.code === "ENOENT")
      return new Map;
    throw err;
  });
  const graphs = [], byNode = new Map;
  for (const resource of catalog.resources.filter((r) => r.kind === "story" || /^(storygraph|storycontent)$/i.test(r.kind))) {
    const file = await realpath(resolve(root, "public", resource.publicPath));
    const path = inside(root, file);
    const graph = JSON.parse(await readFile(file, "utf8"));
    if (!Array.isArray(graph.nodes))
      continue;
    const book = graph.title || resource.resourceId;
    graphs.push({ book, path, resource, graph });
    for (const node of graph.nodes) {
      const list = byNode.get(node.id) ?? [];
      list.push({ storyId: resource.resourceId, book });
      byNode.set(node.id, list);
    }
  }
  const rows = [], docs = new Map, authored = new Set, ids = new Set, pending = new Map;
  for (const path of await listMarkdown(root)) {
    const file = await realpath(join2(root, path));
    inside(root, file);
    const text = await readFile(file, "utf8"), meta = frontmatter(text), scene = meta.scene === "true" && !!meta.nodeId;
    const matches = scene ? byNode.get(meta.nodeId) ?? [] : [];
    const graph = matches.find((m) => m.storyId === meta.storyId) ?? (matches.length === 1 ? matches[0] : undefined);
    const storyId = meta.storyId || graph?.storyId || "";
    const id = scene ? meta.nodeId : path;
    if (docs.has(file) || ids.has(id))
      throw Error("重复剧情记录：" + id);
    const group = relative("knowledge", dirname(path)).split(sep).filter(Boolean);
    const folders = scene ? [graph?.book || meta.storyTitle || storyId || "未归卷剧情", ...group.length ? group : [], meta.chapter || "未分章", ...meta.act ? [meta.act] : []] : ["资料", ...group];
    const title = meta.title || /^#\s+(.+)$/m.exec(text)?.[1] || path.split("/").pop();
    const row = { id, title, path, folders, body: text, search: plain(text), choices: [], refs: markdownRefs(text, meta, assets), backgroundAssetId: backgroundAsset(meta.backgroundAsset, assets), ...scene ? { storyId, nodeId: meta.nodeId } : {} };
    rows.push(row);
    docs.set(file, row);
    ids.add(id);
    if (scene && storyId)
      authored.add(JSON.stringify([storyId, meta.nodeId]));
    if (scene)
      pending.set(row, choiceLinks(text, file));
  }
  for (const [row, targets] of pending) {
    row.choices = targets.flatMap((edge) => docs.has(edge.path) ? [{ label: edge.label, to: docs.get(edge.path).id }] : []);
  }
  for (const { book, path, graph, resource } of graphs) {
    const route = (id) => authored.has(JSON.stringify([resource.resourceId, id])) ? id : resource.resourceId + "::" + id;
    for (const node of graph.nodes) {
      if (authored.has(JSON.stringify([resource.resourceId, node.id])))
        continue;
      const choices = (graph.choices ?? []).filter((c) => c.from === node.id);
      const words = [node.title, node.summary, node.detail, node.body, ...(node.dialogues ?? []).flatMap((d) => [d.speakerName, d.text]), ...choices.map((c) => c.text)];
      rows.push({
        id: route(node.id),
        title: node.title || node.id,
        path,
        folders: [book, node.chapter || "正文", ...node.act ? [node.act] : []],
        refs: sceneRefs([node, ...choices], assets),
        backgroundAssetId: backgroundAsset(node.backgroundAsset, assets),
        body: JSON.stringify({ nodes: [node], choices }),
        search: words.filter(Boolean).join(" "),
        choices: choices.map((c) => ({ label: c.text || c.id, to: route(c.to) })),
        storyId: resource.resourceId,
        nodeId: node.id
      });
    }
  }
  const launched = [];
  for (const resource of catalog.resources.filter((r) => r.kind === "hub")) {
    const file = await realpath(resolve(root, "public", resource.publicPath));
    inside(root, file);
    const hub = JSON.parse(await readFile(file, "utf8"));
    const locations = Array.isArray(hub.locations) ? hub.locations : [];
    for (const location of [...locations.filter((l) => l.id === hub.defaultLocationId), ...locations.filter((l) => l.id !== hub.defaultLocationId)])
      for (const action of location.actions ?? [])
        if (action.kind === "startStory" && typeof action.storyResourceId === "string")
          launched.push(action.storyResourceId);
  }
  const isMainline = ({ graph }) => {
    const tags = graph.nodes.find((node) => node.id === graph.entryNodeId)?.tags ?? [];
    return tags.includes("主线") && !tags.some((tag) => ["教学", "教程", "示例"].includes(tag));
  };
  const ordered = [...graphs.filter((g) => launched.includes(g.resource.resourceId) && isMainline(g)), ...graphs.filter(isMainline), ...graphs];
  const initialId = ordered.map(({ graph, resource }) => rows.find((row) => row.storyId === resource.resourceId && row.nodeId === graph.entryNodeId)?.id).find(Boolean) || rows.find((row) => row.nodeId)?.id || rows[0]?.id;
  return { initialState: {}, initialConfig: {
    storyIndex: rows,
    initialScene: initialId ?? ""
  } };
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
var audio2 = (row) => row.facets["媒介"]?.includes("声音") || /\.(?:mp3|aac|wav|oga|ogg|flac|m4a)$/i.test(row.source);
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
    const portrait = rows.find((r) => r.group === "人设" || r.group === "立绘"), background = rows.find((r) => r.group === "背景"), sound = rows.find(audio2);
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
var digest = (value) => createHash2("sha256").update(value).digest("hex");
var run = promisify(execFile);
var defaultRepo = "https://github.com/kllilizxc/CardGame";
var missingMessage = `只问用户一个问题来选择 CardGame 游戏来源（默认仓库 ${defaultRepo}，会自动克隆；也可选择本机已检出的 CardGame 目录），然后用 extension.invoke({extension:"game-project",method:"bind",input:{source}}) 绑定。`;
function contained(root, file) {
  const part = relative2(root, file);
  if (isAbsolute(part) || part === ".." || part.startsWith(".." + sep2))
    throw Error("文件必须位于选定项目内");
  return file;
}
async function inside2(root, path) {
  return contained(root, await realpath2(join3(root, path)));
}
function regularRemote(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "github.com" || url.port || url.username || url.password || url.search || url.hash || !/^\/[a-z\d_.-]+\/[a-z\d_.-]+\/?$/i.test(url.pathname))
    throw Error("请提供本机绝对路径或不含凭据的 HTTPS GitHub 仓库地址");
  return url.origin + url.pathname.replace(/\/$/, "").replace(/\.git$/, "") + ".git";
}
async function git2(args, signal) {
  const result = await run("git", ["-c", "core.fsmonitor=false", "-c", "core.hooksPath=" + (process.platform === "win32" ? "NUL" : "/dev/null"), ...args], { signal, encoding: "utf8", timeout: 180000, maxBuffer: 4 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_LFS_SKIP_SMUDGE: "1" } });
  return result.stdout.trim();
}
async function checkout(source, dir, signal) {
  if (isAbsolute(source)) {
    const root = await realpath2(source);
    if (await realpath2(await git2(["-C", root, "rev-parse", "--show-toplevel"], signal)) !== root)
      throw Error("请选择 Git 工作树的根目录");
    return root;
  }
  const url = regularRemote(source), managed = join3(dir, "repos", digest(url));
  await mkdir(dirname2(managed), { recursive: true });
  try {
    await access(managed);
    if (await git2(["-C", managed, "config", "--get", "remote.origin.url"], signal) !== url)
      throw Error("已有托管检出的来源不匹配");
    return await realpath2(managed);
  } catch (err) {
    if (err.code !== "ENOENT")
      throw err;
  }
  const temp = await mkdtemp(join3(dirname2(managed), ".clone-"));
  try {
    try {
      await git2(["clone", "--no-checkout", "--no-recurse-submodules", "--", url, temp], signal);
      const names = await git2(["-C", temp, "config", "--name-only", "--get-regexp", "^filter\\..*\\.(clean|smudge|process|required)$"], signal).catch((error) => {
        if (error.code === 1)
          return "";
        throw error;
      });
      const overrides = names.split(/\r?\n/).filter(Boolean).flatMap((key) => ["-c", key + (key.endsWith(".required") ? "=false" : "=")]);
      await git2(["-C", temp, ...overrides, "-c", "submodule.recurse=false", "checkout", "--force", "HEAD", "--", "."], signal);
    } catch (error) {
      signal?.throwIfAborted();
      throw Error(error.killed ? "获取游戏仓库超时。" : "无法获取游戏仓库，请确认本机 Git 可以访问该地址。");
    }
    await rename(temp, managed);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
  return await realpath2(managed);
}
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
  const normalized = String(filename).split(sep2).join("/");
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
var formats = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".oga": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".opus": "audio/ogg"
};
function gameProject(host, { onBuild } = {}) {
  const app = host.app, pending = new Map, roots = new Map, fileCaches = new Map;
  let closing = false;
  function directory(id) {
    return join3(host.dataRoot, "providers", name, digest(id));
  }
  function cachesFor(root) {
    let entry = fileCaches.get(root);
    if (!entry) {
      entry = { hashCache: new Map, gitCache: {} };
      fileCaches.set(root, entry);
    }
    return entry;
  }
  async function computeProjection(root) {
    onBuild?.(root);
    const { hashCache, gitCache } = cachesFor(root);
    const [story, catalog] = await Promise.all([buildStory(root), Promise.resolve().then(() => buildCatalog(root, { hashCache, gitCache }))]);
    const catalogByKind = Object.fromEntries(catalogKinds.map((k) => [k, catalog[k].initialConfig.records]));
    const catalogMap = Object.fromEntries(catalogKinds.map((k) => [k, new Map(catalogByKind[k].map((r) => [r.id, r]))]));
    const scenes = story.initialConfig.storyIndex;
    const sceneMap = new Map(scenes.map((s) => [s.id, s]));
    const tree = storyTree(scenes);
    const edges = catalogLinks(catalog);
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
  function ensureRoot(root) {
    let entry = roots.get(root);
    if (entry)
      return entry;
    entry = { listeners: new Set, timer: undefined, fsWatcher: undefined, epoch: 0, cached: null };
    if (!closing) {
      try {
        entry.fsWatcher = watchFs(root, { recursive: true }, (_event, filename) => {
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
    const b = await binding(app, stored.desktopId);
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
      const b = await binding(app, desktopId).catch(() => {
        return;
      });
      const nextRoot = b?.root || "";
      if (disposed || closing || nextRoot === currentRoot)
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
    if (!b?.root)
      return { configured: false, ready: false, message: missingMessage };
    try {
      await access(await inside2(b.root, "public/data/content-catalog.json"));
      await access(await inside2(b.root, "knowledge/index.md"));
      const commit = await git2(["-C", b.root, "rev-parse", "--verify", "HEAD^{commit}"], ctx.signal).catch(() => b.commit || "");
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
    const rawPath = input.path.replace(/^\/+/, ""), file = await inside2(b.root, rawPath);
    const allowed = relative2(b.root, file).split(sep2).join("/"), format = extname2(file).toLowerCase();
    if (![".md", ".markdown", ".mdown", ".json"].includes(format))
      throw Error("不支持的项目文档格式");
    const content = await readFile2(file, "utf8"), rows = content.split(/\r?\n/);
    const start = Math.max(1, Math.trunc(Number(input.startLine)) || 1);
    const count = Math.min(500, Math.max(1, Math.trunc(Number(input.maxLines)) || 240)) * Math.min(100, Math.max(1, Math.trunc(Number(input.pages)) || 1));
    return {
      resourcePath: join3(b.root, "knowledge", "index.md"),
      path: allowed,
      displayPath: allowed,
      format,
      content: rows.slice(start - 1, start - 1 + count).join(`
`),
      revision: digest(content),
      startLine: start,
      endLine: Math.min(rows.length, start + count - 1),
      totalLines: rows.length
    };
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
    const mime = formats[extname2(sourcePath).toLowerCase()];
    if (!mime)
      return null;
    let file;
    try {
      file = await inside2(b.root, sourcePath);
    } catch {
      return null;
    }
    const info = await stat(file).catch(() => null);
    if (!info || !info.isFile())
      return null;
    if (info.size > 32 * 1024 * 1024)
      throw Error("素材超过预览大小上限");
    const bytes = await readFile2(file);
    let preview = bytes, previewMime = mime;
    if (mime.startsWith("image/") && mime !== "image/svg+xml" && bytes.length > 256 * 1024) {
      const require2 = createRequire(import.meta.url);
      const sharp = createRequire(require2.resolve("@realiz3r/worka/package.json"))("sharp");
      preview = await sharp(bytes, { animated: false }).rotate().resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true }).webp({ quality: 65, effort: 2 }).toBuffer();
      previewMime = "image/webp";
    }
    if (preview.length > 700 * 1024)
      return null;
    return "data:" + previewMime + ";base64," + preview.toString("base64");
  }
  async function bind(id, source, caller, signal) {
    const origin = typeof source === "string" && source.trim() ? source.trim() : defaultRepo;
    const dir = directory(id);
    const root = await checkout(origin, dir, signal);
    for (const path of ["public", "public/data", "knowledge", "public/data/content-catalog.json", "knowledge/index.md"])
      await inside2(root, path);
    for (const path of ["public/assets", "public/assets/asset-manifest.json", "art-references"]) {
      try {
        await inside2(root, path);
      } catch (error) {
        if (error.code !== "ENOENT")
          throw error;
      }
    }
    const commit = await git2(["-C", root, "rev-parse", "--verify", "HEAD^{commit}"], signal);
    const members = await desktopNoteMap(id);
    if (!Object.keys(members).length)
      throw Error("当前桌面没有绑定游戏项目连接的便笺");
    fileCaches.delete(root);
    const existing = roots.get(root);
    if (existing) {
      existing.epoch++;
      existing.cached = null;
    }
    signal?.throwIfAborted();
    await app.core.writeRecord("states", recordKey(id), { source: origin, root, commit, verifiedAt: Date.now() });
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
      const b = await binding(app, note.desktopId);
      if (!b?.root)
        return [];
      let adapter = "";
      if (typeof app.dispatch === "function") {
        const src = await app.dispatch("desktop.source", { desktopId: note.desktopId }, { kind: "user" }).catch(() => null);
        if (src?.directory) {
          try {
            adapter = await inside2(await realpath2(src.directory), "playtest/preview.config.mjs");
          } catch {}
        }
      }
      return [`已绑定 CardGame 仓库：${b.root}${adapter ? `；试玩适配器：${adapter}` : ""}。`];
    },
    async invoke(method, input, caller, signal) {
      if (method !== "bind")
        throw Error("未知游戏项目操作 " + method);
      const id = await desktopForCommand(app, caller, input?.desktopId);
      const source = typeof input?.source === "string" && input.source.trim() ? input.source.trim() : defaultRepo;
      const current = pending.get(id);
      if (current) {
        if (current.source === source)
          return current.work;
        throw Error("当前桌面正在绑定另一个游戏仓库");
      }
      const work = bind(id, source, caller, signal);
      pending.set(id, { source, work });
      try {
        return await work;
      } finally {
        pending.delete(id);
      }
    },
    beginClose() {
      closing = true;
      for (const state of roots.values()) {
        clearTimeout(state.timer);
        state.fsWatcher?.close();
        state.cached = null;
      }
      roots.clear();
    },
    async close() {
      this.beginClose();
      await Promise.allSettled([...pending.values()].map((v) => v.work));
      fileCaches.clear();
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
