# TTL-WIRE EXEC receipt（#18 payload TTL 清理原语接线·席=EXEC·2026-10-12）

分支 `line/ttl-wire` · 树 `meetwise-ttlwire` · 开工 HEAD `6b70f770`（REQUEST rev2·双审 BOTH PASS+协调方常设 loop 授权）· ⛔push（本卷零 push）· est live=0（全门假体/静态/隔离库·零模型外呼）· pins 十一值零翻。

## §0 并线重 pin（merge `feat/mysql-schema-skeleton` @`d12439d8` → merge commit `42b3b036`·零冲突 EXIT=0）

| 锚 | REQUEST rev2 值 | 新 HEAD 实测 | 判定 |
|---|---|---|---|
| `interview-jobs.ts` blob | `775a9336` | `775a93361e5d…` | 逐字节不变·行锚 :260-265/:266-279/:281-282/:284-293/:294-308 全吻合 |
| `interview-consumer.ts` blob | `787f23fe` | `787f23fe0733…`（570 行） | 逐字节不变·:7/:523-525/:526-540/:527/:528/:529-536+537/:542-565/:548/:551/:568-570 全吻合 |
| `authz5a2-stale-payload-ttl.proof.ts` blob | `c92e1e64` | `c92e1e6416a0…`（116 行） | 逐字节不变 |
| `index.ts` :126 barrel | `3fa6f9a8` | `3fa6f9a8`·:126 吻合 | 不变 |
| `reaper.proof.ts` :15/:86 | `48c690c0` | `48c690c0`·:15/:86 吻合 | 不变 |
| `main.ts` 佐证锚 | :30 import / :643 调用 | **:31 / :639** | 行号漂移·与审席2 预判一致·结论不变只更行号 |
| `db/package.json` :26 门名 | blob `91eb0b2f` | **blob `47684d82`**·:26 `prove:authz5a2-stale-payload-ttl` 逐字不变 | blob 漂移行锚不变（附记：isolated wrapper target 名=`authz5a2:stale-payload-ttl:prove`·run-e2e-isolated.mjs:102/:2189 亲证——同物第三名·0.2-2 勘误补注） |
| checklist R-1 行 | blob `7356acfd` :2268/:2276 | **blob `5e7c2d88`**·:2268/:2276 位不变（R-1 行逐字在） | 只读引用面·blob 漂移系主线 5E 收编 append·非本刀触 |

rg 全仓 `purgeStaleInterviewJobPayloads`（施工前）恰 5 命中（定义+export+prove×3）·生产调用点=0 红事实在新 HEAD 复现成立。

## §1 施工（恰一文件两处·`apps/worker/src/interview-consumer.ts` 787f23fe→885b5993）

1. `:7` import 行补名 `purgeStaleInterviewJobPayloads`（`sweepStuckInterviewJobs, ` 后紧邻·沿既有巨型 import 形）。
2. `:537`（原 `:536` 循环收尾 `}` 与原 `:537` return 之间）接 `await purgeStaleInterviewJobPayloads(c, owner);`+行尾注（asPrincipal 域内·同事务·rev2 口径注释）。
   diff=2 insertions(+),1 deletion(-)·零新配置/env 闸/定时器·原语函数体零字节（见 04-zero-byte-diff.log）。

## §2 断言门全表（§2 全跑）

| # | 门 | 命令 | 结果 | 收据 |
|---|---|---|---|---|
| 1 | 17 臂回归原值 | `node scripts/run-e2e-isolated.mjs authz5a2:stale-payload-ttl:prove`（=pnpm -C packages/db prove:authz5a2-stale-payload-ttl 隔离包装） | **EXIT=0·17 PASS 全绿原值**（迁移链1+假时钟前提1+fixture2+臂①前置1+臂①5+臂②2+臂③4+幂等1=17·逐臂对账） | 01-*.isolated-receipt.json |
| 2 | 新接线臂 A+B 双形 | `pnpm -C apps/worker prove:reaper-purge-wire`（A=假池 spy 驱动真实 reapStuckInterviewJobs→真实原语·B=静态源断言） | **EXIT=0·16 臂全 PASS**（①可达恰一3 ②参形默认TTL3 ③事务域次序2 ④静态8） | 02-gate2-reaper-purge-wire.log |
| 2n | 负臂（§2-3 补·推荐置位·rev2 口径） | 临时件 `apps/worker/test/_neg-ttlwire-transient.proof.ts`（**不落卷·跑后即删·卷内零存**） | **EXIT=0·5 臂 PASS**（purge 注入抛错→整拍拒绝+ROLLBACK 在场+COMMIT 缺席+purge<ROLLBACK+下拍愈合返回原形） | 本节文字登记（卷内零码痕） |
| 3 | 零行为回归 | `pnpm reaper:prove`（wrapper `reaper:prove:raw`） | **EXIT=0·30 臂全 PASS 原值**（requeued/failed/退款/事件计数零变·真库全链现携 purge 调用·purge 未超龄零命中）+`git diff 7500ac73 -- interview-jobs.ts`=0 bytes+quiz 镜像=0 bytes | 03-*.isolated-receipt.json+04-zero-byte-diff.log |
| 4 | typecheck | 权威形 `pnpm turbo typecheck --force` | **EXIT=0·3 successful/3 total·0 cached**（与 5E 主线收据 checklist:2317 同形同值） | 06-typecheck-apivalidate.log |
| 4' | worker 直调形附记 | `tsc -p apps/worker/tsconfig.json --noEmit` | 基线同红：stash 对照 47=47 错·本刀两码面+新测件 0 错·零新增（该形非仓权威门·如实登记） | 06 同上 |
| 5 | api:validate（非硬闸） | `pnpm api:validate`（隔离壳） | **EXIT=0**·末段「✓ 全部通过（真 NestJS+Fastify+类型DI 结构）」·全量 PASS 计数未捕获（管道 tail 截断·如实登记） | 06 同上 |
| 6 | markers=0 | 五类标记词扫描（冲突/fake-green/门弱化/遗留标/secrets 样值）×本刀三件 | **五门全 EXIT=1=零命中** | 05-markers-estlive.log |

## §3 双声明

- **est live=0**：门1/2/3=隔离库（临时 `meetwise-e2e-*` 容器·wrapper 自建自清）/进程内假池/静态源断言；门4/5=本地构建与隔离壳。零模型外呼·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源）。
- **markers=0**：见门 6。
- ** pins 十一值零翻**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §4 越面自查

本刀码面=恰 2 文件 3 处（consumer 两处+worker package.json 1 行 prove 注册）+新测件 1 件+receipts 1 目录+REQUEST 随翻。零迁移/DDL/新存储面·零 quiz/diagnosis 触（quiz-jobs.ts 0 bytes）·零 API/前端/e2e 产品面·零共享 SSOT 翻（LEDGER/checklist 只读引用）·零原语字节动。
