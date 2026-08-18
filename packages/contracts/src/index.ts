/**
 * @meetwise/contracts — 前后端共享契约(zod4-native,单一真相)。
 * 后端用 ZodValidationPipe 校验请求体;前端 import 同一份拿类型 + 运行时校验(杜绝手写 fetch 漂移)。
 * **多端**:`apiContract` 注册表 + `buildOpenApiDocument`(用 zod4 原生 z.toJSONSchema,零外部依赖)生成 OpenAPI →
 *   TS web 直接 import 本包;异构端(原生/小程序)从生成的 openapi.json 跑 codegen。生成物永不漂移(从 zod 编出)。
 * 决策见 ADR-0004 / 记忆 meetwise-multiend-contract。
 */
import { z } from 'zod';

/* ───────────── auth ───────────── */
// email 封 254(RFC 5321),password 封 128:上限防超长输入把 scrypt 变 CPU DoS 面 + 超长邮箱撑爆索引(负测抓到无上限)。
export const Credentials = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) });
export type Credentials = z.infer<typeof Credentials>;
/** 注册:含身份(求职者 C 端 / 招聘方 B 端)。 */
export const SignupDto = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128), role: z.enum(['candidate', 'recruiter']).optional() });
export type SignupDto = z.infer<typeof SignupDto>;
export const AuthResult = z.object({ token: z.string(), userId: z.string().optional(), role: z.string().optional() });
export type AuthResult = z.infer<typeof AuthResult>;

/* ───────────── resume ───────────── */
// 上限 60000 字:一份长简历(5+ 页含项目细节)约 1–2 万字,60k 给足余量(粘贴简历+求职信也容得下),
// 同时为最后防线封住超大文本——简历原文会**加密落库**(resume_blob)且喂多次模型调用,不能让单次上传塞进 MB 级文本拖垮 DB/队列。
// 边缘 400 拒在落库前;模型侧另有 20k 关口兜底(见 ai-runtime capUserData)。
export const UploadResumeDto = z.object({ text: z.string().min(20).max(60_000) });
export type UploadResumeDto = z.infer<typeof UploadResumeDto>;
/** 文件上传简历(PDF/Word/图片):base64 内容 + 文件名 + MIME。服务端提取+清洗→结构化。 */
// 上限:base64 ≤ ~10.7MB(对应 8MB 原文,服务再按 MAX_RESUME_BYTES 解码校验);filename/mimeType ≤255 防超长头。
const ResumeFileBase64 = z.string().min(1).max(10_700_000)
  .regex(/^[A-Za-z0-9+/]*={0,2}$/)
  .refine((value) => value.length % 4 === 0, 'base64 padding is invalid');
export const UploadResumeFileDto = z.object({ filename: z.string().min(1).max(255), mimeType: z.string().max(255).default(''), contentBase64: ResumeFileBase64 });
export type UploadResumeFileDto = z.infer<typeof UploadResumeFileDto>;
export const ResumeRef = z.object({ id: z.string(), status: z.string() });
export const ResumeList = z.object({ resumes: z.array(ResumeRef) });
export type ResumeList = z.infer<typeof ResumeList>;

/* ───────────── interview ───────────── */
// 上限 8000 字:一道训练问题的口述/打字作答,即使长篇大论也容得下(8000 字≈ 25 分钟语速口述;
// 语音作答先 ASR 转写再走 /turn,转写文本同受此限)。封顶动机:答案会**存进 interview_job.payload(JSONB)
// + 经检查点 transcript 持久化 + 入队**,无上限则可被塞进 MB 级文本做存储/队列放大攻击(模型侧虽有 20k 关口,
// 但 DB/队列在关口之前)。边缘 400 拒在落库前。8000 对真实作答足够宽,不会误伤(残留风险见返回说明)。
const ANSWER_MAX = 8000;
/**
 * Historical fixture schema.  It is intentionally not registered as a public
 * HTTP route: production answers must use TurnDto and bind a server-issued
 * question identity, state version and answer hash.
 */
export const AnswerDto = z.object({ answer: z.string().min(1).max(ANSWER_MAX) });
export type AnswerDto = z.infer<typeof AnswerDto>;
/**
 * 服务端问题身份绑定。旧页面只凭 turn 的请求一律不兼容：questionId 来自 question_ready，
 * answerId 是一次稳定 UUID，answerHash 是 answer 的 SHA-256（服务端会重算，不信客户端）。
 */
export const TurnDto = z.object({
  questionId: z.string().regex(/^q-v\d+-t\d+-c\d+$/),
  stateVersion: z.number().int().nonnegative(),
  answerId: z.string().uuid(),
  answerHash: z.string().regex(/^[a-f0-9]{64}$/),
  turn: z.number().int().min(0),
  answer: z.string().min(1).max(ANSWER_MAX),
}).strict();
export type TurnDto = z.infer<typeof TurnDto>;
/** 面试视图(GET /interview/:id 响应)。 */
export const InterviewView = z.object({
  id: z.string(),
  status: z.string(),
  current_question_index: z.number().int().nullable(),
});
export type InterviewView = z.infer<typeof InterviewView>;
export const InterviewList = z.object({ interviews: z.array(InterviewView) });
export type InterviewList = z.infer<typeof InterviewList>;
// alreadyBegun:幂等 begin 复用既有 start job 时返回(begin/turn 共用本 schema;补字段消除 begin 端点的契约漂移)。
export const BeginResult = z.object({ accepted: z.boolean(), jobId: z.string().optional(), alreadyBegun: z.boolean().optional() });
export const TurnResult = z.object({ accepted: z.boolean(), replayed: z.boolean(), jobId: z.string() });
export type TurnResult = z.infer<typeof TurnResult>;
/**
 * 当前语音处理的同意版本。它只覆盖“一段本机麦克风音频被即时发送至 ASR”，
 * 不覆盖录音持久化、电话/会议接入、远端音轨或说话人分离。
 */
export const VOICE_CAPTURE_POLICY_VERSION = 'voice_ephemeral_v1' as const;
const VoiceAudioBase64 = z.string()
  .min(4)
  .max(13_500_000)
  .regex(/^[A-Za-z0-9+/]*={0,2}$/)
  .refine((value) => value.length % 4 === 0, 'base64 padding is invalid');
const VoiceMimeType = z.enum([
  'audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/wav',
]);
const VoiceFormat = z.enum(['webm', 'mp4', 'ogg', 'mp3', 'wav', 'm4a']);
/**
 * 能力关闭门：只有用户显式同意的浏览器本机单轨可进 ASR。没有远端媒体轨、
 * 电话接入、声纹/说话人分离能力时，调用方不能借请求字段伪称它们已存在。
 */
export const VoiceCapture = z.object({
  mode: z.literal('single_local_microphone'),
  consent: z.literal(true),
  policyVersion: z.literal(VOICE_CAPTURE_POLICY_VERSION),
}).strict();
/** 语音作答转写请求体：经明确同意的一段本机单轨音频。 */
export const TranscribeDto = z.object({
  audioBase64: VoiceAudioBase64,
  mimeType: VoiceMimeType,
  format: VoiceFormat.optional(),
  capture: VoiceCapture,
}).strict();
export type TranscribeDto = z.infer<typeof TranscribeDto>;
/**
 * 转写结果：speakerAttribution/wordTimestamps 是能力声明而非模型猜测。
 * 单本机轨只能安全返回 not_diarized / not_available，消费端不得把它当双人通话纪要。
 */
export const TranscribeResult = z.object({
  text: z.string(),
  capture: z.object({
    mode: z.literal('single_local_microphone'),
    speakerAttribution: z.literal('not_diarized'),
    wordTimestamps: z.literal('not_available'),
  }).strict(),
}).strict();
export type TranscribeResult = z.infer<typeof TranscribeResult>;
/** 语音播报(TTS)请求:把题/追问文本合成语音,供单人语音模式播放。
 *  上限 8000 字封住超大 payload(题/追问本就短;服务端另把实际送 TTS 文本截到 2000 字防超长合成)。 */
export const SpeakDto = z.object({ text: z.string().min(1).max(8_000) });
export type SpeakDto = z.infer<typeof SpeakDto>;
export const SpeakResult = z.object({ audioBase64: z.string(), mimeType: z.string() });
export type SpeakResult = z.infer<typeof SpeakResult>;
/** 题目反馈(赞/踩 + 可选评语)。评语是落库的自由文本,上限 1000 字封住无界 DB 写入(此前裸 @Body 无校验)。 */
export const FeedbackDto = z.object({ rating: z.enum(['up', 'down']), comment: z.string().max(1_000).optional() });
export type FeedbackDto = z.infer<typeof FeedbackDto>;
/** 标记学习项完成:topic 是落库键,1–200 字(此前裸 @Body 无上限)。 */
export const LearningCompleteDto = z.object({ topic: z.string().min(1).max(200) });
export type LearningCompleteDto = z.infer<typeof LearningCompleteDto>;

