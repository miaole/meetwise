# EXEC — **DBACL-1 · uuidv7() EXECUTE ACL 修复刀**（0150 · GRANT-only · `executed:awaiting_post_prove_dual`）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落盘 2026-10-08 · REQUEST rev2 @`8bf82a1b` 为唯一蓝本 · **Ban self-approve** · alone≠dual · post-prove 双席待协调方派）
**Knife**: `harness/dbacl-uuidv7-grant.md`（REQUEST rev2 · commit `8bf82a1b`）· worktree `meetwise-line-dbacl` · branch `line/db-uuidv7-acl`
**Commits**: `1caf7f32`（刀：0150 + prove + wiring）→ `db941542`（run#1 红归因修复：target 出 migrate allowlist）
**Pins（十值照抄 · 零翻转）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

---

## §1 落地面（§3/§4 处方面 · 增量披露 3 项）

| 文件 | 动作 | 内容 |
|------|------|------|
| `packages/db/migrations/0150_uuidv7_grant_acl.sql` | 新增 | **恰 8 条** `GRANT EXECUTE ON FUNCTION public.uuidv7()`（app_role/privacy_api_owner/privacy_worker_owner/memory_runtime/memory_summarizer/memory_admission_issuer/scoring_definer_owner/online_judge_owner）· 全文仅 GRANT 语句（P5-3/5-5 机检）· 头注落根因链+推导源+剔除名单 |
| `packages/db/test/db-acl.proof.ts` | 新增 | P0–P7 两段式（Stage A ≤0143 全负门+推导 / Stage B +0150 全绿+静态/库形门）· 59 断言 |
| `packages/db/package.json` | 修改 1 行 | `prove:db-acl`（§4 验收命令面） |
| `package.json` + `scripts/run-e2e-isolated.mjs` | 修改 | `db-acl:prove`/`db-acl:prove:raw`（root）+ runner 3 处注册（watch map/allowlist/dispatch）· **不入 migrate allowlist**（prove 自管两段式 · DBTF-1 同型 · run#1 红归因） |

