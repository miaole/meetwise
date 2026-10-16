/**
 * GODFN-1c 拆解 · interview 视图层纯函数(toInterviewView 自 interview.service.ts 机械迁出,零逻辑变更)。
 * list/get 两个消费方的行→视图映射单一出处(原 service 内唯一实现原样迁入,签名/行为逐字节等价)。
 */
import { resumeDisplayName } from '../resume/resume-display.ts';

export function toInterviewView(row: any) {
  let displayNumber = 0;
  for (const char of String(row.id)) displayNumber = (displayNumber * 33 + char.charCodeAt(0)) % 1_000_000;
  return {
    id: row.id,
    status: row.status,
    job_title: row.job_title,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    display_code: `场次${String(displayNumber).padStart(6, '0')}`,
    resume_display_name: row.resume_id
      ? resumeDisplayName({
          created_at: row.resume_created_at,
          experience_hint: row.resume_experience_hint,
          skill_hint: row.resume_skill_hint,
          content_sha: row.resume_content_sha,
        })
      : null,
    // H4 R1(#252 再练入口·additive):本场绑定简历 id 直透(行查询已 SELECT i.resume_id·零新查询);
    // 报告页「再练这 N 个弱项」携同简历走既有 create+begin 链。未绑定=null。
    resume_id: row.resume_id ?? null,
    current_question_index: row.current_question_index,
    issued_turns: row.issued_turns,
    answered_turns: row.answered_turns,
    current_turn: row.current_turn,
    processing_turn: row.processing_turn,
  };
}
