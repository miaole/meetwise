# 微刀合卷任务书——L-01 · L-07 入卷起草 + L-08 · G7V-CALIB 销账登记（docs-only 起草 · 协调方授权派单）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-26 EXEC 席行使落卷翻面 · §9-EXEC 在卷 · 前值 `draft:awaiting_pre_exec_dual`（L0 docs REQUEST only · draft 面禁令随 pre-exec 双审双 PASS 放行+协调方授权行使解除至本卷刀形边界）史录更替 · post-prove 双审两独立外席待派 · alone≠dual · Ban self-approve · Ban push · 门矩阵 EXIT 原值见 §9-EXEC）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`（十值零翻转）
**Date**: 2026-10-26
**Base / tip**: `origin/main` `151479547513e5fa430a845e758dfe5b8afa1b1f`（fetch 后亲算 · worktree `meetwise-micro` · branch `line/micro-batch-draft` · ⛔动主仓 · ⛔push）
**卷源**: backlog 归集台账 L-01..L-11（`ai-docs/delivery/gap-bug-backlog.md` 文件尾登记块 · 基线 pin=`bab69561`）四件抽取：L-01（:907）· L-07（:915）· L-08（:916）· G7V-CALIB（:822 立项头 / :828 行 / :845 CLOSED nail）
**本卷性质**: docs-only 起草合卷。四件中**两件入卷起草**（L-01 · L-07），**两件锚点实物与 backlog 记载不符、按停止条件登记销账建议不入卷**（L-08 · G7V-CALIB · §3）。登记≠修复≠定谳≠关闭；销账裁决权归协调方。

## §0 锚点亲算（blob SHA + 行号对 fetch 后 tip `151479547` 全数亲证）

### §0.0 四件锚点总表

| 件 | backlog 记载锚 | backlog 行 | 树实锚（tip 亲证） | 锚文件 blob（tip） | 判定 |
|----|----------------|-----------|--------------------|--------------------|------|
| L-01 | `apps/web/app/privacy/actions.ts:35` `return { error: '网络错误，请稍后重试。' };` | gap-bug-backlog.md:907 | **:35 逐字符合** · 全族 zh 字面在树（§0.1） | `e13fb4fb1347eaadb0e3ff9dc078759e1c1e6316` | **入卷** |
| L-07 | `packages/db/test/migrate.proof.ts:457` label「…(197 文件…)」 | gap-bug-backlog.md:915 | label **漂移至 :538**（内容仍在）· 现树 **217** 文件（backlog 记 203 · checklist 承登读数 199 · 均为各自时点值） | `a0454506399dbd2be18d70cbe6ce5ebc99000def` | **入卷（重锚+现值勘正）** |
| L-08 | `packages/db/test/db-money3.proof.ts:343-360` P6 白名单旧形（1×DO+5×独立 DROP+4×ADD CHECK · 禁词含 NOT VALID/VALIDATE CONSTRAINT） | gap-bug-backlog.md:916 | **白名单已是 0149 重制后新形**（P6-1 label 即「4×熔断 ALTER…+1×单独 DROP+4×VALIDATE，语句总数 10」· 全局禁词表已不含该两词）· 修正落码=`c32d568cacc75242e4b69cfc1bd49091e63dba7a`（2026-10-20 · `git merge-base --is-ancestor` 对 HEAD 亲证 YES） | `1a3b108f4394969be14c6bad86ed29d4a3119fcb` | **销账（已修）** |
| G7V-CALIB | `recruiting-bound.spec.ts:232` 扣费臂等待集校准（立项 :828 P2 OPEN） | gap-bug-backlog.md:822/:828/:845 | **:845 nail 已记 CLOSED（fixed）（2026-10-08）** · 主线 EXEC=`2013aa165cef1ea2b3233e32a67d29ac981a41c0` · tip spec 校准三处在校（:136 const 载体 / :319-:331 named 负门+三面集/or-面） | `6e7dabec5aa671467c50ee7b842b013e74a76798` | **销账（已修·已销）** |

锚文件行号均对 tip 打开文件亲点；blob SHA 以 `git rev-parse HEAD:<path>` 亲算。

### §0.1 L-01 逐字面现值（`apps/web/app/privacy/actions.ts` · 全族 10 处 zh-only error 字面）

