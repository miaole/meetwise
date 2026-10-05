# Receipt — **GAP-UC002-ADV-LED-CROSSUSER · NHP-002-ADV-01** · UC-E2E-002 伪造 LED / 跨用户 session ADV 两族六类真证据 · prove

**Status**: **coding+prove done · `EXIT=0`**（post-prove dual PENDING · 本 receipt 不翻行 · Ban covered · STOP）
**Pins（原值逐字保留）**: haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE stays **503** · row `UC-E2E-002` ADV **stays blind/case-only** · case `NHP-002-ADV-01` stays blind→case-only
**Date**: 2026-10-05
**Branch / worktree**: `line/r-next-nhp` @ `f31f682`（基线）→ 本 prove commit（worktree `/Users/miaole/Desktop/golucky/meetwise-line-r` · 未 push）
**Executed by**: `mw-core`（实现方 · coding+prove 阶段 · 禁自批 · post-prove 双审由协调方另派）
**Harness**: `ai-docs/delivery/harness/gap-uc002-adv-led-crossuser-nhp.md`（pre-exec dual PASS：mw-e2e-ha @`d77437b` + mw-rag-route @`1836712` 各自独立签署）+ 协调方授权
**产品事实基线**（本刀零产品代码改动 · 行号在本 commit 仍有效）: `apps/api/src/platform/last-event-id.ts:8-18` · `apps/api/src/modules/interview/interview.service.ts:164-175` / `:814-820` · `apps/api/src/modules/interview/interview.controller.ts:250-286` · `apps/api/src/platform/principal.guard.ts:54-68`
**需求源锚**: `non-happy-path-perf-load-case-matrix.md:45`（NHP-002-ADV-01 行原文「401/403/空；不泄露他用户事件」blind→case-only）· `e2e-requirement-coverage-matrix.md:113/:147/:171/:267` · `e2e-scenarios.md:89-99`（E-并发resume :89 / E-越权恢复 :90 / E-重放去重 :91 / 验收 A1–A3 :93 / TC×3 :97-99）

## Prove CMD（三层注册 · 同 `uc002:http:prove` 先例 `package.json:138`）

```
pnpm uc002:adv:prove
  = node scripts/run-e2e-isolated.mjs uc002:adv:prove:raw        # root package.json（层1 · 隔离壳）
  → shell allowlist + dispatch（各加一项/一臂，与 uc002:http 等既有条目同形态）
  = pnpm -C apps/api prove:uc002-adv                             # root :raw（层2）
  = node --import @swc-node/register/esm-register test/uc-e2e-002-adv-led-crossuser.proof.ts   # apps/api（层3）
```

产物：
- `apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts`（新增 · **77 条断言**，V1–V6 逐类）
- root `package.json`：`uc002:adv:prove` + `uc002:adv:prove:raw`（层1/层2）
- `apps/api/package.json`：`prove:uc002-adv`（层3）
- `scripts/run-e2e-isolated.mjs`：**仅注册**——`isolatedReceiptSources` 加 `'uc002:adv:prove:raw'` 源清单一项 + allowlist 数组加一项 + dispatch 三元链加一个目标臂（零行为改动、不影响任何其它 target；此为隔离壳门禁的注册机制本身，无它则 `unsupported_e2e_target`；先例即 uc002:http/uc018/uc025 全部在此注册；非产品代码、非 SSOT）

## 隔离与密钥卫生（binding 条件 8/9）

