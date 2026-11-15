import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { TodoImage, TodoPriority } from './actions';
import type { TodoAttachment } from './attachment-schema';
import { FileAttachments } from './file-attachments';
import { ImageAttachments, PRIORITY_CONFIG } from './view-shared';
import { ui } from './messages';

export type TodoFormValue = { title: string; description: string; images: TodoImage[]; attachments: TodoAttachment[]; category?: string; priority?: TodoPriority; startDate?: string; dueDate?: string };

/** Shared fields; creation and editing keep their own draft and save contracts. */
export function TaskFields({ value, onChange, disabled, uploadKey, onBusyChange, onPaste }: {
  value: TodoFormValue; onChange: (patch: Partial<TodoFormValue>) => void; disabled?: boolean;
  uploadKey: string; onBusyChange: (busy: boolean) => void; onPaste: (event: React.ClipboardEvent<HTMLElement>) => void;
}) {
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!disabled) queueMicrotask(() => titleInput.current?.focus()); }, [disabled]);
  return <>
    <label className="folio-editor-field folio-editor-title">
      <span>{ui('待办标题')}</span><Input disabled={disabled} value={value.title} onChange={event => onChange({ title: event.target.value })} ref={titleInput} autoFocus onPaste={onPaste} />
    </label>
    <label className="folio-editor-field folio-editor-description">
      <span>{ui('待办详情')}</span><Textarea disabled={disabled} value={value.description ?? ''} onChange={event => onChange({ description: event.target.value })} rows={5} onPaste={onPaste} />
    </label>
    <div className="folio-schedule-fields">
      <label className="folio-editor-field">
        <span>{ui('分类')}</span><Input disabled={disabled} value={value.category ?? ''} onChange={event => onChange({ category: event.target.value })} />
      </label>
      <div className="folio-editor-field folio-editor-priority">
        <Label>{ui('优先级')}</Label>
        <Select disabled={disabled} value={value.priority ?? 'medium'} onValueChange={priority => onChange({ priority: priority as TodoPriority })}>
          <SelectTrigger aria-label={ui('优先级')}><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(PRIORITY_CONFIG).map(([key, priority]) => <SelectItem key={key} value={key}>{priority.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <label className="folio-editor-field">
        <span>{ui('开始日期')}</span><Input disabled={disabled} value={value.startDate ?? ''} onChange={event => onChange({ startDate: event.target.value })} type="date" />
      </label>
      <label className="folio-editor-field">
        <span>{ui('截止日期')}</span><Input disabled={disabled} value={value.dueDate ?? ''} onChange={event => onChange({ dueDate: event.target.value })} type={value.dueDate?.includes('T') ? 'datetime-local' : 'date'} />
      </label>
    </div>
    <div className="folio-editor-attachments">
      <ImageAttachments images={value.images} onRemove={id => onChange({ images: value.images.filter(image => image.id !== id) })} />
      {!disabled && <FileAttachments uploadKey={uploadKey} attachments={value.attachments} onChange={attachments => onChange({ attachments })} onBusyChange={onBusyChange} />}
    </div>
  </>;
}
