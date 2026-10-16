# DBACL2-CI-SHALLOW-FIX REQUEST — db-acl2 浅克隆修复刀（PR #109 verify 唯一红 step 40 首曝·ci.yml verify checkout 补 `fetch-depth: 0` 恰 1 码面文件纯增 4 行·零产品码零 proof 零迁移·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷 2026-10-16·pre-exec 双审会签 PASS 席1 agent_753a33c4+席2 agent_fb238374→协调方明示 EXEC 授权·P2 重 pin 四件+席1 P2-B 随卷落·§9·Ban self-approve·alone≠dual·est live=0·⛔push ⛔merge 主线·本 commit 不预 claim CI 运行结果·post-prove 双审两独立外席待派）

**席位**：DBACL2-CI-SHALLOW-FIX 诊断+起草席（协调方派·读码定稿+CI 直读+双形模拟亲证+起草）。
**基线**：`feat/mysql-schema-skeleton` @ **`f2e8de7b`**（**EXEC 重 pin·P2-1**·届时 tip=派单下界「tip≥f2e8de7b」以等号成立亲证·merge `cadd973e` 并入·merge-base=`d1d01853`；起草日基线 `d1d01853`=PR #109 head·fetch 后 `origin/feat/mysql-schema-skeleton` 恒等亲证·已随并）· 分支 `line/dbacl2-ci-shallow-fix`（建前 `git branch --list "line/dbacl2-ci-shallow-fix"`/`ls ../ | grep meetwise-dsf`/`ls ai-docs/delivery/harness/ | grep dbacl2-ci-shallow` 三查零命中·`git worktree add ../meetwise-dsf -b line/dbacl2-ci-shallow-fix` 本席亲立·base=主仓 HEAD=d1d01853）· 工作树 `meetwise-dsf`（仓根同级）。
**立项出处**：①手术席逐帧定性（派单简报：PR #109 head=d1d01853 verify 唯一红=step 40 db-acl2·机械红非手术引入·per-push 接线后首次 CI 实跑结构首曝）；②CI 运行亲读：run `38866256244`/verify job `116859667877`（本席 gh 直读·§1.1）；③DBACL2-CI-WIRE 接线刀（step 40 建立者·本刀=其接线后首个 CI 实跑曝红的修复刀）；④形制范本 `ai-docs/delivery/harness/dbacl2-ci-wire-REQUEST.md`（§0-§8+STOP 三处+四类停止条件口径逐字对齐）。

## §0 现状锚（起草席亲证 @`d1d01853`→**EXEC 重 pin @`f2e8de7b`** 2026-10-16·gh log/sed/js-yaml 4.3.2/git 实跑逐条实测·EXEC 立项照本节对届时 tip 再重 pin——结论不变·唯一行号/blob 漂=cap 锚行（P2-2·`f2e8de7b` sanction）·全表见 §9/收据字段⑤）

### 0.0 防重双对表 + 在飞交叠

- `git branch --list "line/dbacl2-ci-shallow-fix"` 建后恰 1 命中=本席；`ls ../ | grep meetwise-dsf` 恰 1 树=本席工作树；卷名建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核（起草日全量亲跑）**：`git log d1d01853..<线tip> -- .github/workflows/ci.yml` 对在飞七线——qbank-integrity-chain `0c94d1ec`/e2e-runner-stale-build-guard `d186dffc`/qbank-pipeline-scope `fc64c7c9`/runtime-kernel-wire `56ae9016`/dbhy1-p4-fix `eee0622d`/hmac-consolidate `fe7071b0`/gitleaks-archive-expand `f20e38c8` **恰 0 触/线**（对本刀唯一触面零交叠亲证）。立项日重跑·任一线现新触 ci.yml→触停止条件「现场漂移」停上报。
- **在飞交叠复核（EXEC 立项日全量重跑·2026-10-16·含 sanction 点名四支·P2-3）**：七线 tips 与上列 pin **恒等**·同式亲跑恰 **0 触/线**；sanction 点名四支（`f2e8de7b` cap sanction 文点名名）=本支（件① 本体预期触面）+`line/5e-cleanup-sweep` `d751e1c2`+`line/queue-shutdown-phases` `18a34b41`+`line/session-summary-deepen` `039d9baa` 恰 **0 触/支**（ssd 支 EXEC 期活推进 f9025ee4→`039d9baa` docs-only nail·0 触如实登记）；全 ref superset sweep 近史残支唯一=`line/db-hygiene` `1ab83bd8`（dbhy1 EXEC drift:prove→dbhy1:prove 值翻 +1/−1 零步增·其内容已由主线 ci.yml `:191-:192` DBHY-1 步 realization·tip `ecf01edc`=dbhy1 nail docs-only 收官·rkw EXEC P2-2 已承登残枝）**登记不熔断**·余为战役窗前古早期支陈旧面。§0.0 双对表=branch/worktree/卷名各恰 1（EXEC 日亲证）。

