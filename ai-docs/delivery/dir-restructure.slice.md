# Slice — DIR-1 · 目录与文件位置重构设计刀（docs-only REQUEST · `draft:awaiting_pre_exec_dual`）

**状态**：`draft:awaiting_pre_exec_dual`（本批只出设计文档 · **写完即停** · 零代码 · Ban self-approve · alone ≠ dual）
**日期**：2026-10-07 · **base tip**（fetch 后实测）：`0fe96fca`（`origin/feat/mysql-schema-skeleton` · docs 基线 · not a prove tip）
**worktree**：`/Users/miaole/Desktop/golucky/meetwise-line-dirstruct`（branch `line/dir-structure`）
**性质**：用户直裁「文件夹和文件位置也很混乱」→ 只读盘点（现状结构图 + 量化混乱清单）+ 目录重构 REQUEST（目标结构规范 + 分批纯移动迁移方案）。实际 `git mv` 属后续每批一刀，本批不开。

---

## 产物（本 commit 恰 4 个新增 md）

| 角色 | 路径 |
|------|------|
| Harness / REQUEST（含盘点+目标+迁移+Ban+Prove+pins） | `ai-docs/delivery/harness/dir-restructure.md` |
| 本切片索引 | `ai-docs/delivery/dir-restructure.slice.md` |
| REQUEST · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dir-restructure-mw-e2e-ha.md` |
| REQUEST · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dir-restructure-mw-model-op.md` |

## 盘点要点（量化 · 详见 harness §1–§2）

- 大平铺：`apps/worker/src` **83** 文件（r4-* 31）· `packages/db/src` **71**（memory 10 + qbank 10）· `packages/domain/src` **50**（ctx0x/mem0x 编号前缀 6）· `apps/api/src/platform` 11。
- 跨树同名：src 级 **17 组**（`qbank-track-local-retrieval.ts` 三树同名最重）+ 近名族 5 组（`job-route-classify/classifier`、`usage-calibration/-reconcile/-reconciler` 等）。
- 文件名风格：kebab 742/747（99.3%）· camel 4（React hooks 豁免）· 下划线 1（`_neg-harness.ts`）。
- 超长 top5（>800 行，**Ban 拆**，归后续 SPLIT-1）：run-e2e-isolated.mjs 2449 · principal.ts 2077 · e2e-parity-check.mjs 1254 · contracts/index.ts 1243 · interview.service.ts 954。
- scripts/ 根 79 文件（38 一次性 prove + 11 mysql-stack.*）vs 8 子目录；根 package.json 248 处 `node scripts/` 引用。
- 测试落位已统一：`<pkg>/test/*.proof.ts` 同级 322 文件 + `apps/web/e2e-ui/*.spec.ts` 7 —— 规范即现状。

## 批次计划摘要（每包一刀 · 纯 git mv · 零行为变更）

| 批 | 范围 | 状态 |
|----|------|------|
| B1 | `packages/db/src` 域文件夹化（~50 mv） | 排队 |
| B2 | `packages/domain/src`（~35 mv） | 排队 |
| B3 | `apps/worker/src` + smoke 同名消歧（~70 mv；**排除 checkpoint-principal.ts**） | 排队（隐私主线在飞） |
| B4 | `apps/api` | **后置**至 SSE-PUSH 线 nail |
| B5 | `packages/ai-runtime` + ai-graphs 同茎 | **后置**至 TOKSTREAM 线 nail |
| B6 | `scripts/` 根归位（~50 mv + 248 处 package.json 路径） | 排队（最后） |
| B7 | `_neg-harness.ts` 去前缀（1 rename · glob 探测后定） | 可选微批 |

推荐序 B1→B2→B3→B6→B4→B5→B7；每批 prove = typecheck+build+test 绿 + `git diff --find-renames` 全 R100。

## 非范围（Ban）

本批 mv 任何文件；动文件本体内容（纯移动例外面仅 import/桶/package.json 路径行）；与在飞刀撞文件（SSE-PUSH→interview.controller · TOKSTREAM→ai-runtime · 隐私主线→checkpoint-principal.ts）；改共享 SSOT / e2e 契约与 ADR；拆超长文件；secrets；自批。

## 硬钉（pins 十值照抄）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · 公开 DELETE /privacy/interview-data/:id = 503 · `g7SuiteGreen=false` · `r1Closed=false`；另 `canHonestlyFlip=false`（UC-018）· `techRoleFailClosedOptOutG7Only=true`。

---

*DIR-1 slice · 2026-10-07 · docs-only · awaiting pre-exec dual · STOP*
