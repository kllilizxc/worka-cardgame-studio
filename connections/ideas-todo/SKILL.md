---
name: cardgame-ideas-to-work
description: 点子具体时转为制作事项并立即在仓库外的独立工作树分支开工；开工时带出相关旧点子；模糊点子只入库不立项。
---

目标：当点子具体可执行时，把它变成制作事项并在绑定游戏仓库目录外的独立工作树分支直接开工；制作开工时一并带出相关的旧点子；模糊点子只保留在点子库中。

契约调用：
- 收到 `ideas.saved`：用 `connection.event` 读取点子。若只是模糊感想或开放设想，不建事项直接结束。若已具体到要改动的内容且 `connection.bindingList` 中尚未关联待办，先用 `call` 调点子库 `findIdeas` 查找相关的旧点子（排除自身），再用 `call` 调制作待办 `addTodo({title, description, workKind: "change"})` 建立事项；调用 `session.prepare({noteId: todoNoteId, delegationId: itemId, initialTitle: title})` 准备事项会话，用 `call` 调 `linkSession({itemId, taskId: itemId, sessionId, title, source: {noteId: ideasNoteId, itemId: ideaId}})` 并用 `connection.bindingLink` 记录关联，调 `recordProgress({itemId, status: "in_progress", summary})` 后通过 `session.send` 启动该事项会话（附上原话与命中的相关旧点子，要求在绑定游戏仓库目录外的独立 Git 工作树分支完成修改、检查并交付试玩）。
- 收到制作待办的 `items.delegationRequested` 或非本连线发起的 `items.sessionLinked`：用 `call` 调 `executionDetails` 读取关联会话与需求，调 `findIdeas` 检索真正相关的旧点子；若命中，通过 `session.record`（或处理 `items.delegationRequested` 时用 `session.send`）把旧点子原话带入该事项会话。
