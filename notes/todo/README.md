# Todo List 便笺

已基于 DSH Workbench 原生规范构建交互式待办便笺。

### 核心特性
1. **手机桌面小组件风格 (Compact 态)**
   - 快速展示任务完成进度条及统计比例（%）。
   - 内置快速新建待办输入栏与回车添加。
   - 预览未完成前列任务，支持一键点击打勾完成。
2. **看板级展开视图 (Expanded 态)**
   - 详细统计卡片：全部事项、待完成、已完成、完成率。
   - 任务分类（工作、学习、日常、项目）与优先级（高优、中优、低优）标记。
   - 视图状态切换（全部、待处理、已完成）。
   - 批量清理已完成项。
   - `generateSuggestions` 提交宿主管理的任务后立即返回；完成处理器写入建议，便笺 worker 不等待模型运行。
3. **数据管理与后台 Action**
   - 集合、配置与更新检查由 `model.ts` 中的 `defineNote` 声明，类型从 schema 推导。每条待办独立持久化；mutation 原子更新条目、计数、来源索引和事件。文件验证与 AI 请求由 action 完成。
   - 界面动作：`addTodo`、`toggleTodo`、`removeTodo`、`clearCompleted`、`generateSuggestions`。连线公开能力为 `upsertExternalItem`、`requestDelegation`、`recordProgress` 与分页 `itemPage` / 单项 `item` 查询。


### 纸张外观

纸张手帖是有意为之的独特外观，也是“用户要独特外观时”的官方示例（见 `skills/workbench/references/note-ui.md`）。控件仍是 HeroUI；`.folio` 根上重新声明 `--wb-*` 主题变量和读取它们的 HeroUI 别名，控件和 Worka 组件因此自动换成纸张配色；其余规则只补纸张材质。普通便笺不要照搬这套 CSS，用 Worka 组件和 HeroUI 即可。

### 编辑与继续交付

Todo 双击标题或详情编辑只保存草稿。手动点击“交办”或“继续交付”调用 `assignSession({itemId})`：创建或复用原生会话，提交宿主受管 Agent 执行，队列受理后自动进入 `in_progress` 并打开会话。同一要求执行期间重复点击复用原 session/job；已知结束后可明确继续，受理结果不明不自动重发。需求使用现有编辑版本指纹核对，后续未交办草稿不扩大本次要求。启动失败如实写回 `blocking`，原生回合结束不自动标为业务完成。

已有连线和自动导入仍可调用 `requestDelegation` 发布 `items.delegationRequested`；事件保留提交时的 `item`、`revision`、`goal` 和 `scope`，相同请求重试复用 `requestId`。

连线按本轮事件快照处理具体事项，使用 `item({itemId})`、`requirement({itemId})` 和 `executionDetails({itemId})` 读取需求、来源和已有会话。普通编辑是草稿；只有明确交办快照或已授权来源要求才能发送新一轮。

Todo 是唯一事项主体。`linkSession({itemId,taskId,sessionId,title,source?})` 关联已准备的原生会话，不启动执行；新要求才经原生 `session.send` 发送。一项可关联多个会话，多项可补充同一工作；保留原 taskId 和 sessionId，旧任务用 `sessionTask({taskId})` 定位全部当前事项。详情展示完整来源、会话与结论，列表仅展示重点。没有来源、会话或关联记录时不渲染对应区块、标题或占位文案；未设置的元数据不补默认标签。来源名称和图标来自当前真实便笺元数据。来源图标紧随事项标题同行展示，完整来源名称与入口放在详情中。单个同名会话仅保留打开动作，不重复事项标题。关联链接沿用可读名称和图标，默认标签不显示目标记录 ID；ID 只用于准确跳转。同一便笺下多个默认链接按显示顺序编号。已在来源出现的同一记录不再重复列入关联。

`items.sessionLinked` 用于发现新关联；`items.changed` 用于核对已绑定事项，不等于新交办。原生轮次结束不表示事项完成，连线按本次提交范围和全部相关会话的实际成果综合回写 `recordProgress`。回写前读取最新 revision，冲突重算，保留手动编辑。归档只是隐藏事项，不恢复或停止原生工作；需要停止时在原对话操作。旧历史归档记录不会自动重跑。

详情常显进展时间线，以一句短摘要说明“已核实的结果或阻碍＋下一步”，完整结论按需打开。`recordProgress({itemId,status,summary?,conclusion?,expectedRevision?})` 和本 Todo 的兼容 `feedback` 接受可选 `summary`：中文建议 40–60 字、最多 100 字，英文最多 180 字符；没有下一步时只写结果。摘要不堆 commit 哈希、路径、taskId、featureId、工具回执或重复的权限说明，这些细节保留在完整 `conclusion` 与关联原记录中。尚未核实、受阻和部分完成都应如实写出，不能为短文案改成成功。没有新事实不反复写同一进展。

