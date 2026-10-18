# WEAKNESS-S30-FIX weakness proof S30 断言适配刀（DB-HOTSPOT 席欠账二·快速链·mini REQUEST·落卷即停）

**Status**: **`executed:awaiting_post`**（EXEC 落卷 2026-10-17 §9·门矩阵全绿[改前红亲跑双证在卷+改后绿 EXIT=0]·post 审归协调方派单·Ban self-approve·前值 **`draft:awaiting_exec`**=起草态史录·⛔push ⛔merge主线 ⛔force push·est live=0）

**席位**：meetwise 战役「WEAKNESS-S30-FIX weakness proof S30 断言适配刀」快速链席（#185 双审席2+席1 跨枝地雷上报·DB-HOTSPOT 席欠账二·诊断+起草+EXEC 一体授权）。
**基线**：`line/weakness-s30-fix` @ `c4bd89132`（支线=origin/line/db-hotspot tip 等号亲证后建立——派单「fetch 后 origin tip≥c4bd89132 或更新」：fetch 后 `origin/line/db-hotspot` tip=`c4bd89132` 同值亲证=下界等号成立；DB-HOTSPOT nail 件落枝即此支线·主线 `origin/main`@`112e6d26` 不含该 commit 亲证 `merge-base --is-ancestor` EXIT=1）。主仓建支线：`git worktree add ../meetwise-ws30 -b line/weakness-s30-fix c4bd89132`。
**蓝本**：①#185 双审跨枝地雷上报（DB-HOTSPOT 刀件③ 14 调用点切换之一=weakness-backfill.ts:50 切 `interview_privacy_active_read`·其 21 文件集不含 weakness.proof.ts→门 4 prove:weakness S30 落地即红）；②DB-HOTSPOT REQUEST §1.4/§9-EXEC-④（weakness-backfill :50 系「有界读面 9 点」之一·切 `interview_privacy_active_read` 为定稿契约）；③`0206_interview_privacy_active_read_tier.sql`（read twin 权威 DDL·已在库）；④卷形=N-19 mini REQUEST（§0-§9 快速链一体席形）。

## §0 现状锚（起草席亲读亲证 @`c4bd89132`·blob `git rev-parse HEAD:<path>` 亲算·改前值）

### 0.1 blob 锚表

| 路径 | blob 改前 @`c4bd89132` | 锚点 |
|---|---|---|
| `apps/worker/test/weakness.proof.ts` | `1bf021a7` | `:111` S30 断言第二半正则 `/interview_privacy_active\(lp\.interview_id\)/`——要求 `(` 紧随 `_active`·对 `_read(` 形不匹配 |
| `apps/worker/src/weakness-backfill.ts` | `279388ae` | `:50` `AND interview_privacy_active_read(lp.interview_id)`（DB-HOTSPOT 件③ 切换后现形·零字节不触） |

### 0.2 地雷成立亲证（@`c4bd89132` 树）

- **正则不匹配**：proof:111 第二半 `/interview_privacy_active\(lp\.interview_id\)/` 对 backfill:50 现行 `interview_privacy_active_read(lp.interview_id)` 不匹配（`_active` 后须立 `(`·现形为 `_read(`）→ S30 FAIL。S30 第一半 `/interview_id <> \$2/` 对 backfill `:49` `lp.interview_id <> $2` 恒匹配·红源唯一在第二半。
- **proof 内引用唯一性**：`weakness.proof.ts` 全文件 `interview_privacy_active` 恰 1 命中=`:111`（grep 亲证）·单点适配零连带。
- **改前红亲跑双证**（CI 兜底窗口如实登记：`line/db-hotspot` 支线零 CI run[gh run list --branch line/db-hotspot 零命中]·主线 CI 对旧树恒绿不含本 commit——**CI 尚未红·改前红由本席主线 tip 树[=c4bd89132 树]亲跑佐证**）：①raw 形 `pnpm -C apps/worker prove:weakness` → `FAIL  S30 历史计划排除本场+围栏过滤`（S25-S29/S31-S34 全 PASS·S30 唯一红）；②隔离库全量 `pnpm weakness:prove`（isolated runner·receipt `.tmp/isolated-proof-receipts/2026-10-17T19-47-58-155Z-*.json`）→ `outcome:"failed"`·`exitCode:1`·`✗ 1 项失败`·manifest 迁移链顶恰 `0206_interview_privacy_active_read_tier.sql`（206 迁移）=红源与 read-twin 落库同卷亲证。

