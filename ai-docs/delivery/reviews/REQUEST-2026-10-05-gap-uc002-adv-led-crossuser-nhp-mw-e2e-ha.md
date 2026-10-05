# REQUEST — **NHP-002-ADV-01 · UC-E2E-002 伪造 LED / 跨用户 session ADV 真证据** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc002-adv-led-crossuser-nhp.md` · slice `gap-uc002-adv-led-crossuser-nhp.slice.md`
**Parent tip**: `a778255`（series open · not a prove tip）
**Date**: 2026-10-05

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

## 请审什么（mw-e2e-ha 视角）

矩阵 `NHP-002-ADV-01`（`non-happy-path-perf-load-case-matrix.md:45` **blind→case-only**）· §1.0.1 `UC-E2E-002` ADV **blind** / `case-only`（`:113`）。本刀 REQUEST 为该行求 SSE 会话两族六类 ADV 可复现真证据。请审：

1. **两族六类可执行性**：伪造 LED 族 V1 非法格式（Infinity/小数/科学计数/空白/负数/17 位溢出）/ V2 合法格式越界（seq>max）/ V3 同 LED 重复重放；跨用户 session 族 V4 他人令牌 GET state / V5 他人令牌 GET events（合法+非法 LED）/ V6 无令牌/坏令牌/保留 sentinel uid/伪造 dev-header。注入路径唯一 = `GET /interview/:id` 与 `GET /interview/:id/events` + `last-event-id` 头（`interview.controller.ts:251-252` · `main.ts:67` CORS allowlist）；产品事实 = `last-event-id.ts:8-18`（正则 fail-closed → 400 `invalid_last_event_id`）+ `interview.service.ts:814-820`（`asPrincipal` RLS + `guardInterviewPrivacy` → 404 不泄露；恒 `seq>$2 ORDER BY seq`）+ `principal.guard.ts:54-68`（401 `invalid_token`/`unauthenticated`/`reserved_principal` fail-closed；x-user-id dev 回退生产禁用）。
2. **EXIT 契约**：EXIT 0 = V1–V6 每类 HTTP 状态码+错误码+DB before/after 快照断言全成立（V1/V4/V6 零副作用；V2 空 replay 零事件；V3 两窗逐 seq 一致不重不漏；V4/V5 no-leak：响应体不含属主题面/进度/事件 `seq/kind/payload`）；任一不成立/做不出 → **EXIT 1 诚实保留 blind/case-only**。EXIT 0 也不自动翻行：ADV blind/case-only→partial 还须 post-prove dual + 协调方授权。
3. **诚实失败路径**：矩阵场景期望写「401/403/空」；产品当前把越权折叠为 **404 不泄露**（`e2e-scenarios.md:90` E-越权恢复原文即「0 行 → 404，不泄露存在性」）——prove 须按实际产品语义断言 401/404/空并**如实披露**此差异，**Ban** 为凑 403 改产品加错误码。EXIT1 打印 `GAP-UC002-ADV-LED-CROSSUSER` 明细；**Ban** 把 EXIT1 说成 flake；attempts 全记录 · **Ban retry-to-green**。
4. **隔离与安全**：prove 走 `scripts/run-e2e-isolated.mjs` 隔离壳（同 `uc002:http:prove` 三层包装，`package.json:138-139` 先例）；无 Key 依赖（SSE replay 纯账本读，不触模型）；Ban secrets/`.env*` 入树入 receipt；`releaseEvidence=false`。
5. **口径与既有 prove 关系**：`uc002:http:prove` H-authz（2 断言单锚）/ `uc002:lease:prove` L1–L3 / `uc010:sse-resume:prove` R-authz / `uc033:cross-user-authz:prove` X1–X11 与本刀收据**互不替代**；本刀不改这四个文件。receipt 落点 `receipts/2026-10-05-gap-uc002-adv-led-crossuser-nhp-prove.md`。
6. **G7 列闸**：NEG 内嵌 V1/V4/V6（拒+错误码+零副作用）；NEG/FAULT/BOUND 保持既有 partial 不动；PERF_api/PERF_web/LOAD_worker（§1.0.2 :147 本行全 blind「跨副本压测未证」）对本行无 case → **显式 blind**（Ban n/a 偷关、Ban wash）。

