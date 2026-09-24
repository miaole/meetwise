# E2E 抬到 covered 路径 backlog（北星 · 非完成清单）

**日期**：2026-09-10（PT）  
**硬令**：partial / gap / honesty-pin **≠ done**；全量 E2E 零遗漏；生产 100% HA；0 BUG。  
**releaseEvidence=false** 直至多实例 + 故障注入 prove EXIT + CI 收据。  
**sole-stack** MySQL+Qdrant+Redis 未迁完 → **禁止宣称 HA**。R5/pgvector → **green-risk** 必标。

## 矩阵计数（扫表快照）
| 桶 | 约数 | 说明 |
|----|------|------|
| UC 行 | ~22 | 含合并行 012/024 等 |
| partial | ~17 | 有 prove ≠ covered |
| gap（偏空） | 004（honest pin 已挂）/ 025（honest pin 已挂）/ 028（honest pin 已挂）/ 027 /（040–043 批缺口 honest pin 已挂于 partial 行、031–032 honesty pin 已挂 gap(e2e)/partial(eval)） | |
| blocked | 001-live(无 Key) / 015(无 Key 面) / 027 产品未接 / 050–052 DELETE 冻结 | |

## 下一刀顺序
1. UC-025 押题过期（honest gap prove 已挂）
2. UC-004 career-path（honest gap prove 已挂；抬 covered 见下）
3. UC-028 trace/账本失败不阻塞（honest gap prove 已挂；抬 covered 见下）
4. UC-040–043 批任务/题库/席位 CAS（honest gap prove 已挂；抬 covered 见下）
5. UC-027 人工复核 — 钉 blocked + 抬 covered 前置
6. UC-031/032 — honesty pin 已挂（gap(e2e)/partial(eval)）；抬 covered = **ai-eval suite + gates**（禁 e2e 假模型）

## partial → covered 还缺（摘录）
| UC | 抬 covered 还缺 |
|----|----------------|
| 001 | MODEL_API_KEY 后 live full.e2e；A5 成长档案；sole-stack 夹具 |
| 004 | e2e HTTP 主路径（POST/GET+A1/A2）；AiGraphRun career-path 或 ADR 降级；GrowthTimeline/档案关联；A3 失败降级+额度；不确定性闸；UI 触发；sole-stack 去 R5 |
| 028 | persistTrace 旁路 best-effort（与 settle 分事务）；故障注入→面试 completed+额度 confirmed；missing-trace 重写/对账补写；A3 真相失败阻塞对照 E2E；禁 report-bulkhead 冒充；sole-stack 去 R5 |
| 040–043 | D4 载重 BatchJob/QuestionBankItem/SeatLedger；BatchJob partial_failed HTTP/saga；题库文件导入 partial_failed；双签 CAS；席位 used<total CAS+耗尽/回补；独立 e2e（禁 full.e2e 绑定冒充）；sole-stack 去 R5 |
| 002 | HTTP dual GET+LED prove 已挂（`uc002:http:prove`）；仍缺 **HTTP lease mouth** + snapshot 专用口 + full.e2e 双设备 + Playwright 双 context + sole-stack（harness §1b） |
| 003 | 错误码 en 映射产品接线；热库去硬编码 zh；Playwright locale=en DOM |
| 010 | HTTP R-mid live-tail→LED 已挂（`uc010:sse-resume:prove`）；仍缺 full.e2e mid-interview 断线；A3；UI 重连；0058 去 stub；跨副本槽（harness §1b） |
| 011 | HTTP 额度断言已挂（`uc011:report-refund:http:prove` H1–H5 / `GET /commerce/entitlement`）；H5 钉 refund-callback **产品缺失**+§1b#1 抬 covered 前置；仍缺 refund-callback 产品口；balance-ui；fail HTTP mouth；full.e2e；wallet 契约（harness §1b） |
| 018 | HTTP + **full.e2e abandon** + **graph** + **ttl** + **UI abandon** + **sole PG-retained** prove 已挂（FULL-E2E+GRAPH+TTL+UI+`GAP-UC018-SOLE` CLOSED under PG-retained · `pnpm uc018:sole:prove` · tip **`aa968b1`**）；仍 **partial≠covered** · **#6 alone ≠ covered** · Ban claim UC covered（waiting_user+#1+#2+#3+#5+#6 已关；harness §1b）· covered-lift assessed `harness/uc-e2e-018-covered-lift.md` · tip **`abfbbc0`** · `post_prove_dual_pass` · `GAP-UC018-COVERED-LIFT` CLOSED as honest non-flip assessment only · **≠ UC covered** · `pnpm uc018:covered-lift:prove` · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV was **blind** · Ban假关 · Ban invent covered · Ban wash SOLE alone into covered · **ADV nailed** `harness/uc-e2e-018-adv.md` · tip **`27dd6ae`** · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · §1.0 ADV **partial** · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed · **covered-lift-reassess nailed** `harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` CLOSED as honest non-flip assessment only · `post_prove_dual_pass` · prove tip `5cddb53` · post-prove dual `14a1859`/`7f57243` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban wash ADV alone into covered · Ban假关 · **Ban skip to UC-011** while UC-018 still partial≠covered  · **PERF/LOAD REQUEST OPEN** `harness/uc-e2e-018-perf-load.md` · `GAP-UC018-PERF-LOAD` · **NHP-018-PERF-01**+**NHP-018-LOAD-01** **case-only** · `draft:awaiting_pre_exec_dual` · Ban elevate to **partial** this open · PERF/LOAD alone ≠ covered · Ban claim production capacity / HA · **Ban skip to UC-011** while PERF/LOAD residual open · parent tip `24d350f` docs-only · nail `0b7a218` |
| 019 | HTTP regenerate；regenerateAttempt；A3 产品路径 |
| 033 | worker principal；cache/trace；七类高并发；独立 full.e2e |
| 050–052 | DELETE 保持 503 直至独立审；导出/擦除闭环另包 |
| 031/032 | **ai-eval** jailbreak/造假 golden+阈值 release-gate；结构 e2e escape/biz-reject（禁 fake-model 质量断言）；GuardrailHit 表/API；sole-stack 去 R5 |

