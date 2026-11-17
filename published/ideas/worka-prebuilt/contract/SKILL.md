---
name: cardgame-ideas
description: 原样保存游戏点子。用户要求交付游戏改动时，交给制作待办。
---

把用户的想法用 `remember({id, title, text, category, tags})` 存入点子库，保留原话；修改已有条目先查 `idea({id})` 并传 `expectedRevision`。

- 记录想法后用一句话确认。用户明确想改游戏时，按「点子 → 制作」约定把原话和点子链接交给一个制作事项并开工。
- 查找相关旧点子用 `findIdeas({text?, category?, cursor?})`。
