# 产品战役执行 SOP（9-agent loop · 2026-10-09 立项 · 协调方据用户指令起草）

**上游事实源（优先级序）**：① `/Users/miaole/Documents/Meetwise产品审计-更正版/`（271 条·含三轮复核/决策更新·D1-D7 已决·批次 0/1/2/3/4/5A-5E·硬依赖表·附录 A 级别方案·附录 C 简历个性化提示词）② 本仓 `extreview-fix-campaign-SOP.md`（EXTREV-7 三铁律凌驾：交付优先/隐私管流量不管存在/简化优先）③ 既有 loop 纪律（刀协议/双审/pins 十一值/冲突标记门）。
**代码基准对账**：审计基线 2fab7946 → 主线已前移至 7b042e46+；协调方抽验 #228（payment.ts:85 kind 写死 paid）/#250（billing/actions.ts 写死拒绝）/#40/#133 409 throw :300 四锚全中；PreviewErasureForm 路径漂移（实际位置待各刀亲读）。

## §A 对账表（审计条目 vs 主线现状·首批派单依据）

| 审计条目 | 主线现状 | 处置 |
|---|---|---|
| #178 CI 冲突标记 | **已修+nail** @0f0799b7（双审 BOTH PASS） | 关闭 |
| #106 依赖 critical×3 | **升级已落** @2acf92c3（critical 0·点名五包清零·待 post-dual 双审） | S1 收口+S2（CI audit 门）/S3（守卫）续作 |
| #40 评分卡五环零接线 | SCORE-WRITER rev2 @1181d959 双审 BOTH PASS（40a/40b/40c≈S1/S2/S3 切片已裁定：60/85 阈值映射·D5 形状冻结·D4 后置异事务）·S1 EXEC 被配额中断 | **续作**（蓝图已验） |
| #133+#195+#270 路由词典 | ROUTE-DICT rev2 @290a352b 双审 BOTH PASS **但 409 政策与审计冲突**（刀裁定「真歧义 409 冻结」vs 审计 D 决「歧义与 0 叶都降级默认路由不 409」） | **rev3 改政策**：审计胜——歧义/零叶命中→默认路由（backend/general），409 退役；样本集照审计验收（≥30 份 fixture·含反例） |
| #196 简历进模型 | RESUME-GROUNDING rev2 @9bbaf6a3 双审 BOTH PASS·EXEC 被配额中断 **但缺同意门**（审计 D7：purpose interview_personalization 同意才注入·未同意/撤回→回退模板·与现状逐字节一致断言） | **rev3 补同意门**（围栏/过滤/防编造闸等设计保留），EXEC 续作 |
| #247/#236 删除/注销 | UNSTUB-ERASE rev1 @213b9b56 席1 FAIL 六处方·席2 被配额中断 **且范围与审计 D6 冲突**（刀含 interview DELETE 接线 vs 审计「interview-data DELETE 维持关闭·只接账户级+简历」） | **rev2 重定范围**（吸收席1 六处方+D6 瘦身：账户+简历删除+注销=deactivate 发起账户级删除；interview DELETE 关闭；隐私页移除一场面试预览入口 #242） |
| #89 日志/#228 额度/#250/#251/#224 文案/#204 服务端评估/#229 报告重试(D2)/#241+#238 围栏回流 | 未开工 | **首批主攻**（批 0+批 1） |
| #204/#255/#215/#47/#50 证据与点评 | EVIDENCE-DELIVERY rev2 @a643fea1 双审 BOTH PASS·EXEC 待派 | 归 W2/W3 协同 |
| #96 lint 门 | LINT S0 已 nail（四包落地）·S1-S5 待续 | 归 W8 |
| #160 流式假进度 | TOKSTREAM S4a EXEC @be40ecec（post-dual 席1 PASS·席2 配额中断） | S4a 收口+S4b/c/d 续 |
| DIR-1 域文件夹化/NEGINPUT/G7 系 | 后台线（与产品审计正交） | W6 拾遗续作 |

## §B 9-agent 席位与领批（worktree=meetwise-line-<名>；每刀走完整协议）

