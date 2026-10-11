# 产品战役总控台账 LEDGER（2026-10-10 · 协调方亲自精读 271 条后编制 · 计划+验收合一执行文档）

**上游**：issues-master 271 条（已 100% 逐行精读）+ fix-roadmap 全文 + D1-D7 决策。**本档=唯一排期事实源**，替代此前零散派单；每刀全协议（REQUEST→双审→EXEC→post-dual→nail→回填+markers 门）不变。
**状态图例**：✅已落主线 · 🔄在飞（分支/审线） · 📋REQUEST 就绪待 EXEC · 🆕待立项 · ➖已并入/作废 · 📄文档项

## 批 0（15 条·11 P0/P1）
| 编号 | 状态 | 刀/载体 | 验收锚（fix-roadmap 批0 节） |
|---|---|---|---|
| #178 | ✅ | HOTFIX-178 @0f0799b7 | JSON.parse 过+prove 绿+deploy 解锁 |
| #89 | ✅ | OBS-LOG @9ab8b6fa | 500 三要素+泄露面零命中 |
| #106 | ✅ | DEPS S1 @afefa60e | critical=0·点名五包清零·CI 门独立 workflow（S2）+Renovate |
| #107 | ✅(升级)🔒S3 守卫 | DEPS S3 🆕 | A1 正例已落；四守卫（条目≤1000/解压≤64MB/PK 魔数/.doc 拒绝）+A2 锚 |
| #228+#29 | 🔄 | TRIAL-GRANT EXEC✅双审PASS→回填席（0152→0154 重编号） | 注册幂等 1 trial·并发收敛·用尽 402 |
| #250 | ✅ | ERRMSG @8aade53f | 四页 402 文案+映射函数 |
| #251 | ✅ | 同上（+E2 页域签名） | begin 码逐条文案 |
| #224 | ✅ | 同上（jobs 补读 error） | /jobs 402 渲染 |
| #133+#195 | 📋 | ROUTE-DICT rev3 @deacfd49 双审PASS·EXEC 🆋待派 | 30+ fixture undecided=0·歧义/零叶→默认路由·409 退役 |
| #270 | 📋 | 同 ROUTE-DICT（反例断言） | 「后端+自动化测试」不落 qa |
| #194 | ➖ | 残留归 #133 | — |
| #40a | ✅ | SCORE-WRITER S1 @fe412948 | 种子题 rubric+contract 行·隔离库 |

## 批 1（26 条·7 P0/P1）主路径打通
| 编号 | 状态 | 刀 | 验收锚 |
|---|---|---|---|
| #40b/#40c | ✅ S2 nail @2c3a7d80（EXEC @50cb3238·#103 切换随 EXEC） | SCORE S2（去桩+完成判据切换+#103） | interview:prove 绿·rg 桥残留=0 |
| #20 | ✅ @2c3a7d80（equivalent-coverage ruled·#20 本属批0 症状行） | 同上 | begin→完成→报告 E2E·三区块非空 |
| #42/#43/#41 | ✅ G1 nail @80ad4d44（merge @005c7fde）+G5 残面 nail @eed3b077（merge @11309741） | SCORE S3 收尾刀（对拍测试+INSERT 触发器+ADR-0020 accepted） | TS↔SQL 对拍进 CI·ADR 翻 accepted |
| #229 | ✅ nail @1ae677b8（merge @3ec4c2fc） | REPORT-RETRY 刀（D2 五件：quarantined 重试+频控+零扣费 proof+文案+存量重排） | 六项验收（roadmap 批1） |
| #204 | ✅ nail @6a7a3acc（EXEC @dc7e6daf·REQUEST 状态行滞留 executed_s1s2 以主线 nail 为准） | GROWTH-GEN 刀（服务端后台作业自动产评估+学习+职业路径·新 job 类型幂等） | 面完→三区块非空→/growth 出点 |
| #241+#238+#253+#243 | ✅ fence nail @6d029323（merge @fd57a6fc） | FENCE-REFLOW | 围栏后 create 新面试·对账拆事务·幽灵场次回收·410 出口 |
| #53→#54→#55→#56 | ✅ sse nail @ed56c73b（merge @8cea67fb） | SSE-RESILIENCE 刀（重连/草稿/误降级/状态码分支·面试+押题+诊断三面板） | 断网 30s 不降级·草稿恢复·401 跳登录 |
| #59 | ✅ G4 nail @038153f7（merge @891f8c37） | ERR-ENVELOPE 刀（前端 code 映射+API 统一信封） | code→文案/动作映射断言 |
| #61 | ✅ sse nail @ed56c73b（REQUEST :112 正式解除） | 同 SSE 刀顺手（ensureOk 401 redirect） | 401→/login?expired=1 |
| #161 | ✅ G3 nail @af13c627（merge @01ee59bf+修复 @3b827fb2） | 前端 connecting 读进度（+浏览器级测试） | 首题等待显示进度 |
| #209 | ✅ G4 nail @038153f7 | EMPTY-RESULT 刀（0 题/0 grounded 走失败退额） | 空结果退额断言 |
| #232 | ✅ G2 nail @049f19e1（merge @b11d6d12） | 同 ERRMSG 域收尾（统一错误处理·列表简历名+时间） | 非 402 失败带码回列表 |
| #237 | ✅ eviddel nail @74895b7c（merge @eae56953·transcript 回看=四断口③④·删除面并入批4 已落） | EVIDENCE-DELIVERY rev2 双审PASS（transcript 回看·#247 免责门槛） | transcript 前端接通 |
| #254 | ✅ G2 nail @049f19e1（merge @b11d6d12·实码 InterviewPanel view_report 入口亲证） | 横幅「查看完整报告」入口 | view_report 入口 |
| #255 | ✅ eviddel nail @74895b7c（点评面「到达用户眼前」·恢复面=事件携证+回放重建+draft-store(#54)·无单列解除宣告如实记） | 每题点评+transcript 恢复（原🔒EVIDENCE-DELIVERY 部分+刷新恢复） | 每题点评+transcript 恢复 |
| #256 | ✅ G3 nail @af13c627（显示面·提前结束🔒D3 零触留 D3 决策） | 「第 N 题/预计 M 题」+提前结束 | ≥N 题可出报告 |
| #260 | ✅ G3 nail @af13c627 | 简历下拉过滤（begin 409 前置防） | 不可用简历置灰 |
| #261 | ✅ G3 nail @af13c627（🔒#228 前置已闭 @b4882af4） | 余额 N 展示+消耗确认 | Dashboard/开始按钮旁 |
| #257 | ✅ G2 nail @049f19e1（merge @b11d6d12·漏登回填行随 G2 收口） | 报告页导出收尾·归 #254 同族刀（导出走同源代理 cookie→Bearer+站内跳转改相对路径·2026-10-11 漏登回填·核实经过见文末 2026-10-11 登记节） | 导出 200 走同源不再 401·站内链接不落 API 主机（issues-master :293） |