/* ───────────── resume-quiz(押题) ───────────── */
/** 一道押题:q=预测训练问题,refs=接地考察点(简历里出现过的关键词,factuality 门保证非幻觉)。 */
export const QuizItem = z.object({ q: z.string().max(2_000), refs: z.array(z.string().max(200)).max(20) });
export type QuizItem = z.infer<typeof QuizItem>;
/** 押题详情(GET /quiz/:id 响应)。ready 时 questions/report 有内容;generating/failed 据 status 渲染(无死胡同)。 */
export const QuizView = z.object({
  id: z.string(),
  status: z.string(),
  questions: z.array(QuizItem),
  report: z.object({ score: z.number().int(), grounded: z.number().int(), summary: z.string() }).nullable(),
});
export type QuizView = z.infer<typeof QuizView>;
export const QuizList = z.object({ quizzes: z.array(z.object({ id: z.string(), status: z.string() })) });
export type QuizList = z.infer<typeof QuizList>;
/** 新建押题响应。 */
export const QuizCreated = z.object({ quizId: z.string(), status: z.string() });
export type QuizCreated = z.infer<typeof QuizCreated>;
/** 开始押题(扣额度 + 入队生成 job)受理结果。 */
export const QuizBeginResult = z.object({ accepted: z.boolean(), jobId: z.string().optional(), alreadyBegun: z.boolean().optional() });
export type QuizBeginResult = z.infer<typeof QuizBeginResult>;

/* ───────────── resume-diagnosis(简历诊断) ───────────── */
/** 一条诊断发现:text=结论,refs=接地依据(简历里出现过的关键词,factuality 门保证非幻觉)。 */
export const DiagnosisFinding = z.object({ text: z.string(), refs: z.array(z.string()) });
/** 一条改写建议:before=原表达,after=优化表达(只优化措辞,绝不虚构经历),refs=锚定的真实经历关键词。 */
export const RewriteSuggestion = z.object({ before: z.string(), after: z.string(), refs: z.array(z.string()) });
/** 诊断维度:结构/完整性/亮点/风险/岗位匹配度。 */
export const DiagnosisSection = z.object({
  kind: z.enum(['structure', 'completeness', 'highlight', 'risk', 'match']),
  title: z.string(),
  score: z.number().int().min(0).max(100).optional(),
  findings: z.array(DiagnosisFinding),
});
/** 诊断报告(图 finalize 派生)。 */
export const DiagnosisReport = z.object({
  overall: z.number().int().min(0).max(100),
  summary: z.string(),
  sections: z.array(DiagnosisSection),
  rewrites: z.array(RewriteSuggestion),
  groundedCount: z.number().int(),
  rejectedCount: z.number().int(),
});
export type DiagnosisReport = z.infer<typeof DiagnosisReport>;
/** 诊断详情(GET /diagnosis/:id 响应)。ready 时 report 有内容;generating/failed 据 status 渲染(无死胡同)。 */
export const DiagnosisView = z.object({
  id: z.string(),
  status: z.string(),
  targetRole: z.string().nullable(),
  report: DiagnosisReport.nullable(),
});
export type DiagnosisView = z.infer<typeof DiagnosisView>;
export const DiagnosisList = z.object({ diagnoses: z.array(z.object({ id: z.string(), status: z.string() })) });
export type DiagnosisList = z.infer<typeof DiagnosisList>;
/** 新建诊断响应。 */
export const DiagnosisCreated = z.object({ diagnosisId: z.string(), status: z.string() });
export type DiagnosisCreated = z.infer<typeof DiagnosisCreated>;
/** 开始诊断(扣额度 + 入队生成 job)受理结果。 */
export const DiagnosisBeginResult = z.object({ accepted: z.boolean(), jobId: z.string().optional(), alreadyBegun: z.boolean().optional() });
export type DiagnosisBeginResult = z.infer<typeof DiagnosisBeginResult>;

/* ───────────── commerce ───────────── */
export const Product = z.object({ id: z.string(), name: z.string(), amountCents: z.number().int(), units: z.number().int() });
export const Products = z.object({ products: z.array(Product) });
export type Products = z.infer<typeof Products>;
export const Entitlement = z.object({ availableUnits: z.number().int() });
export type Entitlement = z.infer<typeof Entitlement>;
export const CreateOrderDto = z.object({ productId: z.string() });
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
export const OrderResult = z.object({ orderId: z.string(), amountCents: z.number().int(), status: z.string() });

/* ───────────── profile ───────────── */
export const Profile = z.object({ id: z.string(), email: z.string(), status: z.string(), preferences: z.record(z.string(), z.unknown()).optional() });
export type Profile = z.infer<typeof Profile>;
/**
 * PATCH /profile/settings 请求体(F6:此前裸 @Body 无校验 → jsonb 无界膨胀)。
 * 白名单固定 key(locale/theme/notifications),值受枚举/布尔约束,`.strict()` **拒绝任何未知 key 与深层嵌套**——
 * 把 preferences 体积结构性钉死在极小常量(根治 jsonb 无界膨胀);service 落库时另把存量 prefs 投影到同一白名单(自愈脏 key)。
 * 合并语义:**顶层按 key 合并**(未传的 locale/theme 保留);notifications 为嵌套对象,`||` 语义下**整体替换**——须提交完整 notifications,不做子字段部分更新。
 */
export const updateSettingsSchema = z.object({
  preferences: z.object({
    locale: z.enum(['zh', 'en']).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
    }).strict().optional(),
  }).strict(),
}).strict();
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
export const Overview = z.object({
  interviewsByStatus: z.record(z.string(), z.number()),
  answered: z.number().int(),
  avgScore: z.number().nullable(),
  reportsReady: z.number().int(),
});
export type Overview = z.infer<typeof Overview>;
/** 成长档案/能力曲线(GET /profile/growth 响应)。读侧聚合:历次评估 → 时间序成长点 + 维度集合 + 汇总。
 *  隐私:只含分数/维度标签/时间戳,绝无简历原文/作答原文。trend 不足两场=none。 */
export const GrowthPoint = z.object({
  at: z.string(),                                   // ISO 时间戳(该场评估时间)
  interviewId: z.string(),                          // owner 自己的面试 id(React key / 跳转报告用)
  overall: z.number().int().nullable(),             // 该场综合分(0-100)
  dims: z.record(z.string(), z.number()),           // 该场各维度分(维度标签→分)
});
export type GrowthPoint = z.infer<typeof GrowthPoint>;
export const GrowthView = z.object({
  points: z.array(GrowthPoint),                     // 按时间升序(左老右新)
  dimensions: z.array(z.string()),                  // 出现过的全部维度(并集,已排序)
  totals: z.object({
    sessions: z.number().int(),
    answered: z.number().int(),
    bestScore: z.number().int().nullable(),
    latestScore: z.number().int().nullable(),
    trend: z.enum(['up', 'down', 'flat', 'none']),  // 最新两场对比;不足两场=none
  }),
});
export type GrowthView = z.infer<typeof GrowthView>;

/* ───────────── recruiter(B 端,多租户) ───────────── */
// 招聘方发布岗位:title/description/competencies 都是落库的用户文本,加上限封住超大 payload(纵深防护)。
export const CreateJobDto = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(8_000).optional(),
  competencies: z.array(z.string().max(60)).max(30).optional(),
});
export type CreateJobDto = z.infer<typeof CreateJobDto>;
export const JobView = z.object({
  id: z.string(), owner_user_id: z.string(), title: z.string(), description: z.string(),
  competencies: z.array(z.string()), status: z.string(), created_at: z.string(),
});
export type JobView = z.infer<typeof JobView>;
export const JobList = z.object({ jobs: z.array(JobView) });
export type JobList = z.infer<typeof JobList>;

/* ───────────── 候选人 ↔ 岗位 ↔ 招聘方:申请闭环 ───────────── */
/** 投递结果(幂等:重复投递返回既有申请 id)。 */
export const ApplyResult = z.object({ applicationId: z.string() });
export type ApplyResult = z.infer<typeof ApplyResult>;
/** 候选人侧:我投递的申请(缓存状态/分数)。 */
export const MyApplications = z.object({
  applications: z.array(z.object({
    id: z.string(), job_id: z.string(), interview_id: z.string().nullable(), resume_id: z.string().uuid().nullable(), status: z.string(), score: z.number().int().nullable(),
    source: z.string().optional(),
  })),
});
export type MyApplications = z.infer<typeof MyApplications>;
/** 招聘方侧:申请到某岗位的候选人（当前只返回最小状态；score 字段在
 * calibration hold 期间恒为 null，避免前端或未来消费者重新把它用于排名）。 */
export const JobCandidates = z.object({
  candidates: z.array(z.object({
    id: z.string(), candidate_user_id: z.string(), status: z.string(), score: z.number().int().nullable(),
    source: z.string().optional(),
  })),
});
export type JobCandidates = z.infer<typeof JobCandidates>;
/** 启动岗位面试时明确选择已摄取简历；服务端把它冻结到 application-bound interview。 */
export const StartApplicationDto = z.object({ resumeId: z.string().uuid() }).strict();
export type StartApplicationDto = z.infer<typeof StartApplicationDto>;
/** application start 永远返回服务端已绑定的会话；redirectTo 不是客户端拼接出来的 ID。 */
export const ApplicationStartResult = z.object({
  applicationId: z.string(), status: z.enum(['started', 'reused', 'noop']), interviewId: z.string().optional(),
  redirectTo: z.string().optional(),
});
export type ApplicationStartResult = z.infer<typeof ApplicationStartResult>;
/**
 * 回填不接收 interviewId：客户端能控制的任意历史 C 端会话一律不能成为招聘评分来源。
 * 服务端只读取 application 持久化的一对一绑定并复核 owner/job/resume/终态。
 */
export const FinalizeApplicationDto = z.object({}).strict();
export type FinalizeApplicationDto = z.infer<typeof FinalizeApplicationDto>;
/**
 * `assessment_unavailable` is a deliberately scoreless terminal result, not a
 * successful completion with a fabricated zero.  Consumers must render it as
 * retryable and must not show it in a recruiter score ranking.
 */
