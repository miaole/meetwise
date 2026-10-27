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
| NHP-001-PERF-api-01 | 001 | PERF | api | 主链关键 HTTP P95 预算（隔离） | 有可复现脚本+收据；**≠** 线上 SLO | **case-only**（**执行收据已落（2026-10-26 批 C EXEC）**：`pnpm uc001:nhp-perf-api:prove` **EXIT=0**（attempts 1,0）· N=100 c=10 runs=3 all-pass · p50 89.5–103.2ms/p95 99.9–127.4ms/p99 104.7–130.3ms/error_rate 0 · caps Docker 2cpu/4GiB enforced · consent 产品路径逐虚拟用户·桶种子豁免具名 · 零模型零 drain · **隔离≠生产容量≠SLO≠HA** · **EXIT0=case≠covered** · Ban 借收据宣 verify:e2e-performance 族复绿/NHP-PERF-API-SUITE 闭合（实例≠伞）· post 双审双 PASS 2026-10-26·#149 nail 落主线（merge 祖先亲证）·closed） | verify:e2e-performance **not_run** · `pnpm uc001:nhp-perf-api:prove` · 收据 `.tmp/uc001-perf-api-receipts/`（四件套）+ tracked gate stdout `ai-docs/delivery/receipts/nhp-001-perf-api-01/` |
| NHP-001-PERF-web-01 | 001 | PERF | web | golden UI 流式窗口预算 | 收据可复核；≠ 真机容量 | **case-only** / **blind**（**执行收据已落（2026-10-27 PERF-web EXEC·沿 NHP-001-PERF-api-01 形·措辞 case-only/blind 保留·格值零翻）**：`pnpm uc001:nhp-perf-web:prove` **EXIT=0**（attempts 6,0·红五次如实承登=goto 相对 URL harness 形/zombie context 串扰/signup 429 诊断/global 桶(60,1) stray 三次·零断言谓词变）· 10 断言 · N=100 c=1 串行 runs=3 all-pass·warmup 10 excluded·nearest-rank·timeout 10s/sample=error（p50 208.0–212.0ms / p95 234.0–235.0ms / p99 283.0–291.0ms / max 344.0–460.0ms / error_rate 0 · 阈值 15_000ms 三值同阈+0.5%·值源=stream-window.spec.ts:29 在树 15s broad ceiling·第二锚 :20 显式 timeout 15_000·读法钉：计分样本域内 p99 恒 ≤10s·15s 阈非约束面仅回归守卫名义上限）· per-sample 功能断言（唯一 80 轮窗+题面全唯一+终态可见）all-pass · Pixel 5 P-OBS 披露臂 N=20 观测入收据（p50 209.0ms/p95 240.0ms/p99 288.0ms·**Ban 当预算判据**）· caps 三容器 PG+api+web Docker 2cpu/4GiB HostConfig inspect 亲证（NanoCpus=2e9/Memory=4GiB ok=true×3·非自报）· Chromium 宿主驱动不封顶披露（单机 ≠ 真机容量）· D-BUILD 披露（量测构建携 `E2E_UI_STRESS='1'` build 期内联 e2e-guard-only 源 ≠ 洁净生产 bundle·build 在测量窗外）· 专用 proof 自启栈（隔离真 PG+api keyless+web production next build/start·STRESS 源 hermetic 零上游 fetch 零模型·signup prep 准入节律 1.05s+撞桶 ≤2 有界重试+`RL_SIGNUP_IP` 在树 perf/E2E 覆写口显式落档披露·est live=0）· **回归守卫预算 ≠ 线上 SLO ≠ 真机容量 ≠ HA** · **EXIT0=case≠covered** · Ban 借本收据宣 NHP-PERF-WEB-SUITE 闭合（实例≠伞）/生产 bundle 量测/SLO | e2e:ui 历史 not_run · `pnpm uc001:nhp-perf-web:prove` · 收据 `.tmp/uc001-perf-web-receipts/`（四件套）+ tracked gate stdout `ai-docs/delivery/receipts/nhp-001-perf-web-01/` |
| NHP-001-LOAD-w-01 | 001 | LOAD | worker | 报告/评分队列积压形状 | 吞吐+积压指标收据；≠ HA | **case-only** / **blind** | — |
| NHP-002-BOUND-01 | 002 | BOUND | api | lease 竞态双 holder | 单胜出；另侧可解释拒 | **partial** | uc002:lease:prove |
| NHP-002-FAULT-01 | 002 | FAULT | api | 跨副本杀 SSE 后 LED 恢复 | Last-Event-ID 续传；无丢关键事件 | **blind**→**case-only** | uc010 旁证 ≠ 002 covered |
| NHP-002-ADV-01 | 002 | ADV | api | 伪造 LED / 跨用户 session | 401/403/空；不泄露他用户事件 | **blind**→**case-only** | uc033 旁证 |
| NHP-010-FAULT-01 | 010 | FAULT | api | 断 SSE→LED / R-mid | 续传成功；无双扣 | **partial** | uc010:sse-resume:prove |
| NHP-010-NEG-01 | 010 | NEG | api | 无权限 LED | authz 拒 | **partial** | R-authz |
| NHP-010-ADV-01 | 010 | ADV | api | LED malformed 双门 400/伪造高游标/越权订阅复用/跨 user 注入拒收 | 400 具名码逐项；伪造高游标 200 空 catch-up+hold（R4 语义·非机制红）；越权 404 零泄出 | **blind**→**case-only** | `pnpm uc010:nhp-adv:prove` EXIT=0 双 fresh · 隔离 PG 收据（2026-10-26 批 B） |
| NHP-010-ADV-02 | 010 | ADV | api | 同主体双流游标交换（S2 高游标施于 S1/S1 低游标施于 S2）/双持实时跨流注入（0214 触发器+token 通道） | 零跨流帧交付（kind/payload 值域互斥种子）；token_delta 零出现（配主动注入对照）；账本 appended-exactly 零写副作用 | **blind**→**case-only** | `pnpm uc010:nhp-crossstream:prove`（SSE-ADV EXEC·收据随卷 2026-10-27） |
| NHP-030-NEG-01 | 030 | NEG | api | token 过期/吊销 | 拒 + 刷新路径可测 | **partial** | neg:auth |
| NHP-030-BOUND-01 | 030 | BOUND | api | 时钟漂移边界 | 过期判定一致；无 silent extend | **case-only** | `pnpm uc030:nhp-bound:prove` EXIT=0 双 fresh · 隔离 PG 收据（2026-10-26 clock 卷 · C/R/L 三臂族）· 48 断言真证据已落 #152（post 双 PASS 会签） |

