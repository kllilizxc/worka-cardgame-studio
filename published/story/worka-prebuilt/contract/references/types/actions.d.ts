import { z } from '@dsh-workbench/runtime';
export type { Data, Resource } from './model';
export { note } from './model';
export declare const projectIndex: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
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
        backgroundAssetId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    initialScene: z.ZodOptional<z.ZodString>;
}, z.core.$loose>, "query">;
export declare const sceneAsset: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    sceneId: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodString>, "query">;
export declare const document: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    resourcePath: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    startLine: z.ZodOptional<z.ZodNumber>;
    maxLines: z.ZodOptional<z.ZodNumber>;
    pages: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    resourcePath: z.ZodString;
    path: z.ZodString;
    displayPath: z.ZodString;
    content: z.ZodString;
    format: z.ZodString;
    revision: z.ZodString;
    startLine: z.ZodNumber;
    endLine: z.ZodNumber;
    totalLines: z.ZodNumber;
}, z.core.$loose>, "query">;
/** Reading local bytes belongs to an action, not the snapshot-only document query. */
export declare const refreshDocument: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    resourcePath: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    startLine: z.ZodOptional<z.ZodNumber>;
    maxLines: z.ZodOptional<z.ZodNumber>;
    pages: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    resourcePath: z.ZodString;
    path: z.ZodString;
    displayPath: z.ZodString;
    content: z.ZodString;
    format: z.ZodString;
    revision: z.ZodString;
    startLine: z.ZodNumber;
    endLine: z.ZodNumber;
    totalLines: z.ZodNumber;
}, z.core.$loose>, "action">;
/** Explicit registration validates readability before changing the configuration. */
export declare const addResource: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    path: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    title: z.ZodString;
    path: z.ZodString;
    root: z.ZodOptional<z.ZodString>;
    linkBase: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "action">;
/** The transaction rechecks uniqueness against the current configuration. */
export declare const registerResource: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    title: z.ZodString;
    path: z.ZodString;
    root: z.ZodOptional<z.ZodString>;
    linkBase: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    title: z.ZodString;
    path: z.ZodString;
    root: z.ZodOptional<z.ZodString>;
    linkBase: z.ZodOptional<z.ZodString>;
    revision: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "mutation">;
export declare const setStoryIndex: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    storyIndex: z.ZodArray<z.ZodObject<{
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
        backgroundAssetId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    initialScene: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    count: z.ZodNumber;
}, z.core.$strip>, "mutation">;
export declare const scenes: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    total: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        path: z.ZodString;
        folders: z.ZodArray<z.ZodString>;
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
        backgroundAssetId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
