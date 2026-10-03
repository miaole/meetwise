# Docs-only · Line A' honest close · GAP-PRIV-AUTHZ-PROVE-FLAKE oneshot disagreement

主审：`mw-privacy-int`  
日期：2026-10-02（约 22:42 PT）  
审查 tip：`2ec9d41` / `2ec9d4106fa2b06017784cceea3359e37726f6d3`  
`2ec9d41` 是 `76d2bc3` / `76d2bc3fb5fb15b5a08aa5f769fc19cfa6a09a77` 与本收据所推分支尖端的祖先。  
前次 oneshot PASS（未改）：`7601503` / `76015037f54a185b2359d565f2151049f00936a1` — **alone ≠ dual**，不得当双审关闭。  
e2e FAIL：`3811cf1` / `3811cf1b47d3c3a939c2077b9c7386ab036069e6`（不代签）。  
**本审未重跑 `pnpm privacy-authorization:prove`，未新建/改写/tee 任何 log。**  
**PASS ≠ 关闭 flake ≠ 授权编码 ≠ HA。** alone ≠ dual。

---

## Diff

`2ec9d41` vs 父 `d7966bf`：`5 files changed, 55 insertions(+)`。仅 `ai-docs/`：

- `harness/gap-priv-authz-prove-flake-honesty.md`（+oneshot disagreement 节）
- `gap-priv-authz-prove-flake-honesty.slice.md`
- `gap-bug-backlog.md` / `e2e-requirement-coverage-matrix.md` / `execution-master-checklist.md`（additive）

`oneshot-attempt-1.json` / `.log` **未**出现在 diff（blob 与 `0da63bf` 相同：log `e8d0fbe4…` · json `8cc9db56…`）。无产品/`package.json`/`checkpoint-principal.ts`/UC-052 产品文件。无伪造或补丁 log 以插入 EXIT。

---

## C2 · log 有无进程 EXIT？

**无进程 EXIT 可引用行。**

- JSON：`"exit": 0`（仅 JSON 侧）
- log 末两行：`✓ PrivacyAuthorizationIssuer DB 证明通过（本地隔离证据）` · `LOCAL_ISOLATED_PROOF_RECEIPT … release_evidence=false`
- 对 log 全文检索：无 `EXIT=`、无 `exit code`、无 `ELIFECYCLE`、无 `PROCESS_EXIT`、无 shell `echo $?`

成功横幅 / 测试 PASS 行 ≠ 进程退出码。因此 JSON `"exit": 0` 与 log **不能同意**为可引用的 post-prove EXIT 对。文档称「log 无 EXIT」为真。

注：privacy-int 曾在 `5b6e693` 独立 spot-check 得 EXIT=0（收据 `7601503`）。**该 spot-check 不是 teed process log，不能修补其缺失的 log EXIT，也不能关闭 flake，也不能构成 dual。** 本 tip 文档未把该 spot-check 写成修补 log。

---

## 逐项 C1–C5

### C1 docs-only · 未伪造 log — **PASS**
见 Diff。`2ec9d41` 是 `76d2bc3` 与 origin tip 祖先。

### C2 json/log 不可同意 — **PASS**
见上。文档判断正确。

### C3 文档必含句 — **PASS**
| 要求 | 出处 |
|------|------|
| e2e FAIL `3811cf1` | harness L84；其收据末行 `Verdict: FAIL` |
| oneshot 不满足 dual post-prove | harness L86 / L100；slice L45 |
| privacy PASS `7601503` alone ≠ dual | harness L88；slice L47 |
| flake **OPEN** mitigated/cause-unknown | harness L92；slice L51 |
| Ban 重跑 prove 回填 EXIT | harness L90「re-run … attempt-2 is revoked」· L94「Do not run `pnpm privacy-authorization:prove`」 |
| Ban 伪造/手改 log | harness L90「does not forge `PROCESS_EXIT` onto the old log」·「does not modify … oneshot-attempt-1.log」 |
| 日后 teed first-run 需 **新 REQUEST**；本提交不授权 | harness L94；slice L53 |

### C4 pins / 红账 / 无 principal — **PASS**
红账 harness L17–19 仍在（cold#5 `:33047`、warm#2 23505、v1 `@71ec253`）。Pins：NOT_HA · releaseEvidence=false · coveredCount=8 · DELETE=503 · PG-retained。`retention_pending` 仍在 note harness。UC-052 **partial**。Ban `checkpoint-principal.ts`。无第二刀。

### C5 未用 spot-check 顶替 log EXIT — **PASS**
文档仅称 `7601503` alone ≠ dual；未声称 privacy spot-check 修补其 log。

---

## Pins（本审保留）

| Pin | 值 |
|-----|-----|
| tip | `2ec9d41` |
| haStatus | NOT_HA |
| releaseEvidence | false |
| public DELETE | 503 |
| Stack | PG-retained |
| retention | retention_pending |
| UC-052 | partial · ≠ covered |
| coveredCount | 8（RAG-FUNNEL-02A…08 only） |
| Flake | **OPEN** · mitigated/cause-unknown · **not fixed** |

---

## 总评

C1–C5 全部成立。oneshot JSON/log 因 **log 无进程 EXIT** 不能满足 dual post-prove；`7601503` alone ≠ dual；gap 仍 OPEN。  
**本审查未重跑 prove，不授权任何编码，不关闭 `GAP-PRIV-AUTHZ-PROVE-FLAKE`，不是 HA，不代签 e2e。PASS ≠ 关闭 flake ≠ 授权编码 ≠ HA。**

Verdict: PASS
