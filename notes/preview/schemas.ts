import { z } from '@realiz3r/worka-runtime';

export const candidateInputSchema = z.object({
  key:z.string(), title:z.string().optional(), originNoteId:z.string().optional(), delegationId:z.string().optional(),
  featureId:z.string().optional(), adapter:z.string().optional(),
  repos:z.record(z.string(),z.object({repo:z.string(),commit:z.string()})).optional(),
  options:z.record(z.string(),z.unknown()).optional(), cwd:z.string().optional(), revision:z.string().optional(),
  argv:z.array(z.string()).optional(), url:z.string().optional(), readinessPath:z.string().optional(),
  embed:z.boolean().optional(), start:z.boolean().optional(), surface:z.string().optional(),
});
const surfaceStatusSchema = z.looseObject({
  phase:z.enum(['stopped','queued','preparing','starting','verifying','ready','failed','stopping']),
  url:z.string().optional(), pass:z.string(), since:z.number(), updatedAt:z.number(), message:z.string().optional(),
  steps:z.array(z.object({id:z.string(),label:z.string(),state:z.enum(['pending','running','completed','failed','skipped']),detail:z.string().optional()})).optional(),
  verified:z.object({ok:z.boolean(),at:z.number(),checks:z.array(z.object({name:z.string(),ok:z.boolean(),detail:z.string().optional(),fix:z.string().optional(),evidence:z.string().optional(),owner:z.enum(['user','project']).optional()}))}).optional(),
  failure:z.looseObject({message:z.string(),owner:z.enum(['framework','project','user']),step:z.string().optional(),log:z.string().optional(),attempts:z.number(),at:z.number()}).optional(),
  source:z.string().optional(), logDir:z.string().optional(),
});
export const candidateSchema = candidateInputSchema.omit({start:true,surface:true}).loose().extend({
  receivedAt:z.number(), desired:z.record(z.string(),z.enum(['running','stopped'])).optional(),
  surfaces:z.array(z.looseObject({name:z.string(),title:z.string().optional(),url:z.string()})).optional(),
  status:z.record(z.string(),surfaceStatusSchema).optional(),
});
export const dataSchema = z.looseObject({
  title:z.string(),candidates:z.array(candidateSchema),archivedCandidates:z.array(candidateSchema).optional(),attached:z.array(z.string()),
});
export const renameInputSchema = z.object({key:z.string().optional(),originNoteId:z.string().optional(),delegationId:z.string().optional(),title:z.string()});
export const receiveInputSchema = z.union([
  renameInputSchema.extend({operation:z.literal('rename')}),
  z.object({operation:z.enum(['stop','restart']),key:z.string(),originNoteId:z.string(),delegationId:z.string()}),
  candidateInputSchema.extend({operation:z.never().optional()}),
]);
