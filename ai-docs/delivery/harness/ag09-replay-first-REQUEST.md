# AG09-REPLAY-FIRST REQUEST（AG-09 重放稳定性刀——succeeded 可回放结果先于 digest 墙·「成功后崩溃→重放误杀」最小收口·迁移 0209+新 proof 五臂·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-16 落卷·**rev1**=pre-exec 双审两席 FAIL 收敛 P0×1/P1×2/P2 批量全数处置（§9-rev 逐条落卷）·rev 后重派双审第二轮·est live=0·Ban self-approve·alone≠dual·⛔push·Dual PASS≠开工·开工授权权归协调方）

**席位**：AG 能力复核台账下一刀起草席（done 29/half 2/open 17·按 P1>P2>P3·同级别编号序选标 **AG-09**=P2 open 最小号·协调方派单·北星 loop）。
**基线**：`origin/feat/mysql-schema-skeleton` @ `2eaf387ed`（`git fetch` 后 `git rev-parse` 亲证=`2eaf387ed1a2a0b22ce542d653bcd7fa0d905334`·派单下界「tip≥2eaf387ed」**恰等成立**）。分支 `line/ag-next-draft`·工作树 `meetwise-agnext`（仓根同级·`git worktree add ../meetwise-agnext -b line/ag-next-draft origin/feat/mysql-schema-skeleton` 本席亲立·直接落 origin tip 零 reset；`-b` 成功即分支建前不存在的机证）。
**立项出处（三层蓝本·不自建 SSOT 行——issues-final AG-09 行翻面与 LEDGER 刀位图翻面权归协调方/卷主）**：①`issues-final.md` AG-09 `:148-156`（P2·编排运行时·判词「重放时 request digest 不稳定……idempotency_key_payload_mismatch 终态，把可恢复的崩溃变成整场失败」·触发例「出题成功后、checkpoint 写入前 worker 被杀……digest 变了→payload_mismatch→整场 generation_unavailable」·修法两肢「把检索拆成独立节点……；**或者**对 succeeded 的同逻辑节点优先回放已有结果，不再比较 digest」——本刀取第二肢最小面）；②`ag-cost5-REQUEST.md`（blob `3bd9d87a`）#16 行「0130 :163-164 **墙一**·比对先于一切状态臂含 :206-217 expired-claimed 重领」+`:99` 裁决③(b)「墙一归一化改形**判归 AG-09 联动刀**（issues-final :147-156 修法领地）·随卷登记承接关系」+`:116`「AG-09 修法面（检索拆节点/优先回放）零触」=**本刀即该承接待启刀**；③`execution-master-checklist.md` `:2702` STILL OPEN ③「**AG-09 联动刀**（墙一 digest 归一化·裁决③(b) 承接面）」在案。

## §0 现状锚（起草席亲读·base `2eaf387ed`·file:line/blob 逐条 rg/sed/Read/git rev-parse 实测复核·**EXEC 立项照本节对届时 tip 全量重 pin**——漂移如实改锚·结论不变则只更行号）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：建后 4 树实测（主仓/本席 meetwise-agnext/deploy-check-harden/batch-flip-3rows）——**零 ag09 树**（rev1 勘误②：rev 时点复测 **5 树**·新增 `meetwise-flip7`/`line/batch-flip-7rows`·零 ag09 树复证）。
- `git branch -a | grep ag09` EXIT=1——**零同名支线**；`ls ai-docs/delivery/harness/ | grep -i ag09` EXIT=1——**零同名刀卷**。→ 停止条件未触发·可落卷。
- 在飞交叠：`git log --all --oneline --grep="AG-09"` 恰 3 笔全 docs（AG-COST5 收官随翻/EXEC 落卷/REQUEST 起草·零修码笔）——**AG-09 无在飞修复刀**（rev1 勘误③：rev 时点复测恰 **4** 笔全 docs·增本卷起草笔 `365aadaa1`·仍零修码笔零在飞修复刀）；本席四文件修法面（0130/invoke/model-client/两 proof）对两在飞支线（deploy-check-harden/batch-flip-3rows）`git diff HEAD...支线 --name-only` 零交集亲证。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 @`2eaf387ed`）

