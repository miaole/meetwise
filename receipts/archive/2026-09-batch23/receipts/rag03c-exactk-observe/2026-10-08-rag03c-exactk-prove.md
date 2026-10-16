# Receipt — RAG03-C · GAP-RAG-03 exact-K fill 观察刀 · prove（`awaiting_post_prove_dual` · 多结局读数在卷 · `:71` OPEN · 观测≠SLO）

**Status**: **`awaiting_post_prove_dual`**（EXEC 完成 · 四格有效 attempt 全 EXIT 0 · 判别读数四格一致 · **登记非定谳** · post-prove 双审归协调方派 · meetwise 授权 nail 前 Ban self-nail · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · **PG-retained** · 公开 DELETE=503 · **`g7SuiteGreen=false`** · **`actualSpendCny=null`** · backlog `:71` GAP-RAG-03 **OPEN**（canHonestlyFlip=false）· `:70` GAP-RAG-02 OPEN（非本刀）
**REQUEST**: `9404c4c4` / `9404c4c495cc8347ae536021b5050a3e4c330338`（pre-exec dual BOTH PASS：mw-rag-route + mw-model-op）
**CODE_SHA**: `be2da779`（C-1..C-4）→ 仪器修复 `f113768a`（run-1 红后 · 断言名/判据/夹具/期望零变化 · §3）
**Base**: `9265e4d8` / `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`（fetch 后 origin tip **未前进**——与协调方 EXEC 指令「主线已前进多刀」预期不符，如实记录：无 rebase 需要、HNSW 相关 migration/proof 零漂移、§0 全锚复核与 REQUEST 期一致、stop 条件未触发）
**Harness**: `ai-docs/delivery/harness/rag03c-exactk-observe.md` §1-§5
**Date**: 2026-10-08（Asia/Shanghai · 起止逐 run 见 attempt-ledger.txt）

## §1 执行（主 CMD · 固定序 · 全 attempt 台账 `attempt-ledger.txt`）

```text
./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03c-exactk-observe:prove        # P1 臂（默认）
RAG03C_ARM=P2 ./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03c-exactk-observe:prove   # P2-a 格
```

| # | run | EXIT | 判定 | 容器 | dur |
|---|-----|------|------|------|-----|
| 0 | bootstrap-P1-a | 1 | infra-boot fail（proof 未执行 · 零读数 · 漏 §4.1 pnpm install 前置+PG boot 超时）→ 补前置（EXIT 0） | — | 105.6s |
| 1 | P1-a | **1** | **红 R3C-P1-HNSW-USED = 仪器缺陷**（extractHnswIndexName guard 笔误恒 null + planFilterShape 根包裹未下钻恒 'none' · f113768a 修复 · 断言名/判据零变化）· 判别读数 5/true 来自正确代码路径有效 | meetwise-e2e-44249 | 9.9s |
| 2 | **P1-a2** | **0** | 全绿（仪器修复后 @f113768a） | meetwise-e2e-45857 | 6.5s |
| 3 | **P1-b** | **0** | 全绿 | meetwise-e2e-46243 | 6.1s |
| 4 | **P1-c** | **0** | 全绿 | meetwise-e2e-46625 | 6.2s |
| 5 | **P2-a** | **0** | 全绿（RAG03C_ARM=P2 · 2000 行） | meetwise-e2e-47013 | 19.7s |

环境（每 run 收据在卷）：image `pgvector/pgvector:pg16` RepoDigests 双名同 `sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a` · pgvector extversion **0.8.7** · PostgreSQL 16.15 · `hnsw.ef_search`=default(40) · ann 函数 proconfig 含 `hnsw.iterative_scan=strict_order`（0139 承卷 · 零改动）· 零模型调用（env -u 双键剥离）· 全部 runner receipt `.tmp/isolated-proof-receipts/2026-10-08T06-3*/06-4*.json` + 日志 `logs/`。

## §2 判别读数三件套（预注册 · 记录非门禁 · 四有效格一致）

| 格 | hnswReturned | hnswExactFillObserved | planFilterShape（sub / live） | P-DEFAULT HNSW_USED |
|----|--------------|------------------------|------------------------------|---------------------|
| P1-a2 | **5** | **true** | same-table-filter / same-table-filter | false |
| P1-b | **5** | **true** | same-table-filter / same-table-filter | false |
| P1-c | **5** | **true** | same-table-filter / same-table-filter | false |
| P2-a | **5** | **true** | same-table-filter / same-table-filter | false |

- 返回行四格全为恰 5 个批准 in-scope ref（`r3c_appr_00..04`）· 距离 0.06→0.10 升序 · 0 未批准 · 0 越界 · ≤K（`R3C-SAFETY` 逐计划面绿）。
- P1 夹具：60 行（10 越界 0.01-0.05 + 5 批准次近 0.06-0.10 + 45 未批准 0.12-0.56 · 顺序不变量满足）。P2 夹具：2000 行（1985 随机单位向量未批准 · **p2MinMassDist=0.922152** ≫ 批准最远 0.10 · 顺序不变量满足）。
- **P-DEFAULT 自然触发面**：60 行与 2000 行语料下规划器均不走 HNSW（candidate-driven 路径返回精确 5）——`P-DEFAULT-HNSW-USED=false` 如实记录（登记非定谳归协调方）。

## §3 机理证据（live 计划 auto_explain 全文在卷 · 双口径）

