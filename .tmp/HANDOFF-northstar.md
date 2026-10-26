# 北星战役交接说明（供任意 agent 从 origin 接管）

> 本文件 + 本分支（`line/campaign-state`）= 战役全部状态快照。主开发线 = `feat/mysql-schema-skeleton`。

## 一、当前状态（2026-10-26 快照）

- 主线 `main` @ `ab282ba81`（PR #123 cap-2354 已并；本次 fetch 前值 47dd6be56）
- 修复进度：批表 238/271（87.8%，权威计件源=本分支 `.tmp/external/issues-master.md`）；翻面笔-3（`line/bookkeeping-flip-3` @ `88762a65c`）已落卷待 PR 并线
- AI 能力台账：done 45 / half 1（AG-20）/ open 3（全门控）
- 文档数量帽：`scripts/ai-docs/public-text-policy.mjs` MAX_FILES=2354，届树实测 2342（余 12，docs:check EXIT=0 本席亲跑）
- lint 帽恰等：root 5242 / api 1423 / domain 115（0 errors 红线不可放宽）
- 本状态支线已补并主线新届：merge --no-ff origin/main@ab282ba81（merge-tree 预演 34 文件冲突·逐 blob 取证=支线侧全为陈旧祖先态·其内容已由主线 PR 波以更新形态收编·冲突解全取主线侧·blob 恒等机证零工作丢失）

## 二、在飞清单（2026-10-26·各卷 STOP 状态见各自 REQUEST）

六条 E2E 缺口卷 + AG-20 卷 + cap-2354（已并）+ 翻面笔-3（待 PR）：

| 分支 | 内容 | STOP/状态 | 下一步 |
|---|---|---|---|
| `line/uc004-draft` @ `1c5a02600` | UC-004 career-path 全链路 e2e REQUEST（docs-only） | `draft:awaiting_pre_exec_dual`（席1 PASS+席2 FAIL 合并修订清单已 §9-rev 落卷） | 重派 pre-exec 双审第二轮 |
| `line/uc025-draft` @ `6da9821c8` | UC-025 E2E 残面 REQUEST（BOUND 隔离收据+重押题入口+covered 评估器） | `draft:awaiting_pre_exec_dual`（席1 FAIL P1×3+P2×6 修订已 §9-rev 落卷） | 重派双审第二轮 |
| `line/uc011-draft` @ `a23385730` | UC-E2E-011 E2E 覆盖 REQUEST（ADV 面隔离收据+矩阵六列补齐+covered-lift 评估） | `draft:awaiting_pre_exec_dual`（起草落卷 2026-10-26·双审首轮待派） | 派 pre-exec 双审首轮 |
| `line/uc028-draft` @ `96f2dd241` | UC-E2E-028 E2E 补验 REQUEST（注入面/recon 对账断言/真相阻塞对照） | `draft:awaiting_pre_exec_dual`（双审 BOTH PASS 已折入落卷） | 待协调方明示 EXEC 授权 |
| `line/nhp-batch-a-draft` @ `fbfdcc0c8` | NHP 批 A·§1.0 盲区三行缺列隔离收据 REQUEST | `draft:awaiting_pre_exec_dual`（起草落卷·双审首轮待派） | 派 pre-exec 双审首轮 |
| `line/nhp-batch-b-draft` @ `c77057d6f` | NHP 批 B 残面 REQUEST | `draft:awaiting_pre_exec_dual`（席1 FAIL P1×3 撞行面修订已 §9-rev 落卷） | 重派双审第二轮 |
| `line/ag20-residual-draft` @ `c2d0aeebd` | AG-20 残面复核登记卷（CTX-02 已接线·余 MEM/CTX 原语零调用维持登记） | 双 PASS·EXEC 中 | EXEC 落卷→post 双审 |
| cap-2354 | 文档帽 2346→2354 步进 | 已并（PR #123 @ `ab282ba81`） | 已收口 |
| `line/bookkeeping-flip-3` @ `88762a65c` | 批表时滞翻面补登记（docs-only） | 落卷完工 | 走 PR 并线（见「环境变更」） |

**帽量注意**：届树 2342 ≤ 帽 2354 余 12；在飞各卷并线前各自核 docs:check，贴边即先派帽步进（模板=仓内 `cap-sanction-*-REQUEST.md` 先例）。

## 环境变更（2026-10-26）

- **main 分支已设保护**：并线必走 PR——push 支线 → `gh pr create` → `gh pr merge --merge`；直推 main 被 GitHub 拒（GH006）。先例=cap-2354 走 PR #123 并线。
- 旧流程「`git push origin HEAD:feat/mysql-schema-skeleton`（只许直推）」条款（见「三」）自此作废；主干分支=`main`。

## 三、任务固定流程

起草卷（`ai-docs/delivery/harness/<名>-REQUEST.md`：§0 锚 blob 亲算 / §1 修法 / §1.3 否决 / §2 验收门矩阵 / §8 STOP）→ 两个互盲评审席 BOTH PASS → 实现（静态门+隔离门全绿）→ 两个互盲复核席 BOTH PASS → merge 回主线（--no-ff·先 fetch 届 tip+`git merge-tree --write-tree` 预演零冲突）→ `product-campaign-LEDGER.md` 管线区 + `execution-master-checklist.md` 各 append 登记行 → `git push origin HEAD:feat/mysql-schema-skeleton`（只许直推）→ 等 CI 判定。

## 四、硬性规则

1. commit 消息禁任务黑话（刀/nail/sanction/门矩阵/REQUEST/批表等）：标题=`类型(范围): 中文一句话说清解决了什么`，正文列要点
2. 并行额度 6 席；席位 600 秒无响应判死，重试一次仍死→主会话内联接续
3. 磁盘 >20Gi 才开工；支线合并后即删工作树；Docker.raw>20G 先 prune（绝不动 volumes）
4. 每次收官汇报必附进度条：批表 x/271 · AG done/open · 主线 tip+CI · 在飞队列 · 磁盘
5. 每波派单前看本文件「二」的下一步；收官后更新本文件并 push 本分支（状态快照随做随更）

## 五、常用命令

```
pnpm install                                   # 环境就绪（需 Node22+pnpm10+Docker）
pnpm turbo typecheck --force && pnpm turbo lint --force
node scripts/ai-docs/check-docs.mjs            # 文档门（数量帽）
node scripts/check-migration-version-uniqueness.mjs
node scripts/run-e2e-isolated.mjs neg:resume   # API 隔离门（门名清单见脚本 :2162）
pnpm --filter @meetwise/domain prove:resume-extract
```

## 六、待用户拍板（不要自行决定）

P1=PR #109 合并+BV 双钥核查；P2=G7 三输入+LIVE 判别授权；P3=计费语义/S7 真键等八项+候选 6 项。明细=`.tmp/user-decisions-final.md`（本分支已带）。

## 七、历史与先例

`ai-docs/delivery/harness/` 下 40+ 已收官任务卷=模板与先例；`execution-master-checklist.md`=全量登记；测试收据=`.tmp/isolated-proof-receipts/`（本分支已带最近全量）。