## §1 修法（恰一处·纯测试断言适配零产品语义·零迁移·零 workflow）

1. **proof:111 S30 第二半正则适配 read-twin 改名**：`/interview_privacy_active\(lp\.interview_id\)/` → `/interview_privacy_active_read\(lp\.interview_id\)/`。
2. **裁量登记（派单给裁量·双形 `interview_privacy_active(_read)?\(` 兼容形被否）**：取精确 read-twin 形。理由=S30 语义=断言 weakness-backfill **使用读分层函数**（DB-HOTSPOT §1.4 定稿契约：weakness-backfill :50 系有界读面 9 点之一·**必须**切 `_read`）——兼容双形会对「回退 locking 谓词」的漂移放行=断言力倒退；精确形把读分层契约钉死·与 `interview-privacy-read-tier.proof.ts`（read-twin 属 proof）同向。S30 标签「历史计划排除本场+围栏过滤」语义不变（围栏过滤承载函数由 locking 谓词换 read twin·DB-HOTSPOT P1-A 已披露：learning_plan×2 面=显式逐行锁求值减半非消除·RLS 内嵌谓词仍在）。
3. **零字节 Ban**：`apps/worker/src/weakness-backfill.ts`（本刀不改其一字节·`279388ae` 改后恒等亲证入 §9）；0058/0076/0206 权威函数与迁移全零触。

## §2 门矩阵（EXEC 全过为绿·逐条亲跑 EXIT 入 §9）

1. **改前红**：`pnpm weakness:prove`（isolated）对 `c4bd89132` 树亲跑 `✗ 1 项失败` EXIT=1·S30 唯一红（raw 形 FAIL 行佐证双证·见 §0.2）。
2. **改后绿**：`pnpm weakness:prove`（isolated）对改后树 EXIT=0·全断言 PASS 零 FAIL。
3. **邻面 proof**：`pnpm interview-privacy-read-tier:prove`（isolated·read-twin 属主 proof·DB-HOTSPOT 件③ 四臂）EXIT=0 零回归。
4. **markers**：本刀改动集（本 REQUEST+weakness.proof.ts）五类标记词运行时组装直扫（沿 `scripts/i6-239-gates.proof.mjs` 口径·词面不入卷防自匹配）零命中+全树行首冲突标记 grep 零命中。
5. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤**2248**（届 cap=2248·`5ec0cf6d0` 步进在卷·基线亲跑 2244·本卷 +1 REQUEST 预期 2245≤2248·零 sanction）。
6. **diff 面**：全刀恰 **2 tracked 路径**=本 REQUEST+`apps/worker/test/weakness.proof.ts`（`:111` 单行正则）·零其他·frozen-lockfile 零 lockfile 改。

## §3 范围外（越界即停）

- `weakness.proof.ts` 其余断言行（S11/S12 漂移注记行等零触）。
- `weakness-backfill.ts` 产品码面（DB-HOTSPOT 已落契约·零字节 Ban）。
- DB-HOTSPOT 卷/LEDGER 位图翻面（行翻面权归协调方·本刀不宣称销案）。
- 0058/0076/0206 迁移与权威函数（零 DDL 零触）。

## §4 依赖

无新增依赖。门 3 复用既有 `pnpm interview-privacy-read-tier:prove` 注册行（root package.json:171·DB-HOTSPOT 刀随卷注册）。

## §5 Ban 列表 + pins

- Ban 产品码字节变动（diff 恰 2 tracked·weakness-backfill.ts 改后 blob 恒等 `279388ae` 亲证入 §9）。
- Ban 双形兼容正则（§1-2 裁量已定·EXEC 期不得翻案）·Ban 断言语义降格（放行 locking 谓词回退形）。
- pins：releaseEvidence=false · actualSpendCny=null · est live=0（隔离库注入 proof+静态门·零模型外呼零生产宿主操作）·批表零翻。

## §6 est live=0（起草 turn）+ EXEC 门预申明

零模型外呼零 key 消费（纯测试断言+隔离库 proof+静态门）·EXEC 六门全过为绿·任一红且口径内修不了即停。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+weakness.proof.ts）五类标记词+行首冲突标记**零命中**——EXEC 落卷时对终改动集亲跑复证入 §9。

## §8 STOP（开工条款 + 待裁决项）

