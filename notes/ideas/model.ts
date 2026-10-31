import {defineNote, z} from '@dsh-workbench/runtime';

export const fields = {
  title: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(8000),
  category: z.string().trim().min(1).max(80),
  tags: z.array(z.string().trim().min(1).max(80)).max(16),
};
export const row = z.object({...fields, revision:z.number().int(), updatedAt:z.number()});
export const note = defineNote({config:{schema:z.object({includeExampleWork:z.boolean().optional()}),defaults:{}},collections:{ideas:{schema:row,indexes:[['updatedAt'],['category','updatedAt']]}}});
