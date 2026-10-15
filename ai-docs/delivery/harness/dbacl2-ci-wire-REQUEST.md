# DBACL2-CI-WIRE REQUEST — db-acl2 CI 纳入刀（ci.yml 增 1 步·isolated-runner 恒同形 fail-loud·批表 #142 半闭之另一半·恰 1 workflow 文件·纯增 4 行·零产品码零迁移·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停·pre-exec 双审两外席待派·Ban self-approve·alone≠dual·Dual PASS ≠ 开工）

**席位**：DBACL2-CI-WIRE REQUEST 起草席（协调方派·读码定稿+亲证实测+起草）。
**基线**：`feat/mysql-schema-skeleton` @ `0036ddd8`（fetch 后 origin tip 亲证·含 i18n nail 波 tip：UC003-FOLLOWUP i18n 后刀 nail `79382f4d`+uc003-arm4-filter nail `5a0bf9e4`+qbank-scope-fix nail `5ef0b505` 均 is-ancestor 在史）· 分支 `line/dbacl2-ci-wire`（建前 `git branch --list "line/dbacl2*"` 零命中·`git worktree add ../meetwise-dcw -b line/dbacl2-ci-wire origin/feat/mysql-schema-skeleton` 本席亲立·直落 origin ref 沿 uc003-arm4 先例）· 工作树 `meetwise-dcw`（仓根同级）。
**立项出处**：①台账 `ai-docs/delivery/harness/product-campaign-LEDGER.md:86` 批5 5B 行 #142 半闭注记+`:463` DB-ACL-RESIDUAL 补充行（「批表 #142 不翻（CI 纳入半未在本刀授权面仍开放·ci.yml 零 db-acl2 命中亲证·维持半闭不计口径如实注明」=7ac68ed7 nail 亲笔）+L-05/L-06 台账项残面半；②DB-ACL-RESIDUAL 残面刀 nail `7ac68ed7`（db-acl2:prove 基线红翻绿 38/38 落主线·**翻面后 CI 纳入重裁=本刀**）；③归置卷 `ai-docs/delivery/harness/ci-wiring2-prove-placement.md:25-26/:106-109`（原裁「不裁入（基线红）」·裁据已灭失·§1.3）；④形制范本 `ai-docs/delivery/harness/ci-wiring3-REQUEST.md`（四新步接线形·isolated-runner 恒同形 fail-loud·§0-§8+STOP 三条款+四类停止条件口径逐字对齐）·本刀=ci-wiring3 单步版。

## §0 现状锚（起草席亲证 @`0036ddd8`·rg/sed/js-yaml/git hash-object/实跑逐条实测·**EXEC 立项照本节对届时 tip 再重 pin**——结论不变则只更行号/blob）

### 0.0 防重双对表 + 在飞交叠

- `git branch --list "line/dbacl2*"` 建后恰 1 命中=本席 `line/dbacl2-ci-wire`；`ls ../ | grep meetwise-dcw` 恰 1 树=本席工作树；`ls ai-docs/delivery/harness/ | grep dbacl2-ci-wire` 建前零命中→落卷后唯一同名卷=本卷。
- **全分支 db-acl2 接线扫描**：对全远端+本地分支树内 `.github/workflows/ci.yml` grep `db-acl2`——**恰零命中**（本席逐支扫描亲证·无任何在飞线已接线本门=本刀面无人在做）。
- **在飞交叠复核（EXEC 立项日重跑）**：对在飞线（`line/qbank-integrity-chain`/`line/e2e-runner-stale-build-guard`/`line/i18n-metadata-ssr` 本地 ccl 镜像等）执行 `git log 0036ddd8..<线 tip> -- .github/workflows/ci.yml`——起草日三线**恰 0 命中**（对本刀唯一触面零交叠亲证）；`line/db-hygiene`（tip 2026-10-08 陈旧）/`line/g7w-tail-death`/`line/uc003-followup` 三线各有 ci.yml 触 commit 非本刀面（前者 EXEC 历史残线·后两者=并主线 merge 零自触）·如实登记。立项日任一线出现对 ci.yml 新触→触停止条件「现场漂移」停上报。

