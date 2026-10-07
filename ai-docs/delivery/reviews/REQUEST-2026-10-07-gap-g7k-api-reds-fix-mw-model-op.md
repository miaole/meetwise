# REQUEST — **GAP-G7K-API-REDS 修复刀**（G7K 三红根因诊断 + 修复方案 + trio 复跑方案 · ≠ suite green）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Expert**: `mw-model-op`
**Knife**: `harness/gap-g7k-api-reds-fix.md` · slice `gap-g7k-api-reds-fix.slice.md`
**上游**: G7K nail `0c6c3287`（GAP-G7K-API-REDS P1 OPEN 登记）· G7K EXEC `f02602cb`（实跑 code SHA `8c6860e3` · trio EXIT 1/1/1）
**Base tip**: `7b28a492`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7R**

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
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |
| `actualSpendCny` | **null**（沿 I 线 · Ban invented spend） |

## 请审什么（mw-model-op · live 调用面 / 模型端点治理 / 预算与 Key 卫生）

Line G7R · **GAP-G7K-API-REDS 修复刀**。请审（model-op 首责面）：

1. **共同最上游候选 H0 的证据与措辞（harness §1·H0）**：`text-endpoint-config.ts`（blob `005c68cc`）默认 profile=`deepseek-cn-public`（`:77` → `api.deepseek.com`）↔ 默认 model=`qwen-plus`（`:67`）**配对一致性**是 H0 核心；G7K 协调方 Key 探针「HTTP 200 可用」为 name-only 存在性探测、**不证明 endpoint↔model 配对可用**——此缝隙登记是否如实；H0-alt-1（Key-provider 错配）/H0-alt-2（model-admission/cost-governance pre-dispatch 拒绝 · `job-route-classify.ts:113-128` PRE_DISPATCH_KNOWN_NOT_SENT 族）/H0-alt-3（worker env 缺口）竞争假设是否同等呈现；**假设非断言 · env 补齐生效 ≠ H0 定谳**的措辞纪律（harness §6.3）。
2. **sticky route_unresolved 语义（红①根因链）**：`job-route-decision.ts` 模块头 `:14`「known_not_sent / dispatched_unknown / validation_rejected 是 sticky 终态，永不自动重试」+ `classifyJobRoute` 一次外发栅栏 + `createJobRouteModelClassify`（`job-route-classify.ts:144-207`）catch-all `knownNotSent`——修复候选 F-A（env 补齐）对该 sticky 面**只对新 revision 生效**（旧 sticky 岗位不复活）；EXEC 收据须按此口径解读（新跑 = 新 job/revision，不受 G7K 旧 sticky 行污染）；是否如实。
3. **F-B 产品修复候选的边界（本刀 Ban coding）**：默认配对一致化/启动 fail-fast 校验触碰 `text-endpoint-config.ts`（± api/worker 启动校验面）——**另刀**，须独立 REQUEST + 双审 + 协调方授权；本刀只登记方案；EXEC 期顺手修 = 违纪（Ban 为绿改产品）。
4. **Key 卫生（硬 · 沿 G7K C-K6/C-MO-G7K-3）**：Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader）· **Ban 写任何 `.env*`** · Ban Key 值/fingerprint 入 receipt/log/commit/截图 · 探针 name-only；**新增配置注入 F-A 的值域纪律**：`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` 为非敏感配置名，值须在允许集内（`TEXT_ENDPOINT_PROFILES` 闭集 / registry model 白名单）且**由协调方 EXEC 指令下达，Ban agent 自造/改写**；收据可记配置值（非 secret）但 Ban 借值域外注入变相换端点。
5. **预算与 live 面（harness §3.5）**：上限沿 G7K **≤200 次**；诚实偏差披露在案——修复生效后 recruiting-bound 完整旅程 ×2 + CMD1 三条 `driveInterviewToTerminal` 全程生成，**live 调用面较 G7K（<120 · bind 失败下）增大**；route classify 每新 revision 0 或 1 次外发（rule 命中 0 次）；voice/OCR/ASR/TTS 无 DASHSCOPE key → honest capability skip = 0 调用 ≠ green；额度上限以协调方 EXEC 指令为准，超限即停如实记中止（不洗 not_run）；**`actualSpendCny=null` 沿 I 线**（无计价数据源 · No invented spend · 金额须协调方另给计价依据）。
6. **收据与定谳落点**：`receipts/gap-g7k-api-reds-fix/` 3 per-CMD + SUMMARY，SUMMARY 须含根因假设定谳段（H0/H0-alt 之一 · 附收据证据 · 按 §6.3 措辞强度）；归档（AC/AD/U/L/G7B/G7K）零改写；evidenceOfRecord/SSOT 登记**留 nail 阶段**；`g7SuiteGreen=false` 保持至三绿 + post-dual BOTH PASS + 协调方 nail。
7. **Ban 清单确认**：Ban coding（本 turn 与 EXEC 默认 plan）· Ban prove 执行（本 turn 零 trio 实跑零 live 零 Key 加载）· Ban push · Ban SSOT/backlog 状态翻转 · Ban 洗绿/Ban retry-to-green/Ban flake 记法 · **Ban 改 withhold 机制**（`run-e2e-isolated.mjs:2084-2098` 冻结）· Ban 为绿改语义/洗断言（F-D/F-E 否决）· Ban 碰已占用行/sibling 归档 · Ban self-approve · alone ≠ dual。
8. **ERRATUM 措辞冻结沿用**：FreeTierOnly 观察=`3424dc1` · 消除轮=`82981ff` · Ban shorthand `quota-403=82981ff`。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. `actualSpendCny=null`. **假设 ≠ 断言** · Key set ≠ auto green · env 补齐 ≠ H0 定谳 · sticky 只对新 revision 解除 · **Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / F-A 值域下达；pre-exec dual PASS 后由协调方 EXEC 授权（env 注入值本体由协调方落字）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · GAP-G7K-API-REDS fix · Line G7R · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查段 — mw-model-op（append-only · 2026-10-07）

