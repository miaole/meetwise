# SAFEWRITE-BACKPRESSURE EXEC 收据（00-exec · 恰 1 件）

**状态**：**EXEC 停手上报（§8 停止条件命中·非 executed:awaiting_post_prove_dual 通路）**——件①② 落码绿·四新臂绿·门矩阵 12/15 绿；门5 ha2-drain 双面红（1 红系本刀钉值点4 与 ha-2 proof :278 词面静态臂机制性相撞·修面需触 Ban 面=越界需要·须协调方裁决；2 红系基线期已红·stash 对照亲证在卷）·如实停手上报·⛔就地处置 ⛔push。

**席**：safewrite-backpressure EXEC 席（协调方授权·rev2 窄域复审 PASS agent_40905acb）。
**树**：`meetwise-swb` @ `line/safewrite-backpressure`·并线 merge `c9a3d2ef`（--no-ff feat/mysql-schema-skeleton @ `f417d8e7`=origin tip·零冲突·ort 自动合并）·EXEC 落码后状态见 §4。
**est live=0**（SSE 面单元/隔离·零模型外呼零 Key 加载零生产操作）。

## ① 门矩阵全表（十五门·EXIT 原值·命令与日志 .tmp/ 树外 `.tmp/swb-exec/`）

| # | 门 | 命令 | EXIT | 结论 |
|---|---|---|---|---|
| 1a | sse-push 改前基线 run1 | `pnpm sse-push:notify:prove` | **1** | `isolated_postgres_database_not_ready:boot`——工作树新建未 install·`probeHostSql` 以 packages/db 为起点 `import 'pg'` 缺失→host 探针恒败→boot 超时。**环境性失败·零断言评估**（收据 `.tmp/isolated-proof-receipts/2026-10-15T14-06-10-719Z-*.json` outcome=failed 在卷）。修复=`pnpm install --frozen-lockfile`（门15 同跑 EXIT=0） |
| 1b | sse-push 改前基线 run2（=分母） | 同上 | **0** | 35/35 全绿·PASS 名单 35 条存 `.tmp/swb-exec/passlist-before.txt` |
| 1c | sse-push 改后 prove（恰 1 次） | 同上 | **0** | **48/48=35 既有+13 新臂全绿**·零 retry 冲销 |
| 2 | sse-slot | `pnpm -C apps/api prove:sse-slot` | **0** | ✓（5+1 429+shared principal bucket） |
| 3 | s4b-delta-arm | `pnpm -C apps/api prove:s4b-delta-arm` | **0** | ✓（:103 契约面零翻） |
| 4 | last-event-id | `pnpm -C apps/api prove:last-event-id` | **0** | ✓ |
| 5a | ha2-drain api | `pnpm -C apps/api prove:ha2-drain` | **1** | **红**：FAIL 恰 1 臂=`R1：while 条件同读 drain 旗（!draining）`（`ha-2-drain.proof.ts:278` 正则整行钉死 while 条件词面·与本刀钉值点4「while 条件纳入自有旗」机制性相撞·见 §5-1）；行为臂（A.2 泵注册表排水/drain 取数窗/其余退出路径/A.1 gate）**全 PASS**=机制行为零回归；其后 C4 段 `healthControllerProof` 抛 503 degraded 崩溃——**基线期已红**（fake `apiReady: async () => true` 与控制器现行 `'ok'` 字符串契约+schema.migration 位脱节·审计 #91/#92 演进后未回填·两文件自基线 `e0e6c0fd` 零改动·stash 对照在卷 §5-2） |
| 5b | ha2-drain worker | `pnpm -C apps/worker prove:ha2-drain` | **1** | **红**：38/39·FAIL 恰 1 臂=`清单实数=16 具名项+env-gated stub-tick`（期望 `{ name: '` 计 17·实测 19）——`apps/worker/src/main.ts` 非本刀触面·`e0e6c0fd` 与 merge `c9a3d2ef` 两树字节恒等（`e0e6c0fd..c9a3d2ef` 零提交触及）=**基线期已红非并线引入非本刀引入**（§5-2） |
| 6 | commerce-reconcile | `pnpm commerce-reconcile:prove` | **0** | ✓ C1 对账兜底调度侧全通过（基线 24 面·零容差未触） |
| 7 | neg:all 六段 | `pnpm neg:all`（root 隔离 wrapper 形） | **0** | 90+90+91+102+179+135=**687 恰等钉值**（REQUEST §2-7 原文 `pnpm -C apps/api neg:all` 系 raw 形·需外置 DATABASE_URL 触共享目标——改走 root 隔离 wrapper 同面六段·命令形偏差如实登记 §5-4） |
| 8 | interview | `pnpm interview:prove` | **0** | **57 臂恰等钉值**（v64 面试链路全通过） |
| 9a | migrate | `pnpm migrate:prove` | **0** | ✓ 迁移运行器全部通过·链 **204 头 0204**（并线带入 cost-columns 0204·对任务书「链 203」漂移如实重 pin §4） |
| 9b | drift | `pnpm drift:prove` | **0** | ✓ schema 无漂移（退役残面经登记豁免） |
| 9c | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | **0** | `files=204 violations=0 exemptions=0143,0152,0160` |
| 10 | typecheck | `pnpm turbo typecheck --force` | **0** | `8 successful, 8 total`·`0 cached` |
| 11 | lint 五值 | `pnpm turbo lint` | **0** | `12 successful, 12 total`（10 cached 内容寻址复用）·**五值恰等**：web `601`/root `5235`/api `1421`/worker `954`/ai-runtime `628`（逐包 `problems (0 errors, N warnings)` 亲证） |
| 12 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **0** | 收据+§9-EXEC 落卷后终跑：`scanned 2149 managed worktree files ≤ cap 2152`（余量 3·未触贴边红） |
| 13 | markers 五类 | `pnpm i6-gates:prove` | **1**（恰符臂） | `PASS ⑦ markers=0（改动集五类标记词零命中）`+`PASS ⑦ est live=0`；`FAIL 改动集恰符 — unexpected=（恰本刀四路径）`=**OBS-2 协议形承登精确兑现**（i6-239 历史刀申报面·沿 authz-34 :225 先例·EXIT=1 系该臂·零 markers 命中） |
| 14 | diff 面机检 | `git diff --numstat` + `git status --porcelain` | — | tracked 改动恰 `sse-pump.ts`（+35/-5）+`sse-push-notify.proof.ts`（+140/-4）+本卷 REQUEST .md（EXEC 记录段）+untracked 收据恰 1 件·符合「恰 3 tracked+1 untracked」·`tsconfig.tsbuildinfo` 构建副产物由 typecheck 触碰已复原 HEAD 态（沿 i6-gates「构建副产物不计」先例） |
| 15 | 卫生 | `pnpm install --frozen-lockfile` | **0** | 零 lockfile 改（`git status pnpm-lock.yaml` 空）·`.env*` 工作树 ABSENT 双向记录·零模型外呼 |

