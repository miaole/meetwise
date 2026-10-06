# REQUEST — **GAP-UC025-FAULT-ISOLATED-01 · UC-025 FAULT 隔离 PG/HTTP 证据层** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-privacy-int`（默认搭配；若审后判本刀为纯 commerce/E2E 面、无 privacy/授权域邻接，可改 `mw-rag-route` 并在本 stub 或其 review 中说明理由——escape hatch 预留）
**Knife**: `harness/gap-uc025-fault-isolated.md` · slice `gap-uc025-fault-isolated.slice.md`
**Parent tip**: `44154aa5`（full `44154aa53a8c8508e8e8b1c51333c648187ac360` = origin tip · AA nail `15eedd6` 之后）
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

## 为何 mw-privacy-int（邻接理由 · 供裁决）

quiz 新鲜度锚点面涉 **privacy 授权域邻接**，非纯 commerce/E2E：

- `resume_quiz` 是 **owner-scoped 工件**（owner_user_id 检查镜像 quiz.service 访问形状——B'' real-wiring harness 范围表第 2 行原值），begin 授权路径对工件的 owner 解析是授权域面；
- 隔离 harness 的身份面走 `x-user-id` dev 回退头（`_neg-harness.ts` `U()` 先例 · `NODE_ENV!=='production'` 才生效）——隔离面收据须披露该回退不得外溢为生产语义；
- FAULT 拒绝快照涉及 interview/entitlement/queue 三域 before/after——零副作用断言本身是隐私域「拒绝即无痕」判据的邻接面。

## 请审什么（mw-privacy-int · 授权域邻接 / 隔离面隐私不回退）

1. **邻接裁决**：上述三条邻接理由是否成立；若判纯 commerce/E2E，请显式说明并建议改 `mw-rag-route`（escape hatch 按原样生效，不视为审点失败）。
2. **owner-scope 不 widen**：隔离面 F1–F5 不新增跨用户 replay 断言（ADV = NHP 序 #4、非本刀）；owner 检查仅作 disclosed-not-blocking 旁证观察——是否守住「隔离面刀 ≠ ADV 刀」边界、Ban 借旁证关 ADV。
3. **身份回退不外溢**：`x-user-id` dev 回退头仅活在隔离壳进程环境（`NODE_ENV!=='production'` 先例）；收据是否须披露该回退语义 ≠ 生产授权面；Ban 把隔离面绿叙事成生产授权证明。
4. **零副作用 = 拒绝即无痕**：F1/F2 拒绝后 before/after 快照（interview 未建 · 额度未扣 · 队列未入）是否等价于「拒绝路径无 PII/无工件残留写入」的诚实观察点；观察缺席如何如实披露（disclosed-not-blocking ≠ 关 gap）。
5. **PG-retained / UC-052 不碰**：本刀不触删除/擦除/checkpoint 物理清除任何面；public DELETE stays 503；PG-retained 不变；UC-018/052/004/014/026/002/011 零触碰。
6. **secrets 纪律**：隔离壳所需 secret（AUTH/PAY 等 test 值）只经进程环境注入，不入树不入 `.env*` 不入 receipt；`MODEL_API_KEY` 删除（负路径不触付费 provider）。
7. **判据不漂移 + Pins 原值**：409 `missing_quiz_expiry` · NULL/NaN fail-closed · 顺序冻结 · 无 quiz-id 跳过 · C-1 supersede 窄保留——与 AA `a8b98fc` 原值一致；上表 8 pins 不翻；row stays gap · FAULT 列 stays gap · coveredCount=8。
8. **EXIT 契约**：EXIT 0 当且仅当隔离面全部断言成立；EXIT1 诚实保留（attempts 全记录 · Ban retry-to-green · Ban 记 flake）；EXIT0 ≠ covered ≠ nail ≠ 翻行；与 AA in-process 收据互补不互替。

Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA.

---

*Stub · awaiting expert pre-exec dual · STOP*
