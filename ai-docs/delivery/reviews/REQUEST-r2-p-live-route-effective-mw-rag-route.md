# REQUEST — R2 P-LIVE 路由已生效收据（closed-loop refuse/allow）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ verbal 生效** · **≠ claim 路由已生效** until dual-review + harness agree · **≠ R4 / 题域已隔离**

## 对照

- Harness：`harness/r2-classify-job-route.md` §0 · Inventory I1–I6 · **G-R2-7 P-LIVE**
- Status：`harness/r2-classify-job-route-status.md` — **P-LIVE CLOSED pending dual-review**；**R2 NOT closed**
- Measurable loop：classify（Worker sole + API wakeup）→ bind → snapshot → **REFUSE** / **ALLOW**
- Key-unset structural：rules-unique ALLOW；拒启 REFUSE；model path known_not_sent（无 live Key）
- Prove：`pnpm r2-p-live-route-effective:prove`
- GAP-RAG-02 · `m4-rag-hard-gates.md` §R2 · G4 P-R2
- 前序 dual-passed：P-MODEL…P-FAKE；G-R2-5 retrieve-side CLOSED

## 切片立场

本刀关闭 **G-R2-7 / P-LIVE**（live 路由已生效可测收据）为 **CLOSED pending dual-review**：  
- 可复跑 CMD+EXIT 钉 classify→bind→snapshot→refuse/allow（Key-unset structural）  
- **即使** P-LIVE prove=0，**R2 overall 仍开**：本刀双审收据 + harness 同意关闸  
- **禁止**口头「生效」；**禁止**把本绿写成 R2 closed / 路由已生效 / R4 / HA

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-live-route-effective:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0**（≠ 题域已隔离） |
| `pnpm mysql-stack:m4-rag:prove` | **0**（§R2 文档门） |

## 请专家回答

1. Inventory / 组合根（Worker sole classify · API wakeup · start lazy re-bind · 真拒启 · snapshot allow）是否完整覆盖 classify→bind→snapshot→refuse/allow？  
2. Key-unset structural 是否够格作为 harness「路由已生效收据」（无需 live Key），且未假绿？  
3. 即使 P-LIVE 钉齐，是否仍保持 **R2 NOT closed**（本刀 dual-review + harness 同意）？  
4. 是否同意 **P-LIVE CLOSED pending dual-review**（非自批 dual-passed），且禁止写成 verbal 生效 / R4 关？

## 非宣称

- 不宣称 R2 fully closed · 不宣称 路由已生效 · 不宣称 P-LIVE dual-passed  
- 不宣称 R4 / 题域已隔离 / wrong_track=0 · Not HA · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
