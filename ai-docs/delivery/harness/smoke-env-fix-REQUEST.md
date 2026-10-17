# SMOKE-ENV-FIX smoke 脚本 .env 同形断链修复刀（E2EA-06 夜硬门臂 ENOENT·幽灵脚本 rev 席 §9-⑨⑤ 同型 9 处处置裁量·快速链一体席·量级微·mini REQUEST · 落卷即停）

**Status**: **`executed:awaiting_post`**（EXEC 落卷 2026-10-16 §9·七门全绿·post 审归协调方派单·Ban self-approve·前值 **`draft:awaiting_exec`**=史录保留·⛔push ⛔merge主线 ⛔force push·est live=0）→【**Status 终翻注记 2026-10-16·协调方批表翻面笔随令行使**：post 复核 PASS 承（checklist「Line smoke-env-fix nail」段 STILL OPEN 句在卷·本刀不宣称关闭句就此清账）·E2EA-06 行已随批表翻面笔销案（gap-bug-backlog :932 同拍）·本卷 STOP 值终翻为 **`nail 落卷`**（closed）·本注记为权威·上文旧值史录保留·append 注记形零洗史】

**席位**：meetwise 战役「SMOKE-ENV-FIX smoke 脚本 .env 同形断链修复刀」快速链席（E2EA-06·幽灵脚本同形·量级微·诊断+起草+EXEC 一体授权）。
**基线**：`feat/mysql-schema-skeleton` @ `bb321093`（本席亲跑 `git fetch origin` 后 `origin/feat/mysql-schema-skeleton` tip=`bb321093` 同值亲证=派单下界 tip≥bb321093 等号成立）。分支 `line/smoke-env-fix`·工作树 `meetwise-sef`（`git worktree add ../meetwise-sef -b line/smoke-env-fix origin/feat/mysql-schema-skeleton` 本席已立·建前 `git worktree list` 实查路径空闲·建后 tip `bb321093` 亲证）。
**蓝本**：①E2EA-06 行 `ai-docs/delivery/gap-bug-backlog.md:932`（P2 OPEN·修法「冒烟臂前置 touch .env 沿 nrf 先例形」已载）②幽灵脚本 rev 席同型面观测登记 `nightly-recall-fix-REQUEST.md:146`（§9-⑨⑤：顶层裸 `readFileSync(.env)` 全 smoke 共 9 处·含 `model-live-smoke.ts:11`=夜间硬门臂·归后继观测刀）③nrf 先例形 `2ab86a3d`（recall 步 `:54` `touch .env` 一行修·本刀逐字节同形）④邻卷形制=nightly-recall-fix-REQUEST（§0/§1/§2/§8 形）。

## §0 现状锚（起草席亲读亲证 @`bb321093`·blob `git rev-parse` 亲算）

### 0.1 blob 锚表

| 路径 | blob @`bb321093` | 锚点 |
|---|---|---|
| `.github/workflows/nightly.yml` | `f5b266b0d40ef511a8497859294d86df32499e11` | model-smoke 步 `:34-41`（name `:34`·env `:35-38`·run `:39`·key 守卫 `:40`·`pnpm model:smoke` `:41`）**无 continue-on-error=硬门臂**；recall 臂 `:48-55`（continue-on-error `:49`·**touch .env `:54`** nrf 先例·命令 `:55`）；scoring 臂 `:56-57`（continue-on-error `:57` 信号臂） |
| `apps/worker/smoke/model-live-smoke.ts` | `daa1ec989086b9012ab7c5c8fba1262bca406846` | `:11` 顶层裸 `readFileSync(fileURLToPath(new URL('../../../.env', import.meta.url)), 'utf8')` 逐行解析 `MODEL_*`·**无 try/catch 无 existsSync** |
| `ai-docs/delivery/gap-bug-backlog.md` | `93ed8427ee2fe42b389a4c4afa8850b7522b26c5` | E2EA-06 行 `:932`·登记段头 `:921-923`（append-only · 不动既有行与行统计） |

### 0.2 同型 9 处锚（顶层裸 readFileSync(.env)·幽灵 rev 席 §9-⑨⑤ 全集亲证 @`bb321093`）

