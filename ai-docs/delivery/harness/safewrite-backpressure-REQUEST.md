# SAFEWRITE-BACKPRESSURE REQUEST — sse-pump safeWrite write=false 背压刀（#132 承刀·恰 1 产品文件机制修+既有 proof 增臂·safewrite-backpressure 战役·起草落卷即停）

**Status**: **`draft:rev3:awaiting_post_dual`**（rev3 窄域重钉落卷即停·alone≠dual · est live=0 · markers=0 · ⛔push · **沿革：rev2 双审回炉（§9·席1 PASS+席2 FAIL 恰一处 P1）→ EXEC 落码红停上报（§9-EXEC·`executed:stopped_gate_red_escalated`）→ 协调方 wave70 授权 rev3 窄域重钉（§9-rev3·两 ha2-drain proof 陈旧钉随翻·ha2-drain 双面红翻绿）·rev3 修订随 post 双审一并裁**）

**EXEC Status（append-only·2026-10-15）**：**`executed:stopped_gate_red_escalated`**（协调方 EXEC 授权后落码——件①② 绿·四新臂绿·门矩阵 12/15 绿；§8 停止条件命中停手上报：门5 ha2-drain api `:278` 词面臂与钉值点4 机制性相撞（修面需触 Ban proof 或改钉值形·均越 EXEC 授权）+api C4/worker 清单两红基线期已红（stash 对照亲证）——详见 §9-EXEC+收据 `receipts/safewrite-backpressure/00-exec.md` · 裁决权归协调方 · ⛔push）

**席位**：safewrite-backpressure 起草席（诊断+起草双责·协调方派·批表盘点席在案 #132 真未闭立靶）。
**基线**：`feat/mysql-schema-skeleton` @ `575b428e`（reconcile-retry nail 收官 SSOT commit·=origin tip·docs:check 2141≤cap 2144 本树亲跑 EXIT=0）· 分支 `line/safewrite-backpressure`（建前 `git branch --list "line/safewrite*"` 恰 1 命中=本席分支·零第二同名）· 工作树 `meetwise-swb`（仓根同级·本起草席 `git worktree add ../meetwise-swb -b line/safewrite-backpressure feat/mysql-schema-skeleton` 亲立·HEAD 落 `575b428e` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` **`:402`**（逐字：「`| #132 | P3 | 技术缺陷 | 面试中 | sse-pump safeWrite 忽略 write() 返回 false（背压），慢客户端缓冲堆积（有 5 槽与 10 分钟上限） | apps/api/src/platform/sse-pump.ts:59,64,92-93 | 仍存在 | 推断 | 处理 drain 事件/背压，超阈值断开 | — | — | 第5批-E 文档/清理 | findings #132；… |  |`」·锚列行号系审计时点旧树·现树重锚见 §0.1）；②LEDGER `ai-docs/delivery/harness/product-campaign-LEDGER.md` `:89`（5E 行 #132 在未翻面枚举列·亲证零 ✅ 记）；③5E GROUP 卷 `ai-docs/delivery/harness/5e-group-REQUEST.md:73`（#132 行「**开放（亲证加重）**：…write() 的 false 返回被弃、恒 return true。B5 四件套单源化后此面收敛于此一处=修点集中」）；④5E-BEHAVIOR 卷 `ai-docs/delivery/harness/5e-behavior-REQUEST.md` **`:28`/:52/:74/:90/:118/:136**（R4 行=「safeWrite 消费 `reply.raw.write()` 返回 false（现弃置恒 true）+连接级缓冲计数+超阈值断开」+**rev2 两句消歧**原文（①背压断开不得复用 `closed=true` 单旗 ②阈值内 safeWrite 须仍返回 true 仅内部计数）+§2-4 断言口径+§5 Ban「#132 阈值/次数/指标名自造值」词面+裁决④待定值登记——该卷 EXEC `5b1208a1` 仅行使 R1 切片（A 形三件·checklist :2753 在案）·**R4 未行使·#132 承接本刀**）；⑤HA-2 EXEC 收据 `receipts/ha-2/exec-receipt.md`（R1 口径+A2 断言「end 恰一次·end 后 write=0（R1 封死）」=背压修法不可侵的既有语义面）；⑥形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8+trailer·在树 `575b428e` 可解析）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/Read/git hash-object 实测 @`575b428e`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表+在飞交叠复核

