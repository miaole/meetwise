# Harness — **NHP 批 A · §1.0 盲区三行缺列隔离收据 REQUEST**（Line NHP-A · **`closed`**〔2026-10-26 §9-post 会签翻面 · 原值 `executed:awaiting_post_prove_dual` 史录见 §8/§9-post〕· EXIT0≠covered）

**Status**: **`closed`**（2026-10-26 post 双审会签对账翻面 · 一行依据=席1 scoped FAIL 处方勘误落卷解销+席2 PASS 三门独立复跑 73/73·67/67·49/49+9 红零冲销+协调方裁定 digest 链机械核通过〔§9-post 在卷〕· 卷 closed ≠ 矩阵行/SSOT 翻面〔coveredCount=8 零动 · 行翻面权归协调方〕· 原 `executed:awaiting_post_prove_dual` 史录 provenance 见 §8/§9-EXEC 不回改 · alone ≠ dual）· **STOP=closed（三处钉：本 Status 行 + §2 门矩阵 + §8）** · 运行门已行使（§9-EXEC 三 case 全绿 73/73·67/67·49/49 + §9-post 席2 第三 fresh 独立复跑全绿）· 前值 `draft:awaiting_pre_exec_dual` 史录保留于 §8/卷尾注 · Ban self-approve · 并线 PR 走 main
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-26
**Base / parent tip**: `origin/main` **`47dd6be56`**（full `47dd6be56d5f3b59ccf5dc0c827b0bdc2e6952de` · `git fetch origin` 本 turn 成功 · 写前复核 tip 未前进）
**Worktree**: `meetwise-nhp-a`（仓根同级 worktree · branch `line/nhp-batch-a-draft`）
**Batch**: 队列 `REMAINING-NORTH-STAR-QUEUE.md` Phase 2 item 12「remaining NHP rows one-knife-one-row · highly parallel」本席批 A = **矩阵 §1.0.1 盲区行按 NEG+FAULT+BOUND+ADV 缺列数降序、无阻塞、已闭行跳过，取前三行**；**一行一 case · 一行一隔离收据**（三 case 可并行分执行，互不替代）：

| # | §1.0.1 行号 | 行（用例名） | 本批 case | 补列（本刀主面） | 行内其余缺列（本刀不动 · 留痕） |
|---|-------------|--------------|-----------|------------------|--------------------------------|
| 1 | **`:118`** | **UC-E2E-012 / 024**（题级降级 / 补评闭环） | **`NHP-012-FAULT-01`** | **FAULT**（单题评估失败→图级降级 + 题级落点） | NEG=gap · BOUND=gap · ADV=blind（补评状态机产品未接线 · §1.2-D1 · 先接线后 prove） |
| 2 | **`:114`** | **UC-E2E-003**（i18n / locale 结构面） | **`NHP-003-ADV-01`** | **ADV**（对抗错误信封 / 伪造 locale → 映射层 fail-closed） | NEG=gap（N-臂仅对照 · 列不翻）· FAULT=blind（静态管道故障面薄 · 留后刀） |
| 3 | **`:128`** | **UC-E2E-030**（时钟漂移 / token 刷新） | **`NHP-030-FAULT-01`** | **FAULT**（过期触发链路：reclaim sweep 口 vs 显式 abandon 口 · 同原语收敛 · 双触发幂等） | ADV=blind（neg:auth/authz-harden 旁证族已密 · 新 case wash 风险 → 留后刀） |

**Gap ids**: `GAP-UC012-FAULT-01` · `GAP-UC003-ADV-01` · `GAP-UC030-FAULT-01`（本批具名认领 · 授权后执行方 grep 复核零既有钉）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual · 三行均非隐私域（断言面=终态/事件/映射文案/触发链一致性，非 PII 擦除/导出/checkpoint）→ 不换 privacy-int · 零模型质量断言 → 不换 model-op）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT 翻行 · Ban coding · Ban live · Ban fake-green suite

---

## 选刀（§1.0 盲区行全集排序 · 诚实留痕）

排序规则：**NEG+FAULT+BOUND+ADV 四列缺最多（gap/blind 计缺 · partial/具名 case 证据已落计不缺）且无阻塞 · 已闭行跳过**。全集 `e2e-requirement-coverage-matrix.md:108-140`（blob `0cf6ae18`）逐行：

| §1.0.1 行号 | 行 | 四列 | 缺数 | 裁定 |
|-------------|----|------|------|------|
| `:112` | UC-001 | NEG/BOUND/ADV blind/case-only + FAULT partial · **四面具名证据均已落**（Line Y/AB/AG/AI） | 0 | 已闭（case 面）跳过 |
| `:113` | UC-002 | partial/partial/partial + ADV 钉（Line R） | 0 | 已闭跳过 |
| **`:114`** | **UC-003** | gap / blind / partial(key parity) / blind | **3** | **取 #2** |
| `:115` | UC-004 | gap/gap/gap/blind 字面 4 · 但 FAULT 钉已落（Line P/T `uc004:career-path-fault:prove` EXIT=0）且队列 item 9 专属 | — | 他项认领跳过 |
| `:116` | UC-010 | partial/partial/partial/blind | 1 | 留后刀 |
| `:117` | UC-011 | ADV `GAP-UC011-ADV-01` **CLOSED（wired · Line V）** | 0 | 已闭跳过 |
| **`:118`** | **UC-012/024** | gap / gap / gap / blind | **4** | **取 #1** |
| `:119` | UC-014/026 | ADV 七类钉（Line K）已落 | 0 | 已闭跳过 |
| `:120` | UC-015 | partial/partial/partial/blind | 1 | 留后刀 |
| `:121` | UC-016/029 | Line Y2 FAULT 钉已落 · 行已被 Y2 认领 | — | 本线族占用跳过 |
| `:122` | UC-017 | partial/partial/partial/blind（LOAD 已钉 Line Y） | 1 | 留后刀 |
| `:123` | UC-018 | 多面钉（ADV/BOUND/PERF/LOAD/FAULT） | 0 | 已闭跳过 |
| `:124` | UC-019 | partial/partial/partial/blind | 1 | 留后刀 |
| `:125` | UC-025 | 五面钉（B''/W/AA/W-isolated/AK） | 0 | 已闭跳过 |
| `:126` | UC-027 | 产品未接线 / blocked | — | 阻塞跳过 |
| `:127` | UC-028 | Line X FAULT 钉已落 · Y2 排除清单占用 | — | 占用跳过 |
| **`:128`** | **UC-030** | partial / gap / case-only(BOUND 已注册) / blind | **2** | **取 #3** |
| `:129` | UC-031/032 | gap/blind/blind/gap(e2e) · 质量断言归 ai-eval · **禁 fake-model 冒充** · G7/Key 邻域（Y2 落选先例） | — | 阻塞跳过 |
| `:130` | UC-033 | partial/partial/partial/partial | 0 | 不缺 |
| `:131` | UC-040–043 | gap/gap/gap/blind 字面 4 · 批/CAS/载重=静态 G-GAP 接线未证 → 先接线后 prove（Y2 落选先例） | — | 阻塞跳过 |
| `:132` | UC-050–052 | 隐私域 + Phase 3 DELETE freeze | — | 出域跳过 |
| `:133` | NEG-AUTH/NEG-* | FAULT=gap + ADV=blind = 2 · **家族聚合行非单 UC 行**，one-knife-one-row 形不合 | — | 落选（§1.3） |
| `:134` | PRIVACY-HTTP | FAULT/BOUND/ADV 缺 3 · Phase 3 freeze | — | 出域跳过 |
| `:135` | GAP-RAG-01…05 | Phase 4 专属（GAP-RAG-02/05） | — | 他项认领跳过 |
| `:136`–`:139` | UI-PAY / CLOUD-KILL / HA-RTO / TC-CLOUD | out-of-scope / blocked / blocked / blocked | — | 阻塞/出域跳过 |
| `:140` | PLATFORM-STATIC / MW-STACK-* | n/a×4（n/a≠已满足 · 非 UC 盲区行） | — | 不适用 |

**结论**：`UC-012/024`（4 缺）> `UC-003`（3 缺）> `UC-030`（2 缺）为无阻塞前三行。

---

## §0 锚（blob 亲算 · 本席 `git rev-parse 47dd6be56:<path>` 逐条亲算 · 非 {转抄}）

### §0.1 行锚（矩阵/需求源/队列）

| 锚 | blob SHA-1 @`47dd6be56` | 钉位 |
|----|--------------------------|------|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae184d41f11ea2cc8e7906b0f10ad7f5fad8` | §1.0.1 `:114` `:118` `:128` |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c38208b34bb13f2ceab3d22f9265e9f7b1` | UC-012 `:261` · UC-024 `:274` · UC-003 `:101` · UC-030 `:373` |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `bbbe217dc51415e11d6c5465a6fef381a5a663fa` | NHP-040-BOUND-01 `:105`（对照 · 本批不碰） |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `87c812d988622abb1d9675be60857b1fd37b55f7` | Phase 2 item 12 |