| 文件 | blob（全 40 hex） | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0130_model_invocation_same_key_claim_join.sql` | `239a0b19aea47d160d4300144d3a7b283d85187a`（对 ag-cost5 REQUEST #16 行锚 `239a0b19aea4` **恒等亲证**） | **历史定义·非现行**（rev1 正名：0181 `:176` DROP 16 参升 17 参·0184 `:218` DROP 17 参升 19 参——现行权威体=0184·本行行锚仅供 issues-final 引值零漂对表）·`:22-49` 16 参签名（LANGUAGE plpgsql/SECURITY DEFINER/`SET search_path = public, pg_temp`）·`:82-122` 行锁/permit 建行环·`:124-152` created+logical node header 首认·`:154-162` NOT FOUND→wait·**:163-166 墙一**（`invocation.request_digest <> p_request_digest → 'failed' idempotency_key_payload_mismatch`·**先于一切状态臂**）·`:167-170` cost_scope 墙二·**:171-178 succeeded 臂**（`:172` replayable→`cached` 回放 output/`:175` 敏感→`sensitive_result_replay_requires_artifact`）·`:179-181` failed·`:183-185` unknown·`:187-189` dispatching→wait·`:191-193` logical_node mismatch·`:195-202` header 重注册·`:203-223` expired-claimed 重领→execute·`:227-228` REVOKE/GRANT 镜像——**issues-final 引值 `0130:163-164` 对现树恰等零漂** |
| `packages/db/migrations/0181_ag19_prompt_version_column.sql` | `617f65be5e17b313578f235776d865913e32b071` | **17 参先例（升参 DROP+CREATE 形）**：`:173-175` 原注「CREATE OR REPLACE 不能改参数个数，故 DROP 旧 16 参签名再建 17 参（0119 :175-196 同形；body=0130 当前权威版逐字承继·仅 validation 一行 + INSERT 列集一处 additive）」·`:176` DROP+**:178 CREATE 17 参**·`:385-386` REVOKE/GRANT 17 参签名同步重发（**GRANT `:386`**） |
| `packages/db/migrations/0184_ag12_estimator_claim_freeze.sql` | `5a89d95d0b6c779e594a875583562eab9731ce45` | **现行权威体（本刀 0209 基体）**：`:211-214` 原注「17→19 参·DROP 旧 17 参签名再建 19 参（0181 :177-178 先例同形；body=0181 当前权威版逐字承继，仅 validation 两行 + INSERT 列集一处 additive）」·`:218` DROP 17 参+**:219-240 CREATE 19 参**（`p_estimator_version`/`p_calibration_factor_version` 尾两参）·validation 三行 **`:261-263`**（prompt_version/estimator/calibration）·claim INSERT 列集 `:307-308`/`:312-313`·**:368-369 墙一**·`:372-374` cost_scope 墙二·**:376-381 succeeded 臂**（`:378` replayable→`cached`/`:380` 敏感）·`:384-386` failed·`:388-390` unknown·`:392-394` dispatching→wait·`:396-398` logical_node mismatch·`:400-403` header 重注册·`:408-427` expired-claimed 重领→execute·REVOKE/GRANT **`:434-435` 十九参签名原文**（**GRANT `:435`**·rev 席机证：清单所引 `:436` 系空行偏一·如实改锚）——**0184 后零迁移再触本函数（0185-0208 grep 亲证）·体对 0130 `:44-225` diff 恰=validation 三行+INSERT 列集两处 additive（逐字 diff 亲证·臂序全等）** |
| `packages/db/src/model-op/model-invocation.ts` | `baf09cc490d81ff6a804a367392e0035ecf745a3` | **`:107` `$1..$19` 调用面**（`:118-121` 三观测参尾序 promptVersion/estimatorVersion/calibrationFactorVersion）——16 参 overload 即调用面失配 SQL 报错显形 |
| `packages/ai-runtime/src/model-client.ts` | `61471ed4156873b8a1154161e138b8a317c40384` | `:1130-1172` `modelFor`·**:1133-1152** digest 构成（service/system/userData/images/**rag `:1138`**/temperature `:1140`/**costPolicy 十二字段含 priceRevision `:1144-1151`**——rev1 勘误①：十一→**十二**字段·`:1145-1150` 亲数=scopeId/provider/model/region/priceRevision/maxInputTokens/maxOutputTokens/contextWindowTokens/contextEstimator/contextSafetyMarginTokens/contextToolReserveTokens/imageInputTokensPerImage）·`:1137` 注释「rag 也进 digest……否则会被幂等层误判为重放而返回旧结果」·`:1141-1143` 注释「makes a model/price configuration change non-replayable」（rev1 归属登记：英文 fence 自 `fc472d970` digest 构成同源笔起逐字恒等·行漂 129→372→1141 `git log -L` 亲证·非后继刀新增）——**两 fence 注释在案=§1.3 否决乙的定谳依据** |
| `packages/ai-runtime/src/invoke.ts` | `44340f3988ce5cbf1ce5013e24e5810d529b2350` | **`:794`** `claim.action === 'cached'` → `return { terminal: true, outcome: { value: claim.output } }`（**回放机制已具形·零 TS 改动承重锚**）·`:795` failed/unknown → `deterministic_refusal` 终态 |
| `apps/worker/src/adaptive-interview-service.ts` | `84b3e58457543037399af35c0ee597381bc6bb24` | `:35-42` 刀 F 四类 re-roll 族边界注释（「同键重掷=缓存回放同错……同 revision 异键=0088 canonical mismatch **两死面**」「族外失败原形判死零位移」——payload_mismatch 系族外）·`:598-609` 刀 D 裁决③ seam：**仅 `isAdmissionRefusalRetryable` 族带码抛出中止节点**·`:604-605` 「确定性配置拒绝……不在族内——原样返回走既有判死链（retry 必败不放大）」=payload_mismatch 走判死链的现状锚 |
| `packages/ai-runtime/test/ag-d-admission.proof.ts` | `9bc8d6836a6fd5d7fbcb58c28c080fca559f9e0b` | `:236-238` 负臂「succeeded cached 重放原样（0130:171-173）」·**:242-248 负臂「payload digest mismatch 恒 failed 原样（0130:163-169）」=succeeded 行漂移重放断言 mismatch（本刀 0209 后该臂必翻·件②重钉面）** |
| `packages/ai-runtime/test/model-cost-governance.proof.ts` | `3c33a3179d49d3fa45ef8024a56b162003e4845b` | **`:70-80` 臂「同一逻辑 key 的价格 revision 改变时 durable claim 拒绝复用，零第二次外呼」=succeeded 行价改漂移断言 mismatch（0209 后同翻·件②重钉面）**——价改 fence 的**新派发**禁面在臂 8/9（header 等值+expired-claimed 重领）·0209 零触 |
| `packages/ai-runtime/test/claim-join-orphan.proof.ts` | `d9a262efb64d4aa5535a5441dac937b4672e451b` | 并发 claim/orphan 环（created 建行路径·0209 零触回归面） |
| `apps/worker/test/ag-e-report.proof.ts` | `38b10f96bdfc89fbc9399b0d0c57c04803426aad` | `:379` 静态断言 `migration0130.includes('idempotency_key_payload_mismatch')`——0130 历史文件零字节故恒绿（新迁移不触此静态门） |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `d0a6db8b6c0da30090abb9b2914efffc973e8d56` | AG-09 `:148-156`（判词/触发例/修法两肢原文）——只读蓝本 |
| `ai-docs/delivery/harness/ag-cost5-REQUEST.md` | `3bd9d87a2900c21c421d3e6ec79d4a01cc671207` | #16 行/:77 墙一登记/:99 裁决③(b) 承接判归/:116 §8 承接登记——承接关系 SSOT |
| `scripts/ai-docs/public-text-policy.mjs` | `056d645947f613269f2824595e522bb7a7819321` | `:118` `MAX_FILES = 2_264`（cap 现值·`414762fe0` 步进届值） |

### 0.2 判词复核定谳（起草席四读码面·**成立维持·未被近期刀顺带修复**）

1. **digest 构成面**：`modelFor`（model-client.ts `:1133-1152`）digest 仍含 rag（web/深检索素材入 rag 字段）、system（prompt 文本）、costPolicy（含 priceRevision）——`git log -L` 亲证 digest 语义自 `fc472d970`（2026-08-18）以降恒等·仅注释演化（`:1137`/`:1139`）。**issues-final 判词第一半逐字成立**。
2. **墙一比较序面**：0130 `:163-164` digest 不等→`failed idempotency_key_payload_mismatch` **先于** `:171` succeeded 可回放臂（含先于 `:203-217` expired-claimed 重领）——**判词第二半逐字成立**（行号恰等 issues-final 引值）。成功后崩溃重放、digest 因检索素材/prompt/价版漂移 → 撞墙一 → 终态 mismatch。
3. **消费面**：invoke.ts `:795` failed→`deterministic_refusal` 终态；adaptive-interview-service.ts `:604-609` payload_mismatch 非准入族→原样返回走既有判死链→generation_unavailable 终场。**触发例链路亲证成立**。
4. **未被顺带修复**：刀 D（准入去终态化）只放行六码准入族；刀 F（re-roll）族边界注释自认 mismatch 两死面在族外；刀 ⑤（AG-08）裁决③(b) 明示墙一归一化判归 AG-09 联动刀不越权——三刀均零触本面。**选标有效·停止条件「标的已修复」未触发**。
5. **行号漂移登记（注记级）**：issues-final 引 `model-client.ts:530-553`→现树 `:1131-1152`、`adaptive-interview-service.ts:118-162`→现树 `:564-609`（TOKSTREAM/刀 B/刀 D 演进·blob 史证语义恒等）·`0130:163-164` 恰等零漂。

## §1 修法（issues-final AG-09 修法第二肢最小面·零 TS 产品码·恰 1 新迁移）

### 件① `packages/db/migrations/0209_ag09_succeeded_replay_before_digest_wall.sql`

**基体=0184 现行权威 19 参体逐字承继**（rev1 P0 正基：claim 函数现行权威体系 **0184** `:219-240` **19 参签名**——升参链=0088 原设→0119 15→16 参→0130 16 参同签名 REPLACE→0181 16→17 参+`p_prompt_version`→**0184 DROP 17 参 `:218` CREATE 19 参**+`p_estimator_version`/`p_calibration_factor_version` 两冻结列·0130 16 参系**历史定义非现行**·0184 后零迁移再触本函数 grep 亲证）：`CREATE OR REPLACE FUNCTION ai_model_claim_invocation_scoped(...)` **同 19 参签名/同 LANGUAGE plpgsql/SECURITY DEFINER/同 `SET search_path = public, pg_temp`**，**零 DROP**（同签名 REPLACE 合法先例=**0119→0130 十六参同签名 CREATE OR REPLACE**——0130 对 0119 :177-196 所建 16 参体零 DROP 直接 REPLACE·ACL 论断=**0204 `:27`「RETURNS TABLE 零变=REPLACE 合法零 DROP·ACL 随 OR REPLACE 保留」**；rev1 P1 正先例：原卷所引 0174/0200 全文零触 `ai_model_claim_invocation_scoped` grep 亲证·引用撤）。**Ban 16 参 overload 双存**：照旧卷 16 参施工即与 live 19 参体双存=违 **0204 `:33/:177/:258`「禁 overload 双存沿 0188 先例」铁律**+修法 no-op（手术落 16 参死体·live 体墙序原样）+ag12-estimator-freeze proof `:232-234`（恰一 overload `pronargs=19` 哨兵）破损——三点即本 rev P0 定谳，0209 一律同 19 参。函数体=0184 `:244-429` **逐字承继**（含 prompt_version/estimator/calibration validation 三行 `:261-263`+claim INSERT 列集 `:307-308`/`:312-313`，全臂零删零增零改写），**恰一序变更：将 0184 `:376-381`「succeeded ∧ replayable → cached（回放 invocation.output）」臂上提至墙一（0184 `:368-369`）之前**；原 succeeded 臂位保留敏感半（到达原位即 `succeeded ∧ NOT replayable` → `sensitive_result_replay_requires_artifact`）；其余臂序零字节（cost_scope 墙二 `:372-374`/failed `:384-386`/unknown `:388-390`/dispatching `:392-394`/logical_node `:396-398`/expired-claimed 重领 `:408-427` 全原位原值）。语义矩阵（五行·proof 逐行机证·首两行为 hoist 面）：

| 行状态 | digest/cost_scope/logical_node | 0184 现行为 | 0209 后 |
|---|---|---|---|
| succeeded ∧ replayable | digest 漂移 | mismatch 终态（**AG-09 误杀**） | **cached 回放·零二次外呼·零新结算**（`invoke.ts:794` 既有机制） |
| succeeded ∧ replayable | logical_node 漂移 | digest 恒等=cached（`:376` 臂先于 `:396` 墙）/digest 漂移=mismatch（`:368` 墙一先至） | **cached**（rev1 补第五行：hoist 臂先于两墙·`:396` logical_node 墙不可达·digest 两向并 cached） |
| succeeded ∧ NOT replayable（敏感） | 漂移/恒等 | mismatch / sensitive 拒 | **原值零变**（敏感 fence 零动·hoist 臂条件不含非回放行） |
| claimed(过期)/dispatching/failed/unknown | 漂移 | mismatch 等既有臂 | **原值零变**（墙一非终态面+expired-claimed 重领面维持=刀 D/⑤ 零回归） |
| created 建行路径 | — | execute | 原值零变 |

+ 头注 AG-09 出处两行 + 尾部 `REVOKE ALL ... FROM PUBLIC, app_role; GRANT EXECUTE ... TO app_role;` **镜像 0184 `:434-435` 十九参签名原文两行**（同签名 REPLACE 下 ACL 本随 OR REPLACE 保留=0204 `:27` 论断·0209 仍随发原文两行为显式纪律·幂等零害·ag12-estimator-freeze proof `:320/:338-343` GRANT 纪律+0184 机械钉断言零漂）。

### 件② proof：新 `packages/ai-runtime/test/ag09-replay-first.proof.ts`（隔离库真迁移链·沿 model-op02 形）五臂

- **A（承重·触发例直证）**：出题 succeed 后同键漂移 digest 重放 → `cached` 原值·零二次外呼·结算零新行（崩溃恢复不再误杀）。
- **B**：敏感 succeeded（replayable=false）漂移重放 → `idempotency_key_payload_mismatch` 原值（敏感 fence）。
- **C**：claimed+lease 过期行漂移重放 → mismatch 原值·expired-claimed 重领不达（墙一非终态面维持）。
- **D**：failed 行漂移重放 → 原错误码原值。
- **E**：succeeded∧replayable + cost_scope 漂移 → cached（裁决项①行使面·两案并陈推荐形）。

### 件③ 两既有臂重钉（test-only·§1-件②随刀必翻面预申明）

- `ag-d-admission.proof.ts` `:242-248`：mismatch 负臂改从**非终态行**断言（先造 failed 终态行→漂移重放→mismatch 恒然）·臂注 0130:163-169→「0209 后墙一收窄至非 succeeded∧replayable 行·succeeded 可回放漂移=cached 归 AG-09」。
- `model-cost-governance.proof.ts` `:70-80`：同形重钉（价改 fence 对**新派发**面=臂 8/9 未触·断言改走 failed 行·原 billing 意图注释保留）。

### 件④ 注册 additive 四面

`packages/ai-runtime/package.json` +`"prove:ag09-replay-first"`；root `package.json` +`"ag09-replay-first:prove"`/`"ag09-replay-first:prove:raw"`（run-e2e-isolated 包裹形）；`scripts/run-e2e-isolated.mjs` 四触点（`:392` 文件列表/`:2183` 门列表/`:2400` 派发臂/`:3141` 列表尾 append·沿 ag-d-admission 同形）。

### §1.2 触面矩阵

恰 **8 tracked**：新迁移 1+新 proof 1+既有 proof 重钉 2+package.json 2+run-e2e-isolated 1+本卷 1——**零 TS 产品码·零历史迁移（0001-0208 零字节）·零 app/worker 产品触**。

### §1.3 否决（五面）

- **甲=修法①「检索拆独立节点」**：图拓扑重构（ai-graphs state schema+ask/report 双路）·量级大·issues-final 明示「或者」两肢任选·最小面取第二肢·拆节点留后继产品刀。
- **乙=digest 剔除 rag/prompt/costPolicy**：反转 `:1137`/`:1141-1143` 两注释在案的 deliberate fence（同键换素材会误判重放返回旧结果/价改可静默回放）·正确性危害·Ban。
- **丙=全量墙一归一化（预绑定对白名单比较归一）**：ag-cost5 §97(a) 定谳「identity 语义手术·须双审明示」·系 AG-08 failover 承接面非本刀最小收口·留独立裁决。
- **丁=消费端 payload_mismatch 白名单重试**：同键必复撞同墙（0130 行 digest 已冻结）=retry 必败放大·service `:41` 既有裁量原值·Ban。
- **戊=直改 0130 历史迁移**：历史迁移零字节铁律·0209 镜像形行使。

## §2 门矩阵（EXEC 立项届树亲跑·每 prove 恰 1 次到裁决）

①`ag09-replay-first:prove` EXIT=0（五臂全绿）；②`ag-d-admission:prove` EXIT=0（重钉后 ai-runtime+worker 双 proof 全绿·其余臂原值）；③`model-cost-governance:prove` EXIT=0（重钉后原值余臂）；④`claim-join-orphan:prove` EXIT=0 原值；⑤`migrate:prove` EXIT=0 链 **209** 头 **0209**；⑥`check-migration-version-uniqueness` violations=0；⑦`turbo typecheck` 8/8 0 cached；⑧`turbo lint --force` 12/12 0 cached 五值恰等；⑨`docs:check` ≤2264（起草树亲测 **2257**·+本卷=2258·余 6）；⑩markers 改动集五类标记词+行首冲突标记 0 命中亲跑；⑪`git diff --stat` 恰 8 tracked；⑫`ag12-estimator-freeze:prove` EXIT=0（**恰一 overload `pronargs=19` 哨兵** proof `:232-234` `pron.rows.length===1 && pronargs===19`+GRANT 纪律 `:320-328`+0184 机械钉 `:338-343` 全原值——0209 同 19 参签名 REPLACE 零 DROP 故零漂·**16 参 overload 双存即此门红**=P0 防线）；⑬`ag19-prompt-version:prove` EXIT=0（DB 臂对 0209 后 live 体回归原值+0181 文件机械钉 `:279-286` 零触——席 2 建议并增·酌情行使）。

## §3 裁决项（三件·两案并陈处标推荐）

1. **cost_scope 轴语义追认**：件①上提形下 succeeded∧replayable 行 scope 漂移由 mismatch 改 cached（已结算行回放零新费用·bill 语义无新敞口）。**推荐行使上提形**；协裁维持原状则 **hoist 臂内联 cost_scope 等值谓词**（rev1 改述：hoist 臂形改 `succeeded ∧ replayable ∧ cost_scope_id IS NOT DISTINCT FROM p_cost_scope_id → cached`·0184 cost_scope 墙 `:372-374` 原位维持先于后续臂·scope 漂移仍 mismatch·仅 digest 轴先判·**臂 E 撤**=proof 五臂改四臂）。同轴两案并陈（上提形语义后果如实登记）：**unbilled→billed 回放方向**（原行 cost_scope NULL·重放携非空 scope——上提形=hoist 臂先于 cost_scope 墙 → cached·零 reserve/零 settle 取回放值；内联形=落 `:372-374` 墙仍 mismatch 原值）+**重放方零记账缝**（cached 回放 `invoke.ts:794` 直返 terminal 全程零 reserve/零 settle——原行 billed 与否重放方均零新记账行·两形同然·系既有 cached 语义非新敞口·随裁决①一并登记）。
2. **残余面归属**：非终态行（claimed 过期重领）digest 漂移墙一维持+预绑定对归一化（ag-cost5 承接）+**completion 提交前击杀窗**（rev1 点名：模型调用已返、终态 claim 未提交即 worker 被杀——行留 `dispatching`：digest 恒等重放=`wait` 直至 `:408-427` expired-claimed 重领二次执行·digest 漂移重放=墙一 mismatch·两向均非本刀 cached 回放面）=**后继刀处置**·本刀不越权；issues-final AG-09 行按残余面如实翻半或留开·翻面权归协调方。
3. **两既有臂重钉授权**：件③ 触两刀在卷 proof 文件（ag-d/model-cost-governance）·沿 ag-cost5 op02 carve-out 改写收据先例预申明。

## §5 Ban 面

历史迁移 0001-0208 零字节；model-client digest 构成/流式面（completeStream·AG-14 后继面）零触；0088 canonical/logical_node 墙与敏感回放 fence 零弱化；0179 准入族/刀 F re-roll 族边界零位移；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类：现场漂移超注记级/机制不满足/越界需要/验收红不可修——起草期均未触发（§0.2-4 亲证）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头 `:3`+本节+卷尾注）·pre-exec 双审两独立外席**第一轮两席 FAIL 已收敛=rev1（§9-rev 逐条落卷）·rev 后重派双审第二轮**·Dual PASS≠开工·开工授权权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（全 proof 隔离库真迁移链/fixture·零模型外呼零 DNS·0 Key 值·`actualSpendCny=null`）·零 env 闸零新增。
- **STOP=draft:awaiting_pre_exec_dual**（与 Status 头/§8 同值第三处）·落卷即停·⛔push。

## §9-rev rev1 修订登记（pre-exec 双审两席 FAIL 收敛·P0×1/P1×2/P2 批量全数处置·逐条注记+落点）

双审定谳复核（rev 席对届树 `365aadaa1` 亲证全然成立）：**P0=件① 基体错位**——claim 函数现行权威体=**0184 19 参**（0181 升 17 参+`p_prompt_version`·0184 DROP 17 参 `:218` CREATE 19 参 `:219-240`+estimator/calibration 两冻结列）·原卷 REQUEST 错钉 0130 16 参旧体——照原卷施工=16 参 overload（违 0204 `:33/:177/:258`「禁 overload 双存沿 0188 先例」铁律）+修法 no-op（序变更手术落 16 参死体·live 体墙序原样=「误杀收口」落空）+ag12-estimator-freeze proof `:232-234`（恰一 overload `pronargs=19`）破损；**P1=先例引用失实**——0174/0200 全文零触 `ai_model_claim_invocation_scoped`（grep 亲证）·正为先例=**0119→0130 同签名 REPLACE**（0130 对 0119 :177-196 十六参体零 DROP 直接 REPLACE）+**0204 `:27` ACL 随 REPLACE 论断**。rev 席补一机证：0184 体 `:244-429` 对 0130 体 `:44-225` 逐字 diff 恰=validation 三行 `:261-263`+INSERT 列集 `:307-308`/`:312-313` 两处 additive·臂序全等（故原卷 0130 行锚描述除基体外全数平移成立·0184 锚=0130 锚+205 行偏移）。逐条落卷：

1. **[P0] §1-件① 重写**：基体改钉 0184 现行 19 参体逐字承继（validation `:261-263`+INSERT 列集 `:307-308`/`:312-313`）·同 19 参签名 CREATE OR REPLACE **零 DROP**·恰一序变更=succeeded∧replayable→cached 臂（0184 体 `:376-381`）上提至墙一（`:368-369`）之前·原位保留敏感半·尾部 REVOKE/GRANT 镜像 0184 `:434-435` 十九参签名原文两行——落点 §1-件① 全节（含语义矩阵四行→五行重钉）。
2. **[P0] §0.1 锚表补三行**：0181（blob `617f65be5e17b313578f235776d865913e32b071`·17 参先例 CREATE `:178`+GRANT `:386`）+0184（blob `5a89d95d0b6c779e594a875583562eab9731ce45`·DROP `:218`/CREATE `:219-240`/墙一 `:368-369`/succeeded 臂 `:376-381`/GRANT `:435`）+`packages/db/src/model-op/model-invocation.ts`（blob `baf09cc490d81ff6a804a367392e0035ecf745a3`·`:107` `$1..$19` 调用面）·0130 行标「**历史定义·非现行**」——落点 §0.1 表（11 行→14 行·blob 全数对 HEAD 亲算恒等）。**锚勘注**：双审清单所引 0184「GRANT `:436`」机证系空行偏一·正锚 `:435`·如实改锚。
3. **[P1] 先例引用改**：件①「（0174/0200 镜像先例形）」→「同签名 REPLACE 先例=0119→0130+0204 `:27` ACL 随 REPLACE 论断」并引 0204 禁 overload 双存铁律为 Ban 依据——落点 §1-件①。
4. **[P1] §2 门矩阵增门⑫**：`ag12-estimator-freeze:prove` EXIT=0（恰一 overload pronargs=19 哨兵 `:232-234`+GRANT 纪律 `:320-328`+0184 机械钉 `:338-343`）·并增门⑬ `ag19-prompt-version:prove`（席 2 建议·酌情行使·DB 臂对 0209 后 live 体回归+0181 文件机械钉 `:279-286` 零触）——落点 §2（十一门→十三门）。
5. **[P2] 批量五处**：①语义矩阵补第五行（succeeded∧replayable+logical_node 漂移→cached·hoist 臂先于两墙 `:396` 不可达）——落点 §1-件① 矩阵；②§3-1 fallback 改述「hoist 臂内联 cost_scope 等值谓词」（臂 E 撤·proof 五臂改四臂）+unbilled→billed 回放方向+重放方零记账缝**两案并陈**——落点 §3-1；③§3-2 点名 completion 提交前击杀窗残余（行留 dispatching·恒等=wait→expired 重领二次执行·漂移=墙一 mismatch·两向归后继刀）——落点 §3-2；④model-client.ts `:1141-1143` fence 注释漂移归属登记（英文 fence 自 `fc472d970` digest 构成同源笔逐字恒等·行漂 129→372→1141 `git log -L` 亲证·非后继刀新增）——落点 §0.1 model-client 行；⑤三处注记勘误（**①** costPolicy 十一→**十二**字段 `:1145-1150` 亲数——落点 §0.1；**②** 在飞树数 4→**5** 树 rev 复测增 `meetwise-flip7`/`line/batch-flip-7rows`·零 ag09 树复证——落点 §0.0；**③** `--grep AG-09` 3→**4** 笔 rev 复测增本卷起草笔 `365aadaa1`·仍全 docs 零修码——落点 §0.0）。

rev 届树实测：`docs:check` EXIT=0（scanned **2258**≤cap 2264·余 6·与原卷 §2⑨ 口径恰等）·markers 改动集（本卷恰 1 文件）五类标记词+行首冲突标记 0 命中亲跑·§0.1 全部 14 blob 对 HEAD `git rev-parse` 亲算恒等·`git branch -a | grep ag09` EXIT=1 复证·触面矩阵 8 tracked 零增（rev 只改本卷自身）。**STOP 维持 `draft:awaiting_pre_exec_dual`**（Status 头/§8/卷尾注三处同值零改）·rev 后重派双审第二轮·Dual PASS≠开工·开工授权权归协调方·alone≠dual·Ban self-approve。

---
卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·**rev1**（pre-exec 双审 P0×1/P1×2/P2 批量全数处置·§9-rev 逐条落卷·双审第二轮待重派）·起草落卷即停·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 未用·翻面权归协调方·alone≠dual·Ban self-approve。
