# RCPT-1 — runner 收据源路径修正刀（E4 同型·六面 ENOENT 清零）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `16b40f0d` · 分支 `line/receipt-paths` · 立项依据 = DBACL-2 rerun wave 两轮实证（六面 prove 域级全绿但 runner 收据 ENOENT——收据源引用 DIR-1 B1 前缀迁移后不存在的 `packages/db/src/context/*`·`packages/db/src/memory/*` 路径）+ DBFK-1 nit（58 处陈旧路径）。

## 1. 手段（纯文本路径修正·零功能）
`scripts/run-e2e-isolated.mjs` receiptSources 段：rg 全部含 `src/context/`·`src/memory/`·`src/scoring/`·`src/commerce/`·`src/transcript/`·`src/recruiting/` 等陈旧子目录前缀的条目——逐一亲验目标文件真实位置（`ls` 实证平铺于 `packages/db/src/` 顶层的文件名）修正为实路径。禁改收据逻辑/解析器/其他段。
- 注意：部分路径可能指向真实存在的子目录文件（如 packages/db/src/commerce.ts 在顶层）——**每条修正前 ls 亲证**·无对应实文件的条目登记（不发明路径）。

## 2. 验收
修正清单（旧→新·逐条 ls 证据）+node --check+六面 prove 复跑（ctx03/ctx04/ctx05/ctx06/mem02/mem03 各恰一次）收据**落盘成功**（EXIT 应=0·域级断言 PASS 已证）+收据 `ai-docs/delivery/receipts/rcpt1-receipt-paths/`。

## 3. Ban
零产品码·仅 receiptSources 段路径文本·runner 其他段零触碰·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual·复跑恰一次/面禁重跑至绿。

## 4. Non-claims
本刀 ≠ DIR-1 完成 ≠ 六面新绿宣称（域级绿已在 rerun wave 在卷·本刀=收据面修复）≠ 任何 G7 面。
