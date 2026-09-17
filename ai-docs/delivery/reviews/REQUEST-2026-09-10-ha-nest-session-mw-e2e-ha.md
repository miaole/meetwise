# REQUEST 审查 — HA Nest session 真共享 · mw-e2e-ha

**状态**：请求审稿（实现方预写；**禁止**实现方自批）  
**目标审稿人**：mw-e2e-ha（对抗主审）  
**切片**：Nest 业务 session A→B sticky-truth prove（beyond C3 Redis hostpath SHARED_OK）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`（C3b Nest session）  
**对照**：`ai-docs/delivery/north-star-ha.md` 阶 C/D（仍 **未绿**）  
**硬钉**：`releaseEvidence=false` · **Not HA** · **nestSessionOk=false** · **Nest session = GAP** · `--require-session` / `--require-evidence` fail-closed  
**禁区**：Meridian；`.env*`；宣称生产 HA；打开 DELETE；翻转默认；自批 closed

## 请审什么

1. `scripts/ha/prove-nest-session.mjs` 是否诚实：sole MySQL+Redis **不能**背 Nest Postgres auth/session；默认 `PREREQ_GAP`；`--require-session` → EXIT=1  
2. 收据 `.tmp/ha-evidence/nest-session.GAP.json`（及可选 A/B probe）是否 **不**写成 nestSessionOk=true  
3. harness / north-star / README / `ha-track.multi.proof.mjs` 是否钉 Nest session **仍 GAP**（≠ C3 SHARED_OK）  
4. `pnpm ha:probe:multi -- --require-evidence` 是否仍 EXIT=1  
5. 是否偷升阶 C/D / 生产 HA / Nest session closed

## 实现方自报（仅供独立复跑对照；不采信）

- Nest session：**GAP**（非 closed）  
- C3 SHARED_OK：可仍在磁盘；**≠** Nest session  
- Not HA · releaseEvidence=false

## 期望审稿产出

落 `reviews/2026-09-10-ha-nest-session-mw-e2e-ha.md`（独立 CMD+EXIT；阻塞栏；明确批/不批范围）。  
**不得**由实现方代写 pass。
