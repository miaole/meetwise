# DBACL-2 rerun wave 收据 —— 六 prove 面 EXIT 原值（mw-core EXEC · 2026-10-08 20:37 +0800）

- 席位：mw-core（EXEC · rerun wave · 只跑 prove 面收据不改产品码）。
- 环境：主线 worktree `/Users/miaole/Desktop/golucky/meetwise` · 分支 `feat/mysql-schema-skeleton` · tip `5d398dab`（收据落盘前零位移）· 本地 docker 隔离 PG（run-e2e-isolated 每面独立容器 · migrate `applied=144 skipped=0`）。
- 靶键亲查（root package.json 实存）：`ctx03-event-source:prove` / `ctx04-compression-snapshot:prove` / `ctx05-concurrency-recovery:prove` / `ctx06-deletion-closure:prove` / `mem02-summary:prove` / `mem03-summary-tree:prove`（均 `run-e2e-isolated → pnpm -C packages/db prove:<name>`）。
- **前提缺陷（重大 · 如实上报 · 未自行修复）**：任务前提称主线 tip 5d398dab「已含 0150 uuidv7 GRANT×8 与 0151 pgp_sym_encrypt GRANT」——**亲验不成立**：`git ls-tree HEAD packages/db/migrations/` 止于 `0143_db_id_v7_unify.sql`+`0143_sse_push_notify.sql`（无 0144+）；`git merge-base --is-ancestor` 亲验 `83ebcead`/`2628fe39`（0150）、`0ec543d0`（0151）、`bfa06bd3`（dbsb1 复跑基）均 **NOT ancestor of HEAD**。0151 现存 `line/db-pgp-acl` 支、0150 现存 `line/db-uuidv7-acl` 支，未合入本支。故六面在主线环境跑出的是「无 0150/0151」的真红，非修复后面。
- 环境前置 attempts 账（dbsb1 先例口径：工具坏 run=无效 attempt）：ctx03 run-1 spawn 即崩 `ERR_MODULE_NOT_FOUND: @meetwise/qdrant-store`（本 worktree 安装态陈旧·`packages/db/node_modules/@meetwise/` 缺链接·零断言触达）→ 仅做 `pnpm install --frozen-lockfile --prefer-offline`（EXIT=0 · 锁文件冻结 · 零 tracked 文件改动 · 非产品码）→ 六面计数 run 各一次、红后未重跑（ mandate①「禁重跑」遵守）。

## 六面终态表（EXIT 原值 · 单次计数 run）

| # | 面 | pnpm 键 | EXIT | 域级 PASS（计数+摘录） | 红因（原样） | runner 收据落盘 |
|---|----|---------|------|------------------------|--------------|-----------------|
| 1 | ctx03-event-source | `ctx03-event-source:prove` | **1** | 6 PASS：「域: category 枚举冻结（6 值最小集）」「域: source 枚举冻结 user/model/tool/system」「域: status 枚举冻结 active/privacy_fenced/purged（单向）」…「域: checkpoint 引用版本 ref_version=1」 | `error: permission denied for function pgp_sym_encrypt`（42501 · 域级块后首个 PG 写段即断） | ENOENT：`packages/db/src/context/ctx03-event-source.ts` |
| 2 | ctx04-compression-snapshot | `ctx04-compression-snapshot:prove` | **1** | 6 PASS：「域: status 枚举冻结 draft/active/superseded/fenced/purged」「域: 状态机白名单长度=6（单向 6 条跃迁）」「域 span: canonical = utf8_byte:start:end」 | 同型 `permission denied for function pgp_sym_encrypt` | ENOENT：`packages/db/src/context/context-compression-snapshot.ts` |
| 3 | ctx05-concurrency-recovery | `ctx05-concurrency-recovery:prove` | **1** | 5 PASS：「域: reject reason 枚举冻结 9 值」「域: dispatch 状态机白名单长度=5（单向 5 条跃迁）」「域: 合法跃迁通过（claimed→dispatching / dispatching→committed / dispatching→unknown / claimed→discarded）」 | 同型 `permission denied for function pgp_sym_encrypt` | ENOENT：`packages/db/src/context/context-compression-dispatch.ts` |
| 4 | ctx06-deletion-closure | `ctx06-deletion-closure:prove` | **1** | 1 PASS：「域: 压缩删除 sink 枚举冻结 snapshot + dispatch」 | 同型 `permission denied for function pgp_sym_encrypt` | ENOENT：`packages/db/src/context/context-compression-erasure.ts` |
| 5 | mem02-summary | `mem02-summary:prove` | **1** | 11 PASS：「域: kind 枚举冻结 turn_summary/segment_summary」「域: sink 枚举 pin memory_summary」「域: 写分离守护 producerClass≠summarizer 拒」「域: 写分离守护 status≠draft 拒（模型输出绝不 direct active）」… | 同型 `permission denied for function pgp_sym_encrypt` | ENOENT：`packages/db/src/memory/memory-summary.ts` |
| 6 | mem03-summary-tree | `mem03-summary-tree:prove` | **1** | 9 PASS：「域: SUMMARY_TREE_KINDS 冻结 turn_summary/segment_summary/session_episode」「域: episode 直接引 turn（跨层）拒」「域: 树 digest 确定性（同输入同输出）」「域: 写分离守护 status≠draft 拒（父节点也不 direct active）」… | 同型 `permission denied for function pgp_sym_encrypt` | ENOENT：`packages/db/src/memory/memory-summary-tree.ts` |