### 0.1 blob 锚表（`git hash-object` 8 hex 亲算 @`0036ddd8`）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `.github/workflows/ci.yml` | `97252708`（**361 行**） | **本刀唯一码改件**。`:25` verify job（`runs-on: ubuntu-latest`·`:28` DATABASE_URL=dev 库 54329）·`:32-:34` 三 `uses` 步·`:153-:160` db:up+wait-for-postgres·`:162-:172` db:prove/migrate/drift 门·`:175-:190` neg 六步+uc033（**isolated-runner 形接线先例**=纯 `- name:`+`run: pnpm <target>` 步·零 env 零 cond 零 retry·注释自证「与 api:validate 同 runner 形」）·`:191-:192` **DBHY-1 卫生刀 prove 步（=本刀插入锚·js-yaml 步序 index 37/1-based 38）**·`:193-:194` 跨供应商 failover 步（=插入后下一既有步）·`:245-:262` ci-wiring3 四新步块（scor-parity 邻位·**接线形逐字范本**）·`:337-:344` CI-WIRING 纪律注记块（只增不减纪律自证）·**js-yaml 解析 verify steps=102**（3 uses+99 name/run·本席亲跑）·`db-acl2` 全文件 grep **零命中**（L-05 nail 席亲证承继+本席复证·`JSON.stringify(steps).includes('db-acl2')===false`） |
| `package.json`（根） | `3b04b871` | `:407` `db-acl2:prove`→`node scripts/run-e2e-isolated.mjs db-acl2:prove:raw`+`:408` `…:raw`→`pnpm -C packages/db prove:db-acl2`——**注册面已在·本刀零改** |
| `scripts/run-e2e-isolated.mjs` | `0787a7ff`（3201 行） | isolated-runner 本体·头注自证：临时 `meetwise-e2e-*` 容器只删自建·收据写 `.tmp/isolated-proof-receipts/`（gitignored `.gitignore:15`）·EXIT 码透传 fail-loud。**db-acl2 接线完好亲证**：`:1547-:1558` `db-acl2:prove:raw` 触发集·`:2163` 跑单注册·`:2491-:2492` 命令映射 `['pnpm',['-C','packages/db','prove:db-acl2']]`——**本刀零触** |
| `packages/db/test/db-acl2.proof.ts` | `31ce9fb5` | 门本体（**38 臂**=P0 负门四臂+§3 推导六臂+P1 九臂+P2 五臂+P3 五臂+P4 三臂+P5 六臂·DB-ACL-RESIDUAL nail 改形后形态）·**本刀零触** |
| `.github/workflows/nightly.yml` | `ac47e884` | 零触（ci-wiring2 逐字节 Ban 沿承） |
| `.github/workflows/nightly-ciw2.yml` | `09cd220a` | 零触（同上） |
| `ai-docs/delivery/harness/ci-wiring2-prove-placement.md` | 现树 | `:25` db-acl:prove / `:26` db-acl2:prove「不裁入（基线红）」+`:106-:109` 差集表「接线=恒红门·归属勘明归后刀」——**原裁据面（只读引用·本刀翻据对象·§1.3）** |
| `scripts/i6-239-gates.proof.mjs` | 现树 | markers 五类词族组装处 `:154-:155`（四词运行时拼接+冲突标记对·**词面本卷不复抄防自匹配**）·零触 |

### 0.2 派单简报漂移登记（结论修正如实记·亲证为准）

1. **简报「dbhy1 step 39 邻位」→ 现树 dbhy1=verify 步序 index 37（1-based 38）·插入后新步=index 38（1-based 39）**：js-yaml 机械亲证（`steps[37].name` 始于「DBHY-1」·`steps[38].name` 始于「跨供应商 failover」）——简报 39 系历史口径（PR #108 GitHub UI 序含 runner 隐式步·与仓内 CI 观察注记「step 71/72=qbank 面」同口径族）。本刀行锚以 js-yaml 步序为机械权威·GH UI 序随位注记（§2-12）。
2. **简报「本地实测 ~62s」→ 本席实测 warm 三跑 receipt durationMs 11215/9585/11640（墙钟 11.56s/12.08s/12.08s）**：三跑全绿 38/38 收据在案（`.tmp/isolated-proof-receipts/2026-10-15T20-02-*.json` 三件）——~62s 口径与本树现测不符·归置卷红期读数 11.9s（`:26`）与本测互证·如实登记漂移（Ban 抄简报值顶替实测）。CI 首跑预估与熔断线见 §1.2。

