import { useNote, useMutation } from '@dsh-workbench/react';
import type { TodoPriority, TodoStatus } from './actions';
import { ui } from './messages';
import type { TodoFormValue } from './task-fields';

export type TodoComposerValue = TodoFormValue & { category: string; priority: TodoPriority; status: TodoStatus };
const empty: TodoComposerValue = { title: '', description: '', startDate: '', dueDate: '', images: [], attachments: [], category: '', priority: 'medium', status: 'todo' };

/** A creation form has a local blank baseline, not a remote item to overwrite. */
export function useTodoComposer(key: string) {
  const { actions } = useNote<typeof import('./actions')>();
  const mutation = useMutation(actions.addTodo, {
    draft: { key, value: empty },
      input(value) {
        const title = value.title.trim() || (value.images.length ? ui('图片待办') : value.attachments[0]?.name ?? '');
        if (!title) throw new Error(ui('任务内容'));
        return { ...value, title, category: value.category || ui('待办') };
      },
      // The SDK clears only the submitted snapshot. Text typed while awaiting
      // the receipt remains dirty and is never cleared by this completion.
      receipt: (_result, value) => ({ value: { ...value, title: '', description: '', startDate: '', dueDate: '', images: [], attachments: [] } }),
  });
  return { ...mutation.draft, save: mutation.mutate, result: mutation.data, getResult: mutation.getData };
}
