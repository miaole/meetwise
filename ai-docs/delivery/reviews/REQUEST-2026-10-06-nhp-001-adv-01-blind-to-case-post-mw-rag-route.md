# POST-PROVE 审查 — **NHP-001-ADV-01 · UC-001 ADV blind→case**（Line AG）· mw-rag-route

**审查者**: `mw-rag-route`（独立域 · 只审不改产品 · 不代签 peer `mw-e2e-ha` · alone ≠ dual）
**PROVE_TIP**: `7eb1c88`（`7eb1c88ee63aea2fb45a51bf708c0801fc03d22c`）· 作者 meetwise-core · 2026-10-06 14:40:35 +08:00 · 是 origin 祖先（审查时 origin tip 即 `7eb1c88`）
**REQUEST**: `51af3b2` · **PRE**: 我方 Re-PRE3 PASS `7706bf7` · mw-e2e-ha re-PRE3 PASS `6a35c47`
**日期**: 2026-10-06 14:44 +08:00
**执行机器**: 只在本 box 上执行（Linux 6.12 · 临时 worktree `/tmp/mwrr-7eb1c88` @ `7eb1c88` · detached）；用户 Mac / 任何 machineId 上零命令。worktree 内执行了 `pnpm install --frozen-lockfile --prefer-offline`（14:42:19–14:42:21 +08:00，成功，lockfile 未变）。本 shell 环境中**存在** `MODEL_API_KEY`（只查是否存在，未打印值），所有 prove 均经 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 去除，L0 断言 PASS。无 live 模型调用，无云开销。

## 1. 本刀改动范围（`git show --stat 7eb1c88`）

8 个文件：`apps/api/test/uc-e2e-001-nhp-adv.proof.ts`（新增 552 行）· `apps/api/package.json`（+1 `prove:uc001-nhp-adv`）· 根 `package.json`（+2 `uc001:nhp-adv:prove` / `:raw`）· `scripts/run-e2e-isolated.mjs`（+16/-1 纯增量：receipt sources 表 `:109-120`、支持目标表 `:1438`、命令映射 `:1502-1503`、migrate 白名单加 `uc001:nhp-adv:prove:raw`，与 neg/bound 同型，不改其他目标的行为）· harness / slice 状态行 · 两份收据。
- `apps/api/src` / `packages/` / `apps/worker` 零改动（`git diff --stat 51af3b2 7eb1c88 -- apps/api/src packages apps/worker apps/web` 为空）。✅
- neg / bound proof 文件零改动（`git diff --quiet 51af3b2 7eb1c88 -- apps/api/test/uc-e2e-001-nhp-{neg,bound}.proof.ts` 成立）。✅
- 本刀未改矩阵 / backlog / checklist / FUNNEL / 018 / 052 / 025 任何文件。✅

## 2. box 复跑（CMD · 起止 +08:00 · EXIT · 断言）

