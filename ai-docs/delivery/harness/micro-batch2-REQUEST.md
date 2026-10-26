# 微刀合卷任务书二——E2EA-01 · L-04 入卷起草 + GAP-G7V-THIRDARM-COPY-SETTLEMENT 销账登记（docs-only 起草 · 协调方授权派单 · **`closed`**〔2026-10-26 §9-post 双审双 PASS 会签翻面 · 原值 `executed:awaiting_post_prove_dual` 史录见 §8/§9-post〕）

**Status**: **`closed`**（2026-10-26 post 双审双 PASS 会签对账翻面 · 一行依据=席1 find-first 语义守住+漂移账 append-only+未提交窗负验证复现+五 ref digest 复算 653/690/698+ha6:prove 64/3 独立复跑+P2×3 · 席2 find-first 假闭合形推演+负验证独立复现+三 FAIL 邻面定性+五 ref 独立复算+P2×2 · P2 坐标勘误注随卷〔§9-post 在卷〕· 卷 closed ≠ 矩阵行/SSOT/backlog 行翻面——Pins 十值零动 · 行翻面权归协调方 · 原 `executed:awaiting_post_prove_dual`（前值 `draft:awaiting_pre_exec_dual` @draft `a8a624596`）史录 provenance 见 §8/§9-EXEC/§9-post 不回改 · alone≠dual · 并线 PR 走 main）· **STOP=closed（三处钉：本 Status 行 + §8 + §9-post 卷尾注）**
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`（十值零翻转）
**Date**: 2026-10-26
**Base / tip**: `origin/main` `1e23357a93a0848d4b73a929f296206c48d6f4bf`（fetch 后亲算 · worktree `meetwise-micro2` · branch `line/micro-batch2-draft` · ⛔动主仓 · ⛔push）
**卷源**: `ai-docs/delivery/gap-bug-backlog.md`（blob `a56da7bed98a1686a75913c24237e7a8b8f52657`）三件抽取：E2EA-01（:929 · 猎杀席登记块）· L-04（:910 · 归集台账 L-01..L-11 块）· GAP-G7V-THIRDARM-COPY-SETTLEMENT（:816 立行 / :820 CLOSED 注）
**本卷性质**: docs-only 起草合卷。三件中**两件入卷起草**（E2EA-01 · L-04），**一件锚点实物与 backlog 行面记载不符（行面 OPEN 字面 vs :820 已记 CLOSED（fixed）· 两 named 面复核均为修法在岗非残面）、按停止条件登记销账建议不入卷**（G7V · §3）。登记≠修复≠定谳≠关闭≠销案；销账裁决权归协调方。

## §0 锚点亲算（blob SHA + 行号对 fetch 后 tip `1e23357a9` 全数亲证）

### §0.0 三件锚点总表

| 件 | backlog 记载锚 | backlog 行 | 树实锚（tip 亲证） | 锚文件 blob（tip） | 判定 |
|----|----------------|-----------|--------------------|--------------------|------|
| E2EA-01 | 三层缺 key skip：wrapper `scripts/run-e2e-isolated.mjs:2733`＋self-skip `apps/worker/smoke/scoring-eval.ts:16`＋nightly `.github/workflows/nightly.yml:57`（continue-on-error）·#97=checklist :2614 | gap-bug-backlog.md:929 | wrapper **漂移至 :3043**（:3043-:3046 同形逐字·:3040-:3042 设计注在岗）；self-skip **:16 逐字同**（零位移）；nightly scoring 步块 **:57-:66**（step name :57 · `continue-on-error: true` **:58**（+1 漂）· :65 in-run `::warning::` 诚实守卫已在岗）；#97 keyed 半 **checklist :2614 恰等**+:2615 STILL OPEN「CI MODEL_API_KEY 决策未落前维持排除登记不预支」 | `da2972084a81f90287c72629ebac2340aa2457d8` / `f284b550d0799e2db03a23277a1099ec4da855c6` / `95d77505b813276f387a133a6523a46822616c35` / checklist `edce26a52b3255d8e54ec1ff8aed6024fb506305` | **入卷（重锚+核验刀起草）** |
| L-04 | ha6-repin 注册账门 scripts-set digest 臂读 HEAD·登记值 `106e4579…`·REQUEST :155-156/:166/:255 | gap-bug-backlog.md:910 | REQUEST 四锚全在（digest 行 **:154-:156** · rev2 R5 注 :163 · pkg additive 门 **:166** · R5 **:255**）；proof 登记行 **:69-:71**（blob `740df0a3`）；**digest 对 tip 复算=`ca7a18d8…` ≠ 登记 `106e4579…`**（scripts 键集 653→690 纯增 37 键·0 删·注册点 `8ae2a93e` 非主线祖先）→ `ha6:prove` tip 实跑 **EXIT=1（63 PASS/4 FAIL）恰含该账门 FAIL** | `e38b20e13dc97d36182299409a2b3946fcd5d118` / `740df0a3a11dea7e2bf7b4c376991d66f9e591f0` | **入卷（重锚+漂移现值扩载·补审双件）** |
| G7V | 行面「P1 **OPEN**」·UI 释放文案与已扣费结算相悖·码面双锚 `adaptive-lifecycle.ts:345-356`/`view-model.ts:68` | gap-bug-backlog.md:816 | **:820 已记 CLOSED（fixed）（2026-10-07 ·「行状态依本注为准」）**；spec 负断言 **:319-:320 在树**（`releasedCopyOnCharged`…`.toBe(false)`·spec blob `6e7dabec…`）；`zh.json:198` `assessReleasedMessage`=**释放臂在岗真值文案**（view-model :149-:151「此时为真，文案逐字保留」设计位）；码面双锚漂移（结算臂现值 :642-:680 · commerce 迁 `packages/db/src/commerce/commerce.ts` 旧 :163/:198 锚失效） | spec `6e7dabec5aa671467c50ee7b842b013e74a76798` / view-model `aab165b54421c05afe829f4b25012b8329e33cdd` / zh `490b96eee8b358db638b8d3bf15e751058c931f0` / adaptive-lifecycle `db96efec972f6a2f903a256303c6591afbb57ee4` | **销账（已修·已销）** |

锚文件行号均对 tip 打开文件亲点；blob SHA 以 `git rev-parse HEAD:<path>` 亲算。

### §0.1 E2EA-01 三层现值与对齐形（backlog 记载 vs 现树差）

**层① wrapper**（tip :3039-:3046，backlog 记 :2733 → 现值 :3043，+310 位移·内容同形）：

```js
const inheritedEnv = { ...process.env };
// A real-model scoring evaluation must never load a developer `.env` or pay
// for a provider call implicitly. CI/manual operators inject the key into this
// process; without it no disposable database is even started.
if (target === 'scoring:eval:raw' && !String(inheritedEnv.MODEL_API_KEY ?? '').trim()) {
  console.log('SKIP scoring:eval:raw: live_provider_key_not_injected');
  process.exit(0);
}
```

**层② 脚本自 skip**（`apps/worker/smoke/scoring-eval.ts:16` · 与 backlog 记载逐字节同位同文）：

```ts
if (!process.env.MODEL_API_KEY) { console.log('skip scoring:eval —— 未由受控环境注入 MODEL_API_KEY'); process.exit(0); }
```

**层③ nightly 臂**（`.github/workflows/nightly.yml:57-:66`）：`:57` step name「评分官质量信号(scoring:eval:…)」·`:58` `continue-on-error: true`（backlog 记「:57 continue-on-error」→ 现值 **:58**，+1 漂自 smoke-env-fix `:41` `touch .env` 插行）·`:59-:63` env 注 `MODEL_ENDPOINT_PROFILE/MODEL_API_KEY/MODEL_NAME/MODEL_FAST_NAME` · `:64-:66` run 块：

```yaml
        run: |
          if [ -z "$MODEL_API_KEY" ]; then echo "::warning::未配 MODEL_API_KEY → 跳过 scoring:eval(配 secrets 后 nightly/手动才真跑)"; exit 0; fi
          pnpm scoring:eval