## §1 红事实 + 裁位矩阵（本席亲跑实测 @`0036ddd8`·docker 29.1.3·node 22.22.3·pnpm 10.28.0·零 Key·零模型外呼）

### 1.1 现状

- **ci.yml 零 db-acl2 命中**：`grep db-acl2 .github/workflows/ci.yml` EXIT=1（零命中·与 L-05 nail 席亲证恒等·@`0036ddd8` 本席复证）——**#142 残面之 CI 纳入半仍开放**。
- **门已绿·接线前提成立**：`pnpm db-acl2:prove` EXIT=0 **38/38**（本席三跑·恰 1 语义 run+两次时长复测·收据 `outcome=passed` 三件·两段式迁移重放 manifest count=204 latest=0204 与 nail 门值恒等）——基线红已由 DB-ACL-RESIDUAL nail `7ac68ed7` 翻面落主线，原「接线=恒红门」裁据灭失。
- **邻面现跑绿（邻位安全性）**：`pnpm dbhy1:prove` EXIT=0 **28 断言全绿**（11.07s·插入点邻位步本体亲跑）+`pnpm db-acl:prove` EXIT=0 **62/62**（10.88s·孪生面·**登记不接线**·§1.3-丁）。

### 1.2 门时长实测 + CI 首跑预估 + 预算影响

- **本地实测（warm·同机同树三跑）**：receipt durationMs **9585/11215/11640**（墙钟 11.6-12.1s·区间带 9.6-11.6s 收据口径）——两段式迁移重放（Stage A ≤0143 前缀窗+Stage B ≤0151 窗口+链尾 catchup 204）+隔离容器起停全含。
- **CI 首跑预估**：**band 8-25s**。判据=①同宿 isolated 步 CI 首跑先例（ci-wiring3 四新步首跑 6s/16s/7s/2s vs 本地 10.9/17.5/8.0/2.9·比值 0.55-1.1x·镜像由同 job 前序 isolated 步已拉取缓存不增拉取成本）；②本门为 PG+CPU 双负载（迁移重放两遍+全链 catchup）取上限侧。**熔断=绝对上限 >56.8s 即触「现场漂移」停上报**（宿内最贵件 sse-push 裁入上限硬红线·沿 ci-wiring3 rev2 绝对预算口径·现测余量 ≥2.3 倍）。
- **预算影响**：verify job 步数 **102→103**（恰 +1）·job 墙钟 **+8-25s/跑**（每 per-push 一次·增一个隔离容器生命周期·runner 自清残留 0）——对同宿最贵件（sse-push ~56.7s）不构成超限压力·总 job 时长增幅 <3%。

### 1.3 候选否决（本刀裁位=候选甲·三否决如实落卷）

