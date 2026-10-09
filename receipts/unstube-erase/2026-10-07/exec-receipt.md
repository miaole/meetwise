# UNSTUB-ERASE rev2 · EXEC 收据（D6 合规最低集 · 软删先行）

- 蓝本: `ai-docs/delivery/harness/unstube-erase.md` @ `40e31da9`（rev2 · 席1 六处方全并 + D6 瘦身 · EXEC 授权在卷）
- 分支: `line/unstub-erase`（base `40e31da9` = rev2 蓝本即分支 tip）
- EXEC: mw-unstube-exec · 2026-10-07 · est live=0（零模型调用零 key·全 fake/隔离 PG）
- commits:
  - `52cb6d8a` impl（产品码+迁移+proof 翻转+新主证，32 文件 +1344/−259）
  - `eb695d30` #6 pin 翻转集 39 文件机械面（仅 pin 行文字，+82/−80）

## 1. 交付面（对照 rev2 范围六项）

| rev2 项 | 落点 |
|---|---|
| 两迁移 0152/0153 | `packages/db/migrations/0152_resume_soft_delete_fence.sql`（resume.erasure_requested_at + privacy_begin_resume_soft_delete SECURITY DEFINER OWNER privacy_api_owner + 0060 双拦截受审放行：trigger 转 SECURITY INVOKER，放行判别 `current_user='privacy_api_owner' AND session_user<>'privacy_api_owner'`；app_role 直写仍钉死——`resume-erasure:foundation:prove` PRES002 全绿自证；rollback down 面以注释落卷）/ `0153_account_deletion_column.sql`（user_account.deleted_at + `deleted_at IS NULL OR status='disabled'` 弱一致 CHECK + down 面） |
| 账户级删除接通 | `profile.service.deactivate` 同事务原子发起：简历轨逐份 0152 函数、面试轨 `interview_projection_begin_erasure`（0096，TS 包装层钉死每场恰 4 target）、记忆轨 `memory_begin_account_erasure`（0093）；主证 4-target 断言 + 已建链推进 completed |
| 简历删除接通 | `DELETE /resume/:id`、`DELETE /privacy/resume-data` → 202 `{mode:'logical', purgePending:true, …}`；状态幂等（alreadyFenced·同 requestId·不建第二账）；物理行仍在（admin 直查 `status='erasure_fenced' AND erasure_requested_at IS NOT NULL`） |
| deactivate 扩展 | +密码复核（错→401 零副作用·缺→400）+ pwd_epoch+1 + deleted_at + 发起账户级删除 + UI 解锁（settings 页 DeactivateForm 密码确认+如实披露） |
| 三读面过滤 | `profile.service.growth` / `privacy.service.export`（interviews+第三查 assessments 双面）/ `packages/db/src/memory-store.ts historicalWeakDimensions` 补 `interview_privacy_active(...)`；quiz/diagnosis 派生读面随账户删除不单独过滤（D6 最低集裁定） |
| pin 翻转集 39 文件 + #242 + 文案退役 | commit `eb695d30`（§3）；PreviewErasureForm 摘除「一份面试」误围栏触发点；resume/settings/faq/legal 四页 + legal.controller dataRights 新口径 |

**范围外如实登记**：interview-data 公开 DELETE 维持 503 关闭（rev2 R1，主证有断言钉死）；contracts 三响应 DTO 增补且**不登记 apiContract**（沿隐私块先例，openapi 不含删除端点）；contracts/index.ts 两处「生产 DELETE 仍 503」注释随事实修订（清单外·逐件登记）。

## 2. prove 逐键 EXIT（最终树 · 干净 worktree · 全部一次通过零 retry）

见 `prove-ledger.txt`（append-only）。§5.1 八键 + 邻接 + pin 面全量：

| CMD | EXIT |
|---|---|
| `pnpm unstube-erase:prove`（主证·46 断言） | 0 |
| `pnpm api:validate` | 0 |
| `pnpm neg:resume`（91 用例） | 0 |
| `pnpm privacy-erasure:http:prove`（19 断言） | 0 |
| `pnpm neg:interview`（邻接·零改·97 用例） | 0 |
| `pnpm -C apps/web prove:public-copy` | 0 |
| `pnpm privacy-erasure-preview:prove`（0129 邻接·断言 byte-intact） | 0 |
| `pnpm prove:begin-guard-merge`（godfn-1c 邻接） | 0 |
| `resume-erasure:foundation:prove:raw`（0060 放行邻接·PRES001-004） | 0 |
| `pnpm uc052:internal-erasure:prove` / `external-sink-retention` / `external-sink-async-purge` / `checkpoint-physical`（干净树门控目标） | 0 / 0 / 0 / 0 |
| `pnpm vector-plane-erasure:prove` / `rag03-hnsw-completeness:prove` / `rag03c-exactk-observe:prove` | 0 / 0 / 0 |
| `pnpm -C packages/db prove:tenant-wiring-e5` / `pnpm -C packages/domain prove:memory-vector-chunk-deletion` / `pnpm gap-rag05-classifier:prove` | 0 / 0 / 0 |
| `pnpm eval-harness-matrix-cite:prove` / `mysql-stack:skeleton:prove` / `mysql-stack:m2-tenant:prove` | 0 / 0 / 0 |

