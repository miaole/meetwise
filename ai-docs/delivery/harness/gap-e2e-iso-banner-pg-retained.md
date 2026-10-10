# Harness — **GAP-E2E-ISO-BANNER-PG-RETAINED 一致性对齐刀**（Line N · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · 零产品行为变更）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban self-approve · Ban coding · Ban prove · 本 commit 不运行任何 e2e）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Date**: 2026-10-03
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`8dde8e3`** / full `8dde8e3c795178395b4fb9bf0e759aeb11693b90`（docs tip · not a prove tip · 本地 origin ref；fetch 当时网络超时，见 §遗留）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-n` · branch `line/n-iso-banner-align`（一切 git 写操作只在此 worktree）
**Knife**: **GAP-E2E-ISO-BANNER-PG-RETAINED**（isolated e2e banner × `adr-postgres-retained` 一致性对齐 · docs 口径修正 · **≠ sole cutover** · **零产品行为变更**）
**Gap id**: **`GAP-E2E-ISO-BANNER-PG-RETAINED`**（`gap-bug-backlog.md:63` · P1 · Line B N1 named gap · backlog 行状态本刀不改）
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（stubs PENDING · Ban self-approve · alone ≠ dual · PG-retained 属隐私/栈域故 `mw-privacy-int` 入双审）
**Authority**: meetwise — docs REQUEST open only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit（本 commit） · Ban push

## 1. 现状张力（只读取证 · file:line 全引）

两个口径面各说各话；没有哪一方「事实」错，缺的是一句显式声明把两者钉成并存。

**(a) 隔离壳 banner —— 测试基础设施口吻**

- `scripts/run-e2e-isolated.mjs:2068`：`console.log(` + "`E2E isolated PostgreSQL: ${container} on 127.0.0.1:${env.PGPORT}`" + `);` —— 一次性隔离 PG 容器（L2053-2061 `docker run --rm -d`，`meetwise.e2e_run_token` 门禁）就绪后的横幅，只描述**本次 e2e 的临时测试库**；该行位于 legacy pgvector disposable 路径（L2109 `} // end else (legacy pgvector disposable path)`）内。
- 误读 A：把「隔离一次性 PG」读成**偏离 PG-retained**（「测试都绕开产品栈了」）——错；隔离 PG 恰是**同 PG 栈**的测试基础设施，与 pin 同向。
- 误读 B：把它读成 **cutover 证据**（「banner 证明产品已迁 PG」）——错；横幅 ≠ 产品栈变更 ≠ 迁移证据。

**(b) R5-MARKED-RED banner —— stale-era 措辞（张力本体）**

- `scripts/run-e2e-isolated.mjs:1694-1697`：`[R5-MARKED-RED] E2E_ISOLATION_STACK=${isolationStack} (dual-track; intended sole default=${SOLE_STACK}) … (sole stack = MySQL+Qdrant+Redis). Local green ≠ RAG migrated. …`
- `scripts/run-e2e-isolated.mjs:1603`：`const SOLE_STACK = 'mysql-qdrant-redis';`（`:1604` `LEGACY_STACK = 'pgvector-legacy'`；`:1606` `SOLE_APPROVED_FIXTURE_CONFIG = 'compose.mysql-local'`；G3 fail-closed 分支 `:1639-1654`、`:2040-2046`）
- 这些字符串仍把 MySQL+Qdrant+Redis 当 intended sole，与 ADR 的钉**方向相反**——正是 backlog 行登记的缺口。

**(c) 产品栈钉（ADR，未被任何 banner 修改、也不应被误读修改）**

- `ai-docs/delivery/adr-postgres-retained.md:9`：keep **Postgres**（业务表 · RLS · 0043 迁移）· **NO** business DB migration to MySQL。
- `:10`：keep **`PostgresSaver`** / Postgres checkpointer。
- `:11`：keep **pgvector** · NO vector cutover to Qdrant。
- `:12`：MySQL/Qdrant 原型 **not sole cutover targets**；`:3` status = accepted (direction pin) · releaseEvidence=false · ≠HA；`:38` Non-claims。

**(d) 第三方佐证（只读）**

- `ai-docs/delivery/gap-bug-backlog.md:63`：`GAP-E2E-ISO-BANNER-PG-RETAINED | P1 | run-e2e-isolated.mjs R5-MARKED-RED banner 仍写 MySQL+Qdrant+Redis 为 intended sole · ≠ adr-postgres-retained 真相 | 收据/审查 不得 引用该 banner 作 stack truth；SOLE_STACK 对齐另包 | e2e / privacy | Line B N1 · named gap | adr-postgres-retained.md；scripts/run-e2e-isolated.mjs`
- `ai-docs/delivery/e2e-requirement-coverage-matrix.md:4`：头部「栈裁定」仍是 MySQL+Qdrant+Redis 时代措辞（stale）；`:18` R5 夹具行（BUG-FAKE-R5 / BUG-E2E-ISO）；`:99` 起的 2026-10-02 nails 已带 `PG-retained` pin —— 矩阵内部新旧口径并存，本刀**不改矩阵**（Ban SSOT edit）。

