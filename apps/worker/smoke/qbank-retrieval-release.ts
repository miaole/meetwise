/**
 * 当前 qbank 的新建、冻结 holdout：问题以候选人的自然语言提问表达，而不是直接复用题库标题。
 * 每个 qrel 指向业务 question artifact，而不是某个偶然命中的 role chunk；线上也是由任一 chunk
 * 聚合完整 question artifact。此集不包含真实简历、面试答案或企业材料。
 */
export interface QbankRetrievalReleaseCase {
  id: string;
  query: string;
  relevantQuestionIds: string[];
  tags: readonly ('paraphrase' | 'typo' | 'mixed_language' | 'multi_evidence' | 'constraint' | 'ambiguous')[];
}

const q = (seedRefId: string) => `question:${seedRefId}`;

export const QBANK_RETRIEVAL_RELEASE: readonly QbankRetrievalReleaseCase[] = [
  { id: 'q1', query: '接口突然被大量请求冲击时，既要允许一点突发又不能超过总体配额，限流该怎么设计？', relevantQuestionIds: [q('seed:limit-1')], tags: ['paraphrase', 'constraint'] },
  { id: 'q2', query: '热门商品缓存刚失效，几十万请求同时回源；怎样让数据库不会瞬间被打挂？', relevantQuestionIds: [q('seed:limit-2')], tags: ['paraphrase', 'constraint'] },
  { id: 'q3', query: '抢购场景里用户连点、消息重投、库存并发扣减同时出现，怎么做到不卖超？', relevantQuestionIds: [q('seed:limit-3'), q('seed:design-2')], tags: ['multi_evidence', 'constraint'] },
  { id: 'q4', query: '不存在的 id、一个热点 key 失效、很多 key 集中过期，这三种缓存事故怎么区分？', relevantQuestionIds: [q('seed:cache-1')], tags: ['multi_evidence', 'paraphrase'] },
  { id: 'q5', query: '写数据库以后删缓存还是先删？短暂不一致和重试竞争要怎样收敛？', relevantQuestionIds: [q('seed:cache-2')], tags: ['constraint', 'paraphrase'] },
  { id: 'q6', query: '进程内 L1 加 Redis L2 的时候，热点和失效通知会造成什么一致性问题？', relevantQuestionIds: [q('seed:cache-3')], tags: ['mixed_language', 'paraphrase'] },
  { id: 'q7', query: 'Redis lock 的拥有者 STW 以后恢复了，如何防止它把新持有者写入的数据覆盖掉？', relevantQuestionIds: [q('seed:lock-1')], tags: ['mixed_language', 'constraint'] },
  { id: 'q8', query: '线程池队列开始堆积时，核心线程、最大线程和拒绝策略不是背参数，应该如何定？', relevantQuestionIds: [q('seed:concur-1')], tags: ['paraphrase', 'constraint'] },
  { id: 'q9', query: 'volatile 到底解决可见性还是原子性？与 synchronized 的内存语义哪里不同？', relevantQuestionIds: [q('seed:concur-2')], tags: ['mixed_language', 'paraphrase'] },
  { id: 'q10', query: 'SQL p99 变慢了，如何根据执行计划确认是索引、回表、锁还是扫描问题？', relevantQuestionIds: [q('seed:db-1')], tags: ['mixed_language', 'constraint'] },
  { id: 'q11', query: '并发扣款时怎样避免幻读和丢失更新，同时不要把数据库完全串行化？', relevantQuestionIds: [q('seed:db-2')], tags: ['multi_evidence', 'constraint'] },
  { id: 'q12', query: '表按用户拆到多库以后，报表 join、订单一致性和分布式主键分别怎么处理？', relevantQuestionIds: [q('seed:db-3')], tags: ['multi_evidence', 'paraphrase'] },
  { id: 'q13', query: '为什么关系型数据库普遍选 B+tree，不直接使用 hash 表或跳表？', relevantQuestionIds: [q('seed:db-4')], tags: ['mixed_language', 'paraphrase'] },
  { id: 'q14', query: '消费者已经写库但提交 offset 前崩了，如何在重投下既不丢也不重复副作用？', relevantQuestionIds: [q('seed:mq-1')], tags: ['mixed_language', 'constraint'] },
  { id: 'q15', query: 'Kafka backlog 很深，盲目多开消费者会不会让下游更慢？怎样排空并保持幂等？', relevantQuestionIds: [q('seed:mq-2')], tags: ['mixed_language', 'constraint'] },
  { id: 'q16', query: '做短网址服务时，短码冲突、读多写少和机房故障分别怎么考虑？', relevantQuestionIds: [q('seed:design-1')], tags: ['paraphrase', 'constraint'] },
  { id: 'q17', query: '高峰瞬间下单的库存服务如何抗住流量并确保没有 oversell？', relevantQuestionIds: [q('seed:limit-3'), q('seed:design-2')], tags: ['mixed_language', 'multi_evidence'] },
  { id: 'q18', query: '千万用户的信息流是推给用户还是用户来拉？明星大 V 发一条怎么办？', relevantQuestionIds: [q('seed:design-3')], tags: ['paraphrase', 'constraint'] },
  { id: 'q19', query: 'Snowflake worker 时钟回拨时，为何不能继续发号？业务怎么可用地降级？', relevantQuestionIds: [q('seed:design-4')], tags: ['mixed_language', 'constraint'] },
  { id: 'q20', query: 'TCP 断开为什么是四步，线上 TIME_WAIT 爆了要先看什么而不是直接改内核参数？', relevantQuestionIds: [q('seed:net-1')], tags: ['mixed_language', 'constraint'] },
  { id: 'q21', query: 'HTTP2 多路复用解决了什么，HTTP3 又为什么把传输层换成 QUIC？', relevantQuestionIds: [q('seed:net-2')], tags: ['mixed_language', 'paraphrase'] },
  { id: 'q22', query: '浏览器和服务端建立 HTTPS 时，证书、非对称协商和会话对称密钥的顺序是什么？', relevantQuestionIds: [q('seed:net-3')], tags: ['mixed_language', 'multi_evidence'] },
  { id: 'q23', query: '协程为什么不是更轻量的线程这么简单？CPU 密集和 IO 密集应该怎么选？', relevantQuestionIds: [q('seed:os-1')], tags: ['paraphrase', 'constraint'] },
  { id: 'q24', query: 'sendfile / 零拷贝在 Kafka 这类场景省掉了哪几次复制？什么情况下收益不大？', relevantQuestionIds: [q('seed:os-2')], tags: ['mixed_language', 'constraint'] },
  { id: 'q25', query: '下游开始超时后，限流、熔断、降级分别在什么时机触发，不能只说加个 breaker。', relevantQuestionIds: [q('seed:micro-1')], tags: ['mixed_language', 'constraint'] },
  { id: 'q26', query: '网络分区发生以后 CAP 不是三选二，订单服务怎样定义一致性与可用性的取舍？', relevantQuestionIds: [q('seed:micro-2')], tags: ['mixed_language', 'constraint'] },
  { id: 'q27', query: '跨服务创建订单、扣积分、发券时，失败补偿、outbox 和人工账务应该怎样衔接？', relevantQuestionIds: [q('seed:micro-3')], tags: ['mixed_language', 'multi_evidence'] },
  { id: 'q28', query: '一个 API 的平均耗时没变但 P99 突然上升，我会怎样用 trace、RED/USE 和业务指标定位？', relevantQuestionIds: [q('seed:obs-1')], tags: ['mixed_language', 'constraint'] },
  { id: 'q29', query: '怎样让告警在真正影响用户时通知，而不是每台机器一抖就把人叫醒？', relevantQuestionIds: [q('seed:obs-2')], tags: ['paraphrase', 'constraint'] },
  { id: 'q30', query: '单知识库技术问答为什么不一定要 intent classifier；但订单、退款和闲聊混在一起时怎样低置信回退？', relevantQuestionIds: [q('seed:rag-1')], tags: ['mixed_language', 'multi_evidence', 'ambiguous'] },
  { id: 'q31', query: 'Full GC 每分钟一次，先看 allocation rate、晋升失败还是对象泄漏？如何证明？', relevantQuestionIds: [q('seed:jvm-1')], tags: ['mixed_language', 'constraint'] },
  { id: 'q32', query: 'XSS、CSRF 和 SQL injection 的攻击前提不同，后端防护分别落在哪里？', relevantQuestionIds: [q('seed:sec-1')], tags: ['mixed_language', 'multi_evidence'] },
  { id: 'q33', query: '密码为什么不能 MD5？salt、慢哈希、参数升级和泄露后的处理各有什么作用？', relevantQuestionIds: [q('seed:sec-2')], tags: ['mixed_language', 'multi_evidence'] },
  { id: 'q34', query: '我我我…那个 cach 击穿以后 db 被压垮，singleflight 的锁主挂了怎么办？', relevantQuestionIds: [q('seed:limit-2'), q('seed:cache-2')], tags: ['typo', 'mixed_language', 'multi_evidence'] },
  { id: 'q35', query: '用户只说“上面那个回退了”，上文既有时钟回拨也有数据库事务，为什么检索/Agent 不能猜一个直接执行？', relevantQuestionIds: [q('seed:rag-1')], tags: ['ambiguous', 'constraint'] },
];

export function validateQbankRetrievalRelease(): void {
  const ids = new Set(QBANK_RETRIEVAL_RELEASE.map((item) => item.id));
  if (ids.size !== QBANK_RETRIEVAL_RELEASE.length) throw new Error('qbank_release_duplicate_case_id');
  for (const item of QBANK_RETRIEVAL_RELEASE) {
    if (!item.query || !item.relevantQuestionIds.length || !item.tags.length) throw new Error(`qbank_release_invalid_case:${item.id}`);
  }
}