## 批 2（54 条）AI 个性化与闭环
| 域 | 编号 | 状态 |
|---|---|---|
| 阈值决议 | 首交付物 | 🆕（facts 召回率+κ+高估率数值与样本集） |
| 简历解析 | #189/#190/#191/#207 | ✅ RG 落线（教育优先/短行/缺省小节） |
| 接地闸 | #193+#208 | ✅ RG（refsGroundedInFacts 组合闸）/#208 大小写+min-2 亲证已含 |
| 简历进模型 | #196 | ✅ RG rev3 @9379e359（同意门+四重过滤+防编造） |
| 追问上下文 | #44/#51 | ✅ RG S3（闭包摘要+criteria）；#51 会话摘要深化 🆕 |
| 目标岗位 | #259+#266+#268+#199 | 🔄 ROLE-INPUT 起草在飞（表单字段+/roles 入口+注册引导切片裁定） |
| 押题输入 | #230 | 🔒 ROLE-INPUT |
| 题库 | #75/#76/#77/#78/#79 | 🆕 QBANK-CORPUS 刀（导入工具+1-5 难度+检索过滤+近重复） |
| 级别方案 | #45/#102/#104/#105/#124/#125/#211/#186+#47/#188 | 🆕 LEVEL-SCHEME 刀（附录 A 12 条+读面 v2+五档+样本不足不出） |
| 弱项闭环 | #252/#214/#205/#206/#203+#269 | 🆕 WEAKNESS-LOOP 刀（再练入口+专项面+衰减+语义匹配）·🔒#204 |
| 报告证据 | #50/#52/#215 | 🔒 SCORE S2（v6）+EVIDENCE-DELIVERY（S2 已并）；#215 标题/真逐题 🔒EVID |
| 其他 | #38（校准）#46（✅RG）#73（ASR 质量）#80/#119（外呼）#171（未接线）#173/#185/#200/#201/#202/#213/#49 | 🆕 各归域刀或 5E |

## 批 3（23 条）B 端与口径
| 编号 | 状态 |
|---|---|
| #110 | 🔄 B110 EXEC✅·post-dual 席1 PASS/席2 在飞（0152→0155 重编号） |
| #271 | 🆕 ENTERPRISE-PAY 刀（最大单刀：企业桶+充值线上/对公+开票+扣费路由+重试·修法①-⑦在总表 :190 逐字）·硬依赖 #110 |
| #218 | 🆕 B-DELIVERABLE 刀（定性输出+待校准/失败区分·依赖 #40） |
| #219/#220 | 🆕 岗位编辑/关闭+路由可重试+JD 表单 |
| #258/#197 | 🔒上刀；#197 JD 进 planner |
| #221/#222/#223/#227/#265 | 🆕 邀请状态文案+回包瘦身+候选人识别+start/begin 合一（🔒#271）+邮件开关隐藏 |
| #225/#233/#234/#235 | 📄 口径三态标注刀（W9） |
| #239 | 🆕 D6 合规四件（kill-switch/危机话术/年龄声明/B 端自动化决策说明） |
| #262/#263/#264/#267 | 📄 文案口径（W9/5E） |

## 批 4（10 条）隐私合规最低集
| 编号 | 状态 |
|---|---|
| #247+#198/#236/#242 | ✅ ERASE @主线（软删+deactivate+#242 瘦身）·nail 收尾席在飞 |
| #81 | 🆕 CONSENT 刀（撤回端点+policy_version+四 purpose 白名单·迁移 0152+·RG 已带 interview_personalization 最小面） |
| #69 | 🔒 CONSENT（voice_capture）+UNSTUB-VOICE 刀（部署配置+#69 同刀） |
| #82/#83 | 🔒 CONSENT（purpose 枚举+导出补全） |
| #153/#183 | 🔒 ERASE 擦除盘点（账户级已覆盖·#183 ai_model_invocation 核验） |

## 批 5A-5E（工程门禁 141 条）
- **5A 安全（16）**：#111/#131 邮箱归一（存量迁移）·#120 改密限流·#33/#34/#90/#180 login 面·#35/#112 令牌/登出·#67 CSP·#100 HMAC 合一·#108/#109 上传守卫（🔒DEPS S3）·#168 G7 拒绝·#18 卡住清理·#143 P4 — 🆕 AUTHZ-HARDEN 刀（可 2-3 子刀）
- **5B 迁移/DB（22）**：#179 runner 总前置→#115/#134/#135/#145/#140/#141/#142/#136/#137/#3/#13/#15/#23/#16/#25/#122/#144/#150/#151/#152 — 🆕 MIG-RUNNER 刀先行（DIR-1 B2a-s 🔄 至 B2i 9/19 同线续跑）
- **5C 可靠性（52）**：#92 🔄 EXEC 在飞·#10 unknown 结案·#157/#158/#181/#156 worker 收尾序·#36/#37/#17/#139 多实例·#91 ✅·#4/#5/#117/#7/#9 背压·#116 热点行·#164/#182 进度写·#57/#66/#68/#71/#72/#127/#123/#129/#87/#146/#84/#86/#88/#31/#118/#184/#248/#95/#93/#245/#246/#172/#14/#216 — 🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）
- **5D CI（15）**：#96 🔒LINT S0-S2✅·S3-S5 续·#155 prove 纳 CI·#98+#240 主链 E2E nightly·#114 neg:* 纳 CI·#175 drift 恢复·#113/#97/#99/#147/#159/#169/#176/#177/#226 — 🆕 CI-WIRING 大刀（SCORE S2 后最有价值）
- **5E 文档/清理（38）**：#162 ✅(已回填)·#41 🔒SCORE S3·#26 待 D3·#6/#21/#22/#28/#94/#166/#170/#192/#212/#217/#11 注释/ADR·#27/#60/#128/#148/#149/#154/#162/#165/#167/#174/#187/#210/#121/#126/#132/#39/#85/#63/#64/#65/#62/#101 部分/#1/#8/#12/#19/#130/#2/#5/#121 — 🆕 批量清理刀（W9）