Row **`UC-E2E-002`** ADV column stays blind/case-only. Case `NHP-002-ADV-01` stays blind→case-only. **Ban covered** · coveredCount=8. **Ban 翻任何 SSOT 行**。**Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件**（UC-052 stays partial）。**Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review · mw-e2e-ha（adversarial evidence-honesty）· 2026-10-02

**Reviewed commit**: `d89aaf39fd438bb873e3a1acfc8d74c628b3e160`（`docs(e2e): REQUEST NHP-002-ADV-01 NHP (pre_dual)` · author mw-core）
**Verify base**: worktree `/Users/miaole/Desktop/golucky/meetwise-rv-r-e2e-ha` · branch `rv/r-e2e-ha` @ origin tip `124fb95`（fetch 网络失败，本地 origin ref 已含被审提交；`git merge-base --is-ancestor d89aaf3 origin/feat/mysql-schema-skeleton` = YES）。`d89aaf3..origin-tip` 三个提交（fff8780/ea1f93f/124fb95）只动其它刀的 review 文件，本刀 4 文件零触碰（`git diff d89aaf3 HEAD -- <本刀文件>` 为空，已验）。
**Commit shape**: docs-only 证实——4 新增 .md（slice / harness / stub-mw-e2e-ha / stub-mw-rag-route），全 `A` 状态，205 insertions / 0 deletions，零 SSOT（矩阵/backlog/checklist）零代码零产品文件。本 stub 只 append 本段，不改上文；不代签 mw-rag-route stub（alone ≠ dual）。

### 检查表（逐项 · 均为命令可复核证据）

| # | 维度 | 结论 | 证据 |
|---|------|------|------|
| 1 | docs-only + 零 SSOT | PASS | `git diff-tree --name-status -r d89aaf3` = 4×A md；无矩阵/backlog/checklist 文件 |
| 2 | 产品接线引用行号 | PASS | `last-event-id.ts:8-18` 正则 `^(0|[1-9]\d{0,15})$`+`isSafeInteger` → 400 `invalid_last_event_id`（fail-closed）✓；`interview.service.ts:814-820` `events()`=parse→`asPrincipal` RLS→`guardInterviewPrivacy`（:164-175，0 行→404 `not_found_or_forbidden`）→恒 `seq>$2 ORDER BY seq` ✓；`principal.guard.ts:54-68` 401 `invalid_token`(:54)/`reserved_principal`(:55,:65)/dev-header 生产禁用(:62-67)/`unauthenticated`(:68) ✓；`interview.controller.ts:250-253` GET `:id/events`+`last-event-id` 头+null→404 ✓；`main.ts:67` CORS allowlist 含 `last-event-id` ✓ |
| 3 | 需求文档引用 | PASS | NHP 矩阵 `:45` 行原文逐字吻合（「401/403/空；不泄露他用户事件」blind→case-only · uc033 旁证）；覆盖矩阵 `:113`（ADV blind/case-only）/`:147`（PERF/LOAD 全 blind「跨副本压测未证」）/`:171`/`:267`（P0-7）均逐字核实；`e2e-scenarios.md:79-99`：:89 E-并发resume / :90 E-越权恢复「0 行 → 404，不泄露存在性」/ :91 E-重放去重 / :93 A1–A3 / :97-99 TC×3 全在 |
| 4 | 「现有 prove 缺什么」读码结论 | PASS | `grep uc002:adv`（root+apps package.json）0 命中；`apps/api/test/` 无 `uc-e2e-002-adv*`；先例 `uc-e2e-002-cross-device-http.proof.ts:188-220` H-authz 确仅 2 断言（userB GET→404 + userB SSE→404），无 no-leak payload 断言、无伪造 LED 分类——「覆盖散且为子集」论断成立 |
| 5 | 六类 V1–V6 可机检性 | PASS | 每类均有具体状态码+错误码+DB before/after+no-leak/幂等窗口断言目标：V1 400+`invalid_last_event_id`+零副作用快照；V2 200 空 replay（零事件）；V3 两窗逐 seq 一致不重不漏；V4 404+响应体无属主题面/进度/display_code；V5 404/零事件流+无 `seq/kind/payload`；V6 401 逐注入对应错误码+零副作用。全部可由 HTTP 断言+DB 快照机器复核，无 vibes 断言。V1/V2 分界与代码吻合（17 位=正则拒→400 归 V1；15 位合法格式越界→200 空归 V2） |
| 6 | G7 列闸（NEG 内嵌） | PASS | V1/V4/V6 内嵌 NEG（业务拒+可解释错误码+零副作用）；PERF_api/PERF_web/LOAD_worker 显式 blind（`:147` 本行全 blind 已核），Ban n/a 偷关写明 |
| 7 | EXIT 契约 | PASS | EXIT 0 ⟺ 六类全成立；EXIT 1 诚实保留+`GAP-UC002-ADV-LED-CROSSUSER` 明细（哪类哪断言未证+file:line）；attempts 全记录 · Ban retry-to-green · EXIT1 不记 flake；EXIT 0 ≠ 翻行（还须 post-prove dual + 协调方授权）≠ covered |
| 8 | 隔离壳 | PASS | 三层包装先例 `package.json:138-139`（`uc002:http:prove`→`:raw`→apps/api）逐字核实；`scripts/run-e2e-isolated.mjs:12` 头注引文「local green ≠ HA · need multi-instance + fault-inject for releaseEvidence」逐字在；无 Key 依赖论成立（SSE replay 纯账本读） |
| 9 | 禁碰面 | PASS | Ban 列覆盖 UC-018/052/025/004/014·026 行与文件、SSOT、既有四 prove 文件（`uc002:http`/`uc002:lease`/`uc010`/`uc033`）互不替代且不改；本 commit 实际零触碰（docs-only 已证） |
| 10 | 非隐私域论证 | PASS（附 C-ADV-3） | 本行为 SSE 会话 authz ADV：不触 DELETE=503、不触隐私擦除/tenant/0091 任何路径，no-leak 断言只加强隐私面；RLS/`asPrincipal` 仅作为既有 authz 接线被断言——不换 mw-privacy-int 的论证成立 |
| 11 | Pins 原值 | PASS | stub/harness/slice 三处一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · row stays blind/case-only |
| 12 | gap id 命名/登记 | PASS（附 C-ADV-6） | `GAP-UC002-ADV-LED-CROSSUSER` 为新具名 id，与既有 gap id 无冲突；仅出现于本刀 docs，SSOT 登记留给 nail 阶段 |
| 13 | alone ≠ dual | PASS | 不代签 mw-rag-route；本 stub 自身维持 awaiting 状态由本 append 段记录 PASS 意见，dual 生效以双方 commit 为准 |

