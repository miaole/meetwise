# GITLEAKS-ARCHIVE-EXPAND REQUEST（archive+code 面扩围刀 · secrets-scan 滑窗存量红处置 · gitleaks allowlist path 精确锚 10 条目 · 零码零迁移）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落卷·§9 七字段+P2 两件·八门全绿·merge `819f57d8`·pre-exec 双审会签 PASS（席1 agent_1591b0a6+席2 agent_2715668b）+协调方 EXEC 授权后开工·post-prove 双审两外席待派 · alone ≠ dual · ⛔push · Ban self-approve · est live=0 · `actualSpendCny=null`）

**席位**：meetwise 战役 GITLEAKS-ARCHIVE-EXPAND archive+code 面扩围刀 起草席（archive-gitleaks 诊断席候选 a 承接 · gitleaks-placeholder-remedy 刀 sibling · 协调方派单令 · 诊断席定谳转录为立项底稿）。
**基线**：`feat/mysql-schema-skeleton` @ **`7e8ada73`**（起草时 origin tip · fetch 后亲证=dbacl2-ci-wire nail（dcw nail）本commit · 派单前置「origin tip≥7e8ada73」恰等满足——`git rev-parse origin/feat/mysql-schema-skeleton`=`7e8ada7321890ce4f725e974433f7ac259e41225` 亲证）· worktree **`meetwise-gae`**（仓根同级 · `git worktree add ../meetwise-gae -b line/gitleaks-archive-expand origin/feat/mysql-schema-skeleton` 本起草席立 · 建前 `git worktree list` 零 gae 名树 + `git branch --list "line/gitleaks-archive-expand"` 零命中双查亲证·建后各恰 1）· branch **`line/gitleaks-archive-expand`**。
**立项出处（不自建 SSOT 行）**：①协调方派单令（archive-gitleaks 诊断席定谳转录）：main secrets-scan 32 findings=archive 面 25（恰 2 文件·下 §0.3 行1/行3）+code 面 7（5 个 proof 测试夹具自描述假值）·全史 38（+langfuse-evaluation-contract 4+verify-preview-web.sh 2 先在存量）·**38/38 全假阳性零真凭据**·诊断推荐=候选 a 逐文件 allowlist（b/c/d/e 四候选 Ban·§1.3 转录）；②与 **gitleaks-placeholder-remedy 刀分野**（派单令明示）：彼刀=invoke-model-delta 2 findings（其 EXEC 已落 allowlist 第 8 条目·branch `line/gitleaks-placeholder-remedy` @`e29e7874`）·本刀=其余文件·两刀合拢=假阳性面清零（本席普查定稿口径=--all 全宇宙 107=本刀 103+彼刀 4·§0.2）；③本席普查定稿三件全录 §0（清点表/假值定性/条目草案+干跑）。

---

## §0 现状锚（起草席亲证 · 全部 Read/rg/git ls-tree/rev-parse/rev-list/merge-base/shasum/git hash-object/gitleaks 8.30.1 实测 @`7e8ada73` · EXEC 立项照本节对届时 tip 再重 pin——blob 漂移如实改锚·结论不变则只更行号；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list` 建后：gae 名下**恰 1 树**=本树 `meetwise-gae`；`git branch --list "line/gitleaks-archive-expand"` **恰 1 命中**=本席分支（建前双零亲证）。
- `ls ai-docs/delivery/harness/ | grep gitleaks-archive-expand` **EXIT=1 零命中**（落卷前无同名卷·gitleaks-placeholder-remedy-REQUEST.md 为 sibling 卷不同名）→ 停止条件未触发·可落卷。

### 0.1 blob/commit 锚表（`git ls-tree`/`git show`/`rev-list --first-parent` 亲算亲读 · @`7e8ada73`）

