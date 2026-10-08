# RCPT-1 — runner 收据源路径修正刀（E4 同型·六面 ENOENT 清零）

**状态**：`executed:awaiting_post_prove_dual`（exec=mw-core·2026-10-08） · base = 主线 `16b40f0d`（worktree 起点 HEAD=5fad59ee REQUEST）· 分支 `line/receipt-paths` · 立项依据 = DBACL-2 rerun wave 两轮实证（六面 prove 域级全绿但 runner 收据 ENOENT——收据源引用 DIR-1 B1 前缀迁移后不存在的 `packages/db/src/context/*`·`packages/db/src/memory/*` 路径）+ DBFK-1 nit（58 处陈旧路径）。

**exec 终态**：59 条唯一陈旧路径修正（165 行/236 处，逐条 ls 亲证·`tenant/index.ts` 真子目录原样保留）·四过门全过（rg 残留=0·419/419 test -f·node --check·diff 严格限于 :93-1640 引号内）·六面复跑 EXIT=0×6 收据落盘（ctx03 attempt#0 infra-red 不计预算沿 A1-r1/G7P-4 先例·裁决 (a)·原红收据原值在卷）·收据 `ai-docs/delivery/receipts/rcpt1-receipt-paths/`。

**勘误登记（双席实测口径）**：DBFK-1 nit「58 处陈旧路径」→ 实测 **59 条唯一路径**（区间内 165 行/236 处出现）；以 `correction-list.md` 机器清单为准，后续引用以此勘误替换 58 口径。

## 1. 手段（纯文本路径修正·零功能）
`scripts/run-e2e-isolated.mjs` receiptSources 段：rg 全部含 `src/context/`·`src/memory/`·`src/scoring/`·`src/commerce/`·`src/transcript/`·`src/recruiting/` 等陈旧子目录前缀的条目——逐一亲验目标文件真实位置（`ls` 实证平铺于 `packages/db/src/` 顶层的文件名）修正为实路径。禁改收据逻辑/解析器/其他段。
- 注意：部分路径可能指向真实存在的子目录文件（如 packages/db/src/commerce.ts 在顶层）——**每条修正前 ls 亲证**·无对应实文件的条目登记（不发明路径）。

## 2. 验收
修正清单（旧→新·逐条 ls 证据）+node --check+六面 prove 复跑（ctx03/ctx04/ctx05/ctx06/mem02/mem03 各恰一次）收据**落盘成功**（EXIT 应=0·域级断言 PASS 已证）+收据 `ai-docs/delivery/receipts/rcpt1-receipt-paths/`。

## 3. Ban
零产品码·仅 receiptSources 段路径文本·runner 其他段零触碰·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual·复跑恰一次/面禁重跑至绿。

## 4. Non-claims
本刀 ≠ DIR-1 完成 ≠ 六面新绿宣称（域级绿已在 rerun wave 在卷·本刀=收据面修复）≠ 任何 G7 面。