**零产品码**：principal.ts / packages/db/src / apps/*/src 零改（P6-2/6-3 对 `8bf82a1b` diff 断言）。**历史迁移 0001–0143 零字节**（P6-1 git diff 对 base · 仅 0150 一新增）。**uuidv7/uuidv7_from_parts 函数体跨 stage 逐字节全等**（P1-4/1-5 pg_get_functiondef 比对）。**55 表 DEFAULT uuidv7() 跨 stage 零变=55**（P1-6）。

> 路径披露：REQUEST §4 写 `packages/db/prove/db-acl.proof.ts`，但 repo 67 个既有 prove 先例（含 DBTF-1 `db-trigfam-unify.proof.ts`，授权任务明指「DBTF-1 的 db-trigfam wiring 同型」）全在 `packages/db/test/`，`packages/db/prove/` 目录不存在——按同型先例落 `test/db-acl.proof.ts`（§4 残留路径笔误同 rev1 类，不构成偏离）。

## §2 §3 推导闭集 EXEC 期机检双向核（硬约束① · 客观非自指）

**推导 SQL（live catalog · 两段 Stage A 前亲跑 + prove 内嵌）**：
`pg_attrdef(pg_get_expr='uuidv7()') → 55 表` × `pg_proc(prosecdef ∧ nsp=public)` 函数体
`regexp_matches(def, '(?is)INSERT\s+INTO\s+(public\.)?<tbl>\y\s*(\([^)]*\))?', 'g')`
→ **omit-id 精化**（无列清单=全默认 id 缺省 ✓；有列清单则 id 列不得出现——显式 id 插入不是 uuidv7 调用者）

**结果**（`DERIVE closed-set owners=app_role,memory_admission_issuer,memory_runtime,memory_summarizer,online_judge_owner,privacy_api_owner,privacy_worker_owner,scoring_definer_owner pairs=70`）：
- **⊆ 核**：推导集 8 角色 ⊆ 预期 8 集（零多余 · 无需逐行举证角色）· **⊇ 核**：预期 8 集 ⊆ 推导集（零缺员）→ 双向恰等（§3-2/§3-3 PASS）。
- 逐行证据（owner·function → 55 表 omit-id 插入 · 46 个 SD 函数 · 66 owner·function·table 组合）全量在官方 run#3 日志 `DERIVE` 行；分族：memory_runtime 22 函数（0093/0095 memory_admit_record/0099/0102/0105/0107/0115/0117…）· privacy_api_owner 14 函数（0048/0058/0091 issue/0092/0093/0096×begin 族/0111/0112/0118/0125/0129）· scoring_definer_owner 8 函数（0100/0103/0109 含 question_rubric 发布链）· online_judge_owner 1（0050 register）· privacy_worker_owner 2（0091 receipt/0140 vendor-purge）· memory_summarizer 2（0112/0116）· memory_admission_issuer 1（0095:202 memory_issue_admission_snapshot）。
- **TS 侧直写者核**：全库 `SET LOCAL ROLE` 枚举=app_role(principal.ts:949)/privacy_worker_executor/qbank_control_executor/rag_control_executor/online_judge_scheduler+executor/app_gateway_role/scoring_worker_executor/memory_summarizer（后三者经 SD 或自家 schema，不直写 55 表）→ 直写闭集∪=**仅 app_role**（矩阵 `app_role(ts-direct)` 列机检：entitlement 三表/commerce_outbox/settlement_ledger/ai_graph_run/resume/interview_job/ai_report/quiz_job/diagnosis_job 10 表）。
- **明确剔除实证**：privacy_guard_owner 推导集外（纯 SELECT guard · 0140:327）· uuidv7_from_parts 不授权（P1-3 app_role false）· rag_control_definer/rag_runtime_definer/qbank_control_definer 推导集外（自家 schema）。
- **席1 nit-2 落实**：memory_runtime 引用列以 catalog 推导为准（推导 22 函数集含 0093/0095/0099/0102/0105/0107/0115/0117 面；0108 的 conversation_event_append 为**显式 v4 id**（`v_event_id := gen_random_uuid()`）非 uuidv7 调用者——omit-id 精化将其正确排除，见 §4 N1）。**双席 nit-1 落实**：admission 独立一面（F10 · 0095:202 · memory_admission_issuer 恰 1 函数 1 面）。

## §3 Prove 官方结果（P0–P7 全 PASS）

**官方 run#3（@`db941542` 净树 · `pnpm db-acl:prove` · run-e2e-isolated 临时 PG `meetwise-e2e-*`）**：
`RESULT dbacl1-db-acl failures=0` · **EXIT=0 · 59 PASS / 0 FAIL** · 全量日志留档（本收据目录引用行号）。

| 门 | 结果（断言面） |
|----|------|
| **P0 复现负门** | PASS×4：Stage A applied=144；修复前 proacl=owner-only `{meetwise=X/meetwise}`；PUBLIC∧app_role EXECUTE=false（0073:1342 ADP REVOKE × 0143:14 零 GRANT 实证）；**asPrincipal(app_role) 发桶 omit-id INSERT 恰 `42501 permission denied for function uuidv7`**（DBM3-1 P3 场景复现） |
| **§3 推导双向核** | PASS×3：55 表=55；推导⊆预期（零多余）；预期⊆推导（零缺员） |
| **P1 proacl 实证** | PASS×13：EXECUTE grantee 集**恰** 8 角色（不多不少）；逐角色 has_function_privilege=true ×8；uuidv7_from_parts app_role=false；uuidv7/uuidv7_from_parts 函数体跨 stage 逐字节全等；55 DEFAULT 零变 |
| **P2 逐家族双向** | PASS×17：Stage A **10/10 facet 恰 42501**（F1 发桶·F2 report·F3 begin·F4 issue·F5 receipt·F6 consent·F7 summary·F8 rubric·F9 OJ·F10 admission——8 授予者全覆盖+admission 独立面）→ Stage B **10/10 绿**（同 facet 同调用面）；55 表矩阵（P2-MATRIX：每表受限写者 ⊆ 8 角色闭集 · 55 行全量打印） |
| **P3 擦除链三面** | PASS×7：begin（0096 → 4 target+活 digest）→ issue（0091 digest=活 target_set_digest）→ consume（单次 CAS）→ claim（冻结 digest 复验 → leased）→ purge（物理删除+erased+请求转 purging）→ 收据签发（privacy_deletion_receipt omit-id 绿） |
| **P4 report enqueue** | PASS：`enqueueReport`（packages/db/src/report.ts:15 面 · ai_report omit-id）绿 |
| **P5 过度授权负门** | PASS×5：新建无关系角色 `SELECT uuidv7()` 仍恰 42501；`has_function_privilege('public','public.uuidv7()','EXECUTE')=false`（PUBLIC 泄漏门）；0150 恰 8 条 GRANT 语句（dollar-quote 感知切分 · 无其他语句）；**GRANT 目标集=§3 推导闭集（非刀自定义）**；无 GRANT ALL/无 DROP/REVOKE/ALTER/CREATE |
| **P6 静态契约门** | PASS×3：0001–0143 对 `8bf82a1b` 零字节 diff+0150 恰一新增；改动面白名单（产品码零改）；packages/db/src 与 apps/*/src 无 diff |
| **P7 migrate 门** | PASS×3：Stage B 仅应用 0150（applied=1/skipped=144）；ledger=文件数=145；重跑全 skip（checksum 零漂移）+ 外腿 `pnpm migrate:prove` **93 PASS/0 FAIL EXIT=0**（runner 临时 PG）+ `pnpm drift:prove` **零漂移 EXIT=0**（sql/ 列+UNIQUE/PK 全覆盖 · fresh deploy 以 migrations 为准） |

**prove est=actual**：0 live 模型调用 · 0 Key · 全本地 docker PG · actualSpendCny=null。

## §4 实现期发现（F/N 全账）

