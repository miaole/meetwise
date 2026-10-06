# re-PRE · Line AG · NHP-001-ADV-01 blind→case · mw-e2e-ha（只审文档 · Ban coding · Ban live · Ban 018/052/025 · Ban wash Y/AB · alone ≠ dual）

**审查人**: `mw-e2e-ha`（独立审查 · 不是实现方 · Ban self-approve · 不代签 `mw-rag-route`）
**审查时间**: 2026-10-06 约 13:20 CST（Asia/Shanghai · UTC+8）
**Line**: **AG**
**REQUEST tip**: `626e060`（`626e06053e4ae0bf9875c8e9b184bf175c35e3e4`）· parent `ac590ab` · 取代 `5eba515`
**审过的 FAIL 收据**: `863a5e6`（mw-rag-route PRE-EXEC FAIL B1–B5）
**Harness**: `ai-docs/delivery/harness/nhp-001-adv-01-blind-to-case.md` · slice `nhp-001-adv-01-blind-to-case.slice.md`
**Peer**: `mw-rag-route` 仍 PENDING re-PRE · alone ≠ dual · 不代签
**本审没有跑的**: 产品 coding · prove（包括 neg/bound）· live · fake-model · `.env*` · SSOT 编辑 · git config · force-push · wash Y/AB，全部为零

## 0. 自我更正（先前 e2e PRE PASS 撤回）

我在 `f215438` 里对旧 REQUEST `5eba515` 判了 PASS（`…-pre-mw-e2e-ha.md`），那次**没查出** B1（V1/V2 打的是无条件 410 的 `/answer`）和 B2（发明了 quiz/JD ingress）。这次实质重写之后，那张 PASS **作废**。本文件是 e2e 半边对 `626e060` 唯一有效的 PRE 审查。历史正文保留，不擦除。

## 1. 只改了文档

- `git show --stat 626e060`：只有 4 个 markdown 文件（harness · slice · 两个 stub），没有代码 / 脚本 / `package.json`。
- `git diff --stat 416b6a5 626e060 -- apps packages scripts package.json` 为**空**，所以下面引用的行号在 tip 上就是产品的当前状态。

## 2. B1–B5 逐条核对（拿 harness 对照代码抽查 · 不盖橡皮图章）

| # | 判定 | 抽查证据 |
|---|------|----------|
| **B1** 靶改到 `/turn` | **已解决** | `interview.controller.ts:30-33` `@Post(':id/turn')` `@HttpCode(202)` `ZodValidationPipe(TurnDto)` ✓。`:242-245` `/answer` 是 GONE 且没有 `@Body`，`service:914` 无条件 410 `legacy_answer_endpoint_disabled` ✓。harness 明文 Ban 靶 `/answer` ✓。`/answers` 受 preview guard 保护，并写了「不混写」✓ |
| **B2** quiz/JD | **已解决** | `quiz.controller.ts` 的 `create(@Req())` 不收 body ✓。V3 只走 `POST /resume`，`UploadResumeDto = z.object({text})` 不是 strict，`contracts:24` ✓。JD 登记为 absent ✓ |
| **B3** 钉码 | **只解决了一部分** | V1：TurnDto `.strict()`（`contracts:56-63`）加上 `zod.pipe.ts:10`，得到 400 `{error:'invalid',issues}`，✓。V2：202 加 1 个 answer job（`service:373`），✓。V3：剥离多余键后受理，✓。**V4 没有钉 HTTP 码，而且账本表名写错了**，见 N1 / N2 |
| **B4** 正控 / 变异 / seeding | **只解决了一部分** | 正控（合法 `/turn` 返回 202 且恰好 1 个 job）✓。变异：去掉 `.strict()` 后 zod 默认剥离多余键，V1 会变成 202，所以一定转红，计划成立 ✓。**V4 的 seeded fixture 种错了表，状态也不自洽**，见 N1 / N2 |
| **B5** NEG/BOUND 回归 | **写了，但缺环境 EXIT1 的分类**，见 N3 | 要求 `uc001:nhp-neg:prove` 和 `uc001:nhp-bound:prove` 执行后都是 EXIT 0，且 proof / 收据零改动（`package.json:167/169`）✓。harness `:80` 规定 EXIT0 必须包含 B5 也绿 ✓ |

