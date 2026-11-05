# SMALL-FIXES-1105 REQUEST — meetwise 小项批九件（普查门提取器 + 台账残面小件 + 证据面迁移 + SSE 留痕）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-11-06 落卷 · 九项工作已按派单令随刀行使并逐项独立 commit（清单见 §9）· pre-exec 双审两独立外席待派 · alone≠dual · Dual PASS ≠ 开工 · Ban self-approve · est live=0 · markers=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase · 状态四处同值=本行+§8+文末 STOP+卷尾摘要）
**Date**: 2026-11-06
**Base**: origin/main `92a82a944`（#209 perf-status-pin 并线点 · fetch EXIT=0 亲证 · worktree `meetwise-xs` · branch `line/xs-draft`）
**pins 十一值**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（照抄零翻）
**cap**: CAP-SANCTION-2487 恰等步进 2486→2487（两 policy 脚本四联动点随本卷起草 commit 恰等改·链注 append·既有注记零洗·详 policy .mjs 链区同注记）

## §0 现状（main `92a82a944` 现值 file:line · 亲读复核）

| # | 项 | 现状（file:line） |
|---|---|---|
| 1 | 普查门提取器 | `scripts/ai-docs/request-status-recon.mjs:66-67` 硬编码 `EXPECTED_VOLUME_COUNT=274`+默认 ref `e647fcffa`；HEAD 287 卷被 census drift guard 拒绝 EXIT=1（亲跑）；rc 后四种关闭注（`有效态翻面→`态字`` / `【关闭…STOP 收口 `closed`` / `【闭卷注|【归档注…本卷登记】` / `终值裁定=`）不识别——287 卷被伪读为 executed/无状态行 |
| 2 | L-02 | `apps/web/test/web-logic.proof.ts:1984-1985`（现树行号·普查表 :1949-1956 已漂）`!quizSrc.includes(maybeFollowUp)` 全文件级负断言——任何含「可能追问」的无害注释行即误杀（变异亲证红） |
| 3 | L-03 | `apps/web/lib/stream/business-events.ts:123-128` 未知 kind 走 `safeParse` 失败→null 降级；`score_card_written`（0103 写卡函数持久 kind·0202 入 `ck_interview_event_kind` 值域）SSE 重放透传到前端时只有泛型 `nope` 假名测试（web-logic.proof :225），无真实 kind 的显式降级测试 |
| 4 | L-04 | `scripts/ha/ha6-companion.proof.mjs:405-414` 工作树双读臂**已在树**（2026-10-26 micro-batch2 `7db0a99da` 落·普查表陈旧）——复核时发现新残面：scripts-set digest 登记 `cc72940df@8f2fdb83c` ≠ 现值 `d7540d569`（HEAD=工作树恒等·10-26 后诸刀纯增 63 键 0 删漏补审·key-level diff 亲证·proof 账门臂红） |
| 5 | L-11 | `turbo.json` 无 daemon 配置（默认开）；串扰事故先例 `receipts/evkind-scorecard-fix/00-exec.md:87`（turbo 2.10 首跑 cwd 串根姊妹 worktree 298 外树路径） |
| 6 | GAP-EVAL-PARSER-DETAILS-UNCLOSED | `scripts/lib/uc-covered-real-gatherer.mjs:553-554` `dualFromReviewFiles` 对角色+作者匹配但解析失败的 reviewer 文件静默 `continue`（槽位 null 无任何点名）；`diagnoseReviewFile`（:477）自钉「test-only·dualFromReviewFiles never calls it」（EVAP 本体已闭 PR #184·残面=生产路径无诊断出口） |
| 7 | #95 | `ops/deploy/remote-deploy.sh:47` 仅 `trap restore_and_fail ERR`——HUP/TERM/INT 终止不回滚，`.env` 停在半部署态（变异 harness 亲证：TERM 后 exit=143、env 残留新镜像行） |
| 8 | #169+GAP-DEBT-BE-R4SCRIPTS | `apps/worker/src/` 下 `cloud-test-fc.ts`(129 行)/`cloud-test-run-ledger.ts`(378)/`cloud-test-serial.ts`(517)/`production-equivalent-funnel-08-eval.ts`(377) 共 1,401 行；src 内生产入口零 import（唯一链=fc 测试构建入口 `apps/worker/fc/cloud-test-handler.ts:1`+4 proof+1 smoke+evidence 一件），r4-* 31 件先例已迁 `apps/worker/evidence`（`.dockerignore:17` 镜像排除在案） |
| 9 | #57 | `apps/api/src/platform/all-exceptions.filter.ts:16` `reply?.sent/headersSent → return`（SSE 已劫持/已发即静默）；`apps/api/src/platform/sse-pump.ts:197-219` fetchRejected 分支 destroy+rethrow 无日志——取数失败不可见（census 线索逐项复核成立） |

## §1 改动（逐项一 commit · 一行大白话）