| # | 行 | 现值（zh · 逐字节） | 臂 |
|---|----|---------------------|----|
| 1 | :22 | `请选择范围；面试删除预览需要填写面试标识。` | 表单校验臂 |
| 2 | :35 | `网络错误，请稍后重试。` | catch 臂（backlog 登记锚） |
| 3 | :37 | `登录已过期，请重新登录。` | 401 臂 |
| 4 | :38 | `找不到该面试，或你无权预览它的删除回执。` | 404 臂 |
| 5 | :39 | `同一预览请求与已有目标冲突，请更换范围或面试。` | 409 臂 |
| 6 | :42 | `公开预览部署为只读，不能受理删除预览。` | 503 `public_preview_read_only` 臂 |
| 7 | :43 | `预览删除暂不可用，未伪装为已完成。` | 503 兜底臂 |
| 8 | :45 | `` `预览请求未受理（${res.status}）。` ``（模板字面 · 含插值） | 非 ok 臂 |
| 9 | :48 | `回执形状不合法，未当作删除完成。` | 回执形状臂 |
| 10 | :50 | `回执宣称了生产完成态，已拒绝展示。` | 生产完成态拒绝臂 |

**非文案面声明**：:42 的比较字面 `body?.error === 'public_preview_read_only'` 系 API wire token（ASCII 契约值），**不是 UI 文案、不入迁移、零触**。

**任务引 erratum（如实登记）**：派单引「:35-:43 九处」与树实不符——:35-:43 区间仅含上表 #2-#7 共 **6** 处；#8-#10（:45/:48/:50）出区间；#1（:22）在区间外。与「九处」吻合的最小解读 = :35-:50 的 **9 处 fetch/response 臂**；与 backlog L-01 行 SSOT 口径（「该文件 error 消息面全族 zh 硬编码未入 messages namespace · :35 网络错误臂为登记锚」）吻合的口径 = **全族 10 处**。本卷主案按 backlog 全族口径（§1.A）；若 pre-exec dual 裁定按九处窄口径，:22 校验臂留置须如实登记残留。backlog 锚 :35 本体与树实相符，故本件不入销账。

**先例亲证（EN 文件落位）**：① messages namespace 先例（backlog 指定主案形）——`resumeDelete` namespace 双侧落键于 `apps/web/messages/en.json`（blob `114a37580b1d0c657b0b0e942adf90a0d4305998` · 顶层 13 键 · **`privacyPreview` 无撞名**）与 `apps/web/messages/zh.json`（blob `490b96eee8b358db638b8d3bf15e751058c931f0`）；消费形=`apps/web/app/resume/actions.ts`（blob `99878fe0522ddaaef95dd42d4fe45bf99e23ca51`）`deleteResumeAction` 内 `getTranslations({ locale: await resumeUploadLocale(), namespace: 'resumeDelete' })` + 四臂 `t()`，locale 仅取 cookie（:39-41 · 与 `apps/web/i18n/request.ts` 同契约）。② in-file EN map 先例——`apps/web/lib/resume/ocr-preview-ui.ts:45` `ERROR_MESSAGES_EN`（EN 落位=同文件内 map · 非独立 EN 文件），为 locale 已在手同步面的先例，**非本件主案形**。静态守卫=`apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（blob `8c3cfd4f039098aca8d956d4d3f199b5c66dd98c`）S2/S3 全 catalog parity+CJK 机检、S6 按 namespace 钉注册面。

### §0.2 L-07 重锚细节（`packages/db/test/migrate.proof.ts`）

树实 :535-:539（tip 亲点）：

```ts
  const treeVersions = loaded.map((migration) => migration.version);
  const localeOrder = [...treeVersions].sort((a, b) => a.localeCompare(b));
  const byteOrder = [...treeVersions].sort(migrationVersionByteCompare);
  A('字节序切换前置: 现树 migrations/ 全量文件名 localeCompare 序==字节序逐对等价(197 文件·0143/0152/0160 双号对内序全等)',
    JSON.stringify(localeOrder) === JSON.stringify(byteOrder));