### 0.1 blob 锚表（`git hash-object` 8 hex 亲算 @`d1d01853`·**EXEC 重算 @`f2e8de7b` 恒等——唯一漂=cap 锚行（P2-2·`f2e8de7b` sanction）**）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `packages/db/test/db-acl2.proof.ts` | `31ce9fb5`（**463 行**） | **红面本体（本刀零触）**。`:44-:45` `BASE_SHA='95911975'` 常量（注释自证「REQUEST rev2 蓝本提交（diff-to-base 零 D/R/M 门的对照起点·历史注释·不再作恰一 A 行锚·授权文本钉死）」——**注释言明历史注释·但 `:414` 仍以之为活断言锚**）；`:414` `spawnSync('git',['diff','--name-status',BASE_SHA,'HEAD','--','packages/db/migrations'],{cwd:ROOT})`；`:415-:417` stdout 行切+`/^[DR]\s/`+`/^M\s/` 分面；`:418-:420` 断言 `diff.status === 0 && deletes.length === 0 && modified.length === 0`（**`status===0` 项=sanity 前置项**·detail 含 `status=${diff.status}`） |
| `.github/workflows/ci.yml` | `d2dc8d2c`（**365 行**） | **本刀唯一码改件**。全文件恰 2 checkout：`:15-:17` secrets-scan job（**有** `with: fetch-depth: 0  # 全历史，否则只扫到 HEAD`=同文件全史先例）+`:32` verify job（**无 `with:` 块**→actions/checkout 默认浅克隆 depth 1·`:33` 空行·`:34` pnpm/action-setup）；`:164` `run: pnpm db:prove`（=docker exec psql primitives.sql·**非 db-acl.proof.ts**·§0.2-1）；`:196` `run: pnpm db-acl2:prove`（红步本体）；js-yaml 4.3.2 亲跑 verify steps=**103**·红步 idx 38/1-based 39/GH UI 序 **40**·`steps[0].with` **ABSENT** 亲证 |
| `package.json`（根） | `3b04b871` | `:407-:408` `db-acl2:prove` isolated-runner 注册链——**本刀零触** |
| `scripts/run-e2e-isolated.mjs` | `0787a7ff`（3201 行） | isolated-runner 本体——**本刀零触** |
| `.github/workflows/nightly.yml` / `nightly-ciw2.yml` | `ac47e884` / `09cd220a` | 零触（ci-wiring2 逐字节 Ban 沿承） |
| `scripts/ai-docs/public-text-policy.mjs` | 现树 | **`:100`** `MAX_FILES = 2_192`=docs:check cap（operative ≤2192·**EXEC 重 pin·P2-2**·`f2e8de7b` sanction 落值·起草日 `:98`/2_184 留档）·零触 |
| CI 直读锚 | run `38866256244` | verify job `116859667877` conclusion=failure·**failing step number=40**·job 墙钟 07:17:20Z→07:23:27Z=**367s**·job log `:44` **`fetch-depth: 1`** 直证浅克隆·db-acl2 步 log「FAIL P4-1 … :: D/R=[] M=[] **status=128**」+「RESULT dbacl2-db-acl **failures=1**」+全步 **37 PASS/1 FAIL** 恒等简报口径 |

### 0.2 派单简报漂移登记（结论修正如实记·亲证为准）

