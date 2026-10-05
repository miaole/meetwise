# REQUEST — **GAP-UC004-FI3-GRAPH-WIRING · 产品接线** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc004-fi3-graph-wiring.md` · slice `gap-uc004-fi3-graph-wiring.slice.md`
**Parent tip**: `377e7fc`（full `377e7fc4fa1b35b85ebf524b668469caf66de2bc` · origin/feat/mysql-schema-skeleton）
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

C'' prove（EXIT=1，dual `aafdffbe`/`4d8dc5d` + nail `a27e384`）+ P 线修复回归（nail `845d357`，FI-1 attempt 1→0）后，`uc004:career-path-fault:prove` 全量 EXIT=1 的唯一残留根因是 **FI-3 结构性不可达**：career-path 同步 derive（`interview.service.ts:768-791`）、无 AiGraphRun(career-path) 接线、`ai_graph_run` career-path rows=0。本刀（Line T）求 FI-3 接线授权：`AiGraphRun` 行真实 create/reuse（active, version+1）+ 失败状态机 active→failed 真落库。请审：

1. **方案裁决（evidence-honesty 焦点）**：候选 A 图包装 derive（推荐）/ B 仅失败记账（默认不推荐：failed 行无 active 阶段，「active→failed」转换证据做不出，与 Ban 伪造 failed run 边界模糊）/ C 完整图化（越界 GROWTH/UNCERTAINTY/GRAPH/E2E-MAIN 其它 gap 面）。三候选利弊与共同铁律见 harness。
2. **诚实原则**：失败必须真落 `AiGraphRun=failed`（真实 active 阶段 + version 递增转换证据）；Ban 伪装成功、Ban 200-假成功、Ban 无 active 阶段的装饰性行、Ban 吞错；**对外契约冻结**（成功响应体 / 错误信封 / GET 语义 / `deriveCareerPath` 纯函数原样——Ban 为绿而改变业务语义）。
3. **触碰面收敛**：仅 `packages/ai-graphs/src/career-path.ts`（新增）+ `index.ts` 导出 + `interview.service.ts` 仅 `generateCareerPath` 区段 + 注入 seam + 必要测试 + prove 工具层；**迁移无**；Ban 借刀改其他 interview 路径 / outbound 主链 / model-client（Line C 域）/ worker lifecycles / `principal.ts` / 静态 mark-red prove。
4. **注入 seam**：TC-E2E-004-fail 的 `graph(fake-model)` 注入法 = ai-graphs 依赖注入约定的诚实用法；thread-scoped、env-gated、默认关闭（env 未设零行为差），与 prove 单 API 子进程多 attempt 共存；Ban 用 seam 改变正常业务语义、Ban 开无申报的洞。
5. **prove 升级契约（工具层最小增量 · 交双审裁，先例 = FI1-CHILD-SURVIVES）**：FI-3 attempt 从静态不可达探测器升级为真注入 + 真观察（新增 `IV_FI3` 种子；断言集 ① POST 可解释失败 ② per-thread 恰一行 `failed` + version>=2 转换证据 ③ GET 404 ④ 账本净变 0 ⑤ server alive ⑥ in-fault 重试不污染 ⑦ 静态接线证据降为 evidence 字段）；`FI1-NO-FAKE-GRAPH-RUN`（全局 `graphRuns===0`）等强改写为 per-thread 真实执行证据——改写前后断言原文 receipt 全披露；**Ban 减既有项、Ban 放宽（接受 status 任意/无 version 证据 = FAIL）**。
6. **EXIT 诚实契约**：期望 attempts=4 全 0 → 全量 EXIT 1→0；实测若非如此按实际行为断言并如实落 receipt；attempts 全记录 · one-shot · 隔离壳三层包装不变（per-run 随机容器 + 动态端口 + attestation）· machine receipts 落 `.tmp/isolated-proof-receipts/` · **Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban retry-to-green、Ban 把 EXIT1 记成 flake**。
7. **A3 关闭路径**：本刀 prove EXIT0 + post-prove dual PASS + 协调方 nail 三段全链；EXIT0 ≠ A3 closed（C'' 原钉）；**本 REQUEST 不预claim**、本 stub 不授权 coding / prove / push。

