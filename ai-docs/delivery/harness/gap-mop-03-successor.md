# Harness — **GAP-MOP-03 · `:76` successor（cutover / independent review path）**（docs-only 立卷 · **`executed:awaiting_post_prove_dual`** · Ban Redis cutover · Ban MODEL-OP closed · PG LISTEN retained）

**Status**: **`executed:awaiting_post_prove_dual`**（MOP03 exec 落盘 2026-10-07 · PRE-EXEC dual BOTH PASS：mw-model-op `16f2c684`（origin）+ mw-e2e-ha `fa2f667e`（rv/mop03-e2e-ha）@REQUEST `cdde235e` ≡ mirror `787de124`（4 REQUEST md byte-identical · C-E2E-1）· **立卷产物 = REQUEST 自身**（harness+slice+双 stub · §2b 六门准入合同在内 · harness 未定义额外立卷文档/清单 → 仅推进 lifecycle 标记 · GAP-MOP-01/02 沿 §1-D1/§3 只读 cite · D1 判 GAP-MOP-02 不并入）· 零 coding · 零 prove 执行 · 零 SSOT（backlog/matrix/checklist 零改 · nail 阶段才登记）· `MEETWISE_WAKEUP_REDIS_STREAMS` **value-gated**（`'1'/'true'/'on'` 开 · `'0'`/空/unset 关 · 本刀 unset）—— 沿 mw-e2e-ha OB-1/C-E2E-2 按代码门重述，"presence-only" 不作开关判据 · 现存 `worker-wakeup-redis:prove` EXIT0 **≠** cutover 证据（C-E2E-3）· **PG LISTEN retained** 直至 cutover REQUEST PRE dual + AUTHORIZE + BUG-REV-COND 四专家审全部落地（C-E2E-5）· **Ban Redis cutover** · **Ban MODEL-OP closed claim** · `:76` OPEN · coveredCount=8 · `actualSpendCny=null` · **Ban self-write `post_prove_dual_pass`** · **Ban nail** until POST BOTH + 协调方 · alone ≠ dual）

> **Pre-exec-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（L0 docs only · Ban coding · Ban prove execution · Ban live · **Ban Redis cutover** · **Ban MODEL-OP closed claim** · **PG LISTEN retained**）
**Date**: 2026-10-07（Asia/Shanghai）· REQUEST 文件名日期 2026-10-06 按派单原文
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`63992a3b`** / full `63992a3b6a4d4ebe2745ff094b046c9d49997072`（EXEC rebase 已落：`cdde235e` 与 origin 镜像 `787de124` 同补丁自动 drop 落 tip · C-MO-1/C-E2E-1 base 重验 · drift 全 docs 面 · `apps/worker`/`packages/ai-runtime`/`package.json`/`scripts` 零 diff · 被审基点 `71713718` / `717137180a4cccaa8575acb21c79ccf848973fc2` 保留为 review provenance）
**Wave**: Line **MOP03**（queue Phase 0 item 4 · `REMAINING-NORTH-STAR-QUEUE.md`：「GAP-MOP-03 :76 successor cutover/independent review · M · model-op+e2e · Ban MODEL-OP closed · Ban Redis cutover · PG LISTEN retained」）
**Experts**: `mw-model-op` + `mw-e2e-ha`（PRE dual BOTH PASS · exec 落盘 awaiting POST dual · Ban self-approve · alone ≠ dual · Ban nail）
**Knife**: **GAP-MOP-03 `:76` successor** — 把 backlog `:76` 自留的两个后继钩子（「#102 域 cutover 仍须独立审」+「cutover 另 REQUEST」）**立卷为独立 REQUEST 路径**的 docs 定义刀
**Gap id**: **`GAP-MOP-03`**（backlog `gap-bug-backlog.md:76` · P0 · **OPEN** · AN-MOP-Q45 honesty nail `post_prove_dual_pass` · **≠** MODEL-OP domain closed · **≠** #102 cutover）

## 0. backlog `:76` 原文（只读引用 · 零改写）

> | GAP-MOP-03 | P0 | MODEL-OP **双 reconciler** 门 — **Q4/Q5**：`model-invocation-reconcile` **与** `usageCalibrationReconciler` 同列；worker loop wired · AN-MOP-Q45 honesty knife **`post_prove_dual_pass`**（PROVE `a1f3614` · POST `67050c0`/`a41c575` · Q4/Q5 EXIT 0/0 @`66a77ed` · Redis unset · PG LISTEN retained）· **GAP stays OPEN** · prove EXIT 同列绿 **禁止**宣称 MODEL-OP/SLO/cutover 已关；**#102 域 cutover 仍须独立审** · **≠** MODEL-OP domain closed | … | **OPEN** · AN-MOP-Q45 nail `post_prove_dual_pass` · Ban MODEL-OP closed · Ban Redis cutover · **cutover 另 REQUEST** | … |

后继钩子即原文中的两处：**「#102 域 cutover 仍须独立审」** 与 **「cutover 另 REQUEST」**。

## 1. 「:76 successor」解读（implementer 解读 · 双审裁决点）

