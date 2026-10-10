# re-PRE2 · Line AG · NHP-001-ADV-01 blind→case · mw-e2e-ha（只审文档 · Ban coding · Ban live · Ban 018/052/025 · Ban wash Y/AB · alone ≠ dual）

**审查人**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · 不代签 `mw-rag-route`）
**审查时间**: 2026-10-06 约 14:15 CST（Asia/Shanghai · UTC+8）
**Line**: **AG**
**REQUEST tip**: `4e9f568`（`4e9f568ce6e8bf71cc91465b6ff07b1a5d792323`）· parent `3e3b2af` · supersedes `626e060`
**本审对照的 FAIL 收据**: `3f3a2e4`（mw-e2e-ha re-PRE FAIL @ `626e060` · N1–N4）· `863a5e6`（mw-rag-route PRE FAIL @ `5eba515` · B1–B5）
**审查基线**: origin `feat/mysql-schema-skeleton` @ `3409862`（`4e9f568` 为其祖先）
**Harness**: `ai-docs/delivery/harness/nhp-001-adv-01-blind-to-case.md` · slice `nhp-001-adv-01-blind-to-case.slice.md`（行号均指 `4e9f568` 版本）
**本审没有做的**: 产品 coding · prove（含 neg/bound）· live · fake-model · 读 `.env*` · SSOT 编辑 · git config · force-push · wash Y/AB —— 全部为零。本文件为新文件，**不**在 `3f3a2e4` FAIL 文件上追加第二个 Verdict。

## 1. 只改了文档 · 代码锚点未漂移

- `git show --stat 4e9f568`：4 个 markdown（harness +105/− · slice · e2e stub · rag stub），零 `apps/` `packages/` `scripts/` `package.json`。
- `git diff --stat 626e060 4e9f568 -- apps packages scripts package.json` = **空**；`git diff --stat 4e9f568 3409862 -- apps packages scripts package.json` = **空** → 下文源码行号在 REQUEST 与当前 origin tip 上相同。
- `4e9f568` **未**修改我方 FAIL 文件 `…-re-pre-mw-e2e-ha.md`（diff 不含该路径 · 与其自述一致）；对 rag stub 只改了 header 与「请审什么」段，rag `863a5e6` FAIL 正文未动。

## 2. N1–N4 逐条独立核对（不盖橡皮图章 · 每条对照源码）

