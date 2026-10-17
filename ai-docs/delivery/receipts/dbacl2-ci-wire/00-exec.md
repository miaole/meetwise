# DBACL2-CI-WIRE 00-exec 收据（EXEC 席·2026-10-16·untracked 口径沿 ci-wiring3 件④ 先例）

工作区 `meetwise-dcw` · 分支 `line/dbacl2-ci-wire` · EXEC 基线=merge `1fe540e6`（origin tip `0ff55592`·merge-base `59127126`）· est live=0 · actualSpendCny=null。

## 字段① 门矩阵十二门全表（EXIT 原值内嵌）

| 门 | 结论 | 证据（EXIT 原值） |
|---|---|---|
| 1 解析 | 绿 | js-yaml@4.3.2 parse EXIT=0·verify steps=**103**（基线 102+恰 1·熔断内）·新增步 keys 恰 `["name","run"]`·剪除新步余 102 步 name 序列对基线 `1fe540e6` 逐位恒等=true |
| 2 actionlint | 绿 | actionlint 1.7.12 告警集对基线恒等=恰 3 既有 shellcheck（SC1083×2 `:146`+SC2034 `:155`·非本刀面）·零新增（对照 /tmp 双跑基线文件 `git show 1fe540e6` 形）·yamllint 不在仓如实登记 |
| 3 db-acl2:prove | 绿 | EXIT=0·PASS 恰 **38** / FAIL 0（0 容差）·恰 1 run 零 retry·墙钟 **9.96s**（收据 durationMs **9573**）≤56.8s 熔断·band 8-25s 内·manifest count=204 latest=0204 |
| 4 纯增机检 | 绿 | `git diff 1fe540e6 -- ci.yml` numstat **+4/−0**·删行（`^-[^-]`）恰零·单 hunk·插入块对 REQUEST 件① `:65-:68` 提取 diff EXIT=0 **逐字节恒等** |
| 5 锚位机检 | 绿 | 新步前一行 `:192`=`        run: pnpm dbhy1:prove`·新步 `:193-:196`·后一步 `:197` name 始于「跨供应商 failover」=true |
| 6 零触 blob | 绿 | 改后全等：package.json `3b04b871`+runner `0787a7ff`+db-acl2.proof `31ce9fb5`+nightly `ac47e884`+nightly-ciw2 `09cd220a`（五值零漂） |
| 7 邻面不回退 | 绿 | dbhy1:prove EXIT=0 **28/28**（7.22s）+db-acl:prove EXIT=0 **62/62**（6.69s·登记不接线面） |
| 8 docs:check | 绿 | `node scripts/ai-docs/check-docs.mjs` EXIT=0·**2167 ≤ cap 2184**（R3 operative 口径·=主线 `0ff55592` 基线 2165+本卷 REQUEST 1+本收据 1·untracked 收据计入承 rkw 实测口径） |
| 9 markers | 绿 | 五类标记词（词族运行时组装防自匹配）改动集（ci.yml+本卷 .md+收据）grep 零命中 EXIT=0 |
| 10 diff 面 | 绿 | EXEC turn 恰 2 tracked=ci.yml（+4/−0）+本卷 .md（§10 append·原稿「§9」系 P2-A 勘前值·勘记见本收据尾）+收据目录 untracked（本件）·零多 tracked |
| 11 卫生 | 绿 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT（zsh no matches=双向记录）·actualSpendCny=null·零模型外呼·隔离容器 3 件次自清残留 0 |
| 12 CI 实跑 | 移交 | 推 PR 后观察归 pusher/协调方·首跑时长回填待 CI（本席 ⛔push） |

## 字段② EXIT 原值

门 3 `pnpm db-acl2:prove` → EXIT=0；门 7 `pnpm dbhy1:prove` → EXIT=0 / `pnpm db-acl:prove` → EXIT=0；门 8 check-docs EXIT=0；门 11 frozen-lockfile EXIT=0；门 2 actionlint EXIT=1（既有 3 告警·基线同形 EXIT=1 恒等）。

## 字段③ 复跑时长与 PASS 计数

- db-acl2:prove：墙钟 **9.956s** / 收据 **9573ms** · PASS **38** / FAIL 0（1 run）
- dbhy1:prove：墙钟 **7.223s** · PASS **28** / FAIL 0
- db-acl:prove：墙钟 **6.690s** · PASS **62** / FAIL 0（孪生面登记不接线）

## 字段④ diff numstat

