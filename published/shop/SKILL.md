---
name: cardgame-catalog
description: 实时浏览和编辑游戏内容。需要先试玩的改动与跨内容改动由一个制作事项负责。
---

分页查找用 `collection`，单条记录用 `record({id})`（读取字段、实时引用与游戏内 `source` 文件及 JSON Pointer）；优先查看上下文中的 `note.recordTarget` 获取当前打开的记录。

- 需要先试玩，或一次请求涉及多种内容：按「内容便笺 → 制作」把用户的完整请求和当前记录交给一个制作事项，由同一制作会话在独立工作树完成改动、交付试玩并接收反馈。
- 在本便笺中直接交付的单项修改：在已绑定的 CardGame 检出中直接编辑 `source` 指向的源文件，运行游戏的数据检查与构建（`bun test src/game/content/contentCatalog.test.ts src/game/content/contentDisplayNames.test.ts src/game/types/prototypeExpeditionContent.test.ts` 与 `bun run build-nolog`），通过后直接 `git add` 并 `git commit` 到 `main` 分支，使工作区保持干净（避免与制作待办分支合入冲突）。`game-project` 会自动通知已打开便笺实时更新，无需任何刷新命令。
