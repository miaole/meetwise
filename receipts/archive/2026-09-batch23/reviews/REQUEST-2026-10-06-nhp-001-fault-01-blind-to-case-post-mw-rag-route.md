# REQUEST — NHP-001-FAULT-01 · UC-001 FAULT blind→case · POST-PROVE · mw-rag-route

**时间**：2026-10-06 19:48 +08:00
**Line**：AI
**Expert**：mw-rag-route（独立审查）· **Peer**：mw-e2e-ha（其 POST `50ce0c6` 未作为本审证据，不代签）
**PROVE_TIP**：`3e3f9ff0ac1e60d8ddfc0b8b9e4f4c18851515a7`（父 `856680b`；首次 fetch 及约 60s 后 re-fetch 均不在 `origin/feat/mysql-schema-skeleton`，仅在 `origin/line/ai-fault-01`，本地 `git cat-file -e` 存在）
**落地提交**：`ac5928a6e028a80510e2283321931a68662bf506`（同一改动 rebase 到 `c4d3b9f` 之上，已在 origin feat；`git range-diff` 仅 `run-e2e-isolated.mjs` 上下文差异（相邻 AK `uc025:nhp-adv` 行），7 个文件 numstat 完全相同，proof 文件与收据 blob 相同）
**REQUEST**：`6128b79` · PRE：mw-e2e-ha `b449371` · mw-rag-route `44e3665`（PASS · C1–C7）
**执行面**：仅本 box · 临时 worktree `/tmp/mwrr-3e3f9ff`（先 detach 于 3e3f9ff 复跑，再于 ac5928a 复跑 FAULT，最后切到 origin tip `50ce0c6` 写本收据）· 未在用户 Mac / 任何 machineId 上运行 · 未读 `.env*` · 未打印任何 Key 值 · 无 live 模型调用
**Pins**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503

## 1. 范围

- `3e3f9ff` 相对父 `856680b` 只改 7 个文件：新 proof `apps/api/test/uc-e2e-001-nhp-fault.proof.ts`（+513）、`apps/api/package.json`（+1，`prove:uc001-nhp-fault`）、根 `package.json`（+2，`uc001:nhp-fault:prove` / `:raw`）、`scripts/run-e2e-isolated.mjs`（+15/-1）、harness（+11/-8）、slice（+4/-4）、收据 `receipts/2026-10-06-nhp-001-fault-01-prove.md`（+79）。
- runner 改动为纯增量：receipt sources 新条目、supported-target 列表加一行、command map 加一分支、migrate allowlist 长行末尾追加 `'uc001:nhp-fault:prove:raw'`（这一行的 -1/+1）。其他目标行为不变（C4）。
- `6128b79..3e3f9ff` 区间：`apps/api/src`、`packages/`、`apps/worker` 零改动；neg / bound / report-bulkhead proof 文件零改动。区间内另一份代码改动 `uc-e2e-001-nhp-adv.proof.ts` 等来自 Line AG `7eb1c88`（已另审），非本线。
- matrix / backlog 在区间内的改动来自 AG / AL / AM nail（`9244420` / `738a2b6` / `d670bbd`），本线未触碰；matrix `:112` FAULT 仍为 partial。→ **通过**

## 2. box 复跑（串行；每次跑前 `with-docker-session.sh docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` 均为 0 个容器）