1. **简报「db:prove 邻面绿」补勘（防误读邻位安全性）**：CI `:164` `pnpm db:prove` 实为 `docker exec … psql < proof/primitives.sql`（SQL 四原语·job log `:15145` 直读）——**db-acl.proof.ts（`P6-1` 同型冻结锚 `BASE_SHA='8bf82a1b'` @`:38`/`:623`）并未接线 CI**。故 CI verify 内冻结锚 git-diff 门**恰 db-acl2 P4-1 一处**=「唯一红」机制自洽。
2. **简报未述·本席补勘（甲成立性关键）**：`95911975` 全 sha=`9591197508aec2a2d0241f2dcb740b27b2417eb3`（2026-10-08「docs(dbacl2): REQUEST rev2 …」）**非 `d1d01853` 祖先、非 origin/main 祖先**（`merge-base --is-ancestor` 双 NO 亲证）·**仅经 `refs/heads/line/db-pgp-acl` 可达**（本地+`git ls-remote origin refs/heads/line/db-pgp-acl`=`3f50095f` 存活亲证·BASE 为其祖先）。⇒ `fetch-depth: 0` 全支 fetch 面含该 ref⇒对象随落（甲成立）；⇒**该远端分支退役即锚对象脱离 fetch 集·depth 0 亦红**（§4 锚存活依赖+§8 现场漂移条件承载）。
3. **简报「本地全史仓 38/38 绿相容」→ 本席支线树复跑亲证**：`pnpm db-acl2:prove` 两跑 EXIT=0·PASS 恰 **38**/FAIL 0（墙钟 18.28s 一跑+receipt `durationMs=15029 outcome=passed` 一跑·收据 `.tmp/isolated-proof-receipts/` gitignored 在案）。
4. **简报「ci.yml :32 无 fetch-depth」恒等亲证**：`:32` checkout 行无 `with:` 块+js-yaml `steps[0].with` ABSENT+CI log `fetch-depth: 1` 三源互证。

## §1 归因链（红事实→机制→修法·本席逐环亲证）

**1.1 红事实（CI 直读恒等简报）**：PR #109（head `d1d01853`）verify 唯一红=step 40「DB ACL pgp_sym_encrypt 补授门」·db-acl2:prove 38 臂中恰 1 红=P4-1「历史迁移零字节门（改形）：diff-to-base 零 D/R/M」detail=`D/R=[] M=[] status=128`·secrets-scan 绿。

**1.2 机制链（四环·每环亲证）**：
①接线后首曝——DBACL2-CI-WIRE 将 db-acl2:prove 纳入 verify per-push（`:196`·steps 102→103）·此为该步首次在 CI 实跑。
②浅克隆环境——verify checkout `:32` 无 `with:`→actions/checkout@v4 默认 `fetch-depth: 1`（job log `:44` 直证）·仓内仅 HEAD 单 commit·2433 commit 全史不在场。
③对象缺位→git 128——`BASE_SHA='95911975'` 非 HEAD 祖先（本就仅存在于 `line/db-pgp-acl` 支史·§0.2-2）·浅史必然缺对象→`git diff --name-status 95911975 HEAD -- packages/db/migrations` 退出 **128**（本席 `git clone --depth 1 --no-local` 模拟复现：`fatal: bad revision '95911975'`·exit 128·与 CI log `status=128` 恒等）。
④sanity 项翻红——`:419` 断言含 `diff.status === 0` 前置项（git 须成功执行）→128⇒P4-1 红⇒fail-loud 透传 job 红。**断言语义本身（零 D/R/M）在浅/全史两形下均未被违反——红=环境对象缺位·非迁移改形·非刀引入**。全史形模拟（同模拟仓 fetch `line/db-pgp-acl` 后）`git diff` exit 0·60 行全 `A`·D/R/M 恰 0=绿复现·与本地 38/38 互证（§0.2-3）。

**1.3 成本量化（候选甲代价面）**：全史 fetch 传输≈pack **83.86 MiB**（`count-objects -v` size-pack·5627 tracked files·2433 commits）→GH runner 估 **+5~20s/verify 跑**（对现 job 墙钟 367s 增幅 **<6%**；secrets-scan job 已同形全史 fetch 先例每跑承担同成本）。登记线：EXEC 后 CI 首跑若 fetch 增时 >60s（异常带）→如实登记并触「现场漂移」上报。

### 1.4 三候选裁决（本刀裁位=候选甲·否决理由如实落卷）