### 1.2 钱 / 对账 / 放弃 / 重生成（011 / 014 / 017 / 018 / 019）

| Case ID | 派生 UC | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|---------|----|----|------------|--------------|--------|----------|
| NHP-011-NEG-01 | 011 | NEG | api | quarantine 后误退 | confirmed 不退；可解释 | **partial** | uc011 http/prove |
| NHP-011-FAULT-01 | 011 | FAULT | api/worker | 面试失败→released+额度净 0 | HTTP 额度口径 | **partial** | 同上 |
| NHP-011-BOUND-01 | 011 | BOUND | api | 幂等误 release | already_confirmed | **partial** | 同上 |
| NHP-011-ADV-01 | 011 | ADV | api | refund-callback 错签/重放 | 拒；无双退 | **gap**→**case-only** | 产品双口已落（主口 `POST /payment/refund-callback` + Path A · 2026-10-06 Line V/Z nail · 原「产品口缺失」句停用）；ADV 收据=case registration only：2026-10-26 EXEC tip 隔离 68/68+41/41 EXIT=0（`ai-docs/delivery/receipts/uc011-adv/`）· 执行面仍 case-only 非闭合（EXIT0≠covered） |
| NHP-011-LOAD-w-01 | 011 | LOAD | worker | 并发失败退款风暴 | 无双退；账本一致收据 | **blind**→**case-only** | `pnpm uc011:nhp-load:prove` EXIT=0 双 fresh · HTTP refund-callback 管道行使收据（1×refunded+(N-1)×already/跨单同流水→conflict·防空转钉·收据文无 worker 产能义·Ban 借 LOAD 收据宣 PERF SLO/生产容量/HA） |
| NHP-011-PERF-api-01 | 011 | PERF | api | refund-callback 负路径并发（错签 403×60+缺字段 400×60） | 全 403/400 零 5xx；状态面零变；延迟观测落收据（观测≠SLO≠容量） | **blind**→**case-only** | `pnpm uc011:nhp-load:prove` EXIT=0 · 四件套=命令+负载形状（16 并发 storm/4 单跨单/负路径 120）+期望形+收据路径（stdout PERF-OBSERVATION·隔离 PG）· **另沿 NHP-001-PERF-api-01 形补延迟分位 PERF 收据（2026-10-26 PERF_api 三收据刀·协调方派单序第 8 项）**：`pnpm uc011:nhp-perf-api:prove` **EXIT=0**（attempts 5,1·红留痕=0206 ACL/0046 严触发器两缝 harness 面承登）· begin 主链嘴（begin 预留→abandon 退还→entitlement 净零可见）N=100 c=10 runs=3 all-pass · p50 80.8–92.5ms/p95 92.3–143.9ms/p99 94.7–144.9ms/error_rate 0 · caps Docker 2cpu/4GiB 双容器 enforced · 桶种子豁免①具名·consent 零触点（夹具具名申明）· 零模型零 drain·钱净账 released=330 · 收据 `ai-docs/delivery/receipts/nhp-011-017-019-perf-api/01-*.log`+`.tmp/uc011-perf-api-receipts/` · **延迟分位收据≠refund-callback 负路径收据（两形状互不替代）** · EXIT0=case≠covered |
| NHP-014-ADV-01 | 014/026 | ADV | api | webhook 重放/篡改七类 | 幂等+拒 | **gap**→**case-only** | 错签 403 partial 仅子集 |
| NHP-014-NEG-01 | 014/026 | NEG | api | 验签门边界值（ts 窗锐缘 ±1s 口层双向/ts 类型形 string·null·bool·浮点/kind 反向互换 refunded 签打 pay 口） | 恰内双向 200·恰外/类型形 400·反向 403+零副作用 | **gap**→**case-only**（**真证据已落（2026-10-27 EXEC）**：`pnpm uc014:nhp-neg:prove` **EXIT=0 · 22 断言**（PC+N1–N9·attempts=1）· egress 零含词零登记臂形·收据 `ai-docs/delivery/receipts/nhp-014-neg-01/` · **EXIT0=case≠covered·post-prove dual 待审**） | 窗锐缘本体全树零臂（单测层 authz5a2 已行使·本刀=HTTP 口层传输证据层·Ban 宣「阈值本体首次行使」） |
| NHP-014-BOUND-01 | 014/026 | BOUND | api | 双口分叉（跨命名空间同流水/同单同串双列）+ 生命周期重放边界（refund-on-created/pay-on-refunded/退款后原流水重放/refund 换流水二次） | 双 200+两索引恰 1 行×2·并存证人·四臂 409+零副作用 | **gap**→**case-only**（**真证据已落（2026-10-27 EXEC）**：`pnpm uc014:nhp-bound:prove` **EXIT=0 · 22 断言**（B1–B6·attempts=1）· B2 语义证人 DISCLOSED 非产品意图背书·收据 `ai-docs/delivery/receipts/nhp-014-bound-01/` · **EXIT0=case≠covered·post-prove dual 待审**） | 跨 kind 臂全系分立命名空间证人（Ban 借 B1/B2 宣「跨口幂等统一」） |
| NHP-017-FAULT-01 | 017 | FAULT | api/db | begin-fail 孤儿 reserved | sweeper→released | **partial** | uc017:orphan:prove |
| NHP-017-BOUND-01 | 017 | BOUND | db | sweeper 幂等 | 重复扫无二次副作用 | **partial** | 同上 |
| NHP-017-LOAD-w-01 | 017 | LOAD | worker | 大量孤儿预占回收 | 回收完成+无漏扣；收据 | **blind**→**case-only**（**真证据已落（2026-10-07 Line Y nail）**：`pnpm uc017:nhp-load:prove` **EXIT=0** · 45 断言双 fresh @coding `dd471a74`（≡shipped `a7638deb`）· post-dual `adcbe17`/`f8b68a9` BOTH PASS · settled cohort 路由（S=10 真结算 outbox + C=10 并发 `settleOutbox`）· gap **`GAP-UC017-LOAD-01`** 登记 · **EXIT0 = case ≠ covered** · 行状态不动：保持 blind→case-only 措辞（诚实 case registration only），禁止升 covered/partial，coveredCount=8 不变） | `pnpm uc017:nhp-load:prove` · harness `harness/gap-uc017-load-sweep-nhp.md` · ≠ 017 covered |
| NHP-017-HTTP-FAULT-01 | 017 | FAULT | api | HTTP begin 202→reserved 可观测→fixture 租约过期注入（sweeper 同款·commit 后故障诚实模拟）→生产调度嘴 `reconcileOwner` 直调回收 | `staleReleased≥1`·consumption=released·额度回补·interview_unavailable 终态事件·HTTP GET 终态可读 | **case-only**（executed·EXIT0 = case ≠ covered·收据=仓根 `receipts/uc017-orphan-http-sse/00-exec.md`） | `pnpm uc017:orphan-http-sse:prove` · harness `harness/uc-e2e-017-orphan-http-sse.md` · ≠ 017 covered |
| NHP-017-HTTP-COMP-01 | 017 | FAULT | api | HTTP 补偿嘴：begin 202+reserved→`POST :id/abandon`→200 `released`（abandonInterviewAndRelease 区） | 额度净零·interview=abandoned·consumption=released | **case-only**（executed·EXIT0 = case ≠ covered·同上收据） | 同上·harness 同上 · ≠ 017 covered |
| NHP-017-SSE-FAULT-01 | 017 | FAULT | api | begin 202 后 SSE 建连→客户端中断注入（abort）→拆除本身零假释放零新 orphan；附 404 跨主体 events+429 槽满子臂（自建最小模块同进程承载·rev2 收紧形） | 原预占语义不变（reserved+恰 1 行+额度仍 -1+零假终态）；429 too_many_streams | **case-only**（executed·EXIT0 = case ≠ covered·同上收据） | 同上·harness 同上 · ≠ 017 covered |
| NHP-017-HTTP-BOUND-01 | 017 | BOUND | api | 同 interview 重复 HTTP begin（网络重试形·replay 臂沿 resume-reference-http 先例） | 202 `alreadyBegun` 同 jobId·start job 计数不变·恰 1 行 consumption·额度净零增量（不双扣） | **case-only**（executed·EXIT0 = case ≠ covered·同上收据） | 同上·harness 同上 · ≠ 017 covered |
| NHP-017-HTTP-NEG-01 | 017 | NEG | api | 错主体 abandon/events（HTTP 真嘴 RLS 零行 404） | 404 `not_found_or_forbidden`·原预占仍 reserved·额度未被触碰 | **case-only**（executed·EXIT0 = case ≠ covered·同上收据） | 同上·harness 同上 · ≠ 017 covered |
| NHP-017-PERF-api-01 | 017 | PERF | api | 报告链延迟（begin 预留→租约过期注入→reconcileOwner 回收→终态/报告可读·隔离） | p50≤250ms·p95≤750ms·p99≤1500ms·error_rate≤0.5%（隔离·≠线上 SLO≠容量≠HA） | **blind**→**case-only**（executed·EXIT0 = case ≠ covered） | **执行收据已落（2026-10-26 PERF_api 三收据刀·沿 NHP-001-PERF-api-01 形·协调方派单序第 8 项）**：`pnpm uc017:nhp-perf-api:prove` **EXIT=0**（attempts 1,0·首跑绿）· N=100 c=10 runs=3 all-pass · p50 100.7–107.6ms/p95 114.0–140.0ms/p99 116.2–150.3ms/error_rate 0 · caps Docker 2cpu/4GiB 双容器 enforced · 注入缝=租约过期 UPDATE+reconcileOwner 生产调度嘴直调（NHP-017-HTTP-FAULT-01 同款·测量窗含对账嘴=产品语义链本体·如实披露）· 桶种子豁免①具名·consent 零触点（夹具具名申明）· 零模型零 drain·对账净账 released=330/abandoned=330/事件 330 · 收据 `ai-docs/delivery/receipts/nhp-011-017-019-perf-api/02-*.log`+`.tmp/uc017-perf-api-receipts/` · **Ban 与 NHP-017-LOAD-w-01 settled cohort 收据互洗（两形状互不替代）** |
| NHP-018-NEG-01 | 018 | NEG | api | abandon 后复活尝试 | 拒；∉进行中 | **partial** | uc018 http |
| NHP-018-FAULT-01 | 018 | FAULT | worker | safe_terminating 注入 | 图安全终态；额度 released | **case-only**（authoritative for matrix §1.0.1 FAULT · D2） | graph/`pnpm uc018:graph:prove` · ≠ FAULT covered |
| NHP-018-BOUND-01 | 018 | BOUND | api | waiting_user-CAS abandon（`created\|active\|waiting_user`） | abandoned+released；额度净 0；∉ in-progress | **partial**（D1 · pinned `GAP-UC018-WAITING-USER` evidence / parent harness A/H-waiting-user） | `pnpm uc018:abandon:prove` + `pnpm uc018:abandon:http:prove` · Ban invent BOUND covered |
| NHP-018-ADV-01 | 018 | ADV | api | abandon 对抗：replay / tamper body / cross-tenant abandon / forged auth / inject against `POST /api/interview/:id/abandon` | 拒或幂等安全；无跨租户写；无假 released；不泄露他用户；无双放 | **partial**（executed · post_prove_dual_pass） | `pnpm uc018:adv:prove` EXIT=0 · harness `harness/uc-e2e-018-adv.md` · `GAP-UC018-ADV` **CLOSED** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · **ADV alone ≠ covered** · Ban wash ADV into §1.1 · Ban claim PERF/LOAD closed · Ban flip §1.1 covered · mirror NHP-002-ADV-01 / NHP-011-ADV-01 |
| NHP-018-PERF-01 | 018 | PERF | api | `POST /api/interview/:id/abandon` 延迟（隔离 · N=100 · concurrency=10 · ≤2vCPU/4GiB） | p50≤250ms · p95≤750ms · p99≤1500ms · error_rate≤0.5% · 收据 `.tmp/uc018-perf-load-receipts/` + tracked `receipts/archive/2026-09-batch23/receipts/uc018-perf-load/`（**implementer pre-commit runs · not evidence of record** · gitSha=8c7ee0c）；**≠** 线上 SLO · **≠** 容量 · **≠** HA | **partial**（`post_prove_dual_pass` · GAP-UC018-PERF-LOAD **CLOSED**） | `pnpm uc018:perf-load:prove` EXIT=0 · harness `harness/uc-e2e-018-perf-load.md` · prove tip `b29c191` · Step A `8c7ee0c` · evidence of record = dual `1745bee`/`37c89dc`+`e33dd63` · caps Docker NanoCpus=2e9 Memory=4GiB · p99@N=100 statistically weak · **PERF alone ≠ covered** · Ban wash into §1.1 · Ban claim production capacity/HA · cite `testing/e2e-performance-evidence.md` |
| NHP-018-LOAD-01 | 018 | LOAD | worker/api | 并发 abandon + release + graph safe-terminate（N=50 · concurrency=20） | 无双放 · 无 stuck reservations · error_rate≤1% · 收据 tracked（**implementer pre-commit runs · not evidence of record**）；**≠** HA · **≠** 生产容量 · **workerCapEnforced=false**（release+safe-terminate inside capped API · no separately capped worker） | **partial**（`post_prove_dual_pass` · GAP-UC018-PERF-LOAD **CLOSED**） | `pnpm uc018:perf-load:prove` EXIT=0 · harness `harness/uc-e2e-018-perf-load.md` · prove tip `b29c191` · evidence of record = dual `1745bee`/`37c89dc`+`e33dd63` · DB checks double-release=0 stuck=0 · **LOAD alone ≠ covered** · Ban wash into §1.1 · Ban claim production capacity/HA · cite reassess/`0b7a218` · Ban cite `canHonestlyFlip@b29c191` as assessed（constant-false no-flip guard） |
| NHP-019-FAULT-01 | 019 | FAULT | api | retry∥release 并发 | 无 released∧regen 非法组合 | **partial** | uc019 prove |
| NHP-019-BOUND-01 | 019 | BOUND | api | retry 幂等 | 单 regen 轨 | **partial** | 同上 |
| NHP-019-NEG-01 | 019 | NEG | api | quarantine regen | 404/可解释 GAP 钉 | **partial** | H3/H4；**勘误 2026-10-26·E2E 台账滞后笔**：本行「404/可解释 GAP 钉」系 report-retry D2 面旧口径——quarantine 面已 PIN_RETIRED、D2 五件本体已落主线 `f93984a9a`（H3 已翻 quarantined retry→200 requeued:true · `GAP-UC019-QUARANTINE-REGEN` 退役）；行旗 partial 及其余措辞零动；已随 report-retry D2 落主线出账·留痕不洗 |
| NHP-019-ADV-01 | 019 | ADV | api | regenerate/retry 对抗注入（未鉴权/跨 owner/伪造状态/连点重放 RL/quarantined 出口） | 401/404/429 拒面+零扣费不变·无重复入队 | **case-only**（blind→） | `pnpm uc019:nhp-adv:prove` EXIT=0 双 fresh（2026-10-26 行使 · V1-V6 44 断言 · attempt1 fixture 预算红留痕 · REQUEST `harness/uc019-e2e-REQUEST.md` §1.4/§9-EXEC）· **case registration only ≠ covered** · 行旗不加 partial/covered · coveredCount=8 不变 |
| NHP-019-PERF-api-01 | 019 | PERF | api | 重试链延迟（报告失败可读→HTTP retry→重排可读·隔离·RL 3/h/报告 每报告恰 1 次） | p50≤250ms·p95≤750ms·p99≤1500ms·error_rate≤0.5%（隔离·≠线上 SLO≠容量≠HA）·regenerate 免费零加账（D1） | **blind**→**case-only**（executed·EXIT0 = case ≠ covered） | **执行收据已落（2026-10-26 PERF_api 三收据刀·沿 NHP-001-PERF-api-01 形·协调方派单序第 8 项）**：`pnpm uc019:nhp-perf-api:prove` **EXIT=0**（attempts 1,1·红留痕=prep 内 reserve 先于桶种子序错承登）· N=100 c=10 runs=3 all-pass · p50 40.6–44.9ms/p95 48.5–63.0ms/p99 50.5–69.7ms/error_rate 0 · caps Docker 2cpu/4GiB 双容器 enforced · 注入缝=setupFailedReport 夹具形（enqueue→claim→markReportFailed·窗外具名·沿 uc019-report-regenerate-http 先例）· 桶种子豁免①具名·consent 零触点（如实申明）· 零模型零 drain·confirmed=330 恒态零加账·RL 恰 1≤桶零 429 · 收据 `ai-docs/delivery/receipts/nhp-011-017-019-perf-api/03-*.log`+`.tmp/uc019-perf-api-receipts/` · **Ban 与 NHP-019-ADV-01 对抗拒面收据互洗（两形状互不替代）** |

