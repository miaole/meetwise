# Q2-VALIDATE-SCENE-FIX REQUEST — PR #109 verify step 99 api:validate 唯一红 2 断言场景面修复刀（validate.ts ABND 场景 × Q2 入队背压闸场景自洽 · 单文件测试场景面 · 快速链一体席 · STOP=`executed:awaiting_post_prove_dual`）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 席同席翻面·前值 `draft:awaiting_exec`=起草态保全于 git 史 `faa3ea2d`·快速链=起草→自审（窄域五项 PASS·P2-1 prose 勘误随 EXEC 落卷）→EXEC→STOP·门矩阵七门全绿·api:validate 红翻绿亲证（§9 字段①）·post-prove 双审归协调方派席 · alone≠dual · est live=0 · `actualSpendCny=null` · ⛔push · STOP 三处锚定=①卷头标题行②本 Status 行③§8 节 · 卷尾不载 STOP 值防多锚漂移）

**席位**：Q2-VALIDATE-SCENE-FIX 诊断+起草+自审+EXEC 一体席（协调方派单 2026-10-16 · PR #109 verify step 99 唯一红口径指派 · 快速链授权链=派单 brief 明示「快速链：诊断→起草→自审→EXEC 一体」· ⛔push）。
**基线**：`feat/mysql-schema-skeleton` @ **`d5dc0726`**（`git fetch` 后亲证 `origin/feat/mysql-schema-skeleton` tip=`d5dc0726` **恰等**（≥ 以等号成立）· PR #109 head · ai-graphs 环解 nail 波 tip）· worktree **`meetwise-qvf`**（仓根同级 · `git worktree add ../meetwise-qvf -b line/q2-validate-scene-fix` 本席亲立·reset 到 origin tip 亲证）· branch **`line/q2-validate-scene-fix`**。
**立项出处**：①协调方派单 brief（2026-10-16 · PR #109 step 99 api:validate 2 断言 FAIL=`ABND begin → 202(预留 1.0)`+`预留后额度 -1.0`@validate.ts:315 区 · ai-graphs nail 席归因实证=Q2 per-owner queued N=3 硬上限闸×validate.ts 场景交互 · **detached `93b3db5a` 控制组全过=闸前绿**）；②本席本树 @`d5dc0726` 亲跑复现（改前红 `pnpm api:validate` EXIT=1 恰 2 FAIL · 全文=§1.1）；③修法裁决随派单 brief 已定=**候选 a（场景内清 queued·场景自洽·测试面）**（b=场景换独立 user / c=缺省调大 N 均否决——c 违 Q2 六裁决既定 N=3）；④结构范本 `ai-docs/delivery/harness/ssd-egress-manifest-REQUEST.md`（快速链一体席形制）+`ai-docs/delivery/harness/queue-enqueue-bp-REQUEST.md`（Q2 闸姊妹卷·闸语义六裁决记录）。

---

## §0 现状锚（起草席亲证 · 全部 Read/git hash-object/rg 实测 @`d5dc0726` · EXEC 面照本节对届时 tip 复核——本刀快速链起草 EXEC 同席·锚零漂直接落码；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list`：`meetwise-qvf` 名下**恰 1 树**=本树；`git branch --list "line/q2-validate-scene-fix"` 恰 1 命中=本席分支 · 零同名。
- `ls ai-docs/delivery/harness/ | grep q2-validate-scene-fix` 落卷前**零命中**（无同名卷）；117 个既有 REQUEST 均不同名。
- docs:check 基线本席亲跑 **EXIT=0 · scanned 2193 managed ≤ cap 2200**（余 7 · 落卷后预期 2194 · 本卷系唯一新增受管件）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`d5dc0726` 亲读）

