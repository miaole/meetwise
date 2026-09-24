# 非快乐路径 + 分面性能/负载 · 评测用例矩阵（eval-first）

**状态**：cases **已登记** · **未执行** · **releaseEvidence=false** · **≠HA** · **≠ covered**  
**日期**：2026-09-16（PT）  
**硬闸**：`north-star-hard-gates.md` G2/G3/G6 · 矩阵 SSOT `e2e-requirement-coverage-matrix.md` **§0.5 / §1.0**  
**Harness**：`harness/non-happy-path-perf-load-matrix.md`  
**Eval 笔记**：`eval/non-happy-path-perf-load-matrix.eval.md`  
**需求源**：`requirements/use-cases/e2e-scenarios.md` + §1.1 既有 UC 行  
**本刀禁令**：不跑 prove / live E2E / 压测作绿关；不把 `case-only` / `partial` / `GAP` / `blind` 写成 covered；实现方禁止自批 reviews/

---

## 0. 读法

| 记号 | 含义 |
|------|------|
| **case-only** | 本文件已写用例 ID + 期望；**尚未**双审后执行 |
| **partial** | 既有 prove/用例服务该面，但仍缺关键验收或未进 full E2E |
| **blind** | 该面无用例且无执行（快乐路径盲区） |
| **blocked** | 前置不满足（无 Key / 无授权） |
| **not_run** | 历史门存在，无当前收据 |
| **covered** | **禁止本刀填写** |

列：`NEG` · `FAULT` · `BOUND` · `ADV` · `PERF_api` · `PERF_web` · `LOAD_worker`。

---

## 1. 用例登记（由 UC/requirements 派生）

> 每条含：派生 UC、列、分面、期望（结构面）、当前旗、既有锚点（若有）。**期望 ≠ 已测通**。

### 1.1 黄金路径与会话（001 / 002 / 010 / 030）

| Case ID | 派生 UC | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|---------|----|----|------------|--------------|--------|----------|
| NHP-001-NEG-01 | 001 | NEG | api | 无额度 / 鉴权失败开面 | 业务拒 + 可解释错误码；不落 active Interview | **case-only**（主链仍 blind） | 委派 011/017/neg:auth；≠ 001 covered |
| NHP-001-FAULT-01 | 001 | FAULT | worker | report worker 注入失败 | Interview 可终态；report 非阻塞死胡同 | **partial** | isolated worker 注入旁证 |
| NHP-001-BOUND-01 | 001 | BOUND | api | 幂等键重复 begin | 单 ConsumptionRecord；无双扣 | **case-only** | UC-017 旁证 ≠ 001 |
| NHP-001-ADV-01 | 001 | ADV | api | 主链内注入串 | 结构拒或 GuardrailHit；不改 confirmed 账 | **case-only** | 委派 031/032 |
| NHP-001-PERF-api-01 | 001 | PERF | api | 主链关键 HTTP P95 预算（隔离） | 有可复现脚本+收据；**≠** 线上 SLO | **case-only** / **blind** | verify:e2e-performance **not_run** |
| NHP-001-PERF-web-01 | 001 | PERF | web | golden UI 流式窗口预算 | 收据可复核；≠ 真机容量 | **case-only** / **blind** | e2e:ui 历史 not_run |
| NHP-001-LOAD-w-01 | 001 | LOAD | worker | 报告/评分队列积压形状 | 吞吐+积压指标收据；≠ HA | **case-only** / **blind** | — |
| NHP-002-BOUND-01 | 002 | BOUND | api | lease 竞态双 holder | 单胜出；另侧可解释拒 | **partial** | uc002:lease:prove |
| NHP-002-FAULT-01 | 002 | FAULT | api | 跨副本杀 SSE 后 LED 恢复 | Last-Event-ID 续传；无丢关键事件 | **blind**→**case-only** | uc010 旁证 ≠ 002 covered |
| NHP-002-ADV-01 | 002 | ADV | api | 伪造 LED / 跨用户 session | 401/403/空；不泄露他用户事件 | **blind**→**case-only** | uc033 旁证 |
| NHP-010-FAULT-01 | 010 | FAULT | api | 断 SSE→LED / R-mid | 续传成功；无双扣 | **partial** | uc010:sse-resume:prove |
| NHP-010-NEG-01 | 010 | NEG | api | 无权限 LED | authz 拒 | **partial** | R-authz |
| NHP-030-NEG-01 | 030 | NEG | api | token 过期/吊销 | 拒 + 刷新路径可测 | **partial** | neg:auth |
| NHP-030-BOUND-01 | 030 | BOUND | api | 时钟漂移边界 | 过期判定一致；无 silent extend | **case-only** | — |