- **候选甲（采纳）=ci.yml 增 1 步 per-push（dbhy1 邻位·isolated-runner 恒同形 fail-loud）**：判据=①门已绿（§1.1）②合并闸语义（ACL 补授+过度授权负门=安全门·#114「负例门=合并闸语义」裁口径）③时长预算内（§1.2）④接线形有恒同先例（neg 六步/scor-parity/ci-wiring3 四新步）。
- **候选乙（否决·Ban）=维持本地-only 不接线**：**理由失据**——原「不裁入」裁据=归置卷 `:25-:26` 实测基线红（接线=恒红门）；该裁据被 DB-ACL-RESIDUAL nail `7ac68ed7` 翻面灭失（38/38 绿落主线·门矩阵十四门承卷）——**「翻面后 CI 纳入重裁」即台账 L-06 原注记的待办面·维持不接线=失据裁 perpetuate**。
- **候选丙（否决·Ban）=nightly-only 软化**：**L-06 原裁「重裁」对象面**——夜间日跑=对合并闸安全门的软化·直接违背 #114 确立且 ci-wiring2/3 两刀沿用的「负例门=合并闸语义·不作 nightly 软化」裁口径；且 nightly.yml/nightly-ciw2.yml 在 ci-wiring2 起逐字节 Ban（§0.1 blob 锚）。
- **候选丁（否决·登记不接线）=db-acl:prove（dbacl1 孪生面）同批接线**：越界——批表 #142 残面**单指 db-acl2:prove**（LEDGER `:463`「残面单 db-acl2:prove」·DB-ACL-RESIDUAL 授权面同口径）·本刀授权面=恰 1 步；db-acl:prove 现跑绿 62/62（§1.1 本席亲证）但**纳入归属另批**（本卷只登记·Ban 借机扩面）。

## §1-修法（wiring 刀·预期恰 1 码面文件 `.github/workflows/ci.yml`·零迁移零产品码零 proof 零 package.json·纯增 4 行）

- **件①（单门接线步）**：ci.yml DBHY-1 步 `run: pnpm dbhy1:prove` 行（现树 `:192`）之后、「跨供应商 failover」步（现树 `:193`）之前插入以下逐字节内容（纯增 4 行·既有步零重排零删除零改语义·verify steps **102→103**·新增步 js-yaml 步序 index 38/1-based 39）：

```yaml
      # DBACL2-CI-WIRE 接线（dbhy1 邻位·isolated-runner 一次性本地 PG·fail-loud 红即阻断）。
      # pgp_sym_encrypt EXECUTE 补授门（38 断言·本地实测 warm 9.6-11.6s·基线红已由 DB-ACL-RESIDUAL nail 翻绿）
      - name: DB ACL pgp_sym_encrypt 补授门（两段式迁移重放+42501 负门+过度授权负门·隔离一次性 PG）
        run: pnpm db-acl2:prove
```

- **形制逐字对齐 ci-wiring3 先例**：注释行（裁位亲证+断言数+本地实测时长）+`- name:`（中文述名+机制括注）+`run: pnpm <脚本名>` 两行形·零 env 零 if 零 retry 零 continue-on-error——与 neg 六步/scor-parity/ci-wiring3 四新步恒同形·红即非零退出阻断合并（fail-loud·脚本体 EXIT 透传自 `run-e2e-isolated.mjs`）。
- **件②（收据）**：EXEC 期 `ai-docs/delivery/receipts/dbacl2-ci-wire/00-exec.md`——七字段（门矩阵全表+EXIT 原值+复跑时长与 PASS 计数+diff numstat+重 pin 全表+CI 首跑实测时长回填+偏离清单）·untracked 口径沿 ci-wiring3 件④ 先例。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准）

