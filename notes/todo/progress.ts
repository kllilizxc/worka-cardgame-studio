export type ProgressStatus = 'todo' | 'in_progress' | 'blocking' | 'done';
export type ProgressSource = 'recordProgress' | 'feedback' | 'current';
export type ProgressEntry = {
  id: string; itemId: string; status?: ProgressStatus; summary: string; conclusion?: string;
  recordedAt?: number; revision?: string; source: ProgressSource; taskId?: string; sourceId?: string;
};

/** Equality ignores formatting, never changes the preserved original. */
export const progressTextIdentity = (text = '') => text.trim().replace(/\s+/gu, ' ');
export function sameProgress(a: { status?: string; conclusion?: string }, b: { status?: string; conclusion?: string }) {
  return a.status === b.status && progressTextIdentity(a.conclusion) === progressTextIdentity(b.conclusion);
}
export const progressSummaryLimit = (text: string) => /\p{Script=Han}/u.test(text) ? 100 : 180;
const unresolved = /未(?:通过|完成|核验|验证|确认|就绪|解决|启动|执行|开始|登记|注册|交办|发送)|失败|错误|阻塞|受阻|中止|中断|终止|待(?:核验|验证|确认|处理|完成|修复|登记|注册|交办)|等待|\b(?:failed|failure|blocked|pending|unverified)\b|\bnot\s+(?:(?:yet|fully)\s+)?(?:passed?|verified|complete[d]?|ready|successful|registered|sent|started)\b/iu;
function structuralLine(line: string) {
  if(/^\s*[\[{]/u.test(line)){try{JSON.parse(line);return true;}catch{/* A bracketed business status is prose. */}}
  return /^\s*(?:[{}\[\],]+\s*$|["'][^"']+["']\s*:|(?:true|false|null)[,}]?\s*$)/u.test(line)
    || /^\s*(?:at\s+(?:new\s+)?[\w.$<>]+\s*\(|Traceback\b|File\s+".+",\s+line\s+\d+|During handling of the above exception)/u.test(line);
}
function businessText(line: string) {
  if(/^\s*error\s*:?\s*$/iu.test(line))return '执行返回错误';
  return line.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/u, '')
    .replace(/\[([^\]]+)\]\([^\s)]+\)/gu, '$1').replace(/`([^`]+)`/gu, '$1').replace(/\*\*([^*]+)\*\*/gu, '$1')
    .replace(/[（(]\s*[a-z\d][a-z\d._-]{15,}\s+(?=registered\b)/giu, '(')
    .replace(/\bverified(?:\.ok)?\s*[:=]\s*false\b/giu, '未通过核验').replace(/\bverified(?:\.ok)?\s*[:=]\s*true\b/giu, '已核验')
    .replace(/\bregistered\s*[:=]\s*false\b/giu, '未登记').replace(/\bregistered\s*[:=]\s*true\b/giu, '已登记')
    .replace(/(?:Feature\s*Tracker|feature)\s*登记[（(]\s*已登记\s*[）)]/giu, '功能已登记')
    .replace(/\bFeature\s*Tracker\b/giu, '功能')
    .replace(/\bready\s*\/\s*verified\b/giu, '就绪/核验')
    .replace(/\b(?:sessionId|taskId|taskKey|requestId|receiptId|receipt|runId|eventId|callId|featureId|revision)\s*[:=：]\s*["']?[\w.:/-]+["']?/giu, '')
    .replace(/\b(?:session(?:-creation|-skill)?|task|receipt|request|run|event|call)[-_:][a-z\d_-]{16,}\b/giu, '')
    .replace(/\b[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\b/giu, '')
    .replace(/\b(?:rev(?:ision)?|turn|seq)\s*[:=#]?\s*\d+\b/giu, '')
    .replace(/https?:\/\/[^\s<>"'`,，。；;（）()\[\]]+/giu, '')
    .replace(/(?:file:\/\/)?\/(?:Users|home|tmp|private|var|Volumes|worka|opt|srv|root|Applications)\/[^\s<>"'`,，。；;（）()\[\]]+/gu, '')
    .replace(/\b[a-f\d]{16,}\b/giu, '')
    .replace(/[（(\[]\s*[,，;；:：-]*\s*[）)\]]/gu, '')
    .replace(/\b(?:commit(?:\s+sha)?|sha(?:256)?|pass(?:Id)?|adapter|cwd|path|logs?|repos?\.(?:app\.)?(?:repo|commit)|sessionId|taskId|featureId)\b\s*[:=：]?\s*(?=$|[,，;；)\]）}])/giu, '')
    .replace(/^(?:日志|路径|目录|提交(?:SHA)?|预览地址)\s*[:：=]?\s*$/u, '')
    .replace(/(?:本次)?交办\s*发送至原会话\s*后?[，,]?/gu, '')
    .replace(/(?:在)?模型(?:开始工作|启动|开始执行)前以\s*reason\s*[:=]\s*["']?error\b[^，,。；;\n]*/giu, '模型启动前中止')
    .replace(/[（(\[]\s*[,，;；:：-]*\s*[）)\]]/gu, '').replace(/\s+([,，。；;])/gu, '$1')
    .replace(/([,，;；])(?:\s*[,，;；])+/gu, '$1').replace(/^[\s,，;；:：=]+|[\s,，;；:：=]+$/gu, '').replace(/\s+/gu, ' ').trim();
}
/** A bounded excerpt, not an inferred verdict. The complete conclusion stays separate. */
export function shortProgressText(text: string) {
  let fenced=false;
  const lines = text.trim().split(/\r?\n/u).filter(line => {
    if(/^\s*```/u.test(line)){fenced=!fenced;return false;}
    return !fenced&&!/^\s*#{1,6}\s/u.test(line)&&!structuralLine(line);
  }).map(businessText).filter(Boolean);
  const clauses = lines.flatMap(line => line.split(/(?<=[。！？；;!?])\s*|(?<=\.)\s+/u)).map(line => line.replace(/[。；;]+$/u, '').trim()).filter(Boolean);
  const unique=[...new Set(clauses)],pending=unique.filter(line=>unresolved.test(line));
  const ordered=pending.length?[...pending,...unique.filter(line=>!unresolved.test(line))]:unique;
  const hardLimit=progressSummaryLimit(ordered.join('')),target=hardLimit===100?60:140;
  let line='';
  for(const clause of ordered){
    const next=line?line+'；'+clause:clause;
    if(line&&Array.from(next).length>target&&(!unresolved.test(clause)||Array.from(next).length>hardLimit))continue;
    line=next;
  }
  const limit = Math.min(target,hardLimit), points = Array.from(line);
  if (points.length <= limit) return line;
  if(points.length<=hardLimit&&ordered.length>1)return line;
  const problem = unresolved.exec(line), prefix = problem && problem.index > limit - 20 ? Math.max(0, Array.from(line.slice(0, problem.index)).length - 24) : 0;
  let excerpt = (prefix ? '…' : '') + points.slice(prefix, prefix + limit - (prefix ? 2 : 1)).join('');
  if (!/\p{Script=Han}/u.test(line)) {
    const boundary = excerpt.lastIndexOf(' ');
    if (boundary >= limit * .65) excerpt = excerpt.slice(0, boundary);
  }
  return excerpt.trimEnd() + '…';
}

/** Preserve repeated results at different times; collapse only the same stored/observed fact. */
export function projectProgressEntries(entries: readonly ProgressEntry[]): ProgressEntry[] {
  const ids = new Set<string>(), facts = new Set<string>();
  return entries.filter(entry => {
    const fact = JSON.stringify([entry.taskId ?? '', entry.sourceId ?? entry.id, entry.recordedAt ?? null, entry.status ?? '', progressTextIdentity(entry.conclusion ?? entry.summary)]);
    if (ids.has(entry.id) || facts.has(fact)) return false;
    ids.add(entry.id); facts.add(fact); return true;
  }).sort((a, b) => (b.recordedAt ?? Infinity) - (a.recordedAt ?? Infinity) || a.id.localeCompare(b.id));
}
