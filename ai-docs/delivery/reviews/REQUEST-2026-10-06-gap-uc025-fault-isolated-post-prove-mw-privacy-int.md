# POST-PROVE · Line W · GAP-UC025-FAULT-ISOLATED-01 · privacy side（mw-privacy-int）

主审：`mw-privacy-int`  
日期：2026-10-06（约 12:38 CST / UTC+8）  
**审查 tip（origin）**：`e8d8a91` / `e8d8a919a4f1a6da8e2879a09d429653fd849705`（implementer prove receipt tip）  
**CODE**：`cce33ba` / `cce33ba9359ee040cf7cffa661cbb2477a1ed694`  
**REQUEST**：`43322e5` / `43322e5c2686b3daaf1e66a255184ac8ca74c6b9`  
**PRE dual**：mw-e2e-ha `69be76c` / `69be76c9c3c7eb1ef2cc8ce2bdd4686c750487f2` + mw-privacy-int `3fb7ba5` / `3fb7ba50803c9f43c3960913ced51f916c373e34`（本审 PRE 收据 · **不代签 e2e · alone≠dual**）  
**Implementer receipt**：`ai-docs/delivery/receipts/2026-10-06-gap-uc025-fault-isolated-prove.md` + `.json` @ tip `e8d8a91`  
**本审 spot-check**：clean detached worktree @ CODE `cce33ba` · `pnpm install --frozen-lockfile --offline` · **一次** `pnpm uc025:nhp-fault-isolated:prove` · **EXIT=0**（无重试）  
未读 `.env*` · 未触 Meridian · 未改产品 · 未编辑旧收据 · 未代签 e2e。

---

## 1 · Scope（REQUEST..CODE / CODE..tip）

### REQUEST `43322e5` .. CODE `cce33ba` 文件清单

实现刀自身（`48c4a8a^..cce33ba`）仅 **4** 文件：

| Path | Role |
|------|------|
| `apps/api/test/uc-e2e-025-nhp-fault-isolated.proof.ts` | 隔离 PG/HTTP prove |
| `apps/api/package.json` | `prove:uc025-nhp-fault-isolated` |
| `package.json` | `uc025:nhp-fault-isolated:prove` (+ raw) |
| `scripts/run-e2e-isolated.mjs` | 三层壳登记 + receipt sources |

全量 `43322e5..cce33ba` 另含中间 tip 上 Line V nail / PRE 审签 docs（矩阵/backlog/checklist/reviews）——**非本刀产品改动**。

### CODE `cce33ba` .. tip `e8d8a91`

| Path | Role |
|------|------|
| `ai-docs/delivery/receipts/2026-10-06-gap-uc025-fault-isolated-prove.md` | implementer receipt |
| `ai-docs/delivery/receipts/2026-10-06-gap-uc025-fault-isolated-prove.json` | machine-readable |

### 产品面（privacy 关注）

| Check | Result |
|-------|--------|
| `apps/*/src` / `packages/*/src` / migrations | **零 diff**（实现刀 4 文件无产品路径） |
| `apps/worker/src/checkpoint-principal.ts` | **零 diff · Ban 守住** |
| `principal.guard.ts` / `main.ts` CORS / `interview.service.ts` | **零 diff**（六次 attempt 的 `sourceDigests` 中两者 digest 恒同） |

**PASS** — 无 auth/principal/guard/CORS/interview.service 产品弱化面可审。

---

## 2 · Retry-to-green honesty（critical）

实现方台账 + `.tmp/isolated-proof-receipts/` 中 proof `sourceDigests` ↔ git blob SHA256 对账：