1. **ci.yml 解析门**：`node -e`（js-yaml@4.3.2 仓内 realpath 加载）parse EXIT=0·verify steps=**103**（基线 102+1·**新增步数熔断=恰 1**·多即停）·且**剪除新增步后余 102 步 name 序列对基线逐位恒等**（js-yaml 抽取比对·错位即停=既有步被重排）。
2. **actionlint 告警集恒等（CI dry-run 口径）**：`actionlint .github/workflows/ci.yml` 告警集对基线**恒等**（基线=现树 3 shellcheck warning·`:146`×2+`:155`×1·**既有告警非本刀面·如实登记**）——**零新增告警即过**·出现任何指向新增步的告警即停。yamllint 不在仓（如实登记·actionlint 为本地可用 dry-run 工具 `actionlint 2.x`）。
3. **db-acl2:prove 实跑绿**：`pnpm db-acl2:prove` 恰 1 run EXIT=0·PASS **恰 38**（**熔断=0 容差**·实测≠38 即触「现场漂移」停）·时长 ≤56.8s 熔断（§1.2）·对照预估 band 8-25s 出入超 band 且 ≤56.8s 时如实登记不熔断。
4. **邻面纯增机检**：`git diff <届时基线 SHA> -- .github/workflows/ci.yml` 删行（`^-`）**恰零**·纯增**恰 4 行**（块头注 2+name+run）——出现任何删行/改行即停（只增不减纪律）。
5. **插入锚位机检**：新增步前一行=`        run: pnpm dbhy1:prove`·新增步后一步 name 始于「跨供应商 failover」（sed 亲证·错位即停）。
6. **零触面 blob 恒等**：`git hash-object` 前后全等——`package.json`=`3b04b871`+`scripts/run-e2e-isolated.mjs`=`0787a7ff`+`packages/db/test/db-acl2.proof.ts`=`31ce9fb5`+`nightly.yml`=`ac47e884`+`nightly-ciw2.yml`=`09cd220a`（届时 tip 重 pin 漂移即停）。
7. **邻面不回退**：`pnpm dbhy1:prove` EXIT=0 **28/28**+`pnpm db-acl:prove` EXIT=0 **62/62**（起草席基线亲跑在案·EXEC 复跑同口径·偏差即停）。
8. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2168**（起草落卷后本席亲跑 2159≤2168·**>2168 红停上报**）。
9. **markers 五类零命中**：本刀改动集（本卷 1 .md+EXEC 期 ci.yml+收据目录）五类标记词（词族=`scripts/i6-239-gates.proof.mjs:154-:155` 运行时组装四词+冲突标记对·**词面本卷不复抄防自匹配**）grep 零命中（命令与回执入收据）。
10. **diff 面机检**：起草 turn `git diff --numstat 0036ddd8` 恰 1 tracked 路径=本卷 .md；EXEC turn 恰 2=ci.yml+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼·隔离容器 runner 自清残留 0。
12. **CI 实跑（「推 PR 后观察」口径）**：EXEC 落卷后由 pusher/协调方推 `line/dbacl2-ci-wire` 开 PR——GitHub Actions verify 全绿（含新增步 UI 序 39·首跑实测时长回填收据）=终证·歧义以 CI 运行为准（歧义=停报·禁本地洗绿）。**步序平移注记**：新增步之后全部既有步序 +1（含仓内 CI 观察注记口径「step 71/72=qbank 面」→72/73 随移）——观察对表按平移后口径·已知红线步（qbank-integrity 族）平移后仍红=既有红线非新曝·如实登记勿修饰。

## §3 范围外（边界清单·越界即 FAIL）

1. **门本体/脚本零触**：`db-acl2.proof.ts`/`db-acl.proof.ts`/`run-e2e-isolated.mjs`/`schema-drift-check.mjs` 前后 blob 全等——本刀纯 wiring·断言/预算/重钉皆非本刀面。
2. **package.json 零触**：`:407-:408` 注册行已在·零改（Ban 动 lint 预算值·Ban 动任何脚本键）。
3. **db-acl:prove 接线零触**：孪生面登记不接线（§1.3-丁）·归另批·Ban 借机同批纳。
4. **nightly 双件零触**：`nightly.yml`/`nightly-ciw2.yml` blob 恒等（§2-6）·Ban 借机入 nightly 族。
5. **共享 SSOT 零改**：backlog/checklist/LEDGER/批表只读引用——#142 半闭翻面权与行翻面权归协调方（本刀不预 claim 翻面）。
6. **零迁移零 DDL 零依赖升级零产品码**。

## §4 依赖