- `git worktree list` 建后 17 树实测（主仓+bfx/brp/ccl/ciw3/crc/dar/dbh/line-entpay/obl/ops/ple/rcp2/rcr/stf2/stf3/u184+本 swb 树）——无第二 safewrite/backpressure 同名树；`git branch --list "line/safewrite*"` 恰 1 命中。
- `ls ai-docs/delivery/harness/ | rg -i "safewrite|backpressure"` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核（EXEC 立项日必做）**：本刀产品触面=`apps/api/src/platform/sse-pump.ts`+`apps/api/test/sse-push-notify.proof.ts`。全本地分支对两文件逐一 `git log <merge-base>..<branch> -- <file>` 扫描实测：**唯一命中=`line/sse-notify-push`（tip `49535514`·sse-pump 提交 1 个）——判定=历史残枝非在飞**（其树 blob `fe6d9b17`=2026-10-08 旧态·对 HEAD `c95f7c5d` 落后 88 行=SSE-PUSH Opt1 机制已经由主线后续刀吸收在树·本 HEAD `sse-pump.ts:11` 「SSE-PUSH Opt1(协调方裁决)」注释亲证·沿 negbend-fix rev3 b110 残枝判定先例）；其余全分支（含 `line/cost-columns`/`line/ci-wiring3` 等在飞）对两文件**零非祖先提交**。EXEC 日按同协议对届时分支集复扫·任一分支出现两文件的非主线祖先新提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`575b428e`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/platform/sse-pump.ts` | `c95f7c5d`（178 行） | **`:83` `draining` HA-2 排水旗·`:85-:86` R1 口径注（排水后写侧即刻失效·safeWrite 与 while 同读同旗）·`:87-:90` safeWrite 本体（`:88` draining 早退·`:89` `try { reply.raw.write(s); return true; } catch { closed = true; return false; }`——**write() 返回值弃置·try 臂恒 return true=#132 原病面**）·`:93-:95` registryEntry/register/晚到持旗·`:98-:104` emit（`:100` `if (!safeWrite(...)) return;` early-return·`lastSeq` 在写后推进）·`:105` `deadline = Date.now() + 10 * 60_000`（10min 封顶）·`:116-:127` delta 环（`:74` `TOKEN_RING_MAX=256` 有界丢旧·`:123` coalesced 有损标记）·`:135` delta 帧写（无 id 帧）·`:141` while 条件（`!done && !closed && !draining && Date.now() < deadline`）·`:158`/`:167` drain 帧边界/取数窗 break·`:169` ping 写失败即断·`:171-:174` dispose+unregister 单点（全退出路径共用）·`:177` `if (!closed) { try { reply.raw.end(); } catch {} }`（**end 泵内单点恰一次·`closed=true` 会跳过 end=rev2 消歧①的机制根**）** |
| `apps/api/src/platform/sse-registry.ts` | `94eb93d5`（82 行） | `:9-:14` R1 口径（drainAll 只同步置旗绝不 end·否则 degraded 态 ERR_STREAM_WRITE_AFTER_END）·`:22-:44` SseRegistryEntry/SseRegistry 接口·`:60-:64` drainAll 置旗遍历·`:68-:73` isDraining/beginDrain——**本刀零触面（§3-1）** |
| `apps/api/src/platform/sse-notify.service.ts` | `655746c1`（414 行） | `:297-:299` token 帧广播注记「泵侧 safeWrite 自守卫写失败」——safeWrite 写失败自守卫语义的消费方旁证 |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（281 行） | `:262` `acquireSlot(slotKey, 5)` 429 `too_many_streams`（5 槽门）·`:268-:277` pumpSseEvents 接线（`:276` deltaSource=subscribeToken）·`:278` finally releaseSlot |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `9b78100d`（72 行） | `:57` acquireSlot 5 槽门·`:62` pumpSseEvents 接线（deltaSource 缺席=裁决⑤零触） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `f2d7ea90`（70 行） | `:55` acquireSlot 5 槽门·`:60` pumpSseEvents 接线（同上零触） |
| `apps/api/test/sse-push-notify.proof.ts` | `e4cf2354`（527 行） | `:361-:373` fakeSink（`:369` `write: (s) => { writes.push(s); …; return true; }`——**恒 true·背压臂需注入缝**·fake raw 无 `on` 需增最小缝）·`:375-:398` startPump/注入形制·`:382` 现臂基线 35/35（SSOT `a6675d7b` 门「sse-push 35/35」）——**本刀唯一测试改面（件②）** |
| `apps/api/test/ha-2-drain.proof.ts` | `c2fea739`（311 行） | HA-2 收据 A1/A2 断言载体（47/47·end 恰一次+end 后 write=0 R1 封死）——**零触面·回归门（§2-5）** |
| `apps/api/test/sse-delta-arm.proof.ts` | `8a6ff458`（319 行） | `:103` 契约面静态断言先例（「delta emit 无 id 帧·safeWrite 单点」）+`:82` 泵直驱形——零触面·回归门（§2-3） |
| `apps/api/test/sse-principal-slot.proof.ts` / `apps/api/test/last-event-id.proof.ts` | `692c4d01` / `cdfc8567` | SSE 邻位单元面——零触面·回归门（§2-2/§2-4） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **盘点席路径纠偏**：简报指 safeWrite 在「`apps/worker/src/commerce-reconcile.ts` 或同族」——rg 实测全仓 `safeWrite` 词面：产品码仅 `apps/api/src/platform/sse-pump.ts`（+`sse-registry.ts` 口径注/`sse-notify.service.ts` 旁证注）·`apps/worker/` **零命中**（`rg -n "safeWrite" apps/worker` EXIT=1）——safeWrite=B5 四件套单源化的 SSE 泵写侧单点（`sse-pump.ts:87-:90`）·盘点席「以 rg 实测为准」条款成立·修点集中于此一处。
2. **docs:check 口径纠偏**：派单 brief「docs:check≤2136 红停」——in-tree cap 实测=`scripts/ai-docs/public-text-policy.mjs:82` `MAX_FILES = 2_144`（cap 2136→2144 已由 RECONCILE-RETRY EXEC 红停 sanction `4fcbeffb`+UC184 nail 并线 `:79-:81` 双笔上调·头注在树）——本卷门按 in-tree 实测 **≤2144 红停**·brief 2136 系上调前旧值·如实登记非默改。
3. **#132 行号漂移**：issues-master `:402` 锚列 `sse-pump.ts:59,64,92-93` 系审计时点旧树——现树重锚=safeWrite 本体 `:87-:90`（§0.1）·机制结论零变（write() 返回值弃置恒 true）。
4. **5E-BEHAVIOR 卷行号漂移**：该卷 R4 引 `:67-:70`（safeWrite）/`:116`（end 单点）/`:80-:81`（emit early-return）系其起草基线 `12ecb34b` 树——现树对应=`:87-:90`/`:177`/`:100`（§0.1 重锚）·rev2 两句消歧机制语义逐字承袭零改。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**203**·头 `0203_gateway_model_invocation_backlog.sql`（与 SSOT `575b428e` 题面「链 203 头 0203」恒等）·**`0204` 主线缺席亲证**（ls 零命中）——`0204` 已归 `line/cost-columns` 价格列刀在飞（其树 `0b12224e` 题面「协调方 EXEC 授权 0204 立项（…本刀 0204 连续合法）」亲证）。
- 本刀修法=纯 API 进程内行为面（§1-修法件①②）·**预期零迁移零 DDL**。协调规则：EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**；认领号=对届时主线链顶亲数后**顺延 `0205` 实测取号**（`0204` 占位归 cost-columns 在飞·Ban 抢号 Ban 私占·零硬编码·沿 AG39 改占勘误/cost3 先例）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 现实现与写入面拓扑（写入方不感知拒绝·#132 原病）

- **safeWrite 单点**（`sse-pump.ts:87-:90`·blob `c95f7c5d`）：`(s) => { if (draining) { closed = true; return false; } try { reply.raw.write(s); return true; } catch { closed = true; return false; } }`——`reply.raw.write(s)` 的 **false 返回值被弃置**、try 臂恒 `return true`。Node http.ServerResponse（`reply.raw`）`write()` 返回 false=流内部缓冲已越过 highWaterMark（http socket 默认 16 KiB·Node 官方语义）的**背压信号**；现实现对此零消费：调用方三点（`:100` emit 权威行 / `:135` emitDeltaFrames / `:169` ping）收到的恒是 true，写侧对慢客户端**零感知零降速**。
- **消费方全枚举（rg 实测）**：写侧三调用点全在泵内（`:100`/`:135`/`:169`）；`pumpSseEvents` 外部消费方=三控制器（interview `:268`/quiz `:62`/diagnosis `:60`）+三 proof（ha-2-drain `:73`/sse-delta-arm `:82`/sse-push-notify `:382`）。B5 单源化后修点集中=§1-修法件①恰 1 产品的结构性依据。
- **HA-2 语境（既有语义面·本刀不可侵）**：`draining` 旗=HA-2 停机排水语义（`sse-registry.ts:9-:14` R1 口径：drainAll 只同步置旗绝不 end·safeWrite 与 while `:141` 同读同旗·`reply.raw.end()` 泵内 `:177` 单点恰一次·HA-2 收据 A2「end 后 write=0 R1 封死」断言在树）。HA-2 解决的是**停机窗写后关**；#132 是**运行窗写洪峰**——两正交语义·背压必须自有旗别（rev2 消歧①·Ban 复用 `closed`/`draining` 任一单旗）。
- **delta 臂在写的下游不是上游**：TOKEN_RING_MAX=256 环（`:74`/`:116-:127`）是**入泵前**的进程内有界队列（有损丢旧 coalesced）——它不改变「出泵写 socket 无背压」的事实；权威行路径连队列都没有，fetchMore 直读直写。

### 1.2 背压缺口后果链（写洪峰行为）

慢客户端（TCP 窗收窄/挂起）→ `reply.raw.write()` 内部缓冲无界增长（Node 流缓冲驻进程内存）→ 泵侧照常 notify/兜底唤醒→fetchMore→emit 全速灌入（`:100` lastSeq 照常推进·`:141` 循环条件对缓冲水位零感知）→ 直到三外生终止之一：客户端断开（`:106`）/10min deadline（`:105`）/终态。**现值上界=每连接无界（内存面）**；既有护栏仅限流面：5 槽/流键（三控制器 `:262`/`:57`/`:55`）与 10min 封顶——两者都是审计 `:402` 原文承认的「有 5 槽与 10 分钟上限」，即 P3 定级的依据，**均非背压机制**。缓存堆积期间：事件堆积在单连接 socket 缓冲=对已死慢连接持续消耗内存与取数 SQL；客户端凭 Last-Event-ID 重连可重放（账本在 DB）——**断开是安全降级路径**，这正是审计修法列「超阈值断开」的机制根据。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=(a) 补 write=false 背压（写入方感知拒绝·自有旗超阈值断开）**：理由四条——①#132 审计修法列逐字钦定「处理 drain 事件/背压，超阈值断开」=行为修非登记修；②5E-BEHAVIOR R4 rev2 两句消歧已把断开形（自有旗别+阈值内恒 true）在树内卷面固化·本刀承形零重裁；③权威行已持久化（interview_event+Last-Event-ID 重连重放语义 `:23-:25` 注释在树）——**断开=安全降级非数据丢失**；④与 HA-2 R1 语义正交可叠加（自有旗·end 单点共用不侵）。
- **候选乙（否决·Ban）=(b) 排队缓冲**：与背压目的相逆——每连接再加进程内缓冲面=放大 #132 原病；权威行排队冗余（DB 账本已是持久队列·Last-Event-ID 即游标）；delta 臂唯一应有之队列已在场且语义（有界丢旧+coalesced）已钉·再加队列=语义分裂。
- **候选丙（否决·Ban）=(c) 仅登记可观测化**：RECONCILE-RETRY #10 选 (c) 是因其面为观测缺口；#132 是行为缺陷（无界缓冲）且审计修法列为行为修——仅登记不停损·缓冲照旧无界。**本刀零新增 metrics/gauge 面**（观测化划外·若 EXEC 实装判需→停止条件「越界需要」上报·Ban 就地顺手加）。

## §1-修法（背压机制刀·预期恰 1 产品文件+1 测试文件·零迁移）

- **件①（唯一码改·`apps/api/src/platform/sse-pump.ts` 现blob `c95f7c5d`）**：safeWrite 消费 `reply.raw.write()` 返回值——**钉值五点（⛔ 不得更改·改则回炉重审）**：
  1. **阈值钉值=1 MiB（1_048_576 字节）**：连接级累计「未落盘」字节计数（`write()` 返回 false 时按 `Buffer.byteLength(s)` 累加·返回 true 不计）·**`'drain'` 事件复位归零**（挂载于 `reply.raw`·写入侧缓冲排空即恢复）·**drain 监听挂载形=fake 容忍——optional-call（`reply.raw.on?.('drain',…)`）或首次 write()===false 时惰性挂载（函数等价：drain 仅在 false 后有意义）·Ban 触 ha-2-drain/sse-delta-arm 两 proof 文件（其 fake raw 无 on·自然挂载即 TypeError 两门全红）**（rev2 P1 席1 修订句照录·亲证锚=`ha-2-drain.proof.ts:31-:43`+`sse-delta-arm.proof.ts:60-:67` fake raw 仅 writeHead/write/end 三方法零 `on`）。定值理由：=64× http socket 默认 highWaterMark 16 KiB·单帧/常规 catch-up burst 不误断；5 槽/流键×1 MiB=每 principal 最坏 5 MiB 上界（现状无界）；持续慢客户端超限断开、瞬时抖动 drain 复位不误伤。
  2. **断开形=自有旗**（本卷名 `bpTripped`·EXEC 命名可异·机制不可异）：累计超阈值→置自有旗+唤醒循环在帧边界退出——**Ban 复用 `closed=true` 单旗**（rev2 消歧①：`:177` `if (!closed)` 会跳过 `raw.end()`→socket 悬挂；背压断开 socket 未断·与 `:106` reqRaw close「客户端已断·end 免责」语义不同）·**Ban 复用 `draining` 旗**（HA-2 R1 语义不混·§1.1）。
  3. **阈值内 `safeWrite` 恒返 true 仅内部计数**（rev2 消歧②逐字承袭：false 早退经 `:100` emit early-return 会冻结 `lastSeq` 不前进反而放大积压——阈值内只计数·超阈值才断）·`draining`/sync-throw 既有两早退分支语义零变·**超阈值后（自有旗已置）`safeWrite` 返回/写穿行为钉死=拒写镜像 `draining` 分支形（`return false` 不落 `write`·现 `:88` 分支即模板·零写穿零缓冲滞留）**（rev2 P2-①）。
  4. **收尾单点不变**：while 条件纳入自有旗（帧边界退出）·`:171-:174` dispose+unregister 单点照走（自有旗并入全退出路径集）·`:177` end 单点照走——自有旗路径**不抑制 `raw.end()`**（客户端见干净 end·凭 Last-Event-ID 重连重放·与 HA-2 drain 收尾同客户端语义）；`if (!closed)` 守卫行本身零改（自有旗非 closed）。
  5. **既有锚零改**：10min deadline（`:105`）/5 槽门（三控制器）/delta 环（`:74` 256）/ping 兜底（`:169`）/HA-2 registry 面（`sse-registry.ts` 全文件）·`diff --numstat` 预期=件① 净增常量+计数+监听+旗判定若干行（±注释）·`sse-registry.ts` blob 恒等 `94eb93d5`。
  - **注释措辞钉死（rev2 P2-③ 双审增补·非第六钉值点·五点计数不变）**：EXEC 期 drain 监听与自有旗处 in-code 注释沿用「背压 drain(socket)≠HA-2 排水」消歧措辞——Ban 裸写 `drain` 词不消歧（与 HA-2 排水语义混淆面·§1.1 正交性承袭）。
- **件②（prove·`apps/api/test/sse-push-notify.proof.ts` 现blob `e4cf2354`·既有 35 臂零改零弱化）**：①fakeSink（`:361-:373`）增**write 返回值注入缝**（additive·现 `:369` 恒 true）+fake raw 增最小 `on` 缝（drain 监听挂载面）；②增背压臂恰四臂（形制沿本文件既有直驱先例+`sse-delta-arm.proof.ts:103` 静态断言形）：**(i) 阈值内计数臂**——注入 write 恒 false·断言泵不早退·emit 照常推进（lastSeq 前进/后续帧照写）；**(ii) 超阈值断开臂**——持续 false 累计>1 MiB→泵退出+`raw.end()` 恰一次+registry `count()` 归零；**(iii) drain 复位臂**——false 后发 drain·计数归零·泵继续正常写；**(iv) 源级静态臂**——沿 `sse-delta-arm.proof.ts:103-:107` 词面 includes 先例（`pumpSrc.includes('…')` 断言形·**勿锚行号**）：断言 safeWrite 源码内 write() 返回值被消费词面+阈值常量 `1_048_576` 词面在场+自有旗名不入 end 守卫（`if (!closed)` 行词面零扩）——静态源断言全走词面 includes·行号零锚（rev2 P2-②）。改后臂数=35+N（N 实测如实记·沿 RECONCILE-RETRY「恰 7 新臂 17→24」形制）·**改前基线 run 必做恰 1 次**（取改前 PASS 名单 35/35 自证分母·不计入 prove·零 retry 冲销纪律沿 negbend-fix rev2 形）。
- **件③（收据·恰 1 件）**：`ai-docs/delivery/receipts/safewrite-backpressure/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后 sse-push PASS 名单 diff+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）·**raw log 一律 `.tmp/` 树外**（收据超 1 件→docs:check 贴边红·§2-12 贴边注意）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十五门·数字口径以实跑实测为准+偏差熔断）

