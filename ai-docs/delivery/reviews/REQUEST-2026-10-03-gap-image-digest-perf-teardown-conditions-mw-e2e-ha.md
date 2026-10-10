# REQUEST — **M-CONDITIONS-REGISTRY**（C-IMAGE-DIGEST · C-PERF-TEARDOWN 诚实登记）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`
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

# POST-PROVE dual · 登记执行产物复验 · mw-e2e-ha（adversarial evidence-honesty）

**Status**: `post_prove_dual`（本刀无 prove · 复验对象 = 登记对齐产物与诚实性 · alone ≠ dual · 不代签 mw-rag-route）
**被审 tip**: `697ad54fd8c7a1ca88e230b6ff4ffee9f361dfcf`（branch `line/m-conditions-registry` · parent = origin nail `608e769`；REQUEST `b41cdbd` 因 patch-identical 已 rebase drop —— `git patch-id --stable` 实测 `b41cdbd` ≡ `fa3cc3b` = `48a48c3c8127cb5ebd63864978c31b6782b181d1`，且 `fa3cc3b` 为 tip 祖先，内容经 origin 保留）
**Pre-exec dual**: mw-e2e-ha `5bdce7f` PASS + mw-rag-route `ce36b81` PASS（两 commit 均实测存在）
**审查方法**: 仅命令 + EXIT + 可复现证据（`git show --stat` / `git diff` / `git patch-id` / `sed -n` 逐行 / python 逐 cell 机检），零自批。

## 1. 包完整性（EXIT 0）

`git show --stat 697ad54` = 恰 2 files、+4/−4：`ai-docs/delivery/gap-bug-backlog.md`（+2/−2，`:34-35`）+ `ai-docs/delivery/execution-master-checklist.md`（+2/−2，`:441-442`）。全量 diff 逐行核对：四处均为**行尾追加**，既有内容零删改（tip 行逐行 startswith 基线行，机检证实）。

## 2. 状态字段机检（`git show 608e769:…` vs `git show 697ad54:…` · PASS）

| 位置 | 机检项 | 结果 |
|------|--------|------|
| backlog `:34` status cell[4] | `**OPEN** CONDITION · prior-docker-inspect is not live · not closed by this nail` | base==tip **True（逐字符 SAME）** |
| backlog `:34` col6 cell[6] | `open CONDITION` | SAME |
| backlog `:35` status cell[4] | `disclosed, not washed, not closed · attempt1 EXIT 1 (pg Client terminated mid-prove) · attempt2 EXIT 0 · PERF/LOAD stays local partial` | **SAME** |
| backlog `:35` col6 cell[6] | `disclosed OPEN` | SAME |
| backlog `:34`/`:35` 行结构 | 8 内容 cell 中**仅最后指针 cell 变更且为尾追加**，其余 7 cell 逐字符 SAME（`changed_cells=[7]`） | PASS |
| checklist `:441` 前缀 | `- [ ]` 未勾选框前缀保留，tip 行 startswith 基线行 | PASS |
| checklist `:442` 前缀 | `- ` bullet 前缀保留 | PASS |
| checklist `:443` pins 行 | `Pins unchanged: haStatus=NOT_HA · … · public DELETE=503` | 逐字符 SAME（未动） |

## 3. 锚点抽查（10/10 实证命中）

| 锚点 | 实测内容 | 判定 |
|------|----------|------|
| `scripts/uc018-receipt-backfill-emit.mjs:344` | `function collectImageDigestsRaw(cwd) {` | HIT |
| `…emit.mjs:353` | `const r = sh(\`docker image inspect …\`)` | HIT |
| `scripts/lib/uc018-receipt-backfill-facts.mjs:243-246` | `else if (priorDigestStr && mode === 'reemit')` → `source='prior-docker-inspect'` / `liveObservation=false` | HIT |
| `…facts.mjs:61-66` | `export function isLiveImageDigestEntry(entry) { … }` | HIT |
| `scripts/uc018-perf-load-capped-child.mjs:202-204` | `docker start -a API_NAME` / `docker rm -f` / `process.exit(start.status ?? 1)` | HIT |
| `receipts/uc018-receipt-backfill/PERF-LOAD.json:28-29` | `"source": "prior-docker-inspect",` / `"liveObservation": false,` | HIT |
| correction `0d42e2c` §2 `:369-397` | `## 2. PERF-LOAD@b29c191 · teardown investigation + attempt2` 全节 | HIT |
| correction `:371-380` | `### Attempt1 root cause（cite）` 至 exit-path 段 | HIT |
| correction `0d42e2c` §3 `:399-401` | `## 3. C-IMAGE-DIGEST（condition · retained）` | HIT |
| RE-REVIEW `07823b5` §5 `:475-481` | `## 5. Conditions kept open（prose does not close them）` + C-PERF-TEARDOWN / C-IMAGE-DIGEST 行 | HIT |

## 4. 诚实性

- 新增文字 = 4 处行尾 `· evidence: / evidence chain: …` 指针串，**纯锚点引用**；`kept open` 系逐字复述 RE-REVIEW §5 标题（Conditions kept open），非本刀新结论。
- 零关闭 / 零升级 / 零新增根因结论 / 零修复暗示（"attempt1 EXIT 1, pg Client terminated mid-prove" 等表述均在保留前缀内，非新增）。
- `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER` 在 `git diff 608e769..697ad54` 中提及次数 = **0**（不互借）。
- `canHonestlyFlip=false`（checklist `:439`）与 coveredCount **8** 未动；零源码、零 receipt JSON/log/README 改写、零其他 SSOT 区域、零 prove、零 push。

## 5. 条件裁决（pre-exec 条件逐条）

| # | 条件 | 判定 | 证据 |
|---|------|------|------|
| C1 | 登记范围 = 两文件四处 | **PASS** | `--stat` 恰 2 files +4/−4；diff 仅 `:34-35`/`:441-442` |
| C2 | 状态字段逐字符不动 | **PASS** | §2 机检表全 SAME |
| C3 | OPEN 保持 | **PASS** | `OPEN CONDITION` / `open CONDITION` / `disclosed OPEN` 原值 |
| C4 | 不互借 | **PASS** | diff 零提及 GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER |
| C5 | UC-018 flip 禁令持续 | **PASS** | `:439` `canHonestlyFlip=false` / coveredCount 8 未动；pins `:443` 原值 |
| C6 | 修复另刀 | **PASS** | 零源码 diff，emitter/facts/capped-child 仅被引用未改动 |

## Blockers

无。

## Conditions

- 本 Verdict 仅覆盖 `697ad54` 的登记对齐与诚实性；C-IMAGE-DIGEST / C-PERF-TEARDOWN 仍 **OPEN**，本登记不构成关闭、升级、covered flip 或修复。
- alone ≠ dual：本段不代签 mw-rag-route；最终 dual 效力以 rag-route 独立复验同 tip 为准。

## Chinese 3-line

1. 2 文件 +4/−4 四处行尾追加，backlog `:34-35` 状态 cell、checklist 未勾选框前缀与 pins `:443` 逐字符机检 SAME，OPEN 保持未动。
2. 10 个 file:line 锚点（emitter `:344`/`:353`、facts `:61-66`/`:243-246`、capped-child `:202-204`、PERF-LOAD.json `:28-29`、correction §2 `:369-397`/`:371-380`/§3 `:399-401`、RE-REVIEW §5 `:475-481`）逐一实证命中，新增文字纯锚点，`kept open` 系复述原标题。
3. 零源码、零互借（GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER 零提及）、`canHonestlyFlip=false`/coveredCount=8/pins 原值，条件裁决 6/6 PASS。

Verdict: PASS