**张力一句话**：`scripts/run-e2e-isolated.mjs:2068`（以及 stale 的 `:1694-1697`「sole stack = MySQL+Qdrant+Redis」）与 `ai-docs/delivery/adr-postgres-retained.md:9-11`（Postgres / PostgresSaver / pgvector retained）之间缺少显式声明——**隔离壳是测试基础设施，PG-retained 是产品栈钉，两者并存且互不否定**——以致 banner 既可能被读成「偏离 pin」，又可能被反向读成「cutover 依据」。

## 2. 对齐方案（执行阶段经授权后做 · 措辞硬要求）

对齐产物措辞必须**逐字包含**三个不等式语义：**「隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据」**（isolated shell = test infrastructure only；PG-retained = product stack pin；banner 既非偏离 pin 也非迁移依据）。

- **方案一（ADR 补注 · 纯 docs）**：在 `ai-docs/delivery/adr-postgres-retained.md` Non-claims 追加**一条** clarify bullet（additive-only，不改 Decision / 既有 Non-claims 本体）。diff 预览见 §4。
- **方案二（banner 附加说明行 · 唯一允许的产品面触碰点）**：在 `scripts/run-e2e-isolated.mjs` **新增一组 console 输出行**（纯文案、零行为；不改任何既有字符串/常量/控制流/exit code）。diff 预览见 §5。
- **默认执行形态 = 方案一 + 方案二（两者）**；若双审任一方砍掉方案二，本刀退化为纯 docs（零 `scripts/` 触碰）后仍可执行。

**申报**：若执行方案二，`scripts/run-e2e-isolated.mjs` 是本刀**唯一**允许触碰的产品面文件，且只允许 §5 的**纯新增行**；Ban 改常量（`SOLE_STACK`/`LEGACY_STACK`/`SOLE_APPROVED_FIXTURE_CONFIG`，L1603-1606）、Ban 改 R5-MARKED-RED 既有字符串（L1694-1697，其改写属 backlog 所记「SOLE_STACK 对齐另包」）、Ban 改任何控制流 / exit code / 目标清单 / allowlist。

## 3. Ban（逐条）

1. **Ban 把对齐写成 sole cutover / MySQL 切流暗示**——本刀是 docs 口径修正，零栈迁移语义；`adr-mysql-qdrant-local.md` 的 sole 叙事已被 ADR supersede，本刀不得反向把它当 truth，也不得把任何措辞写成「向 MySQL/Qdrant 迁移的依据或反证」。
2. **Ban 改 PG-retained pin 本体**：`adr-postgres-retained.md` Decision（L7-14）逐字不动；PostgresSaver / pgvector / RLS / LISTEN-NOTIFY provisional pin 不重述、不松动、不「升级」、不「降级」。
3. **Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 行**：matrix 对应行及其 nails、covered/partial/gap 状态、`coveredCount=8` 一律零触碰。
4. **Ban SSOT edit（本 commit 及本刀执行 commit）**：matrix / backlog / execution-master-checklist 不改；backlog L63 行状态如需变化，仅在 post-align 另行 docs 流程处理。
5. **Ban 改 `SOLE_STACK` 常量与 R5-MARKED-RED 既有字符串**（L1603-1606 / L1694-1697）——SOLE_STACK 对齐**另包**，不在本刀。
6. Ban coding（除 §5 申报的纯文案新增行外零代码）、Ban prove、Ban push、Ban force-push、Ban self-approve、Ban secrets / `.env*`。本 stub 不是 nail、不是 HA、不是 covered、不是 cutover 授权。

## 4. 方案一 diff 预览（ADR 补注 · additive-only · docs）

锚点：`ai-docs/delivery/adr-postgres-retained.md:38`（Non-claims 现有唯一 bullet，执行时按文本锚，不按行号硬编）。

