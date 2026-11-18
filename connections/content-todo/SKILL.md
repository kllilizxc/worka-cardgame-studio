---
name: cardgame-content-to-work
description: 需要先试玩或跨内容的请求关联到一个制作事项，由同一会话完成整个改动和交付。
---

目标：每项明确要做、需要试玩或涉及多种内容的新工作，不论从 Home 还是内容便笺提出，都由自己的制作事项和事项会话负责。对已有工作的反馈回原事项。

契约调用：
- 调用制作待办 `action.invoke({noteId: todoNoteId, action: "addTodo", input: {title, description, workKind: "change"}})` 创建事项。用户指向具体内容记录时，用 `note.recordTarget` 或其明确指定的记录建立 `connection.bindingLink`（`kind: "work"`，内容记录 → 制作事项）。
- 调用 `session.prepare({noteId: todoNoteId, delegationId: itemId, initialTitle: title})`、`linkSession({itemId, taskId: itemId, sessionId, title, source?})` 与 `recordProgress({itemId, status: "in_progress", summary})`，保留已有来源。用返回的 `sessionId`（而非便笺的默认对话）发送用户原话，交给该事项会话在独立工作树开工。
