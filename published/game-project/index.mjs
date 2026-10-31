var __esm = (fn, res, err) => () => {
  if (fn)
    try {
      res = fn(fn = 0);
    } catch (e) {
      err = [e];
    }
  if (err)
    throw err[0];
  return res;
};

// tools/catalog-index.mjs
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join as join2, basename, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
function walk(root, dir) {
  if (!existsSync(join2(root, dir)))
    return [];
  return readdirSync(join2(root, dir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, "en")).flatMap((e) => {
    const path = dir + "/" + e.name;
    return e.isDirectory() ? walk(root, path) : e.isFile() ? [path] : [];
  });
}
function git(root, ...args) {
  try {
    return execFileSync("git", ["-c", "core.fsmonitor=false", "-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 }).trimEnd();
  } catch {
    return "";
  }
}
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
function buildCatalog(root) {
  const rows = Object.fromEntries(kinds.map((k) => [k, new Map]));
  const head = git(root, "rev-parse", "HEAD");
  const remote = git(root, "config", "--get", "remote.origin.url").match(/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i);
  const tracked = new Map(git(root, "ls-tree", "-rz", "HEAD", "--", "public", "art-references").split("\x00").flatMap((line) => {
    const match = /^100\d+ blob ([a-f0-9]+)\t([\s\S]+)$/.exec(line);
    return match ? [[match[2], match[1]]] : [];
  }));
  const base = remote && head ? "https://raw.githubusercontent.com/" + remote[1] + "/" + remote[2] + "/" + head + "/" : "";
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
  const manifest = existsSync(join2(root, "public/assets/asset-manifest.json")) ? parse(root, "public/assets/asset-manifest.json") : {};
  const assetMeta = new Map((manifest.assets || []).map((a) => [a.path, a]));
  const assetByPath = new Map, titlesByUse = new Map;
  for (const f of [...walk(root, "public"), ...walk(root, "art-references")].filter((f) => image.test(f) || audio.test(f))) {
    const a = assetMeta.get(f), usage = assetType(f, JSON.stringify(a?.metadata || {})), id = a?.id || "asset:" + f;
    const row = add("media", id, a?.metadata?.name || a?.metadata?.title || basename(f), usage, f);
    const bytes = readFileSync(join2(root, f)), digest = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    row.mediaKey = f + "?v=" + digest;
    row.facets = labels({ "媒介": audio.test(f) ? "声音" : "图像", "用途": usage, "格式": extname(f).slice(1).toUpperCase(), "目录": f.split("/").slice(0, 3).join("/"), "标签": a?.tags });
    row.fields = fields({ "文件": f, "大小": statSync(join2(root, f)).size + " B", "当前版本": a?.currentVersionId });
    const oid = tracked.get(f);
    if (base && oid && createHash(oid.length === 64 ? "sha256" : "sha1").update("blob " + bytes.length + "\x00").update(bytes).digest("hex") === oid)
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
  const hash = createHash("sha256");
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
      hash.update(kind + "\x00" + JSON.stringify(row));
    }
  const revision = hash.digest("hex");
  return Object.fromEntries(kinds.map((kind) => [kind, { initialState: {}, initialConfig: { kind, revision, records: [...rows[kind].values()] } }]));
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
var kinds, cardKinds, rarities, nodeKinds, image, audio, values = (v) => Array.isArray(v) ? v : v == null ? [] : [v], words = (v) => values(v).map((x) => typeof x === "string" ? x : typeof x === "number" ? String(x) : JSON.stringify(x)).filter(Boolean), labels = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, [...new Set(words(v))]]).filter(([, v]) => v.length)), fields = (obj) => Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== "").map(([name, v]) => ({ name, value: words(v).join(" · ") })), section = (title, lines) => ({ title, lines: words(lines) }), ref = (note, id) => ({ note, id }), parse = (root, file) => JSON.parse(readFileSync(join2(root, file), "utf8")), mark = (...parts) => "/" + parts.map((x) => String(x).replace(/~/g, "~0").replace(/\//g, "~1")).join("/"), encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");
var init_catalog_index = __esm(() => {
  kinds = ["map", "encounter", "cards", "monsters", "people", "shop", "media"];
  cardKinds = { unit: "单位牌", artifact: "法器", talisman: "符箓", pill: "丹药", field: "场地", skill: "技能" };
  rarities = { common: "普通", uncommon: "优秀", rare: "稀有", epic: "史诗", legendary: "传说" };
  nodeKinds = { battle: "战斗", boss: "首领", event: "事件", shop: "商店", extract: "撤离", entrance: "入口", rest: "休整" };
  image = /\.(?:png|jpe?g|webp|gif|avif|svg|bmp)$/i;
  audio = /\.(?:mp3|aac|oga|ogg|wav|m4a|flac|opus)$/i;
});

// provider/index.mjs
import { createHash as createHash2 } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { access, lstat, mkdir, mkdtemp, readFile as readFile3, readdir as readdir2, realpath as realpath2, rename, rm, writeFile } from "node:fs/promises";
import { dirname as dirname2, extname as extname2, isAbsolute, join as join4, relative as relative2, resolve as resolve2, sep as sep2 } from "node:path";

// tools/studio.mjs
import { readFile as readFile2 } from "node:fs/promises";
import { join as join3 } from "node:path";
import { execFileSync as execFileSync2 } from "node:child_process";

// tools/story-index.mjs
import { readFile, readdir, realpath } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
async function listMarkdown(root, dir = "knowledge") {
  const entries = await readdir(join(root, dir), { withFileTypes: true });
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
  const catalog = JSON.parse(await readFile(join(root, "public/data/content-catalog.json"), "utf8"));
  const assetsFile = join(root, "public/assets/asset-manifest.json");
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
    const file = await realpath(join(root, path));
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
    const row = { id, title, path, folders, body: text, search: plain(text), choices: [], refs: markdownRefs(text, meta, assets), ...scene ? { storyId, nodeId: meta.nodeId } : {} };
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
        body: JSON.stringify({ nodes: [node], choices }),
        search: words.filter(Boolean).join(" "),
        choices: choices.map((c) => ({ label: c.text || c.id, to: route(c.to) })),
        storyId: resource.resourceId,
        nodeId: node.id
      });
    }
  }
  const preferred = graphs.flatMap(({ graph, resource }) => [graph.entryNodeId, resource.resourceId + "::" + graph.entryNodeId]);
  const initialId = rows.find((row) => row.nodeId && row.path.endsWith(".md") && preferred.includes(row.id))?.id || rows.find((row) => row.nodeId)?.id || rows[0]?.id;
  return { initialState: {}, initialConfig: {
    resources: [{ title: "CardGame", path: join(root, "knowledge/index.md"), root, linkBase: root }],
    storyIndex: rows,
    initialScene: initialId ?? ""
  } };
}
function boundStoryConfig(config) {
  if (!config.resources?.length)
    throw Error("剧情知识库缺少已绑定的项目资料入口。");
  return { ...config, storyIndex: config.storyIndex.map((row) => ({ ...row, body: "" })) };
}