export const ApplicationFinalizeResult = z.object({
  applicationId: z.string(), interviewId: z.string(), replayed: z.boolean(),
  outcome: z.literal('assessment_unavailable'),
});
export type ApplicationFinalizeResult = z.infer<typeof ApplicationFinalizeResult>;

/* ───────────── B 端企业纵深:招聘方邀请候选人面试 + 人才库 ───────────── */
/** 招聘方邀请候选人面试:candidateId 或 candidateEmail 二选一(服务端把 email 解析成用户 id)。 */
export const InviteCandidateDto = z.object({
  candidateId: z.string().min(1).max(64).optional(),
  candidateEmail: z.string().email().max(254).optional(),
}).refine((v) => !!(v.candidateId || v.candidateEmail), { message: 'candidateId_or_email_required' });
export type InviteCandidateDto = z.infer<typeof InviteCandidateDto>;
/** 邀请结果(幂等:候选人已自投/已被邀请则复用既有申请 id)。 */
export const InviteResult = z.object({ applicationId: z.string(), status: z.string() });
export type InviteResult = z.infer<typeof InviteResult>;
/** 人才库一行:跨招聘方自有岗位聚合的候选人。评分校准发布前 score 恒为
 * null，B 端不得据此排序、筛选或作决定。 */
export const TalentRowView = z.object({
  id: z.string(), job_id: z.string(), job_title: z.string(), candidate_user_id: z.string(),
  status: z.string(), score: z.number().int().nullable(), source: z.string(), created_at: z.string(),
});
export type TalentRowView = z.infer<typeof TalentRowView>;
export const TalentPool = z.object({ talents: z.array(TalentRowView) });
export type TalentPool = z.infer<typeof TalentPool>;

/* ───────────── runtime health（公开、最小披露） ───────────── */
/** `/livez` 和成功的 `/readyz/api` 都只返回固定状态，不能泄漏数据库或运行拓扑。 */
export const HealthOk = z.object({ status: z.literal('ok') }).strict();
export type HealthOk = z.infer<typeof HealthOk>;

/* ───────────── privacy authorization (INT-TRANSCRIPT-00) ─────────────
 * 删除授权快照（JWS payload）的线上形状。签发/验签逻辑在 packages/domain（ECDSA P-256
 * /ES256，与模型网关 Ed25519 刻意分离），这里只冻结多端契约形状。字段名是 domain 的
 * 单一真相；本块**仅不登记进 apiContract**（不进 OpenAPI）——公开删除端点保持 503（见
 * privacy.service）。这些形状供未来的 issuer/deleter 服务与异构端 codegen 复用；它并非
 * 密码学意义上的“不可枚举”（JWS payload 对持有者明文可见）。
 */
export const PRIVACY_AUTHZ_ISSUER = 'meetwise-privacy-authz-v1' as const;
export const PRIVACY_AUTHZ_AUDIENCE = 'meetwise-deletion-worker' as const;
/** kid 格式：与 packages/domain 的 PRIVACY_AUTHZ_KID_RE 逐值一致（跨侧 test pin 兜底，见 domain proof M6）。 */
export const PRIVACY_AUTHZ_KID_RE = /^[A-Za-z0-9_-]{1,64}$/;
/** 64-hex digest：与 packages/domain 的 PRIVACY_AUTHZ_DIGEST_RE 逐值一致（跨侧 test pin 兜底）。 */
export const PRIVACY_AUTHZ_DIGEST_RE = /^[a-f0-9]{64}$/;
/** 契约冻结三个目的枚举；当前 DB 只签发 `interview_data_erasure`（其余为 MEM-00/后续复用预留，DB 侧 fail-closed 拒绝）。 */
export const PRIVACY_AUTHZ_PURPOSES = ['interview_data_erasure', 'resume_data_erasure', 'account_data_erasure'] as const;
export const PrivacyAuthzPurpose = z.enum(PRIVACY_AUTHZ_PURPOSES);
export const PrivacyAuthorizationSnapshot = z.object({
  iss: z.literal(PRIVACY_AUTHZ_ISSUER),
  aud: z.literal(PRIVACY_AUTHZ_AUDIENCE),
  jti: z.string().uuid(),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
  issuerId: z.literal(PRIVACY_AUTHZ_ISSUER),
  keyId: z.string().regex(PRIVACY_AUTHZ_KID_RE),
  actor: z.string().min(1).max(128),
  owner: z.string().min(1).max(128),
  interview: z.string().min(1).max(128),
  purpose: PrivacyAuthzPurpose,
  privacyEpoch: z.number().int().positive(),
  targetSetDigest: z.string().regex(PRIVACY_AUTHZ_DIGEST_RE),
}).strict();
export type PrivacyAuthorizationSnapshot = z.infer<typeof PrivacyAuthorizationSnapshot>;
export const PrivacyDeletionReceiptKind = z.enum(['local_erased', 'retention_pending', 'external_pending', 'external_confirmed', 'failed_cleanup']);
export const PrivacyDeletionReceipt = z.object({
  targetId: z.string().uuid(),
  receiptKind: PrivacyDeletionReceiptKind,
  receiptHash: z.string().min(1).max(128),
}).strict();
export type PrivacyDeletionReceipt = z.infer<typeof PrivacyDeletionReceipt>;

/* ───────────── memory governance (MEM-00) ─────────────
 * 记忆治理的多端契约形状。与上方 privacy 块同理：这些形状**仅冻结跨端 schema**，不登记进
 * apiContract（不进 OpenAPI）——记忆管理/召回的 HTTP 路径仍待产品契约确定，公开端点保持
 * fail-closed。sink kind 与 packages/domain 的 MEMORY_AUTHZ_SINK_KINDS 逐值一致（跨侧 test
 * pin 兜底，见 memory-governance proof）。
 */
/** MEM 删除目标 sink 枚举（与 INT-TRANSCRIPT sink 两套不相交，跨域 claim 一律拒绝）。 */
export const MEMORY_SINK_KINDS = ['memory_event', 'memory_summary', 'memory_fact', 'memory_embedding', 'memory_cache', 'memory_context_snapshot', 'memory_trace'] as const;
export const MemorySinkKind = z.enum(MEMORY_SINK_KINDS);
export type MemorySinkKind = z.infer<typeof MemorySinkKind>;

/** span 偏移坐标系：UTF-8 字节 或 Unicode code-point（**绝无 UTF-16**，跨语言不漂移）。 */
export const MemorySpanOffsetKind = z.enum(['utf8_byte', 'unicode_codepoint']);
export const MemorySpanLocator = z.object({
  offsetKind: MemorySpanOffsetKind,
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
}).strict().refine((s) => s.end >= s.start, 'span end must be >= start');
export type MemorySpanLocator = z.infer<typeof MemorySpanLocator>;

/** 事实状态机（显式 enum，禁布尔汤；受审计转移，见 memory-governance 层 CAS）。 */
export const MemoryFactStatus = z.enum(['candidate', 'awaiting_confirmation', 'active', 'rejected', 'superseded', 'disputed', 'expired', 'fenced']);
export type MemoryFactStatus = z.infer<typeof MemoryFactStatus>;
export const MemoryConsentStatus = z.enum(['granted', 'revoked']);
export const MemoryContextSnapshotStatus = z.enum(['issued', 'consumed', 'expired', 'voided']);
export const MemoryGenerationStatus = z.enum(['building', 'validated', 'shadow', 'active', 'deprecated', 'retired']);

export const MemoryPurpose = z.enum(['interview_prep', 'career', 'preference', 'self_improvement']);
export const MemoryAllowedDataClass = z.enum(['derived_fact', 'dimension_label', 'topic', 'preference']);
export const MemorySourceType = z.enum(['conversation_event', 'business_fact', 'user_confirmation', 'model_summary']);

/** 受控记忆准入写入 DTO（服务端权威字段，客户端不得自报 owner/scope/epoch/consent revision）。 */
export const MemoryFactWrite = z.object({
  factKey: z.string().min(1).max(128),
  content: z.string().min(1).max(8_000),          // 派生摘要（非 PII 原文），进 data fence，双校验
  kind: z.enum(['fact', 'preference', 'skill', 'weakness', 'topic', 'episode']),
  purpose: MemoryPurpose,
  allowedDataClass: MemoryAllowedDataClass,
  sourceType: MemorySourceType,
  sourceEntityId: z.string().min(1).max(128).optional(),
  immutableSourceVersion: z.string().min(1).max(128).optional(),
  sourceSpan: MemorySpanLocator.optional(),
  sourceArtifactDigest: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  normalizationRecipeVersion: z.string().min(1).max(64).optional(),
  producerClass: z.string().min(1).max(64).optional(),
  extractionRecipeVersion: z.string().min(1).max(64).optional(),
  verificationRecipeVersion: z.string().min(1).max(64).optional(),
  policyVersion: z.string().min(1).max(64).default('memory-policy-v1'),
  expiresAt: z.string().datetime().optional(),
  multiValue: z.boolean().default(false),
  idempotencyKey: z.string().min(1).max(128).optional(),
}).strict();
export type MemoryFactWrite = z.infer<typeof MemoryFactWrite>;

/** 事实水合后的返回卡片（两阶段召回第二阶段：已重验 digest/status/expiry/consent）。 */
export const MemoryFactCard = z.object({
  id: z.string().uuid(),
  factKey: z.string(),
  content: z.string(),
  kind: z.string(),
  purpose: MemoryPurpose,
  allowedDataClass: MemoryAllowedDataClass,
  sourceSpan: MemorySpanLocator.nullable(),
  sourceArtifactDigest: z.string().nullable(),
  policyVersion: z.string(),
});
export type MemoryFactCard = z.infer<typeof MemoryFactCard>;

