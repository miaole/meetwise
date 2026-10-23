# GITLEAKS-PLACEHOLDER-REMEDY REQUEST（占位形微刀 · secrets-scan 新曝红处置 · gitleaks allowlist path 锚恰一条目 · 零码零迁移）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落卷·§9 七字段·七门全绿·merge `2fad8f4a`·rev 窄域复审 PASS（agent_5c503b37）+协调方 EXEC 授权后开工·post-prove 双审两外席待派 · alone ≠ dual · ⛔push · Ban self-approve · est live=0 · `actualSpendCny=null`）

**席位**：meetwise 战役 GITLEAKS-PLACEHOLDER-REMEDY 占位形微刀 诊断+起草席（secrets-scan 新曝红处置 · 协调方派单令 · ISO nail 席逐帧定性转录为立项底稿）。
**基线**：`feat/mysql-schema-skeleton` @ **`12b21412`**（起草时 origin tip · fetch 后亲证=ISO-DOTENV-ISOLATION+G7K-REDS-REMAP 双刀 nail 本commit · 前置条件「origin tip≥SCN nail 波 tip」满足——`git merge-base --is-ancestor baf31a4e 12b21412` EXIT=0 亲证引入 commit 在 tip 祖先）· worktree **`meetwise-gpr`**（仓根同级 · `git worktree add ../meetwise-gpr -b line/gitleaks-placeholder-remedy origin/feat/mysql-schema-skeleton` 本起草席立 · 建前 `git worktree list` 零 gpr 名树 + `git branch --list "line/gitleaks-placeholder-remedy"` 零命中双查亲证）· branch **`line/gitleaks-placeholder-remedy`**。
**立项出处（不自建 SSOT 行）**：①协调方派单令（ISO nail 席逐帧定性）：secrets-scan FAILURE=**run 38821647684**（https://github.com/miaole/meetwise/actions/runs/38821647684）step 3 gitleaks——2 findings=generic-api-key @ `packages/ai-runtime/test/invoke-model-delta.proof.ts:103/:219`（`process.env.MODEL_API_KEY` 取值 `'…'` 占位形）·引入=`baf31a4e`（TOKSTREAM-S4B EXEC·前波 tip 祖先=在树旧内容非本波引入）·滑窗效应（PR 提交表 cap 250 窗口移动揭出）·本波自身区间零 leak；②本席四项诊断定稿全录于 §0（§0.1 锚表/§0.2 命中机制/§1 归因）。

**rev（2026-10-16 落卷席·双审 FAIL P1 同源处置）**：席1 agent_dcba1132+席2 agent_f5b852b4 同源 FAIL P1×1=本卷起草 commit 值面直引自曝（§0.1 锚表行两值+§0.2-1 引文行·amend 前全史复扫 78 项中本卷 .md 恰 3 项 :22×2+:31×1 亲证）——处置=R1-a **push 前 amend 值面改形**（三分直引改非赋值形·动词「取值」替代 `=` 邻位破「关键词+赋值符+引号」链·值名与变量名俱在证据力保全·generic-api-key 正则不可达·amend 后复扫本卷 0 findings 收据随交付报告）+R1-c 禁令随卷（§1.3-5）+R2-R5 勘误随卷（§0.1 行2/行3/行5·§0.2-4·§1-3·§1-修法·§2 门1·§3-3/§3-4·§5）。**STOP 维持 `draft:awaiting_pre_exec_dual`·待窄域复审**（rev 不翻面·amend 前 hash `f940311b`/amend 后 hash 随交付报告）。

---

## §0 现状锚（起草席亲证 · 全部 Read/rg/git ls-tree/rev-parse/merge-base/gitleaks 8.30.1 实测 @`12b21412` · EXEC 立项照本节对届时 tip 再重 pin——blob 漂移如实改锚·结论不变则只更行号；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list` 建后：gpr 名下**恰 1 树**=本树 `meetwise-gpr`（建前零亲证）；`git branch --list "line/gitleaks-placeholder-remedy"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | grep -i "gitleaks"` **EXIT=1 零命中**（落卷前无同名/同族卷）→ 停止条件未触发·可落卷。

### 0.1 blob 锚表（`git ls-tree`/`git show` 亲算亲读 · @`12b21412`）

