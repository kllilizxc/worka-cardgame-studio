/** Calendar-day arithmetic is independent of the browser's timezone and DST. */
export declare function scheduleDay(value?: string): number | undefined;
export declare const dayString: (day: number) => string;
export declare function validateSchedule(item: {
    startDate?: string;
    dueDate?: string;
}): void;
export declare function scheduleWindow(month: string, today?: Date): {
    key: string;
    start: number;
    end: number;
    days: number;
    months: {
        start: number;
        end: number;
        label: string;
    }[];
};
export declare function shiftScheduleMonth(month: string, offset: number): string;
export declare function schedulePlacement(item: {
    startDate?: string;
    dueDate?: string;
}, window: {
    start: number;
    end: number;
    days: number;
}): {
    kind: 'invalid';
    left?: undefined;
    width?: undefined;
    clippedStart?: undefined;
    clippedEnd?: undefined;
} | {
    kind: 'unscheduled';
    left?: undefined;
    width?: undefined;
    clippedStart?: undefined;
    clippedEnd?: undefined;
} | {
    kind: 'outside';
    left?: undefined;
    width?: undefined;
    clippedStart?: undefined;
    clippedEnd?: undefined;
} | {
    kind: "bar" | "point";
    left: number;
    width: number;
    clippedStart: boolean;
    clippedEnd: boolean;
};
