# Receipt — GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot · attempt-2 (mw-core execute)

- **Knife**: GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot（Line A'' · REQUEST @ `6673042`）
- **Executor**: `mw-core`（新任执行者，前执行者因基础设施故障未跑任何东西；本 run 从零执行）
- **Authority**: 预执行双审 BOTH PASS（`mw-privacy-int` @31d3b31 + `mw-e2e-ha` @376aa8e）→ 协调方（meetwise bot）显式授权恰好一次 teed prove
- **Executed at (UTC)**: 2026-10-03T12:07:37.905Z → 2026-10-03T12:07:46.555Z（runner receipt `durationMs=8650`，另含容器 boot / migrate / 就绪轮询）
- **proveSha**: `6673042f8bcdc29cf6f10f99d0aa6a3c95e5a53b`（prove 运行时 HEAD，未先做任何 commit）
- **Result**: **EXIT = 0（绿）**；51 PASS / 0 FAIL；成功横幅 `✓ PrivacyAuthorizationIssuer DB 证明通过（本地隔离证据）`；`LOCAL_ISOLATED_PROOF_RECEIPT outcome=passed exitCode=0`

## CMD（唯一授权形态 · 逐字）

```bash
cd /Users/miaole/Desktop/golucky/meetwise-line-a2 && set -o pipefail
LOG=ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log
pnpm privacy-authorization:prove 2>&1 | tee "$LOG"
rc=$?
printf '\nPROCESS_EXIT=%s\n' "$rc" | tee -a "$LOG"
```

## EXIT 证据链（3811cf1 缺陷已补）

- teed log 末（非空）行 = 字面 `PROCESS_EXIT=0`（log 第 74 行，全 log 唯一一处 `PROCESS_EXIT=`），由同一 shell `set -o pipefail` 捕获 pnpm 真实退出码后以 `tee -a` 追加，非事后手补。
- EXIT=0 → 无 `ELIFECYCLE` 行（grep 计数 0），与契约一致。
- attempt-2 JSON `"exit": 0` 与 `processExitLine: "PROCESS_EXIT=0"` 逐字一致。

## Log 契约核验（teed-oneshot-attempt-2.log）

| 检查 | 结果 |
|------|------|
| 首个非空行 = 脚本头 | PASS（第 2 行 `> meetwise@0.1.0 privacy-authorization:prove /Users/miaole/Desktop/golucky/meetwise-line-a2`；第 1 行为 pnpm 前导空行） |
| 行首 `> meetwise@` 顶层头行计数 | 1（恰好一次跑；无 retry 痕迹） |
| `privacy-authorization:prove` 脚本头出现次数 | 1（attempt-1 同构） |
| 末（非空）行 | `PROCESS_EXIT=0`（第 74 行） |
| `ELIFECYCLE` 行 | 0（EXIT=0 无需） |
| 就绪轮询 `E2E_POSTGRES_READY attempt=k` | boot=4 / post-migrate=3 / pre-prove=3（按 harness 不算第二跑） |
| 行数 / SHA256 | 74 行 / `136996dc582abf8ce469343a18f2de2729d56ee40d8f769dd633b967fee08987` |

## attempt-1 冻结锚复核（`git hash-object` vs blob 锚）

| 时点 | oneshot-attempt-1.json | oneshot-attempt-1.log |
|------|------------------------|------------------------|
| 跑前 | `8cc9db56079a60fc6410472632dbf4899952c9c2` ✓ | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` ✓ |
| 跑后 | `8cc9db56079a60fc6410472632dbf4899952c9c2` ✓ | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` ✓ |

零漂移；attempt-1 未被修改/追加/forge。无 attempt-3 文件，无第二跑痕迹。

## 隔离实例（binding 条件 8）

- 容器：`meetwise-e2e-41747-1791029257903`（runner 生成唯一名 `meetwise-e2e-${pid}-${Date.now()}`），run 结束由 `docker rm -f` 清理；`--rm -d`、无共享卷、无开发库/开发容器接触。
- 端口：`-p 127.0.0.1::5432` 动态分配 → `127.0.0.1:51568`。
- 镜像：`pgvector/pgvector:pg16` 本地已存在（此前经 `docker.m.daocloud.io` 拉取，digest `sha256:7b822b0aac60…` 后已回打 canonical tag；本次 run **零 pull**，无新 pull 日志）。
- 隔离栈 banner：`E2E_ISOLATION_STACK=pgvector-legacy`（R5-MARKED-RED：本地绿 ≠ sole 真相 ≠ RAG 已迁）。

## File 清单（attempt-2 新增）

| 文件 | SHA256 |
|------|--------|
| `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log` | `136996dc582abf8ce469343a18f2de2729d56ee40d8f769dd633b967fee08987` |
| `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.json` | `2350e16bb6d472afbe726e285576f1b98ce68f062ec990d5791d27def9e488a5` |
| `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/2026-10-03-teed-oneshot-attempt-2-receipt.md`（本文件） | 见 git blob |

runner 本地回执 `.tmp/isolated-proof-receipts/2026-10-03T12-07-46-555Z-41747-937ddf40-884e-40a2-96e0-bf1057e4ee84.json`（`.tmp/` gitignored，不入库）。

## 诚实边界（binding 条件 6 · 7）

- **绿 ≠ 关 flake**：`GAP-PRIV-AUTHZ-PROVE-FLAKE` 保持 **OPEN / mitigated-cause-unknown**；`canHonestlyFlip=false`。单次 teed EXIT=0 不构成 root-cause 钉死，不构成 closed/fixed 依据。
- 本阶段**零 SSOT 改动**（matrix / backlog / checklist 未碰）；**零产品改动**（`apps/worker/src/checkpoint-principal.ts`、`apps/`、`packages/`、`package.json`、migration、script 均未碰，`git status` 仅含本 receipt 集新增文件）。
- UC-052 stays **partial**；coveredCount=**8**；公开 DELETE=**503**；九项 pins 原值（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false）。
- 恰好一次：本 run 为 attempt-2 唯一一次 prove，无重跑、无返工、无 attempt-3。

## 环境备注

- Docker Desktop 29.1.3；镜像本地命中（无需 daocloud 拉取路径）。
- node v22.22.3 · pnpm 10.18.0；`pnpm install --frozen-lockfile` 跑前已完整执行（Already up to date）。
- Shell 无 `E2E_*` / `DATABASE_URL` / `PG*` 残留环境变量；runner 自身再剥离云凭证。
- 本机实际用时：隔离容器 boot→ready 轮询 4 次、migrate applied=134 skipped=0、pre-prove 复探 3 次 —— 全链路一次通过，未复现 attempt-1 时代的 ECONNREFUSED/23505（这不构成根因结论，cause 仍 unknown）。

## STOP

**本 receipt 为执行方（mw-core）产物，非审阅。** post-prove 双审（mw-privacy-int + mw-e2e-ha）由协调方另派；实现方不自批、不代签、不 flip SSOT。

*GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot · attempt-2 · EXIT=0 · gap stays OPEN / mitigated-cause-unknown · canHonestlyFlip=false · STOP*
