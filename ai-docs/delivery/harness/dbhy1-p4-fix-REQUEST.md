# DBHY1-P4-FIX REQUEST — dbhy1 P4⑤ 对象类名录两索引未登记缺口补账刀（`ix_user_email`+`ix_qfb_rating`·恰 1 产品文件净 +3 行豁免登记·dbhy1-p4-fix 战役·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落码收口·门矩阵十二门全绿见 §9·post 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push）

**席位**：dbhy1-p4-fix 起草席（诊断+起草双责·协调方派单 2026-10-15·PR #108 CI run 实测存量红首曝口径指派）。
**基线**：`feat/mysql-schema-skeleton` @ `0c06033d`（origin tip 亲证恒等·ci-red-clear nail SSOT commit）· 分支 `line/dbhy1-p4-fix`（本起草席 `git worktree add ../meetwise-dbh -b line/dbhy1-p4-fix origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `0c06033d` 亲证）· 工作树 `meetwise-dbh`（仓根同级）。
**立项出处**：①协调方派单 brief（2026-10-15·PR #108 verify 日志尾 `FAIL P4⑤ 对象类承载：sql/ 侧四类名录 ⊆ 迁移侧（未登记缺口=0·逐名打印入 attempts）`+`✗ 1/28 失败（27 PASS）`·存量红首曝口径）；②本起草席本树 @`0c06033d` 亲跑 `pnpm dbhy1:prove` 复现（EXIT=1·1/28·P4⑤ 逐名输出全文=§1.2 判定依据）；③CI runs 实测（`gh run list`：run `38682824757` 2026-10-15T04:41 failure 40s=死于更早步·run `38694613666` 2026-10-15T06:48 failure 6m6s=nail 后首达 dbhy1 步 run）；④结构范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8 形制·rev 摘要+§9 EXEC 记录先例）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`0c06033d`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号。**EXEC 重 pin 2026-10-15 已落卷：@并线 tip `a7139067` 全表复测——§0.1 首锚全表恒等零漂（proof.ts blob `c88320dc`/499 行/末触 `03adfbe6` 恒等·P4⑤ 面 `:338/:343-:346/:348` 恒等·ci.yml `:191-:192` 恒等·链 202 头 0202 恒等·§0.0 在飞全分支非祖先命中=0）·三 sanction 锚修正随 pin 落卷（P2-1 批5b 呈报 `:254`→`:248`/P2-2 0199 `:15-:16`→`:16-:17`/P2-3 cap 锚 `public-text-policy.mjs:70`→`:75`·详 §9 重 pin 全表）**）

### 0.0 防重双对表 + 在飞交叠复核

- `git worktree list` 建后实测：主仓+既有 13 树+本 dbh 树——无第二 dbhy1-p4 同名树；`git branch --list "line/dbhy1*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg dbhy1` 建前唯一命中=`dbhy1-db-hygiene.md`（本刀卷本体·非 REQUEST）→落卷后 `dbhy1-p4-fix-REQUEST.md` 唯一无撞名。
- **在飞交叠复核（EXEC 立项日必做）**：本刀唯一产品触面=`packages/db/test/dbhy1.proof.ts`（现 blob `c88320dc`·499 行·末次产品变更=`03adfbe6` 2026-10-14「基线红五件清欠」已在主线）。届时对各在飞分支执行 `git log -1 -- packages/db/test/dbhy1.proof.ts` 逐一复核·任一分支顶存在主线 `0c06033d` 之后对该文件的新增提交→触停止条件「现场漂移」停手上报。
- **`line/db-hygiene` 残枝判定（本席已做·登记防复检）**：该支 tip `ecf01edc`（2026-10-08·dbhy1 原 EXEC 支）对 dbhy1.proof.ts 的触点 `1ab83bd8` 为 HEAD 非祖先（`merge-base --is-ancestor` NO 亲证）——但其树版 blob `fcfdac68` 为现行 `c88320dc` 的严格前驱形态（diff 99 行全=主线侧后续 03adfbe6 等增补的残面/豁免登记行·主线已含其 EXEC 交付面 0145/0146/P1-P6 全集）→判**历史残枝非在飞**（沿 negbend rev3 b110 残枝判定先例）·漂移停止条件未触。

