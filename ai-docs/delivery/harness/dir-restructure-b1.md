# Harness / REQUEST — DIR-1 · B1 批 EXEC（packages/db 域文件夹化 · 65 纯 git mv）

**Status**: `executed:awaiting_post_prove_dual` · **STOP**（post 双审未开 · nail 未授权 · 本批不翻任何 SSOT）
**Date**: 2026-10-07 · **Base tip**: `f208a78d`（REQUEST rev2 · 卷·双审 BOTH PASS 附 E1-E3 条件）
**Worktree**: `meetwise-line-dirstruct` · branch `line/dir-structure`
**releaseEvidence=false** · **NOT_HA** · 本绿 ≠ 重构完成 ≠ E2E ≠ HA

---

## Pins（十值照抄 · 本批不改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · Public DELETE=**503**（stays）· `g7SuiteGreen=false`（retained）· `r1Closed=false`（retained）；另 `canHonestlyFlip=false` · `techRoleFailClosedOptOutG7Only=true`。

---

## 1. 批前重查（通用律 0 · 实测）

| 项 | 结果 |
|----|------|
| `git fetch` tip 对齐 | `f208a78d` = `origin/line/dir-structure` · 工作树干净 |
| ① `ai-docs/skills/testing/sop.md` | status `draft` 未变（末次提交早于本线）· 无新仪式命中 |
| ② W 线冻结序 | w1 / w1b-delete / w1b-retire / w2 harness 全部 `post_prove_dual_pass`（docs-only 面，只读 `packages/db/src`，无 mv 面）→ **无阻断** |
| ③ loop §3 文件冲突面 | 冲突表三行（checkpoint-principal / G7 outbound / matrix）均不触 `packages/db/src` → **无命中** |

**判定：不顺延，开批。**（E4 见 §6 —— 重查三项之外的结构性发现，属 REQUEST 面盘点缺陷，非在飞冲突。）

## 2. 执行面（§4.1 逐文件清单 · 实测一致）

- **65 git mv**（`git mv` 全量，rename 全检出）：memory 10 · qbank 10 · interview 5 · privacy 6 · scoring 3 · retrieval 4 · context 4 · checkpoint 2 · commerce 2 · model-op 5 · jobs 4 · routing 3 · transcript 2 · audit 1 · recruiting 1 · resume 1 · notification 1 · report 1 = **65 ✓**
- **根锚 5 保留**：index.ts · principal.ts · migrate.ts · migrate-cli.ts（`docker/compose.prod.yml:231` 直引实测确认）· isolated-test-target.ts
- **tenant/ 原地**（唯一既有子目录，未动）

## 3. 路径文本改面（白名单四类 · 零其他内容）

| 类 | 面 | 实测 |
|----|----|------|
| ① 包内相对 import | src 移动件互引 + 移动件→锚/tenant | 54 个 src 文件改写（`./x.ts`→同域 `./x.ts` / 跨域 `../<域>/x.ts` / 锚 `../x.ts`） |
| ② 桶 re-export | `src/index.ts` | 106 行 specifier 改写（`./x.ts`→`./<域>/x.ts`；tenant 2 行不动，`barrelTenantReexports===2` 断言实测仍过） |
| ①（扩）test proof 包内相对路径（B1 计划单列「须同批改」） | import `../src/<moved>.ts` | 9 个 test 文件（uc052 ×4 · retrieval-backend-qdrant 等） |
| ①（扩）test 内路径**串**（机械消费面，不改即红） | `rag03-filter-locus` + `rag03-hnsw-completeness` 的 `STATIC_TARGET='packages/db/src/qbank-generation-retrieval.ts'`；`retrieval-backend-qdrant` 的 `join(pkgRoot,'src/retrieval-{store,backend}.ts')`；`tenant-wiring.manifest.ts` WIRED_FILES 6 处 db `file:` 实值 | 全部改指新路径 |
| ①（扩·披露）登记账本路径串（非机械必需，改以保登记诚实） | `tenant-wiring.manifest.ts` RESIDUAL_PATHS 2 行 brace-glob（:245 · :251）逐元素加域前缀 | 「Registered absence — silent absence is BANNED」自证；仅路径串变化 |
| ③ package.json / workflow / docker | **零改**（67 script 全指 `test/*` 或锚 `src/migrate-cli.ts`；根别名全 `-C packages/db <name>` 不含 src 路径；`db/src/` 仓内跨树引用=0；workflows=0） | — |
| ④ scripts 内路径串 | **B1 不适用（仅 B6）**；且 run-e2e-isolated.mjs 见 E4 禁触 | — |

