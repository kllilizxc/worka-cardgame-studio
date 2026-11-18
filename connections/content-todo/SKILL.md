---
name: cardgame-content-to-work
description: 需要先试玩或跨内容的请求关联到一个制作事项，由同一会话完成整个改动和交付。
---

目标：把需要先试玩或涉及多种内容的完整请求挂到用户所指记录，由一个制作事项负责从改动到试玩确认。

契约调用：
- 从上下文 `note.recordTarget`（或用户明确指定的记录）取得 `{noteId, recordId}`。
- 调用制作待办 `action.invoke({noteId: todoNoteId, action: "addTodo", input: {title, description, workKind: "change"}})` 创建事项，并用 `connection.bindingLink({connectionId, kind: "work", source: {noteId, objectId: recordId}, target: {noteId: todoNoteId, objectId: itemId}})` 建立记录关联。
- 调用 `session.prepare({noteId: todoNoteId, delegationId: itemId, initialTitle: title})`、`action.invoke({noteId: todoNoteId, action: "linkSession", input: {itemId, taskId: itemId, sessionId, title, source: {noteId, itemId: recordId}}})` 与 `recordProgress({itemId, status: "in_progress", summary})`，再用 `session.send` 把用户原话和所指记录的 `source` 信息发往该事项会话在绑定仓库目录外的独立工作树分支开工。
