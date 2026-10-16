# G1 SCORE-S3 EXEC 收据（#42 对拍 + #43 守门 + #41 ADR · 2026-10-10 · g1-exec）

授权：协调方 EXEC（rev2 D1-D3 按落卷定值）· 席=EXEC · alone≠dual（post-prove dual 待开）
分支 `line/g1-score-s3` @ rebase 后 `4341db1a`（REQUEST rev2）· est live=0 · actualSpendCny=null · 0 Key 值接触 · markers=0 · pins 十一值零翻转

## 1. rebase 与锚点漂移表

`git rebase feat/mysql-schema-skeleton` EXIT=0 零冲突（主线 9cac8778→74895b7c 落了 8 个 docs/merge 提交：G2/EVIDENCE-DELIVERY/全量回归矩阵/EVIDENCE nail 等，与本刀面零交）。rebase 后 4341db1a 上逐锚亲读重定位：

| 锚 | rev2 pin | post-rebase 实测 | 判定 |
|---|---|---|---|
| domain/scoring-fact-root.ts:19-27 | 10 态/5 态枚举 | 原位命中（:19-21/:26） | 无漂移 |
| :47-58（:52 review_required→unscored） | 转移表 | 原位命中 | 无漂移 |
| :62-67 canTransitionScoreCard | 幂等/吸收/生命周期 | 原位命中（吸收恰 {superseded,fenced}） | 无漂移 |
| domain/scoring-aggregation.ts:97-119 | 确定性公式 | 原位命中 | 无漂移 |
| 0100:141/:178 | CHECK 枚举 | 原位命中 | 无漂移 |
| 0100:362-382/:385-422 | 单向门/状态机触发器 | 原位命中 | 无漂移 |
| 0100:634-636/:869-876/:1006-1013 | INSERT 面①②+score_request 唯一面 | 原位命中 | 无漂移 |
| 0103:129-134/:234-240/:251-258 | write_final 白名单/公式/直插 | 原位命中 | 无漂移 |
| 0109:157-194（:184-185 边）/:416-420/:455/:457/:470-478 | live 版状态机/公式/adjudicate | 原位命中 | 无漂移 |
| scor-01:222-243 / scor-03:188-191 | 既有抽测 | 原位命中 | 无漂移 |
| ci.yml :95/:137/:148/:208 | 勘误②三 pin + scor-00 先例 | 全部原位命中 | 无漂移 |
| root package.json :444/:519-520 | 脚本形制 | 原位命中 | 无漂移 |
| runner deps 表 :1451 邻域 / ternary :2051 邻域 | 注册面 | 原位命中 | 无漂移 |
| runner :1734 族 + :1767 族 | 家族清单「两处」 | 实为**同一** supported-target gate 数组（:1726 起 `if (![...].includes(target))`）——一次增项两族同得 | 形制注记（非漂移） |
| runner migrateWithRecovery 白名单（~:2592） | rev2 未显式列（「baseline 前置」行使面） | scor-01/02/03 同列；新键**必须**同入否则一次性隔离库不跑迁移 | 必要增点（照 scor-01 同族） |
| packages/db/package.json :62-64 | prove 族 | 原位命中 | 无漂移 |
| 现树最大迁移 0157 | D2 顺延依据 | 0157_billing_payer_route.sql 仍在（rebase 未引入更新编号） | 无漂移 |
| 0020:8/:18/:84 + :79-84 域；adr/README.md:77/:78 | D3 面 | 原位命中 | 无漂移 |

**披露（sql/ 镜像不适用）**：协调方执行序有「镜像 sql/ 同步」——实物核查：scoring 域**无 sql/ 镜像承重墙**（0100/0103/0109 均未镜像，`grep score_card packages/db/sql/*.sql` 0 命中；score-writer S1/S2 `50cb3238` 也零 sql/ 触碰），且 dbhy1 P4⑤ 会把 sql/ 全文件重放断言 ⊆ 迁移侧——把 score_card 触发器写进 sql/ 反而使重放炸表。按 scoring 域先例**不镜像**，0158 只落 packages/db/migrations/。

## 2. 交付面（三条款逐条）

