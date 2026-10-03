# Meetwise 并发派工 · 2026-10-02

Pins（所有线共用，禁止改口）: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · 公开 DELETE=503

硬规则: 独立 worktree；一 REQUEST / 一 dual / nail+commit+push 后再下一刀；实现方不自批；共享 SSOT（矩阵/backlog/checklist）只在 nail 改；作者用 `git -c user.name=… -c user.email=…@meetwise.local`；审查末行严格 `Verdict: PASS|FAIL`；禁 Meridian；禁 commit secrets/.env。

## 已在跑（不要重复开）
- **A** UC-018 RECEIPT-BACKFILL 收口 · 实现 mw-core · 审 mw-rag-route + mw-e2e-ha
- **B** UC-052 pool-role-leak 收口 · 实现 mw-core · 审 mw-privacy-int + mw-e2e-ha
- **C** G7 fix round2 离线 · 实现 mw-core · 审 mw-model-op + mw-e2e-ha · **禁 live**

## 新开 D–J（与 A/B/C 并行）
| 线 | 题目 | 实现 | 双审 | 禁碰 |
|----|------|------|------|------|
| D | GAP-UC018-WAITING-USER tip 新跑 | mw-core | e2e-ha + rag-route | backfill JSON/emitter |
| E | UI@e88d386 失败回填 | mw-core | e2e-ha + rag-route | 不翻 covered；少动 A |
| F | CKPT-UNSEALED-CLAIM-NEG | mw-core | privacy-int + e2e-ha | B 未钉勿并行改 principal |
| G | GAP-BACKFILL-EMITTER-UNAUTHENTICATED HMAC | mw-core | e2e-ha + rag-route | 只 emitter/guard/prove |
| H | 下一 UC NHP（非 018/052） | mw-core | e2e-ha + rag-route | UC-018/052 行 |
| I | MODEL-OP ledger 文档+离线加固 | mw-core | model-op + e2e-ha | C 的 outbound 主链 |
| J | HA D3 报价文档（不买云） | mw-core | e2e-ha | 禁 claim 生产 HA |

仓库: `miaole/meetwise` 分支 `feat/mysql-schema-skeleton`  
本机: `/Users/miaole/Desktop/golucky/meetwise`  
协调: meetwise（本 bot）开 dual / 授权 nail；实现默认 mw-core。
