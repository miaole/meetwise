# 测验双连接证明也要拒绝回环地址

## §0 锚

分支 `line/quiz-loopback-draft`。起点 `77ae05ac1f2f637b706a016993ecc93abaa68680`。开工时 `git status --porcelain` 为空。

检索 `ai-docs/delivery/harness`：没有说明在补 `assertQuizDiagnosisDualClaimRemotePostgres` 的回环主机。`packages/db/src/principal.ts` 里的 `isLocalDatabaseHost` 是另一处生产环境本机库判断，不是这个函数。

### `apps/worker/src/quiz-diagnosis-dual-claim.ts`

第 1–4 行头注原文：

```
/**
 * Fail-closed target gate for the quiz/diagnosis dual-connection claim proof.
 * Isolation-PG proofs for this slice use remote Postgres only.
 * Local Docker / loopback is forbidden; missing remote config must not start a local database.
 */
```

第 6–15 行原文：

```
export function assertQuizDiagnosisDualClaimRemotePostgres(
  env: Record<string, string | undefined> = process.env,
): void {
  const host = env.PGHOST?.trim();
  if (env.E2E_ISOLATED === '1' || Boolean(env.E2E_TEST_CONTAINER?.trim())
    || host === '127.0.0.1' || host === 'localhost') {
    throw new Error('quiz_diagnosis_dual_claim_prove_forbids_local_docker_db');
  }
  if (env.E2E_CLOUD_ISOLATED !== '1') throw new Error('quiz_diagnosis_dual_claim_prove_requires_remote_postgres');
}
```

头注写明本地 Docker 与回环一律禁止，缺远程配置时不得启动本地库。函数对 `PGHOST` 只做 `trim`，主机判断只有两处全等：`host === '127.0.0.1'` 与 `host === 'localhost'`。`::1`、带方括号的 `[::1]`、`127.0.0.2` 这类 127 网段、`postgres` 这类本地 Docker 主机名都不会进入这个失败分支。

### `apps/worker/test/quiz-diagnosis-dual-claim.proof.ts`

第 1–6 行原文：

```
/**
 * Deterministic fail-closed gate for HC-GAP-004 (no database).
 * Dual-connection claim proofs must use remote isolation Postgres.
 * Local Docker / loopback is forbidden.
 *   pnpm quiz-dual-claim:unit:prove
 */
```

第 25–45 行原文：

```
  A(
    'TC-WORKER-001-E2-quiz 本地 Docker / loopback 失败关闭',
    threw(
      { E2E_ISOLATED: '1', PGHOST: '127.0.0.1', E2E_TEST_CONTAINER: 'meetwise-e2e-x' },
      'quiz_diagnosis_dual_claim_prove_forbids_local_docker_db',
    ),
  );
  A(
    'E2E_CLOUD_ISOLATED=1 仍拒绝 loopback',
    threw(
      { E2E_CLOUD_ISOLATED: '1', PGHOST: '127.0.0.1' },
      'quiz_diagnosis_dual_claim_prove_forbids_local_docker_db',
    ),
  );
  A(
    'localhost 失败关闭',
    threw(
      { E2E_CLOUD_ISOLATED: '1', PGHOST: 'localhost' },
      'quiz_diagnosis_dual_claim_prove_forbids_local_docker_db',
    ),
  );
```

写了「仍拒绝 loopback」的那条，主机只有第 35 行的 `127.0.0.1`。整份证明实际覆盖的主机只有 `127.0.0.1`（第 28 行、第 35 行）和 `localhost`（第 42 行）。没有 `::1`，没有 `[::1]`，没有 127 网段里除 `127.0.0.1` 以外的地址，也没有本地 Docker 主机名。

第 46–53 行原文：

```
  A(
    '缺远程隔离配置失败关闭，不得改起本地库',
    threw({}, 'quiz_diagnosis_dual_claim_prove_requires_remote_postgres'),
  );
  let remoteOk = true;
  try { assertQuizDiagnosisDualClaimRemotePostgres({ E2E_CLOUD_ISOLATED: '1', PGHOST: '10.0.0.8' }); }
  catch { remoteOk = false; }
  A('只接受 E2E_CLOUD_ISOLATED=1 的远程 Postgres 配置', remoteOk);
```

空环境仍要求 `quiz_diagnosis_dual_claim_prove_requires_remote_postgres`。远程样例主机是 `10.0.0.8`。

### 对照 `apps/worker/src/interview-dispatch-fairness.ts`（不改这个文件）

第 27–40 行原文。这里已经把 `::1` 视为禁止主机：

```
function forbiddenInterviewDispatchHost(host: string | undefined): boolean {
  if (!host) return false;
  const normalized = host.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  return normalized === 'localhost'
    || normalized === 'postgres'
    || normalized === '::1'
    || normalized === '0:0:0:0:0:0:0:1'
    || normalized === '0.0.0.0'
    || normalized.startsWith('meetwise-postgres')
    || /^127(?:\.\d{1,3}){3}$/.test(normalized)
    || /^::ffff:127(?:\.\d{1,3}){3}$/.test(normalized)
    || /^169\.254(?:\.\d{1,3}){2}$/.test(normalized)
    || /^fe[89ab][0-9a-f]*:/i.test(normalized);
}
```

