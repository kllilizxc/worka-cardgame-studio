import { defineNote, z } from '@realiz3r/worka-runtime';
import { candidateInputSchema, candidateSchema, dataSchema } from './schemas';
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
export type Data = z.infer<typeof dataSchema>;

const configSchema = z.object({
  previewDesk:z.object({home:z.string(),cli:z.string()}).optional(),
  notes: z.object({ todo: z.string().optional(), execution: z.string().optional() }).optional(),
});

export const note = defineNote({
  records: ['candidates','archivedCandidates'].map(collection=>({collection,id:'/id',route:{path:'/candidates/:candidateId',param:'candidateId'},label:'/title',links:[{noteId:'/originNoteId',recordId:'/delegationId'}],identities:[{namespace:'feature',value:'/featureId'}]})),

  config: { schema: configSchema, defaults: {} },
  collections: {
    candidates: { schema: candidateSchema.extend({view:candidateSchema}), indexes: [['receivedAt'], ['originNoteId', 'delegationId'], ['featureId']] },
    archivedCandidates: { schema: candidateSchema.extend({view:candidateSchema}), indexes: [['receivedAt'], ['originNoteId', 'delegationId'], ['featureId']] },
    metadata: { schema: z.looseObject({ title: z.string(), attached: z.array(z.string()) }) },
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
