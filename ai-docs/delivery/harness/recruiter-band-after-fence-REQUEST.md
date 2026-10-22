draft:awaiting_pre_exec_dual

# 撤权之后招聘方仍能看到这场的能力档

基线 `c2da2eae0a0c775526296a83b475c616fe44cc8a`。这一步只新增这份说明，不改产品代码。行号是在这棵树上打开文件看到的。

## §0

基线 `c2da2eae0a0c775526296a83b475c616fe44cc8a`。招聘方详情把 `gateway_b_qualitative_projection` 的 strong / mid / weak / insufficient 计成能力档。面试进入隐私围栏之后，这些档仍然计入这场。围栏行的 owner 是候选人，也就是评分卡的 owner，不是招聘方 principal。这一点不写清，修法会落空。

### 0.1 服务把计数收成档

`apps/api/src/modules/recruiter/recruiter.service.ts` 的 `qualitative`（:112）。

- :116-120 先确认申请属于这个岗位、这个招聘方。
- :125 调用 `gateway_b_qualitative_projection($1,$2)`，参数是招聘方 principal 和申请 id。
- :128-130 函数 0 行就 404。
- :132-133 未同意时 `dimensions` 为空，仍返回 `terminalKind`。
- :135-145 把 `strong_count` / `mid_count` / `weak_count` / `insufficient_count` 大于 0 收成 `strong` / `mid` / `weak` / `insufficient`。:146 这些档进响应。响应里没有数字分。

事务在 `packages/db/src/principal.ts` 的 `asPrincipal`（:1004）。:1007 `BEGIN`，:1008 `SET LOCAL ROLE app_role`，:1009 `set_config('app.principal_user', 招聘方, true)`。第三个参数 true 表示只在本事务有效。调用投影函数时，principal 已经是招聘方。

### 0.2 投影函数不看隐私围栏

函数在 `packages/db/migrations/0160_b_qualitative_projection.sql`（:39-113）。`SECURITY DEFINER` 在 :46，`search_path` 在 :47。镜像在 `packages/db/sql/23_api_gateway.sql`（:591-665），同一处关键字在 :598。两边现在的函数体加授权与 :115-116、:667-668 对齐。

- :57-66（镜像 :609 起）按招聘方和申请取出 `v_owner`（候选人）和 `v_interview_id`。
- :74-78 同意只看候选人的 `b_qualitative_share`。
- :86-90 先返回标记行。未同意就返回，没有维度行。
- :91-111（镜像 :643-663）才数档。:99-101（镜像 :651-653）只按 `cc.owner_user_id = v_owner`、`cc.interview_id = v_interview_id`，并排除 `score_card.status` 属于 `superseded` 或 `fenced` 的卡。

这里的 `fenced` 是卡状态，不是隐私围栏。函数正文没有 `interview_privacy_active`，也没有 `interview_privacy_fenced_targets`。卡仍是 `practice_eligible` 或 `b_review_eligible` 时，撤权后的这场仍被数进档。

### 0.3 两条围栏函数看见的是谁

现行 `interview_privacy_active` 在 `packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql`（:88-112）。它是 `SECURITY DEFINER`，owner 是 `privacy_api_owner`。

- :93 principal 取 `current_setting('app.principal_user', true)`，就是事务里已经设好的那个值。
- :97 `pg_advisory_xact_lock`。`packages/db/migrations/0206_interview_privacy_active_read_tier.sql` :3-8 写明：读路径不要用这把锁；准入路径才继续用它。
- :99-102 要求 `interview.owner_user_id = principal`。找不到就直接 `RETURN false`，后面的围栏查询不会执行。
- :104-111 才查 `privacy_checkpoint_target`，并且 `pt.owner_user_id = principal`。

招聘方不是这场面试的 owner。在招聘方事务里调用它，:99-102 就返回 false，函数没有看见候选人的围栏行。把这个 false 当成「不要计入」，没有围栏的场次也会被丢掉。

`interview_privacy_fenced_targets` 在 `0206_interview_privacy_active_read_tier.sql`（:43-57）。同样是 `SECURITY DEFINER`，owner 同样是 `privacy_api_owner`。

