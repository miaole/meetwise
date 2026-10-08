# ID 规范（C 级冻结 · DBID-1 刀）

> SSOT：本文件 + `packages/db/src/ids.ts`（`ENTITY_PREFIXES` 白名单双落）。判据链：
> `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md`（硬规则 11）+ postgres skill（7 项）。
> 状态：**EXEC 落地**（migration 0143 + ids.ts + db-id-v7.proof EXIT 门）· 存量三纪元 append-only 不回填。

## 1. 新表规范（一刀冻结）

| 键形态 | 规范 | 生成点 |
|--------|------|--------|
| 高写入代理键 | `uuid PRIMARY KEY DEFAULT public.uuidv7()`（RFC 9562 · 48bit unix_ms 时间有序） | DB DEFAULT（migration 0143 函数） |
| 业务可读键（text 主键） | `<prefix>_<32hex>`——尾巴为 UUIDv7 去连字符（同 ms 进程内 12bit 计数器单调 → 字典序=生成序） | `newEntityId(prefix)`（ids.ts · 前缀白名单 fail-closed） |
| uuid 列显式 id（应用层预生成） | 连字符形态 UUIDv7（与旧 v4 完全同形） | `newUuidV7()`（ids.ts） |
| 事件表 | `bigserial` / `bigint GENERATED ALWAYS AS IDENTITY` | DB 自增（保留纪元，不换） |
| 控制面 singleton | `boolean PRIMARY KEY DEFAULT true CHECK (singleton)` | 固定 true（保留纪元，不换） |

## 2. 存量三纪元处置（append-only · 零回填）

- **v4 行**（`gen_random_uuid()` 时代）：原样保留；表内 v4/v7 并存为**预期终态**（渐进收敛，永不回填）。
- **text 存量行**（`prefix + randomUUID()` 40 字符时代）：原样保留；新生成走 `newEntityId`（尾 32hex）。
- 列类型 / FK / RLS / 幂等键 / 触发器：**零触碰**（migration 0143 仅 `CREATE FUNCTION` + `ALTER … SET DEFAULT`，prove P6 静态门强制）。
- 时间戳解码：`idUnixMs(id)` helper——v7（含前缀形态与裸连字符形态）返回 unix_ms；**v4 / 非 v7 / 形状不符 → null**（不猜）。

## 3. 域前缀注册表（fail-closed：未登记前缀 `newEntityId` throw `entity_prefix_not_registered`）

### 3.1 工厂白名单（`ENTITY_PREFIXES` · B1 面 11 域）

| 域名 | 落库字面量 | 目标表 | 生成点 |
|------|-----------|--------|--------|
| job | `job_` | job_posting | packages/db/src/recruiter.ts |
| app | `app_` | job_application | packages/db/src/recruiter.ts |
| iv | `iv_` | interview | packages/db/src/recruiter.ts · apps/api interview.service.ts |
| rd | `rd_` | job_route_decision | packages/db/src/job-route-decision.ts |
| cprd | `cprd_` | candidate_profile_route_decision | packages/db/src/candidate-route.ts |
| nr | `nr-` | qbank_route_scope_negative_result | packages/db/src/qbank-route-scope-cache.ts |
| qip | `qip-` | question_issue_provenance | packages/db/src/qbank-miss.ts |
| ftd | `ftd_` | free_text_route_decision | packages/db/src/free-text-route-decision.ts |
| ord | `ord_` | payment_order | apps/api commerce.service.ts |
| qz | `qz_` | resume_quiz | apps/api quiz.service.ts |
| dg | `dg_` | resume_diagnosis | apps/api diagnosis.service.ts |

**新前缀须先登记（本表 + `ENTITY_PREFIXES` 双落）再使用**；分隔符沿用各表现行形态（`_` 为主，qbank 负结果/溯源历史用 `-`）。

### 3.2 既有冻结格式登记（不接入工厂 · 改动须格式契约联动刀）

`qgen-`（SQL CHECK `^qgen-[0-9a-f-]{36}$` + 2 处 domain 正则冻结）/ `rgen-` / `rrun-` / `qrecipe-` / `rrecipe-` / `rcite-` / `rbind-` / `rpolicy-` 连字符 36 形态；`ntf_${reportId}` 确定性派生（非随机工厂）。

### 3.3 残留登记（C 级裁决保留 · 不在本刀面）

- 裸 uuid → text PK **6 点**（见 §4 N2 勘误）：user_account / consent_record / user_memory / assessment_report / learning_plan / career_path——前缀化属对外可见格式变更，留后续刀逐域裁决（保留 bare 或收敛）。
- 一次性 token / 请求关联 / 幂等 fence `randomUUID()`（reqId/leaseOwner/callId/probeToken/jti/fillId 等）：非持久实体主键，时间序无收益，永久豁免。

## 4. 勘误登记（REQUEST 双审核正 · N1–N3）

| # | 勘误 | 事实（EXEC 亲核） |
|---|------|------------------|
| N1 | harness §2.3 表格默认列名 `id` | `ai_graph_run` 主键列名 = **`run_id`**（0001:27 亲核），55 表中唯一单列特判；migration 0143 与 prove P4-2 均按 `run_id` 断言 |
| N2 | harness §3.4「裸 uuid → text PK 5 点」 | 实为 **6 点**：auth.service.ts:22（user_account）· privacy.service.ts:23（consent_record）· memory-service.ts:24（user_memory）· interview.service.ts:798/:824/:906（assessment_report/learning_plan/career_path 共 3 行）——3+3=6，原文按文件计数漏了 interview 3 行展开 |
| N3 | harness §1.1（附）「uuid 无 DEFAULT 5 张…id 由应用/函数显式提供」 | 该 5 张主键列名**均非 `id`**（EXEC 亲核）：`privacy_checkpoint_target`/`interview_answer_artifact_target`/`interview_projection_target` = **`target_id`**（0048:46/0092:122/0096:236，REFERENCES privacy_deletion_target）· `resume_blob`/`resume_profile` = **`resume_id`**（0001:186/195）；prove P4-5 按真实列名断言。附：P5 DEFAULT 冒烟表由 `entitlement_consumption`（harness §5 原文）改走 `entitlement_bucket`（consumption 带 idempotency_key NOT NULL+UNIQUE+units>0 业务约束面，冒烟走最短 DEFAULT 路径；B2 面不变——interview_answer_job 走 asPrincipal + interview FK 链造数） |

## 5. prove 门（EXIT=0 硬保证）

`pnpm db-id-v7:prove`（`packages/db/test/db-id-v7.proof.ts`）：P1 SQL 函数位域/单调/碰撞 · P2 RFC 9562 KAT 三方比对 · P3 工厂 10000 次 + Spearman≥0.999 · P4 catalog 55 表断言 · P5 INSERT 冒烟（DEFAULT + B2 显式 id 双路径）· P6 migration 文本静态门（dollar-quote 感知语句白名单）· P7 对表勾销块（postgres skill 7 项 + NEXT-NODE C4）。