/** 两阶段召回结果：第一阶段 DB 硬过滤只返回 ID 集；内容经第二阶段水合重验才吐出。 */
export const MemoryRecallResult = z.object({ factIds: z.array(z.string().uuid()) }).strict();
export type MemoryRecallResult = z.infer<typeof MemoryRecallResult>;

export const MemoryConsent = z.object({
  purpose: MemoryPurpose,
  policyVersion: z.string().min(1).max(64),
  status: MemoryConsentStatus,
  consentRevision: z.number().int().positive(),
  privacyEpoch: z.number().int().positive(),
}).strict();
export type MemoryConsent = z.infer<typeof MemoryConsent>;

/* ───────────── memory admission metadata gate (MEM-12) ─────────────
 * 准入/来源/范围元标签门：三身份拆分 + 完整元标签集 + spanLocator 单一坐标系 + 六分量分离。
 * 这是「新建受控数据面」（不是给 user_memory 加列）；客户端 DTO 里**绝无**
 * owner/purpose/project/factKey/scope——这些一律由服务端授权快照派生，客户端传即被 .strict() 拒绝。
 */

/** spanLocator 单一坐标系：MEM-12 全系统固定为 UTF-8 字节偏移（绝无 UTF-16 / code-point）。 */
export const MemoryAdmissionSpanOffsetKind = z.literal('utf8_byte');
export const MemoryAdmissionSpanLocator = z.object({
  offsetKind: MemoryAdmissionSpanOffsetKind,
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
}).strict().refine((s) => s.end >= s.start, 'span end must be >= start');
export type MemoryAdmissionSpanLocator = z.infer<typeof MemoryAdmissionSpanLocator>;

/** 首期只允许 C 端个人范围（controllerScope=C-personal；B 端 range 不是合法值）。 */
export const MemoryAdmissionControllerScope = z.literal('c_personal');
export const MemoryAdmissionDataSubjectType = z.literal('c_personal_user');
export const MemoryAdmissionScopeKind = z.literal('personal');
export const MemoryAdmissionProducerClass = z.enum(['summarizer', 'fact_extractor', 'classifier', 'business_validator', 'user']);
export const MemoryAdmissionSourceTrust = z.enum(['trusted', 'untrusted']);
export const MemoryAdmissionVerificationState = z.enum(['unverified', 'user_confirmed', 'business_verified']);
export const MemoryAdmissionStatus = z.enum(['candidate', 'awaiting_confirmation', 'active', 'rejected']);

/** 客户端准入 DTO（.strict：owner/purpose/project/factKey/scope/sourceId 一律拒绝，服务端不采信）。 */
export const MemoryAdmissionCandidate = z.object({
  snapshotKey: z.string().min(1).max(128),                 // 服务端签发的不可变授权快照引用
  sourceText: z.string().min(1).max(200_000),              // 来源工件正文（不可信输入，必须与快照 digest 逐字节一致）
  sourceSpan: MemoryAdmissionSpanLocator,                  // utf8_byte 半开区间
  producerClass: MemoryAdmissionProducerClass,             // 生产方自报（仅落列作未采信元数据；准入期 verificationState 恒 unverified）
  extractionConfidence: z.number().min(0).max(1),
  salience: z.number().min(0).max(1).default(1.0),
  language: z.string().regex(/^[a-z]{2}(-[A-Za-z0-9]+)?$/),
  contentDigest: z.string().regex(/^[a-f0-9]{64}$/),       // 派生内容摘要（候选信号，服务端只验格式）
  idempotencyKey: z.string().min(1).max(128).optional(),
}).strict();
export type MemoryAdmissionCandidate = z.infer<typeof MemoryAdmissionCandidate>;

/** 准入回执：服务端回吐派生三身份 + 六分量（客户端不可回写）。 */
export const MemoryAdmissionReceipt = z.object({
  id: z.string().uuid(),
  status: MemoryAdmissionStatus,
  factKey: z.string(),                                     // 服务端派生，客户端无法自报
  controllerScope: MemoryAdmissionControllerScope,
  dataSubjectId: z.string(),
  accessPrincipalUserId: z.string(),
  threadBoundary: z.string(),
  sourceTrust: MemoryAdmissionSourceTrust,
  verificationState: MemoryAdmissionVerificationState,
  retrievalScore: z.number().nullable(),                   // 准入期恒 null
  created: z.boolean(),
}).strict();
export type MemoryAdmissionReceipt = z.infer<typeof MemoryAdmissionReceipt>;

/** 服务端授权快照回吐形状（issuer 签发后返回；不是客户端 DTO）。 */
export const MemoryAdmissionAuthorization = z.object({
  snapshotId: z.string().uuid(),
  snapshotKey: z.string(),
  controllerScope: MemoryAdmissionControllerScope,
  dataSubjectId: z.string(),
  accessPrincipalUserId: z.string(),
  threadBoundary: z.string(),
  purpose: MemoryPurpose,
  sourceArtifactDigest: z.string().regex(/^[a-f0-9]{64}$/),
  sourceUtf8ByteLength: z.number().int().nonnegative(),
  sourceTrust: MemoryAdmissionSourceTrust,
  expiresAt: z.string().datetime().nullable(),
}).strict();
export type MemoryAdmissionAuthorization = z.infer<typeof MemoryAdmissionAuthorization>;

/* ───────────── interview answer fact root (INT-TRANSCRIPT-00) ─────────────
 * 答案事实根：面试答案的唯一权威持久化形状（评分/检索/记忆/投影的前置）。与上方两个块
 * 同理，这些形状**仅冻结跨端 schema**，不登记进 apiContract（不进 OpenAPI）——答案提交的
 * HTTP 路径仍复用现有 /interview/{id}/turn（TurnDto），本块承载的是「答案正文加密落库 +
 * 提交回执 + 只读视图 + 删除目标 sink」这些评分前置的契约形状，供评分 worker、SSE 投影
 * 与删除器 codegen 复用。
 *
 * 铁律：所有模型/评分/RAG/Web/memory/B 端投影的副作用为 0——首包只落
 * `accepted_unscored`，正文只进加密 ciphertext（bytea），任何投影只拿 bodyHmac/watermark，
 * 绝不拿明文答案。`InterviewAnswerViewSnapshot` 是 watermark 视图，不含原文。
 */
/** INT-TRANSCRIPT 答案事实根自己的 sink registry（与 MEM 的 MEMORY_SINK_KINDS 不相交）。 */
export const INTERVIEW_ANSWER_SINK_KINDS = ['interview_answer_artifact'] as const;
export const InterviewAnswerSinkKind = z.enum(INTERVIEW_ANSWER_SINK_KINDS);
export type InterviewAnswerSinkKind = z.infer<typeof InterviewAnswerSinkKind>;

/** 答案正文 artifact 状态机（显式 enum，禁布尔汤）：active → fenced → erased（单向）。 */
export const InterviewAnswerArtifactStatus = z.enum(['active', 'fenced', 'erased']);
export type InterviewAnswerArtifactStatus = z.infer<typeof InterviewAnswerArtifactStatus>;
/** 提交回执状态机：首包 `accepted_unscored`（未评分），删除 fence 后 `fenced`。 */
export const InterviewAnswerSubmissionStatus = z.enum(['accepted_unscored', 'fenced']);
export type InterviewAnswerSubmissionStatus = z.infer<typeof InterviewAnswerSubmissionStatus>;

/** 提交结果（幂等）：同 clientSubmissionKey + 同 canonicalBodyHmac → 回放既有回执；异体 → 冲突。 */
export const InterviewAnswerSubmitResult = z.object({
  interviewId: z.string().min(1).max(128),
  questionId: z.string().min(1).max(128),
  stateVersion: z.number().int().nonnegative(),
  clientSubmissionKey: z.string().min(1).max(128),
  canonicalBodyHmac: z.string().regex(/^[a-f0-9]{64}$/),
  privacyEpoch: z.number().int().positive(),
  status: z.literal('accepted_unscored'),
  replayed: z.boolean(),
}).strict();
export type InterviewAnswerSubmitResult = z.infer<typeof InterviewAnswerSubmitResult>;

/** 服务端持久回执：客户端提交后拿到的凭证（可据此回放，但不含正文明文）。 */
export const InterviewAnswerSubmissionReceipt = z.object({
  submissionId: z.string().uuid(),
  clientSubmissionKey: z.string().min(1).max(128),
  canonicalBodyHmac: z.string().regex(/^[a-f0-9]{64}$/),
  privacyEpoch: z.number().int().positive(),
  status: InterviewAnswerSubmissionStatus,
  artifactId: z.string().uuid(),
}).strict();
export type InterviewAnswerSubmissionReceipt = z.infer<typeof InterviewAnswerSubmissionReceipt>;

/** ref-only 评分 job（仅引用，绝不携带答案正文——正文只留加密 artifact）。 */
export const InterviewAnswerJobRef = z.object({
  jobId: z.string().uuid(),
  questionId: z.string().min(1).max(128),
  stateVersion: z.number().int().nonnegative(),
  artifactRef: z.string().uuid(),
}).strict();
export type InterviewAnswerJobRef = z.infer<typeof InterviewAnswerJobRef>;

