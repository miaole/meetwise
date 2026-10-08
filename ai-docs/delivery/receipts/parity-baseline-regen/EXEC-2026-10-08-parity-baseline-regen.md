# PARITY-B · e2e-parity baseline 再生刀 · EXEC 收据

status: **`exec:awaiting_post_prove_dual`**（协调方 EXEC 授权已取得 · 预执行双审 BOTH PASS · 本收据为六步全账 · 未自 nail · post-prove 双审归协调方派）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 重钉（EXEC 指令①）

- fetch 2026-10-08（EXEC 时点）：`origin/feat/mysql-schema-skeleton` = **`9265e4d8` 未前进**（协调方卷面「主线已前进」实为并行 `line/*` 分支活跃——`int00`/`mop03`/`rag03c`/`g7y`/`priv04b` 等各自立线；集成分支本体自 REQUEST fetch 后零位移）。rebase = no-op，HEAD `2e2f1156` 本就基于 origin tip（`git merge-base --is-ancestor` 亲算 OK）。**EXEC 起点 HEAD SHA = `2e2f1156055e3256de262eed4b8c59be8c8e6670`**。
- 3 漂移源祖先关系重核：`a4e3de58` / `85d36c76` / `1789e321` 均 `merge-base --is-ancestor origin/feat/mysql-schema-skeleton` OK——**无任何漂移源被其他刀再生，无重复再生 Ban 触发**。
- §0 七 blob 锚重核（`git ls-tree origin/feat/mysql-schema-skeleton`）：`2f72becf`(baseline.json) / `c367f175`(allowlist.json) / `30129fda`(baseline.md) / `40394984`(check.mjs) / `749c86fe`(proof.mjs) / `6c27b583`(full.e2e.ts) / `c7001612`(interview.ts)——与 REQUEST §0 全等。

## 1. 六步全账（attempts ledger · 每步 EXIT+耗时）

| # | 步骤 | 命令 | EXIT | 耗时 | 读数 |
| --- | --- | --- | --- | --- | --- |
| 1 | 程序化再生两 JSON | `node /tmp/parity-regen-exec.mjs`（harness §2.3 步骤1 脚本） | **0** | 91ms | `OK appended=10 removed=2 floors={"testCount":48,"assertionCount":377}`；fail-closed 锚全过（added 恰 10 · scope 恰 full.e2e.ts · tests=0 · removed 恰 2 · digest∈{`5fb8372f…`,`8327ec14…`} · 他文件净漂移 0） |
| 1-pre | （attempt 1 失败账） | 同上（`./scripts` 相对 import 在 /tmp 脚本位不可解析） | 1 | — | **ERR_MODULE_NOT_FOUND，零写盘**（import 阶段退出）；改绝对路径 import 重跑=上格。语义零偏差，如实记账 |
| 2 | proof.mjs patcher | 唯一锚点 4 数字同步（342→350 · 367→377 · 342→350 · 6→7） | **0** | 53ms | 各锚恰 1 命中；`scripts/e2e-parity.proof.mjs` 8 行换（4 对） |
| 3 | baseline.md :18 同步 | 唯一锚点 3 数字同步（48/367→48/377 · 37/342→37/350 · 6 条→7 条） | **0** | 54ms | 恰 ：18 一行 |
| 4 | `pnpm run e2e-parity:check`（pre-commit） | — | **0** | 540ms | `valid=true errors=[]` stats `{7, 37, 350, floors 48/377, effective 37/350, allowlist 7, releaseEvidence=false}`——与 REQUEST §3 步骤1 预告逐字段全等 |
| 5 | `pnpm run e2e-parity:prove`（pre-commit） | — | **0** | 671ms | **一次优先达成** · `PASS e2e-parity proof: 22 scenarios` · TC-01-main PASS |
| — | `pnpm run generation-trust:prove` | — | **0** | 363ms | `PASS generation-trust: policy encoded; …`（base 绿保持） |
| 6 | EXEC commit | 恰 4 产品面文件 | **0** | — | **`9fa560b1`**（78+/7− · secrets 钩子过 · 作者 mw-core） |
| 6a | `pnpm run e2e-parity:check`（post-commit 复跑 恰 1 次） | — | **0** | 455ms | `valid=true` · 350/377/350 同上（previousBaseline 走 HEAD^ 案） |
| 6b | `pnpm run e2e-parity:prove`（post-commit 复跑 恰 1 次） | — | **0** | 944ms | `PASS … 22 scenarios` |

非预期红：**0 次**（唯一 EXIT=1 为步骤 1 attempt-1 的 import 路径错，发生在任何门跑之前、零状态变更；check/prove 全部一次绿，**Ban retry-to-green 未被触碰**）。

## 2. diff 形状 vs 预告

| 文件 | 预告（REQUEST §3.3 干跑） | 实测（`git show 9fa560b1 --stat`） | 判定 |
| --- | --- | --- | --- |
| `ai-docs/testing/e2e-parity-baseline.json` | 52 增 / 2 删 | 52+/2−（`54 +++…--`） | **全等** |
| `ai-docs/testing/e2e-parity-allowlist.json` | 21 增 / 0 删 | 21+/0− | **全等** |
| `scripts/e2e-parity.proof.mjs` | 恰 4 行换数 | 8 行（4 对 +/-） | 全等 |
| `ai-docs/testing/e2e-parity-baseline.md` | 恰 :18 一行 | 1 行 | 全等 |

## 3. 反触碰亲算

- `git diff --stat -- e2e/ apps/ packages/`（EXEC 后工作树）= **空**；`git status` 零残留。
- 新 HEAD `9fa560b1` 的 `git ls-tree`：`e2e/full.e2e.ts` = `6c27b583…`、`e2e/helpers/interview.ts` = `c7001612…`——与 REQUEST §0 反触碰钉①② **blob 前后全等**；`scripts/e2e-parity-check.mjs` = `40394984…` 零触碰。

## 4. 兄弟预红门对照（只记账不处置）

| 门 | base（REQUEST 期实测 @ 2e2f1156^ 树） | EXEC 后 | 判定 |
| --- | --- | --- | --- |
| `docs:check` | EXIT=1 · `public_text_policy:PTP_FILE_LIMIT:3877` | EXIT=1 · 同类 `PTP_FILE_LIMIT:3881` | 同一错误类（tracked 文件数 3877→3881，增量=REQUEST docs 4 文件；EXEC 4 产品面文件全部系已 tracked 文件，零新增文件、零新增错误类）；预红 retained，本刀不处置 |
| `quality:governance:check` | EXIT=1（ecs 控制面 v58/v70 governed paths + traceability 历史缺口） | EXIT=1 · **输出与 base 逐字节全等**（`diff` 零差） | 预红 retained 零扩散 |

## 5. 声明

- 门绿语义：`e2e-parity:check`/`:prove` EXIT=0 系**静态账本面追平**（身份/计数对账），非 HTTP E2E 已跑、非覆盖率增加、非发布证据；`releaseEvidence=false` 恒。
- attempts 总账：regen 2（1 败零副作用 + 1 成）· patcher 2 成 · check 2 成（pre/post commit）· prove 2 成（pre/post commit · 均**一次优先**）· generation-trust 1 成 · 非预期红 0。
- 本收据 docs-only（与 EXEC 产品面 commit 分离）；执行地 worktree `meetwise-line-parity` · 分支 `line/e2e-parity-baseline-regen`。
- Not-a-pass：not nail（post-prove 双审归协调方派）· not HA · not releaseEvidence · not covered · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual。
