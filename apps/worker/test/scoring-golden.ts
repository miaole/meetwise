/**
 * 评分官质量金标集(nightly 真模型信号用;非 per-push)。**只需相对序 + 同质量变体,不需绝对分区间**(校准 band 推迟)。
 * 消费者:apps/worker/smoke/scoring-eval.ts —— 过真评分官,算 单调性(成对序/Kendall) + 一致性(ICC/离散度) + 相关性。
 *
 * 两类金标(经专家审计定形):
 *  - MONO_GROUPS：**同一 base 题**下多档质量答案(rank 5→1:优/良/中/差/非作答)。断言"好答案不能反低分"——**只组内比**。
 *    rank 为相对序(可信人工可标),不含绝对分区间。相邻档人也难分,门只对**非相邻档(档差≥2)**断言。
 *  - PERTURB_GROUPS：**同一质量**答案 + 语义等价变体(改措辞/语序/空白/同义词)。断言"换个说法分数别乱跳"——这才是真实的"忽高忽低"。
 *  - OFFTOPIC：跑题/非作答,断言 relevant=false → score=0(复用红队已覆盖,这里只留少量回归)。
 */
export interface MonoCase { rank: number; tier: string; answer: string }
export interface MonoGroup { id: string; question: string; cases: MonoCase[] }
export interface PerturbGroup { id: string; question: string; tier: string; variants: string[] }

export const MONO_GROUPS: MonoGroup[] = [
  {
    id: 'MG-限流', question: '你在高并发场景下怎么做限流?讲讲取舍。',
    cases: [
      { rank: 5, tier: 'excellent', answer: '网关层用令牌桶,平滑突发优于漏桶;取令牌走 Redis+Lua 保证原子,单机降级用本地令牌桶兜底防 Redis 抖动;阈值按压测的 P99 容量定,超限快速失败返 429 并带 Retry-After,绝不无限排队拖垮上游。还做了热点 key 单独限流避免大 key 打爆。' },
      { rank: 4, tier: 'good', answer: '用令牌桶限流,Redis 存令牌,超过就返回 429。也加了本地降级,Redis 挂了用本地限。' },
      { rank: 3, tier: 'mediocre', answer: '我们做了限流,用的令牌桶,超过阈值就拒绝请求。' },
      { rank: 2, tier: 'poor', answer: '限流就是加个计数器,超过就不让访问了,具体细节记不太清。' },
      { rank: 1, tier: 'nonanswer', answer: '这个我没怎么做过,不太清楚。' },
    ],
  },
  {
    id: 'MG-分布式锁', question: '分布式锁怎么保证可靠?你踩过哪些坑?',
    cases: [
      { rank: 5, tier: 'excellent', answer: '用 SET key val NX PX 一条原子命令加锁(早期用 SETNX+EXPIRE 两条非原子,进程崩在中间会锁不过期,踩过这个坑);value 放随机 token,释放用 Lua 脚本比对 token 再删,避免误删别人的锁;锁快到期还没干完用看门狗续期;Redlock 争议后我们选单实例+主从兜底,接受主从切换极端下的弱一致。' },
      { rank: 4, tier: 'good', answer: '用 Redis 的 SET NX PX 加锁,带一个随机值,释放的时候用 Lua 脚本判断值一致再删,防止误删。锁过期时间设长一点。' },
      { rank: 3, tier: 'mediocre', answer: '用 Redis SETNX 加锁,设置一个过期时间,用完删掉。' },
      { rank: 2, tier: 'poor', answer: '就是用 Redis 存一个 key 表示锁,有 key 就是锁住了。' },
      { rank: 1, tier: 'nonanswer', answer: '分布式锁啊,我们项目没用到过。' },
    ],
  },
];

export const PERTURB_GROUPS: PerturbGroup[] = [
  {
    id: 'PG-限流-good', question: '你在高并发场景下怎么做限流?讲讲取舍。', tier: 'good',
    variants: [
      '用令牌桶限流,Redis 存令牌,超过就返回 429。也加了本地降级,Redis 挂了用本地限。',
      '限流我们用的是令牌桶算法,令牌放在 Redis 里,超出阈值就返回 429;另外做了本地降级,万一 Redis 不可用就退回本地限流。',            // 改措辞
      '我们做限流用令牌桶。超过阈值返回 429。令牌存 Redis。Redis 挂了会降级到本地限流。',                                            // 改语序/断句
      '用令牌桶做限流,   Redis 存令牌,  超过就返回 429;  Redis 挂了本地降级兜底。',                                                  // 加空白
    ],
  },
  {
    id: 'PG-分布式锁-good', question: '分布式锁怎么保证可靠?你踩过哪些坑?', tier: 'good',
    variants: [
      '用 Redis 的 SET NX PX 加锁,带一个随机值,释放的时候用 Lua 脚本判断值一致再删,防止误删。锁过期时间设长一点。',
      '分布式锁我用 Redis SET NX PX,value 放随机值;解锁时走 Lua 脚本先比对 value 再删,避免误删别人的锁。过期时间给足。',        // 改措辞
      '加锁用 SET NX PX。value 是随机值。解锁用 Lua 脚本,先判断 value 相等,再删除,防止误删。过期时间设长一些。',               // 改语序
      '用 Redis SET NX PX 加锁,带随机 value;释放用 Lua 脚本比对 value 一致再删(防误删);过期时间设长点。',                       // 近义/紧凑
    ],
  },
];

export const OFFTOPIC: { id: string; question: string; answer: string }[] = [
  { id: 'OT-01', question: '讲讲你做过的缓存一致性方案。', answer: '今天天气不错,我们聊点别的吧。' },
  { id: 'OT-02', question: '你怎么保证消息消费的可靠性?', answer: '跳过' },
];