/** 只读视图（watermark）：只吐 bodyHmac/key 版本/epoch/状态，绝不吐原文或 ciphertext。 */
export const InterviewAnswerViewSnapshot = z.object({
  interviewId: z.string().min(1).max(128),
  highWatermark: z.number().int().nonnegative(),
  items: z.array(z.object({
    questionId: z.string().min(1).max(128),
    stateVersion: z.number().int().nonnegative(),
    bodyHmac: z.string().regex(/^[a-f0-9]{64}$/),
    hmacKeyVersion: z.number().int().positive(),
    privacyEpoch: z.number().int().positive(),
    status: InterviewAnswerArtifactStatus,
  }).strict()),
}).strict();
export type InterviewAnswerViewSnapshot = z.infer<typeof InterviewAnswerViewSnapshot>;

/* ───────────── memory fact adjudication (MEM-13) ─────────────
 * 长期事实的冲突/时效判定：稳定 factKey + 分类 + 单/多值 + contradicts/supersedes + 有效期
 * + 状态机。六分量分离（sourceTrust / extractionConfidence / userConfirmation / freshness·
 * validUntil / salience / retrievalScore 互不推导，绝不合并成单一总分）。客户端 DTO 里**绝无**
 * factKey/owner/purpose/scope——factKey 由服务端从 namespace + 归一化 subject 派生。
 */

/** 事实分类命名空间（对齐 MEM-00 memory_fact.kind 枚举）。 */
export const MemoryFactNamespace = z.enum(['fact', 'preference', 'skill', 'weakness', 'topic', 'episode']);
export type MemoryFactNamespace = z.infer<typeof MemoryFactNamespace>;

/** 单/多值规则：single_value 全局至多一个 active；multi_value 可多个 active。 */
export const MemoryFactCardinality = z.enum(['single_value', 'multi_value']);
export type MemoryFactCardinality = z.infer<typeof MemoryFactCardinality>;

/** 裁决状态机（显式 enum，禁布尔汤）：candidate→active→superseded/expired/contradicted/revoked。 */
export const MemoryAdjudicationStatus = z.enum(['candidate', 'active', 'superseded', 'expired', 'contradicted', 'revoked']);
export type MemoryAdjudicationStatus = z.infer<typeof MemoryAdjudicationStatus>;

/** 六分量之一：用户确认轴（与 source_trust 独立；unconfirmed → 由 confirm 证据路径显式授予）。 */
export const MemoryUserConfirmation = z.enum(['unconfirmed', 'user_confirmed', 'business_verified']);
export type MemoryUserConfirmation = z.infer<typeof MemoryUserConfirmation>;

/** 关系边：new--supersedes-->old 或 new--contradicts-->old（可追溯边，非布尔列）。 */
export const MemoryFactRelationshipKind = z.enum(['supersedes', 'contradicts']);
export type MemoryFactRelationshipKind = z.infer<typeof MemoryFactRelationshipKind>;

/** 确认证据路径：仅用户确认或受信业务事实可激活（模型候选不可直接 active）。 */
export const MemoryConfirmationKind = z.enum(['user_confirmation', 'business_fact']);
export type MemoryConfirmationKind = z.infer<typeof MemoryConfirmationKind>;

/** 事实裁决回执（materialize/confirm/correct/revoke 统一形状；服务端回吐，客户端不可回写）。 */
export const MemoryFactAdjudicationReceipt = z.object({
  id: z.string().uuid(),
  status: MemoryAdjudicationStatus,
  factKey: z.string().regex(/^[a-f0-9]{64}$/),            // 服务端派生 sha256，客户端无字段可传
  namespace: MemoryFactNamespace,
  cardinality: MemoryFactCardinality,
  purpose: MemoryPurpose,
  sourceTrust: MemoryAdmissionSourceTrust,
  userConfirmation: MemoryUserConfirmation,
  retrievalScore: z.number().nullable(),                  // 裁决期恒 null
  supersededFactId: z.string().uuid().nullable(),         // confirm 替代旧 active 时回吐
  contradictedFactId: z.string().uuid().nullable(),       // correct 纠正旧 active 时回吐
}).strict();
export type MemoryFactAdjudicationReceipt = z.infer<typeof MemoryFactAdjudicationReceipt>;

/** 服务端物化输入（消费 MEM-12 candidate；客户端不得自报 owner/purpose/scope/factKey）。 */
export const MemoryFactMaterializeInput = z.object({
  admissionRecordId: z.string().uuid(),
  content: z.string().min(1).max(8_000),                  // 派生摘要（非 PII 原文），进 data fence
  namespace: MemoryFactNamespace,
  cardinality: MemoryFactCardinality,
  subject: z.string().min(1).max(200),                    // 归一化 fact 主题（服务端 NFKC→trim→lower）
  validUntil: z.string().datetime().nullable(),
  idempotencyKey: z.string().min(1).max(128).optional(),
}).strict();
export type MemoryFactMaterializeInput = z.infer<typeof MemoryFactMaterializeInput>;

/* ───────────── memory index generation (MEM-11) ─────────────
 * 索引 generation 生命周期 + 缓存失效治理的多端契约形状。与 privacy/memory 块同理，这些形状
 * 仅冻结跨端 schema，不登记进 apiContract（不进 OpenAPI）——generation 治理是 worker 契约，
 * 公开 HTTP 路径保持 fail-closed。状态枚举以本块 `MemoryIndexGenerationStatus` 为单一真相源
 * （packages/domain 不再维护独立的 lifecycle 枚举，改为 defer 到此处；`MEMORY_INDEX_MANIFEST_STATUSES`/
 * `MEMORY_INDEX_CACHE_KINDS` 仍是 domain 侧常量），跨侧 test pin 兜底。
 *
 * 注意：MemoryIndexGenerationStatus 是 0093 MemoryGenerationStatus 的**超集**（新增
 * retiring/fenced，保留 shadow/deprecated 以兼容 MEM-00 的 52 断言）。MEM-11 生命周期
 * building→validated→active→retiring→retired→fenced，非法跃迁在 db 层 CAS 拒绝。
 */
/** generation 状态（DB CHECK 超集；含 retiring/fenced + 兼容 0093 六态）。 */
export const MemoryIndexGenerationStatus = z.enum(['building', 'validated', 'shadow', 'active', 'deprecated', 'retired', 'retiring', 'fenced']);
export type MemoryIndexGenerationStatus = z.infer<typeof MemoryIndexGenerationStatus>;

/** manifest 状态（不可变快照：frozen → fenced）。 */
export const MemoryIndexManifestStatus = z.enum(['frozen', 'fenced']);
export type MemoryIndexManifestStatus = z.infer<typeof MemoryIndexManifestStatus>;

/** 缓存 kind（检索缓存 / 来源水合缓存）。 */
export const MemoryIndexCacheKind = z.enum(['retrieval', 'hydration']);
export type MemoryIndexCacheKind = z.infer<typeof MemoryIndexCacheKind>;

/** 缓存条目状态（live/invalidated；命中前重验 epoch/status）。 */
export const MemoryIndexCacheStatus = z.enum(['live', 'invalidated']);
export type MemoryIndexCacheStatus = z.infer<typeof MemoryIndexCacheStatus>;

/** 冻结 manifest 回执（服务端回吐；客户端不可回写 owner/epoch/consent revision）。 */
export const MemoryIndexManifestReceipt = z.object({
  manifestId: z.string().uuid(),
  manifestDigest: z.string().regex(/^[a-f0-9]{64}$/),
  factCount: z.number().int().nonnegative(),
  privacyEpoch: z.number().int().positive(),
  consentRevision: z.number().int().positive(),
  replayed: z.boolean(),
}).strict();
export type MemoryIndexManifestReceipt = z.infer<typeof MemoryIndexManifestReceipt>;

/** generation 构建/验证/切换回执（统一形状；服务端回吐）。 */
export const MemoryIndexGenerationReceipt = z.object({
  id: z.string().uuid(),
  status: MemoryIndexGenerationStatus,
}).strict();
export type MemoryIndexGenerationReceipt = z.infer<typeof MemoryIndexGenerationReceipt>;

/* ───────────── memory two-stage recall (MEM-14) ─────────────
 * 两阶段召回 + 派发前复核（ContextSnapshot 冻结）的多端契约形状。与 privacy/memory 块同理，
 * 这些形状**仅冻结跨端 schema**，不登记进 apiContract（不进 OpenAPI）——召回/冻结/派发复核是
 * 服务端/worker 契约，公开 HTTP 路径保持 fail-closed。
 *
 * 铁律：第一段候选卡片**绝无 content / 裸 embedding**（只有 digest + span_locator provenance，
 * content 只在第二段水合重验后经 sourceCard 吐出）；ContextSnapshot 用显式 enum
 * MemoryRecallContextSnapshotStatus（published/consumed/voided，禁布尔汤），围栏先赢 → voided、
 * 派发先赢 → consumed。
 */
/** 第一段检索方式：vector / keyword / hybrid（deterministic seam；真实 rerank 归 MODEL-OP）。 */
export const MemoryRecallRetrievalKind = z.enum(['vector', 'keyword', 'hybrid']);
export type MemoryRecallRetrievalKind = z.infer<typeof MemoryRecallRetrievalKind>;

/** 第二段水合拒绝 reason code（显式 enum，禁布尔汤；任一失败 → rejected，绝不回退旧缓存）。 */
export const MemoryRecallRejectionReason = z.enum([
  'scope_forbidden', 'status_not_active', 'expired', 'digest_mismatch',
  'consent_revoked', 'data_class_forbidden', 'conflict_superseded', 'budget_exceeded',
]);
export type MemoryRecallRejectionReason = z.infer<typeof MemoryRecallRejectionReason>;