### §0.2 码面锚（产品缝 · 按 case 分列）

**Row 1 · UC-012/024（NHP-012-FAULT-01）**

| 锚 | blob SHA-1 | 钉位（symbol 级 · 位移按 symbol 重钉） |
|----|------------|----------------------------------------|
| `apps/worker/src/adaptive-lifecycle.ts` | `db96efec972f6a2f903a256303c6591afbb57ee4` | `:490` `const unscored = last.outcome === 'unscored'` · `:523/:532` `appendEvent(... 'answer_unscored' ...)` · 幂等键 `answer_unscored:${input.questionId}`（`:526/:535` event_key）· `:536-537` unscored 臂 `question_ready` 同事务推进 |
| `apps/worker/test/adaptive-degrade.proof.ts` | `1ddaae0d356bd07a8125032f076c3c037a454fc9` | 既有旁证：出题失败不抛 + 评分失败 `unscored+reason` 服务形（**零改动** · 互不替代） |
| `packages/db/migrations/0192_interview_event_created_at_kind_check.sql` | `27b4c39ddd67a87a2868d9796d7f15a13e0355d1` | `answer_unscored` ∈ interview_event kind check（事件面真实存在） |
| 旁证族（零改动） | — | `ag-f-reroll.proof.ts` 投影序断言 · `bill2-shadow-meter.proof.ts` 事件剖面 · 均属他刀具名面，**非 UC-012 具名 case** |

**Row 2 · UC-003（NHP-003-ADV-01）**

| 锚 | blob SHA-1 | 钉位 |
|----|------------|------|
| `apps/web/lib/resume/ocr-preview-ui.ts` | `2aa3bdb3a85bc357986a728f751b3e1029e5573a` | `:123` `readResumeUploadErrorCode`（transcript 形字段忽略 · 空/非对象→`upload_failed`）· `:129` `mapResumeUploadError` · `:133` `messages[error] ?? messages.upload_failed`（未知码 fail-closed 回退）· `:68-70` `locale === 'en' ? EN : ZH`（二值 allowlist） |
| `apps/web/i18n/request.ts` | `df8e06c12c3982cf5bee4bfcf8eda03efd3f4812` | `:6` `DEFAULT_LOCALE='zh'` · `:11` cookie allowlist `includes` 守卫 → 伪造 locale 一律回退默认 |
| `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `8c3cfd4f039098aca8d956d4d3f199b5c66dd98c` | 既有 S1–S6 静态锚（en key parity/CJK-free · **零改动**）——新 case = **运行级对抗行使**，非静态重铺 |

**Row 3 · UC-030（NHP-030-FAULT-01）**

| 锚 | blob SHA-1 | 钉位 |
|----|------------|------|
| `packages/domain/src/auth.ts` | `697da7dc3cb231812a051274ca6e967ec5f16879` | `:69` `signToken(uid, secret, ttlSec, nowSec, …)`（nowSec 由服务端注入）· `:86` `verifyTokenFull(token, secret, nowSec)` · `:95` `p.exp < nowSec → null`（**过期判定只对服务端时钟实参** · 无客户端时间入参） |
| `apps/api/src/platform/auth-session.ts` | `ad1004e763fde586a8ae75d8bf913ab5955163c8` | `:19` `SESSION_TTL_SEC=7d` · `revokeSession` UPDATE+pg_notify 同事务 · `isSessionActive` fail-closed |
| `apps/api/src/platform/principal.guard.ts` | `50b38bc582a081bf2beb6b007a060688ee5734d5` | 守卫链 `invalid_token → reserved_principal → account_inactive → session_revoked(代次) → session_revoked(jti)` · `Date.now()` 服务端钟 |
| `apps/worker/src/commerce-reconcile.ts` | `73772ac228ae4f3153397923052d54bc6b95023b` | `:75` reclaim 路径 `abandonInterviewAndRelease` · `:81` `UPDATE … status='abandoned' … AND status NOT IN ('completed','abandoned','failed')`（CAS 守卫 · 不复活终态）· `:89` `interview_unavailable` 补发（无静默死胡同） |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15a4c15b8fd61c1553f636d7e251240b8c`（补算 @`47dd6be56` 亲算 · 执行方开工 tip 复算句保留） | `:649-658` 显式 abandon 口 → 同一 `abandonInterviewAndRelease`（`FOR UPDATE` + 条件状态 CAS） |
| `apps/api/test/neg-auth.proof.ts` | `1dd9cd0a92181da1191cc38a797c624c57ae810a` | 既有旁证：令牌过期/吊销负例（partial · 零改动 · 互不替代） |

---

## §1 修法（三行各补缺列隔离收据 · 一行一 case · 零 invent covered · 零 live key）

**修法形状**（沿 Line Y2/K/X 先例）：每行一个具名 NHP case = 新 proof 文件 + script 注册 + runner 注册（**prove-only · 零产品码改动** · `apps/*/src`/`packages/*/src` 零 diff 意向）；isolated 真 PG / 纯函数行使 · **零 live 模型 · 零 MODEL_API_KEY · 零外呼**（`env -u` 三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）；收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行状态/列状态**一字不动**：EXIT0=case≠covered，升格仅经 coordinator nail 的 additive honesty；coveredCount=8 不变。

### Row 1 · `NHP-012-FAULT-01`（UC-012/024 · FAULT 分面）

- **需求源**：`e2e-scenarios.md:261/:274` — E2 单题不可恢复失败 → 标题级状态 + 图级降级提示，**面试可继续**；A1 单题失败不中断整场 · A3 题级落点非静默丢弃；UC-024 补评闭环（幂等键 `(interviewId,questionId)` → 重算 CAS）。
- **既有 prove（旁证 · 零改动互不替代）**：`prove:adaptive-degrade`（服务形失败降级）· `ag-f-reroll`/`bill2-shadow-meter`（他刀具名面）· `full.e2e` 终态旁证。**UC-012/024 行零具名 NHP case**（§1.0.1 `:118` 全四列缺 · NHP 矩阵无 012 行登记）。
- **注入合同**：isolated 真 PG（migrations 齐跑）· 真产品路径造数（begin → adaptive 消费循环 · Ban 裸 INSERT 绕产品路径）· 评分缝 = scripted 注入（`scriptedModelClient` · 三形：`kind:'deterministic'`（或 schema-invalid）/ throw / `externalOutcome:'unknown'` · 参数冻结入 receipt）· **F1↔F2 reason 级互斥**：throw≡unknown（`invoke.ts:1024` catch 收敛 `externalOutcome:'unknown'` → 服务面统一走 `adaptive-interview-service.ts:843` `evaluation_${out.error}`）故 **F1 禁 throw 形**——F1 改 `kind:'deterministic'`（或 schema-invalid）形，其 reason=`evaluation_<deterministic 码>` ≠ F2 的 `evaluation_external_outcome_unknown`，两臂 reason 级可分。
- **case 臂**：PC = scripted 成功模型全绿（对照缺失=Ban 假绿）+ **F4b**（completed 口径仅 unscored=0 · `adaptive-lifecycle.ts:642` `unscored === 0` 谓词 · completed-eligible 断言归本对照臂行使）；F1 = 单题评估 deterministic 码失败（`kind:'deterministic'` 或 schema-invalid 形）→ `answer_unscored` 事件**恰一**落点（event_key=`answer_unscored:<questionId>`）+ 下一题 `question_ready` 同事务推进（图不中断）；F2 = 外部结果未知（throw / `externalOutcome:'unknown'` 两形收敛同一 reason）→ `unscored` + **断言钉 payload.reason=`evaluation_external_outcome_unknown` 非 kind**，零伪造分数；F3 = 二次 drain 不重发 `answer_unscored`（幂等键守卫）；F4a = 混合 unscored conclude → `failed` + 额度 release + `assessment_unavailable`（payload.reason=`evaluation_unscored` · event_key=`assessment_unavailable:evaluation_unscored`）事件**恰一** · 终态不悬挂；N1–N3 = 额度净账审计（失败不扣不退错）。
- **F4 拆臂产品法依据**：`adaptive-lifecycle.ts:632`（收尾计数查询闭合 · unscored/eligible 分记）· `:638-641`（AG-F 边界注记 · 三分支谓词零位移）· `:670-676`（fail 臂入口）+ `0046_application_assessment_recovery.sql:130` 触发器 `interview_completion_requires_all_answers_scored`。`:640-641` 注记原文照抄——在 DB 层钉死「answer_unscored 事件在场 ⇒ 禁 completed」结算完整性法（历史迁移零字节 Ban）。「混合面 completed+照计」需放松 0046=计费结算语义,归 billing rev 战役,本刀如实登记不越界。
- **缺列形状（本刀不动）**：UC-024 补评闭环（后台补评 job→evaluated→CAS 重算）产品未接线（全仓 grep `pending_eval`/`eval_failed`/`AnswerEval` 产品面零命中）→ NEG/BOUND/ADV **先接线后 prove · 留另刀**。

