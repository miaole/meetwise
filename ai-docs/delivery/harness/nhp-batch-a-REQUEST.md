# Harness — **NHP 批 A · §1.0 盲区三行缺列隔离收据 REQUEST**（Line NHP-A · **`draft:awaiting_pre_exec_dual`** · EXIT0≠covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · stub · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push**）
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
| `apps/worker/src/adaptive-lifecycle.ts` | `db96efec972f6a2f903a256303c6591afbb57ee4` | `:490` `const unscored = last.outcome === 'unscored'` · `:523/:532` `appendEvent(... 'answer_unscored' ...)` · 幂等键 `answer_unscored:${input.questionId}`（`:527/:535` event_key）· `:536-537` unscored 臂 `question_ready` 同事务推进 |
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
| `apps/api/src/modules/interview/interview.service.ts` | （blob 以执行方开工 tip 复算） | `:649-658` 显式 abandon 口 → 同一 `abandonInterviewAndRelease`（`FOR UPDATE` + 条件状态 CAS） |
| `apps/api/test/neg-auth.proof.ts` | `1dd9cd0a92181da1191cc38a797c624c57ae810a` | 既有旁证：令牌过期/吊销负例（partial · 零改动 · 互不替代） |

---

## §1 修法（三行各补缺列隔离收据 · 一行一 case · 零 invent covered · 零 live key）

**修法形状**（沿 Line Y2/K/X 先例）：每行一个具名 NHP case = 新 proof 文件 + script 注册 + runner 注册（**prove-only · 零产品码改动** · `apps/*/src`/`packages/*/src` 零 diff 意向）；isolated 真 PG / 纯函数行使 · **零 live 模型 · 零 MODEL_API_KEY · 零外呼**（`env -u` 三键）；收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行状态/列状态**一字不动**：EXIT0=case≠covered，升格仅经 coordinator nail 的 additive honesty；coveredCount=8 不变。

### Row 1 · `NHP-012-FAULT-01`（UC-012/024 · FAULT 分面）

- **需求源**：`e2e-scenarios.md:261/:274` — E2 单题不可恢复失败 → 标题级状态 + 图级降级提示，**面试可继续**；A1 单题失败不中断整场 · A3 题级落点非静默丢弃；UC-024 补评闭环（幂等键 `(interviewId,questionId)` → 重算 CAS）。
- **既有 prove（旁证 · 零改动互不替代）**：`prove:adaptive-degrade`（服务形失败降级）· `ag-f-reroll`/`bill2-shadow-meter`（他刀具名面）· `full.e2e` 终态旁证。**UC-012/024 行零具名 NHP case**（§1.0.1 `:118` 全四列缺 · NHP 矩阵无 012 行登记）。
- **注入合同**：isolated 真 PG（migrations 齐跑）· 真产品路径造数（begin → adaptive 消费循环 · Ban 裸 INSERT 绕产品路径）· 评分缝 = scripted 注入（`scriptedModelClient` · throw / `externalOutcome:'unknown'` 两形 · 参数冻结入 receipt）。
- **case 臂**：PC = scripted 成功模型全绿（对照缺失=Ban 假绿）；F1 = 单题评估 throw → `answer_unscored` 事件**恰一**落点（event_key=`answer_unscored:<questionId>`）+ 下一题 `question_ready` 同事务推进（图不中断）；F2 = 外部结果未知 → `unscored` + `evaluation_external_outcome_unknown`，零伪造分数；F3 = 二次 drain 不重发 `answer_unscored`（幂等键守卫）；F4 = 面试可达 `completed`，completed 口径下 unscored 题不计分（C 端读 ScoreCard · `answer_unscored` 计数=1 不悬挂终态）；N1–N3 = 额度净账审计（失败不扣不退错）。
- **缺列形状（本刀不动）**：UC-024 补评闭环（后台补评 job→evaluated→CAS 重算）产品未接线（全仓 grep `pending_eval`/`eval_failed`/`AnswerEval` 产品面零命中）→ NEG/BOUND/ADV **先接线后 prove · 留另刀**。

### Row 2 · `NHP-003-ADV-01`（UC-003 · ADV 分面）

