import {defineNoteView} from '@realiz3r/worka-react';

const branches={
  compactSurface:'transparent' as const,
  compact:()=>import('./view-compact'),
  expanded:()=>import('./view-expanded'),
};
/** Raw branches for view tests; the mounted note uses the gated default export. */
export const View=defineNoteView({...branches,prerequisites:false});
export default defineNoteView(branches);