**审者**: `mw-model-op`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7r-model-op` · branch `rv/g7r-model-op` @ `fa10e01e` · 本审零实跑零 live 零 Key 值读取零 coding 零 SSOT）
**被审**: REQUEST `fa10e01e`（origin tip · parent `b6b1c52c` · G7K nail `0c6c3287` merge-base `--is-ancestor` 亲证在链）
**append 基线**: 本 stub 追加前 6383 字节 md5 `fda10e0db2f3103d36e0e8dc4413e182` 机检在案 · 本段纯追加零改写上行。

## P1–P8 检查表（model-op 首责面）

- **P1 包完整性（docs-only）**: `git diff --stat fa10e01e^..fa10e01e` 亲算 = 恰 4 md +248/−0（slice 25 + harness 126 + 双 stub 48/49）全在 `ai-docs/delivery/` · 零产品码零 package.json 零 spec 零夹具零 SSOT 零 `.env*`（worktree `find` 0 hit）→ PASS
- **P2 H0 配对不一致（结构面亲证）**: `text-endpoint-config.ts` blob `005c68cc` 亲算吻合 harness 记载；`:77` `env.MODEL_ENDPOINT_PROFILE?.trim() || 'deepseek-cn-public'`、`:67` `env.MODEL_NAME?.trim() || 'qwen-plus'`、`:37-40` 闭集注册表（`deepseek-cn-public`→`api.deepseek.com` basePath `''` · `dashscope-cn-beijing`→`dashscope.aliyuncs.com/compatible-mode/v1`）逐行实读；`model-client.ts` `:324` `resolveTextEndpointConfig()`（profile 恒走 process.env）→ `:392` `${baseUrl}/chat/completions` → `:410` body `model: dispatchModel`——**仅挂 `MODEL_API_KEY` 时派发 = POST `https://api.deepseek.com/chat/completions` × `model: qwen-plus`，跨供应商错配结构面成立**；语义内证三点：`:64-66` F4 注释自述 qwen-plus=项目实际接入模型、`:87-92` 备用端点默认 `dashscope-cn-beijing`（「Qwen backup」）与主默认 asymmetry、价格表全 qwen 族归 DashScope 侧——**H0 配对不一致论断：结构面 CONFIRMED；三红归因仍为假设（EXEC 定谳）** → PASS
- **P3 H0-alt 同判呈现**: harness §1 H0-alt-1（Key-provider 错配）/alt-2（pre-dispatch 拒 · `job-route-classify.ts:113-128` `PRE_DISPATCH_KNOWN_NOT_SENT` 实读含 `provider_rejected`/`model_not_configured`/`model_key_missing`）/alt-3（worker env 缺口）同等列出；`§6.3`「翻绿 ≠ 证明 H0」+ Non-claims「env 补齐 ≠ H0 定谳」措辞纪律在位；classify catch-all（`job-route-classify.ts:179-195` 实读 `/not_configured|api_key|key_missing|model_endpoint/i` → `model_key_missing`）为 EXEC 收据可甄别面 → PASS
- **P4 sticky 语义**: `job-route-decision.ts` 模块头 `:14`「dispatched_unknown / known_not_sent / validation_rejected 是 sticky 终态，永不自动重试」逐字在位；stub §2 正确限定 F-A 只对新 revision 生效（旧 sticky 不复活；新跑=新 job/revision） → PASS
- **P5 F-A/F-B 边界**: harness §2 F-B 行 + stub #3 + slice §2 三处落字「另刀 coding · 独立 REQUEST + 双审 + EXEC 授权 · EXEC 期顺手修=违纪」；**本席补充登记（C-MO-4）**: F-B 未来触碰面必须含 `packages/ai-runtime/test/text-endpoint-config.proof.ts:31-36`——默认配对（deepseek × qwen-plus）已被该 proof 断言 test-enshrined，改默认必连带改证 → PASS
- **P6 Key 卫生**: stub #4 / harness §3.3 沿 G7K C-K6 全量（进程环境 loader · Ban `.env*` · Ban 值/fingerprint 入树入据 · 探针 name-only）；本审 name-only 实测 loader 在位（`~/.meetwise-secrets/load-model-api-key.sh` · 权限 `rwx------` · 零内容读取）· REQUEST diff 零 Key 物料 → PASS
- **P7 预算诚实**: G7K SUMMARY `:4`（U4 额度上限 200）+ `:45-48`（结构估 <120 · bind 失败生成面未展开下测得）实读；G7R harness §3.5 主动披露「修复生效后 recruiting-bound ×2 首次全程 6 题×2 + CMD1 三驱动全程生成 → live 面较 G7K 增大 · 余量收窄」——披露方向正确（G7K CMD2 死在 waitForURL 先于任何生成、CMD1 fast-fail 0 题，<120 低估真实面）、超限即停不洗 not_run、`actualSpendCny=null` 保持 → PASS
- **P8 Pins + retained 零漂移**: stub 表/harness §5/slice §Pins 三处全等；任务单八 Pins（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503）+ retained（`g7SuiteGreen=false` · `actualSpendCny=null`）逐项对表全中；trio OPEN / GAP P1 OPEN / `r1Closed=false` / Disclosure-1 OPEN 保持 → PASS
- **P9 引证抽查（15/15 blob 全吻合）**: `005c68cc`(endpoint config) · `67b8928`(actions.ts) · `9a17cfe`(applications.service) · `a621d8b`(job-route-decision) · `3b1e708`(job-route-classify) · `d06b4f4`(recruiter) · `79ceded`(classifier) · `de4991e`(recruiting-bound spec · `:96` waitForURL 30s 逐字) · `3309dc3`(uc018 spec · `:139` abandon→200 逐字) · `7d65d0f`(full.e2e.ts) · `13dbfc4`(run-e2e-isolated · `:2093` `child.stderr.on('data', () => {})` 逐字 · 冻结窗 `:2084-2098` 实读) · `aa86fb3`(run-e2e-ui) · `975fbb3`(assert.ts) · `257718c`(interview.service) 全与本审 worktree 亲算一致（spec 路径在 `apps/web/e2e-ui/`，行号内容全中） → PASS

