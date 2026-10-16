/**
 * I3 JOB-MGMT（#219·裁决⑦）：招聘方侧岗位语义路由状态文案单源。
 * 文案恒含状态枚举字样（route_pending/route_decided/route_unresolved…可断言），未知状态 fail-closed
 * 显示「路由状态待同步」——不把未知伪装成已决/未决。sticky 终态语义（known_not_sent 等不自动重试）
 * 由 db 状态机承载（job-route-decision.ts 零改），本文件只做读面渲染。
 */

/** 列表/详情读面行（与 contracts JobRouteStatusView 同形子集）。 */
export interface JobRouteStatusLite {
  revision: number;
  status: string;
  attemptOutcome: string | null;
  reasonCodes: string[];
}

/** 状态 → 中文标签；括号内保留状态枚举字样供断言与排障（裁决⑦「文案须含状态可断言字样」）。 */
export const JOB_ROUTE_STATUS_LABELS: Record<string, string> = {
  route_pending: '路由排队中(route_pending)',
  rule_decided: '路由就绪(rule_decided)',
  model_prepared: '路由分类中(model_prepared)',
  result_validated: '路由分类中(result_validated)',
  route_decided: '路由就绪(route_decided)',
  route_unresolved: '路由未决(route_unresolved)',
};

export function jobRouteStatusLabel(status: string): string {
  return JOB_ROUTE_STATUS_LABELS[status] ?? '路由状态待同步';
}

export type JobRouteBadgeVariant = 'success' | 'destructive' | 'secondary';

export function jobRouteBadgeVariant(status: string): JobRouteBadgeVariant {
  if (status === 'route_decided' || status === 'rule_decided') return 'success';
  if (status === 'route_unresolved') return 'destructive';
  return 'secondary';
}
