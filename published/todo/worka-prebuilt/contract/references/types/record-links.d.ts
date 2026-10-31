import { NoteIcon } from '@dsh-workbench/react';
import type { ComponentProps } from 'react';
import type { TodoDisplaySource } from './list';
export type LinkGroupItem = {
    key: string;
    label: string;
    onOpen(): Promise<unknown>;
};
export type LinkGroupProps = {
    label: string;
    icon?: ComponentProps<typeof NoteIcon>['icon'] | null;
    links: readonly LinkGroupItem[];
    onNavigate?(open: () => Promise<unknown>): void;
};
/** One destination type has one entry, regardless of its number of records. */
export declare function LinkGroup({ label, icon, links, onNavigate }: LinkGroupProps): import("react").JSX.Element | null;
type RelatedRecordsProps = {
    recordId: string;
    className?: string;
    heading?: string;
    onNavigate?(open: () => Promise<unknown>): void;
    excludedSources?: readonly {
        noteId?: string;
        itemId?: string;
    }[];
    sources?: readonly TodoDisplaySource[];
    originalSource?: {
        label: string;
        url?: string;
    };
};
/** Only presentation changes here; the host still owns each navigation target. */
export declare function RelatedRecords({ recordId, className, heading, onNavigate, excludedSources, sources, originalSource }: RelatedRecordsProps): import("react").JSX.Element;
export {};
