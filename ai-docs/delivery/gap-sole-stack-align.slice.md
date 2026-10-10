# Slice — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包**（Line SS2 · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Date**: 2026-10-07
**Base**: `origin/feat/mysql-schema-skeleton` · `50423a6fa6f18d4c9d193611cf84c4702e067208`（fetch 成功 · docs tip · not a prove tip）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban push · Ban self-approve · Ban secrets / `.env*`

## One-line

Line SS2：兑现 N 线 `a778255` 显式遗留的「SOLE_STACK 对齐另包」——把 `scripts/run-e2e-isolated.mjs` 的 `SOLE_STACK`/`LEGACY_STACK`/`SOLE_APPROVED_FIXTURE_CONFIG`（现 `:1845-1848`）与 R5-MARKED-RED 字符串对齐 `adr-postgres-retained`（PG-retained）的 PG-retained 真相。**每消费点实读披露**：`SOLE_STACK` 是 3 个 fail-closed 分支入口（`:1854` EXIT=2 · `:1881`/`:2282` EXIT=3）+ env 注入分支（`:2202-2206`）+ receipt 字段（`:2243`）的判定/数据值，**非纯文案**；banner 字符串本体已由 Line AL `c633584` 对齐，余留 = header `:5`「Intended sole default」注释 + 常量命名/值面。方案 (a) 纯文案对齐 / (b) 常量改名+消费点同步（blast radius ≥5 个 prove 扫描器）/ (c) 诚实保留+仅 backlog 更新——**利弊交双审，行为语义裁决权在双审**；并披露一项**先在缺陷**（`conn-stack:r5-mark-red:prove` 扫描门锚定 AL 前旧字面量 `NOT sole-stack truth`，基线静态预计 EXIT=1，未运行·Ban prove）。**≠ sole cutover**、gap 状态不 flip。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-sole-stack-align.md`（§1 消费点 file:line 全引 · §2 方案候选 · §3 先在缺陷披露 · §4 prove 方案与 EXIT 契约） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-sole-stack-align-mw-e2e-ha.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-sole-stack-align-mw-privacy-int.md` |

## Chain

- `gap-bug-backlog.md:63` named gap：banner stale 措辞 ≠ `adr-postgres-retained` 真相；缓解=收据/审查不得引用 banner 作 stack truth；**SOLE_STACK 对齐另包**（即本刀）。
- Line N `a778255`：banner-note 对齐 + nail 钉死 gap stays OPEN + 「另包」遗留；`E2E_ISO_STACK_NOTE` narration-only（本刀 Ban 触碰）。
- Line AL `c633584`：banner 字符串已改为「dual-track code-path label ≠ product stack truth」；显式 Ban SOLE_STACK const/allowlist；residual 点名 = header `:5` + `const SOLE_STACK`（ADR `:39` 同步记载）。
- 本刀（Line SS2）：docs-only REQUEST，披露消费点 + 方案 + prove 计划；**不裁决行为语义、不运行 prove、不碰 SSOT、不碰 e2e 断言**。

## 流程（§3 loop 第③步 → 第④步）

1. 本 commit：docs-only REQUEST（harness + slice + 两个 pre-exec stub，PENDING）。
2. 预执行双审：`mw-e2e-ha` + `mw-privacy-int` **BOTH PASS**（alone ≠ dual · 不代签 peer）。
3. 协调方（meetwise bot）显式授权 coding（点名方案取舍与先在红处置）→ 实现方执行。
4. 执行后 post-align docs supplement + post-align 双审另起；backlog `:63` 只在彼时按彼时授权更新。

## Ban（逐条）

1. Ban coding（本 REQUEST 零 scripts/ 触碰）· Ban prove（零运行，含 `node --check`）· Ban push / force-push / self-approve / secrets / `.env*`。
2. Ban 改 e2e 断言与其他 prove 面（g1/g3/r5-mark-red/adapter 等 prove 文件零触碰，除非对 §3 先在红显式授权修复）。
3. Ban 触碰 `E2E_ISO_STACK_NOTE`（`run-e2e-isolated.mjs:2312-2313`，Line N narration-only 产物）。
4. Ban SSOT edit（matrix / backlog / checklist 本 commit 零改动；backlog `:63` 不 flip）。
5. Ban 把对齐写成 sole cutover / MySQL 切流暗示；Ban 改 ADR Decision 本体；Ban 碰 UC-018/052/25/004 行与 `coveredCount=8`。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503.

*Slice · SOLE_STACK 代码路径对齐包 · draft:awaiting_pre_exec_dual · ≠ sole cutover · STOP*
