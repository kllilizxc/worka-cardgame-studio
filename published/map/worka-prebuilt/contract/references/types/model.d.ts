import { z } from '@dsh-workbench/runtime';
export declare const kindSchema: z.ZodEnum<{
    cards: "cards";
    encounter: "encounter";
    map: "map";
    media: "media";
    monsters: "monsters";
    people: "people";
    shop: "shop";
}>;
export declare const recordSchema: z.ZodObject<{
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
}, z.core.$strip>;
export declare const indexSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type RecordRow = z.infer<typeof recordSchema>;
export declare const note: import("@dsh-workbench/runtime").NoteModel<{}, z.ZodObject<{
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
}, z.core.$strip>>;