// tools/studio.mjs
init_catalog_index();
var catalogKeys = ["map", "encounter", "cards", "monsters", "people", "shop", "media"];
var referenceNotes = ["story", ...catalogKeys, "preview"];
var alias = (note) => "STUDIO_NOTE_" + note.toUpperCase() + "_ID";
var json = async (file) => JSON.parse(await readFile2(file, "utf8"));
async function projectData(root) {
  const commit = execFileSync2("git", ["-C", root, "rev-parse", "--verify", "HEAD^{commit}"], { encoding: "utf8" }).trim();
  const [story, catalog, registry] = await Promise.all([buildStory(root), buildCatalog(root), json(join3(root, "public/data/content-catalog.json"))]);
  const links = catalogLinks(catalog);
  const graph = (n, id, t, other, label) => links.push({ source: { noteId: n, recordId: id }, target: { noteId: t, recordId: other }, label });
  const play = (n, id, entry, label) => graph(n, id, "preview", "play:" + JSON.stringify(entry), label);
  const records = Object.fromEntries(Object.entries(catalog).map(([key, n]) => [key, new Map(n.initialConfig.records.map((row) => [row.id, row]))]));
  for (const scene of story.initialConfig.storyIndex) {
    for (const ref of scene.refs || []) {
      const target = records[ref.note]?.get(ref.id);
      if (!target)
        continue;
      graph("story", scene.id, ref.note, ref.id, target.title);
      graph(ref.note, ref.id, "story", scene.id, scene.title);
    }
    if (scene.nodeId && scene.storyId)
      play("story", scene.id, { kind: "story", resourceId: scene.storyId, nodeId: scene.nodeId }, "试玩此场景");
  }
  const byPath = new Map(registry.resources.map((r) => ["public/" + r.publicPath.replace(/^\/+/, ""), r]));
  for (const key of ["map", "encounter"]) {
    for (const row of records[key].values()) {
      const [file, pointer] = row.source.split("#"), resource = byPath.get(file);
      if (!resource)
        continue;
      const encounter = key === "map" && pointer && row.refs.find((x) => x.note === "encounter");
      if (encounter) {
        const battle = records.encounter.get(encounter.id);
        const entry = byPath.get(battle?.source.split("#")[0]);
        if (entry) {
          play(key, row.id, { kind: "encounter", resourceId: entry.resourceId }, "试玩此战斗");
          continue;
        }
      }
      play(key, row.id, { kind: key, resourceId: resource.resourceId }, key === "encounter" ? "试玩此战斗" : "从秘境入口试玩");
    }
  }
  return { commit, catalog, story, links };
}
function referenceCode(links) {
  const declarations = links.map(({ source, target, label }) => ({ source: { ...source, noteId: alias(source.noteId) }, target: { ...target, noteId: alias(target.noteId) }, label }));
  return `import {defineConnection} from '@dsh-workbench/runtime/connection';
export default defineConnection({roles:{},on:{},links:[
` + declarations.map((link) => "  " + JSON.stringify(link)).join(`,
`) + `
]});
`;
}

