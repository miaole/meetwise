# Review — mw-e2e-ha — GAP-UC011-REFUND-CALLBACK Path A POST-PROVE（Line Z · product mouth）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-model-op`）
**Review date**: 2026-10-06 ~00:32 CST（Asia/Shanghai · UTC+8）
**Line**: **Z** · Path **A** · `GAP-UC011-REFUND-CALLBACK` refund-callback product mouth
**REQUEST tip**: `54b2058` / `54b20583fdc828ca43f2c9dbbc9e35060dce7dff`（B-1 pins · re-PRE after `bbde310`）
**PRE dual**: mw-e2e-ha re-PRE `cffaf8e` / `cffaf8e8adac653a6f417f6b7fadbffe1eb0ee6c` PASS · mw-model-op re-PRE `76edbc6` / `76edbc66ea4a7f4950f33ae62b327b5053ed4162` PASS · **B-1 CLOSED**
**CODE**: `bf1fdb2` / `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f`（feat · Path A mouth）
**PROVE tip cite**: `244b812` / `244b81248d33bb85110a5304fff1f3d56de8563a`（cite CODE_SHA + re-prove EXIT=0；prior tree prove `30eecc2`/`f88ca09` 同 tree EXIT0）
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-gap-uc011-refund-callback-product-mouth-prove.md`
**Independent re-run HEAD**: `3922b48`（detached `origin/feat/mysql-schema-skeleton` · ancestors include CODE+cite · Ban Meridian · Ban live · Ban `.env*` · Ban git config · Ban force-push · Ban product-code change · Ban retry-to-green · Ban nail · Ban invent covered · Ban wash ADV · Ban HA）

本 PASS = Path A mouth 可测真证据独立复核半签。**≠** covered · **≠** nail · **≠** HA · alone ≠ dual · EXIT0 ≠ covered。

---

## 1. CODE / tip 独立核验

| Claim | Verified |
|-------|----------|
| CODE `bf1fdb2` | **hit** · ancestor · mouth `POST /commerce/webhook/refund/:id` · `CommerceService.refundWebhook` · `markOrderRefunded` · migration `0136_payment_order_refund_provider_txn.sql` · prove `uc-e2e-011-refund-callback-mouth.proof.ts` · register `pnpm uc011:refund-callback:prove` |
| PROVE cite tip `244b812` | **hit** · ancestor · cites CODE_SHA=`bf1fdb2` + re-prove EXIT=0 |
| Prior prove `30eecc2` / `f88ca09` | **hit** · 同 tree EXIT0 recorded in receipt |
| REQUEST `54b2058` · re-PRE e2e `cffaf8e` · model-op `76edbc6` | **hit** · all ancestors · B-1 CLOSED |
| Receipt file | **hit** · `ai-docs/delivery/receipts/2026-10-06-gap-uc011-refund-callback-product-mouth-prove.md` |
| Product mouth Path A | **hit** · controller `@Post('refund/:id')` · HMAC 标签 `refunded` · body `{providerTxn,sig}` only（DISCLOSED） |
| Prove registrations | **hit** · root `uc011:refund-callback:prove` → isolated → `apps/api` `prove:uc011-refund-callback-mouth` · `run-e2e-isolated.mjs` allowlist |

## 2. CMD | EXIT（独立重跑 ×1 · Ban retry-to-green）

Exec: `./scripts/with-docker-session.sh pnpm uc011:refund-callback:prove`  
（`sg docker` only · Ban sudo/chmod/usermod · Ban live Keys · Ban read `.env*`）

| Field | Measured |
|-------|----------|
| CMD | `./scripts/with-docker-session.sh pnpm uc011:refund-callback:prove` |
| Start (CST) | 2026-10-06 00:32:30 |
| End (CST) | 2026-10-06 00:32:39 |
| **EXIT** | **0** |
| Assertions | **41/41 PASS · 0 FAIL** |
| Mouth | `POST /commerce/webhook/refund/:id` |
| Isolation | container `meetwise-e2e-491969-*` · migrations latest `0136_payment_order_refund_provider_txn.sql`（count=136） |
| Local receipt | `.tmp/isolated-proof-receipts/2026-10-05T16-32-39-598Z-491969-ebd73a58-fadf-4708-a9f4-0f4bf3864973.json` · `outcome=passed` · `exitCode=0` · `releaseEvidence=false` |

**CMD|EXIT = `pnpm uc011:refund-callback:prove` | 0**（wrapper `with-docker-session.sh`）

## 3. B1 pins 机检表（独立 stdout · 全命中）

| B1_PIN | Required | Measured | Hit |
|--------|----------|----------|-----|
| SIG → 403 `bad_signature` | 错签/垃圾签/他单签/pay 标签误打 | 4×403 `bad_signature` + 具名码断言 + 零副作用 | **✓** |
| INV → 400 `invalid_callback` | 空 body / 缺 sig / 缺 providerTxn | 3×400 `invalid_callback` + 具名码断言 + 零副作用 | **✓** |
| NF → 404 `order_not_found` | ≠ mouth-missing 裸 404 | 404 `order_not_found` + 口挂载旁证 403 `bad_signature` | **✓** |
| AMT → DISCLOSED | 无金额通道 · 夹带忽略 · 红冲=权威 units | 夹带 amountCents/units/amount 忽略 · 200 refunded · units=10 权威 | **✓** |
| M1 → 200 `{result:'refunded'}` | 合法首次退 · paid→refunded · 红冲一次 | 200 refunded · CAS · txn 落库 · available −10 | **✓** |
| M2 → 200 `{result:'already'}` | 同键重放 · 无双退 | 200 already · available/units 不变 · txn 不变 | **✓** |
| Ban any-non-404-4xx-as-sig-evidence | 拒签须具名 403 `bad_signature`（或缺字段 400） | SIG/INV 具名码断言显式 Ban any-non-404；非「任意非-404」 | **✓** |
| M2x（旁证） | 跨单同流水 409 `order_conflict` · 恰一单退成 | 409 + A refunded · B paid | **✓** |

Classes: INV / SIG / NF / AMT / M1 / M2 / M2x = **ALL PASS**.

## 4. Honesty / Ban 确认（本刀不翻）

| Check | Ruling |
|-------|--------|
| Ban any-non-404-4xx-as-sig-evidence | **held** · 机检具名 403/400 · 非任意非-404 |
| 404 `order_not_found` ≠ mouth-missing | **held** · 具名体 + 口挂载旁证 403 |
| ADV gap stays open / Ban 互借关 ADV | **held** · prove HONESTY: `GAP-UC011-ADV-01 stays OPEN` · ADV stays gap/case-only · Ban wash ADV |
| UC-011 stays **partial** | **held** · matrix :117 / :175 未改 · 本审不碰 SSOT |
| coveredCount=**8** | **held** · prove PINS + matrix pins · Ban invent covered · Ban SSOT flip |
| EXIT0 ≠ covered | **held** · 明示于 prove stdout + receipt |
| PASS ≠ nail ≠ covered ≠ HA | **held** |
| alone ≠ dual · 不代签 mw-model-op | **held** |

## 5. Pins（原值 · 不翻）

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |
| UC-011 | **partial** |
| ADV | **gap/case-only** · `GAP-UC011-ADV-01` **OPEN** |
| PINS_OK | **yes** |

## Blockers

**None.**

## Conditions

- **C-1（alone≠dual）**: 本 PASS = mw-e2e-ha 半签。须 `mw-model-op` 独立 post-prove PASS 后方构成 post dual；nail / SSOT / covered 翻转须协调方另行授权。不代签 peer。
- **C-2（EXIT0≠covered）**: 41/41 EXIT0 = Path A mouth 真证据 · **≠** UC-011 covered · **≠** ADV closed · **≠** invent covered · coveredCount 保持 8。
- **C-3（Ban wash ADV / Ban 互借）**: 本刀不关 `GAP-UC011-ADV-01` · 不借口绿洗 ADV covered · ADV stays gap/case-only。
- **C-4（Ban nail / Ban coding / Ban HA）**: 本 PASS 不授权 nail、不改产品码、不翻 SSOT、不宣称 HA / releaseEvidence。
- **C-5（cite）**: 归档钉 PROVE cite tip `244b812` · CODE `bf1fdb2` · 本独立重跑 @ HEAD（commit 前 tip `3922b48`）· Ban 用后移 tip 冒充实跑 tip。
- **C-6（Ban any-non-404-as-sig）**: 拒签真证据保留为 403 `bad_signature`（或缺字段 400 `invalid_callback`）；404 `order_not_found` ≠ mouth-missing。

## Non-claims

PASS ≠ nail ≠ covered ≠ HA · not ADV closed · not `GAP-UC011-ADV-01` closed · not invent covered · not wash ADV · not releaseEvidence · not live · not Meridian · not secrets · not SSOT flip · EXIT0 ≠ covered · alone ≠ dual · 不代签 mw-model-op · UC-011 stays partial · coveredCount=8

## 中文三行摘要

1. 独立重跑 CODE `bf1fdb2` / cite tip `244b812`：`with-docker-session.sh pnpm uc011:refund-callback:prove` **EXIT=0 · 41/41**；B1 机检全命中（403 `bad_signature` · 400 `invalid_callback` · 404 `order_not_found`≠口缺失 · DISCLOSED · M1 refunded · M2 already）。
2. Ban any-non-404-as-sig / Ban 互借关 ADV / UC-011 stays partial / coveredCount=8 / EXIT0≠covered / pins 原值；本 PASS ≠ nail ≠ covered ≠ HA。
3. Blockers 无；alone≠dual（待 mw-model-op 独立 post）；不代签 peer。

Verdict: PASS
