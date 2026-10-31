import type { Scene } from './model';
type Target = {
    resourcePath: string;
    path: string;
    from?: string;
};
export declare function Reader({ row, open, resourcePath, external, resolveLink }: {
    row: Scene;
    open(id: string): void;
    resourcePath: string;
    external?: Target;
    resolveLink(path: string, source: string): void;
}): import("react").JSX.Element;
export {};