## 配对裁决（mw-model-op 核心产出 · 供协调方 EXEC 下达 · **候选、EXEC 实测定谳**）

**值域双轴（实读闭集/声明集）**: profile 轴 = `TEXT_ENDPOINT_PROFILES` 闭集（`:22`/`:37-40`：`deepseek-cn-public` | `dashscope-cn-beijing`）；model 轴 = 治理声明集（`g7-freetier-reprove-guard.ts` `:171-191` `assertModelAllowedForTest` + 价格表 `:40-55` + `:30` paid allowlist + `:31` banned）。文本主链路相关声明 model：qwen3.8-\*（免费族）· `qwen-plus` · `qwen-turbo` · `qwen-max` · `qwen-vl-max` · `deepseek-v4-flash` · `deepseek-v4-pro`（banned w/o approval）。

**有效配对候选（EXEC 二选一 · 以 Key provenance 定）**:

| 候选 | env 值（协调方 EXEC 下达） | 解析结果 | 前提/依据 |
|------|------|------|------|
| **F-A-1（首选）** | `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` + `MODEL_NAME=qwen-plus`（显式下达保收据无歧义；缺省亦同值） | `https://dashscope.aliyuncs.com/compatible-mode/v1` × `qwen-plus` | Key 为百炼/DashScope 系（H0 主线 · F4 注释「项目实际接入」· 价格表 ¥0.8/¥2 · paid allowlist · 82981ff 消除轮 paid 语义一致） |
| **F-A-2（Key 为 DeepSeek 系时）** | `MODEL_ENDPOINT_PROFILE=deepseek-cn-public`（或缺省同值）+ `MODEL_NAME=deepseek-v4-flash` | `https://api.deepseek.com` × `deepseek-v4-flash` | deepseek-v4-flash 为 DeepSeek 侧唯一同时价格表+paid allowlist 的声明模型；真实存在性 EXEC 探针定 |

**Ban 值域外（F-A 禁用值）**: `MODEL_NAME=deepseek-chat`/`deepseek-reasoner`（不在声明集 → G7 finalize 面 `g7_model_undeclared`）；`deepseek-v4-pro`（banned without approval）；qwen3.8-\* 免费族（与 82981ff 消除轮 paid 语义冲突，非本刀候选）。

**H0 vs H0-alt-1 甄别法（EXEC 一跑可判）**: F-A-1 下若收据现 provider 4xx `model-not-exist` 类 → 与 H0 一致；若现 401/auth 类 → Key provenance 非百炼（H0-alt-1），转 F-A-2 重下 EXEC 指令（C-MO-7 · Ban 就地改值重跑）。配对可用性与三红归因均为 **候选、EXEC 实测定谳**——本席裁决的是「值域内哪些配对合法 + 甄别顺序」，不是 H0 本身真伪。

## Fail-trigger audit（F1–F8 全未触发）

F1 H0 写成断言（§6.2/6.3 + Non-claims 在位）· F2 agent 自造 F-A 值预填（值域留协调方 EXEC；本表系审查产出非实现注入）· F3 预算隐瞒（§3.5 主动披露 live 面增大）· F4 Pins 漂移（三处全等）· F5 F-B 边界含混（另刀三处落字）· F6 docs-only 破坏（diff 亲算 4 md +248/−0）· F7 Key 物料入树（diff 零物料 · loader name-only）· F8 sticky 语义错写（`:14` 逐字 + 新 revision 口径在位）——**全未触发**。

