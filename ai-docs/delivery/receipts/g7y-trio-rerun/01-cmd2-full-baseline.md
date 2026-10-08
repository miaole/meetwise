# G7Y addendum · CMD2 全量基线补交 run 收据（无 grep · 单 attempt · 非 retry-to-green）

- **授权**：协调方 addendum（post-dual 双席收敛 FAIL 裁决后显式授权行动 · 两席处方许可形态 · 非静默补跑）——补交 rev3 §1.2 预注册的全量套件基线读数；**grep run 的 EXIT=0 独立成立留档零冲销**（`00-exec.md` §1 CMD2 原值 · E-5③）；**零第二次 grep run** · 本 run 结局无论绿红按结局族如实登记（绿=CMD2 基线兑现；红=新面登记）。
- **CMD 原文**：`pnpm run e2e:ui:isolated`（**无 `E2E_UI_GREP`** · 24 test 全量 · spec blob `9f25566b`＝G7V-CALIB coding `fa7ec1f2` 校准孪生）。
- **attempts 台账（七字段）**：
  | 字段 | 原值 |
  | --- | --- |
  | CMD | `pnpm run e2e:ui:isolated`（attempt#1 · 唯一 · 实跑 code HEAD=`ce99645a` 本刀分支 tip） |
  | EXIT | **0** |
  | UTC 窗 | start 2026-10-08T06:13:51Z → end 06:18:35Z（**4m44s**）· **14 passed / 0 failed / 10 skipped（4.5m）** · 零 flake-retry 触发（playwright 配置原值）· 零失败工件 |
  | seg ledger 行 | 不适用（UI 套件 · 7 埋点在 HTTP driver · 如实记无该臂） |
  | interview_job | `done=14` · attempts min=1 / **max=2**（恰 1 job 消费一次 worker 契约内重试后 done · 非运行级重跑 · 如实记）· `last_error` ∅ |
  | ai_model_invocation 双计 | **=23**（succeeded 20 + failed 3 · 双计口径 · 末 ok tick `claimed=1` 在途不计入 · teardown 撕裂 ±1-2 行下限界注记）· 调用窗 06:14:13Z–06:18:33Z ⊆ run 窗 ✓ |
  | env 探针 | docker 29.1.3 · node v22.22.3 · pnpm 10.18.0 · Key set(name-only · loader) · `.env*` ABSENT · migrations applied=142 |
- **逐 test 明细（24）**：passed 14 = chromium 7（golden×2 · recruiting-bound `:143` 2.0m · screenshots×2 · stream-window · uc018-abandon）+ mobile 7（同构 7 · recruiting-bound 1.6m）；skipped 10 = online-public 2×2=4 + voice-duplex 3×2=6（DASHSCOPE 双 Key unset · 产品既有 honest capability skip · 与 G7W-G skip 形状逐类一致：voice 6 + online-public 4）。
- **结局族判定**：**绿 = CMD2 基线兑现**（rev3 §1.2 预注册读数补交成功 · 全量套件零红零新面）。
- **第三臂行使（附条件②本 run 正式适用）**：全量 run 内 recruiting-bound 双 project 过（含第三臂初稿 B exact 门 `:62`/`:233` 三面集/`:239` or-面 + `:229-230` 负向门 `releasedCopyOnCharged=false`）= **机会主义采读（G7V-CALIB 附条件② · 本 run 为全量 run 故条款适用 · Ban 立项追跑）**；E-5② 撤回标签仅针对 grep 单臂 run，不回改其留档。
- **sidecar v2 纪律（全程）**：anchor=1（`meetwise-e2e-27253-1791440031724:56158` · 06:13:57Z）· pending42P01=1 · firstOk ✓ · 停针未触发（STOP 哨兵=wrapper 退出 · tick 191）· 逐查询 guard（fallback=false）· 必读面双读 ✓ · 精确容器绑定 ✓（E-5⑤ 纪律确认后首次行使）· migrations=0142 ✓（`max(version)=0142_candidate_profile_route`）· 容器用后即焚零残留。
- **预算**：live 双计 23 ≤ est 30（rev3 §2.3 CMD2 口径）✓ · **actualSpendCny=null** · 硬帽 200 未触（本 run 单独计 · 不与 trio 48 混计 · 总累计 48+23=71 ≤ 200 亦 ✓）。
- **原物随收据**：`sidecar-cmd2full.log`（全 tick 读数日志）+ `cmd2full-sidecar-final.json`（终样本）· wrapper 原文 `.tmp/g7y-cmd2full/wrapper.log`（不入 git · 本收据摘录判读面）。
- **Non-claims**：本 run 绿 = CMD2 全量基线兑现（登记面）· **≠ trio 翻绿 ≠ 三绿 ≠ `g7SuiteGreen=true`**（trio 总判定 1绿/2红 维持 · POST7B 复现读数 ×2 原值零冲销）· ≠ 套件族绿宣称（skipped 10 如实在账 · not_run/skip ≠ pass）· not covered · not HA · not `releaseEvidence=true` · **Pins 十值零翻转** · alone ≠ dual。