**env-gated（非本刀回归·base 同环境同红）**：`qdrant-store:g5-erasure:prove` EXIT=3 = PREREQ live qdrant :6333 未起（base 复跑同 EXIT=3 同 PREREQ「live prove skipped」）；其被翻静态面（deleteResumeData 钉 202 形）在 PREREQ 前已 PASS。g5-ledger-map EXIT=0。

## 3. 主证断言六列要点（unstube-erase.proof · 46 PASS）

- NEG：未认证 401；越权 404 不分叉；软删后列表不含+profile 404（0063）；guard 410；注销后旧 Bearer 401 `account_inactive`、login 401；密码错 401 零副作用。
- FAULT：账本投毒 23505 → 全局过滤器 409；整体回滚无部分态（简历未围栏/面试未建账/账户 active/会话可用）。
- BOUND：二次单删同 requestId+alreadyFenced+账本恰 1；并发双删恰一 winner；注销重放 401（守卫先拒）零重复建账；空集全量删 resumesFenced=0 同形。
- ADV：JWS 冒充 Bearer 401（P3 原值）；interview-data DELETE 503 关闭（rev2 R1）；x-privacy-authorization 头不改变受理语义。
- 不撒谎：三轨物理行在卷（resume erasure_fenced+时间戳·interview 行数不变·user_account disabled+deleted_at）；purgePending===true 三响应在卷；列表收缩与物理行不变双断言并列（种子护栏 before>0）；简历轨 request 无 worker 保持 fenced。
- 完成推进（审计批 4 验收）：默认 compose（隔离 PG 全迁移链 154 applied）+ 已建 PRIV 链（0091 快照→claim→purge）→ 面试投影 request 与记忆 account_data request 推进 **completed**。
- 三读面（R4）：0129 预览=产品侧单场围栏入口，围栏后 growth/export 第三查/historicalWeakDimensions 三面不可见断言全过。

## 4. 39 清单翻转对表（commit eb695d30 · +82/−80 · 仅 pin 行）

同义缩写：`DELETE=503` / `公开 DELETE…` / `public DELETE…` 各形 → `DELETE=202 软删受理(purge_pending)`（interview 503 关闭如实保留于措辞）。逐文件 pin 行（断言/正则零触碰）：

| # | 文件 | 翻转面 |
|---|---|---|
| 1 | apps/api/test/godfn-1c-begin-guard-merge.proof.ts | 头注+console pin 行 |
| 2-5 | apps/api/test/uc-e2e-001-nhp-{neg,bound,fault,adv}.proof.ts | 头注+Pins/NOTE 行 |
| 6-8 | apps/api/test/uc-e2e-011-{adv-,}refund-callback{,-mouth,-adv}.proof.ts | 头注+PINS 行 |
| 9 | apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts | PINS 行 |
| 10-14 | apps/api/test/uc-e2e-025-nhp-{adv,bound,fault,fault-isolated}.proof.ts | 头注+pin 行 |
| 15 | apps/api/test/uc-e2e-025-nhp-neg.proof.mjs | 头注+console 行 |
| 16 | apps/api/test/uc-e2e-028-nhp-fault.proof.ts | 头注+pin 行 |
| 17 | apps/worker/src/privacy-erasure-worker.ts | 头注 |
| 18-19 | packages/ai-runtime/src/router/semantic-route.ts · test/gap-rag05-classifier.proof.ts | 头注 |
| 20 | packages/db/src/vector-plane-erasure.ts | 头注 |
| 21-27 | packages/db/test/{rag03-hnsw-completeness,rag03c-exactk-observe,uc052-checkpoint-physical,uc052-external-sink-async-purge,uc052-external-sink-retention,uc052-internal-erasure,vector-plane-erasure}.proof.ts | 头注+case 标签+summary 文案（AP-DEL-01/EXT-DEL-01 断言本体零触碰：interview 端点 503 仍真） |
| 28 | packages/db/test/tenant-wiring.manifest.ts | reason 文字面 |
| 29 | packages/domain/test/memory-vector-chunk-deletion.proof.ts | register 针线 join 组装（断言语义逐字节不变·清单外 SSOT nail 期才翻）+ deleteResumeData 静态面随 supersession 翻 S1 真值（耦合针线如实登记） |
| 30-31 | packages/qdrant-store/test/qdrant-store.g5-{erasure,ledger-map}.proof.ts | pass/fail 文案 + deleteResumeData 静态面同上翻 S1 真值（检查正则仍测清单外 harness .md） |
| 32-35 | packages/qdrant-store/src/{erasure,ledger-receipt-map,store,vectorstore-adapter}.ts | 头注/注释 |
| 36-37 | scripts/conn-stack/mysql-stack{,.m2-tenant}.skeleton.proof.mjs | pass/fail 文案+展示名（被测 ADR .md 清单外原值） |
| 38 | scripts/eval-harness-matrix-cite.proof.mjs | mustPin 展示名（正则原值） |
| 39 | scripts/uc018-waiting-user-tip-run.mjs | 头注 |

