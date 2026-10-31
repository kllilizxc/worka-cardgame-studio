import type { RouteObject } from 'react-router';
import { Link, useLocation } from 'react-router';
import { noteHref } from '@dsh-workbench/runtime';
import { useNote } from '@dsh-workbench/react';
import TodoLayout from './todo-layout';
import { TaskLayout, TaskDetails, TaskEditor, TaskHistory } from './task-dialog';
import { ui } from './messages';

function NotFound() {
  const { metadata } = useNote();
  const { search } = useLocation();
  return <section role="alert"><p>{ui('这个页面不存在。')}</p><Link to={{ pathname: noteHref(metadata.id), search }}>{ui('返回列表')}</Link></section>;
}

export const routes = [{
  element: <TodoLayout />,
  children: [
    { index: true, element: null },
    { path: 'tasks/:taskId', element: <TaskLayout />, children: [
      { index: true, element: <TaskDetails /> },
      { path: 'edit', element: <TaskEditor /> },
      { path: 'history', element: <TaskHistory /> },
      { path: '*', element: <NotFound /> },
    ] },
    { path: '*', element: <NotFound /> },
  ],
}] satisfies RouteObject[];
