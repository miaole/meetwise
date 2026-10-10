# 独立第二审（诚实性 spot）— UC-E2E-027 人工复核申诉

**审方**：meetwise（协调 / honesty spot；非实现方）  
**日期**：2026-09-10 PT  
**对象**：`harness/uc-e2e-027-manual-review-appeal.md` · `eval/uc-e2e-027-manual-review-appeal.eval.md` · `apps/api/test/uc-e2e-027-manual-review-appeal.proof.mjs`  
**releaseEvidence=false** · **Not HA** · **矩阵 gap/blocked ≠ covered** · **≠ 申诉产品闭环**

---

## 复跑

| CMD | EXIT |
|-----|------|
| `pnpm uc027:manual-review-appeal:prove` | **0**（~02:13 PT；S1–S5 PASS；GAPS=6） |

GAP pins：`APPEAL-OPEN` / `OVERTURN-CAS` / `IDEMPOTENT` / `LEASE-EFFECT0` / `D3-STATUS` / `E2E`  
R5 banner 属 isolated 包装预期；静态体不读写业务表 → **不把 R5 假绿算进本 UC**。

---

## 对抗核对

| 问 | 答 |
|----|-----|
| blocked 钉是否假绿？ | **否**：EXIT=0 = 诚实 mark-red；矩阵保持 **gap/blocked**；文档禁止 partial-as-closed |
| 是否冒充申诉闭环？ | **否**：无 fake appeal API；S1/S2 反证无 HTTP/表；产品浮出则拒 EXIT=0 |
| qbank / SelectiveReview / needs_review？ | **旁证≠covered**（S3 钉死）；未冒充 ManualReview |
| 「人工复核还没开放」文案？ | honesty，非闭环 |
| 矩阵 | **gap/blocked**；**禁止 covered** |

---

## 结论：**pass**（诚实性 / blocked 登记）

- **允许**：矩阵保持 **gap** / **blocked**；eval-first 缺口钉可留。
- **阻塞上抬**：任何「UC-E2E-027 covered / 申诉已通 / A1–A4 闭环 / 假 partial-closed」叙事 → **block**。
- **抬 covered**：见 harness §1b（D3 schema + 申诉 HTTP + overturn CAS + E2E…）——本切片未关。

**不背书**产品申诉已完成。  
**不背书** HA / releaseEvidence。
