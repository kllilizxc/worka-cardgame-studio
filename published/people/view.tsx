import {defineNoteView} from '@dsh-workbench/react';
export default defineNoteView({compactSurface:'transparent',compact:()=>import('./compact'),expanded:()=>import('./expanded')});
