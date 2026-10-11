# Slice — G7 · **GAP-G7K-API-REDS 修复刀**（Line G7R · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/gap-g7k-api-reds-fix.md`（SSOT 细节/诊断全文以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-gap-g7k-api-reds-fix-mw-e2e-ha.md` + `reviews/REQUEST-2026-10-07-gap-g7k-api-reds-fix-mw-model-op.md`
**上游**: G7K nail `0c6c3287` 登记 GAP-G7K-API-REDS P1 OPEN · G7K EXEC `f02602cb`（实跑 code SHA `8c6860e3` · trio EXIT 1/1/1 真实业务红）
**Base**: `origin/feat/mysql-schema-skeleton` `7b28a492` · worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7r` · branch `line/g7r-api-reds-fix`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban live（本 turn 零调用零 Key 加载）· Ban push · Ban SSOT/backlog 状态翻转 · Ban 碰 sibling 归档 · Ban 改 withhold 机制 · Ban 洗断言 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点五条）

1. **诊断前置（本 turn 已完成 · 只读）**：三红根因假设各附 file:line+blob @`7b28a492` + G7K 收据/磁盘工件证据——**红①** recruiting-bound ×2：start server action 409（首选 `interview_ineligible_route`，sticky `route_unresolved` 使 binding 永不落）→ action throw → 根错误边界（G7K error-context 页快照「出错了」亲证）→ `waitForURL` 30s 必超时；**红②** abandon ×2：begin 后 worker 图**秒级 fail-closed** 置 `failed`（页快照「已结束」+ toast `interview_not_active` 亲证；`run-e2e-ui.mjs:136-138` 专用 knob 注释自证该竞态面）→ abandon 撞 409；**红③** iso 红面：withhold 契约内三角定位（reviewLedger 证明执行越过 `full.e2e.ts:153`）→ 首选候选 `:199` `A(questions>=1)` 主 drive 0 题 fast-fail（api 类断言）。**共同最上游候选 H0**：默认 profile `deepseek-cn-public` ↔ 默认 model `qwen-plus` 配对不一致（`text-endpoint-config.ts:67/:77`）→ 文本 chat 调用秒败级联三红；H0-alt-1/2/3（Key-provider 错配 / pre-dispatch 拒绝 / worker env 缺口）同判 EXEC 甄别。假设非断言，Ban 把假设当结论。
2. **修复方案候选（按根因归类）**：**F-A env-gap（首选）**=EXEC 进程环境补 `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME`（值由协调方下达 · 零代码）；**F-B 产品缺陷（若实测证实默认必败）**=`text-endpoint-config.ts` 默认配对一致化/启动 fail-fast 校验——**另刀 coding**；**F-C 夹具备选**=`E2E_UI_SKIP_WORKER=1` 既有专用 knob（仅产品修复后竞态仍输时由协调方另批 · 断言语义零改）；**F-D 改 spec / F-E 改 withhold 机制 = 否决**。触碰面：EXEC 默认 plan 零代码零夹具零 package.json 零 spec 零 SSOT，唯一变化=进程环境。
3. **prove 方案**：pre-exec dual BOTH PASS → 协调方 EXEC 授权（含 env 值/committed SHA 重钉）→ trio 三条 CMD（`pnpm e2e:isolated`/`pnpm e2e:ui:isolated`/`verify:e2e-performance`，G7K @`8c6860e3` 实测 wiring `:276/:277/:280` · EXEC 按 tip 重核）**各恰好一次**（iso→ui→perf）；Key 只经进程环境 · Ban `.env*` · 七字段逐 attempt 全记录（含 endpoint/model 配置 name-only 探针）；**预算沿 G7K ≤200**（诚实披露：修复生效后 recruiting-bound 完整旅程 ×2 + CMD1 三驱动全程生成，live 面**较 G7K 增大**）；红③ case 名甄别只走收据三角法或协调方显式批准的独立诊断 attempt（F-F · 独立记账 · Ban 借它 retry-to-green）。收据落 `receipts/gap-g7k-api-reds-fix/`（3 per-CMD + SUMMARY · 含根因定谳）。
4. **EXIT 契约**：**三绿** → trio 翻绿收据成立，**`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；trio 绿 ≠ suite green——G6 OPEN/R5-MARKED-RED/Disclosure-1 OPEN 独立核算）；**仍红** → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记（Ban flake 记法 · env-gap 不冲销 EXIT=1）→ 迭代刀重走 REQUEST。
5. **Ban**：covered/SSOT 行翻转（nail 阶段才改；GAP-G7K-API-REDS backlog 状态行不翻）· Ban 洗绿/Ban retry-to-green · Ban 改 withhold 机制（`run-e2e-isolated.mjs:2084-2098` 冻结）· Ban 为绿改语义/洗断言 · Ban 碰已占用行/sibling 归档 · Ban Key 物料。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not root-cause-proven（假设非断言）· not suite green · not trio green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · env 补齐 ≠ H0 定谳 · `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

## Pins（原值 + retained）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false`（retained · 至三绿+post-dual+协调方 nail）· `r1Closed=false`（retained）· `techRoleFailClosedOptOutG7Only=true`（retained · Disclosure-1 OPEN）· trio OPEN（1/1/1 真实业务红）· GAP-G7K-API-REDS P1 OPEN · STOP

---
*Slice · G7R GAP-G7K-API-REDS fix · 2026-10-07 · draft:awaiting_pre_exec_dual · docs-only · 诊断前置已完成（只读）· 修复 F-A 首选/F-B 另刀/F-D·F-E 否决 · trio ×1 各一次 · 预算 ≤200 · Ban 假绿/retry-to-green/改 withhold/洗断言 · STOP*