### Row 2 · `NHP-003-ADV-01`（UC-003 · ADV 分面）

- **需求源**：`e2e-scenarios.md:101` — A2 后端校验错误以 en 文案呈现（错误码→i18n 映射断言）；A1 无中文残留（静态 · 既有 S 锚已铺）。TC-E2E-003-ui-en。
- **既有 prove（旁证 · 零改动）**：`prove:uc003-i18n-locale`（S1–S6 **静态** key parity/CJK-free → BOUND=partial 旁证）。**运行级对抗行使 = 零覆盖**（ADV=blind · NEG=gap）。
- **case 臂（纯函数行使 · 零 PG 零外呼）**：PC = 已知码 + `locale='en'` → en 文案（CJK-free · A2 真行使）；N1 = 已知码 + zh → zh 文案（对照）；V1 = 未知错误码 → `upload_failed` 回退（`:133` fail-closed · 不发明文案 · **键域排除原型链族** `toString`/`constructor`/`__proto__`——该族**预登记**：已知疑似产品缺陷（映射层 `messages[error]` 无 own-property 守卫 · 建议 null-prototype 或 hasOwnProperty）→ 执行中实证即 EXIT1/backlog · 防假绿）；V2 = 伪造 locale 值（`'EN'`/`'fr'`/路径形/超长）→ 一律 zh 臂（二值 allowlist · `request.ts:11` 同契约）；V3 = 对抗信封（非对象 / 空 error / 空白 error / transcript 形字段注入）→ 仅取机器码 · `upload_failed` 兜底 · **零 transcript 字段发明**；V4 = `413` → `file_too_large` 映射（状态码优先臂）。
- **缺列形状（本刀不动）**：FAULT=blind（静态管道资源完整性故障面薄 · 归 BOUND key parity 旁证 · 留后刀）；NEG 列不因 N-臂翻动（N-臂仅对照 · 升格归 nail 裁）。

### Row 3 · `NHP-030-FAULT-01`（UC-030 · FAULT 分面）

- **需求源**：`e2e-scenarios.md:373` — E1 超会话 TTL 一致 abandoned（两触发路径结果相同）；TC-E2E-030-expire-lazy-vs-sweeper；后置「过期 → abandoned（释放额度 · 接 UC-018）」。
- **既有 prove（旁证 · 零改动互不替代）**：`neg:auth`（令牌过期/吊销负例 partial）· `uc017:orphan`（sweeper O 系 · 预占面）· `uc018:*`（abandon 家族）· NHP-030-BOUND-01（case-only · 时钟漂移边界）。**双触发路径一致性 + 双触发幂等 + 额度恰一次释放 = 零覆盖**（FAULT=gap）。
- **case 臂**：isolated 真 PG；F1 = reclaim sweep 口（`commerce-reconcile` 路径）触发 → `abandoned` + 额度 released + `interview_unavailable` 补发；F2 = 显式 abandon 口（`interview.service` 路径）→ 同终态同原语（`abandonInterviewAndRelease`）；F3 = F1 后再走 F2（反之亦然）→ 无第二副作用（无二次 release · 无终态复活 · 事件恰一）· **观测形状**：F2-after-F1 → HTTP 200 `{alreadyAbandoned:true, released:'noop'}`（`interview.service.ts:659` 响应映射 · `commerce.ts:522/:542` already_abandoned→released=`'noop'`）；守卫机制 = sweep 选择谓词非同一 CAS（`commerce-reconcile.ts:81` 软置谓词 `status NOT IN ('completed','abandoned','failed')` ≠ `abandonInterviewAndRelease` 内 `status IN ('created','waiting_user')` CAS）；F4 = 未过期对照（active 不受 sweep 误伤）；F5 = 过期/吊销令牌 401 短回归（`verifyTokenFull` 服务端钟实参 · 仅作触发链 sanity · **Ban 代替 neg:auth 全家**）；N1–N2 = 额度净账（恰一次 release · ledger 逐字）。
- **缺列形状（本刀不动）**：ADV=blind（签名/时间篡改对抗面与 neg:auth/authz-harden 旁证族重叠 · 新 case wash 风险 → 留后刀）；E2 静默 refresh（D2 · NOT claimed）。

---

## §1.3 否决（veto · 落选行诚实留痕 · 与选刀表互补的边界裁量）

| 落选项 | 否决理由（不可并行认领/本批不取） |
|--------|----------------------------------|
| UC-004（`:115` · 字面 4 缺） | FAULT 钉已落（Line P/T）且队列 item 9 专属认领（「UC-004 FAULT/A3 gap」）；批 A 不越项。 |
| UC-016/029（`:121`） | Line Y2 已认领并落 FAULT 钉；行占用。 |
| UC-027（`:126`） | 产品未接线（申诉口不存在）· **blocked**。 |
| UC-028（`:127`） | Line X FAULT 钉已落 · Y2 排除清单占用；余缺列（NEG/BOUND/ADV）留后刀（trace 域另裁）。 |
| UC-031/032（`:129`） | 质量断言归 ai-eval · **禁 fake-model 冒充安全闭环** · guardrail 接线证据弱 · G7/Key 邻域 → **阻塞**。 |
| UC-040–043（`:131` · 字面 4 缺） | 席位 CAS/批 partial_failed = 静态 G-GAP（接线未证）→ **先接线后 prove**（Y2 落选先例）→ **阻塞**。 |
| UC-050–052（`:132`）/ PRIVACY-HTTP（`:134`） | 隐私域（须换 privacy-int）+ Phase 3「DELETE=503 freeze」出域。 |
| NEG-AUTH/NEG-*（`:133`） | 缺数同为 2 但为**家族聚合行**（非单 UC），one-knife-one-row 无单一 case 收口形 → 落选（其 FAULT/ADV 留家族线）。 |
| UC-010/015/017/019（各 1 缺 · ADV=blind） | 缺数少于前三行；且 ADV 面各自与既有旁证族重叠度高（wash 风险），留后刀独立裁量。 |
| UI-PAY / CLOUD-KILL / HA-RTO / TC-CLOUD（`:136-139`） | out-of-scope / 云授权 blocked / Ban buy cloud。 |
| GAP-RAG-01…05（`:135`） | Phase 4 专属（GAP-RAG-02 fixture · GAP-RAG-05 late）。 |

---

## §2 门矩阵（per-row · pre-dual → prove → post-dual · **Status：`closed`**〔2026-10-26 §9-post 会签翻面 · 原值 `executed:awaiting_post_prove_dual` 史录留痕不回改〕· prove 已行使 · post-dual 双审会签落卷）

| Row | case / prove 命令（授权后注册） | 证据层 | pre-dual stubs | post-dual stubs | 断言面（数） |
|-----|----------------------------------|--------|----------------|-----------------|--------------|
| 1 | `pnpm uc012:nhp-fault:prove` → `apps/worker/test/uc-e2e-012-nhp-fault.proof.ts` | isolated 真 PG + scripted 注入（`env -u` 三键具名 §1） | mw-e2e-ha + mw-rag-route | 同左 BOTH PASS | PC(含F4b)+F1–F3+F4a+N1–N3 |
| 2 | `pnpm uc003:nhp-adv:prove` → `apps/web/test/uc-e2e-003-nhp-adv.proof.ts` | 纯函数行使（零 PG · 零外呼 · 零 key） | 同上 | 同上 BOTH PASS | PC+N1+V1–V4 |
| 3 | `pnpm uc030:nhp-fault:prove` → `apps/api/test/uc-e2e-030-nhp-fault.proof.ts` | isolated 真 PG（双触发路径真产品口） | 同上 | 同上 BOTH PASS | F1–F5+N1–N2 |

**EXIT 契约**：EXIT0 = 各 case 全臂绿 + attempts 全记录 + 收据落盘 = **具名 case 真证据 · EXIT0 ≠ covered ≠ suite green ≠ 行/列升格**（升格仅经 coordinator nail additive honesty）· §1.0.1 `:114/:118/:128` 措辞不动 · coveredCount=8 不变 · ≠HA。EXIT1 = 诚实保留（产品缺陷：死胡同/双扣/终态复活/映射发明文案/终态口径悬挂任一被实证）→ 保留 gap + 缺陷登记 backlog + **Ban retry-to-green · Ban 改断言迁就** · 修复另刀（Ban 借刀改 `adaptive-lifecycle.ts`/`ocr-preview-ui.ts`/`request.ts`/`auth-session.ts`/`commerce-reconcile.ts`）。