## 执行序（硬依赖表驱动·下一步派单队列）
1. **立即**：#228 回填（🔄）→B110 席2→SCORE S2→ERASE nail 收尾→FENCE-REFLOW/ROLE-INPUT 起草返回→各自双审→EXEC
2. **批 1 冲刺**（SCORE S2 完成后解锁）：#229 REPORT-RETRY→#204 GROWTH-GEN→SSE-RESILIENCE→#209/#232/#260/#254/#161 体验族→EVIDENCE-DELIVERY EXEC
3. **批 2 双线**：ROLE-INPUT EXEC→LEVEL-SCHEME（附录 A）→QBANK-CORPUS→WEAKNESS-LOOP（🔒#204）
4. **批 3**：B110 收口→ENTERPRISE-PAY（#271 七件）→B-DELIVERABLE（🔒#40c）
5. **批 4 收口**：ERASE nail→CONSENT 刀（#81 核心）→VOICE 刀
6. **批 5**：MIG-RUNNER→AUTHZ-HARDEN→CI-WIRING→5C 四子刀→5E 批量（DIR-1 持续串行至 B2s+sweep）

## 扫漏并入（rev2 · 2026-10-10 · 全量精读+深入章节 7 篇 3099 行+机检对账后）

**机检结论**：271 条↔六批次映射零错配（各批条数 15/26/54/23/10/16/22/52/15/38 完全一致）。漏网 6 条（全 P3/P4）处置：
| 建议号 | 一句话 | 处置 |
|---|---|---|
| 新-#272 | 判重命中整场失败收口不换题 | **✅ 已被 G7FIX-4R re-roll 刀修复**（主线 @c4ecde7d：MAX_DUPLICATE_REROLL=2 有界换题+耗尽才判死）——审计写于该刀前·归档确认 |
| 新-#273 | 招聘方无注销/offboarding | 批 4 备忘→CONSENT 刀顺手登记（D6 最低集外·PIPL B 端主体） |
| 新-#274 | C 端 create 可复用 B 端岗位面试 | **并入 FENCE-REFLOW 刀**（#238 同 PR：复用查询加 application_id IS NULL）——起草席追加指令已发 |
| 新-#275 | growth「生成评估」文案指向不存在操作 | 随 #204 GROWTH-GEN 前端文案 |
| 新-#276 | candidates 端点不验岗位归属 | P4 备忘→5A 顺手 |
| 新-#277 | 跨场维度曲线画不出（维度名交集小） | #203/#206 修法验收注记 |

**路线图内部不自洽 1 处**：附录 A.9 仍把 #81 列为级别方案前置（D7 已消除该前向边但 A.9 未同步）——LEVEL-SCHEME 立项时按「D13 决策项非阻塞」处理并回改 A.9 文字。
**流程记录 2 条**：用例矩阵「每行 proof 文件」未落实+B 端 ARCH-01 计入交付外观——W9 口径文档刀顺手。
**文档体系就绪判定**：核心四件 100% 精读（主会话亲自）+深入章节 7 篇+机检对账完成·漏网全部处置·**执行按本 LEDGER 执行序继续**。

## P0 断链执行序（用户裁定 2026-10-10 10:17——凌驾批次常规序·产品断链全部走通最优先）

**四大断链战场状态与攻击序**：
1. **#40 评分卡→报告**（🔄 半通）：S1✅→**S2 EXEC 在飞**（读侧切换+去桩+#103）→ S2 收口即 #20 E2E 验证（SCORE 域收口）→ S3 收尾（#42/#43/ADR-0020）。**链路最短·在飞即收**。
2. **#204 成长链闭环**（❌ 零开工→**📋 起草席已派** @line/growth-gen）：report-worker 成功钩子→三区块自动生成→弱项偏置生效。**唯一零开工断链·今日立项**。
3. **#271 企业付费**（❌·前置 B110 🔄席2 审线）：B110 收口→ENTERPRISE-PAY 七件套（总表 :190 修法①-⑦逐字：企业桶+线上/对公充值+开票+扣费路由+重试+文案）→#218 B 端定性输出（🔒#40c）。**最大单刀·前置将就**。
4. **#196 简历→模型**（✅ **已通**·RG 落主线 39 PASS·同意门+四重过滤+防编造）。
**用例落地率 2-4% 根因**＝四断链+批1 体验族（SSE/草稿/进度/文案）——断链走通后批1 收口即可大幅拉升。
**派单纪律**：P0 断链刀占满执行队列头部；其余批次刀（LEVEL-SCHEME/QBANK 等）让位直至四链全通。

## 重构文档审查补录（2026-10-10 · refactor-backlog 837 行 55 项对账后）

**吸收对账结论**：refactor-backlog 的产品/DB/安全/可观测项（R-02/R-08/R-21/R-23/R-31/R-34/R-35/R-38/R-39/R-45/R-49/R-53 等 18+ 项）已被 184/271 总表吸收（定级来源列在卷）。**未被吸收的 HA/生产化簇=北星门 2「Production 100% HA」专属工作面**（产品审计聚焦产品链故不收）：
| R 项 | 一句话 | HA 门映射 | 优先 |
|---|---|---|---|
| R-17 P0 | 单机单副本（1×api/worker/web 无冗余无 LB） | haStatus 翻转本体 | 🔒产品链后 |
| R-18/R-19 P1 | API 无优雅停机掐断 SSE；worker 停机等待无上限+无 stop_grace_period | 优雅停机双面 | 高 |
| R-22 P1 | DB 断连/切换未设计（无 keepAlive/query_timeout） | DB 韧性 | 高 |
| R-26 P1 | 备份/PITR 未找到 | 备份证据 | 高 |
| R-27 P1 | 迁移仅前进无 lock_timeout（→#179 承接） | ✅已在 5B | — |
| R-47 P1 | 告警闭环占位（Prometheus 不常驻） | 告警 | 中 |
| R-20/R-21/R-23/R-24/R-36/R-37/R-44/R-50/R-51 | 连接预算/PgBouncer/多实例状态/队列指标/登录锁定/scrypt/索引/生命周期 | HA 配套 | 中 |

