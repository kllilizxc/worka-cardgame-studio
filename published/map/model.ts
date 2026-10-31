import {defineNote,z} from '@dsh-workbench/runtime';
export const kindSchema=z.enum(['map','encounter','cards','monsters','people','shop','media']);
const strings=z.array(z.string());
export const recordSchema=z.object({
  id:z.string().min(1),title:z.string(),group:z.string(),source:z.string(),body:z.string(),
  facets:z.record(z.string(),strings),
  fields:z.array(z.object({name:z.string(),value:z.string()})),
  sections:z.array(z.object({title:z.string(),lines:strings})),
  refs:z.array(z.object({note:kindSchema,id:z.string()})),
  diagram:z.array(z.object({id:z.string(),label:z.string(),layer:z.number(),kind:z.string(),to:strings})).optional(),
  thumbnail:z.string().optional(),mediaUrl:z.string().optional(),mediaKey:z.string().optional(),
});
export const indexSchema=z.object({connections:z.record(z.string(),z.object({provider:z.string(),connectionId:z.string()})).optional(),kind:kindSchema,revision:z.string(),records:z.array(recordSchema)});
export type RecordRow=z.infer<typeof recordSchema>;
export const note=defineNote({config:{schema:indexSchema,defaults:{kind:'cards',revision:'',records:[]}},update:{dataVersion:'cardgame-catalog@1'}});