/** ContextSnapshot 状态机（显式 enum）：published → consumed/voided；围栏先赢 → voided、派发先赢 → consumed。 */
export const MemoryRecallContextSnapshotStatus = z.enum(['published', 'consumed', 'voided']);
export type MemoryRecallContextSnapshotStatus = z.infer<typeof MemoryRecallContextSnapshotStatus>;

/** 第一段候选来源卡片：只含 digest + provenance，**绝无 content / 裸 embedding**。 */
export const MemoryRecallCandidateCard = z.object({
  factId: z.string().uuid(),
  factKey: z.string().regex(/^[a-f0-9]{64}$/),
  retrievalKind: MemoryRecallRetrievalKind,
  retrievalScore: z.number(),
  sourceEntityId: z.string().nullable(),
  immutableSourceVersion: z.string().nullable(),
  sourceArtifactDigest: z.string().regex(/^[a-f0-9]{64}$/),
  spanLocator: z.unknown(),
  contentDigest: z.string().regex(/^[a-f0-9]{64}$/),
  factVersion: z.number().int().positive(),
  allowedDataClass: MemoryAllowedDataClass,
}).strict();
export type MemoryRecallCandidateCard = z.infer<typeof MemoryRecallCandidateCard>;

/** 第二段水合后的来源卡片：content 只在重验通过（accepted）后经此吐给模型数据块。 */
export const MemorySourceCard = z.object({
  factId: z.string().uuid(),
  factKey: z.string().regex(/^[a-f0-9]{64}$/),
  content: z.string(),
  contentDigest: z.string().regex(/^[a-f0-9]{64}$/),
  sourceEntityId: z.string().nullable(),
  immutableSourceVersion: z.string().nullable(),
  sourceArtifactDigest: z.string().regex(/^[a-f0-9]{64}$/),
  spanLocator: z.unknown(),
  allowedDataClass: MemoryAllowedDataClass,
  factVersion: z.number().int().positive(),
}).strict();
export type MemorySourceCard = z.infer<typeof MemorySourceCard>;

/** 第二段水合重验 verdict：accepted（带 sourceCard）/ rejected（带 reasonCode，无 content）。 */
export const MemoryRecallHydrationVerdict = z.object({
  factId: z.string().uuid(),
  verdict: z.enum(['accepted', 'rejected']),
  reasonCode: MemoryRecallRejectionReason.nullable(),
  sourceCard: MemorySourceCard.nullable(),
}).strict();
export type MemoryRecallHydrationVerdict = z.infer<typeof MemoryRecallHydrationVerdict>;

/** 冻结 ContextSnapshot 回执（服务端回吐；replayed=true 表示同 snapshot_key 幂等回放同选择）。 */
export const MemoryContextSnapshotReceipt = z.object({
  snapshotId: z.string().uuid(),
  status: MemoryRecallContextSnapshotStatus,
  authorizationVersion: z.string().regex(/^[a-f0-9]{64}$/),
  consentRevision: z.number().int().positive(),
  privacyEpoch: z.number().int().positive(),
  generationManifestDigest: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  retrievalPolicyVersion: z.string(),
  budget: z.number().int().nonnegative(),
  rendererVersion: z.string(),
  renderDigest: z.string().regex(/^[a-f0-9]{64}$/),
  voidReason: z.string().nullable(),
  replayed: z.boolean(),
}).strict();
export type MemoryContextSnapshotReceipt = z.infer<typeof MemoryContextSnapshotReceipt>;

/** 派发前复核决策：dispatchDecision=1 派发（consumed）；=0 不派发（voided/围栏先赢）。 */
export const MemoryDispatchDecision = z.object({
  snapshotId: z.string().uuid(),
  status: MemoryRecallContextSnapshotStatus,
  dispatchDecision: z.union([z.literal(0), z.literal(1)]),
  voidReason: z.string().nullable(),
}).strict();
export type MemoryDispatchDecision = z.infer<typeof MemoryDispatchDecision>;

/* ───────────── scoring fact root (SCOR-01) ─────────────
 * 版本化 rubric 与两阶段评分事实根的多端契约形状。与上方 privacy/memory/INT 块同理，
 * 这些形状**仅冻结跨端 schema**，不登记进 apiContract（不进 OpenAPI）——评分事实根是
 * 服务端/worker 契约，公开 HTTP 路径保持 fail-closed。状态枚举与 packages/domain 的
 * SCORE_CARD_STATUSES/SCORE_REQUEST_STATUSES 逐值一致（跨侧 test pin 兜底）。
 *
 * 铁律（schema 层承重，非触发器补）：`IssuedQuestionContractShape` **绝无** answerId /
 * answerHash / answerVersion 字段——发题时答案尚不存在，issue 阶段只冻题不冻答案；submission
 * 阶段 `ScoreRequestShape` 才以 canonical artifact（answerId=artifactId + submissionId +
 * answerBodyHmac）绑答案。二者在写卡事务内受控绑定。
 */
/** ScoreCard 状态（证据流 + 生命周期；unscored/review_required/calibration_blocked/evidence_invalid 非 0 分）。 */
export const ScoreCardStatus = z.enum(['pending_evidence', 'evidence_valid', 'evidence_invalid', 'unscored', 'practice_eligible', 'review_required', 'calibration_blocked', 'b_review_eligible', 'superseded', 'fenced']);
export type ScoreCardStatus = z.infer<typeof ScoreCardStatus>;
/** ScoreRequest permit/fence 状态（claim/dispatch 单次；删除/撤权先赢 → fenced）。 */
export const ScoreRequestStatus = z.enum(['pending', 'claimed', 'dispatched', 'scored', 'fenced']);
export type ScoreRequestStatus = z.infer<typeof ScoreRequestStatus>;
/** QuestionRubric 状态（唯一可达态 published；append-only）。 */
export const QuestionRubricStatus = z.enum(['published']);
export type QuestionRubricStatus = z.infer<typeof QuestionRubricStatus>;

/** issue 阶段冻结的题目契约。**无 answer 字段**（铁律：发题时答案不存在）。 */
export const IssuedQuestionContractShape = z.object({
  id: z.string().uuid(),
  ownerUserId: z.string().min(1).max(128),
  interviewId: z.string().min(1).max(128),
  questionId: z.string().min(1).max(128),
  stateVersion: z.number().int().nonnegative(),
  turn: z.number().int().nonnegative(),
  questionContentHash: z.string().regex(/^[a-f0-9]{64}$/),
  rubricId: z.string().uuid(),
  difficulty: z.number().int().min(1).max(5),
  form: z.string().min(1).max(64),
  language: z.string().regex(/^[a-z]{2}(-[A-Za-z0-9]+)?$/),
  route: z.string().min(1).max(128),
  promptPolicyVersion: z.string().min(1).max(64),
  measurementVersion: z.string().min(1).max(64),
  privacyEpoch: z.number().int().positive(),
  status: z.literal('issued'),
}).strict();
export type IssuedQuestionContractShape = z.infer<typeof IssuedQuestionContractShape>;

/** rubric 分项输入（criterionId + 权重 + 行为锚点 + 上限规则，随 rubric 一起冻结）。 */
export const RubricCriterionInput = z.object({
  criterionId: z.string().min(1).max(128),
  weight: z.number().positive(),
  behaviorAnchors: z.array(z.unknown()).optional(),
  capRules: z.record(z.string(), z.unknown()).optional(),
  position: z.number().int().nonnegative().optional(),
}).strict();
export type RubricCriterionInput = z.infer<typeof RubricCriterionInput>;

/** submission 阶段追加的答案版本/评分请求（绑 canonical artifact + permit/lease）。 */
export const ScoreRequestShape = z.object({
  id: z.string().uuid(),
  ownerUserId: z.string().min(1).max(128),
  interviewId: z.string().min(1).max(128),
  issuedContractId: z.string().uuid(),
  submissionId: z.string().uuid(),
  artifactId: z.string().uuid(),
  answerVersion: z.number().int().positive(),
  answerBodyHmac: z.string().regex(/^[a-f0-9]{64}$/),
  privacyEpoch: z.number().int().positive(),
  operationPolicyVersion: z.string().min(1).max(64),
  idempotencyKey: z.string().min(1).max(128),
  status: ScoreRequestStatus,
}).strict();
export type ScoreRequestShape = z.infer<typeof ScoreRequestShape>;

/** append-only 评分卡（更正以 supersedesCardId 指旧卡，绝不覆盖历史）。 */
export const ScoreCardShape = z.object({
  id: z.string().uuid(),
  ownerUserId: z.string().min(1).max(128),
  interviewId: z.string().min(1).max(128),
  questionId: z.string().min(1).max(128),
  answerId: z.string().uuid(),
  submissionId: z.string().uuid(),
  scoreRequestId: z.string().uuid(),
  issuedContractId: z.string().uuid(),
  rubricId: z.string().uuid(),
  rubricVersion: z.number().int().positive(),
  measurementVersion: z.string().min(1).max(64),
  deterministicTotal: z.number().nonnegative(),
  coverage: z.number().min(0).max(1),
  uncertainty: z.record(z.string(), z.unknown()),
  status: ScoreCardStatus,
  provenance: z.record(z.string(), z.unknown()),
  supersedesCardId: z.string().uuid().nullable(),
}).strict();
export type ScoreCardShape = z.infer<typeof ScoreCardShape>;

/** 评分卡分项（criterionId/disposition/score/weight 冻结）。 */
export const ScoreCardCriterionShape = z.object({
  id: z.string().uuid(),
  ownerUserId: z.string().min(1).max(128),
  cardId: z.string().uuid(),
  criterionId: z.string().min(1).max(128),
  disposition: z.string().min(1).max(64),
  score: z.number().nonnegative(),
  weight: z.number().positive(),
}).strict();
export type ScoreCardCriterionShape = z.infer<typeof ScoreCardCriterionShape>;