- **候选甲（采纳）=ci.yml verify checkout 补 `with: fetch-depth: 0`**：判据=①修在因上（环境对象缺位·修环境接线层·断言零触=零弱化嫌疑）②同文件 `:15-:17` secrets-scan 全史先例恒同形③成本可接受（§1.3 <6%）④附带前向收益：verify 获全史后·未来同类冻结锚门（db-acl/db-trigfam 若另批接线）不再首曝同红。
- **候选乙（否决·本刀不采·登记为候补硬化面）=proof P4-1 浅克隆鲁棒形**：可辩护变体仅「`git cat-file -e` 预检+缺则 `git fetch origin line/db-pgp-acl` 补对象·仍强断言 `status===0`+零 D/R/M」——不弱化断言故非 Ban 面·但否决理由：①把 CI 接线修复责任移入 proof 本体=分层违例（接线债在 ci.yml·修在 proof 面）②网络外呼入测试面=挂起/凭证/离线失败模式新增·flake 面扩大③proof 面 Ban 倾向（P4-1 邻域任何改写都引弱化嫌疑·需严审·成本高于甲 1 行）。**变体「`status!==0` 降级承登/跳臂」=直接 Ban**：浅克隆环境门静默失效=真弱化·沿 proof 面改断言纪律严禁。
- **候选丙（否决·双重）=BASE_SHA 改浅史可达锚（merge-base origin/main）**：①**机械不成立**——merge-base 需公共祖先对象·depth 1 浅克隆无祖先对象（本席模拟亲证：fetch main ref 后 `git merge-base origin/main HEAD` 仍失败）·修它仍须扩 fetch=归甲；②**语义弱化**——merge-base 动锚随 main 演进前移·BASE 与未来 merge-base 之间已落主线的任何历史迁移 D/R/M 永久逃出门网（定锚语义=对蓝本快照的全时段问责·动锚=问责域收缩）·属「断言弱化伪装接线修」·违改形纪律（改形须机械权威移交+显式登记·非锚点静默漂移）。

## §1-修法（wiring 刀·预期恰 1 码面文件 `.github/workflows/ci.yml`·零 proof 零 package.json 零迁移零产品码·纯增 4 行）

- **件①（verify checkout 全史化）**：ci.yml `:32` checkout 行（`      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4`·verify job 内）之后、现 `:33` 空行之前插入以下逐字节内容（纯增 4 行·既有行零重排零删除零改语义·verify steps **恒 103 零步增**·新增行落位 `:33-:36`·原 `:33` 空行→`:37`·`:34` pnpm/action-setup→`:38`）：

```yaml
        # DBACL2-CI-SHALLOW-FIX：全历史=冻结锚 diff 门前置（db-acl2 P4-1 BASE_SHA 95911975
        # 仅经 origin/line/db-pgp-acl 可达·depth 1 缺对象=git exit 128 机械红·PR #109 step 40）
        with:
          fetch-depth: 0          # 全历史，否则只扫到 HEAD
```

- **形制逐字对齐同文件 `:15-:17` secrets-scan 先例**（`with:`+`fetch-depth: 0`+尾注「全历史，否则只扫到 HEAD」）·注释行承载裁位亲证（锚可达面+机制+曝红出处）·零 env 零 if 零 retry 零 continue-on-error。
- **件②（收据）**：EXEC 期 `ai-docs/delivery/receipts/dbacl2-ci-shallow-fix/00-exec.md`——七字段（门矩阵全表+EXIT 原值+CI 形模拟双形复跑回执+diff numstat+重 pin 全表+CI 首跑 step 40 实测转绿回填位+偏离清单）·untracked 口径沿 dbacl2-ci-wire 件② 先例。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准）