**G7 门**：无 G7 全量 CMD+EXIT 收据 → 本批禁止宣称 100% HA / 0 BUG / releaseEvidence=true；`g7SuiteGreen=false` 保持；trio OPEN 保持；本批零 live。

**三 case 可并行分执行**：互不替代、互不借用（Ban 互借关列）；任一 case 独立收口须独立 dual，不得以批名义合并宣称。

---

## §3 披露映射（诚实 · Ban 冒充字面）

| id | 披露 |
|----|------|
| **D1（Row 1）** | spec `AnswerEval=pending_eval`/`eval_failed` 题级状态机 ≙ 产品 `answer_unscored` interview_event（append-only · 幂等键 event_key）——**映射披露**；产品**无**独立 AnswerEval 表、**无**补评 backfill job、**无**重算 CAS 口（grep 零命中）。断言键全用产品真事件名 · **Ban 宣称字面 pending_eval 状态机/补评闭环已验**；UC-024 主流程（A1/A2/A3 补评后重算）= NOT claimed。 |
| **D2（Row 3）** | spec E1「lazy-on-access + 定时 sweeper」≙ 产品「显式 abandon 口 + commerce reconcile reclaim sweep 口 · 同一 `abandonInterviewAndRelease` 守卫原语」——**映射披露**；产品无字面 interview TTL lazy-on-access 判定口。spec E2「静默 refresh token 刷新」产品**未接线**（全仓零 refresh token 面）→ **NOT claimed**（§1.1「长会话刷新 E2E 缺」叙事保持）。 |
| **D3（Row 2）** | 本刀 ADV 面行使 `ocr-preview-ui.ts` 错误码映射层 + `request.ts` locale allowlist 契约；**零模型产出语言断言**（spec「模型产出语言跟随 locale」已移出 e2e → ai-eval · 禁 fake-model 冒充）；A1 DOM 中文残留扫描不重铺（既有 S 锚旁证 · Playwright 降次未接线照旧）。NEG 列不因 N-臂翻动；FAULT 列不动。 |

---

## Ban 列表

- Ban coding（产品码）· Ban prove 执行 · Ban push · Ban force-push · Ban live · Ban live default · Ban fake-green suite · Ban secrets / `.env*`
- Ban covered · Ban SSOT 翻行 · Ban invent covered · Ban invent 缺列闭合 · Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就
- Ban self-approve · Ban self-nail · Ban Meridian · Ban HA cloud buy · Ban 互借三 case 收据互关列 · Ban 批名义合并宣称
- Ban 碰已闭/占用行：UC-001/002/004/011/014/016/017-LOAD/018/025/028/052 及他线在办文件
- Ban 裸 INSERT 绕产品路径造数（Row 1/3）· Ban 真 live 模型冒充注入 · Ban 借收据宣 PERF/LOAD/SLO/容量/HA
- Ban 宣称 pending_eval 状态机/补评闭环已验（D1）· Ban 宣称 lazy-on-access/refresh token 字面口已验（D2）· Ban 模型语言质量断言（D3）

## Non-claims

Not a pass · not run · not covered · not live · not suite green · not PERF/LOAD · not production capacity · not SLO · not HA · alone ≠ dual · EXIT0 ≠ covered · 三行行状态与四列措辞零翻动 · 不宣称任何缺列已闭合（此为 REQUEST · prove 未跑 · 合同待授权后行使）。

---

## §8 STOP（本节为冻结声明 · 与文首 Status、§2 门矩阵构成 STOP=draft 三处）

**STOP**。本 REQUEST 终态 = **`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual` 史录保留零字洗 · 〔2026-10-26 §9-post 翻面：终态现值 **`closed`** · 本行史录值留痕不回改 · 三处钉=文首 Status/§2/§8〕）：

1. ~~docs REQUEST only——零产品码、零 proof 文件、零 script 注册随本 REQUEST 落库；授权前 Ban coding · Ban prove · Ban push。~~ 已由 pre-exec dual r2 双 PASS 放行解除：§9-EXEC 落卷=三 proof 文件 + script/runner 注册 + 门矩阵亲跑（零产品码意向面 `apps/*/src`/`packages/*/src` 零 diff 亲证）· ⛔push 不变。
2. alone ≠ dual——post-prove 双审两独立外席待派；本席不自批、不自 nail；已落收据=implementer pre-commit runs（**not evidence of record**）· EXIT0 ≠ covered。
3. 冻结面——三行行状态（`:118` gap · `:114` partial · `:128` partial）、coveredCount=8、releaseEvidence=false、DELETE=503、`g7SuiteGreen=false` 全部不动；任何翻动须经 coordinator nail 的 additive honesty，本 EXEC 不开启之。

STOP=executed · awaiting post-prove dual assignment · post-prove 双审通过前 Ban 宣称任何列闭合 · ⛔push。**〔2026-10-26 §9-post 翻面：STOP 终态 `closed`（席1 scoped FAIL 处方勘误落卷解销+席2 PASS 三门独立复跑+9 红零冲销+协调方裁定落卷 · 本行史录 append 保史不回改——史录值 `executed:awaiting_post_prove_dual` · 更早 `draft:awaiting_pre_exec_dual` 留痕各节钉）〕**

---

## §9-rev（pre-exec 双审席2 FAIL 回路修订 · rev 纯文面 · 零产品码 · 逐条落点）

**回路**：pre-exec 双审席2 FAIL（P1×1 + P2×2 + P3×4）→ 本席 rev 回路纯文面修订；断言强度只增不减；行状态/列状态/coveredCount=8/STOP 三处零翻动；Status 终态仍 **`draft:awaiting_pre_exec_dual`**（rev ≠ 授权 · 零执行零 prove）。

| # | 级 | 修订 | 落点 |
|---|----|------|------|
| R1 | **P1** | **F4 臂重写**：删「面试可达 `completed`」（原 completed 口径下 unscored 题不计分表述与产品收尾三分支相悖——混合 unscored 场 conclude 走 fail 臂非 completed 臂）。改 **F4a**（混合 unscored conclude→`failed`+额度 release+`assessment_unavailable:evaluation_unscored` 事件恰一·终态不悬挂）+**F4b**（completed 口径仅 unscored=0·归 PC 对照臂）。产品法依据：`adaptive-lifecycle.ts:632/:638-641/:670-676` + `0046_application_assessment_recovery.sql:130` 触发器 `interview_completion_requires_all_answers_scored`；照抄 `:640` 注记口径——在 DB 层钉死「answer_unscored 事件在场 ⇒ 禁 completed」结算完整性法（历史迁移零字节 Ban）。「混合面 completed+照计」需放松 0046=计费结算语义,归 billing rev 战役,本刀如实登记不越界。**放松 0046 归 billing rev 战役，本刀不越界**。 | §1 Row 1 **case 臂**（F4 一臂拆 F4a/F4b · F4b 并入 PC）+ 新增 **F4 拆臂产品法依据** bullet；§2 Row 1 断言面 `PC+F1–F4+N1–N3`→`PC(含F4b)+F1–F3+F4a+N1–N3` |
| R2 | **P2** | **注入合同**：F1 形改 `kind:'deterministic'`（或 schema-invalid）——throw≡unknown（`invoke.ts:1024` catch 把 throw 收敛 `externalOutcome:'unknown'` → 服务面 `adaptive-interview-service.ts:843` 统一 `evaluation_${out.error}`）故 F1 用 throw 形则与 F2 reason 级不可分；改后 F1 reason=`evaluation_<deterministic 码>` ≠ F2 reason，**reason 级互斥**。F2 断言钉 **payload.reason 非 kind**（两形收敛同一 reason `evaluation_external_outcome_unknown`）。 | §1 Row 1 **注入合同**（两形→三形 + F1 禁 throw 互斥声明）+ **case 臂** F1/F2 形与断言改写 |
| R3 | **P2** | **V1 键域**：排除原型链族 `toString`/`constructor`/`__proto__`（`messages[error]` 对该族命中原型链继承真值 → 回退断言失真）；该族**预登记**「已知疑似产品缺陷（映射层建议 null-prototype 或 hasOwnProperty 守卫）→ 执行中实证即 EXIT1/backlog」——防假绿（预登记=先声明后证伪通道，非放水）。 | §1 Row 2 **case 臂** V1 键域收窄 + 预登记句 |
| R4 | **P3** | **四件**：① event_key 行号 `:527`→`:526`（`adaptive-lifecycle.ts:526/:535` 亲证）；② `env -u` 三键具名 `MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`；③ `interview.service.ts` blob 补算 `a8ae0d15a4c15b8fd61c1553f636d7e251240b8c` @`47dd6be56`（保留执行方开工 tip 复算句）；④ Row 3 F3 写入观测形状（F2-after-F1→200 `{alreadyAbandoned:true, released:'noop'}` · 守卫机制=sweep 选择谓词非同一 CAS）。 | ① §0.2 Row 1 锚行 · ② §1 修法形状（§2 Row 1 证据层改指 §1 具名）· ③ §0.2 Row 3 锚行 · ④ §1 Row 3 **case 臂** F3 |

