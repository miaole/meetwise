# POST-PROVE — NHP-001-FAULT-01 · UC-001 FAULT blind→case · Line AI · mw-e2e-ha（独立复跑 · 半签）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · **不代签 / 不共签** peer `mw-rag-route`）
**Review date**: 2026-10-06 19:40–19:48 CST（Asia/Shanghai · UTC+8）
**Line**: **AI**
**PROVE_TIP（pinned）**: `3e3f9ff`（`3e3f9ff0ac1e60d8ddfc0b8b9e4f4c18851515a7`）· meetwise-core · author 2026-10-06 19:39:37 +08:00 · parent `856680b` · 位于 `origin/line/ai-fault-01` · **本身 ≠ ancestor of `origin/feat/mysql-schema-skeleton`**（`merge-base --is-ancestor` rc=1 · 19:44 核）
**LANDED on feat**: `ac5928a`（`ac5928a6e028a80510e2283321931a68662bf506`）· 同 author date · committer 2026-10-06 19:44:28 +08:00 · = `3e3f9ff` rebase 到 `c4d3b9f`（Line AK）之上 · **ancestor of `origin/feat/mysql-schema-skeleton` ✔** · 见 §0b（两 SHA 均独立复跑）
**REQUEST**: `6128b79`（`6128b7964df504f8127ef77b1bdf5b7a822a4add`）
**PRE dual**: 本人 re-PRE PASS `b449371`（docs gate · C1–C7 carry）· peer mw-rag-route Re-PRE PASS `44e3665` — **存在已核**（`git cat-file -t` = commit）· **不代签 / 不共签**
**Prove receipt（实现方）**: `ai-docs/delivery/receipts/2026-10-06-nhp-001-fault-01-prove.md`
**Scope**: 只读文档 + 独立复跑 prove · **Ban coding** · Ban product edit · Ban live · Ban `.env*` · Ban git config · Ban force-push · Ban invent covered · Ban HA · Ban buy cloud · Ban nail · Ban Meridian

本 PASS = POST-PROVE 半签。**≠** covered · **≠** FAULT 列升格 · **≠** nail · **≠** HA · alone ≠ dual · EXIT0≠covered。

---

## 0. Tip 变更面（`git show --stat 3e3f9ff`）

7 files：harness · slice · prove receipt（docs）+ `apps/api/test/uc-e2e-001-nhp-fault.proof.ts`（new · 513 行）+ `apps/api/package.json`（+1）+ root `package.json`（+2）+ `scripts/run-e2e-isolated.mjs`（+16/−1 · 纯增量登记）。
- **零产品源改动**：`apps/worker/src/report-worker.ts` 最后修改 `9070dfe`（远早于本刀）· `packages/db/src/report.ts` / controller / service 不在 diff。✅
- **零** Y/AB/AG 文件（`nhp-001-neg-01*` / `nhp-001-bound-01*` / `nhp-001-adv-01*`）· **零** matrix / NHP matrix 改动（`git diff 856680b 3e3f9ff -- e2e-requirement-coverage-matrix.md non-happy-path-perf-load-case-matrix.md` = 空）。✅

## 0b. Landing 核（retry · 披露 · 非洗）

- 19:40 首次 fetch：`3e3f9ff` 对象可达（共享 object store / `origin/line/ai-fault-01`），**但不在 feat 上**；本审初次误把"对象存在"读作"已落 feat"，19:44 推送前复核发现 rc=1，已更正本段与页头（不隐瞒）。
- 重试 fetch（19:43–19:45）：feat 出现 `ac5928a`，subject 与 `3e3f9ff` 相同。
- 等价性：`git range-diff 856680b..3e3f9ff c4d3b9f..ac5928a` 仅 `run-e2e-isolated.mjs` allowlist 上下文差异（与 AK 追加的 `uc025:nhp-adv:prove:raw` 相邻 · 冲突合并）；`git diff 3e3f9ff ac5928a -- <proof.ts · harness · slice · receipt · apps/worker · packages/db · apps/api/src>` = **空**；`3e3f9ff..ac5928a` 增量 = Line AK `856680b..c4d3b9f` 内容（ADV-025 proof/receipt/additive 目标），与本刀文件无交集。
- 因 landed SHA 不同于 pinned SHA 且合入了 AK 的 runner 改动，本审在 **`ac5928a` 上再次全量复跑**四条 CMD（§1b），不以 `3e3f9ff` 结果代替。

