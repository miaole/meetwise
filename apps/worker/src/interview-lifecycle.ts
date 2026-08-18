/**
 * 已退役的固定题单面试生命周期兼容边界。
 *
 * 生产唯一允许的路径是 `interview-consumer.ts` → `adaptive-lifecycle.ts`：它会在
 * payload（任务载荷）、解密、checkpoint（检查点）和模型调用前验证 v64 parent
 * `(resume_id,resume_privacy_epoch)`（简历标识、隐私世代）引用并取得图栅栏。
 *
 * 此模块曾直接按裸 `resumeId` 解密、写固定题单状态并运行旧图。保留那个实现会让
 * 将来的一个错误 import（导入）重新绕过隐私围栏，因此兼容导出必须失败关闭，而不是
 * “没有调用就没风险”。不要在此恢复旧实现；需要新功能应接入当前 consumer。
 */
const retired = (): never => {
  throw Object.assign(
    new Error('legacy_interview_lifecycle_retired_use_adaptive_consumer'),
    { code: 'legacy_interview_lifecycle_retired' },
  );
};

type LegacyStartResult = { questions: string[]; firstQuestion?: string };
type LegacyAnswerResult = { score?: number; nextQuestion?: string; done: boolean; degraded: boolean };

/** @deprecated 仅为旧编译目标保留；运行时始终失败关闭。 */
export async function startInterview(..._args: unknown[]): Promise<LegacyStartResult> {
  return retired();
}

/** @deprecated 仅为旧编译目标保留；运行时始终失败关闭。 */
export async function submitAnswer(..._args: unknown[]): Promise<LegacyAnswerResult> {
  return retired();
}
