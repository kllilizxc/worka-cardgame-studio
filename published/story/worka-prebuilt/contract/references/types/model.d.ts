import { z } from '@dsh-workbench/runtime';
export declare const resourceSchema: z.ZodObject<{
    title: z.ZodString;
    path: z.ZodString;
    root: z.ZodOptional<z.ZodString>;
    linkBase: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Resource = z.infer<typeof resourceSchema>;
export declare const referenceStateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    resourceRevisions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$loose>;
export declare const sceneSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    path: z.ZodString;
    folders: z.ZodArray<z.ZodString>;
    search: z.ZodString;
    body: z.ZodString;
    choices: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        to: z.ZodString;
    }, z.core.$strip>>;
    refs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        note: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>>>;
    nodeId: z.ZodOptional<z.ZodString>;
    storyId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Scene = z.infer<typeof sceneSchema>;
export declare const referenceConfigSchema: z.ZodObject<{
    connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        provider: z.ZodString;
        connectionId: z.ZodString;
    }, z.core.$strip>>>;
    resources: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        path: z.ZodString;
        root: z.ZodOptional<z.ZodString>;
        linkBase: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    storyIndex: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        path: z.ZodString;
        folders: z.ZodArray<z.ZodString>;
        search: z.ZodString;
        body: z.ZodString;
        choices: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            to: z.ZodString;
        }, z.core.$strip>>;
        refs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            note: z.ZodString;
            id: z.ZodString;
        }, z.core.$strip>>>;
        nodeId: z.ZodOptional<z.ZodString>;
        storyId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    initialScene: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export type Data = z.infer<typeof referenceStateSchema> & z.infer<typeof referenceConfigSchema>;
export type ReferenceState = z.infer<typeof referenceStateSchema>;
export declare const note: import("@dsh-workbench/runtime").NoteModel<{}, z.ZodObject<{
    connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        provider: z.ZodString;
        connectionId: z.ZodString;
    }, z.core.$strip>>>;
    resources: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        path: z.ZodString;
        root: z.ZodOptional<z.ZodString>;
        linkBase: z.ZodOptional<z.ZodString>;
        revision: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    storyIndex: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        path: z.ZodString;
        folders: z.ZodArray<z.ZodString>;
        search: z.ZodString;
        body: z.ZodString;
        choices: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            to: z.ZodString;
        }, z.core.$strip>>;
        refs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            note: z.ZodString;
            id: z.ZodString;
        }, z.core.$strip>>>;
        nodeId: z.ZodOptional<z.ZodString>;
        storyId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    initialScene: z.ZodOptional<z.ZodString>;
}, z.core.$loose>>;
export declare const readInputSchema: z.ZodObject<{
    resourcePath: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    startLine: z.ZodOptional<z.ZodNumber>;
    maxLines: z.ZodOptional<z.ZodNumber>;
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