| # | 文件/对象 | blob/commit | 关键锚（@`7e8ada73` 亲读） |
|---|------|------|------|
| 1 | `.gitleaks.toml` | `323de9b0ad77` | **allowlist 现行形**：:2-3 header 铁律「**Do NOT use this file to hide real credentials.**」·:13-26 `paths` 数组=精确单文件锚定形**恰 7 条目**（:13 r5-retirement/:15 uc-e2e-015 .md/:17 uc-e2e-025/:19 apps/api uc-e2e-015 proof/:21 收据 log/:23 test-support-fakes/:26 ag24）·:27 `]`·:29-33 `regexes` 三条·先例三刀=626ac3cc→98d4bab7→bb1627d8 全 path 精确锚零规则改动——**gpr 刀 EXEC（@`e29e7874`）已在彼支线 :26 后 append 第 8 条目（invoke-model-delta）·本基线（`7e8ada73`）未含彼条目·两刀同锚位 append 并线冲突沿并集解预置** |
| 2 | `.github/workflows/ci.yml` | `d2dc8d2ca5a1` | secrets-scan job：:10 job 起始 · :15-17 checkout `fetch-depth: 0`（全历史）· :18 `name: gitleaks` · **:19** `uses: gitleaks/gitleaks-action@dcedce43c6f43de0b836d1fe38946645c9c638dc # v2`（未设 `GITLEAKS_VERSION`→action 运行时装 latest v8）· :23 注释「命中任何密钥→非零退出→阻断」——dcw nail 波 +4 行在 :193-196（db-acl2 步）零涉本 job 块 |
| 3 | `package.json` | `3b04b8718dd3` | s4b prove 邻面注册行：:537 `s4b-invoke-delta:prove`（run-e2e-isolated 隔离 PG 形）· :538 `:raw` 行=packages/ai-runtime prove:invoke-model-delta——**彼刀域邻面·本刀零码零触·blob 恒等卖点** |
| 4 | `receipts/archive/2026-09-batch23/receipts/c12-typecheck/02-turbo-dry.json` | `d0bb85de7629` | 归档收据本体（c12-typecheck turbo dry 全量收据·2200+ 行 JSON）·**与归档前原路径 blob 恒等亲证**：`git rev-parse 7da52c5b:ai-docs/delivery/receipts/c12-typecheck/02-turbo-dry.json` = `d0bb85de7629` = HEAD 归档路径（同内容挪移·batch23 归档） |
| 5 | `receipts/archive/2026-09-batch23/receipts/tokstream-s4a/2026-10-07/run-manifest.json` | `ed35a0020ec5` | S4a run 收据本体（knife/runId/branch/scriptSha256 映射 JSON）·**同上双路径 blob 恒等**：`546b1c48:ai-docs/delivery/receipts/tokstream-s4a/2026-10-07/run-manifest.json` = `ed35a0020ec5` = HEAD 归档路径 |
| 6 | main 首亲链三 commit | `112e6d26`/`fc472d97`/`cc83424b` | **诊断席 38 宇宙=origin/main `--first-parent` 链 findings 全集（本席 rev-list 亲证）**：`112e6d26`（PR #108 squash 落地件·32 findings=archive 25+code 7）+`fc472d97`（ai-runtime 统一模型出口·langfuse 4）+`cc83424b`（ECS 预览子系统·verify-preview-web.sh 2）=**恰 38**·与诊断席「全史 38」恒等 |
| 7 | feat 首亲链五 commit | `7da52c5b`/`546b1c48`/`ea4e5796`/`18d0e8d2`/`c5b953a7` | **本席普查新实**：均在 origin/feat/mysql-schema-skeleton `--first-parent` 链（rev-list 亲证）·=c12 原路径 24+run-manifest 原路径 1+dbhy1 2+db-id-v7 1+db-acl2 1=**29 findings**·未来 PR 窗（gitleaks-action `--first-parent <base>^..<head>`·PR #108 滑窗先例）可达 |
| 8 | gitleaks 内置规则 | 外部（8.30.1） | generic-api-key（regex 含 `(?:access|auth|api|credential|creds|key|passw(?:or)?d|secret|token)` 关键词族+赋值符+`[\w.=-]{10,150}` 捕获·熵门 3.5）+curl-auth-header（curl Cookie/Authorization 头探针）·本地复刻 8.30.1/CI latest v8 同族·终审靠 CI（沿 98d4bab7 口径） |

### 0.2 面结构普查定稿（本席第一件·三层宇宙）

本地 **gitleaks 8.30.1** 同 config 全史复刻：`gitleaks git . --log-opts="--all" --config .gitleaks.toml`（2955 commits）=**107 findings**·按引入 commit 首亲链归属三层：

1. **main 首亲链=38**（诊断席宇宙·逐项复证恒等）：`112e6d26` 32（archive 面 25=c12 归档路径 24+run-manifest 归档路径 1·code 面 7=invoke-model-delta 2+dbhy1 2+api-harden 1+db-acl2 1+db-id-v7 1）+`fc472d97` 4（langfuse）+`cc83424b` 2（verify-preview-web.sh）——**诊断席「main 32+存量 6=全史 38」逐项恒等复证**。
2. **+feat 首亲链=+29 → 67**（本席普查新实·未来 PR 窗可达）：`7da52c5b` 24（c12 **归档前原路径**）+`546b1c48` 1（run-manifest 原路径）+`ea4e5796` 2（dbhy1）+`18d0e8d2` 1（db-id-v7）+`c5b953a7` 1（db-acl2）——**gpr 刀 run 38821647684（baf31a4e 滑窗首曝）即此机制先例**。
3. **+side lineage=+40 → 107**（`--all` 超集·同内容 rebase 孪生 commit 与支线独有引入）：15dde2c8 24+be40ecec 1+c31fd11e 1+0ec543d0 1+b0d86099 1+1ab83bd8 2+c3de7fe6 4+e33020c2 2+950fb27a 2。

**分野合拢账**：107=**本刀 10 firing path 共 103**（§0.3 行1-10）+**彼刀 1 文件 4**（invoke-model-delta·gpr 刀域·其 EXEC 条目已落彼支线）→ **两刀合拢=--all 全宇宙 107 清零**（干跑亲证 §1-修法·joint 口径 0 findings）。

### 0.3 清点表（本席第二件 · 文件/行/熵/值性质四元组 · gitleaks 8.30.1 复刻逐处）

