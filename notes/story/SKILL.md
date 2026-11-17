---
name: cardgame-story
description: 实时分页阅读与直接编辑游戏剧情原稿、章节分支及关联记录。
---

用 `scenes` 分页检索场景，用 `scene({id})` 读取场景分支与引用，用 `document({path, startLine?, maxLines?, pages?})` 按行读取原文；优先查看 `note.recordTarget` 获取当前打开的场景。

- 属于剧情自身的修改：有 Markdown 原稿的场景直接编辑已绑定 CardGame 仓库中的 `knowledge/` 文件（仅存于运行时 JSON 图的场景编辑对应 `public/data/` 图文件），运行游戏的相关剧情测试（`bun test`）或 `bun run typecheck`；打开的便笺会自动实时显示改动，无需刷新命令。
- 超出剧情范围的跨模块请求（如同时新增战斗、卡牌或商店奖励）：按「内容便笺 → 制作」连线在「制作待办」创建事项，关联当前场景记录并启动制作会话。
