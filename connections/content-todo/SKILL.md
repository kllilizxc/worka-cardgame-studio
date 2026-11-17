---
name: cardgame-content-to-work
description: 内容便笺中超出本便笺自身部分的请求转为关联到所指记录的制作事项并在仓库外工作树开工。
---

目标：当用户在内容便笺里提出的请求超出该便笺自身部分（如在战斗里同时改难度与奖励）时，建立关联到用户所指记录的制作事项并启动制作。

契约调用：
- 从上下文 `note.recordTarget`（或用户明确指定的记录）取得 `{noteId, recordId}`。
- 调用制作待办 `action.invoke({noteId: todoNoteId, action: "addTodo", input: {title, description, workKind: "change"}})` 创建事项，并用 `connection.bindingLink({connectionId, kind: "work", source: {noteId, objectId: recordId}, target: {noteId: todoNoteId, objectId: itemId}})` 建立记录关联。
- 调用 `session.prepare({noteId: todoNoteId, delegationId: itemId, initialTitle: title})`、`action.invoke({noteId: todoNoteId, action: "linkSession", input: {itemId, taskId: itemId, sessionId, title, source: {noteId, itemId: recordId}}})` 与 `recordProgress({itemId, status: "in_progress", summary})`，再用 `session.send` 把用户原话和所指记录的 `source` 信息发往该事项会话在绑定仓库目录外的独立工作树分支开工。
