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
