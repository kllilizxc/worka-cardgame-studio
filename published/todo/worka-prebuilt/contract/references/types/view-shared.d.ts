import './folio.css';
import React from "react";
import "@heroui/styles/css";
import type { TodoImage, TodoPriority, TodoStatus } from "./actions";
export declare function normalizeStatus(item: {
    status?: string;
    completed?: boolean;
}): TodoStatus;
export declare const PRIORITY_CONFIG: Record<TodoPriority, {
    label: string;
    accent: boolean;
}>;
export declare const COLUMNS: Array<{
    id: TodoStatus;
    title: string;
    tag: string;
    emphasized: boolean;
}>;
export declare function SvgCheckMark({ size }: {
    size?: number;
}): React.JSX.Element;
export declare function SvgSparkles({ size }: {
    size?: number;
}): React.JSX.Element;
export declare function SvgTrash({ size }: {
    size?: number;
}): React.JSX.Element;
export declare const ALL_CATEGORIES = "";
export declare const MAX_PASTED_IMAGES = 3;
export declare function mergePastedImages(current: TodoImage[], additions: TodoImage[]): TodoImage[];
export declare function pasteClipboardImages(event: React.ClipboardEvent<HTMLElement>): Promise<TodoImage[]>;
export declare function ImageAttachments({ images, onRemove, compact, }: {
    images?: TodoImage[];
    onRemove?: (id: string) => void;
    compact?: boolean;
}): React.JSX.Element | null;
