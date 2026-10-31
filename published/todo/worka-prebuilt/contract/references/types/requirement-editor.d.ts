import React from 'react';
import type { TodoListItem } from './list';
/** SDK keyed drafts retain unfinished edits when this card truly unmounts. */
export declare function RequirementEditor({ item, onClose }: {
    item: TodoListItem;
    onClose: (id: string) => void;
}): React.JSX.Element;
