import type { RecordRow } from './model';
export type Criteria = {
    q?: string;
    facetQuery?: string;
    filters?: Record<string, string[]>;
    page?: number;
    sort?: 'default' | 'name';
    size?: number;
};
export declare function search(rows: RecordRow[], criteria: Criteria): {
    total: number;
    count: number;
    page: number;
    pages: number;
    items: {
        id: string;
        title: string;
        group: string;
        body: string;
        mediaKey: string | null;
        thumbnail: string | null;
        summary: string;
    }[];
    facets: {
        key: string;
        options: {
            value: string;
            count: number;
        }[];
        hasMore: boolean;
    }[];
};
