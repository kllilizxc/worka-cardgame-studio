import { z, type NoteFilesReader } from '@dsh-workbench/runtime';
export declare const attachmentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    mime: z.ZodString;
    size: z.ZodNumber;
    sha256: z.ZodString;
}, z.core.$strip>;
export declare const attachmentsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    mime: z.ZodString;
    size: z.ZodNumber;
    sha256: z.ZodString;
}, z.core.$strip>>;
export declare const attachmentRefsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>>;
export type TodoAttachment = z.output<typeof attachmentSchema>;
/** Resolve note-owned identities; client metadata never grants access or replaces provider facts. */
export declare function validateAttachments(ctx: {
    files: NoteFilesReader;
}, input: z.input<typeof attachmentRefsSchema>): Promise<TodoAttachment[]>;