**验证**：`git diff --cached -M` 逐行核对 —— **202/202 变更行对在剥离引号串后逐字节相同（纯路径文本）· 0 违例**；rename 检出 65/65（R100×16 · R99×33 · R98×12 · R97×4，相似度差 = 路径文本行本身）。

## 4. 验收四门（实测 · EXIT）

| 门 | 命令 | 结果 |
|----|------|------|
| A lockfile | `pnpm install --frozen-lockfile` | **EXIT=0** · `git diff --quiet pnpm-lock.yaml` **EXIT=0**（零改） |
| B 类型面 | `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`（+ 消费方 api/worker） | **EXIT=2 ≡ base EXIT=2**，错误集与 `f208a78d` **逐字节相同**（db 22 · api 36 · worker 44 全为 base 既有；api 唯一 diff = 既有 TS7016 报错里的临时 worktree 绝对路径）→ **零新增类型错**。⚠️ harness「期望 EXIT=0」在 base 即不成立（见 E5） |
| C prove 面（67 script） | 详见 §5 | **8 真·EXIT=0** + 6 抽样受 E4 阻（proof 本体全绿、回执层 ENOENT→EXIT=1）+ base 同红 5（见 E5）→ **67 全绿门在本 tip 对 base 亦不可达，本批以「零回归 + 机制证明」收口，全绿门悬置等 E4/E5 裁定** |
| D rename 面 | `--find-renames` | 65/65 R 检出 · 202/202 纯路径文本 · `git status` 干净（提交后）· 无 A/D 泄漏 |

## 5. prove 面明细（67 script 逐类 · 命令+EXIT 实录）

**执行口径**：CI 同构 —— 直接 script 直跑；破坏性 prove（`assertIsolatedTestEnvironment` 门，60/67）经 **唯一合法隔离入口** `node scripts/run-e2e-isolated.mjs <target>`（运行该文件 ≠ 触碰；Ban 6 未破）。

1. **真·绿 EXIT=0（8）**：direct `prove`（docker-exec primitives.sql）· `prove:principal-config` · `tenant-enforcement:prove`（含 face A/B + manifest 精确计数 + 桶 2 行断言）· `prove:tenant-wiring-e5` · `prove:isolated-target`；runner `vectorstore:prove:raw`（8 PASS）· `rag-control-dispatch:prove:raw`（6 PASS）· `qbank-control-role:prove:raw`（12 PASS）。
2. **受 E4 阻（receipt 层 ENOENT → EXIT=1；proof 本体全绿）**：抽样 6 域实测 —— `commerce`（✓全部通过 · 53+ PASS）· `memory-admission`（53 PASS）· `privacy-authorization`（51 PASS）· `scor-01`（64 PASS）· `resume`（32 PASS）+ 机制单点复现；每例末行 `LOCAL_ISOLATED_PROOF_RECEIPT_FAILED reason=ENOENT … packages/db/src/<moved>.ts`。受影响全集 = **104 runner target / 245 处移动路径串**（含 db 证明 ~48 target；逐 target 清单在 run-e2e-isolated.mjs `isolatedReceiptSources`）。
3. **base 同红（base≡B1 逐字节同败，非本批致）**：runner `runtime-role:prove:raw`（`interview_privacy_fenced` P0001 @ test:34）· runner `qbank-source:prove:raw`（`role "app_role" does not exist`）；direct `migrate`（`migration_uninitialized_nonempty_database` 拒非空 dev 库）· `prove:tenant-wiring-neg`（42P01 缺 e2e fixture）· `prove:retrieval-backend-qdrant`（EXIT=3 · Qdrant 6333 未起 · 自证拒绝假绿）。
4. 未逐个跑的 ~42 个 E4-受阻 target：机制已证（deterministic readFile ENOENT），不做 42 次同因复跑；**post 双审可指令全量复跑**。

