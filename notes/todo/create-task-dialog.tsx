import React, { useEffect, useState } from 'react';
import { Button } from '@heroui/react/button';
import { NoteDialog, useMutation } from '@dsh-workbench/react';
import type { TodoStatus } from './actions';
import { TaskFields } from './task-fields';
import { useTodoComposer } from './todo-composer';
import { mergePastedImages, pasteClipboardImages } from './view-shared';
import { ui } from './messages';

export function CreateTaskDialog({ status, onClose, onCreated }: { status: TodoStatus; onClose: () => void; onCreated: () => void }) {
  return <NoteDialog open label={ui('新建任务')} className="folio-detail ui-palette" onOpenChange={open => { if (!open) onClose(); }}>
    <span className="folio-detail-tape" aria-hidden="true" />
    <header className="folio-detail-heading"><h2 className="folio-edit-mode">{ui('新建任务')}</h2><div className="folio-detail-toolbar"><Button isIconOnly variant="tertiary" aria-label={ui('关闭详情')} onClick={event => event.currentTarget.closest('dialog')?.requestClose()}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></Button></div></header>
    <div className="folio-detail-body"><section className="folio-detail-section"><CreateTaskForm status={status} onClose={onClose} onCreated={onCreated} /></section></div>
  </NoteDialog>;
}

function CreateTaskForm({ status, onClose, onCreated }: { status: TodoStatus; onClose: () => void; onCreated: () => void }) {
  const draft = useTodoComposer('todo-column-create');
  const paste = useMutation();
  const [uploadPending, setUploadPending] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (saved && !draft.dirty && !draft.saving && !uploadPending) { onCreated(); onClose(); } }, [saved, draft.dirty, draft.saving, uploadPending, onCreated, onClose]);
  return <form className="folio-requirement-editor" onSubmit={async event => {
    event.preventDefault();
    if (uploadPending) return;
    draft.set(value => ({ ...value, status }));
    if (await draft.save()) setSaved(true);
  }}>
    <TaskFields value={draft.value} uploadKey="todo-column-create:uploads" onBusyChange={setUploadPending} onChange={patch => draft.set(value => ({ ...value, ...patch }))} onPaste={event => void paste.run(async () => {
      const additions = await pasteClipboardImages(event);
      if (additions.length) draft.set(value => ({ ...value, images: mergePastedImages(value.images, additions) }));
    })} />
    {(draft.error || paste.error) && <span role="alert">{(draft.error ?? paste.error)?.message}</span>}
    <footer className="folio-editor-footer"><div className="folio-editor-actions">
      <Button variant="tertiary" type="button" isDisabled={draft.saving || uploadPending} onPress={() => { draft.reset(); onClose(); }}>{ui('取消')}</Button>
      <Button variant="primary" type="submit" isDisabled={draft.saving || uploadPending || (!draft.value.title.trim() && !draft.value.images.length && !draft.value.attachments.length)}>{draft.saving ? ui('提交中…') : ui('添加任务')}</Button>
    </div></footer>
  </form>;
}
