# C-PERF-TEARDOWN · Branch A 复跑台账（环境受阻 · 协调方代跑 · 未关闭）

- 分支 `line/s-perf-teardown-rootcause` @ `6b878da`（REQUEST `3ca9628` patch-identical；pre-exec dual `f5ea3aa`+`87a2765` PASS）
- 执行者：协调方 meetwise bot 代跑（子 agent 基建连续 600s 无活动击杀 ×3，如实披露；零产品代码改动）
- **重装修复（env 层）**：首次 `pnpm install --frozen-lockfile` 后 `@meetwise/ai-graphs` 链接就位；前 4 次失败（13:53/13:56/13:59/17:31）归因 = **陈旧 node_modules 缺 T 线新增 workspace 包链接**（`Error: Cannot find module '@meetwise/ai-graphs'`，日志 `.tmp/mwcore-diag-attribution-run-20261006.log`）
- **正式 attempts（全 EXIT=1 · 全台账不洗）**：
  - attempt-1 EXIT=1（21:32:00 receipt `bc195ca5…`）：`ECONNREFUSED 127.0.0.1:64244` @ `assertIsolatedTestTarget`（`packages/db/src/isolated-test-target.ts:59`）
  - attempt-2 EXIT=1（21:48:59 receipt `ea57a86a…`）：`ECONNREFUSED 127.0.0.1:64565` 同点（PG ready line 同端口 64565）
  - attempt-3 EXIT=1（21:49:14 receipt `30476649…`）：`ECONNREFUSED 127.0.0.1:64603` 同点
  - 日志：`.tmp/s-attempt-{1,2,3}.log`
- **根因判定（第二层，读码+容器实证）**：perf-load 为双容器刀（PG + `--network=host` 的 API 容器 `meetwise-uc018-perf-api-*`，capped-child `:18`）。崩溃进程为 **API 容器内**（Node v20.20.2 + bind-mount 宿主绝对路径），其启动期 `assertIsolatedTestTarget` 以 `127.0.0.1:<published-port>` 连 PG——在 Docker Desktop/macOS（29.1.3）`--network=host` = VM 网络栈，宿主 loopback 发布端口不可达 → ECONNREFUSED → `docker start -a` exit 1 → ELIFECYCLE 1。对照：宿主→已发布端口连通性实测 OK（throwaway pg 容器 HOST-CONNECT-OK）；PG 容器内 `pg_isready` OK（就绪检查走 exec）。
- **性质**：容器可达性缺陷 = **新基建缺陷签名，超出本刀预授权 Branch B（观测修复）范围**——修复方向（PG 发布地址改 host-gateway/双容器同网桥/或 capped-child 改桥接+host.docker.internal，且须保 `PGHOST=127.0.0.1` 的 fail-closed assert 语义）需协调方裁决开新授权。
- **结论**：C-PERF-TEARDOWN 保持 OPEN（backlog `:35` 原样）；Branch A 未达关闭判据；attempt1@`b29c191` 历史原样保留；PERF/LOAD stays local partial、`capacityRepresentative=false`；Ban 互借 C-IMAGE-DIGEST。
- **Pins 原值**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · canHonestlyFlip=false。
