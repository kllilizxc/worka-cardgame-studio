import { QueryState, useNote, useMutation, useUi } from '@dsh-workbench/react';
import { Button } from '@heroui/react/button';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { TodoListItem } from './list';
import { mergePastedImages, pasteClipboardImages } from './view-shared';
import { ui } from './messages';
import { TaskFields, type TodoFormValue } from './task-fields';

type Requirement = TodoFormValue;
/** SDK keyed drafts retain unfinished edits when this card truly unmounts. */
export function RequirementEditor({ item, onClose }: {
  item: TodoListItem; onClose: (id: string) => void;
}) {
  useUi(ui);
  const { actions, useQuery } = useNote<typeof import('./actions')>();
  const query = useQuery('requirement', { itemId: item.id });
  const current = query.data?.item;
  const source = query.draftSource<Requirement>(data => ({ value: data?.item ?? { title: item.title, description: item.description ?? '', images: [], attachments: [] }, revision: data?.revision }));
  const [uploadPending, setUploadPending] = useState(false);
  const removed = Boolean(query.data && !current);
  if (removed) source.ready = false;
  const mutation = useMutation(actions.editTodo, { draft: { key: `todo-requirement:${item.id}`, source },
      input(value, context) {
        if (typeof context.revision !== 'string') throw new Error(ui('读取图片失败'));
        return { itemId: item.id, ...value, baseFingerprint: context.revision };
      },
      receipt: (result, value) => ({ value: { ...value, title: value.title.trim(), description: value.description.trim() }, revision: result.revision }),
  });
  const draft = mutation.draft;
  const displayed = useRef(false);
  useLayoutEffect(() => { displayed.current = true; return () => { displayed.current = false; }; }, []);
  const paste = useMutation();
  const [saved, setSaved] = useState<string>();
  useEffect(() => { if (saved === item.id && !draft.dirty && !draft.saving && !uploadPending) onClose(item.id); }, [saved, draft.dirty, draft.saving, uploadPending, item.id, onClose]);
  const handlePaste = (event: React.ClipboardEvent<HTMLElement>) => void paste.run(async () => {
    const additions = await pasteClipboardImages(event);
    if (additions.length) draft.set(value => ({ ...value, images: mergePastedImages(value.images, additions) }));
  });
  const changed = draft.conflicted;
  return <form className="folio-requirement-editor" onSubmit={async event => {
    event.preventDefault();
    if (removed || uploadPending) return;
    if (await mutation.mutate() && displayed.current) {
      setSaved(item.id);
    }
  }}>
    <QueryState query={query}>{() => null}</QueryState>
    <TaskFields value={draft.value} disabled={!source.ready} uploadKey={`todo-requirement:${item.id}:uploads`} onBusyChange={setUploadPending} onPaste={handlePaste} onChange={patch => draft.set(value => ({ ...value, ...patch }))} />
    {(draft.error || paste.error) && <span role="alert">{(draft.error ?? paste.error)?.message}</span>}
    {changed && <span role="status">{ui('来源已更新；你的草稿已保留，保存时会核对冲突。')}</span>}
    <footer className="folio-editor-footer">
      <div className="folio-editor-actions">
        <Button variant="tertiary" type="button" isDisabled={draft.saving || uploadPending} onPress={() => { draft.reset(); onClose(item.id); }}>{ui.rich('取消')}</Button>
        <Button variant="primary" type="submit" isDisabled={draft.saving || uploadPending || !source.ready || removed || !draft.value.title.trim()}>{draft.saving ? ui('提交中…') : ui.rich('保存修改')}</Button>
      </div>
    </footer>
  </form>;
}