| # | 脚本:行 | pnpm 命令 | nightly/CI 宿面？ | blob |
|---|---|---|---|---|
| 1 | `model-live-smoke.ts:11` | `model:smoke` | **是·nightly `:41` 硬门臂**（无 continue-on-error） | `daa1ec98` |
| 2 | `qbank-retrieval-eval.ts:16` | `qbank:retrieval:eval` | 是·nightly `:55` 信号臂——**touch .env 已在岗（nrf `2ab86a3d` `:54`）** | `d0be9f09` |
| 3 | `adaptive-attack.ts:7` | `attack`（worker） | 否（全 workflow grep 零命中） | `4a78be83` |
| 4 | `chunk-eval.ts:9` | `chunk:eval` | 否 | `a45a37da` |
| 5 | `map-eval.ts:9` | `map:eval` | 否 | `dd19ceab` |
| 6 | `rag-adversarial-eval.ts:15` | `rag:adversarial:eval` | 否 | `8352bc4a` |
| 7 | `rag-adversarial-pg-eval.ts:29` | `rag:adversarial:pg-eval`（+`:legacy`） | 否 | `d00d2bc6` |
| 8 | `rag-demo.ts:12` | `rag:demo` | 否 | `400b9bb1` |
| 9 | `retrieval-benchmark.ts:12` | `retrieval:benchmark` | 否 | `b26f2b3e` |

宿面亲证：全 `.github/workflows/` grep 九命令词·仅 nightly.yml 命中 `model:smoke`/`qbank:retrieval:eval`/`scoring:eval` 三词（§0.2 表 #1/#2）；`ci.yml` 仅 `prove:*` 形零 smoke 直跑亲证。`scoring-eval.ts` **不在 9 处**（`process.env.MODEL_API_KEY` guard+动态 import·零顶层 readFileSync 亲读）；`voice-live.ts`/`voice-loop.ts` 系 MODEL-OP-01 前 deliberate disabled（不载 .env·exit 2）零触。`.env` 系 `.gitignore:10` 未跟踪（`git check-ignore -v` 亲证）·本机无 `.env`（ls 亲证）→CI checkout 恒无 `.env`。

### 0.3 红事实定谳（E2EA-06 病灶本席亲证成立）

nightly 硬门臂 `:40-41`：`MODEL_API_KEY` secret 一经配置→`pnpm model:smoke` 真跑→`model-live-smoke.ts:11` 顶层 readFileSync 对不存在的 `.env` 即 **ENOENT throw→exit 1→硬门臂每夜红**（无 continue-on-error 洗绿面=真红·恰因是真红才必须修）。今日 GH secrets 空集则 `:40` 守卫诚实 skip——断链触发面=配 key 动作（与 E2EA-06「随 CI MODEL_API_KEY 决策臂行使」口径一致·本刀为配 key 前置消账）。

## §1 修法（两件·零产品码·零迁移·workflow+backlog 注记两触面）

### 件a nightly.yml model-smoke 步前置 touch .env（E2EA-06 修法兑现·一行）

`.github/workflows/nightly.yml` model-smoke 步 run 块 `pnpm model:smoke`（`:41`）前置一行（nrf `2ab86a3d` 先例形**逐字节同形**·含注释）：

```yaml
          touch .env # CI checkout 无 .env·脚本顶层 readFileSync 需占位文件(空文件即可·key 仍走 env 注入)
```

落位=守卫 `:40` 之后·命令行前（改后守卫 `:40`/touch `:41`/命令 `:42`）。语义：占位空文件令 `:11` readFileSync 成功返回空串→装载臂零行·**key 仍走 workflow env 注入**（`:37` MODEL_API_KEY）——脚本 `.env` 装载臂仅承载本地手动跑形·CI 面零泄漏零覆盖（env 注入优先序不变·占位文件不含任何键值）。 Ban 对 `:34-41` 硬门臂其余字节零触（守卫/continue-on-error 缺省形=门位如实语义·§1.3）。

### 件b 同型 9 处处置裁量（§0.2 表→三档分布）+ backlog 一行注记

- **宿面修（1 处）**：#1 model-live-smoke.ts:11 → 件a 兑现。
- **宿面已在岗（1 处）**：#2 qbank-retrieval-eval.ts:16 → nrf `2ab86a3d` touch `:54` 先例在岗·**零触零改**。
- **非宿面=本地手动跑形（7 处）**：#3-#9（adaptive-attack/chunk-eval/map-eval/rag-adversarial-eval/rag-adversarial-pg-eval/rag-demo/retrieval-benchmark）——全 workflow grep 零宿面（§0.2 亲证）=仅本地手动跑·本地有 `.env` 需求面自洽（开发者本机 `.env` 即真配置文件非占位）·**不改码**；按派单裁量登记一行 backlog 注记（「本地须先 touch .env」占位提示·append-only 文件尾新立·不动 E2EA 既有行与行统计·E2EA-06 行翻面/销案权仍归协调方）。

### §1.3 否决（Ban EXEC 复活）

