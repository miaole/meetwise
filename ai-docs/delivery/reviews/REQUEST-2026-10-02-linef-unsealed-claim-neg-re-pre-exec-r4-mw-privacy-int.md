# RE-PRE-EXEC r4 · NOTE-CKPT-UNSEALED-CLAIM-NEG（Line F · docs-only）

主审：`mw-privacy-int`  
日期：2026-10-02（约 21:35 PT）  
对齐提交：`2a66c22` / `2a66c2283cb95b9154bc028d7c9ae650adc44a89`  
父提交：`310917a` / `310917a1339124796d9b6a4b21ff709356260105`  
`2a66c22` 是本收据所推分支尖端的祖先。REQUEST 仍是 `a24382b`，本审不要求改它。  
上一轮 FAIL：`269bcad` / `269bcad0ef107733e28bd603f2d1e875f9becfa3`（针对 `542c064`）。  
另读 `b52cd32`（`mw-e2e-ha`，不是本身份的收据）只为核对它点过的行号错误。  
本审不重跑证明，不授权编码。未改旧收据。

---

## 父 diff

`2a66c22` 相对父提交：2 files changed, 5 insertions(+), 7 deletions(-)。仅：

- `ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md`
- `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md`

无产品代码、测试、migration、GRANT、路由、`package.json`、`checkpoint-principal.ts`。

---

## 逐项

### A docs-only — **PASS**
见上。

### B 证明 SHA — **FAIL**
POOL 行已改对。`uc-e2e-052-pool-role-leak.md` L20 与 `uc-e2e-052-checkpoint-physical.md` L172 的 POOL 分句写：

`pnpm uc052:pool-role-leak:prove EXIT=0 at prove/code SHA ab96a02 (ab96a0299d8836a635077f8bf9b61a7891aa583f); nail 119d6c0 is the docs-only nail. 9b39a20 is range-diff-equal to ab96a02 but is not on origin.`

核对：`ab96a02` 在 origin 上；`9b39a20` 不是 origin 祖先；`119d6c0` 只是文档钉。这两处没有再把 EXIT=0 挂到 `119d6c0`。

NOTE 行没有改对。同文件 L21 仍是：

`NOTE-CKPT-UNSEALED-CLAIM-NEG | CLOSED by nail 119d6c0: … L763 / L768 / L773 / L778–L804 / L750 / 0091 L369–373`

这里没有把 `119d6c0` 写成 docs-only nail，也没有把证明/代码 SHA 写成 `ab96a02`。checkpoint L172 的 NOTE 分句只说 “CLOSED by the existing cites”，与 L21 的 “by nail 119d6c0” 不一致。

### C 负例缺失句 — **PASS**
全文件已无 `no claim-before-seal NEG`，也无 unproven / “负例不存在”。L35 现为：`C-DIGEST-JWS asserts pre-seal NULL`。

### D principal 允许清单与泄漏描述 — **FAIL**
显式两行已删：不再单列 `apps/worker/src/checkpoint-principal.ts`，也不再单列 `uc052-checkpoint-physical.proof.ts（UNSEALED NEG only）`。Line F harness L27 与 slice L23 仍禁止改 `checkpoint-principal.ts`，并禁止第二实现。本提交没有改那两个文件。

仍失败，两处：

1. L32 仍写 `checkpoint-principal.ts` **L51–54** 是已缓解路径（`SET ROLE NONE` + 清三个 GUC + reset 抛错则销毁）。在 `ab96a02` 上 L51–L54 是测试 override 的 `E2E_ISOLATED` 检查，不是释放清理。释放清理在 L79 `SET ROLE NONE`、L80–L82 清空 `app.principal_user` / `app.checkpoint_thread_id` / `app.checkpoint_epoch`、L101–L103 `originalRelease(resetErr | true)`。机制句子对，行号指向错的代码。这与 `b52cd32` 已经指出的错行相同，只是旁注换成了正确机制。
2. §4 L69 仍允许 `packages/db/test/*`。该通配仍覆盖 `uc052-checkpoint-physical.proof.ts`，等于负例证明文件仍在编码允许清单里。同节标题仍是 “coding phase · after dual+authorize”，并仍允许 `package.json` 与新的 pool-leak prove。

### E flake 仍是唯一 OPEN — **PASS**
checkpoint L172：`GAP-PRIV-AUTHZ-PROVE-FLAKE only — OPEN, mitigated/cause-unknown (not fixed)`。  
pool L22：`OPEN, mitigated/cause-unknown (not fixed)`。没有写成 fixed。

### F 无回退 — **PASS**
证明行号仍对准（blob 未改）：L763 `NHP-CKPT-UNSEALED-NEG-EPOCH`，L768 DIGEST，L773 BOTH，L778/L780–L804 `HP-CKPT-SEALED-CLAIM`，L750 `sqlState === '42501'`，0091 L369–373 为 `42501`。`claimAuthorizationTarget` L124–L128 只调用 `privacy_authorization_claim_target`。  
coveredCount=8 仍是 `RAG-FUNNEL-02A/02B/03/04/05/06/07/08`。UC-052 不在这八项里。pool L20 写 UC-052 remains partial；矩阵仍是 partial 且 ≠ covered。  
pins 仍在：NOT_HA、releaseEvidence=false、PG-retained、公开 DELETE=503、Line F harness/slice 的 `retention_pending`。没有把隐私缺口标成 covered。

### G SSOT — **FAIL**
矩阵、backlog、checklist、Line F harness/slice、checkpoint L172 的 POOL 分句，与 pool L20，在 “EXIT=0 的 SHA 是 `ab96a02`、`119d6c0` 只是文档钉、`9b39a20` 不在 origin” 上一致。  
pool L21 把 NOTE 的关闭归于 nail `119d6c0`，与上述 “docs-only nail” 以及 checkpoint “by the existing cites” 矛盾。L32 的 L51–L54 与 `ab96a02` 源码矛盾。§4 通配与 “禁止改负例证明 / 禁止第二实现” 矛盾。

---

## 总评

A、C、E、F 通过。B、D、G 失败。整体 FAIL。本审查不授权任何编码。

Verdict: FAIL
