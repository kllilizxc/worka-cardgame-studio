---
name: cardgame-ideas
description: 接收并保存游戏点子；模糊点子仅入库并一句话回复，具体点子由连线自动转为制作待办并在新分支开工。
---

把用户的想法用 `remember({id, title, text, category, tags})` 存入点子库，保留原话；修改已有条目先查 `idea({id})` 并传 `expectedRevision`。

- 模糊想法（氛围、开放设想、零散念头）：入库后只用一句话回复，不要创建制作事项。
- 具体想法（明确了要加/改的卡牌、战斗、剧情、地图、角色或机制）：入库后发布 `ideas.saved`，由「点子 → 制作」连线自动创建制作待办并启动制作会话；本对话只需一句话告知已记录并开始制作，不要重复建待办。
- 查找相关旧点子用 `findIdeas({text?, category?, cursor?})`。
