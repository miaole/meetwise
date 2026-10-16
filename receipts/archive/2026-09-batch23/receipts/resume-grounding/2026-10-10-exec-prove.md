# RESUME-GROUNDING EXEC 收据（mw-resground-exec2 · 2026-10-10）

**蓝本**: rev3 `@0d75ffa8`（ai-docs/delivery/harness/resume-grounding-REQUEST.md · draft_rev3:pre_exec_dual_PASS_plus_consent_gate）· 工作树分支 `line/resume-grounding`（pull 后亲证 HEAD=origin tip=0d75ffa8e75f140e9595fdffe01338e03e2a46fc）

## §0 脏面盘点与处置（前任席 6 脏文件）

**判定：CONTINUE（续作），非 reset。** 6 脏文件 diff 逐行对照 rev3 §1/§3：C1（loadInterviewResumeGrounding 有界池+注释改写）、C4（resumeFacts deps 位）、C5（grounded 真模型/模板回退）、C6（refs 组合闸+独立 :gr 重试）、C7/C8（prompts v7/v2 版本纪律合规）、C9（cap 注释）、C10（#189-#191 判序/标题收紧/缺省小节）、C11（refsGroundedInFacts 组合闸+接线钉面）、C12（quiz validate 换闸）、C13 实质（lastFollowUp 闭包、禁新增图 state）全部与处方一致，P1-P7 条文零违背（:r{k} 键面/TOKSTREAM wrapper/groundedByFacts 语义/闸料-only 均守）。
**断点（续作范围）**：①adaptive-lifecycle.ts:254 引用已改名的 `hasResumeProfileFactsForInterview`（编译断）；②C2 两调用点未接线（:214 占位串、:216/:255 不传池）；③G1-G4 同意门零实现；④C13/C14 注释改写未做；⑤C16 proof/prove 槽全缺。前任遗留产物全部保留续用，未 reset、未重写已对齐面。

## §1 落位表（S1-S4 + G1-G4）

| 刀位 | 落点 | 状态 |
|---|---|---|
| S1-A1/C1 有界读取 | adaptive-lifecycle.ts `loadInterviewResumeGrounding`（同一 RLS+admit 门→buildResumeFactPool；onBeforeResumeProfileHydration 保留） | ✓ |
| S1-A2/C2 真传 planner | startAdaptiveInterviewImpl：pool→selectPlannerFacts（≤8×≤120，A-3 确定性排序）；submit 路径同门注入 | ✓ |
| S1-A3 相关性选择 | adaptive-interview-service.ts `relevanceScore/rankedFacts`（词元+CJK bigram，禁模型选，稳定排序=池序 experience>skills） | ✓ |
| S1-A4/S2-B4/C7/C8 版本面 | prompts.ts planner v1→v2、interviewer.ask v6→v7（grounded 条款+refs 原文子串+追问段）；model-client.ts:111 注释成真 | ✓ |
| S2-B1/C4/C5 grounded 真模型 | retrieveAndGenerate：selectGroundedFacts（2-4×≤200）进 vars；`_legacyFacts` 退役注记；无事实→既有模板逐字节回退 | ✓ |
| S2-B2/C6+#193 refs 闸 | businessValidate grounded 分支 `refsGroundedInFacts(v.refs, groundedFacts)`（委托 domain，禁重实现）；fact refs 仅闸料：sources 恒 []（knownRefs=[]） | ✓ |
| S2-B3/C6-B3 丢弃重试/回退 | MAX_GROUNDED_REFS_RETRY=2 独立计数 `:gr{k}` 键；耗尽回退既有模板文案（零改）+provenance 携带耗尽键（domain 可选参，向后兼容） | ✓ |
| S3/C13/C15 追问闭包 | lastFollowUp 在 buildAdaptiveDeps 闭包（strip 先/截取后顺序钉死；criteria-only）；**零新增图 state 字段** | ✓ |
| S4-#189/#190/#191/C10 | domain ingestResume：整行锚定标题白名单（教育先判）+内容短行保住+无标题缺省 experience+联系/姓名形态行排除 | ✓ |
| S4-#193/C11/C12 组合闸 | domain `refsGroundedInFacts`（委托本体）；quiz validate 接入；diagnosis/interview-service 零命中（grep 证） | ✓ |
| F/C9 注释面 | model-client.ts:111 注释与实装一致（零行为改）；C3/C13/C14 弃用注释群按 P1 条文改写（lifecycle/service/state.ts/generate-question.ts） | ✓ |
| G1 同意门 | worker 读门（loadInterviewResumeGrounding 内 `SELECT 1 FROM consent_record WHERE purpose='interview_personalization' LIMIT 1`，未同意/撤回→pool=[]→现状逐字节）；API 授予面复用 POST /privacy/consent purpose 参数 | ✓ |
| G2 查询位 | 同一 asPrincipal client、链进入点一次（start/submit 各一次），勿每 turn 查 | ✓ |
| G3 文案+最小 web 面 | resume/page.tsx 上传入口一次性用途勾选（默认不勾）+审计附录 C E 项原文「简历要点将发送给模型服务商用于出题」+用途状态/撤回控件；actions.ts 幂等授予/撤回 | ✓ |
| G4 撤回语义 | DELETE /privacy/consent?purpose=…（privacy.service.withdrawConsent）+迁移 0152 expand-only `GRANT DELETE ON consent_record TO app_role`（RLS owner 限只删己）；已落 checkpoint/事件不回溯（Non-claims） | ✓ |

