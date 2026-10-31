import React from 'react';
import type { TodoStatus } from './actions';
export declare function CreateTaskDialog({ status, onClose, onCreated }: {
    status: TodoStatus;
    onClose: () => void;
    onCreated: () => void;
}): React.JSX.Element;