| # | firing path | 引入 commit（首亲链标注）| 行（findings）| 熵域 | 值性质（一句话） |
|---|------|------|------|------|------|
| 1 | `receipts/archive/2026-09-batch23/receipts/c12-typecheck/02-turbo-dry.json` | `112e6d26`（main 链·squash）| :242/:404/:523/:524/:585/:632/:750/:821/:888/:1007/:1032/:1041/:1055/:1279/:1398/:1423/:1432/:1446/:1707/:1758/:1850/:1901/:2134/:2195（24）| 3.635–3.896 | 40-hex 值全部=**git blob 对象 ID（SHA-1 内容摘要·四重密码学亲证 §0.4-A）**·键名源文件名词面误触关键字（auth/api/token/key/passw/secret 词族） |
| 2 | `ai-docs/delivery/receipts/c12-typecheck/02-turbo-dry.json` | `7da52c5b`（feat 链）+`15dde2c8`（side）| 同行号 24×2 | 同上 | 同上（**同 blob `d0bb85de` 归档前原路径**·值面逐字节恒等） |
| 3 | `receipts/archive/2026-09-batch23/receipts/tokstream-s4a/2026-10-07/run-manifest.json` | `112e6d26`（main 链）| :11（1）| 3.777 | 64-hex 值=**scriptSha256 收据时点 proof 源码 SHA-256 溯源摘要**（§0.4-B 亲证）·键名 token-coalesce 词面 token 误触 |
| 4 | `ai-docs/delivery/receipts/tokstream-s4a/2026-10-07/run-manifest.json` | `546b1c48`（feat 链）+`be40ecec`（side）| :11×2 | 3.777 | 同上（**同 blob `ed35a002` 归档前原路径**） |
| 5 | `apps/api/test/api-harden-shared-state.proof.ts` | `112e6d26`（main 链）+`c31fd11e`（side）| :278（1×2）| 3.828 | N1 NOINHERIT 低权 login **夹具口令**（in-file :22 注记「隔离库」+:275 臂注自证·随机角色名每跑配对·assertIsolatedTestTarget 隔离库内建消·值自描述 proof 口令形） |
| 6 | `packages/db/test/dbhy1.proof.ts` | `112e6d26`（main 链）+`ea4e5796`（feat 链）+`1ab83bd8`（side）| :45/:164（2×3）| 3.808–3.827 | 迁移 SQL **SHA-256 内容溯源台账**两行（§0.4-C 两行 sha256sum 复算恒等亲证）·键名 trace_tokens/same_key_claim_join 词面误触 |
| 7 | `packages/db/test/db-acl2.proof.ts` | `112e6d26`（main 链）+`c5b953a7`（feat 链）+`0ec543d0`（side）| :163（旧 blob）/:172（现树·1×3）| 3.572 | pgp_sym_encrypt **隔离库 ACL 快照差分参数**（appendArgs 13 参喂 0108 签名对话追加·值自描述 dbacl2-enc-key-v1 形制） |
| 8 | `packages/db/test/db-id-v7.proof.ts` | `112e6d26`（main 链）+`18d0e8d2`（feat 链）+`b0d86099`（side）| :25（旧 blob）/:28（现树·1×3）| 3.779 | 隔离库加密参数 **env 注入**（in-file :27 注记自证「隔离库·非密钥」·值自描述 proof_dbid1 前缀+长度注记形） |
| 9 | `packages/ai-runtime/test/langfuse-evaluation-contract.proof.ts` | `fc472d97`（main+feat 链）+`c3de7fe6`（side）| :93（1）/:109（2·同行双命中）/:110（1）×2 commit | 3.774 | 抽样策略**标签字符串实参**（sampleOnlineJudgeAttempts/selectOnlineJudgeLot 纯进程内函数·值自描述 fixture 字样·零网络零凭据语义） |
| 10 | `ops/ecs/verify-preview-web.sh` | `cc83424b`（main+feat 链）+`e33020c2`/`950fb27a`（side）| :36/:46（cc83424b）/:27/:37（side 旧 blob）| 3.5（规则内定值）| curl **负向注入探针头**（负对照值 must_not_forward 字样·断言拒绝不透传·件已退役树外 64efcf2f 删）·curl-auth-header 规则命中 |
| 11 | （彼刀域）`packages/ai-runtime/test/invoke-model-delta.proof.ts` | `baf31a4e`+`112e6d26` | :103/:219（旧 blob）/:103/:222（squash）| 3.511/3.787 | proof 本地假 Key 占位形·**gitleaks-placeholder-remedy 刀域·本刀零施工**（其 EXEC 条目已落彼支线 :26 后） |

（存量口径注记：诊断席「存量 6」=行9 main 链 4+行10 main 链 2·先于本波在库；「新曝 32」=行1/3/5/6/7/8 main 链合计 25+7。）

### 0.4 假值定性四重证据（本席第三件前半 · 密码学亲证 ≥2 达成 · 沿诊断席方法）

- **A（c12 40-hex=git blob 对象 ID）**：①`git cat-file -t f764eba3…`=`blob`+`git rev-list --all --objects` 命中 `packages/ai-runtime/src/secret-fingerprint.ts`；②`d96fa7f6…` 同法命中 `apps/api/src/modules/auth/auth.controller.ts`；③端到端复算 `git show 112e6d26:<该件> | git hash-object --stdin` 恒等 `f764eba3…`——git 对象 ID=SHA-1(内容)·**值=内容摘要密码学亲证**。
- **B（run-manifest 64-hex=scriptSha256 溯源摘要）**：`git show 546b1c48:packages/ai-runtime/test/token-coalesce.proof.ts | shasum -a 256` = `54b651e5…` 与收据值恒等亲证（现树 blob 已演化为 `61f7c854…`≠收据值·恰证收据钉收据时点内容=溯源摘要非凭据）。
- **C（dbhy1 64-hex=迁移内容摘要）**：`shasum -a 256 packages/db/migrations/0011_trace_tokens.sql`=`63781955…` 恒等+`0130_model_invocation_same_key_claim_join.sql`=`273363a8…` 恒等（两行现树复算亲证）。
- **D（自描述夹具注记核）**：五 proof 件 in-file 注记/值面逐一亲读（§0.3 行5-9 值性质列）——api-harden :22「隔离库」+:275 臂注+randomUUID 角色配对；db-id-v7 :27「隔离库·非密钥」原文；db-acl2 值面 v1 形制自描述；langfuse 实参面 fixture 字样+纯函数导入面（../src/index.ts）；dbhy1 台账面=130+ 行迁移名-摘要对全表（仅键名含关键字两行触发）。

## §1 归因（诊断席定谳转录+本席复证）

