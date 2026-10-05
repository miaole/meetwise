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

---

# POST-PROVE dual 审查 — **mw-e2e-ha**（adversarial evidence-honesty · NHP-002-ADV-01 复验）

**Status**: **POST-PROVE DUAL PASS**（本审仅 mw-e2e-ha 一方签署 · alone≠dual · 不代签 mw-rag-route）
**Reviewer**: `mw-e2e-ha` · 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-rp-e2e-ha`（branch `rv/rp-e2e-ha`）
**被审包**: `line/r-next-nhp` @ `a8c5812`（parent `f31f682` REQUEST）· 恰 5 文件 +696/−1
**Date**: 2026-10-05

## 1. Fresh re-run（C-DUAL-FROM-FRESH · 恰好一次 · 禁重试已遵守）

| CMD | EXIT | 备注 |
|-----|------|------|
| `pnpm install --frozen-lockfile` | **0** | 本审 worktree 全新安装（pnpm v10.18.0 · 9.2s） |
| `pnpm uc002:adv:prove` | **0** | **77 PASS / 0 FAIL**（`grep -c '^PASS'`=77 · `'^FAIL'`=0）· fresh 容器 `meetwise-e2e-17573-1791203563215` @ `127.0.0.1:59388` · runner receipt `exitCode=0 outcome=passed releaseEvidence=false` · `TEARDOWN pool.end OK` · 运行后 `docker ps -a` 残留=0 |

Fresh 输出与 receipt 逐项一致：`ENV_RECORD AUTH_DEV_HEADER=1 NODE_ENV=<unset>` · `V2_OVERBOUND status=200 ids=[] kinds=[]` · `V3_REPLAY1_SEQ=3,4,5` / `V3_REPLAY2_SEQ=3,4,5` / `V3_REPLAY3_SEQ(led=4)=5` / `KINDS=[progress,question_ready,waiting_user]` · MAP V1–V6 六行 + DISCLOSED-D1–D4 + BLIND-KEEP 全部原样打出 · `EXIT-GATE V1–V6 全成立`。**与实现方声称无任何不一致；未发生不一致情形，故无重大发现可记。**

## 2. 包完整性（git 证据）

- `git diff --numstat f31f682 a8c5812`：恰 5 文件，+696/−1（receipt +261 · proof.ts +420 · root package.json +2 · apps/api/package.json +1 · run-e2e-isolated.mjs +12/−1）。
- `git diff f31f682 a8c5812 -- apps/api/src packages` **空输出** → 产品源码零 diff；四既有 prove 文件（uc002:http/uc002:lease/uc010:sse-resume/uc033）与 UC-018/052/025/004/014·026 文件、SSOT（矩阵/backlog/checklist）均不在 diff 名单 → 零 diff。三层 CMD 注册与 `uc002:http:prove` 先例同形态（root `:prove`/`:raw` + runner allowlist/`isolatedReceiptSources`/dispatch 三处 + apps/api `prove:uc002-adv`）。

## 3. 断言抽查（proof.ts file:line）

- **V4 逐字节一致**：`uc-e2e-002-adv-led-crossuser.proof.ts:270-271` `jsonOf(other.body) === jsonOf(ghost.body)`（越权 404 vs 不存在 id 404），另 :269 ghost 同 404、:272-278 no-leak 三断言（属主键差集 / display_code·question·progress 子串 / 属主与 stream 标识零回显）。
- **V5 单键 `{error}`**：:300-301 `[v0,v2,vbad].every(keysOf(r.body).length===1 && [0]==='error')`；:298-299 无 `seq/kind/payload` 键；:302-303 非 SSE 流；:315 SSE 路径直读 404。
- **V6 五类 401**：:328 无令牌 `unauthenticated` · :331 坏令牌 `invalid_token` · :334 sentinel Bearer `reserved_principal` · :338-339 dev-header sentinel `reserved_principal`（前置 :336 devHeaderActive 按实断言）· :351-352 `NODE_ENV=production`+dev-header `unauthenticated`（进程内瞬态 · :343-349 用毕还原）。与 `principal.guard.ts:54/:55/:65/:63/:68` 逐一对应。
- **V1 十一种注入**：:198 恰 11 项（`Infinity,1.5,1e3,-1,+1,01,'1 2','',17位溢出,NaN,0x10`），:201-208 每项 3 断言（400 + `invalid_last_event_id` + 非 SSE）×11=33 条。17 位溢出被 `last-event-id.ts:10` 正则 `^(0|[1-9]\d{0,15})$` 拒（归 V1 正确），15 位 `999999999999999` 过正则且为 safe integer（归 V2 越界正确）。
- **EXIT 不可伪造**：`_neg-harness.ts:33-40` `done()` 按 `A()` 全量计数 `process.exit(fail===0?0:1)`，`AA` 包装不旁路 —— EXIT=0 蕴含 77/77 全过。

## 4. Attempts 性质裁决（attempt1/2 EXIT1 = prove 自身缺陷修复 · 非 retry-to-green wash）

**独立佐证（实现方 worktree `.tmp/isolated-proof-receipts/` 四份 runner receipt JSON）**：exitCode=**1,1,0,0**；时间戳与台账逐秒吻合（attempt1 `11:59:55.787Z→12:00:07.293Z` · attempt2 `12:07:11.505Z→12:07:22.750Z` durationMs=11245 与台账引文一致 · attempt3 `12:10:15.908Z` · attempt4 `12:10:44.237Z→12:11:00.379Z` 即 receipt 附录所引文件）。无任何 attempt 被隐瞒、无 flake 记法。

**sourceDigests 密码学证据（4 份 receipt 交叉比对）**：四次运行 9 个受监源中**唯一变化文件 = `uc-e2e-002-adv-led-crossuser.proof.ts`**（attempt1→2 `544b91…→41ee7c…` = V2 观察窗修正；attempt2→3 `41ee7c…→90bc91…` = teardown drain 修正；attempt3→4 **逐字节相同** = 纯确认跑）。全部产品源（interview.controller/service · last-event-id · principal.guard）与 `_neg-harness.ts`、runner 本身四次 digest 全同 → **产品在整轮 prove 周期零改动（密码学级）**。本审 worktree @a8c5812 六文件 sha256 与 attempt3/4 receipt digest 逐一吻合 → 提交内容即产出 EXIT=0 的内容。

**裁决**：
- **attempt1**（76/77，唯一 FAIL=`V2 → 200`，客户端 status=0）：诊断 d1 定性为 hijacked-SSE 空 initial replay 时响应头与首个 2s 心跳合并冲刷（headers≈2050ms）> 1200ms 观察窗 → 客户端提前 abort 的**观察缺陷**，产品 replay 语义（`seq>$2 ORDER BY seq` → 0 行）未被任何一次裁决为 FAIL。修正 = 窗 1200ms→4000ms。
- **加严/放宽裁决**：断言谓词（200 + 零 event 行 + 零副作用）**未放宽一字**；观察窗延长使客户端观测的流段**更长** → no-leak/零事件检查覆盖面**更大**（若产品真有事件外泄，4s 窗比 1.2s 窗更易捕获）。定性为**观察对齐 + 观测面加严**，非放宽、非 wash。
- **attempt2**（77/77 全过但 pg pool teardown race 非确定崩溃，durationMs=11245 与全绿同量级 → 收尾阶段）：修正 = `TEARDOWN_DRAIN 3.5s` + `pool.end()` race 6s（proof.ts:408-419），仅涉 prove 进程收尾；`POOL_END_NOTE` 如实打印不吞错，EXIT 仍由断言决定。d2 复现不可得支持 race 定性。属**证明进程健壮性修复**，非 wash。
- 两修复仅触 prove 文件：由上 sourceDigests 证据直接证明（git 单提交 squash 无法逐 diff 复原中间态，本审以 4 份 receipt digest 链代偿验证 —— 如实记此方法学）。

## 5. 条件裁决（本方 pre-exec C-ADV-1~8 逐条）

| # | 条件 | 裁决 | 依据 |
|---|------|------|------|
| C-ADV-1 | 404 口径映射表入 receipt（期望→实际→源锚 · 403↔404 折叠 disclosed） | **PASS** | receipt「C-ADV-1」六类三列 + proof `MAP V1–V6` 输出；六处源锚逐一对源核实（`last-event-id.ts:8-18` · `interview.service.ts:164-167/:818/:814-820` · `interview.controller.ts:274/:250-286` · `principal.guard.ts:54-68` 全部命中）；D1 披露原文双落（proof :391 + receipt :62） |
| C-ADV-2 | V6 环境口径如实记录（dev-header 按实断言 · 生产硬闸瞬态模拟用毕还原 · 不虚断未注入的 401 码） | **PASS** | `ENV_RECORD AUTH_DEV_HEADER=1 NODE_ENV=<unset>`（proof :47-52 · fresh 复跑同值）；:336 前置断言 devHeaderActive；:343-349 restore；receipt :83 明示 `account_inactive/session_revoked` 非本刀注入类未断言其不存在 |
| C-ADV-3 | receipt 卫生（零 payload 原文 / secrets / 令牌 / 连接串） | **PASS** | 全文复读 receipt+proof 输出：fixture payload 仅 `{"n":k}` 计数占位；no-leak 全以布尔/键差集判定；`V4_OWNER_KEYS` 仅键名无值；无令牌原文（V6 令牌为 `tokenFor()` 进程内现签）；runner receipt `dataHandling=no_output_prompt_answer_token_endpoint_or_connection_string_persisted` |
| C-ADV-4 | V3 两次重放 seq 列表逐字落 receipt | **PASS** | receipt「C-ADV-4」节 `3,4,5 / 3,4,5 / 5` + KINDS；fresh 复跑输出同值 |
| C-ADV-5 | EXIT1 全台账 · 禁 retry-to-green · 禁记 flake | **PASS** | 台账 4 prove attempts + 2 诊断全记录；4 份 runner receipt JSON 独立佐证 EXIT=1,1,0,0；两次修正均 prove 侧（digest 证据）→ 非 wash（见 §4） |
| C-ADV-6 | gap id 未入 SSOT | **PASS** | `grep -rn GAP-UC002-ADV-LED-CROSSUSER` 全树：仅 receipt/harness/proof.ts/两份 review stub 命中，矩阵/backlog/checklist 零命中 |
| C-ADV-7 | 403 禁改（Ban 凑 403 改产品） | **PASS** | 产品 diff 空（§2）+ 四次运行产品源 digest 全同（§4）；`guardInterviewPrivacy` 404 `not_found_or_forbidden` 原样（interview.service.ts:164-167）；D1 按 scenarios:90 原文口径披露、未回写矩阵 |
| C-ADV-8 | 范围锁（仅 proof + 三层 CMD 注册 + receipt；不碰 UC-018/052/025/004/014·026） | **PASS** | §2 恰 5 文件清单即授权范围；隔离壳注册零行为改动（diff 仅加清单项/allowlist 项/dispatch 臂）；`node --check`+JSON 解析在 4 次真实运行中已隐式验证 |

## 6. Blockers

无。

## 7. Conditions（随本 PASS 生效 · 不满足则本 PASS 不构成翻行依据）

1. **EXIT0≠covered**：row `UC-E2E-002` ADV 与 case `NHP-002-ADV-01` 维持 blind/case-only；coveredCount=8 不动；翻行须 nail 阶段 SSOT edit + 协调方授权。
2. **alone≠dual**：本文件仅 mw-e2e-ha POST-PROVE dual 签署；mw-rag-route 并行审查独立进行，本审未读未签。
3. **403↔404 折叠（D1）为披露口径**：不回写矩阵 :45 原文；后续任何 nail/SSOT 动作引用本行时须携带 D1 披露。
4. **PERF_api/PERF_web/LOAD_worker 显式 blind 保持**（§1.0.2 :147）：本 PASS 不构成任何 PERF/LOAD 面证据。
5. attempt1/2 修正仅限 prove 侧（本审已核实产品零改动）：若后续发现产品行为相关差异，本 PASS 不覆盖。
6. fresh re-run 基于本审环境（本机 docker + `pgvector/pgvector:pg16` 本地镜像 digest `7b822b0a…` canonical/mirror 一致）；不代表 HA/releaseEvidence（仍 false）。

## 8. 三行中文摘要

1. 恰 5 文件 +696/−1、产品零 diff、SSOT 与四既有 prove 文件零触碰；三层 CMD 注册同先例；fresh 全新 install 后恰好一次 `pnpm uc002:adv:prove` **EXIT=0（77 PASS/0 FAIL）**，V3 seq 列表与 ENV_RECORD 与 receipt 逐字一致。
2. attempts 台账诚实：4 次 EXIT=1,1,0,0 由 4 份 runner receipt JSON 独立佐证；sourceDigests 链证明两处 EXIT1 修复仅触 prove 文件（观察窗对齐=观测面加严非放宽 · teardown drain 仅涉收尾），产品源四次 digest 全同——非 retry-to-green wash。
3. C-ADV-1~8 全 PASS；映射表六类源锚逐一对源核实；receipt 卫生与 D1–D4/BLIND-KEEP 披露齐备；无 Blockers；row 维持 blind/case-only、翻行待 nail+协调方授权，且 alone≠dual、不代签 mw-rag-route。

Verdict: PASS
