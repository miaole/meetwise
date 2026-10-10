# SUMMARY — G7R **F-A-1 配对实测**（Line G7R EXEC · `executed:awaiting_post_prove_dual` · 2026-10-08）

**Lifecycle**: **`executed:awaiting_post_prove_dual`**（EXEC 落盘 · trio EXIT **1/1/1** · ≠ suite green · ≠ trio green · post-prove dual 由协调方另派 · Ban 自批 · alone ≠ dual）
**授权链**: REQUEST `fa10e01e`（origin 主线孪生；本地 line 孪生 `77305ad2` patch-id `d9de0018` 全等）→ PRE dual **BOTH PASS**（mw-e2e-ha `216ffe16` + mw-model-op `351908ee`）→ 协调方 **EXEC 显式授权**（2026-10-07 · F-A-1 首选值 · 额度上限 200 · C-HA-1~8 + C-MO-1~7 绑定）→ 本 EXEC（三条 CMD 各 ×1 · 无重跑 · **未触发 F-A-2**，触发条件见 §定谳）
**实跑 code SHA**: **`3767f783863c8dc2bb8743e4ff02654948f1c34c`**（本地主线 tip：REQUEST 孪生 `fa10e01e` + 双 PRE 审 `d6d1d64e`/`3767f783`；origin ref 停在 `fa10e01e` = push 间歇堵，沿 G7K O3 先例以本地主线链为准如实登记；CMD3 machine receipt `gitHead` 自证同值 · receipt commit ≠ 实跑 SHA）
**C-HA-1 重钉**: 7b28a492→3767f783 **非 ai-docs 零 drift**（`git diff --name-only` 机检）；wiring 漂移 = G7K 旧锚 `:276/:277/:280` @`8c6860e3` → **`:278/:279/:282`** @`3767f783`（mem00 接线先于 REQUEST base 已落地）；15 blob 锚全等（gate `c655235c`/`aa86fb3f`/`13dbfc43` · spec `de4991e6`/`3309dc38` · `full.e2e.ts` `7d65d0f3` 等）；`text-endpoint-config.proof.ts` 实际路径 = `packages/ai-runtime/test/`（C-MO-4 触碰面路径勘误随 F-B 登记带）

## EXIT table（each CMD ×1 · Ban retry-to-green · 逐 attempt 全记录）

| # | CMD | Start (+0800) | End (+0800) | EXIT | 失败类 | 一句话原因 |
|---|-----|---------------|-------------|------|--------|------------|
| 1 | `pnpm e2e:isolated` | 00:10:49 | 00:11:04 | **1** | **api** | migrate 141 PASS · ledger=[ocr,voice]（执行越过 `full.e2e.ts:153`）· 主 drive 段 fast-fail · **与 G7K CMD1 同形** |
| 2 | `pnpm e2e:ui:isolated` | 00:13:24 | 00:16:08 | **1** | frontend（suite 级）/ **api**（case 级） | **24 tests = 10 passed / 4 failed / 10 skipped · 与 G7K 完全同形**：recruiting-bound ×2 `waitForURL` 30s @`:96`（34.8s/34.5s）+ uc018-abandon ×2 abandon proxy 409 @`:139`（1.8s/1.9s） |
| 3 | `pnpm verify:e2e-performance` | 00:19:32 | 00:20:14 | **1** | api（级联） | build EXIT0（22490ms）+ migrate EXIT0（4670ms）→ **HTTP full E2E EXIT=1（14826ms · class=api 同 CMD1）** → suite 短路，后续步 not_run |

**Trio EXIT**: **1 / 1/ 1**——**F-A-1 配对实测 = 三红原样（与 G7K 逐面同形）**；Key gate 三重持续解除（`live_provider_key_missing` 三 log 0 hit · quota 0 复发）。

## 配对定谳（「与 H0 一致 ≠ H0 已证」措辞纪律 · C-MO-2）

**结论：F-A-1（dashscope-cn-beijing + qwen-plus）实跑不解除三红；F-A-2 转换条件未证实，未重跑（C-MO-7 守约）。**