### 口径裁决（404-vs-401/403 · 实现方自报开放口径）

**裁决：接受「如实披露 + Ban 改产品凑 403」，并加码为断言映射表入 receipt（C-ADV-1）。**

依据：(a) 两份需求文档**内部不一致**——NHP 矩阵 `:45` 写「401/403/空」，而本行权威验收源 `e2e-scenarios.md:90` E-越权恢复原文即「0 行 → 404，不泄露存在性」、`:93` A3「非属主 →404」；产品实现的是 scenarios 原文机制，且 harness Scope 明言「验收口径以 e2e-scenarios.md UC-E2E-002 原文为准」。(b) 404 不泄露存在性是**严格更安全**的行为（403 会泄露"存在但无权"）；为凑 403 改产品=新增错误码披露面=安全倒退+违反 Ban invent a fix。(c) 故该分歧定性为**文档间口径分歧**，既非产品缺陷，也**不得**被回写洗成「矩阵 401/403 期望已满足」——矩阵 `:45` 的「401/403」面如实记为「产品以 404 折叠越权（scenarios 原文机制）」，401 面由 V6 真实断言，「空」由 V2/V5 真实断言。映射表使该披露机器可复核而非散文式带过；后续 ADV 翻行（blind→partial）必须携带该表。

### Fail-trigger audit（何种情形会判 FAIL · 逐条排除）

- 授权 coding/产品改动 → 无（commit docs-only 实证；Ban coding 明写）。
- SSOT 行翻动/coveredCount 变化 → 无（4 文件全新增，Pins 三处原值一致）。
- 断言不可机检（vibes/散文式"验证通过"）→ 无（检查表 #5 逐类落实状态码+错误码+DB 快照）。
- 分歧静默洗白（把 404 说成满足 403、或反咬产品缺陷）→ 无（ REQUEST 明写如实披露 + Ban 凑 403；本审加 C-ADV-1 映射表固化）。
- EXIT1 洗成 flake / retry-to-green → 无（stub §3、harness EXIT 契约、slice 诚实条款三处一致 Ban）。
- 代签 peer / 自批 → 无（mw-rag-route stub 未读未签未改）。

