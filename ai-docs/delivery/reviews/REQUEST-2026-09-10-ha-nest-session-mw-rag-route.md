# REQUEST 审查 — HA Nest session 真共享 · mw-rag-route

**状态**：请求审稿（实现方预写；**禁止**实现方自批）  
**目标审稿人**：mw-rag-route（第二域对抗）  
**切片**：Nest 业务 session A→B sticky-truth prove（beyond C3 Redis hostpath SHARED_OK）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`  
**硬钉**：`releaseEvidence=false` · **Not HA** · Nest session **GAP** · 禁止假绿  

## 第二域焦点

1. 是否把 C3 Redis/MySQL marker / hostpath SHARED_OK 误读成 Nest/RAG 业务共享态已证  
2. Postgres-only Nest 路径 vs sole MySQL 的 PREREQ 是否说清（不得暗示 MySQL 已可替代 Nest session DB）  
3. harness/north-star 是否仍禁止阶 C/D 绿与 `releaseEvidence=true`  
4. 与 mw-e2e-ha 冲突时取更严阻塞项

## 期望审稿产出

落 `reviews/2026-09-10-ha-nest-session-mw-rag-route.md`。实现方 **不得**自批。
