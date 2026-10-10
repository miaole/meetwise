# re-PRE3 — NHP-001-ADV-01 · UC-001 ADV blind→case · REQUEST `51af3b2` · mw-e2e-ha（Line AG · docs gate only）

**Reviewer**: mw-e2e-ha · **Date**: 2026-10-06 ~14:25 +08:00（Asia/Shanghai）
**Target**: REQUEST `51af3b273bf51945808c7bb31843b53dfcce44fc`（meetwise-core · 2026-10-06 14:20:49 +08:00 · git parent `c562906` · supersedes `4e9f568` · cites rag Re-PRE2 FAIL `a3364b4` / errata `71ad2a7`）· ancestor of `origin/feat/mysql-schema-skeleton` ✔
**Scope**: 只审文档 · Ban coding · Ban prove 执行 · Ban live · 不改产品代码 · 不读 `.env*` · 不 git config · 不代签 mw-rag-route
**Coverage note**: 本人前次 re-PRE2 PASS `5875644` **只覆盖 `4e9f568`，不覆盖本 tip `51af3b2`**；本文件为对 `51af3b2` 的全新独立审查，不追加到任何旧 PASS/FAIL 文件。

## 0. 变更面

- `git show --stat 51af3b2` = 5 个 docs 文件：harness（+38/−14）· slice（+22/−8）· **新增** `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md`（+158）· e2e stub（+21/−13）· rag stub（+21/−8）（页眉 + 追加 rewrite 注记）。
- `git diff --stat 4e9f568 51af3b2 -- apps packages scripts package.json` = **空**；`51af3b2..origin` 同路径亦为空 → 所有源码锚点与 `4e9f568`/`5875644` 时一致。
- rag stub：`git diff 71ad2a7 51af3b2` 只改页眉 + 追加「Rewrite note · re-PRE3」；rag 的 FAIL `863a5e6` / Re-PRE PASS / Re-PRE2 FAIL `a3364b4` + 勘误 `71ad2a7` 正文**未被改动** ✔。
- e2e stub：仅页眉 / 请审清单 / 历史条目更新；`3f3a2e4` FAIL 文件与 `5875644` PASS 文件未被改动 ✔。

## 1. B-R2-1 · 自检原文入库 —— **已解除**

收据 `ai-docs/delivery/receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md` 已在 tip 入库，harness B5（Verbatim self-check receipt · 必引）、harness 页眉、slice 页眉/Products、两 stub 页眉均引用该路径 ✔。

| 记录 | CMD | start/end +08:00 | EXIT | 首条失败 / docker 首行 | 标签 |
|---|---|---|---|---|---|
| baseline | `groups; id; ls -l sock; getent group docker` / `docker info` / `docker run --rm hello-world` | 14:17:44 · 14:17:50 · 14:18:09 | 0 / 1 / 126 | `permission denied … docker.sock` | docker.sock |
| R1 neg bare | `env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove` | 14:18:00–14:18:01 | 1 | companion docker 首行（披露：pnpm 薄日志未带 docker stderr） | docker.sock |
| R2 bound bare | 同形 bound | 14:18:08–14:18:09 | 1 | 同上 | docker.sock |
| R3 neg sg+ambient Key | `./scripts/with-docker-session.sh pnpm uc001:nhp-neg:prove` | 14:18:10–14:18:23 | 1 | `FAIL  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)` · `SUMMARY asserts=26 failed=1` | key |
| R4 bound sg+ambient Key | 同形 bound | 14:18:29–14:18:42 | 1 | 同上 · `asserts=17 failed=1` | key |

rag 要求的要素（命令 · 起止 +08:00 · EXIT · 首条失败断言或 docker 首行 · 判定）**四条记录齐全**。

**与代码/环境核对（mw-e2e-ha 独立）**：
- 输出格式真实：`A()` 打印 `` `${ok?'PASS':'FAIL'}  ${name}` ``（neg proof `:50`）· `EVIDENCE ${id} …`（`:54`）· `SUMMARY asserts=… failed=…`（`:308`）；with-docker-session banner 原文 = `scripts/with-docker-session.sh:48` 逐字 ✔。
- L0 断言位置 neg `:61-65` / bound `:56-60` 逐行核对 ✔（`:61`/`:56` 读 Key · `:65`/`:60` `A('L0 Ban live…')`）。
- runner `scripts/run-e2e-isolated.mjs:2124` = `await capture('docker', ['run', …])` · `:2134` = `capture('docker', ['port', …])` ✔；`:89` LIVE 集合不含 `uc001:nhp-*` ✔。
- 本人 14:23 +08:00 在 box bare session 复核基线（只读探针，未跑任何 prove）：`uid=1000(box) gid=1000(box) groups=1000(box),997(orbitd)` · sock `srw-rw---- root docker` · `docker:x:102:box` · `docker info` EXIT 1 + 同一 `permission denied … /v1.45/info` 行 · `MODEL_API_KEY` **present** / `MODEL_BASE_URL` absent（presence-only，不打印值）—— 与收据 baseline 与 Key 表一致 ✔。