| # | commit | 改动 |
|---|---|---|
| 1 | `d42f7390d` | 提取器：`EXPECTED_VOLUME_COUNT`/274 锚定撤除→默认 ref `HEAD` 受管面动态枚举+防漏门（raw 六锚与注记终值两读全空=未被任何锚读到→逐卷点名 EXIT=1·报告先出后裁决故历史 ref 仍可读）；parseFlipLine 显式赋值标记层（`终值裁定`/`有效态翻面`/`STOP 收口` 先于链形·闭卷注/归档注零态字特殊形）+readTerminal 三层裁决（终值裁定>有效态翻面>位序末条）+四种触发旗（closeNoteFlip/reconFlip/stopCloseNote 并入翻面条件） |
| 2 | `6e89f5fbc` | L-02：231a 断言收窄为「备战提示文案行逐行不含旧字面量」键级（quizTipLines/dashTipLines 行滤+every） |
| 3 | `c6fe61ee7` | L-03：web-logic.proof 补两断言——真实 kind `score_card_written`→null 降级丢弃+降级不挡后读事件序列 |
| 4 | `7975c266b` | L-11：`turbo.json` 顶层 `"daemon": false`（turbo 2.10 接受·run 路径已不用 daemon 的弃用警告如实承登·3.0 移除键时随升级清理） |
| 5 | `43e11f15b` | GAP 诊断出口：`dualFromReviewFiles` 解析失败分支 stderr 点名 `unparseable reviewer file <path>: reason=<reason>`（语义零变·槽位仍 null）；docstring 更新；proof 补双臂（诊断行+reason 断言/parseable 静默断言） |
| 6 | `945529359` | #95：`restore_and_fail` 防重入（trap 自撤）+快照存在守卫；`trap restore_and_fail ERR HUP TERM INT`；成功路径清四 trap；`--self-test` 沙箱自测（TERM/INT/HUP/none 四臂·桩 compose·真信号）；`DEPLOY_PROJECT_DIR` 环境注入缝（生产默认 `/srv/meetwise-compose` 零变） |
| 7 | `b80d11f47` | #169/R4SCRIPTS：四件 `git mv` src→evidence（内部相对 import 链同目录零改·`cloud-test-serial` 对留 src 的 `cloud-readiness` 改 `../src/`）；6 处外部 import 更新（fc handler/3 proof/smoke/evidence 邻件）；2 处收据模板串同步；package.json 脚本零改（脚本指 test/ 与 build 脚本·路径不变） |
| 8 | `af55b8b01` | #57：sse-pump fetchRejected 出口结构化日志 `sse_fetch_rejected`（streamKey/lastSeq/name/message/stack·零 payload/PII·`reply.log` pino 单源·无 pino 退 stderr）；sse-delta-arm proof 补单元臂（纯单元缝可直跑） |
| 9 | `a24634931` | L-04 二次补审：scripts-set digest `cc72940df@8f2fdb83c`→`d7540d569@af55b8b`（计算式唯此一条对 HEAD 复算·key diff 纯增 63 键 0 删亲证·旧值退役留痕·四点恒等臂翻绿） |

## §2 验收（逐项：改前红/改后绿亲跑，或静态理由）

| # | 改前红 | 改后绿 |
|---|---|---|
| 1 | `--ref=HEAD` EXIT=1 `census drift: … 287, expect 274`（亲跑） | EXIT=0 287 卷；有效态 closed 268/proofed 18/post_prove 1/executed 0/无状态行 0=普查席 B 手工补读逐值吻合；非 closed/proofed 清单=仅 uc017（post_prove_dual_pass·翻面权归协调方）；基线 `--ref=e647fcffa` 两读差异数值（31=25+1+1+2+1+1+0）与改前逐字节恒等+漏门如实红（g7-enoent-fix 补注前无状态卷·header 注记载明） |
| 2 | 变异亲证：QuizPanel 追加无害注释「模型可能追问原理」→ 231a FAIL（地雷） | 同变异 PASS（地雷解除）；旧话术回写文案行 FAIL（守门仍咬）；原树全绿 |
| 3 | 断言缺席（无红可跑）·临时改 `toBusinessEvent` 未知 kind 透传→新断言 FAIL 7 项（可证伪性亲证） | 还原后全绿（2 新断言 PASS） |
| 4 | 静态：配置缺席+事故收据在案 | `pnpm turbo run lint --filter=@meetwise/contracts` EXIT=0；CI `--dry=json` 解析面 8 任务恒等；配置接受（schema 合法） |
| 5 | node 直驱 pre-fix：槽位 null+stderr 0 字节（静默吞亲证） | post-fix：stderr 147 字节 `unparseable reviewer file …: reason=unclosed-details`+槽位仍 null；宿主 proof 补双臂（DIRTY_TREE 卫兵致全量 proof 需净树·净树后跑因缺失**非跟踪**收据 `2026-09-23-uc-e2e-018-sole-stack-pg-retained-evidence.json` crash——HEAD~1 同码同 crash=既有环境红与本刀无关·臂级行为证据以 node 直驱承载） |
| 6 | 变异 harness 亲证：TERM 后 exit=143+`.env` 残留新镜像行（半部署态） | `bash ops/deploy/remote-deploy.sh --self-test` 4/4 臂 PASS（TERM/INT/HUP：非零退+env byte-identical 恢复+回滚 up 恰一次；none：exit 0+新镜像行落位） |
| 7 | 迁移前=src 含 1,401 行证据件（census 现值） | worker typecheck EXIT=0；`prove:cloud-test-serial/ledger/fc` 三绿；`build:cloud-test-fc` EXIT=0（esbuild 新链）；funnel-08 proof 失败集合与迁移前 stash 复跑恒等（6 FAIL 行·缺非跟踪 harness 卷=既有环境红零新增）；src 四件计数=0+`.dockerignore:17` evidence 镜像排除在案（构建产物双保险） |
| 8 | 单元臂先行落断言→delta-arm proof FAIL（红亲证） | pump 补日志后同一臂 PASS+全卷 EXIT=0 21+2 PASS（tsc 对 `logCalls[0]` noUncheckedIndexedAccess 三报错随收口归零） |
| 9 | proof 账门臂红：`digest HEAD got=d7540d569 … want=cc72940df`（main 现树亲跑） | `PASS … four-point identical (HEAD=d7540d56 worktree=d7540d56 registered=d7540d56)`（ha6 全量 EXIT=1=三既登邻面基线红 principal:946/docker EXIT=125/pgbouncer 负断言·与本账门无关如实注） |

