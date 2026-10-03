# RE-PRE-EXEC · NOTE-CKPT-UNSEALED-CLAIM-NEG（Line F · docs-only）

主审：`mw-privacy-int`  
日期：2026-10-02（约 21:12 PT）  
REQUEST：`a24382b` / `a24382b6ae10464e2b7abcc957bec43ef2868061`  
在 origin 上：是（本审时尖端 `3d7063f`）  
上一轮 FAIL：`67dd378` / `67dd378b1738e21d88465882ef18da6ab28949e9`（S5 第二刀、S6 缺 retention pin）  
本审不重跑证明，不授权产品代码。未改旧收据。

---

## 1. diff

`a24382b^..a24382b` 仅 2 个文档，+51/−72，无产品代码、测试、migration、GRANT、路由、`package.json`、`checkpoint-principal.ts`：

- `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md`
- `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`

证明 blob 在 `a24382b` 与 origin 尖端相同（`2e3ca52e`）。

---

## 2. 引用对照（origin 上的 proof）

| 文档范围 | 实际首行 | 是否该案 |
|----------|----------|----------|
| 763–766 EPOCH | L763 `const id = 'NHP-CKPT-UNSEALED-NEG-EPOCH'` | 是 |
| 768–771 DIGEST | L768 `const id = 'NHP-CKPT-UNSEALED-NEG-DIGEST'` | 是 |
| 773–776 BOTH | L773 `const id = 'NHP-CKPT-UNSEALED-NEG-BOTH'` | 是 |
| 780–804 正控 | L780 `const id = 'HP-CKPT-SEALED-CLAIM'`；L804 为 `A(id, !!lease?.leaseToken …)`；L805 结束该块，L807 才是下一案 | 是，未串案 |
| 750–758 `42501` | L750 `sqlState === '42501'`；L756–758 `ok: refused && unchanged` | 是 |

0091 L369–370 / L372–373 仍对 NULL epoch、NULL digest `RAISE` 且 `ERRCODE='42501'`。`claimAuthorizationTarget`（`packages/db/src/privacy-authorization.ts` L124–128）只调用 `privacy_authorization_claim_target`。文档写的 SQLSTATE 与 SQL 一致。

---

## 3. R1–R5

### R1 docs-only — **PASS**
只有 harness 与 slice。

### R2 行号对准 — **PASS**
上表五行都落在对应 case / `42501` 断言上，没有指到别的 case。

### R3 退役实现刀、禁止第二刀、禁止改 principal — **PASS**
harness 写明 implementation knife retired，禁止第二次实现与第二次 prove；slice 同样禁止第二实现。两文都要求保持 `apps/worker/src/checkpoint-principal.ts` 不变。状态是 `draft:awaiting_re_pre_exec`（等双人复审），不是「仍要编码」。

### R4 SSOT 不再把 NOTE 标成未做 — **FAIL**
harness/slice 本身不再排证明刀，并禁止改矩阵与 backlog。但 origin 上 `ai-docs/delivery/gap-bug-backlog.md` L64 仍把 `NOTE-CKPT-UNSEALED-CLAIM-NEG` 写成「缺显式负例 · 本 prove 未钉」，动作是「加 unsealed claim NEG」。`ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md` L172 仍把该 NOTE 列在 Open follow-ups。本提交没有改这些行，也明文禁止去改。因此引用退役 **不是** 唯一仍生效的陈述：SSOT backlog 仍把负例当缺失并安排补测。按「若 SSOT 仍写 missing / add tests 则 FAIL」，R4 不通过。矩阵与 execution checklist 未再列该 NOTE。

### R5 pins — **PASS**
harness 与 slice 都写了 `NOT_HA`、`releaseEvidence=false`、**PG-retained**、外部 **`retention_pending`**（并写明 pin 不是完成证据）、公开 DELETE **503**。禁止发明完成态结果，没有把本项或 flake 写成已修好，也没有授权新代码。退役的是实现刀，不是宣称 checkpoint 物理清除整单已完成（文内 `no nail`）。

---

## 4. 总评

R1–R3、R5 通过。R4 失败：行号引用正确，但 gap backlog 仍把 NOTE 当未做并要求加测，本提交又禁止改那份 SSOT，所以 cite+retire 还不足以关闭该说明缺口。整体 FAIL。不授权编码。

Verdict: FAIL