| # | 文件 | blob | 关键行锚（@`d5dc0726` 亲读） |
|---|------|------|------|
| 1 | `apps/api/test/validate.ts` | `256a754a`（690 行） | `:59` ABND seed（`created` 态）· `:174` seed R1 start job **status='done'**（不占 queued 深度）· `:270`-`:276` BEG1 begin ×2（start job 恰 1 条 `:273` 钉死·重复 begin 幂等不再入队 `:276`）· `:279`-`:285` RACE 并发 begin ×2 → advisory 串行恰 1 start job（`:284` 钉死）· `:290`-`:291` R1 turn 202 入队 answer job 恰 1 条（`:312` 钉死）+重放 replayed 不二次入队 · **`:312` `answer job 已落队列` 断言（本刀插入点前界）** · `:313`-`:321` ABND 块（`:314` balBefore · **`:315` 红断言① `ABND begin → 202(预留 1.0)`** · **`:317` 红断言② `预留后额度 -1.0`** · `:318` abandon 200+released · `:320` 退还 · `:321` userB 越权 404）· `:322` 后零 interview_job 读写零 begin/turn 入队（rg 亲证·本刀清 queued 零后顾） |
| 2 | `packages/db/src/interview/interview-jobs.ts` | `c69c03a3` | `:25` `MAX_INTERVIEW_PER_OWNER_QUEUED = 3`（Q2 六裁决件③·保守缺省）· `:70`-`:92` 入队背压闸正身（`:79` advisory 收紧锁 `meetwise.interview_enqueue.owner:*` · `:80`-`:83` 幂等键预查豁免（任意行状态）· `:84`-`:91` `count(status='queued')>=3` → 具名错 `interview_queue_saturated`）——**本刀只读零触** |
| 3 | `apps/api/src/modules/interview/interview.service.ts` | `cf23ed37` | `:290`-`:291` beginInterviewCore catch `interview_queue_saturated`→**429** · `:470`-`:471` turn 同映射——**本刀只读零触** |
| 4 | `scripts/ai-docs/public-text-policy.mjs` | — | `:102` `MAX_FILES=2_200`（docs cap 现值） |
| 5 | `scripts/i6-239-gates.proof.mjs` | — | `:151`-`:163` markers 五类词族（词面运行时组装防自匹配）——本刀 markers 门同形不行使该 proof（其本体系其刀自scope） |

## §1 归因（红事实 · 机理 · 定性 · 「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 红事实（本席本树 @`d5dc0726` 亲跑 · 改前红全量落档）

`pnpm api:validate`（隔离 runner · 独立 postgres 容器）→ **EXIT=1 · PASS 202 / FAIL 2**，恰为派单点名两断言：

```
FAIL  ABND begin → 202(预留 1.0)
FAIL  预留后额度 -1.0
✗ 2 项失败
```

其余 202 断言全 PASS（含 `:318` `放弃面试 → 200 + released` 与 `:320` `放弃后额度退还`——begin 429 回滚零预留后，空壳 abandon 原样 200、额度不变原样相等，皆设计内语义故不红·commerce.ts 空壳放弃支亲读）。detached `93b3db5a`（闸并线前）控制组全过=**闸前绿**（派单 brief 承引）——红仅出现在闸落地后，时序指向闸×场景交互。

### 1.2 机理（queued 深度逐条清点 · 全部锚 `:273`/`:284`/`:312` 断言钉死）

本 harness 为 **api-only（无 worker 消费）**：入队后的 job 永驻 `queued`。至 `:315` ABND begin 前，`userA` 名下 queued `interview_job` **恰 3 条**：

| # | 来源 | 钉死断言 |
|---|------|----------|
| 1 | `:271` BEG1 begin → start job | `:273` `start job 已落队列`（count=1） |
| 2 | `:280`-`:283` RACE 并发 begin → start job 恰 1 | `:284` `并发 begin 竞态安全`（count=1） |
| 3 | `:290` R1 turn → answer job | `:312` `answer job 已落队列`（count=1） |

（`:174` seed 的 R1 start job 显式 `status='done'`，不占 queued 深度；`:291` 重放走幂等预查豁免不入队；`:292`-`:300` 各 400/409/410/401 臂均不入队。）

ABND begin 为第 4 条入队：`enqueueInterviewJob` 闸体 `:84`-`:91` `count(queued)>=3` → 具名错 `interview_queue_saturated` → service `:290`-`:291` 映射 **429** ≠ 202 → 断言①红；begin 整事务回滚（start 臂扣费预留同滚零悬账）→ 零预留 → `balReserved === balBefore` → 断言②红。机理与 ai-graphs nail 席归因全同，本席独立读码+实测复证。