1. **ci.yml 解析门**：js-yaml 4.3.2 亲跑 parse EXIT=0·verify steps=**103 恒等**（**步数熔断=0**·本刀修 with 面非增步·多一步即停）·`steps[0].with` 恰 `{"fetch-depth":0}`·全 103 步 name 序列对基线**逐位恒等**（错位即停）。
2. **actionlint 告警集恒等**：`actionlint` 1.7.12 告警集对基线**恒等**（基线=3 既有 shellcheck warning：`:146`×2 SC1083+`:155`×1 SC2034·起草席亲跑在案·既有告警非本刀面）——零新增即过·新增任何告警即停。yamllint 不在仓（如实登记·actionlint 为本地 dry-run 权威·沿 dbacl2-ci-wire 口径）。
3. **db-acl2:prove 实跑绿（不回退）**：`pnpm db-acl2:prove` 恰 1 run EXIT=0·PASS 恰 **38**（0 容差）·≤56.8s 熔断承 dbacl2-ci-wire 口径（起草席两跑 18.28s/15.03s 在案）。
4. **纯增机检**：`git diff <届时基线 SHA> -- .github/workflows/ci.yml` 删行（`^-[^-]`）**恰零**·纯增**恰 4 行**·单 hunk。
5. **锚位机检**：新增块首行紧随 `:32` checkout 行逐字（`- uses: actions/checkout@11d5960a… # v4`）·新增块后首个非空行= `- uses: pnpm/action-setup@f40ffcd… # v4`（sed 亲证·错位即停）。
6. **零触面 blob 恒等**：`git hash-object` 前后全等——`db-acl2.proof.ts`=`31ce9fb5`+`package.json`=`3b04b871`+`run-e2e-isolated.mjs`=`0787a7ff`+`nightly.yml`=`ac47e884`+`nightly-ciw2.yml`=`09cd220a`（届时 tip 重 pin 漂移即停）·ci.yml=`d2dc8d2c`→新值（唯一码改件）。
7. **CI 形模拟双形复跑（本刀核心门·EXEC 期）**：临时仓 `git clone --depth 1 --no-local`→`git diff --name-status 95911975 HEAD -- packages/db/migrations` **exit 128 复现**（红形）；同仓 fetch 含锚分支后同 diff **exit 0·D/R/M 恰 0**（绿形）——起草席双形已亲证（§1.2-③/④）·EXEC 复跑同口径留回执·任一形不复现即停。
8. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2192**（**EXEC 重 pin·P2-2**·`f2e8de7b` sanction 落值·起草字面 2184 留档·>2192 红停上报）。
9. **markers 五类零命中**：本刀改动集（本卷 1 .md+EXEC 期 ci.yml+收据目录）五类标记词（词族=`scripts/i6-239-gates.proof.mjs:154-:155` 运行时组装四词+冲突标记对·词面本卷不复抄防自匹配）grep 零命中。
10. **diff 面机检**：起草 turn `git diff --numstat <届时基线 SHA>` 恰 1 tracked=本卷 .md；EXEC turn 恰 2=ci.yml+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改（起草席 5.8s 亲跑在案）·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼·隔离容器 runner 自清残留 0。
12. **CI 实跑（「推 PR 后观察」口径）**：EXEC 落卷后由 pusher/协调方并线/推支·PR #109 verify **step 40 转绿=终证**（job log 应现全史 fetch+P4-1 PASS·首跑 fetch 增时回填收据）·歧义以 CI 运行为准（歧义=停报·禁本地洗绿）·本 commit 不预 claim。

## §3 范围外（边界清单·越界即 FAIL）

1. **proof 本体零触**：`db-acl2.proof.ts`（含 `:45` `BASE_SHA`/`:414-:420` P4-1 断言面）前后 blob 全等——候选乙 robust 形若未来立项=另刀严审·Ban 本刀借机顺手改。
2. **secrets-scan 面/其余 job 面零触**：`:15-:17` 先例行逐字不动·deploy/nightly 双件/release 等 workflows 零触。
3. **db-acl/db-trigfam/alerts 同类潜伏面登记不接线不修**：`db-acl.proof.ts:623`（`BASE 8bf82a1b`·仅经 `line/db-uuidv7-acl` 可达·同脆弱类）+`db-trigfam-unify.proof.ts:489/:492`（`48dee7a2`·**PR 支线可达·合并后主线可达**·席1 P2-B 措辞修正）+`scripts/alerts/check-alerts.proof.mjs:28`（`9f6edf8f`·**PR 支线可达·合并后主线可达**·席1 P2-B 措辞修正）——三者均**未接线 CI**（今日零红）·本刀零触·Ban 借机扩面。（EXEC 亲证：`48dee7a2`/`9f6edf8f` 对 origin/main is-ancestor=NO·对 origin/feat/mysql-schema-skeleton=YES·修正成立；`8bf82a1b` 双 NO 原文维持）
4. **共享 SSOT 零改**：LEDGER/批表/checklist 只读引用·翻面权归协调方。
5. **零迁移零 DDL 零依赖升级零产品码零 docs 面新增（本卷外）**。
6. **远端支零触**：`line/db-pgp-acl`（锚存活依赖·§4）Ban 删/Ban 改/Ban force。

## §4 依赖

