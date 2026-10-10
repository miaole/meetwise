# Receipt — **GAP-UC011-REFUND-CALLBACK · Path A refund-callback product mouth** · Line Z · prove

**Status**: **`post_prove_dual_pass`**（Line Z nail · Path A mouth · prove EXIT=0 41/41 · post dual BOTH PASS · **EXIT0≠covered** · UC-011 stays **partial** · coveredCount=8 · **ADV / GAP-UC011-ADV-01 stays OPEN** · Ban wash · Ban 互借关 ADV · Ban invent covered · Ban HA · Ban 顺手洗绿 · STOP）
**Pins（原值）**: haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE stays **503** · UC-011 stays **partial** · ADV stays **gap/case-only** · `GAP-UC011-ADV-01` stays **OPEN**
**Date**: 2026-10-06 ~00:28 CST（Asia/Shanghai · UTC+8）
**REQUEST tip**: `54b20583fdc828ca43f2c9dbbc9e35060dce7dff`
**PRE_DUAL**: mw-e2e-ha `cffaf8e` PASS · mw-model-op `76edbc6` PASS · B-1 CLOSED
**CODE_SHA**: `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f`（feat · post-rebase on tip）
**PROVE_TIP**: `244b81248d33bb85110a5304fff1f3d56de8563a`（cite CODE_SHA + re-prove EXIT=0 @ CODE_SHA tree · isolated `481071-f38c9bb5`）· **NAILED TO** this tip by Line Z nail
**Branch / worktree**: `line/z-refund-callback-code` · `/workspace/meetwise-lineZ-code`
**Executed by**: `mw-core`（Path A coding+prove · Ban self-nail）
**Harness**: `ai-docs/delivery/harness/gap-uc011-refund-callback-product-mouth.md`（B-1 pins）

## PATH

**A** — 可测产品口落地（非 ADR 降级）

## Mouth

`POST /commerce/webhook/refund/:id`（等价 webhook · HMAC 载荷标签 `refunded` · 对偶 pay）

## Product surface

| Layer | Change |
|-------|--------|
| DB | `markOrderRefunded` · paid→refunded CAS · `refund_provider_txn` partial UNIQUE · entitlement 红冲 |
| SQL | `packages/db/sql/11_commerce.sql` + migration `0136_payment_order_refund_provider_txn.sql` |
| Service | `CommerceService.refundWebhook` · 400/403/404/409 具名码 · 200 `{result:refunded\|already}` |
| Controller | `CommerceWebhookController` `@Post('refund/:id')` |
| Prove | `apps/api/test/uc-e2e-011-refund-callback-mouth.proof.ts` |
| Honesty | H4/H5/R4 PREREQ-6：口浮出后停用 404 GAP 叙事；仍 ≠ covered |

## Prove CMD

```
pnpm uc011:refund-callback:prove
  = node scripts/run-e2e-isolated.mjs uc011:refund-callback:prove:raw
  → pnpm -C apps/api prove:uc011-refund-callback-mouth
  = node --import @swc-node/register/esm-register test/uc-e2e-011-refund-callback-mouth.proof.ts
```

## EXIT

**EXIT = 0** · 41/41 断言 PASS · 0 FAIL

| Class | Result |
|-------|--------|
| INV | 400 `invalid_callback` · 零副作用 |
| SIG | 403 `bad_signature`（含 pay 标签误打）· Ban any-non-404-4xx-as-sig-evidence |
| NF | 404 `order_not_found`（≠ 口缺失 404）· 口挂载旁证 403 |
| AMT | DISCLOSED 无金额通道 · 夹带忽略 · 红冲=权威 units |
| M1 | 200 `{ result: 'refunded' }` · paid→refunded · 红冲一次 |
| M2 | 200 `{ result: 'already' }` · 无双退 |
| M2x | 409 `order_conflict` · 恰一单退成 |

Isolated (re-prove @ CODE_SHA tree): container `meetwise-e2e-481071-*` · receipt `.tmp/isolated-proof-receipts/2026-10-05T16-28-39-531Z-481071-f38c9bb5-bcbf-4595-bf09-780718c16e19.json` · `releaseEvidence=false`

Prior prove @ pre-rebase `f88ca09`（同 tree · 亦 EXIT=0 · 41/41）also recorded.

## HONESTY

- **EXIT0 ≠ covered** · UC-011 stays **partial** · coveredCount=**8**
- **Ban wash ADV** · `GAP-UC011-ADV-01` stays OPEN · ADV stays gap/case-only · Ban 互借关 ADV · Ban closing GAP-UC011-ADV-01
- balance-ui / wallet / fail HTTP / full.e2e = 其它缺口 · 本刀不关
- Residual: scenarios 主口 `POST /payment/refund-callback` **仍 404** · ADV INV 过时 = **后续刀** · Ban 顺手洗绿
- Post-prove dual BOTH PASS：mw-e2e-ha `938adee524e9d927cecbc2e9ea84614e94d582e3` + mw-model-op `ef980e3faf1ac1fd73c5a5f81003e6788e33419d`。Lifecycle advanced to **`post_prove_dual_pass`** by Line Z nail（cross-ref harness/slice/SSOT）。**EXIT0≠covered** · Ban invent covered · Ban claiming covered.

## Non-claims

Not covered · not ADV closed · not HA · not releaseEvidence · not nail · not Meridian · not live · not secrets

*Receipt · GAP-UC011-REFUND-CALLBACK Path A · Line Z · prove EXIT=0 41/41 @244b812 · post dual 938adee+ef980e3 PASS · lifecycle post_prove_dual_pass · EXIT0≠covered · ADV OPEN · coveredCount=8 · Ban wash · Ban 互借关 ADV · Ban 顺手洗绿 · STOP*
