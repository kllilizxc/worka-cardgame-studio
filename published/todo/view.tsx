import { defineNoteView } from '@realiz3r/worka-react';

export default defineNoteView({
  compact: () => import('./compact'),
  expanded: () => import('./expanded'),
  compactSurface: 'transparent',
});