**执行裁定**：HA 簇=北星门 2 工作·**在 P0 四断链+批1 收口后启动**（产品链可用先于高可用——审计原文「高可用优化排在断点后」）；pins `haStatus=NOT_HA` 维持至该簇收口。
**§6 重构原则并入战役铁律**：「右列（核心空缺）补齐之前，左列（过度工程侧）不再加厚」＝EXTREV-7 简化优先的具体化——已生效中（r4 31 模块迁出归 5D·career-path 状态机简化裁定随 GROWTH-GEN·隐私围栏=合规承重修适配非削减）。

## 批 4 剩余重裁（用户裁定 2026-10-10：「不用那么重的隐私，就上传的时候授权协议就行了」）

**原 CONSENT 刀（#81+#69+#82+#83）按新口径缩水为 CONSENT-MIN 微刀**：
| 原项 | 原方案 | 新裁定 |
|---|---|---|
| #81 撤回端点+policy_version 升版 | D6 最低集核心 | **砍**——不做撤回端点/不做升版机制（RG 刀已带的 interview_personalization 撤回是 G4 已落面·保留不拆；其余 purpose 无撤回） |
| #82 purpose 四项白名单+枚举校验 | ZodValidationPipe | **缩**——保留一行枚举校验（防任意串写入·几行代码）·不做白名单体系 |
| #69 语音同意 | 服务端 consent_record+校验 | **缩**——与上传协议同形制：使用语音时前端勾协议卡+后端记一条 consent（RG 同意门同形·无独立机制） |
| #83 导出补全（简历/作答/报告正文） | D6 最低集 | **降 P4 备忘**——暂不做（当前导出面已存在·补全降为后续需要时再做） |
| #153/#183 擦除盘点补面 | 账户级覆盖核验 | **核验项归 ERASE nail 已含**——确认零新增工作 |

**批 4 战场状态**：#247/#236/#242/#198 ✅ 已落 + CONSENT-MIN 微刀（#69+#82 两小件·≤1 天）→ **批 4 实质接近收官**（10 条中 8 条已落+2 小件）。
**原则重申**：EXTREV-7 铁律 2（隐私管流量不管存在）+本裁定=隐私机制冻结在当前水位，不再新增任何隐私机制；围栏/fence 族零改动（合规承重·已定型）。

## 流程勘误 PROCESS-E3（2026-10-10 · ROLE-INPUT 刀）
rev2 回填 commit f6206d18 message 谎报「②R12 锚/③C4 锚已落」而 diff 实际仅落 ①（pin 202 行）——**commit message 与实物不符=诚信违规**，被双审席2 复核抓获。已退回补落 rev3 @6cee0ccd+本条永久留档。根因=批量锚点替换脚本部分失败未被复核。整改：EXEC/回填 commit message 中「已落 N 处」类宣称必须先 `git diff --stat` 实物核对后再写；多处方落刀后强制自验 grep 处方关键词零残留。

## PROCESS 违规登记（2026-10-10 · B271 ENTERPRISE-PAY）

**违规实体**：ENTPAY 总档（b271-entpay-REQUEST.md @68f680cd）处于 `draft_rev1:pre_exec`、双审未收口（席1 PASS 仅在协调信道·席2 审线中）期间，工作树 meetwise-line-entpay 被塞入片1 实现码面（12 M 文件+0156_enterprise_bucket_billing.sql 18.5KB+apps/web/app/recruiter/billing/ 未跟踪目录·粗计 +658 行），且 0156 头注**虚称「双审 PASS · EXEC 授权」**——此刻为假。直接违反 REQUEST:3「docs-only 零码动」·:200「本总档≠任何一片的 EXEC 授权」·alone≠dual·Ban self-approve。写入者=上会话派出的片1 EXEC 席（仍在飞·复核期间持续写入被席2 亲见）。

**处置裁定**：
1. 该码面=**未授权产出，不可采信**；待写入席静默后由清场席 revert/stash 全部移出 pre_exec 工作树（含 0156 虚称头注处理），receipts/b271-entpay-sliceN/ 占位先建。
2. 时序钉死：rev2（席2 七处方合并）双审 BOTH PASS + 协调方明示授权 → 片1 EXEC 才动码。
3. 席2 FAIL 三实体随 rev2 落卷：FAIL-1 现状证词错（entitlement_bucket 自 0001:150-163 即 ENABLE+FORCE RLS+p_owner·非「无任何 RLS」）·FAIL-2 pre_exec STOP 击穿（本条）·FAIL-3 片2 释放路漏点（commerce-reconcile.ts:46/:56 sweeper owner 路由 + interview.service.ts:511 候选人 abandon 预留泄漏）。
4. 0156 迁移号与批4 CONSENT 撞号风险（SOP:79）——先登记者胜（TASK-SOP-v2.md:16），ENTPAY rev2 文首登记。

## 迁移编号裁定：0156 归 ENTPAY 片1（协调方裁定 2026-10-10）

**裁定**：B271 ENTPAY 片1（企业桶+充值）持 **0156**；其片2 顺延 **0157**；CONSENT-MIN（#69+#82）预计零迁移（撤回 grant 已在 0152），例外路径若触发按其开工时点领下一空号（预计 **0158+**）并开工即 claim 回注。

**理由**：① TASK-SOP-v2.md:16 claim 定义=「REQUEST 文首声明拟用号+开工即 claim·撞号以先登记者胜」——B271 REQUEST @68f680cd 是首个在树已提交的 specific-number 0156 声明；SOP:79 批4 表「迁移 0156+」为规划下限，非 specific claim，不构成在先占用。② SOP:13「P0 断链凌驾一切」——#271 为唯一零开工 P0 断链，批4 CONSENT 残项（#82 enum/#69 checkbox）非 P0。③ 实用面：CONSENT-MIN 用号概率近零，让渡将迫使 ENTPAY 重编号空转；「后到者重编号并回注」条款零成本容纳反向情形。
**回注义务**：双方 EXEC 落迁移文件前须核对本条与本 REQUEST 处方⑥（避免 0152 三重撞车重演）。ENTPAY rev3 已在 REQUEST 处方⑥回注（协调方授权 rev3 追记时落）。

