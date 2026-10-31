---
name: worka-candidate-preview
description: 接收候选版本，检查和控制项目预览，核对失败及修复反馈。
---

这是 Worka 的预览入口。Worka 会话和关联 Todo 通过本便笺公开动作与查询登记、启动、停止及读取诊断；不要改用知识库独立 `preview-desk` skill。知识库只提供共享项目启动配置。配置了 `previewDesk` 的便笺与独立预览台共用该 home 的登记和运行服务，便笺 state 只是显示投影与任务关联，不能直接编辑 state 代替登记。未配置共享服务的便笺继续由 Worka 宿主管理。

首次接入或修复启动流程，由当前 Agent 完成：探索问题 → 修复写回业务源码和共享配方 → 固定来源，在干净运行目录用同一配方重跑 → 实际打开声明入口 → 交付。安装前能判定的身份与目标权限放入已有 `check`。重跑不复制探索目录的 node_modules、构建产物或手工补丁，可以复用工具、包下载缓存与明确引用的本机授权配置；仍需手动补步骤时先修回来源，不交付临时成功。

正式登记沿用原候选 key；干净重跑使用隔离验证目录，配置共享预览服务时可按其 Skill 使用临时 home，验证后停止临时服务，不改原便笺绑定。普通启停仍复用健康服务与准备结果。读取实际入口确认身份、挂载与主要内容，将源码和共享配方版本、观察结果及未验证范围留在原任务结论；不新增审批、验收任务或状态机。

`receive` 登记候选：稳定 key、`adapter`（项目或已配置知识库中的 v3 `preview.config.mjs`）加 `repos`（角色 → 仓库与完整提交）；单仓可用 `cwd + revision` 代替 repos，仍需 adapter。历史 `argv + url` 或旧模块只用于原记录的启停与迁移，不能创建新候选。登记只声明来源，不是预览已运行的证据。`start`/`stop` 修改期望状态，宿主负责收敛；状态写在 `candidates` 集合中该 key 的 `status[端]`，界面和调用方都以它为准。

候选可以由关联 Todo 的任务投递，也可以由任何便笺或对话独立登记。带来源的候选附 originNoteId/delegationId：首项 key=delegationId，额外候选依次使用 delegationId#2、#3；独立候选自选稳定 key（字母数字加点、下划线、短横线）。更新或重试复用原 key，已记录的来源不会被后续同步抹掉。

关联便笺可通过公开 catalog({cursor?,limit?}) 分页发现未归档候选的稳定身份、完整提交和预览入口；选定后再调用 candidate({key}) 读取当前完整状态。catalog 不返回运行日志、凭据或适配器 options，不启动预览。

运行器只保存故障事实与日志，不因首次准备或检查失败唤起另一个 Agent。当前登记 Agent 直接读取并解决；需要后来继续处理时，用户或有授权的 Agent 使用 `requestRepair` 沿现有连线请求帮助。`refreshFeedback` 只重试已请求的投递，`recordFeedback` 展示真实处理状态，不额外启动修复轮次。

普通 `start` 重新读取当前脚本与配置，复用有效服务并核对入口；修改脚本后仍使用同一入口。`stop` 停止整个候选，页面入口不单独启停。Docker 容器跨宿主重启保留，显式停止或归档才释放；服务就绪即可预览，业务检查不阻塞页面。archive/restore 管理归档，forget 删除已归档候选及其工作区，rename 只修改标题。启动配置须能从固定源码提交重新构建，不能依赖不可恢复的本机镜像缓存。

已就绪端可在页面点击“复制局域网地址”，由独立预览台生成业务预览链接并通过宿主剪贴板复制；不用向 Agent 发指令。局域网分享依赖配置的 `previewDesk` 共享服务，不开放 Worka 管理接口。

新建或修改 preview 配置及辅助启动脚本时，沿用用户指定位置与共享项目入口；身份、本机路径和运行数据留在本机。配置示例在 `templates/preview-project`，类型契约由 `@dsh-workbench/runtime/preview` 提供。

## 卡牌创作室
此桌面的 playGame 以 game-project 连接记录的 CardGame 工作树和本桌面的 v3 适配器接受确切的游戏提交。首次打开试玩使用安装时绑定的基线。制作新版本时优先使用 playGame：commit 必须来自实际游戏仓库，key 为本次交付的稳定身份，title 为作者可辨认的改动。关联任务时，传原 Todo noteId 和真实 delegationId，第一份候选使用 delegationId 本身作为 key。指定剧情、秘境或遭遇可附 entry={kind:"story"|"map"|"encounter",resourceId:"内容目录里的 ID",nodeId?}；nodeId 用于剧情节点。选中的是无法直接启动的次级记录时，沿内容引用找到其真实可玩入口，说明起点。预览会读取该提交的游戏文件。