### #42 对拍（D1=(b)）
- 新 proof：`packages/db/test/scor-parity.proof.ts`（57 断言 · 首跑+确认复跑双绿）
  - §A 枚举值级：TS 10 态/5 态 ↔ live DB CHECK（pg_constraint 现值·非文本解析）双向逐值（2 断言）
  - §B card 全矩阵 **10×10=100 格**逐值互推：`canTransitionScoreCard` ↔ SAVEPOINT 包裹真实 UPDATE 施于 0109 live 触发器（通/23514·回滚保位），含 :52 review_required→unscored 边、吸收态全集、幂等对角、生命周期 →superseded/fenced 边
  - §C request 全矩阵 **5×5=25 格**：单向链（live UPDATE 实测）↔ TS 期望表（domain 枚举次序钉定）+ 枚举次序交叉一致
  - §D 公式值级：write_final(0103 副本) **12 向量** + adjudicate(0109 副本) **4 向量** + highImpact review_required 1 向量；两 SQL 副本互拍 4 组（三方逐值）；**零漂移检出**
  - §D' 拒绝路径算术可达面 4 组：空集/重复 criterionId/非法档位（0103:197 白名单）/非法权重（0100:77 CHECK）——TS fail ↔ SQL 拒，reject-vs-reject 不伪造错误码
  - §E #43 守门正负测（见下）
- 四处注册（缺一不可·全落）：
  1. 根 `package.json` 双脚本：`scor-parity:prove`（:445 后·runner 形同 scor-00:444）+ `scor-parity:prove:raw`（scor03:raw 后·`pnpm -C packages/db prove:scor-parity` 形同 scor-01:520-521）
  2. runner `isolatedReceiptSources` deps 条目（scor-01 条目后·文件清单含新 proof+domain 两文件+0100/0103/0109/0158+baseline 前置族）
  3. supported-target gate 数组（scor-01/02/03 族行后·即 rev2 :1734/:1767 两族——同一数组一次增项）
  4. ternary 链 `scor-parity:prove:raw` 臂→`['pnpm', ['-C', 'packages/db', 'prove:scor-parity']]`（scor03 臂后）
  - 加注册点 5（必要前置）：`migrateWithRecovery` 白名单同列增 `scor-parity:prove:raw`（scor-01/02/03 同列——不入则一次性隔离库零迁移，proof 必红）
  - `packages/db/package.json` `prove:scor-parity`（prove:scor-03 后）
- ci.yml 增步：scor-00:http:prove 步后增「评分状态机/公式 TS↔SQL 对拍 + INSERT 初始态守门」步（`pnpm scor-parity:prove`·isolated-runner 一次性本地 PG 车道·沿 scor-00:208 先例·勘误① isolated-runner 键语义）

### #43 INSERT 守门（D2=0158）
- 新迁移 `packages/db/migrations/0158_score_card_insert_guard.sql`（0157 实证顺延·零复写 0100/0103/0109）：形制照 0109:190-194 四件套（`ALTER FUNCTION … OWNER TO scoring_definer_owner` + `REVOKE ALL … FROM PUBLIC, app_role` + `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`）· 命名 `score_card_insert_guard`（*_insert_guard/家族形）· 函数 `assert_score_card_insert_initial_status` · 白名单恰四值 `{pending_evidence, review_required, practice_eligible, b_review_eligible}` · 非法 RAISE 23514 · 头注载四处 INSERT 面亲证（0100:875/:1010·0103:257·0109:478）+ score_request 面不挂定谳（0100:634 唯一面+0100:141 CHECK 已限）
- 兼容面核清：content-immutable guard（0100:354/0109:146）列清单不含 status → 状态 UPDATE 面零扰；`apps/api/test/validate.ts:112` 裸 INSERT 用 `practice_eligible`（白名单内）→ api:validate 零伤
- 负测 6 值全绿：`evidence_valid/evidence_invalid/unscored/calibration_blocked/superseded/fenced` 裸 INSERT（克隆真实行+无卡 request·排除 partial-unique 23505 干扰）逐个 SQLSTATE=23514 拒 + 白名单内 review_required 同形对照组全通（恰四值不误伤）
- **正测硬门全绿（不可削弱）**：四处 INSERT 面逐个经真实函数行使——①record→pending_evidence ②supersede→pending_evidence ③write_final→practice_eligible/b_review_eligible 双值 ④adjudicate→practice_eligible/review_required 双值（SECURITY DEFINER 路径同触发守门）

### #41 ADR（D3 最小形制）
- `adr/0020-*.md:8` frontmatter `status: proposed`→`accepted`；`:18` 标题 proposed→accepted；`adr/README.md:77` 目录行 proposed→accepted
- README:78 后果行 accepted 语义收口（「等待产品确认与专用 writer 部署设计」→ 已接线事实 + 保留未闭合项指涉）
- 0020:84 状态段收口：accepted + 接线收据锚 `50cb3238`（S2 EXEC）`2c3a7d80`（nail）+ **保留未闭合项**（C 端完整可见性切换/只读 practice_eligible 收窄/GET 重闸/B 端校准）与 §6 Non-claims 对齐
- +1 行「已接线」锚落 :79-84 域（「后果与验证」节内首行）
- 零触：决策正文（:26-67）/被否方案（:69-77）/:63 产品过渡措辞——一字未动

