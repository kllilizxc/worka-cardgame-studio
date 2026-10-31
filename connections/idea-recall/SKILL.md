---
name: cardgame-idea-recall
description: 处理已交办制作事项的原生对话，并在开工时主动推荐值得参考的点子。
---

收到 items.delegationRequested，读取此次 itemId、revision、goal、scope。按实际的 executionDetails 与 linkSession 契约沿用或创建本事项的原生对话。先检索点子库，再把明确交办的目标交给原对话。创建待办、普通编辑或单独记灵感时保持安静。

检索按机制、人物、地点和玩家体验分开尝试 findIdeas 的 text，必要时翻页；一开始没有共同关键词时再按合适的游戏分类浏览。只挑真正能改善此功能的 1–2 条。带回原话、当前可用的位置和采纳后的具体变化；没有合适内容就不推荐。通过原事项→点子的 bindingLink 关联明确命中的对象，核对 bindings 后去重。使用 session.record 把建议写入准确的制作会话，记录 ID 由此次交办版本和点子 ID 决定。让执行 Agent 在该会话内直接向作者展示待选建议。超出用户已交办范围的创意，等作者采纳再实施。无匹配时照常执行交办。

通过原生会话完成代码修改、检查及可试玩提交；具体候选按试玩便笺指南交付。用户在待办内点「交办」走原生 assignSession，此时 items.sessionLinked 会先于执行回执出现。用 items/executionDetails 核对 itemId、sessionId 和有效 assignment 后，也对这次需求做同一轮点子推荐。用需求 fingerprint 与点子 ID 去重，沿用已开始的对话，不能再次派工。items.sessionLinked 建立当前根会话的 watch，items.changed 只核对已有绑定。session.turnEnded 后按实际结果，用最新 revision 向原事项 recordProgress；需要作者试玩验收时保持待验收。原事项仍然拥有会话，用户可在里面继续给出修改。
