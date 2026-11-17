import {defineNote,z} from '@dsh-workbench/runtime';

export const linkSchema=z.object({
  id:z.string(),
  label:z.string(),
  target:z.object({noteId:z.string(),recordId:z.string()}),
});
export type LiveLink=z.infer<typeof linkSchema>;

export const choiceSchema=z.object({
  label:z.string(),
  to:z.string(),
  title:z.string().optional(),
  hasChildren:z.boolean().optional(),
});

export const ancestorSchema=z.object({
  key:z.string(),
  name:z.string(),
});

export const sceneSchema=z.object({
  id:z.string(),
  title:z.string(),
  path:z.string(),
  folders:z.array(z.string()),
  choices:z.array(choiceSchema),
  nodeId:z.string().optional(),
  storyId:z.string().optional(),
  backgroundAssetId:z.string().optional(),
  excerpt:z.string().optional(),
  ancestors:z.array(ancestorSchema).optional(),
  links:z.array(linkSchema).optional(),
});
export type Scene=z.infer<typeof sceneSchema>;

export const treeItemSchema=z.discriminatedUnion('kind',[
  z.object({kind:z.literal('folder'),key:z.string(),name:z.string(),hasChildren:z.boolean()}),
  z.object({kind:z.literal('scene'),id:z.string(),title:z.string(),hasChildren:z.boolean()}),
]);
export type TreeItem=z.infer<typeof treeItemSchema>;

export const storyConfigSchema=z.object({
  connections:z.record(z.string(),z.object({provider:z.string(),connectionId:z.string()})).optional(),
  kind:z.literal('story').optional(),
});

export const note=defineNote({
  records:[{
    query:'scenes',
    items:'/items',
    next:'/next',
    route:{path:'/scenes/:id',param:'id'},
    id:'/id',
    label:'/title',
  }],
  config:{schema:storyConfigSchema,defaults:{kind:'story'}},
});

export const readInputSchema=z.object({
  path:z.string(),
  startLine:z.number().int().min(1).optional(),
  maxLines:z.number().int().min(1).max(500).optional(),
  pages:z.number().int().min(1).max(100).optional(),
});
export type ReadInput=z.infer<typeof readInputSchema>;

export const documentReadSchema=z.object({
  resourcePath:z.string(),
  path:z.string(),
  displayPath:z.string(),
  content:z.string(),
  format:z.string(),
  revision:z.string(),
  startLine:z.number(),
  endLine:z.number(),
  totalLines:z.number(),
});
export type DocumentRead=z.infer<typeof documentReadSchema>;