**①锚存活依赖（本刀新勘·关键）**：候选甲成立性依赖 `refs/heads/line/db-pgp-acl` 在 origin 存活（起草日 `git ls-remote`=`3f50095f` 亲证·EXEC 日复核恒等）——全支 fetch 面含该 ref⇒`95911975` 对象随落。**若该远端支退役·depth 0 亦缺对象=红回归**：退役前须先迁锚（**迁锚候选登记 EXEC 补强·P2-4：首选=以 tag 承锚**——`fetch-depth: 0` fetch 面 tags 随落·锚对象随 tag 在 fetch 集存活·活过支 `line/db-pgp-acl` 可删·零动锚语义〔BASE 常量与 `:414` 断言面零字节改〕；次选=BASE 常量改全支可达对象·动锚语义须机械权威移交+显式登记·另刀裁决）·本刀 §8 设现场漂移条件承载。**②上游已在**：DBACL2-CI-WIRE 接线（step 40 建立者）+DB-ACL-RESIDUAL 基线翻绿+db-pgp-acl 蓝本刀（`95911975` 出处）均在史。**③在飞交叠**：七线零触 ci.yml（§0.0·立项日重跑）。**④下游**：PR #109 verify 转绿=门 12 终证·归协调方；同类潜伏面接线时点=另批。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·CI 观察归 pusher/协调方）；Ban merge 主线；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门 3/门 12 红不重跑冲销）；Ban 触 proof 本体/runner/package.json（§3-1）；Ban 执行候选乙/丙变体（§1.4 否决面·含「status!==0 降级/跳臂」真弱化形·Ban 就地处置）；Ban 改 secrets-scan 面与其余 job 步语义/删除/重排（§3-2·门 1 name 逐位恒等承载）；Ban 删/改/force `line/db-pgp-acl` 远端支（§4 锚存活依赖）；Ban 触 db-acl/db-trigfam/alerts 潜伏面（§3-3）；Ban 动 nightly 双件（§0.1 blob 锚）；Ban 改共享 SSOT（§3-4）；Ban 翻 pins；Ban 伪造实测（§0/§1/§2 矩阵值本席亲跑为分母·Ban 抄简报未验值顶替）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄 dbacl2-ci-wire §5·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（本刀全门=静态/CI 形模拟/隔离库机械断言·零模型外呼·零 secrets 消耗）。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 消耗。本席亲核用本地资源：db-acl2:prove 隔离容器 2 件次（runner 自清·收据在 `.tmp/isolated-proof-receipts/` gitignored）+临时模拟仓 `/tmp`（不入树）+gh CI 只读面。EXEC 期复跑同离线形·est live=0 维持。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 dbacl2-ci-wire §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual · post-prove 双审两独立外席待派（Ban self-approve）· 本 commit 不预 claim CI 运行结果（门 12 推 PR 后观察归 pusher/协调方）。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 裁位（候选甲单点 wiring）与 §1-修法件① 逐字节内容与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号/blob 漂移如实改锚·结论不变只更锚·§0.0 在飞复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob 漂移·verify steps≠103·db-acl2:prove 翻红或 PASS≠38·`git ls-remote origin refs/heads/line/db-pgp-acl` 空（锚存活依赖失守）·在飞线对 ci.yml 新触（§0.0）→停·重 pin 回炉。
- **机制不满足**：`fetch-depth: 0` 落地后 CI 仍红（锚对象脱离全支可达集/服务器侧对象缺失类）→停·如实升级协调方（候补=候选乙 robust 形**另刀严审**·Ban 就地改 proof Ban 凑绿）。
- **越界需要**：修复诉求超出 §1-修法件①（需触 proof 本体/secrets-scan 面/其他 job/package.json 方能绿）→停·另刀或协调方裁决。
- **验收红不可修**：门矩阵任一门红且根因不在本刀交付面（docs:check>2184/actionlint 新增告警/markers 命中/CI 推 PR 后 verify 红且归因非本刀面）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（2026-10-16·执行席落卷·post-prove 双审前·沿 dbacl2-ci-wire §10 EXEC 记录同形制）

**Status 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**（开工链=pre-exec 双审会签 PASS 席1 agent_753a33c4+席2 agent_fb238374（P2 重 pin 四件+席1 P2-B 裁定随 EXEC 落卷）→协调方明示 EXEC 授权·⛔push。派单「§9 append EXEC 记录」=wire §10 形·本卷 §9 空位直用·§0-§8 上文除 Status 头/§8 两处 STOP 翻面+P2 重 pin 四件锚改+§3-3 措辞修正外零字节改·时代冻结字面注记见偏离②）。