| # | 文件/对象 | blob/commit | 关键行锚（@`12b21412` 亲读） |
|---|------|------|------|
| 1 | `packages/ai-runtime/test/invoke-model-delta.proof.ts` | `e81ac5ed9afa` | **被标面本体**：**:103** `process.env.MODEL_API_KEY` 取值 `'s4b-delta-proof-key'`（proof 本地假 Key·rev R1-a 非赋值形转写·下同——文本主 Key 装载臂）·**:222** `process.env.MODEL_API_KEY` 取值 `'s4b-g7-arm-test-key'`（proof 本地假 Key·g7 臂）——**CI 命中行号 :103/:219 系引入时点 blob `27738dd055e0`（@`baf31a4e`）读数**，HEAD 侧 +3 行漂（:117-121 静态断言计数修订插行·后续 commit 携入）**值面字节恒等零变**（`git diff baf31a4e HEAD` 本文件仅 :117-121 断言形改·两赋值行零 delta 亲证）；文件用途=TOKSTREAM S4b R1/R1b invoke 观察缝 proof（门预申明①新 proof·fake transport + 隔离 PostgreSQL·四臂+静态断言·`actualSpendCny=null`）；**:100-101 注记原文自证**「NODE_ENV=test + 文本主 Key 装载（registry 解析 baseUrl/apiKey 需 Key 在场；**值=proof 本地假 Key·零外呼，fetch 全程被 mock 拦截**）」·**:210-212 注记原文自证** g7 臂「proof 本地临时台账文件（零外呼·fetch 全程 mock…）」+**:222 行尾注**「g7 面 assertModelApiKeyPresent 前置（allowlist 模型 qwen-turbo）」 |
| 2 | `.gitleaks.toml` | `323de9b0ad77` | **allowlist 现行形**：**:2-3 header 铁律**「FP allowlist · not real secrets…**Do NOT use this file to hide real credentials.**」·:10 `[allowlist]`·:13-27 `paths` 数组=**精确单文件 `(^|/)路径\.转义$` 锚定形·恰 7 条目（rev R4 枚举勘误：原卷 §3-3「6 条目」系漏计·:13-27 实点 7）**（①r5-retirement/②uc-e2e-015 .md/③uc-e2e-025/④**uc-e2e-015 proof（`apps/api`·rev R4 勘误：原卷「api-harden proof」系误标·实=`apps/api/test/uc-e2e-015-resume-ingest-failures.proof.ts`）**/⑤收据 log/⑥test-support-fakes **:23**〔`98d4bab7` +3 落〕/⑦**ag24-langfuse-model.proof.ts :26**〔`bb1627d8` ci-red-clear EXEC 件① +3 落·注释自证「沿 626ac3cc/98d4bab7 形制」〕）·:29-33 `regexes` 三条（脚本名/Key-unset 词面·与 paths 并列双轨）——**先例三刀=626ac3cc（收据 log）→98d4bab7（test-support-fakes）→bb1627d8（ag24 条目）·全为 path 精确锚·零规则改动** |
| 3 | `.github/workflows/ci.yml` | `972527089a2a` | **secrets-scan job**：:10 job 起始·:15-17 checkout `fetch-depth: 0`（全量）·**:19** `uses: gitleaks/gitleaks-action@dcedce43c6f43de0b836d1fe38946645c9c638dc # v2`（未设 `GITLEAKS_VERSION` → action 装运行时 latest v8·其 `src/gitleaks.js` :19-20 注释自证）·**实装版本二元登记（rev R3）**：run 38821647684 实装 **8.24.3**（run log 原文「gitleaks version: 8.24.3」·同帧「leaks found: 2」·本席 gh api 亲读）/本地复刻 **8.30.1**——终审归 CI 实装面·:23 注释「命中任何密钥→非零退出→阻断」 |
| 4 | `package.json` | `3b04b8718dd3` | **受影响 proof 门注册行**：**:537** `"s4b-invoke-delta:prove": "node scripts/run-e2e-isolated.mjs s4b-invoke-delta:prove:raw"` · **:538** `:raw` 行=`pnpm -C packages/ai-runtime prove:invoke-model-delta`（隔离 PG 形） |
| 5 | commit `baf31a4e` | `baf31a4ee877` | **引入 commit**：TOKSTREAM-S4B EXEC（重派席·rev3 卷唯一依据·2026-10-14 19:30:35 +0800）·**单亲=fc1964cf（rev R5 拓扑勘误·席2 指谬+本席 `git log --format=%P` 亲证：原卷「merge fc1964cf --no-ff 双亲 df267c89+c4025186」系把 fc1964cf 自身双亲张冠李戴到 baf31a4e——baf31a4e 非 merge·`df267c89+c4025186` 实为 fc1964cf 的双亲；单亲非 merge 形与扫描 `--no-merges` 不相斥·finding 归因自洽）**·本文件 blob `27738dd055e0` 引入两占位值·`git merge-base --is-ancestor baf31a4e 12b21412` **EXIT=0 亲证=origin tip 祖先（在树旧内容·非本波引入·勘误不改此结论）** |
| 6 | gitleaks 内置 generic-api-key 规则 | 外部（v8.30.1 `config/gitleaks.toml` **:638-641**） | **regex**=`(?i)[\w.-]{0,50}?(?:access|auth|(?-i:[Aa]pi|API)|credential|creds|key|passw(?:or)?d|secret|token)(?:[ \t\w.-]{0,20})[\s'"]{0,3}(?:=|>|:{1,3}=|\|\||:|=>|\?=|,)[\x60'"\s=]{0,5}([\w.=-]{10,150}|[a-z0-9][a-z0-9+/]{11,}={0,3})(?:[\x60'"\s;]|\\[nr]|$)` · **entropy=3.5** · keywords 含 `key` · 规则内 allowlist `^[a-zA-Z_.-]+$`（纯无数字词豁免）——本地 8.30.1 与 CI latest v8 同族（98d4bab7 先例口径：本地复验因果闭环·终审靠 CI 版本） |

### 0.2 命中机制（诊断 c · 本席实证三重：规则亲读+本地复刻扫描+正则仿真）