### 1.2 钱 / 对账 / 放弃 / 重生成（011 / 014 / 017 / 018 / 019）

| Case ID | 派生 UC | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|---------|----|----|------------|--------------|--------|----------|
| NHP-011-NEG-01 | 011 | NEG | api | quarantine 后误退 | confirmed 不退；可解释 | **partial** | uc011 http/prove |
| NHP-011-FAULT-01 | 011 | FAULT | api/worker | 面试失败→released+额度净 0 | HTTP 额度口径 | **partial** | 同上 |
| NHP-011-BOUND-01 | 011 | BOUND | api | 幂等误 release | already_confirmed | **partial** | 同上 |
| NHP-011-ADV-01 | 011 | ADV | api | refund-callback 错签/重放 | 拒；无双退 | **gap**→**case-only** | 产品口缺失 = 仍 gap 执行面 |
| NHP-011-LOAD-w-01 | 011 | LOAD | worker | 并发失败退款风暴 | 无双退；账本一致收据 | **blind**→**case-only** | — |
| NHP-014-ADV-01 | 014/026 | ADV | api | webhook 重放/篡改七类 | 幂等+拒 | **gap**→**case-only** | 错签 403 partial 仅子集 |
| NHP-017-FAULT-01 | 017 | FAULT | api/db | begin-fail 孤儿 reserved | sweeper→released | **partial** | uc017:orphan:prove |
| NHP-017-BOUND-01 | 017 | BOUND | db | sweeper 幂等 | 重复扫无二次副作用 | **partial** | 同上 |
| NHP-017-LOAD-w-01 | 017 | LOAD | worker | 大量孤儿预占回收 | 回收完成+无漏扣；收据 | **blind**→**case-only** | — |
| NHP-018-NEG-01 | 018 | NEG | api | abandon 后复活尝试 | 拒；∉进行中 | **partial** | uc018 http |
| NHP-018-FAULT-01 | 018 | FAULT | worker | safe_terminating 注入 | 图安全终态；额度 released | **blind**→**case-only** | — |
| NHP-018-ADV-01 | 018 | ADV | api | abandon 对抗：replay / tamper body / cross-tenant abandon / forged auth / inject against `POST /api/interview/:id/abandon` | 拒或幂等安全；无跨租户写；无假 released；不泄露他用户；无双放 | **partial**（executed · post_prove_dual_pass） | `pnpm uc018:adv:prove` EXIT=0 · harness `harness/uc-e2e-018-adv.md` · `GAP-UC018-ADV` **CLOSED** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · **ADV alone ≠ covered** · Ban wash ADV into §1.1 · Ban claim PERF/LOAD closed · Ban flip §1.1 covered · mirror NHP-002-ADV-01 / NHP-011-ADV-01 |
| NHP-018-PERF-01 | 018 | PERF | api | `POST /api/interview/:id/abandon` 延迟（隔离 · N=100 · concurrency=10 · ≤2vCPU/4GiB） | p50≤250ms · p95≤750ms · p99≤1500ms · error_rate≤0.5% · 收据 `.tmp/uc018-perf-load-receipts/` + tracked `ai-docs/delivery/receipts/uc018-perf-load/`；**≠** 线上 SLO · **≠** 容量 · **≠** HA | **partial**（executed · awaiting_post_prove_dual） | `pnpm uc018:perf-load:prove` EXIT=0 · harness `harness/uc-e2e-018-perf-load.md` · Method freeze Step A `8c7ee0c` ancestor · caps Docker NanoCpus=2e9 Memory=4GiB · **PERF alone ≠ covered** · Ban wash into §1.1 · Ban claim production capacity/HA · cite `testing/e2e-performance-evidence.md` |
| NHP-018-LOAD-01 | 018 | LOAD | worker/api | 并发 abandon + release + graph safe-terminate（N=50 · concurrency=20） | 无双放 · 无 stuck reservations · error_rate≤1% · 收据 `.tmp/uc018-perf-load-receipts/` + tracked `ai-docs/delivery/receipts/uc018-perf-load/`；**≠** HA · **≠** 生产容量 | **partial**（executed · awaiting_post_prove_dual） | `pnpm uc018:perf-load:prove` EXIT=0 · harness `harness/uc-e2e-018-perf-load.md` · Method freeze Step A `8c7ee0c` ancestor · DB checks double-release=0 stuck=0 · **LOAD alone ≠ covered** · Ban wash into §1.1 · Ban claim production capacity/HA · cite reassess/`0b7a218` |
| NHP-019-FAULT-01 | 019 | FAULT | api | retry∥release 并发 | 无 released∧regen 非法组合 | **partial** | uc019 prove |
| NHP-019-BOUND-01 | 019 | BOUND | api | retry 幂等 | 单 regen 轨 | **partial** | 同上 |
| NHP-019-NEG-01 | 019 | NEG | api | quarantine regen | 404/可解释 GAP 钉 | **partial** | H3/H4 |