- 六面红签名 **完全同型**：全部在域级（domain 纯函数）PASS 块之后、进入隔离 PG 写路径的第一个 `pgp_sym_encrypt` 调用点断 `42501 permission denied`——即 DBACL-2 N2 面（0108 会话事件加密持久化链）**未获 0151 GRANT 的既存红**，与「本环境无 0151」的前提缺陷核验互为印证。
- **uuidv7（0150）面本轮不可观测**：六面均在先于 uuidv7 暴露段的 pgp 段即断，无法给出 0150 面在主线环境的红/绿判词（如实记：不可判定，非绿证）。
- 预期「转绿」未达成的原因即前提缺陷本身（0150/0151 未在主线 tip），非面级回归、非本轮可修项；按 mandate 禁重跑、禁 cherry-pick 合入（属协调方裁定）。

## runner 收据源路径基线缺陷（E4 同型 · 亲测全六面复现 · 不修）

- `scripts/run-e2e-isolated.mjs` 六面收据源清单引用 **不存在的目录族**：`packages/db/src/context/*`（ctx03/ctx04/ctx05/ctx06）与 `packages/db/src/memory/*`（mem02/mem03）——六路径逐一亲验 MISSING（真实同名校 `packages/db/src/ctx03-event-source.ts` 存在，其余同理散落于 `packages/db/src/` 平铺）。
- 后果亲测：六面红时 runner 收据落盘全部 `LOCAL_ISOLATED_PROOF_RECEIPT_FAILED reason=ENOENT`（上表末列逐面原样）→ 本轮六面均无 runner 侧收据文件，以本手写收据 + 原始日志 EXIT 原值替代。
- 归属：收据层路径修正小刀（预登记项 · DIR-1 E4 同型），本轮未动一行 runner 码。

## Pins（十值照抄 · 未翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null.

## 残余 / 待协调方裁定

- [ ] 前提缺陷：0150（`line/db-uuidv7-acl`）与 0151（`line/db-pgp-acl`）未在主线 `feat/mysql-schema-skeleton`——rerun wave 若要产出「转绿」判词，须先由协调方裁定合入/换靶环境后重开新波（本轮按 mandate 未合入不重跑）。
- [ ] 收据层路径缺陷（六面 ENOENT · E4 同型小刀）维持 OPEN。
- [ ] `g7SuiteGreen=false` 维持。
- 预算：0 live 模型调用 · 0 Key · `actualSpendCny=null` · 全本地 docker PG。

Status: rerun-wave:STOP · awaiting_coordinator.

---

# 第二轮段 —— EXEC 面合入后六 prove 面复跑收据（mw-core EXEC · 2026-10-08 20:50 +0800）

- 席位：mw-core（EXEC · 补救收账：W2 五刀+DBACL 两刀 EXEC commit 按让位序 cherry-pick 进主线 · 协调方正式授权 · 本轮只搬运已 dual 批 EXEC 面零产品语义改动）。
- 环境：主线 worktree `/Users/miaole/Desktop/golucky/meetwise` · 分支 `feat/mysql-schema-skeleton` · 基线 `7e5eb9a5`（第一轮段 tip 5d398dab 之上）· 本地 docker 隔离 PG（run-e2e-isolated 每面独立容器 · 每面 `migrations: applied=152 skipped=0` 亲验逐面一致）。
- 前提修正：第一轮段「前提缺陷」（主线无 0150/0151）由本轮 cherry-pick 链修复——六刀 EXEC commit 按让位序入主线：DBTF-1 `350cea57`→`356d6026`+`272a92bf`→`dca911cf` · DBHY-1 `1ab83bd8`→`ea4e5796` · DBFK-1 `4ca1ffa1`→`eca9b052` · DBM3-1 `8097f2d8`→`847da01f` · DBACL-1 `1caf7f32`→`889c324b`+`db941542`→`02f487e2` · DBACL-2 `0ec543d0`→`c5b953a7`+`650b018e`→`419f85f1`。wiring 冲突一律 union 双保留（DBM3-1 三处先例同型）；各刀实质面（migrations/prove/sql/src）patch-id 与原 commit 逐刀全等亲验。
- 验证四件亲验：①九 commit 全为 HEAD 祖先（让位序）；②migrations 目录 152 文件（144 基数+0144~0151 八新）；③`pnpm migrate:prove` EXIT=0 38/38（含「再部署:全迁移 skip」零漂移+0121 checksum 不可漂移断言·六面日志逐面 `applied=152 skipped=0` 原值）；④`node --check scripts/run-e2e-isolated.mjs` + 两 package.json JSON parse 全过。

