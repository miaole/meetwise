# POST-PROVE · GAP-UC052-POOL-ROLE-LEAK · mw-e2e-ha

**Reviewer**: `mw-e2e-ha` · **Date**: 2026-10-02 ~21:03 PT  
**Pair**: `mw-privacy-int` · **不代签** · alone≠dual  
**Pre-exec**: `685272e` · REQUEST `2a0cc3a` · nail `913f21d`  
**Code**: `ab96a02` / `ab96a0299d8836a635077f8bf9b61a7891aa583f`（on origin）  
**Receipts**: `522590d` / `522590daf7a3098fba8fbad8f5318f4f760661bd`（on origin）  
**Prove SHA claimed**: `9b39a20` / `9b39a20d6b53d10ac95be880037a3e716126f715`  
**Scope**: `/workspace/meetwise` only · Ban Meridian · Ban `.env*` · Ban product edit · 本文件 only  
**Line A**: HOLD · 未写 Line A 结论 · 未改 `REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md`

## Pins（retained · 未翻转）

| Pin | Value |
|-----|-------|
| haStatus | NOT_HA |
| releaseEvidence | false |
| claimProductionHA | false |
| gR45Closed | true |
| coveredCount | 8 |
| ms3EqualsR4Closed | false |
| Stack | PG-retained |
| Public DELETE | 503 |
| PASS 含义 | ≠ covered · ≠ nail · ≠ next knife · alone≠dual |

## 0. 结论（非末行）

| Key | Value |
|-----|-------|
| 判定 | **PASS**（绑定条件在代码+本轮新鲜 EXIT 上成立；C-FLAKE-ROOT 诚实保持 mitigated/cause-unknown，未宣称 fixed） |
| blockers | **NONE** |
| authorizeCoding / covered / nail / next | **false** |
| 代签 mw-privacy-int | **否** |

**3-line 中文摘要**:
1. `ab96a02` 在 origin 上；产品释放路径是 `SET ROLE NONE` + 三 GUC 清空，失败则 `release(err)` 销毁连接，不是把 session `SET ROLE` 留在池里。新鲜 `pool-role-leak` EXIT=0（同 pid 复用且 role/GUC 已清；中途异常不泄漏；reset 失败换 pid）。
2. 负对照不是空崩溃：`913f21d` 本身无该 prove 脚本；scratch `f0800e4`（parent=`913f21d`，connect/release 泄漏路径未改，仅 no-op 测试钩子）新鲜 EXIT=1，同 pid 仍是 `app_role` 且三 GUC 残留。
3. 账本 v1 两败保留（cold#5 ECONNREFUSED；warm#2 实为 23505 而非 ECONNREFUSED），v2 20/20 EXIT=0 且未写 fixed；`packages/db` tsc 仍 6；DELETE 503 与 coveredCount=8 未洗。9b39a20 不在 origin，但与 `ab96a02` 的产品/测试/脚本 blob 相同。

## 1. Ancestry / 范围（Task 1）

| SHA | On `origin/feat/mysql-schema-skeleton` | Note |
|-----|----------------------------------------|------|
| `ab96a02` | YES ancestor | 产品 type-only + prove snapB · parent `b82b9bc` |
| `522590d` | YES ancestor | docs receipts only · parent `ab96a02` |
| `9b39a20` | **NO**（无分支包含） | parent `00d53ed` · 与 `ab96a02` 同 message/author-date · **孤儿** |
| `913f21d` | YES ancestor | nail |
| `f0800e4` | **NO** | parent `913f21d` · message 写明 scratch do not push |

`git diff 9b39a20 ab96a02 -- apps/worker packages/db scripts package.json` = **空**。全树差异仅 docs：`PARALLEL-DISPATCH-2026-10-02.md` + `uc018-receipt-backfill/*`（`ab96a02` 多这些；`9b39a20` 没有）。prove 相关 blob 相同，故在 `9b39a20` 跑 prove，`runnerCommitSha=9b39a20` 与声称一致，**不是** receipts-only 错位。

