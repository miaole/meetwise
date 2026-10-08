# EXEC — **DBTF-1 · 触发器函数族收敛刀**（公共函数库 + 版本 diff 对齐证明 · `executed:awaiting_post_prove_dual`）

**Status**: **`executed:awaiting_post_prove_dual`**（pre-exec 双审 BOTH PASS 裁定经协调方带外转达：D1=案B/D2=U/D4=保留/D5=改裁双参/D6=引入/D7=足量/D8=保形 · EXEC 落盘 2026-10-08 · **Ban self-write `post_prove_dual_pass`** · Ban nail until POST BOTH + 协调方授权）
**Date**: 2026-10-08（Asia/Shanghai）
**Knife**: `harness/db-trigfam-unify.md`（REQUEST · commit `b80ec6a8`）· slice `db-trigfam-unify.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` @ `48dee7a2`（双 0143 排序亲核：`0143_db_id_v7_unify` → `0143_sse_push_notify` → `0144_db_trigfam_unify`）
**Pins（全保留 · 零翻转）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null

---

## §1 落地面（harness §8 预告面一致 · 增量披露 2 项）

| 文件 | 动作 | 内容 |
|------|------|------|
| `packages/db/migrations/0144_db_trigfam_unify.sql` | 新增 | tf_ 库 12 员（4 簇 + 状态机 5 + assert）· 12 终端薄壳换体（逐字重声明 SD+SET · ann_search 双 SET 含 0139 hnsw GUC）· `interview_derived_score(text,text)` 双参休眠（D5）· `job_application_transition_rule`+5 种子（D2/D6）· ACL 镜像（N2/N4 · PUBLIC×6 + 镜像×2 + 供给同形态 DO 块） |
| `packages/db/test/db-trigfam-unify.proof.ts` | 新增 | P1–P7 两段式差分（≤0143 快照/行为 → +0144 复比 · proconfig 全等断言 · partial_confirmed 逐字节保形 · F1 同签名差分豁免） |
| `package.json` + `packages/db/package.json` | 修改 | `db-trigfam:prove` / `prove:db-trigfam` scripts |
| `scripts/run-e2e-isolated.mjs` | 修改×3 处 | target 注册（watch map / allowlist / dispatch）· **不入 migrate allowlist**（prove 自管两段式 · 与 DBID-1 注册差异的原因） |
| `packages/db/test/migrate.proof.ts` | 修改 1 断言 | :373 terminal-pair def 文本钉死 → 薄壳+库成员 **def 链拼接**（强度不减 · 唯一既有 prove 改动 · 披露于 harness EXEC 节） |
| `ai-docs/delivery/harness/db-trigfam-unify.md` | 修改 | Status 推进 + N1 勘误订正（§1.1/§1.2）+ EXEC 落盘节 |
| slice + 本 exec.md | 修改/新增 | lifecycle 推进 |

**零产品码**：principal.ts / apps/ / packages/*/src 零改（P6 白名单断言）。**历史迁移 0001–0143 零字节**（P6 对 48dee7a2 diff 断言）。

## §2 处方落实对账（协调方 EXEC 授权逐条）

| 处方 | 落实 |
|------|------|
| 薄壳逐字重声明 SD+SET | 12 薄壳全量重声明（实证 PG16：省略子句→prosecdef=f/proconfig 清空；ACL/owner 保留——0144 头注留痕） |
| tf_ 调用 public. 前缀限定 | 全部薄壳体 `public.tf_...(...)`（_scoped 保 0083 链 → reserve_text → tf_） |
| interview_derived_score 双参 | `(p_owner_user_id text, p_stream_key text)`（0051 公式 · 休眠未接线 · P7 断言零触发器引用） |
| 种子 INSERT | 5 行 0082 迁移闭包 · `ON CONFLICT DO NOTHING` |
| base 双 0143 排序确认 | loadMigrations/canonicalMigrations 文件名 localeCompare 亲核 + StageA applied=144/StageB=1 亲证 |
| N1 勘误（0054:16·0064:108） | harness §1.2-① 订正 + 多余份 78→77 |
| P1 含 proconfig | Tier-1 14 行六字段全等（含 proconfig 逐串比对）· ann_search 双 GUC 保形断言 |
| P7 三类措辞 | 薄壳=12 / tf_=12+derived_score=1 / 种子 INSERT=1（+DO 块/REVOKE/GRANT 镜像类计数钉死） |
| P5 七项+privacy 增补 | 七腿：uc052 · qbank-control · rag-control · migrate · **model-cost（ai-cost F2 替代）** · privacy-authorization（基线同红 F1 差分豁免）· recruiter（基线同红 F3 差分豁免） |
| Ban 全生效 | 0001–0143 零字节 · live 85 挂接点零变（P1 行集全等）· partial_confirmed 只保形（P2 逐字节 23514 同消息）· 对表勾销留 nail |

## §3 实现期发现（F/N 全账 · 详见 harness EXEC 节）

F1 DBID-1 潜伏残留（uuidv7 ACL × privacy SD owner · 0143 引入 · 0144 stash 同红亲证 · 另刀）· F2 ai-cost 独立 prove 骨架 bit-rot（自 0033 基线不可跑 · model-cost 替代）· F3 recruiter 基线既有红（interview_event fence）· N2 ACL 镜像修正 · N3 tf_assert 唯一 SD 库成员 · N4 qbank definer 可达（供给同形态 DO 块 + 两笔镜像 GRANT）。

## §4 Prove attempts 全账（Ban retry-to-green · 官方 run 经 `pnpm db-trigfam:prove` 净树执行 · 见运行输出 ATTEMPTS_LEDGER）

开发轮（scratch 容器 · 全记录）：run-1 红（snapshot tgtype 拼接 42725）→ run-2 红（ORDER BY 位序）→ run-3 红（uuid 字面量构造）→ run-4 红（interview_job 隐私围栏夹具改 job_semantic_revision）→ run-5 红（语法/重复 await）→ run-6 红（阶段共享 resume 夹具 · 阶段化 uuid）→ run-7 红（P3 GUC 单客户端化 · 15 FAIL 逐项归类：migrate:prove def 钉死=真回归修 def 链 / qbank definer 可达=真回归修 N4 / 其余 prove 断言缺陷+基线红分类）→ run-8 7 FAIL（P5 差分重设计+P6/P7 钉死修正）→ **官方 run（本轮 commit 后净树）EXIT 见推送后报告**。

---

*EXEC stub · DBTF-1 · 2026-10-08 · executed:awaiting_post_prove_dual · Ban self-approve · alone ≠ dual · Ban nail until POST BOTH + 协调方*