```

- 陈旧值「197 文件」系 side EXEC 树时点快照（checklist :2694 承登读数 199 · backlog :915 归集读数 203 · **tip 现值亲点=`ls packages/db/migrations/*.sql | wc -l` = 217**）。
- 断言本体（:539）为动态计数（loaded 实值两序 `JSON.stringify` 比对），不受 label 陈旧影响——与本件「label-only」刀形相容。
- 双号对叙述「0143/0152/0160」**现值仍真**（tip `ls packages/db/migrations/ | sed 's/_.*//' | sort | uniq -d` 恰得此三对）；uniqueness 门豁免面同值既登。
- label 字面无代码面外部消费者（全仓 grep 「197 文件」仅命中本文件与 docs 叙述行），label 改形零外溢。

### §0.3 销账两件的锚点证据

**L-08（已修）**：tip `db-money3.proof.ts` P6 段（:343 起）现有形与 backlog 记载旧形逐点相反——P6-1 label 即「1×DO $dbm3_detect$ + 4×熔断 ALTER（同一 ALTER 先 DROP CONSTRAINT IF EXISTS 再 ADD CONSTRAINT CHECK (…) NOT VALID）+ 1×单独 DROP CONSTRAINT IF EXISTS + 4×VALIDATE CONSTRAINT，语句总数 10，无其他语句」；全局禁词正则已**不含** `NOT VALID`/`VALIDATE CONSTRAINT`，改以配对豁免扫描（「NOT VALID 只允许四条熔断 ALTER；VALIDATE CONSTRAINT 只允许四条 VALIDATE。二者不在全局禁词表」）。修正落码=`c32d568cacc75242e4b69cfc1bd49091e63dba7a`（2026-10-20 · 「test(db): 金额状态证明按语句白名单和刻度文本断言」· 触 `db-money3.proof.ts` +58/−20（另 `money-status-proof-REQUEST.md` +33/−3）· ancestor of HEAD 亲证）· 任务书=`ai-docs/delivery/harness/money-status-proof-REQUEST.md`（同 commit 在卷）。即 checklist :2694 STILL OPEN ①「修法=后继刀更新白名单形」已被该后继刀行使。

**G7V-CALIB（已修·已销）**：backlog :845 nail（2026-10-08 · append-only）已记 **P2 OPEN → CLOSED（fixed）** 全链（REQUEST→coding→单 attempt EXIT=0 全测绿→post-dual BOTH PASS）。主线落码亲证=`2013aa165cef1ea2b3233e32a67d29ac981a41c0`（「fix(g7v-calib): EXEC — recruiting-bound.spec :232 third-arm wait-set recalibrated…」· `git log -S NO_REPORT_ON_CHARGED_MSG` 亲证；nail 注所引支线 hash `fa7ec1f2` 非主线祖先·主线以 rebase 等价形落地·如实登记）。tip spec 内容三处在校：:136 `NO_REPORT_ON_CHARGED_MSG`（初稿 B exact 全句逐字 const 载体）、:319-:320 named 负门（`releasedCopyOnCharged` 断言 false · 资金谎报回归门）、:325-:331 扣费臂三面集+or-面（exact 全句非弱子串）。原 `:232` `Promise.any([…] · 120s)` 恒超时结构在 tip spec 已不存在（全文件 grep `Promise.any` 零命中）。立项行 :828 与 CLOSED nail :845 同文件先后登记，**行状态依 :845 注为准**（该卷源文件尾注既定语义）。

## §1 改动清单（仅两件入卷 · 每处 file:line 现状+改形）

### §1.A 件① L-01：`apps/web/app/privacy/actions.ts` error 消息面迁 namespace + zh/en parity 双侧落键

**刀形主案（全族 10 处 · 沿 resumeDelete 先例形）**——恰 4 文件触面：

**pre-exec dual 裁定（双席一致 · 落卷）**：本件按 backlog L-01 行 SSOT 全族口径行使——**全族 10 处主案**（:22 校验臂一并入卷，无九处窄口径残留问题；§0.1 erratum 登记之窄口径解读不采纳）。