**①上游已满足**：db-acl2:prove 基线红已由 DB-ACL-RESIDUAL nail `7ac68ed7` 翻绿（落主线·@`0036ddd8` 祖先亲证）；isolated-runner 接线形/neg 六步/ci-wiring3 四新步先例在链。**②在飞交叠**：三在飞线对本刀唯一触面零交叠（§0.0·立项日重跑复核）。**③下游**：db-acl:prove 纳入=另批；#142 半闭翻面=协调方（本刀 nail 后）。**④迁移号**：预期零迁移（§3-6）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·CI 观察归 pusher/协调方）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§2-3 恰 1 run·红不重跑冲销）；Ban 翻 pins（§5 十一值零翻转）；Ban 触门本体/runner/package.json（§3-1/§3-2）；Ban 接 db-acl:prove 孪生面（§3-3·借机修 Ban）；Ban 触 nightly 双件（§3-4）；Ban 改既有步语义/删除/重排（ci.yml 只增不减·§2-1 逐位恒等+§2-4 删行恰零承载）；Ban 动 lint 真实预算值（§3-2）；Ban 迁移 Ban DDL；Ban 改共享 SSOT（§3-5）；Ban 触其他工作树；Ban 伪造实测（§1 矩阵值本席亲跑为分母·EXEC 复跑如实记·Ban 抄简报 ~62s 值顶替·§0.2-2）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄 ci-wiring3 §5·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（本刀全门=静态/隔离库机械断言·零模型外呼·零 secrets 消耗）。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 消耗。本席亲核用本地隔离容器 5 件次（db-acl2:prove×3+db-acl:prove×1+dbhy1:prove×1·isolated-runner 临时 `meetwise-e2e-*`·runner 自清·残留 0 亲证）·收据落 `.tmp/isolated-proof-receipts/`（gitignored·树洁亲证）。EXEC 期复跑同离线形·est live=0 维持。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 ci-wiring3/negbend 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 裁位（候选甲单步 per-push）与 §1-修法件① 逐字节内容与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号/blob 漂移如实改锚·结论不变只更锚·§0.0 在飞复核必做·§0.2 漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob 漂移·verify steps≠102 基线·db-acl2:prove 翻红或 PASS≠38·单步实测 >56.8s 熔断·插入锚位错位（§2-5）·在飞线对 ci.yml 出现新触（§0.0）→停·重 pin 回炉。
- **机制不满足**：接线步 isolated-runner 语义下无法绿（容器起停/预算/依赖缺失类）·或 db-acl2:prove 本地复跑 EXIT≠0（红面不在本刀交付面）→停·如实升级协调方（Ban 凑绿 Ban 改步形放水）。
- **越界需要**：接线诉求超出 §1-修法件①（需触 proof 本体/package.json/nightly 双件/db-acl 孪生面/产品码方能绿）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（docs:check>2168/actionlint 新增告警/CI 推 PR 后 verify 红且归因非新增步）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*DBACL2-CI-WIRE REQUEST · 2026-10-15 起草 · **`draft:awaiting_pre_exec_dual`**（落卷即停·待 pre-exec 双审两外席·Ban self-approve·alone≠dual·Dual PASS ≠ 开工）· base `feat/mysql-schema-skeleton` @`0036ddd8`（fetch 后 origin tip·i18n nail 波在史亲证）· 分支 `line/dbacl2-ci-wire` · 工作树 `meetwise-dcw`（本起草席立·建前 branch+worktree+卷名三查零同名）· 立项出处=批表 #142 半闭之另一半（LEDGER `:86`/`:463`+L-05/L-06·DB-ACL-RESIDUAL nail `7ac68ed7` 翻面后 CI 纳入重裁面）· 修法=件① ci.yml 增 1 步（dbhy1 邻位 `:192` 后·isolated-runner 恒同形 fail-loud·纯增 4 行·steps 102→103）+件② 收据· 裁位=候选甲 per-push（候选乙 local-only 失据否决/候选丙 nightly-only L-06 重裁对象否决/候选丁 db-acl 孪生面越界登记不接线·§1.3）· 时长=本地 warm 三跑 receipt 9585/11215/11640ms（墙钟 11.6-12.1s·简报 ~62s 漂移如实登记）·CI 首跑预估 band 8-25s·熔断 >56.8s·预算影响 verify job +8-25s/跑 <3%（§1.2）· 门矩阵十二门（解析 103 恰 +1+剪除恒等/actionlint 告警集恒等基线 3 既有/38 臂恰数/删行恰零纯增恰 4/锚位机检/零触 blob 五值/邻面 28+62/docs:check≤2168/markers/diff 面机检/卫生/CI 推 PR 后观察+步序平移注记）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · ⛔push ⛔merge 主线 · STOP*