实现方不自批；每片 harness→prove→≥2 域对抗→reviews/。

## partial→covered 执行序（2026-09-10 协调确认）
1. UC-018 covered-lift / **covered-lift-reassess**（UI + sole PG-retained CLOSED · FULL-E2E+GRAPH+TTL+waiting_user 已关；prior covered-lift tip **`abfbbc0`** · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV was **blind** · 仍 **partial≠covered** · **#6 alone ≠ covered** · Ban假关 · `harness/uc-e2e-018-covered-lift.md` · `post_prove_dual_pass` · `GAP-UC018-COVERED-LIFT` CLOSED as honest non-flip assessment only · **≠ UC covered** · prove tip `86953ca` · post-prove dual `0eb7ac4`/`5e70b55` · `pnpm uc018:covered-lift:prove` · Ban invent covered · Ban wash SOLE alone into covered）· **ADV nailed**（`harness/uc-e2e-018-adv.md` · tip **`27dd6ae`** · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · §1.0 ADV **partial** · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed）· **covered-lift-reassess nailed**（`harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` CLOSED as honest non-flip assessment only · `post_prove_dual_pass` · prove tip `5cddb53` · post-prove dual `14a1859`/`7f57243` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban wash ADV alone into covered · Ban假关 · **Ban skip to UC-011** while UC-018 still partial≠covered） · **PERF/LOAD residual OPEN**（`harness/uc-e2e-018-perf-load.md` · `GAP-UC018-PERF-LOAD` · **NHP-018-PERF-01**+**NHP-018-LOAD-01** **case-only** · `draft:awaiting_pre_exec_dual` · Ban elevate to **partial** this open · Ban invent covered · Ban claim production capacity / HA · **Ban skip to UC-011** while this refuse residual is open · covered-lift = separate later knife）
2. UC-011 refund-callback 产品口 / balance-ui（HTTP H1–H5 已挂；H5=GAP+PREREQ ≠ 产品口；仍 ≠ covered · **Ban skip here while UC-018 covered-lift-reassess executed / still partial≠covered**（canHonestlyFlip=false · refuse PERF/LOAD blind） · ADV residual CLOSED · ADV alone ≠ covered · **PERF/LOAD REQUEST OPEN** · NHP-018-PERF/LOAD **case-only** · Ban elevate partial this open）
3. UC-002 HTTP 双 session + Last-Event-ID（`uc002:http:prove` 已挂 GET+LED；仍缺 HTTP lease mouth → ≠ covered）
4. UC-010 full.e2e mid-SSE / A3（HTTP R-mid 已挂；仍 ≠ covered）
5. UC-019 regenerate 产品口
6. UC-033 七类/worker 余项
并行：UC-001 live blocked(无 Key) 勿假绿；R5/sole-stack 夹具退役证据；HA `releaseEvidence=false`。


## covered-wave 收口快照（2026-09-10）
018→011→002→010→019→033 HTTP/推进 prove 均过双域或在审；**全部仍 partial≠done/≠covered**。
并行下一候选：R5/sole-stack 夹具退役证据；HA 多实例+故障注入（releaseEvidence=false）。
