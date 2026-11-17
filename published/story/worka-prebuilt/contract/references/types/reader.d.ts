import type { Scene } from './model';
export declare function Reader({ row, open, externalPath, resolveLink }: {
    row: Scene;
    open(id: string): void;
    externalPath?: string;
    resolveLink(path: string, source: string): void;
}): import("react").JSX.Element;
