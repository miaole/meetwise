# RE-PRE-EXEC · NOTE-CKPT-UNSEALED-CLAIM-NEG（Line F · docs-only）

主审：`mw-privacy-int`  
日期：2026-10-02（约 21:14 PT）  
REQUEST：`a24382b` / `a24382b6ae10464e2b7abcc957bec43ef2868061`  
在 origin 上：是  
上一轮 FAIL：`67dd378` / `67dd378b1738e21d88465882ef18da6ab28949e9`  
更正：`e1c1040` 把 `gap-bug-backlog.md` L64 写成仍是「缺显式负例」。该句在钉提交 `119d6c0` 已改为 CLOSED。本文件按 `119d6c0` 之后的树改写 R4，不改旧收据 `67dd378`。  
本审不重跑证明，不授权产品代码。

---

## 1. diff

`a24382b^..a24382b` 仅 2 个文档，+51/−72。无产品代码、测试、migration、GRANT、路由、`package.json`、`checkpoint-principal.ts`：

- `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md`
- `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`

证明 blob 在 `a24382b` 与其后 origin 上相同（`2e3ca52e`）。

---

## 2. 引用对照

| 文档范围 | 实际首行 | 是否该案 |
|----------|----------|----------|
| 763–766 EPOCH | L763 `const id = 'NHP-CKPT-UNSEALED-NEG-EPOCH'` | 是 |
| 768–771 DIGEST | L768 `const id = 'NHP-CKPT-UNSEALED-NEG-DIGEST'` | 是 |
| 773–776 BOTH | L773 `const id = 'NHP-CKPT-UNSEALED-NEG-BOTH'` | 是 |
| 780–804 正控 | L780 `const id = 'HP-CKPT-SEALED-CLAIM'`；L804 为 lease 断言；L807 才是下一案 | 是 |
| 750–758 | L750 `sqlState === '42501'` | 是 |

0091 L369–373 对 NULL epoch / NULL digest 仍 `RAISE` 且 `ERRCODE='42501'`。`claimAuthorizationTarget` L124–128 只调用该 SQL 函数。文档没有另写一个 SQLSTATE。

---

## 3. R1–R5

### R1 docs-only — **PASS**
只有 harness 与 slice。

### R2 行号对准 — **PASS**
上表五行都落在对应 case 或 `42501` 断言上。

### R3 退役实现刀、禁止第二刀、禁止改 principal — **PASS**
两文都写 implementation knife retired，禁止第二次实现与第二次 prove，并要求保持 `apps/worker/src/checkpoint-principal.ts` 不变。状态是 `draft:awaiting_re_pre_exec`，不是再排编码。

### R4 SSOT / harness 不再把 NOTE 标成 open — **FAIL**
钉 `119d6c0` 已把矩阵、`gap-bug-backlog.md` L64、execution checklist 写成 CLOSED，并禁止把 `a1a06ab` 当第二实现。Line F 的 harness/slice 也退役实现刀。  
但同一棵树上仍有两份旧 harness 把该 NOTE 当未做：

- `ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md` L172：`Open follow-ups` 仍列出 `NOTE-CKPT-UNSEALED-CLAIM-NEG`（旁边的 pool 缺口也已被钉，这格是过期清单）。
- `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md` L21：仍写该负例 “unproven in checkpoint prove”。

Line F 文本禁止改矩阵和 backlog，却没有撤掉这两处 open/unproven。因此退役陈述不是唯一仍生效的说法。R4 不通过。这不是「backlog 仍要求加测」——那句已过时。

### R5 pins — **PASS**
harness 与 slice 都有 `NOT_HA`、`releaseEvidence=false`、PG-retained、外部 `retention_pending`（写明不是完成证据）、公开 DELETE 503。没有把 flake 写成已修好，也没有授权新代码。退役的是实现刀，文内 `no nail`，不把 checkpoint 物理清除整单说成已完成。

---

## 4. 总评

R1–R3、R5 通过。R4 失败：引用行号正确，矩阵和 backlog 已标 CLOSED，但 checkpoint-physical harness L172 与 pool-role-leak harness L21 仍把 NOTE 写成 open 或 unproven。整体 FAIL。不授权编码。

Verdict: FAIL