### 1.3 摄取 / 诊断押题 / career（015 / 016 / 004 / 025）

| Case ID | 派生 UC | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|---------|----|----|------------|--------------|--------|----------|
| NHP-015-NEG-01 | 015 | NEG | api | 加密/畸形/MIME | 422/415；无扣费 | **partial** | F1–F5 |
| NHP-015-BOUND-01 | 015 | BOUND | api | 0 字节 / 超大 413 | 入口拒 | **partial** | F2/F3 |
| NHP-015-FAULT-01 | 015 | FAULT | worker | OCR 管线宕 | 可解释失败；无悬挂消费 | **blind**→**case-only** | — |
| NHP-015-LOAD-w-01 | 015 | LOAD | worker | 并发大文件拒+小文件通 | 拒率/队列不炸；收据 | **blind**→**case-only** | 413 单点≠负载；**EXEC 红停登记（2026-10-26 行使席·定标后未行使·零硬造收据）**：注册形=具名 case 零收据零在树命令——`package.json`/`scripts/run-e2e-isolated.mjs`/proof 文件三面亲证零 `uc015:nhp-load*`（同族先例仅 uc011/uc017 两 nhp-load）·git 全史零 `uc-e2e-015-nhp-load`·批 C REQUEST `harness/nhp-batch-c-REQUEST.md:21`「锚 `—`·留后刀」亲点——行使前提「命令在树可跑」不成立；且期望形（并发大文件拒+小文件通→拒率/队列收据）属 worker 吞吐/积压刚性面·超出本地隔离形（§1.6 NHP-LOAD-WORKER-SUITE「compose healthy ≠ 产能」自钉）→ 如实登记「**需中大工程环境·归排期**」·零产品码触·EXIT 面无（未行使）·coverage-matrix `:151` UC-E2E-015 LOAD 列 blind 格零动·本行旗 blind→case-only 措辞零动·coveredCount=8 不变·Ban 借 F1–F5/ADV/413 单点收据冒充本 case 负载收据·**2026-10-27 协调方红停采信（总盘 R37）→归中大工程排期（worker 负载伞 R43 同批）·并入自 line/loadw-exec `62f75399d`** |
| NHP-015-ADV-01 | 015 | ADV | api | 对抗注入/伪造声明面（魔数 fail-closed/429 突发桶/503 全局解析槽/NUL 注入） | 422 `magic_mismatch`（先于解析）；429 `too_many_requests`（第 16 次）；503 `server_busy`（败者 ≥1 胜者不受损）；NUL 剥除零透传；拒面零扣 | **blind**→**case-only**（**真证据已落（2026-10-26 批 C EXEC）**：`pnpm uc015:nhp-adv:prove` **EXIT=0**（attempts 1,0 · 首跑绿）· 30 断言（PC+A1–A5+V1+N）· 0189 真迁移链重放（共享槽 lease·harness 面）· RESUME_PARSE_MAX=1 仅测试进程窗（产品缺省 6 不改）· F1–F5 旁证零改动 reason 级可分 · **EXIT0 = case ≠ covered** · 行状态不动：blind 保持+case-only 措辞（诚实 case registration only），禁止升 covered/partial，coveredCount=8 不变 · post 双审双 PASS 2026-10-26·#149 nail 落主线（merge 祖先亲证）·closed） | `pnpm uc015:nhp-adv:prove` · F1–F5 旁证（`uc-e2e-015-resume-ingest-failures.proof.ts` 零改动）· ≠ 015 covered |
| NHP-016-FAULT-01 | 016/029 | FAULT | api | 诊断/押题显式失败注入 | unavailable 终态；无死胡同 | **gap**→**case-only**（**真证据已落（2026-10-07 Line Y2 nail）**：`pnpm uc016:nhp-fault:prove` **EXIT=0** · 45 断言双 fresh @`12a350f7`（链 `2051d12a`→`20fe852d`→`12a350f7`）· F3 按实际行为 `schema_validation_failed` · **E3 transient NOT claimed** · F4 按 D1 重建映射断言（spec 字面 failed→pending 重试口产品不存在 · 非字面口 · 旧对象停 failed 不复活）· scripted 缝零 live · attempts 1,0 · post-dual `4efa85fe`/`822d533b` BOTH PASS · gap **`GAP-UC016-FAULT-01`** 登记 · **EXIT0 = case ≠ covered** · 行状态不动：保持 gap→case-only 措辞（诚实 case registration only），禁止升 covered/partial，coveredCount=8 不变） | full.e2e 终态旁证；`pnpm uc016:nhp-fault:prove` · harness `harness/gap-uc016-fault-inject-nhp.md`（+micro-patch `95b1fd95` 键面）· ≠ 016/029 covered |
| NHP-016-NEG-01 | 016/029 | NEG | api | quiz/diagnosis 业务负路径族（400/404/409/402/幂等/CAS/跨用户） | 400 `missing_resume_id`；404 `not_found_or_forbidden`；409 他人 resume/预绑壳 CAS；402 `insufficient_entitlement` 零桶净 0；alreadyBegun 同 jobId 恰 1 job 行；abandon 族（ready 409 `cannot_abandon`/released/error）；跨用户 get+events 404 不泄露；全程额度净账 | **gap**→**case-only**（**真证据已落（2026-10-26 批 C EXEC）**：`pnpm uc016:nhp-neg:prove` **EXIT=0**（attempts 1,0 · R1 EXIT1=夹具 0121 pgp ACL 缺口 harness 面·零断言面被行使·零产品码触）· 53 断言（PC+N1–N8 双口）· consent+resume 走产品路径（consent 种子豁免未行使·如实申明）· **EXIT0 = case ≠ covered** · 行状态不动：gap 保持+case-only 措辞（诚实 case registration only），禁止升 covered/partial，coveredCount=8 不变 · post 双审双 PASS 2026-10-26·#149 nail 落主线（merge 祖先亲证）·closed） | `pnpm uc016:nhp-neg:prove` · `neg-input`（传输层 413/畸形 JSON）旁证互不替代 · ≠ 016/029 covered |
| NHP-004-BOUND-01 | 004 | BOUND | api | 重复 begin/重复幂等/advisory 锁并发 | 接管 version+1；单 active 行；lease 120s 刷新；非 202 alreadyBegun | **gap**→**case-only** | `pnpm uc004:nhp-bound:prove` EXIT=0 双 fresh · 隔离 PG 收据（2026-10-26 批 B） |
| NHP-004-ADV-01 | 004 | ADV | api | 伪造/越权 POST + fail seam（production-off） | pre-tx 双 409 先行；有效 pre+seam→500+failed v≥2；越权 404 | **blind**→**case-only** | `pnpm uc004:nhp-adv:prove` EXIT=0 双 fresh · 隔离 PG 收据（2026-10-26 批 B） |
| NHP-004-FAULT-01 | 004 | FAULT | api | A3 失败降级 | 可解释；无假 completed | **gap** | 静态 G-GAP |
| NHP-025-NEG-01 | 025 | NEG | api | stale quiz 作输入 | reject/version-mismatch | **gap** | 产品未接线 |
| NHP-003-NEG-01 | 003 | NEG | web/api 契约 | API 上传链 NEG 码域（resume.service 上传链 HttpException 18 码·方法级 scope=uploadGate/uploadFile/uploadImageViaOcr/uploadInTransaction·list/get/delete 面排除）↔ web 映射链（ocr-preview-ui 20 键×zh/en）契约符合性：N1a 16 码 ∈zh∧∈en·N1b encrypted/magic_mismatch 显式 gap 臂（产品契约缺口·backlog 移交协调方·非 EXIT1·零断言放宽）·N2 真信封 16 码 exact en 钉+两缺位码 upload_failed fallback 形+zh hint 零透传·N3 状态耦合全状态域（413 状态优先真行为如实行使）·N4 zh 对照·F1 abort/timeout 薄臂 | 18 码枚举恰等·16⊆20 亲证·缺位两码 fail-closed 兜底行为如实钉·en 面 CJK-free | **gap**→**case-only**（**真证据已落（2026-10-27 EXEC）**：`pnpm uc003:nhp-neg:prove` **EXIT=0 · 129 断言**（attempts=3 台账在卷：①源读路径形 ②extracted_too_long 413 真路由双面拆分 ③Map 形零 warning·零断言谓词变）· 离线纯函数+静态源对账零 PG 零外呼零 key·egress 零含词零登记臂形（inventory 376 届值恒等）· 收据 `ai-docs/delivery/receipts/nhp-003-neg-01/` · **EXIT0=case≠covered·post-prove dual 待审**） | `pnpm uc003:nhp-neg:prove` · 批 A `NHP-003-ADV-01` 对抗面旁证互不替代·web-logic TC-RES-081 zh 缺省臂旁证·≠ 003 covered |
| NHP-003-DOM-01 | 003 | DOM（§1.0.2 结构面） | web | locale=en DOM 残面：UI 门行使（`uc003:i18n-locale-ui:prove` 旋钮）·D0 既有 spec 零改动复跑（迁移区三点 CJK 零残留+空文件臂 en+/login en smoke+具名 allowlist 全页残留清点）·D1 本地拒 en 臂 test-only 增臂（非 preview env png→actions.ts:119 resumeImageRefusedLocally→`#resume-upload-error` en `image_ocr_unavailable` 文案 exact 钉+CJK-free·DOM 层仅 message·error 码透传断言落纯函数层 D1-PF） | en 渲染 CJK-free+exact 文案钉·allowlist 清点全 allowlisted | **case-only**（face 值 partial 保持·**真证据已落（2026-10-27 EXEC）**：`pnpm uc003:i18n-locale-ui:prove` **EXIT=0 双 fresh**（1 passed 1.7s+2.7s·chromium·E2E_UI_SKIP_WORKER=1 零模型零外呼·Key 通道=loader 方式 b 同 shell 注入零 .env 落盘·est live=0）· D2 preview-format 臂/API-response DOM 臂/管道故障面 NOT claimed 如实登记 · 收据 `ai-docs/delivery/receipts/nhp-003-dom-01/` · **EXIT0=case≠covered·post-prove dual 待审**） | spec `apps/web/e2e-ui/uc003-i18n-locale.spec.ts`（D1 test-only 增臂·既有臂零改动）· wave78/79 红绿台账先例 · ≠ 003 covered · Ban 借 DOM 收据宣 locale=en 全页零残留（具名 allowlist 残面在列） |

