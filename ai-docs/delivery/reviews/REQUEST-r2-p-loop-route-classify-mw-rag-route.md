# REQUEST — R2 P-LOOP classify→bind→snapshot closed-loop → mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **closing P-LOOP ≠ claim R2 fully closed** until dual-review + harness agree

## 对照

- Inventory I4/I5：`bindApplicationRoute`（apply/invite + **start lazy re-bind**）→ `snapshotInterviewRoute`
- G-R2-1 / G-R2-3：生产闭环 wire **本刀关**（pending dual-review）；G-R2-4 / P-START 仍开
- Prove：`pnpm r2-p-loop-route-classify:prove` · `pnpm r2-classify-job-route-prereq:prove`
- 假绿表：规则-only 假 Worker / rag03 绿 / 读侧 snapshot ≠ R2 关

## 切片立场

审 **闭环诚实证据**是否够格关 P-LOOP；通过后仍 **不**宣称 R2 closed / 路由已生效。  
R2 overall 仍开：双审未齐 + **P-START**（未决拒启动）+ 禁假绿。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-loop-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍为 R4 阻塞之一；≠ R4 关） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |

## 请专家回答

1. classify→bind→snapshot 组合根是否已诚实可证（含 start lazy re-bind），且 **≠** 假 Worker / ≠ rag03 冒充生产？  
2. 即使 P-LOOP 关，是否仍保持 **R2 NOT closed**（P-START / dual-review / ≠ 路由已生效）？  
3. G-R2-4 / P-START 是否同意 **本刀不强制** fail-closed start（避免打爆 legacy）？  
4. 是否禁止把本绿写成 R4 / 题域已隔离 / HA / `releaseEvidence=true`？

## 非宣称

- 不宣称 R2 / R4 / 路由已生效 · 不宣称 wrong_track=0  
- 不 flip default · 不开 DELETE · Not HA · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
