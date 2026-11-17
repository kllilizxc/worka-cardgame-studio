import { z } from '@dsh-workbench/runtime';
export declare const linkSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    target: z.ZodObject<{
        noteId: z.ZodString;
        recordId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type LiveLink = z.infer<typeof linkSchema>;
export declare const choiceSchema: z.ZodObject<{
    label: z.ZodString;
    to: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    hasChildren: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const ancestorSchema: z.ZodObject<{
    key: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
export declare const sceneSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    path: z.ZodString;
    folders: z.ZodArray<z.ZodString>;
    choices: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        to: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        hasChildren: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    nodeId: z.ZodOptional<z.ZodString>;
    storyId: z.ZodOptional<z.ZodString>;
    backgroundAssetId: z.ZodOptional<z.ZodString>;
    excerpt: z.ZodOptional<z.ZodString>;
    ancestors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>>>;
    links: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        target: z.ZodObject<{
            noteId: z.ZodString;
            recordId: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type Scene = z.infer<typeof sceneSchema>;
export declare const treeItemSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"folder">;
    key: z.ZodString;
    name: z.ZodString;
    hasChildren: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"scene">;
    id: z.ZodString;
    title: z.ZodString;
    hasChildren: z.ZodBoolean;
}, z.core.$strip>], "kind">;
export type TreeItem = z.infer<typeof treeItemSchema>;
export declare const storyConfigSchema: z.ZodObject<{
    connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        provider: z.ZodString;
        connectionId: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const note: import("@dsh-workbench/runtime").NoteModel<{}, z.ZodObject<{
    connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        provider: z.ZodString;
        connectionId: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>>;
export declare const readInputSchema: z.ZodObject<{
    path: z.ZodString;
    startLine: z.ZodOptional<z.ZodNumber>;
    maxLines: z.ZodOptional<z.ZodNumber>;
    pages: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ReadInput = z.infer<typeof readInputSchema>;
export declare const documentReadSchema: z.ZodObject<{
    resourcePath: z.ZodString;
    path: z.ZodString;
    displayPath: z.ZodString;
    content: z.ZodString;
    format: z.ZodString;
    revision: z.ZodString;
    startLine: z.ZodNumber;
    endLine: z.ZodNumber;
    totalLines: z.ZodNumber;
}, z.core.$strip>;
export type DocumentRead = z.infer<typeof documentReadSchema>;
