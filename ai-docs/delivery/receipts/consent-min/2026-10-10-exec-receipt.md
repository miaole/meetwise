# CONSENT-MIN · #82缩水件+#69缩水件 EXEC 收据（批4 收官两小件）

- 席位：CONSENT-MIN EXEC · 2026-10-10 · 工作树 `/Users/miaole/Desktop/golucky/meetwise-consentmin`（branch `line/consent-min`）
- 唯一蓝本：`ai-docs/delivery/harness/consent-min-REQUEST.md` rev2 · pre-exec 双席审毕 + rev2 快核 PASS + 协调方明示 EXEC 授权
- 基线：rebase `feat/mysql-schema-skeleton`（tip `6979a069`）**干净重放**（docs-only 链 2/2 零冲突）→ 分支 tip `5f6eeee6` 上开工；REQUEST 撰写基线 `6a7a3acc`，前移漂移逐条亲读对形（±3 行内全命中·:614/:471/:444/:493/:152/:40/:401/:398-399/:115/:450-451/:94-96/:450-456 精确零漂移）
- 范围：C1（#82 purpose 三入口枚举校验）+ C2a/b/c（#69 卡(已有)+记录+门+回卡）+ C2-3 新证 · **零迁移**（consent_record 0001:450-456 字段齐备亲证）· **零 SSOT 触碰** · est live=0 零外呼零 Key · pins 十一值零翻转

## 0. 逐条落位（file:line 实测 @本刀码面）

| # | 落位 | 证据 |
|---|---|---|
| C1-1 | `packages/contracts/src/index.ts:401-414`：`CONSENT_PURPOSES` as const 三值（`resume_processing`/`interview_personalization`/`voice_capture`）+ `ConsentPurpose = z.enum` + 类型导出 + `ConsentPurposeDto`（strict·purpose optional）+ `ConsentPurposeQueryDto`（非 strict strip）；置于 `PRIVACY_AUTHZ_PURPOSES`(:398-399) 族后 | contracts typecheck EXIT=0；`prove:openapi` EXIT=0（consent 端点不在 openapi registry·73 断言绿） |
| C1-2 | `apps/api/src/modules/privacy/privacy.controller.ts:17-19`：POST `@Body(new ZodValidationPipe(ConsentPurposeDto))`·`b?.purpose ?? 'resume_processing'` 缺省保留 | 新证 b 案：`garbage`/`interview_prep`（memory 域打界）→ 400 invalid；三合法值+空 body `{}` → 200 |
| C1-3 | 同文件 :24-29：GET `@Query(new ZodValidationPipe(ConsentPurposeQueryDto)) q` → `q?.purpose ?? 'resume_processing'` | 新证 c 案：`?purpose=garbage` → 400；`?purpose=voice_capture&extra=1` → 200（非 strict strip 实证） |
| C1-4 | 同文件 :33-36：DELETE 同形 | 新证 c 案：DELETE garbage → 400；voice_capture 合法路径供 f 案 |
| C1-5 | `apps/api/test/neg-input.proof.ts:322-326`：/privacy/consent 摘出·pay-callback/roles-match 原文保留·新增已补枚举注记 | `:69` malformed→is4xx PASS + `:286` array body→noCrash PASS 双绿不回归（日志在卷） |
| C2a-1 | `apps/web/app/interview/actions.ts`（新文件·'use server'）：`grantVoiceCaptureConsentAction()` serverFetch POST `{purpose:'voice_capture'}`·非 ok 抛 `voice_consent_failed_<status>`（沿 resume/actions.ts:26-28 assertOk 形）·零 redirect 零 revalidate | web typecheck EXIT=0 + web build 与基线对照（见 §3）+ C2a-2/3 接线码面 |
| C2a-2 | `apps/web/components/VoiceCallPanel.tsx:615-625`：同意钮改 async——await action 成功后 `setCaptureConsented(true)+setStatus('connecting')`；catch 停留 `consent_required`（:516-517 能力门语义保持·不请求麦克风） | 码面在卷 |
| C2a-3 | `apps/web/components/InterviewPanel.tsx:480-491`：同形——await 成功后 `setVoiceCaptureConsented(true)+setVoiceConsentPrompt(false)+void startRecording()`；catch 重开 `voiceConsentPrompt` | 码面在卷 |
| C2b-1 | `apps/api/src/modules/interview/interview.service.ts:450-456`：asPrincipal 块内 guard 之后两行——`SELECT 1 FROM consent_record WHERE purpose='voice_capture' LIMIT 1` → rowCount 0 抛 `403 {error:'consent_required', purpose:'voice_capture'}`（byte 同形 resume.service.ts:94-96）·**序钉=410 围栏先于 403** | 新证 d/e/f 案 + `prove:privacy-erasure-http` EXIT=0（19 PASS·含 transcribe 410 面 = 序钉既有实证不回归） |
| C2b-2① | `apps/api/test/voice-timeout.proof.ts:40`：`queries === 2` → `=== 3` + 文案「归属、隐私围栏与语音同意门读取」 | `prove:voice-timeout` EXIT=0 一次过（登记更新①） |
| C2b-2② | `apps/api/test/validate.ts:399-404`：503 断言改判 `403 {error:'consent_required', purpose:'voice_capture'}`（userA fixture 无 voice_capture 行·门先于 ASR 判；503 asr_unavailable 形状由新证 e 案承接）+ 注记三行 | `pnpm api:validate` EXIT=0 一次过（登记更新②·更新后断言 PASS 在卷） |
| C2c-1 | `apps/web/components/VoiceCallPanel.tsx` 主路（原 :444）+ 重试路（原 :493）：前置 `status===403 && body.error==='consent_required'` → `setCaptureConsented(false)+setStatus('consent_required')`（:76 既有文案零新增）；asr_down 其余分支 byte 级保留 | 码面在卷 |
| C2c-2 | `apps/web/components/InterviewPanel.tsx:152-160`：前置同判 → `setVoiceCaptureConsented(false)+setVoiceConsentPrompt(true)`；voiceErr/toast 其余不变 | 码面在卷 |
| C2-3 | `apps/api/test/consent-min.proof.ts`（新文件·a-f 矩阵 19 断言）+ `apps/api/package.json` script `prove:consent-min` | `pnpm consent-min:prove`（root isolated wrapper → `pnpm -C apps/api prove:consent-min`）EXIT=0·19/19 PASS（§2） |

