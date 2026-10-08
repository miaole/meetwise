# Receipt — GODFN-1c · interview.service 拆解刀 EXEC（mw-core）

**Date**: 2026-10-08（Asia/Shanghai）
**Line/Knife**: GODFN-1c · EXEC 席 `mw-core`（作者 `git -c user.name=mw-core -c user.email=mw-core@meetwise.local`）
**蓝本**: REQUEST rev2 @ `861c630e`（`ai-docs/delivery/harness/godfn-1c-exec.md`）· 已 nail 设计 `ai-docs/delivery/harness/godfn-decompose.md` §2.3/§4/§5.3 唯一蓝本
**Worktree**: `meetwise-line-godfn1c` · branch `line/godfn-1c-interview-svc` · base `861c630e`（HEAD 于执行起点）
**Lifecycle**: `draft_rev2:awaiting_pre_exec_dual` →（协调方 EXEC 授权）→ 本刀执行 → **`exec:awaiting_post_prove_dual`（本收据 · STOP）**
**Ban self-approve** · alone ≠ dual · post-dual 归协调方+双席

---

## 0. Pins 十值（设计 §4 逐字照抄 · 本刀不改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · 公开 DELETE=**503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null` · GAP-DEBT-BE-GODFN 保持 P1 OPEN。

---

## 1. 交付面（diff face · 13 文件）

**产品码（6 新 + 1 改 · 目录内拆分 · 控制器/路由契约面零触碰）**：

| 文件 | 变更 | 内容 |
|---|---|---|
| `apps/api/src/modules/interview/interview.service.ts` | 改（955→745 行） | 六守卫原位零弱化 · begin/turn/submitPreviewAnswer/questionFeedback/abandon/create/list/get/events/answer/`generateCareerPath` 全体保位 · speak/speakStreamPrepare/transcribe 保留 gate+owner+围栏层、尾段迁出 · **begin() 三守卫合并**（见 §2） |
| `…/interview-view.ts` | 新（30 行） | `toInterviewView` 机械迁出（list/get 共用视图映射） |
| `…/interview-voice.ts` | 新（89 行） | speak/transcribe 尾段 + `MAX_AUDIO_BYTES`/`formatFromMime`/流式 prepare 尾段迁出（catch(:any)×2 随迁） |
| `…/interview-report.ts` | 新（92 行） | report/retryReport/exportReport/transcript 方法体迁出（db/guard 注入） |
| `…/interview-assessment.ts` | 新（65 行） | generateAssessment/getAssessment/getCareerPath 迁出（单 guard 点方法） |
| `…/interview-learning.ts` | 新（50 行） | generateLearningPlan/getLearningPlan/completeLearningItem 迁出 |

**测试/断言面（6 改 + 1 新 · 全部逐修有账，见 §5）**：`neg-interview.proof.ts` · `uc-e2e-025-nhp-fault.proof.ts` · `uc-e2e-025-nhp-bound.proof.ts` · `uc-e2e-025-nhp-adv.proof.ts` · `uc-e2e-025-nhp-fault-isolated.proof.ts` · `uc-e2e-011-report-refund-http.proof.ts` · `int-transcript-preview-submit-http.proof.ts` · 新增 `godfn-1c-begin-guard-merge.proof.ts`（新增断言面）。`apps/api/package.json` +1 键 `prove:begin-guard-merge`。

**Ban 面遵守**：零迁移/零 SSOT/零 G7 判定面 · 控制器与路由契约零触碰 · `supplyCandidateProfileRoute` 供给语义零触碰（:338 块原样）· advisory×5 / FOR UPDATE×3 / 幂等键查询（原 :313-329）原样 ·HttpException 状态码/错误码/抛序零变。

## 2. begin() 三守卫合并（本刀核心）