```diff
--- a/ai-docs/delivery/adr-postgres-retained.md
+++ b/ai-docs/delivery/adr-postgres-retained.md
@@ (Non-claims, after the existing single bullet L38)
 - Not HA · not suite green · not releaseEvidence · not Redis wake cutover authorized or rejected · provisional LISTEN/NOTIFY preference is not a user hard pin · not deleting historical MySQL/Qdrant artifacts · not abandoning RLS · not inventing false prior ADR acceptance.
+- Banner clarify (GAP-E2E-ISO-BANNER-PG-RETAINED align · 2026-10-03 · docs only): isolated e2e shell banners in `scripts/run-e2e-isolated.mjs` (e.g. `E2E isolated PostgreSQL: …` @L2068 · R5-MARKED-RED @L1694-1697) are **test infrastructure narration**, not stack truth: **isolated test PG ≠ product stack change ≠ cutover evidence** — they neither contradict nor evidence this ADR's Postgres / `PostgresSaver` / pgvector retention. Stale banner wording (`sole stack = MySQL+Qdrant+Redis`, @L1696) is a known named gap (`gap-bug-backlog.md` GAP-E2E-ISO-BANNER-PG-RETAINED) and must not be cited as stack truth; SOLE_STACK code-path alignment is a separate package.
```

机检口径：该文件在本刀执行 commit 的 diff 必须**只有新增行、零删除/零改写行**。

## 5. 方案二 diff 预览（banner 附加说明行 · 唯一产品面触碰点 · 纯文案 · 零行为）

锚点：`scripts/run-e2e-isolated.mjs:2068` 整行文本（执行时按文本锚定；基线行号 2068 仅为参考）。在其后**立即插入**以下三行（缩进与其所在块一致，4 空格）：

```diff
--- a/scripts/run-e2e-isolated.mjs
+++ b/scripts/run-e2e-isolated.mjs
@@ (immediately after the `E2E isolated PostgreSQL:` banner line, baseline L2068)
     await waitForPostgres(env);
     console.log(`E2E isolated PostgreSQL: ${container} on 127.0.0.1:${env.PGPORT}`);
+    console.log(
+      `E2E_ISO_STACK_NOTE isolated shell = test infrastructure only: isolated test PG ≠ product stack change ≠ cutover evidence; ` +
+      `product stack pin = ai-docs/delivery/adr-postgres-retained.md (Postgres retained · PostgresSaver · pgvector). releaseEvidence=false · Not HA.`,
+    );
```

零行为判据：无新变量、无控制流变化、无 exit code 变化、无参数/环境变化——`node --check scripts/run-e2e-isolated.mjs` 通过且本刀执行 commit 的该文件 diff **恰好** = 上述纯新增行（无其它 hunk）。执行阶段**不运行任何 e2e**（输出行在下次任何人跑 e2e 时自然生效）。

## 6. 流程（§3 loop 第③步 → 第④步）

1. 本 commit：docs-only REQUEST（harness + slice + 两个 pre-exec stub，PENDING）。
2. 预执行双审：`mw-e2e-ha` + `mw-privacy-int` **BOTH PASS**（alone ≠ dual · Ban self-approve · 不代签 peer）。
3. 协调方（meetwise bot）显式授权 → 实现方按 §4/§5 diff 预览执行对齐（默认两者；任一方案被双审砍掉即不做该方案）。
4. 执行后 post-align docs supplement + post-align 双审**另起**；SSOT（backlog L63 行状态等）只在彼时、只按彼时授权更新。

## 7. 验收判据（post-align 双审机检用）

- ADR 补注存在且含「隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据」语义；`adr-postgres-retained.md` L7-14 Decision 逐字不变（`git diff` 零删除/改写）。
- 若方案二执行：`run-e2e-isolated.mjs` diff **逐字等于** §5 预览（纯新增，无其它 hunk）；`node --check` 过；全刀零 e2e 运行记录（`.tmp/` 无新 receipt）。
- 若方案二被砍：本刀执行 commit 零 `scripts/` 命中。
- 全刀文件 Pins 逐字一致（§Pins 表）；UC-018/052/025/004 相关行与 SSOT 文件 diff 零命中。

## 8. 遗留（非本刀范围）

- `git fetch origin` 在开刀时网络超时（github.com:443）；基线取自本地 `origin/feat/mysql-schema-skeleton` ref = `8dde8e3`（与预期 tip 一致）。远端 tip 请协调方/审查方侧复核；若远端已前进，本 REQUEST 需 rebase 后再入双审。
- matrix 头部 L4 stale「栈裁定」与 R5-MARKED-RED L1694-1697 stale 字符串在方案二执行前仍原样存在；改写它们属「SOLE_STACK 对齐另包」，本刀只补注、不改写。

## Pins（retained · 本刀不改）

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

---

*Harness · GAP-E2E-ISO-BANNER-PG-RETAINED 一致性对齐刀 · draft:awaiting_pre_exec_dual · ≠ sole cutover · 零产品行为变更 · STOP*