- **并线**：`git merge --no-ff origin/feat/mysql-schema-skeleton`→**`cadd973e`**（origin tip=`f2e8de7b`=派单下界「tip≥f2e8de7b」以等号成立亲证·merge-base=`d1d01853`·入并恰 1 commit=`f2e8de7b` cap sanction 2184→2192 落值·`d1d01853..f2e8de7b` 对 ci.yml 恰 0 commit 零触亲证·merge-tree 预演 EXIT=0 零冲突先证·实测 ort 零冲突零 union-解需·2 files +9/−7·⛔pull --rebase 未用）。
- **P2 重 pin 四件落点（双审随卷裁定·本席逐件亲证落地）**：
  1. **P2-1 基线锚 `d1d01853`→`f2e8de7b`**（届时 tip·下界等号成立·is-ancestor 亲证·merge `cadd973e` 并入）——Status/基线行/§0/§0.1 四处锚同步·卷尾起草 trailer 时代冻结留档。
  2. **P2-2 门 8 cap `2184`→`2192`**（锚行 `:98`→`:100`·`MAX_FILES = 2_192` 亲证·`f2e8de7b` sanction 落值）——§2-8+§0.1 同步；§8-④/卷尾 trailer 内「2184」字面=起草期时代冻结文本留档不洗·operative=2192（沿 wire §9-R3 注记形）。
  3. **P2-3 §0.0 在飞复核立项日重跑含 sanction 点名四支**——七线 tips 恒等+0 触；sanction 四支 0 触（ssd 支 EXEC 期活推进 f9025ee4→`039d9baa` docs-only nail·0 触如实登记）；全 ref superset sweep 残支 line/db-hygiene `1ab83bd8` 已由主线 `:191-:192` realization 登记不熔断（详见收据字段⑤）。
  4. **P2-4 迁锚候选登记补强**——§4① tag 承锚列**首选**（depth:0 fetch 面 tags 随落·活过支删·零动锚语义）·次选=BASE 常量改全支可达对象·另刀裁决承继。
- **席1 P2-B §3-3 措辞修正**：「主线可达」→「**PR 支线可达·合并后主线可达**」（`48dee7a2`/`9f6edf8f` 两锚·本席亲证 origin/main is-ancestor=NO+origin/feat=YES·修正成立；`8bf82a1b` 双 NO 原文维持）。
- **件①**：ci.yml 纯增 4 行逐字节材料化（verify checkout `:32` 后·落位 `:33-:36`·原 `:33` 空→`:37`·action-setup→`:38`）——卷 `:58-:61` 提取块对树内 `:33-:36` diff EXIT=0 **逐字节恒等**·numstat **+4/−0** 删行恰零**单 hunk**·steps **恒 103 零步增**（with 面修非增步）·`steps[0].with` 恰 `{"fetch-depth":0}`·全 103 步序列剥 with 后恒等·零 env 零 if 零 retry 零 continue-on-error·形制逐字对齐 `:15-:17` secrets-scan 先例。
- **件②**：收据 `ai-docs/delivery/receipts/dbacl2-ci-shallow-fix/00-exec.md`（七字段全表+EXIT 原值+双形模拟复跑回执+diff numstat+重 pin 全表+CI 首跑回填位+偏离清单·untracked 口径沿 wire 件② 先例）。
- **门矩阵十二门终值**（EXIT 原值见收据字段②）：门1 解析 steps=**103 恒等**+with 恰值+序列剥 with 恒等 **绿**·门2 actionlint 1.7.12 恰 3 既有恒等（`:150`×2+`:159`×1 恰 +4 平移·零新增）**绿**·门3 db-acl2:prove 两跑 **EXIT=0·PASS 恰 38/FAIL 0**（23.126s/22440ms+20.535s/19788ms·≤56.8s 熔断未行使·零 retry·fetch-depth:0 后本地行为恒等核兑现）**绿**·门4 纯增 **+4/−0** 单 hunk **绿**·门5 锚位机检（`:32`→`:33-:36`→`:37` 空→`:38`）**绿**·门6 零触 blob 五值改后恒等+ci.yml `d2dc8d2c`→`527a1d80`/369 行 **绿**·门7 双形模拟复跑（红形 EXIT=128 `fatal: bad revision '95911975'` 与 CI run 38866256244 status=128 恒等+绿形 EXIT=0·60 行全 A·D/R/M=0）**绿**·门8 docs:check **EXIT=0·2178≤2192**（=本卷+收据 1 计入承 wire 口径）**绿**·门9 markers 五类零命中 **绿**·门10 diff 恰 2 tracked（ci.yml+本卷）+收据 untracked **绿**·门11 卫生（frozen EXIT=0 零 lockfile 改+`.env*` ABSENT 双向+actualSpendCny=null+零模型外呼+隔离容器 2 件次自清 0）**绿**·门12 CI 推 PR 后观察 **移交**（step 40 转绿终证+fetch 增时回填收据字段⑥）。
- **偏离两项如实登记**：①actionlint 3 既有告警行锚 +4 平移（`:146`/`:155`→`:150`/`:159`·纯插入位 `:33-:36` 行使·告警集恒等零新增）；②§8-④/卷尾 trailer「2184」时代冻结字面留档·operative 2192（P2-2·沿 wire R3 形）。余零偏离·§1 裁位/件① 逐字节/§5 Ban/pins 零触零翻。
- **成本登记**：全史 fetch pack **size-pack 83.86 MiB**（`count-objects -v`·5627 tracked files·2433 commits·§1.3 口径承继）→GH runner 估 +5~20s/verify 跑 <6%·>60s 异常带上报线承 §1.3·首跑实测归门 12 回填收据字段⑥。
- **卫生**：markers 五类零命中·tracked 码面恰 1 路径（ci.yml）·零 lockfile 改·零迁移零 DDL 零依赖升级零产品码·共享 SSOT 零触·est live=0·actualSpendCny=null·pins 十一值零翻（承 §5 原文）。
- **STOP=**`executed:awaiting_post_prove_dual`**（post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·本 commit 不预 claim CI 运行结果·门 12 推 PR 后观察归 pusher/协调方·⛔push）**。

