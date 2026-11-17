# 卡牌游戏创作室

作者说出想法后，能做出来的改动直接进入可试玩构建，作者试玩后回应即可闭环。11 张便笺各自独立，通过 5 条连线衔接。

- **点子**：在 Home 或「点子库」说出想法时，用 `remember` 原样存入「点子库」。模糊想法只入库并回一句话，不建制作事项；具体想法无需用户再说“开始做”，由「点子 → 制作」直接建立制作事项并在独立工作树的新分支开工，同时检索并带出相关的旧点子。
- **单便笺直接编辑**：在内容便笺（剧情、地图、战斗、卡牌、怪物、人物、商店、素材）的对话里提属于该便笺自身的修改时，优先读取 `note.recordTarget` 或便笺查询定位 `source` 文件路径，直接在已绑定的 CardGame 检出中编辑源文件，运行当前通过的检查（`bun test src/game/content/contentCatalog.test.ts src/game/content/contentDisplayNames.test.ts src/game/types/storyContent.test.ts src/game/types/prototypeExpeditionContent.test.ts` 与 `bun run build-nolog`），检查通过后直接提交到 `main` 分支，保持工作区干净。已打开的便笺通过 `game-project` 自动实时更新，无需刷新索引。
- **跨模块请求**：在内容便笺中提出超出该便笺自身部分的请求（例如在战斗便笺里同时改难度与奖励卡牌），按「内容便笺 → 制作」建立「制作待办」事项，关联到所指记录并启动制作会话。
- **分支制作、交付试玩与合入**：制作事项必须在已绑定游戏仓库目录**之外**创建独立 Git 工作树与分支（如临时目录 `/tmp/cardgame-wt-...`，绝不放在绑定仓库目录内），运行上述数据测试与 `bun run build-nolog` 检查并提交；提交后用「试玩」的 `receive`（配合本桌面 `playtest/preview.config.mjs` 与受影响场景/战斗的 `options.entry`）登记可玩版本，把 `/notes/<试玩noteId>/candidates/<key>` 发到事项对话中。试玩时的反馈回到同一事项会话；用户回复 `OK` 即把分支合入游戏仓库 `main`（远端为 GitHub 时一并 `git push`），并将事项 `recordProgress` 标为 `done`。