## 1. 独立复跑（本审亲跑 · 非借实现方收据）

环境：box `/workspace/meetwise`（→ `/workspace/projects/meetwise`）@ `3e3f9ff` · `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL …`（sg docker 会话补组 · 无 sudo/chmod）· 隔离真 PG `pgvector/pgvector:pg16` · migrations applied=136。

| CMD | 起止（+08:00） | EXIT | SUMMARY | 隔离收据 |
|-----|----------------|------|---------|----------|
| `pnpm uc001:nhp-fault:prove` | 19:41:10–19:41:23 | **0** | `asserts=61 failed=0`（PASS 行计数 61 · FAIL 行 0） | `.tmp/isolated-proof-receipts/2026-10-06T11-41-23-376Z-1134524-117fd8b0-….json` · release_evidence=false |
| `pnpm uc001:nhp-neg:prove` | 19:41:35–19:41:47 | **0** | `asserts=26 failed=0` → **neg 26/26** | `…T11-41-47-522Z-1135582-c69b0305-….json` |
| `pnpm uc001:nhp-bound:prove` | 19:41:47–19:42:00 | **0** | `asserts=17 failed=0` → **bound 17/17** | `…T11-42-00-256Z-1136356-83dd903d-….json` |
| `pnpm report:prove` | 19:42:00–19:42:12 | **0** | `✓ 全部通过` | `…T11-42-12-638Z-1137173-674c3790-….json` |

neg / bound / report:prove 为 **独立具名 CMD**（REQUEST harness §7 · B4），非嵌套于 FAULT prove。四者分别运行、分别 EXIT、分别隔离收据。

### 1b. 在 landed `ac5928a` 上复跑（同环境 · 同 CMD 前缀）

| CMD | 起止（+08:00） | EXIT | SUMMARY | 隔离收据 |
|-----|----------------|------|---------|----------|
| `pnpm uc001:nhp-fault:prove` | 19:45:14–19:45:28 | **0** | `asserts=61 failed=0`（PASS 61 · FAIL 0） | `…T11-45-28-162Z-1149422-943dabf9-….json` · release_evidence=false |
| `pnpm uc001:nhp-neg:prove` | 19:45:28–19:45:41 | **0** | `asserts=26 failed=0` | `…T11-45-40-932Z-1150848-dac6d37f-….json` |
| `pnpm uc001:nhp-bound:prove` | 19:45:41–19:45:53 | **0** | `asserts=17 failed=0` | `…T11-45-53-676Z-1152075-320310bc-….json` |
| `pnpm report:prove` | 19:45:53–19:46:06 | **0** | `✓ 全部通过` | `…T11-46-05-999Z-1153195-f9c5bb5e-….json` |

两 SHA 结果一致。

### FAULT 关键收据行（本审 log 摘录）

- `PASS  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)` · `ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified`
- **F1**：`F1 drainReportsOnce → failed (generate throw → markReportFailed)` · `F1 GET /interview/:id → 200 status='completed'` · `F1 GET /interview/:id/report → 200 {status:'failed', content:null}` · `F1 LEDGER-SNAP byte-identical after report fail` · `F1 consumption stays confirmed`
- **F2b**（独立 fixture · 在 F2 前）：`POST …/report/retry → 200 {requeued:true}` · `GET report after retry → 200 status='queued'` · `GET …/report/export → 404 {error:'report_not_ready'}` · LEDGER-SNAP byte-identical
- **F2**：`EVIDENCE F2-QUARANTINE {"report":{"status":"quarantined","content":null,"attempts":3}}` · `F2-EVENT {"count":1,"payload":{"reason":"max_attempts_exceeded"}}` · `F2-RETRY-QUARANTINED {"status":404,"body":{"error":"no_retriable_report"}}` · interview stays `completed` · LEDGER-SNAP byte-identical
- **PC**：`PC drainReportsOnce → ready` · `PC GET … → 200 {status:'ready', content:{overall:72,…}}` · `report_ready` event · LEDGER-SNAP byte-identical
- **F3**：`F3-BAN {"ban_wash_Y_NEG":["ff74522","51c0c0b"],"ban_wash_AB_BOUND":["f8cdc82","5adb14f"],"ban_wash_AG_ADV":true,"ban_borrow_report_prove":true}`
- 尾行：`CMD=pnpm uc001:nhp-fault:prove EXIT=0` · `NONCLAIM: EXIT0≠covered · FAULT stays partial · coveredCount=8 · Ban wash Y/AB/AG · Ban nail · Ban HA`

