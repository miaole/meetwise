# UC184-SLOT-ORDER EXEC 收据（00-exec）

**战刀**：#184 SSE 领槽后置于取数序修复刀（恰 3 控制器同形调序+1 proof 断言翻面）
**EXEC 日**：2026-10-15 · **授权链**：REQUEST `b4712353` 起草 → pre-exec 双审会签 PASS（席1 `agent_d4e4f7b9`+席2 `agent_6e6e1701`）→ 协调方 EXEC 授权 → 本 EXEC commit
**分支/工作树**：`line/uc184-slot-order` · `meetwise-u184`
**基线→并线**：`b4712353`（起草卷）→ `git merge --no-ff feat/mysql-schema-skeleton`（=origin tip `109e3eb1`·零冲突）→ 并线基座 **`32cd5e70`**

## 1. 门矩阵全表（EXIT 原值）

| # | 门 | 命令（原值） | EXIT | 实测 |
|---|---|---|---|---|
| 1a | sse-slot 改前 run（恰一次·不计 prove） | `pnpm -C apps/api prove:sse-slot` | 0 | 18 臂全 PASS·`:164`「overflow 各付 1 次 catch-up」PASS=**实测 8** |
| 1b | sse-slot 改后 prove（恰一次） | `pnpm -C apps/api prove:sse-slot` | 0 | 18 臂全 PASS·`:164`「溢出拒连零 catch-up（UC184 领槽先于取数·拒连不付取数副作用）」PASS=**实测 5** |
| 2 | interview:prove | `pnpm interview:prove` | 0 | **57** PASS / 0 FAIL（题面 57 恒等） |
| 3 | neg:all 六段 | `pnpm neg:all` | 0 | **687** PASS / 0 FAIL（auth 90/commerce 90/resume 91/interview 102/bend 179/input 135）·`/events` 三臂 404/404/401 原码 |
| 4a | sse-push-notify | `pnpm sse-push:notify:prove`（隔离包装·见 REQUEST §9 偏离 1） | 0 | **35** PASS / 0 FAIL |
| 4b | s4b-delta-arm | `pnpm -C apps/api prove:s4b-delta-arm` | 0 | **21** PASS / 0 FAIL（题面 20 勘误·见偏离 2） |
| 4c | uc010-sse-resume | `pnpm uc010:sse-resume:prove`（隔离包装·见偏离 1） | 0 | **13** PASS / 0 FAIL |
| 5 | migrate:prove | `pnpm migrate:prove` | 0 | 123 臂全 PASS·链头 **0202**·链文件数 **202** |
| 6 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | 0 | `files=202 violations=0`（exemptions=0143,0152,0160） |
| 7 | typecheck | `pnpm turbo typecheck --force` | 0 | Tasks: 8 successful, 8 total · Cached: 0 cached, 8 total |
| 8 | lint | `pnpm turbo lint` | 0 | 12 任务全绿 0 errors·五贴线：web 601≤601/root 5235≤5235/api 1421≤1421/worker 954≤954/ai-runtime 628≤628 |
| 9 | docs:check | `node scripts/ai-docs/check-docs.mjs` | 0 | 收据前 2134≤2136·**收据落卷后终值 2135≤2136**（本节收尾复跑） |
| 10 | markers 五类 | 词面运行时组装（四词+冲突标记对·同 `scripts/i6-239-gates.proof.mjs:151-:163` 形·词面不入卷防自匹配）对改动集全文件扫描 | 0（grep 零命中） | hits=0（扫描 4 .ts+本卷 .md+收据本件） |
| 11 | diff 面机检 | `git diff --numstat HEAD`（改形时刻） | — | 恰 **4** tracked：diagnosis +3/−2·interview +3/−2·quiz +3/−2·proof +3/−4 |
| 12 | 卫生 | `pnpm install --frozen-lockfile` | 0 | 零 lockfile 改（`git status pnpm-lock.yaml` 空）·`.env*` ABSENT（root glob 无命中+depth-3 find 零命中）·`actualSpendCny=null`·est live=0 |

## 2. sse-slot 改前/改后计数观测（序翻面机器实证）

- 改前（`b4712353`+`32cd5e70` 树·件③ 未落）：`:164` 断言 `=== 8` PASS——5 占槽（3 interview+2 quiz）+3 第六连拒连各付 1 次 catch-up=8。
- 改后（件①②③ 落地）：`:164` 断言 `=== 5` PASS——拒连路径零 catch-up（领槽先于取数·429 先于任何取数 SQL）=5（仅占槽者的首轮 catch-up）。
- 恰各一次·零 retry 冲销。`:149`/`:163`/`:173-:176` 三断言（槽计数 5/拒连不占槽/拒连不入 2s 轮询）前后全绿零改。

## 3. diff numstat（改形时刻机检原值）

```
3  2  apps/api/src/modules/diagnosis/diagnosis.controller.ts
3  2  apps/api/src/modules/interview/interview.controller.ts
3  2  apps/api/src/modules/quiz/quiz.controller.ts
3  4  apps/api/test/sse-principal-slot.proof.ts
```

## 4. 重 pin 全表（EXEC 立项日 @`32cd5e70` 亲测）

| 锚 | 起草值 | EXEC 复测 | 结论 |
|---|---|---|---|
| interview.controller.ts blob | `1426c175`（279 行） | `1426c175`（279 行） | 恒等·零改锚 |
| quiz.controller.ts blob | `e77480dd`（71 行） | `e77480dd`（71 行） | 恒等 |
| diagnosis.controller.ts blob | `75a57e21`（69 行） | `75a57e21`（69 行） | 恒等 |
| sse-principal-slot.proof.ts blob | `da936220`（205 行） | `da936220`（205 行） | 恒等 |
| sse-pump.ts / rate-limit.service.ts / 三 service / worker interview.proof | 零触面 | 并线 `git diff b4712353 HEAD -- <四文件>` 空+blob 表恒等 | 零漂 |
| 迁移链 | 202·头 0202 | 202·头 `0202_interview_event_kind_score_card_written.sql` | 恒等 |
| worktree 计数 | 11 树 | **14 树**（新增邻战役树·零第二 uc184 树·`line/uc184*` 恰 1） | 重测入 §0.0 |
| 在飞交叠 | 唯一命中 b2-uc025-wiring（残枝） | 两条非祖先命中均判残枝：b2-uc025-wiring（承判）+**line/sse-notify-push 新条目**（tip `49535514` 2026-10-08 早于基线 7 日·blob 旧形纯落后·零基线后新增提交） | §0.0 附表扩两条 |
| docs cap | ≤2128 | ≤**2136**（`public-text-policy.mjs:75`·并线带入 perfload 续作 45fb6196） | 按 brief 口径承 cap 2136 |

## 5. 偏离清单

六条，全文见 REQUEST 卷 §9 偏离清单（门 4 裸形入口改隔离包装同靶/delta 20→21 臂数勘误 blob 三点恒等/门 3 PASS 名单载体口径/门 2 双跑留痕非冲销/门 11 协议载体口径/neg 404 臂全绿归因注未触发）。

## 6. pins 零翻声明

十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。Ban 列表零触。

## 7. markers 扫描回执（词面不入卷）

- 命令形：四标记词运行时字符拼接（`['T','O','D','O'].join('')` 等四组）+冲突标记对正则，对改动集（4 tracked .ts + 本卷 .md + 收据目录全文件）逐文件 `includes`/正则扫描。
- 回执：**EXIT=0·hits=0**（零新增命中·收据落卷后复扫含本件）。