### 1.3 摄取 / 诊断押题 / career（015 / 016 / 004 / 025）

| Case ID | 派生 UC | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|---------|----|----|------------|--------------|--------|----------|
| NHP-015-NEG-01 | 015 | NEG | api | 加密/畸形/MIME | 422/415；无扣费 | **partial** | F1–F5 |
| NHP-015-BOUND-01 | 015 | BOUND | api | 0 字节 / 超大 413 | 入口拒 | **partial** | F2/F3 |
| NHP-015-FAULT-01 | 015 | FAULT | worker | OCR 管线宕 | 可解释失败；无悬挂消费 | **blind**→**case-only** | — |
| NHP-015-LOAD-w-01 | 015 | LOAD | worker | 并发大文件拒+小文件通 | 拒率/队列不炸；收据 | **blind**→**case-only** | 413 单点≠负载 |
| NHP-016-FAULT-01 | 016/029 | FAULT | api | 诊断/押题显式失败注入 | unavailable 终态；无死胡同 | **gap**→**case-only** | full.e2e 终态旁证 |
| NHP-004-FAULT-01 | 004 | FAULT | api | A3 失败降级 | 可解释；无假 completed | **gap** | 静态 G-GAP |
| NHP-025-NEG-01 | 025 | NEG | api | stale quiz 作输入 | reject/version-mismatch | **gap** | 产品未接线 |

### 1.4 对抗 / 越权 / 隐私 / B 端（031–033 / 050 / 040–043 / 027–028）

| Case ID | 派生 UC | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|---------|----|----|------------|--------------|--------|----------|
| NHP-031-ADV-01 | 031/032 | ADV | api/eval | 注入/越狱结构面 | GuardrailHit 或业务拒；**质量归 ai-eval** | **gap**(e2e)/**partial**(eval) | 禁 fake-model 冒充 |
| NHP-033-NEG-01 | 033 | NEG | api | 跨用户资源 | 404/403 不泄露 | **partial** | X1–X11 |
| NHP-033-ADV-01 | 033 | ADV | api | 七类越权未齐补集 | 系统化矩阵 | **partial**（未齐） | harness §1b |
| NHP-033-BOUND-01 | 033 | BOUND | api | X10 burst | 稳定拒；**≠** 容量 SLO | **partial**/**gap**(PERF) | X10 |
| NHP-033-FAULT-01 | 033 | FAULT | worker | A3 live worker 越权 | job RLS 闭环 | **blind**→**case-only** | W1≠闭环 |
| NHP-050-NEG-01 | 050–052 | NEG | api | DELETE 公开擦除 | **必须 503**（honesty-pin） | **partial**/honesty-pin | privacy-erasure:http |
| NHP-050-FAULT-01 | 050–052 | FAULT | worker | 擦除中途故障 | 不假 erased；可对账 | **blind**→**case-only** | ≠ 删除闭环 |
| NHP-040-BOUND-01 | 040–043 | BOUND | api | 席位 CAS / 批 partial_failed | 状态机载重 | **gap** | 静态 G-GAP |
| NHP-027-NEG-01 | 027 | NEG | api | 申诉口未开放 | blocked/honest gap 钉 | **gap**/blocked | 产品未接线 |
| NHP-028-FAULT-01 | 028 | FAULT | api | persistTrace 失败 | 主链路不阻塞（目标）；现 gap | **gap** | 静态 G-GAP |