1. **正则臂**：触发行原形=`process.env.MODEL_API_KEY` 取值 `'s4b-delta-proof-key'`（proof 本地假 Key·rev R1-a 非赋值形转写——原赋值直引形系本卷自曝触发面·已消·转写后正则不可达）——`(?i)` 关键词 `key`（`MODEL_API_KEY` 内·大小写不敏感）→ 间隔/引号段消费 ` = '` → 赋值符 `=` → `[\x60'"\s=]{0,5}` 消费开引号 → **捕获组=`s4b-delta-proof-key`**（19 字符 ∈ `[\w.=-]{10,150}`）→ 闭引号终止符命中。:219（HEAD :222）同形=捕获 `s4b-g7-arm-test-key`。两行均 Python 正则仿真逐字复现捕获组（起草席亲跑）·转写形链断亲证：`KEY` 后邻 CJK 动词越不过间隔类（Go `\w` 系 ASCII·`取值` 不在 `[\w.-]`/引号类/赋值符集）·amend 后全史复扫本卷 0 findings 亲证（随交付报告）。
2. **熵臂**：Shannon 熵实测 **`s4b-delta-proof-key`=3.787**、**`s4b-g7-arm-test-key`=3.511**——v8.30.1 阈值 **3.5**（旧版 3.7 已降·3.511>3.5 故 g7 臂值亦过）·两值均过熵门。
3. **规则内豁免不拦**：规则内 allowlist `^[a-zA-Z_.-]+$` 只豁免**无数字**纯词——两值含数字（`4`/`7`）→不豁免；stopword 表（恒等词形）两值不命中 → **findings 照发**。
4. **本地复刻扫描（同版同 config）**：`gitleaks git . --log-opts="--all" --config .gitleaks.toml`（gitleaks **8.30.1**·CI 实装 8.24.3/本地 8.30.1 版本二元登记（rev R3）·全史=起草时点 2940 commits/rev 时点 2947 commits 合流推进如实分记）=**rev 时点现树实值 78 findings（rev R2 基数勘误：原卷「75」系本卷落卷前面数——78=73 既存历史+2 目标+3 本卷自曝·amend 前复扫亲证本卷 .md 恰 3 项 :22×2+:31×1=R1 同源实锤；R1-a amend 后复扫=75（73+2+0·本卷零残留））·其中目标文件恰 2 项**=generic-api-key @ baf31a4e **:103/:219 与 CI run 38821647684 逐项恒等**（同 commit 同文件同行号）·其余 73 项=8.30.1 新规则下既存历史面（67 generic-api-key+6 curl-auth-header·规则分布本席复扫亲证）（**非 CI 现行红面**·沿 98d4bab7 勘误口径：「本地余 N 为新规则下既存历史面·非 CI 现行红面·终审靠 CI 版本」——CI 扫描形=action `src/gitleaks.js` :94/:110-115 `detect --log-opts=--no-merges --first-parent <base>^..<head>` 之 PR 窗·全史扫描为其超集）。

## §1 归因（诊断定稿·派单令三帧逐条落证）

1. **红面**：run 38821647684 secrets-scan（ci.yml :10 job·step 3 gitleaks）FAILURE=**恰 2 findings**·同文件同行族=generic-api-key @ `invoke-model-delta.proof.ts` :103/:219·`process.env.MODEL_API_KEY` 取值 `'…'` 占位形（rev R1-a 形面一律化转写·§0.1-1）。
2. **引入=baf31a4e 非本波**：两值系 `baf31a4e`（TOKSTREAM-S4B EXEC·2026-10-14 19:30 +0800）以 blob `27738dd055e0` 引入——该 commit 为 origin tip `12b21412` **祖先（EXIT=0 亲证）**=在树旧内容·**本波自身区间零 leak**（ISO nail 席逐帧定性转录+本席祖先关系复证一致）。
3. **滑窗效应（为何今日才曝）**：gitleaks-action@dcedce43 对 PR 扫描取 `--log-opts=--no-merges --first-parent <base>^..<head>`，base=PR 提交表（GitHub API cap 250）最老提交——本波新提交推进使窗口下缘滑过 `baf31a4e`·旧提交入窗**首曝**（此前各轮 CI 绿与「该值在树」并存不矛盾·扫描窗未覆盖引入 commit 而已）。**滑窗 head 侧注记（rev R4）**：`headRef=commits.data[commits.data.length-1]`（action `src/gitleaks.js` :171@dcedce43 本席亲读）=PR 提交表首页（default per_page=30）末项·**非真 tip**；提交表 cap 250 实测（live PR #108 提交表恰 250 项=8 页×30+10·本席 gh api 亲读）→ 截断表 250−首页 30=**结构盲尾 ≈220 提交**（入树 commit 潜伏期 ≈220 提交注记·ISO nail 席逐帧口径与本席 250−30 机械推导互证·新入树 leak 须俟窗口滑进扫描带方曝）。
4. **值定性（裁决底座）**：两值=**明显假值**——①命名系 proof 本地名（`s4b-delta-proof-key`/`s4b-g7-arm-test-key`·无任何真供应商 Key 形制前缀）；②in-file 注记两处原文自证「值=proof 本地假 Key·零外呼，fetch 全程被 mock 拦截」（:100-101）与 g7 臂同族注记（:210-212·:222 行尾）；③值仅满足 registry apiKey 在场断言/g7 面 `assertModelApiKeyPresent` 前置·零真实凭据语义；④proof 用途=TOKSTREAM S4b R1/R1b 观察缝验收（fake transport·零模型外呼·`actualSpendCny=null`）。