### Blockers

**None.** 引用全部核实为真，无伪造行号、无虚构机制、无越权授权。

### Conditions（prove 授权后必须满足 · 违反任一 → 收据不采信）

- **C-ADV-1（期望→实际映射表）**：receipt 须含逐类 V1–V6 映射表：矩阵 `:45` 期望原文 / 产品实际语义（状态码+错误码）/ 源锚（`e2e-scenarios.md:90`/`:93` A3 vs 矩阵 `:45`）。404-vs-401/403 分歧按上节定性披露，不得静默归一，不得回写矩阵行。
- **C-ADV-2（V6 环境口径）**：prove 须记录隔离壳实际 `AUTH_DEV_HEADER`/`NODE_ENV` 值；dev-header 子 case 按实际环境语义断言（dev-header 关闭→401 `unauthenticated`；开启+保留 sentinel→401 `reserved_principal`），不为此改产品；`account_inactive`/`session_revoked` 等其它 401 码非本刀注入类，不断言其不存在。
- **C-ADV-3（receipt 卫生 · 隐私边界）**：receipt/JSON 不得落 `interview_event.payload` 原文（属用户作答内容）；no-leak 断言以字段存在性/缺失判定，不打印 payload 体；Ban secrets/`.env*` 入树入 receipt。
- **C-ADV-4（V3 可复核）**：V3 两次重放的 seq 列表（或其 diff）须落 receipt，使「逐 seq 一致不重不漏」可第三方复核。
- **C-ADV-5（EXIT1 台账）**：attempts 全记录（EXIT+时间戳）；EXIT1 打印 `GAP-UC002-ADV-LED-CROSSUSER` 至「哪类哪断言」粒度 + file:line；Ban retry-to-green；EXIT1 不记 flake/环境问题。
- **C-ADV-6（gap id 登记时机）**：`GAP-UC002-ADV-LED-CROSSUSER` 只在 nail 阶段进 SSOT；本刀与 prove 阶段零矩阵/backlog/checklist 改动。
- **C-ADV-7（403 禁改）**：Ban 为本行新增产品 403 出口或错误码披露；404 不泄露机制保持原样。
- **C-ADV-8（范围锁）**：prove 产物仅 `apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts` + root `uc002:adv:prove`（三层隔离壳）；不改 `uc002:http`/`uc002:lease`/`uc010`/`uc033` 四文件与 UC-018/052/025/004/014·026 任何行/文件。

### 观察（不阻塞）

- O-1：harness/slice 的「Base/parent tip `a778255`」为 Line R series 基准快照，`d89aaf3` 实际 git parent 为 `fa55a28`（同系列两个姊妹 REQUEST 提交落其间）；本刀 4 文件内容不依赖姊妹提交，零冲突，仅元数据口径记录，不影响裁决。
- O-2：审查基点为 origin tip `124fb95`（含 `d89aaf3` 之后另两刀的 dual 提交）；本刀文件在 `d89aaf3..124fb95` 间零触碰已验证。

### 三行中文摘要

1. `d89aaf3` docs-only 证实（4 新增 md、零 SSOT 零代码），全部产品接线与需求文档引用逐行核实为真，两族六类 V1–V6 断言逐类具体可机检，NEG 内嵌与 PERF/LOAD 显式 blind 满足列闸。
2. 口径裁决：接受「如实披露 + Ban 改产品凑 403」——404 不泄露是 `e2e-scenarios.md:90`/:93 原文机制且严格更安全，分歧定性为文档间口径不一致而非产品缺陷；加码 C-ADV-1 要求期望→实际映射表入 receipt，禁止静默归一或回写矩阵。
3. 无 Blocker；8 条 Conditions（C-ADV-1…8）锁死映射表披露、V6 环境口径、receipt 卫生、V3 可复核、EXIT1 台账、gap id nail 期登记、403 禁改与范围锁；Pins 八项原值不变，row `UC-E2E-002` ADV 保持 blind/case-only，EXIT 0 ≠ 翻行 ≠ covered，alone ≠ dual 不代签 mw-rag-route。

Verdict: PASS