### 1.5 RAG / 路由域（专家 mw-rag-route）

| Case ID | 派生 | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|------|----|----|------------|--------------|--------|----------|
| NHP-R2-NEG-01 | GAP-RAG-02 | NEG | worker | 未决/无 binding → `interview_ineligible_route`；缺 snapshot → retrieve fail-closed（G-R2-5）；**≠** classify 未接线（wire 已齐） | fail-closed / honesty PREREQ；R2 overall NOT closed | **partial** | r2-prereq / G-R2-5；P-MODEL…P-START/P-FAKE dual-passed；P-LIVE dual 收据齐；仍 ≠ 路由已生效 |
| NHP-R2-FAULT-01 | GAP-RAG-02 | FAULT | worker | retrieve 缺 snapshot | degraded denial；非 unscoped | **partial** | g-r2-5-retrieve-fail-closed |
| NHP-R4-NEG-01 | GAP-RAG-04 | NEG | worker | 缺/非法 snapshot → `route_snapshot_missing`；禁 unscoped | degraded denial（G-R2-5）；≠ R4 关 | **partial** | g-r2-5；r4 FOLLOW harness §6b |
| NHP-R4-FAULT-01 | GAP-RAG-04 | FAULT | worker | 生产 `recheck_failed` / seam recheck 可观测 | seam/`recheck_failed` 合同 + **FLIPPED** CALL_SITES≥1（wire present · post-REAL-WIRE-IMPL）；**仍 ≠ R4 closed / ≠ wrong_track=0 / ≠ ADV covered** | **gap**/honesty | `g4-dispatch-recheck-prereq` FLIPPED；recheck seam honesty only；本刀不改 wire |
| NHP-R4-BOUND-01 | GAP-RAG-04 | BOUND | worker | 有 snapshot 仅 primary max-bps leaf；非 per-turn planner leaf | 主叶 scoped only；≠ full dispatch | **partial**/honesty | qbank-retrieve-scope；FOLLOW §6b |
| NHP-R4-ADV-01 | GAP-RAG-04 | ADV | worker | wrong_track 跨域 | wrong_track=0 目标；wired assert+prove；**LIVE_PG_GAP dual receipts landed（honesty）**；covered prove EXIT=0 + post-prove dual PASS；**covered ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0 ≠ HA** | **covered**（THIS case only） | ADV honesty `post_prove_dual_pass`（§6f）；LIVE_PG `post_prove_dual_pass`（§6g · **separate honesty**）；covered knife **`post_prove_dual_pass`**（`harness/nhp-r4-adv-covered-path.md`；prove=0 · raw=1；dual reviews pass；meetwise elevate **partial→covered** THIS case only；NEG/FAULT/BOUND unchanged；sole allowlist 恰 5；`releaseEvidence=false`；≠HA；≠ R4 closed） |
| NHP-R4-PERF-01 | GAP-RAG-04 | PERF | api/worker | 隔离 track-local 检索 P95 | 有脚本+收据才可谈；现 blind | **blind** | 禁 pgvector 机械绿；≠ R4 关 |
| NHP-R5-PERF-01 | GAP-RAG-05 | PERF | api/worker | pgvector 夹具评测 | **green-risk** 标红；≠ sole-stack SLO | **blind**/green-risk | r5-mark-red |
| NHP-RAG-LOAD-01 | PRD-TEST-003/004 | LOAD | worker | 检索并发 | 有收据才可谈；现 blind | **blind** | qbank-pg-eval ≠ 发布 SLO；兼 R4 LOAD 盲区 |