- `git diff --numstat 1fe540e6`（EXEC turn 终态）：`.github/workflows/ci.yml` **4 0** + 本卷 .md §10 append（见 §10 落卷后 numstat·原稿「§9」系 P2-A 勘前值）·收据目录 untracked。
- merge `1fe540e6` 对 `0ff55592`：19 files +1784/−22（cap sanction 波+四卷 REQUEST+qbank proof 等合法落刀·零 ci.yml 触）。

## 字段⑤ 重 pin 全表（对 `1fe540e6`）

| 锚 | pin 值 | 漂 |
|---|---|---|
| ci.yml | blob `97252708`/361 行（改前）·**零漂恒等**；改后 365 行 | 无 |
| package.json | `3b04b871` | 无 |
| run-e2e-isolated.mjs | `0787a7ff`/3201 行 | 无 |
| db-acl2.proof.ts | `31ce9fb5`/463 行 | 无 |
| nightly.yml / nightly-ciw2.yml | `ac47e884` / `09cd220a` | 无 |
| steps 基线 | verify steps=**102**（rkw 未并主线·零 ci.yml commit 于 59127126..0ff55592 亲证）·DBHY-1 idx 37/1b 38·failover idx 38/1b 39 · db-acl2 grep 零命中 | 无 |
| 插入锚 | `:192`=`run: pnpm dbhy1:prove`·`:193`=failover name | 无 |
| R5 行锚 | `:32-:37` 三 uses=checkout `:32`+action-setup `:34`+setup-node `:37`（在域）·`:350-:361` 纪律注记块逐字命中 | 括注 sub-detail 漂：setup-node 实 `:37` 非 `:36`·with 块 `:38-:40` 非「延至 :37」——域 pin `:32-:37` 仍恰含三 uses 行·blob 恒等纯注记级漂·如实登记 |
| R3 cap | `public-text-policy.mjs:98` MAX_FILES=**2_184**（0ff55592 sanction 落值）·operative 红线 ≤2184 | 随届时 cap 更新兑现 |
| R4 在飞 | i18n-metadata-ssr 已落地（59127126 is-ancestor HEAD）·qbank-integrity-chain `0c94d1ec`/e2e-runner-stale-build-guard `d186dffc`/qbank-pipeline-scope `fc64c7c9` 三线对 ci.yml **0 触**；全支线 sweep 四线有触：db-hygiene/g7w-tail-death/uc003-followup=§0.0 已登记历史残面+**runtime-kernel-wire `9bd48bf8` 1 触=`:331` run 值翻 `+1/−1` 零行数变化·零步增删·:192/:193 锚零涉**（rkw EXEC 中 awaiting_post_prove_dual·协调方派单预clear 形·登记不熔断） | 如实登记 |
| §0.0 双对表 | `line/dbacl2*` 恰 1=本支线·worktree 恰 1=本树·harness 卷名恰 1=本卷 | 无 |

## 字段⑥ CI 首跑实测时长回填

⛔push 遵守——首跑时长回填归门 12 观察席（pusher/协调方推 PR 后回填本节）。本地预估口径：band 8-25s·熔断 >56.8s（本席实测 warm 9.96s 佐证带内）。

## 字段⑦ 偏离清单

1. R5 括注 sub-detail 行号漂（setup-node `:37`/with `:38-:40` vs 卷注 `:36`/`延至 :37`）——域级 pin 恒成立·blob 恒等·注记级登记不回炉。
2. rkw 在飞线 ci.yml 1 触（`:331` 值翻形）——派单预clear（值翻零行数变化·锚 :192/:193 零涉）·登记不熔断。
3. 字段⑥ 空置待回填=口径使然（Ban push·门 12 移交）·非偏离。
4. 余零偏离：修法恰 1 文件恰 4 行逐字节材料化·§1 裁位/件① 逐字节/§5 Ban/pins 十一值零触零翻。

## post P2-A 勘记（nail 期随卷·2026-10-16·席1 P2-A）

本收据字段①门 10 行与字段④首行原稿「本卷 .md（§9 append）/§9 append（见 §9 落卷后 numstat）」勘正为「§10」——依据：本卷 REQUEST §9 已被 rev2 勘误落卷占位，EXEC 记录顺延 §10 编号（EXEC commit `5f5a4154` 卷内 §10 状态段自证），收据原稿两处「§9」系沿派单「§9 append」旧措辞的笔承漂。本收据落卷时为 untracked（沿 ci-wiring3 件④ 先例），本勘随 nail commit 首次入树，无史可洗、原文零删（勘前值已括注留痕于两处行内）。
