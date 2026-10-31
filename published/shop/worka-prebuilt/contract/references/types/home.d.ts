import type { RecordRow } from './model';
type Kind = RecordRow['refs'][number]['note'];
/** Select a bounded record preview. IDs still navigate to the unchanged full index. */
export declare function homeRecords(kind: Kind, rows: RecordRow[]): {
    kind: "cards" | "encounter" | "map" | "media" | "monsters" | "people" | "shop";
    count: number;
    records: {
        id: string;
        title: string;
        group: string;
        source: string;
        body: string;
        facets: Record<string, string[]>;
        fields: {
            name: string;
            value: string;
        }[];
        sections: {
            title: string;
            lines: string[];
        }[];
        refs: {
            note: "cards" | "encounter" | "map" | "media" | "monsters" | "people" | "shop";
            id: string;
        }[];
        diagram?: {
            id: string;
            label: string;
            layer: number;
            kind: string;
            to: string[];
        }[] | undefined;
        thumbnail?: string | undefined;
        mediaUrl?: string | undefined;
        mediaKey?: string | undefined;
    }[];
};
export {};
