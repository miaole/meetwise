# REQUEST — R4 **wrong_track=0 ADV**（对抗跨域验收门 · **不 coding / 不 prove**）→ mw-rag-route

**状态**：**`REQUEST-ready` / `not_run:pre_dual`**（REQUEST / 待审；实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT · ~19:08）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **wire 绿 ≠ wrong_track=0** · **≠ full P-WIRE 已关** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 本 REQUEST 授权 Worker coding / prove 绿关  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/r4-wrong-track-adv.md` | **本刀** acceptance · A1–A8 · companions · 冻结 CMD · 假绿禁 |
| `eval/r4-wrong-track-adv.eval.md` | 评测勾选 |
| `r4-wrong-track-adv.slice.md` | 切片索引 |
| `harness/r4-domain-isolation.md` §6f | 父轨 ADV 指针 |
| `harness/r4-domain-isolation-status.md` | next=ADV await dual；REAL-WIRE-IMPL await post-prove |
| `harness/r4-real-wire-impl.md` | 前序 wire（CALL_SITES≥1；**≠** ADV） |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-ADV-01 **gap**/blocked |
| `m4-rag-hard-gates.md` §R4 | wrong_track=0 关闭条件原文 |
| `apps/worker/src` | 本刀 **不改**；retrieve 已接线属 REAL-WIRE-IMPL |

---

## 切片立场（实现方自认）

REAL-WIRE-IMPL 已实现并 await post-prove dual（CALL_SITES≥1）。meetwise 授权 **打开** ADV wrong_track=0 **文档+REQUEST** 刀。本刀定义将来对抗 prove：

1. 在 **wired** retrieve（planner→validate→assemble→dispatch→recheck）上证 **跨域 wrong_track=0**。  
2. 对抗面：伪造/缺失 metadata、未知分类、并发改岗、旧 checkpoint、cache 回放 → **零跨域出题**。  
3. 保留 G-R2-5；`recheck_failed` fail-closed；禁 P-FAKEPLAN。  
4. NEG/FAULT companions **登记不升格 covered**。  
5. **wire 绿 ≠ wrong_track=0 ≠ R4 closed**；G7 draft ≠ success。  
6. 本刀 **零代码 · 零 prove**；CMD=`not_run:pre_dual`。

---

## 双审通过前请勿要求实现方开始 ADV coding / 绿关

| 项 | 本刀 |
|----|------|
| ADV prove | **not_run:pre_dual** |
| Worker 改动 | **零** |
| REAL-WIRE-IMPL | **仍 await post-prove**（旁证 ≠ ADV） |
| NHP-R4-ADV-01 | **仍 gap/blocked** |
| coding/prove | **forbidden** until dual pass + wire post-prove + **separate authorize** |

---

## 请专家回答

1. harness A1–A8 是否诚实：wired retrieve 上对抗 wrong_track=0，且 **不能**被 wire 绿宣称覆盖？  
2. 是否同意：**本刀无 coding / 无 prove**，仅 harness + eval + slice + REQUEST？  
3. 是否同意：NEG/FAULT companions 仅登记、**不**升 covered？  
4. 是否同意：保留 G-R2-5 / recheck fail-closed / 禁 P-FAKEPLAN？  
5. 是否同意：**R4 仍 NOT closed**；将来 ADV prove 绿仍 ≠ R4 全家关（P-R1/P-R2/P-META 并列）？  
6. 是否同意：REAL-WIRE-IMPL EXIT=0 / CALL_SITES≥1 **≠** wrong_track=0？  
7. 是否同意：本刀 dual pass **本身不**授权 coding（须 wire post-prove + separate authorize）？  
8. 是否同意：G7 verification gate draft **≠** 本刀成功？  
9. 是否同意：保持 `releaseEvidence=false`；禁 flip default / open DELETE / HA？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 ADV prove；**未**改 Worker  
- 不宣称 wrong_track=0 / NHP-R4-ADV-01 covered / R4 closed / 题域已隔离  
- 不宣称 wire 绿已覆盖 ADV  
- 不切 qbank / 向量真相 / flip default / open DELETE / HA / `releaseEvidence=true`  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-rag-route · R4 wrong_track=0 ADV · 2026-09-16 PT · releaseEvidence=false · ≠HA · wire≠ADV*
