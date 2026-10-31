import type { TodoListItem } from './list';
/** The page query supplies identities and current metadata; cards do no lookup. */
export declare function TodoSourceLabel({ item, iconsOnly }: {
    item: Pick<TodoListItem, 'sources'>;
    iconsOnly?: boolean;
}): import("react").JSX.Element | null;