## 3. round 边界对拍向量披露（浮点 vs numeric）

rev2 执行要求①：向量全部选「可证一致」权重，逐向量以**精确整数运算**机器断言可证类（`roundClassIsProvable`），三类：
- **整商**（num%den==0·binary64 精确无舍入）：F1 w[2,3]→80 · F2 w[2,3]→70 · F3 w[2,3]→0 · F10 w[7]→100 · F11 w[7]→50
- **.5 精确命中且 den=2 的幂**（binary64 商精确；TS Math.round 与 PG round(numeric) 对正值半点同为向上舍入）：F4 w[1,3] 37.5→38 · F5 w[1,3] 12.5→13 · F6 w[2,2,4] 62.5→63 · F7 w[1,1,2] 62.5→63
- **远界**（距最近 .5 有理距离 ≥1/6；float64 绝对误差 ≤100×2⁻⁵²≈2.2e-14 ≪ 1e-6 不可能翻转）：F8 w[1,2] 50/3→17 · F9 w[1,2] 200/3→67 · F12 w[2,4] 400/6→67
- 结果：**17 组公式对拍（12 write_final + 5 adjudicate）全部 SQL=TS=期望·零漂移**；两 SQL 副本互拍 4 组同值。

## 4. EXIT 表（attempts 全账·零 retry-to-green）

| 门 | attempts | EXIT | 计数 |
|---|---|---|---|
| scor-parity:prove（新） | 1 首跑 | 0 | 57 PASS / 0 FAIL |
| scor-parity:prove 确认复跑 | 2 | 0 | 57 PASS（receipts 日志） |
| scor-01:prove 零翻复跑 | 1 | 0 | 64 PASS |
| scor-02:prove 零翻复跑 | 1 | 0 | 59 PASS |
| scor03-evidence-conflict:prove 零翻复跑 | 1 | 0 | 64 PASS |
| migrate:prove | 1 | 0 | 95 PASS |
| neg:interview 亲跑 | 1 | 0 | 97 PASS（基线原值 97 绿） |
| db tsc 基线 | 1 | 20 error（全预存） | scor-parity 增量=0（修复自身 6 处 noUncheckedIndexedAccess 后·预存 20=rag03c 12+uc017 2+qbank-handoff 2+privacy-proof 1+domain 3） |
| docs:check | 1 | 1 | **预存 base 红**（见 §5） |

## 5. 预存 base 红披露（零修复·域外）

- **docs:check `PTP_FILE_LIMIT:4327`**：`public-text-policy.mjs` MAX_FILES=2_048 硬上限 vs 实际受管路径数——**HEAD 无本刀改动时已 4325 ≫ 2048**（工作树 4327 = HEAD 4325 + 本刀新文件 2：0158 迁移+新 proof，均系刀面交付物）。规则为纯计数门，4325 与 4327 同红——**零语义恶化**。主线 `c51bf18b`（deps-audit）已登记「arch/docs 既有红前后零恶化」同源。不修：越限源自数千历史 ai-docs/receipts 文件，修法（抬 cap/删文件）属域外扩权，留协调方另裁。
- `scoring-integrity EXIT=1`（:99 hasOwn 既有红）：本刀零触零跑（REQUEST §2 划界）。

## 6. 停止条件核查（全否）

1. 对拍检出 TS/SQL 漂移且对齐超一行级 → **否**（100+25+17 组全一致·零漂移）
2. 白名单值与四处 INSERT 实测不符 → **否**（并集恰四值·validate.ts:112 夹具 practice_eligible 亦在列）
3. scor-01/02/03 零翻失败 → **否**（三键全绿）

## 7. 边界自查

只在本工作树本分支 commit·⛔push·⛔动主线·⛔触其他工作树·S2 已落面零触（v6/D5/legacy/去桩零 diff）·评分语义零变（对拍为名不改 SQL·0158 只增守门不改既有语义）·#47/#98 零触·零 secrets·est live=0·markers=0。

实物核对（commit 前 `git diff --stat` + untracked 清单）：3 修改（root package.json / packages/db/package.json / scripts/run-e2e-isolated.mjs / ci.yml / ADR×2 = 6 修改）+ 2 新增（0158 + proof）+ 收据目录 + REQUEST 状态行。