## Blockers

**0 Blocker。**

## Conditions（C-MO-1~7 · 随 EXEC 延续）

- **C-MO-1 值域纪律**: F-A env 值必须由协调方 EXEC 指令下达，限定上表候选矩阵（F-A-1/F-A-2）；Ban 值域外 model 名（`deepseek-chat`/`deepseek-reasoner`/`deepseek-v4-pro`/qwen3.8 免费族）；收据可记配置值（非 secret）但 Ban 借值域外注入变相换端点。
- **C-MO-2 定谳措辞**: SUMMARY 根因定谳段按 §6.3 强度措辞——「与 H0 一致」≠「H0 已证」；H0 vs H0-alt-1 以 provider 错误类 + knownNotSent reason 收据落字甄别。
- **C-MO-3 sticky 口径**: 新跑 = 新 job/revision；旧 sticky `route_unresolved` 不复活；EXEC 收据按此口径解读，Ban 把旧 sticky 行计入新 attempt 结果。
- **C-MO-4 F-B 登记补充**: 未来 F-B 刀（默认配对一致化/启动 fail-fast）触碰面必须含 `text-endpoint-config.proof.ts:31-36`（默认配对 test-enshrined 断言）；本刀零实现。
- **C-MO-5 预算**: 结构估 <200 但余量收窄（live 面增大已披露）；实际额度以协调方 EXEC 指令为准，超限即停如实记中止（不洗 not_run）；`actualSpendCny=null` 保持（无协调方计价依据 Ban invented spend）。
- **C-MO-6 Key 卫生（硬）**: Key 只经进程环境 loader；Ban 写任何 `.env*`；Ban Key 值/fingerprint 入 receipt/log/commit/截图；`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` 探针 name-only + 值可入收据（非 secret）。
- **C-MO-7 值迭代纪律**: 若 EXEC 实测证明所选候选前提错误（如 F-A-1 现 401），Ban 就地改 env 值重跑（retry-to-green 变体）；回协调方按 Key provenance 重下 EXEC 指令，每一次 attempt 独立全记录七字段。

## 中文三行摘要

1. 配对裁决：H0 结构面成立——默认 `deepseek-cn-public`(:77→api.deepseek.com) × `qwen-plus`(:67) 跨供应商错配经 `:67/:77/:37-40` + `model-client.ts:324/:392/:410` + 价格表/备用端点语义三点实读亲证，但三红归因仍是假设；F-A 候选 = **F-A-1 `dashscope-cn-beijing`×`qwen-plus`（首选·Key 为百炼系）** / **F-A-2 `deepseek-cn-public`×`deepseek-v4-flash`（Key 为 DeepSeek 系）**，候选、EXEC 实测定谳；`deepseek-chat` 等值域外名 Ban。
2. F-A/F-B 边界清晰（另刀三处落字；本席补充 F-B 触碰面含 proof `:31-36` test-enshrined 配对）、预算 ≤200 且 live 面增大已预披露、15/15 引证 blob 全吻合、withhold 契约 `:2093` 逐字、Pins 零漂移、docs-only 亲算 4 md +248/−0。
3. 0 Blocker，携 C-MO-1~7；alone≠dual 本 PASS 仅为 mw-model-op 半签，不代签并行 peer mw-e2e-ha；本 PASS ≠ EXEC 授权 ≠ H0 定谳 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`。

Verdict: PASS

---

# POST-PROVE dual 审查（mw-model-op · F-A-1 配对探针实跑复验 + 残余候选裁决）

**审域**：Line G7R POST-PROVE dual——包完整性复核 + F-A-1 实跑收据独立复验 + **残余候选（H0-alt-1 / H0-alt-2 / H0-alt-5）裁决与甄别清单（本席核心产出）** + 本席 PRE 条件 C-MO-1~7 逐条裁决。独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7rp-model-op`（branch `rv/g7rp-model-op` @ origin tip `e67989e4`）。0 prove run · 0 live 调用 · 0 Key 值读取 · 0 coding · 0 SSOT edit · 禁 push。mw-e2e-ha 的并行 post-dual 审本席不可见、不代签；alone ≠ dual。

## 1. 包完整性复核（机检）

- **恰 4 收据文件**：`git diff --stat 3767f783 37a5c26f` = SUMMARY.md + e2e-isolated.md + e2e-ui-isolated.md + verify-e2e-performance.md，+207/−0，全在 `ai-docs/delivery/receipts/gap-g7k-api-reds-fix/`；`--name-only | grep -v '^ai-docs/'` = 空。**零产品码 / 零 spec / 零 package.json / 零 SSOT / 零 .env\* diff** 机检通过。
- **双胞胎 commit 观察（OB-1 非阻断）**：`e67989e4`（origin tip）与 `37a5c26f` 同父（`3767f783`）**同树**（`3909d578` 亲算全等）——收据内容逐字节等价（tree hash 级机检），疑为 push 间歇下重提交；如实登记，不影响完整性。
- **实跑 code SHA**：三 receipt 一致声明 `3767f783`，CMD3 machine receipt `gitHead` 自证同值；`3767f783` = 主线 REQUEST 孪生 + 双 PRE（`d6d1d64e`/`3767f783`）后代，亲证在链。
- **七字段 / presence / 预算 / Key 卫生**：三 CMD receipt 七字段齐（CMD 原文 / EXIT / 起止戳 / SHA / 关键输出 / envModelApiKey name-only / 预算计数），每 CMD 恰 1 attempt；`.env`×3 ABSENT 探针在案；本席全文读四收据 + commit 全物料——**`sk-`/`Bearer`/Key 值零出现**（亲读复核）；预算结构估 <50 < 200（上限 200 系协调方 EXEC 授权面），`actualSpendCny=null` 保持。
- **G7K 收据无覆盖**：G7K 时代 keyed-run 收据在 `receipts/g7-trio-keyed/`（在树亲证），新 4 文件落独立目录 `gap-g7k-api-reds-fix/`，零覆盖零改写。