NEG stale_quiz（原 :217-228）/ FAULT missing_quiz_expiry（原 :235-248）/ BOUND resume_version_mismatch（原 :256-273）三刀各自 SELECT（前两刀 SQL 字节级重复 `SELECT status, expires_at FROM resume_quiz WHERE id=$1 AND owner_user_id=$2`）→ 归一**单查**：

```sql
SELECT q.status, q.expires_at,
       q.resume_id::text AS pinned_resume_id,
       q.privacy_epoch AS pinned_epoch,
       r.privacy_epoch AS current_epoch
  FROM resume_quiz q
  LEFT JOIN resume r ON r.id=q.resume_id AND r.owner_user_id=q.owner_user_id
 WHERE q.id=$1 AND q.owner_user_id=$2
```

**抛序逐字节保持**（现行精确顺序）：`404 not_found_or_forbidden`（rowCount=0）→ `stale_quiz`（NEG；C-1 窄保留 `expires_at != null` 才参与过期比较）→ `missing_quiz_expiry`（NULL）→ `missing_quiz_expiry`（NaN fold）→ `resume_version_mismatch`（pin NULL 不假拒）。LEFT JOIN 不改行基数（resume PK 至多 1 行匹配）；两遍同 SQL 归一后 rowCount 语义等价。**resume_quiz 查询次数 3→1**。

## 3. 保形委托面（dbid1 smoke）

`packages/db/scripts/dbid1-api-guard-smoke.ts` **零改动**（Object.create(InterviewService.prototype) 直调 begin；own-property 桩 `denyPublicPreviewWrite`/`db`）：begin 仍为 prototype 真实方法、`this.db`/`this.denyPublicPreviewWrite()` 经实例访问——签名 `(principal, id, resumeId, requestId?, sourceQuizId?)` 与 this 语义零变。**prove:db-id-v7 EXIT=0**（P8-1/2/3 全过，含直接 tsx 复跑 `pnpm exec tsx packages/db/scripts/dbid1-api-guard-smoke.ts` EXIT=0）。

## 4. blob 演进对照（三钉条款 §3.5）

`apps/api/src/modules/interview/interview.service.ts`：**旧 blob `d43a569c`f96384413b1d737eb042be822148216f → 新 blob `d816beff`529ebdce35cfac139f1270a02a72e511**（行为等价门全过，见 §5；行数 955 → 745，目录合计 955+272+23=1250 → 1366）。另两钉未触：`scripts/run-e2e-isolated.mjs`、`packages/ai-runtime/src/text-endpoint-config.ts` 零改动。

## 5. 五值等数机检实录（拆解前后同口径）

**口径（双席 nit 落字）**：计数范围 = `apps/api/src/modules/interview/` 目录全部 `.ts`（拆解前=1 文件，拆解后=6 文件，同目录口径）；文本 = **剥注释后**（行注释+块注释；SQL 模板串内容属代码计入）定义排除（各守卫名恰一处 `private …` 定义扣除）；catch(:any) 按字面 `catch (x: any)` 计。计数器与两侧实录同收据落盘（`five-value-counter.mjs` / `five-value-base.txt` / `five-value-post.txt`）。

| 五值(+附) | 拆解前 | 拆解后 | 等数 |
|---|---|---|---|
| asPrincipal | 27 | 27（facade 16 + report 5 + assessment 3 + learning 3） | ✅ |
| guardInterviewPrivacy | 23 | 23（facade：直调 13〔含 generateCareerPath 三调用点〕+ bind 引用 10；域文件经注入参数零新计） | ✅ |
| denyPublicPreviewWrite | 10 | 10（全 facade） | ✅ |
| requirePublicPreviewControlledWrite | 1 | 1（submitPreviewAnswer） | ✅ |
| catch(:any) | 5 | 5（facade 3：guard/reserve/abandon + voice 2 随迁） | ✅ |
| advisory 锁（附） | 5 | 5（facade 4 + generateCareerPath 1；career 留 facade 故计数不漂） | ✅ |
| FOR UPDATE（附） | 3 | 3（facade begin/submitPreview/career） | ✅ |

