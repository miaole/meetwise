# REQUEST — R4 **wrong_track=0 ADV · LIVE_PG**（关 LIVE_PG_GAP · **不 coding / 不 prove**）→ mw-rag-route

**状态**：**`REQUEST-ready` / `not_run:pre_dual`**（REQUEST / 待审；实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT · ~19:22）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **ADV honesty ≠ LIVE_PG closed** · **unit+map ≠ full live Worker+PG** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 本 REQUEST 授权 Worker coding / prove 绿关  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-mw-e2e-ha.md`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/r4-wrong-track-adv-live-pg.md` | **本刀** acceptance · L1–L8 · companions · 冻结 CMD · 假绿禁 |
| `eval/r4-wrong-track-adv-live-pg.eval.md` | 评测勾选 |
| `r4-wrong-track-adv-live-pg.slice.md` | 切片索引 |
| `harness/r4-domain-isolation.md` §6g | 父轨 LIVE_PG 指针 |
| `harness/r4-domain-isolation-status.md` §11 | next=LIVE_PG await dual；LIVE_PG_GAP 仍开 |
| `harness/r4-wrong-track-adv.md` | 前序 ADV（`post_prove_dual_pass` · ADV honesty only；**≠** LIVE_PG） |
| `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-{rag-route,e2e-ha}.md` | ADV post-prove dual **pass（honesty only）** |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-ADV-01 **partial**/honesty-pin；LIVE_PG_GAP |
| `m4-rag-hard-gates.md` §R4 | wrong_track=0 关闭条件原文 |
| `apps/worker/src` | 本刀 **不改** |

---

## 切片立场（实现方自认）

ADV unit+map 刀已 `post_prove_dual_pass`（ADV honesty only）；**LIVE_PG_GAP 仍开**。meetwise 授权 **打开** LIVE_PG full-path ADV **文档+REQUEST** 刀。本刀定义将来对抗 prove：

1. 在 **live wired** retrieve（Worker + 真 PG · `retrieveViaDispatchTrackLocal`）上证 **跨域 wrong_track=0**。  
2. 对抗面（live）：cache poison、并发改岗、metadata 篡改、伪造/缺失 metadata、未知分类、旧 checkpoint → **零跨域出题**。  
3. **非** unit-only map / 非仅 Worker 静态映射；**非** rag04 seam 冒充。  
4. 保留 G-R2-5；`recheck_failed` fail-closed；禁 P-FAKEPLAN。  
5. NEG/FAULT companions **登记不升格 covered**；NHP-R4-ADV-01 仍 **partial**。  
6. **ADV honesty dual ≠ LIVE_PG closed ≠ R4 closed**；G7 draft ≠ success。  
7. 本刀 **零代码 · 零 prove**；CMD=`not_run:pre_dual`。  
8. **禁宣称 R4 closed**。

---

## 双审通过前请勿要求实现方开始 LIVE_PG coding / 绿关

| 项 | 本刀 |
|----|------|
| LIVE_PG prove | **not_run:pre_dual** |
| Worker 改动 | **零** |
| ADV unit+map | **已 dual-close（honesty）**；旁证 ≠ LIVE_PG |
| NHP-R4-ADV-01 | 仍 **partial**/honesty-pin |
| coding/prove | **forbidden** until dual pass + **separate authorize** |

---

## 请专家回答

1. harness L1–L8 是否诚实：live Worker+PG full-path ADV，且 **不能**被 ADV unit+map dual 宣称覆盖？  
2. 是否同意：**本刀无 coding / 无 prove**，仅 harness + eval + slice + REQUEST？  
3. 是否同意：NHP-R4-ADV-01 仍 **partial**；本刀 dual **不**自动升 covered？  
4. 是否同意：保留 G-R2-5 / recheck fail-closed / 禁 P-FAKEPLAN？  
5. 是否同意：**R4 仍 NOT closed**；禁宣称 R4 closed；将来 LIVE_PG prove 绿仍 ≠ R4 全家关？  
6. 是否同意：ADV `post_prove_dual_pass`（honesty）/ unit EXIT=0 **≠** LIVE_PG_GAP 已关？  
7. 是否同意：本刀 dual pass **本身不**授权 coding（须 separate authorize）？  
8. 是否同意：G7 verification gate draft **≠** 本刀成功？  
9. 是否同意：保持 `releaseEvidence=false`；禁 flip default / open DELETE / HA？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 LIVE_PG prove；**未**改 Worker  
- 不宣称 wrong_track=0 covered / R4 closed / 题域已隔离 / LIVE_PG_GAP 已关  
- 不宣称 ADV honesty dual 已覆盖 LIVE_PG  
- 不切 qbank / 向量真相 / flip default / open DELETE / HA / `releaseEvidence=true`  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-rag-route · R4 wrong_track ADV LIVE_PG · 2026-09-16 PT · releaseEvidence=false · ≠HA · ADV≠LIVE_PG · ≠R4 closed*
