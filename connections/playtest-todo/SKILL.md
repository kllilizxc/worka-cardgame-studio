---
name: cardgame-playtest-to-work
description: 试玩反馈回到同一制作事项会话；用户回复 OK 时合入游戏 main 分支并完成事项。
---

目标：试玩时的反馈回到对应的制作事项会话；用户回复 `OK` 即把分支合入游戏的 `main`（GitHub 远端一并推送），并将该事项标为完成。

契约调用：
- 在 `/notes/<previewNoteId>/candidates/<key>` 页面发言时，宿主按候选的 `originNoteId` 与 `delegationId` 直接路由到原制作事项会话；若反馈落在试玩便笺主会话，用 `session.list({record: {noteId: previewNoteId, recordId: key}})` 找到拥有者会话并用 `session.send` 转交。
- 用户提出修改意见时：在原事项会话的同一游戏分支/工作树上继续修改、运行检查并提交，复用原 `key` 调用试玩的 `receive` 更新构建。
- 用户回复 `OK` 确认通过时：在原事项会话中将分支合入已绑定 CardGame 仓库的 `main`（若 `git remote get-url origin` 为 GitHub 远端则执行 `git push origin main`），移除临时工作树与分支，并调用制作待办 `action.invoke({noteId: todoNoteId, action: "recordProgress", input: {itemId, status: "done", summary, conclusion}})`。