## 2. 关键声称独立复验（机检逐项）

| 实现方声称 | 复验 | 结果 |
|---|---|---|
| env 链全量展开（H0-alt-3 排除） | `scripts/run-e2e.mjs:14` / `run-e2e-ui.mjs:15` 均为 `{...process.env}`（亲读；blob `c655235c`/`aa86fb3f`） | **属实** |
| withhold 契约零触碰 | `run-e2e-isolated.mjs` blob 亲算 = `13dbfc43…`（与双 PRE 钉全等）；零代码 diff | **属实** |
| wiring `:278/:279/:282` @`3767f783` | `package.json:278`=`e2e:isolated`、`:279`=`e2e:ui:isolated`、`:282`=`verify:e2e-performance` 亲读 | **属实** |
| F-A-1 值域合法 | `dashscope-cn-beijing` ∈ `TEXT_ENDPOINT_PROFILES` 闭集（text-endpoint-config.ts `:22`/`:36-40`，blob 亲算 `005c68cc` 全等）；`qwen-plus` 为默认模型名（`:67`） | **属实 · C-MO-1 守约** |
| trio EXIT 1/1/1 与 G7K 逐面同形 | 四收据交叉自洽（CMD2 24=10P/4F/10S · 同 case 同失败点 `:96`/`:139` · 新 digest 382212850） | **收据面自洽**（本席零实跑，以收据+工件面为据） |
| SSE `interview_unavailable {kind:start, reason:job_failed}` | 与 `interview-consumer.ts:93` appendEvent `{reason, kind}` 形状精确匹配（见 §3） | **属实 · 且指向性强（见裁决）** |
| `G7_FREETIER_REPROVE=1` 未设 | receipts 声明未设；本席机读 `g7-freetier-reprove-guard.ts:104`（仅显式 =1 才激活）+ runner `:46-47`/`:51-52`（透传不注入） | **g7 抛出门本 EXEC 全程休眠**（裁决要素） |

## 3. 残余候选裁决（核心产出）

### 3.0 判读基座：`job_failed` 是 throw 路径签名，非降级路径签名（本席新结构面发现）

实读消费链（全部亲读，`3767f783`）：

1. **provider 级 chat 失败在本码基是优雅降级，不抛**：provider 401/404 → `model-client.ts:515-516`（非 5xx/429/408/425 → `deterministic`+`known_not_executed`）→ `invoke.ts:642-660` 返回 `{error:'provider_rejected'}`（**不 throw**）。三个 start-job 消费点全部优雅消化：`planCompetencies`（`adaptive-interview-service.ts:54-56`「规划失败 → 默认能力集`项目经验/技术深度/问题解决`」）；出题失败 → `unavailableGeneration`（`:158-166`）→ 图态 provenance → `generationFailureOf`（`adaptive-lifecycle.ts:23-40`）→ `emitGenerationUnavailable` → `interview_unavailable{reason:"generation_*", provenance}`（`:47-58`，**无 `kind` 字段**）。
2. **观测到的 SSE `{kind:"start", reason:"job_failed"}` 只匹配 throw 路径**：唯一产出该形状的写点是 `terminalizeUnsettledInterview`（`interview-consumer.ts:93`，`{reason, kind}`），经 `failClaimedInterviewJob`（`:155-168`）由 `drainInterviewJobOnce` 的 catch-all（`:370-381`）触达——即 start job **抛了异常**。`reapStuckInterviewJobs` 同形状但 reason=`worker_died`，排除。
3. **推论**：若「provider 拒绝 chat 调用」（H0 配对错配 / H0-alt-1 Key provenance）是红②的唯一根因，F-A-1 下红②应表现为 `generation_*` 降级终态（或模板题成功），**而非 `job_failed` throw**。观测签名与该假设**结构性不相容**——这是「置信度显著下降」的代码面机制解释，也解释了 F-A-1 与 G7K 逐面同形（失败根本未到达 provider 文本调用，换值自然零行为差）。
4. `g7` 允许集抛出门（`g7_model_undeclared` 等，guard`:171-191`）因 `G7_FREETIER_REPROVE=1` 未设而休眠——本 EXEC 无来自值门控的 throw 源。

### 3.1 H0-alt-2（registry `embedding-build/embedding-query` `wired:false` pre-dispatch 拒绝 = start job 秒败根因）——**驳回（code face 级）**

