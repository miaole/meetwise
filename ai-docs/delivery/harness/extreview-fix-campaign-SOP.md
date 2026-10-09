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
| ROUTE-DICT | #133 词典收紧（泛词去语言叶/上下文化）+样本回归集（#146 归 EXTREV-3C API-HARDEN·roadmap:30） | REQUEST 待起草 |

### EXTREV-1 评分卡主线（P0 产品洞·最大单刀）
| 刀 | 覆盖 | 依赖 |
|---|---|---|
| SCORE-WRITER | #40 worker 评估节点接 writeFinalScoreCard/adjudicateScoreCard（lease+CAS）/ #20 报告链 E2E 验证 / #50 报告节点结构化输入 / #103 旧新聚合器切换 / #52 rubric 评分路径 / 收尾 #41-#43/#47（roadmap:45-47 第1批尾部） | — |
| SCORE-READ-V2 | #104 读面 v2（difficulty/question_kind/uncertainty） | SCORE-WRITER |
| LEVEL-SCHEME | #45/#102/#105/#124/#125 级别判定五档+scheme_version+阈值集中 | SCORE-WRITER |

### EXTREV-2 CI 门禁（与既有 LINT/CI 刀合并收口）
| 刀 | 覆盖 | 交叠 |
|---|---|---|
| CI-WIRING（已在队列）| #96 typecheck 全包门 / #155 新 prove 纳 CI / #98 E2E nightly / #114 neg:* 纳 CI / #175 drift 恢复 | 与 TSCGATE-2 已 nail 面+LINT-DESIGN S0-S5 并线 |
| CI-HONESTY | #97 nightly 缺 key exit0 软化 / #113 恒真断言改名 / #159 model_first_token 假接线 / #99 测试三类标签 / #147/#176/#177（余 CI 面） | — |

### EXTREV-3A 安全/隐私/鉴权（总表 23 条·本节列 23·成员经 Rx 修订补齐 #100 移位/#153/#183）
- AUTHZ-HARDEN：#110 注册审核制/#111+#131 邮箱归一/#35 令牌轮换/#112 登出/#33 时序/#34+#90 login 校验/#120 改密 TOCTOU/#180 login 限流
- CONSENT-AUDIT：#69 语音同意服务端落账/#81 撤回+policy_version/#82 purpose 枚举
- PRIVACY-FACE：#18 作答明文出 payload（R-34 形制）/#67 CSP/#83 导出面/#108/#109/#143/#126/#168 G7 开关生产拒绝/#183/#153 擦除缺口（roadmap:84）

### EXTREV-3B 迁移/DB/权限（总表 22 条·本节列 22·Rx 补 #144）
- MIG-RUNNER：#179 分事务模式+lock_timeout（#115/#134/#135/#145/#137 全依赖此）
- DB-CONSTRAINT：#3/#13 部分唯一索引/#15/#23 append-only 触发器/#16 CHECK+墙钟/#24 outbox 部分索引/#25/#136/#140/#141/#142/#144/#150/#151/#152/#122

### EXTREV-3C 可靠性/运维/API（总表 52 条·本节列主要成员·余见文末 backlog 清单）
- OBS-LOG：#89 pino+requestId/#91 env schema fail-fast/#57 静默吞错/#68 前端上报/#92 readiness
- SSE-RESILIENCE：#53-56 重连/草稿/误降级/状态码分支/#58 看门狗/#127/#139/#184（与 TOKSTREAM S4d 面交叠——S4d 先行，本刀补 S4d 未覆盖面）
- QUEUE-BACKPRESSURE：#4 退避/#117 入队背压/#157/#158/#164/#181/#156 worker 收尾序/#10 unknown 预算冻结处置（P1）
- API-HARDEN：#84 裸 @Body/#86 分页/#37/#87/#129/#146 begin 限流/#88 错误信封/#85/#118/#123/#31/#100 HMAC 三份/#72/#71

