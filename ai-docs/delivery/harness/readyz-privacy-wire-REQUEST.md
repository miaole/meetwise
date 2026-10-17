# READYZ-PRIVACY-WIRE REQUEST — privacy 健康消费接线刀（WSS post P2-1 跟进·量级微·编排面两件一卷零迁移 · 起草席落卷 · **STOP=`executed:awaiting_post`**——EXEC 席 2026-10-16 R1 修法 (a) 落改翻面·前值 `draft:rework`（rev 席复审 REJECTED 回炉）→更前值 `draft:awaiting_rev` 史录·见 §10/§10-rev2）

> 战役 meetwise · 支线 `line/readyz-privacy-wire` · 工作树 `meetwise-rzp` · 起草基线 @origin/feat/mysql-schema-skeleton=`2c257eb0`（派单下界「fetch 后 origin tip≥92086586」以等号成立亲证=`git merge-base --is-ancestor 92086586 origin/feat/mysql-schema-skeleton` 形等号臂实跑 PASS·92086586 系现 tip 直系祖先）· ⛔push ⛔merge 主线（push/翻面权归协调方）。**STOP=`executed:awaiting_post`**（EXEC 席 2026-10-16 R1 修法 (a) 落改翻面·前值 `draft:rework`（rev 席 2026-10-16 回炉翻面）→更前值 `draft:awaiting_rev` 史录·三处同值·§8 协议+§10/§10-rev2）。主仓 worktree 建支线：`git worktree add ../meetwise-rzp -b line/readyz-privacy-wire origin/feat/mysql-schema-skeleton`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-16·WSS post P2-1 跟进·窗口期问题=privacy 域红信号现无自动消费方）；②WSS 载体刀定谳承引（worker-shutdown-seq-REQUEST §1.1 部署注记+§9.4：「`/readyz/privacy` 新端点**零消费方**（新面·无编排面/LB 规则配置消费该端点=观测面落地先行）……后续消费接线**另案不入本刀**」——本刀即该「另案」）；③端点源码注记亲读（`apps/worker/src/main.ts:269`「零消费方部署先行（编排面/LB 接线另案不入本刀）」）。

## §0 现状锚（窗口期问题全链双向锚·起草席亲读+blob 亲算 @`2c257eb0`·**rev/EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

### 0.1 blob 锚表（起草席亲算 `git rev-parse 2c257eb0:<path>`）

| 文件 | blob @`2c257eb0` | 本刀触面 |
|---|---|---|
| `docker/compose.prod.yml` | `73462150` | **件① 触（探针 service append·web 块后 secrets 前）** |
| `docker/compose.ha.yml` | `42a34908` | **件① 触（同名 service 目标覆写·文件尾 append）** |
| `scripts/alerts/event-catalog.json` | `a5ed797e` | **件② 触（+1 事件·恰 8 行 append）** |
| `ai-docs/observability/alerting-runbook.md` | `ad4a7d12` | **件② 触（§3.13+头部计数十二→十三）** |
| `apps/worker/src/main.ts` | `d5e8ff2b` | **零字节 Ban**（分域端点 :266-274 与 :780 组合零触） |
| `scripts/alerts/check-alerts.mjs` | `63f21787` | **零字节 Ban**（判定器零改·目录驱动自动消费=既有缝） |
| `scripts/alerts-lint.mjs` | `75d6b69a` | **零字节 Ban**（KNOWN_METRICS 白名单零改=无新指标引用） |
| `docker/compose.monitoring.yml`+`docker/monitoring/` 三件 | （组） | **零字节 Ban**（指标面零触·:1 头注 25 条规则计数零变） |

### 0.2 窗口期问题全链事实（file:line 亲证 @`2c257eb0`）

