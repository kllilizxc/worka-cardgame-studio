import { z } from '@dsh-workbench/runtime';
export declare const fields: {
    title: z.ZodString;
    text: z.ZodString;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
};
export declare const row: z.ZodObject<{
    title: z.ZodString;
    text: z.ZodString;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    revision: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strip>;
export declare const note: import("@dsh-workbench/runtime").NoteModel<{
    readonly ideas: {
        readonly schema: z.ZodObject<{
            title: z.ZodString;
            text: z.ZodString;
            category: z.ZodString;
            tags: z.ZodArray<z.ZodString>;
            revision: z.ZodNumber;
            updatedAt: z.ZodNumber;
        }, z.core.$strip>;
        readonly indexes: readonly [readonly ["updatedAt"], readonly ["category", "updatedAt"]];
    };
}, z.ZodObject<{
    includeExampleWork: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>>;