### EXTREV-4 AI 能力（总表 24 条·本节列主要成员·余见 backlog）
- QBANK-CORPUS：#75 题库导入工具/#76 逐题 rubric/#77 难度 1-5/#79 检索扩展
- ADAPTIVE-CALIB：#38 阈值校准/#44 上下文传递/#51 会话摘要（与 TOKSTREAM S4 系正交·设计先刀）

### EXTREV-5 清理（总表 37 条·按需批量收尾刀·最后·余见 backlog）
#1/#2/#5/#8/#12/#19/#26/#27/#29/#30/#32/#49/#61/#121/#128/#130/#148/#149/#160(文案)/#161/#165/#169/#182 等（#159 已归 EXTREV-2）

## 执行规则
1. 每刀 REQUEST 必须显式引 issues-master 编号+file:line 并**亲读复核行号现状**（评审基线距主线 4 commit，行号可能漂±）。
2. P0/P1 刀优先；P3 并入同域刀的「顺手面」时须在该刀 §非范围 划清（禁顺手扩权——单刀可裁「不做」并留 backlog）。
3. 与在飞刀交叠：TOKSTREAM S4d（SSE 面）、CI-WIRING（#96/#155 typecheck/prove-CI 面）、LINT S0-S5（lint 面·CI 接线另刀·锚 checklist:2096·设计本体已回填主线 @756508a0）、NEGRESFIX（无交叠）——交叠面归先立项者，后刀 §非范围 引先刀 commit。
4. 评审中「推断/未实跑/未压测」条目：刀内 prove 必须先实测坐实再修（禁照单修未坐实项）。
5. pins 十一值照抄·Key name-only·Ban secrets/.env·est live 预算每刀自定。

**状态：EXTREV-0 第 1 刀已收口（HOTFIX-178）；DEPS-AUDIT/ROUTE-DICT/SCORE-WRITER 三 REQUEST 起草中（席位派发）。**

## 修订记录与 backlog（rev2 · 交叉验证席处方逐字执行）

**rev1→rev2 修订**：①#146 移出 ROUTE-DICT 归 API-HARDEN（roadmap:30）；②DB-CONSTRAINT 补 #144；③PRIVACY-FACE 补 #183/#153；④EXTREV-5 删重复 #159；⑤规则 3 归属改 CI-WIRING（#96/#155）+LINT 面注记；⑥#10/#125/#41-43/#47/#147/#176/#177 各归刀；⑦批次头改「总表 N/本节 M」口径。
**陈旧登记**：tscgate2-fixbatches.md:3 状态头仍 exec:awaiting_post_prove_dual，与 checklist:2052 NAIL 记录不一致（文档陈旧非 SOP 之错，防误读）。
**未覆盖 backlog（44 条·P3 为主·按需立项）**：#6 #11 #14 #21 #22 #28 #39 #46 #60 #62 #63 #64 #65 #70 #73 #74 #78 #80 #93 #94 #101 #119 #132 #147(已归) #154 #162 #163 #166 #167 #170 #171 #172 #173 #174 #183(已归) 等——以 issues-master.md 总表为完整清单，本 SOP 不再复制全量；立项时按域归入对应批次刀。
（P2 未覆盖 10 条待归：#7 #9 #17 #36 #42 #59 #66 #95 #116 #138——随对应域刀立项时收编：#7/#9/#163 归 EXTREV-1 图租约面、#17 归 SSE-RESILIENCE、#36 归 AUTHZ-HARDEN、#42 归 SCORE-READ-V2、#59 归 SSE-RESILIENCE、#66 归 API-HARDEN、#95 归 OBS-LOG、#116 归 QUEUE-BACKPRESSURE、#138 归 DB-CONSTRAINT。）

## EXTREV-6 UNSTUB 全功能交付战役（用户指令 2026-10-09：「不要总说暂不可用，这次必须全部可用」）

