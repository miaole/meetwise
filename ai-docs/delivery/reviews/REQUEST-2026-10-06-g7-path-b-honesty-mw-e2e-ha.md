# REQUEST — **G7 Path B honesty · trio FAIL 四分类 + Path B 排队清单**（分类矩阵 · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7-path-b-honesty-classification.md` · slice `g7-path-b-honesty-classification.slice.md`
**Parent tip**: `4766d4fc`（`origin/feat/mysql-schema-skeleton` 实际 tip · 满足预期 ≥`4766d4fc` · fetch 网络失败以本地为准 · not a prove tip）
**Date**: 2026-10-06
**Line**: **G7B**

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
| `g7SuiteGreen` | **false**（retained · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN 1/1/1**（retained · Key-blocked · AC `7c818c5` + AD `880f144` EXIT 1/1/1 retained） |
| `techRoleFailClosedOptOutG7Only` | **true**（retained · Disclosure-1） |

## 请审什么（mw-e2e-ha · 分类 / 引证 / 排队 · Ban washing Key-blocked as pass）

Line G7B · 承接 Line AC NAIL `3922b4859f034f07d43ba9f9b443ac3d29b7687e`（Path A · prove tip **NAILED TO** `7c818c5fe2249cdac686aa2a0e58748b3c5dea68` · code `160c30cac7a0a05106120949f337847b782647b7` · EXIT **1/1/1** Key-blocked `live_provider_key_missing`）+ Line AD residual 轨（`880f144` re-attest 1/1/1 · P2 分类 · class 无漂移）。请审：

1. **证据基线**：分类矩阵（harness §2）的 Path A 收据引证是否准确逐 case 落 file:line/case id —— C1 `e2e-isolated.md:43-45`（`scripts/run-e2e.mjs:43` · machine receipt `assertionCount=null`）· C2 `e2e-ui-isolated.md:36-42`（`scripts/run-e2e-ui.mjs:48` · frame `failure-class.mjs:226:17` / `run-e2e-ui.mjs:48:52` · Playwright not reached）· C3 `verify-e2e-performance.md:29-33`（build 0 · `migrate:prove` 0 · HTTP full E2E 1 级联 Key gate）；Key gate 源码点 @`4766d4fc` blob 锚（`run-e2e.mjs:43` blob `c655235c…` / `run-e2e-ui.mjs:48` blob `aa86fb3f…`）与守护 proof（`g6-e2e-iso-blocked.proof.mjs:84` · `uc-e2e-001-live-blocked.proof.mjs:55`）定位是否正确。
2. **四分类完整性**：[Key-blocked | 真实产品缺陷 | 夹具/基建缺陷 | 环境缺口] 四分 + 「非独立类」附录（C11 `client_exited` 下游症状）是否完整；C4 R5-MARKED-RED（BUG-E2E-ISO `gap-bug-backlog.md:98`）归夹具/基建、C5/C6（docker.sock cleared @ AC · chromium present）归环境已闭合是否成立；`assertionCount=null` 必须登记为 **unknown（null）**，**Ban** 写成 0 失败或全绿。
3. **「Key-blocked」与「真实缺陷」分开**：真实产品缺陷 **0 确认** 的口径是否守住（业务 case 未执行 → unknown ≠ 0 · 不发明缺陷行 · 不反向冒充「无缺陷」）；历史 Key-set era 明细（A″ `e697c81` 14F/4P/4S → FIX `a4e3de5` 10P/2F/10S · retained 不重跑）中 C7/C8/C9 归 Key-blocked 族、C10 ingest 标签归「夹具/断言缺陷已修（REMEDIATED · 留痕不改写）」是否准确。
4. **排队清单（Q1–Q3）**：Q1 夹具拆分（MySQL/Qdrant · P1）+ Q2 云 serial runner 另轨（P2）是否与 BUG-E2E-ISO 行口径一致；**Q3 mock 断言面**是否满足：独立 REQUEST + 双审 · **必须显式标注「mock ≠ real-model E2E」** · Ban 冒充真模型 E2E · Ban 冲抵 Key-blocked · Ban 借 mock 翻 trio/`g7SuiteGreen` · 收据独立命名归档；排队 ≠ 授权。
5. **Ban trio 重跑**：本刀零实跑（分类全引用 AC/AD 收据 · CITE EXIT 1/1/1）；Ban 重复跑 / retry-to-green / Ban 与 AC/AD 收据重复跑造成漂移混淆；Ban 修码 / Ban 改 `run-e2e*.mjs` 降级 / Ban 假 Key 占位过门 / Ban skip-as-pass / not_run-as-pass。
6. **状态冻结**：`g7SuiteGreen=false` · trio OPEN 1/1/1 · Disclosure-1/R1 OPEN · coveredCount=8 · Ban invent covered · Ban SSOT 擅自翻行（nail 期才碰）· G6 / R5-MARKED-RED / BUG-E2E-ISO 不因本刀关闭 · ERRATUM retained（FreeTierOnly 观察=`3424dc1` · 消除轮=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22`@09-23）。
7. **边界**：docs-only 本 turn；零产品改动；Ban live（0 模型调用 · Keys unset · `actualSpendCny=null`）· Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban 碰 sibling 线归档。

Trio stays **OPEN 1/1/1**. `g7SuiteGreen=false`. `r1Closed=false`. Disclosure-1 **OPEN**. Line AC EXIT **1/1/1** retained · Line AD 1/1/1 retained. **Key-blocked ≠ pass** · mock ≠ real-model E2E · unknown(null) ≠ 0. **Ban covered** · coveredCount=8.

本 stub 不授权 coding / prove / trio 重跑 / mock 面实施 / live / push / buy cloud；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · awaiting expert pre-exec dual · STOP*
