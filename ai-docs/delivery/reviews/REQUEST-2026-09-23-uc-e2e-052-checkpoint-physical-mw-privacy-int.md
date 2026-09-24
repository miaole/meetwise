# REQUEST — **UC-E2E-052 checkpoint physical · GAP-PRIV-CHECKPOINT-FENCE-ONLY** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty stub · **no pre-filled PASS** · Ban自批 · Ban implementer fill）  
**Line**: **B**  
**Expert**: `mw-privacy-int`  
**Pair**: `REQUEST-2026-09-23-uc-e2e-052-checkpoint-physical-mw-e2e-ha.md`（peer · alone ≠ dual · 不代签）  
**Knife**: `harness/uc-e2e-052-checkpoint-physical.md` · slice `uc-e2e-052-checkpoint-physical.slice.md`  
**Base SHA（REQUEST parent）**: **`21780af`** / full `21780af7a098fe7d8116b2be038b8698e15991b3`  
**Date opened**: 2026-09-23 (~21:00 PT)

---

## Pins（retained · reviewer must not flip）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** retained |
| Ban | invent **covered** · open DELETE · wash `privacy-erasure:prove` as this gap |

## Reviewer checklist（fill on review · not now）

- [ ] Item 1 annotate vs split ruling  
- [ ] Inventory file:line honest  
- [ ] NHP non-happy-first · C-CASECOUNT plan  
- [ ] Prove CMD unique · no wash prior proves  
- [ ] No app_role re-GRANT · no DELETE open · no SSOT edit in REQUEST tip  

*(empty body · Ban PASS filler)*

---

## pre-exec r0 · mw-privacy-int · 2026-09-23 21:05 PDT

| 字段 | 值 |
|------|----|
| 角色 | `mw-privacy-int` |
| REQUEST tip | `41cffea`（`git show --stat`：**4 个 docs** · meetwise-core） |
| 前刀钉 | `8602cea`（UC-052 internal erasure）· 本角 post-prove PASS `08d54f8` |
| 工作树 | `/workspace/wt-pi-pre-ckpt` @ `41cffea`（detached · 未碰共享 worktree / stash / `.env*`） |
| 范围说明 | **tip `41cffea` 纯 docs**；`8602cea..41cffea` 区间另含 Line A UC018 脚本（`843b8ca` 等）——与本 REQUEST tip 无关，不计入本刀 docs 面 |

### Pins（保留 · 未翻转）

NOT_HA · `releaseEvidence=false` · `claimProductionHA=false` · public DELETE=503 · externals `retention_pending` · Ban invent **covered** · Ban open DELETE · Ban wash `privacy-erasure:prove` 关本 gap · coveredCount **8** 矩阵既有 pin（≠ 本 UC covered）

### 基线 CMD \| SHA \| EXIT

| CMD | SHA | EXIT |
|-----|-----|------|
| `pnpm privacy-authorization:prove` | `41cffea` | **0** |
| `pnpm uc052:internal-erasure:prove` | `41cffea` | **0** |

---

## Item 1 · 矩阵诚实性（annotate vs split）— **FAIL**

### 事实

- 活矩阵 `ai-docs/delivery/e2e-requirement-coverage-matrix.md` **L124**（§1.0.1）：`UC-E2E-050–052` 三格 NEG/FAULT/BOUND 均为裸 **`partial`**，仅备注列写「UC-052 deletion → partial · Ban UC-050/051」；**格内无**「仅 052 / 050·051 仍 gap」标注。
- 提案 after 文本（harness §0）：三格**均**拟改为 `partial（**UC-052 deletion only**; 050/051 still …）`，ADV 仍 blind；**≠ covered** 保留。标注覆盖每一个被抬升格 —— 提案文案本身方向正确。
- 提案默认 **SSOT-at-nail**（本 tip **不**改矩阵）→ 编码期活矩阵仍保持裸 `partial`。
- Cite：`scripts/eval-harness-matrix-cite.proof.mjs` **L19** `rowIds: ['UC-E2E-050', …]`；**L367–368** `both.includes(row)`。活矩阵行 id `UC-E2E-050–052` **子串包含** `UC-E2E-050`，cite 绿不依赖 split。该检查**只验引用字符串存在**，不读格状态、不把 050/051 标成 partial。
- Covered 机评：`scripts/lib/uc-covered-real-gatherer.mjs` 对矩阵行用 **精确** `UC-E2E-018` 匹配；**未**发现将 `UC-E2E-050` 绑到聚合行并读格状态的脚本。
- **无** covered 宣称。

### 为何不能 PASS

「人与工具皆不可误读」未同时满足：

