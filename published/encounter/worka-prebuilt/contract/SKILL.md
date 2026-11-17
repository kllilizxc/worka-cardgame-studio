---
name: cardgame-catalog
description: 实时分页浏览秘境、战斗、卡牌、怪物、人物、商店与素材，并在本便笺范围内直接编辑游戏源文件并提交到 main。
---

分页查找用 `collection`，单条记录用 `record({id})`（读取字段、实时引用与游戏内 `source` 文件及 JSON Pointer）；优先查看上下文中的 `note.recordTarget` 获取当前打开的记录。

- 属于本便笺自身内容的修改：在已绑定的 CardGame 检出中直接编辑 `source` 指向的源文件，运行游戏的数据检查与构建（`bun test src/game/content/contentCatalog.test.ts src/game/content/contentDisplayNames.test.ts src/game/types/prototypeExpeditionContent.test.ts` 与 `bun run build-nolog`），通过后直接 `git add` 并 `git commit` 到 `main` 分支，使工作区保持干净（避免与制作待办分支合入冲突）。`game-project` 会自动通知已打开便笺实时更新，无需任何刷新命令。
- 超出本便笺部分的跨模块请求：按「内容便笺 → 制作」连线在「制作待办」创建 `workKind: "change"` 的事项，用 `connection.bindingLink` 和 `linkSession` 关联当前记录并启动制作会话。