- **域红信号已在产**：WSS 刀落 `GET /readyz/privacy`（`apps/worker/src/main.ts:266-274`·缺省 `?? true` fail-open 沿 ragReady 形制）+组合根 `privacyReady: () => (privacyErasureLoop?.ready() ?? true) && (vectorPlaneErasureLoop?.ready() ?? true)`（`:780`）——privacy 域两擦除 loop（checkpoint/vector-plane·`drain-loop.ts` cf≥3 拍翻红）已与 workerReady AND 链解耦。
- **消费方缺位（本刀病址）**：编排面健康检查只探流量闸端点——worker 三处 `docker/compose.ha.yml:261`（worker-a）/:325（worker-b）与 `docker/compose.prod.yml:344`（worker）healthcheck.test 均**只探 `/readyz/worker`**（本席逐行亲证）；api 三处（ha :170/:196+prod :263）同构只探 `/readyz/api`·lb 探 `/livez`·web 探 `/login`——**全编排面零处消费 `/readyz/privacy`**。域红仅可人工 `curl` 观测=窗口期缺陷。
- **指标告警轨在而不通**：`docker/monitoring/alert.rules.yml:1-9` 头部硬约束「expr 只引用 /metrics 真实暴露的指标……写了=假告警」+`scripts/alerts-lint.mjs` KNOWN_METRICS 白名单（:26-48）**无任何 privacy 指标**；worker /metrics 零 privacy gauge（`packages/ai-runtime/src/metrics.ts` METRIC 常量组+`main.ts` setGauge 面亲证零 privacy 词面）→ metrics 面消费需产品码（gauge+白名单两处）=违本刀零产品码预期。且单机 4G 预览**不常驻 Prometheus**（`compose.prod.yml:327-328` 注记+`compose.monitoring.yml` 独立栈非默认起）。
- **日志告警轨在且活**：`ai-docs/observability/alerting-runbook.md` 范围声明（log 面覆盖指标面盲区）+`scripts/alerts/check-alerts.mjs` 判定器（`compose logs` **全 service 无差别扫描** :116+JSON/regex matcher 目录驱动 :238-248+fail-closed EXIT 语义）+`scripts/alerts/event-catalog.json` 机读唯一真源（本刀前 12 事件）+alerts-lint 机检防腐化（目录 13 条锚解析全过=门 3 亲跑在卷）。
- **probe 可达性**：worker `expose: "9091"`（`compose.prod.yml:334-335`·ha worker-a/b 同构）=compose 私网内 `worker:9091`/`worker-a:9091`/`worker-b:9091` 直达，探针无需端口映射零公网面。

### 0.3 迁移号

零迁移零 DDL 零 env 闸（`PRIVACY_PROBE_TARGETS` 系 compose 字面量 env 非产品 env·不入 env-schema/worker.env.example 面·provider-egress deployment-references 机检不受扰亲证=deploy:check EXIT=0 在卷）。

## §1 修法（两件一卷·恰 4 改文件+1 新 REQUEST·零产品码零迁移）

**裁量定稿**：两候选形中取**编排面探针（healthcheck 二级·告警不拉闸形）**。metrics 告警规则面否决（§1.3-③）：alert.rules expr 只能引 /metrics 真实指标，privacy gauge 不存在，补 gauge=产品码（main.ts+metrics.ts+lint 白名单三处）违零产品码预期，且 Prometheus 不常驻=规则写了也不评估（假活）。日志面是现役活轨（runbook 范围声明），故探针红行走日志面目录事件收口。

### 1.1 件① 探针（compose 编排面·恰两文件）

- **`docker/compose.prod.yml`** web 块后 `secrets:` 前 append `privacy-watchdog` service（:394 起）：复用 `${BACKEND_IMAGE:?}` 摘要 pin 镜像（零新镜像零新供应链面）；`node -e` 内联探环（30s 一拍·`AbortSignal.timeout(10000)` 有界拍·**零 `${` 插值字面**=compose interpolation 免转义）；非 200/不可达→`console.error(JSON.stringify({event:'readyz_privacy_degraded',target,…}))` 结构化红行（绿=静默零噪音）；**90s 起步静默窗**（起步期 worker 未就绪不产假红）；心跳文件 tmpfs `/tmp/privacy-watchdog-heartbeat`（30s 一写）+自身 healthcheck（120s 窗断言）=探针挂死 `compose ps` 可见（「谁看守门人」面）；`<<: *container-runtime-security`（read_only+cap_drop ALL+no-new-privileges+tmpfs）安全锚零弱化；`mem_limit: 64m`（lb 先例形）+`restart: unless-stopped`；**零密**（无 DATABASE_URL 无模型 Key·纯私网只读 HTTP）；**零 `depends_on`**（见 §1.3-⑤）。
- **`docker/compose.ha.yml`** 文件尾 append 同名 service 目标覆写块（:431 起）：仅 `environment.PRIVACY_PROBE_TARGETS: "worker-a:9091,worker-b:9091"`——HA 拓扑下 prod 原 worker 已被 profiles 停用（RX-1），不去重定向则探针恒红=假告警源；其余键按 compose 合并语义自 prod 定义继承，零重复定义=零双源漂移面。合并渲染亲证：targets 覆写生效+RX-1 原 api/worker/web 不在渲染 services（门 1b 在卷）。
- **告警不拉闸形成立**：worker 三处 healthcheck（:261/:325/:344）**逐字节零触**——privacy 域红≠容器 unhealthy≠杀容器≠退流量，只产红行告警，沿分域语义（WSS #157 观测面非流量闸定性）。