- 随机容器 `meetwise-e2e-12303-1791202244235`（attempt 4）· 动态端口 `127.0.0.1:57015`（`-p 127.0.0.1::5432`）· 用毕 `docker rm -f`（运行后 0 残留容器，`docker ps -a` 已核）· `assertIsolatedTestTarget(pool)` 容器 nonce 门禁通过。
- 迁移白名单：`_neg-harness.ts` boot() 按固定文件名单加载（01–23 sql + migrations 0037/0038/0039/0046），与 `uc002:http:prove` 同壳同名单；本 target 未加入 shell 的 `migrateWithRecovery` 名单（harness 自建 schema，同 `uc002:http:prove:raw` 先例——该名单亦不含 `uc002:http:prove:raw`）。
- 密钥零接触：本 prove 不读不落任何 secrets / `.env*`；测试常量（AUTH_SECRET 测试值等）只经 `_neg-harness.ts` boot() 进程环境注入；V6 伪造令牌由 prove 内 `tokenFor()` 现签，receipt 不落任何令牌原文。
- 镜像记录（binding 条件 10）：docker daemon 在位；legacy fixture 镜像 `pgvector/pgvector:pg16` 本地已在（早前经 `docker.m.daocloud.io` 拉取），`docker images` 双 tag 同镜像 ID `7b822b0aac60`，canonical tag RepoDigests 同时含 `pgvector/pgvector@sha256:7b822b0a…` 与 mirror `docker.m.daocloud.io/pgvector/pgvector@sha256:7b822b0a…` —— **digest 比对一致、canonical tag 已在位**，本次运行直接命中本地镜像，无新 pull、无 digest 漂移。
- `releaseEvidence=false` · NOT_HA · runner 头注口径原样打出（`[R5-MARKED-RED] … local green ≠ HA · need multi-instance + fault-inject for releaseEvidence`）。

## EXIT 值

**EXIT = 0**（attempt 3 / attempt 4 连续两次 · 77/77 断言 PASS · 0 FAIL · exit code 0）。按 harness EXIT 契约：EXIT 0 仅证明两族六类 ADV 真证据成立；**不自动翻行、不 covered**（coveredCount=8 不动）；ADV blind/case-only→partial 须 post-prove dual PASS + 协调方授权。implementer 不自批。

## V1–V6 逐类结果（HTTP 码 · 响应体 · DB 快照 · 全 PASS）

| 类 | 注入 | HTTP | 响应体/流 | DB before/after 快照断言（全 PASS） |
|----|------|------|-----------|-------------------------------------|
| **V1 伪造 LED·非法格式** | 属主令牌 GET events，`last-event-id` ∈ {`Infinity`,`1.5`,`1e3`,`-1`,`+1`,`01`,`1␣2`,`''`(空串),17 位溢出,`NaN`,`0x10`} ×11 | **400** ×11 | `invalid_last_event_id` ×11 · 均非 `text/event-stream`（fail-closed 非 5xx、非静默 0、非 SSE） | stream_events=5/max_seq=5/total_events=8/owner_row=1 before==after：无 fabricated 行、无读扩散 |
| **V2 伪造 LED·越界** | 属主令牌 GET events，LED=`999999999999999`（15 位合法格式 · seq>max） | **200**（SSE） | **空 replay**：`ids=[]` `kinds=[]` 零 `event:` 行；无 `invalid_last_event_id` 降级、无 `internal_error`（无全流扫描错误） | 快照 before==after：越界读不产生行 |
| **V3 伪造 LED·重复重放** | 同一 LED=2 连续两次重放 + 边界 LED=4 | **200** ×3 | 见下「C-ADV-4 V3 seq 列表」：窗口恰 [3,4,5]，逐 seq 一致、无 seq≤2 泄漏、不重、不漏；LED=4 → 恰 [5] | （只读 · 幂等 replay） |
| **V4 跨用户·state** | 他人有效令牌（userB）GET `/interview/:id` | **404** | `not_found_or_forbidden`；**存在性不可区分**：不存在 id（`IV_UC002ADV_GHOST`）同样 404 且响应体逐字节一致 | 快照 before==after |
| **V5 跨用户·events** | userB GET events：LED=0 / LED=2（合法）· LED=`Infinity`（非法）· SSE 路径直读 | **404** ×3 / **400** ×1 | 404=`not_found_or_forbidden`；400=`invalid_last_event_id`；全部响应体**仅 `{error}` 单键**、无 `seq`/`kind`/`payload` 字段、非 SSE 流（零事件泄露） | 快照 before==after |
| **V6 伪造认证** | (a) 无令牌 (b) 坏 Bearer (c) 保留 sentinel uid 的签名 Bearer 令牌（`__system_qbank__`）(d) dev-header + sentinel (e) `NODE_ENV=production` + dev-header（生产硬闸探针） | **401** ×5 | (a) `unauthenticated` (b) `invalid_token` (c) `reserved_principal`（guard:55）(d) `reserved_principal`（guard:65）(e) `unauthenticated`（guard:62-67 硬闸 · guard:68 兜底）；全部响应体仅 `{error}` 单键、无 stream/属主标识回显 | 快照 before==after；对照：合法属主仍 200（fail-closed 未误伤合法面） |