1. **诊断席定谳（转录）**：main secrets-scan 32+存量 6=全史 38 findings·**38/38 全假阳性零真凭据**·推荐候选 a（逐文件 allowlist path 精确锚）·b/c/d/e 四候选 Ban（§1.3）。本席三层复证（§0.2）恒等：38=origin/main 首亲链全集（rev-list 亲证）·结论成立。
2. **与 gitleaks-placeholder-remedy 刀分野（派单令明示+本席定稿）**：彼刀=invoke-model-delta 2 findings（--all 面 4·含 squash 孪生）·已 EXEC 落卷（allowlist 第 8 条目·`e29e7874`·待 post-prove 双审）；本刀=其余 **10 firing path/8 文件** 103 findings（--all 口径·含诊断 38 宇宙全 34 行——彼刀 4 外全量）；两刀合拢=**--all 全宇宙 107 清零**（joint 干跑 0 findings 亲证）。
3. **为何今日才曝（滑窗机制承 gpr §1-3）**：gitleaks-action@dcedce43 对 PR 窗取 `--no-merges --first-parent <base>^..<head>`·窗下缘随 PR 提交表（cap 250）滑动——`112e6d26` squash 将 feat 链内容以单 commit 落入 main 窗内首曝 32；feat 链五 commit（§0.1-7 行 29 项）与 side 孪生（40 项）仍在未来窗可达域——**本刀 10 条目含归档前原路径两锚即为此域清零而设**（仅锚归档现路径则本刀自身 PR 窗滑至 `7da52c5b`/`546b1c48` 时原路径 25 项复曝·gpr run 38821647684 同机制先例）。
4. **值定性（裁决底座）**：四重证据（§0.4）+八文件值性质一句话（§0.3）——收据/台账/溯源摘要三族（A/B/C 密码学亲证）+测试夹具自描述假值五族（D 注记亲读）·**零真凭据**。

## §1-修法（甲 · allowlist path 精确锚 10 条目 · 零码动）

**修①（本刀唯一施工面）**：EXEC 阶段（协调方授权后）在 `.gitleaks.toml` `[allowlist]` `paths` 数组 **ag24 条目（:26）之后、`]`（:27）之前 append 恰 10 条目**（每条=注释 1-2 行+path 锚 1 行·合计 **+24/−0**·派单估算带 +21~27 内·沿 626ac3cc/98d4bab7/bb1627d8/gpr 同形制逐条精确单文件 `(^|/)…$` 锚）·其余全部行零字节改·**8 文件本体与一切产品码零字节零触**。**条目定稿（本席起草·双审/协调方可裁改后落·插入位行锚对届时 tip 重 pin）**：

```toml
  # 归档收据内容摘要·非凭据：batch23 归档 c12-typecheck turbo dry 收据 24 处 40-hex 值均为 git blob 对象 ID
  # （SHA-1 内容摘要·cat-file/rev-list --objects/hash-object 三重复算亲证）·键名文件名词面误触关键字。
  '''(^|/)receipts/archive/2026-09-batch23/receipts/c12-typecheck/02-turbo-dry\.json$''',
  # 同内容归档前原路径（batch23 归档挪移前·feat 首亲链 7da52c5b 引入·未来 PR 窗可达）·值面逐字节恒等。
  '''(^|/)ai-docs/delivery/receipts/c12-typecheck/02-turbo-dry\.json$''',
  # 归档收据溯源摘要·非凭据：S4a run-manifest scriptSha256 64-hex=收据时点 proof 文件 SHA-256
  # （对 546b1c48 blob shasum 复算恒等亲证）·键名 token-coalesce 词面误触关键字。
  '''(^|/)receipts/archive/2026-09-batch23/receipts/tokstream-s4a/2026-10-07/run-manifest\.json$''',
  # 同内容归档前原路径（feat 首亲链 546b1c48 引入·未来 PR 窗可达）·值面逐字节恒等。
  '''(^|/)ai-docs/delivery/receipts/tokstream-s4a/2026-10-07/run-manifest\.json$''',
  # 测试夹具假值·非凭据：N1 NOINHERIT 低权 login 夹具口令（in-file 注记「隔离库」自证·随机角色名配对·
  # assertIsolatedTestTarget 隔离库内建消·值自描述 proof 口令形）。
  '''(^|/)apps/api/test/api-harden-shared-state\.proof\.ts$''',
  # 测试桩假 key·非凭据：dbacl2 pgp_sym_encrypt 隔离库 ACL 快照差分参数（值自描述 dbacl2-enc-key-v1 形制）。
  '''(^|/)packages/db/test/db-acl2\.proof\.ts$''',
  # 测试桩假 key·非凭据：dbid1 隔离库加密参数 env 注入（in-file 注记「隔离库·非密钥」自证·值自描述 proof_dbid1 形）。
  '''(^|/)packages/db/test/db-id-v7\.proof\.ts$''',
  # 迁移内容摘要台账·非凭据：dbhy1 迁移 SHA-256 溯源对（sha256sum 两行复算恒等亲证·
  # 键名 trace_tokens/same_key_claim_join 词面误触关键字）。
  '''(^|/)packages/db/test/dbhy1\.proof\.ts$''',
  # 测试夹具假值·非凭据：Langfuse 评测合同抽样策略标签（纯进程内函数实参·值自描述 fixture 字样·零网络语义）。
  '''(^|/)packages/ai-runtime/test/langfuse-evaluation-contract\.proof\.ts$''',
  # 负对照探针假值·非凭据：退役 ECS 预览验证脚手架 curl 负向注入头（值自描述 must_not_forward 字样·历史件已退役树外）。
  '''(^|/)ops/ecs/verify-preview-web\.sh$''',
```

- **干跑收据（本席亲跑·/tmp 临时 config·仓库零触·同 8.30.1 同 `--log-opts=--all`）**：修法前 **107** → 追加上 10 条目后 **4**（removed 恰 **103**=§0.3 行1-10 全部 findings 逐 path 消尽零残留·added 0·余 4=彼刀域 invoke-model-delta）→ 再追彼刀条目（gpr EXEC 已落形）后 **0**（joint 口径·**两刀合拢=全宇宙清零亲证**）。EXEC 期对本仓正式 config 复跑同门。
- **条目数口径如实化**：派单「7（或 9）条目」系诊断席按 main 面 7 文件（或并存量 9 文件）逐文件估算；本席普查定稿=同内容归档挪移产生**双路径引入面**（§0.2 第 2 层·blob 恒等亲证 §0.1-4/5）·逐文件=逐 firing path 方得窗可达域清零——**定稿 10 条目/8 文件/24 行**（10=2 归档现路径+2 归档前原路径+4 code proof+langfuse+verify-preview·invoke-model-delta 归彼刀不计）·超额于派单估算的 2 条目=归档前原路径臂·普查新实·如实登记不裁条目。
- **修②（CI 终审归属）**：本地复刻系因果闭环证据·**翻面终审=push 后 CI run 逐 job 观察（secrets-scan 绿）**·push 归协调方/pusher（⛔本刀 push）。

