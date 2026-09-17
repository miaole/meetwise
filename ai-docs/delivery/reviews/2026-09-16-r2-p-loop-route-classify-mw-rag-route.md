# Review — R2 P-LOOP classify→bind→snapshot（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-model-op 并行）  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限 P-LOOP：start lazy re-bind → snapshot；**≠ R2 关** · **≠ 路由已生效** · **≠ R4**）  
**releaseEvidence=false** · Not HA · **P-START 仍开** · **R2 NOT closed**

覆盖 REQUEST：`REQUEST-r2-p-loop-route-classify-mw-rag-route.md`

## 对照

- `startApplicationInterview`：lazy `bindApplicationRoute` **然后** `snapshotInterviewRoute`
- I2 Worker sole classify + I3 API wakeup；recruiter **不**内联 classify
- Status P12 / G-R2-1·3 CLOSED（pending dual-review）；G-R2-4 / P-START 仍开
- 主审：`2026-09-16-r2-p-loop-route-classify-mw-model-op.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 闭环组合根诚实可证（含 lazy re-bind），≠ 假 Worker / ≠ rag03 冒充？ | **是**。bind→snapshot 顺序钉死；Worker sole + MODEL-OP；规则唯一可 0 模型；无 Key fail-closed。 |
| 2 | P-LOOP 关后仍保持 R2 NOT closed？ | **同意**。P-START + dual-review 仍挡；≠ 路由已生效。 |
| 3 | G-R2-4 / P-START 本刀不强制 fail-closed start？ | **同意**。无 binding 仍 `no_binding` 优雅降级；强改会打爆 legacy。 |
| 4 | 禁写成 R4 / 题域已隔离 / HA / releaseEvidence=true？ | **同意并钉死**。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r2-p-loop-route-classify:prove` | **0** |
| `pnpm r2-p-api-route-classify:prove` | **0** |
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（P-LOOP closed；R2 NOT closed via P-START） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4 关） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |

## 非宣称

禁止：R2 关闭、路由已生效、R4/题域已隔离、wrong_track=0、假绿、cutover / HA / `releaseEvidence=true`。
