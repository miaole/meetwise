# REQUEST — **GAP-MOP-01 `:74` wakeup work face + BUG-NOTIFY-REC `:95`** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_re_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-mop-01-wakeup-notify-rec.md` · `gap-mop-01-wakeup-notify-rec.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `4804c3dc` / `4804c3dc54e696b5f7af17574d21e1bbe68482a4`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）

## Pins（原值全抄 · retained 写死）

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503** |
| PG LISTEN | **retained** |
| actualSpendCny | **null**（两本账分离沿 I 线 · 费率非承诺） |
| GAP-MOP-01 `:74` | **OPEN** · Ban flip CLOSED |
| BUG-NOTIFY-REC `:95`（本基线行号 · MOP03-era `:93`） | **OPEN** · Ban flip CLOSED |

## Scope（待审）

docs-only REQUEST：按 backlog `:74` 原文把 GAP-MOP-01 wakeup 工作面立卷——(a) §2a wakeup 生产诚实清单（LISTEN/NOTIFY `meetwise_worker_wakeup_v1` lossy hint · additive Redis 旁路 value-gated flag 关 · 既有周期兜底扫描实存（drain-loop 周期 tick + 五 consumer loop `WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5s 认领 + dual reconciler 30s/60s → 漏唤醒 = 有界延迟窗 · `main.ts:452` 仅字面事实引用）· **强制 periodic reconcile 未在 sole stack 证明** = BUG-NOTIFY-REC `:95` 保持 OPEN 依据（未证明 ≠ 不存在））；(b) §2b M3 切流包 wakeup 侧内容定义（flag 审后开程序 · 保留 reconcile · wakeup prove 不命名不授权 · 本绿≠已迁随包输出）；(c) §2c 旧 `worker-wakeup:prove` 标红/换夹具处置计划。**与 MOP03 立卷边界**：nail `e29d8f93` 六门准入合同**只读引用不再立法**（Ban 重复立卷）——MOP03 立准入门，MOP01 立工作面；未来 wakeup 切流 REQUEST 须同时过六门与切流包内容。本刀零执行；prove 计划 named-not-run（`worker-wakeup:prove` / `worker-wakeup-redis:prove` named for clarity · 未来 cutover Redis wakeup prove 不命名不授权）· EXIT 契约预声明（attempts 全记录 · 诚实失败 · Ban retry-to-green · EXIT0≠已迁≠cutover）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban Redis cutover**（wakeup/queue/claim 切流 · flag 开启 · Redis prove 授权 · MOP03 六门不因本刀松动）· **Ban MODEL-OP closed claim** · Ban SLO forge / fake green · Ban 删 PG LISTEN · Ban `:74`/`:95` flip CLOSED · **Ban 重复立卷**（六门要素 2–5 只读引用）· Ban GAP-MOP-02 `:75` 认领 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级 · Ban SSOT edit · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push

## 裁决点（expert 裁量）

- **D1（生死点）· 与 MOP03 立卷重叠裁决**：本刀「互补不重复」读法是否成立（MOP03 准入合同 vs MOP01 `:74` 工作面）；若判实质重叠 → 本刀显式改写收窄为「仅诚实登记」（逃生门 harness §1-D1/§3 · Ban 重复立卷 · Ban 静默换范围）。
- D2：切流包内容口径（`:74`「M3 切流包（非本选型切片）：flag 默认关→审后开；保留 reconcile」= 未来授权 REQUEST 的 wakeup 侧交付清单定义 · 非本刀执行 · flag 开启动作 Ban）是否如 REQUEST 所述。
- D3：Redis 语义边界（本刀只立卷不切流 · 选型/原型/INFLIGHT:redis-wakeup-wip 只读 cite · Redis wake deferred ≠ STOPPED 沿 W5）。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

---

## RE-PRE dual review（mw-e2e-ha · 2026-10-07 · append-only）

**Round**: RE-PRE（上轮 PRE BOTH FAIL·B-1 §2a 行 5 失实 → 实现方按处方重写 · 本审独立兑现核验 · 看不到 mw-model-op 审 · alone ≠ dual 不代签）
**Object**: `a265d6f8`（parent=`4804c3dc` 全 SHA `4804c3dc54e696b5f7af17574d21e1bbe68482a4` = `origin/feat/mysql-schema-skeleton` tip 实证；`git branch -r --contains a265d6f8` 空 = 未 push 实证）
**Method**: worktree `rv/mop01r-e2e-ha` · 只认命令+EXIT+可复现证据 · 零 prove 零 coding 零 live 零 SSOT 写 · 未读 `.env*` · 本节为 append-only，上文原 byte 未动

### B-1 兑现核验表（命令均在本 worktree 可复现）

| # | 处方要素 | 兑现 | 证据 |
|---|---------|------|------|
| 1 | 恰 +18/−18 行内替换 · 4 文件 0 增删行 | ✅ | `git diff --stat 4804c3dc a265d6f8` = 4 files, 18 insertions(+), 18 deletions(-)，逐 hunk 核为行内替换 |
| 2 | 行 5 新口径六要素逐字 | ✅ | bounded scan 实存／漏唤醒=有界延迟窗（非「无周期兜底」断链）／强制 periodic reconcile 未在 sole stack 证明 GAP 仍 OPEN／`main.ts:452` 仅字面事实引用／Ban 两头漂移（禁「已修复/无窗口」+禁「既有扫描可关 `:95`」双向落文）／「未证明 ≠ 不存在」 |
| 3 | 三处回声同步 | ✅ | slice One-line + 两 stub Scope 同口径改写（diff 实证，两 stub 文本一致） |
| 4 | 其余 byte 保留（C-HA-2） | ✅ | D1 逃生门 harness `:27`/`:79` + slice `:23` 原文在位；§6 Pins `:112-114` 原值；两 stub Pins 表/裁点 D1-D3/Ban/页脚不在 diff = 未动 |
| 5 | C-HA-1 base 重钉 | ✅ | 重钉 `1c4588f9`→`4804c3dc` 贯穿 harness/slice/两 stub；`git diff --name-only 1c4588f9 4804c3dc -- apps packages scripts migrations` = 0 文件 → 全部代码锚 base 重钉零位移 |
| 6 | 代码锚抽验（要求 ≥3，实抽 20+，本人独立 grep/sed 非转抄） | ✅ | `grep -n setInterval apps/worker/src/main.ts` 唯一 `:452`（Langfuse flush 5s 无关）；`:458-461` "bounded scan for listener outages" 自述；`:462` `boundedIntEnv('WORKER_JOB_RECONCILE_INTERVAL_MS',5_000,1_000,60_000)`；`:488/:609/:612/:614/:616` 五 loop 同喂该 interval；`:641-642` "never replaces the PG LISTEN session above"；`:646-648` 缺 URL skip；`:677-680` dual reconciler 起点自述；`:709` "bounded reconciliation"；`drain-loop.ts:14` `intervalMs = 5000` / `:31` `setTimeout(finish, intervalMs)` / `:52` 每拍后 re-arm；`model-invocation-reconcile.ts:129` `intervalMs = 30_000`；`usage-calibration-reconcile.ts:63` `intervalMs = 60_000`；`worker-job-wakeup.ts:7-8`；`worker-job-wakeup-redis.ts:50-53`；`package.json:379`/`:474`；backlog `:74` GAP-MOP-01 / `:95` BUG-NOTIFY-REC（原文 "reconcile 未在 sole stack 证明 → 漏唤醒窗口"）/`:96` 直证 |
| 7 | rebase 同补丁 drop 落 tip | ✅ | `git show d0dc312f \| git patch-id --stable` ≡ `git show c404f2a \| git patch-id --stable` = `de532136acea03fc16d7a171ce93f76fc6c58e88` |
| 8 | SSOT 零触碰 | ✅ | backlog blob `28c76564…` 于 `1c4588f9`/`4804c3dc`/`a265d6f8`/worktree 四态 `git rev-parse`+`git hash-object` 全等 |
| 9 | `:74`/`:95` OPEN | ✅ | slice Status/Pins、harness §6 `:114`、两 stub Pins 原值保留 |
| 10 | Status 零 self-write | ✅ | 两 stub 仍 **PENDING**/`draft:awaiting_re_pre_exec_dual`；实现方未写任何 PASS——本节为唯一裁决写入 |
| 11 | Ban 面 | ✅ | diff 全在 `ai-docs/delivery` 4 md；零产品码、零 `package.json`、零 flag 操作、零 secrets、零 push |

**B-1 结论**：**兑现成立**——上轮 FAIL 的失实行已按处方重写，新口径经本人独立代码复验完全成立（漏唤醒窗口=有界延迟窗非断链；`:95` OPEN 依据回到「未证明 ≠ 不存在」）。

### 残留披露裁决（harness §2 表 `:35`）

- 事实核验：`grep -n '无周期兜底'` 于 4 文件仅剩 harness `:35` 一处（诚实清单钉行中格摘要回声；`:48` 处为行 5 Ban 引语中的否定用法，合法）。
- 定性：`:35` 现与同文件 §2a 行 5 直接矛盾（错摘其所指小节），按代码亦失实——即 B-1 同类失实的残留微缩体。该行不在上轮处方枚举面，**枚举漏检属本审上轮之误，非实现方之误**；实现方依「Ban 静默换范围」不动并主动披露，程序正确。
- **裁决：须一并修（不接受无限期保留待裁）**——以 Condition C-HA-3 承载（EXEC-gate 强制前置），非 Blocker：B-1 处方面已 byte 级兑现；残留为单短语、机械可验；修复须 scoped micro-patch（仅 `:35` 中格短语对齐「既有周期兜底扫描实存 → 漏唤醒 = 有界延迟窗」口径；右格「BUG-NOTIFY-REC `:95` OPEN · Ban 写成已修复」byte-intact；Ban 触碰其余任何 byte），经 mw-model-op + mw-e2e-ha dual ack 后方得 EXEC 授权。

### Blockers

- **0 Blocker**。

### Conditions

- **C-HA-3（强制 · EXEC 前置）**：harness `:35`「无周期兜底轮询」摘要回声须一并修——scoped micro-patch 仅限该短语，右格 byte-intact，Ban 其余触碰；须双方 dual ack。
- **C-HA-4（持续）**：Pins 原值 / `:74`/`:95` OPEN / PG LISTEN retained / Ban Redis cutover / Ban MODEL-OP closed 持续保留；任何 flip 须新刀。
- **C-HA-5（持续）**：alone ≠ dual——本 PASS 仅 mw-e2e-ha 单方裁决，不代签 mw-model-op；EXEC 仍须 PRE BOTH PASS + 协调方 AUTHORIZE；D1 逃生门继续绑定。
- **C-HA-6（持续）**：PASS ≠ 授权 coding / prove / cutover / covered / HA；EXIT0 ≠ 已迁 ≠ cutover 口径随包持续。

### 三行中文摘要

1. B-1 兑现成立：`a265d6f8` 恰 +18/−18 行内替换，§2a 行 5 六要素逐字落文，20+ 代码锚（`main.ts:452` 唯一 setInterval、`drain-loop.ts:14/:31/:52`、dual reconciler 30s/60s 等）本人独立 grep/sed 复验一致，三回声同步，D1 逃生门/§6 Pins 原值，backlog SSOT blob 四态全等，两 stub PENDING 零 self-write，未 push。
2. 残留裁决：harness `:35`「无周期兜底轮询」摘要回声**须一并修**（枚举漏检属本审上轮之误，实现方披露与范围纪律正确），作为 C-HA-3 强制 EXEC 前置的 scoped micro-patch，非 Blocker。
3. 0 Blocker · 4 Conditions · alone ≠ dual 不代签 mw-model-op · EXEC 须 PRE BOTH PASS + 协调方 AUTHORIZE · Ban push。

Verdict: PASS
