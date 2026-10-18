# DEPLOY-CHECK-HARDEN REQUEST — deploy:check 校验器 P2 加固小刀（注释形假阳封堵+四行行首锚+宽 COPY 禁令牙 · 单文件 `scripts/deploy-check.mjs` 恰 1 码 + 本卷恰 1 doc · 快速链 REQUEST mini 卷+EXEC 一体席 · **STOP=`draft:awaiting_pre_exec_dual`**[起草落卷 2026-10-16·随令直落形]）

> 战役 meetwise · 支线 `line/deploy-check-harden` · 工作树 `meetwise-dch` · 起草基线 @origin tip=`2eaf387ed`（deploy-check-align nail tip·派单下界「fetch 后 origin tip≥2eaf387ed」以等号成立亲证=fetch 亲跑+`git branch -r --contains 2eaf387ed` 含 origin/feat/mysql-schema-skeleton 与 origin/line/deploy-check-align 双支·本席亲证在卷）· ⛔push ⛔merge 主线（push/翻面权归协调方）。主仓 worktree 建支线：`git worktree add ../meetwise-dch -b line/deploy-check-harden 2eaf387ed`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-16·DEPLOY-CHECK-HARDEN P2 加固小刀·快速链 REQUEST mini 卷+EXEC 一体席·修法三件+门矩阵+commit 新规范由 brief 颁定）；②deploy-check-align nail P2 注记承引（LEDGER `ai-docs/delivery/harness/product-campaign-LEDGER.md:630` P2-2「注释形假阳面加锚建议归后继」+P2-3「宽 COPY 禁令补牙建议归后继」·checklist `ai-docs/delivery/execution-master-checklist.md:3733` 「Line deploy-check-align nail」段 P2 三注记·本席亲读在卷）；③席2 沙箱出证承引（/tmp 实测：真实行注释形 `# COPY packages ./packages` 后 deploy:check EXIT=0 假绿·本席 worktree 内 T1 亲复现同值·§2 门2 承登）。

## §0 现状锚（起草席亲读+blob 亲算 @`2eaf387ed`）

- **锚A `scripts/deploy-check.mjs`** blob=`c8a633030e4ecb5f03642a00e357b995241e6108`（`git rev-parse HEAD:scripts/deploy-check.mjs` 亲算）·判词① `:27-:33` 七正则共享 `dockerfile` 裸文本：`:27-:29` 三 `COPY --from=deps` 跨阶段行（无锚·非本刀面）+`:30-:33` 四行精确正则（`COPY pnpm-workspace.yaml package.json ./`/`COPY packages ./packages`/`COPY apps/api ./apps/api`/`COPY apps/worker ./apps/worker`·**无行首锚不剔注释**=P2 定谳病址·注释形字面子串亦 MATCH=假绿根因）·同文件 `:12` 先例=`prometheusWithoutComments`（`prometheus.replace(/^\s*#.*$/gm, '')`）。
- **锚B `Dockerfile`** blob=`06d40f6920d2739b748176671b66f74ca61adef1`·`:31-:34` runtime 精确 COPY 清单四行（#101 供应链刀件④ 契约面·本刀零触）。
- **P2 出证引注**：①上 LEDGER `:630` P2-2/P2-3 双注记+checklist `:3733` P2 三注记（双席登记随 nail 承登）；②席2 /tmp 沙箱实测（派单承引）；③本席 T1 亲复现：真实行 `COPY packages ./packages` 注释为 `# COPY packages ./packages` 后 deploy:check 仍 **EXIT=0 假绿**（基线 T0 净树 EXIT=0 对照·测毕 restore 树净）。

## §1 修法（三件·单文件 `scripts/deploy-check.mjs`·零迁移零 env 闸零 lockfile）

- **件① 判词① 文本剔注释行（仿 `:12` 先例）**：`dockerfile` 读入后新增 `const dockerfileWithoutComments = dockerfile.replace(/^\s*#.*$/gm, '');`；判词① must 所用文本整体换用 `dockerfileWithoutComments`（七正则共享文本·`:27-:29` deps 层三正则的注释形假阳面随文本剔除同封·其正则体不加锚零改）。
- **件② 四行正则加行首锚（m 标志）**：`:30-:33` 四正则改 `/^[ \t]*COPY pnpm-workspace\.yaml package\.json \./m`、`/^[ \t]*COPY packages \.\/packages/m`、`/^[ \t]*COPY apps\/api \.\/apps\/api/m`、`/^[ \t]*COPY apps\/worker \.\/apps\/worker/m`（匹配体零改仅加锚·判词语义零改=错文 `runtime 必须携带源码与 workspace 依赖链接` 与七条件合取形零触）。
- **件③ 宽 COPY 禁令牙（一行 must·席1 建议原形行使）**：判词① 后新增 `must(!/^COPY \. \.[ \t]*$/m.test(dockerfile), '禁止宽 COPY 回归——镜像 context 必须走精确清单');`（错文自述·堵「精确行+宽 COPY 并存」静默回归）。
- **残面披露（如实披露不修）**：`:27-:29` deps 层三正则保持无锚原形（P2 定谳修法面恰 `:30-:33` 四行·扩面越界）——其「行中裸字匹配」残面（如 RUN echo 字面）本刀不修归后继如需；注释形假阳面已经件① 共享文本覆盖。

