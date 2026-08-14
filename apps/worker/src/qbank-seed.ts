/**
 * 起步共享题库种子(**自撰通用能力题**,自有措辞、非抄录任何站点、无版权问题)。覆盖常见后端/系统能力。
 * 仅起步种子;真正策展/授权题库由运营离线灌(ingestQbank)。CRAG 据此检索真题接地出题。
 */
import { QBANK_TAXONOMY_V1, type QbankItem, type QbankQuestionArtifact } from './qbank-ingest.ts';

type BootstrapSeedItem = Pick<QbankItem, 'refId' | 'text' | 'kind'>;

const QBANK_SEED_SOURCE: BootstrapSeedItem[] = [
  // 限流 / 高并发
  { refId: 'seed:limit-1', text: '设计一个分布式限流器,谈谈滑动窗口与令牌桶的取舍及超阈值的降级策略' },
  { refId: 'seed:limit-2', text: '高并发下如何防止缓存击穿打垮下游数据库' },
  { refId: 'seed:limit-3', text: '秒杀系统如何扛住瞬时高并发并严格防超卖,谈谈你的整体方案与权衡' },
  // 缓存
  { refId: 'seed:cache-1', text: '缓存穿透、击穿、雪崩的区别,各自的预防手段' },
  { refId: 'seed:cache-2', text: '如何保证缓存与数据库的一致性,常见方案的边界条件' },
  { refId: 'seed:cache-3', text: '多级缓存如何设计,本地缓存与分布式缓存的取舍和一致性怎么处理' },
  // 锁 / 并发
  { refId: 'seed:lock-1', text: '分布式锁如何做到可重入、防误删、自动续期' },
  { refId: 'seed:concur-1', text: '线程池核心参数如何设置,任务堆积与拒绝策略怎么权衡' },
  { refId: 'seed:concur-2', text: '谈谈你对 Java 内存模型/可见性的理解,volatile 和锁分别解决什么' },
  // 数据库
  { refId: 'seed:db-1', text: '一条慢查询如何定位与优化,索引为什么会失效' },
  { refId: 'seed:db-2', text: '事务隔离级别与幻读,如何在高并发下兼顾一致性与吞吐' },
  { refId: 'seed:db-3', text: '分库分表后如何处理跨库 join、分布式事务和全局唯一 id' },
  { refId: 'seed:db-4', text: 'B+ 树索引为什么适合数据库,和哈希索引、跳表的取舍' },
  // 消息队列 / 中间件
  { refId: 'seed:mq-1', text: '消息队列如何保证不丢、不重、有序,各自的代价' },
  { refId: 'seed:mq-2', text: '消息积压如何快速消费完,消费端如何做幂等' },
  // 系统设计
  { refId: 'seed:design-1', text: '设计一个短链系统,谈谈发号、存储与高可用' },
  { refId: 'seed:design-2', text: '设计一个秒杀系统,如何扛住瞬时高并发并防超卖' },
  { refId: 'seed:design-3', text: '设计一个支持千万级用户的 feed 流,推模式拉模式怎么选' },
  { refId: 'seed:design-4', text: '设计一个分布式 id 生成器,谈谈 snowflake 的时钟回拨问题' },
  // 网络
  { refId: 'seed:net-1', text: 'TCP 三次握手与四次挥手,以及 TIME_WAIT 过多怎么处理' },
  { refId: 'seed:net-2', text: 'HTTP/1.1、HTTP/2、HTTP/3 的演进解决了什么问题' },
  { refId: 'seed:net-3', text: '一次完整的 HTTPS 握手过程,以及为什么既用非对称又用对称加密' },
  // 操作系统
  { refId: 'seed:os-1', text: '进程与线程的区别,协程相比线程的优势和适用场景' },
  { refId: 'seed:os-2', text: '什么是零拷贝,它在哪些场景(如 Kafka)带来性能提升' },
  // 微服务 / 分布式
  { refId: 'seed:micro-1', text: '服务雪崩怎么发生,熔断、限流、降级各自解决什么' },
  { refId: 'seed:micro-2', text: 'CAP 与 BASE,实际系统里如何在一致性与可用性间做取舍' },
  { refId: 'seed:micro-3', text: '一个跨多个服务的操作如何保证最终一致性,谈谈 saga / 本地消息表' },
  // 可观测 / 稳定性
  { refId: 'seed:obs-1', text: '线上一个接口突然变慢,你的排查思路和会看哪些指标' },
  { refId: 'seed:obs-2', text: '如何设计一套监控告警,避免告警风暴又不漏关键故障' },
  // AI / RAG 架构边界
  { refId: 'seed:rag-1', text: '一个单知识库、单入口的 RAG 问答系统，和一个同时支持技术问答、订单查询、退款办理、闲聊的系统，分别何时需要意图识别/路由器？说明不该引入路由器的情形；若引入，设计意图集合、置信度阈值、低置信回退、上下文指代处理、审计指标，并解释为什么不能让分类结果直接执行扣款或退款。' },
  // JVM / 运行时
  { refId: 'seed:jvm-1', text: '一次 Full GC 频繁的线上问题你会怎么定位和优化' },
  // 安全
  { refId: 'seed:sec-1', text: '常见的 Web 攻击(XSS/CSRF/SQL 注入)各自原理和防护' },
  { refId: 'seed:sec-2', text: '用户密码应该怎么存,为什么不能明文/MD5,加盐和慢哈希解决什么' },
];

