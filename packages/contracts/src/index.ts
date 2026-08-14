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
