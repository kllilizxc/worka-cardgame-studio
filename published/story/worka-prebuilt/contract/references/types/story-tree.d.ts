import type { Scene } from './model';
export interface Branch {
    key: string;
    name: string;
    folders: Map<string, Branch>;
    scenes: Scene[];
    parent?: Branch;
}
export declare function storyTree(rows: readonly Scene[]): {
    root: Branch;
    branches: Map<string, Branch>;
    parents: Map<string, Branch>;
};
export declare function ancestors(node?: Branch): Branch[];