**runner 登记（C2-3 必要管道·REQUEST 外最小披露）**：DB-backed proof 家族必须经 `scripts/run-e2e-isolated.mjs`（assertIsolatedTestTarget 拒绝一切非隔离目标——neg:interview/api:validate/unstube-erase 同一纪律）。为此新增三处纯加法：runner 验证表 + 命令映射 ternary 各一条 `consent-min:prove:raw`，根 `package.json` 两条 wrapper（`consent-min:prove` / `consent-min:prove:raw` = `pnpm -C apps/api prove:consent-min`）。围栏/pre-migrate 名单零触碰；`isolatedReceiptSources` 未加（可选项·与 neg 家族一致）。

## 1. prove 验收矩阵（§4 全表·EXIT 原值）

| §4 | CMD（实际运行形） | EXIT | 判读 |
|---|---|---|---|
| 1 | `pnpm consent-min:prove`（=isolated wrapper → `pnpm -C apps/api prove:consent-min`） | **0**（19/19 PASS） | a 三合法+幂等+空 body 缺省 / b 400 invalid ×2 / c GET+DELETE 400+非 strict strip / d 无行 403 / e 有行 503 asr_unavailable / f 撤回关门 403+行删除 |
| 2 | `pnpm neg:input` | **1**（3/135 红） | **基线血统红·非本刀新增**——stash 对照跑基线树同 3/135 同一失败集（`inj:sqli-in-status-query-nocrash`/`inj:xss-in-feedback-comment`/`inj:xss-in-learning-topic`，根因 `column i.created_at does not exist` @InterviewService.list·sql/ 镜像链 vs 代码漂移·零 consent 交集）。C1 验收点 `:69`/`:286` 双 PASS 在卷 |
| 3 | `pnpm neg:interview` | **0**（97 条全绿） | transcribe 负面（:462-471 400/404 族）不回归 |
| 4 | `pnpm voice-timeout:prove`（=`pnpm -C apps/api prove:voice-timeout`） | **0** | 登记更新①后一次过（queries===3·全 SELECT） |
| 4a | `pnpm api:validate`（=isolated wrapper → `pnpm -C apps/api validate`） | **0** | 登记更新②后一次过（403 consent_required 断言 PASS） |
| 4b | `pnpm unstube-erase:prove` | **0**（pass=46 fail=0） | C1 enum 下 `:121` resume_processing 合法值保持绿 |
| 5a | `pnpm -C apps/api prove:voice-cancel-http` | **0** | controller 级 stub·零耦合原样绿 |
| 5b | `pnpm voice-operation-policy:prove` | **0** | ASR seam 级·零耦合原样绿 |
| 6 | `pnpm privacy-erasure:http:prove` | **0**（pass=19 fail=0） | :356-361 围栏全 410 面（含 transcribe）= 序钉实证不回归 |
| 7 | `node scripts/run-e2e-isolated.mjs resume-grounding:prove:raw`（=`pnpm -C apps/worker prove:resume-grounding`） | **0** | RG 同意门三态 spot·worker 零改 |
| 8a | `pnpm -C packages/contracts typecheck` | **0** | — |
| 8b | `pnpm openapi:prove` | **0**（73 断言） | consent 端点零 openapi 面变化 |
| 9 | `pnpm typecheck`（根·tsconfig.e2e） | **0** | — |
| 10a | `pnpm -C apps/web prove` | **0** | 既有 section 零删改 |
| 10b | `pnpm -C apps/web prove:transcribe-proxy` | **0** | 纯代理原样绿 |
| 11 | `pnpm -C apps/web build` | **1**（唯一 error 同基线） | **基线血统红·非本刀新增**——临时 worktree 对照：基线 `5f6eeee6` build 同 EXIT=1，同一唯一 error（`react-hooks/exhaustive-deps` rule not found @VoiceCallPanel :546 基线/:566 本刀·行移位=+20 恰为本刀插入行数·该 disable 注释=既有 `2fac3009` 遗留·base eslint config 无此插件=既有 `709bc68c` 面）。**我的文件零 error 零新增 warning**；编译完整性另证=`pnpm -C apps/web typecheck` EXIT=0 |
| 12 | markers `grep '^<<<<<<< \|^=======$\|^>>>>>>> '`（apps packages scripts ai-docs .github） | **=0** | 门过 |