## C-ADV-1 · 期望→实际→源锚 映射表（403↔404 折叠作为 disclosed 项逐类可查）

| 类 | 期望（矩阵 `non-happy-path-perf-load-case-matrix.md:45`「401/403/空；不泄露他用户事件」+ `e2e-scenarios.md:90/:93`） | 实际（本 prove 实测） | 源锚（file:line） |
|----|----|----|----|
| V1 | 矩阵:45 伪造 LED 族 fail-closed 拒收面 · scenarios:91 E-重放去重（seq 服务端权威） | **400** `invalid_last_event_id` ×11 注入（fail-closed 非 5xx 非静默） | `apps/api/src/platform/last-event-id.ts:8-18` |
| V2 | 矩阵:45「空」+「不泄露他用户事件」 | **200 空 replay**（零事件 · 无全流扫描错误） | `apps/api/src/modules/interview/interview.service.ts:818`（恒 `seq>$2 ORDER BY seq`） |
| V3 | `e2e-scenarios.md:91` E-重放去重「事件不重不漏」· `:93` A1 | 同 LED 两次重放 seq 窗口逐 seq 一致（`3,4,5`==`3,4,5` · 不重不漏） | `interview.service.ts:818` + `interview.controller.ts:274` |
| V4 | 矩阵:45「403」↔ `e2e-scenarios.md:90`「0 行 → 404，不泄露存在性」· `:93` A3「非属主 →404」 | **404** `not_found_or_forbidden`（与不存在 id 不可区分）· **403 被产品折叠为 404 —— DISCLOSED-D1** | `apps/api/src/modules/interview/interview.service.ts:164-167` |
| V5 | 矩阵:45「不泄露他用户事件」+「空」 | **404**（合法 LED）/ **400**（非法 LED）· 零事件流 · 无 `seq/kind/payload` | `apps/api/src/modules/interview/interview.service.ts:814-820` |
| V6 | 矩阵:45「401」 | **401** `unauthenticated`/`invalid_token`/`reserved_principal`（含生产硬闸 dev-header 禁用） | `apps/api/src/platform/principal.guard.ts:54-68` |

**DISCLOSED-D1（403↔404 折叠 · 两审一致裁决）**：产品 authz 无 403 出口；跨用户越权=404 不泄露存在性（`e2e-scenarios.md:90` 原文机制，且 403 会泄露「存在但无权」=严格更弱面）。矩阵:45 的「403」面按披露口径记为「产品以 404 折叠」，**未**静默归一、**未**回写矩阵；401 面由 V6 真实断言、空面由 V2/V5 真实断言；**Ban 改产品凑 403 已遵守**（本刀产品 diff 为零）。

## C-ADV-4 · V3 seq 列表落 receipt（attempt 4 实测原值）

```
V3_REPLAY1_SEQ=3,4,5        (LED=2)
V3_REPLAY2_SEQ=3,4,5        (LED=2 · 与重放1逐seq一致)
V3_REPLAY3_SEQ(led=4)=5     (边界窗口)
V3_REPLAY1_KINDS=[progress,question_ready,waiting_user]
```

第三方复核口径：两窗逐 seq 相等 ∧ 恒 `seq>2` ∧ 无重复 ∧ 连续无洞（恰 3,4,5）→ 幂等 replay 成立（E-重放去重 / A1）。

## C-ADV-3 · receipt 卫生

