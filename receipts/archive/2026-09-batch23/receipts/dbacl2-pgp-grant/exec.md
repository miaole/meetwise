# DBACL-2 EXEC 收据 — pgp_sym_encrypt EXECUTE ACL 补授刀（0151）

**席位**：mw-core（EXEC）· 蓝本 = REQUEST rev2 @95911975 · 分支 `line/db-pgp-acl`
**实现 commit**：`0ec543d0`（fix(dbacl2)）· 本收据 commit：见 git log（docs(dbacl2)）
**状态**：`exec:awaiting_post_prove_dual`（Ban self-approve · alone≠dual · 待协调方 post-prove 双席复跑）
**est**：0 live 模型 · 0 Key · 全本地 docker PG（pgvector/pgvector:pg16 一次性容器）

## 1. EXEC 期 catalog 推导（落 0151 前亲跑 · 独立一次性容器 `dbacl2-derive`）

迁移 = 0001–0143 全 144 文件（migrate-cli `applied=144 skipped=0`），live catalog 扫描：

```
-- 全 SECURITY DEFINER 函数体（public）pgp_sym_* 调用扫描（282 个 SD 函数）
 owner           | proname                     | call_site
 memory_runtime  | conversation_event_append   | pgp_sym_encrypt(p_body, p_enc_key)   ← 恰 1 行
 sd_3arg_callers = 0   （0122 三参面全库零 SD 调用）
 sd_decrypt_callers = 0（decrypt 任意面零 SD 调用）

-- 修复前 ACL 态（4 函数 proacl）
 pgp_sym_encrypt:text, text        {meetwise=X/meetwise, app_role=X/meetwise}   ← memory_runtime=false（雷）
 pgp_sym_decrypt:bytea, text       {meetwise=X/meetwise, app_role=X/meetwise}
 pgp_sym_encrypt:text, text, text  {meetwise=X/meetwise}（0122 owner-only）
 pgp_sym_decrypt:bytea, text, text {meetwise=X/meetwise}
 PUBLIC(2arg enc)=false · app_role(2arg enc)=true · memory_runtime(2arg enc)=false

-- P0 手工复现（推导容器内）
 SET LOCAL ROLE memory_runtime; SELECT pgp_sym_encrypt('probe-body','probe-key');
   → ERROR 42501 permission denied for function pgp_sym_encrypt
 app_role + principal 经 conversation_event_append（SD·OWNER memory_runtime）:
   → ERROR 42501 同消息 · CONTEXT 直指 0108:255 INSERT INTO conversation_event_artifact
```

**闭集 = 恰 1〔memory_runtime〕**：多一逐行举证=零 · 少一=零。与 REQUEST rev2 预期一致 →
0151 落单条 GRANT `public.pgp_sym_encrypt(text,text) TO memory_runtime`（无 GRANT ALL · 无发明角色 ·
0121/0108 零字节 · 函数体零触碰）。

## 2. prove 官方轮（run-e2e-isolated 注册靶 `pnpm db-acl2:prove` · runner 自起一次性容器）

**官方 run #1**（@HEAD=0ec543d0）：**EXIT=0 · 37 PASS / 0 FAIL** ·
runner 收据 `.tmp/isolated-proof-receipts/2026-10-08T12-21-58-548Z-69777-c6df18c5-bcef-47a9-8de2-1f84bafe97c7.json`