/* ───────────── scoring deterministic aggregation (SCOR-02) ─────────────
 * 专用终态 score-writer + C 端只读聚合的多端契约形状。与 SCOR-01 块同理：这些形状
 * **仅冻结跨端 schema**，不登记进 apiContract（不进 OpenAPI）——评分是服务端/worker
 * 契约，公开 HTTP 路径保持 fail-closed。模型只输出 criterionId + span + digest +
 * disposition，总分在服务端按确定性公式算（模型不得输出自由总分）。
 */
/** 判定档位（有限档；per-criterion score = 50×band）。 */
export const ScoreDispositionBand = z.enum(['below', 'meets', 'exceeds']);
export type ScoreDispositionBand = z.infer<typeof ScoreDispositionBand>;

/** 规范化 span（单一坐标系 UTF-8 字节；end >= start）。 */
export const ScoreSpanShape = z.object({
  offsetKind: z.literal('utf8_byte'),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
}).strict().refine((s) => s.end >= s.start, 'span end must be >= span start');
export type ScoreSpanShape = z.infer<typeof ScoreSpanShape>;

/** ScoreEvidence：criterionId + canonical artifact + 规范化 span + span digest + 判定档位。 */
export const ScoreEvidenceShape = z.object({
  criterionId: z.string().min(1).max(128),
  sourceAnswerId: z.string().uuid(),
  answerVersion: z.number().int().positive(),
  span: ScoreSpanShape,
  spanDigest: z.string().regex(/^[a-f0-9]{64}$/),
  disposition: ScoreDispositionBand,
}).strict();
export type ScoreEvidenceShape = z.infer<typeof ScoreEvidenceShape>;

/** 专用终态 writer 可写的目标态（isScoreCardScorable 门）。 */
export const FinalScoreCardStatus = z.enum(['practice_eligible', 'b_review_eligible']);
export type FinalScoreCardStatus = z.infer<typeof FinalScoreCardStatus>;

/** 终态写卡结果（recorded 恒 true 的 strict shape；拒绝路径以异常表达，不返回 shape）。 */
export const FinalScoreCardWriteResult = z.object({
  cardId: z.string().uuid(),
  status: FinalScoreCardStatus,
  deterministicTotal: z.number().int().min(0).max(100),
  coverage: z.number().min(0).max(1),
  uncertainty: z.record(z.string(), z.unknown()),
  recorded: z.literal(true),
}).strict();
export type FinalScoreCardWriteResult = z.infer<typeof FinalScoreCardWriteResult>;

/** C 端只读聚合（无有效可评分卡 → deterministicOverall = null，无分 ≠ 0 分）。 */
export const InterviewScoreAggregate = z.object({
  eligibleCardCount: z.number().int().nonnegative(),
  deterministicOverall: z.number().int().min(0).max(100).nullable(),
  nonScoringCardCount: z.number().int().nonnegative(),
}).strict();
export type InterviewScoreAggregate = z.infer<typeof InterviewScoreAggregate>;

/* ───────────── 契约注册表(多端契约源) ───────────── */
export interface ContractRoute {
  id: string;
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;                       // OpenAPI 路径模板,如 /interview/{id}
  summary: string;
  tags: string[];
  auth?: boolean;                     // 需 Bearer
  request?: z.ZodType;                // 请求体 schema(ZodValidationPipe + OpenAPI requestBody)
  response?: z.ZodType;               // 200 响应 schema(OpenAPI + 前端校验)
}

/** 全站契约注册表。**新增端点在此登记** → 自动进 OpenAPI + 可被 pipe/前端复用。 */
export const apiContract: ContractRoute[] = [
  { id: 'livez', method: 'get', path: '/livez', summary: '进程存活探针（不访问外部依赖）', tags: ['health'], response: HealthOk },
  { id: 'readyzApi', method: 'get', path: '/readyz/api', summary: 'API 就绪探针（受限数据库读）', tags: ['health'], response: HealthOk },
  { id: 'healthCompatibility', method: 'get', path: '/health', summary: 'API 就绪探针兼容路径', tags: ['health'], response: HealthOk },
  { id: 'authLogin', method: 'post', path: '/auth/login', summary: '登录', tags: ['auth'], request: Credentials, response: AuthResult },
  { id: 'authSignup', method: 'post', path: '/auth/signup', summary: '注册', tags: ['auth'], request: Credentials, response: AuthResult },
  { id: 'getProfile', method: 'get', path: '/profile', summary: '当前用户资料', tags: ['profile'], auth: true, response: Profile },
  { id: 'getOverview', method: 'get', path: '/profile/overview', summary: '总览统计', tags: ['profile'], auth: true, response: Overview },
  { id: 'getGrowth', method: 'get', path: '/profile/growth', summary: '成长档案/能力曲线(读侧聚合)', tags: ['profile'], auth: true, response: GrowthView },
  { id: 'listResume', method: 'get', path: '/resume', summary: '简历列表', tags: ['resume'], auth: true, response: ResumeList },
  { id: 'uploadResume', method: 'post', path: '/resume', summary: '上传简历(文本)', tags: ['resume'], auth: true, request: UploadResumeDto },
  { id: 'uploadResumeFile', method: 'post', path: '/resume/file', summary: '上传简历文件(PDF/Word/图片→提取+清洗)', tags: ['resume'], auth: true, request: UploadResumeFileDto },
  { id: 'listInterview', method: 'get', path: '/interview', summary: '面试列表', tags: ['interview'], auth: true, response: InterviewList },
  { id: 'getInterview', method: 'get', path: '/interview/{id}', summary: '面试详情', tags: ['interview'], auth: true, response: InterviewView },
  { id: 'beginInterview', method: 'post', path: '/interview/{id}/begin', summary: '开始面试', tags: ['interview'], auth: true, response: BeginResult },
  { id: 'turnInterview', method: 'post', path: '/interview/{id}/turn', summary: '提交一题答案(绑定服务端问题身份后入队)', tags: ['interview'], auth: true, request: TurnDto, response: TurnResult },
  { id: 'questionFeedback', method: 'post', path: '/interview/{id}/questions/{idx}/feedback', summary: '题目反馈(赞/踩 + 可选评语)', tags: ['interview'], auth: true, request: FeedbackDto },
  { id: 'completeLearningItem', method: 'post', path: '/interview/{id}/learning-plan/complete', summary: '标记学习项完成', tags: ['interview'], auth: true, request: LearningCompleteDto },
  { id: 'transcribeInterview', method: 'post', path: '/interview/{id}/transcribe', summary: '语音作答转写(qwen-audio ASR→文本)', tags: ['interview'], auth: true, request: TranscribeDto, response: TranscribeResult },
  { id: 'speakInterview', method: 'post', path: '/interview/{id}/speak', summary: '题目语音播报(qwen-tts→音频)', tags: ['interview'], auth: true, request: SpeakDto, response: SpeakResult },
  // POST /interview/{id}/speak/stream(流式 TTS,cosyvoice WS 边合成边吐 MP3 块,首音 ~1-2s)是 audio/mpeg 二进制流、非 JSON 响应,不入 apiContract(对齐 events SSE);请求体仍复用 SpeakDto 真校验。
  { id: 'listQuiz', method: 'get', path: '/quiz', summary: '押题列表', tags: ['quiz'], auth: true, response: QuizList },
  { id: 'createQuiz', method: 'post', path: '/quiz', summary: '新建押题(空壳,begin 才跑图扣额度)', tags: ['quiz'], auth: true, response: QuizCreated },
  { id: 'getQuiz', method: 'get', path: '/quiz/{id}', summary: '押题详情(题目+考察点+报告)', tags: ['quiz'], auth: true, response: QuizView },
  { id: 'beginQuiz', method: 'post', path: '/quiz/{id}/begin', summary: '开始押题(扣额度+入队 resume-quiz 图)', tags: ['quiz'], auth: true, response: QuizBeginResult },
  // SSE 事件流 /quiz/{id}/events(progress/question_ready/quiz_ready/quiz_unavailable)非 JSON 响应,不入 apiContract(对齐 interview events)。
  { id: 'listDiagnosis', method: 'get', path: '/diagnosis', summary: '简历诊断列表', tags: ['diagnosis'], auth: true, response: DiagnosisList },
  { id: 'createDiagnosis', method: 'post', path: '/diagnosis', summary: '新建简历诊断(空壳,begin 才跑图扣额度)', tags: ['diagnosis'], auth: true, response: DiagnosisCreated },
  { id: 'getDiagnosis', method: 'get', path: '/diagnosis/{id}', summary: '诊断详情(结构/亮点/风险/匹配度+改写建议)', tags: ['diagnosis'], auth: true, response: DiagnosisView },
  { id: 'beginDiagnosis', method: 'post', path: '/diagnosis/{id}/begin', summary: '开始诊断(扣额度+入队 resume-diagnosis 图)', tags: ['diagnosis'], auth: true, response: DiagnosisBeginResult },
  // SSE 事件流 /diagnosis/{id}/events(progress/section_ready/diagnosis_ready/diagnosis_unavailable)非 JSON 响应,不入 apiContract(对齐 quiz events)。
  { id: 'listProducts', method: 'get', path: '/commerce/products', summary: '面试包列表', tags: ['commerce'], response: Products },
  { id: 'getEntitlement', method: 'get', path: '/commerce/entitlement', summary: '剩余额度', tags: ['commerce'], auth: true, response: Entitlement },
  { id: 'createOrder', method: 'post', path: '/commerce/orders', summary: '创建订单', tags: ['commerce'], auth: true, request: CreateOrderDto, response: OrderResult },
  { id: 'createJob', method: 'post', path: '/recruiter/jobs', summary: '招聘方发布岗位', tags: ['recruiter'], auth: true, request: CreateJobDto, response: JobView },
  { id: 'listJobs', method: 'get', path: '/recruiter/jobs', summary: '招聘方岗位列表(租户隔离)', tags: ['recruiter'], auth: true, response: JobList },
  { id: 'getJob', method: 'get', path: '/recruiter/jobs/{id}', summary: '岗位详情', tags: ['recruiter'], auth: true, response: JobView },
  { id: 'jobCandidates', method: 'get', path: '/recruiter/jobs/{id}/candidates', summary: '招聘方查岗位申请人(多方 RLS)', tags: ['recruiter'], auth: true, response: JobCandidates },
  { id: 'inviteCandidate', method: 'post', path: '/recruiter/jobs/{id}/invite', summary: '招聘方邀请候选人面试(用同一引擎,数据严格隔离)', tags: ['recruiter'], auth: true, request: InviteCandidateDto, response: InviteResult },
  { id: 'talentPool', method: 'get', path: '/recruiter/talent', summary: '招聘方人才库(跨自有岗位聚合候选人,租户隔离)', tags: ['recruiter'], auth: true, response: TalentPool },
  { id: 'browseJobs', method: 'get', path: '/jobs', summary: '候选人浏览开放岗位', tags: ['jobs'], auth: true, response: JobList },
  { id: 'applyJob', method: 'post', path: '/jobs/{id}/apply', summary: '候选人投递岗位(幂等)', tags: ['jobs'], auth: true, response: ApplyResult },
  { id: 'myApplications', method: 'get', path: '/applications', summary: '候选人我的申请', tags: ['jobs'], auth: true, response: MyApplications },
  { id: 'startApplication', method: 'post', path: '/applications/{id}/start', summary: '创建或复用岗位绑定面试(一对一、不可替换为历史训练)', tags: ['jobs'], auth: true, request: StartApplicationDto, response: ApplicationStartResult },
  { id: 'declineApplication', method: 'post', path: '/applications/{id}/decline', summary: '候选人婉拒邀请(状态机 invited→declined)', tags: ['jobs'], auth: true, response: InviteResult },
  { id: 'finalizeApplication', method: 'post', path: '/applications/{id}/finalize', summary: '确认岗位绑定面试结果(不接受客户端 interviewId)', tags: ['jobs'], auth: true, request: FinalizeApplicationDto, response: ApplicationFinalizeResult },
];

