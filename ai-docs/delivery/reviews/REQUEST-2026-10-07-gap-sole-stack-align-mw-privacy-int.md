# REQUEST — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Expert**: `mw-privacy-int`（PG-retained 属隐私/栈域故入双审 · privacy/INT 前置焦点：栈真相对齐 ≠ 擦除/RLS/DELETE 面任何松动）
**Knife**: `harness/gap-sole-stack-align.md` · slice `gap-sole-stack-align.slice.md`
**基线 tip**: `50423a6f`（full `50423a6fa6f18d4c9d193611cf84c4702e067208` · fetch 成功 · docs tip · not a prove tip）
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-ss2` · `line/ss2-sole-stack`
**Date**: 2026-10-07

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| 公开 DELETE | **503**（stays） |

## 范围 / 背景（privacy/INT 视角）

Line SS2 · docs-only REQUEST（§3 loop 第③步）· 兑现 N 线 `a778255` 遗留「SOLE_STACK 对齐另包」，目标面 = `scripts/run-e2e-isolated.mjs` 三常量（`SOLE_STACK='mysql-qdrant-redis'` `:1845` / `LEGACY_STACK='pgvector-legacy'` `:1846` / `SOLE_APPROVED_FIXTURE_CONFIG='compose.mysql-local'` `:1848`）与 R5-MARKED-RED 字符串对齐 `adr-postgres-retained.md`（keep Postgres / `PostgresSaver` / pgvector · L9-11 · Non-claims L39 点名 residual = header `:5` + `const SOLE_STACK`）。banner 字符串本体已由 Line AL `c633584` 对齐；本刀不重开 AL 已 closed 的措辞面。

**privacy 域消费点披露（待审）**：`SOLE_STACK` 是 3 个 fail-closed 分支入口（`:1854` 未知栈 EXIT=2 · `:1881` G3 块入口 · `:2282` defense-in-depth 拒 docker-run PG image，后两者 EXIT=3）+ sole env 注入分支（`:2202-2220`：注入 MySQL/Redis/Qdrant 端点、**删除 `PG*` 全系与 `E2E_PG_IMAGE`**）+ allowlist receipt 字段（`:2243`，receipt 自带 `releaseEvidence:false` · `notHa:true` · `claimsForbidden[9]`）的判定/数据值——**G3 fail-closed 与 fixture gate 确实消费该常量**；改值即改 fail-closed 匹配语义与 receipt 内容，改名牌波及 ≥5 个 prove 扫描器（细节 harness §1.5）。

**privacy 红线确认（本刀不改、请审方复核）**：公开 `DELETE /privacy/interview-data/:id` = **503** 冻结不变；PG-retained / RLS / `asPrincipal`+`set_config` 授权根不变；UC-052 external=`retention_pending`、`:60`/`:64` stays OPEN、UC-052 stays partial 不变；本刀对齐**不构成**任何擦除、RLS、公开写面、栈切流的证据或授权；`coveredCount=8` 不变、不得写 covered。

方案候选（利弊见 harness §2）：**(a)** 纯文案对齐（仅 header 注释）· **(b)** 常量改名+全消费点同步（需另立授权）· **(c)** 诚实保留+仅 post-align backlog 更新。提议默认 (a)。**先在缺陷披露**：`conn-stack:r5-mark-red:prove:182` 门锚定 AL 前字面量 `NOT sole-stack truth`，基线静态预计 EXIT=1（未运行 · Ban prove）；未授权修复则 documented-red 原样入账，**Ban 借本刀夹带修复、Ban retry-to-green、Ban 洗白**。

## prove 方案（执行阶段 · 本 stub 零运行）

`node --check scripts/run-e2e-isolated.mjs` EXIT=0 + 受影响 prove 回归复跑清单与 EXIT 契约（harness §4 全表）：g1 / g3 预期 EXIT=0 不变；r5-mark-red 双 alias 按先在红处置协议记录；compose 依赖族与 qdrant adapter 双审未要求则 named-not-run。attempts 全记录（含失败与放弃项）；任何新增红 = STOP；全刀零 e2e 运行、零新 receipt。

## 禁碰 / Ban（逐条）

1. **Ban coding**（本 REQUEST 零 scripts/ 触碰）· **Ban prove**（零运行）· Ban push / force-push / self-approve / secrets / `.env*`。
2. **Ban 改 e2e 断言与其他 prove 面**（g1/g3/r5-mark-red/adapter prove 文件零触碰，除先在红显式授权修复）。
3. **Ban 触碰 `E2E_ISO_STACK_NOTE`（`:2312-2313`，Line N narration-only 产物）**。
4. **Ban SSOT edit**（matrix / backlog `:63` / execution-master-checklist 本 commit 零改动；gap 不 flip、不写 covered）。
5. **Ban 改 PG-retained pin 本体**（`adr-postgres-retained.md` Decision L7-14 逐字不动）· **Ban 碰 privacy 面**（公开 DELETE=503 冻结、RLS、0091/0125 主链、UC-052 行、erasure prove 族零触碰）· Ban 把对齐写成 sole cutover / MySQL 切流暗示 · Ban 碰 UC-018/052/25/004 行与 `coveredCount=8`。

本 stub 不是 nail、不是 HA、不是 covered、不是 cutover 授权。

## 流程

本 stub 为 pre-exec 审查入口：`mw-privacy-int` PASS + `mw-e2e-ha` PASS（**BOTH**，alone ≠ dual · 不代签 peer）→ 协调方（meetwise bot）显式授权 coding（点名方案取舍与先在红处置）→ 实现方按授权执行 → post-align docs supplement + post-align 双审另起；backlog `:63` 只在彼时按彼时授权更新。本 commit 本身不运行任何 e2e / prove。

---

*Stub · awaiting expert pre-exec dual · STOP*
