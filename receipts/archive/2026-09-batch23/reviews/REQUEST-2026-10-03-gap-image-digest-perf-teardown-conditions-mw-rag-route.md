# REQUEST — **M-CONDITIONS-REGISTRY**（C-IMAGE-DIGEST · C-PERF-TEARDOWN 诚实登记）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-image-digest-perf-teardown-conditions.md` · slice `gap-image-digest-perf-teardown-conditions.slice.md`
**Base tip**: `8dde8e3` / `8dde8e3c795178395b4fb9bf0e759aeb11693b90`（origin `feat/mysql-schema-skeleton`）
**Date**: 2026-10-03

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `canHonestlyFlip` | **false** |
| C-IMAGE-DIGEST | **OPEN CONDITION**（不动） |
| C-PERF-TEARDOWN | **OPEN CONDITION**（不动） |

## 请求审什么（docs-only 登记）

两个 CONDITION 出自 Line A UC-018 RECEIPT-BACKFILL post-prove correction（dual `0d42e2c` @ tip `e9ccfbe`；RE-REVIEW `07823b5` §5 kept open）：

- **C-IMAGE-DIGEST**：digest 须 LIVE per-run 从 run log 实际容器 `docker inspect`；现状 emitter 是宿主 `docker image inspect <tag>`（`uc018-receipt-backfill-emit.mjs:353`），re-emit 沿用 `priorDigestStr` 标 `prior-docker-inspect` / `liveObservation=false`（facts `:243-246`；`isLiveImageDigestEntry` `:61-66` 判 false）→ 不满足 LIVE-in-run-log，仍 OPEN。
- **C-PERF-TEARDOWN**：PERF-LOAD@`b29c191` attempt1=1（prove 内 pg Client unhandled `Connection terminated unexpectedly`，mid-prove，非 SUMMARY 后 teardown；capped-child `:202-204`）/ attempt2=0（恰一次）→ 条件保留，PERF local partial，attempt2 不洗 attempt1，根因未钉死 → 仍 OPEN。

本 REQUEST commit 只写 harness / slice / 两 stub。**执行阶段**（经授权后）仅对 `gap-bug-backlog.md:34-35` + `execution-master-checklist.md:441-442` 做行级对齐（补 file:line + dual SHA 证据指针）。

## 对照禁令（审者对照用）

- **Ban coding / prove / push**：本刀零源码 diff —— Ban 碰 emitter / facts / guard / evaluator / gatherer / capped-child；Ban 改写 receipt JSON / log / README；修复须另刀。
- **Ban 状态变化**：登记后两 CONDITION 仍 OPEN / disclosed；Ban 关闭、Ban 升级、Ban 借登记措辞暗示已修复或已降级。
- **Ban UC-018 covered flip**：UC-018 / §1.1 stay **partial** · `canHonestlyFlip=false` · coveredCount **8** 不动。
- 修复方向（LIVE digest 采集路径 / PERF teardown 根因）在本刀内**仅供评估**，不构成实现授权。

Dual PASS ≠ coding ≠ close ≠ covered ≠ nail · alone ≠ dual · 本 stub 无 Verdict。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# POST-PROVE dual 复验（登记刀执行产物）· mw-rag-route · append-only

**Status**: `post_prove_dual` 复验执行 commit（登记刀产物核验 · 不代签 mw-e2e-ha · alone ≠ dual）
**被审 tip**: `697ad54`（full: `697ad54fd8c7a1ca88e230b6ff4ffee9f361dfcf`）· parent `608e769`（origin nail）· 分支 `line/m-conditions-registry` · exec commit = 2 files +4/−4 · exec author `mw-core`（非审者本人，非自批）
**pre-exec dual**: mw-rag-route @`ce36b81` + mw-e2e-ha @`5bdce7f`
**审 worktree**: `rv/mp-rag-route`

## 机检结果（可复现命令均在本 worktree 执行）