1. **sse-push 本面**：`pnpm -C apps/api prove:sse-push-notify` EXIT=0·改前基线 35/35（SSOT `a6675d7b` 门值·rg 静态计 `A(`=35 亲证）→改后 35+N·**既有 35 臂零弱化**（PASS 名单 diff（`sort|uniq -c` 协议·分母=改前必做 run 本树名单）多出任何一条非新臂红即停）。
2. **sse-slot 邻位**：`pnpm -C apps/api prove:sse-slot` EXIT=0（静态计 14 臂·实跑为准·零新增红）。
3. **s4b-delta-arm**：`pnpm -C apps/api prove:s4b-delta-arm` EXIT=0（静态计 21 臂·零新增红——`:103` safeWrite 单点契约面零翻）。
4. **last-event-id**：`pnpm -C apps/api prove:last-event-id` EXIT=0（零新增红——重放语义零改的自证）。
5. **ha2-drain 双面**：`pnpm -C apps/api prove:ha2-drain` + `pnpm -C apps/worker prove:ha2-drain` 各 EXIT=0（HA-2 收据基线 47/47+39/39·零新增红——R1「end 恰一次+end 后 write=0」语义面零侵的承载门）·**观察登记（rev2 P2-④）**：`A(` 词面静态计 rg 实测=48 vs 收据 47/47——静态计≠收据 PASS 数差 1（不裁异·不就地归因）·**以 run 名单制实跑 PASS 名单为准**·静态计仅观察值不入熔断。
6. **邻面 commerce**：`pnpm commerce-reconcile:prove` EXIT=0·基线 24/24（SSOT `575b428e` 题面·**熔断=零容差**：≠24 即触「现场漂移」）。
7. **邻面 neg:all**：`pnpm -C apps/api neg:all` EXIT=0·六段 687（auth→commerce→resume→interview→bend→input·基线 SSOT·邻面不回退承载门·段序 PASS 名单 diff=∅）。
8. **邻面 interview**：`pnpm interview:prove` EXIT=0·57 臂（authz-34 卷 :225 口径·零容差熔断同上）。
9. **migrate 链三件**：`pnpm migrate:prove` EXIT=0（链头基线 203 头 0203·届时顺延如实记）+`pnpm drift:prove` EXIT=0+`node scripts/check-migration-version-uniqueness.mjs`→`files=203 violations=0`（files 对届时链顶亲数·violations 恒 0）。
10. **typecheck**：`pnpm turbo typecheck --force` EXIT=0·`8 successful, 8 total`·0 cached。
11. **lint 五值恰等**：`pnpm turbo lint` 全包 0 errors·五值恰等=web `601`/root `5235`/api `1421`/worker `954`/ai-runtime `628`（package.json 实测钉值·任一值越顶或异常回落即停如实登记）。
12. **docs:check 贴边红停**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned ≤ cap **2144**（in-tree `public-text-policy.mjs:82` 实测·>2144 红停上报走 sanction 先例）·**贴边注意**：基线实测 2141（本树亲跑）+本卷 1=2142+EXEC 收据 1=2143·**余量恰 1**——EXEC 期任何额外受管/未跟踪新件（新 proof 文件/第二收据件）→2144 恰贴线或 2145 红即停上报（Ban 就地凑文件·cap 上调权归协调方 sanction）。
13. **markers 五类零命中**：本刀改动集（本卷 1 .md+件① .ts+件② .ts+收据）`pnpm i6-gates:prove` markers 段零命中（i6-239 门口径·词面运行时组装·大小写敏感·命令与回执入收据）。
14. **diff 面机检**：EXEC 改动集恰 3 tracked 路径=`apps/api/src/platform/sse-pump.ts`+`apps/api/test/sse-push-notify.proof.ts`+本卷 .md（EXEC 记录段）+untracked 收据恰 1 件——多任何 tracked 路径即停（越界需要类）。
15. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（SSE 面单元/隔离·est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **`sse-registry.ts` 零触**（blob 恒等 `94eb93d5`）：HA-2 R1 机制面（drainAll 置旗不 end/isDraining/beginDrain）零改——背压自有旗与 draining 旗机制不混（§1.1 正交性）。
2. **三控制器零触**（blob 恒等 `d10db4ae`/`9b78100d`/`f2d7ea90`）：5 槽门/finally releaseSlot/deltaSource 接线零改。
3. **delta 环面零触**：TOKEN_RING_MAX=256/coalesced 有损标记/`emitDeltaFrames` 无 id 帧契约（`sse-delta-arm.proof.ts:103` 断言面）零改。
4. **既有护栏值零改**：10min deadline/5 槽/HEALTHY_FALLBACK_MS 30s/DEGRADED_POLL_MS 2s/ping 语义。
5. **metrics/gauge 零新增**（候选丙不行使·§1.3）；告警/白名单面（RECONCILE-RETRY STILL OPEN 三件套）零触。
6. **共享 SSOT 零改**：LEDGER（`:89` #132 行）/checklist/issues-master/batch-residual-plan 只读引用——#132 行翻面权归协调方 nail。
7. **零迁移零 DDL**（§0.3）·零 CI/wrapper/runner 改·零依赖升级·零 E2E 场景面。