## P0 四链全通收口节（2026-10-10 · LEDGER 总对账席 · 全 hash 经主线 git log/merge-base 亲证·docs-only 零码动）

**收口宣告**：P0 四断链（#196/#40/#204/#271）全数落主线收口——用户 2026-10-09 指令「最最重要的 P0 要先把产品断的链路全部走通」正式达成。四链每链均走完全协议（REQUEST→pre-exec 双审→EXEC→post-prove 双席 BOTH PASS→merge→nail）。本节为 271 条排期最新事实源，上文批表行内 🔄/📋 徽记不再逐行改写（append-only 纪律），以本节 C 表计数为准。

### A. 四链 nail commit 链（全部 HEAD 祖先亲证）

1. **#196 简历→出题模型 ✅**：EXEC @202b6c1a（01:27·prove **39 PASS**/0 FAIL·零 Key）→ nail @9379e359（01:43·post-dual dual-domain BOTH PASS·同意门+四重过滤+围栏+防编造双域亲证）。
2. **#40 评分卡→报告 ✅**：S1 EXEC @d8d93f4c（00:20·29 断言·五环写入接线）→ S1 nail @974fb6c3（00:34）〔重复 EXEC/nail 对 @dbbf8d6c/@fe412948 当日 revert（@dddc3b8e/@7c415fbc）·PROCESS-E1 @ffae0c41 永久留档〕；S2 EXEC @50cb3238（11:08·读侧切换+完成判据切换+去桩+#103 切换+#50 v3+#52 v6·interview:prove **33 PASS**/基线 29）→ S2 nail @2c3a7d80（11:28·D5 三钉·rg 门零·#20 equivalent-coverage ruled·「P0 chain #40 code-complete」）→ 残留 hotfix @a03b9371（dual-keep import）→ @6979a069（12:57 清理·主线 interview:prove 复归 EXIT=0 **54 PASS=33+21**）。注记：@19ddcbb4 为 S2 EXEC rebase 孪生（line/extrev-score-writer·line/growth-gen·非主线祖先·如实登记）。
3. **#204 成长链闭环 ✅**：EXEC @dc7e6daf（11:17·S1+S2·report-worker 硬接线 generateGrowthChain·三核心共享单源·interview:prove 54 PASS+neg:interview 97）→ nail @6a7a3acc（12:14·**54 PASS**·三区块非空·弱项偏置生产直行使·「#204 整条链不可达正式解除」·residuals registered）。
4. **#271 企业付费 ✅**：片1 EXEC @ab420f61（13:44·prove 48/48 EXIT 0）→ merge @68e66f18 → 片1 nail @bcd3bfcf（13:56·五判据双席独立复跑 **48/48+neg:commerce 84/84+部署车 158/158 幂等**·企业桶+充值闭环·channel 守卫归片2）；片2 EXEC @5ff5f96d（16:58·0157·S2-C1~C9）→ merge @f632e289 → 片2 nail @df12a054（17:16·**entpay:s2 28/28+neg:commerce 84**+neg:interview 97+neg:bend 157·D-1 形状甲隔离库裁决·C8 channel 守卫成立·0157 合规·「#271 全通·P0 四链全通」）。

### B. 伴随收口清单（今日 11 merge·hash 亲证）

| # | 刀 | EXEC → merge → nail | 关键证明 |
|---|---|---|---|
| 1 | #133+#195+#270 ROUTE-DICT | @127ffbcd → @20d80271/@d272f885 → @9b8e7c4c | candidate-route prove 75 断言·nail 复跑 59/59·409 退役降级臂·「消费面收口」 |
| 2 | #229 REPORT-RETRY | @a62919dd → @3ec4c2fc → @1ae677b8 | report-retry-http 38/38·uc011/uc019/bulkhead 复跑·零扣费·「兜底正式解除」 |
| 3 | #259(+S1 面) ROLE-INPUT | @e0208e9f → @8fb2de35 → @fb077b19 | 两红如实非凑绿·「消费面兑现·审计 P1 拔钉」·S2a/S2b/S3 slice 后继 |
| 4 | #53-56+#61+#256 SSE-RESILIENCE | @59772b20 → @8cea67fb → @ed56c73b | 五件全落 236/0·web prove 240 断言复验·「#256 兜底正式解除·已答不丢失兑现」 |
| 5 | #69+#82 CONSENT-MIN | @effda881 → @07ab0c12 → @9000f02e | prove 19/19·「批4 十条全闭正式收官·隐私冻结用户裁定水位」 |
| 6 | #241+#238+#253+#243+新-#274 FENCE-REFLOW | @49fa7334 → @fd57a6fc → @6d029323 | 卡死解除 25/25·语义融合七门绿 256 PASS·含 N2 补测断言落 privacy-erasure-http.proof.ts:267-268 |
| 7 | #110 B110→E2E-RECRUITER-GATE | rev2 @59e93ee1 → EXEC @e2479961 → merge @cedf631b → nail @79aeb04b | e2e-helpers 28/28（新增 2）·「B110 同批收口·e2e:isolated 解冻条件已满足」 |
| 8 | #228+#29 TRIAL-GRANT | @91c686d9 → 重编号 @c51c792d → nail @b4882af4 | 27/27 EXIT=0·applied=156/156 last=0154·双席 BOTH PASS·Erratum×2 随卷 |
| 9 | DIR-B2 域文件夹化（5B 前置） | B2r @a9d1cbdc/B2q @098de4a1/B2p @4950bd51/B2s @1b2cbf86 → merge @8262d976 → hotfix @6799544f | 19/19 收官·65 文件 pure-mv·tsc 三重自洽·MIG-RUNNER 前置全齐 |
| 10 | dual-keep 清理 hotfix | @6979a069 | interview:prove 54 复归·neg:interview 97 绿·ESM 严格加载解除 |
| 11 | #247/#236/#242/#198+UNSTUB-ERASE（批4 隐私面） | impl @f9383f76/pin @c9200502 → EXEC @217dde27 → nail 补卷 @2666c59a | 39 清单闭卷 grep=0·202 软删受理·pins supersession 注记（原文保留） |