1. **脚本内改形否决**（E2EA-06 备选「脚本内 env 缺省 fail-soft」/try-catch 包 readFileSync）：触 9 处产品码×9 文件=改面膨胀违量级微·且 nrf 先例已立 workflow 占位形=全战役一致形；脚本改动另需 typecheck/门矩阵面·一行 workflow 修零 TS 触面。
2. **7 处一并前置 touch 否决**（全量防御形）：7 处零宿面=CI 永不执行·防御零收益纯 churn；本地 `.env` 本应真存（跑通前提）·touch 占位反而掩盖漏配。
3. **scoring 臂同修否决**：scoring-eval.ts 不在 9 处（§0.2 亲证·env 注入 self-skip 形）·`:56-57` 零触。
4. **摘硬门臂 continue-on-error 或改门位否决**：门位如实语义（冒烟=硬门阻断）系 nrf 定谳·本刀只消断链不改门位。
5. **E2EA-06 行/行统计翻面否决**：append-only 纪律+翻面权归协调方（§1-件b）。

## §2 门矩阵（EXEC 全过为绿·逐条亲跑 EXIT 入 §9）

1. **静态门**：`pnpm workflow-script-existence:prove` **EXIT=0**（基线亲跑 `workflows=9 checked=120 missing=0` @`bb321093`·改后恒等）。
2. **actionlint**：nightly.yml findings 改前=改后**恰等零新增**（基线唯一 `:26` SC2034 pre-existing·非本刀触面·Ban 借机修）。
3. **markers 门**：本刀改动集（nightly.yml+gap-bug-backlog.md+本 REQUEST）五类标记词+行首冲突标记**零命中**（词面运行时组装沿 `scripts/i6-239-gates.proof.mjs` 口径·不入卷防自指）。
4. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 **2221** managed files 亲跑·本卷 +1 新件 REQUEST=**2222 ≤ cap 2232 余 10**·帽 `public-text-policy.mjs:87` 2232 亲证）。
5. **diff 面**：全刀恰 **3 tracked 路径**=`.github/workflows/nightly.yml`+`ai-docs/delivery/gap-bug-backlog.md`+本 REQUEST·零其他。
6. **先例同形门**：改后 nightly.yml 恰 **2** 处 `touch .env`（recall `:54`+model-smoke `:41`）·两行逐字节同形（nrf 先例注释同形）；`pnpm model:smoke` 词在 root package.json scripts 在册（workflow-script-existence 门#1 覆盖）。
7. **est live=0**：零模型外呼零 key 消费（占位空文件不含键值·不真跑 smoke——真跑归配 key 后 nightly/手动触发）。

## §3 范围外（越界即停）

1. 9 个 smoke 脚本 `.ts` 本体零字节（§1.3-1/2）；scoring/voice 臂零触（§1.3-3）。
2. E2EA-06 行与登记段既有行/行统计零触（§1.3-5·append-only 尾注一行例外=件b 载体）。
3. 其余 8 workflow 零触；SSOT 四卷零触；GH secrets 配置归协调方。
4. est live=0。

## §4 依赖

上游全已满足：nrf `2ab86a3d` 先例形已并线在 tip（`847a0516`→`feat/mysql-schema-skeleton`）；静态门 `workflow-script-existence:prove` 在 root package.json `:22`。无同文件并发（E2EA-06 修法权随本派单行使·gap-bug-backlog.md append-only 尾邻无并发刀知悉）。

## §5 Ban 列表 + pins

**Ban**：push/force-push（⛔push·git 写只本 worktree commit）·触 9 个 smoke `.ts` 本体·改门位/continue-on-error 形（§1.3-4）·借机修 SC2034/lint（§2-2）·E2EA 既有行翻面（§1.3-5）·触产品码/SSOT/secrets（§3）·弱化门断言·Ban retry-to-green（门红恰 1 attempt·基建红除外）·Ban self-approve·Ban 伪造已读/已验来源。

**pins**：diff 面=**3 tracked**·nightly.yml 净增 **+1 行**（touch `:41`·命令 `:40→:42`）·`touch .env` 全文件恰 **2** 处同形·docs 基线 **2221**/预期 **2222**/cap **2232**·actionlint findings 改前=改后恒 1·迁移=**0**·est live=0·actualSpendCny=null。

## §6 est live=0（起草 turn）+ EXEC 门预申明

起草与 EXEC 全程零模型外呼零 Key 加载零生产操作（纯本地 git/actionlint/node/pnpm 元门）。EXEC 预申明：件a+b 落位→§2 七门逐条亲跑 EXIT 入 §9→STOP 翻 `executed:awaiting_post`→commit（新规范 `ci(nightly): model-smoke 步前置 touch .env 修复同形断链`）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+nightly.yml+gap-bug-backlog.md）五类标记词+行首冲突标记**零命中**（词面运行时组装口径·不入卷防自指）——EXEC 落卷时对终改动集亲跑复证入 §9。

## §8 STOP（开工条款 + 待裁决项）