### 1.6 分面 PERF / LOAD 总册（跨 UC）

| Case ID | 面 | 负载形状（登记） | 收据期望 | 当前旗 | 禁令 |
|---------|----|------------------|----------|--------|------|
| NHP-PERF-API-SUITE | api | 隔离 API 并发回归 + 契约负路径（脚本+参数冻结） | CMD+EXIT + `.tmp`/CI 收据；`releaseEvidence=false` | **case-only** / **not_run** | 历史数字不得当当前通过 |
| NHP-PERF-WEB-SUITE | web | production Next + Chromium/Pixel 流式窗口预算 | 可复核回执 | **case-only** / **not_run** | 单机 ≠ 真机容量 |
| NHP-LOAD-WORKER-SUITE | worker | 报告/OCR/队列积压形状（并发 N、持续 T） | 吞吐/积压/错误率收据 | **case-only** / **blind** | compose healthy ≠ 产能 |
| NHP-PERF-CLOUD | api/web/worker | THR-CLOUD-v1 | TargetGrant + 三联跑 | **blocked** | 无授权禁止硬跑 |
| NHP-LOAD-HA-FAULT | worker | HA fault-inject × 负载叠加 | 阶 C/D 收据 | **conn-only**/stub | stub ≠ HA |

---

### 1.7 具名 GAP / out-of-scope（禁沉默未列 · mw-e2e-ha B2）

> 下列为快乐路径常见盲区：**显式登记为 gap / out-of-scope**，不得因「矩阵未写」被误读为已隐含覆盖。`case-only` 此处未用——尚无评测用例 ID 时一律 **gap** / **out-of-scope**。

| Case ID | 派生 | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 读法 |
|---------|------|----|----|------------|--------------|--------|------|
| NHP-UI-PAY-NEG-01 | 001/011 | NEG | web | **UI 支付拒绝**（拒付/取消/渠道失败面） | 可解释拒 + 账本不双扣；现无具名 UI 用例 | **gap** / **out-of-scope** | ≠ 001-NEG api 额度；≠ 011 钱路径已覆盖 UI |
| NHP-CLOUD-KILL-FAULT-01 | TC-CLOUD / HA | FAULT | api/worker | **云 kill / 跨 AZ** 故障注入 | 跨 AZ 恢复收据；现无授权/无具名行 | **gap** / **out-of-scope** / blocked | ≠ PERF-CLOUD blocked alone；≠ HA stub |
| NHP-HA-FAILOVER-RTO-01 | HA / 002 | FAULT | worker | **多副本 failover · RTO** | 阶 C/D + RTO 收据；现 stub | **gap** / **out-of-scope** | ≠ LOAD-HA-FAULT conn-only；≠ 002-FAULT case-only 跨副本杀 SSE |

---

## 2. 快乐路径盲区清单（必须标红）

| 盲区 | 为何假阳性 | 缓解（本刀仅登记） |
|------|------------|--------------------|
| UC-E2E-001 宽 `e2e:isolated` 绿 | 被读成全 UC / 非快乐路径已齐 | §1.0 + NHP-001-* case-only；禁止升 covered |
| PERF 用终态秒数 | 420s 存活预算冒充 API/worker SLO | 分面 PERF_api / LOAD_worker 独立列 |
| F1–F5 / X10 / 413 | 单点边界冒充负载 | LOAD 列独立；保持 blind/case-only |
| R2/R5 prove 绿 | 路由已生效 / 召回 SLO | RAG 行 gap/green-risk；mw-rag-route 审 |
| DELETE=503 pin | 删除已闭环 | honesty-pin；NHP-050-FAULT case-only |
| 云/HA stub | 生产容量 / HA | blocked / Not HA |
| **UI 支付拒绝** | 未具名易被读成 001/011 已覆盖 | **显式 gap/out-of-scope**：NHP-UI-PAY-NEG-01 |
| **云 kill / 跨 AZ** | 未具名易被读成云行 blocked=已隐含 | **显式 gap/out-of-scope**：NHP-CLOUD-KILL-FAULT-01 |
| **多副本 failover/RTO** | stub/跨副本 SSE ≠ RTO 已证 | **显式 gap/out-of-scope**：NHP-HA-FAILOVER-RTO-01 |