### 1.2 件② 消费（日志告警轨目录+runbook·恰两文件）

- **`scripts/alerts/event-catalog.json`** +1 事件 `readyz_privacy_degraded`（恰 8 行 append·12→13 条）：json matcher `{field:"event",value:"readyz_privacy_degraded"}`+severity `Ticket`（域红=擦除滞后降级非用户面中断·分层口径对齐 runbook §1）+`source: "docker/compose.prod.yml:394"`（alerts-lint file:line 形制）+source_note 双发射点注记+runbook 锚。**判定器 `check-alerts.mjs` 零改**：`compose logs` 全 service 扫描+目录驱动 matcher=既有缝自动消费新事件（零码接线）。
- **`ai-docs/observability/alerting-runbook.md`** §3.13（含 `<a id="ev-readyz_privacy_degraded">` 锚·alerts-lint 悬空锚机检过=门 3）+头部计数十二→十三：含义（cf≥3 拍翻红/不可达同事件）+响应（privacy 池连通→loop 卡死下钻→`up` 面核失联）+**告警不拉闸声明**+白名单注记（部署窗瞬时红沿到期形登记纪律）。

### 1.3 否决（五件）

1. **拉闸形**（`/readyz/privacy` 并入 worker healthcheck.test 或双 healthcheck）——compose 每 service 恰一 healthcheck 槽；并入即 privacy 域红→容器 unhealthy→编排拉闸/重启=**WSS #157 分域解耦整体回焊**，违本刀存在前提·否决。
2. **全量监控栈**（blackbox exporter/常驻 Prometheus 落单机 4G）——新容器+新供应链面+违反「单机 4G 预览不常驻 Prometheus」现状裁决（`compose.prod.yml:327-328`）·否决。
3. **metrics 告警规则面**（alert.rules +1 条）——privacy gauge 不在 /metrics 也不在 lint 白名单：写规则=假告警（违 alert.rules.yml:1-9 硬约束+alerts-lint 必红）；补 gauge=产品码违零产品码预期·且栈不常驻=规则不评估·否决。
4. **LB/编排闸消费形**（LB 探分域端点或 worker-a/b depends_on service_healthy 挂钩 privacy）——LB 只并 api 面；privacy 红退 worker 流量=变相拉闸同构①·否决。
5. **判定器改造形**（check-alerts.mjs 增服务清单/专用扫描逻辑）——`compose logs` 全 service 扫描+目录驱动 matcher 已是通用缝，改造=零增益增面；同理探针**零 depends_on**（HA 合并模式下 prod `worker` 依赖键会残留指向被停 service=up 报错风险，90s 静默窗已代偿启动序）·否决。

## §2 门矩阵（六门·起草席基线亲跑值在卷·rev/EXEC 期复跑）