| 席 | 领域 | 首批任务（按硬依赖序） |
|---|---|---|
| **W1 主路径** | 批 0 余项+批 1 旅程 | #89（pino+reqId）→#228+#29（trial 桶幂等·防刷）→#250/#251/#224（actionErrorMessage 四页）→ROUTE-DICT rev3 政策改→EXEC→#241+#238+#243（同 PR）→#53→#54→#55→#56 |
| **W2 评分卡** | #40 全链+报告 | SCORE-WRITER S1 续作（蓝图 1181d959）→S2（40c+去桩+#103 切换）→#20 验收 E2E→#204（服务端自动评估·新 job 类型）→#229（D2 重试·sweepReports+requeue+零扣费 proof） |
| **W3 AI 个性化** | 批 2 前半 | RESUME-GROUNDING rev3（同意门）→EXEC→#189/#190/#191/#193/#207/#208→#259+#266+#268+#199（目标岗位输入）→#44/#51（追问上下文）→阈值决议（批 2 首交付物） |
| **W4 B 端** | 批 3 | #110（审核/邀请制→企业账户主体）→#271（企业充值线上+对公+开票·扣费路由·迁移 0152+）→#218（定性输出）→#219→#220→#258→#197（JD 进 planner） |
| **W5 隐私合规** | 批 4（D6 最低集） | UNSTUB-ERASE rev2 重定范围→EXEC→#242（隐私页瘦身）→#236（deactivate→账户级删除）→#81（撤回+policy_version+四 purpose 白名单·迁移 0152+）→#69→#82→#83 |
| **W6 DB/迁移** | 批 5B+拾遗 | #179（runner lock_timeout/分事务模式·5B 总前置）→#115/#134/#135→DIR-1 B2e-B2s 续批→#140/#141/#142/#136/#137/#15/#23/#16/#25/#3/#13/#24/#122 |
| **W7 可靠性运维** | 批 5C | #91（env schema fail-fast）→#92→#157/#158→#36/#37（D9 待决先文档化）→#10→#116→#4/#5/#117→#156→#181→#164→#182/#138→#84/#86/#88/#123/#146/#31→UNSTUB-VOICE（P-01/P-03 部署配置+#69 同刀） |
| **W8 CI/测试** | 批 5D+DEPS S2/S3 | DEPS-AUDIT S2（audit CI 门独立 workflow+Renovate）+S3（#107 守卫四件）→LINT S1-S5→#98+#240（主链 E2E nightly·作批 1 验收工具与 W1/W2 并行）→#155/#114/#226→#113/#97/#99/#147/#159/#169/#177→NEGINPUT |
| **W9 审查机动+文档** | 批 5E+轮值双审 | ①轮值：任一刀的预执行/post-dual 双审第二席（作者≠审者·跨席互审）②#234/#235/#239 口径文档（三态标注·D6 四件）③5E 清单（#21/#22/#28/#94/#166/#170/#187…）④#262 分数口径命名（D3 未决前不删 #26） |

**协议（全席一致·沿用既有 loop）**：每刀 REQUEST（引审计编号+file:line 亲读·行号漂±登记）→预执行双审（两外席·FAIL 给逐字处方）→EXEC（停止条件五条·est live 预算）→post-dual 双审→nail→cherry-pick 回主线（**冲突标记 strict 门：push 前 grep '^<<<<<<< $|^=======$|^>>>>>>> ' 全仓=0**·已拦五起事故）→收据 receipts/<刀>/。pins 十一值照抄·Key name-only·Ban secrets/.env·Ban self-approve·alone≠dual·大刀先切片。
**迁移**：一律 0152 起编号·expand-only·带 lock_timeout（#179 runner 落地前在 SQL 内 SET LOCAL）。
**交叠规则**：同 file 两刀并行时后落者 rebase+§非范围引先刀 commit（SCORE-WRITER×EVIDENCE-DELIVERY 于 interview-report.ts 已有先例条款）。

## §C 配额门与恢复协议

- **现状**：子 agent 周配额 2026-10-09 耗尽，全部在飞 EXEC/审席中断（恢复时刻 **2026-10-14 14:55**）。中断面清单：SCORE-WRITER S1 EXEC（工作树 meetwise-line-scorewr·蓝图 1181d959）·RESUME-GROUNDING EXEC（meetwise-line-resground·9bbaf6a3）·DIR-1 B2e（meetwise-line-dirb2）·DEPS-AUDIT S1 post-dual 席1·S4a post-dual 席2·UNSTUB-ERASE 双审席2。
- **恢复序**：配额回→先收口中断面（六席按本表重派·蓝图已验者直接续 EXEC）→再按 §B 首派 W1#89/W2 续作/W4#110 起跑。
- **协调方（主会话）在配额窗内可做**：文档线（rev3/rev2 重定范围如上）·对账·台账——不派 EXEC。

## §D 验收快引（细节以 fix-roadmap 各批验收节为准·可证伪口径）

批 0：新注册 API 级拿到 1 trial（幂等断言）·四页 402/409/503 中文文案 proof·路由 fixture ≥30 份 undecided=0·40a 隔离库种子题 rubric+contract 行·audit critical=0。
批 1：种子题面试→每题 1 行 score_card（生成题 excluded）→report ready→三区块非空→/growth 出点·#229 六项（故障注入/零扣费断言/uc011 R2R3 原样）·#241 围栏后 create 返新面试。
批 2：同意门开关注入/关闭逐字节一致·facts 召回率阈值（决议前不作通过条件）·追问含弱点标签。
批 3：候选人零扣费完成岗位面试（企业桶断言）·对公转账双人确认+admin_audit。
批 4：默认 compose 下账户级+简历删除推进 completed·撤回后拒新用途·purpose 白名单 400。
批 5：requestId 可查堆栈·迁移锁等待≤lock_timeout·任一包类型错 CI 红。

**状态：本 SOP 为 9-agent loop 唯一执行依据；EXTREV 战役对账表由 §A 取代。协调方 2026-10-09 落卷。**
