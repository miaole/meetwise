# Docs-only · Line AH pre-exec · GAP-PRIV-AUTHZ-PROVE-FLAKE honesty ledger refresh · mw-privacy-int

主审：`mw-privacy-int`  
日期：2026-10-06（约 13:05 CST / UTC+8）  
审查 tip（REQUEST）：`b12e20d` / `b12e20d26ef852a9a4de136324f3c225ab7ef4ee`  
父提交：`5eba515` / `5eba515ac638d6c6a2d51c9ff96cfd5d47ba6d22`（Line AG REQUEST；harness 钉 base `416b6a5` / `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8` 为其祖先，中间仅 AD/AE/AF/AG docs REQUEST，harness L6 已披露）  
Peer stub：`reviews/REQUEST-2026-10-06-gap-priv-authz-prove-flake-ledger-refresh-mw-e2e-ha.md`（**不代签** · alone ≠ dual）  
**本审未跑 `pnpm privacy-authorization:prove`。未起 Postgres / Docker。未改产品。未 forge 任何 log。未碰旧收据。**  
**PASS ≠ 授权编码 ≠ 关闭 flake ≠ HA。** alone ≠ dual。

下文 harness = `harness/gap-priv-authz-prove-flake-ledger-refresh.md`，slice = `gap-priv-authz-prove-flake-ledger-refresh.slice.md`，stub = 本文件 @`b12e20d` 原文（行号按 `git show b12e20d:<path>`）。

---

## Diff（docs-only）

`git show --name-status b12e20d` 恰 **4** 文件，全 `A`，全在 `ai-docs/delivery/`（`4 files changed, 189 insertions(+)`）：

| Path | Role |
|------|------|
| `gap-priv-authz-prove-flake-ledger-refresh.slice.md` | slice |
| `harness/gap-priv-authz-prove-flake-ledger-refresh.md` | harness |
| `reviews/REQUEST-2026-10-06-gap-priv-authz-prove-flake-ledger-refresh-mw-privacy-int.md` | 本 stub→收据 |
| `reviews/REQUEST-2026-10-06-gap-priv-authz-prove-flake-ledger-refresh-mw-e2e-ha.md` | peer stub |

无 `apps/` · 无 `packages/` · 无 `package.json` · 无 migration · 无 tests · 无 `scripts/` · 无 `checkpoint-principal.ts` / `principal.ts` · 无 `.env*` · 无 SSOT 三件（matrix / backlog / checklist 最后改动仍为 `416b6a5`）。`git diff --name-only 416b6a5 5eba515` 亦全 `ai-docs/`（AD–AG 兄弟 REQUEST，与本刀零文件交叉）。

---

## 逐项 checklist

### P1 · REQUEST docs-only — **PASS**
见 Diff。零产品 / 测试 / 迁移 / package.json / `apps/worker/src/checkpoint-principal.ts`。harness L11 / L59、slice L7 / L23 自声明 Ban 产品面，与 diff 一致。

### P2 · 引用 SHA / 路径 / blob / 行号全部可核 — **PASS**

Commits（`git cat-file -t` = commit，且均为 `origin/feat/mysql-schema-skeleton` 祖先）：