| 甄别项 | 裁决 | 证据 |
|--------|------|------|
| F-A-1 值是否生效 | **生效（env 链亲证）** | `run-e2e.mjs:14` / `run-e2e-ui.mjs:15` 均为 `{...process.env}` 全量展开 → 值达 runner/api/worker/web；runner Key gate 通过；文本 client `model-client.ts:324` `resolveTextEndpointConfig()` 按 `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` 解析 |
| egress | **正常** | 两 provider host 无认证探针均 **HTTP 401 可达**（0.17s/0.27s · 连通+TLS 正常 · 零 Key 零模型调用） |
| H0-alt-3（worker env 缺口） | **排除** | 同 env 链亲证 |
| provider HTTP 状态（401 vs 4xx model-not-exist vs pre-dispatch） | **withhold 不可判读** | 子进程 stderr 永不回显（`run-e2e-isolated.mjs:2093`）· worker/api 输出面仅字节数（`run-e2e.mjs:80-88`）· 收据无该维度 |
| **F-A-2 触发条件**（收据现 4xx model-not-exist） | **未证实 → 不换值不重跑** | C-MO-7：换值须收据证据；401（H0-alt-1）同样未证实 |
| 「H0=默认配对错配为三红唯一根因」 | **与 F-A-1 实测不一致（置信度显著下降 · 非证伪）** | 若配对错配为唯一根因，百炼系正确配对应改变行为面；实测零改变。措辞：与「Key=百炼系（协调方探针判定）+ H0 唯一根因」的组合预测不一致；因 Key provenance 未经本 EXEC 收据证实，H0 与 H0-alt-1 的联合假设空间仍开放 |

**新结构面证据（登记 backlog 候选 · 非定谳）**：CMD2 trace SSE 资源原文 `event: interview_unavailable` / `data: {"kind":"start","reason":"job_failed"}` = **worker start job 秒败**（abandon 页快照「已结束」+ abandon POST 409 同 attempt 在案）。由此残余候选集（按证据强度如实排序）：**H0-alt-2** pre-dispatch 拒绝面（model-admission / cost-governance / registry——注意 `model-operation-registry.ts:148/:153` `embedding-build`/`embedding-query` 为 `wired:false`，若 start job 依赖 embedding 则在 chat 模型之前即拒）、**H0-alt-1** Key provenance 非百炼或无 qwen-plus 权限（401）、**H0-alt-5（新）** start job 在模型调用之前失败（与配对无关的 job 面结构失败）。三者的甄别均需 provider 级 name-only 探针或产品内诊断面（**F-F / F-B 类，本 EXEC 未授权**，留协调方裁定）。

**F-B 登记（按 EXEC 授权条款 5）**：若后续证实产品默认配对缺陷，触碰面 = `packages/ai-runtime/src/text-endpoint-config.ts`（blob `005c68cc`）+ **`packages/ai-runtime/test/text-endpoint-config.proof.ts:31-36`**（默认配对 test-enshrined · C-MO-4）——候选登记，未证实未修。

## 逐 case 红明细（五分类 · 与 G7K 对照）

| CMD | case / 步骤 | 分类 | F-A-1 明细 | G7K 对照 |
|-----|-------------|------|------------|----------|
| CMD2 | recruiting-bound ×2 @`:96` | **api** | start action throw → 根错误边界（新 digest 382212850）→ waitForURL 30s 超时 | 同（digest 190419086） |
| CMD2 | uc018-abandon ×2 @`:139` | **api** | SSE `interview_unavailable{kind:start,reason:job_failed}` → 已结束 → abandon 409 | 同形（SSE 未取证） |
| CMD1/CMD3 | HTTP E2E 脚本 | **api** | class=api · case 名 by-design withheld（withhold 契约零绕过 · 三角定位：ledger 越 `:153` → 红面主 drive 段） | 同 |
| CMD2 | voice-duplex ×6 / online-public ×4 | capability / env（skip ≠ pass） | 同 G7K 原值 | 同 |

## 预算披露（额度 200 · 未超限 · 无中止）

结构面估计（精确 per-call 计数面 by-design 不存在 · `G7_FREETIER_REPROVE=1` 未设）：CMD1 <10 + CMD2 <30 + CMD3 <10 = **合计 <50 < 200**——全部为 fast-fail 面（无长生成）；trio 未触发 F-A-2 复跑。**`actualSpendCny=null`**（沿 I 线 · No invented spend）。

## Key 卫生声明（C-K6 / C-MO-6）

Key **只经进程环境**（loader 每条 CMD 前同进程 source · name-only 探针 3× `set` 值零打印）；F-A-1 两枚配置值非 secret、经协调方下达、name-only+值入探针文件（`.tmp/` 不入 git）；`.env`/`.env.local`/`apps/api/.env` **三 CMD 跑前各探针一次全 ABSENT**（`01/02/03.env-presence.txt` 在案）；三 log + 收据全物料 `sk-*`/`Bearer` 长令牌机扫 **0 hit**；原始 log 全部留 worktree `.tmp/g7r-fa1-20261007/`（`.gitignore:15` 不入 git）。

## 环境探针（每 CMD 跑前 · 逐 attempt 在案）