## §1.3 否决清单（veto · 双审/EXEC 违反任一即 FAIL · 诊断席四 Ban 转录+本刀三附加）

1. **b（目录级 allowlist）否决+Ban**：paths 条目必须精确单文件 `(^|/)…$` 锚定形（§0.1-1 先例全部如此·gpr §1.3-3 同源）·禁 `.*`/目录级/前后放宽——目录级条目=未定性面整目录机械豁免·破 header 铁律护栏语义。
2. **c（洗史）否决+Ban**：rebase/filter-branch/重写收据或归档以消灭历史 findings=①收据/归档件系 SSOT 台账（batch23 归档系既有刀落卷·返工即洗史）②gitleaks 按 commit patch 归因·已 push 历史永在窗内③campaign ⛔force-push 纪律。
3. **d（untrack 代码/收据文件）否决+代码硬阻**：`git rm --cached` 五 proof 件=proof 门面失锚（prove/typecheck/lint 引用面破）·收据件出树=台账断链——零码纪律与门矩阵双破·Ban。
4. **e（规则收窄）否决+Ban**：收窄/降熵/停用 generic-api-key 或 curl-auth-header 共享规则=全仓真泄漏隐藏面·ci.yml :19 共享扫描语义弱化·config header :3 自缚铁律——Ban 触 `[extend]`/规则定义/熵值/regexes 现行四条件（gpr §1.3-2 同源转录）。
5. **Ban 重复彼刀条目**：invoke-model-delta 条目归 gpr 刀（其 EXEC 已落）·本刀不重复 append（重复条目=同锚冲突面+职责越界）·并线时两支线同锚位 append 沿并集解·落卷后 paths 条目总数=本刀 10+彼刀 1+既存 7=18。
6. **Ban 值面直引自曝（gpr R1-a/R1-c 承接制度化）**：本卷及后续 rev/EXEC 增补文字面禁「关键词+赋值符+10+ 连续值字符」直引形（值面一律「取值」动词转写+6 位截断）——gitleaks 按 commit patch 归因·值面直引一经 push 不可修·唯 push 前 amend 或allowlist 收编（后者涉真凭据掩蔽面·Ban）。
7. **Ban 归档面重移动/删档/重打包**：`receipts/archive/**` 与 `ai-docs/delivery/receipts/**` 收据件本刀零字节零触（读算零触分际）·挪移即洗史（承②）。

## §2 门矩阵（每条可独立判定 · EXEC 期全跑 · 本席已亲跑项如实登记）

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| 1 | 本地 gitleaks 复刻扫描 | `gitleaks git . --log-opts="--all" --config .gitleaks.toml`（8.30.1 同 config·CI latest v8 终审另计） | **目标 9 文件 findings=0（两刀合拢口径）**：本刀 10 path removed 恰 103 零残留（干跑已证 107→4·removed 逐 path 清点 §1-修法）+彼刀域 4 项随 gpr 并线清零（joint 干跑=0 亲证）；EXEC 期对正式 config 复跑留收据（届时若 gpr 未并线·余 4 项=彼刀域如实登记非本刀残留） |
| 2 | 既存面清点 | 修法前后两 JSON 快照差集 | **removed 恰 103/added 0**·余面=彼刀 4+零他（干跑收据 §1-修法·快照 /tmp 易失件不提交·数字随 §9 落卷） |
| 3 | s4b prove 邻面 | `pnpm s4b-invoke-delta:prove`（run-e2e-isolated 隔离 PG） | **EXIT=0**（本刀零码动·proof blob `e81ac5ed9afa` 恒等门面零变·彼刀域邻面行使·需隔离 PG 容器·按协调方矩阵令） |
| 4 | typecheck | 根 turbo typecheck 面 | **原值**（零码动·零 TS 面） |
| 5 | lint | lint 十二包面 | **原值**（零码动） |
| 6 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0**（起草基线亲跑：2169 scanned ≤ cap 2184·本卷落卷后预期 2170 ≤ 2184·本卷系唯一新增受管件） |
| 7 | markers 五类 | 改动集 grep（词族=`scripts/i6-239-gates.proof.mjs:151-163` 运行时组装四词+冲突标记对 · **词面本卷不复抄防自匹配**） | **零新增命中**（起草改动集恰 1 .md·EXEC 期改动集=本卷 .md+.gitleaks.toml 逐词亲跑） |
| 8 | diff 面+本卷自扫 | `git diff --numstat HEAD` + 本卷 .md 值面 gitleaks 自扫（detect --no-git 指向 harness 面） | 起草阶段=**恰 1 tracked=本卷 .md 纯新增零删改**+自扫 0 findings；EXEC 落卷=**恰 2 tracked=.gitleaks.toml（+24/−0）+本卷 .md**·零他 tracked 路径·自扫 0 findings（gpr R1-a 教训制度化·落卷前后各一扫） |

## §3 范围外（边界清单 · 越界即 FAIL）

