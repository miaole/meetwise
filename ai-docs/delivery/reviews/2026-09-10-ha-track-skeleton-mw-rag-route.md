# Adversarial second review — HA track skeleton（mw-rag-route）

**专家**：mw-rag-route（对抗复审；主审 mw-e2e-ha 已 pass）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（诚实钉成立；**禁止升阶 HA**）  
**releaseEvidence=false** · **NOT_HA** · 骨架绿 ≠ multi-instance / fault-inject / 生产 HA

## 对照

- `harness/ha-track.skeleton.md` · `north-star-ha.md`
- `scripts/ha/*` · `docker/compose.ha-dual.skeleton.yml`
- 主审：`reviews/2026-09-10-ha-track-skeleton-mw-e2e-ha.md`

## 诚实钉复验

| 钉 | 结果 |
|----|------|
| `haStatus: NOT_HA` | **成立**（skeleton prove + probe receipt） |
| `releaseEvidence=false` | **成立**（永不 true；claimProductionHA=false） |
| `--require-evidence` → **EXIT=1** | **成立**（`REQUIRE_EVIDENCE_EXIT=1`；result=FAIL；仍 NOT_HA） |
| compose config ≠ 实例 | **成立**。`docker compose -f docker/compose.ha-dual.skeleton.yml config` EXIT=0 但 `services: {}`（profile 未启用）；文首钉 config≠实例已起≠HA |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm ha-track:skeleton:prove` | **0**（NOT_HA / releaseEvidence=false） |
| `pnpm ha:probe:skeleton` | **0**（SKELETON / NOT_HA；livez ECONNREFUSED 预期） |
| `node scripts/ha/probe.skeleton.mjs --require-evidence` | **1** fail-closed |
| `docker compose -f docker/compose.ha-dual.skeleton.yml config` | **0**（静校 only；≠ 实例） |

## 与 e2e-ha

**无冲突**。认同主审：骨架可记；阶 C/D 未开；禁止升阶 HA / `releaseEvidence=true`。

## RAG 域注

本审不触及 RAG cutover；sole-stack / R5 假绿轨仍独立（见 `r5-sole-stack` review）。HA 骨架绿不得外推 RAG/sole-stack 已迁。

## 非宣称

禁止：生产 HA、阶 C/D 已绿、multi-instance 已证、fault-inject 已证、`releaseEvidence=true`。
