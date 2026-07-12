/**
 * 起步共享题库种子(**自撰通用能力题**,自有措辞、非抄录任何站点、无版权问题)。覆盖常见后端/系统能力。
 * 仅起步种子;真正策展/授权题库由运营离线灌(ingestQbank)。CRAG 据此检索真题接地出题。
 */
import type { QbankItem } from './qbank-ingest.ts';

export const QBANK_SEED: QbankItem[] = [
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
  // JVM / 运行时
  { refId: 'seed:jvm-1', text: '一次 Full GC 频繁的线上问题你会怎么定位和优化' },
  // 安全
  { refId: 'seed:sec-1', text: '常见的 Web 攻击(XSS/CSRF/SQL 注入)各自原理和防护' },
  { refId: 'seed:sec-2', text: '用户密码应该怎么存,为什么不能明文/MD5,加盐和慢哈希解决什么' },
];