## §1-修法（甲 · allowlist path 精确锚恰一条目 · 零码动）

**修①（本刀唯一施工面）**：EXEC 阶段（协调方授权后）在 `.gitleaks.toml` `[allowlist]` `paths` 数组**ag24-langfuse 条目（:26）之后 append 恰 1 条目**（注释 2 行+path 锚 1 行=**+3/−0**·沿 98d4bab7/bb1627d8 同形制）·其余全部行零字节改·**proof 文件与一切产品码零字节零触**。**条目草案（EXEC 落卷文本·本席起草·协调方可裁改后落·插入位行锚对届时 tip 重 pin）**：

```toml
  # 测试桩假 key·非凭据：TOKSTREAM S4b invoke 观察缝 proof 进程内 env 注入（globalThis.fetch 全程 mock 拦截·
  # 零 provider 外呼·值仅满足 registry apiKey 在场断言与 g7 面 assertModelApiKeyPresent 前置·generic-api-key 启发式误读·沿 ag24/98d4bab7 形制）。
  '''(^|/)packages/ai-runtime/test/invoke-model-delta\.proof\.ts$''',
```

- **因果闭环预验（本席干跑·/tmp 临时 config·仓库零触）**：同 8.30.1 同 `--log-opts=--all` 全史复刻扫描·追加上条后恰消 2 目标项零残留（amend 后基线 **75→73**·被消恰 2 项=baf31a4e :103/:219 两目标 findings·本文件零残留·rev R2 口径·干跑收据随交付报告；EXEC 期对本仓正式 config 复跑同门）。
- **遮蔽语义如实化（rev R5）**：path 锚效力=**全文件×全规则既有机械豁免**（allowlist `paths` 按 FILE 匹配·命中路径内任何规则的任何 finding 一律豁免——非仅 generic-api-key 一条·本席探针亲证：curl-auth-header 规则 finding 同被 path 锚消·收据随交付报告）·与 `regexes` 三条呈并列 OR 组合（组合 OR 语义探针结论）——正因豁免面是全文件×全规则·§1.3-3 精确单文件锚+§1.3-4「Ban 收编未定性真凭据」为该机械豁免唯一护栏·本条目措辞不以「仅消 generic-api-key 误报」自限。
- **修②（候选裁决·推荐甲行使）**：裁决项②乙（占位值改形）保留为双审/EXEC 合法回炉选项（§1.3-1 承接）·丙（规则收窄）否决且 Ban（§1.3-2）。
- **修③（CI 终审归属）**：本地复刻系因果闭环证据·**翻面终审=push 后 CI run 逐 job 观察（secrets-scan 绿）**·push 归协调方/pusher（⛔本刀 push）。

## §1.3 否决清单（veto · 双审/EXEC 违反任一即 FAIL）

1. **乙（占位值改形）主选否决**：改 `'s4b-delta-proof-key'`/`'s4b-g7-arm-test-key'` 为拼接形/env 引用形以破正则——①proof 系 TOKSTREAM-S4B EXEC 已落件·blob `e81ac5ed9afa` 漂移须重 pin+`s4b-invoke-delta:prove` 隔离 PG 重跑（容器全链重开）·微刀零码纪律破；②值已两处 in-file 注记定性假值+零外呼·改形零安全增益；③拼接形防回归脆弱（后续编辑若复原 10+ 连续 `[\w.=-]` 段即复曝·启发式猫鼠无收益）；④NUL D7 值恒等转义先例系**非字符串值**转义形·此处系普通字符串赋值形不可套。**保留为回炉选项**：仅当双审推翻「明显假值」定性（值形似真）时经本卷 rev 明示行使·届时改形须两值同改+prove 绿收据。
2. **丙（规则收窄）否决+Ban**：收窄/降熵/停用共享 generic-api-key 规则=全仓真泄漏隐藏面·ci.yml :19 共享扫描语义弱化；config header :3 自缚铁律「Do NOT use this file to hide real credentials」；先例三刀（626ac3cc/98d4bab7/bb1627d8）均零规则改动——**Ban 触 `[extend]`/规则定义/熵值/regexes 现行三条件**。
3. **Ban 通配/目录级 allowlist 条目**：paths 条目必须精确单文件 `(^|/)…$` 锚定形（§0.1-2 先例全部如此）·禁 `.*`/目录级/前后放宽。
4. **Ban allowlist 收编未定性真凭据**：本条目效力面=本 proof 两占位假值定性（§1-4 四源）·该文件若未来引入非 proof 本地名/真值形 Key·本条目不得延展（届时停手上报另刀）。
5. **Ban 前向 rev 改卷文代替（R1-c）**：gitleaks 按 commit patch 归因·历史 commit 永在窗内——值面直引一经 push 不可修·唯 push 前 amend（本卷 R1-a 已行使）或 allowlist 第二条目（R1-b·未采纳：涉真凭据掩蔽面·§1.3-3/§1.3-4 护栏语义不合）·故 Ban 以新 commit 改卷文代替修因（前向 rev 只改得未来树·改不掉已 push commit 的 patch 归因）。