- **需求源**：`e2e-scenarios.md:101` — A2 后端校验错误以 en 文案呈现（错误码→i18n 映射断言）；A1 无中文残留（静态 · 既有 S 锚已铺）。TC-E2E-003-ui-en。
- **既有 prove（旁证 · 零改动）**：`prove:uc003-i18n-locale`（S1–S6 **静态** key parity/CJK-free → BOUND=partial 旁证）。**运行级对抗行使 = 零覆盖**（ADV=blind · NEG=gap）。
- **case 臂（纯函数行使 · 零 PG 零外呼）**：PC = 已知码 + `locale='en'` → en 文案（CJK-free · A2 真行使）；N1 = 已知码 + zh → zh 文案（对照）；V1 = 未知错误码 → `upload_failed` 回退（`:133` fail-closed · 不发明文案）；V2 = 伪造 locale 值（`'EN'`/`'fr'`/路径形/超长）→ 一律 zh 臂（二值 allowlist · `request.ts:11` 同契约）；V3 = 对抗信封（非对象 / 空 error / 空白 error / transcript 形字段注入）→ 仅取机器码 · `upload_failed` 兜底 · **零 transcript 字段发明**；V4 = `413` → `file_too_large` 映射（状态码优先臂）。
- **缺列形状（本刀不动）**：FAULT=blind（静态管道资源完整性故障面薄 · 归 BOUND key parity 旁证 · 留后刀）；NEG 列不因 N-臂翻动（N-臂仅对照 · 升格归 nail 裁）。

### Row 3 · `NHP-030-FAULT-01`（UC-030 · FAULT 分面）

- **需求源**：`e2e-scenarios.md:373` — E1 超会话 TTL 一致 abandoned（两触发路径结果相同）；TC-E2E-030-expire-lazy-vs-sweeper；后置「过期 → abandoned（释放额度 · 接 UC-018）」。
- **既有 prove（旁证 · 零改动互不替代）**：`neg:auth`（令牌过期/吊销负例 partial）· `uc017:orphan`（sweeper O 系 · 预占面）· `uc018:*`（abandon 家族）· NHP-030-BOUND-01（case-only · 时钟漂移边界）。**双触发路径一致性 + 双触发幂等 + 额度恰一次释放 = 零覆盖**（FAULT=gap）。
- **case 臂**：isolated 真 PG；F1 = reclaim sweep 口（`commerce-reconcile` 路径）触发 → `abandoned` + 额度 released + `interview_unavailable` 补发；F2 = 显式 abandon 口（`interview.service` 路径）→ 同终态同原语（`abandonInterviewAndRelease`）；F3 = F1 后再走 F2（反之亦然）→ CAS 守卫无第二副作用（无二次 release · 无终态复活 · 事件恰一）；F4 = 未过期对照（active 不受 sweep 误伤）；F5 = 过期/吊销令牌 401 短回归（`verifyTokenFull` 服务端钟实参 · 仅作触发链 sanity · **Ban 代替 neg:auth 全家**）；N1–N2 = 额度净账（恰一次 release · ledger 逐字）。
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

## §2 门矩阵（per-row · pre-dual → prove → post-dual · **Status：`draft:awaiting_pre_exec_dual`**）

| Row | case / prove 命令（授权后注册） | 证据层 | pre-dual stubs | post-dual stubs | 断言面（数） |
|-----|----------------------------------|--------|----------------|-----------------|--------------|
| 1 | `pnpm uc012:nhp-fault:prove` → `apps/worker/test/uc-e2e-012-nhp-fault.proof.ts` | isolated 真 PG + scripted 注入（`env -u` 三键） | mw-e2e-ha + mw-rag-route | 同左 BOTH PASS | PC+F1–F4+N1–N3 |
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

**STOP**。本 REQUEST 终态 = **`draft:awaiting_pre_exec_dual`**：

1. docs REQUEST only——零产品码、零 proof 文件、零 script 注册随本 REQUEST 落库；授权前 Ban coding · Ban prove · Ban push。
2. alone ≠ dual——mw-e2e-ha + mw-rag-route stubs 均 PENDING；本席不自批、不自 nail、不宣称任何收据。
3. 冻结面——三行行状态（`:118` gap · `:114` partial · `:128` partial）、coveredCount=8、releaseEvidence=false、DELETE=503、`g7SuiteGreen=false` 全部不动；任何翻动须经 coordinator nail 的 additive honesty，本 REQUEST 不开启之。

STOP=draft · awaiting pre-exec dual assignment · Ban 执行直到协调方放行。
