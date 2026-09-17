# RECHECK REQUEST — NHP Batch3 FAULT/BOUND 措辞修 → mw-rag-route

**状态**：**RECHECK / 待复审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:15 PT）  
**对照阻塞回执**：`reviews/2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`（**changes_requested** · FAULT/矩阵「生产路径无接线」陈旧钉）  
**配对**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md`  
**原 REQUEST**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`（已同步 FLIPPED 读法）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** · **本刀零 prove** · **无 model-op** · **本刀不改 wire**

---

## 阻塞闭合（措辞 only）

对照 `2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`：

1. **已删**「生产路径无接线 / CALL_SITES=0 / REAL-WIRE §6c 仍不接线」类陈旧钉（post-REAL-WIRE-IMPL 世界）。  
2. **NHP-R4-FAULT-01** EXIT=0 诚实读法改为：

> **FLIPPED（≥1 call site / wire present）** · **still ≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** · **recheck seam honesty only**

3. CMD 仍可为 `pnpm g4-dispatch-recheck-prereq:prove`（语义 = FLIPPED 旁证，**≠** R4 关）。  
4. **NHP-R4-NEG-01**（`g-r2-5`）保持 fail-closed honesty **≠ R4 closed**（未改叙事）。  
5. 仍钉：**await dual before prove** · **≠ covered** · **releaseEvidence=false** · **无 model-op** · **本刀不改 wire code**。

| 文件 | 改动摘要 |
|------|----------|
| `harness/nhp-batch3-fault-bound.md` | FAULT 行 / §3 / 假绿表 / REQUEST 指针 → FLIPPED honesty |
| `nhp-batch3-fault-bound.slice.md` | FAULT 读法 + RECHECK 指针 |
| `eval/nhp-batch3-fault-bound.eval.md` | FAULT 行 / 审查清单 / RECHECK 指针 |
| `non-happy-path-perf-load-case-matrix.md` §1.5 `NHP-R4-FAULT-01` | 去「生产路径无」；FLIPPED CALL_SITES≥1 · gap/honesty |
| 原 REQUEST rag + e2e-ha | FAULT EXIT 读法同步 |

**未做**：prove · Worker 编辑 · commit · 读 `.env*` · 改 R4 wire。

---

## 请专家确认

1. 措辞阻塞是否已闭合（可从 **changes_requested** → 短确认再谈 dual）？  
2. FAULT EXIT=0 是否接受为 **FLIPPED（≥1 call site）· 仍 ≠ R4 closed / ≠ wrong_track=0 / ≠ ADV covered · seam honesty only**？  
3. 是否仍同意：**双审前禁 prove**；本刀 **不改 wire**；**无 model-op**；`releaseEvidence=false`？  
4. NHP-R4-NEG-01（g-r2-5）fail-closed honesty ≠ R4 closed 是否仍可接受？

---

## 非宣称

- 本 RECHECK **不是** pass · 不自批 · **未跑任何 prove**  
- **不**宣称 R4 closed / wrong_track=0 / ADV covered / covered / HA / `releaseEvidence=true` / 路由已生效  
- FLIPPED CALL_SITES≥1 **≠** R4 关

---

*RECHECK REQUEST · mw-rag-route · NHP Batch3 FAULT wording · 2026-09-16 ~19:15 PT · releaseEvidence=false · 零 prove*
