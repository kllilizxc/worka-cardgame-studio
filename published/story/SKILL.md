---
name: cardgame-story
description: 实时编辑剧情原稿，直接交付的单项修改检查后提交到 main；需要先试玩或跨内容的改动由一个制作事项负责。
---

用 `scenes` 分页检索场景，用 `scene({id})` 读取场景分支与引用，用 `document({path, startLine?, maxLines?, pages?})` 按行读取原文；优先查看 `note.recordTarget` 获取当前打开的场景。

- 需要先试玩，或一次请求涉及多种内容：按「内容便笺 → 制作」把用户的完整请求和当前场景交给一个制作事项，由同一制作会话在独立工作树完成改动、交付试玩并接收反馈。
- 直接交付的剧情改动：有 Markdown 原稿的场景直接编辑已绑定 CardGame 检出中的 `knowledge/` 文件（仅存于运行时 JSON 图的场景编辑对应 `public/data/` 图文件），运行游戏的剧情数据检查与构建（`bun test src/game/types/storyContent.test.ts src/game/content/contentCatalog.test.ts` 与 `bun run build-nolog`），通过后直接 `git add` 并 `git commit` 到 `main` 分支，保持工作区干净。打开的便笺会自动实时显示改动，无需刷新命令。
