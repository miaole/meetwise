# REQUEST — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Expert**: `mw-e2e-ha`
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

## 范围 / 背景

Line SS2 · docs-only REQUEST（§3 loop 第③步）· 兑现 N 线 `a778255` 遗留的「SOLE_STACK 对齐另包」。现状（基线 `50423a6f` 实读）：`scripts/run-e2e-isolated.mjs` 三常量 `SOLE_STACK='mysql-qdrant-redis'`（`:1845`）/ `LEGACY_STACK='pgvector-legacy'`（`:1846`）/ `SOLE_APPROVED_FIXTURE_CONFIG='compose.mysql-local'`（`:1848`）；R5-MARKED-RED 字符串（现 `:1936-1940`）已由 Line AL `c633584` 对齐为「dual-track code-path label ≠ product stack truth」，余留 = 文件头 `:5`「Intended sole default = mysql-qdrant-redis (MySQL+Qdrant+Redis)」注释 + 常量命名/值面（ADR `:39` 点名 residual）。**消费点结论（待审）**：`SOLE_STACK` 非 pure 文案——3 个 fail-closed 分支入口（`:1854` EXIT=2 · `:1881` G3 块 · `:2282` defense-in-depth，均 EXIT=3）+ env 注入分支（`:2202-2206`）+ receipt 字段（`:2243`）的判定/数据值；改值/改名波及 ≥5 个 prove 扫描器（g1 标识符正则、conn-stack r5-mark-red `:191` 值字面量、adapter proof `:131`、g3 spawn 值、package.json:283/285 alias）。**先在缺陷披露**：`conn-stack:r5-mark-red:prove:182` 门锚定 AL 前字面量 `NOT sole-stack truth`（已不存在），基线静态预计 EXIT=1——未运行（Ban prove），修复须显式授权。**行为语义裁决（`SOLE_STACK` 是否被 G3 fail-closed / fixture gate 消费、方案取舍）交双审。**

方案候选（细节与利弊见 harness §2）：**(a)** 纯文案对齐（仅 header 注释，零标识符/值/控制流触碰）；**(b)** 常量改名+全消费点同步（blast radius 大，需另立授权与回归计划）；**(c)** 诚实保留+仅 post-align 阶段 backlog 更新。提议默认 (a)，任一方案被双审砍掉即不做。

## prove 方案（执行阶段 · 本 stub 零运行）

`node --check scripts/run-e2e-isolated.mjs` EXIT=0 + 受影响 prove 回归复跑清单（g1-default-switch:prep / g3-e2e-pg-image 预期 EXIT=0 不变；conn-stack:mysql-stack `r5-mark-red` 双 alias 基线预期 EXIT=1 先在红——未授权修复则 documented-red 原样入账，授权修复则改后 EXIT=0 并记 diff 与授权出处；compose 依赖族与 qdrant adapter 双审未要求则 named-not-run）。EXIT 契约：任何基线绿→执行红 = STOP；attempts 全记录；Ban retry-to-green · Ban 洗白 · Ban 以 `node --check` 替代清单复跑；全刀零 e2e 运行、零新 receipt。

## 禁碰 / Ban（逐条）

1. **Ban coding**（本 REQUEST 零 scripts/ 触碰；授权后执行仅限双审放行方案范围）· **Ban prove**（零运行）· Ban push / force-push / self-approve / secrets / `.env*`。
2. **Ban 改 e2e 断言与其他 prove 面**（g1/g3/r5-mark-red/adapter prove 文件零触碰，除 §3 先在红显式授权修复）。
3. **Ban 触碰 `E2E_ISO_STACK_NOTE`（`:2312-2313`，Line N narration-only 产物）**。
4. **Ban SSOT edit**（matrix / backlog `:63` / execution-master-checklist 本 commit 零改动）。
5. **Ban 把对齐写成 sole cutover / MySQL 切流暗示**；Ban 改 `adr-postgres-retained.md` Decision 本体（L7-14 逐字不动）；Ban 碰 UC-018/052/25/004 行与 `coveredCount=8`。

本 stub 不是 nail、不是 HA、不是 covered、不是 cutover 授权。

## 流程

本 stub 为 pre-exec 审查入口：`mw-e2e-ha` PASS + `mw-privacy-int` PASS（**BOTH**，alone ≠ dual）→ 协调方（meetwise bot）显式授权 coding（点名方案取舍与先在红处置）→ 实现方按授权执行 → post-align docs supplement + post-align 双审另起。本 commit 本身不运行任何 e2e / prove。

---

*Stub · awaiting expert pre-exec dual · STOP*
