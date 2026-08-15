/**
 * 任务路由：用便宜模型/规则在进入昂贵子图前做分类与拦截
 * （任务分类、是否开子 agent、输入/输出脏话·越界拦截）。
 * 关口内部件：禁外部深链 import。
 *
 * 骨架：先用确定性规则占位（真实接便宜分类模型只换实现，签名不变）。
 */
export type RouteDecision =
  | { kind: 'allow'; tier: 'cheap' | 'expensive' }
  | { kind: 'reject'; reason: 'out_of_scope' | 'abusive' };

const ABUSE = [/脏话|傻[逼比]|滚|去死/i];
const OUT_OF_SCOPE = [/帮我(写|生成).*(病假条|诊断证明|假.*证明)/, /如何.*(违法|作弊)/];

/** 入口分类：越界/辱骂先拦（便宜路径），其余按复杂度给 tier。route_decided 应被持久化（可审计）。 */
export function classify(input: string): RouteDecision {
  if (ABUSE.some((r) => r.test(input))) return { kind: 'reject', reason: 'abusive' };
  if (OUT_OF_SCOPE.some((r) => r.test(input))) return { kind: 'reject', reason: 'out_of_scope' };
  // 骨架启发式：长/含多子问 → 昂贵子图；否则便宜单步。
  const tier = input.length > 200 || /[?？].*[?？]/.test(input) ? 'expensive' : 'cheap';
  return { kind: 'allow', tier };
}
