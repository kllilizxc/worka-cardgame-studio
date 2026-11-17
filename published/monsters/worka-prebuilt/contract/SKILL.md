---
name: cardgame-catalog
description: 实时分页浏览秘境、战斗、卡牌、怪物、人物、商店与素材，并在本便笺范围内直接编辑游戏源文件。
---

分页查找用 `collection`，单条记录用 `record({id})`（读取字段、实时引用与游戏内 `source` 文件及 JSON Pointer）；优先查看上下文中的 `note.recordTarget` 获取当前打开的记录。

- 属于本便笺自身内容的修改：直接在已绑定的 CardGame 仓库编辑 `source` 指向的文件，运行游戏自身的检查（如相关 `bun test` 或 `bun run typecheck`）；`game-project` 会自动通知已打开便笺实时更新，无需任何刷新命令。
- 超出本便笺部分的跨模块请求：按「内容便笺 → 制作」连线在「制作待办」创建 `workKind: "change"` 的事项，用 `connection.bindingLink` 和 `linkSession` 关联当前记录并启动制作会话。