### 1.3 定性

**产品码闸语义正确**（Q2 六裁决既定：案A/per-owner/N=3/429/预查豁免/收紧形——姊妹卷 §9 六裁决件行使记录）·本红=**测试场景面不自洽**：闸落地使 api-only 场景的积压假设失效（场景隐含「worker 在线消费」前提未在场景内成立）·**非产品缺陷**。修法域=测试场景面，产品码零触。

## §1-修法（裁决 a 已随派单定稿 · validate.ts 单文件恰几行 · 场景自洽）

`apps/api/test/validate.ts` `:312` 与 `:313` 之间插**恰 5 行（3 注释+2 落码 · 起草 prose 原「恰 4 行」系笔误·EXEC 勘正=下方块文本与落码逐字节一致·§9 字段⑥-1）**：闸前清 `userA` queued（=模拟 worker 已消费积压——真实部署 worker 在线时 ABND begin 深度为 0）+ 清零断言（场景自洽可判定化）：

```ts
// [Q2-VALIDATE-SCENE-FIX] 场景自洽:本 harness api-only 无 worker,上方 BEG1/RACE begin + R1 turn
// 断言恰累积 userA queued job 3 条,ABND begin(第 4 条)将撞 Q2 入队背压闸 429,遮蔽本块受测的
// 额度预留/退还语义。闸前清 queued=模拟 worker 已消费积压(仅 queued 受闸·窄谓词不触他行他主)。
await db.pool.query("DELETE FROM interview_job WHERE owner_user_id='userA' AND status='queued'");
q = await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE owner_user_id='userA' AND status='queued'"); A('ABND 前 userA queued 已清空(api-only 场景自洽·防 Q2 背压闸 429 遮蔽预留语义)', q.rows[0].n === 0);
```

- 两条红断言 `:315`/`:317` **原文零改零删**——修法必须使其在闸在场下真实转绿（闸仍被后面场景行使：worker 面证明件+neg-interview §10 五臂为闸语义承重证明面·本刀不弱化不重复）。
- 候选 b（场景换独立 user）否决：需 seed 新用户额度/简历/consent 全链，行数与本刀「恰几行」约束不合；候选 c（缺省调大 N）否决：产品码+违 Q2 六裁决件③ N=3。

## §1.3 否决清单（veto · EXEC/自审违反任一即 FAIL）

1. **Ban 产品码触**：interview-jobs.ts / interview.service.ts / worker 面及一切 apps/packages 产品码零字节改（闸语义=Q2 六裁决既定·§0.1 #2/#3 只读）。
2. **Ban 闸语义弱化**：不得改 N、不得放宽 count 谓词、不得绕过/配置跳过闸。
3. **Ban 断言弱化**：两条红断言及既有 202 PASS 断言原文零改零删零跳过——Ban 删断言/改期望值为绿。
4. **Ban 清除超界**：DELETE 窄谓词 `owner_user_id='userA' AND status='queued'`——不触 running/done/failed、不触他 owner、不触他表。
5. **Ban SSOT 行本体触**：LEDGER / checklist / backlog / SOP 全部行零字节改（行翻面权归协调方）。
6. **Ban self-approve / post-prove 代行**（post 双审归协调方派席 · alone≠dual）· **Ban retry-to-green / Ban 只留绿 attempt**（红绿两证全量落档）· **Ban push / force-push / merge 主线** · **Ban 触 §3 全部域**。