`git log --stat 913f21d..522590d` 混有他线（UC018 backfill、G7），本刀产品/测试：

| Commit | 类 | 文件 |
|--------|----|------|
| `ee08ed5` | product+test+script | `checkpoint-principal.ts` · pool prove · checkpoint-physical 扩展 · `run-e2e-isolated.mjs` |
| `366e82d` | test | pool prove 不再二次 migrate |
| `0143cd0` | product | 曾 DISCARD ALL |
| `71ec253` | product | 改为 SET ROLE NONE（废 RESET/DISCARD 作为唯一清理） |
| `3d0c71e` | test+script | pre-prove Running/ready |
| `ab96a02` | product+test | type-only `releaseAsync` + snapB（2 files） |
| `522590d` | docs | receipts + flake ledger |

## 2. SET ROLE NONE / destroy-on-failure（C-SET-LOCAL-TXN）

未选 SET LOCAL 作为主修复（注释写明 PostgresSaver autocommit `pool.query` 无事务，SET LOCAL 会在读路径自动失败）。`apps/worker/src/checkpoint-principal.ts` @`ab96a02`（blob 同 `9b39a20`）：

- 检出仍是 **session** `SET ROLE app_role` + `set_config(..., false)`：L141–144。这是使用期绑定，不是释放后残留。
- 释放清理：L79 `SET ROLE NONE`；L80–82 `set_config(key, '', false)` 清三个 GUC。注释 L74–78：`RESET ROLE` 对 `-c role=app_role` 是 NO-OP，`DISCARD ALL` 会把 startup role 设回来。本轮新鲜 NEG 证明 `current_user` 回到 `session_user`（不是留下 `app_role`）。
- 销毁：L101–103 reset 抛错则 `originalRelease(err)`；L94–96 调用方传入 err 也直接销毁；L148–150 `connect()` 半绑定失败 `client.release(true)`。
- `query()` L159–161 **await** `releaseAsync`。`client.release` L112–114 对 PostgresSaver 仍是 sync void（不把未清理连接还池：`originalRelease` 在 cleanup 之后）。`max=1` 时下一次 checkout 要等这次还池。

产品 `apps/*/src` + `packages/*/src` 里仍在的 session `set_config(..., false)`：本文件 L81/L142–144，以及 `packages/db/src/migrate.ts` L270/L280（timeout，migrate-only，pre-exec 已列 out-of-scope）。`packages/db/src/principal.ts` L535 `RESET ROLE` 在 SET LOCAL 事务的 finally，不是本池门面。无第二处无清理的 session `SET ROLE` 产品路径。

GUC 清的是空串不是 NULL。prove 用 `nullif(..., '')`（proof L54–56）把空串当已清。不是残留 owner/thread/epoch。未把空串升为 blocker。

## 3. 新鲜 CMD | EXIT（Task 2–3）

Worktree `/workspace/mw-rv-pool` @`9b39a20`，`pnpm install --frozen-lockfile`，porcelain before=after=空。串行、隔离 PG。跑完已删 worktree 与容器。

| CMD | Claim | Fresh EXIT | runnerCommitSha / 要点 |
|-----|-------|------------|------------------------|
| `pnpm uc052:pool-role-leak:prove` | 0 | **0** | `9b39a20d6b53d10ac95be880037a3e716126f715` · factory `PrincipalBoundCheckpointPool` · `maxEnv=1` · 5/5 exact |
| `pnpm uc052:checkpoint-physical:prove` | 0 | **0** | 17/17 exact · unsealed 三案 42501 · unchanged=true |
| `pnpm uc052:internal-erasure:prove` | 0 | **0** | NHP-050-NEG-01 `httpStatus=503` |
| `pnpm privacy-authorization:prove` | 0 | **0** | 本轮单次；不把单次绿写成 flake fixed |
| `pnpm eval-harness-matrix-cite:prove` | 0 | **0** | 末行 `CMD=... EXIT=0` · 注明 ≠ covered |
| mutation scratch `pnpm uc052:pool-role-leak:prove` @`f0800e4` | 1 | **1** | 见下 · **非**无关崩溃 |

