# 独立审 — R2 P-START 真拒启接线 · mw-model-op

**日期**：2026-09-16（PT）  
**结论**：**pass**（**P-START CLOSED pending dual-review only**；**R2 仍 NOT closed**；**≠ 路由已生效**；**≠ R4**；**≠ 自批 dual-passed**）  
**releaseEvidence=false** · Not HA · **prove 绿 ≠ R2 全关**  
**取代**：同日 honesty PREREQ 回执（本文件原 honesty 结论）— **已被本刀真拒启 supersede**

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm r2-p-start-route-classify:prove` | **0**（`interview_ineligible_route`；拒启在 INSERT 前；API HttpException） |
| `pnpm r2-p-loop-route-classify:prove` | **0**（lazy re-bind 与拒启共存） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm job-route-classify-binding:prove` | **0**（Key-unset fail-closed） |

## 交付物核对
| 项 | 结果 |
|----|------|
| `no_binding` → `interview_ineligible_route` | **是**（`StartApplicationResult` 含该码） |
| 拒启在 INSERT interview **之前** | **是**（bind 查 binding → return；其后才 INSERT） |
| 可测等价 `unresolved_route_start_count=0` | **是**（未决不返回 started / 不建 interview） |
| API 映射 | `applications.service` → `HttpException` / 同码 |
| 无内联 classify | recruiter 零 `classifyJobRoute`；API classify=0 |

## 专家问答（REQUEST）
1. **真拒启诚实？** **是** — fail-closed；INSERT 前拒。  
2. **不内联 classify；MODEL-OP fail-closed？** **是**。  
3. **P-START CLOSED pending dual only；禁 R2 关？** **同意**。禁止 HA / releaseEvidence=true / 自批 dual-passed / 路由已生效。  
4. **仍需 mw-rag-route？** **是** — G-R2-4 / 计数等价 + **P-FAKE** / R2 overall 余项。

## 假绿 / 假关驳回
| 若宣称… | 裁定 |
|---------|------|
| R2 closed / 路由已生效 | **假关** — P-FAKE + dual 收据未齐 |
| P-START dual-passed（本审单域） | **假绿** — 须 rag 第二域 |
| honesty PREREQ 仍挡 P-START | **过时** — 已被真拒启取代 |

## 仍开（挡 R2）
- P-START **dual-review 收据**（mw-rag-route）  
- **P-FAKE** 禁 + harness 同意  
- ≠ 宣称路由已生效

## 对照
- REQUEST：`reviews/REQUEST-r2-p-start-route-classify-mw-model-op.md`（真拒启版）
- harness：`harness/r2-classify-job-route.md` · status · eval
