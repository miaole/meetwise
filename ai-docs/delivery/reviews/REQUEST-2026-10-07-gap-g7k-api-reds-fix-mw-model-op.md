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