| # | CMD | 起止 | EXIT | SUMMARY |
|---|-----|------|------|---------|
| R1 | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-adv:prove` | 14:42:24–14:42:38 | **0** | `asserts=63 failed=0` |
| R2 | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove` | 14:42:41–14:42:54 | **0** | `asserts=26 failed=0` |
| R3 | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-bound:prove` | 14:43:00–14:43:13 | **0** | `asserts=17 failed=0` |
| M1 | 同 R1，worktree 内把 `packages/contracts/src/index.ts:63` 的 `}).strict();` 改为 `});` | 14:43:23–14:43:37 | **1** | `asserts=63 failed=3` |
| R4 | 还原（`git checkout -- packages/contracts/src/index.ts`）后同 R1 | 14:43:41–14:43:55 | **0** | `asserts=63 failed=0` |

prove 自身首行（R1；R2/R3 同型）：`with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)` → `E2E_POSTGRES_READY label=boot consecutive=3 attempt=4` → `E2E isolated PostgreSQL: meetwise-e2e-967537-1791268945386 on 127.0.0.1:32864` → `PASS  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)` → `CMD=pnpm uc001:nhp-adv:prove EXIT=0`。本次复跑无环境失败。
（说明：中间有一次 R2+R3 合并调用被中断；R2 已完成 EXIT 0，R3 随后单独重跑如上。中断后 `docker ps -a --filter name=meetwise-e2e` 为空，无残留容器。）

**M1 变异结果**：失败的 3 条为 `V1 unauthorized keys → HTTP 400 error=invalid`、`V1 issues include unrecognized_keys`、`V4 V1-replay → 400 invalid (pipe before service)`。V1 实际 = **HTTP 409 `{error:'stale_question'}`**（不是 400，属于 C2 预期的 202/409 类）；V4 V1-replay 实际 = 409 `interview_not_active`。EXIT=1 ≠ 0 ✅。变异未提交，还原后 `git status` 干净，`:63` 恢复 `}).strict();`。

## 3. 逐条核对 proof（`apps/api/test/uc-e2e-001-nhp-adv.proof.ts`）

- **证据层（单一）**：`:7-9` 写明真 HTTP（in-process Nest `createApp`）+ 隔离真 PG（run-e2e-isolated · 最小权限 runtime login · RLS 开）· 无 worker / 无模型；`:139-156` 实现一致。✅
- **/turn 靶，禁 /answer**：`:286-287` 只调 `/interview/:id/turn`；`:112-113` 断言 proof 源码不调 `/answer`。运行时锚点：controller `@Post(':id/turn')=30` / `@HttpCode(202)=31` / GONE `/answer=242`。✅
- **正控（C4/C6）**：`:355` 独立种子 `q-v1-t0-c0`，`:281` 断言 `status='issued'`；`:367-378` 钉 202 + jobId、answer job 恰好 +1、consumption 仍 reserved / `units_settled` NULL / owner 总行数 1 / outbox 0、interview 仍 created、event maxSeq 不变。复跑证据：202 `{accepted:true,replayed:false,jobId}`。✅
- **V1**：`:391-411` 多余键 `status/score/consumption` → 钉 400 `invalid`；answer job 不变；LEDGER-SNAP 字节相同。复跑证据：`issues[0].code='unrecognized_keys'`，keys 三个。✅
- **V2（C4/C6）**：`:414` 独立种子 `q-v2-t1-c0`（不同 questionId / turn），`:281` 断言 issued；`:426-438` 钉 202、+1 job、payload answer 与请求字节相同、interview 仍 created、consumption reserved、outbox 不变、maxSeq 不变、owner 总行数 1。✅
- **V3（C5）**：`:449-464` `POST /resume` 带注入文本与多余键 → 钉 **200**（锚点 `resume.controller.ts:16-17` `@Post()` + `@HttpCode(HttpStatus.OK)`）；无 bucket / consumption / interview 副作用。复跑：200 `{resumeId,status:'ingested'}`。✅
- **V4（seeded，已披露）**：`:481-484` 经 `completeInterviewAndConfirm` 离线 seed，并注明「Ban full-main-chain-without-model narration」；`:486-494` confirmed / `units_settled=1.00` / bucket consumed +1 / outbox +1；`:503-518` V1-replay 400 `invalid`、V2-family replay 409 `interview_not_active`，job 不变、LEDGER-SNAP 字节相同、status 仍 completed。✅
- **V5**：`:300-332` 扫产品源码树，`GuardrailHit` 命中 0 → 记为 `absent`（AUDIT-OBSERVATION），不宣称已接。✅
- **LEDGER-SNAP（C3）**：`:178-246` 含 interview 的 exact-1 consumption + allocations → bucket，**owner 名下 `entitlement_consumption` 总行数**（`:205-207`）、**全部 bucket**（`:208-211`）、全部 consumption（`:212-215`），对应 `nhp-bound.proof.ts:158-162` 的 bucket+consumption 快照并有扩充；`:114-116` 断言源码不引用禁用的旧账表。✅
- **零模型副作用**：`:520-524` ai_model_invocation / ai_invocation_trace 行数不变。✅
- **断言数**：R1 / R4 日志中 `PASS` 行 63 条，`SUMMARY asserts=63 failed=0`，与 core 收据一致。

## 4. 我方条件核对（Re-PRE3 §4 + harness C1–C6）

1. **B5 在 box 上 EXIT 0**：已满足。core 收据 `receipts/2026-10-06-nhp-001-adv-01-b5-env-capable.md` 记 neg 26/26、bound 17/17（ADV 前后各一次）；本审独立复跑 R2/R3 同样 EXIT 0、26/26、17/17；neg/bound proof 零改动。✅
2. **环境失败须引 prove 自身首行**：core 收据所列首行均出自 prove 自身输出（with-docker-session 行 · PG banner · L0 PASS · CMD 行），不再只靠旁证行；对早期 `isolated_postgres_database_not_ready:boot`（node_modules 链接缺失）如实披露为环境问题。本审复跑无环境失败。✅
3. **harness `:36` 过时叙述**：**未更正**。`7eb1c88` 时 `harness/nhp-001-adv-01-blind-to-case.md:38`（因页眉新增 2 行下移）仍写「本稿在 `626e060` 基础上只修 mw-e2e-ha re-PRE FAIL `3f3a2e4` 的四条阻断」。原定为不阻断，继续保留为条件。
4. **ADV 保持 blind/case-only，无 covered 翻转**：`7eb1c88` 上矩阵 `:112` ADV 列仍为 `**blind** / \`case-only\``；harness / slice / 收据都写明 EXIT0 ≠ covered、coveredCount=8。✅
- **C1 两个环境标签分开**：harness `:155-157` / slice 禁合并标签，自检收据 `docker.sock` 与 `key` 分列。✅
- **C2 变异记录 V1 实际状态 + EXIT≠0**：core 收据记 V1 → 409 `stale_question`、EXIT=1、`failed=3`；本审 M1 完全复现（同 3 条失败、同 409 `stale_question`）。✅
- **C3 / C4 / C5 / C6**：见第 3 节。✅