前置：`pnpm install --frozen-lockfile --prefer-offline` EXIT 0（1.7s）；install 后 `git status --porcelain` 为空。命令统一为 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <script>`。

| script | 提交 | 窗口（+08:00） | EXIT | 计数 |
|---|---|---|---|---|
| `uc001:nhp-fault:prove` | 3e3f9ff | 19:42:43–19:42:56 | **0** | `SUMMARY asserts=61 failed=0` |
| `uc001:nhp-neg:prove` | 3e3f9ff | 19:43:04–19:43:17 | **0** | `asserts=26 failed=0` |
| `uc001:nhp-bound:prove` | 3e3f9ff | 19:43:22–19:43:35 | **0** | `asserts=17 failed=0` |
| `report:prove` | 3e3f9ff | 19:43:39–19:43:51 | **0** | 31 行 PASS · 0 行 FAIL · `✓ 全部通过` |
| `uc001:nhp-fault:prove`（恢复后） | 3e3f9ff | 19:45:09–19:45:22 | **0** | `asserts=61 failed=0` |
| `uc001:nhp-fault:prove` | ac5928a | 19:46:44–19:46:57 | **0** | `asserts=61 failed=0` |

FAULT 关键 EVIDENCE（3e3f9ff 首跑）：`L0-ENV` key / base_url 入口均 absent；`f1-TURN` 202 `accepted:true`；`F1-GET-REPORT` 200 `{status:'failed',content:null}`；`F2b-RETRY` 200 `{requeued:true}`；`F2b-EXPORT` 404 `{error:'report_not_ready'}`；`F2-EVENT` count=1、`reason:'max_attempts_exceeded'`；`F2-RETRY-QUARANTINED` 404 `{error:'no_retriable_report'}`；`PC-GET-REPORT` 200 `{status:'ready',content:{overall:72,…}}`。隔离 PG 容器 `meetwise-e2e-1139405-…`，attestation `loopback+nonce verified`，`release_evidence=false`。无 env 失败。

`report:prove` 只作回归，不借作本 case 证据（F3）。

## 3. 变异（仅 worktree，从未 commit）

- **MUT-RAG-requeue（本审自选，针对 C3 隔离核心）**：`packages/db/src/report.ts:62` 把 `AND status='failed'` 改为 `AND status IN ('failed','quarantined')`（让 quarantined 也可被手动重排）。19:44:11–19:44:24 → **EXIT=1**，`SUMMARY asserts=61 failed=1`，唯一红断言 `F2 POST retry on quarantined → 404 {error:'no_retriable_report'} (C3 · requeue failed-only)`，实际 `F2-RETRY-QUARANTINED` 200 `{requeued:true}`。`git checkout` 恢复，diff 为空。
- **MUT-F1 复现（核对核心收据）**：注释掉 `apps/worker/src/report-worker.ts:49` 的 `markReportFailed` 调用。19:44:42–19:44:55 → **EXIT=1**，`failed=8`，`F1-GET-REPORT` 实际 200 `{status:'running',content:null}`，与收据 `:55` 一致；红断言为 F1 report、F2b ×3、F2 ×4。核心收据 `:54` 记 `failed=9`：差 1 来自做法不同。核心是删除该行，静态锚点 `ANCHOR drainReportsOnce + markReportFailed …`（proof `:103` / `:131-132`）随之失配；我是注释，锚点正则仍命中。语义一致，不构成矛盾。恢复后 diff 为空。
- 恢复后重跑 FAULT EXIT 0（61/0，见 §2）。

结论：「MUT-F1 discarded」指变异代码已丢弃，实际观测值（`status=running`、EXIT 1）已记录在收据 `:53-56`，满足 C6；加上本审的独立变异，证明本 proof 能在核心 FAULT 断言上变红。原 FAIL 的 B2（正控 / 变异）未被削弱：PC 在 proof `:451-480`，两个变异均 EXIT≠0。

## 4. C1–C7（proof = `apps/api/test/uc-e2e-001-nhp-fault.proof.ts`）

- **C1 已落实**：读口 `GET /interview/${id}`（proof `:276-277`）；其余路由 `:272-283` 均在 `/interview/` 下；controller `@Controller('interview')` 在 `interview.controller.ts:14`，`@Get(':id')` 在 `:168`；F1 / F2 / PC 断言 `:368`、`:424`、`:474`。全文无 `/interviews/` 调用。
- **C2 已落实**：complete 明示为 offline seed（proof `:16`、`:65`、`:285-288`、`:317-330`，EVIDENCE 带 note）；生产仅 worker 在 `adaptive-lifecycle.ts:340-341` 调用。begin → `/turn` 仍走真实 HTTP（`:299-300`、`:314-316`）。
- **C3 已落实**：F2b（`:383-409`）在 F2（`:411-449`）之前，且用独立 fixture（`setupThroughEnqueue('f2b')` vs `('f2')`）；F2 断言 quarantined 后 retry 为 404 `no_retriable_report`（`:440-444`），对应 `report.ts:60-64`（failed-only）与 `interview.service.ts:688`。本审变异直接打中此断言。
- **C4 已落实**：见 §1，runner 纯增量（+15/-1）。
- **C5 已落实（选择做断言）**：`ledgerSnap`（`:214-235`）在真 PG 上取 exact-1 consumption + owner 全部 consumption + 全部 bucket；exact-1 `confirmed` / `units_requested='1.00'`（`:238-242`）；F1 / F2b / F2 / PC 与 complete 后快照逐字节相等（`:377-378`、`:407-408`、`:447-448`、`:478-479`）。注意：本审未对 LEDGER-SNAP 做变异（见条件 3）。
- **C6 已落实**：收据 `:51-56` 记实际值 `status=running`、EXIT 1；本审复现一致（计数差异见 §3）。
- **C7 已落实**：证据层表述为 `createApp` + `listen(0)` + `fetch`（proof `:8-10`、`:66`、`:183-199`；harness §5；收据 `:43`）；「Supertest」只出现在 Ban 语境（proof `:10`、`:66`、`:139`、`:183`），无误导性用法。
- **真路由 / 真 PG**：HTTP 读写经 `fetch` 打到 `listen(0)` 的真实 Nest app，app 使用非超级用户 runtime 登录（`:171-181`），RLS 生效；隔离 PG 由 runner attestation 验证（`:169-170`）。worker 侧 `drainReportsOnce` / `sweepReportsOnce` 与 complete / enqueue seed 用 admin 池直调（`:318-326`、`:337`、`:343`、`:352`），属 harness 声明的注入点与 C2 seed；F2 为加速隔离直接 `UPDATE ai_report SET next_attempt_at`（`:348-351`），是测试时间操控，应在收据中明示（条件 2）。

**61 的构成（审计）**：行为断言 44 条（L0 1 + 每个 fixture 的 begin / turn / complete / enqueue / exact-1 共 5×4=20 + F1 5 + F2b 6 + F2 7 + PC 5）；静态源码锚点 3 条（`:127-132`）；弱断言 8 条（`answerHash` 助手自检 ×4 `:313`；bucket 行数 ≥1 ×4 `:243-244`，由 `:294-297` seed 保证，且标签「allocations point at existing bucket rows」言过其实）；**恒真 6 条**：对自身源码的正则自检 C2 / C3 / C5 / C7（`:133-140`）、F3 不导入检查（`:141-145`，对当前文件恒真）、F3 字面量 `true`（`:492`）。61 被约 17 条非行为断言充数，但核心 FAULT 断言真实存在且已被变异证明可红，故不阻塞（条件 1）。

## 5. 核心收据 vs 本审复跑

- FAULT EXIT 0 · 61/0 一致（收据 `:13-14`）；neg 26/0、bound 17/0、report:prove EXIT 0 一致（`:62-64`）；F1 / F2b / F2 / PC 结果逐项一致（`:27-30`）。
- MUT-F1：`running` / EXIT 1 一致；`failed=9` vs 本审 `failed=8`，差异已解释（§3）。
- 收据 `:6` 写基线 tip `13fc781`，而 3e3f9ff 的父提交是 `856680b`，属过时表述；收据未提及落地到 feat 的是 rebase 后的 `ac5928a`（条件 4）。

## 6. 门禁与 pins

- `NORTH-STAR-EXECUTION-LOOP.md:81`（§3③）：harness `:86-90` 给出 CMD 与期望 EXIT（齐 → 0；任一 F/PC/MUT 失败 → ≠0），回归 `:96-98` 各期望 EXIT 0。观测全部吻合，两个变异均 ≠0。
- `north-star-hard-gates.md:46` / `:117`（gap / partial ≠ covered）：proof `:25-26`、`:503`，收据 `:77`，harness `:89` 均写 EXIT0≠covered、FAULT stays partial；matrix `:112` FAULT 仍 partial；未改 matrix / backlog。
- 未洗 Y NEG / AB BOUND / AG ADV，未借 `report:prove` 绿：proof `:141-145`、`:485-492`，收据 `:31`、`:58-64`。
- Pins 未变（见文首）；PG-retained（Postgres / pgvector / PostgresSaver），未引入 MySQL runtime / Qdrant / MemorySaver。

## 7. 条件（非阻塞）

1. nail 与矩阵引用时不要把「61 asserts」当作行为证据数；应写明「行为断言 44 条 + 静态锚点 3 + 弱 8 + 恒真 6」，或在后续 knife 中删除恒真自检（`:133-145`、`:492`），并把 `:243-244` 的标签改成实际含义（bucket 存在）。
2. 收据补充披露：F2 隔离通过直接 `UPDATE ai_report SET next_attempt_at`（proof `:348-351`）加速，并非等待真实退避。
3. LEDGER-SNAP 目前没有变异证据。若要把「no double-charge」作为对外 claim，后续应补一个让 report 失败 / retry 触碰 entitlement 的临时变异并记录变红；在此之前措辞限于「本次快照逐字节相等」。
4. nail 应同时记录 PROVE_TIP `3e3f9ff`（原始 prove）与落地提交 `ac5928a`（本审已在两处复跑 FAULT EXIT 0），并修正收据 `:6` 的基线 tip 表述；MUT-F1 计数注明「删除行 → 9（含静态锚点）；注释行 → 8」。

## 8. 结论

FAULT case 证据在本 box 可复现（3e3f9ff 与 ac5928a 均 EXIT 0 · 61/0），回归 neg 26/0、bound 17/0、report:prove EXIT 0；C1–C7 全部落实；本审自选变异（quarantined 可重排）EXIT 1 打中 C3 核心断言，MUT-F1 复现 EXIT 1，恢复后重跑绿。无 `apps/api/src` / `packages/` / `apps/worker` 改动，无 covered 声称。

边界：PASS ≠ covered ≠ FAULT 列升格 ≠ nail ≠ HA；EXIT0 ≠ covered；FAULT stays **partial**；coveredCount=8；不洗 Y / AB / AG，不借 report:prove。alone ≠ dual：本审为 mw-rag-route 独立结论，不代签 mw-e2e-ha，不 nail；nail 需双方独立 PASS 加协调方裁定。

Verdict: PASS
