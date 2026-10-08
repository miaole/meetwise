# Slice — **HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀**（docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/ha-local-prove.md`（SSOT 细节/逐路径 CMD 表以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-haloc1-ha-local-prove-mw-e2e-ha.md` + `reviews/REQUEST-2026-10-07-haloc1-ha-local-prove-mw-model-op.md`
**上游现状**: `north-star-ha.md:42` —— 阶 C 骨架已落（ha-dual/shared/pg compose + Dockerfile + build 脚本 + 授权变量门），**阶 C prove 未绿**（各路径只到「可跑/骨架」态；2026-09-23 三刀系旧 tip 分刀局部收据，无单 tip 全链齐套）· 用户直裁「HA 那个可以本地模拟好的」
**Base**: `origin/feat/mysql-schema-skeleton` `9028eb70` / full `9028eb706da9782e8e78242763a1a534d2462a9a`（fetch 后实测 tip）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-halocal` · branch `line/ha-local-prove`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行（零实跑零 docker 零 live 零 Key 加载）· Ban 买云叙事 · Ban `haStatus`/`releaseEvidence` 翻转 · Ban 碰生产部署面（compose.prod/CI 零触碰）· Ban secrets/`.env*` · Ban SSOT/矩阵行翻转 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

**Pins（十值照抄）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 范围（REQUEST 要点）

1. **目标**：本地多实例+故障注入 prove **全链绿拿收据**——四面一次齐套、单 tip 连续执行：C3 shared prove（`ha:dual:compose-shared` + `ha:prove:shared -- --prove` → `SHARED_OK`）/ C3b nest-pg prove（`ha:prepare:nest-pg` + `ha:dual:compose-pg` + `ha:prove:nest-session -- --prove` → `NEST_SESSION_LOCAL_OK`）/ C4 本地 fault-inject（`ha:fault-inject -- --kill --with-shared-survivor` → `COMPOSE_FAULT_SHARED_PARTIAL`）/ ha:probe 级检查（`ha:probe:multi`（+`--with-shared`）收据 NOT_HA 原样；`--require-evidence` 恒 EXIT=1 = fail-closed 诚实钉）。执行序 P→A（C3）→B（C4）→teardown→C（C3b）→D（probe 级），拓扑互斥（同 compose project）串行；逐路径命令+期望 EXIT 见 harness §2。
2. **授权变量注入**：四枚（`MEETWISE_HA_DUAL_AUTHORIZED` / `MEETWISE_HA_SHARED_AUTHORIZED` / `MEETWISE_HA_NEST_PG_AUTHORIZED` / `MEETWISE_HA_FAULT_AUTHORIZED`）**只经进程 env · 逐 CMD 前缀 · 协调方在 EXEC 授权时显式开闸**；不写 `.env*` · 不入 git · 收据只记 name-only set/unset；负检 N1–N3/D3 不带授权（期望 EXIT=1 演示 fail-closed 门）。
3. **诚实边界（写死）**：本地绿 ≠ 阶 C 绿 ≠ 生产 HA；`haStatus=NOT_HA` 不变 · `releaseEvidence=false` 不变 · `claimProductionHA=false` 不变；`haStatus` 翻转归生产多实例证据（**买云后另刀**）；**本刀产物 = 「HA 阶 C 本地证据包」**（`receipts/2026-10-07-haloc1-stage-c-local-prove/`）**+ 矩阵 HA 行本地子面更新建议**（`e2e-requirement-coverage-matrix.md:15` 追加建议文，nail 阶段协调方裁量，本刀不落行）。
4. **预算**：est 各 prove 实测口径 = 全部 CMD **0 次 live 模型调用 / 0 次 Key 加载 / 0 外购**（2026-09-23 历史收据实测形态 + 脚本源码无模型调用面）；`actualSpendCny=null` 沿 I 线；Key name-only；`.env*` ABSENT presence 逐相记录。
5. **Ban**：Ban 买云叙事（D3 quote 另轨不推进）· Ban `haStatus`/`releaseEvidence` 翻转 · Ban 碰生产部署面（compose.prod 零触碰 · 本地 compose 禁合入生产 · CI 零改零触发）· Ban secrets（Ban `.env*` 读写 · Ban Key 值入树入据）· Ban coding（脚本已存在，红了如实登记另刀，Ban 就地改脚本追绿）· Ban假绿/retry-to-green/flake 记法（每 CMD 恰一次 attempt）· Ban SSOT/矩阵行/历史收据改写 · Ban self-approve。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not 阶 C 绿 · not 阶 D 绿 · not production HA / failover · not `releaseEvidence=true` · not `haStatus` 翻转 · not cloud buy · not covered（=8）· not suite green · not G7 · not SSOT/矩阵行翻转 · not CI 触发 · not nail · not live（本 turn）· not coordinator authorize（待 EXEC）· est 0 ≠ 已实测 · alone ≠ dual

---

*Slice · HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀 · 2026-10-07 · draft:awaiting_pre_exec_dual · docs-only · 四面齐套（C3/C3b/C4/probe 级）+ 负检 fail-closed · 四授权变量进程 env 协调方 EXEC 开闸 · 本地绿≠阶 C 绿≠生产 HA · 产物=本地证据包+矩阵建议 · Ban 买云/翻转/生产面/secrets · STOP*