- :48 同样读取当前 principal。:50 principal 为空就直接返回，一行都没有。
- :52-56 只返回 `pt.owner_user_id = principal` 的 `thread_id`。

`privacy_checkpoint_target` 开了 `FORCE ROW LEVEL SECURITY`（`packages/db/migrations/0048_checkpoint_physical_erasure.sql` :55-56）。给 `privacy_api_owner` 的策略是 `owner_user_id = current_setting('app.principal_user', true)`（:114-118）。函数体里的谓词和策略是同一把钥匙。

围栏不是按招聘方建的。活路径 `interview_projection_begin_erasure`（`packages/db/migrations/0096_int_transcript_remaining_sinks.sql` :323）在 :427-428 把当时的 principal 写入 `privacy_checkpoint_target.owner_user_id`，:433-434 把申请收成 `fenced`。调用时的 principal 是候选人。旧入口 `privacy_begin_checkpoint_erasure` 也是把当时的 principal 写入 owner（`packages/db/migrations/0058_interview_privacy_queue_fence.sql` :212）。那条入口对 `app_role` 的执行权已在 `packages/db/migrations/0075_privacy_erasure_authorization_pause.sql` :16 撤掉，`0096` :227 又写了一遍；`packages/db/migrations/0144_db_trigfam_unify.sql` :805-806 写明它不是活路径。

所以：招聘方会话里调用「当前用户的围栏名单」，`interview_privacy_fenced_targets` 只看见招聘方自己的围栏。候选人名下的这场不在里面，名单是空的，档照旧计入。先把 principal 换成卡的 owner，再调用它，返回的 `thread_id` 才是这场不该计入的围栏。

`interview_privacy_active_read`（`0206` :13-35）和权威函数一样，先要求面试 owner 等于当前 principal（:22-25）。招聘方 principal 下它也到不了围栏行。这次不要改用它。

### 0.4 详情页只是把已经返回的档画出来

`apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx` 在申请已是 `assessment_unavailable` 时读取定性接口（:89-94）。:160 维度数量等于 0 时走现有的空档文案。:162-169 维度数量大于 0 时按档画徽。页面不决定这场算不算。

候选人列表的分数在查询里就是 `NULL`（`packages/db/src/recruiting/recruiter.ts` :300）。这份详情不读在职简历正文。这两件事不在这次。

`packages/ai-runtime/src/qa-tool-layer.ts` :134-143 也调用同一个生产函数。排除必须做在函数里，调用方才一起生效。不要在工具层再写一条查询。

## §1

只改投影函数：这场面试已经进入隐私围栏时，不再为它产出维度计数。未进入围栏的场次，行集与现在一致。未同意时的那一行也不要变。

### 1.1 新迁移换函数体，不改旧文件

`0160_b_qualitative_projection.sql` 一个字节都不要改。目录里最近一次换已有网关函数，是 `packages/db/migrations/0168_gateway_auth_email_normalize.sql`。按它 :1-13 的做法：

- 新文件用下一个空号。现在最大号是 `0214_interview_event_statement_notify.sql`，所以文件名是 `packages/db/migrations/0215_gateway_b_qualitative_fence.sql`。不要复用 `0160`。`scripts/check-migration-version-uniqueness.mjs` :46 只豁免 `0143`、`0152`、`0160`，新号不能再占。
- 同签名 `CREATE OR REPLACE`。出参仍是现在这 7 列，不加工数字分列，避免返回类型变化。
- 重新写上 `SECURITY DEFINER` 和 `SET search_path = pg_catalog, public`。
- 文件里有 `SET LOCAL lock_timeout = '2s'`。不要写顶层 `BEGIN` / `COMMIT`。
- 授权自包含：`REVOKE ALL ... FROM PUBLIC, app_role, app_gateway_role`，再 `GRANT EXECUTE ... TO app_role`。
- 镜像只改 `packages/db/sql/23_api_gateway.sql` 里已有的这一段函数。从 `CREATE OR REPLACE FUNCTION gateway_b_qualitative_projection` 到 `GRANT EXECUTE ON FUNCTION gateway_b_qualitative_projection(text, text) TO app_role;` 与新迁移逐字节相同。不要另开一份带号的 sql。比较范围与 `apps/api/test/i2b.proof.ts` :171 的正则相同。

