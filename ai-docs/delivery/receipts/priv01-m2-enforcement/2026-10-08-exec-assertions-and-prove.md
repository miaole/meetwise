# Receipt — PRIV01-B EXEC · 断言措辞定稿 + 设计面 prove（P-A）· `executed:awaiting_post_prove_dual`

**Date**: 2026-10-07（立卷）/ prove 窗口 2026-10-08 Asia/Shanghai（见 attempts）· **Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Pre-EXEC REQUEST provenance**: `0147f8ce` / full `0147f8ceaef55d27397af53bd9a928eb2b2dda46`（parent `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9` = 开工 origin tip · EXEC 期间 origin tip 零位移，fetch 复核 up-to-date，免 rebase · 所有引锚自 REQUEST 起零漂移）
**EXEC 授权**: meetwise 协调方（PRE dual BOTH PASS：mw-privacy-int + mw-e2e-ha 全项 PASS · §3⑤ standing authorize）· 本 EXEC 触面 = `packages/db/test/tenant-enforcement.proof.ts`（P-A）+ harness + slice + 本 receipts 目录 · **零 `src/` 产品码** · `packages/db/package.json`/根 `package.json` **零变更**（CMD 沿用 `packages/db/package.json:35`，无需新 script 名）

## 1. P-A/P-B 裁定

**裁定 P-A**（断言面扩展落 proof），依据：

1. 双审读数倾向 P-A（协调方 EXEC 指令第 2 条）；
2. harness §4.1 断言面五项中，现有 proof 只覆盖断言 1–3 主体 + 断言 4 的 `principal.ts` 半边——**断言 4 的 baseline 半边（`0001_baseline.sql` FORCE RLS + `p_owner` 双侧 + vector_chunk）与断言 5 接线面机检完全缺位**，断言 2 的「无空谓词成功形态」成形断言与源短语钉亦缺位；P-B（零扩展）将留下可机检而不检的面，与「断言不可弱化」相悖；
3. 触面恰为授权清单内（test/proof 文件 · 零 src/ · CMD 不变 → `packages/db/package.json` 与根 `package.json` 均无需触碰）。

R3（P-B 条件登记：断言面 delta）**不触发**——P-A 已裁定，无 delta 需登记；此为 R3 的条件性显式注销，非静默跳过。

## 2. 断言措辞定稿（file:line · `packages/db/test/tenant-enforcement.proof.ts` · EXEC 后 299 行）

| 断言 | file:line | 覆盖 |
|------|-----------|------|
| E1 missing/null/blank/non-string → `tenant_owner_user_id_required` | `:65-79`（requireOwnerUserId 段 · REQUEST 前既有） | E1 |
| E3 mismatch/blank-row/match（`tenant_owner_mismatch`/`tenant_predicate_invalid`） | `:81-89` + `:112-119`（既有） | E3 |
| E2 trims + 恰形 `{column:'owner_user_id', value}` 且 keys=2 | `:101` | E2 成形 |
| E2 无空谓词成功形态（多 owner 全绑定） | `:107` | E2 |
| E2 源短语钉 `required predicate object, not an optional filter hint` | `:132` | E2（attempt1 缺陷修复点） |
| E4 `provisionRuntimeLogin` NOINHERIT/NOBYPASSRLS 在位 | `:150` | E4 |
| E4 baseline 头注 owner+ENABLE+FORCE RLS + 超级用户不绕（`0001:7`） | `:160` | E4 |
| E4 `app_role NOLOGIN` + 无 BYPASSRLS（`0001:63-64`） | `:163` | E4 |
| E4 `p_owner` USING/WITH CHECK 双侧谓词（`0001:69-79`） | `:165` | E4 |
| E4 vector_chunk ENABLE+FORCE+p_owner 同形（`0001:300-304`） | `:168` | E4 |
| **R1 断言 5**·face A：字面 `src/tenant` 串零命中（`hits=0 files-scanned=332`） | `:250` | 接线面 |
| **R1 断言 5**·face B：tenant 模块/符号引用在纯 re-export 之外零命中（`consumption=0 reexportStmts=2`） | `:253` | 接线面 |
| **R1**：barrel re-export 存在且归类 re-export≠consumption（恰 2 条语句） | `:256` | R1 |

**R1 登记全文**：接线面机检 grep 面钉死为双面——face A = 生产 src（`packages/*/src` + `apps/*/src`，排除 `packages/db/src/tenant/**` 本体与 test）中**字面 `'src/tenant'` 串**；face B = **模块引用面**（`from`/`import()`/`require()` specifier 含 `tenant` 路径段 + 五个导出符号 `\b(requireOwnerUserId|assertTenantPredicate|buildRequiredOwnerFilter|enforceOwnerOnRow|TenantEnforcementError)\b`，经注释剥离后落在纯 re-export 语句 span 之外者计 consumption）。**`packages/db/src/index.ts:25-32` barrel re-export 显式登记为在位且归类 re-export ≠ consumption**（值导出块 `:25-31` + 类型导出 `:32`，恰 2 条语句，存在性断言钉死防静默收窄；barrel 存在使 `@meetwise/db` 消费者在未来接线 PR 中可被 face B 捕获）。两面任一命中即 FAIL——防误红（re-export 不计 wiring）与防静默收窄（存在性 + 双面同时钉）。

**R2/O1 登记（同车落卷）**：**E5 应用层半边（自身 id 读写意外 0 行 → fail-closed 上抛）本 proof 不证、不得被读作「E5 已证」——其 prove 显式归属接线 PR**（零接线状态下无可执行断言面）；E5 DB 层半边（GUC 未设 → 0 行缺省 deny）归属前刀 PRIV01-A 候选 A 隔离面 prove（awaiting 授权）。归属句落在 proof 文件头注（`packages/db/test/tenant-enforcement.proof.ts:26-29` R2 块）+ 接线面机检段注释（`:180`）+ 本收据 + harness §4.1.1，四处同文。

