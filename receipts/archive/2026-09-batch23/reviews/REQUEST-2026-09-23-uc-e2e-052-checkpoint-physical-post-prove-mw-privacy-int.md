# POST-PROVE 独立审查 · UC-E2E-052 checkpoint 物理清除（Line B · 第二刀）

| 字段 | 值 |
|------|-----|
| 角色 | `mw-privacy-int` |
| 时刻 | 2026-09-23 21:30 PDT |
| 前置 PRE-EXEC r2 | `bf3ced1`（Overall PASS；C1–C5 编码条件仍约束） |
| REQUEST 锚点 | `41cffea` |
| Step0 SHA | `4643c02` |
| Prove SHA | `69de818`（saver pool 隔离 / SET ROLE leak 修） |
| 收据 tip（mw-core） | `c549d20` |
| 审查工作树 | `/workspace/wt-pi-pp-ckpt` @ `69de818`（detached；未改共享 worktree / stash） |
| Pins | `haStatus=NOT_HA` · `releaseEvidence=false` · 公开 DELETE=503 · PG-retained · 外部=`retention_pending` · Ban covered / Ban HA |

**原则**：只采信本角色亲自跑的命令 EXIT 与亲自读的源码；不采信 mw-core 口头声明。

---

## 1. CMD \| SHA \| EXIT（本机 @ `69de818`）

| CMD | SHA | EXIT | 备注 |
|-----|-----|------|------|
| `pnpm uc052:checkpoint-physical:prove` | `69de818` | **0** | 13/13 PASS · **零 skip** · `releaseEvidence=false` · `haStatus=NOT_HA` |
| `pnpm uc052:internal-erasure:prove` | `69de818` | **0** | 11/11 PASS · 零 skip |
| `pnpm privacy-authorization:prove` | `69de818` | **0** | 含 epoch/digest 错配 claim 拒、漂移拒 |
| `pnpm privacy-erasure:http:prove` | `69de818` | **0** | 19 pass · 公开 DELETE **仍 503** |
| `pnpm eval-harness-matrix-cite:prove` | `69de818` | **1** | UC-052 相关 cite **全 PASS**；唯一 FAIL=`UC-018 facet[2] legacy=blind conservative=case-only`（**非本刀**） |
| `pnpm --filter @meetwise/db exec tsc --noEmit` | `4643c02` | **2** | 规范化后 **6** 条既有错误 |
| `pnpm --filter @meetwise/db exec tsc --noEmit` | `69de818` | **2** | 同 6 条 · **diff 空** · 无 uc052-checkpoint-physical 文件 |

### `uc052:checkpoint-physical:prove` case 观测

| id | 结果 | 本机观测 |
|----|------|----------|
| NHP-052-CKPT-FAULT-01 | PASS | fail→retry · after 三表=0 · req=`pending_external` |
| NHP-052-CKPT-FAULT-02 | PASS | getTuple=empty · put=refused · req=`pending_external` |
| NHP-052-CKPT-FAULT-03 | PASS | deleted=0 · receipts=1 |
| NHP-052-CKPT-NEG-01 | PASS | beginRej · forgedRej · bypassRej · grant=false |
| NHP-052-CKPT-NEG-02 | PASS | beforeB=afterB={1,1,1} · crossRej · **他主体 SURVIVE** |
| NHP-052-CKPT-NEG-03 | PASS | httpStatus=503 · grant=false |
| NHP-052-CKPT-BOUND-01 | PASS | winners=1 |
| NHP-052-CKPT-ZERO | PASS | deleted=0 · erased · pending_external |
| NHP-052-CKPT-RACE | PASS | FOR_UPDATE_barrier · racePut=refused · postPut=refused · counts=0 |
| NHP-052-CKPT-RACE-TRIGGER | PASS | purge=fulfilled · write=rejected · counts=0 |
| C-DIGEST-JWS | PASS | preEpoch/Dig NULL · jwsEq sealed · 5 sinks 全量 |
| HP-052-CKPT-01 | PASS | before>0 → after=0 · deleted=3 · getEmpty · putRefused · pending_external |
| C-CASECOUNT | PASS | REQUIRED 全在 |

---

## 2. `41cffea..c549d20` 文件清单（刀相关）与 MIG/ROUTE/GRANT

**刀相关路径（无 migrations / 无 apps 路由 / 无新 GRANT SQL）**：