`model-operation-registry.ts` 实读：`:147-150` `qbank.embedding-build.v1` `wired:false`（`:148`）、`:152-155` `qbank.embedding-query.v1` `wired:false`（`:153`）——行号声称精确；`:249` `resolveModelOperation` 对 unwired 返回 `model_operation_not_wired`。但**start-job 派发路径不消费这两行**：

1. **零生产调用点**：全库非测试 grep，`qbank.embedding-*` id 仅存在于 registry 文件自身；`resolveModelOperation` 生产调用点仅 `invoke.ts:317/:407`、`interview-voice-seams.ts:42/:54`（voice，wired）、`model-admission.ts:48`——无任何点传入 embedding id。registry 头注 `:140-144` 明文：unwrapped 能力「**adapters remain direct (they bypass invoke() and are not cost-governed yet)**」——embedding 走直连适配器 + 计算缓存 seam（`qbank-embedding-compute-seams.ts` 全文实读：缺 pin → `undefined` → 直连路径，不进 registry）。
2. **即便假设传入也不抛**：`model-admission.ts:48-49` `!resolved.ok → return undefined` → 头注 `:13-17` legacy MODEL-OP-00 账本路径（声明「不把该缝改成生产 fail-closed」）；`invoke.ts:317-319` 同样返回 `undefined` 键不抛。
3. **start-job 检索失败是确定性降级值非异常**：`decideRouteSnapshotRetrieve` 缺快照 → `degradedRetrieval('route_snapshot_missing')`（`qbank-retrieve-scope.ts:73`）；`retrieveViaDispatchTrackLocal` 的 `recheck_failed`/rejected → `degradedRetrieval(...)`（`qbank-track-local-retrieve.ts:165-193`）；registry 两行的 `fallbackAction:'no_rag'`（`:149/:154`）与该设计一致。
4. start-job 实际消费的 chat operations（`interview.competency-planning.v1` `:65`、`interview.question-generation.v1` `:70`、`job.route-classify.v1` `:100`）**全部 `wired:true`**。

**裁决**：`wired:false` 结构面真实存在（行号属实），但作为三红根因候选**出局**；「修复=接线（产品刀）」针对的是一个与本次三红无关的假想需求（embedding 收编 registry 治理），G7R 域内无此授权。降级为 F-B backlog 结构面注记。

### 3.2 H0-alt-5（start job 在模型调用之前/模型面之外结构性失败）——**升为第一排序候选**

与全部观测证据**最相容**：(a) SSE throw 路径签名（§3.0 推论 3——provider 拒绝解释不了它）；(b) F-A-1 零行为差 + 与 G7K 逐面同形（值无关的结构失败）；(c) 1.8s 秒败时间窗兼容（pre-model 门失败亚秒级；provider 单程 RTT ~0.17-0.27s 亦兼容，时间 alone 不甄别，但 §3.0 签名已甄别）。候选 throw 源（全 pre-provider-文本调用，本席逐一实读枚举）：

- **结构门**：`hasCurrentResumeReference` = false → throw `interview_resume_reference_missing_or_mismatched`（`interview-consumer.ts:200-206`，v64 epoch/reference 严格 SQL join）；`:313-314` `interview_resume_reference_missing`。
- **checkpoint/fence/投影基建**：`enrollCheckpointThread`、`withInterviewGraphFence`、PostgresSaver checkpoint 写、`persistAndEmitQuestion`/`writeGenerationUnavailable` 自身的 DB 异常。
- **invoke 内部态 throw**：`model_invocation_admission_state` / `model_invocation_dispatch_state` / `model_cost_unknown_state` / `model_execution_aborted`（`invoke.ts:494/:562/:601/:604/:524/:662/:664` 等）。
- **trackLocal 派发机制内非映射异常**（检索计划/复核机器的 SQL/infra 错误穿透）。

**注意**：本候选不自动等于「checkpoint 面故障」——具体命中的门**已持久化**：`markJobFailed` 把 `error.message`（≤500 字符）写入 `interview_job.last_error`（`interview-jobs.ts:214` 亲读）。这是零 live、零 Key、一步定谳的甄别器。

### 3.3 H0-alt-1（Key provenance 非百炼 / 无 qwen-plus 权限 → 401）——**保持开放，但收缩至红①面**

红①（recruiting-bound ×2 `:96`）因果链上 classify invoke 失败 → `knownNotSent(<code>)`（`job-route-classify.ts:173-195`，catch-all + `PRE_DISPATCH_KNOWN_NOT_SENT` 闭集）→ 空 allocations → 路由未就绪 → `interview_ineligible_route` 409（`applications.service.ts:43-47`）→ start action throw → 错误边界。该面与 401 和 404 **同形**——invoke 层把 401/404 扁平化为同一 `provider_rejected`（`model-client.ts:515-516`），且 stderr withhold（`run-e2e-isolated.mjs:2093`，blob `13dbfc43`）永不回显——**收据面 + DB 面均不可分 401 vs 404**。故：H0-alt-1 无法被本 EXEC 收据证实（实现方判读正确），也无法被 DB 读取单独排除；唯一零代码甄别路径 = 协调方 Key 直探（§3.4-B）。另按 §3.0，H0-alt-1（与 H0 同理）**解释不了红②的 throw 签名**——其作为「三红唯一根因」的可能性进一步收缩，但红①面上仍开放（「H0 与 H0-alt-1 联合假设空间开放」的实现方措辞予以确认）。

