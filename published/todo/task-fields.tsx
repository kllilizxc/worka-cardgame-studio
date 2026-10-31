import React, { useEffect, useRef } from 'react';
import { Input } from '@heroui/react/input';
import { TextField } from '@heroui/react/textfield';
import { Label } from '@heroui/react/label';
import { ListBox } from '@heroui/react/list-box';
import { Select } from '@heroui/react/select';
import { TextArea } from '@heroui/react/textarea';
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
    <TextField className="folio-editor-field folio-editor-title" fullWidth isDisabled={disabled} value={value.title} onChange={title => onChange({ title })}>
      <Label>{ui('待办标题')}</Label><Input ref={titleInput} autoFocus onPaste={onPaste} />
    </TextField>
    <TextField className="folio-editor-field folio-editor-description" fullWidth isDisabled={disabled} value={value.description ?? ''} onChange={description => onChange({ description })}>
      <Label>{ui('待办详情')}</Label><TextArea rows={5} onPaste={onPaste} />
    </TextField>
    <div className="folio-schedule-fields">
      <TextField className="folio-editor-field" isDisabled={disabled} value={value.category ?? ''} onChange={category => onChange({ category })}>
        <Label>{ui('分类')}</Label><Input />
      </TextField>
      <Select className="folio-editor-field folio-editor-priority" isDisabled={disabled} value={value.priority ?? 'medium'} onChange={priority => { if (typeof priority === 'string') onChange({ priority: priority as TodoPriority }); }}>
        <Label>{ui('优先级')}</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{Object.entries(PRIORITY_CONFIG).map(([key, priority]) => <ListBox.Item key={key} id={key} textValue={priority.label}>{priority.label}</ListBox.Item>)}</ListBox></Select.Popover>
      </Select>
      <TextField className="folio-editor-field" isDisabled={disabled} value={value.startDate ?? ''} onChange={startDate => onChange({ startDate })}>
        <Label>{ui('开始日期')}</Label><Input type="date" />
      </TextField>
      <TextField className="folio-editor-field" isDisabled={disabled} value={value.dueDate ?? ''} onChange={dueDate => onChange({ dueDate })}>
        <Label>{ui('截止日期')}</Label><Input type={value.dueDate?.includes('T') ? 'datetime-local' : 'date'} />
      </TextField>
    </div>
    <div className="folio-editor-attachments">
      <ImageAttachments images={value.images} onRemove={id => onChange({ images: value.images.filter(image => image.id !== id) })} />
      {!disabled && <FileAttachments uploadKey={uploadKey} attachments={value.attachments} onChange={attachments => onChange({ attachments })} onBusyChange={onBusyChange} />}
    </div>
  </>;
}
