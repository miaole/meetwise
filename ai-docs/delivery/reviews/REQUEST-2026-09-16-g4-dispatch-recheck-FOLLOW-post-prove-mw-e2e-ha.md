# REQUEST — G4/R4 dispatch-recheck FOLLOW **post-prove** → mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT · ~04:47 post-prove）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **本静态钉 ≠ 完整 E2E**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑  
**配对**：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md`  
**前序 pre-exec dual（已 pass · ≠ R4 关）**：`2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` · `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`

---

## 对照

- `harness/r4-domain-isolation.md` §6b · `r4-domain-isolation-status.md` §6/§6.1 · `eval/r4-domain-isolation.eval.md` §6.3  
- `.tmp/r4-follow-post-prove-20260916/`（CMD log + EXIT）  
- `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R4-* · 零 covered）  
- GAP-RAG-04 · m4 §R4 · sole allowlist（恰 5；未扩）

---

## 切片立场

实现方 **未**接线生产 dispatch/recheck/planner。  
pre-exec dual 后跑 honesty subset；**EXIT=0 ≠** 完整 E2E / covered / HA / R4 关 / 题域已隔离 / wrong_track=0 / full wire。  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · HEAD `639134f` · ~04:46–04:47 PT）

| CMD | EXIT |
|-----|------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

读法钉：EXIT=0 = honesty 钉 only；**≠** dispatch 已齐 · **≠** 题域已隔离 · **≠** covered · **≠** HA。

---

## 请专家回答

1. 本 post-prove 是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关？  
2. EXIT=0 是否在 harness/status/eval 明确标红为 **≠ 题域已隔离 / ≠ dispatch 已齐 / ≠ wrong_track=0**？  
3. sole allowlist 是否因本切片扩面？（期望：**否**）  
4. 硬闸「已生效」是否被误写成「非happy prove 已授权笼统开跑」？（期望：**否**）  
5. NHP-R4 六列是否仍均为 case-only/partial/gap/blind，**零 covered**？  
6. pre-exec dual-pass + 本绿是否 **不得**自动批准 R4 关闭或 FOLLOW 关闸完成？

（或：专家可自行复跑同子集并附 CMD+EXIT。）

---

## 非宣称

- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default  
- 不宣称生产 dispatch/recheck 已接线 / R4 closed / 题域已隔离 / wrong_track=0  
- **await post-prove dual**（或专家复跑收据）

---

*REQUEST · mw-e2e-ha · R4 FOLLOW post-prove · 2026-09-16 PT · releaseEvidence=false · ≠HA*
