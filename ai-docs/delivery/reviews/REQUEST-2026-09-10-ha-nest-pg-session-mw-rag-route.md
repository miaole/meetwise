# REQUEST 审查 — HA Nest Postgres 真会话（第二域）· mw-rag-route

**状态**：请求审稿（实现方预写；**禁止**实现方自批）  
**目标审稿人**：mw-rag-route（第二审；主审 mw-e2e-ha）  
**切片**：Nest session A→B via Postgres sidecar（C3b）  
**硬钉**：`releaseEvidence=false` · **Not HA** · 本地 nestSessionOk ≠ 阶 C 绿 ≠ 生产 HA  
**禁区**：Meridian；`.env*`；自批；宣称 HA

## 请审什么

1. auth/session 仍 Postgres 权威；sole MySQL **不能**替代；PG overlay 为可选授权路径  
2. A→B sticky prove 收据真实；`nest-session.OK.json` 不写 `releaseEvidence=true`  
3. `--require-evidence` 仍 fail-closed EXIT=1  
4. north-star / harness 是否诚实：C3b 本地路径 ≠ 阶 C 绿

## 期望审稿产出

落 `reviews/2026-09-10-ha-nest-pg-session-mw-rag-route.md`。  
**不得**由实现方代写 pass。