## 3. 阻断项（Blocking）

**N1 · 账本快照表名写错 → V4 和 V1/V2 的账本断言会空转出假绿。**
harness `:58 / :64 / :65 / :67` 写的副作用快照是「`consumption_record` status/units」，V4 也是「在 `consumption_record.status='confirmed'` 里种 fixture」。实际情况：
- 开面预占走 `reserveEntitlement`（`interview.service.ts:327` 一带），写的是 **`entitlement_consumption`**（`commerce.ts:49` INSERT）。
- 结算 `confirmConsumption` 写的也是 **`entitlement_consumption`**（`commerce.ts:102 / :126-127`）。
- `consumption_record` 是 `0001_baseline.sql:47` 留下的旧表，**没有 units 列**，`rg consumption_record apps/api/src` 命中 **0** 条。
- Y / AB 的 proof 快照用的都是 `entitlement_consumption`（各 1 处），`consumption_record` 都是 0 处。

产品代码根本不写 `consumption_record`。往里种一行 confirmed 再断言「逐字节不变」，不管产品怎样都会通过，跟 B1 是同一类假绿。
**解除条件**：所有账本快照和 V4 seed 都改成 `entitlement_consumption`（`status` · `units_requested` · `units_settled` · `allocations`，idempotency_key = interview id），需要时再加 `entitlement_bucket.units_reserved/units_consumed`。

**N2 · V4 的 fixture 状态不自洽，replay 也没有钉 HTTP 码（B3 在 V4 上没完成）。**
产品里 confirmed 是怎么来的：`completeInterviewAndConfirm`（`commerce.ts:163-176`）在**同一事务**里做 confirm 和 `interview.status → 'completed'`（worker `adaptive-lifecycle.ts:340/346`）。harness 只种账本 confirmed，没有钉 interview 状态。
- 如果 interview 还停在 `created` 且已经 begin，V2 族 replay 会返回 202 并入队新 job。这是产品不可能出现的 `(created, confirmed)` 组合，V4 等于没测到守卫。
- 如果是 `completed`，就应该返回 409 `interview_not_active`（`service:155-156`）。

**解除条件**：
- seed 要镜像 `completeInterviewAndConfirm` 的结果：interview `completed` + `entitlement_consumption` confirmed + `units_settled` + bucket 已消费，并披露这是 seeded / offline。
- 钉死两条 replay：V1-replay 返回 **400** `invalid/unrecognized_keys`（pipe 在 service 之前）；V2 族 replay 返回 **409** `interview_not_active`，`answer` job 新增 **0** 个，账本前后快照逐字节相同。

**N3 · 协调方说的核心声明「neg/bound EXIT1 = docker.sock / MODEL_API_KEY · Ban-live L0 ≠ proof regression」在 REQUEST `626e060` 里找不到原文。**
`rg -i 'docker|sock|EXIT1|EXIT ?1'` 查了 4 个文件，只命中 harness `:78`（「不加载 MODEL_API_KEY」）和 `:81`（ADV 真缺陷时 EXIT1）。**没有**任何关于 neg/bound 环境 EXIT1 的披露或分类。所以这条声明的诚实性**无从核对**，我也不能替 REQUEST 编出这段披露。环境里确实有这两个风险，都有出处：
- `docker.sock` 权限缺口（`receipts/g7-key-blocked-residual-honest/P3-gate-probes.md:10-20`：先例是 `with-docker-session.sh`，靠 `sg docker` 重新执行，不做 chmod/sudo）。
- neg proof 入口有 L0 闸（`uc-e2e-001-nhp-neg.proof.ts:61-65`）：只要 `MODEL_API_KEY` 存在就断言失败，按设计 EXIT1。runner 对 `uc001:nhp-*` 本身没有 Key 闸（`run-e2e-isolated.mjs:89`，不在 LIVE 集合里）。

**解除条件**：在 B5 里加一条分类：
- 执行形式钉为 `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-{neg,bound}:prove`。
- 如果 EXIT1 来自 docker.sock 或 Key L0 闸：记为 **env-blocked / L0-guard**，B5 **未满足**，所以 ADV **≠ EXIT0**。它**不能**被说成产品回归证据，**也不能**被说成通过或 flake。
- 收据里写明第一条失败断言，Ban retry-to-green。

