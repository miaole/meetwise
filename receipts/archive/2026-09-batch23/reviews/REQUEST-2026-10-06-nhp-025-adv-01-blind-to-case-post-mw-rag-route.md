# REQUEST — NHP-025-ADV-01 · UC-025 ADV blind→case · POST-PROVE · mw-rag-route

**时间**：2026-10-06 19:53 +08:00
**Line**：AK
**Expert**：mw-rag-route（独立审查）· **Peer**：mw-e2e-ha（PRE `13fc781`、POST `5ab6343` 均未作为本审证据，不代签）
**PROVE_TIP**：`4a804a8f4ebae5c3d747988f798aba2248b34ab9` · **核心收据**：`c4d3b9f0d9b3a4fd60052429eb898ddbe1a76411`。两者 fetch 后均为 `origin/feat/mysql-schema-skeleton` 祖先。核心声称的 pre-rebase `b66464e` 本地存在，`git diff b66464e 4a804a8 -- apps packages scripts package.json` 为空，核实一致。
**REQUEST**：`420aeca` · PRE：mw-rag-route `0a67d40`（PASS · C1–C6）· mw-e2e-ha `13fc781`
**执行面**：仅本 box · 临时 worktree `/tmp/mwrr-4a804a8`（detach 于 4a804a8 复跑与变异，再切到 origin tip `5ab6343` 写本收据）· 未在用户 Mac / 任何 machineId 上运行 · 未读 `.env*` · 未打印任何 Key 值 · 无 live 模型调用
**Pins**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503

## 1. 范围

- `4a804a8` 只改 4 个文件：新 proof `apps/api/test/uc-e2e-025-nhp-adv.proof.ts`（+455）、`apps/api/package.json`（+1）、根 `package.json`（+2）、`scripts/run-e2e-isolated.mjs`（+16/-0：receipt sources 条目、supported-target 一行、command map 一分支）。纯增量，未加入 migrate allowlist（该 proof 走 `_neg-harness` 加载 `sql/`，同 fault-isolated 先例）。
- `c4d3b9f` 只改 3 个 docs：harness（+4/-2）、slice（+3/-1）、收据（+77）。
- `420aeca..4a804a8`：`apps/api/src`、`packages/`、`apps/worker` 零改动；W BOUND / NEG / FAULT / FAULT-ISOLATED proof 与 `_neg-harness.ts` 零改动。→ **通过**

## 2. box 复跑（串行；每次跑前 `with-docker-session.sh docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` 均为 0）

