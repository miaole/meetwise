# REQUEST — 北星硬闸 **G7** Local Full-Suite Verification Gate（文档闸预激活）→ mw-e2e-ha

**状态**：**draft / await dual · 未生效**（REQUEST / 待审；实现方预写；**禁止自批 pass**；**≠ G7 已生效**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ 0 BUG 已证** · **≠ controlPlaneClosed** · **零 prove / 零 suite run**  
**硬闸**：G1–G6 **已生效**；**G7 = 草案**（镜像 H1：草案 → dual → authorize effective）  
**配对**：`REQUEST-2026-09-16-north-star-g7-local-full-suite-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `ai-docs/delivery/north-star-hard-gates.md` **G7** | 正文草案 SSOT（七条） |
| `ai-docs/delivery/harness/local-full-suite-verification.md` | stub · `not_run`；禁本刀绿关 |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` §1.0 / 文首 | G7 指针 |
| `ai-docs/delivery/north-star-ha.md` | 七条指针；无 G7 收据 forbid HA/0 BUG |
| `ai-docs/delivery/execution-master-checklist.md` §1.4 | G7 行（草案） |
| `ai-docs/delivery/harness/e2e-full-suite.inventory.md` | 全量家族命令构成（**非本刀执行**） |

---

## 切片立场

本刀 **仅**把 G7 写入交付 SSOT + 轻指针 + stub + 本双 REQUEST（**文档闸预激活审**）。  
**未**跑全量本地套件 / live E2E / 压测作绿关。  
**未**宣称 G7 已生效。实现方 **不得**自批。  
并行 R4 REAL-WIRE-IMPL **不阻断 / 不回滚**。

不得冒充：

- G7 已生效 / 验证关已落地  
- 全量 E2E 零遗漏已达成 / covered / HA / `releaseEvidence=true` / 0 BUG 已证  
- 刀绿 / dual pass / prove EXIT=0 = 交付成功  

---

## 请专家回答（文档审 · **零 prove**）

1. **G7 正文是否足够作 SSOT？**（硬句「验证关是成功唯一标准」；成功 ≠ 刀绿/dual/prove；须全栈 + 全 cases/UCs + CMD+EXIT/CI 套件）  
2. **是否同意：双域通过前 G7 不得改钉生效？**（草案 → dual → authorize；落库 ≠ 生效）  
3. **是否同意：prove / dual / 刀绿 ≠ 成功，直至 G7？**  
4. **是否同意：`releaseEvidence=false` 直至 G7 全量套件收据齐？**（并 forbid 无收据宣称 生产100%HA / 0 BUG / controlPlaneClosed）  
5. 文首 / §0 / checklist / 矩阵指针是否诚实标 **G7=草案 · 未生效**？  
6. stub 是否正确钉 `not_run` 且禁本刀当绿关？  
7. 是否错误阻断并行 R4 REAL-WIRE-IMPL？（期望：**否**）  
8. 阻塞项（若有）是什么？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；**不是** G7 生效授权。  
- 不宣称 covered / HA / `releaseEvidence=true` / 0 BUG / controlPlaneClosed / 全量套件已跑。  
- **await dual**；G7 生效须 dual pass + **separate authorize 改钉**。  
- **零 suite run** 本刀。

---

*REQUEST · mw-e2e-ha · G7 draft · 2026-09-16 PT · releaseEvidence=false · ≠HA · G7 not yet effective*
