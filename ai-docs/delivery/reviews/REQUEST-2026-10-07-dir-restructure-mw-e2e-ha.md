# REQUEST — DIR-1 · 目录与文件位置重构设计刀（docs-only · per-batch pure-move 迁移计划）· pre-exec · mw-e2e-ha · **rev2**

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · **rev2 已并入双席 FAIL 合并处方** · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/dir-restructure.md` · slice `dir-restructure.slice.md`
**Parent tip**: `0fe96fca`（fetch 后 origin tip 实测 · docs 基线 · not a prove tip）
**Date**: 2026-10-07

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained） |
| `r1Closed` | **false**（retained） |

## 请审什么（mw-e2e-ha 视角）

用户直裁「文件夹和文件位置也很混乱」→ 本刀出**设计 REQUEST（docs-only，写完即停）**：现状结构图 + 量化混乱清单 + 目标结构规范 + 分批纯移动迁移方案。请审：

1. **盘点诚实性**（harness §1–§2 的数字是否可复核）：`apps/worker/src` 83 平铺（r4-* 31）· `packages/db/src` 71 平铺 · `packages/domain/src` 50 平铺 · src 级跨树同名 17 组（`qbank-track-local-retrieval.ts` db/domain/worker 三树同名）· 超长 top5（run-e2e-isolated.mjs 2449 / principal.ts 2077 / e2e-parity-check.mjs 1254 / contracts/index.ts 1243 / interview.service.ts 954）· scripts 根 79 文件（38 `*.proof.mjs`）vs 根 package.json 248 处 `node scripts/` 引用。抽查 ≥3 个数字（如 `ls apps/worker/src/*.ts | wc -l`）。
2. **e2e 契约零违背**：目标规范 §3 R5 明确 `e2e/` 扁平树 / `scripts/run-e2e*.mjs` / `scripts/isolated/` / `LIVE_E2E_TARGETS` **零触碰**，与 `ai-docs/testing/conventions/e2e-directory-contract.md` + `adr-e2e-directory-restructure.md`（S0–S4）一致；B6 明确 run-e2e* 留根。若 REQUEST 任何处暗示搬 e2e/ 或缩 LIVE 面 → FAIL。
3. **零行为变更证明的可执行性**（§4）：每批 prove = `pnpm -C <pkg> typecheck && build && test` 全 EXIT=0 + `git diff --find-renames` 证 R100 纯移动 + lockfile 零改；例外改动白名单只有 import 路径行 / 桶 re-export 行 / package.json script 路径行。白名单之外任何内容 diff = 批作废。此证明链是否闭合、是否有漏网改面（runner glob / tsconfig include / workflows）。
4. **在飞线冲突声明是否如实**（§5 Ban 2）：SSE-PUSH 碰 `apps/api/src/modules/interview/interview.controller.ts` → B4 后置；TOKSTREAM 碰 `packages/ai-runtime/src` → B5 后置；隐私主线在飞 → B3 排除 `apps/worker/src/checkpoint-principal.ts`（对齐 loop 文件冲突规则）。撞面未解除该批不开。
5. **测试落位一案统一**（§3 R4）：`<pkg>/test/*.proof.ts` 同级为唯一规范（现状 322 文件已合规），禁内联/`__tests__`；`apps/web/e2e-ui/*.spec.ts` 为 UI 次层（契约管辖）；`_neg-harness.ts` 下划线前缀是否被 runner glob 依赖须先探测（B7 前置）。B1/B2 批须同步改 test/ 内引用 db/domain 内部路径的 proof import——此改面是否已在 §4 通用律 2 覆盖。
6. **Ban 拆长文件**：§2.2 top5 只登记给后续 SPLIT-1 内容刀，本刀 Ban 拆 Ban 改名（B7 单列微批除外）——防止「顺手重构」混入纯移动。
7. **诚实边界**：本 docs-only commit 不构成任何 prove / 不翻任何 SSOT 行 / coveredCount=8 不动 / `g7SuiteGreen=false`；批绿 ≠ 重构完成 ≠ E2E ≠ HA。

## rev2 补审点（对应本席 FAIL 洞 · 重审时逐条核）

R1′ **prove 真实命令面**：harness §4「零行为变更证明（rev2）」已撤回 rev1 幻构命令（`pnpm -C <pkg> typecheck|build|test` 实不存在），改为 `pnpm exec tsc -p <pkg>/tsconfig.json --noEmit` + 逐包现存 `prove:*` 全绿清单（db 67 / domain 26 / worker 119 / 根 alias 面），且「新增包级 script 须批 REQUEST 显式单列白名单」。请核清单与各包 package.json 逐名对得上。
R2′ **B6 白名单闭合**：通用律 2 扩为四类路径文本（第四类 = `scripts/**.mjs` 内 repo 相对路径串 + `./lib` 相对 import）；§4.2-1 钉死扫描命令并如实登记口径差（协调方 62 vs 复扫 67/79、移动敏感面 37——正则覆盖差，以钉死命令实测为准，B6 批落逐文件清单消解）。
R3′ **mysql-stack 契约态**：§4.2-2 实测根 11 文件为 **S4 legacy path forwarder**（真身在 conn-stack/，文件头自证），B6 改为「根转发层原样保留」，「并入/删转发」须契约修正案前置另刀；rev1 的「评估并入」已撤回。请核与 `adr-e2e-directory-restructure.md` S4 landed 叙事一致。
R4′ **r4 债行不关**：B3 行 + Ban 9 明示「移动 31 个 r4-\* ≠ 关闭/洗涤任何 r4/R4/FUNNEL/G-R4-5 债行」；§6.2-2 已删「与 conn-stack 同名双份易混」误记。
R5′ **批前重查**：通用律 0（SOP + W 线 w1/w1b/w2 冻结序 + loop 文件冲突面，任一命中即顺延）+ Ban 11。

末行严格 `Verdict: PASS` 或 `Verdict: FAIL`。本 stub 不授权 coding / mv / prove / push；pre-exec dual PASS 后由协调方授权后续批次。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

（pre-exec 审查体由 mw-e2e-ha 于独立 worktree 追加；实现方禁自批 · alone ≠ dual）
