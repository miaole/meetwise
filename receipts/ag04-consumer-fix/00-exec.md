# AG04-CONSUMER-FIX EXEC 收据（件③·2026-10-14·untracked 口径沿 negbend §9）

授权链：pre-exec 双审 BOTH PASS（席1 `agent_eda33b7b`+席2 `agent_80e409c8` 会签·P2×2 折入）→协调方明示 EXEC 授权（committed SHA 重钉=`807ba02e`）→EXEC 落卷本收据。

## 一、门矩阵全表（九门·实跑实测 @merge `6b9191e9` 树）

| # | 门 | 命令 | EXIT | 关键行 |
|---|---|---|---|---|
| 1 | adaptive-consumer:prove（THE） | `pnpm adaptive-consumer:prove` | 0 | `ISOLATED_PROOF_SUMMARY target=adaptive-consumer:prove:raw exit=0 pass_count=35 fail_count=0 failure_class=none` |
| 2a | requeue-backoff:prove | `pnpm requeue-backoff:prove` | 0 | 33 PASS 臂·「AG-04 刀C…全部通过」·族臂数恒等 33 |
| 2b | adaptive-life:prove | `pnpm adaptive-life:prove` | 0 | 43 PASS 臂·「生产主线替换…全部通过」 |
| 2c | reaper:prove | `pnpm reaper:prove` | 0 | 28 PASS 臂·「Reaper…全部通过」 |
| 3 | migrate:prove | `pnpm migrate:prove` | 0 | 「迁移运行器 全部通过」·链 201 头 0201·THE run `applied=201 skipped=0`·零新迁移 |
| 4 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | 0 | `migration_prefix_uniqueness … files=201 violations=0 exemptions=0143,0152,0160` |
| 5 | typecheck | `pnpm turbo typecheck --force` | 0 | `Tasks: 8 successful, 8 total`（0 cached） |
| 6 | lint 三值 | `pnpm turbo lint` | 0 | `Tasks: 12 successful, 12 total`·web `✖ 601 problems (0 errors…)`+api `✖ 1421`+root `✖ 5224` 恰等·零第四红 |
| 7 | docs:check | `node scripts/ai-docs/check-docs.mjs` | 0 | 改前（merge 后·本收据落卷前）`scanned 2110`≤cap 2112·落卷终测 `scanned 2111`≤cap 2112（余 1） |
| 8 | markers 五类 | 改动集 grep（词面运行时组装·同 `i6-239-gates.proof.mjs:151-:163` 形） | 0 | `hits=0`（改动集 5 文件=本卷 .md+proof .ts+收据目录 3 件） |
| 9 | diff 面机检 | `git diff --numstat` | — | 恰 2 tracked 路径=`apps/worker/test/adaptive-consumer.proof.ts` +7/−1 与本卷 REQUEST .md +46/−5·收据目录 untracked·typecheck 翻动 `apps/web/tsconfig.tsbuildinfo`→`git checkout` 回滚（§2-9 预案） |

## 二、EXIT 原值（件② 两 run 各司其职·Ban retry-to-green 恒守）

- 件②① 改前复跑（隔离 runner 恰 1 次）：EXIT=**1**·`pass_count=33 fail_count=2 failure_class=child_exit_nonzero`·receipt `.tmp/isolated-proof-receipts/2026-10-14T21-55-59-171Z-44134-2cb8ea7f-a9a3-4359-8fdf-4e26971a2d94.json`（migrate `applied=201 skipped=0`）。
- 件②① 补充取证 raw 直跑（EXEC 自备一次性 pgvector 容器·非 prove 预算·用后拆）：EXIT=1·33 PASS/2 FAIL·FAIL 两行 byte-for-byte：
  - `FAIL  遗留 payload-only start 在任何图副作用前失败：模型=0、job failed、终态事件恰一条`
  - `FAIL  遗留 payload-only start 走一次既有 paired release，额度精确恢复`
- 件②② THE prove（恰 1 次）：EXIT=**0**·`pass_count=35 fail_count=0 failure_class=none`·receipt `.tmp/isolated-proof-receipts/2026-10-14T21-59-49-207Z-47780-7bc32545-3bb7-48f2-88ef-1040e27f62ae.json`。

## 三、改前改后 PASS 名单 diff（`sort|uniq -c` 协议·分母=件②① 本树改前 raw run 33 名单）

- 改前名单 `01-preflight-raw.log` 33 条·`uniq -c` 零重复行。
- THE prove 隔离 runner 对臂名 stdout 结构性扣留（`ISOLATED_POSTGRES_OUTPUT_WITHHELD`·仪器形制同起草席三件套）——改后名单经 `fail_count=0`（35 全过）+改前 33 名单+两翻绿臂文案联合推证：diff 恰 **2 条**=①`遗留 payload-only start 退避时闸成立且过闸后在任何图副作用前失败：即时 drain=idle、模型=0、job failed、终态事件恰一条`（:294 文案改形翻绿）②`遗留 payload-only start 走一次既有 paired release，额度精确恢复`（:296 文案字节零改·二次 drain 后自然复绿）；其余 33 条零弱化（第 3 条 diff 未出现·停机条件零触发）。

## 四、diff numstat

```
 7	 1	apps/worker/test/adaptive-consumer.proof.ts
```
（对 merge `6b9191e9` 工作树·+7/−1=预期 +5/−1 + 3 注释行容差内；tracked 树其余零改·本卷 REQUEST .md 同 commit 计 2 tracked 路径·收据目录 untracked。）

改形落点三处：`:278` 原 `const legacyResult = await drainInterviewJobOnce(d, OWNER);` 单行→gated drain（`gatedDrainResult`）+内联 backdate（`admin.query("UPDATE interview_job SET next_attempt_at=now()-interval '1 second' WHERE interview_id=$1", [LEGACY])`·语句形照 `requeue-backoff.proof.ts:91`）+二次 drain（`legacyResult`）；`legacyStartContract` 增 `gate: gatedDrainResult === 'idle',`（列于 `result` 前·七→八成员）；`:294` 断言文案改形（判据 `Object.values(legacyStartContract).every(Boolean)` 零变）；`:296-:297`/`:272-:274`/33 绿臂字节零触。

## 五、重 pin 全表

见本卷 §0.4（blob 四值恒等 `a1b89c84`/`7ebdff1a`/`27ddbcf1`/`2dbe7c33`·行数 464/339/657/248 恒等·行锚零漂·迁移链 201 头 0201 恒等·在飞五组残枝零碰撞·docs:check 三值链 2108 裸树→2109 本支→2110 merge 后）。

## 六、偏离清单

1. 改前 raw 直跑+一次性容器自备仪器（起草席三件套同形·非件② 列名 run·不占 prove 预算·「恰 2 run 各司其职」恒成立）。
2. docs:check 改前基线如实三值链全记（P2 单值 2109 之上补 merge 后实测 2110·cap 口径零变）。
3. 零其余偏离：产品码四文件 blob 恒等零触·33 绿臂零触·runner/依赖/CI/SSOT 零触·零迁移零 DDL·无同文件并发。

## 七、pins 零翻声明

十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## 附：本目录文件

- `00-exec.md`（本收据）
- `01-preflight-raw.log`（件②① raw 直跑全文·33 PASS/2 FAIL）
- `02-the-prove-isolated.log`（件②② THE prove 隔离 run 全文·35/0）

*est live=0（proof 全程 scripted 假体·零模型外呼·本地容器属本地基建）·markers=0·⛔push*