**指令定性**：产品级硬要求——所有用户可见的「暂不可用/暂未开放/migration in progress」桩必须变为真实可用功能。诚实披露式的 503 桩是过渡态不是终态；「迁移中」话术与真实状态（无迁移在进行）不符即设计偏移。

**已知桩清单（协调方快扫 @5636d58d·以 UNSTUB 盘点刀实测定全量）**：
| 桩 | 位置 | 可用化路径 |
|---|---|---|
| TTS 语音播报 | interview-voice.ts:33/:49 恒 503 | DashScope TTS 绑定+流式返回+前端播放 |
| ASR 语音转写 | interview-voice.ts:78（配置缺失时 503） | ASR 能力门真实化（#69 同刀：服务端 consent 落账） |
| 简历单份删除 | resume.service.ts:278-280 `never` 503 | 擦除链 cutover 完成后翻真实删除+回执 |
| 全量简历数据删除 | privacy.service.ts:65-67 `never` 503 | 同上（跨存储 sweep：PG+向量+memory） |
| 面试数据擦除 | privacy.service.ts:53-56 `never` 503 | 同上+授权面（0058 fence 族已在库） |
| 账户注销 | settings/page.tsx:89-95 disabled | 级联擦除设计→实现→可用 |
| begin 路由未就绪 | applications.service.ts:49 | ROUTE-DICT 刀（#133/#195）已覆盖 |
| 跨存储删除回执 | faq/resume 页披露未开放 | 擦除链 cutover 附带（回执=PRIV 链收尾） |

**执行纪律**：①每桩一刀或并刀，全走 REQUEST→双审→EXEC→post-dual；②**禁止假可用**——删除类桩必须在跨存储擦除真实完成+回执可证后才翻，提前翻=隐私谎言（比诚实 503 更糟）；③TTS/ASR 类接 provider 真实现+fake seam 测试+真实能力 prove；④「暂不可用」文案随之退役，UI 与 API 同步；⑤与 PRIV01/PRIV4/PRIV01WIRE/PRIV04B 已 nail 面对账（哪些已建只差 cutover）。
**首批刀**：UNSTUB-INV 盘点刀（全量桩清单+每桩可用化差距+依赖链定谳）→ UNSTUB-ERASE（删除三桩 cutover）→ UNSTUB-VOICE（TTS/ASR 真实现）→ UNSTUB-ACCOUNT（注销）。

## EXTREV-7 交付优先与简化优先铁律（用户裁定 2026-10-09：「过度设计导致系统复杂性和排查复杂性，连基本功能都实现不了，本末倒置」）

**三条铁律（凌驾于所有批次之上·与既有刀冲突时以此为准）**：
1. **交付优先**：产品功能可用 > 机器完美。删除类一律**软删先行**（deleted_at+查询过滤+立即停止处理与访问=对用户即真实可用），物理清除走已建 PRIV 链**异步**补完+回执——UNSTUB-ERASE 按此重定义，「假可用禁令」由「软删语义如实」满足。
2. **隐私管流量不管存在**：围栏/脱敏/注入拦截管「什么数据进提示词」（脱敏事实可进·原文/PII 永不进），不得成为「数据不流动」的理由（RESUME-GROUNDING 蓝本已是此模型）；新 fence/触发器/层必须附产品功能级正当性，无则不建。
3. **简化优先**：触到过度设计机器的刀优先**删/缩而非加**。SIMPLIFY 批次候选（待审计坐实）：tenant 第二层死校验（#148）/比例结算死代码（#26）/gift-trial 死桶（#29）/interview active 死分支（#27）/worker src 33 个不可达 r4-* 模块迁出（#169）/HMAC 验签三份合一（#100）/tf_* 函数 PUBLIC 授权收敛（#150）/NEGINPUT 型 fence 依赖迁移链的测试解耦/**每新增一层抽象须先删一层旧抽象**。