## 六面终态表（第二轮 · 单次计数 run · 各恰一次未重跑）

| # | 面 | pnpm 键 | EXIT | 域级+DB 级断言 | prove 面判词 | 红因（原样） |
|---|----|---------|------|----------------|--------------|--------------|
| 1 | ctx03-event-source | `ctx03-event-source:prove` | **1** | **63 PASS / 0 FAIL** | **✓ 不可变会话事件源(CTX-03) DB 证明通过** | 仅收据层：`LOCAL_ISOLATED_PROOF_RECEIPT_FAILED reason=ENOENT .../packages/db/src/context/ctx03-event-source.ts` |
| 2 | ctx04-compression-snapshot | `ctx04-compression-snapshot:prove` | **1** | **40 PASS / 0 FAIL** | **✓ 可验证压缩快照(CTX-04) DB 证明通过** | 仅收据层：同型 ENOENT `.../src/context/context-compression-snapshot.ts` |
| 3 | ctx05-concurrency-recovery | `ctx05-concurrency-recovery:prove` | **1** | **79 PASS / 0 FAIL** | **✓ 并发与故障恢复(CTX-05) DB 证明通过** | 仅收据层：同型 ENOENT `.../src/context/context-compression-dispatch.ts` |
| 4 | ctx06-deletion-closure | `ctx06-deletion-closure:prove` | **1** | **27 PASS / 0 FAIL** | **✓ 撤回、过期和删除(CTX-06) DB 证明通过** | 仅收据层：同型 ENOENT `.../src/context/context-compression-erasure.ts` |
| 5 | mem02-summary | `mem02-summary:prove` | **1** | **58 PASS / 0 FAIL** | **✓ 单轮与区间摘要(MEM-02) DB 证明通过** | 仅收据层：同型 ENOENT `.../src/memory/memory-summary.ts` |
| 6 | mem03-summary-tree | `mem03-summary-tree:prove` | **1** | **42 PASS / 0 FAIL** | **✓ 多层会话摘要树(MEM-03) DB 证明通过** | 仅收据层：同型 ENOENT `.../src/memory/memory-summary-tree.ts` |

- **pgp 面（0151）全解锁转绿**：六面日志 `42501`/`permission denied` **零出现**（第一轮段六面统一 `42501 permission denied for function pgp_sym_encrypt` 红签名全清）；第一轮段断点位置（域级块后首个 PG 写段）本轮全部 PASS——ctx03「② 幂等: 同 event_key 重放 → replayed=true」「⑤ 恢复: replay 的 digest 与 append 时 SQL 侧 digest 一致」、mem02「① draft: source_range_digest 与 domain 逐字节一致（TS↔SQL）」等加密持久化链断言逐条过门。
- **uuidv7 面（0150）全解锁转绿**：第一轮段「不可判定」（pgp 段先断遮蔽）——本轮六面 INSERT/append 写路径断言全 PASS（uuidv7 DEFAULT 求值不再 42501），可判定=绿。
- **六面 EXIT=1 全因第一轮段已登记的收据层路径缺陷**（收据源引用 DIR-1 后不存在的 `src/context/*`·`src/memory/*` 平铺路径族 → runner 收据落盘 ENOENT）——**非 prove 面红、非本轮新缺陷、维持 OPEN 待收据层小刀**（E4 同型·本轮未动一行 runner 码）。六面 prove 主体均以「✓ … DB 证明通过」句收尾（ELIFECYCLE EXIT=1 发生在 ✓ 行之后的收据落盘段）。

## Pins（十值照抄 · 未翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null.

## 残余 / 待协调方裁定（第二轮段）

- [ ] 收据层路径缺陷（六面 ENOENT · E4 同型小刀）维持 OPEN——prove 面已全绿，仅 runner 收据文件不可落盘。
- [ ] `g7SuiteGreen=false` 维持。
- [ ] 本轮六面 EXIT=1 是否计「绿」归协调方裁定（prove 主体全绿+✓ 句在卷 vs EXIT 码原值=1 如实记）。
- 预算：0 live 模型调用 · 0 Key · `actualSpendCny=null` · 全本地 docker PG。

Status: rerun-wave:round2:EXEC-landed · prove faces all-green (0 FAIL ×6 · 42501 zero) · EXIT=1 receipt-ENOENT only · pushed awaiting_coordinator.
