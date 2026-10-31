import { defineNote, z } from '@dsh-workbench/runtime';

export const resourceSchema = z.object({
  title: z.string(), path: z.string(), root: z.string().optional(),
  linkBase: z.string().optional(), revision: z.string().optional(),
});
export type Resource = z.infer<typeof resourceSchema>;
export const referenceStateSchema = z.looseObject({
  title: z.string().optional(),
  resourceRevisions: z.record(z.string(), z.string()).optional(),
});
export const sceneSchema = z.object({
  id:z.string(), title:z.string(), path:z.string(), folders:z.array(z.string()),
  search:z.string(), body:z.string(), choices:z.array(z.object({label:z.string(),to:z.string()})),
  refs:z.array(z.object({note:z.string(),id:z.string()})).optional(),
  nodeId:z.string().optional(), storyId:z.string().optional(),
});
export type Scene = z.infer<typeof sceneSchema>;
export const referenceConfigSchema = z.looseObject({
  connections:z.record(z.string(),z.object({provider:z.string(),connectionId:z.string()})).optional(),
  resources:z.array(resourceSchema),storyIndex:z.array(sceneSchema).optional(),initialScene:z.string().optional(),
});
export type Data = z.infer<typeof referenceStateSchema> & z.infer<typeof referenceConfigSchema>;
export type ReferenceState = z.infer<typeof referenceStateSchema>;

export const note = defineNote({
  config: { schema: referenceConfigSchema.partial({resources:true}), defaults: {resources:[]} },
  update: {
    dataVersion: 'cardgame-story@1',
    checks: [{
      name: '关键能力与稳定身份',
      async run(ctx): Promise<boolean> {
        const config = await ctx.config.read();
        return config.resources === undefined || Array.isArray(config.resources) && config.resources.every(resource =>
          typeof resource.path === 'string' && (resource.title === undefined || typeof resource.title === 'string'));
      },
    }],
  },
});

export const readInputSchema = z.object({
  resourcePath: z.string(), path: z.string().optional(), from: z.string().optional(),
  startLine: z.number().int().min(1).optional(), maxLines: z.number().int().min(1).max(500).optional(),
});
export type ReadInput = z.infer<typeof readInputSchema>;

export const documentReadSchema = z.object({
  resourcePath: z.string(), path: z.string(), displayPath: z.string(), content: z.string(),
  format: z.string(), revision: z.string(), startLine: z.number(), endLine: z.number(), totalLines: z.number(),
});
export type DocumentRead = z.infer<typeof documentReadSchema>;