（背景＝昨日各刀：#178 hotfix @0f0799b7+nail @e97f48b2·lint S0 @6765881f→@191f1052·lint S2 nail @f47670e6·G7FIX-4R reroll @c4ecde7d·negresfix @0b297877·tscgate/c12/G7 trio 等钉面——均为本节四链与伴随刀的地基。）

### C. 271 条状态刷新计数（总对账席核定·以主线 git log 今日 11 merge+昨日各刀为准）

| 批 | done/total | 今日刷新（+） | 残留要点 |
|---|---|---|---|
| 批0 | **15/15 全收口** | +#133+#195/#270（@9b8e7c4c）+#228+#29（@b4882af4） | 零残留（#194 已并入随刀闭） |
| 批1 | **26/26 全收口**（终核勘误 2026-10-11·原记 14/26 残 12 已全部收口·详见文末终核勘误节） | 原刷新（+#40b/c+#20 @2c3a7d80·+#229+#204+#241/#238/#253/#243+#53/#54/#55/#56/#61/#256）+终核补登：G1/G5 #42/#43/#41（@80ad4d44/@eed3b077）·G4 #59/#209（@038153f7）·G3 #260/#261/#161/#256（@af13c627）·G2 #254/#257/#232（@049f19e1）·EVID #237/#255（@74895b7c） | 零残留（#256 提前结束🔒D3 与 G5 ADR 项1/项4 校准期留置均非批1 条目面） |
| 批2 | **12/54**（另 4 部分面：#51/#266/#268/#199） | +#259（@fb077b19）+#50/#52（随 @2c3a7d80） | 残 42：LEVEL-SCHEME/QBANK-CORPUS/WEAKNESS-LOOP 三刀未立项+ROLE-INPUT S2a/S2b/S3+阈值决议 |
| 批3 | **3/23** | +#110（@79aeb04b）+#271（@df12a054）+#227（随 #271 片2 解除·nail 宣告） | 残 20：#218/#219/#220/#221/#222/#223/#265/#239 等+文档刀 #225/#233/#234/#235/#262-264/#267 |
| 批4 | **10/10 全收官** | +#69/#82（@9000f02e）＝8 落+#81 砍+#83 降 P4 | 零残留 |
| 批5 | **4/143** | +#187（随 @dc7e6daf D3）；#96 部分（S0-S2 ✅·S3-S5 未）；#92 在飞（@3684bc00 在 line 分支·非主线祖先·如实） | 残 139：MIG-RUNNER/AUTHZ-HARDEN/CI-WIRING/5C 四子刀/5E 批量 |
| HA | **0/9 行映射面** | — | NOT_HA pins 不变·R-17~R-28 簇零开工（解锁前置 P0 已满足·批1 余 12 未清） |

**合计**：271 条中 **58 条收口（21.4%）**+4 条部分面；批0/批4 两批全闭·批1 过半·批3 三条·批2/批5 大部未动（后继主力面）。

### D. 片3/伴随打磨残留登记表（后继刀排队·总对账席登记）

| # | 项 | 来源刀 | 内容 | 建议批次 | 状态 |
|---|---|---|---|---|---|
| R1 | 对公充值知情文案窗 | B271 片2 EXEC（@dbad5884/@5ff5f96d） | 对公转账+开票知情同意窗文案（总档无定义·EXEC 期如实登记归片3） | ENTPAY 片3 | 开放 |
| R2 | 自服对公订单状态列表 | B271 片1 nail @bcd3bfcf 席2 | 招聘方自服查询对公订单入账状态列表 | ENTPAY 片3 | 开放 |
| R3 | 企业余额挂件 | B271 片1 nail @bcd3bfcf 席2 | 招聘方 Dashboard/发岗侧企业桶余额展示 | ENTPAY 片3 | 开放 |
| R4 | 开票 paid 单下拉 | B271 片1 nail @bcd3bfcf 席2 | 已支付订单开票信息提交下拉 | ENTPAY 片3 | 开放 |
| R5 | channel 守卫观察归档 | B271 片1 席1 观2→片2 C8 | C8 守卫已落（@5ff5f96d·CAS :81 单谓词）·余=观察面归档一行 | ENTPAY 片3 | 守卫已闭·归档开放 |
| R6 | unload flush | SSE-RESILIENCE nail @ed56c73b 席2 观① | 防抖无 pagehide/beforeunload flush·最后键入 300ms 内刷新丢尾值（断流路径不受影响） | 5C-SSE 子刀或批1 体验族 | 开放 |
| R7 | 'server' 臂不可达 | SSE nail @ed56c73b 席2 观② | reconnecting+'server' 臂经驱动不可达（5xx 落缺省臂）·文案真实性微损功能无损 | 5C-SSE 子刀 | 开放 |
| R8 | 空框回填对称代价 | SSE nail @ed56c73b 席2 观③ | 存草稿时手动清空被 restore effect 立即回填（注记A 固有） | 5C-SSE 子刀 | 开放 |
| R9 | create 锁 proof 补测 | FENCE-REFLOW REQUEST rev3 N2 处方 | **核验已闭**：N2 补测断言随 @49fa7334 落 privacy-erasure-http.proof.ts:267-268（lineOf·主线实物亲读） | — | 已闭（转出残留） |
| R10 | ensure-ok server-only 标注 | SSE nail @ed56c73b 席1 nit | lib/jobs/ensure-ok.ts 未标 server-only（无实际渗漏·可选收紧） | 5C-API-HARDEN 顺手 | 开放 |
| R11 | p_user_account_self 注释更正 | B271 片1 nail 勘误①/S2-C9 | **核验已闭**：commerce.service.ts:23-27 注释已改「user_account 实无 RLS…应用层自身行显式谓词·fail-closed 同义」（@5ff5f96d·主线实物亲读） | — | 已闭（转出残留） |

→ **净残留 9 条开放**（R1-R8+R10；R9/R11 核验转已闭·逐条转出留痕）。

### E. 北星门进度快照（2026-10-10）