| # | 判定 | harness 落点 | 源码 / 原文核验 |
|---|------|--------------|-----------------|
| **N1** 账本表 + 非空转守卫 | **已清除** | `:101-107` LEDGER-SNAP = `interview.status/version` · `interview_job`（按 kind）· **`entitlement_consumption`**（`owner_user_id + idempotency_key=interviewId` · `status/units_requested/units_settled/allocations`）· `entitlement_bucket.units_reserved/units_consumed` · `commerce_outbox` 计数 · `interview_event` max seq；`:109` **非空转守卫**：每次快照先断言命中**恰好 1 行**且 status 符合（V1/V2/正控=`reserved` · V4=`confirmed`）、allocations 非空、bucket 行存在，0 行即 FAIL；proof 源码 `consumption_record` 出现次数须 = 0；`:128` (d) 守卫自检变异（temp 换回旧表必须转红 · 不提交）；`:165` Ban 旧表 | `commerce.ts:48-51` `INSERT INTO entitlement_consumption` ✔ · `:73-75` bucket `units_reserved += take` ✔ · `:85` 回写 allocations ✔ · `:101-103` confirm 读 ✔ · `:121-123` bucket reserved−/consumed+ ✔ · `:127` `UPDATE entitlement_consumption SET status, units_settled` ✔ · `:129-131` `commerce_outbox` `settlement_proposed` ✔。DDL `0001_baseline.sql:109-122`（含 `units_settled` · `allocations` · `UNIQUE(owner,idempotency_key)`）✔ · `:126-133` outbox 有 `consumption_id` ✔ · `:47` `consumption_record` 旧表 ✔。`git grep consumption_record 4e9f568 -- apps/api/src packages/db/src` = **0** ✔；neg/bound proof `:162` 均用 `entitlement_consumption`、`consumption_record` = 0 ✔。`interview.service.ts:329` `reserveEntitlement(c, principal, id, 'mock_interview', 1.0)` ✔ |
| **N2** V4 fixture 镜像 + replay 钉码 | **已清除** | `:87` 终态收口协议注记；`:89` 问题行 seed 披露；`:120` V4：真 HTTP 建会话+begin → seed issued 问题行 → `asPrincipal(owner)` 内**直接调产品函数** `completeInterviewAndConfirm`（不手写 SQL 拼状态）→ 后置断言 `interview.status='completed'` · `confirmed` · `units_settled=1.00` · bucket −1/+1 · outbox +1；replay 钉 **V1-replay 400** `invalid`+`unrecognized_keys` · **V2 族 replay 409** `{error:'interview_not_active', status:'completed'}` · `answer` job delta 0 · LEDGER-SNAP 逐字节相同；replay 得 202/入队 = 真缺陷 EXIT1；Ban 只种账本不种 interview 终态 | `commerce.ts:163-189` 同一调用内 `confirmConsumption(…,1)` + CAS `UPDATE interview SET status='completed' … WHERE status IN ('created','active')` ✔（begin 后 status 仍 `created` → CAS 命中）。worker 唯一产品调用点 `adaptive-lifecycle.ts:340/346` ✔。`/turn` 链：controller `:30-33` pipe 先于 service → V1-replay 400 ✔（`zod.pipe.ts:10` · `TurnDto…}).strict()` `contracts:56-63`）；service `:344`→`:347`→`:353-354`→`:356-357`→`:361-362`→`:366`→`:367` `assertAnswerable` → `:156` `TERMINAL_INTERVIEW`（`:26`）→ `:165` 抛 `{error, status}` 409，先于 `claimInterviewAnswer`（`:368`）与 enqueue（`:373`）→ V2 族 replay 409 `interview_not_active` 且零 job ✔ |
| **N3** env EXIT1 分类（docker.sock vs Key 分开写） | **已清除**（附非阻断 S1） | `:134` 执行形式钉 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-{neg,bound}:prove`；`:135` 两种来源**分列**并各有出处：docker.sock 权限缺口（`P3-gate-probes.md:9-12`）**或** `MODEL_API_KEY` Ban-live L0 闸（neg `:60-65` / bound `:55-60`）；`:136` 分别记为 **`env-blocked`（docker.sock）/ `L0-guard`（MODEL_API_KEY）**，二者都 ≠ 产品回归证据、≠ 回归通过、≠ flake；`:137` **B5 未满足 → ADV ≠ EXIT0**，不得以 env 原因豁免；`:138` 收据写第一条失败断言原文或 `with-docker-session` exit 77 / docker 错误首行 · Ban retry-to-green / 改 proof / chmod·sudo / 加载 Key；`:139` 授权后须 ENV-capable EXIT0 + 零 proof 改动；`:169` Non-claims「not ADV EXIT0（B5 env-blocked 未解前）」 | L0 只看 env key：neg `:61-65` / bound `:56-60` `A('L0 Ban live: MODEL_API_KEY absent on entry…', !keyPresentOnEntry)` → Key 在即 EXIT1 ✔（L0 **只**挂在 Key 上，docker.sock **未**被称为 L0 ✔）。`P3-gate-probes.md:9-12` docker.sock `root docker 0660` + `docker info` permission denied ✔；`with-docker-session.sh:42-55` 可达直通 / 组内 `sg docker` 重执行 / 不可越 exit 77 ✔。`run-e2e-isolated.mjs:89` `LIVE_E2E_TARGETS` 不含 `uc001:nhp-*` ✔。`package.json:167/169` ✔ |
| **N4** SSOT 引文诚实 | **已清除**（附非阻断 S2） | `:42-71` 引文区改为 fenced 逐字；`:71` 明示 SSOT 全文 `/turn` = 0 处、前稿属误引已移除；`:75-78` SSOT↔代码漂移注记（`:72` `/answer` vs 代码 410/`/turn` · `:58` JD vs absent · `:59/:61/:65/:69` `ConsumptionRecord` / `:76` `consumption_record` vs 物理表 `entitlement_consumption`）· Ban SSOT edit | 逐字节比对 @ `4e9f568`：NHP 矩阵 `:39` 整行 **相等** ✔；coverage 矩阵 `:112` 子串命中 ✔、`:129` 整行 **相等** ✔；`e2e-scenarios.md` `:58` `:61` 仅去掉列表前导两空格、其余逐字 ✔，`:72` 至首个「。」前缀 **相等** ✔，`:76` 整行 **相等** ✔；`rg -c '/turn' e2e-scenarios.md` = **0** ✔ → 引文区不再含 `/turn` |

**N1–N4 全部清除。** 先前 FAIL `3f3a2e4`（@ `626e060`）由本审 **取代**（历史正文保留不擦除）。

## 3. B1–B5 复核（仍成立）

| # | 判定 | 核验 |
|---|------|------|
| **B1** `/turn` 靶 · 不打死 `/answer` | 成立 | controller `:30-33` `@Post(':id/turn')` `@HttpCode(202)` `ZodValidationPipe(TurnDto)`；`:242-245` `/answer` `@HttpCode(GONE)` 无 `@Body`；service `:913-914` 无条件 410 `legacy_answer_endpoint_disabled`；harness `:117`/`:165` Ban 靶 `/answer`；`/answers` 须钉 `MEETWISE_PUBLIC_PREVIEW` 且不混写（`:111`/`:117`） |
| **B2** V3 只走 resume · JD absent | 成立 | `:119` V3 仅 `POST /resume`；`contracts:24` `UploadResumeDto = z.object({ text })` 非 strict（剥离多余键）；quiz/JD 文本 ingress 登记 absent，未发明 |
| **B3** 逐 V 钉码 | 成立（V4 由 N2 补齐） | V1 400 `invalid` · V2 202 + 1 answer job · V3 strip+accept · V4 400 / 409 `interview_not_active` · LEDGER-SNAP 统一 |
| **B4** 正控 / 变异 / seed 披露 | 成立 | `:125` 正控 202 + 恰 1 job；`:126` 去 `.strict()` 变异 V1 转红（temp · 不提交）；`:127` V4 seed 披露；`:128` 新增守卫自检；`:89` 问题行 seeded 披露（`persistInterviewQuestion` · `interview-question.ts:42`；`claimInterviewAnswer` `:69-96` 无行 → `not_ready`）；`:111` `answerHash` 按 `interview-question.ts:37-39` SHA-256 重算 |
| **B5** NEG/BOUND 回归 | 成立（N3 补齐） | `:133` 执行后强制 neg/bound EXIT0、零 proof/收据改动（Y 26 · AB `f8cdc82` 17）；env-blocked / L0-guard 时 **B5 未满足 → ADV ≠ EXIT0** |

## 4. 非阻断（执行收据时落实 · 不影响本 PASS）

- **S1 · 简写口径**：slice `:12`/`:42`、两 stub B5 条与 commit message 写成「docker.sock / Key L0 = env-blocked」的合并简写；以 harness `:135-136` 的分列（`env-blocked`=docker.sock · `L0-guard`=MODEL_API_KEY）为准。执行收据必须按 harness 分列记录原因（与 rag C3「L0 Key 断言 ≠ docker runner 失败」一致），不得合称 L0。
- **S2 · 引文标注**：fenced 区为便于定位加了 `:NN` 行号前缀，且 `:58/:61` 去掉了列表前导缩进；内容逐字，不构成误引。
- **S3 · bucket 断言**：V4「bucket `units_reserved` −1 / `units_consumed` +1」默认单桶分配；fixture 应只种一个桶，或按 `allocations` 求和断言。
- **S4 · 额度 seed 披露**：begin 需可用 `entitlement_bucket`（`commerce.ts:59-65`）；该额度若离线种入，同样标注 seeded（同 Y/AB 先例）。
- **S5 · V3 实测码**：`:119`「2xx 依现实现」执行时落为具体码 + 剥离后落库字段（rag C5）。

## 5. 范围 · Ban-live · Ban wash

- SCOPE 仅 UC-001 ADV（`:12` Row · `:152` ADV stays blind/`case-only`）；018/052/025 只出现在 Ban 行（`:12`/`:155`/`:161`）✔。
- Ban wash Y/AB：`:153` Y `GAP-UC001-NEG-01` / AB `GAP-UC001-BOUND-01` 不动不洗；B5 只读跑回归 ✔。NEG/BOUND 证据未冒充 ADV ✔。
- Ban live / fake-model：不加载 Key、不主张模型层防御、评分 Key-blocked ✔。GuardrailHit absent（V5）✔。
- Ban invent covered：EXIT0 ≠ covered · coveredCount=8 ✔。

## 6. Peer · 边界

- **peer = `mw-rag-route`**：origin 上 rag 最新裁决为 `2fadf2b` **Re-PRE PASS @ `626e060`**（附 C1–C5），其基线写的是 `626e060` 而非 `4e9f568`。`4e9f568` 的改动（N1–N4）覆盖 rag C1/C3/C4 方向，但 rag 是否认可 `4e9f568` 须由 rag 自己或协调方确认；**本审不代签**。alone ≠ dual。
- PASS ≠ coding ≠ AUTHORIZE ≠ prove ≠ covered ≠ nail ≠ HA。Ban coding 直至 dual 两半均 PASS 且协调方 AUTHORIZE。

## 7. Pins（保持不变）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-E2E-001 ADV 维持 **blind/`case-only`**

## 中文摘要

1. REQUEST `4e9f568` 只改文档，代码锚点相对 `626e060` 与当前 origin tip 均零漂移；我逐条对照源码独立核对，未采信协调方转述。
2. **N1 清除**：账本快照与 V4 seed 全部改为 `entitlement_consumption`（+ bucket units + `commerce_outbox`），加了「恰好 1 行 + 状态符合」非空转守卫及守卫自检变异；旧表 `consumption_record` 在 API/DB 源码 0 引用、被 Ban。
3. **N2 清除**：V4 fixture 离线调用产品函数 `completeInterviewAndConfirm`（interview `completed` + confirmed 同事务），replay 钉死 V1 → 400 `invalid`、V2 族 → 409 `interview_not_active`，job delta 0、账本逐字节不变；守卫顺序经源码确认（pipe 先于 service，`assertAnswerable` 先于 claim/enqueue）。
4. **N3 清除**：docker.sock（`env-blocked`）与 `MODEL_API_KEY`（Ban-live `L0-guard`）分开写、各有出处；二者 ≠ 回归证据 ≠ 通过 ≠ flake；**B5 未满足 → ADV ≠ EXIT0**，授权后须 ENV-capable EXIT0 且零 proof 改动。slice/stub 的合并简写为非阻断 S1。
5. **N4 清除**：引文区逐字（逐字节比对通过），SSOT 全文 `/turn` = 0，`/turn` 事实移入读码观察并附 SSOT↔代码漂移注记。
6. B1–B5 仍成立。先前 FAIL `3f3a2e4` 被本审取代（正文保留）。本审 e2e 半边 PASS；peer rag 的 PASS 写的是 `626e060`，对 `4e9f568` 须 rag/协调方确认，不代签。PASS ≠ coding ≠ AUTHORIZE ≠ covered ≠ HA。

Verdict: PASS