docker 29.1.3 · pnpm 10.18.0 · node v22.22.3 · `pnpm install --frozen-lockfile` EXIT=0（4s）· egress 双 host 401-unauth 可达 · chromium cache 零安装 · R5-MARKED-RED `E2E_ISOLATION_STACK=pgvector-legacy` 三 log 披露原样（≠ stack truth ≠ cutover ≠ G6 closed）。树外遗留容器 `meetwise-e2e-62497-cold2-stop-band-1-*` 系 FLK 线先在产物（零触碰 · 非 EXEC 期所建）。

## Pins（原值 · EXEC 后未翻转项）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained**: **`g7SuiteGreen=false`**（三红在案 · 翻转 = 三绿 + post-dual BOTH + 协调方 nail，缺一不可）· `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN** · trio **OPEN**（EXIT 1/1/1 · F-A-1 下仍红）· GAP-G7K-API-REDS **P1 OPEN**（不翻 · 登记留协调方 nail）· `actualSpendCny=null`
**SSOT 零触碰**（gap-bug-backlog / execution-master-checklist / 覆盖矩阵零 diff）

## 条件自评（C-HA-1~8 + C-MO-1~7 · 逐条）

| 条件 | 自评 |
|------|------|
| C-HA-1 重钉 | **满足**：reset 至主线 tip `3767f783`；零非-docs drift 机检；wiring `:278/:279/:282` 重核回填；blob 全等 |
| C-HA-2 withhold 零触碰 | **满足**：`run-e2e-isolated.mjs` blob `13dbfc43` 零改动（本 EXEC 零代码 diff）；case 名甄别仅收据三角法；未开 F-F |
| C-HA-3~8（七字段/三来源/单 attempt/Key 卫生/Pins/禁碰） | **满足**：三 receipt 七字段齐；exit 文件+ELIFECYCLE+machine receipt 三源交叉；每 CMD 恰 1 attempt（01/02/03.exit 各一）；Pins 四处原值；SSOT/归档零 diff（commit 机检见后） |
| C-MO-1 值域 | **满足**：仅 F-A-1 两枚允许集值（`dashscope-cn-beijing` ∈ `TEXT_ENDPOINT_PROFILES` · `qwen-plus` ∈ model 白名单）；无值域外注入 |
| C-MO-2 定谳措辞 | **满足**：「与 H0 不一致（置信度下降）」非「H0 已证伪」；F-A-2 条件未证实即不转（§定谳表） |
| C-MO-3 sticky 口径 | **满足**：本次 fresh DB（每 CMD 独立容器），classify 每新 revision 恰一次新尝试；无跨 run sticky 污染 |
| C-MO-4 F-B 登记 | **满足**：候选触碰面含 test proof 文件（含实际路径勘误 `packages/ai-runtime/test/`） |
| C-MO-5 / C-K8 预算 | **满足**：结构估 <50 < 200 · 超限即停未触发 · `actualSpendCny=null` |
| C-MO-6 Key 卫生 | **满足**：§Key 卫生声明 |
| C-MO-7 值迭代 | **满足**：F-A-1 全程未改值；F-A-2 触发条件未证实未重跑；无同值重跑 |

## Non-claims

Not a pass · not suite green · not trio green · not fixed · not root-cause-proven（H0 未定谳 · 候选集开放）· not provider-status-determined（withhold 阻断 401/4xx 判读）· not F-A-2 attempted（条件未证实）· not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not SSOT flip（GAP-G7K-API-REDS 状态不翻）· not_run ≠ pass · skip ≠ pass · build/migrate EXIT0 ≠ suite green · 10 passed ≠ UI green · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual（post-dual 未开始 · Ban 自批）

---

*SUMMARY · G7R F-A-1 配对实测 · Line G7R EXEC · 2026-10-08 · lifecycle executed:awaiting_post_prove_dual · 实跑 code SHA 3767f783 · trio EXIT 1/1/1（F-A-1 下三红与 G7K 逐面同形）· 定谳：F-A-1 不解除三红 · F-A-2 触发条件（收据现 model-not-exist 4xx）未证实不重跑 · 401 同未证实 · env/egress 链排除 H0-alt-3 · SSE 亲证 start job 秒败（job_failed）· 残余候选 H0-alt-1/H0-alt-2（含 registry embedding wired:false 结构面）/H0-alt-5 留协调方甄别（probe/F-F/F-B 均未授权未执行）· 预算结构估 <50/200 · actualSpendCny=null · Pins 原值 · g7SuiteGreen=false · 等待协调方另派 post-prove dual · STOP*