## 3. Prove attempts 台账（Asia/Shanghai · 全录 · Ban retry-to-green 口径声明）

| # | 窗口（Asia/Shanghai） | CMD | EXIT | PASS/FAIL | log |
|---|----------------------|-----|------|-----------|-----|
| 1 | 2026-10-08 10:26:28 +0800 .. 10:26:32 +0800 | `pnpm --filter @meetwise/db tenant-enforcement:prove`（= `packages/db/package.json:35` `tsx test/tenant-enforcement.proof.ts` · worktree HEAD=`0147f8ce` + EXEC 工作树态 S1） | **1** | 34/1（E-1 勘误 2026-10-08 · 原文 33/1） | `receipts/priv01-m2-enforcement/priv01-prove-attempt1.log` + `.exit` |
| 2 | 2026-10-08 10:27:29 +0800 .. 10:27:29 +0800 | 同上（工作树态 S2 = S1 + 恰一行正则修复） | **0** | **35/0** | `receipts/priv01-m2-enforcement/priv01-prove-attempt2.log` + `.exit` |

**attempt1→2 定性（显式交 post 双审裁 · 非 retry-to-green 洗白声明）**：attempt1 唯一 FAIL = `tenant source pins required-predicate (non-optional filter) wording (E2)`——**确定性 fixture 字串缺陷**：断言正则误写 `/required predicate, not an optional filter hint/`，漏源文件 `packages/db/src/tenant/index.ts:99` 原文一词 `object`（`This is a required predicate object, not an optional filter hint.` · od 字节级亲验）。修复 = 恰一行正则补 `object`（S1→S2 diff 可验证，零断言语义变更、零被测源变更）。沿 GAP-PRIV-04 先例（attempts 台账 1,0：#1 EXIT=1 确定性 fixture 缺陷诚实保留 · #2 EXIT=0）——非 `:68` 型 cause-unknown 重试凑绿；两 attempt 全录、EXIT 原值保留、缺陷定性本节存档。**post 双审若裁本路径不可采，attempt1 EXIT=1 诚实保留为 EXEC 终态。**

**env 探针**：node v22.22.3 · pnpm 10.18.0 · tsx v4.22.4 · darwin arm64（macOS）· PREREQ：worktree 无 node_modules → `pnpm install --frozen-lockfile --prefer-offline`（5.2s · 零 lockfile 变更）后运行；optional PG path skipped（无 `DATABASE_URL`/`PG*` —— `:269` skip 分支，unit prove sufficient）。**secrets：零触及（Key name-only 口径 · 日志仅 PASS 行 · `actualSpendCny=null`）**。

## 4. EXIT 契约（本次 EXIT=0 · 十不得+1 照抄生效）

EXIT0 ≠ 接线已授权 ≠ RLS abandon 门开 ≠ backlog `:57` CLOSED/翻行 ≠ 「tenant=RLS 等价」≠ 授权根已迁 ≠ MySQL 等价强制完成 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 清单门全绿宣称。**ADR 门（privacy-authorization / crypto / erasure 系列）本 EXEC 零执行、零复跑、零 receipt（cite-only）。** 公开 DELETE=503 未触碰（`privacy.controller.ts:51-52` 零 diff）· UC-052 stays partial · coveredCount=8 不变。

## 5. 触面与 diff 界定

| 文件 | 变更 |
|------|------|
| `packages/db/test/tenant-enforcement.proof.ts` | +146/−1（P-A：E2 成形+源钉 / E4 baseline+provisionRuntimeLogin 钉 / R1 接线面机检+barrel 登记 / R2 头注归属） |
| `ai-docs/delivery/harness/priv01-m2-enforcement-design.md` | §4.1.1 EXEC 定稿 + §11 EXEC 登记 + lifecycle 推进 |
| `ai-docs/delivery/priv01-m2-enforcement-design.slice.md` | 同步浓缩 |
| `ai-docs/delivery/receipts/priv01-m2-enforcement/*` | 本收据 + 2 log + 2 exit |
| **零** | `src/` 产品码 · `packages/db/package.json` · 根 `package.json` · SSOT 四件（backlog/checklist/matrix/queue）· 双审 stub · `apps/worker/src/checkpoint-principal.ts` · `privacy.controller.ts` · 授权根（`principal.ts`/migrations）· secrets |

---

*Receipt · PRIV01-B EXEC · P-A · prove EXIT=0（35/0 · attempts 1,0 全录 · fixture 缺陷定性交双审）· R1/R2/O1 落卷 · R3 不触发 · ADR 门 cite-only · 零 src/ · executed:awaiting_post_prove_dual · STOP（awaiting post-prove dual · 协调方派）*

> **E-1 勘误（append-only 注记 · 2026-10-08 nail · meetwise 协调方授权）**：§3 台账 attempt1 PASS/FAIL 计数原记「33/1」更正为「**34/1**」——attempt1 log 实为 34 PASS + 1 FAIL（含 `:39` optional PG skip 行按 PASS 口径计入；总断言数 35 与 attempt2 35/0 口径一致）· 三处统一更正：本收据 §3 / harness §11 / slice EXEC 登记 · 两个 `.exit` 文件与两 log 原样零改 · 本收据其余已落内容零字节改动。（post-prove 双审 BOTH PASS：mw-privacy-int 裁 attempts 1,0 可采 · mw-e2e-ha 独立复跑 EXIT=0 35/0 逐值一致并确认 E-1 勘误处方）
