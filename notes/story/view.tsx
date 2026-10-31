import {defineNoteView} from "@dsh-workbench/react";

export default defineNoteView({
  compactSurface: "transparent",
  compact: () => import("./view-compact"),
  expanded: () => import("./view-expanded"),
  prerequisites: {configurationInView: true},
});