/**
 * Bootstrap material was manually reviewed with the initial taxonomy.  The
 * route is intentionally assigned at cut time, not inferred later from a job
 * or a retrieval query.  The seed does not pretend its broad systems questions
 * are language-specific; only JVM/JMM material lands in the Java leaf.
 */
const bootstrapScope = (refId: string): string => {
  const prefix = refId.split(':')[1]?.split('-')[0];
  if (prefix === 'jvm' || prefix === 'concur') return 'backend/java';
  if (prefix === 'rag') return 'ai_ml/applied';
  return 'backend/general';
};

export const QBANK_SEED: QbankItem[] = QBANK_SEED_SOURCE.map((item) => ({
  ...item,
  taxonomyVersion: QBANK_TAXONOMY_V1,
  servingScopeId: bootstrapScope(item.refId),
  annotationSource: 'seed_v1_reviewed',
}));

const COMPETENCY: Record<string, string> = {
  limit: '限流与过载保护', cache: '缓存与一致性', lock: '并发控制', concur: 'JVM 并发', db: '数据库',
  mq: '消息可靠性', design: '系统设计', net: '网络协议', os: '操作系统', micro: '分布式系统',
  obs: '可观测性', rag: 'Agent 与 RAG', jvm: 'JVM 运行时', sec: '应用安全',
};

