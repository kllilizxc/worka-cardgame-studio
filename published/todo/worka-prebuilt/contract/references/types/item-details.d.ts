/** Only the selected item's file metadata is loaded; bytes require an explicit download. */
export declare function TodoFiles({ id, count, revision }: {
    id: string;
    count: number;
    revision?: string;
}): import("react").JSX.Element | null;
/** Attachment bodies are subscribed only while this item's images are open. */
export declare function TodoImages({ id, count, revision }: {
    id: string;
    count: number;
    revision?: string;
}): import("react").JSX.Element | null;
export declare function TodoConclusion({ id, preview, revision, expanded }: {
    id: string;
    preview: string;
    revision?: string;
    expanded?: boolean;
}): import("react").JSX.Element;