| 引用（出处） | 全 SHA | 核验 |
|------|--------|------|
| base `416b6a5`（harness L6 · slice L6 · stub L7） | `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8` | `NAIL GAP-UC025-FAULT-ISOLATED-01`；全 SHA 逐字一致 |
| Line X NAIL `40bed97`（harness L9） | `40bed9708667239d5af71d3abe361567e03c1fd0` | subject `NAIL GAP-PRIV-AUTHZ-PROVE-FLAKE rootcause ledger post_prove_dual_pass`；全 SHA 逐字一致 |
| evidence tip `b3e0f41`（harness L9） | `b3e0f4172e188f23dbcc34aac0bae82e571a10dc` | `rootcause ledger executed (Line X)`；全 SHA 逐字一致 |
| REQUEST `5773243`（harness L9） | `5773243cc3c64bf4e4d9242814a3b7ba8b778986` | Line X REQUEST |
| POST dual `424c7f0` / `2974d45`（harness L9 · stub L29） | `424c7f06f7438a5a83688e5d14e9c25603e8c2e6` / `2974d45741d1009c26a36e24a43d051b1fb93a70` | e2e / privacy post-prove PASS |
| 红账 tips `69de818` / `71ec253` / `3d0c71e`（harness L23–26） | `69de8180…` / `71ec2535…` / `3d0c71e6…` | 与 ledger L48–52、jsonl `tip` 字段一致 |
| review `49ef158` §5（harness L26 · stub L34） | `49ef158b8236a3246dc0246369f626be26ee1e35` | 文件 L120 `## 5. 账本`；L125 warm_v2 实为新容器、未重打 23505 —— 一致 |
| oneshot attempt-1 `5b6e693`（harness L27） | `5b6e693e5e8b253da6c889a46aee331a8a6f5ccd` | = `oneshot-attempt-1.json` proveSha（ledger L26） |
| teed attempt-2 `6673042`（harness L28） | `6673042f8bcdc29cf6f10f99d0aa6a3c95e5a53b`（`teed-oneshot-attempt-2.json:4` proveSha） | 本 clone **不可** `cat-file`（侧枝未上 remote）；harness L28 已写「可达等价 `606677d`」，与 Line X ledger L55 / L61–62 可达性披露一致 → 如实、非 invent |
| `606677d`（harness L28） | `606677d37a27515894f02adff2ab33a67004abf4` | `teed oneshot attempt-2 (EXIT=0, gap stays OPEN)` |
| F2 增量 `3d113c8` / `bf1fdb2` / `6e96cf5` / `40a4f6c` / `48c4a8a`（harness L37 · slice L11 · stub L32） | `3d113c87…` / `bf1fdb22…` / `6e96cf50…` / `40a4f6c2…` / `48c4a8aa…` | `git log b3e0f41..416b6a5 -- scripts/run-e2e-isolated.mjs packages/db/src` **恰此 5 个**，无遗漏无多余；`bf1fdb2` 确含 `packages/db/src/payment.ts`（+72）与 `index.ts`（导出 `markOrderRefunded`/`RefundResult`） |
| C-PERF-TEARDOWN `44154aa`（harness L16 / L39） | `44154aa53a8c8508e8e8b1c51333c648187ac360` | 收据 diff：`ECONNREFUSED 127.0.0.1:64244` @ `assertIsolatedTestTarget`；`--network=host` API 容器 · Docker Desktop VM 网络栈 —— F4(b) 描述一致 |

Paths / lines：

| 引用 | 核验 |
|------|------|
| backlog `gap-bug-backlog.md:68`（harness L8 / L30 / L52） | L68 = `GAP-PRIV-AUTHZ-PROVE-FLAKE | P2 | **OPEN** · status **mitigated/cause-unknown**`… `stays OPEN` |
| `package.json:288-289`（harness L37 · stub L32） | L288 `"privacy-authorization:prove": "node scripts/run-e2e-isolated.mjs privacy-authorization:prove:raw"` · L289 `":raw": "pnpm -C packages/db prove:privacy-authorization"`；`packages/db/package.json:36` → `tsx test/privacy-authorization.proof.ts` |
| `scripts/run-e2e-isolated.mjs` · `scripts/with-docker-session.sh` · `packages/db/src/principal.ts` · `apps/worker/src/checkpoint-principal.ts` · `packages/db/src/payment.ts` | 均存在；`with-docker-session.sh` 引入于 `160c30c`（Line AC） |
| Line X ledger `receipts/gap-priv-authz-prove-flake/2026-10-05-rootcause-ledger.md`（harness L9） | 存在；blob `ce3f6bc…`，`b3e0f41..HEAD` 仅 `40bed97` 改其生命周期注记 |
| Line U docker.sock permission denied / Line AC 清除（harness L39） | `receipts/g7-trio-fresh/SUMMARY.md:22` `docker.sock permission denied（env-gap）`；`receipts/g7-env-gap-honest-fix/SUMMARY.md:38` / `:50` / `:80` env-gap cleared via `with-docker-session.sh` |

F1 · 9 blob 锚（harness L36）—— 本审 @`b12e20d` 与 @`416b6a5` `git ls-tree` + 工作树 `git hash-object` **9/9 一致**，零漂移：