## ② sse-push 改前改后 PASS 名单 diff（sort|uniq -c 协议·分母=改前 run2 本树名单）

- 改前 35 条 → 改后 48 条；`diff passlist-before passlist-after` **恰多出 13 条 BP 新臂**（BP-1×3+BP-2×4+BP-3×2+BP-4×4）·零臂缺失零弱化。
- 3 行名单文本差异系臂名内嵌**时序实测读数 ms 值**漂移（P-2b `1ms→0ms`·P-2a `2041ms→2034ms`·P-1 `10ms→6ms`）——臂名/断言语义恒等·非臂级差异·如实登记。

## ③ diff numstat（件①②）

```
35  5  apps/api/src/platform/sse-pump.ts
140  4  apps/api/test/sse-push-notify.proof.ts
```

## ④ 重 pin 全表（§0 协议·届时 tip=merge c9a3d2ef 亲测）

| 锚 | REQUEST 值 | 届时实测 | 判定 |
|---|---|---|---|
| origin tip | — | `f417d8e7` | 恒等协调方简报 |
| `sse-pump.ts` blob | `c95f7c5d`（178 行） | `c95f7c5d`（178 行） | 恒等（改前） |
| `sse-registry.ts` blob | `94eb93d5`（82 行） | `94eb93d5`（82 行） | 恒等·零触面兑现 |
| `sse-notify.service.ts` blob | `655746c1`（414 行） | `655746c1`（414 行） | 恒等 |
| 三控制器 blob | `d10db4ae`/`9b78100d`/`f2d7ea90` | 恒等（interview 280 行 vs 卷记 281 系行数计数法差·blob 字节恒等为准） | 恒等·零触面兑现 |
| `sse-push-notify.proof.ts` blob | `e4cf2354`（527 行） | `e4cf2354`（527 行） | 恒等（改前）·35 `A(` 静态计亲证 |
| `ha-2-drain.proof.ts` blob（api） | `c2fea739`（311 行） | `c2fea739`（311 行） | 恒等·零触面兑现 |
| `sse-delta-arm.proof.ts` blob | `8a6ff458`（319 行） | `8a6ff458`（319 行） | 恒等 |
| sse-slot/last-event-id blob | `692c4d01`/`cdfc8567` | 恒等 | 恒等 |
| docs cap | ≤2144（`:82`） | **2152**（`public-text-policy.mjs:90`·sanction `591d07cf` 已上调随并线入树） | 漂移·如实改锚 |
| 迁移链 | 203 头 0203·`0204` 缺席 | **204 头 0204**（cost-columns 0204 随并线落地·REQUEST §0.3 预见在卷） | 漂移·如实改锚 |
| docs:check 基线 | 2141/2142 | **2148**（并线带入 ci-wiring3/cost-columns/dbhy1 卷+收据 6 件） | 漂移·如实改锚 |
| ha2-drain 基线 | 47/47+39/39（HA-2 收据时点） | api C4 崩溃+worker 38/39（基线 `e0e6c0fd` 已红·§5-2） | 漂移·如实改锚 |
| fake raw `on` 缺席 | ha-2 `:31-:43`+delta-arm `:60-:67` | 亲证恒等（仅 writeHead/write/end 三方法） | 恒等·件① fake 容忍形照钉落码 |
| 在飞交叠复扫（§0.0） | 唯一命中 `line/sse-notify-push` 历史残枝 | 恒等（tip `49535514`·sse-pump blob `fe6d9b17` 旧态·HEAD `:11` Opt1 注记在树） | 恒等·零新残枝 |
| §0 立项出处⑤路径 | `receipts/ha-2/exec-receipt.md` | 树内 ABSENT（`find ai-docs/delivery -name "*ha-2*"` 零命中） | 路径漂移·观察登记（HA-2 EXEC 落卷见 commit `64522c62` 题面） |