1. §0.3 行1-10 八文件本体（两收据+五 proof+verify-preview-web.sh）——**零字节零触**（修法面=仅 .gitleaks.toml·文件 blob 恒等为本刀卖点）。
2. `packages/ai-runtime/test/invoke-model-delta.proof.ts` 及其 allowlist 条目——彼刀域（§1.3-5）·零触。
3. `.github/workflows/ci.yml`/gitleaks-action pin/规则定义/熵值/regexes 三条——零触（§1.3-4）。
4. `.gitleaks.toml` 既有 7 条目+header 三行——零字节（只 append·EXEC 后共 17 条目；gpr 并线后 18）。
5. `receipts/archive/**`/`ai-docs/delivery/receipts/**` 全体收据件——读算零触（§1.3-7）。
6. SSOT 四卷（LEDGER/checklist/backlog/issues-master）——只读零触·行/统计零改（本刀不自建行·立项出处=派单令转录在卷·沿 gpr §3-5）。
7. 历史迁移+`sql/` 影子面+锁文件——零触零占号。

## §4 依赖与迁移号

零硬前置刀——先例三刀（626ac3cc/98d4bab7/bb1627d8）已全并入基线（.gitleaks.toml 现行形即证）·sibling gpr 刀系**软依赖**（并线次序不影响本刀条目有效性·合拢口径待其 post-prove 双审+并线兑现）。**迁移号=零**（零迁移零 DDL）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写操作只在本 worktree 一次 docs commit·⛔push⛔merge 主线）；Ban coding（零产品码/零脚本/零 spec/零夹具/零迁移/零锁文件·八文件 blob 恒等）；Ban self-approve（pre-exec dual=两独立外席 · alone≠dual）；Ban b 目录级（§1.3-1）；Ban c 洗史（§1.3-2）；Ban d untrack（§1.3-3）；Ban e 规则收窄（§1.3-4）；Ban 重复彼刀条目（§1.3-5）；Ban 值面直引自曝（§1.3-6）；Ban 归档面重移动/删档（§1.3-7）；Ban 为绿放宽任何门（含 docs:check/markers/diff/gitleaks 复刻）；Ban retry-to-green/Ban 只留绿 attempt；Ban 伪造已读/已验来源（§0 逐条亲证·扫描/干跑回执随交付报告）；Ban 触 §3 全部域；Ban Key 物料（本卷只录 6 位截断形与定性·禁全值/.env 值/fingerprint 入树）；Ban 预占迁移号。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零调用零消耗）。

## §6 est live=0

本刀零模型真实外呼零 DB 连接零容器：起草 turn 全只读+本地 gitleaks 扫描/干跑（纯 git 对象遍历·零网络零外呼）+shasum/git hash-object 本地复算；EXEC 期门行使面=gitleaks 复刻扫描+docs:check+markers+git diff（全本地零外呼）+`s4b-invoke-delta:prove`（隔离 PG·proof 本身 fake transport 零模型外呼·彼刀域邻面·按协调方矩阵令行使）。`actualSpendCny=null`。

## §7 markers=0（卫生声明）

本刀改动集恰 1 .md，五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；五类标记词不在卷内复抄，避免自匹配——沿 g7k-reds-remap/ag-d/gpr 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual。**（2026-10-16 EXEC 翻面·§9 七字段+P2 两件·八门全绿·merge `819f57d8`·post-prove 双审两外席待派）起草席写完即停零码动（起草改动集恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（本卷非授权本身）；③EXEC 立项不得改 §1-修法条目实质与 §1.3 否决/§5 Ban/pins（改则回炉重审；插入位行锚/blob 照 §0 对届时 tip 重 pin）。**alone≠dual（单席自验不计双审）· Dual PASS ≠ 开工 · allowlist 落卷≠CI 翻面（翻面终审=push 后 CI 观察·push 归协调方/pusher）·合拢口径兑现=gpr 刀 post-prove 双审+并线后**。

**停止条件（四类 · 命中即停手上报）**：
1. **现场漂移**：EXEC 立项时对届时 tip 重 pin——`.gitleaks.toml` blob `323de9b0ad77`/八文件 blob（§0.1-4/5+§0.3）漂移如实改锚；任一 firing 行锚漂移超 ±3 或**值面换形（出现真值形 Key/全值 40/64-hex 与摘要复算不恒等）** → 停手上报（不得就地改定性）。
2. **机制不满足**：复刻扫描若出现本刀域第 11 条 firing path·或干跑 removed≠103/留残留/joint≠0 → 停手上报（§0.2/§1-修法机制前提被推翻）。
3. **越界需要**：执行中若需触 §3 任何域（八文件本体/彼刀域/规则定义/既有 allowlist 条目/收据面）→ 停手上报。
4. **验收红不可修**：§2 门 1/6/7/8 任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门）。

## §9 EXEC 记录（2026-10-16·七字段+P2 两件·头行按项级标签·§0-§8 原文零字节改·append 保史·STOP 三处置定）

**授权链**：pre-exec 双审两独立外席 BOTH PASS 落卷（席1 agent_1591b0a6+席2 agent_2715668b 会签）→ 协调方明示 EXEC 授权（派单五序）→ 本席 EXEC。**§1-修法条目草案逐字落卷/§1.3 否决清单/§5 Ban/pins 十一值零字节零触**（§8 条款③）。