**与实现方声明比对**：EXIT0 ✔ · asserts=61 ✔ · neg 26/26 ✔ · bound 17/17 ✔ · report:prove EXIT0 ✔ — **全部吻合**。

## 2. report:prove ≠ borrow（独立核）

- `report:prove` → `@meetwise/worker prove:report` → `tsx test/report-bulkhead.proof.ts`（worker 层 bulkhead 旁证），与 FAULT 的 `apps/api/test/uc-e2e-001-nhp-fault.proof.ts`（Nest HTTP `createApp`+`listen(0)`+`fetch` + 隔离真 PG）**不同文件、不同层、不同 CMD、不同 EXIT 收据**。
- FAULT proof 不 import report-bulkhead / Y NEG / AB BOUND / AG ADV proof（源码 grep 核 + 自检断言 `F3 Ban-borrow … does not import …` PASS）。
- FAULT 证据来自本 case HTTP 读口（F1/F2b/F2/PC），未用 `report:prove` 绿替代。**≠ borrow ✔**

## 3. MUT-F1 discarded（C6 · 独立核）

- 实现方收据：temp 去掉 `drainReportsOnce` catch 中 `markReportFailed` → FAULT **EXIT=1** · `asserts=61 failed=9` · 实际 `GET report → 200 {status:'running', content:null}` → 已从备份恢复 · never committed。
- 本审核（只读 · **未重放变异**，遵 Ban coding）：
  - `apps/worker/src/report-worker.ts` 不在 `3e3f9ff` diff；`git log -- apps/worker/src/report-worker.ts` 最新 = `9070dfe`（非本刀）；
  - `:49` `markReportFailed(c, owner, claim.reportId, leaseOwner, …)` 调用**仍在**；
  - `git status --porcelain` 空（无残留未提交变异）；
  - 未变异 tip 上 F1 `status='failed'` 断言 PASS（若变异残留则 F1 应红）。
- 结论：**MUT-F1 discarded / not persisted ✔**。MUT 红色 EXIT=1/failed=9 为实现方记录、本审未复现（披露 · 非阻断：任务要求为核 discard）。

## 4. FAULT stays partial（Ban fake covered）

- `e2e-requirement-coverage-matrix.md:112` UC-E2E-001 行 FAULT 列逐字 = **`**partial**`**（列 4）· NHP matrix `:37` NHP-001-FAULT-01 = **`partial`** · 本 tip 零 matrix edit。
- harness/slice 状态 = `prove:awaiting_post_dual`（非 nail · 非 covered）。prove 自身 NONCLAIM 行写明 FAULT stays partial。**无 covered 发明 · 无 fake green ✔**

## 5. C1–C7 vs PRE `b449371`（spot-check · 均 hold）

