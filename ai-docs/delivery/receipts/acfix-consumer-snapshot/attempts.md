# AC-FIX adaptive-consumer 夹具供给修复刀 — attempts 全账（初授权 + 裁决行动树全程）

| # | 性质 | 面 | 证明体 | 结果 | 凭据 |
|---|---|---|---|---|---|
| a0 | 静态预检（初授权刀） | tsc/grep（零证明体零 DB） | 否 | worker 41 error 全预存红（GODFN-1d 已登记）；proof 文件零诊断；diff 仅 test | exec-receipt §1 |
| a1 | **prove#1**（初授权 THE prove） | runner 隔离面 `pnpm adaptive-consumer:prove` | 是 | **EXIT=1 · 31/2 · child_exit_nonzero** · 溃点消失·排空环真走（蓝本命名目标达）· 2 红不可定位 → 遇雷 STOP | `prove-stdout.raw`·`prove-stderr.raw`·`isolated-proof-receipt.json`·commit ceb43343 |
| a2-prep | :raw 环境自备 #1 | docker/双探/迁移 | 否（零进入） | 探针 node cwd 缺陷（pg 解析需 packages/db 起点）→ PG_NOT_READY 即弃，容器自拆 | exec-receipt §1 |
| a3-prep | :raw 环境自备 #2 | 同配方修正 cwd | 否（零进入） | ready×3 ✓ · migrate 152/0 ✓ | exec-receipt §1 |
| a4 | **:raw 诊断恰 1 次**（裁决第一步） | `pnpm -C apps/worker prove:adaptive-consumer` 双流直跑 | 诊断体（不计红绿账） | EXIT=1 · 31/2 复现 · **两红=**:123 `deepCalls===1&&shallowCalls===0` + :124 `askRequests[0]` 信封三clause | `raw-stdout.raw`·`raw-stderr.raw` |
| a5 | 根因定位（零消耗） | 码面链路逐环 + 真 langgraph 离线 sim（scratch，已删） | 否 | 因子 A=0104 检索链缺供（degraded deny_external）；因子 B=planner 双 core 字面量 × 单轮结算动力学 → 2 fundamentals；sim 三分支预验证修复设计 | `mind-sim-final.txt` |
| a6 | 夹具修（分叉①） | 仅 proof 文件：0104 生产写手链 + 测试 HMAC key + planner `['并发']` | 否 | tsc 零新诊断 · 排空语义/断言字节零弱化 | `fixture.diff` |
| a7 | **prove#2**（分叉①收口·预算 ≤2 之第 1 次） | runner 隔离面 | 是 | **EXIT=0 · 33/0 · failure_class=none —— 全绿达标** | `prove2-stdout.raw`·`prove2-stderr.raw`·`isolated-proof-receipt-prove2.json` |

- 证明体调用总计：3（a1 红 / a4 诊断 / a7 绿）· prove 红绿账 = 2（红 1 → 修 → 绿 1，逐修零 retry）· :raw 诊断恰 1 次 ✓ · prove ≤2 ✓
- est live=0 全程（scriptedModelClient mock 面 · 零外发 · MODEL_API_KEY/DASHSCOPE env 计数 0 · Key name-only · 零 .env 写 · nonce/token 零落盘）
- 容器卫生：全部 disposable --rm 自拆零 stray（现存 meetwise-e2e-godfn1c-35997 系他刀遗留，本刀未触碰）
- 禁重跑至绿 ✓（a1 红后经裁决+诊断+修方有 a7；无任何无修重跑）