- `packages/db/src/uc052-checkpoint-physical.ts`
- `packages/db/test/uc052-checkpoint-physical.proof.ts`
- `packages/db/package.json` · `package.json` · `scripts/run-e2e-isolated.mjs`
- harness / receipts / reviews 文档

**全量 range 另含大量 UC-018 / G7 文档与 fixture**（与本刀正交）。  
`git diff --name-only 41cffea..c549d20` 过滤 `migration|route|GRANT|\.sql$` → **无命中**（本刀未新增迁移/路由/GRANT）。

---

## 3. C1–C5（编码条件）

### C1 JWS→consume→claim 唯一可达 · 无新路由 · 无 app_role 再 GRANT · 无 ledger bypass — **PASS**
- 编排序：`packages/db/src/uc052-checkpoint-physical.ts` **L127–193**：privileged `beginCheckpointErasure` → `sealCheckpointErasureAuthz` → sign/issue → **`verifyPrivacyAuthorizationSnapshot` (L155–160)** → `consumeAuthorizationSnapshotBound` (L162) → `claimAuthorizationTarget` (L164–168) → `purgeCheckpointErasureTarget` (L192–193)。
- Ban 注释 L6–8；`begin` 注入必须 privileged（L96–97）。
- NEG-01：`has_function_privilege('app_role','privacy_begin_checkpoint_erasure(text,text)','EXECUTE')===false`；公开 DELETE 503；伪造 lease bypass purge 拒。
- 区间无新 HTTP 路由、无 migrations、无 app_role 再 GRANT。

### C2 admin 三表 count=0 · 按 subject `thread_id` 作用域 · 他主体 SURVIVE — **PASS**
- 表名：`checkpoints` / `checkpoint_blobs` / `checkpoint_writes`（proof `ckptCounts` **L105–118**：`WHERE thread_id=$1`）。
- HP-052-CKPT-01：before 全 >0 → after 全 0。
- NEG-02：他主体 B 在 purge A 后 **beforeB===afterB 且全 >0**（本机 `{checkpoints:1,blobs:1,writes:1}`）。

### C3 purge 后 resume/rewrite 拒 · 三表保持 0 — **PASS**
- FAULT-02 / HP-01 / RACE：`getTuple` empty；`put` refused；counts 仍全 0。
- 拒绝机制见 §6：DB fence trigger（0047 `assert_checkpoint_privacy_fence`），非仅 app 层。

### C4 `erased` 仅在物理 DELETE 成功后 · 失败可重试 · 外部 pending 时 request=`pending_external` — **PASS**
- `privacy_purge_checkpoint_target`（0048）：先 `DELETE` 三表 → residual 检查 → **同函数/同事务**内 `UPDATE … status='erased'`，再按 receipts CASE 落 `pending_external`。
- FAULT-01：`failBeforePurge` → target failed · retry 后 erased · req 仍 `pending_external`。
- Happy/RACE：externals=`retention_pending` → req=`pending_external`（Ban completed）。

### C5 无 digest 裁剪 — **PASS**
- seal **L79–82**：`canonicalTargetSetDigest` 覆盖 live 全量 targets。
- 编排 **L140–141**：`signed.targetSetDigest !== sealed.targetSetDigest` → throw。
- C-DIGEST-JWS：5 sinks=`checkpoint_rows,interview_job_payload,langfuse,oss,redis` · jwsEq · 禁 trim。

---

## 4. Disclosure 2 (b)：unsealed NULL epoch/digest 路径

**序**：begin（0048 / 0096 路径：INSERT request **不写** `privacy_epoch`/`target_set_digest`；C-DIGEST-JWS 观测 pre-seal 均为 NULL）→ `sealCheckpointErasureAuthz`（src L67–92）→ sign → JWS verify → consume → claim → purge。

**DB 护栏（非仅 app 调用序）**：
- 0091 **L369–374**：`request_epoch IS NULL` / `request_digest IS NULL` → `privacy_authorization_epoch_mismatch` / `digest_mismatch`（**拒绝**，非宽松 NULL 比较）。
- 0091 **L383**：live digest 漂移 → `privacy_authorization_target_drift`。
- purge 需要 claim 租约 → **不存在** unsealed 行上 claim/purge 成功路径。
- begin→seal 窗口可被他 actor 抢 claim：**必败于 NULL 护栏**；seal 与 begin **非**同语句原子，但 DB 拒绝使窗口不可利用。

