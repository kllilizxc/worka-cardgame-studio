import { z } from '@dsh-workbench/runtime';
import { attachmentRefsSchema } from './attachment-schema';
import { note, todoStatusSchema, todoPrioritySchema, todoImageSchema, todoItemSourceSchema, storedTodoItemSchema } from './model';
export * from './model';

export const delegateTodoInputSchema = z.object({
  itemId: z.string(), goal: z.string().optional(), scope: z.array(z.string()).optional(),
  cwd: z.string().optional(), requestId: z.string().optional(),
  // Manual continuation may resume a paused owner; automatic imports may not.
  resumePaused: z.boolean().optional(),
});
export const feedbackInputSchema = z.object({
  itemId: z.string(), status: todoStatusSchema, conclusion: z.string(), expectedRevision: z.string().optional(),
});
export const moveTodoInputSchema = z.object({
  id: z.string(), status: todoStatusSchema,
  // Index in the destination lane after removing the moving item; omit to append.
  index: z.number().optional(),
  beforeId: z.string().optional(), afterId: z.string().optional(),
});
export const editTodoInputSchema = z.object({
  itemId: z.string(), title: z.string(), description: z.string(), images: z.array(todoImageSchema),
  attachments: attachmentRefsSchema.optional(), priority: todoPrioritySchema.optional(), category: z.string().optional(), startDate: z.string().optional(), dueDate: z.string().optional(),
  baseFingerprint: z.string().min(1),
});
export const importItemInputSchema = z.object({
  title: z.string(), description: z.string().optional(), priority: todoPrioritySchema.optional(),
  category: z.string().optional(),
  // Local date YYYY-MM-DD, or YYYY-MM-DDTHH:mm when a time is present.
  dueDate: z.string().optional(), source: todoItemSourceSchema.optional(),
});
export const importItemsInputSchema = z.object({
  items: z.array(importItemInputSchema).max(100), mode: z.enum(['append', 'upsert']).optional(), autoDelegate: z.boolean().optional(),
});
export const importItemResultSchema = z.object({
  itemId: z.string(), deduped: z.boolean().optional(), updated: z.boolean().optional(),
  delegation: z.object({ status: z.string() }).optional(), error: z.string().optional(),
});

export const changed = note.event({
    name: 'items.changed',
    visibility: 'public',
    description: '一个待办条目发生变化；itemId 是稳定条目 ID，接收方按需查询当前内容。',
    payload: z.object({ itemId: z.string(), title: z.string(), revision: z.string() }),
    objectRef: '/itemId', objectLabel: '/title', revision: '/revision',
  });
export const delegationRequested = note.event({
    name: 'items.delegationRequested',
    visibility: 'public',
    description: '用户明确交办一项待办；事件保留提交时的单项快照，后续编辑仍是草稿。',
    payload: z.object({
      itemId: z.string(), title: z.string(), revision: z.string(), goal: z.string(), scope: z.array(z.string()),
      item: storedTodoItemSchema.optional(),
    }),
    objectRef: '/itemId', objectLabel: '/title', revision: '/revision',
  });
