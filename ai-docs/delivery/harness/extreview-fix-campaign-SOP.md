# 外部评审修复战役 Task SOP（EXTREV · 2026-10-09 立项 · 协调方）

**基线**：外部评审 `/Users/miaole/Documents/Meetwise学习与审查/01-成品文档/issues-master.md`（184 条·P0×3/P1×21/P2×77/P3×83·评审基线 2fab7946 距主线仅 4 commit=现状有效）。
**协调方实树抽验（2026-10-09·主线 28db833f）**：#178/#40/#20/#133/#18/#106/#89 七条全属实（#178 冲突标记亲证+prove 复现；#40 零调用方 grep 亲证；#133 词典亲读）。
**纪律**：本战役全部刀走北星 loop 既有形制（REQUEST→预执行双审→EXEC→post-prove 双审→nail→回填主线）；一刀一双审；实现不自批；与本 loop 在飞刀的交叠面在每刀 REQUEST §非范围 显式钉死防双改。

## 批次与刀映射（优先级序）

### EXTREV-0（已完成 1/4）
| 刀 | 覆盖 | 状态 |
|---|---|---|
| HOTFIX-178 | #178 egress 清单冲突标记（我方 EGRESS-1 cherry-pick 事故）| ✅ 0f0799b7 dual-keep 合并+prove EXIT=0 7/7·post-dual 在飞 |
| DEPS-AUDIT | #106 critical×3/high×36 升级+CI audit 门 / #107 xmldom+解压守卫 | REQUEST 待起草（需联网 pnpm audit 实跑清单·Ban 顺带升级无关包） |
| ROUTE-DICT | #133 词典收紧（泛词去语言叶/上下文化）+样本回归集 / 连带 #146 begin 限流 | REQUEST 待起草 |

### EXTREV-1 评分卡主线（P0 产品洞·最大单刀）
| 刀 | 覆盖 | 依赖 |
|---|---|---|
| SCORE-WRITER | #40 worker 评估节点接 writeFinalScoreCard/adjudicateScoreCard（lease+CAS）/ #20 报告链 E2E 验证 / #50 报告节点结构化输入 / #103 旧新聚合器切换 / #52 rubric 评分路径 | — |
| SCORE-READ-V2 | #104 读面 v2（difficulty/question_kind/uncertainty） | SCORE-WRITER |
| LEVEL-SCHEME | #45/#102/#105/#124 级别判定五档+scheme_version+阈值集中 | SCORE-WRITER |

### EXTREV-2 CI 门禁（与既有 LINT/CI 刀合并收口）
| 刀 | 覆盖 | 交叠 |
|---|---|---|
| CI-WIRING（已在队列）| #96 typecheck 全包门 / #155 新 prove 纳 CI / #98 E2E nightly / #114 neg:* 纳 CI / #175 drift 恢复 | 与 TSCGATE-2 已 nail 面+LINT-DESIGN S0-S5 并线 |
| CI-HONESTY | #97 nightly 缺 key exit0 软化 / #113 恒真断言改名 / #159 model_first_token 假接线 / #99 测试三类标签 | — |

### EXTREV-3A 安全/隐私/鉴权（23 条·3 刀分组）
- AUTHZ-HARDEN：#110 注册审核制/#111+#131 邮箱归一/#35 令牌轮换/#112 登出/#33 时序/#34+#90 login 校验/#120 改密 TOCTOU/#180 login 限流
- CONSENT-AUDIT：#69 语音同意服务端落账/#81 撤回+policy_version/#82 purpose 枚举
- PRIVACY-FACE：#18 作答明文出 payload（R-34 形制）/#67 CSP/#83 导出面/#108/#109/#143/#126/#168 G7 开关生产拒绝

### EXTREV-3B 迁移/DB/权限（22 条·2 刀分组）
- MIG-RUNNER：#179 分事务模式+lock_timeout（#115/#134/#135/#145/#137 全依赖此）
- DB-CONSTRAINT：#3/#13 部分唯一索引/#15/#23 append-only 触发器/#16 CHECK+墙钟/#24 outbox 部分索引/#25/#136/#140/#141/#142/#150/#151/#152/#122

### EXTREV-3C 可靠性/运维/API（52 条·4 刀分组）
- OBS-LOG：#89 pino+requestId/#91 env schema fail-fast/#57 静默吞错/#68 前端上报/#92 readiness
- SSE-RESILIENCE：#53-56 重连/草稿/误降级/状态码分支/#58 看门狗/#127/#139/#184（与 TOKSTREAM S4d 面交叠——S4d 先行，本刀补 S4d 未覆盖面）
- QUEUE-BACKPRESSURE：#4 退避/#117 入队背压/#157/#158/#164/#181/#156 worker 收尾序
- API-HARDEN：#84 裸 @Body/#86 分页/#37/#87/#129 限流/#88 错误信封/#85/#118/#123/#31/#100 HMAC 三份/#72/#71

### EXTREV-4 AI 能力（24 条·2 刀分组）
- QBANK-CORPUS：#75 题库导入工具/#76 逐题 rubric/#77 难度 1-5/#79 检索扩展
- ADAPTIVE-CALIB：#38 阈值校准/#44 上下文传递/#51 会话摘要（与 TOKSTREAM S4 系正交·设计先刀）

### EXTREV-5 清理（37 条·按需批量收尾刀·最后）
#1/#2/#5/#8/#12/#19/#26/#27/#29/#30/#32/#49/#61/#121/#128/#130/#148/#149/#159/#160(文案)/#161/#165/#169/#182 等

## 执行规则
1. 每刀 REQUEST 必须显式引 issues-master 编号+file:line 并**亲读复核行号现状**（评审基线距主线 4 commit，行号可能漂±）。
2. P0/P1 刀优先；P3 并入同域刀的「顺手面」时须在该刀 §非范围 划清（禁顺手扩权——单刀可裁「不做」并留 backlog）。
3. 与在飞刀交叠：TOKSTREAM S4d（SSE 面）、LINT S0-S5+CI-WIRING（#96/#155）、NEGRESFIX（无交叠）——交叠面归先立项者，后刀 §非范围 引先刀 commit。
4. 评审中「推断/未实跑/未压测」条目：刀内 prove 必须先实测坐实再修（禁照单修未坐实项）。
5. pins 十一值照抄·Key name-only·Ban secrets/.env·est live 预算每刀自定。

**状态：EXTREV-0 第 1 刀已收口（HOTFIX-178）；DEPS-AUDIT/ROUTE-DICT/SCORE-WRITER 三 REQUEST 起草中（席位派发）。**