进展时间是原事实的记录时间。迁移的历史结果、原生轮次结束和旧进展快照各保留自身语义，不能补造开始、验收或完成阶段。调用前核对当前 schema；`summary` 只属于这里声明的 Todo 回写契约，不附加到旧执行台 `feedback`、预览 `recordFeedback` 或其他接口。

详情、编辑和历史由 `routes.tsx` 中的 `/tasks/:taskId`、`/edit`、`/history` 决定；搜索、分类和归档分别读取 `q`、`category`、`archived=1`。详情通过真实 ID 单独查询，保留背景列表的筛选、分页和滚动，不向筛选结果添加额外条目。关闭直接回同查询串的列表；编辑草稿与保存保护继续由 SDK 和宿主处理。会话在宿主的通用 Session 子路由中打开，保留当前任务详情。旧 record 定位先解析真实事项，再进入相同页面地址。

### 来源导入（importItems）

来源便笺（如消息类便笺）把拆解出的任务项经连线调用 `importItems` 写入待办：

```ts
importItems({
  items: [{ title, description?, priority?, category?, dueDate?, source? }],
  mode?: "append" | "upsert",   // 默认 "append"
  autoDelegate?: boolean,        // 默认 false
})
```

- **去重**：带 `source` 的项按 `source.kind + source.itemId + (source.taskKey ?? 小写化 trim 标题)` 幂等去重，重复导入、连线重试安全；有 `taskKey` 时完全以 taskKey 为准，标题改写仍命中同一项；无 `source` 的项不参与去重，总是新增。
- **append（默认）**：命中既有项时原样保留，结果标 `deduped: true`。
- **upsert**：命中项的标题/描述与导入值不一致时更新并写 `sourceAutoUpdatedAt`（可见性标记），结果标 `updated: true`；一致则标 `deduped: true`。
- **autoDelegate**：成功导入后，对新增或更新项发布包含该次提交 `item` 快照的交办事件，由连线 Agent 选择任务；同一批相同 itemId 只发布最终内容一次。未变化的去重项不再次交办。事件入队与数据写入同一事务；事件登记失败时本次 mutation 不提交。`delegation: {status: "queued"}` 只表示事件已登记，不能当作业务完成。调用方仍须检查缺少标题等逐项 error。
- 重复导入不自动重试此前失败的交办。失败或结果不明时先核对原事件和回执，按宿主失败卡或明确的交办操作恢复，不能换 ID 重复派发。自动交办和手动继续交付均保留任务的暂停、归档边界。
- 返回 `{ results: Array<{ itemId, deduped?, updated?, delegation?, error? }> }`；单批最多 100 项，数据、计数、来源指针及事件统一提交；同一项重复更新只登记最终快照的交办事件。

`source` 是通用来源契约，由发送方填充，todo 不解析 `kind`：

```ts
interface TodoItemSource {
  kind: string;             // 来源类型标识
  itemId: string;           // 来源侧稳定标识
  label?: string;           // 展示名, 如 "Slack · #general"
  url?: string;             // 跳回来源的链接
  title?: string;           // 来源标题快照
  messageIds?: string[];    // 导入时的消息快照
  taskKey?: string;         // 来源侧稳定任务键
  importedAt?: string;
}
```

`taskKey` 由发送方分配并保证**跨次重新拆解稳定**：同一任务在来源更新、重新拆解后仍用原 taskKey，新任务才给新 taskKey。todo 匹配时优先使用 `source.kind + source.itemId + taskKey`（标题改写也命中更新）；未提供 taskKey 时回退到标题归一，此时标题变化会被视为新项。

交办快照保留完整 `source`，连线将必要来源和要求传给事项的原生对话；来源更新本身不改变既有任务，是否提交由本次显式交办或已授权的 `autoDelegate` 决定。视图通用渲染真实来源名称、图标和原始记录链接；自动应用时间保留在数据中，不以固定说明文字占据详情。旧条目无 `source` 字段，全部按可选处理。

### 大列表与编辑

列表只传白名单摘要和图片数量；图片与进展正文在打开这一项时读取，完整正文保存在独立条目记录中。四列分别使用原生分页；分类和状态按索引过滤，标题子串只匹配当前页，空页有 next 时仍可继续翻页。搜索时不计算全集匹配数，分类和未搜索列的计数由事务维护；拖拽通过稳定条目 ID 锚点定位真实全局顺序。分类单独分页，分类名子串同样只匹配当前页，当前选择跨分类页保留；分类查询失败只影响分类区域，不遮住看板。统计只返回固定大小的计数，不夹带全部分类。

