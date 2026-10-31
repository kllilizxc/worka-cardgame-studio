/** The effective list state is read from the URL; category-menu search remains local. */
export declare function readTodoFilters(params: URLSearchParams): {
    search: string;
    category: string;
    archived: boolean;
    view: "board" | "timeline";
};
export declare function updateTodoFilter(previous: URLSearchParams, key: 'q' | 'category' | 'archived' | 'view' | 'month', value: string): URLSearchParams;
