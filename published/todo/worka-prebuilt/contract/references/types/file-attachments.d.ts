import type { TodoAttachment } from './attachment-schema';
export declare function FileAttachments({ attachments, onChange, onBusyChange, uploadKey }: {
    attachments?: TodoAttachment[];
    onChange?: (files: TodoAttachment[]) => void;
    onBusyChange?: (busy: boolean) => void;
    uploadKey?: string;
}): import("react").JSX.Element;