**rev 自检**：R1 断言面变化为臂拆分，断言数不降（PC 增 F4b completed 口径断言 + F4a 事件面/额度/终态断言，较原 F4 单臂只增）；R2 使 F1/F2 断言由「同名 reason 双臂」变为可分辨双臂，强度增；R3 收窄键域且开预登记证伪通道；R4 全部为锚/口径精化。零产品码、零 proof、零 script 注册随本 rev 落库。

---

## §9-rev2（pre-exec 双审席2 守护清单七项 · rev2 纯文面补钉 · 零产品码 · 不动刀形）

**回路**：pre-exec 双审 r2 席2 双 PASS 放行，随放行携**守护清单七项**；本 §9-rev2 系协调方授权 EXEC 落码前的文面补钉（append-only · 断言强度只增不减 · 行状态/列状态/coveredCount=8/STOP 三处零翻动 · 三 case 刀形零改）。行号锚均 EXEC 席开工 tip `e4589b57f`（merge origin/main `ea0fa0a0a`）亲证重钉；符号级位移按 §0.2「位移按 symbol 重钉」条款处理并承登。

| # | 级 | 守护 | 落点（EXEC 行使面） |
|---|----|------|---------------------|
| ① | P1 | **壳行状态限 `'created'`**（`ag-f-reroll.proof.ts:105` `insertInterview` 先例：`INSERT … status='created'`）；**Ban `'active'` 壳直冲 conclude/abandon**——fail CAS `commerce.ts:423` `status IN ('created','waiting_user','migrating','paused')` 与 abandon CAS `commerce.ts:534` `status IN ('created','waiting_user')` **均不含 `'active'`**（`'active'` 壳走此两口必落 conflict/soft-set 臂而非主臂，断言失真）。Row 1/3 一切手插 interview 壳行状态一律 `'created'`（`'waiting_user'` 仅限沿 `uc-e2e-018-ttl-sweeper-abandon.proof.ts` T1 先例的既有形状且必须申明）。 | Row 1/3 proof 夹具段 + 收据 PIN |
| ② | P1 | **夹具豁免清单具名**（Ban 裸 INSERT 绕产品路径 的唯一例外面，逐项申明入收据）：(a) **bucket 种子** `INSERT INTO entitlement_bucket …`（`uc-e2e-018-ttl-sweeper-abandon.proof.ts:56-61` seedOwner 先例）；(b) **lease 回拨 UPDATE** `UPDATE entitlement_consumption SET lease_expires_at = now() - interval '…'`（同文件 `:62-66` expireLease 先例）；(c) **ai_graph_run 行** INSERT（同文件 `:68-74` insertGraphRun 先例，仅 T2 形对比臂需要时）；(d) **interview 壳行**（`'created'` 态·见①）。豁免外一切造数必经产品路径（begin/reserve/claim/enqueue/drain 家族）。 | Row 1/3 proof 夹具段 + 收据 PIN（逐项具名） |
| ③ | P1 | **Row 3 保持 `per_session` 缺省计费形**：Ban `per_topic_capped`+Σ>0 进 F3 leg——该形下 `settleOrReleaseForTerminal` 走部分结算语义，F2-after-F1 的 oracle 由 `already_abandoned → released='noop'`（`interview.service.ts:659` 响应映射 · `commerce.ts:522/:542` already_abandoned→noop）漂移为 409 conflict（billing P3 部分结算臂），F3 观测形状断言失真。全 case 不设 `billing_cap_units`/topic 计费行，沿缺省 `per_session` 全额语义。 | Row 3 proof 夹具段（零计费行断言）+ 收据 PIN |
| ④ | P2 | **F1 注入钉非末题**：F1 deterministic 注入必须落在**非末题**（存在 next question）——F1 断言面=「`answer_unscored` 恰一 + 下一题 `question_ready` 同事务推进（图不中断）」，末题注入则无 next，断言面塌缩；**receipt 钉 `evaluation_deterministic_refusal` 字面**——`kind:'deterministic'` 形经 `invoke.ts`（known-not-executed 臂）收敛 outcome.error=`'deterministic_refusal'` → `adaptive-interview-service.ts:843` `evaluation_${out.error}` = `evaluation_deterministic_refusal`，与 F2 `evaluation_external_outcome_unknown` reason 级互斥的**字面证据入收据**。 | Row 1 proof F1 臂 + 收据 PIN |
| ⑤ | P2 | **PC 臂 scripted client 覆盖全部图服务键**：`'planner.competencies'` / `'interviewer.ask'` / `'mock-interview.evaluate'` 三键全脚本化——`model-client.ts:164-165` 对未脚本化 service 默认返回 `{ok:false, kind:'deterministic'}`（确定性拒答），漏键=PC 臂暗中走失败臂，对照绿失真。PC 全绿前提=三键全 scripted（ask 多轮须轮进去重题面）。 | Row 1 proof PC 臂（三键显式枚举）+ 收据 PIN |
| ⑥ | P1 | **Ban wash Row 3 收据入 UC-018/UC-017 列**：`NHP-030-FAULT-01` 收据只关 UC-030 行 FAULT 缺列；UC-018（abandon 家族多面钉·已闭）与 UC-017（LOAD Line Y 钉）列**零翻动零借用**——双触发路径一致性是 UC-030 行的独立新证据，不得以「同原语」宣称 UC-018/017 任何列闭合或加强。 | Row 3 proof Non-claims 段 + 收据 PIN |
| ⑦ | P3 | **文面三件**：N1 §2 门矩阵 Row 2 断言面转写按 §1 原文（`PC+N1+V1–V4`·V 臂含 413 状态码优先臂），矩阵旁证单列 `NHP-030-BOUND-01`（case-only · 本批不碰）；N2 F4（拆臂后 F4a）产品法钉域收窄为 `adaptive-lifecycle.ts:672-679`（fail 臂入口 `:676` failInterviewAndRelease + `:679` assessment_unavailable append）；N3 invoke 路径全称统一 `packages/ai-runtime/src/invoke.ts`（§1 修法形状内简写 `invoke.ts:1024` 同指）。 | 本文 §2/§1 文面 + EXEC 收据引用形 |

**rev2 自检**：七项全为行使面守护与文面精化，断言强度只增不减；①②③约束夹具防失真，④⑤钉注入与对照臂证据字面，⑥防列 wash，⑦纯文面。零产品码、零 proof、零 script 注册随本 rev2 落库；三 case 刀形（§1 三行）与 §2 门矩阵 EXIT 契约零改。

---

## §9-EXEC（EXEC 落卷 · pre-exec dual r2 双 PASS 放行 · 2026-10-26 · 三行行使全绿 · 零产品码）

**授权面**：pre-exec 双审 r2 席1/席2 双 PASS（协调方授权落码+行使·colima 容器可用）· §9-rev2 七项守护随放行落钉（上文 append·落点全兑现）。本 EXEC 零产品码意向面：`apps/*/src`/`packages/*/src` 零 diff（收据 sourceDigests 内产品文件 sha256 与 merge tip 一致=只读旁证）。

