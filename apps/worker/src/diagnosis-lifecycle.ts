/**
 * 简历诊断生命周期编排(**生产代码**,worker 侧):把 resume-diagnosis 图编成真实可被 api/队列触发的诊断流程。
 * 模型经 invoke 关口(interview-service.diagnosisGenerator,双校验:schema + 接地业务闸)；图侧 factuality 歪曲门过滤幻觉发现;
 * 额度由业务服务控制——图绝不碰额度。
 *
 * runDiagnosis: 解密简历 blob 取原文(PII 留加密层,不进 job 载荷)→ generating → 跑图(诊断 + factuality)→ 逐维度发 section_ready
 *               → 落库报告(ready)→ confirm 额度 → 发 diagnosis_ready 终态事件。前端经 SSE 消费业务事件(非模型 token)。
 */
import type { PoolClient } from 'pg';
import { asPrincipal, appendEvent, confirmConsumption, decryptResumeBlob, type DbPool } from '@meetwise/db';
import type { ModelClient } from '@meetwise/ai-runtime';
import { buildResumeDiagnosisGraph, type DiagnosisReport } from '@meetwise/ai-graphs';
import { ingestResume } from '@meetwise/domain';
import { diagnosisGenerator } from './interview-service.ts';

/** 据简历诊断:解密原文 → 跑 resume-diagnosis 图(诊断→factuality 过滤→派生报告)→ 落库 + 逐维度事件 + 终态 + 结算额度。 */
export async function runDiagnosis(
  pool: DbPool, owner: string, diagnosisId: string, resumeId: string, role: string | undefined, model: ModelClient,
): Promise<{ report: DiagnosisReport | null }> {
  // 解密简历原文(受控:PII 留加密层,不进 job 载荷),据此提脱敏事实。
  const resumeRaw = await asPrincipal(pool, owner, (c: PoolClient) => decryptResumeBlob(c, owner, resumeId));
  const facts = ingestResume(resumeRaw).facts;

  await asPrincipal(pool, owner, async (c: PoolClient) => {
    await c.query("UPDATE resume_diagnosis SET status='generating', resume_id=$3, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status IN ('created','generating')", [diagnosisId, owner, resumeId]);
    await appendEvent(c, owner, diagnosisId, 'progress', { stage: 'generating' });   // SSE→前端:已开始诊断
  });

  // 纯图:parse(摄取)→ generate(经 invoke 双校验 + 接地业务闸)→ validate(factuality 歪曲门)→ finalize(业务派生)。模型在注入边界外。
  const graph = buildResumeDiagnosisGraph({ generate: diagnosisGenerator(pool, owner, facts, role, `${diagnosisId}:diagnosis`, model) });
  const out = await graph.invoke({ raw: resumeRaw });
  const report = (out.report ?? null) as DiagnosisReport | null;
  if (!report) throw new Error('diagnosis_empty_report');

  // 交付与结算同一事务,且**结算/状态机都校验返回值**(不可静默把已退/已被放弃的诊断当成功收尾 → 免费交付/状态倒退)。
  await asPrincipal(pool, owner, async (c: PoolClient) => {
    // ① 先结算:若额度已被 abandon 释放/异常 → confirm 返回 error(不抛),此处**显式拒绝成功**,throw 回滚整事务 → 走失败路径。
    const conf = await confirmConsumption(c, owner, diagnosisId, 1);              // 诊断成功 → 全额结算(idempotencyKey=diagnosisId,对终态幂等)
    if (conf.status !== 'confirmed' && conf.status !== 'partial_confirmed')
      throw new Error('diagnosis_settlement_failed:' + ((conf as any).reason ?? conf.status));
    // ② CAS 落 ready(仅当仍 generating)——被 abandon/并发改态则 0 行 → throw 回滚,绝不交付已放弃的诊断。
    const upd = await c.query(
      "UPDATE resume_diagnosis SET status='ready', report=$3, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='generating'",
      [diagnosisId, owner, JSON.stringify(report)]);
    if (upd.rowCount === 0) throw new Error('diagnosis_status_conflict');
    // ③ 逐维度发 section_ready + 逐条发 rewrite_ready(前端边到边渲染,**每条独立成帧**)。
    // 审计 SRE 中危修复:rewrites 不再塞进单条终态帧——否则大报告可能撑爆前端 1MB 缓冲 → 误判"暂不可用"(而 DB 实为 ready)。
    // 逐条流式后每帧有界,且仍是纯 SSE(无需二次取数);终态 diagnosis_ready 只带摘要计数。
    for (const sec of report.sections) await appendEvent(c, owner, diagnosisId, 'section_ready', { kind: sec.kind, title: sec.title, score: sec.score ?? null, findings: sec.findings });
    for (const rw of report.rewrites) await appendEvent(c, owner, diagnosisId, 'rewrite_ready', { before: rw.before, after: rw.after, refs: rw.refs });
    await appendEvent(c, owner, diagnosisId, 'diagnosis_ready', { overall: report.overall, summary: report.summary, sectionCount: report.sections.length, rewriteCount: report.rewrites.length });
  });

  return { report };
}
