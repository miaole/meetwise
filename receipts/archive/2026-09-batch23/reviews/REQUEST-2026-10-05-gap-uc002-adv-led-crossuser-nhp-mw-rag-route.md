# REQUEST — **NHP-002-ADV-01 · UC-E2E-002 伪造 LED / 跨用户 session ADV 真证据** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 请审什么（mw-rag-route 视角）

矩阵 `NHP-002-ADV-01`（`non-happy-path-perf-load-case-matrix.md:45` **blind→case-only**）· §1.0.1 `UC-E2E-002` ADV **blind** / `case-only`（`e2e-requirement-coverage-matrix.md:113`）。本刀 REQUEST 为该行求 SSE 会话两族六类 ADV 可复现真证据。请审：

1. **域边界与 RAG 无涉确认**：本 prove 注入路径 = `GET /interview/:id` + `GET /interview/:id/events`（interview 域 HTTP/SSE），不触 route snapshot / classify / retrieve / qbank / R2/R4/R5 任何面；`NHP-R4-*`/`NHP-R5-PERF-01`/`NHP-RAG-LOAD-01` 行不动、不 wash。请审本刀是否确有 RAG 域越界。
2. **两族六类可执行性与产品事实**：伪造 LED 族 V1 非法格式 / V2 越界空 replay / V3 重复重放不重不漏；跨用户 session 族 V4 state 404 不泄露 / V5 events no-leak / V6 伪造认证 401 fail-closed。产品事实链 = `last-event-id.ts:8-18`（fail-closed 400，头注明言防「silently changes replay semantics / full-stream scan」）+ `interview.service.ts:814-820`（`asPrincipal` RLS 绑定 + `guardInterviewPrivacy` → 404）+ `principal.guard.ts:54-68`（sentinel/reserved 拒 + dev-header 生产禁用）。RLS/`asPrincipal` 在此仅作为既有 authz 接线被断言，**非** privacy 域 knife（无 PII/擦除面，故双审维持 mw-e2e-ha + mw-rag-route、不换 mw-privacy-int）。
3. **EXIT 契约**：EXIT 0 = V1–V6 每类状态码+错误码+DB before/after（V1/V4/V6 零副作用 · V2 空流 · V3 幂等窗口 · V4/V5 no-leak）全成立；EXIT 1 = 诚实保留 blind/case-only + `GAP-UC002-ADV-LED-CROSSUSER` 明细 + attempts 全记录 · Ban retry-to-green · Ban flake 标签。EXIT 0 ≠ 翻行 ≠ covered。
4. **401/403 差异披露**：矩阵期望「401/403/空」vs 产品越权=404 不泄露（`e2e-scenarios.md:90` 原文机制）——prove 须如实披露差异，Ban 改产品凑 403；该差异作为 disclosed 项随 receipt/翻行评估带入。
5. **G7 列闸与不 widen**：NEG 内嵌 V1/V4/V6；NEG/FAULT/BOUND 保持 partial；PERF_api/PERF_web/LOAD_worker 显式 blind（§1.0.2 :147「跨副本压测未证」，Ban n/a 偷关）；不改 `uc002:http:prove` / `uc002:lease:prove` / `uc010:sse-resume:prove` / `uc033:cross-user-authz:prove` 四文件（互不替代）。
6. **禁碰清单**：Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件；Ban 碰 RAG/R4/R5 行与 `g-r4-5-*` / `r2-*` / `r5-*` / `m4-*` / `m5-*` 任何文件；Ban SSOT edit；Ban covered；coveredCount=8。

Row **`UC-E2E-002`** ADV column stays blind/case-only. Case `NHP-002-ADV-01` stays blind→case-only. 本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# POST-PROVE dual — **NHP-002-ADV-01 · GAP-UC002-ADV-LED-CROSSUSER** · prove 复验 · mw-rag-route

**Status**: **POST-PROVE dual PASS**（mw-rag-route 侧独立复验签署 · alone ≠ dual · 不代签 peer）
**Reviewed tip**: `line/r-next-nhp` @ `a8c5812`（parent `f31f682` REQUEST · 恰 5 文件 +696/−1）
**Reviewer**: `mw-rag-route` · worktree `/Users/miaole/Desktop/golucky/meetwise-rv-rp-rag-route`（branch `rv/rp-rag-route` · 未 push）
**Date**: 2026-10-05

## 包完整性（git 证据）

