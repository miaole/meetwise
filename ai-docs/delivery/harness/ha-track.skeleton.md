# Harness — Meetwise HA track（骨架 only）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 生产 HA** · **骨架绿 ≠ multi-instance 已证** · **骨架绿 ≠ fault-inject 已证**  
**状态**：skeleton landed · **prove path 未开** · **禁止勾 releaseEvidence=true** · **禁止叙事 production HA**

对照：`../north-star-ha.md` 证据阶梯 **C**（同 VPC 多实例 + 故障注入）/ **D**（`ha:probe` + CI + 独立审）。本 harness 只钉未来 prove 的命令、期望 EXIT 与收据清单；**不**宣称阶 C/D 已绿。

---

## 交付物（骨架）

| 路径 | 角色 |
|------|------|
| `ai-docs/delivery/harness/ha-track.skeleton.md` | 本 runbook（命令 / EXIT / 收据） |
| `scripts/ha/ha-track.skeleton.proof.mjs` | 静态骨架 prove：文件存在 + 诚实钉；**永不** claim HA |
| `scripts/ha/probe.skeleton.mjs` | 本地双实例探针骨架：无真实多实例证据则 **fail-closed / NOT_HA** |
| `scripts/ha/README.md` | 入口说明（Not HA） |
| `docker/compose.ha-dual.skeleton.yml` | 可选本地双 API 草稿；**非**生产拓扑 |
| root `package.json` | `ha-track:skeleton:prove` · `ha:probe:skeleton` |

---

## 硬禁

- 禁止把本 harness / skeleton EXIT=0 写成 **生产 HA** / **HA green** / `releaseEvidence=true`
- 禁止把单实例 `/livez` 或 compose config 绿冒充 multi-instance + fault-inject
- 禁止自批阶 C/D；须独立审 + 真实收据（见下）
- 可选 compose **不得**合入生产 `compose.prod.yml` 冒充多副本

---

## 未来 prove 路径（尚未执行 = 未绿）

### 阶 C — 多实例拓扑 + 故障注入（规划）

| 步骤 | 意图 | 未来 CMD（占位） | 期望 EXIT（未来） | 收据 |
|------|------|------------------|-------------------|------|
| C1 | 双 API（或 API×N）共享 DB/Redis 健康 | 骨架静校：`compose.ha-dual.skeleton.yml config`；**真 compose**：见 `ha-track.multi-instance.md` + `docker/compose.ha-dual.yml`（需 `MEETWISE_HA_DUAL_AUTHORIZED` + 镜像） | config 静校 **0** ≠ 拓扑绿；真 compose 本地 dual ≠ 生产 HA | compose 渲染 / 授权 bring-up 收据；**仍 Not HA** |
| C2 | 两实例同时 `/livez`（或 `/readyz/api`） | 未来：`curl`/`fetch` 对 `PORT_A`+`PORT_B` | 两端口皆 200 | `livez-A.json` · `livez-B.json` · instance ids |
| C3 | 共享态写入 A，读 B | **本地路径**：见 `ha-track.multi-instance.md`（`ha:prove:shared` / compose-shared）；Nest 业务 session **仍 GAP**（`ha:prove:nest-session` PREREQ） | 本地 Redis/MySQL 可读一致（≠ Nest session） | `shared-state-A-write.json` · `shared-state-B-read.json` · `nest-session.GAP.json` |
| C4 | **fault-inject**：杀 A（SIGKILL / compose stop） | 未来：`kill -9 $PID_A` 或 `compose stop api-a` | A 不可达；B 仍服务 | `kill-A.log` · `A-down.receipt` · `B-still-serving.receipt` |
| C5 | （可选）SSE / 队列租约在 B 续接 | 未来：Last-Event-ID / worker lease reclaim | 不丢关键终态 | `sse-or-lease-B.receipt`（缺则标 partial，**禁 HA**） |

**未齐 C2–C4 收据 → 阶 C = 未开；保持 NOT_HA。**

### 阶 D — `ha:probe` + CI + 独立审（规划）

| 步骤 | 意图 | 未来 CMD（占位） | 期望 EXIT（未来） | 收据 |
|------|------|------------------|-------------------|------|
| D1 | 自动化探针跑通 C2–C4 | 未来：`pnpm ha:probe`（**非**今日 `ha:probe:skeleton`） | **0** 且 receipt `result: PASS` **且** 仍强制 `releaseEvidence: false` 直至生产回执策略另批 | `===== RECEIPT ha:probe =====` 全文 |
| D2 | CI 可复现 | 未来 CI job 调同一探针 | job 绿 | CI run URL + artifact |
| D3 | ≥2 域独立审 | `reviews/YYYY-MM-DD-ha-track-*.md` | 审结论 pass 且无 conditional 阻塞 | 审查文件；**实现方禁止自审** |

**即便 D1 EXIT=0：本地/staging 双实例绿 ≠ 生产 HA。** 生产 HA 另需同 VPC 多实例拓扑回执 + 故障注入回执 + 协调批 `releaseEvidence`（今日一律 false）。

---

## 今日可跑（骨架 only）

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm ha-track:skeleton:prove` | **0** | 交付物存在；钉 `releaseEvidence=false` / Not HA / 禁 production HA；打印 `CMD=`/`EXIT=` |
| `pnpm ha:probe:skeleton` | **0**（默认骨架）或 **1**（`--require-evidence` 且无多实例证据） | 默认写出 `haStatus: NOT_HA` receipt；**永不** `releaseEvidence: true`；无真实双实例证据时不得 PASS 为 HA |
| `docker compose -f docker/compose.ha-dual.skeleton.yml config` | **0**（有 compose 插件时）或 skip | 仅 YAML 静校；**≠** 实例已起；**≠** HA |

等价：

```bash
node scripts/ha/ha-track.skeleton.proof.mjs
node scripts/ha/probe.skeleton.mjs
node scripts/ha/probe.skeleton.mjs --require-evidence   # 无证据 → EXIT=1 fail-closed
```

---

## 收据清单（未来 prove 齐套才可讨论升阶；今日全缺）

必填（缺任一 → **NOT_HA** · `releaseEvidence=false`）：

1. 双实例 identity（不同 pid / container id / 端口）同时健康  
2. 共享存储写入 A → 读 B 一致  
3. fault-inject：A down 后 B 仍服务的时间线日志  
4. 探针 RECEIPT 全文（含 `releaseEvidence: false` 直至另批）  
5. 独立审查落入 `ai-docs/delivery/reviews/`（≥1；宣称生产相关须 ≥2 域）

可选：SSE 续流、worker 租约回收、CI artifact URL。

---

## 成功标准（本骨架切片）

- [x] harness + skeleton prove + probe skeleton + optional compose 落盘  
- [x] 所有路径显式 `releaseEvidence=false` / Not HA  
- [ ] ~~阶 C/D prove 绿~~ → **未开**  
- [ ] ~~生产 HA~~ → **禁止宣称**

## 审查

结论落入 `ai-docs/delivery/reviews/`；合入权在协调/用户；**禁止自批 HA / releaseEvidence=true**。

---

## 后续轨（beyond skeleton）

多实例工具轨见 `ha-track.multi-instance.md`（`ha:dual:*` / `ha:dual:build-image` / `ha:probe:multi` / fault-inject stub · **C1 真** `compose.ha-dual.yml`）。  
该轨 **仍** `releaseEvidence=false` / Not HA；C3 shared 仍 GAP；本地授权 compose dual ≠ 生产 HA；**不得**把 stub/本地 compose 绿写成阶 C/D 已证。