### 1.4 对抗 / 越权 / 隐私 / B 端（031–033 / 050 / 040–043 / 027–028）

| Case ID | 派生 UC | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 既有锚点 |
|---------|---------|----|----|------------|--------------|--------|----------|
| NHP-031-ADV-01 | 031/032 | ADV | api/eval | 注入/越狱结构面 | GuardrailHit 或业务拒；**质量归 ai-eval** | **gap**(e2e)/**partial**(eval) | 禁 fake-model 冒充 |
| NHP-033-NEG-01 | 033 | NEG | api | 跨用户资源 | 404/403 不泄露 | **partial** | X1–X11 |
| NHP-033-ADV-01 | 033 | ADV | api | 七类越权未齐补集 | 系统化矩阵 | **partial**（未齐） | harness §1b |
| NHP-033-BOUND-01 | 033 | BOUND | api | X10 burst | 稳定拒；**≠** 容量 SLO | **partial**/**gap**(PERF) | X10 |
| NHP-033-FAULT-01 | 033 | FAULT | worker | A3 live worker 越权 | job RLS 闭环 | **blind**→**case-only** | W1≠闭环 |
| NHP-050-NEG-01 | 050–052 | NEG | api | DELETE 公开擦除 | **必须 503**（honesty-pin） | **partial**/honesty-pin | privacy-erasure:http + uc052 NEG-01 |
| NHP-050-NEG-02 | 050–052 | NEG | worker/db | forged JWS / GUC-only claim | refuse · zero side effects | **partial** | `uc052:internal-erasure:prove` @`3c4847a` · EOR `08d54f8`/`3e39c1e` |
| NHP-050-NEG-03 | 050–052 | NEG | worker/db | cross-tenant claim | refuse · other subject intact | **partial** | same |
| NHP-050-FAULT-01 | 050–052 | FAULT | worker | 擦除中途单 sink fail | target `failed` · req `pending_external` · retry → erased | **partial** | same · Ban `partial_failed`/`completed` |
| NHP-050-FAULT-02 | 050–052 | FAULT | worker | begin replay idempotency | same requestId · same projection target ids | **partial** | same |
| NHP-050-FAULT-03 | 050–052 | FAULT | worker | fence-revive after purge | write rejected · admin read=0 | **partial** | same |
| NHP-050-FAULT-04 | 050–052 | FAULT | worker | epoch/digest drift mid-flight | claim refuse · req **`=== purging`** | **partial** | same · Ban `completed`/`partial_failed` |
| NHP-050-FAULT-05 | 050–052 | FAULT | worker | already-erased re-request | no duplicate effective erasure · first ledger stable | **partial** | same · optional follow-up: second-req explicit no-op |
| NHP-050-BOUND-01 | 050–052 | BOUND | worker | concurrent claim lease | winners=1 · no deadlock · single ledger | **partial** | same · 0091 lease |
| HP-050-01 | 050–052 | HP | worker | happy internal authorized erasure | locals admin read=0 · externals `retention_pending` · req `pending_external` | **partial** | same · **≠ covered** · ≠ open DELETE · fence-only checkpoint |
| NHP-050-KILL-01 | 050 | FAULT+NEG+BOUND | api | kill-switch 触发面（应用层 env 闸·语义命名避让 `NHP-050-FAULT-01..05` 擦除域占名） | env=1 begin/turn → 503 `content_safety_kill_switch_active`+诚实文案逐字+净账零副作用（闸先于 DB 会话/扣额/入队）；非法值 → 500 `internal_error` fail-closed+日志词面；off/unset → 202 现状字节对照；双闸同设 → kill 码先行 | **gap**→**case-only**（**真证据已落（2026-10-27 开关刀 EXEC）**：`pnpm uc050:nhp-kill:prove` **EXIT=0**（attempts 台账随卷）· K1–K6 断言（隔离 PG 真 HTTP+子进程 env 变体 spawn 面·假 DB 论证 503 路径零 DB 依赖）· **applications.start 绕行残余 NOT claimed**（`applications.service.ts:44-58` 只登记零臂·Ban 就地补线）· 图面归 UC-018 先例（`49a33634`）互不替代 · i6-239 静态词面门=邻接旁证互不借用 · **EXIT0 = case ≠ covered** · 行状态不动：gap 保持+case-only 措辞（诚实 case registration only），禁止升 covered/partial，coveredCount=8 不变 · post dual 待） | `pnpm uc050:nhp-kill:prove` · ≠ `privacy-erasure:http`（UC-052 DELETE pin）· ≠ `public-preview-write-gate` · REQUEST `harness/killsw-REQUEST.md` §1.4 Case 1 · ≠ 050 covered |
| NHP-051-NOPII-01 | 051 | NEG+FAULT+BOUND | api | 无 PII 面（业务黄金路径日志扫描/trace 脱敏/堆栈原文） | 简历全文/答案哨兵经产品路径（consent→resume→begin→turn 形 B 409 现状形状）后全日志行零哨兵；boot env secret 值+Bearer 形零入卷；trace 脱敏 (b) 纯行使面（redactOutput→`{redacted:true}`+replayable=false+safe metadata 伪名零原文）；未知错响应体 opaque+堆栈只进日志零业务哨兵；query 剥离复证 | **blind**→**case-only**（**真证据已落（2026-10-27 开关刀 EXEC）**：`pnpm uc051:nhp-nopii:prove` **EXIT=0**（attempts 台账随卷）· P1–P5+PC/LV 断言（子进程 boot 真 HTTP+pino fd1 全量抓取·obs-logging 先例形·业务哨兵≠合成探针 reason 级可分=新证据层）· oracle 前提钉履行（扫描前哨兵经产品路径在场对照+日志捕获面活性对照非哨兵在场）· 运行时 mask/白名单零触归 opt-in smoke 域如实登记 · **EXIT0 = case ≠ covered** · 行状态不动：blind 保持+case-only 措辞（诚实 case registration only），禁止升 covered/partial，coveredCount=8 不变 · post dual 待） | `pnpm uc051:nhp-nopii:prove` · ≠ obs-logging（infra 合成探针面·Ban 互借）· REQUEST `harness/killsw-REQUEST.md` §1.4 Case 2 · ≠ 051 covered · 非「PII 全域零泄」宣称 |
| NHP-040-BOUND-01 | 040–043 | BOUND | api | 席位 CAS / 批 partial_failed | 状态机载重 | **gap** | 静态 G-GAP |
| NHP-027-NEG-01 | 027 | NEG | api | 申诉口未开放 | blocked/honest gap 钉 | **gap**/blocked | 产品未接线 |
| NHP-028-FAULT-01 | 028 | FAULT | api | persistTrace 失败 | 主链路不阻塞（目标）；现 gap | **gap** | 静态 G-GAP · 收据已落（2026-10-07 Line X nail · `pnpm uc028:nhp-fault:prove` EXIT=0 40/40 双 fresh · post dual BOTH PASS）· 收据物 `receipts/archive/2026-09-batch23/receipts/2026-10-07-nhp-028-fault-01-trace-fail-open-prove.md`（在树亲证）· gap 值不动 |

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
| DELETE=503 pin | 删除已闭环 | honesty-pin retained；UC-052 deletion **partial** ≠ 闭环 ≠ covered；NHP-050-* proven → **partial** |
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
| **Batch2** NEG/FAULT/BOUND（7 IDs） | **`post_prove_dual_pass`** · **仅 honesty/partial** · ≠ covered/R2/R4/HA | `nhp-batch2-neg-fault.slice.md` · `harness/nhp-batch2-neg-fault.md` · `eval/nhp-batch2-neg-fault.eval.md` · `receipts/archive/2026-09-batch23/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` + `receipts/archive/2026-09-batch23/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md`（均 pass） |
| **Batch3** FAULT/BOUND + R4 NEG/FAULT honesty（7 IDs） | **`post_prove_dual_pass`** · **仅 honesty/partial** · 7× EXIT=0 · ≠ covered / R2 / R4 / HA · R4-FAULT **FLIPPED** honesty | `nhp-batch3-fault-bound.slice.md` · `harness/nhp-batch3-fault-bound.md` · `eval/nhp-batch3-fault-bound.eval.md` · `receipts/archive/2026-09-batch23/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` · **pass** · `receipts/archive/2026-09-batch23/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` · **pass** |
| **NHP-R4-ADV-01 covered path** | **`post_prove_dual_pass`** · matrix **covered（THIS case only）** · **covered ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0 ≠ HA** · LIVE_PG dual = separate honesty · sole 恰 5 · companions unchanged | `nhp-r4-adv-covered-path.slice.md` · `harness/nhp-r4-adv-covered-path.md` · `eval/nhp-r4-adv-covered-path.eval.md` · `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-e2e-ha.md` · **pass** · `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md` · **pass** |