## ⑤ 停止条件与偏离清单

1. **【停止条件·越界需要+验收红不可修·上报协调方裁决】门5 api 红臂 × 钉值点4 机制性相撞**：`ha-2-drain.proof.ts:278` 词面正则 `/while \(!done && !closed && !draining && Date\.now\(\) < deadline\)/` 整行钉死 while 条件；本刀钉值点4 钦定「while 条件纳入自有旗（帧边界退出）」——落码后该臂必红。机制上 while 条件纳入为必需（trip 落在循环体尾部 emit 时·无此条件泵将空转到 deadline）：钉值点4 与 :278 不可兼立。解法两枝均越授权面：(a) 更新 :278 正则=**触 Ban 面**（ha-2 proof 零触 Ban·rev2 P1 同族）；(b) 改以循环体内 break 等价形=**改钉值形**（Ban 阈值/断开形改值）。本席依钉值落码（while 条件纳入自有旗）·停手上报·Ban 就地处置。
2. **【停止条件·验收红不可修·基线前在】门5 双面基线红**（stash 对照亲证·日志 `.tmp/swb-exec/stashctl-ha2-*.log`）：`git stash` 后=merge `c9a3d2ef` 原态实跑——api **EXIT=1**（`R1：while 条件同读` 臂 PASS·C4 段 45 PASS 后同点崩溃 `HttpException degraded`）+worker **EXIT=1 38/39**（同臂清单实数 17≠19）→ 两红**基线期已红定谳**（非并线引入非本刀引入：`apps/worker/src/main.ts` 于 `e0e6c0fd` 与 `c9a3d2ef` 两树字节恒等零提交触及）——REQUEST §2-5 钉值「47/47+39/39」系 HA-2 收据时点（commit `64522c62`）旧值·其后 readiness 位（审计 #91/#92）与 worker 挂死清单演进未回填本 proof·REQUEST §2-5 观察登记（48 vs 47 差 1）疑即此漂移症状。非本刀根因·Ban 借机修·上报。
3. **改前基线 run 双跑登记**：run1 环境性失败（未 install·boot 探针缺 `pg`·零断言评估·收据在卷）→ install 后 run2 为分母 run。「恰 1 次」纪律按分母 run 计·双 run 全账如实登记零冲销。
4. **neg:all 命令形**：REQUEST 原文 `pnpm -C apps/api neg:all`（raw·需外置 DATABASE_URL 触共享目标）→ 实跑 root 隔离 wrapper `pnpm neg:all`（同六段·687 恰等）·如实登记。
5. **构建副产物复原**：`apps/web/tsconfig.tsbuildinfo` 被 typecheck 触碰·已 `git checkout --` 复原 HEAD 态（i6-gates「tsbuildinfo 构建副产物不计」同先例·非业务改动）。