### §1.3 否决（三件）

1. **不动 #101 Dockerfile**——`:31-:34` 精确清单系 #101 件④ 契约面·本刀纯校验器侧加固·镜像字节零变（blob `06d40f69` 恒等承诺·门8 diff 恰 2 承诺）·否决改 Dockerfile。
2. **不改判词语义**——判词① 七条件合取+错文零改（仅剔注释文本+四行加锚）·判词② dependencies 断言零触·否决借加固放宽/重写判词。
3. **不加 dev 回退**——#101 件② dependencies 归位契约保持（api/worker @swc-node/register+db tsx 居 dependencies·无 devDependencies 回退臂）·否决。

## §2 门矩阵（八门·起草席基线亲跑值在卷·EXEC 期复跑落值）

1. **门1 deploy:check 净树**：`node scripts/deploy-check.mjs` EXIT=0。起草基线亲跑 **EXIT=0** 在卷（208 迁移面零扰）。
2. **门2 假阳封堵牙测双向**（worktree 内临时 mutation→测→restore 树净）：改前假绿复现=T1 真实行注释形 `# COPY packages ./packages`→旧码 **EXIT=0 假绿**（本席亲复现·席2 /tmp 同值承引）；改后同 mutation→预期 **EXIT=1** 错文恰判词① `runtime 必须携带源码与 workspace 依赖链接`；宽 COPY 注入 mutation（runtime 段插 `COPY . .` 行）→预期 **EXIT=1** 错文恰新牙 `禁止宽 COPY 回归——镜像 context 必须走精确清单`；restore 后 `git status` 树净+门1 复跑 EXIT=0。
3. **门3 validate-prod-compose**：`node scripts/validate-prod-compose.mjs` EXIT=0。
4. **门4 typecheck**：`pnpm turbo typecheck --force` 8/8·0 cached·EXIT=0。
5. **门5 lint**：`pnpm turbo lint --force` EXIT=0 全 0 errors·root cap 不放宽不上调·单文件 `eslint scripts/deploy-check.mjs --max-warnings 0` 亦绿。
6. **门6 markers**：改动集新增行五类标记词+冲突标记对直扫 0 命中（运行时组装词表·词面不入卷防自匹配）+全树行首冲突标记 grep 零命中。
7. **门7 docs:check**（卫生附加门·派单矩阵外如实加测）：`node scripts/ai-docs/check-docs.mjs` EXIT=0 预期 **2258**≤cap 2264（谱系=deploy-check-align nail 后 2257+本卷 REQUEST +1）。
8. **门8 diff 面**：对基线 `2eaf387ed` 全支线 diff **恰 2 tracked**=本卷 REQUEST+`scripts/deploy-check.mjs`·零 lockfile 零 Dockerfile 零其他。

## §5 pins

- est live=0（全本地静态门·零模型外呼零 DB 零容器零 secrets）· `actualSpendCny=null` · 零迁移零 DDL 零 env 闸零 lockfile 改。
- `Dockerfile` blob `06d40f69` 恒等（零字节 Ban·镜像契约零触）·`docker/compose.prod.yml`/`compose.monitoring.yml`/`docker/monitoring/prometheus.yml` 零触·判词②-⑤ 全部既有断言零改零删。
- **停止条件（三类）**：**锚漂**=届时 tip 对 §0 两锚 blob 漂移超注记级→停重 pin 回炉；**门红**=门1-8 任一红→停如实升级（Ban 就地改因 Ban 扩面修）；**越面**=任何 Dockerfile/判词语义/dev 回退/四行外正则改形诉求→停另刀。Ban self-approve · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 STOP · `draft:awaiting_pre_exec_dual`（三处同值：Status 头/本节/卷尾注 · 快速链起草+EXEC 一体席·随令直落形先例 cap-2264/lc242）

- EXEC 本席随派单令直落·两 commit 落卷=①本卷 draft+②码面 fix（`fix(ci): 部署校验器加固——注释行剔除+行首锚+宽 COPY 禁令`·战役黑话不进标题）·STOP 翻面随 ② 三处同值翻 `executed:awaiting_post_prove_dual`（前值本值史录保留）。
- LEDGER 管线行+checklist 段 append/翻面权归协调方（本刀 diff 恰 2 不触 SSOT 两文件·nail 波随卷）。本 commit 不预 claim EXEC 门值（§2 基线值=证据在卷非 EXEC 承诺）。

---
*DEPLOY-CHECK-HARDEN REQUEST · 2026-10-16 起草 · STOP=`draft:awaiting_pre_exec_dual`[三处同值：Status 头/§8/卷尾注] · 基线 origin tip=`2eaf387ed` · 分支 `line/deploy-check-harden` · 工作树 `meetwise-dch` · est live=0 · actualSpendCny=null · 零迁移零 env 闸零 lockfile · 停止条件三类全设 · Ban self-approve · alone≠dual · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase*
