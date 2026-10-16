# Slice — G7W-G · **golden 冷启残红 ×1 全 suite 上下文复现臂**（鉴别刀 · Line G7W-G · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/g7w-golden-residual-arm.md`（假设族/实验设计/判别判据/prove 契约以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-08-g7w-golden-mw-e2e-ha.md` + `reviews/REQUEST-2026-10-08-g7w-golden-mw-model-op.md`（PENDING · pre-exec dual 待两审 append-only）
**上游**: G7W EXEC 实验一 6 run/12 golden 执行全绿（含冷栈+冷 build 最高红概率条件 · 分段 3.0–4.4s ≪ 20s）→ G7W POST dual BOTH PASS（mw-e2e-ha `33ad1181` + mw-model-op `4eae75c9`）→ coordinator G7W nail（checklist `:1348-1358` @主线 `eef469d9`：H-G1/H-G2 削弱+suspended · H-G3 契约内不可证伪 · 残留=「G7U 两轮环境特异」挂起——**Ban 定谳「永不复现」· 是否立行/是否全 suite 上下文复现臂归协调方**）→ **协调方现裁决：立全 suite 上下文复现臂刀**——检验「golden ×1 只在全 suite 上下文（多 spec 并行/资源竞争）复现」假设
**Base**: `origin/feat/mysql-schema-skeleton` `eef469d9`（fetch 后实测 tip=预期 ≥`eef469d9` 恰等）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-golden` · branch `line/g7w-golden-residual-arm`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（零调用零 Key 加载零 DB 连接）· Ban 预claim 判别结论 · Ban SSOT/backlog 状态翻转 · Ban 碰 spec/产品码/wrapper（四 blob 机检承重）· Ban 顺手做残红①③/P2/旧红③ 面 · Ban masking · Ban 破坏性注入 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点）

1. **混杂变量定性（本刀唯一起点）**：残红② 红样本 ×2（G7U EXEC CMD2 + post-dual mw-model-op re-run 11P/3F/10S）+ 绿样本 ×1（mw-e2e-ha re-run 12P/2F/10S · golden PASS 3.1s）**全部是全 suite 上下文**；G7W 实验一 6 绿**全部是过滤单跑**（`E2E_UI_GREP='golden path'`）——红/绿两组上下文口径不同=未受控混杂，本刀即检验该变量。
2. **假设族（预注册 · 不预设结论）**：**H-G3a**=全 suite 上下文资源竞争致 textarea 超时（预测：主臂红·对照绿）；**H-G3b**=与上下文无关单跑亦复现（G7W 6 绿先验低 · 预测：对照臂亦红=表外值域回协调方）；**H-G3c**=非确定性与 suite 内位次/执行序有关（与 a 同预测——a/c 分流只靠分段形状读数登记非定谳）。**判别读数**=每次 golden 执行分段时长（基线 3.0–4.4s vs 超时窗 20s · trace 零改动）+ 上下文并行度如实记录（`workers:1` `:17`/`fullyParallel:false` `:13`/chromium+mobile 双 project `:27-31`/`retries:0` `:19` @blob `321b80e0`——零改动只记录）。
3. **实验设计（预注册 · N=3+1 一次成型）**：主臂=`pnpm run e2e:ui:isolated` **全量（无 `E2E_UI_GREP` · wiring `:279`）×3**；对照臂=`E2E_UI_GREP='golden path'` 过滤单跑 ×1 预期绿；执行序固定 S1→S2→S3→C1。**判别判据（双向）**：主臂 golden 红 ≥1 → H-G3a/c 候选成立（**登记非定谳** ·「与 X 一致」≠「X 已证」）；主臂全绿 → 残红持续 **suspended**（不闭行不定谳 · Ban 定谳「永不复现」· Ban 触发任何追加 run）；对照臂红 → H-G3b 升权登记回协调方。**预期红≠判别失败双向契约 · 红原值记账不冲销 G7U/G7W 台账**。
4. **纪律**：无升压臂（G7W 先例不承卷——任何追加 run=违纪）；Ban 碰 spec/产品码/wrapper（`golden.spec.ts` `8db8746b`/`playwright.config.ts` `321b80e0`/`run-e2e-ui.mjs` `aa86fb3f`/`package.json` `0afb3bd2` 四 blob 前后全等机检）；Ban 调 workers/projects/retries/超时（并行度=读数非旋钮）；Ban 破坏性注入（降资源/杀进程/清 BUILD_ID——H-G3 族契约内不可证伪性承卷 · 本刀只做自然上下文对照）。
5. **Pins 原值全抄**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**；retained：残红② suspended/OPEN（行状态翻转归协调方 nail）· trio OPEN（真测 1/1/1）· GAP-G7K-API-REDS `:107` P1 OPEN · 残红①③/P2 复验门 OPEN（均非本刀）。双审 = mw-e2e-ha（e2e 纪律/预注册与对照臂合法性/上下文口径诚实性/并行度读数非操纵）+ mw-model-op（假设族忠实性/模型消费面预算/判别判据与措辞纪律）。
6. **prove 方案（EXEC 期）**：meetwise EXEC 授权后固定序一次成型；七字段逐 run 全记录 · 四来源交叉一致（EXIT/`E2E_FAILURE_CLASS`/machine receipt/tally）；分段时长逐条落收据；est ≤35 ≪ 200（est-not-counter · EXEC 期按 spec 清单与 skip 门实数重估 · 超限即停）；Key 只经进程环境（loader source · name-only）· `.env*` ABSENT 逐 run 记录；收据落 `receipts/g7wg-golden-residual-arm/`；候选成立≠修复≠翻绿≠suite green——处置一律归协调方（修复另刀 REQUEST+双审+授权）。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 判别结论定谳（本 turn 只有设计）· not 残红② closed/un-suspended · not 残红①③ touched · not P2 复验门 touched · not 旧红③ C-MO-P3 touched · not trio green（1/1/1 retained）· not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 立行/状态翻转 · not live（本 turn）· not coordinator/meetwise authorize · `g7SuiteGreen=false` · trio OPEN（真测 1/1/1）· `actualSpendCny=null` · alone ≠ dual

---
*Slice · G7W-G golden 冷启残红 ×1 全 suite 上下文复现臂（鉴别刀）· 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 主臂全量 ×3 + 对照臂过滤 ×1 一次成型（H-G3a/b/c 预注册 · 判别读数=分段时长+并行度 · 主臂红≥1→候选成立登记非定谳 · 全绿→suspended 持续）· Ban 两向定谳 · Ban retry-to-green · Ban 修复另刀 · est ≤35 ≪ 200 · STOP*
