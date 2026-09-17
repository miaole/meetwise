# Review — HA Nest session（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-e2e-ha 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（诚实 **GAP/PREREQ**；**禁止升阶 HA**；**≠ Nest session 已证**）  
**releaseEvidence=false** · **Not HA** · **nestSessionOk: false** · C3 SHARED_OK ≠ Nest session

## 对照

- `harness/ha-track.multi-instance.md`（C3b Nest session GAP）
- `scripts/ha/prove-nest-session.mjs`
- REQUEST：`REQUEST-2026-09-10-ha-nest-session-mw-rag-route.md`
- 前序 C3：`2026-09-10-ha-c3-shared-mw-rag-route.md`（SHARED_OK ≠ Nest session）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| auth/session 需 Postgres | **成立**。`createPool` postgres-only；`gateway_auth_signup/login`；PrincipalGuard → `user_account`；compose `DATABASE_URL` = placeholder `@127.0.0.1:1`（仅 /livez） |
| sole MySQL 不够 | **成立**。sole = MySQL+Redis；收据钉「Nest auth cannot issue session against sole MySQL」；不得暗示 MySQL 可替代 Nest session DB |
| login 无 token | **成立**（`--probe`）。A/B `POST /auth/login` → status 500 · `issuedToken: false`；`/readyz` 503 degraded；`/livez` 可 200（C2 only） |
| C3 ≠ Nest session | **成立**。`sharedOkPath: C3_SHARED_OK_present_but_≠_Nest_session`；hostpath SHARED_OK 正交 |
| fail-closed | **成立**。`--require-session` → EXIT=1 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `node scripts/ha/prove-nest-session.mjs` | **0**（`PREREQ_GAP` · `nestSessionOk: false`） |
| `node scripts/ha/prove-nest-session.mjs --require-session` | **1** |
| `node scripts/ha/prove-nest-session.mjs --probe` | **0**（仍 GAP；login 无 token；livez 200 ≠ session） |
| `node scripts/ha/ha-track.multi.proof.mjs` | **0**（登记 nest-session 工具 + 诚实钉） |

## 非宣称

禁止：Nest session 已关、阶 C/D 绿、生产 HA、`releaseEvidence=true`、把 C3 Redis/MySQL marker / dual `/livez` 读成业务 session sticky。
