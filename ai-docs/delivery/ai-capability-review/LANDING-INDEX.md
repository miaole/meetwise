# AI 能力交叉复核 · 落地 INDEX（协调方 landing 卷）

> 本目录=外部复核定稿的**仓内落地副本**。权威蓝本=文稿 `Meetwise-AI能力对标/final/`（2026-10-12 定稿·基线 commit `2fab7946`）。落地 2026-10-12（主线 tip `86e11d7d`）。落地动作=verbatim 拷贝四件+本 INDEX；唯一形式调整见文末账。

## 一、文件清单

| 文件 | 内容 |
|---|---|
| `README.md` | 定稿总纲（一句话结论/统计/Top10/成熟 agent 对比/修复优先序/局限/**B-C 端记忆使用边界设计决策（末尾补遗）**） |
| `issues-final.md` / `issues-final.csv` | 统一问题清单 AG-01~AG-38（38 条：P1×7/P2×9/P3×22）+18 组总表引用（md/csv 同源·文档自检对账零差异·本次 csv 39 行=表头+38 复核吻合） |
| `review-log.md` | 77 条原始结论逐条复核（13 否定/部分否定·18 定级调整·外部核对·补盲记录·自检记录） |
| `LANDING-INDEX.md` | 本文件（落地溯源+验证状态+现状差异+修复刀队列） |

## 二、落地前双席深验证定谳（互盲·两席独立·结论全收敛）

- **七条 P1：六条仍完全成立（AG-01/03/04/05/06/07）+AG-02 部分缓解·文档零条有误**。关键锚在基线后 377 commit 上 0-2 行内全中；涉案 migration（0085/0088/0119/0120/0130/0131/0134）零字节漂移。
- **AG-02 缓解面**：撞题子面已被 `62747d74`（g7fix4-reroll·有界换题上限 2·每 roll 换键+businessRevision `:r{k}`）修复；grounded-refs 子面已被 `202b6c1a`（resume-grounding S2-B3·`:gr{k}` 有界重试+模板回退）修复——**恰为定稿修法①的形状·键+revision 双换已被生产证真**。残留面=schema 失败/critique 不过/供应商 unknown/评分失败四类单发终场+attempt≠0 禁令。
- **外部事实**：LangGraph 1.4.7 compile 签名（dist/graph/state.js:432）不收 recursionLimit——仓内实存包亲证；cached_tokens/prompt_cache_hit_tokens 全仓零读取（#48 未接线现状维持）。
- **修复序可行性三陈述全部验证通过**（换键+revision 双换/invoke(null) 断点续跑=一等签名/consumer 错误分类 requeue·带保留：`next_attempt_at` 列存在但 interview 侧零使用·退避依赖 #4）。

## 三、现状差异（引用行系基线 2fab7946 时点事实·落地时点已演进——**修复立项前必读**）

| 引用 | 基线表述 | 现状（tip 86e11d7d） |
|---|---|---|
| 总表 #40 | ScoreCard 无写入方·报告恒失败 P0 | **已被 score-writer S1/S2（dbbf8d6c/50cb3238/afb13fcf）实质接线**（main.ts loadSummary 改读 ScoreCard） |
| 总表 #44 | 出题模型看不到上一轮作答 | **已被 resume-grounding S3/C13/C15 部分接通**（lastFollowUp 进 interviewer.ask） |
| AG-02 撞题/引文两子面 | 单发终场 | 已修（见上） |
| 弱项投影隐私 | 无围栏 | unstub-erase S1（f9383f76）已补 interview_privacy_active 谓词·账户级删除后零泄漏有 prove；**但 B/C 端用途拦截仍零** |

## 四、修复刀队列（协调方挂账·全协议 REQUEST→双审→EXEC→post-prove→nail）

1. **AG-RESUME 失败语义簇**（最优先）：AG-01（准入拒绝释放 claim/可重试化）+AG-03（报告键带 attempt·上限 3）+AG-04（consumer 瞬时错误分类 requeue+退避+attempts 上限）+AG-05（alreadyApplied 时 invoke(null) 续跑）+AG-06（HTTP 200+usage→确定性 failed 结算·不计熔断）+AG-02 残留四类（有界重试同双换形状）+AG-15 卡死检测+AG-16 确定性 proof。刀边界以专家评审意见书为准（在途）。
2. **AG-07 对账改造**：水位线增量+PK 去 batch+因子全局聚合；回灌落地前先降频或关停（完全未动·线性增长·建议优先排期）。
3. 上下文供给组（#44 残面/#196/避重清单）——**scope 受 B/C 记忆边界约束**（README 末尾设计决策段）：B 端评估链路硬禁跨场记忆·用途标签 c_practice/b_assessment·b_assessment 对跨场长期记忆固定返回空。
4. 成本侧（AG-08/11/12/14+#48 观测）。

## 五、非 claims 铁律（沿仓内 pins 十一值）

本目录为**读码复核结论**（高可信·非 100% 无误·未运行复现）；不构成 releaseEvidence·不翻 g7SuiteGreen·「修复完成」须以刀协议 prove 收据为准。haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · r1Closed=false。

## 六、落地形式调整账（B-lite 七族谱 F-A/F-C 先例·语义零变）

| 处 | 原 | 落地形 |
|---|---|---|
| issues-final.md:3 | `/workspace/ua-snapshots/meetwise-latest`（复核方本机快照径） | `<外部只读快照>/meetwise-latest`（描述引用·commit `2fab7946` 钉值保留） |

其余三件零调整（verbatim）。docs:check 落地后 EXIT=0 复验见 commit。


## 七、增量同步 2026-10-12（第二批：题库分层设计决策+AG-39~43）

- 用户 2026-10-12 新增：README「设计决策：题库分层与私有优先」节（三类题库 platform/org/session_generated·场景强制检索规则·C 端练习禁企业私有题+禁本人练习记录入 B 端出题·来源可审计 platform/org:{id}/session_generated·库内 SECURITY DEFINER 强制过滤+私有优先排序·关联 #110/#271）+issues-final 新增 5 条（**单路探索·未交叉复核**·源=qbank-acl 探索卷）。
- **现总数 43 条：P1×9 / P2×10 / P3×24**（AG-39/40=P1·AG-41=P2·AG-42/43=P3）。
- AG-39~43 摘要：39=无私有题库/私有优先（产品层·修法=owner_kind+org_id+库内强制）·40=C 端练习用不上题库（begin 写 candidate_profile_route_snapshot vs 检索读 interview_route_snapshot→route_snapshot_missing 降级·修法=双写或回退读）·41=0146 退役代释放函数以 app.principal_user GUC 鉴权且 GRANT app_role（违反 0066:90/0067:36 鉴权边界·failed 代缺 epoch 守卫·修法=收回 EXECUTE+definer 断言）·42=双空 GUC 跨赛道检索·43=审核人静默记 __system_qbank__+释放函数无调度。
- 处置：五条**待交叉验证**（单路来源）——验证席已派·P1 两条（39/40）与 41（安全面）优先；刀映射待验证后并入刀计划（40 或入检索/上下文轨·41 或独立安全小刀·39 系大型产品改造挂用户排期）。
- 形式调整账增补：README 与 issues-final 各 1 处外部探索卷径符号化（F-A/F-C 形·条目号/行锚钉值保留）。

## 八、增量同步 2026-10-12（第三批：工具使用边界+AG-38 调级）

- README 新增「设计决策：工具（function calling）使用边界」（设计建议·非代码现状）：混合式形态——**评估侧**（面试出题与评分）固定流水线不接工具·系统按规则检索喂入；**问答侧**（C 端成长顾问+B 端追问报告）接**只读受限工具循环**。六条安全约束：只读禁写副作用/按用途限权（C 端仅本人数据·B 端仅本企业该场·B 端工具硬禁查 C 端练习数据）/权限检查在工具实现内强制/循环有界（轮数+token 上限·复用 runToolLoop 既有机制）/走现有幂等计费账本/工具结果按数据处理防注入（复用数据边界围栏）。
- **AG-38 由 P3 调 P2**：现总数 **43 条=P1×9 / P2×11 / P3×23**（本批机器复核计数吻合）。AG-38 修法全文更新为混合式·工具循环定义位=ai-runtime 的 tools 模块第 44 行（有界循环·失败轨迹可回灌）·生产零调用方核实与既有双席验证一致。
- 刀映射：AG-38 属「问答侧能力建设」（成长顾问/B 端追问报告落地时的阻塞缺口）挂用户产品排期·与上下文供给组同域不同刀·评估侧零改动。
- 形式调整账：本批无新增（沿用前两批符号化形制）。


## 九、增量同步+审计补遗（2026-10-12 深夜·qbank-acl 落地+源卷清册）

- **qbank-acl.md 落地**（AG-39~43 源探索卷·60 行·第二批时未随 final 四件同步——当时该文件尚未入 final/ 目录）·verbatim+符号化同前形。
- **审计发现（协调方全文精读）**：qbank-acl P1-P7 → AG 映射中 **P5 被丢**（遗留 GUC 策略 qbank_is_curator/principal_user 挂表·现 app_role 无表权限故不生效·**未来任何 re-GRANT 即变伪造读写面**·推断级低危）——未获 AG 编号·登记为**P5 缺号项**·归 AG-41 同族 qbank 控制面安全小刀顺手清理或明示豁免。
- **源卷清册**（父目录·77 条之源·被 final 交叉复核取代）：agent-capability-benchmark.md（AI-01~07 源·42KB）/langgraph-deep-review.md（LG-01~23 源·32KB）/issues.csv/langgraph-issues.csv——**源卷忠实性审计席已派**（对照 review-log 77 行映射逐条核 final 表述无失真·重点 13 否定项）。
- 计费 README.v1.md（按题型定分·被最终版明示取代）——审计席顺带核「v1 独有内容是否全被最终版吸收」。


## 十、源卷忠实性审计定谳（审计席·2026-10-12 深夜）

- **总判：final 对两源报告（AI 7+LG 23）忠实度高**——77 行映射零漏登零失真·可审计 4 否定项 3 公允 1 轻微（AI-07 否定理由引文系改写非源文原句·最终 AG-38 文本无曲解）·计费 v1 无方案级漏吸收。
- **不可达登记**：explore/lg-runtime、product-fit、ai-cost-context 三源不在本机——LR/PF/AC 46 行+9 否定项不可本地审计（review-log 已逐行映射·以 final 交叉复核为权威）。
- **轻微发现清单（后续刀顺手项）**：F1 行业常识推断句未入 77 行（final 未依赖·无害）·F2 AI-05 RAG 三模块死代码子点未入 AG-20 枚举·F3 LG-10 子点③ hashtext 32 位碰撞被 AG-29 归并时丢·F4 LG-21 proof 缺口三项（终态复活/unlock/暂停>1800s）未入 AG-16·**F5 AG-40 与总表 #202 同病未交叉关联（重复计数风险·qbank 安全小刀时对表）**·F7 LG-06 归并 #186 引用表未带·F8=AI-07 措辞·计费 F10-F13（押题/诊断/OCR 现状计费点证据·GET /billing/balance+余额展示·outbox 报表 payload·明细冲销/单场最低消费被新方案消解）——归 billing rev 卷吸收。


## 十一、AG-39~43 交叉验证定谳（验证席·tip 270a863c 亲证）

- **四条成立**：AG-39（无私有题库·产品层缺口·现状描述与设计决策节逐点吻合）/AG-41（安全面全部核实——0146 系复活 0029 旧 GUC 模式的漏网新函数·failed 代无 epoch 守卫·asPrincipal 本身即自设 GUC 通道·修法模板=0066:162-165 同族手术先例）/AG-42（机制成立·生产当前不可达=纵深防御缺口·放行面实为 **5 函数**非 1）/AG-43（两子句成立·「无调度」系设计内 Ban 非疏漏——修法须显式解除 0146 Ban）。
- **AG-40 对现 tip 不成立**：已被 634eb645 §1⑥（H2 #202·2026-10-11）修复——begin 双轨写+检索 fallback 双层同切+0163 FK 使能·沿链推演 C 端检索命中出库题。**改判「不成立（现状）·历史成立（探索基线）」入现状差异账**（与 #40/#44 同型）·从刀队列移除·残余=0142 前存量回填（可选不阻刀）。恰证「未交叉复核」标记必要性（单路基线滞后主线一天）。
- **刀映射定谳**：①新独立安全小刀「qbank 控制面鉴权收口」（SQL-only）收 AG-41 全部+AG-43 调度半（显式解除 Ban）+AG-42（5 函数删双空放行）+**P5 缺号项顺手**（遗留 GUC 策略清理）②AG-43 审核人半=单行顺手项③AG-39=大型产品刀挂用户排期④AG-40 移除。
- **附带**：AG-37 pin 漂移（:257-273→~:340）机制仍成立·同批修 pin。F5（AG-40×#202 交叉关联）随本定谳自然闭环。