**落地面**（commit 内 tracked 清单）：
1. **merge**：`origin/main` `ea0fa0a0a`（≥派单锚下限）并线 `e4589b57f`——同文件 additive 零冲突；§0 锚按开工 tip 亲证重钉（矩阵行 `:114/:118/:128` 行号届时树逐行亲证仍准 · blob 随树推进史录于 §9-rev2 头）。
2. **Row 1** `apps/worker/test/uc-e2e-012-nhp-fault.proof.ts`（worker · isolated 真 PG 全迁移链 · 真产品路径：resume 产品链→route 链→reserve→enqueue start/answer→drainInterviewJobOnce 消费循环）：PC 三键全绿对照+**F4b**（completed 口径 unscored=0 · `:642` 谓词臂）+F1（**非末题** deterministic 注入→`answer_unscored` 恰一·event_key 幂等键·下一题 `question_ready` 同事务推进·图不中断）+F2a/F2b（throw / `externalOutcome:'unknown'` 两形收敛 `evaluation_external_outcome_unknown` · 零伪造分数 · 与 F1 reason 级互斥）+F3（二次 drain 零重发）+F4a（混合 unscored conclude→`failed`+release+`assessment_unavailable:evaluation_unscored` 恰一·终态不悬挂）+N1-N3（额度净账）。**73/73 PASS · EXIT=0**。
3. **Row 2** `apps/web/test/uc-e2e-003-nhp-adv.proof.ts`（web · 纯函数行使·零 PG 零外呼零 key）：PC（20 已知码 en 全 CJK-free）+N1（zh 对照）+V1（未知码→`upload_failed` fail-closed·键域排除原型链族+预登记 PIN）+V2（伪造 locale 12 形一律落 zh + `request.ts` allowlist 静态钉）+V3（对抗信封 12 形→仅机器码·零 transcript 字段发明）+V4（413 状态码优先臂）。**67/67 PASS · EXIT=0**。
4. **Row 3** `apps/api/test/uc-e2e-030-nhp-fault.proof.ts`（api · isolated 真 PG + Nest createApp+listen(0)+fetch 真产品 HTTP 口 + worker `commerceReconcileTick` sweep 口）：F1（sweep 口→abandoned+released+`interview_unavailable` 恰一）+F2（显式 abandon 口真 HTTP→同终态同原语）+F3a/F3b（双触发幂等·F1→F2=200 `{alreadyAbandoned:true, released:'noop'}`（`interview.service.ts:659` 映射）·F2→F1 sweep 零二次副作用·终态不复活）+F4（未过期对照 sweep 不误伤）+F5（过期/垃圾/无令牌 401 短回归·仅触发链 sanity）+N1-N2（额度净账恰一次）。**49/49 PASS · EXIT=0**。
5. **注册**：root package.json 三 case 双行（`uc012:nhp-fault:prove`/`uc030:nhp-fault:prove`/`uc003:nhp-adv:prove` + `:raw`）· apps/worker+apps/web+apps/api package.json 各一行（零碰撞亲证）· isolated runner 四位（SOURCE_PATHS 三条目 ≤32 / allowlist 三行 / isolatedCommand 三臂 / **pre-migrate 名单两行**——第四注册位系行使中补全，见下诚实录）。
6. **收据**：tracked `ai-docs/delivery/receipts/nhp-{012-fault,003-adv,030-fault}-01/`（docker info + isolated-receipt.json + gate stdout）· `.tmp/` 全次留痕（含中间红次）。implementer pre-commit runs · **not evidence of record**。

**门矩阵亲跑**（EXIT 原值如实录·stdout 留痕 .tmp/）：`docker info` **EXIT=0**（colima）→ `pnpm uc003:nhp-adv:prove` **EXIT=0**（67/67）→ `pnpm uc030:nhp-fault:prove` **EXIT=0**（49/49·中间两红次原值 EXIT=1）→ `pnpm uc012:nhp-fault:prove` **EXIT=0**（73/73·中间六红次原值 EXIT=1）。**中间红次 root-cause 归因（全 EXEC 侧 · 零产品缺陷 · 零自修产品码）**：
- uc030 R1（EXIT=1）：runner 第四注册位（pre-migrate 名单）漏两 case → 隔离库零迁移 `app_role` 不存在——EXEC 注册面缺口，补名单后复跑。
- uc030 R2（EXIT=1）：绝对额度基线断言 vs `0168` signup 恒发 free-tier 试给桶（+1.0，产品既有形状）——改基线差分断言（净变语义·沿 uc018-http 先例），非改断言迁就（净恰一次契约原样钉死）。
- uc012 R1-R6（EXIT=1）：①同 premigrate 缺口；②planner 脚本 2 条=schema 硬闸（`PLANNER_COMPETENCY_MIN_COUNT=3`）拒→默认集→PC 轮数账翻覆——改 3 条合法计划（adaptive-flow 先例）；③consent 门（G1/G2）下首问 grounded=固定模板零模型调用（产品既有形状·adaptive-consumer 同形）→ ask seam 未真实经模型——对照臂评分改 `hasHook=true`（HOOK_CAP 封顶→既有 probe 路径出 fundamental/scenario 追问）使 ask seam 真实经脚本化模型客户端（守护⑤ 实证·`interviewer.ask` 调用=2）；④F1/F2 注入轮标未计模板首问（lastRound 0→1）；⑤F3 question_ready 恒 2（start 题+推进题）断言改重排前后不变。**门红 Ban 自修边界守住：全部归因 EXEC 夹具/注册/断言精度，产品行为面零触碰**。

**守护兑现**：①壳行 'created'（两 PG case 手插行全 'created'+断言）②夹具豁免四项具名 PIN 入收据③per_session 缺省（billing_cap_units IS NULL 断言×2+零计费行）④F1 非末题（软预算内非末轮注入+下一题在场断言）+`evaluation_deterministic_refusal` 字面入收据⑤三键全覆盖+ask seam 实证（PC-CALLS ask=2）⑥Ban wash PIN 入 Row 3 收据（UC-018/UC-017 零借用）⑦P3 文面三件落 §2/§1/本卷引用形。

**Non-claims**：EXIT0 ≠ covered ≠ suite green ≠ 行/列升格（升格仅经 coordinator nail additive honesty）· `:114/:118/:128` 措辞零翻动 · coveredCount=8 不变 · ≠HA · est live=0 · 三 case 互不替代互不借用 · D1（pending_eval 字面状态机/补评闭环 NOT claimed）· D2（lazy-on-access 字面口/refresh token NOT claimed）· D3（零模型语言断言）· V1 原型链族预登记未实证（零 EXIT1 触发 · 修复归产品刀）· alone ≠ dual · **⛔push ⛔force-push**。

### §9-EXEC 红次台账勘误（post 双审席1 scoped FAIL P1 处方落卷 · append-only · 2026-10-26 · 纯文面零码动）

**回路**：post-prove 双审席1 scoped FAIL（P1×1 = 红次台账核算错 · P2×2 随落）——FAIL 仅及本节红次台账文面核算面；三 proof 绿证据 / 收据 digest 链 / `apps/*/src`+`packages/*/src` 零产品 diff 三项席1 亲证全成立，证据终态不受影响。本勘误段系席1 处方 append-only 落卷（上方 §9-EXEC 原文留痕不回改）；解销条件 = 本段落卷（协调方裁定 · 见 §9-post）。

**P1（uc012 红次 6→7 · 全批 8→9）**：§9-EXEC「uc012 … 中间六红次」核算有误。15 份回执（`.tmp/isolated-proof-receipts/`）逐份机证：`uc012:nhp-fault:prove:raw` exitCode=1 红次共 **7** 次，逐次在卷：

| 次 | startedAt(UTC) | finishedAt(UTC) | exitCode | proof sha256 前8（回执 sourceDigests `apps/worker/test/uc-e2e-012-nhp-fault.proof.ts`） |
|----|----------------|-----------------|----------|------|
| R1 | 17:44:41.054 | 17:44:47.426 | 1 | `0a68761e` |
| R2 | 17:46:55.504 | 17:47:01.230 | 1 | `eaf83be9` |
| R3 | 17:49:50.414 | 17:49:56.312 | 1 | `03751ae4` |
| R4 | 17:50:39.672 | 17:50:46.265 | 1 | `bb0fa21f` |
| R5 | 17:52:23.053 | 17:52:29.721 | 1 | `45409726` |
| R6 | 17:55:43.323 | 17:55:50.411 | 1 | `685e3233` |
| R7 | 17:56:15.222 | 17:56:21.875 | 1 | `d53c098a` |
| 终绿 | 17:56:42.454 | 17:56:49.104 | 0 | `88f34214`（≡ 届树现值 `88f342140af0133c5c4b4dbc96449f7258d5f60d92efb18124abc5dbf085cc11` 全 64 位同） |

**归因①撤销（席1 机证承登）**：§9-EXEC uc012 归因①「同 premigrate 缺口」**撤销**——runner `scripts/run-e2e-isolated.mjs` sha256 `0fc74902…` 自 `2026-10-26T17:42:58Z`（uc030 R2 回执）起在证恒定：uc012 全部 8 次（R1-R7+终绿）及席2 三次复跑回执 runner digest 逐份同为 `0fc74902…` 零变化；premigrate 名单缺口系 uc030 R1（17:41:53Z · runner 旧值 `e25b075c…`）专属成因——uc012 首红（17:44:41Z）时该缺口已修、此后 runner 零变化，「同 premigrate 缺口」对 uc012 任一红次不成立。旧值 runner 在证仅 2 回执（uc003 终绿 17:41:46Z——纯函数 case 与 premigrate 无关 · uc030 R1）。