| 文件（`receipts/…`） | blob |
|------|------|
| `uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl` | `272f0314e0eff8a9192c658a6a72584ae70146f4` |
| `uc052-pool-role-leak/logs/cold-5.log` | `d066fcd8e8a6805e903b706196c3ead5d7cd9feb` |
| `uc052-pool-role-leak/logs/warm-2.log` | `4ce66da1ac4dbaea808580fcaa94784ef689a095` |
| `uc052-pool-role-leak/logs/historical-first-failure-ECONNREFUSED-69de818.log` | `db8ade3ba4fecc01a7cb7d019b8424174628d631` |
| `gap-priv-authz-prove-flake/oneshot-attempt-1.json` | `8cc9db56079a60fc6410472632dbf4899952c9c2` |
| `gap-priv-authz-prove-flake/oneshot-attempt-1.log` | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` |
| `gap-priv-authz-prove-flake/teed-oneshot-attempt-2.json` | `3919bf579addf264b2eff3625fef7397bf1d7123` |
| `gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log` | `9b1341444425c4172d8a9cd02e5d8415a94a4084` |
| `gap-priv-authz-prove-flake/2026-10-03-teed-oneshot-attempt-2-receipt.md` | `81795533b028c5c71aca49fd8bdb1299937c73f0` |

红账字面（harness L23–25）：`cold-5.log:18` `ECONNREFUSED 127.0.0.1:33047` · `:30` `state_bytes=29`；`historical-…-69de818.log:16` `ECONNREFUSED 127.0.0.1:33010`；`warm-2.log:6/13/24` `interview_pkey` / `23505`。jsonl 29 行：cold 4×0+1×1 · warm 1×0+1×1 @`71ec253`；cold_v2 10×0 · warm_v2 10×0 @`3d0c71e`；prove_tip_authz 1×0 @`9b39a20`；meta 1 —— 与 harness L23–26 一致。

F3 新 attempt=0（harness L38）：`git log b3e0f41..416b6a5 -- receipts/gap-priv-authz-prove-flake receipts/uc052-pool-role-leak` 仅 `40bed97`（ledger 注记），无新 json/log/jsonl 行 → 0 属实。

### P3 · flake 保持 OPEN mitigated/cause-unknown；红账保留；Ban forge / retry-to-green — **PASS**
- OPEN 原文：harness L1 / L8 / L30 / L52 / L66 / L70；slice L3 / L11 / L25；stub L23 / L31 / L39。
- 无 close / fixed / root-caused 叙事：harness 中 fixed/closed/root-caused 仅出现在 Ban 或 Non-claims（L3 / L58 / L66）及「不得写成」列（L37 / L38 / L39）。
- 红账零删改：harness L23–25 三次 EXIT=1 全保留，L30「合计 EXIT=1 **3** 次 · 2 类 class 并存未归一 · cause unknown」；L26 v2 写「mitigation only」并注 23505 类未被重新覆盖；L27 attempt-1「不同意（L1 保留）」；L28 attempt-2「≠ close」。
- Ban forge `PROCESS_EXIT`：harness L3 / L58；Ban retry-to-green：harness L58；旧证据零改动：harness L46。

### P4 · 新 prove 计划 — **PASS（本刀零 prove）**
本 REQUEST **不**计划任何 prove：harness L3「Ban prove 执行 · Ban rerun」、L7「**零** prove · **零** 新 EXIT」、L45「**零** `pnpm privacy-authorization:prove` · **零** Docker / Postgres 启动」；stub L33 / L41。F5（harness L40）仅为**未来** rerun REQUEST 的前置：`with-docker-session.sh`（Ban sudo/chmod/usermod）· 预声明 attempt 数 · cold/warm 分别（warm 须真复用库）· teed `PROCESS_EXIT` · 独立 PRE dual ——「**本刀不授权**」。Ban buy cloud：harness L61。

### P5 · 编码闸门 — **PASS**
harness L3 Ban coding · L11 Ban coding product / Ban `principal.ts` / `checkpoint-principal.ts` · L59 Ban `packages/db/src/principal.ts` / `apps/worker/src/checkpoint-principal.ts`；slice L7 / L23；stub L33、L41「本 stub 不授权 coding / prove / rerun / push；pre-exec dual PASS 后由协调方授权执行；implementer 不自批」；harness §2 标题 L32「授权后 · docs-only · 零 CMD」。即：BOTH PRE PASS + AUTHORIZE 前零执行，且即便授权也仅 docs、零产品。

### P6 · 不改写共享 matrix / backlog / checklist — **PASS**
harness L47「SSOT：零触碰 backlog `:68` / checklist / 矩阵」· L8「本刀不改该行」· L61 Ban SSOT 擅自翻行；slice L23 Ban SSOT flip。diff 实证三件零改动（见 Diff）。

### P7 · Pins — **PASS**
| Pin | 出处 | 值 |
|-----|------|----|
| haStatus | harness L4 / L70 · slice L4 · stub L15 | **NOT_HA** |
| releaseEvidence | 同上 · stub L16 | **false** |
| public DELETE | harness L4 / L53 · stub L22 | **503** |
| Stack | harness L4 · stub L21 | **PG-retained** |
| UC-052 | harness L17 / L53 · stub L24 / L35 | **partial**（matrix L132 仍 partial） |
| coveredCount | harness L4 / L53 · stub L19 | **8**；SSOT 定义 = RAG-FUNNEL-02A/02B/03/04/05/06/07/08（`rag-funnel-01-08-covered-matrix.md:21`），本刀未扩 |
| external retention_pending | 本刀未提及、未触碰 → 未削弱 | retained |

flake 状态从未写作 covered：「covered」仅出现在 Ban covered flip（harness L61 · stub L35）与 Non-claims「not covered」（harness L66）。

### P8 · PASS ≠ coding ≠ 关 flake ≠ HA — **PASS**
harness Non-claims L66（not fixed · not closed · not root-caused · not a prove · not rerun authorization · not HA · not covered · alone ≠ dual）；stub L37「Dual PASS ≠ coding ≠ prove ≠ nail ≠ close」。本收据同声。

---

## 非阻塞备注（不影响 Verdict）

1. **N1 · attempt 表省略 `9b39a20` 行**：harness §1（L21–28）未列 Line X ledger L53 / jsonl L29 的 `prove_tip_authz @9b39a20` n=1 EXIT=0。此行为绿、非红，红账无损；建议执行 F6 SUMMARY 时补回，避免「零改写」表述与 ledger 不完全同表。
2. **N2 · F4(c)「已由 Line AC 清除」**：Line AC 原文为「env-gap cleared **for this host/session class**」（`g7-env-gap-honest-fix/SUMMARY.md:50`）。执行时建议照抄限定语，勿泛化。
3. **N3 · F2 预检观察**：本审只读 `git diff b3e0f41 416b6a5 -- scripts/run-e2e-isolated.mjs packages/db/src/index.ts`：表面为新 target 注册（`uc001:nhp-bound` / `uc011:*` / `uc025:nhp-fault-isolated`）、migrate 分支数组成员扩充及 `payment.ts` 退款导出；未见改动 `privacy-authorization:prove:raw` 命令映射。此为观察 ≠ 分类结论；harness L37 要求执行时逐条读 diff 后再写，保留。
4. **N4 · F5 未来 rerun 前置**：未来独立 rerun REQUEST 还须显式写明：fresh first run · 全部 attempt 记账（含红）· red stays red · 任何 `PROCESS_EXIT=0` 均**不**关 gap · 仅本地隔离（Ban cloud）· 合格关闭门槛（deliberate red + cause-fix + N≥5 连续首跑无重试，`REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-privacy-int.md:109`）仍**未满足**。本刀不授权 rerun，故不阻塞。
5. **N5 · `6673042` 不可达**：沿用 Line X 可达性披露；事实面经 `606677d` 与树内 attempt-2 blob 可核。
6. **N6 · 父提交 ≠ harness base**：实际父 `5eba515`，base 钉 `416b6a5`；harness L6 已披露兄弟 REQUEST 并行，`416b6a5..5eba515` 全 docs、零交叉。

---

## Pins（本审保留）

| Pin | 值 |
|-----|-----|
| REQUEST tip | `b12e20d26ef852a9a4de136324f3c225ab7ef4ee` |
| haStatus | NOT_HA |
| releaseEvidence | false |
| public DELETE | 503 |
| Stack | PG-retained |
| external | retention_pending（未触碰） |
| UC-052 | partial · ≠ covered |
| coveredCount | 8（RAG-FUNNEL-02A…08 only · not UC-052 · not the flake） |
| Flake | **OPEN** · mitigated/cause-unknown · **not fixed** · **not root-caused** · backlog `:68` 原样 |
| prove this review | **not run** |
| peer mw-e2e-ha | 不代签 · alone ≠ dual |

---

## 总评

P1–P8 全部成立。`b12e20d` 为 docs-only Line AH ledger-refresh REQUEST（4 文件新增）；所引 commit / 全 SHA / 路径 / 行号 / 9 个 blob 锚全部可核且一致（`6673042` 不可达已如实披露为可达等价 `606677d`）；三次 EXIT=1 红账与两类 class 原样保留；F2 增量 5 提交与 `git log` 实况恰好一致；gap 仍 OPEN mitigated/cause-unknown，无 close / fixed / root-caused 叙事；零 prove 计划，F5 仅为未来前置且不授权。  
**本审查未跑 prove，不授权任何编码或执行，不关闭 `GAP-PRIV-AUTHZ-PROVE-FLAKE`，不是 HA，不代签 mw-e2e-ha。PASS ≠ 授权编码 ≠ 关闭 flake ≠ HA。执行须 BOTH PRE PASS + 协调方 AUTHORIZE。**

Verdict: PASS