## §4 依赖

**①上游已满足**：B5 四件套单源化（safeWrite 全仓单点 rg 亲证）+HA-2（registry R1·`f31d56d1` 系）+TOKSTREAM S4b（delta 臂）全在链 `575b428e`；5E-BEHAVIOR R4 形制卷面在树（rev2 消歧两文件句）·其 EXEC 仅行使 R1 切片·#132 承接本刀零交叠。**②无同文件并发**：§0.0 全分支扫描·唯一命中 sse-notify-push 判历史残枝。**③迁移号**：§0.3 预期零·需则顺延 0205 实测（0204 占位归 cost-columns 在飞）。**④下游**：#132 行翻面归协调方 nail；本刀机制为后续 SSE 观测刀（如需）的前置行为面。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 改前 run 恰 1+prove 恰 1·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 阈值/断开形改值（§1-修法钉值五点：1 MiB/drain 复位/自有旗/阈值内恒 true/end 单点不抑制——机制性异值诉求→停止条件「越界需要」上报协调方·Ban 自造值沿 5E-BEHAVIOR `:118` 词面承袭）；Ban 复用 `closed`/`draining` 任一单旗承载背压（rev2 消歧①）；Ban 阈值内 false 早退（rev2 消歧②）；Ban 触 sse-registry/三控制器/delta 环/metrics 面（§3-1/2/3/5）；Ban 改共享 SSOT（§3-6）；Ban 触其他工作树（cost-columns 0204 在飞等全数零触）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走顺延 0205 认领规则·Ban 抢 0204）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因邻面新红（§2 六/七/八门若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（SSE 面证明=单元/隔离·EXEC 期 §2 全门亦零模型外呼·本卷 §2-15 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑 `pnpm i6-gates:prove`·回执随 EXEC 收据留痕·五类词面运行时组装不复抄卷内防自匹配——沿 negbend-fix/ag39 卷 §7 同形制）；docs:check（含 public text policy 路径标记扫描）落卷前后恒 EXIT=0·卷内全仓内相对径。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.3 候选裁决与 §1-修法钉值五点与 §5 Ban/pins 与件①/件② 恰两面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复扫必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1 结论受疑（如 safeWrite 多点化/HA-2 R1 语义改写/emit·end 单点结构变更/§2-6/7/8 邻面基线数≠钉值）或 §0.0 复扫现非祖先新提交→停·重 pin 回炉。
- **机制不满足**：件② 新臂任一红或 prove 显示背压机制与 §1-修法钉值形不符（如阈值内误断/drain 不复位/end 双触发）→机制诊断被证伪→停·如实升级协调方回炉（Ban 就地改机制 Ban 凑绿）。
- **越界需要**：修法诉求超出件①+件② 恰两面（需触 registry/控制器/delta 环/metrics/迁移/其他工作树）→停·另刀或协调方裁决（候选乙/丙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 五值破/docs:check>2144/贴边超件）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 rev2 处置摘要（pre-exec 双审回炉修订·2026-10-14·修订记录节）