**注**：generateCareerPath（三 guard 调用点跨三个事务闭包）**留 facade**——拆出会使 guardInterviewPrivacy 调用点计数漂移违五值等数（interview-assessment.ts 头注同步落字）。guard 的 `.bind(this)` 引用为绑定面（同口径两侧各计 1 次/方法）；tenant 接线 manifest（file envelope 精确计数 17）不受影响——**零 tenant 符号迁出 facade**，新域文件零 tenant 符号（`tenant-enforcement` P1 EXIT=0 + `tenant-wiring-e5` P2 EXIT=0 复跑佐证）。

## 6. prove 全键终态表（api 16 + 新增 1 + db 1 + trio）

协议 = 每键一次性 disposable 隔离 PG 容器（镜像 `pgvector/pgvector:pg16` + nonce attestation，同 `run-e2e-isolated.mjs` 契约）；`migrate`=全 152 迁移预放；`plain`=proof 自备 schema；`clean`=无 DB 变量（proof 自设哑 URL）。est live 链记账：api 面 17 容器 + db-id-v7 2（base+post）+ 三键容器由 runner 自管 ≤25/run ✓。

| 键 | base @861c630e | post 本刀 | 处方 |
|---|---|---|---|
| prove:begin-guard-merge（**新增断言面**） | —（不存在） | **EXIT=0**（30 PASS：抛序等价九行矩阵 + 3→1 计数 + S 面单查/抛序/先于 bind/reserve/enqueue） | 新增 |
| neg:interview | EXIT=1（46/97 失败） | **EXIT=0**（97/97） | 逐修 A |
| prove:uc025-stale-quiz-expiry | EXIT=1（S1/S3/S4/G-GAP 4 失败） | EXIT=1（**同 4 失败·字节级同集**） | 预存红零回归 lane |
| prove:uc025-nhp-neg | EXIT=0 | **EXIT=0** | 零触碰复跑 |
| prove:uc025-nhp-bound | EXIT=0 | **EXIT=0** | 逐修 B（IO 桩随合并 SQL 形状对齐；R 断言零改） |
| prove:uc025-nhp-fault | EXIT=0 | **EXIT=0** | 逐修 B（S3 witness 随单查重锚 + IO 桩；A 断言语义不变） |
| prove:uc025-nhp-fault-isolated | EXIT=1（F5×3） | **EXIT=0** | 逐修 C |
| prove:uc025-nhp-adv | EXIT=1（8 行锚 + PC-A1/A3-a/A3-NULL） | **EXIT=0**（45 PASS） | 逐修 D |
| prove:uc018-abandon-http | EXIT=0 | **EXIT=0** | 零触碰复跑 |
| prove:uc018-adv | EXIT=0 | **EXIT=0** | 零触碰复跑 |
| prove:uc019-report-regenerate-http | EXIT=0 | **EXIT=0** | 零触碰复跑 |
| prove:uc011-report-refund-http | EXIT=1（H4/H5 ×2） | **EXIT=0**（50/50） | 逐修 E |
| prove:uc004-career-path-fault | EXIT=0 | **EXIT=0** | 协议修正（migrate 靶；base 误配容器） |
| prove:last-event-id | EXIT=0 | **EXIT=0** | 零触碰复跑 |
| prove:int-transcript-preview-submit-http | EXIT=1 | **EXIT=0** | 逐修 F |
| prove:public-preview-write-gate | EXIT=0 | **EXIT=0** | 协议修正（clean env） |
| prove:sse-slot | EXIT=0 | **EXIT=0** | 零触碰复跑 |
| prove:db-id-v7（packages/db） | EXIT=0 | **EXIT=0** | 零触碰复跑（保形委托面佐证） |
| e2e:isolated / e2e:ui:isolated / verify:e2e-performance（trio） | 本环境不可运行（见下） | **EXIT=1 `provider/live_provider_key_missing`（阻塞，非回归）** | **阻塞上报** |

