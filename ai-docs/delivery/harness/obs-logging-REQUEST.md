# OBSLOG REQUEST — #89 可观测性刀（关 logger:false·500 日志带 reqId/路径/堆栈）

**exec:awaiting_post_prove_dual（EXEC 产物+prove 全绿已落·STOP · alone≠dual · Ban self-approve）** · 席 mw-core·W1 主路径线 · EXEC author `mw-obslog-exec` · 基座 `origin/feat/mysql-schema-skeleton` @ b429aebb · 工作树 `meetwise-line-obslog` · 分支 `line/obs-logging`

## §0 立靶依据
产品审计 #89（排障前提）：现状 `apps/api/src/main.ts:38` Fastify 层零日志（`logger:false`·NestFactory 层亦 false → Nest Logger 全静默，filter 的 error 调用实际不落盘）+ `apps/api/src/platform/all-exceptions.filter.ts:24` 500 分支只拼 code+message（无 reqId/路径/堆栈）→ 线上 500 无从排障。本刀=最小面开启 fastify 内置 pino + 500 分支结构化日志。锚点亲读与审计口径一致（该行 `logger:false, abortOnError:false` 与 filter `unhandled` 行均已核）。

## §1 范围（3 产品文件 + 2 新 proof + 1 脚本注册）
- **① `apps/api/src/main.ts`**：`FastifyAdapter` 开内置 pino（`level:'info'`；redact `req.headers.authorization`/`cookie` 作纵深——fastify 默认 req/res serializer 本就不含 body/headers，Ban 打印请求体/响应体/提示词/PII，序列化面仅 method/url/status/reqId/耗时/err 堆栈）；新增 `genReqId`（原 onRequest 钩子的净化规则单源上移：`x-request-id` 安全字符集+封顶 200，非法/空→randomUUID，防 CRLF 注入），钩子改为透传 `req.id → req.reqId + x-request-id 响应头`——fastify 日志 reqId === 响应头 === req.reqId（controller→service→job.payload→worker trace 全链一根）。NestFactory 层 `logger:false`/`abortOnError:false` 保持（免 Nest 启动噪音双写）。
- **② `apps/api/src/platform/all-exceptions.filter.ts`**：500 分支改经 `reply.log`（fastify pino；NestFactory logger:false 下 Nest Logger 不落盘，故不走 `this.logger`）落结构化行：`method`/`url`（去 query）/`code`/`err{name,message,stack}`（手搓序列化不依赖 pino err serializer，堆栈必落卷）+ msg `unhandled[code]`；reqId 由 pino child binding 顶层携带（genReqId 单源，不重复塞避免 JSON 双键）。响应体仍 `{error:'internal_error'}` 零细节，堆栈绝不入响应。无 pino 时退回 Nest Logger（尽力而为）。
- **③ 非 500 面零触**：HttpException 透传分支、pg 23505→409 分支、`reply.sent` 早退分支保持现状（不刷屏）。
- **④ 新 proof**：`apps/api/test/obs-logging.runner.ts`（受控子进程 runner：boot 真 HTTP 服务器 + 一次性 500 探针路由，不进产品面）+ `apps/api/test/obs-logging.proof.ts`（23 断言：访问行 method/url/status/reqId/耗时、500 行 reqId≡响应头≡客户端头+堆栈含 marker、Ban 面全行扫描 authorization 值/请求体 marker 零入卷、401 无 error 级行、envelope 不泄堆栈、SIGTERM 干净退出）+ `apps/api/package.json` 注册 `prove:obs-logging`。
- **⑤ 本 REQUEST 文档**。

## §2 非范围
health/readiness 面零触（`/livez` `/readyz/api` `/health` `/meta` 及 health.service 零 diff，仅作 proof 观测样例）·零响应信封变化（所有状态码/body 对客户端 byte 级不变）·零迁移零 schema·零 G7 面·零模型外呼（est live=0 全本地）·SSE `reply.sent` 早退路径的异常可见性维持现状（已知残留，归后续刀）·日志采样/级别环境化调参不做（固定 info，按需另刀）·pino transport/落盘轮转不做（stdout fd1 原样，交容器运行时）。

## §3 prove 结果（4 run 全绿·零 retry-to-green）
1. **api tsc 基线对照**：`tsc -p apps/api/tsconfig.json --noEmit` 改前 26 错 == 改后 26 错（git stash 对照），且 26 条全在既有文件——本刀触达的 main.ts/all-exceptions.filter/obs-logging.* 零类型错（修掉了过程中引入的 1 个 implicit-any；仓库不以全量 tsc 为门，swc 跳类型检查，根门只查 e2e/**）。
2. **根 typecheck 门**：`pnpm typecheck`（tsc tsconfig.e2e.json）EXIT=0。
3. **新 proof**：`pnpm --filter api prove:obs-logging` EXIT=0，23 断言全绿，日志收据（脱敏：剥 time/pid/hostname）：
   - 访问行：`{"level":30,"reqId":"obs-proof-livez-1","msg":"request completed","res":{"statusCode":200},"responseTime":2.03}`（incoming 行带 `req:{method:"GET",url:"/livez"}`）
   - 500 行：`{"level":50,"reqId":"obs-proof-fixed-reqid-1","msg":"unhandled","method":"POST","url":"/__obs-proof-500","err":{"name":"Error","message":"obs_proof_marker_e41c: …","stack":"Error: obs_proof_marker_e41c: …\n    at <trimmed>"}}` —— reqId/路径/堆栈三要素在卷 ✓；响应体实测 `{"error":"internal_error"}` ✓；authorization 值与请求体 marker 全行扫描零命中 ✓。
4. **既有 smoke 回归**：`pnpm --filter api prove:public-preview-write-gate` EXIT=0（createApp 全栈+钩子+pino 并存，ingress 门 503/503/401 行为零漂移；其输出已现新 pino 访问行，证明 inject 模式同样落卷）。
5. **docs:check 附带核查（非本刀门）**：`PTP_FILE_LIMIT` 在裸 HEAD 即红（4116 > MAX_FILES=2048·base≡red 预存），本刀 +5 文件后 4121，失败签名同一条零新增——如实记，归域上报协调方，不构成本刀 STOP 亦不由本刀修。
收据样例另存 `ai-docs/delivery/receipts/obs-logging/`（proof 原始输出+手动 boot 抓样+tsc-after 清单）。

## §4 纪律与 pins 十一值（照抄零翻转）
haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false+脚注 actualSpendCny=null · 本刀≠trio 三绿≠g7SuiteGreen 翻转≠:107 关闭。Non-claims：日志可见≠错误率下降；#89「排障前提」指能力就位，非任何故障关闭；无 pino 退回 Nest Logger 的分支在 NestFactory logger:false 下仍不落盘（已知，SSE 早退残留同性质）。
**停止条件核查**：pino（fastify 5.8.5 内置 10.3.1）× Nest 11.1.27 platform-fastify 兼容实测通过（`new FastifyAdapter({logger, genReqId})` 为 Nest 官方支持面）→ 未触发停手上报。
**STOP awaiting post-dual review**（双审不可免·本席只落 EXEC 产物+本 REQUEST·alone≠dual·合并裁决归协调方）。