## §9-EXEC EXEC 记录（append-only·2026-10-15·executed 落卷）

**授权链**：rev2 窄域复审 PASS（agent_40905acb）→协调方 EXEC 授权（0205 席·merge 序1 钦定）→本席 EXEC。
**并线**：`git merge --no-ff feat/mysql-schema-skeleton` @ origin tip `f417d8e7` → merge `c9a3d2ef`·**零冲突**（ort 自动合并·19 文件·⛔pull --rebase 未用）。§0 全量重 pin 随并线如实改锚（cap 2144→2152·迁移链 203→204 头 0204·docs:check 基线 2141→2148·全表见收据 §4）·blob 锚表十一文件全恒等·§0.0 在飞复扫零新残枝。
**落码**：件① `sse-pump.ts`（+35/-5·钉值五点全兑：1_048_576 阈值+drain 复位+自有旗 bpTripped+阈值内恒 true+超阈值拒写镜像形+end 单点不抑制·注释消歧措辞两处在位）；件② `sse-push-notify.proof.ts`（+140/-4·fakeSink 三缝 additive+四臂恰四臂 BP-1..BP-4·既有 35 臂零弱化）。
**门矩阵**：12/15 绿——sse-push 改后 48/48（35+13·恰 1 次 prove·名单 diff 恰 13 BP 臂）+sse-slot+s4b-delta-arm+last-event-id+commerce+neg 隔离形 687 恰等+interview 57 恰等+migrate（链 204 头 0204）+drift+uniqueness files=204 violations=0+typecheck 8/8 0 cached+lint 五值恰等 601/5235/1421/954/628+卫生（install EXIT=0 零 lockfile 改·.env* ABSENT·零外呼）。
**STOP · 停止条件命中停手上报（§8）**：门5 ha2-drain 双面红——api FAIL 恰 1 臂 `:278` while 条件词面正则**与本刀钉值点4 机制性相撞**（钉值钦定 while 条件纳入自有旗·:278 整行钉死旧词面·解法两枝均越授权面：更 :278=触 Ban proof 面/改等价 break 形=改钉值形·须协调方裁决回炉或授权扩面）+api C4 段崩溃与 worker 清单实数臂红（**基线 `e0e6c0fd` 已红**·stash 对照亲证在收据 §5-2·REQUEST §2-5「47/47+39/39」系 HA-2 收据时点旧值·#91/#92 readiness 位与 worker 挂死清单演进未回填）。行为臂（A.2 泵排水/取数窗/退出路径全 PASS）证机制行为零回归。**本 EXEC 不翻 §1-修法钉值·不触 Ban 面·四红如实登记（:278×1 本刀相撞+C4×1+worker×1 基线前在+门5 停止上报）**。收据=`ai-docs/delivery/receipts/safewrite-backpressure/00-exec.md`（OBS-1 镜像仅 return/write 行为+OBS-2 i6-239 恰符臂红协议形承登在卷）。est live=0·markers 按臂承登·pins 十一值零翻·⛔push。

