import React from 'react';
import type { TodoListItem } from './list';
export declare function TodoTimeline({ filter, onOpen }: {
    filter: {
        category?: string;
        search?: string;
        archived?: boolean;
    };
    onOpen: (item: TodoListItem, edit?: boolean) => void;
}): React.JSX.Element;
