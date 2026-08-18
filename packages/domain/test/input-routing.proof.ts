/** 面试输入分流 + 超长作答策略（CTX-01）证明（纯域，确定性，无 DB、无模型）。 pnpm prove:ctx-01-input-routing */
import {
  INTERVIEW_ANSWER_MAX_LENGTH, INPUT_ROUTE_KINDS, OVERLONG_POLICY_KINDS, SEGMENT_POLICIES,
  isInterviewQuestionIdentity, routeInterviewOrFreeConversation, resolveOverlongAnswerPolicy,
  computeDeterministicTotal, scoreSpanDigest, reverifyScoreEvidenceSpan, canonicalScoreSpan, utf8ByteLength,
} from '../src/index.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const throws = (fn: () => unknown) => { try { fn(); return false; } catch { return true; } };

/* ── A. 显式 enum（禁布尔汤）+ 单一上限常量 ─────────────────────────────── */
A('分流结果 enum = interview_route / free_conversation_route（非布尔位）',
  INPUT_ROUTE_KINDS.length === 2 && INPUT_ROUTE_KINDS[0] === 'interview_route' && INPUT_ROUTE_KINDS[1] === 'free_conversation_route');
A('超长策略 enum = reject-only（无 segment：分段会改写作答、有污染评分证据风险，fail-closed 只 reject）',
  OVERLONG_POLICY_KINDS.length === 1 && OVERLONG_POLICY_KINDS[0] === 'reject');
A('segment 策略 enum = 仅 none（本模块不产出分段形态；头部截断只在 model 侧 capUserData，且非证据源）',
  SEGMENT_POLICIES.length === 1 && SEGMENT_POLICIES[0] === 'none');
A('面试作答上限 = 8000 字（与 contracts ANSWER_MAX 对齐）', INTERVIEW_ANSWER_MAX_LENGTH === 8000);

/* ── B. 输入分流：面试 vs 自由对话 ──────────────────────────────────────── */
const validIdentity = {
  questionId: 'q-v1-t0-c0', stateVersion: 1,
  answerHash: 'a'.repeat(64), turn: 0,
};
A('完整服务端问题身份绑定 → interview_route',
  routeInterviewOrFreeConversation(validIdentity).route === 'interview_route');
A('完整身份绑定 → isInterviewQuestionIdentity=true（fail-closed 类型谓词）',
  isInterviewQuestionIdentity(validIdentity) === true);
A('无身份绑定（自由对话消息）→ free_conversation_route',
  routeInterviewOrFreeConversation({ text: '随便聊聊：什么是缓存穿透？' }).route === 'free_conversation_route');
A('空/非对象/null → free_conversation_route（fail-closed，不臆造身份）',
  routeInterviewOrFreeConversation(null).route === 'free_conversation_route'
  && routeInterviewOrFreeConversation(undefined).route === 'free_conversation_route'
  && routeInterviewOrFreeConversation('').route === 'free_conversation_route');
A('缺 questionId / stateVersion / answerHash / turn 任一项 → free_conversation_route',
  routeInterviewOrFreeConversation({ questionId: 'q-v1-t0-c0' }).route === 'free_conversation_route'
  && routeInterviewOrFreeConversation({ ...validIdentity, answerHash: undefined }).route === 'free_conversation_route');
A('非法 questionId 格式 / 负 stateVersion / 非 sha256 hash / 负 turn → free_conversation_route',
  routeInterviewOrFreeConversation({ ...validIdentity, questionId: 'q-bad' }).route === 'free_conversation_route'
  && routeInterviewOrFreeConversation({ ...validIdentity, stateVersion: -1 }).route === 'free_conversation_route'
  && routeInterviewOrFreeConversation({ ...validIdentity, answerHash: 'not-a-hash' }).route === 'free_conversation_route'
  && routeInterviewOrFreeConversation({ ...validIdentity, turn: -1 }).route === 'free_conversation_route');
