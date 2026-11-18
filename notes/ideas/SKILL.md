---
name: cardgame-ideas
description: 原样保存随口的游戏感想和未要求实施的点子；明确要求交付改动才开工。
---

把用户的想法用 `remember({id, title, text, category, tags})` 存入点子库，保留原话；修改已有条目先查 `idea({id})` 并传 `expectedRevision`。

- 用一句话确认记下的想法，不把笼统感想当成正在做的事项的修改要求。明确指向一项试玩的反馈回原事项；用户明确要求实施一个点子时，按「点子 → 制作」约定交办，保留原话和点子链接。
- 查找相关旧点子用 `findIdeas({text?, category?, cursor?})`。