## 5. core 收据诚实度（对照本审复跑）

asserts=63 ✔ · ADV EXIT 0 ✔ · neg 26/26 EXIT 0 ✔ · bound 17/17 EXIT 0 ✔ · 变异 V1→409 `stale_question`、EXIT 1、failed=3 ✔ · 变异未提交 ✔。全部一致，未发现夸大。注：审查时 origin 上尚无 mw-e2e-ha 对 `7eb1c88` 的 POST 收据；本审独立完成，不代签。

## 6. 非阻断发现（建议下一刀顺手修，不影响本次结论）

- N-1 **静态锚点在变异下误判通过**：`:81-82` 从 `TurnDto` 起向后找第一个 `}).strict();`，M1 时匹配到了 `contracts/src/index.ts:105` 的另一个 schema，`ANCHOR TurnDto ends with .strict()` 仍 PASS。真正兜底的是运行时 V1（已变红），但该静态断言名不副实，应收紧为只看 TurnDto 本体的结束行。
- N-2 `:407` `hasUnrecognized || issues.length > 0` 偏宽（任意 issue 都过）；复跑实际为 `unrecognized_keys`，建议去掉 `|| issues.length > 0`。
- N-3 `:465` `A('V3 JD/quiz text ingress = absent …', true)` 是恒真断言，占 63 条中的 1 条；应改为 EVIDENCE 披露而不计入断言。
- N-4 `:117-125`、`:306-311` 残留无效代码（`guardHits` 恒 0、空 `walk`），不影响结果，建议删除。
- N-5 `:382-387` 为给 V2 腾出唯一开放题槽，fixture 直接把正控题置 `answered`；源码已注明「Disclosed fixture · not a product claim」，可接受。

## 7. 洗白 / 越界检查

Y（NHP-001-NEG-01）/ AB（NHP-001-BOUND-01）只作为回归复跑，proof 与收据零改动，未被借绿；018 / 052 / 025 只出现在 Ban 行；FUNNEL / G-R4-5 未触碰；无 SSOT 编辑；无自 nail。

## 条件（PASS 附带）

1. 更正 harness `:38` 的过时叙述（原 Re-PRE3 条件 3，继续保留，不阻断）。
2. nail 时 UC-E2E-001 ADV 只能登记为 case 证据（blind/`case-only` 措辞），不得升 covered / partial；coveredCount=8；须等 mw-e2e-ha 独立 POST 并经协调方授权 nail，不得自 nail。
3. N-1～N-3 在后续触及该 proof 时修正；修正后须重跑并保持变异 M1 变红。

## Pins（核对未变）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · public DELETE=503 · PG-retained（Postgres/pgvector/PostgresSaver；禁 MySQL runtime / Qdrant / MemorySaver）· UC-018 与 §1.1 仍 partial · PASS ≠ covered ≠ nail ≠ HA · EXIT0 ≠ covered。

**结论**：本刀只新增 proof 与接线，产品零改动；box 复跑 ADV 63/63 EXIT 0、neg 26/26 EXIT 0、bound 17/17 EXIT 0；`.strict()` 变异使 V1 → 409 `stale_question` 并 EXIT 1，还原后 EXIT 0；我方条件 1、2、4 与 C1–C6 落实，条件 3 未落实但不阻断。PASS（附条件 1–3）。alone ≠ dual。

Verdict: PASS
