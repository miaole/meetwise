# Slice — **GAP-UC011-REFUND-CALLBACK · refund-callback product mouth**（Line Z · docs REQUEST · **`draft:awaiting_re_pre_exec_dual`** · **B-1 pins after PRE FAIL `bbde310`**）

**Status**: **`draft:awaiting_re_pre_exec_dual`**（docs REQUEST only · B-1 / C-1 named status+code pins · row stays partial · Ban wash ADV into covered）
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

*Slice · GAP-UC011-REFUND-CALLBACK · awaiting_re_pre_exec_dual · B-1 pins · EXIT0≠covered · Ban wash ADV · Ban any-non-404-4xx-as-sig-evidence · STOP*
