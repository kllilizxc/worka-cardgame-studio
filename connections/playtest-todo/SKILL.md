---
name: cardgame-playtest-to-work
description: 试玩反馈回到同一制作事项会话；用户回复 OK 时合入游戏 main 分支并完成事项。
---
只有作者明确要修改，或上下文指向作者已试玩的具体版本时，才把意见作为制作反馈。仅仅有一项相关的工作正在做，并不能说明作者已经试玩；对项目的笼统感想按「点子库」的约定保留原话，不传给制作会话。

目标：试玩时的反馈回到对应的制作事项会话；用户回复 `OK` 即合入该试玩候选当前最新就绪版，按仓库配置同步并完成该事项。

契约调用：
- 在 `/notes/<previewNoteId>/candidates/<key>` 页面（通过 `note.recordTarget.owners`）或 Home 收到试玩反馈或 `OK` 时，用 `session.send` 带 `delivery: "queue"` 顺序转交给该候选关联的原制作事项会话（缺失时用 `session.list({record: {noteId: previewNoteId, recordId: key}})` 查找），不要中断正在进行的修改构建。
- 用户提出修改意见时：在原事项会话的同一游戏分支/工作树上继续修改、运行检查并提交，复用原 `key` 调用试玩的 `receive` 更新构建。
- 用户回复 `OK` 确认通过时：除用户明确指定某旧提交外，`OK` 表示确认该试玩候选当前最新就绪版本（转交时不锁死旧提交哈希）。由原事项会话读取试玩 `candidate({key})` 当前就绪的 `repos.game.commit`，核对后合入游戏 `main`、按绑定仓库配置的推送目标同步并完成同一事项。
