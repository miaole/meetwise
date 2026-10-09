# AC-1 adaptive-consumer 排空环调查刀 — attempts 全账

| # | 动作 | EXIT | 定性 |
|---|---|---|---|
| a0 | pre-exec 侦察（REQUEST/harness/runner dispatch/fixture+consumer 码面映射/pnpm install --frozen-lockfile） | n/a | 只读+依赖安装，零代码面零 prove |
| a1 | 字面命令面探测 `pnpm --filter @meetwise/worker adaptive-consumer:prove:raw` | 0（pnpm 未执行任何脚本） | `None of the selected packages has a "adaptive-consumer:prove:raw" script`——该脚本名仅 root 存在（转发器）· **零执行零 DB** · C-1 :raw 面改落 runner isolatedCommand 子命令 |
| a2 | provision attempt 1（容器 `meetwise-e2e-ac1diag-83853-1791517543` · port 53138 · pg ready attempt=5 · migrate OK）+ prove 启动 | 254 | **launcher 缺陷**：`pnpm exec prove:adaptive-consumer` 是 exec 语义（找可执行文件）非 run 语义 → `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "prove:adaptive-consumer" not found` → **证明体零进入**（stdout 95B=launcher 错误、stderr 0B，存 `attempt1-launcher-*.raw`）· 容器 trap 自拆 · 零断言零 DB 连接出自证明体 · **不计 prove 调用** |
| a3 | **THE 单次 prove run**（容器 `meetwise-e2e-ac1diag-r2-84363-1791517674` · port 53625 · pg ready attempt=4 · migrate 152 applied/0 skipped 2428ms · prove 2071ms） | 1 | **恰 1 次证明体调用** · base≡red 同签名 `4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN UNKNOWN` retained · 根因定谳=stderr 诊断 `last_error='adaptive_role_route_missing'` · 双流全量 `prove-stdout.raw`/`prove-stderr.raw` |

- 零 retry-to-green、零翻绿、零 reorder：a2 为启动器缺陷（证明体未进入），非红跑重试；a3 为本刀唯一证明体调用。
- 「恰 1 run」口径=证明体（tsx adaptive-consumer.proof.ts）调用次数=1；a1/a2 均未达证明体。
- 缺陷登记（零静默丢弃）：① run-manifest.txt 内 `run=1` 系生成脚本 sed 锚漏（`^run=1` 未匹配缩进行）的**标签缺陷**，权威身份=目录 run2+容器名 r2+时间戳 2026-10-09T03:48:03Z；② a2 launcher 缺陷如上，均已如实留痕。
- 环境留痕：零 `.env` 创建/读取 · 无 stray 容器（收尾后 docker ps 计数=0）· Key name-only（nonce/token 值零落盘，manifest 仅录 port/时长/exit）· 零 live 模型调用。