`scripts/ai-docs/public-text-policy.mjs` :133 的上限已是 `2_328`，:39 把 `.sql` 算进受管文件，:344 按文件数拒绝超出的扫描。这份说明是 1 个新的受管文件。执行时再写出那份迁移，扫描再加 1。不要改这个上限，也不要改 :344 的比较。

### 1.2 函数里怎么排除

在 :88-90 的未同意返回之后、:91 的维度查询之前，增加局部变量即可，不改参数。

1. 记下当前 principal。此时它是招聘方。
2. `set_config('app.principal_user', v_owner, true)`。`v_owner` 是 :57 取出的候选人，也是卡的 owner。第三个参数 true，与 `0165_invite_notify_gateway.sql` :53-54 相同。
3. 调用 `interview_privacy_fenced_targets()`，看 `v_interview_id` 是否在返回的 `thread_id` 里。状态集不要抄进这个函数，只认这个生产函数的返回。
4. 立刻 `set_config('app.principal_user', COALESCE(记下的值, ''), true)`，与 `0165` :60 相同。还原必须发生在后面的 `RETURN` 和维度查询之前，避免同一事务里剩下的语句改用候选人身份。
5. 这场在名单里：不再执行维度查询。:86-87 的标记行已经返回，`disclosed` 和 `terminal_kind` 保持原样。不要改成 0 行，否则 :130 会把详情收成 404，两态信号一起消失。
6. 这场不在名单里：维度查询保持 :91-111 的原文，包括 :101 对卡状态 `superseded` / `fenced` 的排除。

空名单时第 5 步不发生，结果与现在一致。另一场没有撤权时，它的 `interview_id` 不在名单里，维度行仍在。

不要调用 `interview_privacy_active`。招聘方 principal 下它在 :99-102 就返回 false，看不见围栏行；它还有 :97 的锁，而这次是读。不要把卡改成别的状态来凑 :101 的排除。不要改 RLS。不要给 `app_role` 加回 `privacy_begin_checkpoint_erasure` 的执行权。

服务、页面、工具层的入参和出参列都不要改。不要把数字分、简历正文、联系邮箱加进这个响应。

## §1.3

- 否决改 `packages/db/src/recruiting/recruiter.ts`。`listMyApplications` 在 :274，`startApplicationInterview` 在 :498，留给另一份说明。:300 的列表分数保持 `NULL`。
- 否决改 `apps/web/app/jobs/page.tsx`。也否决改招聘方详情页去藏档。档不该出现，是因为函数不再返回计数。
- 否决改 `apps/api/src/modules/profile/profile.service.ts`。候选人总览均分是另一份已经在写的说明。
- 否决在 `recruiter.service.ts` 或 `qa-tool-layer.ts` 里另写一条统计。两处都继续调用生产函数。
- 否决在招聘方 principal 下直接调用 `interview_privacy_fenced_targets`。那样名单是空的。
- 否决用 `interview_privacy_active` 或 `interview_privacy_active_read` 充当这次的判定。两者在招聘方 principal 下都到不了候选人的围栏行。
- 否决改 RLS，否决改 `score_card` 的状态，否决把已经可练习的卡改成别的状态。
- 否决改价格、额度、产品。合计仍是 229/271。能力项完成 33、半成 2、未收 14 维持。
- 否决改 `scripts/ai-docs/public-text-policy.mjs`。
- 否决改 `0160` 历史文件。否决新开证明文件。否决在测试里复制一条投影 SQL。

## §2

执行时跑下面这些已经有的命令。不要新造命令，也不要放宽警告上限。