## §2 门矩阵（每条可独立判定 · §9 EXEC 记录逐门落结果）

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| 1 | api:validate | `pnpm api:validate`（隔离 runner） | **改前红→改后绿**：改前 EXIT=1 恰 2 FAIL（§1.1 亲跑落档）· 改后 EXIT=0 零 FAIL（§9 字段①） |
| 2 | neg:all | `pnpm neg:all` | **EXIT=0** 六段全绿恰等基线（auth/commerce/resume/interview/bend/input 零回退） |
| 3 | typecheck | `pnpm turbo typecheck --force` | **EXIT=0** · 0 cached |
| 4 | lint | `pnpm turbo lint --force` | **EXIT=0** · 警告计数恰等 pin（web 601/root 5235/api 1421/worker 954/ai-runtime 628 · 零增量） |
| 5 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0** ≤ 2200（基线 2193 亲跑 · 落卷后 2194 预期·余 6） |
| 6 | markers | 改动集五类标记词 grep（词族 `i6-239-gates.proof.mjs:151`-`:163` 同形运行时组装 · 词面卷内不复抄防自匹配） | **零命中**（四词词族 0/0/0/0+冲突标记对 0） |
| 7 | diff 面 | `git diff --numstat`（两 commit 合计） | **恰 2 tracked**=本卷 .md（新增）+`validate.ts`（+5/−0）· 零迁移零 lockfile 零他路径 |

## §3 范围外（越界即 FAIL）

1. 产品码全域（§0.1 #2/#3 及一切 apps/packages 面）——只读引用零触碰。
2. worker 面与消费侧语义（claim/退避/租约/reaper）——零触。
3. 他 test 文件（validate.ts 单文件面·neg-*.proof.ts 零触——闸语义证明面已足不重复）。
4. 迁移/依赖/锁文件——零新增零触碰。
5. SSOT 行本体（§1.3-5）与在飞支线——零触碰。

## §4 依赖与迁移号

零新依赖 · **迁移号=零**（纯测试场景面）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push/merge 主线 · Ban 产品码触（§1.3-1）· Ban 闸/断言弱化（§1.3-2/3）· Ban 清除超界（§1.3-4）· Ban SSOT 触（§1.3-5）· Ban self-approve/post-prove 代行 · Ban retry-to-green/只留绿 attempt · Ban Key 物料入树 · Ban 触 §3 全部域。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零调用零消耗）。

## §6 est live=0

本刀零模型真实外呼：api:validate/neg:all 均隔离容器进程内·零模型 Key 读用（validate.ts `:22`-`:23` 显式 delete MODEL_API_KEY 亲读）；起草 turn 全只读。`actualSpendCny=null`。

## §7 markers=0（卫生声明）