```

**对齐形（现树已承先例四笔·backlog 登记后主线演进）**：① `:33` 段注释已为诚实形「门位如实:冒烟=硬门阻断(…)·recall/scoring=信号臂(continue-on-error,红=信号不阻断)」（E2EA-02 销案形在岗）；② recall 臂 :49-:56=`qbank:retrieval:eval`+`DASHSCOPE_EMBED_API_KEY`+`:55` `touch .env`（nrf 修法在岗）；③ 冒烟臂 :41 `touch .env`（smoke-env-fix 在岗）；④ scoring 臂 `:65` in-run `::warning::` 诚实 skip 守卫已在岗（nrf 件b 同批形）——三层「静默绿」面在 workflow 层已收窄为「注解 skip」（`::warning::` 诚实信号）；wrapper/self-skip 两层仍 plain log。
**touch .env 不适用证明**：scoring 链零顶层 `.env` 读——`scoring-eval.ts` 全文件 `readFileSync` 零命中（env/arg 面仅 :16/:28/:39）；smoke-env-fix 收口注「顶层裸 readFileSync(.env) 全 smoke 共 9 处」清单不含 `scoring-eval.ts`。scoring 臂无 `touch .env` 系**正确现状**非断链。
**链路亲证**：nightly `:66` `pnpm scoring:eval` → root `package.json:538` `"scoring:eval": "node scripts/run-e2e-isolated.mjs scoring:eval:raw"`（wrapper 层①）→ :739-:741 allowlist 含 `apps/worker/smoke/scoring-eval.ts`（层②）。三层同在、互为 key 门。
**观察面（如实登记·非缺陷定谳）**：`scoring-eval.ts:39` `process.env.MODEL_ENDPOINT_PROFILE = 'dashscope-cn-beijing';` 无条件覆写——nightly `:60` 注入 `MODEL_ENDPOINT_PROFILE: deepseek-cn-public` 被脚本钉值覆盖，配 key 真跑时实际 profile 以脚本 `:39` 为准；核验刀收据须如实记录有效 profile。
**既有登记**：#97 keyed 半=checklist **:2614**（「S7 keyed 四件 #98/#240/#97/#113-keyed 半维持开放明示不翻」）+ **:2615** STILL OPEN（「CI MODEL_API_KEY 决策未落前维持排除登记不预支」）——行号恰等零漂。

### §0.2 L-04 digest 漂移亲算（scripts 面现状亲读）

- **登记面**：`scripts/ha/ha6-companion.proof.mjs:66-72` `ROLLING_REGISTRY`（:69-:71=scripts-set 行·digest `106e457929a535e9b87d303b94d7487adbbca054`·registered `8ae2a93e`·note 唯一计算式「`git show <tip>:package.json | jq -cS '.scripts' | git hash-object --stdin`」）；:73-:74 must-exist 四键/must-not-exist 两键；:32 文件头「HA6-REPIN 漂移账（append-only·禁删改旧行）」块在岗。
- **执行面**：:397 `ROLLING_REGISTRY.find((r) => r.kind === 'scripts-set')`（**取首条**——重注册须原行更新+漂移账追加，非追加第二条）；:399 digest 臂=`execFileSync('sh', ['-c', 'git show HEAD:package.json | jq -cS \'.scripts\' | git hash-object --stdin'])`——**只读 HEAD 不读工作树**（L-04 登记的未提交窗逃逸面原样在树）；:401 恒等断言+:403 FAIL 文案「值漂=非 additive 演进→REQUEST 补审 append」。
- **复算（tip `1e23357a9` 亲算三管道）**：jq -cS 管道（唯一计算式）=**`ca7a18d8b663715dba3de8e6f7cfa9bef7225b20`**（HEAD 与工作树恒等·树净）；Node 键排序形=`a06789a029e6d9c3d81fd51d15db2239142a8d0e`；Node 插入序形=`89ebcb7510c0a31276c19ea3a80505e982774d45`。登记值 `106e4579…` 对 `8ae2a93e:package.json` 复算**恒等**（管道正确性自证）——但 `8ae2a93e` 对 HEAD `merge-base --is-ancestor` EXIT=1（**非主线祖先**·系 feat/mysql-schema-skeleton 支线注册点）。
- **漂移量**：scripts 键集 `8ae2a93e`→tip **653→690（纯增 37 键·0 删·diff 亲证）**——additive 演进但未走补审 append → 账门恒等臂红。
- **tip 实跑（起草席亲跑 `node scripts/ha/ha6-companion.proof.mjs`）**：**EXIT=1 · 63 PASS / 4 FAIL**——FAIL④=本件面「package.json registered scripts ledger violated: … digest got=ca7a18d8… want=106e4579… 值漂=非 additive 演进→REQUEST 补审 append」；邻面三 FAIL=①principal.ts:946 行号门漂移红（ha6-repin-REQUEST :256 R6 既登残留风险·行使通道=同款 REQUEST 补审）②docker compose config 臂环境红（EXIT=125 本机 docker 形）③pgbouncer 负断言红（`packages/db/src/interview/interview-graph-lease.ts` 恰 1 命中·:324-:343 门）——**三邻面各有既登通道·非本件触面·本卷零触**。
- **CI 接线现状**：`ci.yml:257-:258`/`:367-:368` 既登「ha6:prove 基线红不接线——归属 line/ha6-repin 重钉着陆后另批（接线前置=届时 tip 本地 ha6:prove 绿）」——基线红系**已知登记态**非本卷新发现；本件补审后该门整体仍基线红（邻面三 FAIL 在），接线前置仍不满足，接线归另批零触。
- **REQUEST 侧锚**：`ha6-repin-REQUEST.md`（blob `e38b20e1`）**:154-:156** scripts-set 登记行+唯一计算式 · **:163** rev2 R5 注（digest 恒等臂归 pkg 账门同断言承检）· **:166** pkg additive 门断言形 · **:255** R5 采行注——四锚全在树；backlog :910 所引 :155-:156/:166/:255 对 tip 全部有效。checklist **:2880** F1 勘误附注（三管道恒等·时点补偿）+**:2881** STILL OPEN「F2·滚动帧后继 REQUEST 候选」——与 backlog :910 记载一致。
- **防重三查**：`git branch --list "line/micro-batch2-draft"` 恰 1=本席；`git worktree list` 中 `meetwise-micro2` 恰 1 树；`ls ai-docs/delivery/harness/ | grep micro-batch2` 建前零命中。在飞支线 `line/ha6-close` 对 HEAD 非祖先亲证（HA-6 companion 旧战役闭卷登记支线·无 scripts-set 补审面·非同刀）。

### §0.3 GAP-G7V-THIRDARM-COPY-SETTLEMENT 双面复核（spec/文案现状亲读）

- **行状态**：backlog :816 行面「P1 **OPEN**」字面 vs 同文件 **:820** 处置注（2026-10-07 · append-only ·「**P1 OPEN → CLOSED（fixed）**·行状态依本注为准」）——行状态依 :820 注为准（该卷源文件尾注既定语义·与批 1 G7V-CALIB 同形）。
- **spec 面（负断言在树·复核成立）**：`apps/web/e2e-ui/recruiting-bound.spec.ts`（blob `6e7dabec`）：`:133` `const RELEASED_MSG_PART = '本次预留额度已释放';` · `:312` 释放臂注释「『额度已释放』文案此时为真」· **`:319-:320` named 负断言**（`const releasedCopyOnCharged = await page.getByText(RELEASED_MSG_PART).waitFor(…3_000)…; expect(releasedCopyOnCharged, '第三臂 no_eligible_scored_answer：UI「本次预留额度已释放」文案与已扣费结算（completeInterviewAndConfirm）相悖——C-HA-V1 不作 PASS 容忍面，须升级披露').toBe(false);`）· `:325`/`:331` 扣费臂 `NO_REPORT_ON_CHARGED_MSG` exact 等待+or-面——资金谎报回归门三件全数在岗。
- **文案面（zh.json:198=释放臂真值文案·非缺陷残面）**：`apps/web/messages/zh.json:197-:199` 三键在岗（`assessSettledMessage`/`assessReleasedMessage`/`assessUnknownMessage`；en.json `:197-:199` parity 三键同构）；消费面 `apps/web/lib/view-model.ts:143-:154` reason 三分派——`:145-:147` `no_eligible_scored_answer`→`assessSettledMessage`（扣费臂·Ban 释放字样）·`:149-:151` `evaluation_unscored`→`assessReleasedMessage`（**释放臂·「此时为真，文案逐字保留」**）·`:153-:154` 未知/缺失 reason→fail-closed 中性。`zh.json:198` 本体「…本次预留额度已释放。…」仅经 `:149-:151` 释放臂渲染（`failInterviewAndRelease` 补偿释放语义下为真），**不构成派单引「文案本体残面」的缺陷面**。交叉核：`apps/web/test/web-logic.proof.ts:284-:289`（blob `add5e1b0`）以显式 `reason:'evaluation_unscored'` 构造释放臂断言 `includes('额度已释放')`——与修法设计一致非漏网；recruiter 页 `:205`（failed 臂解释文案）与 abandon 面 `InterviewPanel.tsx:297` 系异臂语义零关联。
- **码面漂移（如实登记）**：backlog :816 码面双锚现值失效——结算三分支现驻 `apps/worker/src/adaptive-lifecycle.ts:642-:680`（扣费臂 :647-:671·`no_eligible_scored_answer` 落字 :670·释放臂 :672-:679）；`commerce.ts` 迁至 `packages/db/src/commerce/commerce.ts`（blob `20b7613e`）·旧 :163/:198 锚内容已重构不复指——漂移系登记后主线演进，缺陷本体已由 :820 记载修法（G7V-FIX `4faa61ef` 恰两文件 +15/−2）闭合，spec 回归门与文案三键即其端态。

## §1 改动清单（仅两件入卷 · 每处 file:line 现状+改形）

### §1.A 件① E2EA-01：nightly scoring 臂三层缺 key skip 核验刀任务书（零码 · 配 key 前置门）

**刀形主案（核验刀·nightly-recall-fix 同形逐层协议 · 零产品码零 workflow 改）**——EXEC 前置双门：`MODEL_API_KEY` 已由协调方/用户配置（GH secret 或受控环境注入）+ 协调方对本任务书 EXEC 授权（est live>0 实跑面）。未配 key 前 Ban 抢改抢跑（沿 E2EA-06 原 Ban 语义·诚实 skip 现状维持）。

1. **层③ nightly 臂核验**：配 key 后 nightly 手动触发（`workflow_dispatch`）或本地同形——`:65` 守卫对非空 key 放行（不 echo warning 不 exit 0）→ `:66` `pnpm scoring:eval` 真跑；`continue-on-error: true`（:58）语义不摘（信号臂定位=campaign 设计·nrf §1.3-2 既裁）。机检面：臂块 :57-:66 五行逐字与 §0.1 引文比对零漂。
2. **层② self-skip 核验**：注入 key 后 `apps/worker/smoke/scoring-eval.ts:16` 条件为假不 `exit(0)`→imports 照常（:18-:22 四 import 面）→真模型评测执行（单调性/ICC/相关性/操纵剥离四度量+Wilson 下界输出）。
3. **层① wrapper 核验**：`scripts/run-e2e-isolated.mjs:3043` 条件为假不 SKIP→隔离 PG runner 照常 boot+迁移→`scoring-eval.ts` 于一次性隔离库执行（:3040-:3042 设计注释语义兑现·开发/云库零触碰）。
4. **真跑收据要求（nrf 同形）**：单次 EXEC 恰一 attempt·四度量读数+样本量+skip 率（model_transient>20% 判 inconclusive 依脚本头注语义如实记）+**有效 profile 读数**（§0.1 观察面·`scoring-eval.ts:39` 钉值 `dashscope-cn-beijing` 为准·nightly `:60` 注入值被覆盖如实记）+est live 实数与 `actualSpendCny` 口径呈报。收据 untracked 不入库（沿 EXEC 口径）。红=信号（信号臂不阻断合并·nrf :33 诚实形语义）·Ban retry-to-green。
5. **核验刀翻面/立项归协调方**：#97 keyed 半（checklist :2614/:2615）与 backlog :929 行的翻面材料=本刀收据；本任务书不预设翻面。

**Ban 面（件①）**：Ban 未配 key 抢改/抢跑（live spend）；Ban 摘 `:58` continue-on-error（信号臂定位既裁）；Ban 动三层 skip 臂本体（:3043-:3046/:16/:65——核验对象非修法对象）；Ban 触 recall 臂/冒烟臂已收口面（:41/:49-:56）；Ban 补 `touch .env`（scoring 链零顶层 .env 读·§0.1 证明·加了即假修）；Ban 借机改 `scoring-eval.ts:39` profile 钉值（观察面归收据如实记·改值=新 REQUEST）。

### §1.B 件② L-04：ha6-repin 注册账门补审双件（digest 重注册+工作树双读数恒等臂）

**刀形主案（恰 1 文件触面=`scripts/ha/ha6-companion.proof.mjs` · 沿 ha6-repin 修法纪律「Ban 静默改账·再注册唯一通道=REQUEST 补审」·本任务书即该补审 REQUEST 载体）**：

1. **件a digest 重注册（现值漂移已实证·§0.2）**：`:69-:71` scripts-set 行原位更新——`digest: 'ca7a18d8b663715dba3de8e6f7cfa9bef7225b20'`（唯一计算式 jq -cS 管道复算值·**Ban Node 键排序形 `a06789a0…`/插入序形 `89ebcb75…` 另造等价形替算**·沿 F1 既裁）+`registered: '<EXEC tip 短 SHA>'`+note 追加「2026-10-xx 补审重注册：`8ae2a93e`→`<EXEC tip>` scripts 纯增 37 键（653→690·0 删）·additive 演进漏补审承登·旧值 `106e4579…` 退役留痕」。同步文件头 `:32` 漂移账块 **append-only 追加一行**（禁删改旧行）。**`.find()` 取首条语义（:397）下 Ban 追加第二条 scripts-set 行**（首条匹配使追加行永不生效=假闭合）。
2. **件b 工作树双读数恒等臂（F2 机制闭合）**：`:399` 邻增工作树管道读数 `execFileSync('sh', ['-c', "jq -cS '.scripts' package.json | git hash-object --stdin"], { cwd: root })`；`:401` 断言扩形=HEAD 管道值 **且** 工作树管道值 **且** 二者互等 **且** 与登记 digest 四点恒等（未提交窗内 scripts 漂移由工作树读数现形——机制闭合替代 F1 时点补偿）；`:403` FAIL 文案补「worktree got=…」读数位。
3. **门期望（如实预declared）**：件a+件b 落码后 `ha6:prove` 该账门断言翻 PASS（FAIL 数 4→3）——**整体 EXIT=1 基线红维持不裁绿**（邻面三 FAIL §0.2 各有既登通道·非本件触面）；ci.yml 接线前置（tip 绿）仍不满足·接线归另批零触。

**Ban 面（件②）**：Ban 静默改账/改 blob（本任务书外任何 digest 变更通道均禁）；Ban 触邻面三 FAIL（principal 行号门/pgbouncer 负断言/docker 臂——各归既登通道）；Ban 改唯一计算式与 must-exist/must-not-exist 键面（:73-:74）；Ban 触 `ha6-repin-REQUEST.md` 登记行本体（其 :154-:156/:166/:255 为历史卷·重注册登记落 proof.mjs+漂移账非历史卷改写）；Ban 触 ci.yml/其余 workflow；Ban 漂移账删改旧行。

## §2 门矩阵（命令与届值在树亲证 · 本 docs-only worktree 未装依赖的依赖型门如实登记）

| 门 | 命令（树亲证） | 届值/基线 | 起草席 | EXEC |
|----|----------------|-----------|--------|------|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | cap=**2_378**（`scripts/ai-docs/public-text-policy.mjs:147` `MAX_FILES = 2_378` 亲证·即派单届值 2378）·卷前亲跑 **EXIT=0（scanned 2376）**·卷后 **2377≤2378 余 1**·零 cap 上调需求 | **亲跑 EXIT=0** | 必跑 |
| markers 五类 | 沿 `scripts/i6-239-gates.proof.mjs:152-163` 五类标记词词面运行时组装形对卷面直扫（词形不誊防自指） | 卷面零命中 | **亲扫零命中** | 必跑 |
| diff 面 | `git diff --cached --numstat` | 恰 1 tracked（本卷 .md 新增 · 零他件） | 落卷亲检 | 必检 |
| ha6:prove | `pnpm ha6:prove`（= `node scripts/ha/ha6-companion.proof.mjs` · root package.json :695 亲证·纯 node 零依赖） | tip 现值 **EXIT=1（63 PASS/4 FAIL）起草席亲跑**（基线红既登·ci.yml :257-:258）·件② EXEC 门期望=账门断言翻 PASS（FAIL 4→3）·整体基线红维持 | **亲跑（现值取证）** | L-04 必跑 |
| scoring:eval | `pnpm scoring:eval`（root :538→wrapper→scoring-eval.ts） | 件① EXEC 配 key 后真跑·est live>0·须协调方授权+Key 供给 | 未跑（key 未配·Ban 抢跑） | E2EA-01 必跑 |
| web typecheck | `pnpm -C apps/web typecheck`（= `tsc --noEmit` · apps/web/package.json :24 亲证） | 本 worktree 无 node_modules 未实跑（如实登记）；两件零产品码零测试码触面（件①零码·件②触 scripts/ha 单 .mjs） | 未跑 | 触面时必跑 |
| web lint / root lint | `pnpm -C apps/web lint`（`eslint . --max-warnings 601` · :7 亲证）/ `pnpm lint`（`--max-warnings 5274` · root :8 亲证 · Ban 放宽） | 同上 | 未跑 | 触面时必跑 |
| 环境供给 | — | est live=0（本卷 docs-only）· 0 Key 值 · `actualSpendCny=null`（件① EXEC 实跑面除外·届时另计呈报） | — | — |

## §3 销账登记（停止条件行使 · 一件建议不入卷 · 裁决权归协调方）

1. **GAP-G7V-THIRDARM-COPY-SETTLEMENT 销账建议**：backlog :816 行面 OPEN 字面与 :820 处置注（2026-10-07 · CLOSED（fixed）·「行状态依本注为准」）不符，主线修法与回归门端态双面亲证在树（§0.3）——spec 负断言 `:319-:320` 在岗（资金谎报回归门）+`zh.json:198` 系释放臂在岗真值文案（view-model `:149-:151` 逐字保留设计位·`web-logic.proof.ts:284-:289` 交叉断言同口径）——派单引「文案本体残面」按现值复核**不成立为缺陷面**。建议协调方对 :816 行直接采信 :820 注状态、本件不立执行任务（本卷 §1 零 G7V 触面·零改 spec/文案/产品码）。**关联不洗面**：G7U 残红①「额度已释放零漏扣」关联子面处置随 G7Y trio 复判（:820 注③既载）——本销账不洗其登记本体；trio 真测 1/1/1 OPEN 与 `g7SuiteGreen=false` 零翻转。

## §5 pins（全卷）

Pins 十值零翻转（见卷头）。**全卷 Ban 面**：零产品行为改（件①零码核验·件②治理 proof 单文件补审）；Ban 触产品码行为面、迁移字节、`.env*`、SSOT 行结构（backlog/checklist/LEDGER 零触）、lint/cap 上限放宽（docs:check 2377≤2378 零上调）、批表翻面、销账写成修复、retry-to-green、self-approve、push、动主仓、Ban 静默改账（件②再注册唯一通道=本 REQUEST 补审）。登记≠修复≠定谳≠关闭≠销案；翻面/回写（backlog :910/:929 行处置建议、:816 行销案注）随 EXEC 收据呈报归协调方。

## §8

executed:awaiting_post_prove_dual

（件① E2EA-01 · 件② L-04 · 件③ G7V 销账建议 三处同悬待 pre-exec dual+协调方裁决——EXEC 裁断兑现：仅件② 行使·件① 待 key 登记（§9-EXEC 第 6 条）·件③ 维持 §3 销账建议·裁决权归协调方）

executed:awaiting_post_prove_dual

本步只新增本卷任务书，不改任何码面、proof、迁移、SSOT、workflow。（draft 时点原文史录·EXEC 步=件② 落码 `scripts/ha/ha6-companion.proof.mjs` 恰 1 码面文件+本卷 §9-EXEC 落卷）

executed:awaiting_post_prove_dual

（前值 `draft:awaiting_pre_exec_dual` @draft `a8a624596` 史录保留零字洗·三处翻面形沿 cap-sanction-2232 先例·STOP 终态详见 §9-EXEC 第 8 条）

closed（2026-10-26 §9-post 双审双 PASS 会签翻面 · 前值 `executed:awaiting_post_prove_dual` 史录更替）

closed（2026-10-26 §9-post 双审双 PASS 会签翻面 · 前值 `executed:awaiting_post_prove_dual` 史录更替）

## §9-EXEC 行使记录（EXEC 席·2026-10-26·协调方裁断：仅行使件② L-04）

1. **授权链与裁断**：draft commit `a8a624596`（本卷 §0-§9·`draft:awaiting_pre_exec_dual`）→ pre-exec 双审双 PASS → 协调方裁断：**仅件② L-04 行使**；件① E2EA-01 双前置不满足（MODEL_API_KEY 未配+未配期 Ban 抢改抢跑）**如实登记待 key 不行使**；件③ G7V 销账建议维持 §3 登记·裁决权归协调方。
2. **并线与 §1.B EXEC 时点复算义务**：EXEC 前 fetch origin/main（届值含 #147/#148）merge 并线零冲突（merge commit `8f2fdb83c`=EXEC tip）+`pnpm install --frozen-lockfile` 门前置。**draft 时点硬编码值对 EXEC tip 复算漂移如实更新**：digest `ca7a18d8…`（draft tip `1e23357a9` 时点值）→**`cc72940dfce57af2c9b379896a3a286797d5198f`**（唯一计算式 `git show 8f2fdb83c:package.json | jq -cS '.scripts' | git hash-object --stdin` 复算·HEAD 与工作树恒等·树净）；键数漂移 653→**698** 纯增 **45** 键 **0 删**（draft 值 690/+37 系并线前时点·照 §1.B 义务以 EXEC tip 复算为准）；管道正确性自证=登记旧值 `106e4579…` 对 `8ae2a93e:package.json` 复算恒等。
3. **件② 落码落点**（恰 1 码面文件=`scripts/ha/ha6-companion.proof.mjs`·+16/−5）：
   - **件a digest 重注册**：ROLLING_REGISTRY scripts-set 行**原位更新**（digest→`cc72940d…`·registered→`8f2fdb83c`·note 追加「2026-10-26 L-04 补审重注册」承登·**未追加第二条 scripts-set 行**——`.find()` 取首条语义守住）；文件头 `:32` 漂移账块 **append-only 追加**演进登记（106e4579@8ae2a93e→cc72940d@8f2fdb83c·旧行零删改）。
   - **件b 工作树双读数恒等臂（F2 机制闭合）**：`:399` 邻增工作树管道读数 `jq -cS '.scripts' package.json | git hash-object --stdin`（cwd=root）；`:401` 断言扩形**四点恒等**（HEAD 管道值+工作树管道值+二者互等+与登记 digest）；`:403` FAIL 文案补 `worktree got=` 读数位。must-exist/must-not-exist 键面与唯一计算式零触。
   - **件b 机制负验证**：工作树临时注入未提交 scripts 键→账门 FAIL 且 `worktree got=264156e8…` 与 HEAD 读数现形分裂（未提交窗逃逸面闭合实证）→随即 `git checkout -- package.json` 还原·package.json 零残 diff（probe 键不入库）。
4. **门矩阵（EXIT 原值如实）**：①`node scripts/ha/ha6-companion.proof.mjs` **EXIT=1**——**账门断言翻 PASS**（`scripts-set digest four-point identical HEAD=cc72940d worktree=cc72940d registered=cc72940d`）·FAIL **4→3**（**64 PASS/3 FAIL**）·**整体基线红维持不裁绿（§1.B 第 3 条预declared 如实兑现）**；②docs:check EXIT=0（scanned 2383 ≤ cap 2386·`public-text-policy.mjs:149` `MAX_FILES=2_386` 亲证·届值随 #146 放宽承 merge）；③markers 五类标记词+冲突标记对改动集双文件运行时组装扫 **hits=0**；④码面 diff 恰 1 tracked（本 .mjs +16/−5·落卷另承本卷 .md 沿 cap-sanction EXEC commit 先例）；⑤`node --check` 语法门 EXIT=0。
5. **邻面三 FAIL 各既登通道零触核**：①principal.ts:946 行号门漂移红（ha6-repin-REQUEST :256 R6 既登残留风险·行使通道=同款 REQUEST 补审）②docker compose config 臂 EXIT=125（本机 docker 环境形）③pgbouncer 负断言红（`packages/db/src/interview/interview-graph-lease.ts` 恰 1 命中）——三面各有既登通道·本卷零触零改；ci.yml :257-:258 接线前置（届时 tip 本地 ha6:prove 绿）仍不满足·接线归另批零触。
6. **件① E2EA-01 待 key 登记段**：EXEC 双前置（①MODEL_API_KEY 已由协调方/用户配置 ②协调方对本任务书 EXEC 授权）**均未满足**——key 未配如实登记；未配期 Ban 抢改/抢跑（live spend）禁令维持。三层 skip 臂现状零触（wrapper `run-e2e-isolated.mjs:3043-:3046`/self-skip `scoring-eval.ts:16`/nightly `nightly.yml:57-:66` 诚实 skip 形在岗·§0.1 承draft 亲证零动）。**待 key 配置后另派 EXEC 方可行使**（核验刀刀形沿 §1.A 五条·届时 est live>0 实跑面另计呈报）；本卷 est live=0·actualSpendCny=null。
7. **卫生**：est live=0（全门本地静态·零外呼零 secrets 零模型调用）·actualSpendCny=null·零迁移零 DDL·SSOT 三卷（backlog/checklist/LEDGER）零触·`ha6-repin-REQUEST.md` 历史卷零触·ci.yml/workflow 零触·pins 十值零翻转·收据不入库。
8. **STOP 终态**：三处（Status 头/§8/卷尾注）同值 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·批表行与 Status 终翻面权归协调方·本刀不宣称关闭·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §9 卷纪律

diff 恰 1 tracked 新增（本卷 `ai-docs/delivery/harness/micro-batch2-REQUEST.md`）；commit 净消息 `docs(test): 起草三件小修任务书`；⛔push；收据不入库（untracked）；实现方不 self-approve · alone≠dual · EXIT0≠covered。

## §9-post（post 双审双 PASS 会签落卷 · 2026-10-26 · 席1 PASS + 席2 PASS · **STOP 三处翻面 `closed`**）

**post 输入**：§9-EXEC 行使在卷（账门断言翻 PASS·FAIL 4→3·整体基线红预declared 维持·STOP 史录值 `executed:awaiting_post_prove_dual` 三处钉维持）→ post 双审两独立外席分席亲证/亲跑/复现，双席 PASS 会签 → 本卷 STOP 对账翻终态 **`closed`**（沿微刀批 1 §9-post 会签翻面先例形 · 卷 closed ≠ 矩阵行/SSOT/backlog 行翻面——Pins 十值零动 · 行翻面权归协调方）。

- **席1 PASS（亲证/亲跑）**：①**find-first 语义守住**：`ROLLING_REGISTRY` 数组恰 1 条 `kind: 'scripts-set'` 行（运行时计数=1 亲证·`.find()` 取首条语义在岗）——`git diff 8f2fdb83c 7db0a99da` 亲证 EXEC 落码形=登记行**原位更新**（digest/registered/note 三字段）·未追加第二条 scripts-set 行；②**漂移账 append-only**：文件头漂移账块 EXEC 步恰 +4 注释行（2026-10-26 L-04 补审重登记·106e4579→cc72940d 承登）·旧行零删改（diff 上下文亲证·「禁删改旧行」纪律守住）；③**未提交窗负验证复现**：工作树注入未提交 probe 键 `__l04_probe__` → 账门 FAIL 且 FAIL 文案三读数现形分裂 `HEAD got=cc72940d worktree got=0163d35b want=cc740d` → `git checkout -- package.json` 还原零残 diff（`git status --porcelain`=0）→ 门复跑四点恒等 PASS——F2 机制闭合独立现形；④**五 ref digest 复算**（唯一计算式 jq -cS 管道·键数并计）：`8ae2a93e`（初注册点）=`106e4579…`/653 键 · `a8a624596`（draft commit）=`ca7a18d8…`/690 · `1e23357a9`（draft base tip）=`ca7a18d8…`/690 · `8f2fdb83c`（EXEC tip）=`cc72940d…`/698 · `7db0a99da`（本卷 tip）=`cc72940d…`/698——跃迁 +37/−0（8ae2a93e→draft 时点）与 +8/−0（draft→EXEC tip）合计纯增 45 键 0 删·EXEC 步对 package.json 零字节（sorted 键集 diff 0/0）·工作树管道读数=HEAD 管道读数=cc72940d 恒等；⑤**ha6:prove 独立复跑**：EXIT=1 · **64 PASS/3 FAIL** 恰等 · 账门断言 PASS（`scripts-set digest four-point identical HEAD=cc72940d worktree=cc72940d registered=cc72940d`）· 整体基线红维持（§9-EXEC 第 4 条预declared 如实兑现）；⑥**P2×3**：(a) **坐标勘误**=wrapper skip 臂 `run-e2e-isolated.mjs` §0.0/§0.1/§1.A/§9-EXEC 第 6 条记 `:3043-:3046` 系 **draft 时点值**——并线 #146（nhp-batch-b runner 面）后平移至 **`:3105-:3108`**（+62 行·skip 臂三行逐字节恒等亲证·内容零触·勘误注见下）；(b) **backlog 行锚 +2 漂**：G7V 行 :816→**:818**·:820 处置注→**:822**·L-04 :910→**:912**·E2EA-01 :929→**:931**（系 #145 ledger-tidy `9a78b5094` 触 backlog 面增删·随 EXEC merge `8f2fdb83c` 材料化·行内容零触·L-04 行内自引 `ha6-repin-REQUEST.md:155-156/:166/:255` 现值亲证仍有效·checklist :2614/:2615/:2880/:2881 四锚亦亲证零漂）；(c) 负验证 FAIL 文案 `worktree got=` 读数系 **probe 键值依赖**（EXEC 步 probe=`264156e8`·本席 probe=`0163d35b`——同机制不同读数值）·登记免后席对 FAIL 读数值作恒等比对（机制看「分裂现形」非看具体值）。
- **席2 PASS（机证/独立复现/推演）**：①**find-first 假闭合形推演**：若 EXEC 以「追加第二条 scripts-set 行」行使，则 `.find()` 恒返首条匹配→追加行**永不参与断言**=假闭合——现树亲证数组恰 1 条且 EXEC 形为原位更新（与席1 ①独立互证）→ 假闭合形排除·真闭合成立；②**负验证独立复现**（第二 probe 形 `zz-l04-probe2`）：账门 FAIL 且 `worktree got=ec53180f` 对 HEAD 读数 `cc72940d` 现形分裂·单命令还原零残（porcelain=0）——两独立 probe 形同机制同现形=F2 机制闭合复现成立（非单点偶然·非 readout 值耦合）；③**三 FAIL 邻面定性**（本卷零触·各归既登通道）：①`principal.ts:946` 行号门漂移红（ha6-repin-REQUEST :256 R6 既登残留风险·行使通道=同款 REQUEST 补审）②docker compose config 臂 EXIT=125（本机 docker CLI 形「unknown shorthand flag: 'f'」·环境红非产品红）③pgbouncer 负断言红（`packages/db/src/interview/interview-graph-lease.ts` 恰 1 命中）——基线红定性维持·ci.yml :257-:258 接线前置（tip 绿）仍不满足·接线归另批；④**五 ref 独立复算**：与席1 ④同式异时复算全等（106e4579/653 · ca7a18d8/690 ×2 · cc72940d/698 ×2·Node 键排序形另形不混·沿 F1 既裁 Ban 等价形替算）；⑤**P2×2**：(a) 负验证 probe 须临时改写工作树 `package.json`（共享树变更窗）——两席均以单命令 `git checkout --` 还原+零残实证收口·操作纪律登记=仅静树行使·后席沿用；(b) 件① E2EA-01 待 key EXEC 时点须对 §1.A 引用坐标**重锚亲点**（wrapper 臂现值 `:3105`·draft 值 `:3043` 已漂·届时以 fresh fetch 届值为准——勘误注见下）。
- **P2 坐标勘误注（随卷）**：wrapper skip 臂 `scripts/run-e2e-isolated.mjs` **`:3043-:3046` 系 draft 时点坐标**（draft tip `1e23357a9` 时点亲证）·**并线 #146（nhp-batch-b）后平移 `:3105-:3108`**（+62 行·本卷 tip `7db0a99da` 亲证：设计注 `:3101-:3104`+skip 臂 `:3105-:3108` 五行逐字节恒等）·**内容零触**——§0.0/§0.1/§1.A/§9-EXEC 第 6 条所引 `:3043-:3046` 均系各笔时点值如实史录不回改·后席引用以本注现值坐标为准。
- **双席会签**：席1 PASS + 席2 PASS，零 FAIL 零 scoped 解销面（邻面三 FAIL 各归既登通道·非本卷触面），双独立外席既独立又互补（席1 静态 diff/账面/复跑 + 席2 推演/复现/邻面定性）→ 本卷 STOP 翻终态 **`closed`**（三处钉：Status 行/§8/本卷尾注）。**Non-claims（翻面不洗）**：卷 closed ≠ covered ≠ backlog 行翻面 ≠ 产品闭环 ≠ HA ≠ 件① 行使——Pins 十值零动（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`）· 件① E2EA-01 待 key 登记维持（MODEL_API_KEY 配置后另派 EXEC 方可行使·核验刀刀形沿 §1.A 五条）· 件③ G7V 销账建议维持 §3·裁决权归协调方 · est live=0 · 0 Key 值 · EXIT0≠covered · alone≠dual · Ban self-approve · ha6:prove 基线红维持不裁绿 · 并线 PR 走 main（fetch 届值 → merge-tree 预演 → merge --no-ff → `pnpm install --frozen-lockfile` → 终验 → push → PR → `gh pr merge --merge --auto`）· 收据不入库（本节证据运行 untracked 不入库）。