1. `node scripts/run-e2e-isolated.mjs i2b:prove`。`scripts/run-e2e-isolated.mjs` :92 用参数选择目标，允许的名字里有 `i2b:prove`（:2225），:2725-2726 转到 `pnpm -C apps/api i2b:prove`。脚本在 `apps/api/package.json` :31，证明文件是 `apps/api/test/i2b.proof.ts`。根 `package.json` 没有同名脚本，不要加。

   这份证明已经调用生产函数（:276-278）和生产招聘方服务（:287、:306）。就地扩展，不要新文件。扩展加在现有断言之后（现有撤回在 :371，新断言放在 :375 之后），用新的两份申请，避免改动前面的计数断言。

   - 两场都先走现有的建申请、开始、写卡、完成。写卡状态沿 :118，目标状态是 `b_review_eligible`。题目 id 用新的，不要撞上已有的 `i2b-q-sys`、`i2b-q-algo`、`i2b-q-pend`、`i2b-q-cov`。
   - 证明末尾同意已被撤回。新断言前重新记下同一目的的同意，否则维度行本来就是空的，看不出撤权。
   - 撤权前：两场都经 :276 的生产函数读到维度行，生产服务的 `dimensions` 长度大于 0。
   - 撤权只作用于其中一场。用生产入口 `beginInterviewProjectionErasure`（`packages/db/src/transcript/int-transcript-projection.ts` :51-58，由 `packages/db/src/index.ts` :374 导出）。在候选人的 `asOwner`（`i2b.proof.ts` :72，也就是 `asPrincipal`）里调用。它执行的是 `0096` :450 授给 `app_role` 的 `interview_projection_begin_erasure`。不要调用 `privacy_begin_checkpoint_erasure`，`app_role` 已不能执行它。不要自己插入围栏表。
   - 撤权后：这一场的生产函数不再有维度行，标记行还在，`disclosed` 仍按同意，`terminal_kind` 仍在。生产服务返回 `dimensions` 长度 0，不是 404。另一场未撤权，撤权前读到的维度计数与撤权后相同。
   - 撤权不改卡状态。同一张卡在撤权前后都是 `b_review_eligible`。不要为了证明去改状态。
   - 维度计数只从生产函数或生产服务的返回里取。测试里不要写另一条按 `score_card` 聚合的 SQL。

   `I2B-0e`（:168-176）现在读的是 `0160` 文件。镜像改到新体之后，比较源改成 `0215` 那个新文件，仍是整段函数体加授权逐字节相等。不要放宽成只比几行。`0160` 文件保持原样，不再和镜像相同。

   `I2B-0a`（:152-153）仍要求最后一份迁移是 `0160_b_qualitative_projection`。目录末份已经是 `0214_interview_event_statement_notify.sql`，这条现在就不会过。不要改它的期望来换一个 0 退出码。日志里新断言必须通过。整份命令若因这条旧断言退出码为 1，那不是撤权断言失败。

2. `pnpm docs:check`。根 `package.json` :9，实际是 `node scripts/ai-docs/check-docs.mjs`。

3. `pnpm turbo typecheck --force`。

4. `pnpm turbo lint`。0 errors。警告上限保持：根 5242（`package.json` :8）、api 1423（`apps/api/package.json` :7）、domain 115（`packages/domain/package.json` :10）、ai-runtime 628（`packages/ai-runtime/package.json` :14）、worker 959（`apps/worker/package.json` :7）、db 1042（`packages/db/package.json` :11）、web 601（`apps/web/package.json` :7）、qdrant 27（`packages/qdrant-store/package.json` :11）、ai-graphs 47（`packages/ai-graphs/package.json` :10）、contracts 265（`packages/contracts/package.json` :12）、config 0（`packages/config/package.json` :8）、db-mysql 0（`packages/db-mysql/package.json` :8）。低于上限可以通过。不许放宽，也不要改这些 `--max-warnings`。

## §8

draft:awaiting_pre_exec_dual
draft:awaiting_pre_exec_dual

这一步只新增这份说明，不改产品代码。文件第一行与上面连续两行是同一句。

## §9-rev

本节逐条取代下面两处。与这两处冲突时以本节为准。没有点名的句子仍然有效。