### 0.1 blob 锚表（`git hash-object` 亲算 @`0c06033d`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `packages/db/test/dbhy1.proof.ts` | `c88320dc`（499 行·末触 `03adfbe6`） | **`:221` `P4_OBJECT_EXEMPTIONS` 映射开·`:224-:225` 两改名策略豁免 entry·`:226` `indexes:uq_interview_application_binding`（先例形 entry·本刀插入定位点=其后）·`:227-:228` qbank-control-sec 0176 注释组·`:229-:237` 九支 GUC 策略豁免 entry·`:238` 映射闭**；P4⑤ diff 面 **`:338` `missingTotal` 累计·`:344` 逐类 console·`:345` 逐名打印（「（未登记=红）」字面）·`:346` `unregistered` 入账·`:348` 断言 `A('P4⑤ 对象类承载：sql/ 侧四类名录 ⊆ 迁移侧（未登记缺口=0·逐名打印入 attempts）', missingTotal === 0)`**；key 匹配形制=`${klass}:${n}`（`:343`/`:345` 亲证·klass 四值=functions/triggers/policies/indexes） |
| `packages/db/migrations/0199_redundant_index_drop.sql` | `180470d8`（20 行） | **`:5-:8` 退役理据头注（ix_user_email 冗余于 email UNIQUE 背衬索引同列双 btree·ix_qfb_rating 全仓 rg 零查询引用·执行前置硬门实测通过）·`:15-:16` 「drift 面：…对账范围=列+UNIQUE/PK 约束（不含普通索引）——packages/db/sql/ fixture 零改（触面清单外·出入如实登记交付报告）」·**EXEC 重 pin `:16-:17`（起草值 `:15-:16` 差一行·P2-2 sanction 修正）**·`:19-:20` 恰 2 语句 `DROP INDEX IF EXISTS ix_user_email;`/`DROP INDEX IF EXISTS ix_qfb_rating;`** |
| `packages/db/sql/09_auth.sql` | `9082403f`（28 行） | **`:17` `CREATE INDEX ix_user_email ON user_account (email);`（sql/ 侧承载点）** |
| `packages/db/sql/16_feedback.sql` | `60248b84`（19 行） | **`:13` `CREATE INDEX ix_qfb_rating ON question_feedback (rating);`（sql/ 侧承载点）** |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（485 行） | `:370` `CREATE INDEX ix_user_email ON user_account (email);`（迁移侧原创建点·0199 :6 引） |
| `packages/db/migrations/0019_schema_drift_reconcile.sql` | `51302acf`（70 行） | `:28` `CREATE INDEX IF NOT EXISTS ix_qfb_rating …`（迁移侧原创建点·0199 :8 引） |
| `ai-docs/delivery/harness/dbhy1-db-hygiene.md` | `cd0c7fc6`（260 行） | **`:96` drift 门只对账列+UNIQUE/PK 两类·不含函数/触发器/策略/索引对象类·对象类证据由 P4 另立 · `:170` P4⑤ 语义原文「sql 侧 ⊆ 迁移侧（…逐名打印入 attempts）；sql/ 侧独有对象若为 DROP 型重放辅助（亲核入卷）则登记豁免后放行」（本刀裁决的卷内授权条款）· `:125` 案B 两步退役=冻结禁改语义** |
| `ai-docs/delivery/harness/batch5b-mig-REQUEST.md` | `fae7c2b0`（387 行） | **`:210` 0199 行「drift 不对账普通索引·sql/ fixture 零触守住触面清单·出入呈报 §9-4」·`:248` 出入呈报原文「DROP n/n 后 sql/09_auth.sql:17、sql/16_feedback.sql:13 仍载 CREATE 形——…fixture 索引面滞留差异=门范围外·如实登记（sql/ 不在本刀触面清单零触）」（登记面漏更的铁证·EXEC 重 pin `:254`→`:248`·P2-1 sanction 修正）** |
| `.github/workflows/ci.yml` | —（只读引用） | `:25` verify job·`:191-:192` 「DBHY-1 卫生刀 prove」步 `pnpm dbhy1:prove`（本红唯一 CI 接线） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报嫌疑「0202? 或更早」**：**0202 排除归因**——`a76277f9` 0202 恰 2 语句 ALTER CONSTRAINT 值域扩容（DROP CONSTRAINT ck_interview_event_kind+ADD NOT VALID+VALIDATE·零对象类 DDL·全文 rg 亲证）→真归因=**更早：`7152cd3c`（2026-10-14·b5m BATCH5B-MIG EXEC）落 0199**（§1.2 链）。
2. **简报口径「sql/ 侧哪四类名录的哪几个对象」**：四类中恰 **indexes 类 2 对象**（functions/triggers 缺=0·policies 缺=3 全豁免）——逐名见 §1.2。
3. **简报口径「1/28 失败（27 PASS）」**：本树复现同指纹（`✗ 1/28 失败`）·28 臂构成亲数=P0 1+P1 4+P2 1+P3 1+P4 6+P4⑤ 1+P5 13+P6 1=28。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations/*.sql | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`（与 ci-red-clear nail 题面「链 202 头 0202」恒等）。
- 本刀修法=纯豁免登记数据面 3 行（§1-修法件①）·**预期零迁移零 DDL**。协调规则：EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**·Ban 抢号 Ban 私占（沿 negbend §0.3 先例）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 首曝机制（存量红·非新引入）

- **CI 侧**：`ci.yml:191-192` dbhy1:prove 步须 verify job 存活至迁移链重建+P5 例程完跑（本树实测全套 6m 量级）——nail 前 verify 死于更早 egress 步（21-33s·run `38682824757` 40s failure 佐证）从未达此步；ci-red-clear nail（`0c06033d`）清欠后 run `38694613666`（6m6s）首达→**存量红首曝**（红本体系 0199 落链即埋·2026-10-14 起）。
- **本地侧**：门矩阵各在飞刀（b5m/ag39/ag39q/b5m 族等）不含 dbhy1:prove（`ci.yml:191` 为唯一接线）→10-14 落链至 10-15 首达窗内零暴露点。
- **起草席复现（本树 @`0c06033d`·`pnpm dbhy1:prove`）**：EXIT=1·`✗ 1/28 失败`·唯一 FAIL=P4⑤ 断言（`:348`）——与 CI 日志尾逐字一致。

### 1.2 失败对象逐名定案（复现 run P4⑤ 四行原文·逐名打印）

```
  P4⑤ functions: sql=34 mig=358 缺=0（豁免登记=0）
  P4⑤ triggers: sql=7 mig=93 缺=0（豁免登记=0）
  P4⑤ policies: sql=48 mig=338 缺=3（豁免登记=3）
    - [policies] public.ai_model_invocation:p_owner（豁免…）
    - [policies] public.consumption_record:p_owner（豁免…）
    - [policies] public.resume_ocr_artifact:p_owner（豁免…）
  P4⑤ indexes: sql=38 mig=114 缺=3（豁免登记=1）
    - [indexes] ix_qfb_rating（未登记=红）
    - [indexes] ix_user_email（未登记=红）
    - [indexes] uq_interview_application_binding（豁免·0046:33 故意 DROP…）
```

- **未登记缺口=恰 2·全在 indexes 类**：`ix_user_email`（sql/ `9082403f` :17 ↔ 迁移侧原 `d68f8dd0` :370）+`ix_qfb_rating`（sql/ `60248b84` :13 ↔ 迁移侧原 `51302acf` :28）。
- **归因 commit=`7152cd3c`（2026-10-14·b5m）落 `0199_redundant_index_drop.sql`（`180470d8` :19-:20）**：迁移侧按 #122 裁决⑨案a 真删两冗余索引完成退役；sql/ 镜像零触（0199 头注 `:16-:17` 自证「sql/ fixture 零改（触面清单外）」·EXEC 重 pin 随 P2-2）→sql/ 侧两 CREATE 形成为「迁移侧无·镜像有」的对象类漂移。
- **登记面漏更铁证**：b5m REQUEST `fae7c2b0` **`:248`** 出入呈报原文点名列出两文件两行（EXEC 重 pin `:254`→`:248` 随 P2-1 sanction·实测锚）——b5m 知悉滞留并如实呈报「门范围外」，但 dbhy1 豁免登记面（`c88320dc` :221-:238·末触 `03adfbe6`）未接上该呈报=**跨卷登记链断点**（b5m 呈报→dbhy1 豁免表，无人补账）。
- **drift 门不红的结构性原因**：普通索引不在 drift 对账范围（`dbhy1-db-hygiene.md:96`+schema-drift-check 脚本零 INDEX 字样·b5m `:210`/:254 双承登）——对象类唯一机器面=dbhy1 P4⑤（本红所在）。
- **两索引零查询引用旁证**：0199 `:7-:8`（执行前置硬门「全仓 rg 零查询引用实测通过」）——退役语义自洽·非误删。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=裁决 b·名录登记补账**：`P4_OBJECT_EXEMPTIONS` 增恰 2 entry——对象已由 0199 真删退役（#122 半2·执行前置硬门+锁窗评估在案），登记面漏更补账即闭。卷内授权条款=`dbhy1-db-hygiene.md:170`「sql/ 侧独有对象若为 DROP 型重放辅助（亲核入卷）则登记豁免后放行」·先例形=`:226` `uq_interview_application_binding`（同「迁移侧故意 DROP·sql/ 夹具滞后旧索引」语义·逐对象亲核理据入 entry）。
- **候选乙（否决·Ban）=迁移侧重加两索引**（补 CREATE INDEX 新迁移）：与 0199/#122 退役裁决正面对撞（冗余索引复活=email 列双 btree 回归+零引用索引复活）·零卷面授权·production 行为回归——否决。
- **候选丙（否决·Ban）=sql/ 镜像删两行**：镜像冻结纪律（案B 两步退役·`dbhy1-db-hygiene.md:125` 冻结禁改语义·b5m `:254` 自证镜像不在触面清单）——镜像处置归 neg 迁移另刀统删目录时一并收口；就地删行=越界+破坏「历史镜像滞后如实登记豁免」既有口径（`:224-:237` 13 entry 全按此先例）——否决。

## §1-修法（名录登记补账刀·预期恰 1 产品文件净 +3 行·零迁移零 sql/ 触）

- **件①（唯一码改）**：`packages/db/test/dbhy1.proof.ts`（现 `c88320dc`）——`P4_OBJECT_EXEMPTIONS` 映射内 **`:226` entry 之后、`:227` qbank 注释组之前**插入恰 3 行（1 注释+2 entry·key 形制=`indexes:索引名` 逐字承 `:343` 匹配前缀·理据承 0199 `:5-:8` 头注逐字语义）：
  - 注释行：`// b5m #122 半2 0199 冗余索引 DROP（7152cd3c 2026-10-14 落链·PR#108 dbhy1 P4⑤ 首曝两缺口·b5m REQUEST :248 呈报→本登记面漏更补账）：`（**EXEC 落笔随 P2-1 sanction 用实测锚 `:248`·起草值 `:254` 作古**）
  - `['indexes:ix_user_email', '0199 故意 DROP（#122 半2 冗余索引退役·email UNIQUE 约束背衬索引同列双 btree）·sql/ 夹具滞后旧索引'],`
  - `['indexes:ix_qfb_rating', '0199 故意 DROP（#122 半2 冗余索引退役·全仓 rg 零查询引用）·sql/ 夹具滞后旧索引'],`

  **diff 预期=恰 1 文件净 +3/−0**（`:221-:238` 映射与其余 496 行零字节改·P4⑤ 断言本体 `:313-:348` 零触）。**key 形制纪律**：klass 前缀写错（如 `index:`）=匹配不中=P4⑤ 仍红·非「修法无效」而是笔误红·EXEC 自检必对打印行「（豁免·0199 故意 DROP…）」字样。
- **件②（prove·恰 1 run 零 retry-to-green）**：`pnpm dbhy1:prove`→期望 EXIT=0 **28/28**·P4⑤ 四行逐名核对判据=functions 缺=0/triggers 缺=0/policies 缺=3（豁免登记=3）/indexes 缺=3（**豁免登记=3**·两新 entry 出现「（豁免·0199 故意 DROP…）」打印·「未登记=红」字样清零）。改前基线=§1.2 本树 run 原文（起草席亲跑·红名单两索引已钉·EXEC 不必另做改前 run——同红已在 CI+本树双面亲证）。
- **件③（收据）**：`ai-docs/delivery/receipts/dbhy1-p4-fix/00-exec.md` 七字段（门矩阵全表+EXIT 原值+P4⑤ 改前改后逐名对照+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）——**收据目录 untracked 不入库**（negbend §9 先例·不计 docs:check 扫描面·§2 门 9 余 0 承载前提）。
- **sql/ 镜像与迁移侧同步规则（成文·后继刀对表）**：迁移侧=唯一权威单真相（pre-migration single truth·DBHY-1 案A/B'）；`packages/db/sql/` 25 文件=冻结历史镜像（两步退役第一步·保留至 neg 迁移另刀删目录·P3 门守代码面引用残面）。两侧同步分三类通道：①**列+UNIQUE/PK 约束**→`drift:prove` 实时对账（sql⊆mig·未登记漂移=红）；②**对象类（函数/触发器/策略/索引）**→dbhy1 P4⑤ 名录 diff（sql⊆mig·DROP 型滞后经 `P4_OBJECT_EXEMPTIONS` **逐对象亲核登记**放行·授权条款=`dbhy1-db-hygiene.md:170`）；③**普通索引不在 drift 门范围**（schema-drift-check 零 INDEX 字样·b5m :210/:254 承登）→P4⑤ 唯一机器面。**推论（后继刀纪律）：迁移侧 DROP 普通索引/任一对象类对象的刀（0199 形），必须同刀补 dbhy1 豁免登记或同步呈报交接——本刀将此规则成文于本卷，登记链断点防复发。**

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准+偏差熔断）

1. **dbhy1:prove 28/28 复绿**：`pnpm dbhy1:prove` EXIT=0·臂总数恰 28（**熔断=0 容差**：总数≠28 或任一 FAIL 即触停止条件「现场漂移/机制不满足」）·P4⑤ 逐名四行对 §1-件② 判据（indexes 豁免登记=3·「未登记=红」清零）。
2. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链实测=202 头 0202（届时顺延如实记）。
3. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0（豁免既登恒等·零新漂）。
4. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=202 violations=0 exemptions=0143,0152,0160`（violations 恒 0·files 对届时链顶亲数·本起草树亲跑原值在案）。
5. **neg 六段不回退**：`pnpm -C apps/api neg:all` EXIT=0 **687/687**（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135·段序承 `apps/api/package.json:75`·687 值=`c8ca5f0f` sanction 后亲证值）——段和≠687 即停（熔断）。
6. **interview:prove 不回退**：`pnpm interview:prove` EXIT=0 **57 PASS**（`a76277f9` 0202 EXEC 收据口径·实测≠57 即停）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached·tsbuildinfo 副产 checkout 回滚沿先例）。
8. **lint 五值恰等**：`pnpm turbo lint` 12/12 0 errors·五值=web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（`c8ca5f0f` 2026-10-15 sanction 值·根预算行 `package.json:8` 亲证）——任一≠即停·零新增 warning。
9. **docs:check ≤cap 红停**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·基线 **2135**（本树亲跑）·**EXEC 重 pin：cap=届时主线 sanction 值 `2144`（uc184 `971a4032` +8 落值·`scripts/ai-docs/public-text-policy.mjs:75` 亲证 `:78` `MAX_FILES=2_144`·P2-3 sanction 修正锚 `:70`→`:75`）——>2144 红停上报**（起草时 2136/余 0 口径随并线作古·余量以实跑实测为准）·收据 untracked 不入库（件③）·**EXEC 实测注记：checker 按 worktree claim 计数（index+未暂存新增·`listTrackedPublicTextPaths` 自证）→untracked 收据仍计入 +1·终值 2139≤2144 余 5**·Ban 自升 cap（cap sanction 权归协调方）。
10. **markers 五类零命中**：本刀改动集（1 .ts 件①+1 .md 本卷）五类标记词+冲突标记 grep 零命中（词面运行时组装防自匹配·沿 i6-239 §2-7 口径·命令与回执入收据）。
11. **diff 面机检**：`git diff --numstat <base>` 恰 2 tracked 路径=`packages/db/test/dbhy1.proof.ts`（恰 +3/−0）+本卷 .md——多任何 tracked 路径即停（越界需要类）。
12. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·est live=0（全门本地静态+隔离容器·零模型外呼·`actualSpendCny=null`）。

## §3 范围外（边界清单·越界即 FAIL）

1. **sql/ 25 文件零触**：`git diff` 零 sql/ 路径（候选丙否决·§1.3·镜像冻结至 neg 另刀）。
2. **零迁移零 DDL 零改史**：migrations/ 目录零增零改（P2 冻结基线 Ban 历史迁移改写自守·§0.3 预期零）。
3. **schema-drift-check.mjs 零触**：普通索引本在其对账范围外·零扩面诉求（候选乙否决连带·需扩面=越界停）。
4. **P4⑤ 断言本体零触**：`c88320dc` :313-:348 断言逻辑/四类名录 SQL/逐名打印面零字节改（Ban 为绿改断言沿承）——本刀只动豁免登记数据面（:221-:238 映射内 +3 行）。
5. **邻套件零触**：neg 族/interview/sse-push/scoring-integrity/egress/gitleaks allowlist 面零改。
6. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——红清单行翻面权归协调方。

## §4 依赖

**①上游已满足**：0199 在链（`7152cd3c`）=退役语义本体；ci-red-clear nail（`0c06033d`）=verify 活到 dbhy1 步的接线前提；dbhy1 卷 rev3+EXEC（`ai-docs/delivery/harness/dbhy1-db-hygiene.md`·prove 已在 CI 接线 `ci.yml:191`）。**②无同文件并发**：dbhy1.proof.ts 末触 `03adfbe6` 已在主线·`line/db-hygiene` 残枝判定 §0.0·在飞交叠复核规则=§0.0（EXEC 立项日必做）。**③迁移号**：§0.3 预期零。**④下游**：CI verify 绿通道恢复=PR #108 合并闸前提；neg 六段/interview 邻面 PASS 名单不回退=门 5/6 分母自守。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 恰 1 prove run·红不重跑冲销）；Ban 翻 pins（§5 十值·零翻转）；Ban 为绿改断言/动断言本体（§3-4）；Ban 触 sql/ 镜像（§3-1·候选丙否决沿承）；Ban 迁移 Ban DDL Ban 改史迁移（§3-2·需则停上报走认领规则）；Ban 扩 schema-drift-check 对账面（§3-3）；Ban 就地顺手修 P4⑤ 两缺口外的任何新曝对象（届时 P4⑤ 若现第三未登记对象→如实登记升级协调方·Ban 借机扩 entries）；Ban 改共享 SSOT（§3-6）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban docs:check 超限后自升 cap。

**pins（十值照抄·沿 `dbhy1-db-hygiene.md:260` 登记面·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——起草侧唯一实跑=dbhy1:prove 复现（隔离容器·假体零模型外呼）+静态门亲证·零生产操作·零 secrets·零消耗；EXEC 期 prove 亦隔离容器零模型外呼（§2-12 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）五类标记词+冲突标记 grep 零命中（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装防自匹配·沿 negbend §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 逐名归因结论与 §5 Ban/pins 与 §1-修法件① 唯一码改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如 P4⑤ 断言/豁免映射结构改写·28 臂构成≠28·exemptions 数≠202·链头≠0202·§0.0 在飞分支对 `packages/db/test/dbhy1.proof.ts` 有主线后新增提交）→停·重 pin 回炉。
- **机制不满足**：件② prove run 两索引未翻「（豁免·…）」打印或 P4⑤ 仍红·或曝出第三未登记对象（=§1.2 归因被证伪或有漏采）→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法件① 恰 1 文件 +3 行面（需触 sql/ 镜像/断言本体/drift-check/迁移/邻套件）→停·另刀或协调方裁决（§1.3 候选乙/丙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻套件新红/lint 第五值外新值/docs:check>2136）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（2026-10-15·EXEC 席·pre-exec 双审会签 PASS（席1 agent_83a03e01+席2 agent_8836c5bd）+协调方 EXEC 授权（附 P2-1/P2-2/P2-3 三锚 sanction）后开工·STOP=`executed:awaiting_post_prove_dual`）

### 9.0 序 1 并线

- `git fetch`→`feat/mysql-schema-skeleton` 本地与 origin 恒等 @`42527046`（uc184-slot-order nail 波 SSOT·cap 2144 已落）；`git merge-tree --write-tree` 预演**零冲突**→`git merge --no-ff feat/mysql-schema-skeleton` 成 **merge `a7139067`**（零冲突·并集解未启用·⛔pull --rebase 未用）。并线基座=`a7139067`（下称届时 tip）。

### 9.1 重 pin 全表（EXEC 立项日 @`a7139067` 亲测·git hash-object/sed/wc/ls 实测）

| 锚 | 起草值 | EXEC 复测 | 结论 |
|---|---|---|---|
| `packages/db/test/dbhy1.proof.ts` | blob `c88320dc`·499 行·末触 `03adfbe6` | 恒等（`c88320dc`·499·`03adfbe6`） | 零漂 |
| proof.ts 映射区行锚 | `:221` 开/`:224-:225`/`:226` 先例/`:227-:228` 注释组/`:229-:237` 九 GUC/`:238` 闭 | 逐行亲读恒等 | 零漂 |
| proof.ts P4⑤ 面 | `:338/:343/:344/:345/:346/:348` | 恒等 | 零漂 |
| `0199_redundant_index_drop.sql` | blob `180470d8`·20 行·`:5-:8`/`:15-:16`/`:19-:20` | blob/行数恒等·drift 面注释**实测 `:16-:17`**（`:16` drift 面+`:17` fixture 零改·起草 `:15-:16` 差一行） | **P2-2 sanction 修正落 pin** |
| 批5b 呈报锚 | `fae7c2b0`·387 行·`:210`/`:254` | blob/行数恒等·`：210` 恒等·呈报原文**实测 `:248`** | **P2-1 sanction 修正落 pin（`:254`→`:248`）** |
| cap 锚 | `public-text-policy.mjs:70` | **实测 `:75`**（cap sanction 注释行·`:78` `MAX_FILES=2_144`=uc184 `971a4032` +8 已落） | **P2-3 sanction 修正落 pin（`:70`→`:75`）** |
| `09_auth.sql`/`16_feedback.sql` | `9082403f`:17/`60248b84`:13 | 恒等 | 零漂 |
| `0001_baseline.sql`/`0019_schema_drift_reconcile.sql` | `d68f8dd0`:370/`51302acf`:28 | 恒等 | 零漂 |
| `dbhy1-db-hygiene.md` | `cd0c7fc6`·`:96/:125/:170` | 恒等 | 零漂 |
| ci.yml dbhy1 步 | `:191-:192` | 恒等（name@191/run@192） | 零漂 |
| 迁移链 | 202·头 0202 | 202·头 `0202_interview_event_kind_score_card_written.sql` | 恒等 |
| §0.0 在飞交叠 | 规则必做 | 全分支（local+remote）对 proof.ts 末触扫描=**非祖先命中 0**（全=`03adfbe6` HEAD 祖先） | 零漂 |
| §0.2 归因 | `7152cd3c`/`a76277f9` | 双 commit 在 HEAD 亲证·归因结论不变 | 零漂 |

### 9.2 修法件① 落点（恰 1 产品文件净 +3/−0）

- `packages/db/test/dbhy1.proof.ts` `P4_OBJECT_EXEMPTIONS` 映射 `:226` `indexes:uq_interview_application_binding` entry 之后、`:227` qbank 注释组之前插入恰 3 行：1 注释行（**随 P2-1 sanction 落笔实测锚 `:248`**：`// b5m #122 半2 0199 冗余索引 DROP（7152cd3c 2026-10-14 落链·PR#108 dbhy1 P4⑤ 首曝两缺口·b5m REQUEST :248 呈报→本登记面漏更补账）：`）+2 entry（`indexes:ix_user_email`/`indexes:ix_qfb_rating`·key 形制 `${klass}:${n}` 同构·逐字承卷面修法）。映射外 496+2 行零字节改·P4⑤ 断言本体零触。

### 9.3 门矩阵十二门全表（EXIT 原值）

| # | 门 | 命令 | EXIT | 实测 |
|---|---|---|---|---|
| 1 | dbhy1:prove 复绿（恰一次·零 retry） | `pnpm dbhy1:prove` | 0 | **28/28 全绿**（`✓ DBHY-1 prove 28 断言全绿`·臂构成 P0 1+P1 4+P2 1+P3 1+P4 6+P4⑤ 1+P5 13+P6 1=28·`applied=202 skipped=0` 同 run 机证）·P4⑤ 四行：functions 缺=0/triggers 缺=0/policies 缺=3 豁免=3/**indexes 缺=3 豁免=3**·两新 entry 打印「（豁免·0199 故意 DROP…）」·「未登记=红」清零（改前基线=§1.2 复现 `✗ 1/28 失败`·27+1 翻登记） |
| 2 | migrate:prove | `pnpm migrate:prove` | 0 | 123 臂全 PASS（`✓ 迁移运行器 全部通过`）·链 202 头 0202 |
| 3 | drift:prove | `pnpm drift:prove` | 0 | `✓ schema 无漂移`·豁免既登恒等（consumption_record 两条 UNIQUE 残面豁免·未登记 0） |
| 4 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | 0 | `files=202 violations=0 exemptions=0143,0152,0160` |
| 5 | neg 六段 | `pnpm neg:all` | 0 | **687/687**（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135·段和恰等） |
| 6 | interview:prove | `pnpm interview:prove` | 0 | **57** PASS（`✓ 当前 v64 面试链路全部通过`） |
| 7 | typecheck | `pnpm turbo typecheck --force` | 0 | Tasks: **8 successful, 8 total**·Cached: 0 cached·tsbuildinfo 副产（apps/web/tsconfig.tsbuildinfo）checkout 回滚沿先例 |
| 8 | lint 五值恰等 | `pnpm turbo lint`（+`pnpm -C packages/ai-runtime lint` 补测第五值） | 0 | 12/12 successful 0 errors·五贴线：web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（主跑 10 cached 未出 ai-runtime 值·直跑实见 `✖ 628 problems (0 errors, 628 warnings)`） |
| 9 | docs:check ≤cap | `node scripts/ai-docs/check-docs.mjs` | 0 | **收据前 2138 ≤ 2144·收据落盘后终值 2139 ≤ 2144 余 5**（届时主线 cap=uc184 `971a4032` sanction 值·`public-text-policy.mjs:75/:78` 亲证·本节收尾复跑；untracked 收据按 worktree claim 计入 +1 系 checker 设计非扫描面豁免）·起草 2136/余 0 口径随并线作古（如实改锚·P2-3） |
| 10 | markers 五类 | 词面运行时组装（四词+冲突标记对·`i6-239-gates.proof.mjs:151-:163` 形·词面不入卷防自匹配）扫改动集 | 0 | hits=0（见 9.6 回执） |
| 11 | diff 面机检 | `git diff --numstat HEAD` | — | 恰 **2** tracked：proof.ts **+3/−0**+本卷 .md（收据 untracked 不计） |
| 12 | 卫生 | `pnpm install --frozen-lockfile` | 0 | 零 lockfile 改（`git status pnpm-lock.yaml` 空）·`.env*` ABSENT（root glob+depth-3 find 双零命中）·actualSpendCny=null·est live=0 |

### 9.4 P4⑤ 改前/改后逐名对照（件② 机证）

```
改前（起草席 @0c06033d 复现·§1.2 原文）          改后（本 EXEC run @a7139067 件① 后）
  P4⑤ indexes: 缺=3（豁免登记=1）                  P4⑤ indexes: 缺=3（豁免登记=3）
    - [indexes] ix_qfb_rating（未登记=红）            - [indexes] ix_qfb_rating（豁免·0199 故意 DROP（#122 半2 冗余索引退役·全仓 rg 零查询引用）·sql/ 夹具滞后旧索引）
    - [indexes] ix_user_email（未登记=红）            - [indexes] ix_user_email（豁免·0199 故意 DROP（#122 半2 冗余索引退役·email UNIQUE 约束背衬索引同列双 btree）·sql/ 夹具滞后旧索引）
    - [indexes] uq_interview_application_binding…     - [indexes] uq_interview_application_binding（豁免·0046:33 故意 DROP…）
  ✗ 1/28 失败（P4⑤ 断言）                          ✓ 28/28 全绿
```

恰一次改后 run·零 retry-to-green。

### 9.5 偏离清单（如实登记·五条·零越界）

1. **sanction 锚传播**：P2-1（`:254`→`:248`）/P2-2（`:15-:16`→`:16-:17`）除 §0.1 表与件① 注释外，同锚在 §1.2 两处正文引用同步更正（同锚全卷一致性·行号更正结论零变·§0 协议「如实改锚」口径）。
2. **邻面计数补采双跑**：migrate:prove 臂数（123）/neg:all 六段分值/interview 57 经第二次全绿 run 补采（恰一次纪律仅系件② dbhy1:prove——门 1 恰一次零 retry；两次全绿非红冲销）。
3. **lint 第五值直跑补测**：`pnpm turbo lint` 主跑 10 cached 跳过 ai-runtime 未出值→`pnpm -C packages/ai-runtime lint` 直跑实见 628（包目录在 `packages/ai-runtime`·题面 `apps/ai-runtime` 系简写）。
4. **门 9 口径更新**：起草「2135+1=2136≤cap 2136 余 0」→实测 **2138≤cap 2144 余 6**（uc184 并线带入 +3 受管文件；cap 2144=届时主线 sanction 值·协调方 EXEC 授权门面即「≤2144·届时主线 cap」·非本席自升）。
5. **件③ 收据 untracked 落盘**：`ai-docs/delivery/receipts/dbhy1-p4-fix/00-exec.md`（不入库·negbend §9 先例·协调方 EXEC 序未点名·沿卷面修法件③补齐）·**口径勘误如实登记：卷面原预想「untracked 不计 docs:check 扫描面」不成立——checker 按 worktree claim 计数（index+未暂存新增），收据实测计入 +1（2138→2139）·仍 ≤cap 2144 余 5·非红**。

### 9.6 markers 扫描回执（词面不入卷）

- 命令形：四标记词运行时字符拼接（`['T','O','D','O'].join('')` 等四组）+冲突标记对正则，对改动集（proof.ts+本卷 .md+收据本件）逐文件 `includes`/正则扫描（`i6-239-gates.proof.mjs:151-:163` 同形）。
- 回执：**EXIT=0·hits=0**（五类零新增命中·收据落卷后复扫含本件）。

### 9.7 pins 零翻声明

十值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null。Ban 列表零触（⛔push/零迁移零 DDL/sql/ 零触/断言本体零触/SSOT 零触/恰一次 prove 零 retry）。

---

*DBHY1-P4-FIX REQUEST · 2026-10-15 起草 · 2026-10-15 EXEC 落码 · **`executed:awaiting_post_prove_dual`**（§9 EXEC 记录·门矩阵十二门全绿·post 双审两独立外席待派·红清单/批表翻面权归协调方） · pre-exec 双审会签 PASS（席1 agent_83a03e01+席2 agent_8836c5bd）+协调方 EXEC 授权（附 P2-1 `:254`→`:248`/P2-2 0199 `:16-:17`/P2-3 cap `:75` 三锚 sanction） · base `feat/mysql-schema-skeleton` @`0c06033d`→EXEC 并线 origin tip `42527046`（merge **`a7139067`** 零冲突） · 分支 `line/dbhy1-p4-fix`（EXEC 前 HEAD=`d55b7b4a`） · 工作树 `meetwise-dbh` · 修法件① 恰 1 产品文件净 +3/−0 落地（`P4_OBJECT_EXEMPTIONS` `:226` 后 1 注释+2 entry·注释行实测锚 `:248` 随 P2-1 sanction 落笔）· 门矩阵=**dbhy1:prove 28/28 复绿（27+1 翻登记·恰一次零 retry）**+migrate 链 202 头 0202（123 臂）+drift 零漂+uniqueness files=202 violations=0+neg 六段 687+interview 57+typecheck 8/8 0 cached+lint 五值恰等 web 601/root 5235/api 1421/worker 954/ai-runtime 628+docs:check **2139≤2144**（届时主线 cap·P2-3 锚 `:75`·收据落盘后终值）+markers 五类零命中+diff 恰 2 tracked（proof.ts+本卷 .md）+卫生（零 lockfile 改·.env* ABSENT·actualSpendCny=null·est live=0） · 零迁移零 DDL · pins 十值照抄零翻 · 停止条件四类零触发 · Ban self-approve · alone≠dual · post 双审待派 · ⛔push · ⛔force push · STOP*