---

## 3. 执行纪律（本刀）

1. **先**本表 + harness + eval + REQUEST 双审。  
2. **禁止**把 prove/EXIT=0 当「绿关」或扩大为 covered。  
3. Batch1+Batch2 已完成执行授权与 post-prove 双独立审；状态回写为 `post_prove_dual_pass`，仅 honesty/partial。Batch3 已完成执行授权、7× CMD EXIT=0，且 post-prove 双域独立审均 pass；状态回写为 **`post_prove_dual_pass`**，**仅 honesty/partial**。  
4. 任何 EXIT=0 必须带「≠ covered / ≠ R2 / ≠ R4 / ≠ HA / releaseEvidence=false」读法。

### 3.1 批次指针（轻量）

| 批次 | 状态 | 指针 |
|------|------|------|
| **Batch1** NEG+PERF（7 IDs） | **`post_prove_dual_pass`** · 仍 ≠ covered | `nhp-batch1-neg-perf.slice.md` · harness/eval · post-prove reviews |
| **Batch2** NEG/FAULT/BOUND（7 IDs） | **`post_prove_dual_pass`** · **仅 honesty/partial** · ≠ covered/R2/R4/HA | `nhp-batch2-neg-fault.slice.md` · `harness/nhp-batch2-neg-fault.md` · `eval/nhp-batch2-neg-fault.eval.md` · `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` + `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md`（均 pass） |
| **Batch3** FAULT/BOUND + R4 NEG/FAULT honesty（7 IDs） | **`post_prove_dual_pass`** · **仅 honesty/partial** · 7× EXIT=0 · ≠ covered / R2 / R4 / HA · R4-FAULT **FLIPPED** honesty | `nhp-batch3-fault-bound.slice.md` · `harness/nhp-batch3-fault-bound.md` · `eval/nhp-batch3-fault-bound.eval.md` · `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` · **pass** · `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` · **pass** |
| **NHP-R4-ADV-01 covered path** | **`post_prove_dual_pass`** · matrix **covered（THIS case only）** · **covered ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0 ≠ HA** · LIVE_PG dual = separate honesty · sole 恰 5 · companions unchanged | `nhp-r4-adv-covered-path.slice.md` · `harness/nhp-r4-adv-covered-path.md` · `eval/nhp-r4-adv-covered-path.eval.md` · `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-e2e-ha.md` · **pass** · `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md` · **pass** |

Batch2 IDs：NHP-002-BOUND-01 · NHP-010-FAULT-01 · NHP-011-NEG-01 · NHP-017-FAULT-01 · NHP-018-NEG-01 · NHP-019-FAULT-01 · NHP-R4-BOUND-01。  
**不含** Batch1 已做行；**不含** LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV 作本批 runnable。  
`releaseEvidence=false` · EXIT=0 ≠ covered。

Batch3 IDs：NHP-015-BOUND-01 · NHP-011-FAULT-01 · NHP-017-BOUND-01 · NHP-019-NEG-01 · NHP-033-BOUND-01 · NHP-R4-NEG-01 · NHP-R4-FAULT-01。  
**不含** Batch1+Batch2 已做行；**不含** LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV covered / 015-FAULT runnable（无 prove 锚）/ R4 wire 改动。  
`releaseEvidence=false` · **EXIT=0 ≠ covered** · **FLIPPED≠R4 closed** · **≠ HA**。

---

*Meetwise MAIN knife · non-happy + perf/load case matrix · 2026-09-16 ~19:57 PT · releaseEvidence=false · ≠HA · Batch1+Batch2+Batch3=post_prove_dual_pass（honesty only）· NHP-R4-FAULT-01 FLIPPED honesty · **NHP-R4-ADV-01=covered（THIS case only · covered≠R4 closed）** · NEG/FAULT/BOUND companions unchanged*