1. **门1 compose 静态校验**：`node scripts/validate-prod-compose.mjs` EXIT=0（prod 单文件渲染）+`node scripts/deploy-check.mjs` EXIT=0（结构断言全过·204 迁移面零扰）+合并渲染 `docker compose -f prod -f ha config` EXIT=0（ha6 同口径 stub env）+**HA 覆写生效断言**（渲染树 `PRIVACY_PROBE_TARGETS: worker-a:9091,worker-b:9091`+RX-1 原 api/worker/web 不在渲染 services）——四臂全绿本席亲跑在卷。
2. **门2 alerts:lint**：`pnpm alerts:lint` EXIT=0（24 条告警规则+事件目录 13 条+runbook 锚解析 13 条全过）——本席亲跑在卷。
3. **门3 actionlint**：本刀零 `.github/` 触面（diff 面 0 workflow 文件）；基线亲跑 clean 树与本卷树 **EXIT=1 恒等 28 行逐行同红**（7 shellcheck findings 全既存·ci.yml:150 等）=既存基线红承登零增量，非本刀门。
4. **门4 markers**：改动集新增行（56 行）五类标记词运行时组装直扫 **0 hits**+全树行首冲突标记严格形（`^<{5}|^>{5}`）grep **EXIT=1 零命中**——本席亲跑在卷。
5. **门5 docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·本卷前 2213 managed files≤cap 2216；本 REQUEST 落卷后预期 **2214≤2216 余 2**（零 cap 上调诉求）。
6. **门6 diff 面**：本起草卷恰 **5 tracked**=2 compose+1 catalog+1 runbook+1 新 REQUEST；零产品码（`apps/` `packages/` 零字节）；零 lockfile 改。邻面 `scripts/ha/ha6-companion.proof.mjs` 亲跑：唯一 FAIL=`principal.ts:946 pool max single-source expression drifted` 与 clean 基线树**恒等**（既存基线红承登·compose 形断言锚 :51/PGPOOL 恰一行/合并渲染/RX-1 全过）非本刀门。

**停止条件（三类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob 漂移或 compose 形变（healthcheck 行移位/服务增删/监控栈常驻化）→停·重 pin 回炉；**门红**=门 1/2/4/5 任一红或 actionlint/ha6 红形**超出基线恒等集**→停·如实升级（Ban 就地改基线红）；**越界需要**=任何产品码/env-schema/白名单上调/监控栈触面诉求→停·另刀或 §8 裁决行使。

## §5 pins（Ban+预算）

- est live=0（起草+rev+EXEC 全程本地静态门·零容器 up 零模型外呼零 DB 零 secrets）· 0 Key 值 · `actualSpendCny=null`。
- **零迁移零 DDL 零 env 闸零 lockfile 改**；docs cap 2216 不上调。
- **零字节 Ban**：`apps/`+`packages/` 全树（零产品码）·`scripts/alerts/check-alerts.mjs`·`scripts/alerts-lint.mjs`·`docker/compose.monitoring.yml`+`docker/monitoring/` 三件（指标面 25 条计数零变）·worker 三处 healthcheck 行（:261/:325/:344 逐字节）。
- 探针资源预算：64m（全拓扑 4.0625G→4.125G·≤4c8g 信封·ha resource-budget receipt 静态零扰=ha-status 门面亲证零触）。

## §8 治理（STOP 协议·起草席权限边界）

- 本卷 **STOP=`executed:awaiting_post`**（EXEC 席 2026-10-16 R1 修法 (a) 落改行使 §8 EXEC 臂翻面·前值 `draft:rework`（rev 席 2026-10-16 复审 REJECTED 行使 §8 回炉臂翻面·更前值 `draft:awaiting_rev` 史录）·三处同值：本节+标题+头注）——落改+门复行+行为验证亲跑在卷（§10-rev2）；post 链复核/SSOT 行翻面权/并线权全归协调方（⛔push ⛔merge 主线）。
- rev 审点建议（不约束）：①90s 静默窗与 30s 拍值裁量；②Ticket severity 分层裁量（合规面拔 Page 的可能）；③HA 覆写最小面 vs 全块重述取形；④§1.3-⑤ 零 depends_on 裁决追认。
- 前瞻耦合注记（随卷·处置归后继刀/协调方裁）：S15 买云 Prometheus 常驻化后，metrics 面收编（privacy gauge+规则）可另刀评估，本探针届时可退役或降级双轨；LB/编排面若引入分域路由语义，本探针消费面随之收敛。

## §9 偏离与诚实披露（起草卷）

1. 门 3（actionlint）与门 6 邻面（ha6-companion）基线红承登如实登记：clean 树与本卷树红形逐行恒等亲证在卷，非本刀引入、非本刀可修（修=越界扩面）。
2. `event-catalog.json` 首插以整文件重写试验致全文件重排 diff（97+/13-），即弃改走锚点外科 append（终形恰 8 行+·compact 单行 matcher 风格保持·终 diff 已验）；试验中间形未入任何 commit。
3. proof 墙钟：本卷零 TS proof 触面（worktree 未装依赖·零产品码改动使 prove 面失义）——门矩阵以静态/渲染/lint 门全替代，rev 席如需 obs-ready 等既有 proof 复归可独立 `pnpm install` 后亲跑（预期与基线恒等·零本刀变量）。

