# AC-FIX adaptive-consumer 夹具供给修复刀 — attempts 全账

| # | 性质 | 命令/面 | 证明体进入 | 结果 | 记录 |
|---|---|---|---|---|---|
| a1 | 静态预检（零证明体零 DB） | tsc --noEmit（worker 包）· grep | 否 | worker 包 41 error TS 全为预存红（GODFN-1d 已登记 base 同在）；`adaptive-consumer.proof.ts` 零诊断 · diff 范围核验仅 test 文件 22 行 | 本文件 + exec-receipt §0 |
| a2 | **THE prove（唯一证明体调用）** | root 包裹器 `pnpm adaptive-consumer:prove`（runner 隔离面，docker pg16 disposable + migrate 152） | 是（恰 1 次） | **EXIT=1 · 31 PASS / 2 FAIL · child_exit_nonzero · 无 stage/code banner（零崩溃·跑至最后断言）** · 蓝本命名目标（溃点消失·排空环 claim→evaluate→complete×3·供给门 ON 态行使）全达；EXIT=0 未达——2 断言级红，runner 面 by-design 零断言明文，授权证据面内不可定位 | `prove-stdout.raw` · `prove-stderr.raw` · `isolated-proof-receipt.json` · exec-receipt §1-§3 |

- 证明体调用总数：**1**（a2）。无重跑、无 retry、无 :raw 面（未授权）。a2 后即遇雷 STOP，未回滚未隐藏工作树。
- 预算纪律：恰每 prove 一次 ✓（本刀恰 1 次）· 禁重跑至绿 ✓（a2 红后零再跑）· est live=0（mock 模型面）· Key name-only ✓。