## §2 门矩阵（每条可独立判定 · EXEC 期全跑 · 本席已亲跑项如实登记）

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| 1 | 本地 gitleaks 复刻扫描 | `gitleaks git . --log-opts="--all" --config .gitleaks.toml`（同版 8.30.1 同 config·CI 实装 8.24.3 终审另计（rev R3 二元登记）） | **目标文件+本卷 .md findings=0（rev R2 同步·本卷 .md 以非赋值形转写在卷）**（全史 superset 口径·CI PR 窗为其子集·其余既存历史面沿 98d4bab7 口径不属现行红面）——rev 收据=amend 后复扫 75（73 既存+2 目标+0 本卷·本卷零 findings）+干跑 75→73 恰消 2 目标项零残留；EXEC 期对正式 config 复跑留收据 |
| 2 | 受影响 proof prove 绿 | `pnpm s4b-invoke-delta:prove`（run-e2e-isolated 隔离 PG） | **EXIT=0**（本刀零码动·proof blob `e81ac5ed9afa` 恒等门面零变·EXEC 期按协调方矩阵令行使·需隔离 PG 容器） |
| 3 | typecheck | 根 turbo typecheck 面 | **原值**（零码动·零 TS 面） |
| 4 | lint | lint 十二包面 | **原值**（零码动） |
| 5 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0**（起草基线亲跑：2164 scanned ≤ cap 2176·本卷落卷后预期 2165 ≤ 2176·本卷系唯一新增受管件） |
| 6 | markers 五类 | 改动集 grep（词族=`scripts/i6-239-gates.proof.mjs:151-163` 运行时组装四词+冲突标记对 · **词面本卷不复抄防自匹配**） | **零新增命中**（起草改动集恰 1 .md·EXEC 期改动集=本卷 .md+.gitleaks.toml 逐词亲跑） |
| 7 | diff 面 | `git diff --numstat HEAD` | 起草阶段=**恰 1 tracked=本卷 .md 纯新增零删改**；EXEC 落卷=**恰 2 tracked=.gitleaks.toml（+3/−0）+本卷 .md**·零他 tracked 路径 |

## §3 范围外（边界清单 · 越界即 FAIL）

1. `invoke-model-delta.proof.ts` 与 packages/ai-runtime 全部源/测试件——**零字节零触**（修法面=仅 .gitleaks.toml；proof blob 恒等为本刀卖点·乙回炉须本卷 rev 另申明）。
2. `.github/workflows/ci.yml`/gitleaks-action pin/规则定义/熵值——零触（§1.3-2）。
3. `.gitleaks.toml` 既有 **7 条目**（rev R4 枚举勘误：原卷「6 条目」系漏计·paths :13-27 实点 7·第 4 条=`apps/api` uc-e2e-015 proof·§0.1 行2 同勘）+regexes 三条——零字节（只 append 新条目·EXEC 后共 8）。
4. 其余 73 项本地历史 findings 面（非 CI 现行红面）——本刀零归因零处置（另有刀域·Ban 顺手扩面收编）。**常设曝面如实化（rev R5）**：rev 时点现树全史实值 78=73 既存+2 目标+3 本卷自曝（amend 前）·78−2 目标=**76 项常设曝面**（R1-a amend 后自曝 3 项消除·曝面实值 75=73 既存+2 目标）——该面=滑窗扫到与否内容恒在树恒可被扫·**挂链=checklist nul-escape STILL OPEN「gitleaks 滑窗」承登链**（登记归 checklist 登记链·本刀不自建 SSOT 行·沿 §3-5）。
5. SSOT 四卷（LEDGER/checklist/backlog/issues-master）——只读零触·行/统计零改（本刀不自建行·立项出处=派单令转录在卷）。
6. 历史迁移+`sql/` 影子面+锁文件——零触零占号。

## §4 依赖与迁移号

零硬前置刀——先例三刀（626ac3cc/98d4bab7/bb1627d8）已全并入基线（.gitleaks.toml 现行形即证）。**迁移号=零**（零迁移零 DDL）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写操作只在本 worktree 一次 docs commit·⛔push⛔merge 主线）；Ban coding（零产品码/零脚本/零 spec/零夹具/零迁移/零锁文件·proof 文件 blob 恒等）；Ban self-approve（pre-exec dual=两独立外席 · alone≠dual）；Ban 丙规则收窄（§1.3-2）；Ban 通配/目录级 allowlist 条目（§1.3-3）；Ban allowlist 收编未定性真凭据（§1.3-4·header 铁律）；Ban 前向 rev 改卷文代替（§1.3-5·R1-c）；Ban 乙改形未经本卷 rev 申明行使（§1.3-1）；Ban 为绿放宽任何门（含 docs:check/markers/diff/gitleaks 复刻）；Ban retry-to-green/Ban 只留绿 attempt；Ban 伪造已读/已验来源（§0 逐条亲证·扫描/干跑回执随交付报告）；Ban 触 §3 全部域；Ban Key 物料（本卷只录值名与定性·禁 .env 值/fingerprint 入树）；Ban 预占迁移号。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零调用零消耗）。