/* ───────────── RAG-FUNNEL-03 岗位意图路由（跨端冻结 schema，不入 apiContract） ───────────── */
// 岗位编辑输入镜像 CreateJobDto：只允许 title/description/competencies 三个业务语义字段；
// trackId/weight/confidence/override 等路由参数结构上不可由用户提交（没有这些字段）。
export const UpdateJobDto = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(8_000).optional(),
  competencies: z.array(z.string().max(60)).max(30).optional(),
});
export type UpdateJobDto = z.infer<typeof UpdateJobDto>;

// 叶节点分配：allocations 以 basis points 计，总和必须 = 10000（万分之一）。仅冻结 schema，不登记 HTTP。
export const JobRouteAllocation = z.object({
  leafTrackId: z.string().regex(/^[a-z][a-z0-9_]*(?:\/[a-z][a-z0-9_]*){0,3}$/),
  allocationBps: z.number().int().min(1).max(10000),
});
export type JobRouteAllocation = z.infer<typeof JobRouteAllocation>;

export const JobRouteDecision = z.object({
  id: z.string(),
  jobId: z.string(),
  revision: z.number().int().min(1),
  routeOutcome: z.enum(['route_decided', 'route_unresolved']),
  attemptOutcome: z.enum(['rule_decided', 'result_validated', 'known_not_sent', 'dispatched_unknown', 'validation_rejected']),
  taxonomyVersion: z.string().regex(/^v[1-9][0-9]{0,15}$/),
  policyVersion: z.string().min(1).max(64),
  allocations: z.array(JobRouteAllocation),
  confidenceBps: z.number().int().min(0).max(10000).nullable(),
  marginBps: z.number().int().min(0).max(10000).nullable(),
  reasonCodes: z.array(z.string()),
  decisionHash: z.string().regex(/^[0-9a-f]{64}$/),
});
export type JobRouteDecision = z.infer<typeof JobRouteDecision>;

export const JobSemanticRevision = z.object({
  jobId: z.string(),
  revision: z.number().int().min(1),
  semanticDigest: z.string().regex(/^[0-9a-f]{64}$/),
  inputHmac: z.string().regex(/^[0-9a-f]{64}$/),
  status: z.enum(['route_pending', 'rule_decided', 'model_prepared', 'result_validated', 'route_decided', 'route_unresolved']),
});
export type JobSemanticRevision = z.infer<typeof JobSemanticRevision>;

// 图内 planner 输出合同：服务端校验 leaf 必须属于 snapshot、difficulty 1..5。
export const InterviewPlannerOutput = z.object({
  leafTrackId: z.string(),
  competencyId: z.string().min(1).max(64),
  difficulty: z.number().int().min(1).max(5),
});

/* ───────────── immutable session event source (CTX-03) ─────────────
 * 不可变会话事件源（PRD-TEST-012 · CTX-03）的多端契约形状。与 privacy/memory 块同理，这些
 * 形状**仅冻结跨端 schema**，不登记进 apiContract（不进 OpenAPI）——事件源是服务端/worker
 * 契约，公开 HTTP 路径保持 fail-closed。状态枚举与 packages/domain 的
 * CONVERSATION_EVENT_CATEGORIES/SOURCES/STATUSES 逐值一致（跨侧 test pin 兜底）。
 *
 * 铁律：ConversationEventShape **绝无正文字段**（正文只存加密工件
 * conversation_event_artifact，关系行只留 eventDigest/bodyHmac/artifactRef 指纹）；EventRef
 * 是 checkpoint 唯一持久引用形状（thread + range + version + digest），无正文、绝不反转成
 * 聊天历史。
 */
/** 事件类别（显式 enum，最小集；禁布尔汤）。 */
export const ConversationEventCategory = z.enum([
  'turn_start', 'user_message', 'assistant_message', 'tool_call', 'tool_result', 'system_note',
]);
export type ConversationEventCategory = z.infer<typeof ConversationEventCategory>;

/** 事件来源（provenance，显式 enum）。 */
export const ConversationEventSource = z.enum(['user', 'model', 'tool', 'system']);
export type ConversationEventSource = z.infer<typeof ConversationEventSource>;

/** 保留策略类别（显式 enum）。 */
export const ConversationRetentionClass = z.enum(['session', 'account', 'derived']);
export type ConversationRetentionClass = z.infer<typeof ConversationRetentionClass>;

/** 同意用途（显式 enum）。 */
export const ConversationConsentPurpose = z.enum(['free_conversation']);
export type ConversationConsentPurpose = z.infer<typeof ConversationConsentPurpose>;

/** 事件/工件状态机（显式 enum，单向）。 */
export const ConversationEventStatus = z.enum(['active', 'privacy_fenced', 'purged']);
export type ConversationEventStatus = z.infer<typeof ConversationEventStatus>;

/** 事件关系行（watermark）：无正文、无 ciphertext，只有指纹 + 授权元数据 + 工件引用。 */
export const ConversationEventShape = z.object({
  eventId: z.string().uuid(),
  sequence: z.number().int().positive(),
  category: ConversationEventCategory,
  source: ConversationEventSource,
  eventDigest: z.string().regex(/^[a-f0-9]{64}$/),
  artifactId: z.string().uuid(),
  bodyHmac: z.string().regex(/^[a-f0-9]{64}$/),
  hmacKeyVersion: z.number().int().positive(),
  encKeyVersion: z.number().int().positive(),
  retentionClass: ConversationRetentionClass,
  consentPurpose: ConversationConsentPurpose,
  consentRevision: z.number().int().positive(),
  privacyEpoch: z.number().int().positive(),
  status: ConversationEventStatus,
  version: z.number().int().positive(),
}).strict();
export type ConversationEventShape = z.infer<typeof ConversationEventShape>;

/** checkpoint 事件引用（EventRef）：thread + range + version + digest，无正文。 */
export const ConversationEventRef = z.object({
  threadId: z.string().min(1).max(128),
  fromSequence: z.number().int().positive(),
  toSequence: z.number().int().positive(),
  refVersion: z.number().int().positive(),
  eventCount: z.number().int().nonnegative(),
  rangeDigest: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type ConversationEventRef = z.infer<typeof ConversationEventRef>;

/** append 回执（服务端回吐；replayed=true 表示同 event_key 幂等回放同事件）。 */
export const ConversationEventAppendReceipt = z.object({
  eventId: z.string().uuid(),
  sequence: z.number().int().positive(),
  eventDigest: z.string().regex(/^[a-f0-9]{64}$/),
  bodyHmac: z.string().regex(/^[a-f0-9]{64}$/),
  artifactId: z.string().uuid(),
  replayed: z.boolean(),
}).strict();
export type ConversationEventAppendReceipt = z.infer<typeof ConversationEventAppendReceipt>;
export type InterviewPlannerOutput = z.infer<typeof InterviewPlannerOutput>;
