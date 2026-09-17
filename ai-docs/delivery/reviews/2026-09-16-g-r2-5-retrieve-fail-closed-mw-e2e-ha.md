# 审查归档 — G-R2-5 Worker retrieve 缺 snapshot fail-closed · mw-e2e-ha

**日期**：2026-09-16（PT；本审独立复跑 ~04:13 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；**不采信**实现方自报；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md`  
**结论**：**pass**（仅 **G-R2-5 retrieve-side** 缺 snapshot → fail-closed 钉/prove 登记）  
**批准范围**：**仅**「缺 / 非法 `InterviewRouteSnapshot` → `decideRouteSnapshotRetrieve` deny → `degradedRetrieval('route_snapshot_missing')`；不发 unscoped local RAG」的 **retrieve-side fail-closed** 与 `pnpm g-r2-5-retrieve-fail-closed:prove` 诚实钉  
**不批**：**R2 关** / **R4 关** / 题域已隔离 / 接线完成（full P-WIRE / dispatch+recheck） / wrong_track=0 / P-START dual-passed / 路由已生效 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / 切 qbank·向量真相  
**硬钉**：`releaseEvidence=false` · **Not HA** · **EXIT=0 ≠ R2/R4 关** · **≠ 题域已隔离** · **≠ covered** · **≠ HA** · **≠ releaseEvidence=true** · **R2/R4 仍开** · **P-START 路径未改（另刀）**

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 缺 snapshot fail-closed prove=0 | **属实**（本审复跑 EXIT=0）；**仅** unit/static retrieve-side；**≠** E2E / HA / production coverage |
| **P-START 路径未改** | **属实**：`startApplicationInterview` 仍 `bind` → 无 binding → `interview_ineligible_route` **拒启在 INSERT 前**；consumer 注释钉 retrieve-side only / P-START separate；本刀未把 start 改成「无 snapshot 也能绿」 |
| **R2/R4 仍开** | **属实**：status / prove NOTE 均钉 **R2 NOT closed** · **题域隔离 NOT closed** |
| REQUEST 自承非 pass / 非 covered·HA / 非 releaseEvidence | **属实**；本审独立签核，**非**实现方自批 |
| 覆盖 REQUEST | 本文件覆盖 `REQUEST-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md` |

对照源：

- Status：`harness/r2-classify-job-route-status.md`（G-R2-5）· `harness/r4-domain-isolation-status.md`（G-R4-1 / P4 / P9）
- 源：`apps/worker/src/qbank-retrieve-scope.ts` · `apps/worker/src/interview-consumer.ts`
- Prove：`apps/worker/test/g-r2-5-retrieve-fail-closed.proof.ts`
- 并列（非本刀关闸）：`g4-production-scoped-retrieve` · `mysql-stack:r4-domain-isolation` ·（抽检）`r2-p-start-route-classify`

---

## 2. 专家问答（REQUEST 必答）

| # | 问 | 答 |
|---|----|----|
| 1 | 证明是否只覆盖可执行 unit/static retrieve-side fail-closed，而不是完整 E2E、HA 或 production coverage？ | **是**。`tsx` 静态/unit prove；无 compose / 多实例 / live；**Not HA**；**≠ covered**。 |
| 2 | 缺 snapshot 是否明确变成 observable degraded denial，而非 unscoped query？ | **是**。`decideRouteSnapshotRetrieve(null|空|非法叶)` → `{allowed:false, reason:'route_snapshot_missing'}`；consumer **仅** `allowed` 时 `adaptive.localRetrieve(..., scope)`，否则 `[degradedRetrieval(reason)]`；无裸 `localRetrieve(owner,q)` unscoped 旁路。`degradedRetrieval` → `availability:'degraded'` → CRAG `deny_external`（≠ 空命中 `fallback_web`）。 |
| 3 | 是否保持 `releaseEvidence=false`、Not HA、sole allowlist 不扩、R2/R4 NOT closed？ | **是**。sole 仍恰 5（wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant）；**无** g-r2-5 / r4 入 allowlist；status + prove NOTE 钉 R2/R4 开。 |
| 4 | 是否确认 P-START 是独立刀，本变更没有修改 start/refuse behavior？ | **是**。P-START 仍真拒启；`pnpm r2-p-start-route-classify:prove` EXIT=0 且 NOTE：`R2 NOT closed overall pending dual-review`；本刀未偷改 start 使「无 snapshot 也能绿」。 |

---

## 3. Prove（本审独立复跑 · CMD+EXIT）

| CMD | EXIT | NOTE / 摘要 |
|-----|------|-------------|
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | `retrieve-side only; R2 NOT closed; R4 NOT closed; releaseEvidence=false` |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | `partial P-WIRE; missing snapshot fail-closed; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false` |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | `honesty pins only; partial P-WIRE ok; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false; Not HA` |
| `pnpm r2-p-start-route-classify:prove`（抽检 · 非 REQUEST 强制） | **0** | `P-START real refuse-start; R2 NOT closed overall pending dual-review + P-FAKE/≠路由已生效; releaseEvidence=false; Not HA` |

**硬读法**：**EXIT=0 ≠ R2/R4 关 ≠ 题域已隔离 ≠ covered ≠ HA ≠ `releaseEvidence=true`**。本绿只证 retrieve-side 缺 snapshot fail-closed 可执行 + 否定钉。

---

## 4. 接线 / 路径核验（对抗）

| 维度 | 独立结果 | 裁定 |
|------|----------|------|
| **缺 snapshot** | deny + degraded；**不**走 unscoped `cachedQbankSearch` | **fail-closed（retrieve-side）** |
| **有合法 snapshot** | 主叶 max-bps → scoped `localRetrieve` | **仍 partial**（≠ full plan） |
| **`dispatchTrackLocalRetrieval`** | Worker `src` **零**生产调用 | **无 full wire** |
| **P-START / start** | 拒启在 INSERT 前；路径**未**为本刀改成无 snapshot 绿 | **另刀；仍 pending dual-review** |
| **R2 overall** | P-START dual-review + P-FAKE + ≠ 路由已生效 | **仍开** |
| **R4 / 题域** | wrong_track=0 / dispatch+recheck / R1+R2 PREREQ 仍挡 | **仍开** |
| **sole allowlist** | 恰 5；未扩 | **OK** |

---

## 5. 对抗：假绿面

| 风险说法 | 裁定 |
|---------|------|
| `g-r2-5-retrieve-fail-closed:prove` EXIT=0 = **R2 已关** | **假绿** — status/NOTE 钉 R2 NOT closed |
| 同上 = **R4 关 / 题域已隔离** | **假绿** — R4 prove NOTE 钉 NOT closed |
| 同上 = **生产已隔离 / wrong_track=0 / full P-WIRE** | **假绿** — 无 dispatch/recheck；仅 primary leaf |
| 同上 = **P-START closed / 路由已生效** | **假绿** — P-START 另刀；pending dual-review |
| 同上 = **covered / HA / releaseEvidence=true** | **假绿** — unit/static only；Not HA；releaseEvidence=false |
| 「fail-closed 绿 = 接线完成 / 关闸」 | **假绿** — 本批准范围**仅**缺 snapshot → fail-closed 钉/prove；**不批**接线完成或关闸 |

---

## 6. 阻塞栏（仍挡外推 / 切流）

1. **R2 overall 仍开**：P-START dual-review 收据未齐；P-FAKE；≠ 路由已生效。  
2. **R4 / 题域隔离仍开**：无 full dispatch+recheck；wrong_track=0 未证；R1/R2/Metadata PREREQ 仍挡。  
3. **本绿 ≠ E2E / HA / covered / releaseEvidence**。  
4. **sole allowlist 不因本刀扩**；禁止用本绿假切 qbank/向量真相。

---

## 7. 裁定

| 项 | 值 |
|----|-----|
| **结论** | **pass** |
| **批准范围** | 仅 G-R2-5 **retrieve-side**：缺 snapshot → fail-closed 钉 / prove 登记 |
| **不批** | R2/R4 关闸、题域已隔离、接线完成、P-START dual-passed、covered、HA、`releaseEvidence=true` |
| **阻塞** | 上节阻塞栏全部仍有效；本 pass **不清除**任何关闸阻塞 |

---

## 收据

- 专家：`mw-e2e-ha`
- 覆盖 REQUEST：`ai-docs/delivery/reviews/REQUEST-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md`
- 结论文件：`ai-docs/delivery/reviews/2026-09-16-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md`
- 并列第一域（参考 · 不替代本审）：`2026-09-16-g-r2-5-retrieve-fail-closed-mw-rag-route.md`
- HEAD：`639134f`（workspace `/workspace/meetwise` → `/workspace/projects/meetwise`）
- 复跑时刻：2026-09-16 ~04:13 PT