## §6 est live=0

本刀零模型真实外呼零 DB 连接零容器：起草 turn 全只读+本地 gitleaks 扫描/干跑（纯 git 对象遍历·零网络零外呼）；EXEC 期门行使面=gitleaks 复刻扫描+docs:check+markers+git diff（全本地零外呼）+`s4b-invoke-delta:prove`（隔离 PG·proof 本身 fake transport 零模型外呼·按协调方矩阵令行使）。`actualSpendCny=null`。

## §7 markers=0（卫生声明）

本刀改动集恰 1 .md，五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；五类标记词不在卷内复抄，避免自匹配——沿 g7k-reds-remap/ag-d 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual。**（2026-10-16 EXEC 翻面·§9 七字段·post-prove 双审两外席待派）起草席写完即停零码动（起草改动集恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（本卷非授权本身）；③EXEC 立项不得改 §1-修法条目实质与 §1.3 否决/§5 Ban/pins（改则回炉重审；插入位行锚/blob 照 §0 对届时 tip 重 pin）。**alone≠dual（单席自验不计双审）· Dual PASS ≠ 开工 · allowlist 落卷≠CI 翻面（翻面终审=push 后 CI 观察·push 归协调方/pusher）**。**rev（2026-10-16 落卷席）行使后 STOP 维持 `draft:awaiting_pre_exec_dual`·待窄域复审**（R1-a amend 值面改形+R1-c 禁令+R2-R5 勘误随卷·不翻面·开工三条款不变）。

**停止条件（四类 · 命中即停手上报）**：
1. **现场漂移**：EXEC 立项时对届时 tip 重 pin——proof blob `e81ac5ed9afa`/`.gitleaks.toml` blob `323de9b0ad77` 漂移如实改锚；两赋值行锚漂移超 ±3 或**值面换形（出现真值形 Key）** → 停手上报（不得就地改定性）。
2. **机制不满足**：复刻扫描若本文件出现第 3 项 finding·或 allowlist 干跑未恰消 2 目标项/留残留 → 停手上报（§0.2/§1-修法机制前提被推翻）。
3. **越界需要**：执行中若需触 §3 任何域（proof 文件/规则定义/既有 allowlist 条目/历史 findings 面）→ 停手上报。
4. **验收红不可修**：§2 门 1/5/6/7 任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门）。

## §9 EXEC 记录（2026-10-16·七字段·头行按项级标签·§0-§8 原文零字节改·append 保史·STOP 三处置定）

**授权链**：rev 窄域复审 PASS（agent_5c503b37「rev 确认·双审会签完成·可授权 EXEC」·rev 席 R1-a 值面改形+R1-c 禁令+R2-R5 勘误已随卷）→ 协调方明示 EXEC 授权（派单五序）→ 本席 EXEC。**§1-修法条目草案逐字落卷/§1.3 否决清单/§5 Ban/pins 十一值零字节零触**（§8 条款③）。