1. **包完整性**：`git show --stat 697ad54` = 恰 2 文件（`gap-bug-backlog.md` 2 行 · `execution-master-checklist.md` 2 行）+4/−4，无第三文件。
2. **四处行尾追加**：checklist `:441`/`:442` = 字面行尾追加（原行前缀逐字符保留，分别追加 438/301 字符）；backlog `:34`/`:35` = 表格行尾追加（追加点位于行尾收尾 `|` 之前——markdown 表格行必须以 `|` 收尾，此为格式强制；原单元格内容逐字符保留，零删改，追加段 = ` · evidence chain: …`）。结论：合规。
3. **状态字段逐字符比对**（对照 `git show 608e769:…`）：backlog:34 `**OPEN** CONDITION` / `| e2e |` / `open CONDITION`；backlog:35 `disclosed, not washed, not closed · attempt1 EXIT 1 (pg Client terminated mid-prove) · attempt2 EXIT 0 · PERF/LOAD stays local partial` / `| e2e |` / `disclosed OPEN`；checklist:441 `- [ ] C-IMAGE-DIGEST live-per-run stays an open CONDITION (prior-docker-inspect is not live)`；checklist:442 `- C-PERF-TEARDOWN disclosed (attempt1 EXIT 1, …)`；checklist:443 pins 行全文 —— 全部 SAME，零漂移。

## 条件裁决

| 条件 | 裁决 | 依据 |
|------|------|------|
| C1 范围 | **PASS** | diff 仅落 backlog `:34-35` + checklist `:441-442`（内容定位核验，行号与包声明一致）；状态字段逐字符 SAME（见机检 3）；超范围变更 = 0 |
| C2 不互借 | **PASS** | `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER` 在新增文字中 **0** 次提及；两 CONDITION 保持 OPEN（`**OPEN** CONDITION` · `disclosed OPEN` · checklist `stays an open CONDITION`）；新增段 `kept open` ×4，零关闭/互借措辞 |
| C3 修复边界 | **PASS** | 新增文字仅引锚点（file:line + dual/RE-REVIEW SHA + 节号），零 fix/patch/modify/授权措辞；不构成 emitter/facts/capped-child 改动授权；Ban coding 禁令原样保留 |
| C4 锚点诚实 | **PASS** | 锚点抽查 7/7 成立（见下）；`/workspace/…` 外部路径在新增文字中 **0** 次直接引用；attempt1 可复现锚点显式 = 入库 correction 段 `:371-380`，与 pre-exec 条件「以入库 correction 段为可复现锚点」口径一致 |

### 锚点抽查（≥4，实测 7）

- `scripts/uc018-receipt-backfill-emit.mjs:344` = `function collectImageDigestsRaw(cwd) {` · `:353` = `docker image inspect … --format '{{json .RepoDigests}}'` — 成立
- `scripts/lib/uc018-receipt-backfill-facts.mjs:243-246` = `source='prior-docker-inspect'` / `liveObservation=false` · `:61` = `export function isLiveImageDigestEntry` — 成立
- `scripts/uc018-perf-load-capped-child.mjs:202-204` = `docker start -a` / `docker rm -f` / `process.exit(start.status ?? 1)` — 成立
- correction `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:399-401` = §3 C-IMAGE-DIGEST（condition · retained）——tip 与 `0d42e2c` 双版本均成立
- 同文件 `:369-397` = §2 PERF-LOAD teardown investigation · `:371-380` = attempt1 root cause（入库段转引 `/workspace/mw-rv-bf-results/PERF-LOAD-prove.log` L22-37 pg Client terminated；外部日志经入库 correction 段转引归属——诚实口径）
- RE-REVIEW `07823b5` 同文件 `:475-481` = §5 Conditions kept open，两 CONDITION 均 **CONDITION** kept open——tip 与 `07823b5` 双版本均成立
- `receipts/uc018-receipt-backfill/PERF-LOAD.json:28-29` = `"source": "prior-docker-inspect"` / `"liveObservation": false` — 成立

## Pins / 禁令复验

- checklist `:443` pins 行逐字符未动：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
- `canHonestlyFlip=false`（`:439`）行未入 diff，未动。
- 新增文字中 `UC-018`/`UC-052`/`UC-025`/`UC-004` 状态 token **0** 次（仅小写 `uc018` 文件路径片段出现，非票据状态引用）。

## Blockers

None.

## Conditions

None.（C-IMAGE-DIGEST / C-PERF-TEARDOWN 登记后仍 OPEN；LIVE digest 采集路径与 PERF teardown 根因修复须另刀，本登记不构成授权。）

## 中文三行摘要

- 本刀为纯登记刀：恰 2 文件 +4/−4，四处行尾追加（backlog 为表格行尾追加、原文逐字符保留），状态字段与 pins 行零漂移。
- 证据链锚点抽查 7/7 成立；`/workspace` 外部路径零直引，attempt1 经入库 correction 段 `:371-380` 归属，诚实口径成立。
- 两 CONDITION 登记后仍 OPEN，无互借、无修复授权、无 UC covered flip —— post-prove dual 复验 PASS。

Verdict: PASS
