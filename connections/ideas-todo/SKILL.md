---
name: cardgame-ideas-to-work
description: 制作会话开工时带上相关旧点子。用户要做的点子直接在制作待办中开工。
---

目标：给实际开工的制作事项带上相关旧点子，保留点子和用户原话的出处。

契约调用：
- 用户要求实施从点子库提出的改动时，由收到请求的会话调用制作待办 `addTodo({title, description, workKind: "change"})` 创建事项，在描述里保留原话和点子链接，再用 `assignSession` 启动制作会话。把独立工作树、检查与试玩交付要求带入同一事项。
- 收到制作待办的 `items.delegationRequested` 或非本连线发起的 `items.sessionLinked`：用 `call` 调 `executionDetails` 读取关联会话与需求，调 `findIdeas` 检索真正相关的旧点子；若命中，通过 `session.record`（或处理 `items.delegationRequested` 时用 `session.send`）把旧点子原话带入该事项会话。
