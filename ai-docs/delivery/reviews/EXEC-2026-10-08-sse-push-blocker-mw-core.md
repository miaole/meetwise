# SSE-PUSH · EXEC 阻断备忘录（mw-core 实现方 STOP 升级 · 零码）

status: **`blocked:awaiting_coordinator_adjudication`**（预执行双审双 PASS 后 · EXEC 授权指令③与④结构性互斥 · 未写任何产品/迁移/proof 字节 · worktree clean @ `407e5afe`）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. 事实

- EXEC 授权（协调方）③ 钉死 `Promise.race([notify, sleep(30s)])` 兜底（且授权 commit 题名 "30s fallback only" · 对表 B6「轮询仅兜底 ≥30s」）；④ 同时钉死「三既有 SSE 证明复跑绿」（未授权修改任何既有 proof/仪器）。
- **二者互斥，证据三重锚定（行号亲算 @ `7135f615` tip）**：
  1. `apps/api/test/sse-principal-slot.proof.ts:174-176`——`sleep(2100)` 后断言 `polled === 5`（5 条 held 连接在空闲 hold 窗口内各恰 +1 次 DB 取数）。该 proof 的 DB 是 **counting stub**（`:45` asPrincipal 恒返 `{rowCount:1,rows:[]}`，**无 Postgres 存在**）→ LISTEN/NOTIFY 在该环境结构性不可能，通知永不触发 → 30s 兜底下窗口内取数 = 0 → `0 ≠ 5` 红。**任何迁移/runner/harness 手段都无法补救（无库可装 trigger）**。`:183-184` 同理依赖周期取数语义。
  2. `apps/api/test/uc-e2e-010-sse-resume.proof.ts:220-222`——R4 窗 2800ms 等 `: ping`（`:220` 注释明文 "controller sleeps 2s then sends `: ping`"）；30s 兜底首 ping 于 30s → 红。`:241-242`——R-mid 400ms 注入、7500ms 窗内须收 seq=6,7 **事件帧**；30s 兜底 → 红。且该环境 trigger 不可能在场：`_neg-harness` 装载 `packages/db/sql/01_schema.sql:7`（`DROP TABLE IF EXISTS … interview_event … CASCADE`）——runner 迁移步先装的任何 trigger 在 harness 建库时即被 DROP 摧毁（uc010 亦不在 runner 全量迁移白名单内，现状即无迁移装载）。
  3. `last-event-id.proof.ts`（36 行纯解析单测）无冲突 ✓——三证明中唯一可复跑绿者。
- mw-core 责任披露：REQUEST §4/§5 已披露「静默 ping cadence 2s→30s」，但**未识别 sse-slot 的 2s 周期取数计数断言与 uc010 R-mid 帧窗断言对旧 cadence 的硬耦合**——预执行双审（双 PASS）与 mw-core 三方均漏检，本备忘录为该漏检的第一登记。

## 1. 选项菜单（交协调方裁决）

- **Opt 1（mw-core 推荐）· 通道健康分级兜底**：共享 LISTEN 通道「健康」判定 = LISTEN 已连接 **且** establish 时一次 `pg_trigger` SELECT 实证 `interview_event_sse_notify` trigger 在场（每连接一次，非每 SSE）。健康 → notify 主推 + 30s 兜底（B6 合规 posture，生产常态）；**退化**（LISTEN 失败/断连或 trigger 缺席）→ 逐连接回落 legacy sleep(2000) 轮询 + 一次性 warn 日志（fail-open 回旧行为，D6c 由「变慢」改「回旧」）。两 proof 环境按构造即退化（stub 无库 / harness DROP 后无 trigger）→ 不改一字复跑绿；生产/已迁移环境 → 30s 兜底。P-2 prove 面扩退化臂断言（2s cadence 实证 + 健康翻转）。**改动面仍在授权触面内（pump/LISTEN 模块内部逻辑），无 proof/仪器触碰。**
- **Opt 2 · 保 30s 钉 · 授权改两 proof 时序窗**：仪器变更，须重走预执行双审（破坏「未修改复跑绿」前提；NHP-028 仪器纪律高危面）。
- **Opt 3 · 保 30s 钉 · 两红 retained + 台账登记**：直接击穿④授权绿门，最差。

## 2. 状态与保证

- 本 commit 零产品码/零迁移/零 proof 字节；worktree `meetwise-line-ssepush` @ `407e5afe` clean；基座已核实 `origin/feat/mysql-schema-skeleton`=`7135f615`（≥`7135f615` 达成 · 待裁决后 EXEC 首 commit 时重钉 rebase）。
- 已就绪待裁决即实施（零返工）：0143 迁移内容（0133 蓝本镜像）、sse-notify 模块蓝本（job-wakeup-listener 生命周期复制 + `Map<streamKey,Set<waiter>>` router + 败者计时器 unref）、sse-pump util（三控制器去重 · 终态集合参数化）、新 proof 骨架（自装真实 0143 内容实证 P-5，规避 harness DROP——proof-local 迁移内容装载系 uc010 0058 stub 先例）。
- Ban 全程生效（wakeup 五 blob/事件表本体/Last-Event-ID/每 SSE 连接/secrets/仪器零触碰/force-push）。
- alone ≠ dual · not coding · not proven · not run · `actualSpendCny=null` · **STOP awaiting coordinator adjudication（Opt 1/2/3）**