1. `apps/web/messages/zh.json` + `apps/web/messages/en.json`：新增 `privacyPreview` namespace，各 10 键。**zh 值=§0.1 表现值逐字节迁入（零改写）**；其中 #8 `notAccepted` zh catalog 值显式钉死=`预览请求未受理（{status}）。`（**全角括号 · `{status}` ICU 占位形**——源码模板字面 `` `预览请求未受理（${res.status}）。` `` 的插值 `${res.status}` 即译为 `{status}`，其余九键为纯静态字面零占位）；en 值按下表译形建议落键（**建议值 · pre-exec dual 定稿 · en 值必须 CJK-free**——S2/S3 全 catalog 机检强制）：

| 键（建议名） | 源行 | en 译形建议 |
|--------------|------|-------------|
| `scopeRequired` | :22 | Select a scope; erasure preview for an interview requires an interview ID. |
| `networkError` | :35 | Network error. Please try again later. |
| `sessionExpired` | :37 | Your session has expired. Please sign in again. |
| `notFound` | :38 | This interview was not found, or you are not allowed to preview its erasure receipt. |
| `conflict` | :39 | This preview request conflicts with an existing target; choose a different scope or interview. |
| `readOnlyDeployment` | :42 | The public preview deployment is read-only and cannot accept erasure previews. |
| `previewUnavailable` | :43 | Erasure preview is temporarily unavailable; it was not disguised as completed. |
| `notAccepted` | :45 | Preview request not accepted (status {status}); not treated as deleted. |
| `invalidShape` | :48 | The receipt shape is invalid; not treated as deleted. |
| `productionClaimRejected` | :50 | The receipt claimed a production-complete state; display was refused. |

2. `apps/web/app/privacy/actions.ts`：`requestPrivacyPreviewAction` 所在文件加 cookie-locale 私有 helper（沿 `resume/actions.ts:39-41` 契约：`(await cookies()).get('locale')?.value === 'en' ? 'en' : 'zh'`，import `cookies` 自 `next/headers`、`getTranslations` 自 `next-intl/server`），函数体首部 `const t = await getTranslations({ locale: …, namespace: 'privacyPreview' })`；十处 `return { error: … }` 改形为 `return { error: t('<键>') }`；其中 :45 改 `t('notAccepted', { status: res.status })`——**ICU `{status}` 零拼接**（沿 `resumeDelete.notAccepted` 先例）。zh locale 渲染值与现值逐字节相同 → zh 用户面零变化。

3. `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` S6 `newNamespaces` 表：增 `privacyPreview: [十键名]`（双侧注册+CJK-free 断言随表自动行使）；并按 S6 既有界定引语（delimited needles）惯例增迁移面零残留断言（对 `apps/web/app/privacy/actions.ts` 扫 §0.1 十条 zh 旧字面=零命中 · 界定形防注释自指）。

4. 交叉核（非改动面）：`apps/web/test/web-logic.proof.ts` #264 负断言面（:2006/:2013 三负词与 :2013 en 负词）不得被新 en 值撞上——建议译形已天然不含；EXEC 落码后复跑 web prove 亲证（checklist :2852 ② 地雷登记条款行使）。**两读者零触登记**（读 `actions.ts` 而不及其十条 zh 字面 · EXEC 复跑必绿旁证）：`apps/web/test/public-copy.proof.mjs` TC-E1 :143-145（privacyAction 读者：forbid wire token/路径 + requireText `/privacy/erasure-preview`·`preview_incomplete`，均非文案面）与 `packages/domain/test/privacy-erasure-preview.proof.ts` :127-137（privacyAction 读者：仅断 `update(\`preview:…\`)` 形与 `randomUUID()` 负词）——本迁移对其零触，EXEC 落码后复跑两 proof 全绿即旁证成立。

**Ban 面（件①）**：`PreviewActionState` 形、`serverFetch` 调用、status 分派、`revalidatePath`、幂等键、`public_preview_read_only` wire token、回执 safeParse 契约——**零产品行为改**；本件系纯文案 parity + namespace 迁移（zh 面 byte-identical）。Ban 顺带扩大触面（backlog 原文）。Ban 动 `ocr-preview-ui.ts`。Ban 改 S1-S5/G3′ 既有断言。若九处窄口径被裁定，Ban 洗残留（:22 留置须显耀登记）。

### §1.B 件② L-07：`packages/db/test/migrate.proof.ts:538` label 现值勘正（label-only）

现状（:538-:539，§0.2 引文）→ 改形两案任一（pre-exec dual 裁定）：