## §10 REV 复审注记（rev 席独立外席 · 2026-10-16 · VERDICT=REJECTED → 回炉）

> 独立重 pin+四维复核在卷。件②（目录+runbook+判定器零改）与门矩阵全数复核通过；件① 探针形制九要素（BACKEND_IMAGE 摘要 pin 同契约第四处复用/node -e 探环/30s 拍/AbortSignal.timeout(10000) 有界/结构化红行/tmpfs 心跳+自身 healthcheck 120s/`*container-runtime-security` 全锚/64m/零 depends_on）经 `docker compose config --format json` rendered 模型逐一亲证成立；HA 覆写与 RX-1 语义成立；拉闸形否决机证成立（worker 三 healthcheck test 行 @`2c257eb0` vs @HEAD 逐字节恒等）——**唯 §1.1 声称的「90s 起步静默窗」未实现：`docker/compose.prod.yml:397` 探环 `const W=Date.now()+90000` 系死变量（全命令恰 1 次出现=声明即终结·tick 体零引用·本席本地直跑行为实证：t≈0（窗内）即发 `readyz_privacy_degraded` unreachable 红行·心跳写正常）**。四文面（compose 注记/runbook §3.13 两处/本卷 §1.1+§1.3-⑤）声称未落地行为=必返工（R1）。

### 10.1 §0 锚届树重 pin（rev 席亲算）

- 起草席 §0.1 八锚 @`2c257eb0` **全数属实**（73462150/42a34908/a5ed797e/ad4a7d12/d5e8ff2b/63f21787/75d6b69a/7ce87b89+monitoring 三件逐一亲算同值）。
- 届树 @`434313c6`：触面四件新 blob=`b59b5031`(prod)/`b3535ce8`(ha)/`d1cea85c`(catalog)/`ba3bb613`(runbook)；**零字节 Ban 四件组届树恒等**（main.ts `d5e8ff2b`+check-alerts `63f21787`+alerts-lint `75d6b69a`+compose.monitoring `7ce87b89`+monitoring 三件 base=HEAD 同 blob）=Ban 兑现机证。

### 10.2 门矩阵复跑（届树实测·≥4 达成实为六门组）

- 门1 四臂全绿复跑：validate-prod-compose EXIT=0；deploy-check EXIT=0（204 迁移面）；合并渲染 EXIT=0（85+1 stub ha6 同口径）+rev 自建 rendered-JSON 断言（watchdog 在·targets=`worker-a:9091,worker-b:9091` 覆写生效·`depends_on: null`·mem=67108864·read_only/cap_drop ALL/no-new-privileges/tmpfs `/tmp:rw,noexec,nosuid,nodev,size=64m` 全在·profiles 缺省=HA 亦起·RX-1 原 api/worker/web 渲染缺席）+prod 单渲染 targets=`worker:9091` 且 worker 在。
- 门2 alerts:lint EXIT=0 复跑（24 规则+目录 13+runbook 锚 13）。门3 actionlint 复跑 EXIT=1 恰 28 行=卷载基线红恒等（diff 零 `.github` 触面 grep 机证）。门4 markers 复跑 0/0。门5 docs:check EXIT=0 复跑（scanned 2214≤cap 2216·余 2 属实）。
- 门6 diff 恰 5 tracked +140/−1 复跑（numstat 84/11/9/28/8）+零产品码零 lockfile 机证；ha6-companion 复跑 EXIT=1 唯一 FAIL=principal.ts:946 且 `packages/db/src/principal.ts` blob base=HEAD=`23e5b770` 恒等=既存基线红承登属实非本刀。

### 10.3 残余清单（回炉修订指令·按优先级）

