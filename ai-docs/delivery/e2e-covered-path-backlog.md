# E2E 抬到 covered 路径 backlog（北星 · 非完成清单）

**日期**：2026-09-10（PT）  
**硬令**：partial / gap / honesty-pin **≠ done**；全量 E2E 零遗漏；生产 100% HA；0 BUG。  
**releaseEvidence=false** 直至多实例 + 故障注入 prove EXIT + CI 收据。  
**sole-stack** MySQL+Qdrant+Redis 未迁完 → **禁止宣称 HA**。R5/pgvector → **green-risk** 必标。

## 2026-11-11 G1–G4 修复合入与用户决定（协调方同步）

**合入 main（merge commit，均经独立领域审查 PASS + PR CI 全绿）**

| 组 | PR | 内容 | merge sha | 合入后 PTP cap |
|----|----|------|-----------|----------------|
| G3 | [#240](https://github.com/miaole/meetwise/pull/240) | SSE 槽 proof 按连接计数 + 轮询下界 + 全仓冲突标记扫描（secrets-scan 内）+ verify `timeout-minutes: 30` | `67a4daeed771785523a1caf869702ec411daae3c` | 2533 |
| G1 | [#239](https://github.com/miaole/meetwise/pull/239) | 迁移账本链首前缀修复（0000→0230 改号）+ 旧库升级 proof | `6212ab8572f4e468ee669aee49d0e6d05c1f9d0e` | 2535 |
| G2 | [#241](https://github.com/miaole/meetwise/pull/241) | 判重出题降级（本场不重复 → 换能力项 → 跨场重复兜底） | `9bc700764482a50c0fdadcaca8e27c9891d24cb4` | 2536 |
| G4 | [#238](https://github.com/miaole/meetwise/pull/238) | 隐私 worker 生产编排与 env 校验 | `2be4e4f29acb9f61594dbd1298a572dc298877e4` | 2536（不增受管件） |

main 上 `ci` 工作流对上述合入提交均 success。`deploy` 工作流报红属**预期内**：云服务器尚未购买，目标 ECS 不存在。`deploy.yml` 保持原样，不改、不禁用。

**用户决定（2026-11-10/11）**

- 跨场重复默认值：本场不重复；本场可换的能力项都换完后，才允许使用别场问过的题（不多调模型、不多扣额度）。如将来要求严格不跨场重复，另开一刀做历史题降权，不靠无上限重摇。
- 全栈 E2E 不进 CI，不配 `MODEL_API_KEY`；在本地手跑 `pnpm e2e:isolated`。
- CI 改为轻量，只保留核心校验（瘦身另走 PR，经 mw-e2e-ha 独立审查后再合）。PR #243 已按 mw-privacy-int + mw-e2e-ha 建议补齐（用户拍板）：PR 加回 E2E 静态守卫 12 条 + 503 无库 pin 2 条；nightly 补 13 条关键隔离 prove、隐私步骤 `if: !cancelled()`、job `timeout-minutes: 60`；`docs:check` 新增步骤台账一致性门；`sse-slot:prove` 自封闭。复审通过后再合。
- 隐私 worker 的生产密钥（`PRIVACY_WORKER_DATABASE_URL` / `PRIVACY_WORKER_DB_USER` / `PRIVACY_WORKER_DB_PASSWORD`）用户确认已配好。
- 上云口径：除「买云 + 部署」这一项以外，上云前的所有工作都要做完。#238 隐私 worker 实际上线排在「买云 + 部署」这一项里，当前**未上线**。

**后续队列（未关）**

1. #18 `interview_job.payload` 明文 answer 需即时剥离。
2. #106 deps-audit 18 个 high 已在 `fix/deps-audit-high` 清零，门禁拟升至 `--audit-level=high`（待合入；翻面权归协调方）。残余 medium 仅 qs@6.15.3 ×3，不挡 high 门。
3. N-11 口径冲突待深审。
4. #28 ADR 仍写 BullMQ/Redis，需与 PG-retained 对齐。
5. #70 bodyLimit 12MiB 低于 base64 上限，413 不可达。
6. #234 use-cases 索引未更新。
7. `ha6:prove` 在 main 上原本即红（3 条），单独跟进。
8. G5（N-13/N-14）、G6（N-17）后置。
9. G2 `duplicateFallback` 标记未投影到 `question_ready` 事件，运营不可见；§4.5 缺 `provenance=cross_session_repeat` 断言。
10. 缺 HTTP 层「跳过当澄清」的 E2E。
11. isolated 场景 `runFullE2E` 吞掉 stderr，Key-block 易被误读为 PG 静默失败。
12. 跨场撞题降权（确定性相似度、当场仍硬拒）另开一刀，需 PRE 双审。
13. `sse-slot:prove` 轮询下界只能稳定抓到约 <875ms 的回归（1000ms 的 2 倍退化抓不到）。
14. 0000 ledger 老库需要手动 DELETE 孤儿行；是否自动化由用户决定。
15. 0230 迁移头注释误写为 DEFINER，需要勘误。
16. Worker 高并发崩溃（2c4g sizing 加测，`WORKER_INTERVIEW_GLOBAL_INFLIGHT=16`，默认 4）：N=20 负载开始 +14 s worker 因未捕获的 `checkpoint_privacy_fenced`（42501，`PostgresSaver.put`）退出，20 场全超时；N=40 +28 s 因 `Connection terminated`（`PostgresSaver.putWrites`，同时有 pg「client.query() when the client is already executing a query」告警）退出。两次 CPU / 内存都远低于上限，是稳定性缺陷不是资源问题；默认 4 的各档 0 次退出。调高 inflight 之前必须先修。
17. P3：库里缺 0143 trigger（或空库 `interview_event` 不存在）时，SSE notify 单例降级并退避重连（100 ms 起，上限 5 s），每次掉线都 `wakeAllWaiters`，每个 SSE 连接在 2 s 轮询之外约多 1 次 DB 查询 / 5 s。属设计内降级，记入 SSE 负载评估；生产须确认 0143 trigger 在位。
18. `scripts/run-e2e-isolated.mjs` 删一次性 PG 容器时没带 `-v`（pgvector 镜像声明了 VOLUME），每个隔离 target 泄漏 1 个匿名卷；PR243 审查两轮 `verify:local` 留下 94 个卷约 7 GB，inode 59%→70%。改成 `docker rm -f -v` 或 `--rm`。
19. P3：`pnpm verify:local` 是单条 `&&` 链，首错即停、不汇总；后续改成逐条汇总的 runner。
20. 2c4g sizing 结论（2026-11-11，box 模拟 2 vCPU / 4 GiB 应用机 + 外置 PG / Redis，真模型，零思考时间；原始收据在本地 sizing 工作区、未入库；NOT_HA · UNQUOTED · 不买）：5 场并发完全稳（0 错误，题目延迟 p95 约 4.9 s）；10 场可用（全部完成，SSE 代理 10 s TTFB 超时 502 约 0.7–0.9%，可自动重连，首题 p95 11.6–14 s）；20 场起明显变差。瓶颈不是硬件，是 Worker `globalInflight=4` 加模型延迟（N≥10 吞吐停在约 28–31 场/分，应用 CPU 均值 ≤12.4%、内存峰 ≤1.05 GiB）。推荐托管 PG 2c4g + pgvector（实测峰 0.9 vCPU、≤463 MiB，余量大；1c2g 未实测；max_connections 每套应用约 50）；Redis 256 MB 最小规格即可（实测 ≤3.9 MiB）；swap 不必要。未测：2c4g 硬件真实上限（被第 16 条崩溃挡住）、带宽 6M 限速、托管服务网络 RTT、生产 `NODE_ENV=production` 配置、OCR / 语音、UI、数据量增长后的 PG 内存。
21. 上云待办（不改 `deploy.yml`）：单一来源见 `ai-docs/architecture/devops/ci-cd.md` §8.3（约 :249），此处不再复述正文。

Pins 不变：NOT_HA · releaseEvidence=false。

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
| 018 | HTTP + **full.e2e abandon** + **graph** + **ttl** + **UI abandon** + **sole PG-retained** prove 已挂（FULL-E2E+GRAPH+TTL+UI+`GAP-UC018-SOLE` CLOSED under PG-retained · `pnpm uc018:sole:prove` · tip **`aa968b1`**）；仍 **partial≠covered** · **#6 alone ≠ covered** · Ban claim UC covered（waiting_user+#1+#2+#3+#5+#6 已关；harness §1b）· covered-lift assessed `harness/uc-e2e-018-covered-lift.md` · tip **`abfbbc0`** · `post_prove_dual_pass` · `GAP-UC018-COVERED-LIFT` CLOSED as honest non-flip assessment only · **≠ UC covered** · `pnpm uc018:covered-lift:prove` · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV was **blind** · Ban假关 · Ban invent covered · Ban wash SOLE alone into covered · **ADV nailed** `harness/uc-e2e-018-adv.md` · tip **`27dd6ae`** · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · §1.0 ADV **partial** · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed · **covered-lift-reassess nailed** `harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` CLOSED as honest non-flip assessment only · `post_prove_dual_pass` · prove tip `5cddb53` · post-prove dual `14a1859`/`7f57243` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban wash ADV alone into covered · Ban假关 · **Ban skip to UC-011** while UC-018 still partial≠covered  · **PERF/LOAD nailed** `harness/uc-e2e-018-perf-load.md` · `GAP-UC018-PERF-LOAD` **CLOSED** · **NHP-018-PERF-01**+**NHP-018-LOAD-01** **partial** · `post_prove_dual_pass` · prove tip `b29c191` · dual `1745bee`/`37c89dc`+`e33dd63` · PERF/LOAD alone ≠ covered · Ban claim production capacity / HA · **Ban skip to UC-011** while UC-018 still partial≠covered · Ban cite canHonestlyFlip@b29c191 as assessed |
| 019 | HTTP regenerate；regenerateAttempt；A3 产品路径 |
| 033 | worker principal；cache/trace；七类高并发；独立 full.e2e |
| 050–052 | DELETE 保持 **503**；**UC-052 deletion → partial**（`uc052:internal-erasure:prove` @`3c4847a` · EOR `08d54f8`/`3e39c1e`）· **≠ covered** · Ban UC-050/051/export elevates · 导出/外部 sink/checkpoint 物理删另包 |
| 031/032 | **ai-eval** jailbreak/造假 golden+阈值 release-gate；结构 e2e escape/biz-reject（禁 fake-model 质量断言）——**UC-031-032-STRUCTURE-01 两臂结构收据已落（2026-11-06 EXEC）**：`pnpm uc031-032:structure:prove` EXIT=0 · 48 断言（Arm-ESC 结构臂+Arm-REJ biz-reject 双腿经隔离 PG 真路径拒·收据 `receipts/uc31-032-structure/`·AUDIT-OBSERVATION: absent）；GuardrailHit 表/API（仍缺·产品裁决前置）；sole-stack 去 R5 |

实现方不自批；每片 harness→prove→≥2 域对抗→reviews/。

## partial→covered 执行序（2026-09-10 协调确认）
1. UC-018 covered-lift / **covered-lift-reassess**（UI + sole PG-retained CLOSED · FULL-E2E+GRAPH+TTL+waiting_user 已关；prior covered-lift tip **`abfbbc0`** · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV was **blind** · 仍 **partial≠covered** · **#6 alone ≠ covered** · Ban假关 · `harness/uc-e2e-018-covered-lift.md` · `post_prove_dual_pass` · `GAP-UC018-COVERED-LIFT` CLOSED as honest non-flip assessment only · **≠ UC covered** · prove tip `86953ca` · post-prove dual `0eb7ac4`/`5e70b55` · `pnpm uc018:covered-lift:prove` · Ban invent covered · Ban wash SOLE alone into covered）· **ADV nailed**（`harness/uc-e2e-018-adv.md` · tip **`27dd6ae`** · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · §1.0 ADV **partial** · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed）· **covered-lift-reassess nailed**（`harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` CLOSED as honest non-flip assessment only · `post_prove_dual_pass` · prove tip `5cddb53` · post-prove dual `14a1859`/`7f57243` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban wash ADV alone into covered · Ban假关 · **Ban skip to UC-011** while UC-018 still partial≠covered） · **PERF/LOAD nailed CLOSED**（`harness/uc-e2e-018-perf-load.md` · `GAP-UC018-PERF-LOAD` **CLOSED** · **NHP-018-PERF-01**+**NHP-018-LOAD-01** **partial** · `post_prove_dual_pass` · prove tip `b29c191` · Ban invent covered · Ban claim production capacity / HA · **Ban skip to UC-011** while UC-018 still partial≠covered · covered-lift = separate later knife · must restore computable six-column evaluator first · Ban cite canHonestlyFlip@b29c191 as assessed）· **COVERED-CRITERION nailed** `harness/uc-e2e-018-covered-criterion.md` · `GAP-UC018-COVERED-CRITERION` **CLOSED** · status `post_prove_dual_pass` · runner `22790a8` · receipts `971bb80` · post-prove dual `fc7dc24`/`6d2841c` BOTH PASS · evaluator `scripts/lib/uc-covered-evaluator.mjs` + gatherer · last-line Verdict · mutation **423/423** · flip⇒empty-reasons · `b29c191` constant-false retired · reassess calls evaluator · real UC-018 `canHonestlyFlip=false` · UC-018/§1.1 stay **partial** · Ban invent covered · D1 **NHP-018-BOUND-01** **partial** · D2 FAULT **case-only** · follow-ups `GAP-UC018-RECEIPT-BACKFILL` · `GAP-EVAL-PARSER-DETAILS-UNCLOSED` · C-WORD-NEG）
2. UC-011 refund-callback 产品口 / balance-ui（HTTP H1–H5 已挂；H5=GAP+PREREQ ≠ 产品口；仍 ≠ covered · **Ban skip here while UC-018 covered-lift-reassess executed / still partial≠covered**（canHonestlyFlip=false · refuse PERF/LOAD blind） · ADV residual CLOSED · ADV alone ≠ covered · **PERF/LOAD nailed** · NHP-018-PERF/LOAD **partial** · `post_prove_dual_pass` · GAP CLOSED · Ban invent covered）
3. UC-002 HTTP 双 session + Last-Event-ID（`uc002:http:prove` 已挂 GET+LED；仍缺 HTTP lease mouth → ≠ covered）
4. UC-010 full.e2e mid-SSE / A3（HTTP R-mid 已挂；仍 ≠ covered）
5. UC-019 regenerate 产品口
6. UC-033 七类/worker 余项
并行：UC-001 live blocked(无 Key) 勿假绿；R5/sole-stack 夹具退役证据；HA `releaseEvidence=false`。


## covered-wave 收口快照（2026-09-10）
018→011→002→010→019→033 HTTP/推进 prove 均过双域或在审；**全部仍 partial≠done/≠covered**。
并行下一候选：R5/sole-stack 夹具退役证据；HA 多实例+故障注入（releaseEvidence=false）。