1. 取代 §2 第 1 步这一句：「`I2B-0a`（:152-153）仍要求最后一份迁移是 `0160_b_qualitative_projection`。目录末份已经是 `0214_interview_event_statement_notify.sql`，这条现在就不会过。不要改它的期望来换一个 0 退出码。日志里新断言必须通过。整份命令若因这条旧断言退出码为 1，那不是撤权断言失败。」这一句作废。

   执行时改 `apps/api/test/i2b.proof.ts` 的 `I2B-0a`（:152-153）。`applied.applied[applied.applied.length - 1]` 的期望从 `0160_b_qualitative_projection` 改成 `0215_gateway_b_qualitative_fence`，不带 `.sql`，与原来的写法相同。断言名字里的末位一并改成这份，不再写 `0160`。新迁移落盘后，这条旧断言通过。撤权相关的新断言也通过。两者一起通过。

   命令仍是 `node scripts/run-e2e-isolated.mjs i2b:prove`。整份退出码必须为 0。不要改跑另一条命令，也不要另选一条会失败的命令来回避。退出码为 1 不可以接受。

   同一节里 `I2B-0e` 把比较源改成 `0215` 那个新文件、仍是整段函数体加授权逐字节相等，那句不在作废之列。

2. 取代 §1.2 第 2 到第 4 步只按直线还原的读法。那三步现在是：`set_config('app.principal_user', v_owner, true)`，调用 `interview_privacy_fenced_targets()`，再 `set_config('app.principal_user', COALESCE(记下的值, ''), true)`。直线上仍照这三步做。还原仍必须发生在后面的 `RETURN` 和维度查询之前。这三步没有异常路径，这个缺口作废。

   调用一旦出错，先 `set_config('app.principal_user', COALESCE(记下的值, ''), true)`，把 principal 设回原来的招聘方，然后再把同一个错误抛出去。记下的值是换身份之前的招聘方，不要在出错之后再读 `current_setting('app.principal_user', true)` 来充当招聘方。还原之前不能跑别的会按 principal 读数据的语句。换上候选人之后，只许调用 `interview_privacy_fenced_targets()` 来看 `v_interview_id` 是否在返回的 `thread_id` 里。异常路径里，还原的 `set_config` 是第一句，然后重新抛出。不要因为事务会回滚就省略这条异常路径。不要吞掉错误，也不要改成 0 行或 404。

   空名单时结果仍与现在一致。另一场没有撤权时，它的 `interview_id` 不在名单里，维度行仍在。这两句不改。

   源码里没有不看 owner 就能判断这场已围栏的现成函数。`interview_privacy_active`（`packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql` :99-102）和 `interview_privacy_active_read`（`packages/db/migrations/0206_interview_privacy_active_read_tier.sql` :22-25）都先要求 `interview.owner_user_id` 等于当前 principal，对不上就返回 false。`interview_privacy_fenced_targets`（同文件 :55）只返回 `pt.owner_user_id` 等于当前 principal 的 `thread_id`。`assert_interview_privacy_active` 转调 `interview_privacy_active`。`interview_event_stream_privacy_active` 先要求 principal 等于传入的 owner。`assert_checkpoint_privacy_fence` 在 `pt.owner_user_id` 等于当前 principal 时才认目标。`assert_checkpoint_enrollment_not_privacy_fenced`（`0076` :74）比较 `pt.owner_user_id` 与 `NEW.owner_user_id`，而且 :83 没有把执行权交给 `app_role`。因此不要改成不换 principal。仍临时换成 `v_owner`，并补上上面的异常还原。

仍然保持：不改 `0160_b_qualitative_projection.sql` 的任何字节。新迁移号仍是 `0215`，文件是 `packages/db/migrations/0215_gateway_b_qualitative_fence.sql`。镜像 `packages/db/sql/23_api_gateway.sql` 里从 `CREATE OR REPLACE FUNCTION gateway_b_qualitative_projection` 到 `GRANT EXECUTE ON FUNCTION gateway_b_qualitative_projection(text, text) TO app_role;` 与新迁移逐字节相同。不改 `packages/db/src/recruiting/recruiter.ts` 的 `listMyApplications` 与 `startApplicationInterview`。不改 `apps/web/app/jobs/page.tsx`。不改 `apps/api/src/modules/profile/profile.service.ts`。不改价格。不改上限 `2_328`。合计仍是 229/271。能力项 33/2/14 维持。
