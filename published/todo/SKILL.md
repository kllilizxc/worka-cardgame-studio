---
name: worka-todo
description: 维护待办、更新状态或把稳定事项与原生对话关联。
---

维护原生 `items` 集合中的稳定 ID。`addTodo` 创建，`updateStatus` 明确设置状态，`toggleTodo` 翻转当前状态，`removeTodo`/`clearCompleted` 删除记录（批量清理返回 pending 时由宿主继续后续页）；不要把可重试的设置操作改成重复 toggle。

交办使用 `requestDelegation`，指定稳定 itemId 并核对当次交办事件回执。`feedback` 接收执行结果；完成以实际回执和持久状态为准。`generateSuggestions` 提交受管模型任务并返回任务引用；只有完成处理器写入后才算建议已生成。编辑已有内容用 `editTodo` 及其 baseFingerprint 字段（取单项 requirement 查询返回的 revision，不重复提交 baseline 图片），保留并发修改。辅助路径/状态函数不是推荐的业务调用入口。

进展回写使用 `recordProgress({itemId,status,summary?,conclusion?,expectedRevision?})`；本 Todo 的兼容 `feedback` 接口同样区分短摘要与完整结论。`summary` 用一句“已核实的结果或阻碍＋下一步”，中文建议 40–60 字、最多 100 字，英文最多 180 字符。没有下一步就只写结果；结果未知则直说尚未核实，不能为缩短文案虚构成功。commit 哈希、路径、taskId、featureId、工具回执及重复的权限说明放入完整 `conclusion` 或关联原记录，不塞进摘要。没有新事实不反复回写。先核对当前接口 schema，不把本字段套到旧执行台或其他便笺的反馈接口。

外部创建示例：`action.invoke({noteId,action:"addTodo",input:{title:"核对交付结果",priority:"medium"}})`。随后 item({itemId}) 查询读回新事项。

连线订阅事件时：交办只需 `items.delegationRequested`，普通编辑是 `items.changed`；只选业务需要的那个。

`itemPage` 只返回分页摘要，使用返回的 `next` 作为下次 `cursor`；分类/状态筛选由原生查询处理，标题子串只匹配当前页；无 total，空页有 next 仍需继续。用 `item {itemId}` 读取选定条目摘要和 requirementRevision；`requirement {itemId}` 读取完整可编辑字段及需求指纹，不复制内部投递或来源 payload。创建与编辑回执仅含稳定 itemId 和 revision；业务内容从查询读取，不从回执拼状态。

文件附件使用当前便笺的 `files` 引用，最多 20 个、每个 4 MiB。`addTodo` 可传 `description`、`attachments:[{id}]`；`editTodo` 也可更新 attachments、priority、category、dueDate，沿用 requirement 返回的 baseFingerprint。省略 attachments 保留原值，空数组移除。引用不授予其他便笺读取权限，交办不等于共享文件内容。列表仅含 attachmentCount，完整元数据按单项读取，文件字节仅按明确需要读取。

事项拥有来源、结论和 sessions 引用，不另设执行台。执行只发生在已关联的原生会话，linkSession 只记关联；executionDetails 读全部来源和会话，sessionItems 分页发现会话，sessionTask 由原 taskId 找全部关联事项。来源先核对真实便笺/对象ID，名称和图标用当前元数据，不按标题猜来源。新会话以本 Todo 为 noteId，准备和关联成功才发送明确要求。

列表主信息为标题、状态、来源与对话入口；需求全文、附件、来源跳转和成果关联在详情弹窗。详情常显进展时间线的短摘要，完整结论按需打开；时间采用实际记录事实，不推造开始、验收或完成阶段。归档不改变业务状态，也不自动恢复执行。多会话/多事项保留完整关系；从旧 taskId 进入若对应多项应提供选择，不能取第一项。

任务卡只能由用户确认完成。Agent 和连线只回写实际进展，认为本次要求已完成时移到 `blocking`，说明待用户 review；不得通过 `updateStatus`、`toggleTodo`、`moveTodo` 或导入接口绕过。`recordProgress` / `feedback` 不允许把未完成事项写成 `done`；已有用户确认的完成状态可保留。

本桌面处理卡牌游戏制作。记点子由点子库承担；明确说要实现才交办。制作连线在开工时检索旧灵感，建议和采纳结果留在本事项原生对话。交付游戏修改时，记录源游戏仓库、可重建的完整 commit、试玩起点与实测结果，再通过「试玩」的公开入口交付。