1. **人**：活 §1.0.1 三格裸 `partial` —— 可被读成 050/051 已抬升；提案把修正推迟到 nail，编码窗口内误读风险持续。
2. **工具（潜伏）**：cite 用子串 `UC-E2E-050` 绑定聚合行 —— 当前虽不读状态，但是稳定脚枪；未来若有脚本「找含 UC-E2E-050 的行再 `cellStatus`」会得到 `partial`。

### 阻断项（Item 1）

1. **B1（矩阵）**：编码授权前必须落地 docs-only SSOT 修正——**二选一**：（a）按提案给 §1.0.1 每一抬升格加「仅 UC-052 deletion；050/051 仍 gap/blind」标注；或（b）拆行 `UC-E2E-050` / `051` / `052` 并同步 cite/harness/NHP。**Ban** 在活矩阵仍为裸 `partial` 时开编码。
2. **B2（cite）**：将 `scripts/eval-harness-matrix-cite.proof.mjs` L19 的 `UC-E2E-050` 改为精确 **`UC-E2E-050–052`**（与 harness/eval 实际对照行一致），消除子串误绑。

---

## Item 2 · 刀计划（checkpoint 物理清除）— **PASS**（附编码条件）

### 仓库对照（file:line）

| 主题 | 证据 | 结论 |
|------|------|------|
| 授权根 | `0075` L16 / `0096` L227：`REVOKE EXECUTE … privacy_begin_checkpoint_erasure FROM app_role`；purge 仅 `privacy_worker_executor`（`0048` L485–486） | Ban 重 GRANT 与计划一致；**须**挂到 UC-052 已鉴权链（见 C1） |
| 真物理 · 三表 | `0048` **L429–433**（`0078` 同源）：`DELETE` `checkpoint_writes` / `checkpoint_blobs` / `checkpoints` **皆按 `thread_id`**；随后 residual count≠0 → 异常 | **覆盖 blobs+writes+checkpoints**，非仅 checkpoints |
| 表名 | `0043` / `25_langgraph_checkpoint.sql` 建表名 = 上列三表；计划用语一致 | OK |
| Fence / revive | `0047` trigger 要求 `access_state='active'`；purge 后 enrollment → `purged`（`0048` L445–447）；FAULT-02：写拒绝且 count 仍 0 | 计划覆盖；见 C3 |
| 账本 | purge 成功后才 `status='erased'`（`0048` L453+）；失败可 `failed` 再申领（`0091` L399 允许 `pending\|leased\|failed`）；终态走 `0096` CASE → externals `retention_pending` 时 **`pending_external`** | 与计划一致；见 C4 |
| Pins / Ban covered | harness §6 · slice pins | 齐 |
| Prove 名 | `uc052:checkpoint-physical:prove` 在 tip `package.json` **不存在**；≠ `privacy-erasure:prove` / `uc052:internal-erasure:prove` | 无碰撞 |
| Digest | 计划未显式写「禁止裁剪」 | 升为 C5 |

### 编码条件（C1…C5）

1. **C1 授权唯一入口**：物理 purge **仅**经 UC-052 授权擦除路径可达——**JWS 验签 → consume → claim（0091）之后**；Ban 新 HTTP 路由；Ban `app_role` 重 GRANT `privacy_begin_checkpoint_erasure`；Ban 绕过 ledger 直调 purge。
2. **C2 三表 admin 断言**：prove 对 `checkpoint_writes` / `checkpoint_blobs` / `checkpoints` **分别** `SELECT count(*)=0`，且 `thread_id` 限于主体面试线程；异租户线程计数不变（NEG-02）。
3. **C3 fence-revive / resume**：FAULT-02 必须断言——purge 后 PostgresSaver resume/再写被拒，且三表 count **保持 0**；fence/`purged` enrollment 不得被静默复活。
4. **C4 账本顺序**：物理 DELETE 成功前目标不得标 `erased`；失败 → `failed` 可重申领；请求终态遵循 `0096` CASE，externals 仍 `retention_pending` 时为 **`pending_external`**（Ban `completed`）。
5. **C5 无 digest 裁剪**：签名/账本目标集全量保留（含 checkpoint 物理目标与 externals）；Ban 为变绿丢掉 sink。

### Item 2 非阻断备注

- 既有 `privacy-erasure:prove` EXIT=0 **≠** 本 gap 关闭（计划已 Ban wash）——编码时须独立收据目录与 CMD。
- 本刀关闭的是 fence-only 诚实洞；**不**抬升 UC-050/051 矩阵格（与 Item 1 联动）。

---

## 分项结论

| Item | Verdict |
|------|---------|
| Item 1 矩阵诚实 | **FAIL**（B1 活矩阵裸 partial + 推迟 SSOT；B2 cite 子串） |
| Item 2 刀计划 | **PASS**（C1–C5 编码条件） |

**Overall**：任一项 FAIL → 总判 FAIL。Item 1 闭合（docs-only SSOT + cite 精确化）前 **Ban 编码授权**。

Verdict: FAIL
