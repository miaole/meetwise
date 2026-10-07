# REQUEST — **G7W golden 冷启归因 + api 面拒因甄别刀**（两甄别实验设计：golden ×3 受控复现 + CMD1 sidecar 仪器化甄别 · ≠ 修复 ≠ trio 翻绿 ≠ 残红定谳）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/g7w-golden-api-discriminator.md` · slice `g7w-golden-api-discriminator.slice.md`
**上游**: 本席 G7U POST-PROVE PASS `7e76e6c1`（残红后移登记承卷：golden 2R/1G 非确定性双档在卷 · api 面 G7S 同形 40560/37904/38428ms class=api receipts 亲验 · route_decided ×2 先于 begin 全过 · sidecar 白名单族亲读合法确认）· coordinator G7U nail `bbc361fa`（残红三点另刀预留）· F-F 甄别刀先例（本席 F-F RE-PRE PASS C-MO-P1 证伪分支处方 + §1.2-A 机制 + 读 DB 不破 stderr withhold 确认）· FLK 预注册先例（每实验假设+判读+反例）
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

## 请审什么（mw-model-op · 判读表忠实性 / 模型消费面 / 供给面修复定谳逻辑 / F-F 承卷一致性）

Line G7W · **golden 冷启归因 + api 面拒因甄别刀**（G7U nail 残红②③ 指名后继 · 甄别=只读诊断 · Ban 修复）。请审：

1. **F-F 承卷一致性（本席处方复读）**：实验二机制是否原样承 F-F §1.2-A（sidecar 直读隔离 PG · wrapper stdout tee `.tmp/` 不入 git · 端口行 `:2310` 触发 · 容器 finally 拆除前最后成功快照即证据 · 读 DB 不读 stderr）；逐查询执行状态 ok/error 纪律（本席 F-F C-HA-FF-3 处方）是否硬闭合；**embedding/rerank 签名显式证伪分支**（本席 F-F C-MO-P1 处方：读数现 `qbank.embedding-*`/`qbank.rerank` 签名=registry wired:false 前提被打破 → 如实记矛盾 + 回协调方，Ban 扫入基建 catch-all、Ban 就地 reinterpret）是否逐字承卷。
2. **判读表忠实性（本审首责）**：J-A1 last_error 值域映射是否与 F-F §1.4 判读表逐值一致（结构门 `interview_resume_reference_*` / invoke 内部态 `model_*_state` / 基建 checkpoint/SQL throw / `reaped:worker_died` 反例分支）——**F-F 已定谳值域本刀零重裁**；J-A5 provider/准入面（401/404 invoke 层扁平化 `provider_rejected` 不可分注记沿 F-F 随行 · 值迭代须新 EXEC 沿 C-MO-7 纪律）；`interview-jobs.ts:214-215` last_error 写入方（blob `33fbecba`）与 `full.e2e.ts:384` class=api 兜底分类（blob `7d65d0f3`）码面锚请独立复算；交叉互证规则（单一读数不定谳 · 「与 X 一致」≠「X 已证」沿 G7R C-MO-2）。
3. **G7S 供给面修复定谳逻辑（本审首责）**：J-A3（全 done + completed + consumption/snapshot 行在 + trace >0 → 下游尾段 · 供给面修复已生效红后移）vs J-A1/J-A2（供给/classify 面仍在）vs J-A4（早段）三分是否对称完备——G7U CMD3 37.9s vs G7S 38.4s「同形不同内容」的定谳是否被正确设计为**本刀产出而非预claim**；J-A2 classify 面（G7S C-MO-Q2 `validation_rejected`/`route_unresolved` sticky 同族）与 G7T v2 校准（`result_validated` 翻绿先例）的相容性判读；Ban 把「api 面未变」误读成「G7S 修复无效」的措辞纪律（修复面=begin 供给链 · CMD1 面可能与之正交——判读表是否如实区分）。
4. **实验一模型消费面旁证**：golden 冷启三假说（H-G1 chromium/worker 冷启 / H-G2 简历页组件首渲染·consent 门/上传表单供给 / H-G3 宿主资源）与 UI runner 每 run 重 spawn 真栈（production `next start` · `run-e2e-ui.mjs:141-163`）的物理相容性；golden 上传路径的模型消费面（简历摄取解析）在冷启样本中的延迟贡献是否被 trace 分段正确隔离（Ban 把模型首调延迟误归 runner 冷启 · Ban 反向）；「三跑全绿=削弱非证伪 · Ban 定谳永不复现」与升压臂 B 预注册触发的措辞纪律。
5. **预注册纪律（与 mw-e2e-ha 共审）**：两实验每跑假设+判读+反例是否闭合；**Ban retry-to-green 式重跑**（升压臂 B 唯一触发条件=主臂 A 零红 · 实验二无备选跑 · 窗口错失回协调方）；红 EXIT 不冲销 G7U 真测 1/1/1 retained；甄别结论无论是否定位如实入收据（Ban 定谳压力）。
6. **边界完整性**：`model-operation-registry.ts:63-71`（blob `63af556f`）已清面零触碰（G7R post-dual 裁决维持）；残红① 与旧红③ `full.e2e.ts:203`（C-MO-P3）零触碰；withhold 契约零触碰（断言原文/case 名回读=契约变更裁定权归协调方 · Ban 本刀）；修复一律另刀（冷启面→夹具/基建刀 · 组件供给面→产品刀 · worker 面→F-F 族产品刀 · 下游尾段→断言面刀——各自独立 REQUEST+双审+协调方授权）；SSOT/backlog 状态翻转 Ban（`0c6c3287` `:107` 不翻 · sibling 归档零改写）。
7. **预算与 Key 卫生**：est ≤40 ≪ 200（est-not-counter · 超限即停如实记中止）；`actualSpendCny=null`；DB 直读用容器固定测试凭据（非模型 Key）；模型 Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader source · name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban 实跑 · Ban live · Ban push · Ban 甄别结论预claim · Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. 残红②③ OPEN（本刀指名面 · 甄别非修复）。残红① 非本刀。**F-F 判读表零重裁 · G7S 定谳=产出非预claim · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 甄别 run 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含两实验面裁定）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · G7W golden+api 甄别刀 · Line G7W · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