第 29 行先去掉首尾方括号、去掉一个尾点、再转小写。因此带方括号的 `[::1]` 会变成 `::1` 再拒绝。第 31 行 `postgres` 与第 35 行以 `meetwise-postgres` 开头的名字是本地 Docker 主机名。第 36 行正则覆盖 127 网段，不只有 `127.0.0.1`。

第 42 行原文：`DB proofs for this slice use remote Postgres only. Local Docker / loopback is forbidden.`

第 53–56 行原文：

```
  const host = env.PGHOST?.trim();
  if (forbiddenInterviewDispatchHost(host)) {
    throw new Error('interview_dispatch_prove_forbids_local_docker_db');
  }
```

只把这些主机形当对照。不改这个文件。不改生产环境的数据库启动判断，也不改 Redis 启动判断。

## §1 修法

只改 `apps/worker/src/quiz-diagnosis-dual-claim.ts`，以及已有证明 `apps/worker/test/quiz-diagnosis-dual-claim.proof.ts`。

按头注，把下列主机纳入现有失败分支。错误原文仍是 `quiz_diagnosis_dual_claim_prove_forbids_local_docker_db`，不新造错误串。

`PGHOST` 先 `trim`，再按公平调度第 29 行做同样的规范化：去掉首尾方括号，去掉一个尾点，再转小写。然后在现有失败分支里拒绝：

1. 裸 `::1`。规范化后与 `::1` 全等。
2. 带方括号的 `[::1]`。规范化会先去掉方括号，因此与 `::1` 同一条拒绝。
3. 127 网段。规范化后匹配 `/^127(?:\.\d{1,3}){3}$/`。`127.0.0.1` 仍拒绝。`127.0.0.2` 也拒绝。
4. 本地 Docker 主机名。对照公平调度已经拒绝的形：规范化后与 `postgres` 全等，或以 `meetwise-postgres` 开头。

`localhost` 仍拒绝。规范化后与 `localhost` 全等也拒绝。这是收紧，不是放宽。`E2E_ISOLATED === '1'` 或 `E2E_TEST_CONTAINER` 去空白后非空时，仍走同一失败分支。

缺远程配置时仍不得启动本地库。`E2E_CLOUD_ISOLATED !== '1'` 时仍抛 `quiz_diagnosis_dual_claim_prove_requires_remote_postgres`。不要改成去拉起本地库。

已有证明补上上述主机，并且是在 `E2E_CLOUD_ISOLATED` 为 `1`、不靠 `E2E_ISOLATED` 或 `E2E_TEST_CONTAINER` 的情况下仍进入同一失败分支。至少点名：`::1`、`[::1]`、`127.0.0.2`、`postgres`、一个以 `meetwise-postgres` 开头的主机名。既有 `127.0.0.1` 与 `localhost` 断言保留。空环境仍期望 `quiz_diagnosis_dual_claim_prove_requires_remote_postgres`。`10.0.0.8` 在 `E2E_CLOUD_ISOLATED` 为 `1` 时仍通过。

不改 `apps/worker/test/quiz-diagnosis-dual-claim-pg.proof.ts`。不改 `interview-dispatch-fairness.ts`，也不改它的导出。判断写在 `quiz-diagnosis-dual-claim.ts` 内部。不改生产环境的数据库启动判断，也不改 Redis 启动判断。

## §1.3 否决

- 不改迁移。
- 不新增环境变量。
- 不放宽 `127.0.0.1` 和 `localhost`。
- 不改公平调度文件 `apps/worker/src/interview-dispatch-fairness.ts`。
- 不新建第二份证明。

## §2 门

根 `package.json` 第 493 行现有脚本名是 `quiz-dual-claim:unit:prove`，命令是 `pnpm -C apps/worker prove:quiz-dual-claim`。`apps/worker/package.json` 第 54 行脚本名是 `prove:quiz-dual-claim`，命令是 `tsx test/quiz-diagnosis-dual-claim.proof.ts`。证明头注第 5 行写的入口是 `pnpm quiz-dual-claim:unit:prove`。跑这一条。不跑会连库的 `quiz-dual-claim:prove`（第 494 行，转到 `prove:quiz-dual-claim-pg`）。

按顺序：

1. `pnpm quiz-dual-claim:unit:prove`。退出码 0。
2. `pnpm turbo typecheck --force`。退出码 0。
3. `pnpm turbo lint`。退出码 0。0 errors。警告数不得高于 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。低于上限算过。
4. `node scripts/ai-docs/check-docs.mjs`。退出码 0。扫描可以比 2298 多 1，不得超过 2304。失败就改说明，不改上限。

不调用模型。不列 provider-egress。不把进度清单或能力项记成新增完成。本说明是唯一新增受管文件。

## §8

`draft:awaiting_pre_exec_dual`

本步只新增说明，不改代码。

`draft:awaiting_pre_exec_dual`

`draft:awaiting_pre_exec_dual`
