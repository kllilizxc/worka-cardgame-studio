import React from 'react';
import type { TodoImage, TodoPriority } from './actions';
import type { TodoAttachment } from './attachment-schema';
export type TodoFormValue = {
    title: string;
    description: string;
    images: TodoImage[];
    attachments: TodoAttachment[];
    category?: string;
    priority?: TodoPriority;
    startDate?: string;
    dueDate?: string;
};
/** Shared fields; creation and editing keep their own draft and save contracts. */
export declare function TaskFields({ value, onChange, disabled, uploadKey, onBusyChange, onPaste }: {
    value: TodoFormValue;
    onChange: (patch: Partial<TodoFormValue>) => void;
    disabled?: boolean;
    uploadKey: string;
    onBusyChange: (busy: boolean) => void;
    onPaste: (event: React.ClipboardEvent<HTMLElement>) => void;
}): React.JSX.Element;