**双审结果**：席1 **PASS**+席2 **FAIL 恰一处 P1**→回炉 rev2（本 commit docs-only 恰 1 .md·零源码零测试触）。**P1 机制**：件① drain 监听挂载与三个直驱 proof 的 fake raw 无 `.on` 方法相撞——亲证 `ha-2-drain.proof.ts:31-:43`+`sse-delta-arm.proof.ts:60-:67` fake raw 仅 writeHead/write/end 三方法零 `on`·自然 `reply.raw.on('drain',…)` 挂载即 TypeError 两门全红（§2-3/§2-5 承载门本体）·修补该两 fake=违零触面·停止条件四类无合法出路→REQUEST 回炉修订（起草席处置·非 EXEC 期就地处置）。

| # | 审级 | 处置 | 落点 |
|---|---|---|---|
| 1 | P1 | 件① 钉值补一句：drain 监听挂载形=fake 容忍——optional-call（`reply.raw.on?.('drain',…)`）或首次 write()===false 时惰性挂载（函数等价：drain 仅在 false 后有意义）·Ban 触 ha-2-drain/sse-delta-arm 两 proof 文件（其 fake raw 无 on·自然挂载即 TypeError 两门全红）（席1 修订句照录） | §1-修法 件① 钉值点1 |
| 2 | P2-① | 超阈值后 safeWrite 返回/写穿行为钉死=拒写镜像 `draining` 分支形（`return false` 不落 `write`） | §1-修法 件① 钉值点3 |
| 3 | P2-② | 臂(iv) 静态断言改词面 includes 形（沿 `sse-delta-arm.proof.ts:103-:107` 先例）勿锚行号 | §1-修法 件② 臂(iv) |
| 4 | P2-③ | EXEC 期 in-code 注释沿用「背压 drain(socket)≠HA-2 排水」消歧措辞 | §1-修法 件① 末（五点外注释措辞钉） |
| 5 | P2-④ | ha-2-drain 静态计 48 vs 收据 47/47 观察登记（不裁异·run 名单制实跑为准） | §2 门5 |