**诚实性附注（非阻断）**：
- R1/R2 的「docker 首行」是同 session 的 companion `docker info` 行，不是 prove 自身 stderr；收据**已明示**此点（"no docker stderr surfaced; companion …"），未伪称 runner 原文。推断（bare gid + ~1s 失败 + PG 未起）与 runner 先 `docker run` 的顺序一致，可接受。
- 「verbatim」薄日志含 `…` 省略；`.tmp/isolated-proof-receipts/*.json` 被 `.gitignore:15` 忽略，**不在库内**，本审无法从仓库核验，仅作为收据自述。
- 真实 `docker info` stderr 首行是一条 compose 插件 WARNING，ERROR 为首条**错误**行；不影响分类。
- 收据明确 Not B5 green / not ADV prove / not covered / not Y/AB wash / Key 值未打印 ✔。

## 2. C1–C6（rag `a3364b4` §7）

| # | 判定 | 证据 |
|---|---|---|
| **C1** 两独立标签 + docker 落点 | **已落实** | harness B5 `env-blocked(docker.sock)` → `run-e2e-isolated.mjs:2124/:2134`（已核）· `L0-guard(key)` = Key assert only（neg `:61-65` / bound `:56-60`）· 「不得把 docker.sock 称作 L0」· slice N3 行与 Ban 行改为两独立标签 + Ban 合并 ✔ |
| **C2** 变异记录 V1 实际码 | **已落实** | (b) 须记去 `.strict()` 后 V1 **实际** status+error（预期 202 或 409 `question_not_ready`/`stale_question`，非 400 `invalid`）+ EXIT≠0 · temp only · never commit ✔ |
| **C3** owner 全量 | **已落实** | LEDGER-SNAP 加 owner total row count + all buckets + 全部 consumption 行；镜像 `uc-e2e-001-nhp-bound.proof.ts:158-162`（`:158` `ledger` · `:159-160` bucket ORDER BY id · `:161-162` consumption ORDER BY idempotency_key）逐行核对 ✔ |
| **C4** 正控 / V2 独立种子 | **已落实** | (a)/(e) 各自独立 seed `status='issued'` 题（不同 questionId/turn）· Ban 共享；`interview-question.ts:80`（state_version/turn 不符 → stale）· `:95`（已消费且 identity 不同 → stale）✔。细节：完全相同 answerId/hash 的重放走 `:89-90` `replayed` 而非 stale —— 不影响条件本身（独立种子即可规避），执行时勿把 replayed 误读。 |
| **C5** V3 钉 200 | **已落实** | V3 钉 HTTP **200**；`apps/api/src/modules/resume/resume.controller.ts:16` `@Post()` · `:17` `@HttpCode(HttpStatus.OK)` ✔（errata `71ad2a7` 行号正确）· Ban 模糊 2xx ✔ |
| **C6** 断言 issued | **已落实** | 问题行前置 + (a)/(e) 均要求断言 seeded `interview_question.status='issued'` ✔；`claimInterviewAnswer` 只在 `status==='issued'` 时 accepted（`:81-88`）✔ |

## 3. N1–N4（相对 `4e9f568` / `5875644` 无回退）

