import { useMutation, useNote, useDraftMutation, useUi } from '@dsh-workbench/react';
import { Button } from '@heroui/react/button';
import { useEffect, useId, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react';
import type { TodoAttachment } from './attachment-schema';
import { ui } from './messages';

type Upload = { id: string; file: File; error?: string };
export function FileAttachments({ attachments = [], onChange, onBusyChange, uploadKey }: {
  attachments?: TodoAttachment[]; onChange?: (files: TodoAttachment[]) => void; onBusyChange?: (busy: boolean) => void; uploadKey?: string;
}) {
  useUi(ui);
  const { files } = useNote();
  // The SDK retains live File objects across real row unmounts. A reattached
  // editor retries unfinished transfers with the original file request ID.
  const { draft: queue, mutate: saveUploads } = useDraftMutation({ key: uploadKey ?? 'todo-files-read-only', value: [] as Upload[],
    save: async entries => { await upload(entries); if (!alive.current) throw new Error(ui('请在待办编辑器中完成或移除附件上传')); return { value: [] }; },
  });
  const uploads = queue.value, setUploads = queue.set;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const picker = useRef<HTMLInputElement>(null);
  const limitsId = useId();
  useLayoutEffect(() => {
    const input = picker.current;
    // File-picker cancellation belongs to the picker, including with older dialog SDKs.
    const preserveEditor = (event: Event) => event.stopPropagation();
    input?.addEventListener('cancel', preserveEditor);
    return () => input?.removeEventListener('cancel', preserveEditor);
  }, [onChange]);
  const current = useRef(attachments); current.current = attachments;
  const running = useRef(false), alive = useRef(true);
  useInsertionEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useLayoutEffect(() => { onBusyChange?.(uploads.length > 0); return () => onBusyChange?.(false); }, [uploads.length, onBusyChange]);
  const download = useMutation();

  async function upload(entries: Upload[]) {
    if (running.current) return;
    running.current = true; setBusy(true);
    try {
      for (const entry of entries) {
        try {
          if (entry.file.size > 4 * 1024 * 1024) throw new Error(ui('文件超过 4 MiB，请选择较小的文件'));
          const result = await files.put(entry.file, { requestId: entry.id });
          if (!alive.current) return;
          const next = [...current.current, result]; current.current = next; onChange?.(next);
          setUploads(value => value.filter(row => row.id !== entry.id));
        } catch (cause) {
          if (!alive.current) return;
          setUploads(value => value.map(row => row.id === entry.id ? { ...row, error: cause instanceof Error ? cause.message : String(cause) } : row));
        }
      }
    } finally { running.current = false; if (alive.current) setBusy(false); }
  }
  useEffect(() => {
    const pending = uploads.filter(entry => !entry.error);
    if (onChange && !running.current && pending.length) void saveUploads();
  }, [uploads]);
  function select(selected: File[]) {
    if (running.current || !selected.length) return;
    setError('');
    if (current.current.length + uploads.length + selected.length > 20) { setError(ui('每项任务最多添加 20 个文件附件')); return; }
    const next = selected.map(file => ({ id: crypto.randomUUID(), file }));
    setUploads(value => [...value, ...next]);
  }
  async function read(file: TodoAttachment) {
    const bytes = await files.read(file);
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' }));
    const link = document.createElement('a'); link.href = url; link.download = file.name;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
  return <div className="folio-file-attachments" onDragStart={event => event.stopPropagation()}>
    {attachments.map(file => <div key={file.id} className="folio-file-row">
      <Button variant="tertiary" size="sm" className="folio-file-download" onPress={() => void download.run(() => read(file))} aria-label={ui('下载附件：{p0}', { p0: file.name })}>
        <span className="folio-file-name">{file.name}</span><span className="folio-file-size">{Math.ceil(file.size / 1024)} KiB</span>
      </Button>
      {onChange && <Button variant="tertiary" size="sm" className="folio-file-remove" aria-label={ui('移除附件：{p0}', { p0: file.name })} onPress={() => onChange(current.current.filter(row => row.id !== file.id))}>{ui('移除')}</Button>}
    </div>)}
    {uploads.map(entry => <div key={entry.id} className="folio-file-upload">
      <span role="status">{entry.file.name} · {entry.error ? ui('上传失败') : ui('上传中…')}</span>
      {entry.error && <><p role="alert">{entry.error}</p><div className="folio-file-recovery"><Button variant="tertiary" size="sm" isDisabled={busy} onPress={() => setUploads(value => value.map(row => row.id === entry.id ? { ...row, error: undefined } : row))}>{ui('重试')}</Button>
        <Button variant="tertiary" size="sm" isDisabled={busy} onPress={() => setUploads(value => value.filter(row => row.id !== entry.id))}>{ui('移除')}</Button></div></>}
    </div>)}
    {onChange && <div className="folio-file-picker" onDragOver={event => { event.preventDefault(); event.stopPropagation(); }} onDrop={event => {
      event.preventDefault(); event.stopPropagation(); select(Array.from(event.dataTransfer.files));
    }}>
      <Button type="button" variant="secondary" size="sm" className="folio-file-add" isDisabled={busy} aria-describedby={limitsId} onPress={() => picker.current?.click()}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 11-8 8a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8L15 6"/></svg>{ui('添加附件')}</Button>
      <span id={limitsId} className="folio-file-limits">{ui('每个最多 4 MiB · 最多 20 个')}</span>
      <input ref={picker} type="file" multiple hidden disabled={busy} aria-label={ui('添加附件')} onChange={event => { select(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }} />
    </div>}
    {(error || download.error) && <p role="alert">{error || download.error?.message}</p>}
  </div>;
}
