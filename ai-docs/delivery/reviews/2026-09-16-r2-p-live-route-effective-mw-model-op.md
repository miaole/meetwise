# 独立审 — R2 P-LIVE 路由已生效结构收据 · mw-model-op

**日期**：2026-09-16（PT）  
**结论**：**pass**（**P-LIVE CLOSED pending dual-review only**；**R2 仍 NOT closed**；**≠ verbal / 口头路由已生效**；**≠ R4**；**≠ 自批 dual-passed**）  
**releaseEvidence=false** · Not HA · **prove 绿 ≠ R2 全关 ≠ claim route-effective**

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm r2-p-live-route-effective:prove` | **0**（classify→bind→snapshot→refuse/allow；Key-unset structural） |
| `pnpm r2-p-fake-route-classify:prove` | **0** |
| `pnpm r2-p-start-route-classify:prove` | **0** |
| `pnpm job-route-classify-binding:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |

## 交付物核对（L-*）
| 面 | 结果 |
|----|------|
| L-CLASSIFY | Worker sole + `createJobRouteModelClassify`；API wakeup only |
| L-BIND / L-SNAPSHOT | lazy re-bind → snapshot（ALLOW） |
| L-REFUSE | `interview_ineligible_route` **在 INSERT interview 之前** |
| L-ALLOW | binding 在 → snapshot → started |
| Key-unset | model → `known_not_sent`；rules-unique → `route_decided` `modelCalls:0`；**未**假称 live Key |

## 专家问答（REQUEST）
1. **Key-unset fail-closed 持有；未假称 live Key？** **是**（prove 明确「不要求 live Key」）。  
2. **rules-unique ALLOW + REFUSE 构成可复跑收据？** **是**（CMD+EXIT 结构面齐全）。  
3. **P-LIVE CLOSED pending dual only；禁 R2/verbal 生效？** **同意**。禁止 HA / releaseEvidence=true / 自批 dual-passed。  
4. **仍需 mw-rag-route？** **是** — G-R2-7 harness 关闸 + R2 overall 仍开。

## 假绿 / 假关驳回
| 若宣称… | 裁定 |
|---------|------|
| 路由已生效 / verbal 生效 | **假绿** — dual + harness 未齐 |
| R2 / R4 关 | **假关** |
| live Key / live model invoke 已绿 | **假绿** — Key-unset structural only |
| P-LIVE dual-passed（本审单域） | **假绿** — 须 rag 第二域 |

## 仍开（挡 R2）
- P-LIVE **dual-review 收据**（mw-rag-route）  
- harness 同意关闸  
- ≠ 口头「路由已生效」

## 对照
- REQUEST：`reviews/REQUEST-r2-p-live-route-effective-mw-model-op.md`
- harness：`harness/r2-classify-job-route.md` · **G-R2-7** · status · eval
