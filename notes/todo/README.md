# Todo List note

An interactive Todo note built on the DSH Workbench native contract.

### Core features

1. **Mobile widget style (compact)**
   - Show completion progress and percentage statistics at a glance.
   - Add an item quickly from the input with Enter.
   - Preview the first unfinished tasks and check them off with one click.
2. **Board-style expanded view**
   - Summary cards show all, pending and completed items and completion rate.
   - Mark categories (work, study, daily life and projects) and priorities (high, medium and low).
   - Switch between all, pending and completed views, or clear completed items in bulk.
   - `generateSuggestions` returns immediately after submitting a host-managed task. The completion handler writes suggestions; the note worker does not wait for the model.
3. **Data and background actions**
   - `defineNote` in `model.ts` declares collections, configuration and update checks, with types inferred from schemas. Each Todo is persisted separately. Mutations atomically update items, counts, source indexes and events; actions validate files and make AI requests.
   - UI actions: `addTodo`, `toggleTodo`, `removeTodo`, `clearCompleted`, `generateSuggestions`. Public connection capabilities include `upsertExternalItem`, `requestDelegation`, `recordProgress`, paginated `itemPage` and single-item `item` queries.

A linked native conversation starting a turn moves its current unfinished task to in-progress. A stale observation, an archived link or task, and a completed task are left unchanged. A conversation ending does not mark business work complete. The board shows when a linked conversation is currently running.

任务更新后排到最前面，重复写入和只读查询保留顺序。置顶编码使用全局递增修订号生成固定长度的逆序字符串，避免反复取中点耗尽排序精度；只有拖拽到相邻任务之间使用可变长度编码。旧编码可继续读取和拖拽，更新时只替换当前任务的编码，无需整表重排。完成与归档仍分别保存任务状态和归档标记。

### Paper appearance

The journal keeps its content layout while controls use the shared Radix package. Colours follow semantic theme tokens in light and dark modes.
