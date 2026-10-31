import { fileRefSchema, z, type NoteFilesReader } from '@dsh-workbench/runtime';

export const attachmentSchema = fileRefSchema.extend({
  name: z.string(), mime: z.string(), size: z.number().int().min(0).max(4 * 1024 * 1024), sha256: z.string(),
});
export const attachmentsSchema = z.array(attachmentSchema).max(20);
export const attachmentRefsSchema = z.array(fileRefSchema).max(20);
export type TodoAttachment = z.output<typeof attachmentSchema>;

/** Resolve note-owned identities; client metadata never grants access or replaces provider facts. */
export async function validateAttachments(ctx: { files: NoteFilesReader }, input: z.input<typeof attachmentRefsSchema>): Promise<TodoAttachment[]> {
  const refs = attachmentRefsSchema.parse(input);
  return attachmentsSchema.parse(await Promise.all(refs.map(ref => ctx.files.info(ref))));
}
