# Slice — G7W · **golden 冷启归因 + api 面拒因甄别刀**（Line G7W · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/g7w-golden-api-discriminator.md`（两实验设计全文/判读表/读取清单/prove 契约以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-g7w-golden-api-discriminator-mw-e2e-ha.md` + `reviews/REQUEST-2026-10-07-g7w-golden-api-discriminator-mw-model-op.md`（PENDING · pre-exec dual 待两审 append-only）
**上游**: G7U EXEC（真测 trio EXIT 1/1/1 · 残红后移登记：①旅程自适应早停 ×2 ②golden 冷启 ×1 ③api 面 G7S 同形）→ G7U POST dual BOTH PASS（mw-e2e-ha `79936f44` + mw-model-op `7e76e6c1`）→ coordinator G7U nail `bbc361fa`（「残红三点另刀——新 REQUEST+双审+协调方授权」）——本 REQUEST 即 **残红②③** 的指名独立 REQUEST（残红① 非本刀）
**Base**: `origin/feat/mysql-schema-skeleton` `bbc361fa`（fetch 后实测 tip = 预期 ≥`bbc361fa` 恰等）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7w` · branch `line/g7w-discriminator`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban live（零调用零 Key 加载零 DB 连接）· Ban push · Ban 预claim 甄别结论 · Ban SSOT/backlog 状态翻转 · Ban 碰已占用行/sibling 归档 · Ban 改 withhold 机制（读 DB 不读 stderr）· Ban 碰 `:68`/`:70`/`:71` 已清面 · Ban masking · Ban 破坏性注入 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点）

1. **范围 = 两甄别实验设计**（沿 FLK 预注册先例：每实验假设+判读标准+反例 · Ban retry-to-green——每跑有假设+判读，追加 run 仅限预注册分支触发）：
   - **实验一（残红② · golden 冷启归因）**：golden(chromium) 单跑 ×3 受控复现（G7U 在卷 2R/1G 非确定性 · 失败面=`/resume` textarea 20s 超时 · spec `:10` blob `8db8746b`）——预注册 H-G1（chromium/worker 冷启）/ H-G2（简历页组件首渲染/供给慢）/ H-G3（宿主资源位次）三假说 + trace 分段判读表（navigation/组件/断言三段分解 20s 超时）+ 升压臂 B（仅主臂 A 零红时预注册触发）· 慢速因子仅限无破坏观测类，**Ban 破坏性注入**（清 BUILD_ID/降资源=越界另刀）。
   - **实验二（残红③ · CMD1 sidecar 仪器化甄别）**：沿 F-F 先例对 `pnpm e2e:isolated`（wiring `:278`）×1 做 sidecar 直读隔离 PG（机制原样 · wrapper 零 diff blob `13dbfc43` 全等机检）——SELECT-only 八查询白名单（`interview_job` last_error 主读 + `job_route_decision`/`job_semantic_revision` + `interview`/`application` API 侧状态表 + `ai_model_invocation`/`ai_invocation_trace` + `route_consumption_event`/`interview_route_snapshot` 计数）· 判读表 J-A1~J-A6 定位 api 红具体 case 与拒因，**并定谳 G7S 供给面修复后 CMD1/3 api 面「同形不同内容」是否成立**（G7U CMD3 37.9s vs G7S 38.4s）· class=api 码面定性=`full.e2e.ts:384` `main().catch` 兜底分类非端点定位（blob `7d65d0f3` 亲读在卷）。
   - **甄别结论无论是否定位，如实入收据**（Ban 定谳压力 · 判读表未覆盖值域回协调方 Ban 就地 reinterpret）。
2. **边界**：甄别=只读诊断（**Ban 修复——修复按甄别结论另刀**：冷启面→夹具/基建刀 · 组件供给面→产品刀 · worker 面→F-F 族产品刀 · 下游尾段→断言面刀）；withhold 契约零触碰（**读 DB 不读 stderr** · 断言原文/case 名回读裁定权归协调方）；Ban 碰 `:68`/`:70`/`:71` 已清面（`model-operation-registry.ts` start-job chat 注册面 · blob `63af556f`）；残红①（旅程自适应早停 ×2）与旧红③ `full.e2e.ts:203`（C-MO-P3）不在本刀零触碰。
3. **Pins 原值全抄**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**；retained：trio OPEN（G7U 真测 1/1/1）· 残红②③ OPEN（本刀指名面）· Disclosure-1 OPEN · GAP-G7K-API-REDS P1 OPEN（`:107` 不翻）· `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`。双审 = mw-e2e-ha（e2e 纪律/甄别 run 合法性/诚实性/withhold 边界）+ mw-model-op（判读表忠实性/模型消费面/供给面修复定谳逻辑）。
4. **prove 方案（EXEC 期）**：两实验各预注册执行序（实验一 golden ×3 → 零红才升压臂；实验二 sidecar 随 CMD1 ×1 · **预期 EXIT=1 ≠ 甄别失败——甄别成功判据=快照捕获读取清单**）；七字段逐 attempt 全记录 · 四来源交叉一致（EXIT/E2E_FAILURE_CLASS/machine receipt/快照 log）；预算 est ≤40 ≪ 200（est-not-counter · 超限即停）；Key 容器固定测试凭据 name-only · Ban `.env*`；收据落 `receipts/g7w-golden-api-discriminator/`；定位成立≠修复≠trio 翻绿≠suite green——修复一律另刀走 REQUEST+双审+协调方授权。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 甄别结论定谳（本 turn 只有设计）· not 残红②/③ closed · not 残红① touched · not 旧红③ C-MO-P3 touched · not trio green（1/1/1 retained）· not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · not withhold 契约裁定 · `g7SuiteGreen=false` · trio OPEN（真测 1/1/1）· `actualSpendCny=null` · alone ≠ dual

---
*Slice · G7W golden 冷启归因 + api 面拒因甄别刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 实验一=golden ×3 受控复现（三假说+trace 分段判读+预注册升压臂）· 实验二=CMD1 sidecar 直读甄别（F-F 机制 · 八查询白名单 · J-A1~J-A6 判读表 + G7S 修复后定谳）· Ban retry-to-green · Ban 修复另刀 · 读 DB 不读 stderr · 预算 est ≤40 ≪ 200 · STOP*
