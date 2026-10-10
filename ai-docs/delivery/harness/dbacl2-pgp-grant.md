# DBACL-2 — pgp_sym_encrypt EXECUTE ACL 补授刀（0151）

**状态**：`executed:awaiting_post_prove_dual`（rev1 席2 三勘误落实 · 协调方正式授权 EXEC · REQUEST rev2 @95911975 唯一蓝本 · EXEC 落盘 2026-10-08：0151 落地 + 官方 prove EXIT=0 37 PASS/0 FAIL + migrate:prove 子进程全绿 + drift 零漂移 · 收据 `receipts/dbacl2-pgp-grant/` · **Ban self-approve** · alone≠dual）· base = 主线 `a9f55133` **尾=双 0143（磁盘亲数 144 文件）**——0144-0150 归 W2 五刀在飞线让位序、**0151 全分支无冲突=下一空号** · 分支 `line/db-pgp-acl` · 立项依据 = DBACL-1 post-dual mw-privacy-int 席 N2 定性（超用户直调仍 42501 亲证·「勿并入勿忽略」）+ 协调方裁立（DBACL-1 nail 登记）。

## 1. 根因链
- `0121:14` `REVOKE ALL ON FUNCTION public.pgp_sym_encrypt(text,text) FROM PUBLIC` + `:16` 仅 `GRANT ... TO app_role`。
- `0108` `conversation_event_append`（SECURITY DEFINER · OWNER memory_runtime）`:255` 调 `pgp_sym_encrypt(p_body, p_enc_key)` ⇒ SD 上下文以 proowner（memory_runtime）求 EXECUTE ⇒ **42501**。
- 影响面：conversation_event/conversation_event_artifact 写链（memory 会话事件持久化）。**apps/ 生产调用面=0**（TS 唯一入口 ctx03-event-source.ts:121 仅 packages/db/src/index.ts:437 导出无生产调用方）——**承重全在 prove 面恰 6 文件**：ctx03-event-source / ctx04-compression-snapshot:87 / ctx05-concurrency-recovery / ctx06-deletion-closure / mem02-summary:120 / **mem03-summary-tree:99**（rev1 漏列 mem03·席2 勘正）。

## 2. 修法（单文件 `0151_pgp_sym_encrypt_grant.sql` · 仅 GRANT）
- `GRANT EXECUTE ON FUNCTION public.pgp_sym_encrypt(text,text) TO memory_runtime;`
- **EXEC 期 catalog 亲证推导纪律（沿 DBACL-1）**：全迁移扫描 SECURITY DEFINER 函数体内调 `pgp_sym_encrypt|pgp_sym_decrypt` 的 proowner 全集——预期闭集=**恰 1 条**（memory_runtime）；若实证发现 decrypt 调用面或其他 owner 则双向核（多一逐行举证·少一 FAIL）后按实证集落 GRANT（禁发明角色·禁 GRANT ALL·最小面）。

## 3. prove（`packages/db/test/db-acl2.proof.ts` + wiring）
- P0 复现负门：修复前 SET LOCAL ROLE memory_runtime 调 pgp_sym_encrypt 恰 42501。
- P1 修复后 proacl 实证：grantee 恰闭集·PUBLIC=false·app_role 原样在。
- P2 真实写路径：conversation_event_append 全链绿（event+artifact 双 INSERT 落行）——修复前恰 42501 修复后绿双向。
- P3 过度授权负门：新建无关系角色仍 42501；0151 全文白名单机检（基线=推导集）。
- P4 历史迁移 **0001-0143（本支在卷全量）**零字节 diff；0151 恰一文件仅 GRANT（0144-0150 不在本支=空洞非虚句）。
- P5 migrate:prove 全绿 + drift 零漂移 + **applied=145（磁盘 144+0151）**——号位空洞不阻断（migrate.ts:195/:307 文件名序·DBM3-1 applied=146 缺 0144-0148 先例）。

## 4. Ban
禁改 0121/0108 及任何历史迁移 · 禁 GRANT ALL · 禁发明角色 · 禁触函数体 · pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）· 实现不自批 · alone≠dual。

## 5. 验收
prove EXIT=0 · P0-P5 全 PASS · attempts 全账（红→绿逐修非 retry-to-green）· 收据 `ai-docs/delivery/receipts/dbacl2-pgp-grant/` · est 0 live 模型 0 Key 全本地 docker PG。

## 6. Non-claims
本刀 ≠ memory 会话链全部修复（仅 ACL 面）≠ ctx03-06/mem02 prove 转绿承诺（复跑归各自域）≠ G7 任何面。

## 7. EXEC 落盘（2026-10-08 · mw-core 席 · 详收据 `receipts/dbacl2-pgp-grant/exec.md`）
- **落地面**：`0151_pgp_sym_encrypt_grant.sql`（恰 1 条 GRANT·全文仅 GRANT）+ `packages/db/test/db-acl2.proof.ts`（P0–P5 两段式 37 断言）+ wiring（`prove:db-acl2`/`db-acl2:prove` + runner 3 处注册·不入预迁移 allowlist——DBACL-1 erratum 先例）。
- **§2 闭集 EXEC 期机检双向核通过**：282 SD 函数扫描 · pgp_sym_* 调用点恰 1（memory_runtime·conversation_event_append·2 参 encrypt·0108:255）· 三参面/decrypt 面全库零 SD 调用 · 多一零/少一零。
- **官方 prove**：探针 6 轮红→绿逐修（attempts 全账）→ 官方轮 **EXIT=0 · 37 PASS/0 FAIL**；P5 含 migrate:prove 子进程（专用第二净库）全绿 + 重跑全 skip 零漂移 + applied=145（磁盘 144+0151）。
- **Pins 十值零翻转**；0 live 模型 0 Key 全本地 docker PG；历史迁移/函数体/产品码零字节改（P1-8/P1-9/P4 机检）。
- **待办**：post_prove_dual 双席（协调方派）→ prove 面 6 文件 rerun wave 解锁归协调方。