## 2. prove 迭代全账（Ban retry-to-good 核查·attempts 全披露）

1. **prove:consent-min 共 2 跑**：①红（3/19——d/e/f transcribe 案 500 `assert_interview_privacy_active does not exist`）→ 根因=**新证自身 bootstrap 缺件**：neg-harness boot() 只镜像读谓词 `interview_privacy_active`，从未被任何 neg 证打到的 transcribe 链还需要 0058 的 assert 委托函数。修法=**证明文件序言内**按 0058 原文同形补 `CREATE OR REPLACE FUNCTION assert_interview_privacy_active`（委托镜像·围栏立法文件 0058/0059/0062/0076 零字节·真链 410 主证仍归 privacy-erasure-http）；②绿 EXIT=0。**非断言面改口、非产品码 retry**——红因是证明环境缺镜像，修的是 proof 自身 bootstrap。
2. **neg:input 共 2 跑**（with-change 1 + **基线对照 1**）：同 3/135 同一失败集 → 基线血统实证。对照方法=`git stash push -u` → 基线跑 → pop。
3. **web build 共 2 跑**（with-change 1 + **基线对照 1**）：临时 worktree `/tmp/cm-baseline-wt` @`5f6eeee6` 实测同 EXIT=1 同唯一 error → 基线血统实证（对照毕即删）。
4. **两处登记更新**（voice-timeout :40、validate :401）均**一次过**。
5. 其余矩阵项各 1 跑全绿。

## 3. 执行期事件登记（append-only·如实）

- **共享 stash 命名空间竞态（三方数据无损·已闭环）**：基线对照期间本席 `git stash push -u` 后，另一席（`line/dir-b2-domain`·b2r-temp-g3-pre）向共享 stash 栈压入其 stash，本席 pop 弹出了**对方的** stash（7 文件冲突·git 按约保留条目未删）。处置：`git reset --hard` 清本工作树误弹面（对方数据在其条目内无损）→ 对方席并发自行取回其条目 → 本席精准 pop 自己条目 → 13 文件逐一核对=本刀改动集原样（无外来内容）。教训登记：多席共享仓的 stash 栈非席位隔离，基线对照类操作应改用临时 worktree（本席 web build 对照已改用之）。
- `apps/web/tsconfig.tsbuildinfo`：typecheck 运行副产物·提交前 `git checkout --` 还原·不入刀面。

## 4. 停止条件核查（§8 四条）

- (i) 锚点形状：全数对形（±3 行内·详 §0；rebase 前移漂移零实质）——未触发。
- (ii) consent_record 表结构：零触碰零迁移（0001:450-456 字段齐备）——未触发。
- (iii) 新增红：**零新增**。neg:input 3 红 + web build 1 红均有基线对照实证=血统既有（§2·§1 表）；两处登记更新=REQUEST rev2 预授权面。**基线血统红本身**（主线 `feat/mysql-schema-skeleton` 上 neg:input 非全绿、web build 门红）如实上报协调方裁量——非本刀修复义务（触之即越 §2 范围）。
- (iv) §2 范围外触碰：runner 三处+根 package.json 两行=C2-3 可执行性必要管道（§3 披露）；其余零越界（#81 面/G4 面/围栏族/memory_consent/PRIVACY_AUTHZ_PURPOSES/SSOT/pins 全零字节）。

## 5. Pins（十一值照抄·零改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事） · 公开 DELETE /privacy/interview-data/:id = 503（superseded：202 软删受理 mode=logical·purgePending=true 恒真直至 S2 逐 sink 回执） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗·est live=0）

## 6. Non-claims

consent_record voice_capture 行 ≠ 录音可持久化（voice_ephemeral_v1 原值零改）≠ 历史可回溯补录；transcribe 403 门 ≠ 撤回产品面建成（voice 无撤回 UI·API DELETE 既有面）；purpose Zod enum ≠ 库层 CHECK（0001 purpose 仍 text 无约束）；新证 503 形状 ≠ ASR 已配置；前端接线 ≠ 离线可用保证；prove EXIT=0 ≠ E2E covered ≠ HA ≠ releaseEvidence；本收据 ≠ post-prove dual 已过（`executed:awaiting_post_prove_dual`·alone≠dual）。基线对照跑未涉任何其他席位工作树（临时 worktree 已删·git worktree list 还原）；日志全账 `logs/`（20 件）。

*CONSENT-MIN EXEC · 2026-10-10 · base `5f6eeee6`（rebase @主线 `6979a069`）· diff --stat 实物核对：11 改 + 2 新 = 99 insertions / 18 deletions*