普通文件附件使用便笺已有的 `files` 服务，每项最多 20 个、每个最多 4 MiB。展开后的新增表单与需求编辑器支持选择或拖入文件、失败重试和移除；上传尚未完成或失败待处理时不能保存。列表只返回 `attachmentCount`，打开附件后才读取该项元数据，点击下载才读取文件字节。文件引用只属于原便笺，交办、复制引用或删除条目附件不会自动共享文件或撤销其他条目仍在使用的引用。

上传队列沿用 SDK 的稳定草稿 key，同一页面进程中筛选或翻页导致编辑器卸载时仍保留所选 File 与请求编号；重新打开编辑器后用同一编号核对或重试。浏览器重载不会持久保存尚未上传的文件字节，需要重新选择文件，不将中断的上传当成成功。

`addTodo` 接受可选的 `description`、`attachments: [{id}]`；`editTodo` 接受可选的 `attachments`、`priority`、`category`、`dueDate`。省略附件保留原值，空数组移除条目附件；空分类或日期清除对应字段。保存时按本便笺权限重新查询文件元数据，忽略客户端附带的名称、大小等声明。附件及可编辑元数据纳入需求指纹，冲突后重新读取；独立状态和排序变化不阻止需求保存。

`itemPage {status?, category?, search?, active?, archived?, cursor?}` 返回 `{items, revision, next?}`，页预算由宿主限制，不计算 total。`item {itemId}` 按 ID 返回白名单单项及 requirementRevision；`requirement {itemId}` 返回完整可编辑字段及需求指纹。默认界面不读取整个待办列表的正文或图片。`items {itemId?}` 和 `list {}` 保留完整需求读取契约；批量读取可能包含图片与来源资料，列表优先使用 `itemPage`。

编辑器的 `requirement {itemId}` 查询返回完整可编辑字段及需求指纹 `revision`。`editTodo` 提交新字段和 `baseFingerprint`，不重复发送 baseline 图片；指纹只覆盖需求字段，状态/排序的独立并发修改仍保留。创建、编辑和来源 upsert 返回小型身份回执，保存结果以独立查询核对，失败或回执不明不会自动重新创建。

编辑器由任务编辑路由决定；离开编辑页面会真实卸载编辑器。未完成草稿由 SDK 按稳定条目 key 保留，卡片重现后继续编辑，不保活隐藏 DOM 或复制来源缓存。条目删除后，SDK 的共享“未显示的编辑”区域仍可查看、复制或明确放弃草稿。


### 资源边界

`clearCompleted` 每次只删除一页，通过事务调度继续处理；返回 `pending: true` 表示尚未全部完成。并发新增的已完成项可能被后续批次一起清理。顺序使用可插入的字符串位置，新建或实际更新的事项排在前面；读取和重复保存不改变顺序，显式拖拽仍按目标位置保存。看板各列、筛选及 compact 共用这一顺序。拖拽只修改目标记录；查找远处锚点逐页读取位置字段，仍可能耗费多页读取。AI 只接收一页摘要，生成后按规范化标题查重，不读取全库正文。

拖拽和完成框使用同一份即时界面投影：先移动卡片、更新勾选与计数，仅锁定该事项，后台仍走原生 mutation 和真实查询。确认保存后等待来源/目标页刷新再撤销投影；保存失败回到查询状态，已保存但读回失败只重试查询，结果不明沿原 requestId 核对，不重复写入。筛选或翻页不沿用其他页面的临时投影。

### 排期视图

展开页通过 `view=timeline` 切换横向排期，默认显示本月起三个月；`month=YYYY-MM` 保存窗口，`timelineStatus=all` 显示全部状态。复用分类、搜索与归档筛选，默认只看未完成，单页读取并保留上一页/下一页，不将当前页冒充完整计划。按分类分组，条目点击继续原详情/编辑路由，保留所有来源与会话。

可选 `startDate` 与既有 `dueDate` 表示计划开始/截止日期，不从创建时间或执行状态推算。两端齐全显示时间条，只有一个日期显示日期点，缺日期、格式无效和窗口外事项保留可编辑入口。日期按本地日历解释，跨月裁切，截止日包含在条内；编辑与并发保护复用 `editTodo`，状态/顺序修改不冲掉日期。

任务卡只能由用户确认完成。Agent 和连线只回写实际进展，认为本次要求已完成时移到 `blocking`，说明待用户 review；不得通过 `updateStatus`、`toggleTodo`、`moveTodo` 或导入接口绕过。`recordProgress` / `feedback` 不允许把未完成事项写成 `done`；已有用户确认的完成状态可保留。