### 3.4 三候选排序 + 协调方下一步执行清单（本席核心交付）

**排序（作为三红根因候选）**：**① H0-alt-5（结构性 throw，最强——唯一能解释红② `job_failed` 签名）＞ ② H0-alt-1（开放，收缩至红①面；含 H0 的 404 变体同面）＞ ③ H0-alt-2（驳回出局，仅留 backlog 注记）**。原 H0（配对错配为唯一根因）与 H0-alt-1 共享红①面与同一甄别器。

**A. DB 侧判读（协调方特权 · 零 live · 零 Key 物料 · 首选）**——对 F-A-1 跑的隔离 PG 工件（若容器已销毁则转 C）：
1. `SELECT kind, status, last_error FROM interview_job WHERE status='failed' ORDER BY updated_at DESC LIMIT 10;`——**一步定谳 H0-alt-5 及其子面**（`interview_resume_reference_*` → 结构门；`model_invocation_*` → invoke 内部态；checkpoint/SQL 报错 → 基建面）。
2. `SELECT service, error, count(*) FROM ai_model_invocation GROUP BY 1,2;`——attempt 全 outcome 账本（含 `provider_rejected`/`deterministic_refusal`/pre-dispatch 拒绝码）：**有 dispatch 行** → 曾到达派发（结构性 throw 出局，红面在 provider/准入）；**无行** → 派发前即死（H0-alt-5 实证）。注意 `provider_rejected` 不分 401/404（§3.3）。
3. `SELECT count(*) FROM ai_invocation_trace;`——success-only 面（`invoke.ts:348-352` 明文只在输出校验通过时落）：0 = 本 EXEC 零成功 provider 完成。

**B. 协调方 Key 直探（H0-alt-1/H0 甄别器 · 协调方诊断特权 · **Ban 实现方执行**）**——单次最小请求，判读表：

```bash
code=$(curl -sS -o /tmp/mw-key-probe.json -w '%{http_code}' -X POST \
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions' \
  -H "Authorization: Bearer ${MODEL_API_KEY}" -H 'content-type: application/json' \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"ping"}],"max_tokens":1}')
printf 'HTTP %s\n' "$code"; head -c 400 /tmp/mw-key-probe.json; echo
```

| 状态码 | 判读 | 后续 |
|---|---|---|
| 200 | Key=百炼且 qwen-plus 可用 → H0-alt-1 出局，H0 值面（错配致 provider 拒）同出局 | 三红归结构性（H0-alt-5 族优先）→ A 读数 + 产品刀/F-F |
| 401 | Key 非百炼系 → H0-alt-1 定谳 | 修 Key provenance（**非** F-A-2 换模型；F-A-2 仅当 Key=DeepSeek 系时成立） |
| 400/404（model not exist / 未开通） | Key=百炼但 qwen-plus 不可用 → 原 H0 值面方向成立 | 换已开通 qwen 族或开通权限——值迭代须协调方**新 EXEC**（C-MO-7 纪律） |
| 429/配额类 | 账户配额面（新候选） | 与三红同形性需另证；预算纪律照旧 |

**C. F-F 诊断 attempt（仅当 A 的工件已随容器销毁）**：协调方授权一次仪器化重跑（任一 CMD ×1），跑后受权从 DB 读 `last_error`/账本分布并落 name-only 收据——**不破 stderr withhold `:2093`（读 DB 不读子进程 stderr）**，与 G7R 预算台账合并计数。

**D. H0-alt-2**：无执行动作；registry `wired:false` 仅留 F-B backlog 结构面注记。

## 4. 本席 PRE 条件裁决（C-MO-1~7 逐条）

| 条件 | 裁决 | 依据 |
|---|---|---|
| C-MO-1 值域 | **守约 PASS** | 仅 F-A-1 两枚允许集值；闭集 `:22/:36-40` 亲验 |
| C-MO-2 定谳措辞 |**措辞恰当 · 确认并锐化**| 「置信度显著下降非证伪」正确：下降对象是「Key=百炼 ∧ H0 唯一根因」**联合假设**；H0 单独（红① provider_rejected 面，401/404 同形）仍未证伪。本席锐化：§3.0 证明 H0/H0-alt-1 作**唯一**根因解释不了红② throw 签名——置信度下降有明确代码面机制，非空泛保守 |
| C-MO-3 sticky | **守约 PASS** | 每 CMD fresh DB，classify 每新 revision 恰一次；无跨 run sticky 污染 |
| C-MO-4 F-B 登记 | **守约 PASS** | 触碰面含 proof 文件且路径勘误属实（`packages/ai-runtime/test/text-endpoint-config.proof.ts` blob `61b75c82` 亲算在树） |
| C-MO-5 / C-K8 预算 | **守约 PASS** | 结构估 <50 < 200 · 未超限未中止 · `actualSpendCny=null` 保持（结构估系唯一可得计数面，by-design 已披露，接受） |
| C-MO-6 Key 卫生（硬） | **守约 PASS** | 本席全文亲读四收据 + commit：零 `sk-`/`Bearer`/Key 值；name-only 探针；三 ABSENT 在案 |
| C-MO-7 值迭代纪律 | **守约 PASS（关键克制）** | F-A-2 触发条件（收据现 4xx model-not-exist）因 withhold 不可证实 → 未换值未重跑，每 CMD ×1——**正确**；若就地换值重跑即违反本条，实现方未犯 |