前置：`pnpm install --frozen-lockfile --prefer-offline` EXIT 0。命令统一为 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <script>`，提交为 4a804a8。

| script | 窗口（+08:00） | EXIT | 计数 |
|---|---|---|---|
| `uc025:nhp-adv:prove` | 19:49:32–19:49:41 | **0** | ADV-new 18/0 · complementary 8/0 · infra 18/0 · total=44 |
| `uc025:nhp-neg:prove` | 19:49:54–19:49:54 | **0** | 1 PASS（`NHP-025-NEG-01` 静态 / 清单式） |
| `uc025:nhp-bound:prove` | 19:49:54–19:49:57 | **0** | 16 PASS / 0 FAIL |
| `uc025:nhp-fault:prove` | 19:49:57–19:50:00 | **0** | 15 PASS / 0 FAIL |
| `uc025:nhp-fault-isolated:prove` | 19:50:00–19:50:09 | **0** | total=21 fail=0 |
| `uc025:nhp-adv:prove`（变异恢复后） | 19:51:08–19:51:17 | **0** | 18/0 · 8/0 · 18/0 |

ADV 首跑 RESULT：A1 404 `{"error":"not_found_or_forbidden"}`；PC-A1 202 `{"accepted":true,"jobId":…}`；A3-b 409 `{"error":"resume_version_mismatch"}`；complementary：A3-a 202、A3-c 409 `resume_version_mismatch`、A3-NULL 202。`C2_BUCKET total=3 reserved=3 consumed=0`。隔离 PG `meetwise-e2e-1164490-…`（127.0.0.1:32911），`release_evidence=false`。无 env 失败。

回归即 harness `:154-163`（§7）所列四条，均符合期望 EXIT 0。它们只作回归；W BOUND 的绿未被计入 ADV，complementary 行也未计入 ADV-new。

## 3. 变异（仅 worktree，从未 commit；每次后 `git checkout` 且 `git status` 为空）

| id | 改动（`interview.service.ts`） | 窗口 | EXIT | 结果 |
|---|---|---|---|---|
| MUT-RAG-A1-pred | `:214` 去掉 SQL `AND owner_user_id=$2`（改为 `AND $2::text IS NOT NULL`） | 19:50:19–19:50:28 | **1** | 仅 `[PIN] anchor :214 owner-scoped quiz SELECT` 红；**A1 行为仍 404**。FORCE RLS（`20_resume_quiz.sql:46-49`）对 app 连接生效，作为第二道闸挡住了 B 的 quiz |
| MUT-RAG-A1-throw | `:217` `quiz.rowCount === 0` → `=== -1`（not-found 放行） | 19:50:34–19:50:43 | **1** | `[A1 ADV-new] HTTP 404 {error:not_found_or_forbidden} (@ :214-218)` 红；实际 500 `internal_error`；其他 43 条绿 |
| MUT-RAG-A3b | `:263` 把 `resumeId.toLowerCase()` 换成 `pinnedResumeId.toLowerCase()`（忽略 header resume-id，epoch 检查保留） | 19:50:54–19:51:03 | **1** | `[A3-b ADV-new] exactly HTTP 409 {error:resume_version_mismatch} (@ :266)` 与 `not 404/400` 红，另 `[PIN] anchor :263` 红；实际 409 `interview_resume_binding_unavailable`（由 bind `:300` owner 条件兜底，无副作用）；**A3-c 仍绿**（epoch 路径独立），说明 A3-b 断言具区分度 |

恢复后重跑 EXIT 0（§2）。核心收据的 MUT-A1（`:217` → 500）与 MUT-A3b（`:265` → 409 `interview_resume_binding_unavailable`）与本审观测一致。

## 4. proof 审读（`apps/api/test/uc-e2e-025-nhp-adv.proof.ts`）

- **A1 先于 PC-A1**：代码顺序 A1 `:305-331`，PC-A1 `:333-348`；另有基线断言 `:314`（A 的 consumption=0、jobs=0）。若 PC-A1 先跑，该断言会红。
- **A1 = 404 且无副作用**：`:321` 断言 404 `not_found_or_forbidden`；`:325-327` consumption / reserved Δ0（A 与 B）；`:328` interview_job Δ0；`:329` 未绑定且整快照不变。
- **PC-A1 = 202 且有 seed 额度**：bucket seed 在 `:232-245`；`:341-346` 断言 202、绑定 R_A@1、reserve 1.0、+1 job。
- **A3-b = 409 `resume_version_mismatch`**：`:363-364` 精确 body（仅 1 个 key）；`:367-372` 无 reserve / enqueue / bind。静态前提为 `:215-220`（`:266` 之前无 header resume-id SQL 参数）。
- **真 HTTP / 真 PG**：经 `_neg-harness` `boot()` 起真实 Nest app 并 `listen(0)`（`_neg-harness.ts:43-90`）；`:97-101` 现场核验 `resume_quiz` 的 ENABLE + FORCE RLS。MUT-RAG-A1-pred 证明 RLS 对 app 连接确实生效。

**C1–C6**

- **C1 已落实**：bucket `kind='paid'`（`:233-234`），断言 ∈ {gift,trial,paid}（`:238-239`）；`mock_interview` 只作 reserve 的 service_type。
- **C2 已落实**：专用 bucket `units_total=3.0`（`:234`），断言 ≥3.0（`:240-241`），FIFO 首位（`:242-245`），全程无 402（`:419-420`）。实测终态 `reserved=3`。
- **C3 已落实**：A3-NULL 的 resume_id 与 privacy_epoch 均为 NULL（`:407-408`），注释与断言名标明为 legacy admin-INSERT 形态；pair chk 现场探针 `:268-270` 拒绝半 NULL。
- **C4 已落实**：A3-c 漂移由 INSERT 实现（R_A2 当前 epoch 2 `:226`，pin epoch 1 `:393-394`，FK 满足）；UPDATE-pin 触发器探针 `:275-280` 拒绝改 epoch；方法已在注释与收据中披露。prove-local 0061 镜像（`:173-199`）与真实 `0061…sql:51-54`（FK）、`:67-69`（pair chk）、`:96-124`（触发器）语义逐字一致（真实迁移带 `NOT VALID`，只影响存量行，不影响新 INSERT）。
- **C5 已落实**：`c4d3b9f` 中 harness `:28` B3 行已划掉并标 “superseded by Rewrite note 2（option (b) · C5）”。
- **C6 已落实**：分类常量 `:40-41`，每行打 tag `:47`；`RESULT … complementary(≠ADV-new …)` 与独立 summary 见 `:425-436`。complementary 若红仍令 EXIT≠0，但不计入 ADV-new。

**44 的构成（审计）**：无字面恒真断言。ADV-new 18 条中，3 条为 fixture / 基线（`:314`、`:316`、`:356-357`），2 条为被精确断言蕴含的冗余（`:322-323` 被 `:321` 蕴含，`:365-366` 被 `:363-364` 蕴含），行为核心约 13 条。infra 18 条中，9 条为钉行号的静态锚点（`:207-220`，较脆但真实，已在两次变异中抓红），`:94` 端口存在为弱断言。complementary 8 条中有 2 条 fixture（`:394`、`:408`）。计数略有充水，不阻塞（条件 1）。

## 5. 核心收据 c4d3b9f vs 本审

- ADV 18/0、8/0、18/0、total 44、EXIT 0 一致；六个 RESULT 的状态码与 body 一致；C2 终态 reserved=3 一致。
- 回归：bound 16 PASS、fault 15 PASS、fault-isolated 21/21、neg EXIT 0，均一致。
- MUT-A1 / MUT-A3b 实际值一致（见 §3）。
- 收据 “Prove-local stubs (disclosed · ≠ covered)” 段已披露 schema stub 与 0061 镜像。

## 6. 门禁与 pins

- `NORTH-STAR-EXECUTION-LOOP.md:81`（§3③）：harness §6 给出 CMD 与 EXIT 语义（EXIT0 = case 证据；EXIT1 诚实保留），§7（`:154-163`）四条回归各期望 EXIT 0。观测全部吻合，三个变异均 ≠0。
- `north-star-hard-gates.md:46` / `:117`（gap ≠ covered）：proof `:25`、`:445-446`，收据 Pins 段均写 UC-E2E-025 行 stays gap、ADV stays blind、EXIT0≠covered、canHonestlyFlip=false；本线未改 matrix / backlog / checklist。
- 未洗 W BOUND（`e8fa74c` / `6853e17`）、FAULT-ISOLATED、B'' NEG、AA FAULT：proof `:84`、`:14-18`。
- Pins 未变（见文首）；PG-retained，未引入 MySQL runtime / Qdrant / MemorySaver。runner 横幅中的 `SOLE_STACK=mysql-qdrant-redis` 是既有双轨标签说明（Line AL 范畴），非本线引入。

## 7. 条件（非阻塞）

1. nail / 矩阵引用 ADV 数字时写「ADV-new 18（行为核心约 13 + fixture 3 + 冗余 2）」，不要把 44 当成 ADV 证据数；complementary 8 与 infra 18 不计入 ADV。
2. 证据层须如实写明：`_neg-harness` 加载 `sql/` 加 4 个迁移，再加 prove-local stub（privacy-active owner stub、interview v64 列、0049 bind stub、0061 resume_quiz 镜像，proof `:103-200`），**不是**完整迁移链；认证走 `AUTH_DEV_HEADER` dev 头。PC-A1 / A3-a / A3-NULL 的 202 依赖这些 stub，A1 / A3-b 的拒绝发生在 `:266` 之前，不依赖 bind stub。
3. 记录 MUT-RAG-A1-pred 的发现：去掉 SQL owner 谓词后 A1 行为仍 404（RLS 兜底），此时只有静态锚点 `:207` 变红。若将来静态锚点因行号漂移被调整，需保留对 `:214` owner 谓词的源码断言，否则该退化将不可见。
4. 静态锚点钉死行号（`:207-214`），后续任何 `interview.service.ts` 行变动都会令本 proof 红；届时应改为按符号定位，而不是按行号洗绿。

## 8. 结论

ADV case 证据在本 box 可复现（EXIT 0 · ADV-new 18/0），四条回归 EXIT 0；A1 先于 PC-A1，A1 404 无副作用，PC-A1 202 有 seed 额度，A3-b 精确 409 `resume_version_mismatch`；C1–C6 全部落实；本审变异 MUT-RAG-A1-throw 令 A1 红，MUT-RAG-A3b 令 A3-b 红且 A3-c 保持绿，恢复后重跑绿；complementary 未计入 ADV-new，未洗 W BOUND。

边界：PASS ≠ covered ≠ ADV 列升格 ≠ nail ≠ HA；EXIT0 ≠ covered；UC-E2E-025 行 stays **gap**，ADV stays blind（case 证据）；coveredCount=8。alone ≠ dual：本审为 mw-rag-route 独立结论，不代签 mw-e2e-ha（`13fc781` / `5ab6343`），不 nail；nail 需双方独立 PASS 加协调方裁定。

Verdict: PASS