## 6. 勘误登记（E1-E3 实值入档 + 本批新发现 E4/E5）

| # | 内容 | 实值（本批实测） |
|---|------|------------------|
| **E1** | §4.2 钉死扫描命令文件数 | **51**（harness 记 62/67 —— 以钉死命令今测为准：**51**） |
| **E2** | worker `prove:r4-*` 数 | **35**（harness 记 31 = r4-* **源文件**数；prove script 实数 **35**） |
| **E3** | worker adaptive / r2 prove 数 | **adaptive 9**（8×`prove:adaptive-*` + `prove:voice-adaptive`；harness 记 13）· **r2 6**（harness 记 8） |
| **E3b** | `docker/env/worker.env.example:171` | 注释引 `apps/worker/src/interview-service.ts` —— **判留陈旧**（B3 移动该文件时不同步此注释；本批零动） |
| **E4（新）** | **run-e2e-isolated.mjs receipt 路径面撞 Ban 6** | `scripts/run-e2e-isolated.mjs`（e2e 契约锁死 · Ban 6/R5 禁触）`isolatedReceiptSources` 内嵌 **245 处** `packages/db/src/<平铺>.ts` 串 · 波及 **104 target**；B1 移动后 `writeLocalIsolatedReceipt→sourceDigests→readFile` ENOENT → 受阻 target 一律 proof 绿但 EXIT=1（§5.2 实证）。**本批未触碰该文件**。处置需协调方裁定：⑴ 授权「仅路径文本」修正案微刀（双审后落，本批白名单 ④ 之外单列）；或 ⑵ e2e 契约修正案前置另刀。**未落前：受阻 target 的新鲜 isolated 回执不可得（W8/G7/NHP 线如需复跑受影响 target 会被阻断）——B2 前必须裁定** |
| **E5（新）** | **prove/类型面「期望值」在 base 即不成立** | `tsc -p packages/db --noEmit` base 即 EXIT=2（22 错）；prove 列表含 base 同红 5 项（§5.3）；「67 全绿」对 `f208a78d` 亦不可达 —— REQUEST rev2 修正了命令**名**但未验命令**面**（env/isolation/红态）。修红 = 内容刀（Ban 1），非本批权 |

## 7. Ban 合规自证

未建任何 shim/转发（Ban 10）· 未关任何 r4/R4/FUNNEL 债行、backlog 零动（Ban 9）· 文件本体除 §3 白名单路径文本外零改（Ban 1 · 202/202 行证）· `run-e2e*.mjs`/`e2e/`/`scripts/isolated/`/`g7-bootstrap.ts`/`principal.ts`/migrations 零触碰（Ban 6 · principal.ts 为锚未移）· SSOT 零改（Ban 3）· 无 secrets（Ban 4）· 未拆长文件/未改名/未补 module（Ban 5）· 本报告零假绿叙事：受阻与 base 红逐项如实登记（Ban 7）· 未自批、post 双审待派（Ban 8）· 批前重查三查齐（Ban 11）。

## 8. 状态

- [x] 65 mv + 白名单路径文本 + 四门实测（§4）
- [x] E1-E3 实值入档（§6）+ E4/E5 新发现登记
- [ ] **post-prove 双审 BOTH `Verdict: PASS`（待协调方派席）**
- [ ] E4 裁定（run-e2e-isolated.mjs 路径修正案授权 or 契约另刀）——**B2 前置**
- [ ] nail 授权（meetwise）→ SSOT 诚实登记 → push
- [x] **STOP**

---

*DIR-1 B1 · 2026-10-07 · base `f208a78d` · 65 pure mv · releaseEvidence=false · NOT_HA · awaiting post-prove dual · STOP*