**C-DIGEST-JWS**：全量 5-sink canonical；`signed===sealed`；pre-seal NULL 已断言。  
本刀 proof **无**独立「unsealed claim」负例（`privacy-authorization:prove` 另有 epoch/digest mismatch 负例）。

**裁定**：**非 blocker**。命名缺口（非阻断）：`NOTE-CKPT-UNSEALED-CLAIM-NEG`——建议在 checkpoint prove 加显式 unsealed/mismatched claim 负例；可选 DB `CHECK` 在 `fenced` 后强制非空（纵深，非必需）。

---

## 5. SET ROLE leak (c) @ `69de818`

- `69de818` **仅改 proof**：专用 `saverPool=createPool()`，避免 `PrincipalBoundCheckpointPool` 的 session `SET ROLE` 污染 admin 池。
- 产线 `apps/worker/src/main.ts` `createCheckpointer`：**自建专用 pool**；`useRuntimeRole` 时 `-c role=app_role` + `PrincipalBoundCheckpointPool`。
- `apps/worker/src/checkpoint-principal.ts`：**session** `SET ROLE app_role`（非 `SET LOCAL`）；`release` **无** `RESET ROLE`。
- 产品代码他处多用 `SET LOCAL ROLE` + 结束 `RESET ROLE`（`packages/db/src/principal.ts`）。

**裁定**：**本刀泄漏 = 测试侧池复用**（已修）。产线 saver 当前不与特权池共享 → **不升为产品阻断**。  
非阻断命名缺口：`GAP-PRIV-SAVER-POOL-ROLE-ISOLATION`——`PrincipalBoundCheckpointPool` 缺 `RESET ROLE`，若未来共享池则会话角色残留。

---

## 6. FOR UPDATE barrier (d)

- RACE：**独立连接** `BEGIN` + 三表 `FOR UPDATE` → 启动 purge（阻塞于行锁）→ `sleep(80)` → 并发真 `saver.put/putWrites` → `COMMIT` → await purge。  
  本机：`racePut=refused` · purge fulfilled · after=0。  
  **真实交错**：purge 在 hold 提交前被锁住；非「写完再 purge」。
- **FOR UPDATE 不挡新 PK INSERT**（通常）：mid-purge 若 enrollment 仍 active，新 checkpoint 行可插入。本刀 begin 已将 enrollment → `revoked`，insert/update 由 **0047 fence trigger** 拒绝。
- RACE-TRIGGER：并发裸 `INSERT INTO checkpoints` → `write=rejected`（trigger），purge 仍成功、counts=0。
- REVIVE：purge 后 put → refused 且 counts 仍 0 —— **DB fence**（`access_state≠active`），非仅 app。

**裁定**：barrier = 并发压测（证明 purge 持锁期间交错）；**「不可 revive/逃逸」由 fence/trigger 证明**，锁为加分项。非 blocker。诚实注：本机 `racePut=refused` 主要归 fence，**未**用 `pg_locks`/时间戳证明 put 曾阻塞在行锁上。

---

## 7. Blockers / Gaps / Notes

### Blockers
（无）

### 非阻断 Gaps / Notes
1. **`GAP-PRIV-SAVER-POOL-ROLE-ISOLATION`**：产线 `PrincipalBoundCheckpointPool` session `SET ROLE` 无 `RESET ROLE`（见 §5）。
2. **`NOTE-CKPT-UNSEALED-CLAIM-NEG`**：缺本 prove 内显式 unsealed claim 负例（DB 护栏已在 0091；见 §4）。
3. **`NOTE-CITE-UC018-FACET`**：`eval-harness-matrix-cite:prove` EXIT=1 仅因 UC-018 facet[2]；UC-052 cite 全绿 —— **不构成本刀 blocker**。
4. **`NOTE-RACE-REFUSE-VIA-FENCE`**：RACE 中 concurrent put 拒因 fence；barrier 证明交错但非「锁阻止 revive」的唯一证据（见 §6）。

---

## 8. Pins 守门

| Pin | 结果 |
|-----|------|
| `haStatus=NOT_HA` | ✓（prove JSON） |
| `releaseEvidence=false` | ✓ |
| 公开 DELETE=503 | ✓（http prove + NEG-03） |
| PG-retained / 物理三表 | ✓（admin count） |
| 外部 `retention_pending` · req `pending_external` | ✓ |
| Ban covered / Ban 伪 completed | ✓ |

---

Verdict: PASS