Batch2 IDs：NHP-002-BOUND-01 · NHP-010-FAULT-01 · NHP-011-NEG-01 · NHP-017-FAULT-01 · NHP-018-NEG-01 · NHP-019-FAULT-01 · NHP-R4-BOUND-01。  
**不含** Batch1 已做行；**不含** LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV 作本批 runnable。  
`releaseEvidence=false` · EXIT=0 ≠ covered。

Batch3 IDs：NHP-015-BOUND-01 · NHP-011-FAULT-01 · NHP-017-BOUND-01 · NHP-019-NEG-01 · NHP-033-BOUND-01 · NHP-R4-NEG-01 · NHP-R4-FAULT-01。  
**不含** Batch1+Batch2 已做行；**不含** LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV covered / 015-FAULT runnable（无 prove 锚）/ R4 wire 改动。  
`releaseEvidence=false` · **EXIT=0 ≠ covered** · **FLIPPED≠R4 closed** · **≠ HA**。

---

*Meetwise MAIN knife · non-happy + perf/load case matrix · 2026-09-16 ~19:57 PT · releaseEvidence=false · ≠HA · Batch1+Batch2+Batch3=post_prove_dual_pass（honesty only）· NHP-R4-FAULT-01 FLIPPED honesty · **NHP-R4-ADV-01=covered（THIS case only · covered≠R4 closed）** · NEG/FAULT/BOUND companions unchanged*