触碰面：worker lifecycle/service、ai-graphs state+generate-question+resume-quiz、ai-runtime prompts+model-client（仅注释）、domain index+question-generation（可选参向后兼容）、api privacy module（G1-G4 最小读写面）、web resume consent 流（G3 最小版）、迁移 0152（rev3 授权 expand-only）、worker test（新 proof+consumer fixture 按 C16 更新）、worker package.json prove 槽、scripts/run-e2e-isolated.mjs（新 target 注册，additive）。apps/api interview.service（#195）零字节。

## §2 验收 5 条（CMD+EXIT 原值）

1. `node scripts/run-e2e-isolated.mjs resume-grounding:prove:raw` → **EXIT=0**（39 PASS/0 FAIL；receipt exitCode=0 outcome=passed）。①规划/grounded user 含事实（S2-1/S2-2）+refs 全过闸（S2-4/T3）+编造题丢弃重试回退（T1/T2）。
2. ②追问 user 含题目/作答摘要+不可信标记（S2-5）+200 字符帽（S2-6）+wire 同名 nonce 围栏（D2/D4）+数据本体零进 system（D3）。
3. ③注入样本摄取拦（C1）+评分剥（C2/S2-7）+全捕获零样本零 raw-only（S2-8/Z×5，失败只记 SHA/索引）。
4. ④基线绿：quiz/adaptive-life/adaptive-flow/adaptive-consumer(35/35)/diagnosis/adaptive-degrade/tokenstream(EXIT=0)/ocr/uc016/resume-derivative-reference(3/3)/adaptive-grounding/adaptive-latency 全 EXIT=0（最终字节）；tsc 平衡 worker 41=41、api 26=26、web 0；新增 proof 断言 CompletionRequest 对象字段分列；grep：refsGroundedInFacts 在 resume-diagnosis.ts/interview-service.ts 均 0 命中。
5. ⑤本收据+run-manifest.json 全 CMD/EXIT 原值；**不自批合入**，post-prove 双审交独立域（建议 rag/route+privacy）。

## §3 停止条件核查（五条）

1. **PII/原始全文零进提示词** ✓（四重过滤+掩码行滤+raw-only 差分 5/5；围栏/拦截/剥离零弱化）。
2. **零日志/零 dump** ✓（收据仅 SHA/长度/索引；prove 日志仅断言名+标量）。
3. **零越权顺手面** ✓（#195/rubric/隐私删除/结算/G7/re-roll `:r{k}`/TOKSTREAM wrapper 零触；迁移仅 rev3 授权 0152 expand-only GRANT；runner 仅 additive 注册）。
4. **est live=0 · 零 Key** ✓（scripted/capture+fetch mock；actualSpendCny=null；零 secrets 入库）。
5. **Ban self-approve / retry-to-green** —— 本 prove 共 8 次执行（7 红全因夹具/断言落点缺陷+2 处产品保形修正，逐次原因入 manifest attemptsLedger，无断言弱化换绿；ACCEPTANCE=最终字节首次执行 EXIT=0）；alone≠dual，nail 归 meetwise。

## §4 Non-claims（沿蓝图 §7）

本刀 ≠ 个性化完成 ≠ #45 改造 ≠ rubric 改造（仅消费 mind evidence/criteria）≠ 语义幻觉全解决 ≠ resume-quiz/diagnosis 链改造（仅 #193+#189-191 共享纯函数顺手修）。facts 不进图 state 纪律未破，弃用注释群已随实装改写（审查对照 C3/C13/C14）。公司名/项目名/年限不算 PII；准标识符组合再识别性留 Non-claims；注入正则五式未扩面。基线先在红（HEAD 平衡坐实）：interview:prove:raw(7F)、stress:prove:raw(6F)、context-stress:prove:raw(4F 未平衡跑，症状同族)——与本刀改动面零交集，不修（Ban 顺手扩权）。g7fix4-reroll 未接 CI/runner 本地不可执行（:r{k} 面零触有 T2 旁证）；quiz-diagnosis-dual-claim-pg 无 runner target（组成链各自绿）。

## §5 pins（十一值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼零消耗）

**STOP · 等待独立域 post-prove 双审 + meetwise nail。**