**trio 阻塞（遇雷 STOP 项 · 非代码回归）**：三键均为 `LIVE_E2E_TARGETS`（runner §LIVE_E2E_TARGETS），full E2E 唯一允许外呼=live 模型。本执行环境（shell/login-shell/zcode 配置）**零 `MODEL_API_KEY`/`DASHSCOPE_API_KEY`**（name-only 核查：env 计数 0）——子进程导入面 fail-fast `E2E_FAILURE class=provider code=live_provider_key_missing`（≈5s，**零用例执行**；直接裸跑 `node scripts/run-e2e.mjs` 于已备隔离库同样即停，证据 `trio-block-evidence.txt`）。isolated 库/迁移面本身全绿（容器 boot ✓ · 152 迁移 ✓ · post-migrate/pre-probe ready ✓ · web build ✓）。**base 同环境同阻塞**（无可比基线、无红可洗）；两键语义=`operator live-key 环境预注入后由协调方复跑`，per receipts g7-trio-keyed 先例。**post-dual 前置条件：协调方在持钥环境复跑 trio 三键。**

## 7. attempts 台账（红→绿逐修 · 全账 · 非 retry-to-green）

| # | 键/面 | base 态 | 根因（亲证） | 修复（断言语义零改标注） | 终态 |
|---|---|---|---|---|---|
| 1 | neg:interview | 46/97 失败 | harness schema 三处落后 HEAD：0058 privacy 函数缺位（report/assessment/learning/career/speak/begin 链 500）+ 0064 `interview.resume_privacy_epoch`/`interview_job.resume_privacy_epoch`+v64 CHECK 缺位 + 0142 供给面表缺位；另 begin UUID_RE 拒非 UUID resume-id（proof 头 `rid='r1'`）、sql/22 绑定 trigger/CHECK 落后 0049 语义 | proof 内 additive gap-fill：privacy stub（uc018 同款）+ 0064 列/v64 CHECK（fault-isolated 同款）+ 0142 表/GRANT/RLS（0142 同款）+ 0049 约束/allow-once trigger 原文对齐 + UUID resume 种子 + IV_ACTB INSERT 时预绑（sql/22 trigger 禁 resume_id UPDATE）+ IV_UBC 预供给 snapshot（GUC 事务）；MAX_TURN 65→300（64→256 漂移）；guard 前置 404 码对齐现行 `not_found_or_forbidden`（_proof 钉于 guard 进 report/assessment 路径前；404 不可区分语义不变）| 97/97 绿 |
| 2 | uc025-nhp-bound | 绿 | 合并单查后 IO 桩双分支失配（pin-only 行致 status=undefined） | 桩改单查 merged-row 分派；R1-R6 断言逐字未改 | 绿 |
| 3 | uc025-nhp-fault | 绿 | 同上 + S3 旧 SQL 字面 witness 失配 | S3 witness 重锚单查形状（语义=FAULT throw 前读 expires_at，新增先于 throw 断言）；桩同上；R1-R5 零改 | 绿 |
| 4 | uc025-nhp-fault-isolated | F5×3 失败 | 0142 供给面落地后 shell 未建表 → F5 happy-path begin supply 直查 500 | 0142 表/GRANT/RLP additive + F5 预供给 snapshot（复用路径）；F1-F4 拒因面在 supply 前抛出不受影响 | 绿 |
| 5 | uc025-nhp-adv | 8 锚+3 案失败 | ①行锚漂移（priv01-C `principal→owner` 改名+历史行移）②026(=0142) 供给面 500 | 行锚重钉 195/206/212/227/230/264/304/312（语义目标一一对应；:329 正则随 `owner` 形参事实修正）+ 0142 面 + PC-A1/A3-a/A3-NULL 预供给 | 45 PASS 绿 |
| 6 | uc011-report-refund-http | H4/H5 ×2 | 字面契约名 `POST /payment/refund-callback` 已由 404-gap 演进为真主口（GAP-UC011-ADV-01 payment-callback.controller 落地） | 两诚实钉对齐现行事实：字面口已挂载 → 403 bad_signature fail-closed（不洗 covered；真 B-1 证据仍指 `uc011:refund-callback:prove`） | 50/50 绿 |
| 7 | int-transcript-preview-submit-http | 协议性失败（sqlschema 无 0092 链依赖不可收敛：0047←0045←…与 0040 起Least-privilege 授权面连续漂移） | 改 **full-migrate 靶**：privacy/0126 fence 两 stub 改**条件式**（真函数在场即跳过·零替换零弱化——0126 函数体逐字全文含同题 stateVersion 分支）；admin 直插/直改 7 写+1 读经 `set_config('app.principal_user')` 事务（与生产 asPrincipal 同形）；种子升 v64 typed 形状（0144 trigger 要求） | 全绿（10 合同用例）|
| 8 | prove:begin-guard-merge | 新增 | 设计 §2.3 新增断言面 | 新 proof + package.json 键 | 30 PASS 绿 |
| 9 | trio | 本环境不可运行 | live key 缺失（上节） | 无（环境前置） | 阻塞上报 |

