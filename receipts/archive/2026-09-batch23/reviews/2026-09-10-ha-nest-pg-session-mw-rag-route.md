# Review — HA Nest Postgres 真会话（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-e2e-ha 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（限本地 Nest session sticky via PG sidecar；**禁止升阶 HA**）  
**releaseEvidence=false** · **Not HA** · **nestSessionOk=true（LOCAL）** · **≠ 生产 HA** · **≠ 阶 C/D 绿**

覆盖 REQUEST：`REQUEST-2026-09-10-ha-nest-pg-session-mw-rag-route.md`

## 对照

- `harness/ha-track.multi-instance.md`（C3b 本地路径）
- `docker/compose.ha-dual.pg.yml` · `scripts/ha/prepare-nest-pg.mjs` · `prove-nest-session.mjs`
- 收据：`nest-session.OK.json` · A-signup / B-profile
- 禁区：未碰 Meridian；未读 `.env*`

## 焦点核实

| 焦点 | 结果 |
|------|------|
| auth/session 仍 Postgres 权威 | **成立**。PG overlay 覆盖 `DATABASE_URL`；sole MySQL **不能**替代；prepare+migrate+runtime 路径 |
| A→B sticky 真实 | **成立**。`NEST_SESSION_LOCAL_OK` · path `A_signup_token→B_profile` + login→B；`nestSessionOk: true` |
| OK 收据不升 HA | **成立**。`nest-session.OK.json`：`haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false`；note 钉 shared PG+AUTH_SECRET sticky ≠ 生产 HA |
| `--require-evidence` EXIT=1 | **成立**。即便 `nestSessionOk: true` 仍 `result: FAIL` EXIT=1（拒生产拓扑/CI/审） |
| C3b ≠ 阶 C 绿 | **成立**。ladder `D=not_open`；harness 钉本地路径 ≠ 阶 C |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT |
|-----|------|
| `node scripts/ha/ha-track.multi.proof.mjs` | **0** |
| `node scripts/ha/prove-nest-session.mjs --prove`（PG dual 已起） | **0**（`NEST_SESSION_LOCAL_OK` · `nestSessionOk: true` · `NOT_HA`） |
| `node scripts/ha/prove-nest-session.mjs --require-session` | **0**（session 已 LOCAL_OK） |
| `node scripts/ha/probe.multi.mjs --require-evidence` | **1**（nestSessionOk=true 仍拒 HA） |

## 非宣称

禁止：升阶 HA、阶 C/D 绿、生产 failover、`releaseEvidence=true`、把 shared PG+AUTH_SECRET sticky 读成生产 HA、sole MySQL 可替代 Nest session DB。