Pool 新鲜断言（同日志）：

- `NHP-POOL-NEG-01` samePid=true · `currentUser=sessionUser=pool_leak_rt_*` · principal/thread/epoch null
- `NHP-POOL-FAULT-ABORT` 同 pid 仍干净（中途 `BEGIN` + session `set_config` 后 throw）
- `NHP-POOL-FAULT-RESET-DESTROY` pid 149→150 destroyed=true
- `HP-POOL-01` 随后 B 仍能绑 `app_role`
- `C-CASECOUNT` exact match

### 负对照（非空）

纯 `913f21d` **没有** `uc052:pool-role-leak:prove`（`package.json` grep NO_SCRIPT）。若只因缺脚本得到 EXIT=1，那是空负对照。实际负对照是已存在对象 `f0800e4`（parent `913f21d`，不在 origin）：

- `checkpoint-principal.ts` 相对 `913f21d` 只加 no-op `__setCheckpointPrincipalCleanupOverrideForTest` + `underlyingPool` getter。`connect()` 仍是 L51–54 session `SET ROLE` + `set_config(..., false)`，`finally` 只 `client.release()`，**无** SET ROLE NONE。
- prove 文件与 `9b39a20` **无 diff**。
- 新鲜 EXIT=1：`NHP-POOL-NEG-01` samePid=true clean=false，after `currentUser=app_role` 且 principal/thread/epoch 仍是 A；`FAULT-ABORT` 同样残留；`RESET-DESTROY` destroyed=false 同 pid。这是角色泄漏被测到，不是启动崩溃。

## 4. 绑定条件

| ID | 判定 | 依据 |
|----|------|------|
| C-BLEED-REAL-POOL | **MET** | 真工厂：proof L100–108 `createCheckpointer(connection, true)` + `PGPOOL_MAX=1` → `createPool`（`principal.ts` L837–843）→ `PrincipalBoundCheckpointPool`（`main.ts` L115–116）。不是手写 `pg.Client`。下一次 checkout 读 `current_user` + 三 `current_setting(..., true)`。同 pid。负对照 EXIT=1 且是泄漏。中途异常案 EXIT 路径上仍干净。 |
| C-SET-LOCAL-TXN | **MET**（走的是 NONE+销毁，不是更弱的残留 SET ROLE） | 见 §2。SET LOCAL 分支未选用，故不要求 BEGIN/第三参 true 作为主路径。`asPrincipal` 仍是 BEGIN+SET LOCAL+true（`principal.ts` L864–866），与本门面分开。 |
| C-UNSEALED-NEG | **MET** | `uc052-checkpoint-physical.proof.ts` L46–48 三案；L686–776。`0091_privacy_authorization_issuer.sql` L369–374：NULL epoch → `privacy_authorization_epoch_mismatch` / NULL digest → `digest_mismatch`，ERRCODE `42501`。both 走 epoch 分支（先检查 epoch）。新鲜：三案 `sqlState=42501` `claimed=false` `unchanged=true`。不是只 `rejects()`。 |
| C-FLAKE-ROOT | **OPEN · mitigated/cause-unknown · 未宣称 fixed** | 见 §5。可接受的未关闭项。 |
| C-CASECOUNT | **MET**（本刀 + checkpoint prove） | pool proof L250–256 missing **且** extra → fail。checkpoint L886–892 同。新鲜两处 `exact match`。 |
| C-EXIT-DISCIPLINE | **MET** | 本轮命令无 `\|\| true`。prove `process.exit(failures===0?0:1)`（pool L289–292）。失败 catch 走 `process.exit(1)`（L295–298）。`runnerCommitSha===HEAD===9b39a20`。独立 worktree，porcelain 前后空。`tsc -p packages/db --noEmit` **6** 条 `error TS`（tsc 进程退出码 2，与有错一致），未高于基线 6。 |
| C-NO-SCOPE-LAUNDER | **MET** | `privacy.controller.ts` L51–60 `@HttpCode(SERVICE_UNAVAILABLE)`；`privacy.service.ts` L53–67 抛 503。`git diff 913f21d ab96a02` 这三文件无差异。checkpoint 新鲜 `NHP-052-CKPT-NEG-03 httpStatus=503`；internal `NHP-050-NEG-01 httpStatus=503`。`coveredCount=8` 仍在 `scripts/uc-e2e-018-covered-criterion.proof.mjs` L643/L683 等。cite 仍写 partial≠covered。本 PASS 不抬 covered。 |