- 本 receipt 与 proof 输出**不含** `interview_event.payload` 原文（fixture payload 仅 `{"n":k}` 计数占位，且输出只打 seq/kind 元数据与布尔判定，不打响应体原文、不打 buffer 原文）。
- no-leak 断言全部以**字段存在性/键差集/子串存在性布尔**判定（V4 属主可见键差集、V5/V6 单键 `{error}` 检查），不打印 payload 体。
- 无 secrets/令牌原文/连接串入树入 receipt（runner receipt 自证 `dataHandling=no_output_prompt_answer_token_endpoint_or_connection_string_persisted`）。

## C-ADV-2 · V6 环境口径

`ENV_RECORD`（隔离壳实测原值）：**`AUTH_DEV_HEADER=1` · `NODE_ENV=<unset>`**。dev-header 子 case 按实断言：开启语义下 sentinel 冒充 → 401 `reserved_principal`（V6(d)）；生产硬闸以进程内瞬态 `NODE_ENV=production` 模拟（V6(e) → 401 `unauthenticated`，用毕立即还原，产品零改动 · DISCLOSED-D3）。`account_inactive`/`session_revoked` 等其它 401 码非本刀注入类，未断言其不存在（per mw-e2e-ha C-ADV-2）。

## DISCLOSED 披露项汇总（prove 正文逐条原样打印）

- **D1** 403↔404 折叠（见映射表上方原文）。
- **D2** 空白注入口径：纯前导/尾随 OWS 被 HTTP 传输层剥离，无法经 fetch 注入；以内部空白 `'1 2'` + 空串 `''` 为空白代表（两者均 400 fail-closed 实证）。
- **D3** V6(e) 生产硬闸为进程内瞬态 NODE_ENV 模拟（用毕还原 · 产品零改动）；隔离壳实际值见 ENV_RECORD。
- **D4** V2 空 replay 的 200 响应头在 Node hijacked-SSE 下与首个 2s 心跳合并冲刷（传输层冲刷时机 · 诊断实测 headers≈2050ms 首次出现）；V2 客户端观察窗设 4s，断言对象仍是 200+零 `event:` 行，产品 replay 语义（恒 `seq>$2`、零事件）不受影响。
- **BLIND-KEEP**：PERF_api / PERF_web / LOAD_worker 显式 blind 保持（§1.0.2 :147「跨副本压测未证」· 本刀零触碰 · Ban n/a 偷关）。

## Attempts 台账（全记录 · 无隐瞒 · EXIT1 未记 flake · 未 retry-to-green）

| # | 开始（本地 -0700） | 结束 | CMD | EXIT | 备注 |
|---|--------------------|------|-----|------|------|
| 1 | 2026-10-05T04:59:55 | 05:00:07 | `pnpm uc002:adv:prove`（三层隔离壳） | **1** | 76/77 · 唯一 FAIL=`V2 越界 LED → 200`：客户端实测 `status=0`（1200ms 观察窗内在响应头到达前中止）——产品行为未裁决，先诊断 |
| d1 | 2026-10-05T05:02 前后 | — | 诊断（**非 prove CMD** · 手动一次性容器 `meetwise-diag-uc002adv-95069`:56264 + 临时诊断脚本，用毕即删） | — | 实测：`interview_event.seq`=bigint · 直查 `seq>999999999999999` 正常 0 行 · 空 initial replay 时 200 响应头与首个 2s ping 合并冲刷（headers≈2050ms）→ 定性为**传输层冲刷时机**（DISCLOSED-D4），产品 replay 语义正确。修正：V2 观察窗 1200ms→4000ms（证明侧修正，产品零改动） |
| 2 | 2026-10-05T05:07:10 | 05:07:22 | `pnpm uc002:adv:prove`（三层隔离壳） | **1** | 断言 77/77 全过，但进程收尾阶段 pg pool teardown race 非确定崩溃（runner receipt `.tmp/…12-07-22-750Z-9214…json` exitCode=1 · durationMs=11245 与全绿耗时同量级 → 定性 teardown 阶段）。修正：prove 收尾加 `TEARDOWN_DRAIN 3.5s` + `pool.end()`（只涉 prove 进程，零产品改动） |
| d2 | 2026-10-05T05:09 前后 | — | 诊断（raw 层直跑 + 手动一次性容器，**非 prove CMD**） | 0(exit=0) | 复现尝试：77/77 全过 · exit=0 —— attempt2 崩溃不可复现，支持 teardown-race 定性 |
| 3 | 2026-10-05T05:10:15 | 05:10:32 | `pnpm uc002:adv:prove`（三层隔离壳） | **0** | 77/77 PASS · `TEARDOWN pool.end OK` · exit code 0 |
| 4 | 2026-10-05T05:10:43 | 05:11:00 | `pnpm uc002:adv:prove`（三层隔离壳） | **0** | 确认跑（防 flake · 同代码连续第二次绿）：77/77 PASS · exit code 0 |