// provider/index.mjs
var name = "game-project";
var inject = ["worka"];
var digest = (value) => createHash2("sha256").update(value).digest("hex");
var run = promisify(execFile);
var missingMessage = "在本桌面对话选择已有 CardGame 的绝对路径，或确认默认仓库 https://github.com/kllilizxc/CardGame。使用 extension.invoke，extension 为 game-project，method 为 bind，input.source 为选定的目录或 HTTPS GitHub 地址。";
function contained(root, file) {
  const part = relative2(root, file);
  if (isAbsolute(part) || part === ".." || part.startsWith(".." + sep2))
    throw Error("文件必须位于选定项目内");
  return file;
}
async function inside2(root, path) {
  return contained(root, await realpath2(join4(root, path)));
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
  const url = regularRemote(source), managed = join4(dir, "repos", digest(url));
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
  const temp = await mkdtemp(join4(dirname2(managed), ".clone-"));
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
var kindOf = (project, noteId) => referenceNotes.find((key) => project?.noteIds?.[key] === noteId);
var sourceOf = (app, id, caller, signal) => app.dispatch("desktop.source", { desktopId: id }, caller, signal);
function writable(caller) {
  if (!caller || caller.readOnly || caller.dryRun || caller.replay || caller.skillCause || !["user", "agent"].includes(caller.kind))
    throw Error("需要当前桌面的可写用户对话");
}
async function desktopForCommand(app, caller, requested) {
  writable(caller);
  if (caller.noteId || caller.controlNoteId)
    throw Error("请选择桌面级的游戏项目设置");
  const connection = caller.providerConnection;
  if (connection && (caller.kind !== "agent" || !caller.sessionId || connection.provider !== name || connection.connectionId !== name || !connection.desktopId))
    throw Error("当前对话未绑定此游戏项目连接");
  if (caller.kind === "user" && !caller.sessionId) {
    if (typeof requested !== "string" || !requested.trim())
      throw Error("请选择目标桌面");
    return requested;
  }
  const s = (await app.core.getSession(caller.sessionId))?.value;
  if (!s?.desktopId || s.noteId || s.skillConnectionId || s.delegationId || s.purpose || s.contextMode === "task" || s.agentObject || s.parentSessionId || caller.noteId || requested && requested !== s.desktopId)
    throw Error("请通过当前桌面的原生对话连接项目");
  if (connection && connection.desktopId !== s.desktopId)
    throw Error("游戏项目连接不属于当前桌面");
  return s.desktopId;
}
async function binding(app, id) {
  return (await app.core.readRecord("states", recordKey(id)))?.value;
}
async function replaceSource(file, code) {
  const tmp = await mkdtemp(join4(dirname2(file), ".references-"));
  try {
    await writeFile(join4(tmp, "connection.ts"), code);
    await rename(join4(tmp, "connection.ts"), file);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}
async function links(app, caller, project, items, signal) {
  const id = project.relationIds?.references, path = project.relationPaths?.references;
  if (!id || !path)
    return;
  const root = await realpath2(project.directory), parent = await inside2(root, path);
  const file = join4(parent, "connection.ts");
  if (!(await lstat(file)).isFile())
    throw Error("引用文件必须是当前桌面作者目录中的普通文件");
  const code = referenceCode(items.filter((l) => project.noteIds[l.source.noteId] && project.noteIds[l.target.noteId]));
  const prior = await readFile3(file, "utf8");
  if (prior && !prior.startsWith(referenceCode([]).split("links:[")[0] + "links:["))
    throw Error("内容引用脚本已修改，请先单独保存再重建游戏索引");
  const rel = await app.dispatch("connection.get", { id }, caller, signal);
  const activate = async (signal) => {
    const latest = await app.dispatch("connection.get", { id }, caller, signal);
    if (latest.enabled !== false)
      await app.dispatch("connection.update", { id, revision: latest.revision, change: { enabled: true } }, caller, signal);
  };
  const changed = prior !== code;
  if (changed)
    await replaceSource(file, code);
  const undo = async () => {
    if (!changed || await readFile3(file, "utf8") !== code)
      return;
    await replaceSource(file, prior);
    if (rel.enabled !== false)
      await activate();
  };
  try {
    if (rel.enabled !== false)
      await activate(signal);
  } catch (error) {
    await undo();
    throw error;
  }
  return undo;
}
function projectFiles(data, root, adapter) {
  return {
    ...Object.fromEntries(Object.entries(data.catalog).map(([k, v]) => [k, v.initialConfig])),
    story: boundStoryConfig(data.story.initialConfig),
    preview: { gameCommit: data.commit, gameRoot: root, adapter }
  };
}
function gameProject(host) {
  const app = host.app, pending = new Map;
  function directory(id) {
    return join4(host.dataRoot, "providers", name, digest(id));
  }
  async function member(ctx) {
    const { noteId, providerConnection: connection } = ctx.scope;
    if (!noteId || connection?.provider !== name || connection.connectionId !== "game-project")
      throw Error("此便笺没有选择游戏项目连接");
    const note = (await app.core.getNote(noteId))?.value;
    if (!note?.desktopId || note.archived)
      throw Error("游戏便笺已移除");
    if (connection.desktopId !== note.desktopId)
      throw Error("游戏项目连接不属于当前桌面");
    const b = await binding(app, note.desktopId), kind = b && kindOf(b, noteId);
    if (b && !kind)
      throw Error("便笺不属于已绑定桌面的内容库");
    return { id: note.desktopId, kind, b };
  }
  async function readIndex(id, kind, b) {
    if (!b)
      return null;
    try {
      return JSON.parse(await readFile3(join4(directory(id), "snapshots", b.snapshot, kind + ".json"), "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT")
        throw error;
      const current = await binding(app, id);
      if (!current || current.snapshot === b.snapshot)
        throw error;
      return readIndex(id, kind, current);
    }
  }
  async function status(_, ctx) {
    const { id, b } = await member(ctx);
    if (!b)
      return { configured: false, ready: false, message: missingMessage };
    try {
      await access(await inside2(b.root, "public/data/content-catalog.json"));
      await access(join4(directory(id), "snapshots", b.snapshot, "story.json"));
      return { ready: true, configured: true, verifiedAt: b.verifiedAt, label: "游戏仓库", commit: b.commit };
    } catch {
      return { configured: false, ready: false, message: "无法读取已绑定的游戏目录。" + missingMessage };
    }
  }
  async function index(_, ctx) {
    const { id, kind, b } = await member(ctx);
    return readIndex(id, kind, b);
  }
  async function doc(input, ctx) {
    const { id, kind, b } = await member(ctx);
    if (!b)
      return null;
    if (kind !== "story")
      throw Error("只有剧情便笺可读取项目原文");
    if (typeof input?.path !== "string" || !input.path)
      throw Error("缺少剧情文档路径");
    const path = input.path.replace(/^\/+/, ""), file = await inside2(b.root, path);
    const allowed = relative2(b.root, file).split(sep2).join("/"), format = extname2(file).toLowerCase();
    const inKnowledge = allowed.startsWith("knowledge/") && [".md", ".markdown", ".mdown"].includes(format);
    if (!inKnowledge) {
      if (format !== ".json" || !allowed.startsWith("public/data/"))
        throw Error("不支持的剧情文档");
      const story = await readIndex(id, "story", b);
      if (!story.storyIndex.some((s) => s.path === allowed))
        throw Error("文件不在已登记的剧情内");
    }
    const content = await readFile3(file, "utf8"), rows = content.split(/\r?\n/);
    const start = Math.max(1, Math.trunc(input.startLine) || 1), count = Math.min(500, Math.max(1, Math.trunc(input.maxLines) || 240)) * Math.min(100, Math.max(1, Math.trunc(input.pages) || 1));
    return { resourcePath: join4(b.root, "knowledge", "index.md"), path: allowed, displayPath: allowed, format, content: rows.slice(start - 1, start - 1 + count).join(`
`), revision: digest(content), startLine: start, endLine: Math.min(rows.length, start + count - 1), totalLines: rows.length };
  }
  async function prepare(id, source, caller, signal) {
    const prior = await binding(app, id), origin = source ?? prior?.source;
    if (typeof origin !== "string" || !origin.trim())
      throw Error(missingMessage);
    const dir = directory(id), project = await sourceOf(app, id, caller, signal);
    if (!project || !referenceNotes.some((k) => project.noteIds?.[k]))
      throw Error("当前桌面没有游戏项目便笺");
    const members = {};
    for (const key of referenceNotes) {
      const noteId = project.noteIds[key];
      if (!noteId)
        continue;
      const saved = (await app.core.readRecord("states", noteId + ":config"))?.value?.connections?.game;
      if (saved?.provider === name && saved.connectionId === "game-project")
        members[key] = noteId;
    }
    if (!Object.keys(members).length)
      throw Error("此桌面的便笺未选择游戏项目连接");
    const root = await checkout(origin.trim(), dir, signal);
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
    const data = await projectData(root), adapter = project.noteIds.preview ? await inside2(await realpath2(project.directory), "playtest/preview.config.mjs") : "";
    const files = projectFiles(data, root, adapter), snapshot = digest(JSON.stringify(files)), snapshots = join4(dir, "snapshots");
    await mkdir(snapshots, { recursive: true });
    const dest = join4(snapshots, snapshot);
    try {
      await access(dest);
    } catch (err) {
      if (err.code !== "ENOENT")
        throw err;
      const temp = await mkdtemp(join4(snapshots, ".stage-"));
      try {
        for (const [key, index] of Object.entries(files)) {
          const bytes = JSON.stringify(index);
          if (Buffer.byteLength(bytes) > 5.9 * 1024 * 1024)
            throw Error("便笺 " + key + " 索引超过 5.9 MiB 上限");
          await writeFile(join4(temp, key + ".json"), bytes);
        }
        await rename(temp, dest);
      } finally {
        await rm(temp, { recursive: true, force: true });
      }
    }
    signal?.throwIfAborted();
    const undo = await links(app, caller, { ...project, noteIds: members }, data.links, signal);
    const value = { source: origin, root, snapshot, commit: data.commit, verifiedAt: Date.now(), noteIds: members };
    try {
      await app.core.writeRecord("states", recordKey(id), value);
    } catch (error) {
      if ((await binding(app, id))?.snapshot !== snapshot) {
        await undo?.();
        throw error;
      }
    }
    for (const file of await readdir2(snapshots)) {
      if (/^[a-f0-9]{64}$/.test(file) && file !== snapshot && file !== prior?.snapshot)
        await rm(join4(snapshots, file), { recursive: true, force: true }).catch(() => {});
    }
    return { root, commit: data.commit, scenes: files.story.storyIndex.length, links: data.links.length };
  }
  const resource = (load) => ({ access: "owner", version: "1", load, query: { load } });
  return {
    resources: { status: resource(status), index: resource(index), document: resource(doc) },
    initializers: { status: async () => {} },
    async invoke(method, input, caller, signal) {
      if (method !== "bind" && method !== "refresh")
        throw Error("未知游戏项目操作 " + method);
      const id = await desktopForCommand(app, caller, input?.desktopId);
      const source = method === "bind" ? input?.source : undefined;
      if (method === "bind" && (typeof source !== "string" || !source.trim()))
        throw Error(missingMessage);
      const current = pending.get(id);
      if (current) {
        if (current.source === source)
          return current.work;
        throw Error("当前桌面正在准备另一个游戏项目");
      }
      const work = prepare(id, source, caller, signal);
      pending.set(id, { source, work });
      try {
        return await work;
      } finally {
        pending.delete(id);
      }
    },
    async close() {
      await Promise.allSettled([...pending.values()].map((v) => v.work));
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