披露（不升 blocker）：`uc052-internal-erasure.proof.ts` L490–491 的 C-CASECOUNT 仍是 **missing-only**（文案 `all present`），本刀未改该文件。本轮发出的 case 集合与 required 一致，没有靠 extra 洗绿。不把该旧证明说成 exact==。

## 5. 账本（Task 4）· 未称 fixed

Committed `522590d` `privacy-authorization-flake-ledger.jsonl`：逐条对照 log 的 `ELIFECYCLE`。

- v1 @`71ec253`：**两败保留**。cold n=5 exit=1，`logs/cold-5.log` `ECONNREFUSED 127.0.0.1:33047`。warm n=2 exit=1，`logs/warm-2.log` **不是** ECONNREFUSED，是 `23505` `interview_pkey` 重复键（warm 复用已有行）。cold 1–4 与 warm 1 为 0。
- v2 @`3d0c71e`：cold_v2 10/10 exit=0，warm_v2 10/10 exit=0，log 内无 ELIFECYCLE。**20/20**。抽查 warm-v2-1/2 与 cold-v2-1 各自是**新容器**（端口 33060/33061/33050），“warm”标签不准确，实质是又 10 次冷启动，没有重打 23505 的复用库路径。
- prove tip 另有 1 次 authz @`9b39a20` exit=0。本轮又跑 1 次 EXIT=0。
- 散文 `2026-10-02-uc052-pool-role-leak-prove.md` L6/L33–34：`mitigated / cause-unknown`，`Ban "fixed"` / `Ban claim fixed`。L27 的 “fixed” 是 tsc 从 7 降到 6，**不是** flake fixed。证据 JSON `authzFlake.status=mitigated/cause-unknown` `banClaimFixed=true`。

根因未收成单一修复：冷启动 ECONNREFUSED 与 warm 23505 是两件事；v2 未复现 warm 复用失败。状态保持 **unexplained flake mitigated / cause-unknown**，**不是 fixed**。符合「不能复现则不得称 fixed」。

## 6. tsc / porcelain

| Check | Result |
|-------|--------|
| 方法 | `pnpm exec tsc -p packages/db --noEmit --pretty false` @`9b39a20` |
| `error TS` 计数 | **6**（基线 6 · 零新增） |
| 进程退出 | 2（有错时的 tsc 退出，不是证明被吞） |
| porcelain before/after prove 与 after tsc | 空 |
| 容器 | 跑完 `docker ps` 无 `meetwise-e2e*`；worktree 已 `git worktree remove --force` |

## 7. 不在本判定里

- 不代签 `mw-privacy-int`。
- 不写 Line A。
- 不把本 PASS 写成 covered / nail / next knife。
- origin 上另有 `NOTE-CKPT-UNSEALED-CLAIM-NEG` REQUEST（`a1a06ab`）· **未审、未签**。本文件的 C-UNSEALED-NEG 只覆盖已落地的 checkpoint prove 三案。

Verdict: PASS
