import { QueryState, useNote } from '@dsh-workbench/react';
import { useState } from 'react';
import { Button } from '@heroui/react/button';
import { z } from '@dsh-workbench/runtime';
import type { TodoImage } from './model';
import { ImageAttachments } from './view-shared';
import { ui } from './messages';
import { attachmentsSchema } from './attachment-schema';
import { FileAttachments } from './file-attachments';

/** Only the selected item's file metadata is loaded; bytes require an explicit download. */
export function TodoFiles({ id, count, revision }: { id: string; count: number; revision?: string }) {
  const [open, setOpen] = useState(false);
  const query = useNote<typeof import('./actions')>().useQuery('itemField', { itemId: id, field: 'attachments' }, {
    enabled: open && Boolean(revision), select: value => attachmentsSchema.parse(value),
  });
  if (!count) return null;
  return <div><Button size="sm" variant="ghost" aria-expanded={open} onPress={() => setOpen(value => !value)}>{open ? ui('收起附件') : ui('查看 {p0} 个附件', { p0: count })}</Button>
    {open && <QueryState query={query}>{attachments => <FileAttachments attachments={attachments} />}</QueryState>}
  </div>;
}

/** Attachment bodies are subscribed only while this item's images are open. */
export function TodoImages({ id, count, revision }: { id: string; count: number; revision?: string }) {
  const [open, setOpen] = useState(false);
  const query = useNote<typeof import('./actions')>().useQuery('itemField', { itemId: id, field: 'images' }, { enabled: open && Boolean(revision), select: value => value as TodoImage[] });
  if (!count) return null;
  return <div><Button size="sm" variant="ghost" aria-expanded={open} onPress={() => setOpen(value => !value)}>{open ? ui('收起图片') : ui('查看 {p0} 张图片', { p0: count })}</Button>
    {open && <QueryState query={query}>{images => <ImageAttachments images={images} />}</QueryState>}
  </div>;
}

export function TodoConclusion({ id, preview, revision, expanded = false }: { id: string; preview: string; revision?: string; expanded?: boolean }) {
  const [open, setOpen] = useState(expanded);
  const query = useNote<typeof import('./actions')>().useQuery('itemField', { itemId: id, field: 'conclusion' }, { enabled: open && Boolean(revision), select: value => z.string().parse(value) });
  return <div className="folio-conclusion"><div className={open ? '' : 'clamped'}>{open ? <QueryState query={query}>{text => text}</QueryState> : preview}</div>
    {!expanded && <Button size="sm" variant="ghost" aria-expanded={open} onPress={() => setOpen(value => !value)}>{open ? ui('收起进展') : ui('查看进展')} <span aria-hidden="true">{open ? '−' : '↗'}</span></Button>}
  </div>;
}