const COACHING: Record<string, { rubric: string; followUp: string; antiPattern: string }> = {
  limit: {
    rubric: '容量、补充速率与超额行为可量化；分布式扣减必须原子；说明 Redis 集群键位、时钟、降级、指标与压测门。',
    followUp: '多机房时如何避免热点 key 和跨分片计数失真？一次 Redis 主从切换后，如何限制超发上界？',
    antiPattern: '只说“上 Redis/加 Lua”而没有容量单位、失败语义、限流响应码或观测指标。',
  },
  cache: {
    rubric: '区分穿透、击穿、雪崩；说明缓存与源站的一致性契约、失效顺序、singleflight、TTL 抖动和降级读。',
    followUp: '某热点键失效时 5 万并发同时到达，互斥锁持有者崩溃且数据库 P99 上升，该如何收敛？',
    antiPattern: '把“缓存双删”当作严格一致性，或忽略写后读、重试和锁租约。',
  },
  lock: {
    rubric: '说明所有权、租约、fencing token、可重入边界、续期故障与业务幂等；锁不是事务或授权的替代品。',
    followUp: 'GC stop-the-world 超过锁 TTL 后旧持有者恢复，如何让它不能再写下游？',
    antiPattern: '仅使用 SETNX，未说明 value 校验删除、续约、网络分区或栅栏令牌。',
  },
  concur: {
    rubric: '从队列、核心/最大线程、阻塞系数、拒绝策略、背压和可观测性解释，不以固定魔法数字回答。',
    followUp: '下游变慢导致任务堆积，为什么盲目扩大线程池可能让 P99 更差？',
    antiPattern: '只列参数名称，未关联 CPU、IO、队列容量、超时与拒绝后的调用方行为。',
  },
  db: {
    rubric: '先给事务/查询语义与数据规模，再谈索引、执行计划、锁、隔离、分片和可验证的回滚路径。',
    followUp: '读写延迟冲突时，如何用指标和 EXPLAIN 证明瓶颈而非凭感觉加索引？',
    antiPattern: '把加索引、读写分离或分库分表当作无条件答案，忽略写放大和一致性。',
  },
  mq: {
    rubric: '区分至少一次、至多一次、恰好一次的端到端语义；给出幂等键、去重表/outbox、顺序分区和重放策略。',
    followUp: '消费已落库但 offset 提交失败时，重投如何不重复扣费？',
    antiPattern: '声称 MQ 能天然“绝不重复”，没有消费者状态与副作用幂等设计。',
  },
  design: {
    rubric: '先澄清规模、SLO、读写模型与失败语义；给出容量估算、数据分区、热键、降级和演练指标。',
    followUp: '依赖服务故障 30 分钟时，哪些核心路径可继续、哪些必须拒绝，如何恢复？',
    antiPattern: '只画组件图，没有流量数字、数据一致性边界、幂等键或故障后的用户体验。',
  },
  net: {
    rubric: '解释协议状态、时序和性能/安全取舍，并能将现象映射到抓包、内核指标或应用超时。',
    followUp: '连接数激增且 TIME_WAIT 很多时，如何区分正常客户端行为与连接泄漏？',
    antiPattern: '背诵握手次数，无法说明丢包、重传、连接复用或 TLS 密钥协商。',
  },
  os: {
    rubric: '将内核/调度/内存与真实 IO 路径关联，说明适用前提、零拷贝边界及可观测验证方式。',
    followUp: 'CPU 空闲但请求慢，如何区分磁盘等待、锁竞争和网络背压？',
    antiPattern: '把协程或零拷贝描述成无成本万能性能优化。',
  },
  micro: {
    rubric: '识别分区与局部失败，说明超时、重试、熔断、幂等、补偿与一致性模型的组合边界。',
    followUp: 'Saga 的补偿也失败时，谁负责人工处置、审计和重试上限？',
    antiPattern: '把 CAP 当成可随意三选二，或声称分布式事务可以免费得到一致和可用。',
  },
  obs: {
    rubric: '从 RED/USE/业务指标、关联 trace、日志脱敏和告警 SLO 说明定位链路，给出可执行阈值而非“看监控”。',
    followUp: '接口 P99 升高但平均值正常，如何定位最慢的那 1% 且避免日志泄露 PII？',
    antiPattern: '只增加日志级别，未给关联 ID、采样、报警抑制和恢复验证。',
  },
  rag: {
    rubric: '区分检索、意图路由、工具授权与业务状态机；给出多证据覆盖、拒答/澄清、ACL、评测集、版本与上线回滚门。',
    followUp: '用户说“把上面那个撤了”，上文有退款和取消面试，为什么不能直接调用工具？请给出候选实体、置信差和澄清分支。',
    antiPattern: '把 Recall@k 当正确答案率；让 LLM 分类结果直接扣费；对所有单域 RAG 强制增加 intent classifier。',
  },
  jvm: {
    rubric: '从 GC 日志、堆分代、分配速率、晋升失败、暂停时间与业务负载建立因果，再比较扩容、代码修复和参数调整。',
    followUp: 'Full GC 后短暂恢复但一分钟后复发，如何证明是泄漏、突发流量还是错误的堆配置？',
    antiPattern: '未看 GC 日志和对象存活就盲调 JVM 参数。',
  },
  sec: {
    rubric: '描述攻击前提、信任边界、服务端强制校验、编码/令牌/密钥策略、审计和验证用例；不记录敏感原文。',
    followUp: '攻击者重放一个合法请求或诱导模型执行页面中隐藏指令时，哪一层阻止、如何记录？',
    antiPattern: '只说“前端过滤/加密一下”，忽略服务端授权、输出编码、密钥轮换和重放防护。',
  },
};

/**
 * Every bootstrap question becomes four independently retrievable chunks.  The title/prompt is deliberately not
 * the only vector: a hit on a rubric, a concrete follow-up or an anti-pattern resolves to the same question entity
 * and returns the complete source-rechecked package to the graph.
 */
export const QBANK_ARTIFACTS: QbankQuestionArtifact[] = QBANK_SEED.map((item) => {
  const prefix = item.refId.split(':')[1]?.split('-')[0] ?? 'design';
  const coaching = COACHING[prefix] ?? COACHING.design!;
  const competency = COMPETENCY[prefix] ?? '工程系统设计';
  const base = `question:${item.refId}`;
  return {
    id: base,
    competency,
    difficulty: prefix === 'rag' || prefix === 'design' ? 4 : 3,
    taxonomyVersion: item.taxonomyVersion,
    servingScopeId: item.servingScopeId,
    annotationSource: item.annotationSource,
    chunks: [
      { refId: `${base}:prompt`, role: 'prompt', ordinal: 0, required: true, text: `【训练问题】${item.text}\n【能力域】${competency}\n请先澄清前提、约束和失败语义，再给出可验证的方案。` },
      { refId: `${base}:rubric`, role: 'rubric', ordinal: 0, required: true, text: `【评分锚点】${coaching.rubric}\n高分回答必须陈述至少一个可量化指标、一个失败模式和一个验证/回滚步骤。` },
      { refId: `${base}:follow-up`, role: 'follow_up', ordinal: 0, text: `【追问】${coaching.followUp}` },
      { refId: `${base}:anti-pattern`, role: 'anti_pattern', ordinal: 0, text: `【常见失分】${coaching.antiPattern}` },
    ],
  };
});
