import { z } from '@dsh-workbench/runtime';
export { note } from './model';
export declare const projectIndex: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    connections: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        provider: z.ZodString;
        connectionId: z.ZodString;
    }, z.core.$strip>>>;
    kind: z.ZodEnum<{
        cards: "cards";
        encounter: "encounter";
        map: "map";
        media: "media";
        monsters: "monsters";
        people: "people";
        shop: "shop";
    }>;
    revision: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        group: z.ZodString;
        source: z.ZodString;
        body: z.ZodString;
        facets: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>;
        fields: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>;
        sections: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            lines: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        refs: z.ZodArray<z.ZodObject<{
            note: z.ZodEnum<{
                cards: "cards";
                encounter: "encounter";
                map: "map";
                media: "media";
                monsters: "monsters";
                people: "people";
                shop: "shop";
            }>;
            id: z.ZodString;
        }, z.core.$strip>>;
        diagram: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            layer: z.ZodNumber;
            kind: z.ZodString;
            to: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>>;
        thumbnail: z.ZodOptional<z.ZodString>;
        mediaUrl: z.ZodOptional<z.ZodString>;
        mediaKey: z.ZodOptional<z.ZodString>;
        portraits: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            mediaKey: z.ZodOptional<z.ZodString>;
            thumbnail: z.ZodOptional<z.ZodString>;
            mediaUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const asset: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    key: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodString>, "query">;
export declare const collection: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    facetQuery: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>>;
    page: z.ZodOptional<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodEnum<{
        default: "default";
        name: "name";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    total: z.ZodNumber;
    count: z.ZodNumber;
    page: z.ZodNumber;
    pages: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        group: z.ZodString;
        body: z.ZodString;
        thumbnail: z.ZodNullable<z.ZodString>;
        mediaKey: z.ZodNullable<z.ZodString>;
        summary: z.ZodString;
    }, z.core.$strip>>;
    facets: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        hasMore: z.ZodBoolean;
        options: z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            count: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const home: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodEnum<{
        cards: "cards";
        encounter: "encounter";
        map: "map";
        media: "media";
        monsters: "monsters";
        people: "people";
        shop: "shop";
    }>;
    count: z.ZodNumber;
    records: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        group: z.ZodString;
        source: z.ZodString;
        body: z.ZodString;
        facets: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>;
        fields: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>;
        sections: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            lines: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        refs: z.ZodArray<z.ZodObject<{
            note: z.ZodEnum<{
                cards: "cards";
                encounter: "encounter";
                map: "map";
                media: "media";
                monsters: "monsters";
                people: "people";
                shop: "shop";
            }>;
            id: z.ZodString;
        }, z.core.$strip>>;
        diagram: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            layer: z.ZodNumber;
            kind: z.ZodString;
            to: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>>;
        thumbnail: z.ZodOptional<z.ZodString>;
        mediaUrl: z.ZodOptional<z.ZodString>;
        mediaKey: z.ZodOptional<z.ZodString>;
        portraits: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            mediaKey: z.ZodOptional<z.ZodString>;
            thumbnail: z.ZodOptional<z.ZodString>;
            mediaUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>, "query">;
export declare const overview: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    count: z.ZodNumber;
    items: z.ZodArray<z.ZodString>;
}, z.core.$strip>, "query">;
export declare const record: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodNullable<z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    group: z.ZodString;
    source: z.ZodString;
    body: z.ZodString;
    facets: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>;
    fields: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>;
    sections: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        lines: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    refs: z.ZodArray<z.ZodObject<{
        note: z.ZodEnum<{
            cards: "cards";
            encounter: "encounter";
            map: "map";
            media: "media";
            monsters: "monsters";
            people: "people";
            shop: "shop";
        }>;
        id: z.ZodString;
    }, z.core.$strip>>;
    diagram: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        layer: z.ZodNumber;
        kind: z.ZodString;
        to: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>>;
    thumbnail: z.ZodOptional<z.ZodString>;
    mediaUrl: z.ZodOptional<z.ZodString>;
    mediaKey: z.ZodOptional<z.ZodString>;
    portraits: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        mediaKey: z.ZodOptional<z.ZodString>;
        thumbnail: z.ZodOptional<z.ZodString>;
        mediaUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>>, "query">;
export declare const indexRevision: import("@dsh-workbench/runtime").NoteOperation<undefined, z.ZodObject<{
    revision: z.ZodString;
}, z.core.$strip>, "query">;
export declare const replaceIndex: import("@dsh-workbench/runtime").NoteOperation<z.ZodObject<{
    kind: z.ZodEnum<{
        cards: "cards";
        encounter: "encounter";
        map: "map";
        media: "media";
        monsters: "monsters";
        people: "people";
        shop: "shop";
    }>;
    revision: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        group: z.ZodString;
        source: z.ZodString;
        body: z.ZodString;
        facets: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString>>;
        fields: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>;
        sections: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            lines: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        refs: z.ZodArray<z.ZodObject<{
            note: z.ZodEnum<{
                cards: "cards";
                encounter: "encounter";
                map: "map";
                media: "media";
                monsters: "monsters";
                people: "people";
                shop: "shop";
            }>;
            id: z.ZodString;
        }, z.core.$strip>>;
        diagram: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            layer: z.ZodNumber;
            kind: z.ZodString;
            to: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>>;
        thumbnail: z.ZodOptional<z.ZodString>;
        mediaUrl: z.ZodOptional<z.ZodString>;
        mediaKey: z.ZodOptional<z.ZodString>;
        portraits: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            mediaKey: z.ZodOptional<z.ZodString>;
            thumbnail: z.ZodOptional<z.ZodString>;
            mediaUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    expectedRevision: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    revision: z.ZodString;
    count: z.ZodNumber;
}, z.core.$strip>, "mutation">;
