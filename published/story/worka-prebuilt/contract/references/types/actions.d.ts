import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export declare const status: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    configured: z.ZodBoolean;
    ready: z.ZodBoolean;
    root: z.ZodOptional<z.ZodString>;
    commit: z.ZodOptional<z.ZodString>;
    verifiedAt: z.ZodOptional<z.ZodNumber>;
    label: z.ZodOptional<z.ZodString>;
    executionId: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const scenes: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    configured: z.ZodBoolean;
    total: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const storyTreePage: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    folderKey: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    configured: z.ZodBoolean;
    key: z.ZodString;
    name: z.ZodString;
    ancestors: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>>;
    items: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"folder">;
        key: z.ZodString;
        name: z.ZodString;
        hasChildren: z.ZodBoolean;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"scene">;
        id: z.ZodString;
        title: z.ZodString;
        hasChildren: z.ZodBoolean;
    }, z.core.$strip>], "kind">>;
    hasMore: z.ZodBoolean;
    revision: z.ZodString;
    next: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const scene: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    configured: z.ZodBoolean;
    initialScene: z.ZodString;
    scene: z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const storyHome: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    configured: z.ZodBoolean;
    current: z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>;
    branches: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const sceneAsset: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    sceneId: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodString>, "query">;
export declare const document: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    path: z.ZodString;
    startLine: z.ZodOptional<z.ZodNumber>;
    maxLines: z.ZodOptional<z.ZodNumber>;
    pages: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodNullable<z.ZodObject<{
    resourcePath: z.ZodString;
    path: z.ZodString;
    displayPath: z.ZodString;
    content: z.ZodString;
    format: z.ZodString;
    revision: z.ZodString;
    startLine: z.ZodNumber;
    endLine: z.ZodNumber;
    totalLines: z.ZodNumber;
}, z.core.$strip>>, "query">;