| ID | PRE 条件 | 本审在 tip 抽核 |
|----|----------|----------------|
| **C1** | `/interview/:id`（非 `/interviews/`） | ✔ ANCHORS `@Controller('interview'):14` · `@Get(':id'):168` · F1 `GET /interview/:id → 200` · `/turn` 202（Ban `/answer` 410 `:242`） |
| **C2** | complete = 离线 seed 披露 | ✔ `EVIDENCE *-COMPLETE-SEED … "offline seed completeInterviewAndConfirm · Ban full-main-chain-without-model narration"` · L0 key absent |
| **C3** | F2b 在 F2 前 / 独立 fixture；quarantined→404 | ✔ log 顺序 F1→F2b→F2→PC · F2 retry → 404 `no_retriable_report` |
| **C4** | runner 纯增量登记 | ✔ diff：root `package.json` +2 · `apps/api/package.json` +1 · `run-e2e-isolated.mjs` 新增 receipt sources / command map / allowlist 末尾追加 `uc001:nhp-fault:prove:raw`（唯一 `-` 行为同一 allowlist 行改写追加）· 其他目标行为不变 |
| **C5** | LEDGER-SNAP 或明示不做 | ✔ 选 LEDGER-SNAP 真 PG · exact-1 confirmed guard + 各阶段 byte-identical PASS |
| **C6** | MUT-F1 temp · 记实际值 · EXIT≠0 · never commit | ✔ 见 §3 |
| **C7** | `createApp`+`listen(0)`+`fetch` 措辞 | ✔ `C7 NOTE` + `C7 disclose` PASS · proof `:184` `import('../src/main.ts')` createApp |

### Ban wash Y / AB / AG（spot-check）

- Y NEG（`ff74522`/`51c0c0b`）· AB BOUND（`f8cdc82`/`5adb14f`）· AG ADV：tip 零触其文件；FAULT proof 不 import 其 proof；neg/bound 作为**回归**单独跑 EXIT0，未被记作 FAULT 证据。**held ✔**

## 6. 观察（非阻断）

- 收据 `Baseline tip` 写 `13fc781`，`3e3f9ff` parent = `856680b`、landed `ac5928a` parent = `c4d3b9f`；harness 头仍写 base `1778d53` 历史值。仅为叙述滞后，不影响证据。
- **pinned `3e3f9ff` ≠ feat 上 SHA**：协调方如需严格以 feat 上 SHA 记账，应引用 `ac5928a`；本审对两者均给出复跑证据。
- pnpm 输出路径显示 `/workspace/projects/meetwise`（`/workspace/meetwise` 的 symlink 目标），同一仓库同一 SHA。

## Blockers

**无阻塞** + spot-check（§1 四 CMD 亲跑吻合 · §3 MUT discard · §4 partial · §5 C1–C7）。

## Ban / Pins

| Check | Ruling |
|-------|--------|
| Ban wash Y/AB/AG | **held** |
| Ban borrow `report:prove` | **held**（≠ borrow · 独立 CMD/层） |
| Ban fake green | **held**（亲跑 EXIT0 · 非抄录） |
| Ban invent covered / flip FAULT | **held**（FAULT stays partial） |
| Ban coding / product edit | **held**（本审零代码 · 未重放变异） |
| EXIT0 ≠ covered | **held** |
| alone ≠ dual · 不代签 peer `44e3665` | **held** · 本文件仅 e2e 半签 · 需 rag POST 另签 |

### Pins（原值 · 不翻）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · g7SuiteGreen=**false**

## Non-claims

PASS ≠ covered ≠ FAULT 列 flip ≠ nail ≠ HA ≠ suite green ≠ releaseEvidence · EXIT0≠covered · alone ≠ dual · 不代签 peer · Ban wash Y/AB/AG · Ban fake green · Ban self-nail

## 中文摘要

在 pinned PROVE_TIP `3e3f9ff`（位于 `origin/line/ai-fault-01`，本身非 feat 祖先）及其 feat 落地 rebase `ac5928a`（feat 祖先 ✔ · 本刀文件与 `3e3f9ff` 字节一致）上各独立复跑一次：`uc001:nhp-fault:prove` EXIT0 · asserts=61 failed=0；具名回归 `uc001:nhp-neg:prove` 26/26、`uc001:nhp-bound:prove` 17/17、`report:prove` EXIT0 均亲跑通过，`report:prove` 为 worker bulkhead 独立 CMD，未借作本 case 证据。MUT-F1 变异未落盘（report-worker.ts 不在本刀 diff、`markReportFailed` 调用在、工作树干净）。FAULT 列/NHP `:37` 仍 partial，无 covered 发明。PRE C1–C7 均落实；Ban wash Y/AB/AG 守住。pins 不动。本 PASS 为 e2e 半签，alone≠dual，不代签 peer rag `44e3665`。

Verdict: PASS