**解读（一句话）**：`:76` successor = backlog 条目自留的「cutover 另 REQUEST + #102 域 cutover 仍须独立审」路径——本刀只把该后继 **立卷**（docs 定义未来 cutover REQUEST 必须满足的独立评审合同与离线 prove 计划），**不执行任何切流**、不宣称 MODEL-OP closed、PG LISTEN retained。

**裁决点（留给 PRE dual）**：

1. **D1 · 范围口径**：successor cutover 面按 `:76`/W5/AN-MOP-Q45 锚在 **wakeup + 双 reconciler 同列门**（GAP-MOP-01/BUG-NOTIFY-REC 同列 cite）；GAP-MOP-02（claim/lease Q2/Q3）是独立行、拟切片独立——本刀按「不含 GAP-MOP-02」理解，若双审判须并入须显式改写。
2. **D2 · 独立审规格**：`:76` 说「独立审」，BUG-REV-COND 说切流前须「ADR 隐私 prove 清单全绿 + 四专家审 · 禁止自批」。本刀按**不降级**理解：未来 cutover REQUEST 的评审规格 ≥ PRE/POST dual（mw-model-op + mw-e2e-ha），且四专家审要求原样保留；不得因本刀立卷而降为双审即切。
3. **D3 · Redis 语义**：Ban Redis cutover 指本刀**不切流**；Redis Streams 选型文档（`m3-queue-wakeup-selection.md` · `harness/redis-streams-wakeup.prototype.md` · INFLIGHT:redis-wakeup-wip flag 旁路原型）为**只读 cite**，本刀不启 flag、不写 Redis prove 授权。

## 2. 本刀范围（docs · 授权后可执行面）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **立卷** | 书面定义 successor cutover REQUEST 的准入合同（见 §2b） | `:76` OPEN · Ban 借立卷宣称 cutover 已开 |
| **独立审** | 钉独立评审路径：PRE dual + POST dual + AUTHORIZE +（切流前）BUG-REV-COND 四专家审 | alone ≠ dual · Ban self-approve |
| **Wakeup** | **PG LISTEN/NOTIFY** `meetwise_worker_wakeup_v1` **retained** · Redis wake 另轨（not STOPPED · flag 默认关） | Ban 本刀删 PG LISTEN · Ban Redis cutover |
| **口径钉** | `actualSpendCny=null` · 两本账分离沿 I 线 · `releaseEvidence=false` | 费率非承诺 |

### 2b. successor cutover REQUEST 准入合同（本刀书面钉 · 全部 docs）

未来 cutover REQUEST（另 REQUEST · 非本刀）至少须同时满足：

1. **双 reconciler 同列门**：Q4 `pnpm model-invocation-reconcile:prove` **与** Q5 `pnpm model-op00-usage-reconciler:prove` 同列绿（单绿 ≠ 双门关 · 沿 AN-MOP-Q45 口径）。
2. **wakeup prove + 强制周期 reconcile**（GAP-MOP-01 / BUG-NOTIFY-REC 原文要求）：Redis Streams hint 切流须 wakeup prove + periodic reconcile 证据；旧 `worker-wakeup:prove` 语义按 PG 层标注，不得冒充 Redis cutover。
3. **flag 默认关 → 审后开**（GAP-MOP-01 拟切片原文）：`MEETWISE_WAKEUP_REDIS_STREAMS` presence-only 语义保持；本刀 **unset**。
4. **PG LISTEN retained** 直至 cutover REQUEST 经 PRE dual + AUTHORIZE（+ D2 评审规格）落地；Ban 静默摘除。
5. **独立审**：≥ PRE/POST dual（mw-model-op + mw-e2e-ha）+ BUG-REV-COND 四专家审（D2 · 不降级）。
6. **两本账分离沿 I 线**：estimated 与 actual 分离 · `actualSpendCny` 仅 console-cited actual 可写（今日 **null**）· 费率非承诺（I 线 `model-op-spend-ledger-offline(-i2)` · nail `e09a39f`）。

## 3. 相关历史（只读 cite · 零改写）