- **N1 保持**：LEDGER-SNAP / V4 seed = `entitlement_consumption`（`commerce.ts:49` INSERT · `:85` allocations · `:127` confirm UPDATE · `:130` `commerce_outbox`）；`consumption_record` 仍 Ban；非空转守卫（恰 1 行 + 状态）与守卫自检 (d) 原文保留；C3 仅**新增** owner 全量，不替代守卫 ✔。
- **N2 保持**：V4 = 离线调用 `completeInterviewAndConfirm`（`commerce.ts:163`）；replay 钉 V1-replay **400** `invalid/unrecognized_keys` · V2 族 **409** `interview_not_active`（`interview.service.ts:367` assertAnswerable 先于 `:368` claim · `:156` TERMINAL → 409 · `:26` TERMINAL 集合）；`answer` job delta 0 · LEDGER-SNAP 逐字节同 · V4 表格行 diff 未变 ✔。
- **N3 保持且加强**：env-blocked 与 L0-guard 现为**两独立标签**并有入库自检；「B5 未满足 → ADV ≠ EXIT0」原句保留；执行形式仍钉 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-{neg,bound}:prove`（`package.json:167/:169` 存在）；Ban retry-to-green / 改 proof / chmod·sudo / 加载 Key / 打印 Key 值 ✔。
- **N4 保持**：SSOT `ai-docs/requirements/use-cases/e2e-scenarios.md` 在 `4e9f568..51af3b2` **无改动**；harness 引文区 `:58`/`:61`/`:76` 整行与 `:72` 首句逐字比对 **全部命中**（grep -F）；`/turn` 仍在读码观察区并注 SSOT 漂移 ✔。

## 4. B1–B5 无回退

`/turn` 靶（Ban GONE `/answer`）· V3 仅 `/resume` + JD/quiz absent · strict → 400 `invalid` · 正控 202 + 1 answer job（`:373`）· `TURN_RL` 30/0.2（`:24` · `:356`）· B5 neg/bound EXIT0 零 proof 改动 —— 均与 `5875644` 时一致，锚点未漂移 ✔。

## 5. 非阻断条件（执行期适用）

1. **页眉 parent 不精确**：harness/slice/stubs 写 `Parent tip 71ad2a7`，实际 git parent 为 `c562906`（中间夹 AI–AM 五个 sibling docs REQUEST）。代码路径 diff 为空，锚点不受影响；下次改稿应更正为真实 parent 或写「base ≥ 71ad2a7」。
2. **B5 执行收据**须直接截取 runner 自身的 docker stderr / `L0-ENV` 行 + `SUMMARY asserts=26/17 failed=0`，不再用 companion 行代替；隔离收据 JSON 如作证据须入库或贴摘录（`.tmp/` 被忽略）。
3. box ambient shell **确有** `MODEL_API_KEY`（本人 presence-only 复核）→ 任何 B5/ADV 运行都必须带 `env -u MODEL_API_KEY -u MODEL_BASE_URL`；裸 `with-docker-session.sh pnpm …` 必然 L0-guard EXIT1（即 R3/R4），不得记为回归或 flake。
4. C4 执行时区分 `stale`（409 `stale_question`）与同 identity `replayed`，不把 replayed 记作正控通过。

## 6. Ban / 越界检查

Y/AB 未被洗（收据与 harness 均 Ban wash Y/AB，neg/bound proof 未改）· 018/052/025 只在 Ban 行出现（收据中 0 处）· 无 covered 翻转 · 无 live / fake-model · 无产品代码改动 · 无 HA 主张 · 证据层单一（隔离真 PG）。

## 7. Peer

mw-rag-route Re-PRE3 PASS `7706bf7` @`51af3b2` 已在 origin（作者 mw-rag-route · 14:22 +08:00）。本审**独立**，不代签 rag，亦不以 rag PASS 替代本审；alone ≠ dual。双签是否成立 / AUTHORIZE 由协调方判定。

## Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-E2E-001 ADV 保持 blind/`case-only`

## 中文结论

REQUEST `51af3b2` 已把 B5 自检原文逐字入库（4 条记录 + 基线探针，命令 / +08:00 起止 / EXIT / 首条失败行 / `docker.sock`|`key` 标签齐全），输出格式、断言行号、runner 落点与本人 box 只读复核一致 → **B-R2-1 已解除**。rag 条件 **C1–C6 全部落实**，锚点逐行核对无误。代码路径相对 `4e9f568` 零改动，**N1–N4 无回退**（N3 因两独立标签 + 入库自检而加强），B1–B5 无回退。仅余非阻断项：页眉 parent 写 `71ad2a7` 实为 `c562906`、R1/R2 用 companion docker 行（已披露）、`.tmp` 收据不在库内。本 PASS 只针对 `51af3b2`；`5875644` 不覆盖本 tip。PASS ≠ coding ≠ prove ≠ AUTHORIZE ≠ covered ≠ HA；B5 未在 ENV-capable 环境取得 EXIT0 前 ADV ≠ EXIT0。不代签 rag。

Verdict: PASS