| 面 | 结果 | 要点 |
|---|---|---|
| P0-0..P0-4 | PASS | Stage A(≤0143) applied=144 · 修复前 proacl=owner+app_role only · PUBLIC/app_role/memory_runtime 矩阵 f/t/f · 直调 42501 · 全链 42501 |
| §3-1..§3-6 | PASS | SD=282 · 闭集⊆预期/预期⊆闭集双向核 · 恰 1 条 memory_runtime·conversation_event_append · 2 参 encrypt · 三参/decrypt 零 SD 调用（DERIVE 行入卷） |
| P5-1 | PASS | Stage B 仅应用 0151（applied 恰 1 · 144 skip） |
| P1-1..P1-9 | PASS | grantee 恰 {app_role, memory_runtime} · memory_runtime f→t · app_role 原样 · PUBLIC=false · decrypt/三参原样 · 全 pgp_sym_* 面 ACL 跨 stage 差恰一处 · 两函数体跨 stage 逐字节全等 |
| P2-1..P2-5 | PASS | 全链绿返回行 · event 行落库恰 1（artifact 回链+digest 一致）· artifact 行落库恰 1（ciphertext 非空 bytea）· **pgp_sym_decrypt 回环还原原文**（真实函数非 mock）· 幂等重放 replayed=true 不双写 |
| P3-1..P3-5 | PASS | 新角色直调仍恰 42501 · has_function_privilege=false · 0151 恰 1 条 GRANT 语句 · 目标集=推导集 · 无 GRANT ALL/非 GRANT-EXECUTE 形 |
| P4-1..P4-3 | PASS | 对 base 95911975 migrations diff 恰 `A 0151` 一行（0001–0143 零字节）· 改动面白名单 · 产品码（packages/db/src · apps/*/src）零改 |
| P5-2..P5-4 | PASS | ledger=磁盘=145（144+0151 · 号位空洞不阻断）· 重跑全 skip 零漂移 · **官方 migrate:prove 子进程全绿**（专用第二净库 meetwise_dbacl2_migrate_prove · 含 0151 在卷全量重放+再部署全 skip） |

## 3. attempts 全账（红→绿逐修 · Ban retry-to-green）

| # | 轮 | 对象 | 结果 | 红→绿归因 |
|---|---|---|---|---|
| 0 | 推导轮 | dbacl2-derive 容器 + psql | 推导闭集恰 1 + P0 双面 42501 手工亲证 | —（蓝） |
| 1 | 探针 | dbacl2-probe 容器 | 24 PASS / 2 崩 | 红①P0-1：断言误期 grantor=app_role，实为 meetwise（`app_role=X/meetwise`）→ 修为 grantor 无关注形 `app_role=X/`。红②P2-4：pgp_sym_decrypt 返回 text，误套 convert_from → 42883 → 修为直选 |
| 2 | 探针 | dbacl2-probe2 | 35 PASS / 2 FAIL | 红③P5-4：migrate:prove 子进程同库跑 → `migration_uninitialized_nonempty_database`（baseline 保护拒非空 schema）→ 改专用第二库。红④P4-1：预提交必然红（git 门需 commit 后见 diff）→ 保留，官方轮自绿 |
| 3 | 探针 | dbacl2-probe3 | 35 PASS / 2 FAIL | 红⑤P5-4：第二库仍炸 0001 `DropRole`（app_role 挂主库表 ACL · DROP ROLE 为 cluster 级依赖）→ 改「子进程先行+schema 重置」序 |
| 4 | 探针 | dbacl2-probe4 | 29 PASS / 8 FAIL | 红⑥重置序引入假雷：`conversation_event_append does not exist`/`permission denied for schema public`——手工 CREATE SCHEMA public 缺 initdb 的 PUBLIC USAGE → 补 `AUTHORIZATION pg_database_owner + GRANT USAGE TO PUBLIC` |
| 5 | 探针 | dbacl2-probe5 | 30 PASS / 7 FAIL | 红⑦重置序仍假雷：`permission denied for function digest`——**pg_default_acl 为库级**，0073 ADP REVOKE 存活于 DROP SCHEMA，重创的 pgcrypto digest() 被 born-剥 PUBLIC → 定案：子进程专用第二净库 + 完毕 DROP DATABASE（连角色依赖一并清）+ 主库全程冷启净卷零污染 |
| 6 | 探针 | dbacl2-probe6 | 36 PASS / 1 FAIL | 仅剩 P4-1 预提交红 → 提交 0ec543d0 |
| 7 | **官方** | runner 注册靶 db-acl2:prove | **EXIT=0 · 37 PASS / 0 FAIL** | 全绿（P4-1 见 committed diff） |

探针轮 1–6 全程在一次性 docker 容器（探针毕即 `docker rm -f` ×7 · 现零残留）；无一轮为「重跑碰绿」——每次红均有根因定位与对应修（①②prove 断言/夹具自身 bug · ③④⑤隔离序工程问题 · P4-1 为 commit-门固有形态）。

## 4. 交付面

- `packages/db/migrations/0151_pgp_sym_encrypt_grant.sql`（恰 1 条 GRANT · P3 白名单机检基线=推导集）
- `packages/db/test/db-acl2.proof.ts`（P0–P5 两段式 · 自管迁移 · DBACL-1 同型）
- wiring：`packages/db` `prove:db-acl2` + 根 `db-acl2:prove`/`db-acl2:prove:raw` + `scripts/run-e2e-isolated.mjs` 3 处注册（receipt sources / target allowlist / dispatch · **不入预迁移 allowlist**——prove 自管两段式，DBACL-1 erratum 先例）
- 0 产品码改动 · 0121/0108/0001–0143 零字节 · 函数体零字节（P1-8/P1-9 实证）

## 5. pins 十值（照抄 · 本刀未触碰任何一值）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（adr-postgres-retained.md）·
公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 6. Non-claims（沿 REQUEST §6）

本刀 ≠ memory 会话链全部修复（仅 ACL 面）≠ ctx03-06/mem02/mem03 prove 转绿承诺（复跑归各自域 · rerun wave 归协调方）≠ G7 任何面。0144–0150 不在本支（W2 五刀在飞线），号位空洞非虚句。post-prove dual 未跑（EXEC 席 Ban self-approve）。

## 7. harness lifecycle

`ai-docs/delivery/harness/dbacl2-pgp-grant.md` 状态：`draft_rev2:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**（本收据 · 待协调方推进）。