## ⑥ markers 承登（OBS-2）+ pins

- **OBS-1（镜像面承登）**：件①「拒写镜像 draining 分支形」**镜像仅 return/write 行为**（`return false` 不落 `write`·零写穿零缓冲滞留）——**不复制** draining 分支的 `closed=true` 副作用（若复制则 `:177` `if (!closed)` end 守卫被跳过→socket 悬挂·rev2 消歧①机制根）。自有旗 `bpTripped` 与 `closed`/`draining` 三旗正交·码面注记「背压 drain(socket)≠HA-2 排水」消歧措辞在旗声明与监听挂载两处在位。
- **OBS-2（i6-239 恰符臂红=协议形承登）**：`pnpm i6-gates:prove` 的「改动集恰符」臂以 i6-239 历史刀申报清单为期望集·本刀改动集必不符→该臂红=**协议形承登**（沿 authz-34 :225 先例·rev2 §9 自检同形承登）——见 §6 实跑回执。
- **pins 十一值零翻声明**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null——本 EXEC 全程零翻转。

## 附：四新臂落点（件②·恰四臂）

- 臂(i) 阈值内计数（BP-1×3）：恒 false 注入·四帧全落+第二轮取数游标含 103（lastSeq 未冻结）+close 前 end=0（零 trip）。
- 臂(ii) 超阈值断开（BP-2×4）：12×100KiB 恒 false 累计越 1 MiB→泵帧边界退出+拒写早停（writes<12）+end 恰一次+registry count()=0。
- 臂(iii) drain 复位（BP-2 独立臂 BP-3×2）：首次 false 后经件① `on` 缝挂监听恰一次·`fireDrain()` 手动发→复位后 ~600KiB 大帧仍接受（两轮累计 >1 MiB 零断开·end=0）。
- 臂(iv) 源级静态（BP-4×4）：词面 includes 形（零行号锚）——`if (!reply.raw.write(s))` 消费面+`1_048_576` 阈值词面+`bpTripped` 与消歧措辞在场+`if (!closed)` end 守卫词面零扩。
