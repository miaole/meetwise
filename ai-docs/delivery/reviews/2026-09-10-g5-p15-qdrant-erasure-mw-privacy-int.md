# 审查归档 — G5 P15 Qdrant erasure · mw-privacy-int 主审

**日期**：2026-09-10
**结论**：**pass**（**限 P15 subject-erase 子切片**）
**releaseEvidence=false** · **Not HA** · **G5 仍 GAP** · **≠ privacy covered** · **≠ 0091 ledger** · **≠ 假 DELETE 202** · 实现方不自批

## 对照
- `harness/qdrant-g5-erasure-ledger.md`
- `r5-retirement-sole-stack-status.md` P15 / G5
- GAP-PRIV-04
- `packages/qdrant-store` `eraseSubjectPoints` + `prove:g5-erasure`

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm qdrant-store:g5-erasure:prove` | **0**（subject A erase `deleted_count=2` + recall=0；B intact；re-erase 0；钉 G5≠0091；privacy.service **仍 503**；不在 sole allowlist） |
| `pnpm qdrant-store:erase-honesty:prove` | **0** |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** |
| `pnpm mysql-stack:qdrant-backed:prove` | **0**（仍钉 **STILL-GAP G5**） |

## 硬门核对
| 门 | 判定 |
| --- | --- |
| releaseEvidence=false / Not HA | **成立** |
| 假 DELETE 202/200 | **未见** — 源码 `eraseInterviewData`/`deleteResumeData` 仍 503 |
| ≠ 0091 ledger | **成立** — prove/harness/status 钉 G5 仍开 |
| ≠ privacy covered | **成立** — P15≠关 G5；切流仍 block |
| G5 仍 GAP | **成立** |

## 仍 block（切流 / 关 G5）
1. 0091 `privacy_deletion_receipt` 对齐（request_id/target_id/receipt_kind/…）
2. 授权根 claim/lease 接线
3. 域 sink 登记进 `privacy_deletion_target`
4. 公开 DELETE 开放（须独立 prove+专家审；现仍 503）
5. 切向量真相 / cutover / HA / `releaseEvidence=true`

## 一句话
P15 subject erase **pass**；**G5 仍开**；禁止假 covered / DELETE 已开。
