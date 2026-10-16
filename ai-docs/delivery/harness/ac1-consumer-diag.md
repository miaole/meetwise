# AC-1 — adaptive-consumer 排空环调查刀（base 同红根因定谳）

**状态**：`exec:awaiting_post_prove_dual` · base = 主线 `7ad2b3e2` · 分支 `line/adaptive-consumer-diag` · 立项依据 = GODFN-1a nail 遗留登记（adaptive-consumer.proof base≡red 预存红 4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN·席2 路径级排除 invoke.ts·红因在 `apps/worker/test/adaptive-consumer.proof.ts:127` drainInterviewJobOnce answer 排空环·mock ModelClient :32-38 scripted）。

## 1. 手段（调查刀·诊断优先·修复另裁）
1. **根因定位**：亲跑 adaptive-consumer:prove 一次（base 同红原值 retained）→ child stderr/日志逐行分析 NORMAL_ANSWER_DRAIN 4/4 失败链（claim→evaluate→complete 排空环哪一环断）；
2. **码面溯源**：drainInterviewJobOnce（interview-consumer.ts）与 proof 夹具（mock ModelClient scripted 面）的契约错位分析（夹具供的 answer 形态 vs 消费环期望——GODFN-1c 拆解后 interview-consumer 契约面是否漂移·或夹具陈旧）；
3. **红因定谳**：夹具债（沿 NEGCOMM-1 先例）/产品回归/契约演进三向判读·修复方向建议入收据（修复刀另立全链）。

## 2. Ban
零产品码（apps/packages src 零改——本刀纯诊断）·恰 1 run·Key name-only·est 0 live（mock 模型面）·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 3. 验收
根因定谳报告（码面 chain+失败链逐环）+三向判读+收据 `ai-docs/delivery/receipts/ac1-consumer-diag/`。

## 4. Non-claims
本刀 ≠ 修复（修复刀另立全链）≠ adaptive 面全部 ≠ G7 面。

## 5. EXEC 落账（mw-core · 2026-10-09 · REQUEST @37b5ed50 唯一蓝本）

- **run**：恰 1 次证明体调用（a3）· EXIT=1 · base≡red 同签名 retained：`pass_count=4 fail_count=4 failure_class=child_exit_nonzero stage=NORMAL_ANSWER_DRAIN code=UNKNOWN`（与 §0/1a §2.2#18 逐字段全等）· 双流全量留存收据。
- **定谳（一句话）**：席2 假说**验证成立**——溃点=proof :132 q 未定义型无码抛（`:127` 排空环，夹具侧）；根因环=**上游 start 链角色供给门**（interview-consumer.ts :352-361 + adaptive-role-resolve fail-closed 默认 ON）：fixture 裸 SQL 建面无 route snapshot 供给、deps 角色注入不再满足门 → start job failed（stderr 诊断 `last_error='adaptive_role_route_missing'`）→ 无 issued 题 → 喂给溃点。
- **三向判读**：夹具债命中（主判·NEGCOMM-1 同族·fixture 2026-09-04 早于 g-r4-3 2026-09-23 默认翻 ON 与 g7s 0142 2026-10-08）· 产品回归排除（确定性契约执行+失败收尾链逐环按设计）· 契约演进成立（机制框架）。修复方向建议（A：夹具供给真 route snapshot 保门 ON 态诚实 / B：显式 legacy opt-out 弱替代）入 exec-receipt §6，修复刀另立全链。
- **Condition C-1（:raw 面）落账**：字面 `pnpm --filter @meetwise/worker adaptive-consumer:prove:raw` 无法在 worker 包落地（脚本仅 root 转发器·探测零执行）；:raw 面落地=runner isolatedCommand 子命令 `pnpm -C apps/worker prove:adaptive-consumer`（run-e2e-isolated.mjs:1877-1878）双流可见直跑，**runner 零 diff**；root 包裹器 stderr withhold 按设计绕开（即 1a 只能见类别不能见诊断行的根源）；base 同红原值 retained（未重跑 base，1a 配对成立并升级为因果级）。
- **Condition C-2（溃点/根因环区分+proof 夹具零改）落账**：区分见 exec-receipt §4（溃点 ≠ 根因环·逐环证据先落收据后下修复方向）；proof 夹具 `apps/worker/test/adaptive-consumer.proof.ts` **零改**（git 零 diff 在卷）。
- **边界核验**：apps/packages src 零 diff · runner/脚本零 diff · est live=0（mock 面·图未进入·MODEL_API_KEY/DASHSCOPE env 计数=0·name-only）· 零 `.env` · Key name-only · 容器 1 只（--rm 自拆+trap 复删，零 stray）· pins 十一值照抄见 exec-receipt §7 · attempts 全账（含 a2 launcher 缺陷零证明体进入+manifest 标签缺陷登记）见收据 `attempts.md`。
- 收据：`ai-docs/delivery/receipts/ac1-consumer-diag/`（exec-receipt.md · attempts.md · prove-stdout.raw · prove-stderr.raw · run-manifest.txt · migrate.log · attempt1-launcher-*.raw）。
- lifecycle：`draft:awaiting_pre_exec_dual` → `exec:awaiting_post_prove_dual` · STOP · Ban self-approve · alone≠dual。
