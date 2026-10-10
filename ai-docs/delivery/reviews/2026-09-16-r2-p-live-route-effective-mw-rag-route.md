# Review — R2 P-LIVE 路由已生效可测收据（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-model-op）  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限 **P-LIVE / G-R2-7 CLOSED pending dual-review**；**≠ R2 fully closed** · **≠ claim 路由已生效** · **≠ verbal 生效** · **≠ R4** · **≠ 自批 dual-passed**）  
**releaseEvidence=false** · Not HA · **prove 绿 ≠ R2 全关**

覆盖 REQUEST：`REQUEST-r2-p-live-route-effective-mw-rag-route.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | Inventory / 组合根是否完整覆盖 classify→bind→snapshot→refuse/allow？ | **是**。L-CLASSIFY（Worker sole + MODEL-OP + API wakeup）· L-BIND（apply/invite + start lazy re-bind）· L-SNAPSHOT · L-REFUSE（`interview_ineligible_route` 在 INSERT 前）· L-ALLOW（有 binding → started+snapshot）；api classify=0。 |
| 2 | Key-unset structural 是否够格作 harness「路由已生效收据」（无需 live Key），且未假绿？ | **够格（限 structural 收据）**。rules-unique ALLOW（modelCalls:0）+ 真拒启 REFUSE + model 路径 `known_not_sent`；prove 钉不要求 live Key。**≠** 口头生效；**≠** 已 claim 路由已生效。 |
| 3 | 即使 P-LIVE 钉齐，是否仍 **R2 NOT closed**？ | **是**。仍待本刀 dual 收据齐 + harness 同意关闸；status/GAP-RAG-02/m4/G4 P-R2 均钉 overall 开。 |
| 4 | 是否同意 **P-LIVE CLOSED pending dual-review**，禁 verbal 生效 / R4 关？ | **同意**。本文件为 rag 域收据；禁单域自批 dual-passed；禁 R4/题域/wrong_track=0。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r2-p-live-route-effective:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

## 仍开（挡 R2 overall）

- P-LIVE **dual-review**（至双审齐）+ **harness 同意**  
- **≠ 宣称路由已生效** / verbal 生效  
- R4 / 题域 / wrong_track=0 不在本刀

## 非宣称

禁止：R2 fully closed、路由已生效、verbal 生效、P-LIVE dual-passed（单域）、R4/题域已隔离、HA、`releaseEvidence=true`、假绿关 R2。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-r2-p-live-route-effective-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r2-p-live-route-effective-mw-rag-route.md`
- HEAD：`639134f`