**成因可重建性如实申明**：现存成因 ②③④⑤ 系 EXEC 循环内四类夹具/注册/断言精度缺陷类，类级留痕有效（终绿 proof `88f34214` 行使形态在证 · 门红 Ban 自修边界守住：全部归因 EXEC 夹具/注册/断言精度，产品行为面零触碰）；但七红次 proof sha256 逐次各异（每次行使间 proof 即迭代改写、中间版本未留档），且**中间红次 stdout 未逐次持久化**（每 case 仅终次 stdout 落盘 ≡ tracked `02-gate-*.stdout.log`）——单红次级「哪一红次对应哪一成因」的正向归因不可机证重建。凡正向归因缺席的红次，如实申明：**「该次 stdout 未留痕 · 仅回执 digest 在证 · 成因不可重建」**（uc012 R1-R7 全列——R1 原归因①既经机证撤销，同落本申明）。

**全批红次合计 8→9**（uc030 2 + uc012 7）。

**12 回执 exitCode 台账在卷**（implementer EXEC 侧 12 份 = **9 红 + 3 绿** · 席2 post 三次独立复跑 3 份另见 §9-post · `.tmp` 在盘合计 15 份 · 台账逐份对回执亲算零冲销）：

| case | startedAt(UTC) | exitCode | 次别 |
|------|----------------|----------|------|
| uc003 | 17:41:46.349 | 0 | 终绿（首跑即绿） |
| uc030 | 17:41:53.319 | 1 | R1（premigrate 名单缺口 · runner 旧值 `e25b075c`） |
| uc030 | 17:42:58.965 | 1 | R2（额度基线改净差分断言） |
| uc030 | 17:44:19.659 | 0 | 终绿 |
| uc012 | 17:44:41.054 | 1 | R1（次级成因不可重建 · 见上申明） |
| uc012 | 17:46:55.504 | 1 | R2（同上） |
| uc012 | 17:49:50.414 | 1 | R3（同上） |
| uc012 | 17:50:39.672 | 1 | R4（同上） |
| uc012 | 17:52:23.053 | 1 | R5（同上） |
| uc012 | 17:55:43.323 | 1 | R6（同上） |
| uc012 | 17:56:15.222 | 1 | R7（同上） |
| uc012 | 17:56:42.454 | 0 | 终绿 |

**P2-a（随落 · 流程披露）**：中间红次证据形状 = 仅回执元数据（target/outcome/exitCode/durationMs/startedAt/finishedAt/sourceDigests/schemaMigrationManifest/dataHandling/releaseEvidence）在证、stdout 未逐次持久化——本 EXEC 流程缺口承登（非证据链冲销：红次回执 digest 链与终绿证据自洽）；后续 EXEC 红次留痕沿 NHP-028 attempts-ledger 先例逐次含 stdout 落盘。

**P2-b（随落 · §9-rev2 ② 豁免具名落 proof 夹具段注释落点澄清）**：REQUEST §9-rev2 ② 字母位 = (a) bucket 种子 / (b) lease 回拨 / (c) ai_graph_run 行（仅 T2 形对比臂需要时）/ (d) interview 壳行；proof 夹具段实际注释落点：uc030 proof 头注 `:21-22` 具名枚举 (a)+(b)+(c)=interview 壳行 · uc012 proof 夹具注 `:134` 壳行标「豁免②c」——两 proof 夹具注释将「interview 壳行」落于 ②(c) 字母位（与 REQUEST ② 的 (d) 位字母错位）；`ai_graph_run` 字面两 proof 零命中（②(c) 豁免本批零行使）。**豁免项实质集合同一**（bucket 种子 + lease 回拨 + 壳行 `'created'` 三项 · ai_graph_run 未行使 · 豁免外全部走产品路径）——字母位错位系标注差异承登澄清，零实质发散。

**勘误自检**：本段纯文面（恰 1 tracked `.md`）· 断言强度只增不减 · 行状态/列状态/coveredCount=8/EXIT 契约零翻动 · 9 证据文件（3 proof + runner 链 2 件 + 4 package.json）sha256 编辑前后恒等机证（值与轮次见 §9-post 机械核段）。

---

## §9-post（post 双审会签落卷 · 2026-10-26 · 席1 scoped FAIL 勘误解销 + 席2 PASS + 协调方裁定 · **STOP 三处翻面 `closed`**）

**post 输入**：§9-EXEC 运行门全量行使在卷（三 case 73/73·67/67·49/49 EXIT=0 · STOP 史录值 `executed:awaiting_post_prove_dual` 三处钉维持）→ 席1 scoped FAIL（P1 红次台账核算 + P2×2 随落）处方勘误段落卷（§9-EXEC 尾 append-only · 2026-10-26 · `3d3a06c1a`）→ 本席对账翻终态 **`closed`**（沿 uc019 `be8b1c2e4`/uc004 `6c353a515` §9-post 先例形 · 卷 closed ≠ 矩阵行/SSOT 翻面——coveredCount=8 零动 · 行翻面权归协调方）。