**STOP · `executed:awaiting_post`**（EXEC 已落卷=§9·post 审归协调方派单·Ban self-approve·前值 `draft:awaiting_exec`=史录）。开工三条款兑现：①本席自审 PASS（§0 锚 blob/行锚 @`bb321093` 亲证齐全·修法与派单修向「nightly.yml model-smoke 步前置 touch .env」逐条对表·门矩阵七门全机检）录 §9；②快速链一体授权=派单 brief 明示「工序 3 起草→工序 4 EXEC」一体（§席位）；③EXEC 落位与 §1-修法两件契约+§5 Ban/pins 零偏离（diff 面=3 tracked 恰等 pin·门 G6 先例同形亲证）。停止条件：**现场漂移**（§0.1 任一锚 blob 漂移）→停重 pin；**门红不可修**（§2 任一门红且根因不在本刀交付面）→停如实登记；**越界需要**（任何 §3 面诉求）→停另裁。

**待裁决项**：
- ①7 处非宿面处置=派单已裁「本地手动跑形·登记一行不改码」——本卷照裁行使（§1-件b）；后继如立宿面（如 nightly 追加 adversarial 臂）须随臂前置 touch .env（后继刀裁量·非本刀面）。
- ②E2EA-06 行翻面（OPEN→修法落卷指针）归协调方（本刀不宣称关闭·§1.3-5）。

## §9 EXEC 记录（快速链一体席落卷 2026-10-16·STOP→`executed:awaiting_post`）

- **件a 落位**：nightly.yml model-smoke 步 `pnpm model:smoke` 前置 `touch .env` 一行（nrf `2ab86a3d` 先例形逐字节同形含注释）·改后守卫 `:40`/touch `:41`/命令 `:42`·净增 +1 行·`:34-41` 硬门臂其余字节零触（门 G5 diff 亲证）。
- **件b 落位**：gap-bug-backlog.md 文件尾 append 一行注记（append-only·不动 E2EA 既有行与行统计·E2EA-06 翻面权仍归协调方）·9 处三档分布=宿面修 1（#1 本刀）+已在岗 1（#2 nrf `:54` 零触）+本地手动形 7（#3-#9 不改码·「本地须先 touch .env」登记在注记）。
- **开工三条款**：自审 PASS（§0 锚 @`bb321093` 全数在位零漂移·`git status` 改动集=本刀三文件零漂移）+一体授权（§席位）+契约零偏离——兑现。
- **七门亲跑实测**：

| # | 门 | 实测 | EXIT | 结论 |
|---|---|---|---|---|
| 1 | workflow-script-existence:prove | `workflows=9 checked=120 missing=0`（=基线恒等） | 0 | 绿 |
| 2 | actionlint nightly.yml | 恰 1 finding=`:26` SC2034（pre-existing·改前=改后恒等零新增） | 0* | 绿 |
| 3 | markers 五类词+冲突标记（改动集三文件） | 0 hits | 0 | 绿 |
| 4 | docs:check 届树 | `80 required files verified`·**2222** managed files（基线 2221+本卷 1 新件=2222 ≤ cap 2232 余 10） | 0 | 绿 |
| 5 | diff 面 | 恰 3 tracked=nightly.yml(+1 行)+gap-bug-backlog.md(+2 行=空行+注记)+本 REQUEST·零其他 | 0 | 绿 |
| 6 | 先例同形 | `touch .env` 恰 2 处=`:41`+`:55`·两行逐字节同形（diff 恒等亲证） | 0 | 绿 |
| 7 | est live=0 | 零模型外呼零 key 消费（占位空文件零键值·真跑归配 key 后 nightly/手动） | — | 声明成立 |

（*actionlint 原生 exit=1 系 findings 存在语义·pre-existing 恰 1=门口径「零新增」绿·沿 nrf §2-2 同口径登记。）

- **结论**：七门全绿·STOP=`executed:awaiting_post`（post 审归协调方派单·Ban self-approve）·并线归协调方 nail 波。

---

*smoke-env-fix REQUEST · 2026-10-16 起草 · **STOP=`executed:awaiting_post`（EXEC 落卷=§9·post 审归协调方派单·前值 `draft:awaiting_exec`=史录）** · 起草+EXEC base=`feat/mysql-schema-skeleton` @`bb321093`（本席亲 fetch·origin tip=派单下界等号成立亲证·⛔pull --rebase 未用）· 分支 `line/smoke-env-fix` · 工作树 `meetwise-sef`（本席立）· 缺陷=nightly.yml:34-41 model-smoke 硬门臂配 MODEL_API_KEY 后每夜 ENOENT 硬红（model-live-smoke.ts:11 顶层裸 readFileSync·幽灵 rev 席 §9-⑨⑤ 同型 9 处之硬门面）· 修法两件=硬门臂前置 touch .env（nrf 2ab86a3d 先例形逐字节同形）+9 处处置裁量（宿面修 1+已在岗 1+本地手动形 7 登记不改码）· 零产品码零迁移 · est live=0 · markers=0 · ⛔push · STOP*