**闭卷复核**：`grep -rn "DELETE=503|公开 DELETE|public DELETE" --include=*.ts --include=*.mjs apps packages scripts` = **0**（`grep-closure.txt`）。清单外含该三 token 的残留件：无（apps/packages/scripts 域全零；ai-docs .md 域=SSOT 归 nail，按 R6 逐件排除登记）。

## 5. attempts ledger（诚实失败路径 · 红名全录 · 零洗白）

| # | 目标 | 结果 | 根因与处置 |
|---|---|---|---|
| 1 | unstube-erase:prove 开发轮 | EXIT1（interview_privacy_fenced P0001） | 主证种子 assessment_report 触 0059 投影写护栏（裸 admin 连接 principal GUC 空）→ 沿 career-path 证明形制绑 GUC 种子 |
| 2 | unstube-erase:prove 开发轮 | EXIT1（3 FAIL） | 三处测试设计误：全量删前 active 简历已被并发用例围栏（补种子）；FAULT 期望 500（实为全局过滤器 23505→409，按真实映射钉断言）；注销重放期望 404（守卫先拒 401 account_inactive，按真实语义钉断言） |
| 3 | unstube-erase:prove 开发轮 | EXIT1（asPrivacyWorkerExecutor 42501） | provisioned runtime login 非 privacy_worker_executor 成员 → 沿 memory-governance/INT 证明先例改 admin 会话 SET ROLE |
| 4 | api:validate 开发轮 | EXIT1（2 FAIL） | validate 旧注销断言（无密码 200）随契约退役 → 翻为缺密码 400/密码错 401 零副作用/成功 202（dedicated deactUser 种子，避免污染 cpUser 后续改密重登面） |
| 5 | neg:resume 开发轮 | EXIT1（export 500） | neg harness 环境（sql/ 引导链）无 interview_privacy_active → 加最小镜像（与 0058/0076 在负测路径逐值一致，注释登记） |
| 6 | public-copy 开发轮 | EXIT1 | 新删除/注销组件文件未入 proof 读取面 → E1 增读 DeleteResumeButton/DeactivateForm |
| 7 | uc052 ×4 + vector-plane | EXIT1（C-UNCOMMITTED refuse） | 非断言红：干净树门控（含 untracked）→ 提交后于最终树复跑全绿（§2） |
| 8 | memory-vector-chunk-deletion / qdrant g5 ×2 开发轮 | EXIT1 | 耦合针线（deleteResumeData 503 静态面）随 supersession 翻 S1 真值（§4 如实登记） |

以上全部为开发轮红→修；**最终树官方复跑一轮全绿，零 retry-to-green（同断言集合一次通过）**。

## 6. 停止条件核查（五条）

1. 邻接 byte-intact：0129 预览面 `privacy-erasure-preview:prove` EXIT=0、preview 证明文件与 0129 迁移零 diff（git 亲证：两 commit 均未触 0129/preview 证明断言）；godfn-1c 断言零触碰仅 pin 行；neg:interview 零改全绿。✔ 未触发
2. 范围越界：interview DELETE 保持 503（主证断言）；0091 issuer/JWS 零接线；worker 擦除执行器/外部 sink/Qdrant/向量面零触碰（eb695d30 仅注释）；S2 十缺口零实施。✔ 未触发
3. 0060 立法：app_role DELETE 能力未恢复（REVOKE 原值）；trigger 放行判别不含 app_role 直写（PRES002 自证）；SSOT（NORTH-STAR pins/矩阵/backlog）EXEC 期零触碰。✔ 未触发
4. 物理清除宣称：purgePending 恒 true 字面量钉死；无任何 completed 宣称（简历轨 request 保持 fenced 有断言）；0129 预览三钉原值。✔ 未触发
5. retry-to-green：最终树一轮全绿；开发轮红全录 §5。✔ 未触发

## 7. Non-claims

软删 ≠ 物理清除完成（purge_pending 恒真直至 S2 逐 sink 回执）≠ 注销匿名化/同邮箱可重注册（S2）≠ issuer/JWS 已接线 ≠ 预览回执升格 ≠ GAP-PRIV-02/03/04 CLOSED ≠ INT01 六门过 ≠ P-04..07 行 CLOSED（归 nail 新口径登记）≠ covered flip（coveredCount=8 不变）≠ HA ≠ releaseEvidence=true ≠ 生产删除 SLO。SSOT（§3.1 三件） EXEC 期零触碰，归 nail。

*receipt · UNSTUB-ERASE · mw-unstube-exec · 2026-10-07 · commits 52cb6d8a + eb695d30 · prove 全绿见 prove-ledger.txt*
