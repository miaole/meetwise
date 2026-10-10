# RECHECK REQUEST — NHP Batch3 FAULT/BOUND 措辞修 → mw-e2e-ha

**状态**：**RECHECK / 待复审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:15 PT）  
**对照阻塞回执（配对域）**：`reviews/2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`（**changes_requested** · NHP-R4-FAULT-01 / 矩阵「无接线」陈旧钉）  
**配对**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md`  
**原 REQUEST**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-e2e-ha.md`（已同步 FAULT FLIPPED 读法）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **本刀零 prove** · **无 model-op** · **本刀不改 wire**

---

## 本域需知（措辞修 · 非 prove）

配对域 `mw-rag-route` 以 **changes_requested** 阻塞 Batch3 dual：FAULT/矩阵仍写「生产路径无接线」，与 post-REAL-WIRE-IMPL **CALL_SITES≥1 / g4 FLIPPED** 冲突。

实现方已在 Batch3 harness / slice / eval / 矩阵 / 原 REQUEST 更新诚实钉：

- **NHP-R4-FAULT-01**：CMD 仍 `pnpm g4-dispatch-recheck-prereq:prove`；EXIT=0 读法 = **FLIPPED（≥1 call site / wire present）** · **仍 ≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** · recheck seam honesty only  
- **已删**「生产路径无接线 / CALL_SITES=0」陈旧宣称  
- **NHP-R4-NEG-01** 保持 fail-closed honesty ≠ R4 closed  
- 仍钉：dual before prove · ≠covered · releaseEvidence=false · 无 model-op · 本刀不改 wire

| 文件 | 角色 |
|------|------|
| `harness/nhp-batch3-fault-bound.md` 等 | 见配对 RECHECK 表 |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | FAULT 行已 FLIPPED |
| rag changes_requested 回执 | `2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md` |

**未做**：prove · Worker 编辑 · commit · 读 `.env*`。

---

## 请专家确认

1. 是否知悉配对域阻塞为 **措辞/诚实钉**（非本批 case 选型本身），且本域可在配对域复审时继续盯 **≠ covered / 禁 prove / 不改 wire**？  
2. 是否仍同意：**双审通过前不得开跑本批 7× prove**？  
3. Batch3 7 IDs / 无 model-op / releaseEvidence=false 是否仍可接受？

---

## 非宣称

- 本 RECHECK **不是** pass · 不自批 · **未跑任何 prove**  
- **不**宣称 covered / HA / LOAD 绿 / R4 closed / wrong_track=0

---

*RECHECK REQUEST · mw-e2e-ha · NHP Batch3 FAULT wording · 2026-09-16 ~19:15 PT · releaseEvidence=false · 零 prove*
