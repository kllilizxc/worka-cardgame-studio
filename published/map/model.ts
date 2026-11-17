import {defineNote,z} from '@dsh-workbench/runtime';

export const kindSchema=z.enum(['map','encounter','cards','monsters','people','shop','media']);
const strings=z.array(z.string());
export const linkSchema=z.object({
  id:z.string(),
  label:z.string(),
  target:z.object({noteId:z.string(),recordId:z.string()}),
});
export type LiveLink=z.infer<typeof linkSchema>;
export const recordSchema=z.object({
  id:z.string().min(1),title:z.string(),group:z.string(),source:z.string(),body:z.string(),
  facets:z.record(z.string(),strings),
  fields:z.array(z.object({name:z.string(),value:z.string()})),
  sections:z.array(z.object({title:z.string(),lines:strings})),
  refs:z.array(z.object({note:kindSchema,id:z.string()})),
  links:z.array(linkSchema).optional(),
  diagram:z.array(z.object({id:z.string(),label:z.string(),layer:z.number(),kind:z.string(),to:strings})).optional(),
  thumbnail:z.string().optional(),mediaUrl:z.string().optional(),mediaKey:z.string().optional(),
  portraits:z.array(z.object({id:z.string(),mediaKey:z.string().optional(),thumbnail:z.string().optional(),mediaUrl:z.string().optional()})).optional(),
});
export const configSchema=z.object({
  connections:z.record(z.string(),z.object({provider:z.string(),connectionId:z.string()})).optional(),
  kind:kindSchema,
});
export type RecordRow=z.infer<typeof recordSchema>;
export const note=defineNote({
  records:[{
    query:'recordsPage',
    items:'/items',
    next:'/next',
    route:{path:'/records/:id',param:'id'},
    id:'/id',
    label:'/title',
  }],
  config:{schema:configSchema,defaults:{kind:'cards'}},
});