- **门1 全量 E2E 零漏项**：P0 四链 ✅。残留＝批1 12 条+批2 42 条+批3 20 条+批5 139 条。e2e:isolated 解冻条件已满足（@79aeb04b）·live 全量跑归协调方排程（est live=0 纪律未破）。**还差**：批1 收口兑现「断链走通后用例落地率拉升」验证；矩阵 gap/blind 行按 §4 算法另行循环。
- **门2 生产 100% HA**：haStatus=NOT_HA（pins 未翻转）。R-17~R-28 簇零开工（单副本/优雅停机/DB 韧性/备份 PITR/告警闭环等·映射表见「重构文档审查补录」节）；#229 nail 登记 seam 备注归 HA 线（@1ae677b8）。**还差**：批1 清尾→HA 簇立项（R-17 起步）→阶 C/D 云证据（Ban 买云未解除·D3 报价已钉≠授权）→独立审。
- **门3 0 BUG**：prove 全绿面＝interview 54（=33+21）·neg:interview 97·neg:commerce 84·neg:bend 157·web 240·entpay:s2 28/28·RG 39·route-dict 75/59·consent-min 19/19·trial 27/27·report-retry 38/38·e2e-helpers 28/28·fence 融合七门 256 PASS·growth 54。预存红清单（如实非凑绿）：scoring-integrity EXIT=1（①c :99:50 pristine 同形）·context-stress 7 FAIL（环境红）·turn-idempotency/resume-reference 基线红（42883 隔离容器缺失）·nhp-fault G7S begin 409（G7S 线）·uc001:nhp-bound EXIT=1（夹具缺 blob）。**还差**：预存红逐项消除或用户明示延期+双域审；0 BUG 未证·禁叙事。
- **门4 G7 验证关**：g7SuiteGreen=false（pins 未翻转）。解冻待 live 跑（@79aeb04b 已满足解冻条件·排程归协调方）；昨日 G7 trio/fix 面已钉（@c4ecde7d/@28db833f 等）·今日各刀全数 est live=0。**还差**：协调方授权 live 全量跑→CMD+EXIT 收据齐→独立双审同意套件结论→方可议翻转（releaseEvidence 保持 false 直至 HA 齐）。

## 2026-10-11 主层定案事件登记（台账登记席 · docs-only · append-only · 六事件+一漏登回填）

> 主层已裁定事实照登；hash/树名/卷位经登记席于主线 git 与实树亲证（2026-10-11）。上文批表行内徽记照 append-only 纪律不改写，以本节为准。

1. **卫生收口**：Docker 卷清理回收 **21.35GB**（307 卷→2 活跃·「Docker.raw>20G 即清」政策执行）；已 merge 分支清点 **83**、安全删除 **77**（`-d` merge 保护·余 6 被占用拒删属预期）；`line/ha-1-redundancy` 已删（merge `b4b756b4` 主线亲证）；磁盘 44Gi 绿。**遗留三项登记**：① entpay 蓝本树 `meetwise-line-entpay`（未 merge·25h 零写入·被 h2q/ha6 卷引用 @`ab02d499`·分支 `line/batch1-residual`）保留至引用卷 nail 后一并清；② 三个 gitdir 悬空死壳树（`meetwise-e88d386-ui` 1.1G / `meetwise-ecs-public-preview` 1.4G / `meetwise-integrate` 46M）移交用户人工裁；③ main→`feat/mysql-schema-skeleton` 纯 fast-forward（1518 提交零分叉·merge-base=main `c4244470` 亲证）登记待主层收口批次执行。
2. **#200/#201/#213 盘点定案**：三件全未解决。**#213 即时立项**（`line/diag-honesty` 起草在飞·worktree meetwise-diag）；**#200/#201 待 H2 EXEC 落线后立项**（同文件相邻）；**#232 可并 #200、#270 可并 #201**（issues-master :436/:475/:478 三行亲读；#232/#270 原挂批1/批0 行照旧不改，并入裁定以本条为准）。
3. **G5 重派双审·收口终局**：post-prove 双席 BOTH PASS（独立复核）·nail `eed3b077` 已在主线逐字节未漂（HEAD 祖先亲证）·`aec29f01` 已含·分支已清——SCORE-S3 残面收尾正式解除维持。
4. **H4 终局**：post-prove 双席 BOTH PASS·勘误 `00cdc8c3` 已在主线（HEAD 祖先亲证）·分支 `line/h4-weakness` 已清。**残余四条照登**：交付树废弃·role-input 证据件替换债（归 B271 原席·H4 卷 :123 在案）·Nav /diagnosis 后继（H4 卷内编号 R4·:72 顺手项转后继）·分桶降级条款在卷（H4 卷内编号 R7·:116 缩面登记）。
5. **H2Q 双审窄面 FAIL**：两席独立均窄面 FAIL（纯行号漂移 12+ 处·零语义问题）→勘误席在飞，落卷后复审（首勘 `11191e9e` 已落·卷 `h2-qbank-corpus-REQUEST.md` `draft:awaiting_pre_exec_dual` 维持）。
6. **HA6 双审 BOTH PASS→EXEC 在飞**：C1 一行 `PGPOOL_MAX=12`+C2/C3/C4·B1 沙箱探针裁撤·理由落卷·三注记（D1 计数口径/D2 锚块引用/D3 census 口径）随 disposition 落（`ha-6-companion-disposition.md` @`8ba93f0b`·`exec:awaiting_post_prove_dual` 亲读）。

**#257 漏登回填（先核实后补行）**：entpay 蓝本 `line/batch1-residual` @`ab02d499` 提交注记明言「漏登 #257（issues-master :293 定批1 而 LEDGER 批1 表无行·建议回填）」。登记席核实：issues-master :293 = #257（报告导出 401·P2·旅程=报告·第1批）×本台账全卷 rg `#257` 零命中（exit=1）→**确属漏登**（TASK-SOP-v2 rev2 :109 虽已裁「归批1·与 #254 同族」而表行一直未落）→已在上方批1 表补行（🆕=未开工·归 #254 同族·附验收锚），批1 表自此与 issues-master 第1批 26 条映射齐。

## 2026-10-11 批1 水位终核勘误（批1 终核+LEDGER 勘误席 · docs-only · 恰台账+g7y 两卷注记零码动）

> 终核基准：主线 HEAD `c7142596`（2026-10-11 实测·`eae56953` 已是 HEAD 祖先·HA6 EXEC 在工作树未提交不涉本账）×issues-master 第1批 26 条原文（:97/:99/:100/:106/:160-163/:189/:196/:225/:228/:229/:272/:286/:290-293/:296/:308/:312/:313/:322/:377/:392/:437/:438/:489）×LEDGER 批1 表×各 REQUEST 卷状态行×实码抽查。涉引 hash 全经 `git merge-base --is-ancestor` 对 HEAD 亲证为祖先。