- `git diff --numstat f31f682 a8c5812` = 恰 5 文件 +696/−1：新 proof `apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts`（+420）+ receipt（+261）+ root `package.json`（+2）+ `apps/api/package.json`（+1）+ `scripts/run-e2e-isolated.mjs`（+12/−1）。
- 三层 CMD 注册核验：apps/api `prove:uc002-adv` → root `uc002:adv:prove:raw`/`uc002:adv:prove`（隔离壳入口）→ runner `isolatedReceiptSources` + allowlist + dispatch 三元链各加一臂；与 `uc002:http:prove` 先例同形态，零行为改动、不影响其它 target。
- 零 diff 佐证：四个既有 prove 文件（uc002:http / uc002:lease / uc010:sse-resume / uc033）`git diff` 为空（C3 互不替代）；UC-018/052/025/004/014·026 相关文件零 diff；产品源码（apps/api/src、packages）零 diff；ai-docs 除本 receipt 外零 diff（SSOT 零触碰）。

## fresh re-run（本审查方独立执行 · 恰一次 · 无重试）

- CMD：`pnpm install --frozen-lockfile`（EXIT=0）→ 恰好一次 `pnpm uc002:adv:prove` → **EXIT=0**（首次即绿）：77/77 PASS · 0 FAIL · `EXIT-GATE V1–V6 全成立` · `TEARDOWN pool.end OK` · `release_evidence=false`。
- 独立容器 `meetwise-e2e-19715-1791204266960` · 动态端口 `127.0.0.1:60625`；运行后 `docker ps -a` 零残留。
- 逐字复现 receipt attempt4 关键值：`V3_REPLAY1_SEQ=3,4,5` / `V3_REPLAY2_SEQ=3,4,5` / `V3_REPLAY3_SEQ(led=4)=5` / `V2_OVERBOUND status=200 ids=[] kinds=[]` / `ENV_RECORD AUTH_DEV_HEADER=1 NODE_ENV=<unset>`——零漂移。
- 镜像：`pgvector/pgvector:pg16` 本地命中，image ID `7b822b0aac60` 与 mirror `docker.m.daocloud.io` RepoDigest `sha256:7b822b0a…` 一致（digest 比对通过 · 无新 pull）。

## C1~C3 裁决 + route/会话域边界

| 项 | 裁决 | 依据 |
|----|------|------|
| **C1 映射表** | **PASS** | receipt C-ADV-1 六类三列（期望→实际→源锚）逐类核对：V1=400×11（`last-event-id.ts:8-18` fail-closed）· V2=200 空 replay（`interview.service.ts:818` 恒 `seq>$2 ORDER BY seq`）· V3=幂等窗口（service.ts:818 + `interview.controller.ts:274` emit）· V4=404（`interview.service.ts:164-167`）· V5=404/400 零事件（`interview.service.ts:814-820`）· V6=401×5（`principal.guard.ts:54-68`）。全部源锚行号在本 tip 逐一实测命中。403↔404 折叠 = DISCLOSED-D1 逐类可查（V4/V5 行），未静默归一、未回写矩阵；「Ban 改产品凑 403」由产品 diff=0 佐证。 |
| **C2 gap id + attempts** | **PASS** | 全树 grep `GAP-UC002-ADV-LED-CROSSUSER` 仅命中 receipt / harness / proof / review 四类文件，SSOT（矩阵/backlog/checklist）0 命中——gap id 未入 SSOT。attempts 台账 4 次 prove（1,1,0,0）+ 2 次诊断全记录：两次 EXIT1 均为 prove 侧成因（V2 观察窗 1200ms→4000ms；teardown race 加 `TEARDOWN_DRAIN 3.5s`+`pool.end()`），修正落点全在 prove 自身、产品行为零 FAIL、未记 flake、未 retry-to-green。 |
| **C3 互不替代** | **PASS** | 四既有 prove 文件零 diff（H1–H3/L1–L3/R1–R4/X1–X11 锚点原样）；PERF_api/PERF_web/LOAD_worker 显式 blind 保持（矩阵 :147 原文未动 · Ban n/a 偷关已遵守）；UC-018/052/025/004/014·026 零触碰。 |
| **route/会话域边界** | **PASS** | 注入面 = `GET /interview/:id` + `GET /interview/:id/events`（interview 域 HTTP/SSE 会话）；proof 仅 import `./_neg-harness`，无 route snapshot / classify / retrieve / qbank / RAG-FUNNEL / TECH_ROLE 任何外推；diff 文件清单无 rag 域路径；rag/R4/R5 行零触碰。 |