- HNSW `Index Scan`（`qgc_hnsw_visible_<gen>`）节点携带**同表 Filter**（`generation_id` + scope GUC 谓词原文在卷 nodeFacts.filterText）· P2-a live 计划显示 **`Rows Removed by Filter: 10`**——同表 Filter 弹出 10 行全局最近的越界行后，`iterative_scan=strict_order` **继续推进**至批准行并返回 5。
- candidate JOIN（`qbank_retrieval_candidate` 经 0138 前移）位于 Join 节点（AQ 收据 §5 披露面）。**同表 Filter 面（iterative 可见可继续）与 JOIN 面（AQ 退化夹具下面）的结构区分首次完整在卷**：AQ `hnswReturned=0` 的成因与「夹具分布把批准行排出 K 近邻窗口 + JOIN 面不触发继续翻批」一致；非退化分布下同表面继续翻批即可达 exact-K。
- 机制事实的表述纪律：本刀读数支持「分布敏感性」（同机制不同分布→0 vs 5）——「与分布退化一致」≠「H-E1 已证」；E2/E3 未被触发剔除（本刀夹具未复现 AQ 退化形态的对照面——该面 AQ 已有读数 0 在卷），E1/E2/E3 归一或分流=登记非定谳，**定谳权归协调方**。

## §4 判别落点（预注册映射 · harness §5）

- 四格 `hnswReturned=5 且 exactFill=true` → **H-E1 候选成立（登记非定谳）**：exact-K fill 面事实性可行使，AQ `hnswReturned=0` 与夹具向量分布退化（批准行被构造出 K 近邻窗口）一致。
- ≠ 修复 ≠ 关 `:71` ≠ production HNSW SLO ≠ exact-K completeness claimed ≠ covered flip ≠ HA ≠ R-b green。观测读数入卷后，`R3-HNSW-COMPLETENESS` 行处置与 backlog `:71` 剩余面表述**归协调方裁**。

## §5 缺陷披露（全录 · NHP-028 attempts-ledger 先例）

1. **run-0 bootstrap fail**：implementer 漏执行 harness §4.1 钉死前置 `pnpm install --frozen-lockfile`（pnpm WARN 在案）+ 隔离 PG boot 超时（冷 daemon）。补前置后按预注册执行序重跑。proof 未执行、零读数、零冲销对象。
2. **run-1 instrument-defect 红**：两个观测 helper 缺陷（一字符 guard 笔误 `===`→应 `!==`；shape walk 根包裹未下钻）致 `hnswIndexName` 恒 null + `planFilterShape` 恒 'none' → 门禁 `R3C-P1-HNSW-USED` 红在仪器上（非 AQ 已闭面退化——run-1 自身捕获的计划 JSON 含 HNSW Index Scan 节点，修复后函数对其输出 extract=索引名/shape=same-table-filter 实证在卷）。修复 commit `f113768a`：断言名/判据/夹具/期望**零变化**，仅修两 helper + additive 收据字段 `planNodeFacts`（Filter 原文/Recheck/joinAbove）。该 attempt 读数格以 P1-a2 重跑，红原值与日志全录保留。
3. 双缺陷运行的裁处（是否计入 attempt 账、演进是否 non-wash）**归 post-prove 双审 + 协调方**。

## §6 Machine checks

- `git diff --stat 9265e4d8..HEAD -- packages/db/src packages/db/migrations apps` = **0 字节**；0138/0139/0029/`principal.ts`/既有三 proof（filter-locus/hnsw-completeness/rag03-route）零触碰；改动面恰 C-1..C-4 + 仪器修复。
- 全程 dirty=[] · code 先提交后 prove（`be2da779` → attempts → `f113768a` → P1-a2/P1-b/P1-c/P2-a）。
- 零生产数据 · 零 DDL/migration · 夹具全经既有 ingest/control-executor/revoke 写入路径 · 零 trigger 绕过 · **Ban FULLTEXT/Qdrant/MySQL 承卷**（PG/pgvector 唯一向量真相）。
- `.env*` ABSENT · 零 Key 值/fingerprint 入 receipt/log/commit · 零外呼 · `actualSpendCny=null`。

## §7 Non-claims

Not a pass of GAP-RAG-03 · not `:71` closed · not HNSW-complete · not production HNSW SLO · not exact-K claimed（exact-K fill **可观测**=本刀唯一新事实）· not covered · not `releaseEvidence=true` · not HA · not nail（post-prove 双审 + meetwise 授权前）· not E1/E2/E3 定谳 · alone ≠ dual · coveredCount=**8** · `g7SuiteGreen=false`

## Pins（原值保持）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · `:71` OPEN · STOP

---

*Receipt · RAG03-C exact-K fill 观察刀 · awaiting_post_prove_dual · REQUEST 9404c4c4 · CODE be2da779 + 仪器修复 f113768a · 四有效格 P1-a2/P1-b/P1-c/P2-a 全 EXIT 0 · 判别读数 5/true/same-table-filter 四格一致 · H-E1 候选成立登记非定谳 · 同表 Filter 面与 JOIN 面结构区分首次在卷（Rows Removed by Filter:10）· 缺陷运行两笔全录（bootstrap + instrument）红原值保留 · :71 OPEN · Ban production HNSW SLO · 观测≠SLO · alone≠dual · STOP*