**Fail-trigger 复核（F1-F8）**：全未触发（零重跑、零 Pins 漂移、零 Key 物料、withhold 零触碰、SSOT 零 diff）。

## 5. Blockers

**0 Blocker。**

**Observations（非阻断）**：OB-1 双胞胎 commit `e67989e4`≡`37a5c26f`（同父同树 `3909d578`，内容逐字节等价，机检级无歧义；疑 push 间歇重提交）。OB-2 预算为结构估计非实测计数（精确计数面 by-design 不存在，已披露，接受）。OB-3 「F-A-1 值生效」的收据证据链是 env 展开 + 解析函数实读（`model-client.ts:324→:392/:410` 亲读吻合），无 provider 侧 echo 佐证——因 withhold 不可得，接受为最强可得证据。

## 6. Conditions（新增 · 随协调方下一步）

- **C-MO-8（定谳前置）**：任何进一步值迭代（F-A-3）或修复刀授权**之前**，必须先完成 §3.4-A（`interview_job.last_error` + `ai_model_invocation` 分布）或 B（Key 直探）之一；跳过甄别直接换值重跑 = retry-to-green 变体，本席将 FAIL。
- **C-MO-9（Key 直探特权边界）**：§3.4-B 仅协调方执行；单次最小请求（`max_tokens=1`）；Key/响应体零入树零入收据（name-only）；判读结果落 coordination 记录。
- **C-MO-10（H0-alt-2 结案口径）**：H0-alt-2 作为三红根因候选**出局**（§3.1）；registry `wired:false` 仅作 F-B backlog 注记；G7R 域内无 embedding 接线授权。
- **C-MO-11（产品刀边界）**：若 A 读数证实 H0-alt-5（`last_error` 命中结构门/内部态/基建面），修复走产品刀（对应门的 F-B/F-F 刀），非 env 值迭代；彼时 H0/H0-alt-1 仅余红①面，任何换值收益上限 = 红①解除。
- 原 C-MO-1~7 全部延续有效（本 EXEC 守约记录在案）。

## 7. 结论与非主张（Non-claims）

收据诚实面全过机检；三红如实收、未洗；F-A-1 实跑不解除三红；F-A-2 withhold 阻断下不换值不重跑系正确克制。本审产出 = 残余候选裁决与协调方执行清单（§3.4），**非**根因定谳（last_error/Key 直探未做，本席无特权）。Not a pass of the reds · not trio green · not `g7SuiteGreen=true` · not H0 falsified · not H0-alt-1 confirmed · not provider-status-determined（withhold + 401/404 扁平化双重不可分）· GAP-G7K-API-REDS P1 OPEN · Pins 原值。alone ≠ dual：本 POST-PROVE dual PASS 仅为 mw-model-op 半签，不代签并行 peer mw-e2e-ha；dual BOTH ≠ EXEC 授权 ≠ 修复完成 ≠ trio 翻绿（翻转 = 三绿 + post-dual BOTH + 协调方 nail，缺一不可）。

## 中文三行摘要（POST-PROVE dual）

1. 收据复核：包恰 4 文件 +207/−0 全 ai-docs 零产品码零 Key 物料（亲读）；实跑 SHA `3767f783` 三源自洽；withhold blob `13dbfc43`/端点 blob `005c68cc`/wiring `:278/:279/:282`/registry `:148/:153` 全部亲算吻合；trio EXIT 1/1/1 与 G7K 逐面同形如实收；预算 <50/200、`actualSpendCny=null`、Pins 原值、C-MO-1~7 全守约（C-MO-7 不换值不重跑系关键正确克制）。
2. 残余候选裁决（核心产出）：新结构面发现——观测 SSE `{kind:start,reason:job_failed}` 是 throw 路径签名，而 provider chat 失败在本码基走优雅降级（`generation_*`，planCompetencies 默认能力集），故 **H0-alt-5（结构性 pre-model throw，排序①，一步甄别器=`interview_job.last_error`）＞ H0-alt-1（收缩至红①面，排序②，唯一甄别器=协调方 Key 直探 curl+判读表已交付）＞ H0-alt-2（code-face 驳回出局：embedding unwired 行零生产调用点、即便假设传入也降级不抛、start-job chat ops 全 wired:true，排序③）**。
3. 0 Blocker，携 OB-1~3 + 新条件 C-MO-8~11（甄别前置/Key 直探特权边界/H0-alt-2 结案/产品刀边界）；C-MO-2「置信度下降非证伪」措辞确认并给出代码面机制；alone≠dual 本 PASS 仅为 mw-model-op 半签不代签并行 peer mw-e2e-ha；本 PASS ≠ 修复 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`。

Verdict: PASS