Row `UC-E2E-004` FAULT column stays gap · Case `NHP-004-FAULT-01` stays gap · 本行其余 gap（E2E-MAIN/GRAPH/GROWTH-A1A2/UNCERTAINTY）不因本刀关闭 · **Ban covered** · **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）· Ban 翻任何 SSOT 行。

pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual 审查 — mw-e2e-ha（evidence-honesty / EXIT 契约焦点）· 2026-10-05

**审法**：只认命令 + EXIT + 可复现证据；Ban 自批实现；alone ≠ dual。环境事实如实记录：GitHub 网络不通，本审全部基于**本地分支/ref**。审查 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-t-e2e-ha` @ `rv/t-e2e-ha`（= 本地 tip `1c57bb3`）；被审 REQUEST `f4b95fe`（`docs(e2e): REQUEST UC-004 FI-3 graph wiring (pre_dual)`）。

**docs-only / 祖先验证（实测）**：`git worktree add … -b rv/t-e2e-ha feat/mysql-schema-skeleton` 成功；`git merge-base --is-ancestor f4b95fe rv/t-e2e-ha` → OK；`git show --stat f4b95fe` = **恰 4 新增 .md**（slice + harness + 双 stub）224 insertions / 0 deletions，零代码、零 SSOT 文件（矩阵/checklist/backlog 不在其中）→ **docs-only 成立**。`377e7fc..1c57bb3` 全链 diff 12 文件全 .md（650 insertions），代码行号引用跨链稳定。

### 核查表（全部本地实测）

| # | 项 | 证据（命令/位置） | 结果 |
|---|----|------------------|------|
| 1 | docs-only + 祖先链 | `git show --stat f4b95fe` · `git merge-base --is-ancestor` | PASS |
| 2 | FI-3 结构性不可达现状 | `interview.service.ts:768` `generateCareerPath` / `:783` `deriveCareerPath` 同步调用实读；`packages/ai-graphs/src` 无 career 图文件；`index.ts:3` 路线图注释逐字属实（注：该注释「四图之二」相对 report/adaptive 导出已 stale，但 career-path 缺席为真、harness 引用准确，不影响裁决） | PASS |
| 3 | `ai_graph_run` career-path rows=0 双线实测 | C'' receipt :112 `graphRuns:0` + P 线 receipt :109 `rows=0 (no fabricated run)`，两树两次独立一致 | PASS |
| 4 | `uq_active_run` 部分索引声明属实 | `packages/db/migrations/0001_baseline.sql:36-37` WHERE IN ('created','active','waiting_user','migrating','paused') → `failed`/`succeeded` 终态天然让出重试槽 | PASS |
| 5 | reuse/fencing 惯例可参照 | `interview-graph-lease.ts:26-46` latest-row `FOR UPDATE` 复用 + version 递增 + finally 释放/崩溃 TTL 接管 | PASS |
| 6 | `FI1-NO-FAKE-GRAPH-RUN` 现文 = 全局 | `uc-e2e-004-career-path-fault.proof.ts:299` `A('FI1-NO-FAKE-GRAPH-RUN', graphRuns === 0)`；`:79-82` `careerGraphRunCount()` 全表 count 无 thread 过滤 → harness 对「全局断言」的描述属实 | PASS |
| 7 | FI-2 图行仅 detail 非断言 | proof.ts:263 `graph_run_rows=` detail → per-thread 升级不构成减项 | PASS |
| 8 | FI-3 静态闸门现文 | proof.ts:328-340 `unreachable` = regionHasGraphWire ∧ careerInIdx ∧ graphFiles ∧ graphRuns 静态合取 | PASS |
| 9 | 等强加严先例 | proof.ts:300 `FI1-CHILD-SURVIVES`（C-5 批准加严增量）+ P 线 receipt §3「新增断言行」 | PASS |
| 10 | A3 口径原文锚定 | `e2e-scenarios.md` E-gen-fail（`AiGraphRun active→failed` + 降级 + 可重试 + career-path 不计费 D1）+ TC-E2E-004-fail `graph(fake-model)` 注入法，逐字核对一致 | PASS |
| 11 | C'' EXIT 契约原文 | `harness/gap-uc004-fault-real-evidence.md:53` 与 harness 引文逐字一致 | PASS |
| 12 | 引用 commit 在链 | `aafdffbe`/`4d8dc5d`/`a27e384`/`f19ecba`/`56fc1ea`/`845d357`/`3a8bc0f` 均 `git cat-file -t`=commit | PASS |
| 13 | derive 纯度（零模型调用前提） | `packages/domain/src/career.ts` 纯逻辑无 IO 实读；A 下零 `ai_invocation_trace`、零 model-client 触碰声明一致 | PASS |
| 14 | Pins 原值四处一致 | harness/slice/双 stub：NOT_HA · false · false · true · 8 · false · PG · 503 | PASS |
| 15 | 禁碰面 | 4 文件均本刀 docs；UC-018/052/025/014/026、SSOT、outbound 主链、其他 interview 路径、worker lifecycles、`principal.ts`、静态 mark-red prove 零触碰 | PASS |

### 候选裁决

- **A · 图包装 derive — 裁决：成立，本审背书（推荐维持）**。「图行真实 create/reuse + 失败真落 failed + 对外契约零变」三项均经证据核验：schema 足够（`ai_graph_run` graph_name 自由文本 + status/version/lease 列，**迁移确无**）；`uq_active_run` 终态让位 → failed 行不堵重试；reuse 惯例现成（fencing latest-row + version 递增）；derive 纯本地 → 零模型调用成立；契约冻结清单与实读代码逐项吻合（返回 `cp` 原形 `{readiness, level, milestones}` / `assessment_required`·`insufficient_evidence` 409 / GET 404 `not_found`）。措辞精度备注：create 为 `version=1`、`version+1` 属 reuse——`version>=2` 断言在两路径下均成立，非实质缺陷。
- **B · 仅失败记账 — 裁决：缺陷属实，REJECTED**。事后补写 failed 行必无 active 阶段：直插 `failed` 则 `version=1` 无转换证据；「先插 active 事后补 update」= 无执行在飞时的装饰性双写（伪造记账、非观察转换），且 FI-1 连接断窗口两写同坠。B 无法诚实满足本刀自设的「version>=2 转换证据」断言；接受 B 须放宽该断言 = `Ban 放宽` = FAIL。纵使双审给出书面强理由并明示接受语义降级，`e2e-scenarios.md` E-gen-fail 原文 `active→failed` 口径 B 仍不满足 → **B 无论如何关不了 FI-3**。维持默认不推荐。
- **C · 完整图化 — 裁决：越界确认，REJECTED**。侵入 `GAP-UC004-GROWTH-A1A2` / `GAP-UC004-UNCERTAINTY` / `GAP-UC004-GRAPH` / `GAP-UC004-E2E-MAIN` 其它刀 gap 面 + 模型调用边界风险（须申报 + 默认禁 live + model-op 一票否决）。本刀拒绝正确；如认为必要，拆独立刀。

### prove 等强增量裁决

- **① IV_FI3 真注入 + 真观察（env-gated dep seam）— 裁决：成立，APPROVED（附 C-HA-2）**。**非 prod 后门**判定依据：env 未设 = 零行为差（默认关）；**只许使 dep 失败**（fail-direction-only——不得伪造成功、不得绕过 `denyPublicPreviewWrite` / `guardInterviewPrivacy` / assessment 前置——这些均在图 dep 之前执行）；thread 精确匹配（同进程其余线程零影响）；零模型端点依赖。失效残留风险 = 持 env 控制权者可令特定线程 career-path 失败——非权限提升且 fail-closed，可接受，receipt 须披露 env 键。seam 键名/解析执行期定交双审（harness 已承诺），届时按 C-HA-2 逐项验。
- **② `FI1-NO-FAKE-GRAPH-RUN` per-thread 改写 — 裁决：等强且**加严**，APPROVED**。接线后全表 0 行与诚实执行不相容（CONTROL 必产 succeeded 行、FI-1/FI-2 产真失败行）→ 改写是**被迫演进**而非图方便。「IV_FI1 线程恰一行 `failed` + `version>=2`」严格强于行数启发：要求转换证据（active v1→failed v≥2）、拒装饰行（无 active 阶段）、拒多行喷洒（恰一行）、per-thread 锁定；叠加 ⑥ in-fault 重试 version 递增 + ⑦ 静态探针降 evidence（接线后静态 `unreachable` 合取必然自相矛盾，降级正确且必要）。改写前后断言原文 + 理由 receipt 全披露已承诺——执行时逐字验（C-HA-3）；**Ban 任何残余全局零断言以「诚实运行必挂」形态存活**。辅助判定（非减项）：FI-2 图行保持 detail 级 = 现状原样（FI-2 从未断言图行，零削弱），实测行为如实记录（statement timeout 落点不同，行数 0 或 1 皆可能，Ban 强设与实际相悖的断言）；可选加严建议（**非门、不构成本刀新验收标准**）：按 FI1-CHILD-SURVIVES 先例为 CONTROL 增加 per-thread succeeded 行断言（恰一行 + version≥2，账本对称）；另注 ⑥ 已覆盖「失败后复用再失败」的 reuse 路径，「复用后转成功」未被观察——可作 evidence 字段，不设新闸。

### Ban 伪造 failed run / Ban 伪装成功 / fail-closed

铁律 1-3 覆盖完整：失败真落库（真实 active 阶段 + version 递增）；Ban 装饰行 / 200-假成功 / 吞错；**转换自身失败的口径已写清**——FI-1 连接断瞬间 UPDATE 也失败时行可能停留 active，按实际行为断言、Ban 把转换失败伪装成终态成功、重试路径不得被残留 active 行卡死（FOR UPDATE 复用 / TTL 接管同款语义）——harness 未许诺 failed 转换在 FI-1 下必成，诚实。A3 口径锚定 `e2e-scenarios.md` 原文，不发明新标准。核实通过。

### EXIT 契约

attempts=4 全 0 → 全量 EXIT **1→0**；attempts 全记录 one-shot（沿用现 ATTEMPTS_LEDGER 格式）；Ban retry-to-green / Ban 记 flake / Ban 修 prove 迁就；A3 关闭 = prove EXIT0 + post-prove dual PASS（mw-e2e-ha + mw-model-op）+ 协调方 nail 三段全链，**本 REQUEST 不预claim**（EXIT0 ≠ A3 closed，行翻转只在 nail）；静态 mark-red prove（`uc004:career-path:prove` EXIT0）非替代、其 G-GAP 行文更新属该 prove 自己的刀。核实通过。

### Fail-trigger audit（执行期任一命中 = FAIL）

1. 无真实 active 阶段的 failed 行被当作 A3 证据（直插 failed / `version=1` failed 行）。
2. failed 转换无 version 递增，或 in-fault 重试后 per-thread 行数 >1 被探针放行。
3. `FI1-NO-FAKE-GRAPH-RUN` 改写含放宽（status 任意 / 无 version 证据 / 行数随意），或改写前后原文未在 receipt 逐字披露。
4. seam 默认开 / 可伪造成功 / 匹配宽于指定线程 / 生效点在 guards-preconditions 之前 / 写 `ai_invocation_trace` / 引入模型端点。
5. 触碰面外文件：`interview-graph-lease.ts` 未申报触碰、`principal.ts`、`deriveCareerPath` 纯函数、其他 interview 路径、outbound 主链（model-client/registry/binding）、worker lifecycles、SSOT 三件、UC-018/052/025/014/026。
6. FI-1/FI-2 既有断言任何减项或语义放宽；EXIT1 记 flake；retry-to-green；改 prove 迁就产品。
7. coding/prove commit 内翻任何 SSOT 行、预claim A3 关闭、或 coveredCount≠8。

### Blockers

无。REQUEST 如写成立：证据锚定可复核、范围收敛、两项 prove 增量如实申报为等强/加严并交双审——正是 pre-exec dual 应有形态。

### Conditions（C-HA-*）

- **C-HA-1（触碰面纪律）**：career-path 图行 create/reuse/failed 转换逻辑必须落在已申报触碰面（`interview.service.ts` 该区段或 `packages/ai-graphs`）内；`packages/db/src/interview-graph-lease.ts`（现 hardcoded `GRAPH_NAME='adaptive-interview'`，**不在**触碰清单）如需触碰，须 coding 前向双审显式申报——静默扩面 = FAIL。
- **C-HA-2（seam 契约）**：seam 落地须同时满足：默认关（env 未设零行为差）· 只使 career-path 图 dep 抛错（fail-only）· 精确匹配指定 thread · 生效点在 guards/preconditions 之后的图 dep · 零 `ai_invocation_trace` · 零模型端点；键名 + 解析随 coding 交双审复核，receipt 披露 env 键与值形态。
- **C-HA-3（改写披露）**：`FI1-NO-FAKE-GRAPH-RUN` 改写前后断言原文 + 理由 receipt 逐字全披露（已承诺，执行时验）；既有断言零减项；FI-2 图行实测行为如实记录；CONTROL per-thread succeeded 断言为非阻塞建议项。
- **C-HA-4（恰一行口径）**：「恰一行」scope = per-thread（IV_FI1 线程，含同 attempt 内 in-fault 重试后评估）；实测偏离（行数/version）→ 如实落 receipt 且该 attempt EXIT=1，Ban 弯探针迁就。
- **C-HA-5（静态探针处置）**：静态探针（careerInIdx/graphFiles/regionHasGraphWire/graphRuns）降为 evidence 字段后，不得残留为 unreachable 闸门，亦不得改扮新绿灯闸门。
- **C-HA-6（环境事实入账）**：GitHub 网络不通，本审基于本地分支/ref；本地 `origin/feat/mysql-schema-skeleton` ref = `377e7fc`（与 harness 头部声明一致）；`f4b95fe` 直接 parent = `3ca9628`（另一 docs REQUEST 刀插队落链），harness「Base/parent tip `377e7fc`」指 origin ref 基线快照——元数据口径记录，本刀文件不依赖其间提交，不影响裁决。
- **C-HA-7（prove 执行形态）**：三层隔离壳 + per-run 随机容器 + 动态端口 + loopback/nonce attestation 不变，CMD `pnpm uc004:career-path-fault:prove` 不变；machine receipts 落 `.tmp/isolated-proof-receipts/`，attempts ledger 全记录，receipt 落 `ai-docs/delivery/receipts/`（命名随执行日）。

### 中文三行摘要

1. 候选裁决：A 图包装 derive 成立并背书（create/reuse + failed 真落 + 对外契约零变逐项核验，迁移确无、零模型调用），B 仅失败记账缺陷属实否决（failed 行无 active 阶段即无转换证据，放宽断言=Ban 放宽，纵裁也关不了 A3），C 越界确认拒绝。
2. 两项 prove 增量均裁等强且加严：IV_FI3 真注入 seam 默认关 + fail-only + thread 精确匹配，非 prod 后门（附 C-HA-2）；`FI1-NO-FAKE-GRAPH-RUN` 全局 0 在接线后与诚实执行不相容，per-thread「恰一行 failed + version≥2」严格更严、是被迫演进——7 条 Conditions 管住执行期风险。
3. 无 Blockers；Pins 八项原值、row `UC-E2E-004` FAULT stays gap、A3 关闭须 prove + post-prove dual + 协调方 nail 全链不预claim；alone ≠ dual，本 PASS 不代签 mw-model-op、不构成 dual PASS、不授权 coding/prove/push。

Verdict: PASS