- **R1（P1·必返工·两自洽修法取一）**：`docker/compose.prod.yml:397` 90s 静默窗死变量。影响面推演：探针零 depends_on 与 migrate/worker 同拍 up→首拍（`tick()` 立即）起每 30s 发 `{"event":"readyz_privacy_degraded",…,error:"unreachable"}`→目录 Ticket→check-alerts fail-closed（`check-alerts.mjs:400-401` openPageTicket 含 Ticket→EXIT=1）24h 日志窗内持续开闸=每次部署/重启必产开告警；且 runbook §3.13「90s 起步静默窗已滤起步期」「worker 宕>90s 的持续红属真信号」与实测行为不符误导响应人。修法 (a)（rev 推荐）：`docker/compose.prod.yml:397` 两处 `console.error` 加 `Date.now()>=W` 谓词（心跳写保持无条件）一行级改=全卷面声称即真；或修法 (b)：如实降级——compose 注记+runbook §3.13 两处+本卷 §1.1/§1.3-⑤ 静默窗声称删改（§1.3-⑤ 零 depends_on 裁量单凭「HA 合并残留依赖键指向被停 service」独立成立不受损）。
- **R2（P2·登记）**：`privacy_watchdog_misconfigured` 事件（targets 空×exit 1）不在目录=无 matcher 消费，误配置仅 compose ps/重启环可见——补目录或本卷一句话登记裁量均可，勿悬空。
- **R3（P2·登记）**：node:22 常驻进程（fetch/undici 基线 RSS≈40-55MB）64m 为可行但紧值；OOM-kill 有 restart+心跳 healthcheck 兜底（lb 64m 先例系 nginx 非同负载形）——首 live 观察内存。
- **R4（P3·勘误）**：runbook §3.13 末尾 §4 前双空行（+11 行含尾部 2 空行形）——回炉顺手收一。

### 10.4 rev 裁决与再送 rev 通道

- STOP 翻面行使 §8「回炉」臂：`draft:awaiting_rev`→**`draft:rework`**（三处同值已翻·前值史录）。**不翻 `draft:awaiting_pre_exec_dual`**。
- 再送 rev 通道：取 R1 修法 (a) 形（仅 `compose.prod.yml:397` 单行级 diff）则本席已核面零需重审——回炉席补跑门1 compose 渲染臂+门4 markers+门5 docs:check 即可再送 rev，rev 仅复扫 R1 新 diff+复跑同三门；取 (b) 形则文面三处同步改后全门矩阵复跑再送。
- 复核确认面（零需重审）：判定器零改 blob 恒等+目录驱动消费机制亲证（`collectLogs` 全 service `compose logs` 扫描+`matcherHits` json field/value 比对）；事件目录 +8 行 12→13、`source: docker/compose.prod.yml:394` 行号亲证（=service 键行）；runbook §3.13 锚/计数十二→十三无误；§0.2 全部行号锚逐一亲证属实（ha :170/:196/:261/:325·prod :263/:327-328/:344/:377·ha lb :361 /livez·main.ts:266-274/:780 fail-open `?? true` 与 `privacyReady` 组合根）。
- rev 形 commit 落卷·⛔push ⛔merge 主线 ⛔产品码零触（本注记仅触本 REQUEST 单文件）。

*—— §10 完 · rev 席 · 2026-10-16*

## §10-rev2 EXEC 修法落卷（EXEC 席 · 2026-10-16 · R1 修法 (a) 兑现 · STOP→`executed:awaiting_post`）

> 协调方裁决=修法 (a)（rev §10.3 推荐形）快速链行使。落改+亲证+门复行+行为验证全在卷；⛔push ⛔merge 主线。

### 10r2.1 R1 修法 (a) 落点（compose.prod.yml 恰单行 diff）

- **`docker/compose.prod.yml:397` 单行两处守卫插入**：①非 200 臂 `if(!r.ok)`→`if(!r.ok&&Date.now()>=W)`；②unreachable 臂 `}catch(e){ console.error(...)`→`}catch(e){ if(Date.now()>=W)console.error(...)`。等价守卫形·`console.error(JSON.stringify({event:'readyz_privacy_degraded',…}))` 红行发射体逐字节零触；**心跳写 `writeFileSync('/tmp/privacy-watchdog-heartbeat',…)` 保持无条件零触**；`privacy_watchdog_misconfigured` 发射点、`const W=Date.now()+90000`、`setInterval(tick,30000)` 三者零触。内嵌脚本系 YAML 双引号标量内 JS：新增词面零引号零反斜杠=零转义形变。
- **死变量亲证（落改前·rev 席结论复证）**：提取 :397 内嵌脚本机检——`\bW\b` 全脚本恰 1 次出现（offset 185 声明处·tick 体零引用=死变量）；`readyz_privacy_degraded` 红行恰 2 处（offset 349 非 200 臂/offset 451 unreachable 臂）。落改后 W 恰 3 次出现（1 声明+2 谓词引用）=死变量消除机证。

