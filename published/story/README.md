# 剧情知识库

扩展 Worka 官方 `templates/reference-note` 的资源登记、磁盘读取、Markdown 与 Mermaid 渲染。保留 `document`、`refreshDocument` 和资料登记能力。未连接本机检出时使用导入版本中的 Markdown 原文和 JSON 场景快照。绑定后优先读取受 Worka 资源订阅更新的本机原文。正文来自 CardGame 的 `knowledge/` 或内容目录登记的运行时故事图。章节目录、分支脑图和 `scenes` 公共检索共享一个派生索引。

`buildStory(gameRoot)` 从实际检出生成目录，优先返回可编译 Markdown 原稿。已编译的相同场景不会重复出现。跨便笺链接使用 Worka 记录位置；分支箭头沿真实选项跳转。场景 URL 为 `/notes/<noteId>/scenes/<encoded-record-id>`。索引跟随桌面同步，原文跟随内置 reference 资源订阅。
