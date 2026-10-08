# RCPT-1 收据 — runner 收据源路径修正刀（六面收据落盘 ENOENT 清零）

**exec**：mw-core · base=5fad59ee（REQUEST）· 分支 `line/receipt-paths` · 双审处方（席2：机器生成修正清单+逐条 ls 亲证，勿锚定 58 常数）· 协调方裁决 (a) 在卷（ctx03 首跑 boot 失败=infra 瞬时，不计面预算，infra-retry 一次）。

## 1. 手段（零产品码·仅 receiptSources 段路径文本）

`scripts/run-e2e-isolated.mjs` :93-1640（isolatedReceiptSources 段）：17 个陈旧子目录前缀（context·memory·scoring·commerce·transcript·recruiting·interview·jobs·report·resume·privacy·routing·qbank·model-op·notification·checkpoint·retrieval）→ 平铺实路径。修正前区间内陈旧行 **165 行 / 236 处 / 唯一路径 59 条**，逐条 `ls` 亲证平铺实文件后文本替换。真子目录 `packages/db/src/tenant/index.ts`（:998）原样保留。runner 其他段/解析器/收据写入器零触碰（diff 单文件 165+/165-，全部为引号内文本）。逐条旧→新见同目录 `correction-list.md`。

## 2. 四过门（全过）

| # | 过门 | 结果 |
|---|---|---|
| 1 | 修正后 rg 陈旧前缀（17 子目录）残留 | **0**（全文件口径；替换前 165 行全落在 :93-1640 内） |
| 2 | map 段 sourcePath 逐条 `test -f` | **419/419 全过**（0 缺失·0 发明） |
| 3 | `node --check scripts/run-e2e-isolated.mjs` | **PASS** |
| 4 | diff 严格限于 :93-1640 行引号内文本 | hunk 边界 108..1607 ⊂ [93,1640]；全部 diff 行为引号内文本；同变换对 HEAD 重放逐字节同构；`tenant/index.ts` 字串两版原样 |

## 3. 六面终态（EXIT=0×6·各恰一次·attempts 全账含 infra-red）

| 面 | attempt# | EXIT | 收据 JSON（.tmp/isolated-proof-receipts/） | file= 行 | FAILED 行 |
|---|---|---|---|---|---|
| ctx03-event-source | #0（**infra-red·不计**） | 1 | `2026-10-08T17-34-24-440Z-23644-cfef4388-…json`（outcome=failed·**原值保留在卷·禁掩盖**） | 在场（写入器仍成功） | 0（断言零执行） |
| ctx03-event-source | #1（裁决 a infra-retry） | **0** | `2026-10-08T17-45-06-573Z-28759-75191f89-…json`（passed） | 在场 | 0 |
| ctx04-compression-snapshot | #0 | **0** | `2026-10-08T17-45-22-974Z-29172-ac9f87ad-…json`（passed） | 在场 | 0 |
| ctx05-concurrency-recovery | #0 | **0** | `2026-10-08T17-45-32-770Z-29528-acf145ea-…json`（passed） | 在场 | 0 |
| ctx06-deletion-closure | #0 | **0** | `2026-10-08T17-45-42-486Z-29884-691aee15-…json`（passed） | 在场 | 0 |
| mem02-summary | #0 | **0** | `2026-10-08T17-45-52-265Z-30271-8f6127b2-…json`（passed） | 在场 | 0 |
| mem03-summary-tree | #0 | **0** | `2026-10-08T17-46-02-396Z-30643-b3fa1150-…json`（passed） | 在场 | 0 |

- 六面计费 attempt 各恰一次（ctx03=#1；其余五面=#0）；六份绿收据 JSON 落盘亲证（outcome=passed·exitCode=0）+ 1 份 infra-red 原值收据，共 7 份在盘。
- **infra-red 事件全账**：ctx03 attempt#0（17:32:39Z 起，104.9s）`isolated_postgres_database_not_ready:boot`——容器即逝（state_bytes=216），docker events 环无留痕不可考；域级断言零执行（PASS=0/FAILED=0）；同镜像+同参 standalone 复现两连健康（~12s ready）。沿 HALOC A1-r1 / G7P-4 wedge attempt#0 infra-red 不计 attempt 先例，协调方裁决 (a) 不计面预算。原 EXIT=1 收据原值保留在卷。
- 先例口径：域级断言绿已在 rerun wave 在卷，本刀=收据面修复；六面绿为本分支 runner 修正后的复跑实证。

## 4. Pins（十值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null。Key 仅经进程 env name-only（MODEL_API_KEY 未落任何文件/收据）。

## 5. Non-claims

本收据 ≠ DIR-1 完成 ≠ 任何 G7 面 ≠ perf/SLO 证据 ≠ HA/release 证据。六面为 local isolated PG 单机实证（E2E_ISOLATION_STACK=pgvector-legacy 为隔离 fixture 叙事，非栈真相；产品栈 pin=adr-postgres-retained.md）。
