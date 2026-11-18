---
name: cardgame-playtest-to-work
description: 试玩反馈回到同一制作事项会话；用户回复 OK 时合入游戏 main 分支并完成事项。
---
只有作者明确要修改，或上下文指向作者已试玩的具体版本时，才把意见作为制作反馈。仅仅有一项相关的工作正在做，并不能说明作者已经试玩；对项目的笼统感想按「点子库」的约定保留原话，不传给制作会话。

目标：试玩时的反馈回到对应的制作事项会话；用户回复 `OK` 即合入确认版，按仓库配置同步并完成该事项。

契约调用：
- 在 `/notes/<previewNoteId>/candidates/<key>` 页面发言时，宿主按候选的 `originNoteId` 与 `delegationId` 直接路由到原制作事项会话；若反馈落在试玩便笺主会话，用 `session.list({record: {noteId: previewNoteId, recordId: key}})` 找到拥有者会话并用 `session.send` 转交。
- 用户提出修改意见时：在原事项会话的同一游戏分支/工作树上继续修改、运行检查并提交，复用原 `key` 调用试玩的 `receive` 更新构建。
- 用户回复 `OK` 确认通过时：交原事项会话按制作待办的交付流程，合入并同步用户确认的试玩提交，核验后完成同一事项。