A('弱绑定 fail-open 防护：questionId 内嵌 stateVersion/turn 与同对象字段不一致 → free_conversation_route（fail-closed 拒）',
  routeInterviewOrFreeConversation({ ...validIdentity, questionId: 'q-v5-t0-c0' }).route === 'free_conversation_route'
  && routeInterviewOrFreeConversation({ ...validIdentity, questionId: 'q-v1-t3-c0' }).route === 'free_conversation_route'
  && isInterviewQuestionIdentity({ ...validIdentity, questionId: 'q-v5-t0-c0' }) === false
  && isInterviewQuestionIdentity({ ...validIdentity, questionId: 'q-v1-t3-c0' }) === false);
A('交叉校验不误拒一致绑定：非零 stateVersion/turn（q-v12-t9-c0 + stateVersion=12 + turn=9）→ interview_route',
  isInterviewQuestionIdentity({ ...validIdentity, questionId: 'q-v12-t9-c0', stateVersion: 12, turn: 9 }) === true);

/* ── C. 超长作答策略：reject（明确错误码）vs accepted ───────────────────── */
const reject8001 = resolveOverlongAnswerPolicy('interview_route', 8001);
A('面试 8001 字 → 确定性 reject + 明确错误码 answer_too_long（用户可感知）',
  reject8001.accepted === false && reject8001.policy.policy === 'reject'
  && reject8001.policy.maxLength === 8000 && reject8001.policy.segmentPolicy === 'none'
  && reject8001.policy.errorCode === 'answer_too_long');
A('面试恰 8000 字 → accepted（不截断、不摘要，评分按原始作答）',
  (() => { const d = resolveOverlongAnswerPolicy('interview_route', 8000); return d.accepted === true && d.maxLength === 8000; })());
A('面试 7999 字 → accepted', resolveOverlongAnswerPolicy('interview_route', 7999).accepted === true);
A('面试 0 字 → accepted（空答由 turn 守卫另判 invalid_turn，不属于超长策略职责）',
  resolveOverlongAnswerPolicy('interview_route', 0).accepted === true);
A('自由对话路由 → 超长策略不可用（fail-closed，不臆造 CTX-02/03 策略）',
  (() => {
    const d = resolveOverlongAnswerPolicy('free_conversation_route', 99999);
    return d.accepted === false && d.policy.errorCode === 'free_conversation_route_unavailable' && d.policy.maxLength === 0;
  })());
A('非法路由值 → 抛 input_route_kind_invalid（fail-closed）',
  throws(() => resolveOverlongAnswerPolicy('bogus' as never, 1)));
A('负长度 → 抛 answer_length_invalid（fail-closed）',
  throws(() => resolveOverlongAnswerPolicy('interview_route', -1)));

/* ── D. 核心验收：超长作答不改变评分事实（哪些证据进 score_evidence、deterministic_total）── */
// 原始作答（中文多字节，stress UTF-8 字节坐标系）：25 个汉字 = 75 字节。
const ANSWER = '我用读写分离加本地缓存扛住峰值，并权衡一致性与延迟';
// 超长作答 = 原始作答 + 尾部 padding（> 8000 字）。评分证据应只锚定原始前缀，不因尾部 padding 改变。
const OVERLONG = ANSWER + '这是超长作答的无关填充内容，用于验证评分事实不因输入变长而改变。'.repeat(300);
A('构造：OVERLONG 确实超长（> 8000 字）', OVERLONG.length > 8000);
A('构造：OVERLONG 与 ANSWER 共享同一前缀', OVERLONG.startsWith(ANSWER));

// 证据 span 落在 ANSWER 前缀内（UTF-8 字节 [0, 24) = 前 8 个汉字）。
const SPAN = { offsetKind: 'utf8_byte' as const, start: 0, end: 24 };
const digest = scoreSpanDigest(ANSWER, SPAN);
const CRITERIA = [
  { criterionId: 'clarity', disposition: 'meets' as const, weight: 2 },
  { criterionId: 'depth', disposition: 'exceeds' as const, weight: 3 },
];
const total = computeDeterministicTotal(CRITERIA);

A('span 规范化：utf8_byte 合法且坐标系唯一', canonicalScoreSpan(SPAN) === 'utf8_byte:0:24');
A('证据 span 界内（utf8 字节 [0,24) ≤ ANSWER 75 字节）', SPAN.end <= utf8ByteLength(ANSWER));
A('评分事实：正常作答上 span 复验通过', reverifyScoreEvidenceSpan(ANSWER, SPAN, digest) === true);
A('评分事实：超长作答（同前缀）上 span 复验仍通过 → 证据锚定原始字节，不因尾部 padding 失效',
  reverifyScoreEvidenceSpan(OVERLONG, SPAN, digest) === true);