| # | Container / receipt | Proof digest → SHA | EXIT | 原因（收据/台账） |
|---|---------------------|--------------------|------|-------------------|
| 1 | `752001` · `2026-10-06T04-30-04Z` | → `48c4a8a` / `48c4a8aad34396bb8d8a9c348d1fbf94fb6c514d` | **1** | invalid UUID fixture（22P02） |
| 2 | `753206` · `04-30-34Z` | → `8d0d808` / `8d0d808e93396f3d718d247eaad8feb1cf14aa36` | **1** | snap 查不存在的 `entitlement_consumption.interview_id` |
| 3 | `754258` · `04-30-56Z` | → `ca4e44d` / `ca4e44d718d134dc3bdd4b3cd60d4c943da235ae` | **1** | F1–F4 PASS · F5 HTTP 500（job CHECK=50 vs v64） |
| 4 | `755493` · `04-31-38Z` | → `e7b9ba2` / `e7b9ba2f8947319ba7b2c5c91011b0970e3a2718` | **1** | F1–F4 PASS · F5 HTTP 500（sql/22 bind immutable） |
| 4b | `756259` · `04-32-02Z`（**台账未列**） | → **同** `e7b9ba2` | **1** | 同 SHA 再跑仍红（非绿洗） |
| 5 | `759280` · `04-34-21Z` | → `cce33ba` / `cce33ba9359ee040cf7cffa661cbb2477a1ed694` | **0** | F1–F5 21/21 · **CODE 上首次绿** |

- 各红 attempt 落在**不同**实现 SHA（fix 迭代），**非**同 SHA 重试洗绿。  
- attempt5 = CODE `cce33ba` **首绿**；4b 同 `e7b9ba2` 仍 EXIT1 → **不是** retry-to-green。  
- 真实进程退出：本地 JSON `exitCode` 字段 + proof `process.exit(exit)`（`uc-e2e-025-nhp-fault-isolated.proof.ts:423` / crash `:429`）+ 外壳 `LOCAL_ISOLATED_PROOF_RECEIPT`；本审 spot-check 另有 shell `echo EXIT=$?` → `EXIT=0`。未见伪造 `PROCESS_EXIT` 横幅。  
- 产品 `interview.service.ts` / `principal.guard.ts` digest 六次 attempt **恒同** → 绿来自 proof/fixture 迭代，非弱化产品。

**PASS**（附 OPEN：台账漏记 4b · 见下）。

---

## 3 · Spot-check（本审 · 一次 · 无重试）

```text
worktree=/workspace/wt-mw-privacy-uc025-code  HEAD=cce33ba9359ee040cf7cffa661cbb2477a1ed694
pnpm install --frozen-lockfile --offline   # EXIT 0
sg docker -c 'pnpm uc025:nhp-fault-isolated:prove' ; echo EXIT=$?
# → EXIT=0
# ATTEMPT_END  iso=2026-10-06T04:37:40.086Z EXIT=0 total=21 fail=0
# CMD=pnpm uc025:nhp-fault-isolated:prove EXIT=0
# log=/tmp/uc025-fault-iso-spotcheck-20261006123729.log
# isolated PG meetwise-e2e-765152-… PGPORT=32828（本地 disposable · 非远程 DB）
```

披露：

```text
PRIVACY_NOTE  AUTH_DEV_HEADER="<unset>" NODE_ENV="<unset>"
PRIVACY_NOTE_AFTER_BOOT  AUTH_DEV_HEADER="1" NODE_ENV="<unset>"
```

F1/F2 → HTTP **409** `missing_quiz_expiry` + zero-side-effect；F3 BOUND sentinel；F4 NEG `stale_quiz`；F5 202 baseline。

**PASS**

---

## 4 · AUTH_DEV_HEADER 双闸 / NODE_ENV / CORS

| 闸 | file:line @ CODE | 状态 |
|----|------------------|------|
| 双条件硬闸 | `apps/api/src/platform/principal.guard.ts:63` `AUTH_DEV_HEADER==='1' && NODE_ENV!=='production'` | **未改**（REQUEST..CODE 零 diff） |
| 生产 CORS 不含 x-user-id | `apps/api/src/main.ts:67` `isProd ? [] : ['x-user-id']` | **未改** · **未**放行生产 x-user-id |
| harness 注入 | `_neg-harness.ts:45` `AUTH_DEV_HEADER: '1'` | 不变；未显式设 `NODE_ENV` |
| prove 披露 | proof `:73` / `:80` `PRIVACY_NOTE` / `PRIVACY_NOTE_AFTER_BOOT` | **已打印** 两值（本审 spot-check  verbatim） |