---

*MICRO-BATCH2 REQUEST · 2026-10-26 起草 · 2026-10-26 EXEC 落码（§9-EXEC·前值 `draft:awaiting_pre_exec_dual` @draft `a8a624596` 史录）· 2026-10-26 §9-post 双审双 PASS 会签翻面 · **`closed`**（§9-post 卷尾钉 · 与 Status 行/§8 同值 · 席1 find-first 语义守住+漂移账 append-only+未提交窗负验证复现+五 ref digest 复算 653/690/698+ha6:prove 64/3 独立复跑+P2×3 · 席2 find-first 假闭合形推演+负验证独立复现+三 FAIL 邻面定性+五 ref 独立复算+P2×2 · P2 坐标勘误注随卷=wrapper skip 臂 :3043-:3046 系 draft 时点·并线 #146 后平移 :3105-:3108·内容零触 · 双审双 PASS 会签 · 并线 PR 走 main）· EXEC tip `8f2fdb83c`（fetch origin/main 并线 #147/#148 零冲突 merge commit·install frozen 门前置）· 分支 `line/micro-batch2-draft` · 工作树 `meetwise-micro2` · 协调方裁断=仅件② L-04 行使（件① E2EA-01 待 key 登记·件③ G7V 销账建议维持 §3）· 件② 落点=`scripts/ha/ha6-companion.proof.mjs` 恰 1 码面文件（digest 重注册 `cc72940d`@`8f2fdb83c`+`:32` 漂移账 append+工作树双读数四点恒等臂·+16/−5·EXEC tip 复算 653→698 纯增 45 键 0 删）· 门矩阵=ha6:prove EXIT=1（账门断言翻 PASS·FAIL 4→3·64 PASS/3 FAIL·基线红预declared 维持）+docs:check EXIT=0（2383≤2386）+markers hits=0+码面 diff 恰 1 tracked+件b 负验证 worktree got 现形 · est live=0 · actualSpendCny=null*