## V1–V6 对照需求源（`e2e-scenarios.md:79-99` · 无缩水）

- :90 E-越权恢复「0 行 → 404，不泄露存在性」+ :93 A3 → V4（404 + ghost id 响应体逐字节相等 + 属主键差集 no-leak）· V5（404/400 零事件流）。
- :91 E-重放去重「事件不重不漏」+ :93 A1 → V3 两次重放 seq 窗口逐 seq 相等 + Set 判重不重 + 连续无洞不漏 + 边界 LED=4→恰 [5]（seq 列表落 receipt = C-ADV-4）。
- 矩阵 `non-happy-path-perf-load-case-matrix.md:45`「401/403/空；不泄露他用户事件」→ 401 由 V6 五子类真实断言（无令牌/坏 Bearer/sentinel Bearer/dev-header sentinel/生产硬闸探针，各有独立错误码）；空由 V2（200 空 replay）/V5（零事件流）真实断言；403 面按 D1 披露口径折叠为 404。A2（双设备并发 lease）不在 ADV 列 scope——由零 diff 的 `uc002:lease:prove`（L1–L3）继续承载，属既定一刀一行切割，非缩水。
- NEG 内嵌（V1/V4/V6）真实非空壳：每类业务拒 + 可解释错误码 + DB before/after 快照（四元快照 stream/max_seq/total/owner_row）。
- no-leak 断言具体可证伪：V4 越权 404 与不存在 id 序列化响应体相等 + 三重键/子串差集；V5/V6 全响应体仅 `{error}` 单键 + 无 `seq/kind/payload` + 非 `text/event-stream`。
- 77 条断言逐条清点（V1=35 · V2=6 · V3=7 · V4=9 · V5=9 · V6=10 · C-ADV-1=1）与 receipt 全输出 PASS 行数一致；fresh re-run `^PASS` 计数=77 一致。DISCLOSED-D2（OWS 剥离→空白代表 `'1 2'`+`''`）/D3（进程内瞬态 NODE_ENV 模拟、finally 还原，proof :343-349 实证）/D4（V2 4s 观察窗覆盖 2s ping）口径均合理且在 prove 正文原样打印；C-ADV-3 卫生成立（输出仅 seq/kind 元数据与布尔判定，无 payload 原文/无 secrets/无令牌原文）。

## Blockers

无。

## Conditions（非阻断 · 随本 PASS 生效的边界）

1. 本签署 = POST-PROVE dual 的 mw-rag-route 侧；alone ≠ dual：dual 由协调方配对两独立签署完成，本审查方不代签 mw-e2e-ha、未读未引用其 post-prove 内容。
2. EXIT0 ≠ 翻行 ≠ covered：row `UC-E2E-002` ADV 与 case `NHP-002-ADV-01` 保持 blind/case-only（矩阵 :113 原文未动）；翻行/gap id 入 SSOT 待 nail 阶段 + 协调方授权。
3. Pins 原值保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503——本审查未触任何承载文件。
4. fresh re-run 为本审查方一次性独立验证（恰一次 · 无重试）；不重写、不补充 attempts 台账，台账以 receipt 原文为准。
5. 403↔404 折叠（DISCLOSED-D1）作为 disclosed 项随翻行评估带入协调方裁决；不因本 PASS 视为矩阵「403」面已闭合。

## 中文三行摘要

1. 独立复验 `line/r-next-nhp@a8c5812`：恰 5 文件 +696/−1，四既有 prove/UC 家族/产品源码/SSOT 全零 diff，gap id 未入 SSOT（C2），三层 CMD 注册与 `uc002:http` 先例同形态。
2. C1 映射表六类三列逐类核验通过（源锚行号全部实测命中，403↔404 折叠 DISCLOSED-D1 逐类可查，产品 diff=0 佐证 Ban 改产品）；V1–V6 对照 `e2e-scenarios.md:79-99` 无缩水，NEG/no-leak 断言具体非空壳，SSE/会话域无 RAG 外推。
3. fresh re-run 恰一次 `pnpm uc002:adv:prove` EXIT=0（77/77 首次即绿，关键值与 receipt attempt4 逐字一致，容器零残留）——POST-PROVE dual（mw-rag-route 侧）PASS，翻行待 nail+协调方。

Verdict: PASS
