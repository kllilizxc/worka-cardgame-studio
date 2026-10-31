import { Button } from '@heroui/react/button';
import { NoteIcon, QueryState, composeQueries, useLinks, useMutation, useNote } from '@dsh-workbench/react';
import type { ComponentProps } from 'react';
import type { TodoDisplaySource } from './list';
import { ui } from './messages';

export type LinkGroupItem = { key: string; label: string; onOpen(): Promise<unknown> };
export type LinkGroupProps = {
  label: string;
  icon?: ComponentProps<typeof NoteIcon>['icon'] | null;
  links: readonly LinkGroupItem[];
  onNavigate?(open: () => Promise<unknown>): void;
};

/** One destination type has one entry, regardless of its number of records. */
export function LinkGroup({ label, icon, links, onNavigate }: LinkGroupProps) {
  const navigation = useMutation();
  const open = (link: LinkGroupItem) => {
    if (onNavigate) onNavigate(link.onOpen); else void navigation.run(link.onOpen);
  };
  if (!links.length) return null;
  return <span className="folio-link-group" title={links.length === 1 ? links[0]!.label || undefined : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: '100%' }}>
    {icon !== null && <NoteIcon icon={icon} size={16} />}
    {links.length === 1 ? <Button size="sm" variant="tertiary" isDisabled={navigation.pending} aria-label={links[0]!.label && links[0]!.label !== label ? `${label}：${links[0]!.label}` : label} onPress={() => open(links[0]!)}>{label} ↗</Button> : <select aria-label={label} value="" disabled={navigation.pending} onChange={event => {
      const link = links.find(link => link.key === event.currentTarget.value);
      event.currentTarget.value = '';
      if (link) open(link);
    }}>
      <option value="" disabled>{ui('{p0}（{p1}）', { p0: label, p1: links.length })}</option>
      {links.map((link, index) => <option key={link.key} value={link.key}>{link.label && link.label !== label ? link.label : ui('记录 {p0}', { p0: index + 1 })}</option>)}
    </select>}
    {navigation.error && <span role="alert">{ui('无法打开关联记录：{p0}', { p0: navigation.error.message })}</span>}
  </span>;
}

type RelatedRecordsProps = {
  recordId: string;
  className?: string;
  heading?: string;
  onNavigate?(open: () => Promise<unknown>): void;
  excludedSources?: readonly { noteId?: string; itemId?: string }[];
  sources?: readonly TodoDisplaySource[];
  originalSource?: { label: string; url?: string };
};

function recordLabel(label: string, recordId: string) {
  const suffix = ' · ' + recordId;
  if (label === recordId) return { title: '', noteName: '' };
  if (label.endsWith(suffix)) return { title: '', noteName: label.slice(0, -suffix.length).trim() };
  return { title: label.trim(), noteName: '' };
}

/** Only presentation changes here; the host still owns each navigation target. */
export function RelatedRecords({ recordId, className, heading, onNavigate, excludedSources = [], sources = [], originalSource }: RelatedRecordsProps) {
  const note = useNote<typeof import('./actions')>();
  const links = useLinks(recordId);
  const visible = links.links.filter(link => !excludedSources.some(source => source.noteId === link.target.noteId && source.itemId === link.target.recordId));
  const ids = [...new Set([...visible.map(link => link.target.noteId), ...sources.flatMap(source => source.noteId ? [source.noteId] : [])])].sort();
  const metadata = note.useQuery('sourceMetadata', { ids }, { enabled: ids.length > 0 });
  const notes = new Map((metadata.data ?? []).map(source => [source.id, source]));
  const groups = new Map<string, { label: string; icon?: LinkGroupProps['icon']; links: LinkGroupItem[] }>();
  const noteGroup = (noteId: string, fallbackName = '', icon?: LinkGroupProps['icon']) => {
    const key = 'note:' + noteId;
    const current = notes.get(noteId);
    const group = groups.get(key) ?? { label: current?.name || fallbackName || ui('关联记录'), icon: current?.icon || icon, links: [] };
    groups.set(key, group); return group;
  };
  const add = (group: { links: LinkGroupItem[] }, link: LinkGroupItem) => {
    const previous = group.links.find(previous => previous.key === link.key);
    if (!previous) group.links.push(link); else if (!previous.label && link.label) previous.label = link.label;
  };
  const urls = new Set<string>();
  const addUrl = (url: string, label: string, group?: ReturnType<typeof noteGroup>, icon?: LinkGroupProps['icon']) => {
    if (urls.has(url)) return;
    urls.add(url);
    const readable = label && label !== url && label !== group?.label ? label : ui('原始记录');
    const destination = group ?? { label: readable, icon, links: [] };
    if (!group) groups.set('url:' + url, destination);
    add(destination, { key: 'url:' + url, label: readable, onOpen: () => note.host.openExternal(url) });
  };
  for (const source of sources) {
    const group = source.noteId ? noteGroup(source.noteId, source.name, source.icon) : undefined;
    if (group) add(group, {
      key: JSON.stringify([source.noteId, source.itemId ?? null]),
      label: source.itemId ? '' : ui('来源'),
      onOpen: () => source.itemId ? note.navigation.open({ noteId: source.noteId!, recordId: source.itemId }) : note.host.openNote(source.noteId!),
    });
    if (source.url) addUrl(source.url, originalSource?.url === source.url ? originalSource.label : source.name || ui('原始记录'), group, source.icon);
  }
  for (const link of visible) {
    const readable = recordLabel(link.label, link.target.recordId);
    const group = noteGroup(link.target.noteId, readable.noteName);
    add(group, { key: JSON.stringify([link.target.noteId, link.target.recordId]), label: readable.title, onOpen: () => note.navigation.open({ noteId: link.target.noteId, recordId: link.target.recordId }) });
  }
  if (originalSource?.url) {
    const sourceNotes = [...new Set(sources.flatMap(source => source.noteId ? [source.noteId] : []))];
    addUrl(originalSource.url, originalSource.label || ui('原始记录'), sourceNotes.length === 1 ? noteGroup(sourceNotes[0]!) : undefined);
  }
  const query = composeQueries({ links }, { metadata });
  const content = groups.size ? <div className={className} aria-label={ui('关联记录')} style={{ display: 'contents' }}>
    {[...groups].map(([key, group]) => <LinkGroup key={key} {...group} onNavigate={onNavigate} />)}
  </div> : null;
  return <QueryState query={query} empty={null}>{() => content && (heading ? <section className="folio-detail-section"><h4>{heading}</h4>{content}</section> : content)}</QueryState>;
}
