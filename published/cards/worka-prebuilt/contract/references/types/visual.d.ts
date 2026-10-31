import type { RecordRow } from './model';
export type Kind = RecordRow['refs'][number]['note'];
export declare function catalogKind(value: Kind | undefined, name: string): Kind;
declare const paths: {
    map: string;
    encounter: string;
    cards: string;
    monsters: string;
    people: string;
    shop: string;
    media: string;
    open: string;
    grid: string;
    list: string;
    search: string;
    filters: string;
};
export declare function SymbolIcon({ name }: {
    name: keyof typeof paths;
}): import("react").JSX.Element;
export declare function CategoryArt({ kind }: {
    kind: Kind;
}): import("react").JSX.Element;
export {};