**rev2 自检**：docs:check EXIT=0（scanned 2142≤cap 2144·本卷 +0 零新受管）·markers 臂 PASS 五类零命中（`pnpm i6-gates:prove` ⑦ markers=0 臂 PASS·恰符臂红=i6-239 历史刀申报面协议形承登沿 authz-34 :225 先例随卷承登）·STOP=`draft:awaiting_pre_exec_dual` 复审维持·est live=0·pins 十一值零翻转·钉值仍五点（P2-③ 系注释措辞钉非第六钉值点·P1/P2-① 系五点内补句）·§2/§3/§5/§8 门矩阵边界与 Ban/pins 零改（P2-④ 系观察登记非门值变更）。

## §9-rev3 rev3 修订（协调方 wave70 授权窄域重钉·append-only·落卷即停）

**STOP · `draft:rev3:awaiting_post_dual`（rev3 修订随 post 双审一并裁·alone≠dual · 裁决权归协调方 · ⛔push）**

**授权链**：EXEC `executed:stopped_gate_red_escalated` 停手上报（§9-EXEC·门5 相撞+api C4/worker 清单两红）→ **协调方 wave70 授权 rev3 窄域修订**（允触两 ha2-drain proof 文件的陈旧钉·**仅重钉·禁弱化断言语义**·其余 Ban 面不变）→ 本席归因分诊+rev3 起草落卷（本 commit）→ **复审待派：rev3 修订随 post 双审一并裁**。

**归因分诊（红臂分立·证据链全亲证）**：

- **红① api `:278` while 词面臂=本刀件① 直接归因（合法产品演进×静态钉机制性相撞·随翻重钉形）**：钉源 `64522c62`（ha-2-graceful EXEC·钉时真值=`while (!done && !closed && !draining && Date.now() < deadline)` 三旗词面·该 proof 文件自此零字节触——`git log -- apps/api/test/ha-2-drain.proof.ts` 单提交亲证）；本刀 `82826aca` 件① 按钉值点4「while 条件纳入自有旗」落 `sse-pump.ts:171` 新词面 `!done && !closed && !draining && !bpTripped && Date.now() < deadline`（`git log -L 165,175` 亲证恰此一笔引入 `!bpTripped`）。定性=静态整行钉撞合法产品演进·沿 cache-observe-repin/ag24「随翻重钉」先例形处置·非机制回退非钉值点变更。
- **红② worker 清单臂 17≠19=预存漂移（非本刀引入·两姊妹支线各增一件均未回钉）**：钉源同 `64522c62`（`=== 17`=钉时真值 16 具名+env-gated stub-tick·收据 39/39 绿）；其后两条**互非祖先**的姊妹支线各增一件且均未回钉本 proof——`0dcc73f0`（ag-cost2·drainStops 16→17·+usage-calibration-retention·支线真值 18）+`b20ee350`（qbank-control-sec·drainStops 17 项·+qbank-release-sweep·支线真值 18·`git merge-base --is-ancestor 0dcc73f0 b20ee350` 否亲证）；本线 first-parent 组装点 `d31be795`（merge qbank-control-sec）联合树真值=**19**（18 具名+stub-tick 展开行·逐 commit 计数亲证 64522c62=17→0dcc73f0=18→b20ee350=18→82826aca=19）。本刀对 `apps/worker/src/main.ts` **零字节触**（`git diff c9a3d2ef 82826aca -- apps/worker/src/main.ts` 空输出亲证）=EXEC「两基线树字节恒等·红预存」定谳复核成立；改前基线本席复跑 `PASS=38 FAIL=1`（唯一红臂恰清单实数臂·38/39 口径与 EXEC 报吻合）。
- **分诊附注（api C4 段崩溃·EXEC 记「基线期已红」·本席补定谳）**：`3684bc00`（audit #92 readiness 深化）将 HealthService.apiReady 契约由 boolean 改三值枚举（`'ok'|'migration_mismatch'|…→unknown`）且 ok 体增 `schema.migration` 位——本 proof 自 `64522c62` 零触→fake 契约钉（`apiReady: async () => true`）与 ok 体 deepEqual 钉两处陈旧（503 `degraded`/`migration:'unknown'` 即陈旧 fake 撞新契约）。本线携带组装点 `b284d8ca`（merge obs-ready·first-parent 逐节点 grep 亲证 ed0505a6=0→b284d8ca=1）。归**预存漂移非本刀引入**（`82826aca` 改动集恰 4 文件·health.controller.ts 与本 proof 均零字节触亲证）。同属「陈旧钉」授权面→随 rev3 一并回填（§9-EXEC 四红登记之 C4 红在此定谳收口）。

