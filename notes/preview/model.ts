import { defineNote, z } from '@dsh-workbench/runtime';
import { candidateInputSchema, candidateSchema, dataSchema, feedbackSchema } from './schemas';
import { rowState } from './projection';
export { validateCandidateIdentity, previewRows, rowState } from './projection';
export type { PreviewRow } from './projection';

/** The schema is the only source for persisted candidates and provider-owned status. */
export type CandidateInput = z.infer<typeof candidateInputSchema>;
export type CandidateSpec = z.infer<typeof candidateSchema>;
export type SurfaceStatus = NonNullable<CandidateSpec['status']>[string];
export type SurfacePhase = SurfaceStatus['phase'];
export type SurfaceStep = NonNullable<SurfaceStatus['steps']>[number];
export type SurfaceFailure = NonNullable<SurfaceStatus['failure']>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type Data = z.infer<typeof dataSchema>;

const configSchema = z.object({
  connections:z.record(z.string(),z.object({provider:z.string(),connectionId:z.string()})).optional(),
  gameRoot:z.string().optional(),gameCommit:z.string().regex(/^[a-f0-9]{40}$/).optional(),adapter:z.string().optional(),
  previewDesk:z.object({home:z.string(),cli:z.string()}).optional(),
  feedbackInTodo: z.boolean().optional(), projectId: z.string().optional(),
  notes: z.object({ todo: z.string().optional(), execution: z.string().optional() }).optional(),
});

export const note = defineNote({
  config: { schema: configSchema, defaults: {} },
  collections: {
    candidates: { schema: candidateSchema.extend({view:candidateSchema}), indexes: [['receivedAt'], ['originNoteId', 'delegationId'], ['featureId']] },
    archivedCandidates: { schema: candidateSchema.extend({view:candidateSchema}), indexes: [['receivedAt'], ['originNoteId', 'delegationId'], ['featureId']] },
    outbox: { schema: feedbackSchema.omit({ id: true }), indexes: [['candidateKey'], ['observedAt']] },
    feedbackHistory: { schema: z.object({ report: feedbackSchema, observedAt: z.number(), userRequested: z.boolean() }), indexes: [['observedAt']] },
    metadata: { schema: z.object({ title: z.string(), attached: z.array(z.string()), feedbackError: z.string().nullable() }) },
  },
  update: {
    dataVersion: 'candidate-preview@2',
    checks: [{
      name: '关键能力与稳定身份',
      async run(ctx) {
        const page = await ctx.db.page('candidates');
        if (page.items.some(candidate => candidate.id !== candidate.key)) return false;
        const candidate: CandidateSpec = { key: 'check', receivedAt: 0 };
        const row = { candidate, surface: '', name: 'check', desired: 'running' as const };
        const ready: SurfaceStatus = { phase: 'ready', pass: 'check', since: 0, updatedAt: 0 };
        return rowState(row) === 'starting'
          && rowState({ ...row, status: ready }) === 'unchecked'
          && rowState({ ...row, status: { ...ready, verified: { ok: true, checks: [], at: 0 } } }) === 'ready'
          && rowState({ ...row, status: { ...ready, verified: { ok: false, checks: [], at: 0 } } }) === 'verificationFailed'
          && rowState({ ...row, status: { ...ready, phase: 'verifying' } }) === 'checking';
      },
    }],
  },
});