**N4 · 「Quoted from the files」里的引文和原文对不上。**
harness `:37` 把「作答真实入口 `POST /interview/:id/turn`（TurnDto）（遗留 `/answer` = 410 GONE）」当作 `e2e-scenarios.md:48+` 的原文引用。实际原文里 `/turn` 是 0 处，`:72` 关联契约写的仍然是 `POST /interview/:id/answer`，`:56` 步 4 写的是「输入岗位 / JD」。
**解除条件**：这一句要从引文区移到「读码前置观察」，并加一条注记：SSOT `:72` 写的 `/answer` 和代码已经漂移，本 turn Ban SSOT edit，JD 的说法和代码 absent 有落差。引文区必须逐字。

## 4. 不阻断的抽查项（执行前写进 harness 更好）

- **S1**：如果 `MEETWISE_PUBLIC_PREVIEW=1`，`/turn` 会被 `denyPublicPreviewWrite()`（`service:102-108 / :344`）拦成 **503** `public_preview_read_only`。所以 `/turn` 证据必须钉 preview 未开启；可选的 `/answers` 证据要用另一个进程、另一份 env。双向都要钉。
- **S2**：V2 写的是「`interview_event.seq` 连续」，有歧义。API 层 `/turn` 只做 claim 加 enqueue，worker 不跑，所以要实测钉 seq 的 delta（预期 0），不要用「连续」来含糊。
- **S3**：引用行号的小偏差：确认的 UPDATE 在 `commerce.ts:127`（`:126` 是 `finalStatus`），终态收口协议在 `:163`。
- **S4**：`TURN_RL` 是每个 principal 容量 30、每秒回填 0.2（`service:24`）。正控、V1、V2、V4 加起来要控制在 30 次以内，否则会被 429 污染。
- **S5**：V2 的注入串必须按服务端重算的 SHA-256 填 `answerHash`，否则会得到 422 `answer_hash_mismatch`，被误读成拒绝。

## 5. Ban-live 披露 · Ban wash Y/AB · 范围

- **Ban live / fake-model**：harness `:48 / :78` 写了不加载 Key、不主张模型层防御、评分 Key-blocked，Ban 伪造评估，✓。但 neg/bound 环境 EXIT1 的披露**缺失**，见 N3。
- **Ban wash Y/AB**：`:93` 写了 Y / AB 不动、不洗；B5 只是读跑回归，proof / 收据零改动 ✓。NEG/BOUND 的证据**没有**被冒充成 ADV ✓。
- **范围**：只限 UC-001 ADV blind→case ✓。018 / 052 / 025 只出现在 Ban 行（`:12 / :95 / :101`）✓。031/032 不往回抬 ✓。GuardrailHit absent：`rg -il guardrail apps/api/src packages/*/src` = 0 ✓。

## 6. Pins（保持不变）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-E2E-001 ADV 维持 **blind/`case-only`**

PASS ≠ coding ≠ AUTHORIZE ≠ covered ≠ HA。alone ≠ dual（peer = mw-rag-route PENDING）。

## 中文摘要

1. 重写 `626e060` 真正解决了 rag 的 B1（`/turn` 靶 · Ban 410 `/answer`）和 B2（V3 只走 resume · JD absent）。正控和 `.strict()` 变异计划也成立。代码锚点在 tip 上逐条核对过，都是真的。
2. 阻断项有四条：**N1**，账本表写成了 `consumption_record`（旧表，API 零引用），应该是 `entitlement_consumption`，否则 V4 一定空转出假绿；**N2**，V4 fixture 要镜像 `completeInterviewAndConfirm`（interview completed + confirmed），并钉死 replay 码 400 / 409 `interview_not_active`；**N3**，协调方说的「neg/bound EXIT1 = docker.sock / MODEL_API_KEY L0 ≠ 回归」在 REQUEST 里没有原文，要补上环境 EXIT1 的分类（B5 未满足 → ADV ≠ EXIT0，不能说成回归也不能说成通过）；**N4**，引文区那句 `/turn` 并不在 SSOT 原文里。
3. 我先前对 `5eba515` 的 e2e PASS 作废。本审 FAIL；修完 N1–N4 后再来复审。alone ≠ dual，peer = rag。

Verdict: FAIL
