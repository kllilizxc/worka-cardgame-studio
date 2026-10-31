import { type ComponentProps } from 'react';
/** Override the block, not inline code; regular fenced code keeps its original DOM. */
export declare function MarkdownPre({ children, node: _node, ...props }: ComponentProps<'pre'> & {
    node?: unknown;
}): import("react").JSX.Element;