- **席1 scoped FAIL（处方落卷即解销）**：FAIL 仅及红次台账文面核算面（P1：uc012「中间六红次」实为七红次 + 归因①「同 premigrate 缺口」经机证撤销 · P2×2 随落）；同席亲证三项全成立——①三 proof 绿证据（73/73·67/67·49/49 回执链在证）②收据 digest 链与届树全 MATCH ③`apps/*/src`+`packages/*/src` 零产品 diff——证据终态不受影响。勘误段已按处方逐条落卷，**解销兑现**。
- **席2 PASS（独立亲证/复跑）**：①**三门独立复跑恰一次全绿 EXIT=0（第三 fresh 轮：EXEC 行使→席1 亲证→席2）**——uc012 `73/73`（receipt startedAt `18:07:48.976Z` outcome=passed）、uc003 `67/67`（`18:08:03.567Z` passed）、uc030 `49/49`（`18:07:35.485Z` passed）· 零模型零外呼 `env -u` 三键同合同；②**9 红零冲销**：在盘 15 份回执 exitCode 逐份复算 = EXEC 12 份（9 红 + 3 绿）+ 席2 3 绿，与本卷勘误段台账/§9-EXEC 原账零冲销（红次留痕不冲销）；③**shasum 三文件对收据钉值**：三 proof 届树 sha256 ≡ tracked receipts sourceDigests 逐位恒等（uc012 `88f34214…` / uc003 `5939adeb…` / uc030 `a3047dd7…`）+ runner `0fc74902…` ≡ 13 份在证回执（15 份中除旧值 `e25b075c…` 2 份外全同）。
- **机械核（收官席亲算 · 勘误+会签两编辑轮前后三轮恒等）**：9 证据文件 sha256 编辑前后全等——3 proof（`88f342140af0133c5c4b4dbc96449f7258d5f60d92efb18124abc5dbf085cc11` / `5939adebd53b44b13a17da6c5a2ffb1792727a08371236feb5d7b9e52b1e256f` / `a3047dd72a3610d47a7743ae6bfe860f4bfac29cfea1003339dbf0a318d6d419`）+ runner 链 2 件（`scripts/run-e2e-isolated.mjs` `0fc749028573b74f18434967a4c53e0d557c5161e2ad9827a4b5d657eb04be02` · `scripts/bounded-command.mjs` `3710dacb029505851b15f6d059bb94449b8318a8eb5c3d72c26a9a29c720f582`）+ 4 package.json（root `f159809ae0d7a23e163a146984fe469ed7d48b5993050ceaaf21e5ac70698afa` · worker `0d9cf15f658afdf1bc1ddd3c135b81addfd35ffe1b7988b060a8349e9d412c24` · web `c07c7292d1c8e04ca6c89616740b5eb498d52bd70cbb7c8cb66d0e73e9b1869e` · api `0f58048d4ffa247005df3cb5b1cc67d879143f2aef7bbe5e096c9a14b23a266e`）——文面勘误/会签零触证据面（digest 链机械核通过 · 协调方裁定依据之一）。
- **协调方裁定（2026-10-26）**：席1 scoped FAIL 以勘误落卷**解销** + 席2 PASS 会签 + **digest 链机械核通过** → 批 A 卷 STOP 对账翻终态 `closed`；并线 PR 走 main（fetch origin/main 届值 → merge-tree 预演 → merge --no-ff〔同文件 additive 双保留 union〕→ `pnpm install --frozen-lockfile` → 终验 docs:check/typecheck/lint/markers/ancestor → push → PR → `gh pr merge --merge --auto`）。
- **并线承登（收官席 · merge 时点）**：egress 清单 `provider-egress-inventory.json` additive 六目（`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL` × `apps/worker/test/uc-e2e-012-nhp-fault.proof.ts`/`apps/api/test/uc-e2e-030-nhp-fault.proof.ts` · class=test-isolation · 沿 uc028 `10b920521`/uc004 `834c91cb3` 先例形 · `environment_reference_unregistered` 本地 verify 红承登热修 · 非上列 9 证据文件）· cap 承 origin/main sanctioned 值 **2370**（union 扫描届值见终验）。
- **Non-claims（翻面不洗）**：卷 closed ≠ covered ≠ 行/列翻面 ≠ suite green ≠ HA——`:114/:118/:128` 措辞零翻动 · coveredCount=8 不变 · releaseEvidence=false · DELETE=503 · g7SuiteGreen=false · est live=0 · 三 case 互不替代互不借用 · D1/D2/D3 NOT claimed 面维持 · 历史节尾钉留痕不洗。
- **终验红停承登（收官席 · 2026-10-26 · merge `origin/main`=`151479547` 后 union 树亲跑 · 停止条件「门红」命中即停上报 · ⛔push 未执行 · PR 未开）**：①**docs:check 红**：`public_text_policy:PTP_FILE_LIMIT:2372>2370`——本支对 `origin/main` 净增 11 tracked 文件（3 proof + 7 收据 + REQUEST·其中 8 件计入受管扫描），派单 cap 值 2370 机证不足；沿 +8 先例形（2208→2370 二十次步进·历次均「协调方 sanction/授权随令」）需协调方 sanction 步进 **2378**，本席不自裁；②**lint 红**（root `eslint .` **5274>5242** · turbo `@meetwise/worker` **977>959** · `@meetwise/api` **1437>1423**）——delta 恰 **+32** 全系本批 EXEC 两 PG proof `@typescript-eslint/no-explicit-any`（uc012 proof=18 · uc030 proof=14 · uc003 proof=0 · 并线来件 uc019/uc004 proof=0 · 各包基线恰等帽「贴线」形）；修复两途=**改 proof**（破收据 digest 钉 `88f34214`/`a3047dd7`＝机械核恒等破·本席 Ban）或**帽步进承登**（worker +18/api +14/root +32）——归协调方裁（帽承登 vs 授权就地修 any+重行使另刀）；③**绿面**：typecheck EXIT=0 · markers 0 命中（REQUEST+inventory 五类标记词+冲突标记）· ancestor EXIT=0（`origin/main` ∈ HEAD）· `provider-egress:inventory` EXIT=0（additive 六目 `39f56cbb5` 后 environment_references=352→358 · 未登记 6 目红先承登后修）· runner union 六目标（uc012/uc003/uc030/uc019/uc004/uc017）注册零丢语法 OK · `pnpm install --frozen-lockfile` EXIT=0 · **9 证据文件机械核分轮承登**：派单 scoped 检查「勘误前后恒等」=勘误段/§9-post 两文面编辑前后**三轮全等 ✓**（3 proof + runner 链 2 件 + 4 package.json）；merge 轮 `origin/main` 侧 additive union 合法推进 3 件共享注册面（root/api package.json + runner——uc004/uc019 注册行并入·同 uc004 `834c91cb3` 先例形·收据 runner digest `0fc74902`=行使时点钉·并线后 runner=注册超集·git 史 blob 可复现）·其余 6 件全链恒等 ✓；④**merge 本体**：merge-tree 预演零冲突 · `--no-ff` 并入 `origin/main` `151479547`（uc019 #141 + uc004 #142 两收官线）12 files additive 零丢（双侧注册行/脚本行不同区·union 亲证）；⑤**待裁两件即续**：cap 2378 sanction + lint 处置路径 → 复跑 docs:check/lint 终验 → push → PR → `gh pr merge --merge --auto`。
- **两 sanction 行使与复跑红停二次承登（收官席 · 2026-10-26 · 协调方两句裁决随令行使 · 停止条件「复跑仍红」typecheck 面命中即停上报 · ⛔push/PR/auto-merge 均未执行 · 本地落卷沿 `3b8a7e8fa` 红停先例形）**：①**cap sanction 落码**：`scripts/ai-docs/public-text-policy.mjs` MAX_FILES **2_370→2_378**（+8 沿 uc025 `558690214` 先例形·协调方 2026-10-26 sanction·二十一先例链注记随刀·「上限经 2346→2354→2362→2370→2378 步进」行同步）+ 越限臂联动 `public-text-policy.proof.mjs` fixture 注入 2_378（atCap/scannedFiles 同步·超限错误码形 `PTP_FILE_LIMIT:2379`·CAP-SANCTION-2378 注记随刀）——`public-text-policy:prove` 复跑 **12/12 EXIT=0**；②**lint 三帽步进落码**（承登来源=uc012 proof 18 处+uc030 proof 14 处 no-explicit-any·改 proof 破收据 digest 钉 Ban·帽步进+承登为既立先例路径·协调方 2026-10-26 sanction）：root `package.json` 5242→**5274**（+32）·`apps/worker/package.json` 959→**977**（+18）·`apps/api/package.json` 1423→**1437**（+14）——cap 所在 lint script 行亲证后改·恰等步进零多放；③**两红门复跑绿**：docs:check **EXIT=0**（`ai-docs check passed`·scanned **2372**≤cap 2378）· turbo lint **12/12 EXIT=0**（0 cached·root 恰 **5274**/worker 恰 **977**/api 恰 **1437** 各帽恰等·0 errors）；④**其余复跑**：root `pnpm typecheck`（typecheck:e2e）**EXIT=0** 同 §9-post 绿面同门同值 · markers **0 命中**（本刀改动集五类标记词+行首冲突标记 grep 亲跑·沿 `i6-239-gates.proof.mjs:154-163` 门口径）· ancestor EXIT=0（`origin/main` ∈ HEAD 亲证）；⑤**复跑红停（命中即停）**：turbo typecheck **`@meetwise/worker#typecheck` EXIT=2**——`apps/worker/test/uc-e2e-012-nhp-fault.proof.ts` 恰 3 错（`:97` TS2322 `GREEN_EVAL` 推导 `ok:boolean` 不可赋 ModelResult 判别臂 `ok:true`·`:234` TS2532×2 possibly-undefined）·**先在红非两 sanction 落码所引**（stash 亲证届 tip `3b8a7e8fa` 同红 3 错·本刀改动集恰 5 文件=3 package.json+2 `scripts/ai-docs` .mjs·零触该 proof 零触 worker tsconfig）·该文件本支独有（`origin/main` `151479547` cat-file 无此件·落地 `7983a988e`）·sha256 系收据钉值 `88f34214`（§9-post 机械核钉）→ **改 proof=破钉 Ban**；CI `ci.yml` verify job 跑 `pnpm turbo typecheck`（selection-face 断言 worker typecheck 必亮）+ main 分支保护 required checks=`["verify","secrets-scan"]`（gh api 亲证）→ 本支 PR verify 必红 → **`gh pr merge --merge --auto` 武装永不可能兑现**；⑥**处置归协调方（本席不自裁）**：修复路径三选——(a) 授权修 proof 类型面+收据 digest 链重钉另行使（b) worker tsconfig test 排除形另刀（c) `ai-runtime` ModelResult 判别面放宽另刀·均需 sanction；两 sanction 落码本身已按裁决完成且两红门（docs:check/lint）复跑全绿——剩余唯 typecheck-CI 一面待裁。

closed（§9-post 卷尾钉 · 与 Status 行/§2/§8 同值 · 席1 scoped FAIL 勘误落卷解销 + 席2 PASS 三门独立复跑 73/73·67/67·49/49 + 9 红零冲销 + shasum 三文件对钉 + 协调方裁定 digest 链机械核通过 · 并线 PR 走 main）

---

*NHP-BATCH-A 记录 · 2026-10-26 起草 · **STOP=`closed`**（三处钉：Status 行+§2+§8 · 2026-10-26 post 双审会签对账翻面——席1 scoped FAIL 处方勘误落卷解销+席2 PASS 三门独立复跑+9 红零冲销+协调方裁定 digest 链机械核通过 · 见 §9-post · 历史态 `executed:awaiting_post_prove_dual`/`draft:awaiting_pre_exec_dual` 留痕于各节钉不回改）· base `origin/main` @`ea0fa0a0a`（派单下限锚·merge tip `e4589b57f`·勘误 `3d3a06c1a`）· 分支 `line/nhp-batch-a-draft` · 工作树 `meetwise-nhp-a` · 门矩阵=docker EXIT0+三 case 全绿（73/73·67/67·49/49）+席2 第三 fresh 独立复跑全绿 · 全批红次 9（uc030 2+uc012 7·勘误段台账在卷零冲销）· 批表行与矩阵行/coveredCount 翻面权归协调方（coveredCount=8 零动）· alone≠dual · Ban self-approve · est live=0 · push 仅经本并线 PR（协调方收官令）· ⛔force-push*