1. **重 pin 全表**（对 merge `2fad8f4a`=双亲 `c349179d`+`79a95bb2`·git ls-tree/rev-parse/merge-base 亲证）：`.gitleaks.toml` blob `323de9b0ad77` **零漂**（SCN/QGEN/rkw/ISO 波零触亲证=merge 13 files +1049/−27 变更集零含本件）；proof blob `e81ac5ed9afa` **零漂**·两值行 `:103`/`:222` 亲读字节恒等（±0·停止条件①未触发·值名面沿 §0.1 锚表不在本节复抄）；package.json `3b04b8718dd3` 零漂·`:537-538` prove 注册行恰等；ci.yml blob 漂 `972527089a2a`→`399df357e61d`（rkw 波 `:331` runtime:prove→runtime:isolated:prove 一行·**secrets-scan job 锚 `:10`/`:15-17`/`:19`/`:23` 逐行恒等·结论零变只更 hash**）；`git merge-base --is-ancestor baf31a4e HEAD` EXIT=0 维持；届时 tip=`79a95bb2`=QGEN nail（派单下界恰等·cap 2184 携入）·merge --no-ff EXIT=0 **零冲突**（ort·13 files +1049/−27·冲突沿并集解预置未触发·⛔pull --rebase 未用）。
2. **修法落点（§1-修法①·恰 1 码面 +3/−0）**：`.gitleaks.toml` ag24 条目（`:26`）后 append 恰 3 行=注释 2+path 锚 1（`'''(^|/)packages/ai-runtime/test/invoke-model-delta\.proof\.ts$'''`·§1-修法 fenced 定稿逐字·形沿 ag24/98d4bab7 先例逐字对齐）·其余全行零字节·paths 7→8 条目·regexes 三条零字节（§1.3-2 Ban 未触）·header 三行铁律零字节·proof 与一切产品码零字节零触（blob 恒等卖点兑现·乙回炉未行使）。
3. **复刻扫描 census 式快照（门 1·本地 gitleaks 8.30.1 同 config·正式 config 复跑收据）**：命令行 verbatim=`gitleaks git . --log-opts="--all" --config .gitleaks.toml --report-format json --report-path <快照>`（词面零自指·快照落 /tmp 易失件不提交）。**修法前（`2fad8f4a` 树）=107**：目标文件恰 **4**（`baf31a4e` :103/:219 CI 红面 + `112e6d26` :103/:222 origin/main PR #108 squash 落地件——该 commit 内 proof blob=**`e81ac5ed9afa` 恒等亲证=同内容同两值行×两 commit·非第 3 值形新曝**）+**本卷 .md 0**+既存历史面 103（generic-api-key 101+curl-auth-header 6·11 文件·2953 commits）。**修法后=103**：目标文件 **0**+本卷 .md **0**+invoke-model-delta 路径残留 **0**·removed 恰 **4** added **0**（两 JSON 快照逐条差集亲证=恰消目标文件全部 findings 零残留·既存历史面 103 零变）。**ref 漂移口径（派单令预授权「按席1 确认席日期界定」）**：rev 时点 75（73 既存+2 目标）→本 EXEC 107（103+4）系 `--all` ref 宇宙扩容（fetch 携 origin/main squash 落地件+各波新 commit·2947→2953 commits）非内容面新曝·目标文件值面 blob 恒等；常设曝面现值 **103** 承登 §3-4 挂链（checklist nul-escape STILL OPEN「gitleaks 滑窗」·本刀不自建 SSOT 行）。
4. **门矩阵七门全表（EXIT 原值）**：①gitleaks 复刻=修法前 107→修法后 103·目标文件+本卷 .md findings=0 双文件口径兑现·removed 恰 4 零残留（判定绿·EXIT=1 系 103 既存历史面在卷·§3-4 口径非 CI 现行红面·终审=push 后 CI·修③）；②`s4b-invoke-delta:prove` **EXIT=0**·12 PASS 全绿·「✓ TOKSTREAM S4b invoke 观察缝矩阵全部通过（零模型外呼·actualSpendCny=null）」·隔离收据 exit=0（`.tmp/isolated-proof-receipts/`·14612ms）——**attempt1 红如实登记=纯基建红**（裸 worktree 无 node_modules+隔离 PG boot 超时 `isolated_postgres_database_not_ready:boot`·failed 收据在 .tmp 存留）→`pnpm install --frozen-lockfile` EXIT=0 环境整备（零 lockfile 改）后 attempt2 绿·**非断言红非 retry-to-green 冲销**（两收据均在）；③typecheck `npx turbo run typecheck` EXIT=0·**Tasks: 8 successful, 8 total**（7 cached 输入哈希恒等合法）；④lint `npx turbo lint` EXIT=0·**12 successful, 12 total**·五贴线恰等 web 601/root 5235/api 1421/worker 954/ai-runtime 628（本树 package.json 逐值亲证零漂）；⑤docs:check EXIT=0 **2168 ≤ cap 2184**（cap 2184=QGEN nail 携入·卷面 2176 系起草树时值如实更）；⑥markers 五类（`scripts/i6-239-gates.proof.mjs:151-163` 运行时组装四词+冲突标记对·词面不入卷防自匹配）改动集（`.gitleaks.toml`+本卷 .md）grep **零命中**；⑦diff 面 `git diff --numstat HEAD` 恰 **2 tracked**=`.gitleaks.toml`（+3/−0）+本卷 .md（§9+STOP 三处）·零他 tracked 路径·卫生=`.env*` ABSENT·est live=0（gitleaks 复刻=纯 git 对象遍历零网络+prove=fake transport 零模型外呼）·`actualSpendCny=null`。
5. **R2-R5 承载（rev 勘误 EXEC 期兑现态）**：R2 门 1 双文件口径=目标文件+本卷 .md 双 0 兑现（census 基数随 ref 宇宙如实再登记 107→103·字段③）；R3 版本二元登记=本地 `gitleaks version` 亲证 **8.30.1**/CI 实装 8.24.3（run 38821647684 log）·翻面终审=push 后 CI secrets-scan 逐 job（push 归协调方/pusher·⛔本刀 push）；R4 枚举勘误=修法前 paths `:13-27` 实点 **7** 亲证·修法后 **8**（`gs` 第 4 条=apps/api uc-e2e-015 proof 与卷面勘误恒等）；R5 遮蔽语义如实化=path 锚全文件×全规则机械豁免 EXEC 期兑现（本文件在既存历史面无 curl-auth-header 项·豁免面实测=消 4 项全 generic-api-key·探针结论沿承）+乙改形未行使（blob 恒等）+R1-c 未触（本卷值面零新增直引）。
6. **census 式快照登记（三帧对照）**：修法前 107（目标 4+本卷 0+既存 103）→修法后 103（目标 0+本卷 0+既存 103 恒等）→commit 后终值复扫见卷尾终值登记（收据=修法前后两 JSON 快照 + `git diff` numstat 亲证）；rev 时点 78（amend 前）/75（amend 后）为 ref 宇宙前值如实并存不洗。
7. **STOP 终态**：三处（Status 头/§8/卷尾）置 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·allowlist 落卷≠CI 翻面（翻面终审=push 后 CI 观察·push 归协调方/pusher）·⛔push ⛔merge 主线 ⛔force-push。