**STOP · `executed:awaiting_post`**（EXEC 已落卷=§9·post 审归协调方派单·Ban self-approve·前值 `draft:awaiting_exec`=史录）。开工三条款：①本席自审 PASS（§0 锚 blob/行锚亲证齐全·地雷双证亲跑在卷·修法与派单修向[read-twin 精确形]逐条对表）录 §9；②快速链一体授权=派单 brief 明示「工序：mini REQUEST→修法→门[改前红→改后绿]→§9+STOP awaiting_post+commit」一体（本卷 Status 行）；③EXEC 落位与 §1-修法契约+§5 Ban/pins 零偏离（diff 面=2 tracked 恰等 §2-6 pin）。停止条件：**现场漂移**（§0.1 任一锚 blob 漂移/backfill:50 现形翻变）→停重 pin；**门红不可修**（§2 任一门红且根因不在本刀交付面）→停如实登记；**越界需要**（§3 面诉求）→停另裁。

**待裁决项**：
- ①S30 正则精确 read-twin 形 vs 双形兼容（本卷裁量取精确形·§1-2 理由在卷——翻面权归协调方双审）。
- ②`line/db-hotspot` 支线零 CI run=CI 兜底窗口零佐证（改前红由本席 c4bd89132 树亲跑承载）——CI 波序权归协调方。
- ③#185 双审地雷销案/翻面权归协调方（本刀不宣称关闭·仅修法落卷）。

## §9 EXEC 记录（快速链一体席落卷 2026-10-17·STOP→`executed:awaiting_post`）

- **修法落位**：weakness.proof.ts:111 第二半正则 `/interview_privacy_active\(lp\.interview_id\)/` → `/interview_privacy_active_read\(lp\.interview_id\)/`（单行·S30 标签与第一半零触）。
- **开工三条款**：自审 PASS（§0 锚 @`c4bd89132` 全数在位零漂移·`git status` 改动集=本刀 2 文件零漂移）+一体授权（Status 行）+契约零偏离——兑现。
- **六门亲跑实测**：

| # | 门 | 实测 | EXIT | 结论 |
|---|---|---|---|---|
| 1 | 改前红（c4bd89132 树·本席亲跑） | raw 形 `FAIL  S30 历史计划排除本场+围栏过滤`（S25-S29/S31-S34 PASS·S30 唯一红）；隔离形 receipt `outcome:failed`·`exitCode:1`·`✗ 1 项失败` | 1 | 红（预期） |
| 2 | 改后绿（`pnpm weakness:prove` isolated） | 全断言 PASS 零 FAIL·`✓ 全部通过`（见 §9 实录行） | 0 | 绿 |
| 3 | 邻面 `pnpm interview-privacy-read-tier:prove`（isolated） | 四臂 R1-R4 全 PASS 零回归 | 0 | 绿 |
| 4 | markers（改动集 2 文件·五类词运行时组装+冲突标记对） | 改动集新增/改动行零命中·全树行首冲突标记 grep 零命中 | 0 | 绿 |
| 5 | docs:check 届树 | 2245 managed files ≤ cap **2248**（基线 2244+本卷 1 REQUEST·零 sanction） | 0 | 绿 |
| 6 | diff 面 | 恰 2 tracked=本 REQUEST(+新)+weakness.proof.ts(1 行正则)·weakness-backfill.ts blob 改后恒等 `279388ae` 亲证 | 0 | 绿 |

- **结论**：六门全绿（门 1 红→门 2 绿=判别式红证在卷）·STOP=`executed:awaiting_post`（post 审归协调方派单·Ban self-approve）·commit 规范=`test(worker): weakness proof S30 断言适配 read-twin 改名（DB-HOTSPOT 欠账）`·并线归协调方 nail 波。

---

*weakness-s30-fix REQUEST · 2026-10-17 起草+EXEC · **STOP=`executed:awaiting_post`（EXEC 落卷=§9·post 审归协调方派单·前值 `draft:awaiting_exec`=史录）** · base=`line/weakness-s30-fix` @`c4bd89132`（=origin/line/db-hotspot tip 等号亲证·主线 main 不含该 commit·CI 零 run 如实登记·改前红由本席亲跑承载）· 缺陷=DB-HOTSPOT 件③ weakness-backfill.ts:50 切 `interview_privacy_active_read`·weakness.proof.ts:111 S30 正则对 `_read(` 形不匹配→门 4 prove:weakness S30 落地即红（21 文件集漏 proof 面）· 修法一处纯测试断言适配（精确 read-twin 形·兼容双形已否）· 零产品码零迁移零 workflow · est live=0 · markers=0 · ⛔push · STOP*