A('评分事实：span_digest 在正常 vs 超长作答下逐字节一致（score_evidence 内容不变）',
  scoreSpanDigest(ANSWER, SPAN) === scoreSpanDigest(OVERLONG, SPAN));
// 结构事实：computeDeterministicTotal 签名不收答案（DeterministicCriterion = {criterionId,disposition,weight}），
// 故「总分与答案无关」是公式的结构性事实，非本条值钉所能证——这里只钉「已知证据集 → 80」。
A('评分事实：钉住已知证据集总分=80（meets+exceeds w[2,3]→80）；公式与答案无关是结构性事实（不入答案参）',
  total === 80 && computeDeterministicTotal(CRITERIA) === 80);
// 真对抗：digest 锚定**字节内容**而非字节长度——与 ANSWER 同长度(75字节)但内容不同 → 不同 digest；
// 结合上文「OVERLONG(不同长度)共享前缀 → 同 digest」，证明答案只经 span_digest 进证据链、总分不收答案字节。
const SAME_LEN_DIFF = '我'.repeat(25); // 与 ANSWER 同 25 个汉字 = 75 字节，但内容不同
A('真对抗：同长度(75字节)不同内容 → 不同 span_digest（digest 锚定字节内容，非字节长度）',
  utf8ByteLength(SAME_LEN_DIFF) === utf8ByteLength(ANSWER) && scoreSpanDigest(SAME_LEN_DIFF, SPAN) !== digest);

/* ── E. 对抗：摘要/截断产物绝不冒充评分证据（评分只看原始作答）──────────── */
// 头部截断 + 截断标记（模拟 capUserData('mock-interview.evaluate') 的 head-truncate-with-marker）——
// 截断产物含原答案没有的标记字节，其 digest 对原始作答复验必然失败。
const TRUNCATED = ANSWER.slice(0, 6) + '…[内容过长已截断]';
const truncSpan = { offsetKind: 'utf8_byte' as const, start: 0, end: utf8ByteLength(TRUNCATED) };
const truncDigest = scoreSpanDigest(TRUNCATED, truncSpan);
A('截断产物（含标记）的 span/digest 对原始作答复验 → false（截断物不能冒充原始证据）',
  reverifyScoreEvidenceSpan(ANSWER, truncSpan, truncDigest) === false);
// 摘要（自由文本，非逐字引文）：其 digest 冒充 span digest → 对原始作答复验失败。
const SUMMARY = '候选人很好地回答了缓存与一致性权衡的问题';
const summarySpan = { offsetKind: 'utf8_byte' as const, start: 0, end: utf8ByteLength(SUMMARY) };
const summaryDigest = scoreSpanDigest(SUMMARY, summarySpan);
A('摘要 hash 冒充 span digest 对原始作答复验 → false（摘要不能进 score_evidence）',
  reverifyScoreEvidenceSpan(ANSWER, SPAN, summaryDigest) === false);
A('span.end 越界（超出原始答案字节长度）→ 复验 false（不存在的字节不能当证据）',
  reverifyScoreEvidenceSpan(ANSWER, { offsetKind: 'utf8_byte', start: 0, end: 9999 }, digest) === false);
// 确定性总分与证据集逐字节一致性：超长作答无论 reject（进不了评分）还是尾部追加（不改变前缀证据），
// 都产生同一总分与同一 span_digest —— 评分事实不变。
A('综合：超长作答不改变「进 score_evidence 的证据内容 + deterministic_total」（核心验收）',
  scoreSpanDigest(ANSWER, SPAN) === scoreSpanDigest(OVERLONG, SPAN)
  && reverifyScoreEvidenceSpan(ANSWER, SPAN, digest)
  && reverifyScoreEvidenceSpan(OVERLONG, SPAN, digest)
  && computeDeterministicTotal(CRITERIA) === 80);

console.log(`\n${fail === 0 ? '✓ 面试输入分流 + 超长策略 + 评分事实不变性（CTX-01）全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