（两次 EXIT1 均为**证明侧**成因并有修正落点，产品行为无一次被判 FAIL；未将任何 EXIT1 记为 flake/环境问题，未隐瞒任何 attempt。）

## binding 条件自评（1–10）

1. **404 口径映射表入 receipt** — 遵守。C-ADV-1 六类三列映射表全文在上（期望=矩阵:45+scenarios:90/:93 → 实际=400/401/404/空 → 源锚 file:line）；403↔404 折叠作为 DISCLOSED-D1 逐类可查（V4/V5 行）；Ban 改产品凑 403（产品 diff=0）；401 由 V6、空由 V2/V5 真实断言。
2. **V6 环境口径（e2e-ha C-ADV-2）** — 遵守。ENV_RECORD 记录 `AUTH_DEV_HEADER=1`/`NODE_ENV=<unset>` 实际值；dev-header 子 case 按实断言（开启+sentinel→`reserved_principal`）；生产硬闸探针为瞬态模拟并披露（D3）；未断言非本刀 401 码不存在。
3. **receipt 卫生（C-ADV-3）** — 遵守。零 payload 原文、零 secrets/令牌/连接串；no-leak 以字段存在性/键差集布尔判定。
4. **V3 重放（C-ADV-4）** — 遵守。两次重放 seq 列表（+边界第三窗+kind 列表）逐字落 receipt。
5. **attempts 台账（C-ADV-5 / rag C2）** — 遵守。4 次 prove attempt + 2 次诊断全记录（EXIT+时间戳+明细）；无 retry-to-green（两次 EXIT1 均为证明侧成因、修正对象是 prove 自身，产品行为零 FAIL）；EXIT1 未记 flake；EXIT0 未自行翻行。
6. **互不替代 + blind 保持（rag C3）** — 遵守。`uc002:http:prove`/`uc002:lease:prove`/`uc010:sse-resume:prove`/`uc033:cross-user-authz:prove` 四文件零改动（git diff 可证）；PERF/LOAD 显式 blind 保持原文打印。
7. **范围锁（C-ADV-8）** — 遵守。仅 `apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts` + 三层 CMD 注册（root/apps-api package.json + runner 注册三处）；UC-018/052/025/004/014·026 行与文件、SSOT（矩阵/backlog/checklist）、gap id 登记全部零触碰（`GAP-UC002-ADV-LED-CROSSUSER` 只出现在本 receipt/proof 输出，nail 阶段才进 SSOT）。
8. **隔离壳** — 遵守。三层包装 + 随机容器/动态端口/固定迁移白名单；`node --check scripts/run-e2e-isolated.mjs` 通过；两 package.json JSON 解析通过；TS proof 经 swc-node 真实执行（4 次完整运行）。
9. **Pins 原值** — 遵守。八项 pins 未触任何承载文件；UC-E2E-002 行保持 blind/case-only；coveredCount=8。
10. **镜像拉取** — 遵守。`pgvector/pgvector:pg16` 本地已在且 canonical/mirror digest 一致（`7b822b0aac60`），命中本地镜像，无新 pull（记录见「隔离与密钥卫生」）。

## 附录 — prove 全输出（attempt 4 · 原样）