*EXEC 落卷 2026-10-16·序1 fetch+merge `cadd973e` --no-ff 并 `f2e8de7b`（merge-base `d1d01853`·对 ci.yml 恰 0 commit·零冲突·⛔pull --rebase 未用）·序2 §0 全量重 pin 对 `f2e8de7b`（六锚 blob 恒等+steps 103+cap 锚 `:100`/2_192 漂随 sanction 承登+基线锚重 pin+§0.0 全量重跑含 sanction 四支+ssd 活推进 0 触登记）·序3 件① ci.yml 纯增 4 行逐字节（`:33-:36`·卷 `:58-:61` 提取 diff EXIT=0·steps 恒 103·`steps[0].with` 恰 `{"fetch-depth":0}`）·序4 门矩阵十二门=11 绿+门 12 移交（db-acl2 两跑 38/38 EXIT=0 23.126s/20.535s+docs:check 2178≤2192+markers 五类零命中+双形模拟 128/0 复现+卫生全绿）·P2 重 pin 四件+席1 P2-B 随卷落·偏离两项登记·**STOP=`executed:awaiting_post_prove_dual`**（post-prove 双审两独立外席待派·翻面/nail 权归协调方）·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push 未用*

---

*DBACL2-CI-SHALLOW-FIX REQUEST · 2026-10-16 起草 · **`draft:awaiting_pre_exec_dual`**（落卷即停·待 pre-exec 双审两外席·Ban self-approve·alone≠dual·Dual PASS ≠ 开工）· base `feat/mysql-schema-skeleton` @`d1d01853`（=PR #109 head·fetch 后 origin tip 亲证）· 分支 `line/dbacl2-ci-shallow-fix` · 工作树 `meetwise-dsf`（本起草席立·建前 branch+worktree+卷名三查零同名）· 归因链四环亲证（接线首曝→verify checkout `:32` 无 with=depth 1 浅克隆→`BASE_SHA 95911975` 非 HEAD 祖先仅经 `origin/line/db-pgp-acl`=`3f50095f` 可达→`git diff` exit 128⇒`:419` sanity 项 `status===0` 红）· CI 直读 run `38866256244`/job `116859667877` step number=40·37 PASS/1 FAIL·job 墙钟 367s· 双形模拟亲证（depth-1 形 exit 128 红/全支 fetch 形 exit 0 零 D/R/M 绿）· 裁位=候选甲 ci.yml verify checkout 补 `fetch-depth: 0` 纯增 4 行（候选乙 proof 鲁棒形分层违例+网络入测否决·其「降级/跳臂」变体真弱化直接 Ban·候选丙 merge-base 动锚机械不成立+语义弱化双重否决·§1.4）· 成本=size-pack 83.86 MiB 估 +5~20s/跑 <6%（>60s 登记上报）· 门矩阵十二门（解析 103 恒等零步增/actionlint 基线 3 既有恒等/38 臂恰数/纯增恰 4/锚位机检/零触 blob 五值/双形模拟复跑/docs:check≤2184/markers/diff 面机检/卫生/CI 推 PR 后 step 40 转绿终证）· 锚存活依赖=`line/db-pgp-acl` 远端支（退役先迁锚·§4/§8）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · ⛔push ⛔merge 主线 · STOP*
