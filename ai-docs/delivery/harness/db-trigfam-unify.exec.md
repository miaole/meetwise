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

## §4 Prove attempts 全账（Ban retry-to-green · 每轮无论红绿全记录）

| # | at(UTC) | EXIT | 红/绿 | 结果与因 |
|---|---------|------|-------|---------|
| 1 | 2026-10-08T09:43Z | 1 | 红 | snapshot `tgtype` 未 cast（42725）——prove 自身缺陷 |
| 2 | 09:43Z | 1 | 红 | ORDER BY 位序不在选择集——prove 自身缺陷 |
| 3 | 09:44Z | 1 | 红 | 夹具 uuid 字面量构造非法（22P02）——prove 夹具缺陷 |
| 4 | 09:44Z | 1 | 红 | interview_job 夹具被既有隐私围栏+resume 引用守卫拦（语义正确）→ 夹具改 job_semantic_revision |
| 5 | 09:46Z | 1 | 红 | python 替换残留重复 await（语法）——修 |
| 6 | 09:46Z | 1 | 红 | 阶段 B 复用阶段 A resume 行触发 epoch 校验（语义正确）→ 夹具阶段化 uuid |
| 7 | 09:47Z | 1 | 红 | P3 池连接 GUC 丢失（interview_privacy_fenced）→ 单客户端 GUC 事务；随后 15 FAIL 归类：**真回归×2**（migrate:prove def 文本钉死→def 链断言；qbank definer 上下文不可达 tf_→N4 DO 块+GRANT）· prove 断言缺陷×6 · 基线红×3（F1/F2/F3 分类）· ai-cost 容器骨架不可跑（F2） |
| 8 | 09:54Z | 1 | 红 | 7 FAIL：gateway 差分归一化 / P5 全文签名+差分重设计（model-cost 替代 ai-cost · uc052 探得 F1 基线同红）/ P6 提交态断言 / P7 _scoped 双载计数 |
| 9 | 10:00Z | 1 | 红 | 官方 run#1（@350cea57 净树）：4 FAIL=uc052 真跑得 F1 + P5 签名截尾 + P6 迁移面提交态 → 0144 临时回退提交探 uc052 基线（同红 uuidv7 亲证）→ reset --hard 恢复 → 三处修（commit 272a92bf） |
| **10** | **2026-10-08T10:02Z** | **0** | **绿** | **官方 run#2（@272a92bf 净树 · `pnpm db-trigfam:prove` · run-e2e-isolated 临时 PG）：51 PASS / 0 FAIL**（P1×11 · P2×9 · P3×3 · P4×12 · P5×7（绿4：qbank/rag/migrate/model-cost + F1 差分豁免2：uc052/privacy-authorization + F3 差分豁免1：recruiter）· P6×6 · P7×3）· ATTEMPTS_LEDGER 随运行输出留档 · 收据 `.tmp/isolated-proof-receipts/` |
| 基线探针 | 09:51–10:02Z | — | — | 0144 移出态亲证：migrate:prove 绿（def 链修复前为 0144 独红）· qbank-control 绿（N4 修复前 0144 独红）· privacy-authorization/recruiter/uc052 同红（F1/F3 · 非本刀回归）· ai-cost 双模式红（F2） |

**边界重申**：F1（uuidv7 ACL × privacy SD owner）为 0143 引入的 DBID-1 潜伏残留，三 prove 同红亲证归档——**属另刀**，本刀不越界修；releaseEvidence=false · coveredCount=8 不变。

---

*EXEC stub · DBTF-1 · 2026-10-08 · executed:awaiting_post_prove_dual · Ban self-approve · alone ≠ dual · Ban nail until POST BOTH + 协调方*
