# REQUEST — **G7W golden 冷启归因 + api 面拒因甄别刀**（两甄别实验设计：golden ×3 受控复现 + CMD1 sidecar 仪器化甄别 · ≠ 修复 ≠ trio 翻绿 ≠ 残红定谳）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7w-golden-api-discriminator.md` · slice `g7w-golden-api-discriminator.slice.md`
**上游**: G7U EXEC 真测 trio EXIT 1/1/1（CMD1 40.6s api / CMD2 11P/3F/10S / CMD3 37.9s api · 收据 `c9e262a5` 残红后移登记）→ G7U POST dual BOTH PASS（mw-e2e-ha `79936f44` + mw-model-op `7e76e6c1` · golden 2R/1G 非确性双档在卷）→ coordinator G7U nail `bbc361fa`（残红三点另刀预留 · GAP-G7K-API-REDS `:107` stays P1 OPEN）→ F-F 甄别刀先例（sidecar 直读隔离 PG 机制 + 读 DB 不破 stderr withhold · `harness/g7r-ff-last-error-discriminator.md`）· FLK 预注册先例（每实验假设+判读+反例）
**Base tip**: `bbc361fa`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7W**

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
| `actualSpendCny` | **null**（retained） |
| Trio | **OPEN**（G7U 真测 **1/1/1** · 全 attempt 如实 retained） |
| 残红② golden 冷启 | **OPEN**（2R/1G 非确定性 · 本刀指名面） |
| 残红③ api 面 | **OPEN**（G7S 同形 retained · 本刀指名面） |
| 残红① 旅程自适应早停 ×2 | **OPEN**（非本刀 · 处置权归协调方） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · backlog `:107` 状态行不翻） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 甄别 run 合法性 / 诚实性 / withhold 边界）

Line G7W · **golden 冷启归因 + api 面拒因甄别刀**（G7U nail 残红②③ 指名后继 · 甄别=只读诊断 · Ban 修复）。请审：

1. **预注册纪律（本审首责 · FLK 先例合规）**：两实验是否每跑有假设+判读标准+反例分支；**Ban retry-to-green 式重跑**是否硬闭合——实验一升压臂 B 触发条件=「主臂 A 零红」（预注册分支非事后补偿）· 实验二无备选跑（CMD3 内层=CMD1 同体 e2e:isolated 无新信息面 · sidecar 窗口错失=回协调方 Ban 私自重跑）；红 EXIT 不冲销 G7U 真测 1/1/1 retained 台账 · Ban flake 记法（非确定性可定性不冲销原值）· Ban 只留绿 attempt。
2. **实验一夹具/观测合法性（本审首责）**：golden ×3 受控复现零 spec 改动零产品码改动零 wrapper 改动（过滤机制=EXEC 面裁定：runner 契约内透传或整 suite 口径，预算如实）；判读仪表=trace（`retain-on-failure` 既有配置 blob `321b80e0` 零改动）+ 分段时间轴 + 栈起日志（name-only 摘要入收据 · 原文留 `.tmp/` 不入 git）；**慢速因子仅限无破坏观测类**——Ban 清 `.next/BUILD_ID` 强制重建/Ban 降宿主资源/Ban 杀进程复现（越只读诊断边界须另刀）；判读表分段归因（navigation/组件/断言三段）与「判读表外值域→如实回协调方 Ban 就地 reinterpret」分支是否闭合；「三跑全绿=假说削弱非证伪 · Ban 定谳永不复现」措辞纪律。
3. **实验二 withhold 边界（本审首责）**：**读 DB 不读 stderr**——sidecar 与子进程 stdio 零接触；`run-e2e-isolated.mjs` 零 diff（blob `13dbfc43` 前后全等机检强制 · stderr 丢弃 `:2088` / WITHHELD `:2143` / 端口行 `:2310` 行号 EXEC 按 tip 重核）；Ban 改 wrapper 输出机制/Ban 回显 stderr/Ban 落盘子进程输出；**断言原文/case 名回读=withhold 契约变更，Ban 本刀，裁定权归协调方**；SELECT-only 八查询白名单沿 G7T 四面族 + F-F last_error 族并集（Ban `interview_job.payload` / Ban `ai_invocation_trace.output` / 零写语句）；**逐查询执行状态 ok/error 纪律**（沿 F-F C-HA-FF-3：查询报错 ≠ 空读 · 仪器错误不得触发改判/补跑）；「预期 EXIT=1 ≠ 甄别失败——甄别成功判据=快照捕获读取清单」双向契约。
4. **判读表忠实性（与 mw-model-op 共审）**：J-A1~J-A6 值域映射的码面依据（`full.e2e.ts:384` class=api=兜底分类非端点定位 · blob `7d65d0f3`；`interview-jobs.ts:214-215` last_error 写入方 blob `33fbecba`；F-F 已定谳值域 Ban 本刀重裁）；交叉互证规则（单一读数不定谳 · 「与 X 一致」≠「X 已证」沿 G7R C-MO-2）；embedding/rerank 签名显式证伪分支（沿 F-F C-MO-P1）；G7S 供给面修复后「同形不同内容」定谳逻辑（J-A3 分支）是否对称覆盖「未变」（J-A1/J-A2）与「早段」（J-A4）情形。
5. **边界完整性**：残红①（旅程自适应早停 ×2）与旧红③ `full.e2e.ts:203`（C-MO-P3 断言语义 · blob `7d65d0f3` 零 diff）零触碰；`model-operation-registry.ts:63-71`（blob `63af556f`）已清面零触碰；occupied 断言面零触碰；sibling 归档（G7K/G7R/F-F/G7S/G7T/G7U 收据 lifecycle）零改写；SSOT/backlog 状态翻转 Ban（GAP-G7K-API-REDS `:107` 不翻 · nail 阶段才落字）。
6. **预算与 Key 卫生**：est ≤40 ≪ 200（实验一 ≤15 + 升压臂预注册 +≤15 · 实验二 ≤10 · est-not-counter）；超限即停如实记中止（不洗 not_run）；`actualSpendCny=null`；DB 直读用容器固定测试凭据（非模型 Key）；模型 Key 只经进程环境（loader source · name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit · `.env*` ABSENT presence 逐 attempt 记录。
7. **七字段与四来源交叉一致**：CMD 原文/EXIT 原值/时间戳/实跑 code SHA/worktree+branch/环境探针/判读归类逐 attempt 全记录；`EXIT`/`E2E_FAILURE_CLASS`/machine receipt/快照 log 四来源交叉一致才可引用；全部 attempt 全记录 Ban 删除覆盖。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban 实跑 · Ban live · Ban push/force-push · Ban 甄别结论预claim · Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. 残红②③ OPEN（本刀指名面 · 甄别非修复）。残红① 非本刀。**甄别=只读诊断 · Ban 修复另刀 · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 甄别 run 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含实验一过滤机制与实验二 sidecar 参数定值）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · G7W golden+api 甄别刀 · Line G7W · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