### 10r2.2 行为验证（本地直跑 node -e 脚本·rev 席同法·驱动脚本临时未入卷）

靶形=`127.0.0.1:18081`（HTTP 503·非 200 臂）+`127.0.0.1:18099`（拒连·unreachable 臂）·`PRIVACY_PROBE_TARGETS` env 注入：

- **形1 原死 W 脚本（bug 复证）**：t=50ms/54ms 双臂即发红行（`status:503`+`error:"unreachable"`）=rev 席「窗内即发红」实测复现。
- **形2 修后真值形（W=90s 原样·3.5s 观察窗）**：**零红行**+心跳文件落盘（mtime 更新机证）+零 `misconfigured` 误报——「90s 起步静默窗」声称与实测首次一致。
- **形3 缩 W 快速形（W=90000→2000ms·interval 30000→500ms·仅缩常数谓词形零变·如实登记验证口径）**：窗内（t<2s）零红行；t=2047ms 起红行恢复且**双臂齐发**（`status:503`+`unreachable` 同拍）=谓词时间闸翻转行为成立；心跳写不受谓词（真值形已证）。
- 判读：窗内绿=静默零噪音、窗后红=真信号，与 runbook §3.13「已滤起步期」「宕>90s 属真信号」文面一致=四文面声称全数落地。

### 10r2.3 门矩阵复跑（届树·代码 diff 恰 `docker/compose.prod.yml` 1 tracked 单行）

| 门 | 结果 |
|---|---|
| 门1a validate-prod-compose | EXIT=0 |
| 门1b deploy-check | EXIT=0（204 迁移面零扰） |
| 门1c 合并渲染 prod+ha | EXIT=0+11 断言 ASSERT OK（守卫 2 处/W=90000/interval 30s/心跳无条件/misconfigured 原样/HA 覆写 `PRIVACY_PROBE_TARGETS: worker-a:9091,worker-b:9091`/64m=67108864/tmpfs `noexec,nosuid,nodev`/read_only/cap_drop ALL） |
| 门2 alerts:lint | EXIT=0（24 规则+目录 13+runbook 锚 13） |
| 门4 markers | 0/0（行首冲突标记 grep EXIT=1 零命中） |
| 门5 docs:check | EXIT=0（scanned 2214≤cap 2216） |
| 门3 actionlint/门6 ha6-companion | 零 `.github` 触面+基线红承登集未变（§10.2 恒等结论承续·未复跑） |

### 10r2.4 §10.3 残余清单处置登记

- **R1（P1）**：修法 (a) 兑现如上——关闭。
- **R2（P2·取「本卷一句话登记」臂）**：`privacy_watchdog_misconfigured`（targets 空×exit 1）系**配置错误面非域红面**，不目录化——可见面=容器启动即退（`restart: unless-stopped` 重启环）+`compose ps`，消费归编排运维轨非日志告警轨，勿悬空登记于此。
- **R3（P2）**：64m 紧值首 live 观察项保持开放（本地无 live 面·零测如实登记）——留 post/live 链。
- **R4（P3）**：runbook §3.13 尾双空行**本快速链未顺手收**（保 §10.4「仅 R1 新 diff」rev 再送通道纯净·协调方 (a) 一行改裁决 scope）——留协调方/post 链裁量。

### 10r2.5 STOP 翻面与 commit

- STOP 三处同值翻面：`draft:rework`→**`executed:awaiting_post`**（标题+头注+§8·前值史录在卷）。post 链复核/SSOT 行翻面/并线权全归协调方。
- commit 形：`fix(compose): privacy 看门狗起步静默窗生效（90s 内红行不发射·心跳保留）`——触面恰 2 tracked（compose.prod.yml+本 REQUEST）。

*—— §10-rev2 完 · EXEC 席 · 2026-10-16*