## §9-POST post 双审会签 P3 勘误随卷（nail 席代落·post 双审会签 PASS 席1 agent_a7c4b724+席2 agent_4cde8bdb 授权·2026-10-16·append 注记形不洗上文一字）

- **E1（席1·字段3 既存历史面组分口径勘误）**：§9 字段3「既存历史面 103（generic-api-key 101+curl-auth-header 6·11 文件·2953 commits）」之组分两值系修法前全量 census（107）成分误植（101+6=107≠103 自相矛盾）——勘正=**generic-api-key 97+curl-auth-header 6=103·10 文件**（修法后既存面口径·与 §3-4 常设曝面挂链值 103 自洽·总数 103 与 2953 commits 恒等不动·仅组分两值与文件数勘正·零语义影响·原文零洗 append 保史）。
- **E2（席1·字段4 attempt2 时长收据权威勘误）**：§9 字段4「隔离收据 exit=0（`.tmp/isolated-proof-receipts/`·14612ms）」之 14612ms 系卷面转录值——收据本体权威=`2026-10-16T01-49-13-116Z-59737-0814a1a0-a001-4641-a332-59a1d168a99a.json` `durationMs=14562`（startedAt `01:48:58.554Z`→finishedAt `01:49:13.116Z` 自洽亲证）·勘正=**14562ms**·EXIT=0 与 12 PASS 结论零变·原文零洗。
- **E3（席1·attempt1 失败因收据本体未载注记）**：§9 字段4 attempt1 归因「裸 worktree 无 node_modules+隔离 PG boot 超时 `isolated_postgres_database_not_ready:boot`」系 EXEC 席现场直读观测非收据载文——attempt1 收据本体（`2026-10-16T01-46-44-924Z-56852-008b0b3a-32e0-4aa8-8ef0-71716651c00d.json`）仅载 `outcome=failed`/`exitCode=1`/`durationMs=114580` **无原因字段**·本注记承登归因出处=EXEC 席现场观测·红/绿两收据均在的事实面零变。

---

*GITLEAKS-PLACEHOLDER-REMEDY REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落卷·§9 七字段·merge `2fad8f4a`·七门全绿·post 双审待派） · ⛔push · alone ≠ dual · base `feat/mysql-schema-skeleton` @`12b21412`（=起草时 origin tip·fetch 亲证=ISO nail 波 tip·≥SCN nail 波 tip）· worktree `meetwise-gpr` · branch `line/gitleaks-placeholder-remedy`（建前双查无同名）· 立项出处=协调方派单令（ISO nail 席逐帧定性转录）+run 38821647684 两 findings+baf31a4e 祖先亲证 · 诊断四项=①两值现值读码（:103 `s4b-delta-proof-key`/:219 `s4b-g7-arm-test-key`·明显假值·proof 本地零外呼）②.gitleaks.toml 现行 allowlist 形（path 精确锚·ag24 先例 :26）③generic-api-key 命中机制（8.30.1 规则 :638-641·熵门 3.5 两值 3.787/3.511 皆过·无数字豁免不拦·本地复刻扫描恰 2 项恒等复现）④修法裁决（甲 allowlist path 锚·干跑恰消 2 项零残留）· §1.3 否决=乙改形（主选否决·回炉选项保留）+丙规则收窄（否决+Ban）+Ban 通配+Ban 收编真凭据 · 门矩阵七门（gitleaks 复刻零目标 findings+prove 绿+typecheck/lint 原值+docs:check+markers+diff 面）· 迁移号=零 · est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · Ban self-approve · Dual PASS ≠ 开工 · **rev（2026-10-16 落卷席）**=双审 FAIL P1 同源（席1 agent_dcba1132+席2 agent_f5b852b4）→R1-a push 前 amend 值面改形（:22×2+:31×1 非赋值形·「取值」动词破链·值名变量名俱在·amend 后复扫本卷 0 findings）+R1-c 禁令（§1.3-5 Ban 前向 rev 改卷文代替）+R2 基数勘误 75→78（=73 既存+2 目标+3 本卷自曝·amend 后 75）·门1 同步「目标文件+本卷 .md findings=0」+R3 版本二元登记（CI 实装 8.24.3 run log 亲读/本地复刻 8.30.1）+R4 滑窗 head 侧=commits.data[-1]（action :171 亲读=提交表首页末项非真 tip·cap 250 实测−首页 30=结构盲尾≈220 提交·潜伏期注记）+allowlist 枚举勘误（恰 7 条目非 6·第 4 条=apps/api uc-e2e-015 proof）+R5 常设曝面 76 项挂链（checklist nul-escape STILL OPEN「gitleaks 滑窗」承登链）+拓扑勘误（baf31a4e 单亲=fc1964cf·双亲 df267c89+c4025186 系 fc1964cf 所有·原卷张冠李戴）+遮蔽如实化（path 锚=全文件×全规则机械豁免·regexes 并列 OR 组合·§1.3-3/§1.3-4 唯一护栏）——STOP 维持 `draft:awaiting_pre_exec_dual` 待窄域复审 · STOP*
