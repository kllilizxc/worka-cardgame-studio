import type { WriteContext } from './state';
import type { TodoItem } from './model';
/** Called inside the same native mutation as saveItem; a failed append rolls both back. */
export declare function appendProgress(ctx: WriteContext, item: TodoItem, revision: string, source: 'recordProgress' | 'feedback', input: {
    summary?: string;
    conclusion?: string;
}): Promise<void>;
