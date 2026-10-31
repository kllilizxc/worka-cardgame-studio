import { defineNote, z } from '@dsh-workbench/runtime';
import { attachmentsSchema } from './attachment-schema';

export const todoStatusSchema = z.enum(['todo', 'in_progress', 'blocking', 'done']);
export const todoPrioritySchema = z.enum(['low', 'medium', 'high']);
export const progressSourceSchema = z.enum(['recordProgress', 'feedback', 'current']);
export const progressEntrySchema = z.object({
  itemId: z.string(), status: todoStatusSchema.optional(), summary: z.string(), conclusion: z.string().optional(),
  recordedAt: z.number().int().nonnegative(), revision: z.string().optional(), source: progressSourceSchema,
  taskId: z.string().optional(), sourceId: z.string().optional(), conclusionKey: z.string().optional(),
});
export const todoImageSchema = z.object({
  id: z.string(), dataUrl: z.string(), name: z.string().optional(),
  type: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']).optional(),
  width: z.number().optional(), height: z.number().optional(),
});
// The source belongs to the sender; retain its additional identity/payload fields.
export const todoItemSourceSchema = z.looseObject({
  kind: z.string(), itemId: z.string(), label: z.string().optional(), url: z.string().optional(),
  noteId: z.string().optional(),
  title: z.string().optional(), messageIds: z.array(z.string()).optional(),
  taskKey: z.string().optional(), importedAt: z.string().optional(),
});
// Persisted items can contain fields added by older note versions or integrations.
export const sessionLinkSchema = z.object({
  taskId: z.string().min(1), sessionId: z.string().min(1), title: z.string(), archived: z.boolean().optional(),
});
export const taskSourceSchema = z.object({kind: z.enum(['note','inspection','unknown']),key:z.string(),noteId:z.string().optional(),itemId:z.string().optional(),name:z.string().optional()});
export const sourceIconSchema = z.union([
  z.object({ type: z.literal('emoji'), value: z.string() }),
  z.object({ type: z.literal('svg'), src: z.string(), monochrome: z.boolean().optional() }),
]);
export const displaySourceSchema = taskSourceSchema.extend({ icon: sourceIconSchema.optional(), url: z.string().optional() });
export const todoItemSchema = z.looseObject({
  assignment:z.object({requestId:z.string(),fingerprint:z.string(),sessionId:z.string(),phase:z.enum(['reserved','queued','completed','failed','unknown']),jobId:z.string().optional(),error:z.string().optional()}).optional(),
  id: z.string(), sessions: z.array(sessionLinkSchema).optional(), taskSources: z.array(taskSourceSchema).optional(), archived: z.boolean().optional(), title: z.string(), description: z.string().optional(),
  status: todoStatusSchema, createdAt: z.string(), completed: z.boolean().optional(),
  priority: todoPrioritySchema.optional(), category: z.string().optional(), startDate: z.string().optional(), dueDate: z.string().optional(),
  images: z.array(todoImageSchema).optional(), attachments: attachmentsSchema.optional(), source: todoItemSourceSchema.optional(),
  sourceAutoUpdatedAt: z.string().optional(), autoDeliveryPending: z.string().optional(),
  conclusion: z.string().optional(), taskId: z.string().optional(), delivery: z.string().optional(), next: z.string().optional(),
  deliveryIntent: z.object({
    requestId: z.string(), fingerprint: z.string(), payload: z.unknown().optional(),
    status: z.string().optional(), requirementVersion: z.number().optional(), updateStatus: z.string().optional(),
  }).optional(),
  delegation: z.object({ id: z.string(), deskNoteId: z.string(), stateRef: z.string() }).optional(),
  delegatedAt: z.string().optional(), delegatedRunStatus: z.enum(['queued', 'started', 'accepted', 'completed']).optional(),
});
// Historical items may only have the completed flag and no creation timestamp.
export const storedTodoItemSchema = todoItemSchema.extend({
  status: z.union([todoStatusSchema, z.literal('blocked')]).optional(), createdAt: z.string().optional(),
});
export const todoDataSchema = z.looseObject({
  items: z.array(storedTodoItemSchema), filter: z.enum(['all', 'active', 'completed']).optional(),
  summary: z.string().optional(), executionDesk: z.object({ noteId: z.string().optional(), stateRef: z.string().optional() }).optional(),
});
export const todoSnapshotSchema = z.object({
  value: todoDataSchema, revision: z.string(), updatedAt: z.string().optional(),
  origin: z.object({ chain: z.array(z.string()), deliveryId: z.string().optional() }).optional(),
});
export const revisionOutputSchema = z.object({ revision: z.string() });

export const todoConfigSchema = z.looseObject({
  includeExampleWork: z.boolean().optional(),
  filter: z.enum(['all', 'active', 'completed']).optional(),
});

export type TodoStatus = z.infer<typeof todoStatusSchema>;
export type TodoPriority = z.infer<typeof todoPrioritySchema>;
export type TodoImage = z.infer<typeof todoImageSchema>;
export type TodoItemSource = z.infer<typeof todoItemSourceSchema>;
export type TodoItem = z.infer<typeof storedTodoItemSchema>;
export type TodoData = z.infer<typeof todoDataSchema>;

export function normalizeStatus(item: { status?: string; completed?: boolean }): TodoStatus {
  if (item.status === 'in_progress' || item.status === 'blocking' || item.status === 'blocked') {
    return item.status === 'blocked' ? 'blocking' : item.status;
  }
  if (item.status === 'done' || item.status === 'todo') return item.status;
  return item.completed ? 'done' : 'todo';
}

export const countsSchema = z.object({ todo: z.number(), in_progress: z.number(), blocking: z.number(), done: z.number() });
const summarySchema = z.object({ total: z.number(), attachmentCount: z.number(), counts: countsSchema, revision: z.number(), name: z.string(), firstPosition: z.string().optional() });
export const note = defineNote({
  config: { schema: todoConfigSchema, defaults: {} },
  collections: {
    items: { schema: storedTodoItemSchema.omit({ id: true }).extend({
      status: todoStatusSchema, position: z.string(), revision: z.number().int().nonnegative(),
      normalizedTitle: z.string(), active: z.boolean(),
      view: z.object({ title: z.string(), status: todoStatusSchema, priority: todoPrioritySchema.optional(), category: z.string().optional(), startDate: z.string().optional(), dueDate: z.string().optional(),
        description: z.string().optional(), conclusion: z.string().optional(), imageCount: z.number(), attachmentCount: z.number(),
        source: z.object({ label: z.string(), url: z.string().optional() }).optional(), archived: z.boolean().optional(), sourceAutoUpdatedAt: z.string().optional(), taskId: z.string().optional(), primarySessionId: z.string().optional(), sessionCount: z.number().optional(), sourceLabel: z.string().optional(), hasDelegation: z.boolean() }),
    }), indexes: [['position'], ['status', 'position'], ['active', 'position'], ['category', 'position'], ['category', 'status', 'position'], ['normalizedTitle']] },
    sessionIndex: { schema: z.object({taskId:z.string(),itemId:z.string()}), indexes:[['taskId']] },
    progressEntries: { schema: progressEntrySchema, indexes: [['itemId', 'recordedAt'], ['itemId', 'conclusionKey']] },
    totals: { schema: summarySchema, indexes: [['name']] },
    categories: { schema: summarySchema, indexes: [['name']] },
    imports: { schema: z.object({ itemId: z.string() }) },
  },
  update: { dataVersion: 'todo-note@4' },
});
