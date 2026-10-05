# REQUEST — **NHP-025-BOUND-01 · UC-025 BOUND version-pin** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-05T23:49:17+0800
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail
**审查对象**: REQUEST `73b9d8574844e390180586b82af3b1a128fcbd8b` · code `6853e177adedd9c35e88d9c1acaa98899744d6be` · tip named `e8fa74cd35c8acbbcadbba0851e05ca754aec60d` · implementer receipt SHA `e8fa74c`（`ai-docs/delivery/receipts/2026-10-05-nhp-025-bound-01-version-pin-prove.md`）
**PRE duals**: mw-e2e-ha `df6a89796b898cadf99189c3bdfd60a6ac2982b2` · ours `cdcd11fd3af584a0dc111032680ae80c94e5e8d5`（条件已复核）
**NORTH-STAR-EXECUTION-LOOP**: 仍 **未找到**。门 = `north-star-hard-gates.md` + harness/slice。

## 复跑（临时 worktree `/tmp/mwrr-e8fa74c` @ `e8fa74c` · `env -u MODEL_API_KEY -u MODEL_BASE_URL`）

| CMD | EXIT | 说明 |
|-----|------|------|
| `pnpm uc025:nhp-bound:prove` | **0** | S0–S6 + R1–R6 全 PASS；`HTTP_ERROR_PIN 409 resume_version_mismatch`；`SUMMARY` 风格 PASS 行 16（含终句） |
| `pnpm uc025:nhp-neg:prove`（只读 · Ban wash） | **0** | `acceptsQuiz=true · realStaleReject=true`；NEG frozen 未改脚本 |
| **Mutation**（temp only）：注释掉 `resume_version_mismatch` throw | **1** | S2/S4/S5 FAIL → `GAP … unwired` · `CMD=… EXIT=1`；`git checkout --` 恢复后 BOUND 再跑 EXIT **0** |

## 产品改动（`6853e17` · 协调方授权 coding+prove 于 PRE dual 之后）

`interview.service.ts` begin 在 stale_quiz 块（throw **`:222`**）之后新增 **`:225-248`**（约）：读 `resume_quiz` 0061 pin `(resume_id, privacy_epoch)` + 当前 resume epoch；失配 → **409** `resume_version_mismatch`；**先于** bind UPDATE / `reserveEntitlement` / `enqueueInterviewJob`。NULL pin 不假拒；无 `sourceQuizId` 跳过。**NEG stale 块逐字节未动**。另：新 proof + package.json scripts。PRE REQUEST 本为 docs-only Ban 产品编辑；**meetwise 在 PRE dual PASS 后授权 mw-core coding+prove**——本审记此授权链，不把 PRE Ban 误读成 post 仍禁接线。

`73b9d85..e8fa74c` 另含 Line Y 测试/ runner 登记（与本刀文件重叠为零产品业务逻辑以外的邻刀）；本刀产品面仅 `6853e17` 上列。

## 证据层裁定

**证据层裁定：进程内 fake DB — 满足 harness:54「形态对齐 `uc025:nhp-neg:prove`」（NEG 本身为静态 inventory、无隔离 PG）；不触发 `BOUND-EVIDENCE-LAYER-FAKE-DB`。**

依据：
1. REQUEST harness `:54`：「拟 CMD …（隔离壳三层；**形态对齐** `uc025:nhp-neg:prove`）」。`uc025:nhp-neg:prove` = 静态源码 inventory（无 Postgres / 无 HTTP E2E）。「形态对齐 NEG」= 非 PG 证据面，**不是**硬隔离 PG acceptance gate；「隔离壳三层」为拟/规划用语，与对齐子句并读不得升成硬 PG 门。
2. north-star-hard-gates：G1 要 CMD+EXIT；G2 要 BOUND 被执行；**未**规定本 case 必须 HTTP+隔离 PG 才算 case 证据。EXIT0 ≠ covered / ≠ G7。
3. 本 prove 的 fake client：**记录 SQL log**；`sideEffect` 拒 UPDATE/INSERT/entitlement/job；失配断言 exact 409+`resume_version_mismatch`；正控 R4/R5/R6 以 `ReachedBind` 证明匹配/NULL/无 quiz-id 能越过守卫；未知 SQL → `UNEXPECTED_SQL`。故能证「拒在 bind/quota/enqueue 前」。
4. 诚实边界：≠ HTTP/PG E2E · ≠ covered · ≠ nail。后续若要隔离 PG/HTTP BOUND 收据，须另刀——本刀不因证据层 FAIL。
5. 先例：UC-025 NEG 关账接受的是静态 inventory 层；本 BOUND 在同对齐下更强（真 `InterviewService.begin` + recording fake）。

## 范围 / 矩阵

- tip（`e8fa74c` 矩阵）`UC-E2E-025`：**NEG** CLOSED(wired) 旁注保留 · **FAULT gap · BOUND gap · ADV blind** · 行 stays **gap** · coveredCount=**8**（BOUND 未翻 covered；最多 case 证据）。
- Ban wash `uc025:stale-quiz-expiry:prove` / NEG EXIT0 成 BOUND。未碰 018/052。无 RAG 假关。
- PG-retained（产品）；prove 零 MySQL/MemorySaver/Qdrant 主张。

## 条件（pre `cdcd11f` 复核）

1. Dual PASS ≠ covered ≠ nail ≠ HA。alone ≠ dual。
2. 不代签 peer。
3. `:209`→抛点 `:222` 漂移已披露；BOUND 抛点现 `:246`（receipt）。
4. HTTP/error 已钉 409/`resume_version_mismatch`（wiring 条件兑现）。
5. **Condition**：本 EXIT0 = 进程内+fake DB case 证据；不得叙述为隔离 PG E2E / covered。

Verdict: PASS