见下方代码块（runner 包装行含 `[R5-MARKED-RED]`/`E2E_POSTGRES_READY`/`LOCAL_ISOLATED_PROOF_RECEIPT` 等）。
```
> node scripts/run-e2e-isolated.mjs uc002:adv:prove:raw

[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy (dual-track; intended sole default=mysql-qdrant-redis) E2E_PG_IMAGE=pgvector/pgvector:pg16 is a legacy pgvector isolation fixture — NOT sole-stack truth (sole stack = MySQL+Qdrant+Redis). Local green ≠ RAG migrated. releaseEvidence=false · Not HA · 本绿≠已迁 · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence.
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
E2E isolated PostgreSQL: meetwise-e2e-12303-1791202244235 on 127.0.0.1:57015
E2E_ISO_STACK_NOTE isolated shell = test infrastructure only: isolated test PG ≠ product stack change ≠ cutover evidence; product stack pin = ai-docs/delivery/adr-postgres-retained.md (Postgres retained · PostgresSaver · pgvector). releaseEvidence=false · Not HA.
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3

> @meetwise/api@0.0.0 prove:uc002-adv /Users/miaole/Desktop/golucky/meetwise-line-r/apps/api
> node --import @swc-node/register/esm-register test/uc-e2e-002-adv-led-crossuser.proof.ts

UC-E2E-002 ADV prove (NHP-002-ADV-01 · GAP-UC002-ADV-LED-CROSSUSER) · releaseEvidence=false · Not HA
NOTE: EXIT0≠covered；row UC-E2E-002 ADV stays blind/case-only（翻行须 post-prove dual + 协调方授权）
CITE: uc002:http:prove / uc002:lease:prove / uc010:sse-resume:prove / uc033:cross-user-authz:prove 互不替代 · PERF/LOAD 显式 blind 保持
ENV_RECORD C-ADV-2 AUTH_DEV_HEADER=1 NODE_ENV=<unset> (isolated shell actual · product guard principal.guard.ts:62-67)
PIN   GAP-UC002-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)

──────── V1 · 伪造 LED 非法格式 → 400 invalid_last_event_id（fail-closed）────────
DB_BEFORE V1 stream_events=5 max_seq=5 total_events=8 owner_row=1
PASS  V1 LED="Infinity" → 400
PASS  V1 LED="Infinity" → invalid_last_event_id
PASS  V1 LED="Infinity" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="1.5" → 400
PASS  V1 LED="1.5" → invalid_last_event_id
PASS  V1 LED="1.5" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="1e3" → 400
PASS  V1 LED="1e3" → invalid_last_event_id
PASS  V1 LED="1e3" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="-1" → 400
PASS  V1 LED="-1" → invalid_last_event_id
PASS  V1 LED="-1" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="+1" → 400
PASS  V1 LED="+1" → invalid_last_event_id
PASS  V1 LED="+1" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="01" → 400
PASS  V1 LED="01" → invalid_last_event_id
PASS  V1 LED="01" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="1 2" → 400
PASS  V1 LED="1 2" → invalid_last_event_id
PASS  V1 LED="1 2" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="''" → 400
PASS  V1 LED="''" → invalid_last_event_id
PASS  V1 LED="''" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="99999999999999999" → 400
PASS  V1 LED="99999999999999999" → invalid_last_event_id
PASS  V1 LED="99999999999999999" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="NaN" → 400
PASS  V1 LED="NaN" → invalid_last_event_id
PASS  V1 LED="NaN" 非流式响应（fail-closed 非 SSE）
PASS  V1 LED="0x10" → 400
PASS  V1 LED="0x10" → invalid_last_event_id
PASS  V1 LED="0x10" 非流式响应（fail-closed 非 SSE）
DB_AFTER  V1 stream_events=5 max_seq=5 total_events=8 owner_row=1
PASS  V1 零副作用：非法 LED 未产生任何 fabricated 行（快照 before==after）
PASS  V1 零副作用：无读扩散（stream 事件数仍 5 · max_seq 仍 5）

──────── V2 · 合法格式越界 LED=999999999999999（15 位 · seq>max）→ 200 空 replay ────────
V2_OVERBOUND status=200 ids=[] kinds=[]
PASS  V2 越界 LED → 200（非 4xx/5xx · 不崩溃）
PASS  V2 空 replay：零事件（ids=[]）
PASS  V2 空 replay：零 event 行（无 SSE event: 行）
PASS  V2 无全流扫描错误 / 无 invalid_last_event_id 降级
PASS  V2 越界不泄露任何他人事件（缓冲区无 seq/kind 发射）
DB_AFTER  V2 stream_events=5 max_seq=5 total_events=8 owner_row=1
PASS  V2 零副作用：越界读不产生行（快照 before==after）

──────── V3 · 同一 LED=2 连续重放 → 恒定 seq>N 窗口 不重不漏 ────────
V3_REPLAY1_SEQ=3,4,5
V3_REPLAY2_SEQ=3,4,5
V3_REPLAY3_SEQ(led=4)=5
V3_REPLAY1_KINDS=[progress,question_ready,waiting_user]
PASS  V3 重放1 → 200 且窗口恰 seq=[3,4,5]
PASS  V3 重放2 → 200 且窗口恰 seq=[3,4,5]
PASS  V3 两次重放逐 seq 一致（幂等 replay）
PASS  V3 恒定 seq>N 窗口：无 seq≤2 泄漏
PASS  V3 不重（窗口内无重复 seq）
PASS  V3 不漏（窗口连续无洞 · 3,4,5）
PASS  V3 边界 LED=4 → 恰 [5]（服务端权威窗口）

──────── V4 · 他人有效令牌 GET /interview/:id → 404 不泄露存在性 ────────
PASS  V4 属主对照 GET → 200（属主可见面存在）
V4_OWNER_KEYS=[answered_turns,created_at,current_question_index,current_turn,display_code,id,issued_turns,job_title,processing_turn,resume_display_name,status]（仅用于 no-leak 键差集 · 不打印值）
PASS  V4 跨用户 GET → 404（非 403/非 200）
PASS  V4 错误码 not_found_or_forbidden
PASS  V4 存在性不可区分：不存在 id 同样 404
PASS  V4 不可区分：越权 404 与不存在 404 响应体逐字节一致
PASS  V4 no-leak：响应体无属主可见键（questions/progress/display_code 等零泄露）
PASS  V4 no-leak：响应体不含 display_code/题面/进度标记
PASS  V4 no-leak：响应体不含属主/流标识（owner id 与 stream key 零回显）
DB_AFTER  V4 stream_events=5 max_seq=5 total_events=8 owner_row=1
PASS  V4 零副作用：跨用户 state 读不产生行（快照 before==after）

──────── V5 · 他人有效令牌 GET events（合法/非法 LED 各一）→ 零事件流 no-leak ────────
PASS  V5(a) 跨用户 events LED=0 → 404
PASS  V5(a) 错误码 not_found_or_forbidden
PASS  V5(b) 跨用户 events LED=2 → 404（恒定不泄露）
PASS  V5(c) 跨用户 events 非法 LED → 400 invalid_last_event_id
PASS  V5 no-leak：全部响应体无 seq/kind/payload 字段
PASS  V5 no-leak：全部响应体仅 {error} 单键（零事件面）
PASS  V5 no-leak：响应非 SSE 流（无 event 发射）
PASS  V5(d) SSE 路径跨用户 → 404（零事件流）
DB_AFTER  V5 stream_events=5 max_seq=5 total_events=8 owner_row=1
PASS  V5 零副作用：跨用户 events 读不产生行（快照 before==after）

──────── V6 · 伪造认证族 → 401 fail-closed（principal.guard.ts:54-68）────────
PASS  V6(a) 无令牌 → 401 unauthenticated
PASS  V6(b) 坏令牌 → 401 invalid_token
PASS  V6(c) sentinel Bearer 令牌 → 401 reserved_principal
PASS  V6(d) 前置：隔离壳 dev-header 实际开启（按实断言）
PASS  V6(d) dev-header sentinel → 401 reserved_principal（guard:65）
ENV_RESTORED NODE_ENV=<unset> AUTH_DEV_HEADER=1
PASS  V6(e) NODE_ENV=production + dev-header → 401 unauthenticated（生产硬闸 · guard:62-67）
PASS  V6 no-leak：全部 401 响应体仅 {error} 单键
PASS  V6 no-leak：401 响应体不含 stream/属主标识
DB_AFTER  V6 stream_events=5 max_seq=5 total_events=8 owner_row=1
PASS  V6 零副作用：伪造认证族不产生行（快照 before==after）
PASS  V6 对照：合法属主令牌仍通过（fail-closed 未误伤合法面）

──────── MAPPING-TABLE C-ADV-1（期望（矩阵:45+scenarios:90/:93）→ 实际 → 源锚）────────
MAP V1 | 期望: 矩阵:45「401/403/空」伪造LED族 · scenarios:91 seq 去重 | 实际: 实际=400 invalid_last_event_id ×11 注入（fail-closed 非 5xx 非静默） | 源锚: apps/api/src/platform/last-event-id.ts:8-18
MAP V2 | 期望: 矩阵:45「空」+「不泄露他用户事件」 | 实际: 实际=200 空 replay（零事件 · 无全流扫描错误） | 源锚: apps/api/src/modules/interview/interview.service.ts:818（恒 seq>$2 ORDER BY seq）
MAP V3 | 期望: scenarios:91 E-重放去重「事件不重不漏」· :93 A1 | 实际: 实际=同 LED 两次重放 seq 窗口逐 seq 一致（3,4,5==3,4,5 · 不重不漏） | 源锚: interview.service.ts:818 + interview.controller.ts:274
MAP V4 | 期望: 矩阵:45「403」↔ scenarios:90「0 行 → 404，不泄露存在性」· :93 A3「非属主 →404」 | 实际: 实际=404 not_found_or_forbidden（403 被产品折叠为 404 · DISCLOSED-D1） | 源锚: apps/api/src/modules/interview/interview.service.ts:164-167
MAP V5 | 期望: 矩阵:45「不泄露他用户事件」+「空」 | 实际: 实际=404（合法LED）/400（非法LED）· 零事件流 · 无 seq/kind/payload | 源锚: apps/api/src/modules/interview/interview.service.ts:814-820
MAP V6 | 期望: 矩阵:45「401」 | 实际: 实际=401 unauthenticated/invalid_token/reserved_principal（含生产硬闸 dev-header 禁用） | 源锚: apps/api/src/platform/principal.guard.ts:54-68
DISCLOSED-D1 403↔404 折叠: 产品 authz 无 403 出口；跨用户越权=404 不泄露（scenarios:90 原文机制 · 403 会泄露「存在但无权」=更弱）；矩阵:45「403」面按披露口径记为「产品以 404 折叠」；Ban 改产品凑 403 已遵守。
DISCLOSED-D2 空白注入: 纯前导/尾随 OWS 被 HTTP 传输层剥离无法经 fetch 注入；以内部空白 '1 2' + 空串 '' 为空白代表。
DISCLOSED-D3 V6(e) 生产硬闸为进程内瞬态 NODE_ENV 模拟（用毕还原 · 产品零改动）；隔离壳实际 AUTH_DEV_HEADER=1 · NODE_ENV 见 ENV_RECORD。
DISCLOSED-D4 V2 空 replay 的 200 响应头在 Node hijacked-SSE 下与首个 2s 心跳合并冲刷（传输层时机 · diag 实测 ≈2050ms）；客户端观察窗设 4s，断言对象仍是 200+零 event 行，产品 replay 语义不受影响。
BLIND-KEEP PERF_api/PERF_web/LOAD_worker 显式 blind 保持（§1.0.2 :147「跨副本压测未证」· 本刀零触碰）。
PASS  C-ADV-1 映射表+披露项打印完成（6 类）

EXIT-GATE V1–V6 全成立 → EXIT=0（仅证明两族六类 ADV 真证据成立 · 不翻行 · 不 covered · coveredCount=8 不动）
TEARDOWN_DRAIN 3.5s: 等服务端 SSE hold 循环观测 client 断开并释放连接/槽位
TEARDOWN pool.end OK

✓ uc002:adv: 77 条负路径用例全绿
LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-05T12-11-00-379Z-12303-35fad386-5049-4eb4-aa64-cc1e859c2fc0.json release_evidence=false
```
