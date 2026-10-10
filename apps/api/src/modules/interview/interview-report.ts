/**
 * GODFN-1c 拆解 · report 域(report/retryReport/exportReport/transcript 方法体自 interview.service.ts
 * 机械迁出,零逻辑变更)。事务边界(db.asPrincipal)与隐私围栏(guardInterviewPrivacy)由调用方以参数注入
 * (db + guard),RLS 上下文/事务结构/guard 语义逐字节原样;本文件零 DI、零 SQL 语义变更。
 */
import { HttpException, HttpStatus } from '@nestjs/common';
import { getReport, requeueFailedReport, listScorableScoreCards } from '@meetwise/db';
import { isTrustedScoreIdentity } from '@meetwise/domain';
import type { DbService } from '../../platform/db.service';

/** 隐私围栏注入面(=InterviewService.guardInterviewPrivacy 私有方法,Roster 六守卫零弱化)。 */
type PrivacyGuard = (c: any, id: string) => Promise<void>;

// 查看面试报告:ready 返内容;queued/processing 返状态(前端按 report_ready 事件刷新);report_unavailable 已由舱壁标 failed。
export async function reportView(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  const r = await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    return getReport(c, principal, id);
  });
  if (!r) {
    // **E5 修:无报告行 → 区分"面试进行中(还没生成)"与"面试已中断(失败终态)"**。
    //  后者(worker 发过 interview_unavailable、从未 enqueueReport)绝不能被报告页显示成"继续答题"(误导:让用户去答一场已死的面试)。
    const failed = await db.asPrincipal(principal, (c) =>
      c.query("SELECT kind FROM interview_event WHERE stream_key=$1 AND kind IN ('interview_unavailable','assessment_unavailable') ORDER BY seq DESC LIMIT 1", [id]));
    if (failed.rows[0]?.kind === 'assessment_unavailable')
      return { status: 'assessment_unavailable' as const, content: null };
    if ((failed.rowCount ?? 0) > 0) return { status: 'interview_failed' as const, content: null };   // 200:页面显示"面试已中断"
    throw new HttpException({ error: 'not_found' }, HttpStatus.NOT_FOUND);   // 真·进行中
  }
  // #229 D2 ④文案:回传 attempts(已耗自动重试次数)——报告页「系统已自动重试 N 次」如实渲染。
  return { status: r.status, content: r.status === 'ready' ? r.content : null, attempts: r.attempts };
}

// 报告重试:失败/隔离的报告重新入队生成(舱壁降级后的用户侧恢复——报告挂了不连累面试,且可重试)。
export async function retryReportById(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  const ok = await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const rep = await c.query("SELECT id FROM ai_report WHERE interview_id=$1 AND status IN ('failed','quarantined')", [id]);
    if (rep.rowCount === 0) return false;
    return requeueFailedReport(c, principal, rep.rows[0].id);
  });
  if (!ok) throw new HttpException({ error: 'no_retriable_report' }, HttpStatus.NOT_FOUND);
  return { requeued: true };
}

// 报告导出 markdown(用户下载/分享)。返回 { ready, md } 供 controller 写响应(SSE/原始响应胶水留在 controller)。
export async function exportReportMd(db: DbService, guard: PrivacyGuard, principal: string, id: string): Promise<{ ready: false } | { ready: true; md: string }> {
  const r = await db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    return getReport(c, principal, id);
  });
  if (!r || r.status !== 'ready') return { ready: false };
  const c = r.content as { overall?: number; sections?: { title: string; body: string }[] };
  const md = `# 面试报告\n\n**综合评分：${c.overall ?? '—'}**\n\n` + (c.sections ?? []).map((s) => `## ${s.title}\n\n${s.body}`).join('\n\n');
  return { ready: true, md };
}

// 面试转写:题面/outcome 来自 ledger 对齐的 answer_evaluated；分数只读 ScoreCard，无卡 null（不读 payload.score）。
export async function transcriptView(db: DbService, guard: PrivacyGuard, principal: string, id: string) {
  return db.asPrincipal(principal, async (c) => {
    await guard(c, id);
    const iv = await c.query('SELECT questions FROM interview WHERE id=$1', [id]);
    if (iv.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    const ev = await c.query(
      `SELECT e.payload
         FROM interview_event e
        WHERE e.stream_key=$1
          AND e.kind='answer_evaluated'
          AND EXISTS (
            SELECT 1 FROM interview_question q
             WHERE q.owner_user_id=e.owner_user_id
               AND q.interview_id=e.stream_key
               AND q.question_id=e.payload->>'questionId'
               AND q.state_version=CASE WHEN COALESCE(e.payload->>'stateVersion','') ~ '^[0-9]+$' THEN (e.payload->>'stateVersion')::int ELSE NULL END
               AND q.answer_id=e.payload->>'answerId'
               AND q.answer_hash=e.payload->>'answerHash'
               AND q.competency=e.payload->>'competency'
               AND q.status='answered'
          )
        ORDER BY e.seq`, [id]);
    // 得分权威 = ScoreCard(确定性总分),非事件 .score;逐题按 questionId 对齐,fail-closed 无卡=null(无数值)。
    const cards = await listScorableScoreCards(c, id);
    const totalByQuestion = new Map(cards.map((card) => [card.questionId, card.deterministicTotal]));
    // **E2 修:纯从 answer_evaluated 构建题面/outcome/competency**(每条自带 question/outcome/competency,天然对齐,不再靠 question_ready 序号 vs turn 两套计数 join)。
    //  自适应主线:题面在 answer_evaluated.question(worker 落库)。遗留固定题单:回退 questions[turn] 列。
    const legacy: string[] = iv.rows[0].questions ?? [];
    return { turns: ev.rows.filter((r: any) => isTrustedScoreIdentity(r.payload)).map((r: any, i: number) => {
      const p = r.payload ?? {};
      const t = Number.isInteger(Number(p.turn)) ? Number(p.turn) : i;
      return { index: t, question: p.question || legacy[t] || '', competency: p.competency, score: totalByQuestion.get(p.questionId) ?? null, outcome: p.outcome ?? undefined };
    }) };
  });
}
