# REQUEST 审查 — HA Nest Postgres 真会话（C3b close）· mw-e2e-ha

**状态**：请求审稿（实现方预写；**禁止**实现方自批）  
**目标审稿人**：mw-e2e-ha（对抗主审）  
**切片**：Nest 业务 session A→B sticky-truth via Postgres sidecar（close prior PREREQ_GAP）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`（C3b）  
**对照**：`ai-docs/delivery/north-star-ha.md` 阶 C/D（仍 **未绿**）  
**硬钉**：`releaseEvidence=false` · **Not HA** · 本地 `nestSessionOk` 可 true **≠** 生产 HA · `--require-evidence` 仍 EXIT=1  
**禁区**：Meridian；`.env*`；宣称生产 HA；打开 DELETE；翻转默认；自批 closed / 自批 HA

## 请审什么

1. `docker/compose.ha-dual.pg.yml` + `scripts/ha/prepare-nest-pg.mjs` + `--compose-pg` 是否诚实：host-published PG 拓扑（container DNS 可能 TCP 阻）· local-dev placeholders · Not HA  
2. `ha:prove:nest-session -- --prove` 是否真证 A signup/login token → B `GET /profile`；收据 `nest-session.OK.json` · `nestSessionOk: true` · **仍** `haStatus: NOT_HA` · `releaseEvidence: false`  
3. `--require-session` 在 OK 后 EXIT=0；无 OK 时仍 EXIT=1  
4. `pnpm ha:probe:multi -- --require-evidence` 是否 **仍 EXIT=1**（即便 nestSessionOk=true）  
5. 是否偷升阶 C/D / 生产 HA / `releaseEvidence=true`

## 实现方自报（仅供独立复跑对照；不采信）

- Nest session：**LOCAL_CLOSED**（`nestSessionOk=true`）· **仍 GAP vs 生产 HA / 阶 C 绿**  
- Topology：`host_published_pg`（host.docker.internal:54339）因 sandbox container↔container TCP 阻  
- Not HA · releaseEvidence=false · require-evidence EXIT=1

## 期望审稿产出

落 `reviews/2026-09-10-ha-nest-pg-session-mw-e2e-ha.md`（独立 CMD+EXIT；阻塞栏；明确批/不批范围）。  
**不得**由实现方代写 pass。