本刀改动集 2 tracked（本卷 .md+validate.ts），五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；词面不在卷内复抄避免自匹配·i6-239 proof 本体系其刀自scope 不行使·沿姊妹卷 §2/§7 形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual`（2026-10-16 EXEC 席翻面·前值 `draft:awaiting_exec` 史录于 commit `faa3ea2d`·本值为卷内三处锚定=①卷头标题行②Status 行③本节 · 卷尾不载 STOP 值 · 沿姊妹卷「自述三处实测四处」预勘误）。** 快速链开工三条款兑现记录：①协调方派单令+修法裁决 a 随单已定=**已兑现**（派单 brief 明示）；②快速链授权（沿 ssd-egress 先例·起草→自审→EXEC 同席连行使）=**已兑现**（派单 brief 明示「总时长 50 分钟」）；③⛔push（并线/推送归协调方）=**兑现**（本刀零 push 零 merge 主线）。EXEC 已落卷（§9 七字段）· post-prove 双审归协调方派席 · alone≠dual · Ban self-approve。

**停止条件（四类 · 命中即停手上报）**：
1. **现场漂移**：EXEC 面对届时 tip 重 pin——§0.1 锚漂移超 ±3 且结论受影响、或 `:312`-`:321` 场景块被他刀改写 → 停手上报。
2. **机制不满足**：若改后 api:validate 仍红且归因非本刀场景面（如闸谓词/映射语义与 §0.1 #2/#3 锚不符）→ 停手上报回炉（不得就地改定性、Ban 为绿改产品码）。
3. **越界需要**：执行中若需触 §3 任何域 → 停手上报。
4. **验收红不可修**：门矩阵任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门）。

---

## §9 EXEC 记录（2026-10-16 · 快速链 EXEC 席同席落卷 · 七字段 · STOP 翻面三处随卷）

**授权链**：协调方派单 brief（2026-10-16 · PR #109 step 99 唯一红口径指派 + 修法裁决 a 随单已定）→ 起草 `faa3ea2d`（draft:awaiting_exec）→ 窄域五项自审 PASS（P2-1 prose 勘误随 EXEC 落卷）→ **EXEC 落码+门矩阵行使（本节）**→ post-prove 双审归协调方派席（alone≠dual）。EXEC 未改 §1 归因实质/§3 边界/§5 Ban/pins。

**序1 落码**：`apps/api/test/validate.ts` `:312`/`:313` 之间按 §1-修法块**逐字节落笔**（+5/−0=3 注释+2 落码 · 隔离 DELETE 窄谓词 `owner_user_id='userA' AND status='queued'`+清零断言 · 两条红断言原文零触）· 产品码/worker 面/迁移/依赖零触（`git status --porcelain` 全程仅 validate.ts+本卷 2 tracked）。

**字段① 门矩阵全表（EXEC 时点七门实测）**：

| # | 门 | 结果 | 结论 |
|---|-----|------|------|
| 1 | api:validate | **改前红**：@`d5dc0726` `pnpm api:validate` EXIT=1 · PASS 202 / **FAIL 2**（`ABND begin → 202(预留 1.0)`+`预留后额度 -1.0` · `✗ 2 项失败`）；**改后绿**：EXIT=0 · **PASS 205 / FAIL 0**（`✓ 全部通过（真 NestJS+Fastify+类型DI 结构）`）——两红断言转 PASS+新清零断言 `ABND 前 userA queued 已清空(api-only 场景自洽·防 Q2 背压闸 429 遮蔽预留语义)` PASS（202+1=205 分母账目闭合） | **绿（红翻绿亲证）** |
| 2 | neg:all | `pnpm neg:all` EXIT=0 六段 **90/90/91/107/179/135** 全绿（恰等 queue-enqueue-bp 基线·零回退） | 绿 |
| 3 | typecheck | `pnpm turbo typecheck --force` EXIT=0「Tasks: 8 successful, 8 total / Cached: 0 cached, 8 total」 | 绿 |
| 4 | lint | `pnpm turbo lint --force` EXIT=0「Tasks: 12 successful, 12 total」全 0 error·五值**恰等 pin**：web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（零警告增量） | 绿 |
| 5 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0「scanned **2194** managed worktree files」≤ cap 2200（基线 2193+本卷 1·余 6·与 §0.0 预期恰等） | 绿 |
| 6 | markers | 改动集五类标记词（词族运行时组装·`i6-239-gates.proof.mjs:151`-`:163` 同形）**MARKER_HITS=0**（四词词族 0/0/0/0+冲突标记对 0 · 改动集=validate.ts+本卷 .md） | 绿 |
| 7 | diff 面 | porcelain 恰 2 tracked=本卷 .md（起草 +131/EXEC 增补）+`validate.ts`（**+5/−0**）；`git diff HEAD -- packages/db/migrations pnpm-lock.yaml`=空（零迁移零依赖） | 绿 |

**字段② EXIT 原值**：门1 改前 `RED_EXIT=1`（stdout「✗ 2 项失败」+「ELIFECYCLE Command failed with exit code 1」）→改后 `GREEN_EXIT=0`（末行「✓ 全部通过」）·门2 `NEG_EXIT=0`（六段「条负路径用例全绿」行亲录）·门3 `TC_EXIT=0`·门4 `LINT_EXIT=0`·门5 `DOCS_EXIT=0`·门6 `MARKER_HITS=0`·门7 numstat `5  0  apps/api/test/validate.ts` 亲录。

**字段③ 改前改后 PASS 名单 diff（判别链定稿）**：only-in-pre=FAIL×2（`:315` begin 202+`:317` 预留 -1.0）；only-in-post=PASS×3（上两断言转绿+新清零断言）；其余 202 断言恒等零回退（含 `:318` 空壳 abandon 200 与 `:320` 退还——两态双 PASS=机理 §1.2「设计内语义不红」预判亲证）。改前红=单 attempt 全量落档非 stash 取证（本刀改前树=基线 tip 零修法面·红即基线红·Ban 只留绿 attempt 遵守）。

**字段④ diff numstat（两 commit 合计）**：commit1 `faa3ea2d`=本卷 .md **+131/−0**（docs-only 起草）；commit2（本 commit）=本卷 .md（STOP 翻面三处+§1-修法/§2 勘误+§9 append）+`apps/api/test/validate.ts` **+5/−0**。零他 tracked 路径。

**字段⑤ 重 pin（EXEC 时点）**：基线 tip `d5dc0726`=origin/feat/mysql-schema-skeleton 恰等（EXEC 面零并线需求——起草 EXEC 同席同树·无他波并线介入）；§0.1 #2/#3 闸面锚 blob **恒等零漂**（`c69c03a3`/`cf23ed37` EXEC 落码前后亲算同值=产品码零触机证）；#1 validate.ts 起草锚 `256a754a`（690 行）→落码后 `e54ae969`（695 行·漂移源=本刀自身落码·`:312` 插入点前界行锚不变·`:313`-`:321` ABND 块顺移 +5 至 `:318`-`:326`·断言文本逐字节不变）。【nail 并线注记 2026-10-16 Q2-VALIDATE-SCENE-FIX nail 席（append 注记形·本行原文零字节改）：nail 届树并线 merge --no-ff origin/feat/mysql-schema-skeleton@`f7caa206`（uuid-id-check nail 波 tip）落卷·**merge-base=`f7caa206`**·**三锚文件零触已验**=validate.ts（merge 后对支线 EXEC 头 `cae839cb` diff 空=支线版本恒等保全）+interview-jobs.ts/interview.service.ts（merge 后对 `f7caa206` diff 空=origin 版本恒等保全·incoming uuid-id-check 触面与本刀触面零交叠）·两向独立亲证】

**字段⑥ 偏离清单**：①**P2-1（自审席勘误·随 EXEC 落卷）**：起草 §1-修法 prose「恰 4 行」与其下方 5 行块自相矛盾（3 注释+2 落码=5 行）——落码按**块文本**逐字节行使（块为准），prose 勘正「恰 5 行」+§2 门7 「+4/−0」→「+5/−0」随本卷 EXEC 增补落卷（非修法实质变更·代码与起草块逐字节一致）。②`RL_SHARED_DEGRADED reason=pg_error fallback=fail_open`（neg:all 运行中一行 stderr·共享限流表在隔离容器缺表退化进程内·基线同形既有行为·零断言影响）。③其余零偏离（§3 边界全守住·SSOT 零触·产品码零触·零 retry-to-green——改前红改后绿各恰 1 attempt 全量落档 /tmp 落档随报告）。

### §9-B STOP 翻面

`draft:awaiting_exec` → **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 席·三处锚定同步翻面=①卷头标题行②Status 行③§8 节·前值史录 `faa3ea2d`）。post-prove 双审+并线/推送（⛔push 未犯）+批表/SSOT 行翻面权全归协调方。est live=0（全程隔离容器/进程内·零模型外呼·零 secrets 读用）· `actualSpendCny=null`。

### §9-C nail 席 P2 随卷注记（2026-10-16·append 注记形·§0-§9-B 上文零字洗）

- **并线注记（承 §9 字段⑤ 行尾注记）**：nail 届树并线 merge `cab05635` --no-ff 并 origin/feat/mysql-schema-skeleton@`f7caa206`·merge-base=`f7caa206`·三锚文件 validate.ts/interview-jobs.ts/interview.service.ts 零触已验（两向 diff 空亲证·详上行）。
- **分母算术勘记**：EXEC 门① 记「202+1 清零断言=205 分母账目闭合」系少计一臂——精确算术=**202（改前 PASS）+2（两条红断言红转绿）+1（新增清零断言）=205（改后 PASS）**·205 终值恒等·分母账目三臂闭合勘正·门① PASS/FAIL 终值 205/0 不变。
- **「逐字节一致」措辞对齐注记**：§1-修法「下方块文本与落码逐字节一致」与 §9 字段⑥-①「代码与起草块逐字节一致」两处「逐字节一致」精确含义=**去缩进逐字节一致**（块文本誊入 validate.ts 时行首缩进随宿主上下文适配·去缩进后字节恒等·非全文含缩进逐字节）·两处原文零字节改·本注记对齐口径·语义零变。

