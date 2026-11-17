---
name: cardgame-record-links
description: 根据每条游戏记录自身的引用实时计算跨便笺关联。
---

目标：记录之间的跳转关联由 `game-project` 根据绑定检出中每条记录的引用实时计算，不写入静态链接列表，也无需手动刷新。

契约调用：
- 内容便笺查询 `record`、`home`、`scene` 时，`game-project` 按本连线已启用的成员便笺实时返回双向 `links`，界面通过 `navigation.open(link.target)` 直接打开目标记录。
