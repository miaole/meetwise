# Slice — **GAP-UC011-REFUND-CALLBACK · refund-callback product mouth**（Line Z · NAIL · **`post_prove_dual_pass`** · Path A mouth）

**Status**: **`post_prove_dual_pass`**（Line Z nail · Path A mouth · EXIT=0 41/41 · dual BOTH PASS · **EXIT0≠covered** · UC-011 stays **partial** · coveredCount=8 · **ADV / GAP-UC011-ADV-01 stays OPEN** · Ban 互借关 ADV · Ban wash · Ban invent covered · Ban HA · Ban live · Ban Meridian · Ban coding · Ban closing GAP-UC011-ADV-01 · Ban 顺手洗绿）

> REQUEST-era historical status was `draft:awaiting_re_pre_exec_dual`. Prove tip `244b812` · CODE `bf1fdb2` · REQUEST `54b2058` · EXIT 0 41/41 · B-1 pins · post dual `938adee`+`ef980e3` BOTH PASS. Lifecycle advanced by this nail only.
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` · `fbd47ac8076d2ccd0a948b88630cb397789e3ef7`
**PRIOR**: `bb1721bd6b3fdf76d5195a463543a9c3bf841d18` · **FAIL**: `bbde3100649d27a056a43ff64f0c7c3c13a28183`（mw-model-op B-1）
**Line V C-1**: PRE `587b9e0` · POST `0421e5a`
**Authority**: meetwise — L0 docs only · Ban coding product · Ban prove 执行 · Ban self-approve · Ban invent covered · Ban wash ADV covered via this REQUEST · **Ban any-non-404-4xx-as-sig-evidence**

## One-line

`GAP-UC011-REFUND-CALLBACK`（UC-E2E-011 §1b#1）今日 = **产品口缺失**：H4/H5 钉 `POST /payment/refund-callback`（及等价 webhook）**404**；Line V ADV prove EXIT1 honesty-of-red 已 nail · 两 gap stay **OPEN** · product mouths = **本刀**。本刀（Line Z）求：**可测产品口落地**（非口缺失 404 + markOrderRefunded/CAS/幂等 · M1 一次退 + M2 重放 · **B-1 具名 HTTP+error pins**）**或** 诚实 ADR 降级合同。**EXIT0 ≠ covered** · UC-011 stays **partial** 直至独立 covered-lift · **Ban wash ADV into covered via this REQUEST**.

## B-1 pins（Path A · coding dual 前钉死 · 详见 harness）

| Case | HTTP | Named code |
|------|------|------------|
| 缺字段 | **400** | **`invalid_callback`** |
| 错签/垃圾签/验签失败 | **403** | **`bad_signature`** |
| 未知 order/id | **404** | **`order_not_found`**（≠ 口缺失 404） |
| 金额不符 | **DISCLOSED** | 无金额通道（对齐 UC014 C3 / pay body `{providerTxn,sig}`） |
| M1 首次退 | **200** | **`{ result: 'refunded' }`** |
| M2 同键重放 | **200** | **`{ result: 'already' }`**（无双退） |

**Ban any-non-404-4xx-as-sig-evidence** · Align payWebhook + UC014 C1/C2/C7 + Line V C-1.

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc011-refund-callback-product-mouth.md` |
| Dual re-PRE `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-gap-uc011-refund-callback-product-mouth-re-pre-mw-e2e-ha.md` |
| Dual re-PRE `mw-model-op` | `reviews/REQUEST-2026-10-06-gap-uc011-refund-callback-product-mouth-re-pre-mw-model-op.md` |

## Scope / Not

只做 refund-callback 产品口（Path A 可测落地 / Path B ADR 降级）REQUEST + **B-1 pins 补钉**。拟 prove（授权后）形态对齐既有 isolated 壳。Not ADV 重跑 · Not covered-lift · Not balance-ui · Not SSOT flip · Not UC-018/025/004 · **Not coding product**.

## Ban

Ban coding product · Ban prove 执行 · Ban covered · Ban invent covered · Ban wash ADV into covered · Ban flip UC-011 · Ban SSOT edit · Ban self-approve（alone ≠ dual）· Ban Meridian · Ban HA cloud buy · Ban self-nail · Ban secrets / `.env*` · **Ban any-non-404-4xx-as-sig-evidence**.

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.



---

## Line Z NAIL（`post_prove_dual_pass` · additive · 2026-10-06 · Path A mouth）

- Prove tip **NAILED TO**: `244b81248d33bb85110a5304fff1f3d56de8563a` · CODE `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f` · REQUEST `54b20583fdc828ca43f2c9dbbc9e35060dce7dff` · EXIT **0** · **41/41**.
- Path A mouth: `POST /commerce/webhook/refund/:id` · B-1: **403** `bad_signature` · **400** `invalid_callback` · **404** `order_not_found` ≠ mouth-missing · amount **DISCLOSED** · M1 **`refunded`** · M2 **`already`** · Ban any-non-404-4xx-as-sig-evidence.
- POST dual BOTH PASS: mw-e2e-ha `938adee524e9d927cecbc2e9ea84614e94d582e3` + mw-model-op `ef980e3faf1ac1fd73c5a5f81003e6788e33419d`.
- Receipt cross-ref: `receipts/2026-10-06-gap-uc011-refund-callback-product-mouth-prove.md`.
- **EXIT0≠covered** · UC-011 stays **partial** · coveredCount=8 · **ADV / GAP-UC011-ADV-01 stays OPEN** · Ban 互借关 ADV · Ban wash · Ban invent covered.
- Residual: 主口 `POST /payment/refund-callback` **仍 404** · ADV INV 过时 = **后续刀** · Ban 顺手洗绿.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.

---

*Slice · GAP-UC011-REFUND-CALLBACK · Line Z NAIL · Path A mouth · 2026-10-06 · lifecycle post_prove_dual_pass · prove tip 244b812 · EXIT 0 41/41 · EXIT0≠covered · ADV OPEN · Ban wash · Ban 互借关 ADV · Ban 顺手洗绿 · releaseEvidence=false · STOP*