静态理由项：#4（turbo daemon 串扰为多 worktree 运行态事故，本会话单 worktree 无复现条件——配置接受+CI dry 形状恒等+事故收据承登）；#7 构建产物不含（Dockerfile `COPY apps/worker` 上下文受 `.dockerignore:17` 排除+src 迁空双保险·不另起 docker build）。

## §8 停止条件（四类全设 · 零触发 · 状态=**`draft:awaiting_pre_exec_dual`** 与 Status 头同值）

- **现场漂移**：本卷各 §0 锚对 base `92a82a944` 亲读成立；执行期若 file:line 漂移则停（实际：L-02 锚 :1949→:1984 漂移=前刀行数位移·机制同形亲证后按现值落刀如实登记）。
- **机制不满足**：修复后验收红且口径内不可修→停（实际：funnel-08/uc-e2e-018-criterion 两 proof 既有环境红均以 stash 复跑恒等承登零新增·未纳入本刀口径强修）。
- **越界需要**：零触（未碰禁改面/他仓；receipts 产物由 proof 误写部分已还原——matrix.md checkout 还原+五件未跟踪收据 rm·如实注）。
- **验收红不可修**：仅既登通道红（ha6 三邻面基线红/两 proof 缺非跟踪物红）·各归既登通道零新增。

## §9 记录

- commit 链（base `92a82a944` 起·每项一 commit·一行大白话）：`d42f7390d`→`6e89f5fbc`→`c6fe61ee7`→`7975c266b`→`43e11f15b`→`945529359`→`b80d11f47`→`af55b8b01`→`a24634931`→本卷+cap 步进 commit。
- cap：CAP-SANCTION-2487 恰等步进 2486→2487 随本卷起草 commit 兑现（两 policy 脚本四联动点 2_487/f-2487.md/:2488 恰等改+链注 append·既有注记零洗）。
- 派单简报九项逐项对账：1/2/3/4/5/6/7/8/9 全行使零跳过；L-04 按「机制已在树+残面=补审重注册」如实拆解行使；六号项（GAP-EVAL-PARSER-DETAILS-UNCLOSED）残面按 EVAP 卷自钉「诊断出口面拆后续刀」兑现。
- 偏离登记（零项理想·如实两笔）：①L-02 普查锚行号漂移（机制不变行号位移·§8 漂移条款亲证后按现值行使）；②#9 号项落在两 proof 的分工（sse-push-notify 需隔离 PG 本会话不可直跑→断言落纯单元 sse-delta-arm·push-notify 未触）。
- 门读数：docs EXIT=0 scanned 2487=cap 恰等（本卷起草后亲跑）/PTP 12/12 EXIT=0/markers 改动集 0/arch、provider-egress、e2e-static-guards 终验见门读数节。
- est live=0 · actualSpendCny=null · 迁移号=零 · ⛔push ⛔动主仓

STOP: `draft:awaiting_pre_exec_dual`（本卷起草落卷即停 · pre-exec 双审两独立外席待派 · alone≠dual · Ban self-approve · Dual PASS ≠ 开工 · 翻面/关账权归协调方）

---
*卷尾摘要：SMALL-FIXES-1105 REQUEST · 2026-11-06 落卷 · **`draft:awaiting_pre_exec_dual`**（九项随令行使逐项独立 commit 在 branch `line/xs-draft` · pre-exec 双审两独立外席待派 · alone≠dual · Ban self-approve · est live=0 · actualSpendCny=null · pins 十一值照抄零翻 · markers=0 · cap CAP-SANCTION-2487 恰等步进随卷 · ⛔push ⛔动主仓 · 翻面/关账权归协调方）*