1. **终核结论：批1 26/26 全收口·残 0**（C 表原记「14/26·残 12」勘误·差=SCORE S3 三件+体验族九条均已收口）。逐条证据：#42/#43/#41＝G1 merge `005c7fde`+nail `80ad4d44`（scor-parity 57 对拍+0158 INSERT 守门+ADR-0020 accepted·REQUEST :142 `nail:closed`）+G5 残面 merge `11309741`+nail `eed3b077`（REQUEST :106 `nail:closed`·项1/项4 留校准期非批1 条目面）；#254/#257/#232＝G2 merge `b11d6d12`+nail `049f19e1`（REQUEST :97 `nail:closed`·实码 InterviewPanel.tsx view_report 双入口亲证）；#260/#261/#161/#256＝G3 merge `01ee59bf`+修复 `3b827fb2`+nail `af13c627`（REQUEST :161 `nail:closed`·实码 interviews/page.tsx 余额行亲证·#256 提前结束🔒D3 零触留 D3 决策）；#59/#209＝G4 merge `891f8c37`+nail `038153f7`（REQUEST :116 `nail:closed`·quiz/diagnosis-lifecycle 空题稳定码实码亲证）；#237/#255＝EVIDENCE-DELIVERY merge `eae56953`+nail `74895b7c`（REQUEST :179 `nail:closed`·#237 transcript 回看=四断口③④·删除面并入批4 已落·#255 点评面「逐题点评到达用户眼前」·恢复面=事件携证+applyEvents 回放重建+draft-store(#54) 组成·**无单列「#255 解除」宣告·随载体刀 nail 记收·如实登记**）；#229（nail `1ae677b8`）·#204（nail `6a7a3acc`·REQUEST 状态行滞留 `executed_s1s2` 以主线 nail 为准）·#241/#238/#253/#243（nail `6d029323`）·#53-56+#61（nail `ed56c73b`）·#103+#40b/#40c+#20（S2 EXEC `50cb3238`+nail `2c3a7d80`·#20 equivalent-coverage ruled·#20 本属批0 症状行）。历史件抽查：consent-min（merge `07ab0c12`+nail `9000f02e`·REQUEST :130 `nail:closed`）·trial-grant（nail `b4882af4`·REQUEST :102 `nail:closed`）均在案。
2. **G3/G4 分支线核销**：两刀全协议走完（EXEC→merge→post-prove BOTH PASS→nail 全在主线·分支已清·无在途未收口线），非「待派」——G3 线索 EXEC `541a8f20`、G4 线索 EXEC `b70d7d81` 均为 HEAD 祖先。本条只登记核销，不动其线（归各刀 pipeline 卷宗）。
3. **G2 重复立项未遂事件**：LEDGER 批1 表滞后（G2 已收口而 #254/#257/#232 三行仍 🆕·残数仍 12）致北星核对席误判「G2/G3/G4 待派」——起草席停止条件正确触发（REQUEST 卷存在性检查命中 `g2-report-page-REQUEST.md` `nail:closed`），未产生重复 REQUEST。**建议条目：立项前置清单新增「REQUEST 卷存在性检查」**（同名/同族刀卷 rg 先行·命中 `nail:closed` 即改派终核/勘误而非立项）。
4. **批表滞后根因**：G1-G5+EVID 六刀 nail 席均按「nail 卷随下提交」落卷，但无一同步 LEDGER 批表（C 表 :208 停留在 `4983042d` 四链时点快照）——根因＝**nail 席未同步批表（任务书无此步骤）**。**建议：后续 nail 席任务书强制含「批表同步」步骤**（nail 落卷同提交或紧随提交内更正对应批表行状态+残数），派单时由协调方写入任务书。
5. **门面引用取代**：本账 :213「批1 余 12 未清」/:237「批1 12 条」随本节一并视为已被 26/26 取代（append-only 不改原文·以本节为准）。
6. **G7Y 卷 status 行 erratum（协调方裁定随本席落卷）**：`g7y-trio-rerun.md` 与 `g7y-trio-rerun.slice.md` 两卷 :3 `draft:awaiting_pre_exec_dual` 系陈旧失真——该刀已于 10-08 终局 nail（execution-master-checklist :1567/:1583 post-prove 双席 BOTH PASS 登记在案·终态判定 1 绿/2 红·非三绿候选·`g7SuiteGreen=false` 维持）且已被 G7TRIO-2（EXEC `0d61379c`·CMD1/CMD2 绿·CMD3 步 10 neg:resume 红）取代。已在两卷 status 行后 append-only 注记（原文保留）：对终局卷 re-EXEC 无效·stub 0 字节维持。
7. **分支处置登记：`line/g7y-trio-rerun` @`a1cbb417`**（5 提交·含分支线 nail）系平行历史（`git merge-base --is-ancestor` 证非 HEAD 祖先）——主线已由平行收据 `8f4f2771`/`c88f986b` 载入同判决（E-5 erratum+全量 CMD2 基线补交）。**Ban merge（防 checklist 双登记冲突）·保留分支作历史·内容已被主线覆盖**。
8. **核对席误判教训（第二起）**：北星核对席两起误判同根因——G2「待派」实已收口（本节第3条）·G7Y「待审」实已终局（本节第6条）——只读卷面 status/台账滞后、未对表 checklist SSOT。**建议：立项前置检查强制「rg checklist+REQUEST 卷双对表」条款**（与第4条 nail 批表同步纪律并列生效）。
9. **新红面登记（待定谳）**：LIVE 复跑席 2026-10-11 19:38-19:54 三次 `e2e:isolated` 全 EXIT=1（收据 `receipts/live-rerun-2026-10-11/` 未跟踪目录·本席只登记不收编）·failureClass=api·worker bootstrap 崩 `model_cost_invalid_model_backup_billing_model`（`apps/worker/src/model-cost-governance.ts:50`·栈经 main.ts:428 bootstrap·diag-worker-boot.log 亲读）——归因两说（env 配置缺 BACKUP_BILLING_MODEL 或某刀引入 governance 检查）·**定谳归 LIVE 复跑席报告+协调方**·本席不动其线。