- **主案（动态插值 · 去时点化）**：label 单引号改模板字面，`197 文件` → `${treeVersions.length} 文件`（`treeVersions` 即 :535 在 scope 变量 · 恒等于 loaded 数 · 永不再陈旧）：

```ts
  A(`字节序切换前置: 现树 migrations/ 全量文件名 localeCompare 序==字节序逐对等价(${treeVersions.length} 文件·0143/0152/0160 双号对内序全等)`,
    JSON.stringify(localeOrder) === JSON.stringify(byteOrder));
```

- **备案（静态勘正）**：`197 文件` → `217 文件`（tip 现值 · 最小 diff；后续再漂依本卷语义再勘）。

**Ban 面（件②）**：断言本体 :539 零字节；:535-:537 零触；恰 1 文件恰 1 hunk。Ban 动双号对叙述（0143/0152/0160 现值仍真）。Ban 动 uniqueness 豁免面与 0148/0149 重制注记。Ban 动迁移文件任何字节。

## §2 门矩阵（命令与届值在树亲证 · 本 docs-only worktree 未装依赖的依赖型门如实登记）

| 门 | 命令（树亲证） | 届值/基线 | 起草席 | EXEC |
|----|----------------|-----------|--------|------|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | cap=2370（`scripts/ai-docs/public-text-policy.mjs` 2026-10-26 sanction 2362→2370 · 卷前亲跑 EXIT=0 scanned 2364 · 卷后 2365≤2370 余 5 · 零 cap 上调需求） | **亲跑 EXIT=0** | 必跑 |
| markers 五类 | 沿 `scripts/i6-239-gates.proof.mjs:152-163` 五类标记词词面运行时组装形对卷面直扫（词形不誊防自指） | 卷面零命中 | **亲扫零命中** | 必跑 |
| diff 面 | `git diff --cached --numstat` | 恰 1 tracked（本卷 .md 新增 · 零他件） | 落卷亲检 | 必检 |
| web typecheck | `pnpm -C apps/web typecheck`（= `tsc --noEmit` · apps/web/package.json 亲证） | scripts 值亲证；本 worktree 无 node_modules 未实跑（如实登记） | 未跑 | L-01 必跑 |
| web lint | `pnpm -C apps/web lint`（`eslint . --max-warnings 601` · 值亲证 · Ban 放宽） | 同上 | 未跑 | L-01 必跑 |
| root lint | `pnpm lint`（`eslint . --max-warnings 5242` · 值亲证） | 同上 | 未跑 | 触 web 码面必跑 |
| uc003-i18n-locale prove | `node apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（纯 node 零依赖） | tip 基线 **EXIT=0（S1-S7 全绿）起草席亲跑** | **亲跑 EXIT=0** | L-01 落码后必跑（含 S6 扩面绿） |
| web-logic prove | `pnpm -C apps/web prove`（`tsx test/web-logic.proof.ts`） | #264 交叉核载体 | 未跑（需依赖） | L-01 必跑 |
| migrate prove | `pnpm -C packages/db prove:migrate`（`tsx test/migrate.proof.ts` · 需隔离 PG DATABASE_URL） | 断言本体动态计数 · label 改形不触门本体 | 未跑（需隔离库） | L-07 必跑 |
| 环境供给 | — | est live=0 · 0 Key 值 · `actualSpendCny=null` | — | — |

L-08 复核面（非本卷门）：`pnpm -C packages/db prove:db-money3` 需隔离库（`destructive_proof_requires_e2e_isolated` 守卫 · 沿 money-status-proof-REQUEST §9-EXEC 先例）——销账如需机器复核归协调方另派，本卷零触该文件。

## §3 销账登记（停止条件行使 · 两件建议不入卷 · 裁决权归协调方）

1. **L-08 销账建议**：锚点实物（P6 白名单新形）与 backlog :916 记载（旧形+机械红）不符，修正已由 `c32d568cacc75242e4b69cfc1bd49091e63dba7a`（2026-10-20）落主线（§0.3 证据）。建议协调方对 backlog :916 行与 checklist :2694 STILL OPEN ① 作 append-only 销账注记（登记=c32d568ca 修正行使 · L-08 不再排队）。本卷零改 `db-money3.proof.ts`。
2. **G7V-CALIB 销账建议**：backlog :845 已记 CLOSED（fixed）（2026-10-08 · 全链在卷），主线落码 `2013aa165cef1ea2b3233e32a67d29ac981a41c0` 与 tip spec 校准三处在校（§0.3 证据）；派单任务引（:232 扣费臂校准刀形）指向的缺陷面已不存在。建议协调方对本卷源直接采信 :845 nail 现状、本件不立执行任务（附条件②③「机会主义采读/超时红五分类」条款原样承继）。本卷零改 spec。

## §5 pins（全卷）

Pins 十值零翻转（见卷头）。**全卷 Ban 面**：零产品行为改（两件均为文案 parity / label 勘正）；Ban 触产品码行为面、迁移字节、`.env*`、SSOT 行结构、lint/cap 上限放宽、批表翻面、销账写成修复、retry-to-green、self-approve、push、动主仓。登记≠修复≠定谳≠关闭；翻面/回写（backlog :907/:915 行处置建议）随 EXEC 收据呈报归协调方。

## §8

executed:awaiting_post_prove_dual

本步只新增本卷任务书，不改任何码面、proof、迁移、SSOT。

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9 卷纪律

diff 恰 1 tracked 新增（本卷 `ai-docs/delivery/harness/micro-batch-REQUEST.md`）；commit 净消息 `docs(test): 起草四件小修任务书`；⛔push；收据不入库（untracked）；实现方不 self-approve · alone≠dual · EXIT0≠covered。

## §9-EXEC（2026-10-26 · EXEC 席行使落卷 · pre-exec 双审双 PASS 放行 · 协调方授权行使 · ⛔push）

1. **pre-exec P2 修订四件先落**（REQUEST 文面 · 行使前落卷）：①§0.3 L-08 numstat +78/−23→+58/−20（另 REQUEST `money-status-proof-REQUEST.md` +33/−3 · `git show --numstat c32d568ca` 亲证=58/20+33/3）；②§0.3 G7V 行号 :326-:329→:319-:320、:330-:333→:325-:331（§0.0 :320-:333→:319-:331 · tip spec `grep -n` 亲点=releasedCopyOnCharged :319-:320 / 三面集+or-面 :325-:331）；③§1.A 第 1 条 #8 zh catalog 值显式钉死 `预览请求未受理（{status}）。`（全角括号 · ICU 占位形）；④§1.A 第 4 条补两读者零触登记（public-copy.proof.mjs TC-E1 :143-145 + packages/domain/test/privacy-erasure-preview.proof.ts :127-137 · EXEC 复跑必绿旁证）+裁定落卷「全族 10 处主案」（双席一致）。
2. **并线**：`git fetch origin` → `git merge --no-ff origin/main` = `c17a2ceba`（届值 tip=`1e23357a9` PR #144 merge · 届值含 #143/#144 线与 #145 runner 半 · merge-tree 预演零冲突标记 · 实 merge 零冲突如预期）· cap 承届值 2378（`scripts/ai-docs/public-text-policy.mjs` `MAX_FILES = 2_378` 亲证）· `pnpm install --frozen-lockfile` EXIT=0。
3. **件① L-01 行使**（全族 10 处主案 · 沿 resumeDelete 先例形 · 恰 4 文件触面）：`apps/web/messages/zh.json`+`en.json` 新增 `privacyPreview` namespace 各 10 键（zh 值=§0.1 表现值逐字节迁入 · #8 用 `预览请求未受理（{status}）。` ICU 全角括号形 · en 值 CJK-free）；`apps/web/app/privacy/actions.ts` 增 `privacyPreviewLocale()` cookie-locale helper（`cookies` 自 `next/headers` · `getTranslations` 自 `next-intl/server` · locale 仅取 cookie 同 `i18n/request.ts` 契约）+函数体首 `const t = await getTranslations({ locale: await privacyPreviewLocale(), namespace: 'privacyPreview' })`+十处 `return { error: … }` 改 `t('<键>')`（notAccepted 臂 `t('notAccepted', { status: res.status })` ICU 零拼接 · `public_preview_read_only` wire token 零触 · `PreviewActionState`/`serverFetch`/status 分派/`revalidatePath`/幂等键/safeParse 契约零产品行为改）；`apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` S6 `newNamespaces` 增 `privacyPreview` 十键 + 新增 ⑤ privacy actions 面（getTranslations 管道 + ICU 形 + wire token 在场 + 十条 zh 旧字面界定引语零残留）。
4. **件② L-07 行使**：`packages/db/test/migrate.proof.ts:538` label `197 文件`→`${treeVersions.length} 文件`（主案动态插值 · 恰 1 hunk · `git diff --unified=0 | grep -c '^@@'`=1 亲证 · 断言本体 :539 零字节 · :535-:537 零触 · 迁移文件零字节）。
5. **lint +1 事件如实登记（非 retry-to-green）**：件① 首落 import 序（`import type { Locale }` 置于 `@meetwise/contracts` 前）引 `import/order` 新警告 → web lint 602>601 命中门红停止条件即停复核；归因=本刀新引入面（单文件 eslint 亲证 privacy/actions.ts 仅 2 warnings：import/order 系本刀新增 · `idempotency-key` naming 系既有基线面）→ 按先例形重排（`@meetwise/contracts` 先于 type import · 沿 resume/actions.ts 同序）→ 复跑 601 恰等 EXIT=0。红因修正属本刀刀形内自洽（排除本刀引入面），非既有红洗白、非重跑碰运气。
6. **销账注记两行**（`ai-docs/delivery/gap-bug-backlog.md` 文件尾 append-only · :916 行与 :822/:828 原文零字节改写 · 行状态零翻转 · 翻面/销案权归协调方）：L-08 销账建议注（修正=c32d568ca 已落主线亲证在卷 · 本卷零改 db-money3.proof.ts）+G7V-CALIB 核账一致注（:845 CLOSED nail 采信 · 主线落码 2013aa165 · tip 校准三处在校 · 本卷零改 spec）。backlog L-01/L-07 行处置建议随本收据呈协调方（本两行零触）。
7. **门矩阵 EXIT 原值（十门全绿 · 红零冲销 · 命令届值在树亲证）**：markers 五类卷面直扫 0 命中 EXIT=0 · web typecheck（tsc --noEmit）EXIT=0 · web lint 601 恰等（0 errors · cap 601 零放宽）EXIT=0 · `node apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` S1-S7 全 PASS（含 S6 扩面绿）EXIT=0 · `pnpm -C apps/web prove` 432 PASS/0 FAIL（#264a-e 负断言面全 PASS）EXIT=0 · `pnpm -C apps/web prove:public-copy` selected=14/14（TC-E1 在内）EXIT=0 · `pnpm -C packages/domain prove:privacy-erasure-preview` 全 PASS（:127-137 读者面在内）EXIT=0 · `node scripts/run-e2e-isolated.mjs migrate:prove`（隔离 PG · docker v29.5.2 亲证先行 · fresh `meetwise-e2e-*` 容器 · `destructive_proof_requires_e2e_isolated` 守卫行使形）128 PASS/0 FAIL · label 现值动态插值「(217 文件·0143/0152/0160 双号对内序全等)」实证 EXIT=0 · root lint 5274 恰等（0 errors · cap 届值 5274 系 nhp 批 A 并线随刀 sanctioned 值 · 非本刀上调）EXIT=0 · `node scripts/ai-docs/check-docs.mjs` scanned 2377 ≤ cap 2378（余 1）EXIT=0。
8. **停止条件核**：门红命中一次（web lint 602>601 · 上 5 登记 · 刀形内修正复绿）；锚漂=零（L-01 十处现值/L-07 :538 label/P2 行号修订点全数亲证在位 · cap/numstat 届值亲证相符）。其余停止条件未命中。**环境供给**：est live=0 · 0 Key 值 · actualSpendCny=null。
9. **STOP 终态 = `executed:awaiting_post_prove_dual`**（三处翻面：Status 头/§8/本节卷尾注 · 原 `draft:awaiting_pre_exec_dual` 史录更替）· post-prove 双审两独立外席待派 · alone≠dual · alone≠approve · EXIT0≠covered · 本绿≠产品闭环 · 矩阵行/backlog 行翻面权归协调方 · 收据不入库（untracked）· ⛔push。
