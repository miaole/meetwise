# SSE-API-FAMILY 5C 子刀 00-exec 收据（EXEC 席·2026-10-16·untracked→tracked 口径沿 §6 预申明 count 纳 docs:check）

工作区 `meetwise-sse` · 分支 `line/sse-api-family` · EXEC 基线=merge `82318721`（--no-ff 并 origin tip=`3cd159dd`=派单下界「tip≥3cd159dd」以等号成立·cap sanction 2200 随并）· pre-exec 双审会签 PASS（席1 agent_c02db93b+席2 agent_b985f5ca）+协调方 EXEC 授权+wave111 sanction（P-2a 窗勘正）· est live=0 · actualSpendCny=null。

## ① 门矩阵十一门 EXIT 回执（终态）

| 门 | EXIT | 关键值 |
|---|---|---|
| 1 sse-push:notify:prove | 0 | **57 臂全 PASS**（首 ping 55ms<1000·间隔 max 1361ms≤2100） |
| 2 prove:sse-slot / prove:s4b-delta-arm / prove:last-event-id | 0/0/0 | 5+1 429·S4b 矩阵·Last-Event-ID fail-closed |
| 3 uc028:nhp-fault:prove / prove:metrics | 0/0 | CHECKS=45 FAIL=0·18 臂双跑 |
| 4 ag19-prompt-version:prove | 0 | 50 臂（源级门 8 站点+五值∈注册表） |
| 5 interview:prove / adaptive-life:prove（隔离 wrapper 行使形） | 0/0 | 裸 worktree 直连形 database_target_missing 基建形·沿 ssd 先例 |
| 6 neg:all | 0 | 90/90/91/102/179/135 恰等基线（±2 零行使） |
| 7 turbo typecheck --force | 0 | 8/8·0 cached |
| 8 lint root/api/worker/ai-runtime | 0/0/0/0 | 5235/1421/954/628 恰等 pin |
| 9 check-docs | 0 | 2186 ≤ cap 2200（`public-text-policy.mjs:102` MAX_FILES=2_200） |
| 10 markers | 零命中 | TODO/FIXME/XXX/HACK/冲突对·改动集+est live=0 面 |
| 11 diff 面 | 恰 | 9 码/proof+本卷 .md+本收据·sse-pump.ts 零字节·tsconfig.tsbuildinfo 构建缓存已还原 |
| 卫生 | 0 | frozen-lockfile 零 lockfile 改·est live=0 |

## ② 改前改后臂名清单 diff（sort|uniq 协议·分母=merge `82318721` 改前 run）

- sse-push 48→**57**：only-in-post=「P-2d N1-N6」八臂+「P-2a 双臂」（wave111 拆双臂承替旧窗臂）·only-in-pre=47 存活臂+P-2a 旧窗臂·P-1 同臂时延插值 15ms→11ms。
- ag19 47→**50**（+源级门 3）·uc028 40→**45**（+attempts 5·序列 F1=1/F2a=1/F2b=1/F3=2/F5=2）·metrics 16→**18**（+2）·既有臂零 diff。

## ③ P-2d N1-N6 新臂族账（P2-B 收据归组单列）

| 臂 | 断言 |
|---|---|
| P-2d N1 | emit('end') 后 waiter <100ms resolve+health()=false reason=listen_down |
| P-2d N2 | 双流三 waiter 跨流全 resolve+waitingCount 归零 |
| P-2d N3 ×3 | 唤醒后 fetchMore 即调恰 1 次（不等 30s 兜底）·补偿失败 null→泵 break 收尾<1000ms（既有语义零改）·Last-Event-ID=100 重连重放掉线窗 seq 101 帧三段原值（零丢失） |
| P-2d N4 | trigger_missing 同路醒（trigger 空→loseClient→waiter 醒+reason 命中） |
| P-2d N5 | 源级：loseClient 函数体含 wakeAllWaiters 调用+快照遍历词面（includes 形·零行号锚） |
| P-2d N6 | 醒后 entry 自除+dispose 幂等零抛+可再注册 |

既有 P-2d 健康翻转族（proof :245/:531-544 五臂）逐字冻结零歧义（全串标签消解 P2-B 碰撞）。

## ④ wave111 裁决处置登记

首跑门 1 红（P-2a 旧窗 [1800,3600] 实测 62ms·修前无唤醒行为编码）→停手上报→wave111 sanction 拆双臂→二跑红（「次 ping≈2s」对 wake-每失败重连触发机制不成立 608ms）→机制诚实形「连续 ≥3 ping 间隔全程 ≤2100（唤醒驱动+2s 封顶）+max ≥1000」→EXIT=0 57/57。语义升级非弱化（首 ping 上界收紧·反 30s 判别义全保持）·详见 REQUEST §9 字段⑥。

## ⑤ 重 pin 摘要（对 `3cd159dd`/`82318721`）

§0.1 十二 blob 恒等零漂·P2-4 次锚勘正=OCR `resume-ocr.ts:133`（卷 :137）/route-classify `job-route-classify.ts:164`（卷 :170）/adaptive promptedModel `:561`（卷 :559）·cap `:100`→`:102` 2_200·P2-C 在飞=worktree 57/obs-family 5 commit（恰 1 .md）/api-harden 1 commit（docs-only）·P2-1 U+200B 勘误承登（`0e4f45a4` ⛔amend 零洗）·迁移=0·est live=0·⛔push。
