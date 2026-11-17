import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export declare const saved: Readonly<import("@dsh-workbench/runtime").NoteEvent<z.ZodObject<{
    title: z.ZodString;
    text: z.ZodString;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    revision: z.ZodNumber;
    updatedAt: z.ZodNumber;
    id: z.ZodString;
}, z.core.$strip>>>;
export declare const idea: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodObject<{
    title: z.ZodString;
    text: z.ZodString;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    revision: z.ZodNumber;
    updatedAt: z.ZodNumber;
    id: z.ZodString;
}, z.core.$strip>>, "query">;
export declare const cover: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    title: z.ZodString;
    countLabel: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const findIdeas: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    text: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, import("@dsh-workbench/runtime").PageSchema<import("@dsh-workbench/runtime").RecordSchema<z.ZodObject<{
    title: z.ZodString;
    text: z.ZodString;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    revision: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, z.core.$strip>>>, "query">;
export declare const remember: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    title: z.ZodString;
    text: z.ZodString;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    id: z.ZodString;
    expectedRevision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    title: z.ZodString;
    text: z.ZodString;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    revision: z.ZodNumber;
    updatedAt: z.ZodNumber;
    id: z.ZodString;
}, z.core.$strip>, "mutation">;