**无弱化 · 非 blocker**。NODE_ENV 仍 `<unset>`（`!=='production'` 为真）——见 OPEN。

---

## 5 · Ban wash AA

| 项 | 源 | 证明 |
|----|----|------|
| NULL → 409 `missing_quiz_expiry` | `interview.service.ts:238-239` | F1 `proof.ts:301` 断言 `status===409 && body.error==='missing_quiz_expiry'` |
| NaN → 同口 | `interview.service.ts:241-242` | F2 `proof.ts:352` |
| owner-scope | `interview.service.ts:214` / `:232` `owner_user_id=$2` | 产品零 diff；proof 静态 PIN `:209` |
| complementary ≠ substitute | receipt + proof banner | AA in-process `a8b98fc`/`3a6ec52` ≠ 本刀隔离 PG/HTTP；`aaWash:false` |

状态码/错误码未改。**PASS**

---

## 6 · 拒绝即无痕 · owner-scope

- F1/F2：`snapOf` before/after 同快照（interview status/resume_id · jobCount · consumption · bucket）——`proof.ts:220-250` / `:302` / `:353`；F1 另断言 stays `created` unbound jobCount=0（`:303`）。  
- 抛点先于 reserve/enqueue（产品注释 `interview.service.ts:228-229` · 零 diff）。  
- owner 查询未 widen（`$2` = principal）。

**PASS**

---

## 7 · Ban fake covered

| Pin / 行 | @ tip / CODE | 结论 |
|----------|--------------|------|
| UC-E2E-025 FAULT 列 | 矩阵 `:125` **仍 gap**（AA in-process ≠ isolated · EXIT0≠covered） | **未翻** |
| 行状态 | **gap** | **未翻** |
| coveredCount | **8**（RAG-FUNNEL-02A..08 only） | **未升** |
| 实现刀 docs | 实现刀 **未**改矩阵/backlog/checklist（仅 proof+scripts） | 无 fake covered 写入 |
| proof 自述 | `ROW_STILL_GAP` · `EXIT0≠covered≠nail`（`:420-421`） | 诚实 |

**PASS**

---

## 8 · Pins

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false**（本地 isolated receipt） |
| public DELETE | **503** |
| Stack | **PG-retained** |
| externals | **retention_pending**（UC-052 面未碰） |
| UC-052 | stays **partial** |
| coveredCount | **8** |
| Ban「covered」作 gap 状态词 | 遵守 |

**PASS**

---

## OPEN（非阻塞）

1. **NOTE-UC025-DEVHEADER-NODEENV-DISCLOSE OPEN**（延续 PRE）：`_neg-harness.ts:45` 设 `AUTH_DEV_HEADER:'1'` 但**未**显式设 `NODE_ENV`；spot-check 见 boot 后 `NODE_ENV="<unset>"`。双闸仍成立且 prove **已披露**两值——**非 blocker**（guard/CORS 未弱化）。  
2. **NOTE-UC025-ATTEMPT-LEDGER-4b OPEN**：`.tmp` 存在同 SHA `e7b9ba2` 额外 EXIT1（`756259` @ 04:32:02Z），implementer md/json 台账未列。仍红→非 wash；建议日后补一行。  
3. Peer **mw-e2e-ha post-prove**：本审 **不代签** · alone≠dual。

---

## 总评

审点 1–8 成立；spot-check @ CODE `cce33ba` **EXIT=0**；无 retry-to-green；无 guard/CORS/interview 产品弱化；AA 409 `missing_quiz_expiry` 未洗；拒绝无痕+owner-scope 守住；FAULT/行 stays gap · coveredCount=8；Pins 原值。未代签 e2e。

Verdict: PASS