1. **重 pin 全表**（对 merge `819f57d8`=双亲 `c5f3752d`+`5b53dd41`·merge-base `7e8ada73`=起草基线·git ls-tree/rev-parse/merge-base 亲证）：届时 tip=`5b53dd41`=gitleaks nail 波**恰等派单下界**；`.gitleaks.toml` blob 漂 `323de9b0ad77`→`e18ec6dc0deb`（**彼刀 gpr EXEC 第 8 条目随并线在位·paths 7→8·§0.1-1 预置「同锚位 append 并集解」兑现·插入位行锚如实更=彼刀条目 `:29` 后、`]` 现于 `:30` 前**）；十 firing path blob 重 pin：归档双件 `d0bb85de`/`ed35a002` 恒等 §0.1-4/5 锚·归档前原路径对 `7da52c5b`/`546b1c48` rev-parse 恒等（=`d0bb85de`/`ed35a002`）·五 proof 在树 blob 亲读（api-harden `157376c2`/dbhy1 `aea7486a`/db-acl2 `31ce9fb5`/db-id-v7 `c7a7e99e`/langfuse `2a801b57`）·verify-preview-web.sh 退役树外（对 `cc83424b` blob `492fbb71` 亲证）；行锚 ±3 复核=十 path **全零漂**（api-harden :278/dbhy1 :45+:164/langfuse :93+:109+:110/c12 归档 24 行全落 §0.3 行集/run-manifest 归档 :11 恒等·db-acl2 观测 :163+:172 与 db-id-v7 :25+:28 恰=卷面「旧 blob+现树」双锚系预置非漂移）·**值面零换形**（停止条件①未触发）；package.json `:537-538` prove 注册行恰等零漂；ci.yml secrets-scan 锚漂 −1 行内如实更（job `:10`/checkout `:15-16`/name `:17`/pin `:18`·gitleaks-action pin `dcedce43` 恒等·结论零变只更行号）；`112e6d26` 非 HEAD 祖先=origin/main squash 链属（`--all` ref 宇宙可达·§0.2 三层口径自洽）·`7da52c5b`/`546b1c48`/`fc472d97`/`cc83424b` 祖先亲证 EXIT=0；merge --no-ff EXIT=0 **零冲突**（merge-tree 预演先证 EXIT=0·ort 4 files +153/−0·冲突沿并集解预置未触发·⛔pull --rebase 未用）。
2. **修法落点（§1-修法①·恰 1 码面 +24/−0）**：`.gitleaks.toml` paths 数组彼刀条目（`:29`）后 append 恰 24 行=10 条目（2 归档现路径+2 归档前原路径+4 code proof+langfuse+verify-preview·每条=注释 1-2 行+path 锚 1 行·**§1-修法 fenced 定稿逐字节落卷**）·其余全行零字节·paths 8→**18** 条目（=既存 7+彼刀 1+本刀 10·§1.3-5 恰等）·regexes 三条零字节（§1.3-4 Ban 未触）·header 三行铁律零字节·八文件本体与一切产品码零字节零触（blob 恒等卖点兑现·`git diff --numstat`=24/0 亲证）。
3. **复刻扫描 census 式快照（门 1+门 2·本地 gitleaks 8.30.1 同 config·正式 config 复跑收据）**：命令行 verbatim=`gitleaks git . --log-opts="--all" --config <config> --report-format json --report-path <快照>`（快照落 /tmp 易失件不提交·数字随本节落卷）。**正式 config 修法前（8 条目含彼刀·merge 树）=103**=本刀 10 firing path 全集零他·**彼刀域 0**（并线条目生效亲证·组分沿 gpr §9-POST E1 勘正口径 generic 97+curl 6）；**三帧对照（§1-修法干跑正式复刻）**：Frame A 修法前=起草基线 7 条目 config（blob `323de9b0ad77` 落 /tmp）扫 `--all`=**107**（=本刀 103+彼刀域 4·§0.2 全宇宙恒等复证·fetch 并线后新 commit 零新增 findings）→ Frame B 修法后=Frame A config+本刀 10 条目=**4**（残留恰=彼刀域 invoke-model-delta 4·本刀零残留）→ Frame C joint=正式 18 条目 config=**0**（EXIT=0·**两刀合拢=--all 全宇宙 107 假阳性面清零亲证**）。**门 2 差集**：Frame A↔B fingerprint 多重集 removed 恰 **103**/added **0**（逐 path=c12 原路径 48+c12 归档 24+dbhy1 6+verify-preview 6+langfuse 8+db-acl2 3+db-id-v7 3+run-manifest 原路径 2+api-harden 2+run-manifest 归档 1·langfuse :109 同行双命中二处系 gitleaks fingerprint 形制折叠·多重集口径恰 103 与 §0.2 本刀口径恒等·§0.3 行 9「同行双命中」预置兑现）。
4. **门矩阵八门全表（EXIT 原值）**：①gitleaks 复刻三帧 107→4→joint **0**（EXIT=0·全宇宙清零·**终审=push 后 CI secrets-scan 逐 job 观察·push 归协调方/pusher·⛔本刀 push**）；②`s4b-invoke-delta:prove` **EXIT=0**·12 PASS 全绿·「✓ TOKSTREAM S4b invoke 观察缝矩阵全部通过（零模型外呼·actualSpendCny=null）」·隔离收据 outcome=passed/exitCode=0/`durationMs=13576`（`.tmp/isolated-proof-receipts/2026-10-16T03-47-20-006Z-…json`·startedAt/finishedAt 自洽亲证）·**首试绿**（裸 worktree 环境整备前置=`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·gpr attempt1 基建红教训制度化于行使前·非 retry-to-green）；③typecheck `npx turbo run typecheck` EXIT=0·**Tasks: 8 successful, 8 total**；④lint `npx turbo lint` EXIT=0·**12 successful, 12 total**（512 行跨树路径系 turbo 同输入哈希缓存回放非本树行使·如实登记→**`--force` 全量本树重跑 EXIT=0·12/12·跨树路径零**·五贴线恰等 web 601/root 5235/api 1421/worker 954/ai-runtime 628 本树 package.json 逐值亲证零漂）；⑤docs:check EXIT=0 **2171 ≤ cap 2184**（=gpr nail 树 2170+本卷 1·余量 13·卷面 §2-6 预期 2170 系起草树时值如实更）；⑥markers 五类（`scripts/i6-239-gates.proof.mjs:151-163` 运行时组装四词+冲突标记对·词面不入卷防自匹配）改动集（`.gitleaks.toml`+本卷 .md）grep **零命中**·落卷后终扫随 commit 前复行使见交付报告；⑦diff 面 `git diff --numstat HEAD` 恰 **2 tracked**=`.gitleaks.toml`（+24/−0）+本卷 .md（§9 append+STOP 三处置·−3 系 Status 头/§8 头行/卷尾三行载体翻面）·零他 tracked 路径；⑧卫生=`.env*` ABSENT·本卷 .md 自扫 detect --no-git **0 findings**（落卷前后各一扫·gpr R1-a 教训制度化）·est live=0（gitleaks 复刻=纯 git 对象遍历零网络+prove=fake transport 零模型外呼）·`actualSpendCny=null`。
5. **分野合拢与承登链兑现态（gpr 刀 R5/§3-4 挂链承接）**：gpr EXEC「常设曝面 103 承登（checklist nul-escape STILL OPEN「gitleaks 滑窗」）」之承接面由本刀 joint 0 **清零兑现**=滑窗可达域含归档双路径臂（未来 PR 窗 `7da52c5b`/`546b1c48` 域 25 项复曝路径同步封死·gpr run 38821647684 机制先例闭合）；彼刀域 4 项本刀零触零重复条目（§1.3-5 兑现·并集解后 paths 18 恰等·同锚位零冲突零丢）；R5 遮蔽语义如实化沿承=path 锚全文件×全规则机械豁免（本刀实测豁免面=消 103 项·generic 97+curl 6·regexes 三条/规则定义/熵值/extend useDefault 零字节·§1.3-1/4 Ban 未触）；c12/run-manifest 归档双路径 blob 恒等亲证=归档挪移零洗史（§1.3-7 未触·收据件读算零触）。
6. **census 式快照登记（三帧对照终值）**：修法前 107（Frame A·7 条目基）→修法后 4（Frame B·+本刀 10·残留=彼刀域 4）→joint 0（Frame C·正式 18 条目·**全宇宙假阳性面清零达成**）；正式 config 帧前值 103（8 条目并线态）如实并存；收据=修法前后四 JSON 快照（/tmp 易失件不提交）+`git diff` numstat 亲证·数字随本节与交付报告落卷；commit 后 secrets-scan 终审=push 后 CI 逐 job（本刀 STOP 后归协调方/pusher）。
7. **STOP 终态**：三处（Status 头/§8 头行/卷尾）置 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·allowlist 落卷≠CI 翻面（翻面终审=push 后 CI 观察·push 归协调方/pusher）·⛔push ⛔merge 主线 ⛔force-push。

**P2 两件（前瞻风险与承登链·随卷登记）**：
- **P2-1（18 条目总账前瞻风险）**：paths 总账三刀三波 7→8→18 增势下，每条目=全文件×全规则机械豁免（gpr R5 遮蔽语义如实化沿承）——总账越大，header 三行铁律「Do NOT use this file to hide real credentials.」护栏语义被稀释的前瞻风险越高；后继刀凡新 firing path 应优先值面改形/件退役路径、allowlist 仅作假值终答，且 secrets-scan 再波动时应周期性对 18 条目逐条重验「blob 恒等+值面假值定性」仍成立（本句系 §1.3-1/4 护栏语义随卷承登·非 SSOT 新行·四卷零触）。
- **P2-2（扩面挂链 checklist nul-escape STILL OPEN「gitleaks 滑窗」承登链）**：本刀 joint 0 兑现即 gpr 卷 §9 字段③/R5 之挂链所指——checklist `Line secret-checker-nul-guard nail` 段 STILL OPEN 行「secrets-scan 滑窗旧提交 findings（…·已知非新曝）」与 `Line gitleaks-placeholder-remedy nail` 段 STILL OPEN 行「archive+code 面扩围刀起草中（38/38 全假阳性·sibling 刀）」两承登位所指之 archive+code 面 103 项由本刀清零；行翻面权归协调方（本刀不自建 SSOT 行·四卷只读零触·沿 §3-6）；链路溯源自卷可证=gpr 卷 §9 字段③「常设曝面 103 承登」→本卷 §9 字段5/本 P2-2→checklist 两 STILL OPEN 行。

---

*GITLEAKS-ARCHIVE-EXPAND REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（2026-10-16 EXEC 落卷·§9 七字段+P2 两件·merge `819f57d8`·八门全绿·joint 0 全宇宙假阳性面清零·post-prove 双审待派） · ⛔push · alone ≠ dual · base `feat/mysql-schema-skeleton` @`7e8ada73`（=起草时 origin tip·fetch 亲证=dcw nail·派单下界恰等）· worktree `meetwise-gae` · branch `line/gitleaks-archive-expand`（建前双查无同名）· 立项出处=协调方派单令（archive-gitleaks 诊断席候选 a 承接·38/38 全假阳性零真凭据）+gpr 刀 sibling 分野 · 普查定稿三件=三层宇宙（main 首亲链 38=诊断宇宙恒等复证/+feat 链 29 未来窗可达/+side 40 → --all 107）+四元组清点表（10 firing path/8 文件 103+彼刀 4）+四重密码学亲证（blob 对象 ID/scriptSha256 复算/迁移摘要两行/自描述注记核）· 修法=.gitleaks.toml 恰 1 文件 +24/−0 十条目（含归档双路径臂·派单 7~9 条目口径与分野收敛值如实登记）· 干跑 107→4（removed 恰 103 零残留）→joint 0（两刀合拢全宇宙清零）· §1.3 否决=诊断四 Ban（b 目录级/c 洗史/d untrack 代码硬阻/e 规则收窄）+三附加（Ban 重复彼刀条目/Ban 值面直引/Ban 归档重移动）· 门矩阵八门 · 迁移号=零 · est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · Ban self-approve · Dual PASS ≠ 开工 · STOP*