| 来源 | 口径 |
|------|------|
| AN-MOP-Q45 nail | REQUEST `d269761` · PRE dual mw-model-op `e2db4bc` + mw-e2e-ha `66a77ed` · PROVE `a1f3614` · Q4/Q5 EXIT **0/0** @`66a77ed` · Redis **unset** · PG LISTEN **retained** · POST dual `67050c0`+`a41c575` · `:76` OPEN |
| W5 docs honesty | `w5-model-op-dual-reconciler-wakeup.slice.md` · `post_prove_dual_pass` · dual `25833fc` · prod PG LISTEN/NOTIFY provisional keep · Redis wake deferred / **not STOPPED** · ≠ MODEL-OP fake green |
| MODEL-OP-wire | `model-op-real-reconciler-wiring.slice.md` · `post_prove_dual_pass` · prep dual `0137f39` · coding+prove `6cd621c` EXIT 0/0/0 · **≠** SLO/cutover · PG LISTEN retained |
| I 线 | `model-op-spend-ledger-offline.slice.md`（base `315870e`）+ I2（base `60cb927` · named proves 未跑）· nail **`e09a39f`**（`pre_exec_dual_pass` · mw-model-op `e8c1892` + mw-e2e-ha `cd38adc` @REQUEST `8ea17f7` · docs status only · 非 coding 授权）· 两本账分离 · `actualSpendCny=null` · 费率非承诺 |
| Line C live 口径 | G7-LINEC-LIVE-POST-DUAL `post_live_dual_pass` · **one settled chat wiring call ≠ suite green ≠ G7 green** · 收据≠prove SHA · not_run 不计 pass —— 本刀沿此口径：任何 wiring 级 EXIT0 不得洗成 suite/域 close |
| GAP-MOP-01 / BUG-NOTIFY-REC | 选型已钉 Streams 优选 · 切流须 wakeup prove + 周期 reconcile · 本绿 ≠ 已迁 · flag 默认关→审后开 |
| BUG-REV-COND | 切流/放弃 RLS 仍 block · ADR 隐私 prove 清单全绿 + 四专家审 · Ban 自批（D2） |

## 4. 离线 prove 计划（named · **本 REQUEST 零执行**）

| Command | State | 说明 |
|---------|-------|------|
| `pnpm model-invocation-reconcile:prove`（Q4） | 已存在 · 本 REQUEST **不跑** | successor 双门之一 |
| `pnpm model-op00-usage-reconciler:prove`（Q5） | 已存在 · 本 REQUEST **不跑** | successor 双门之二 |
| `pnpm worker-wakeup:prove`（可选 · PG 层） | 已存在 · 本 REQUEST **不跑** | PG-unit layer · ≠ Redis cutover（C-E2E-3 口径） |
| Redis Streams wakeup prove | **不命名 · 不授权** | 属未来 cutover REQUEST 自带 · Ban Redis cutover 本刀 |

本 REQUEST 不新增脚本、不改 `package.json`、不跑任何 prove。命名以上命令仅为双审 clarity（I2 先例：**named proves ≠ coding/prove 授权**）。

## 5. EXIT 契约（预声明 · 适用于未来授权后的 prove · 本 REQUEST 零执行）

- **attempts 全记录**：每次 prove 尝试逐条入 receipt（attempt 序号 · Asia/Shanghai 时间窗 · code SHA · EXIT 值）；失败与成功同列入账。
- **诚实失败路径**：EXIT≠0 → 原样记录 → 判 fail → **Ban retry-to-green**（GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 先例：记录每次 attempt，单次后绿不关因）。
- 预声明单次 attempt 窗口；如需重跑须新 REQUEST + 双审。
- **EXIT0 ≠** MODEL-OP closed ≠ SLO ≠ cutover ≠ HA ≠ suite green ≠ covered（Line C 口径：wiring 级绿 ≠ suite）。

## 6. Pins（原值全抄 · retained 写死）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **public DELETE=503** · **PG LISTEN retained** · `actualSpendCny=null` · 两本账分离沿 I 线

## 7. Ban 列表

- **Ban coding**（本刀 docs-only）· **Ban prove execution** · **Ban live**（无 Key/网络/付费/控制台 spend）
- **Ban Redis cutover**（wakeup / queue / claim 切流 · flag 开启 · Redis prove 授权）
- **Ban MODEL-OP closed claim** / SLO forge / fake green / `:76` flip CLOSED
- **Ban 删除/绕过 PG LISTEN** without separately authorized cutover REQUEST
- Ban #102 cutover 借本刀合入叙事 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级（D2）
- Ban SSOT edit（backlog / matrix / checklist 本刀零改）· Ban 碰 sibling AN 文件（PRIV-EXT / PERF-TEAR / RAG-R3 / AO COND body）
- Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push（本刀禁 push）

## 8. Non-claims

docs-only REQUEST 立卷 · not MODEL-OP closed · not SLO · not Redis cutover · not #102 cutover · not HA · not suite green · not `releaseEvidence=true` · PG LISTEN retained · `:76` OPEN · alone ≠ dual · PASS ≠ coding ≠ prove ≠ AUTHORIZE

## Review stubs

| Expert | Stub |
|--------|------|
| `mw-model-op` | `reviews/REQUEST-2026-10-06-gap-mop-03-successor-mw-model-op.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-gap-mop-03-successor-mw-e2e-ha.md` |

**Pre-exec dual BOTH PASS（2026-10-07 · mw-model-op `16f2c684` + mw-e2e-ha `fa2f667e`）· 执行已按协调方 AUTHORIZE 落盘（docs-only lifecycle 推进）· 本 REQUEST 仍不授权 coding / prove / 切流；POST dual + 协调方 AUTHORIZE 前 Ban nail / Ban SSOT 登记。**

*Harness · GAP-MOP-03 :76 successor（cutover/independent review 立卷） · 2026-10-07 · `executed:awaiting_post_prove_dual` · 零 coding · 零 prove 执行 · Ban Redis cutover · Ban MODEL-OP closed · PG LISTEN retained · `:76` OPEN · alone ≠ dual · STOP（awaiting POST dual）*