**预存红 lane**：`prove:uc025-stale-quiz-expiry` — 其 harness 头自钉「产品浮出（begin 接 quizId/查 resume_quiz）→ 拒 EXIT=0，须另刀 reject/accept prove」；NEG 真接线（GAP-UC025-NEG-01）后本证明按设计即持 EXIT=1（诚实 mark-red 退役态），接替绿键=nhp-neg/nhp-fault/nhp-bound（本刀全绿）。base 与 post 失败集字节级一致（S1/S3/S4/G-GAP）→ **base 同红零回归**。

## 8. 零回归佐证（面外相邻静态键复跑）

`tenant-enforcement`（P1 精确计数/file-set）EXIT=0 · `tenant-wiring-e5`（P2）EXIT=0 · `voice-stream-preview`（interview.service 源静态断言）EXIT=0 — 三键均不在 §5.3 face，为共享机器检查面防漂移佐证。

## 9. 遗留与读者名单登记（零静默丢弃）

- `packages/db/test/db-int-fk.proof.ts` 注释内行号引（interview.service.ts:567/:796/:822/:849/:904）随拆解漂移——**纯注释引用**，该 proof 自持 SQL 复刻断言（不读本文件），EXIT 不受影响；登记待该 proof 维护刀顺带校正。
- `apps/worker/test/tokenstream-progress.proof.ts:5/:46` 注释引 `interview.service.ts:950`、`apps/web/e2e-ui/recruiting-bound.spec.ts:51` 注释引 `:47` — 同类纯注释漂移，登记。
- RESIDUAL_PATHS（tenant manifest）内 `:673-931`/`:177-190` 描述性行号漂移 — manifest 为 SSOT 文档面，本刀不改（零 SSOT），登记待协调方裁。
- 双席 nit 建议①：五值口径已落字（§5）；建议②：`.bind(this)` 绑定面与直调面同口径计数的合理性请双席复核；建议③：trio 复跑须持钥环境（est 不变 ≤25/run）。

## 10. STOP

本刀 EXEC 完成 → **`exec:awaiting_post_prove_dual`**。push = `origin line/godfn-1c-interview-svc`（commit 作者 mw-core）。post-dual 前置：①双席审本收据（§5 口径/§7 台账/§6 阻塞项）②**协调方持钥环境复跑 trio 三键**。Ban self-approve · alone ≠ dual。

---

*GODFN-1c EXEC receipt · 2026-10-08 · mw-core · base `861c630e` → 执行树（13 文件）· 行为等价门全过 · trio env-blocked 上报 · STOP*