- **N1（omit-id 假阳性）**：conversation_event_append（0108）对 conversation_event/conversation_event_artifact 均为**显式 id**（`gen_random_uuid()` v4）插入——非 uuidv7 调用者；且表名前缀（conversation_event ⊂ conversation_event_artifact）在无词边界正则下互扰。推导已用 `\y` 词边界+列清单 id-缺席精化排除（该函数不在 70 对中）。§3 预期集不受影响（memory_runtime 由其余 22 函数支撑）。
- **N2（非本刀 ACL 面 · 如实登记不越界）**：探针直调 conversation_event_append（app_role）在 `pgp_sym_encrypt` 处 42501（0121 只授 app_role · SD memory_runtime definer 上下文无该权限）——与本刀 uuidv7 无关的既存面，本刀 F7 夹具改直插 conversation_event 行绕开；是否 mem02 既有绿未深究（非本刀面，留协调方裁量）。
- **N3（report 写门 fail-closed）**：ai_report INSERT 对不存在 interview 触发 `interview_privacy_fenced`（0058/0059 fence）——F2/P4 夹具用真实 interview 行（修复前雷在 default 求值先于 fence 触发器炸出，仍恰 uuidv7 42501，负门不受影响）。
- **F5 夹具**：Stage A 直插 privacy_erasure_request/deletion_target（迁移登录=uuidv7 owner 可执行）——receipt facet 负门经真实 SD 调用路径命中。

## §5 Attempts 全账（Ban retry-to-green · 每轮无论红绿全记录）

| # | at(UTC) | 载体 | EXIT | 红/绿 | 结果与因 |
|---|---------|------|------|-------|---------|
| E1 | 10-08T11:0xZ | 探针（dbacl1-derive 临时容器 · 非官方） | — | 探 | 全迁移 144 + 推导 SQL 初跑（POSIX 正则 `\s`→`[[:space:]]` 修）；闭集双向核 **首验通过**；facet 探针 v1：fixture 事务因 job_application 插入 GUC 触发器整体回滚（发现 N3 前身）+ F1/F6 双向验证绿 |
| E2 | 11:15:45Z | prevalence#1（tsx @fresh scratch PG） | 1 | 红 | resumeId uuid 模板 35 字符（22P02）→ 修模板 |
| E3 | 11:16:08Z | prevalence#2 | 1 | 红 | fixture `$1` text→uuid 未 cast（42804）→ 加 `::uuid` |
| E4 | 11:16:22Z | prevalence#3 | 1 | 红 | conversation_event 拼接 uuid 未 cast（42804）→ 加 `::uuid` |
| E5 | 11:16:46Z | prevalence#4 | 1* | 绿* | 59 断言 58 PASS/1 FAIL——唯一红=P6-1（git diff 对 base 空 · 未提交树预期；非 prove 缺陷）→ 进官方流程 |
| **1** | **11:18:10Z** | **官方 run#1**（`pnpm db-acl:prove` @`1caf7f32`） | **1** | 红 | `migration_ledger_unknown_version:0150`——runner 预迁移靶 × prove 自管两段式冲突（靶 ledger 已含 0150）→ `db-acl:prove:raw` 出 migrate allowlist（DBTF-1 同型 · commit `db941542`） |
| **2** | **11:18:38Z** | **官方 run#2**（@`db941542`） | 0 | 绿 | failures=0 · 59 PASS/0 FAIL（管道 tail 截断头部日志未存档 → 补全量存档轮） |
| **3** | **11:18:57Z** | **官方 run#3**（@`db941542` · 全量日志） | **0** | **绿** | **failures=0 · 59 PASS/0 FAIL · 本收据 §3 数据源** |
| L1 | 11:2xZ | 外腿 `pnpm migrate:prove`（runner 临时 PG） | 0 | 绿 | 93 PASS / 0 FAIL（含 0121 checksum 钉死/幂等/漂移拒绝门/数据保全全绿） |
| L2 | 11:2xZ | 外腿 `pnpm drift:prove`（PGCONTAINER=meetwise-postgres-dev · 仅建/删自身 `_drift_*` 临时库） | 0 | 绿 | 零漂移（sql/ 列+UNIQUE/PK 迁移路径全覆盖） |

**红→绿逐修链**：E2→E3→E4（夹具 uuid 类型三连修，同一根因两类）→ 官方#1（wiring 型：预迁移冲突）→ 官方#2/#3 绿。无同因重复重试；每轮红均归因后单修。

## §6 受益复跑解锁（§6 原文 · 非本刀面）

- DBFK-1：cherry-pick 0150 → P7 四项回归复跑拿绿 → post-dual 全链。
- DBM3-1：P3–P7 复跑 → post-dual 全链。

**边界重申**：本收据=EXEC 自证，**不自批**（Ban self-approve）；post_prove_dual 双席（mw-privacy-int + mw-model-op 同型）待协调方派发。releaseEvidence=false · haStatus=NOT_HA · coveredCount=8 不变。