**修订清单（恰 2 proof 文件+本卷 §9-rev3·零产品码零其他面）**：

| # | 文件 | 落点 | 修订（语义保持或增强·禁放宽） |
|---|---|---|---|
| 1 | `apps/api/test/ha-2-drain.proof.ts` | while 词面臂（原 `:278`） | 正则重钉四旗整词面 `/while \(!done && !closed && !draining && !bpTripped && Date\.now\(\) < deadline\)/`——泵内单 while 循环字节级钉·三旗→四旗**增强**·臂名随翻（closed/draining/bpTripped 三旗+deadline 全含·未放宽为宽松匹配） |
| 2 | 同上 | C4 段 | fake `apiReady` 契约钉 `true`→`'ok'`（3684bc00 后合法枚举值·契约强度保持）+ok 体 deepEqual 增 `schema: { migration: 'ok' }`（schema 位入断言=钉面**增强**）·in-code 归因注记两处 |
| 3 | `apps/worker/test/ha-2-drain.proof.ts` | C5 清单臂 | 实数钉 17→**19**（现树实测真值·附归因）+required 具名清单 16→**18**（补 `usage-calibration-retention`+`qbank-release-sweep`·逐名在位臂 16→18 条=**增强**）+R3 注释勘误链（64522c62/0dcc73f0/b20ee350/d31be795 全链在注） |
| 4 | 本卷 | §9-rev3 | 本节（归因分诊+修订清单+授权链+自检） |

**Ban 面其余不变**：钉值五点/pins 十一值/件①② 落码字节/sse-registry/三控制器/delta 环/metrics 面全数零字节触；rev3 改动集恰 3 tracked 路径（两 proof+本卷）·零新增受管文件（docs:check scanned 恒 2149）。

**rev3 自检（门复跑·本席亲跑·2026-10-15）**：ha2-drain api `47/47` EXIT=0（改前 `:278` FAIL+C4 崩·红翻绿）+ha2-drain worker `41/41` EXIT=0（改前 38/39 唯一清单臂红·39 既有臂全保+2 新增具名钉臂）+`pnpm sse-push:notify:prove` **48/48 维持** EXIT=0+turbo typecheck `8 successful, 8 total·0 cached` EXIT=0+docs:check EXIT=0（scanned **2149**≤cap 2152·零新增受管）+markers：`⑦ markers=0（改动集五类标记词零命中）` PASS·恰符臂 FAIL=`unexpected=apps/api/test/ha-2-drain.proof.ts,apps/worker/test/ha-2-drain.proof.ts`=**OBS-2 协议形承登精确兑现**（i6-239 历史刀申报面·沿 authz-34 :225+§9-EXEC 先例·本刀两 proof 不在既有申报清单=该臂协议形红如实承登·五类标记词零命中为实质门）。**diff 面如实列全（本刀累计触面 6 件）**：件① `apps/api/src/platform/sse-pump.ts`（+35/-5）+件② `apps/api/test/sse-push-notify.proof.ts`（+140/-4）+EXEC 收据 `receipts/safewrite-backpressure/00-exec.md`（+86）+rev3 两 proof（api +9/-3·worker +7/-3）+本卷（+10）。est live=0·markers=0·pins 十一值零翻转·钉值五点零翻。

---

*SAFEWRITE-BACKPRESSURE REQUEST · 2026-10-14 起草落卷 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`575b428e`（=origin tip）· 分支 `line/safewrite-backpressure` · 工作树 `meetwise-swb`（本起草席立·建前 branch+worktree 双查无同名）· 立项出处=issues-master 更正版 `:402`+LEDGER `:89` #132 未翻+5E GROUP `:73` 开放（亲证加重）+5E-BEHAVIOR `:28/:74` R4 rev2 消歧两句（EXEC R1 切片已闭·R4 未行使·承接本刀）+HA-2 收据 R1 语境+盘点席在案 · 诊断=safeWrite 单点 `sse-pump.ts:87-:90` write() 返回值弃置恒 true（盘点席 worker 路径 rg 纠偏=产品码仅 api 平台层）·三点写入面 `:100/:135/:169`·消费方=三控制器+三 proof 全枚举·缺口后果=慢客户端 socket 缓冲无界（现值护栏仅 5 槽+10min·非背压）· 裁决=(a) 补 write=false 背压（候选乙排队缓冲/丙仅观测化否决在卷 §1.3）·钉值=1 MiB 累计+drain 复位+自有旗超阈值断开+阈值内恒 true+end 单点不抑制（5E-BEHAVIOR rev2 消歧逐字承袭）· 修面=恰 1 产品文件（sse-pump.ts）+1 测试文件（sse-push-notify.proof 增背压臂恰四臂·既有 35 臂零弱化）· 门矩阵十五门（本面 sse-push/sse-slot/delta-arm/last-event-id/ha2-drain 双面+邻面 commerce 24/neg 687/interview 57 不回退+migrate 链三件+typecheck 8/8+lint 五值恰等 601/5235/1421/954/628+docs:check ≤2144 贴边红停〔brief 2136 已被 sanction 上调·in-tree 实测如实登记〕+markers+diff 面机检+卫生）· 迁移预期零（需则顺延 0205 实测·0204 归 cost-columns 在飞）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · rev2=pre-exec 双审席1 PASS+席2 FAIL 恰一处 P1 回炉修订在卷 §9（五项处置落点）· 复审维持 awaiting_pre_exec_dual · ⛔push · STOP*
