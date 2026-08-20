import { InterviewView, MyApplications, ResumeList } from '@meetwise/contracts';
import { resumeDisplayName } from '../src/modules/resume/resume-display.ts';

let failures = 0;
const A = (name: string, pass: boolean) => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) failures++;
};

const semantic = resumeDisplayName({
  created_at: '2026-08-20T10:00:00.000Z',
  experience_hint: '  后端工程师   · 支付系统  ',
  skill_hint: 'TypeScript',
  content_sha: 'validate-semantic-content',
});
const fallback = resumeDisplayName({ created_at: '2026-08-19T23:59:00.000Z' });

A('优先使用脱敏经历生成中文简历名称（北京时间）', semantic.startsWith('简历 · 后端工程师 · 支付系统 · 2026年08月20日 18:00 · 版本'));
A('空画像使用中文上传时间兜底（北京时间）', fallback === '简历 · 2026年08月20日 07:59');
A('超长提示受限且不使用内部 id', resumeDisplayName({ created_at: '2026-08-20', experience_hint: '中'.repeat(40) }).length <= 80);
const duplicateA = resumeDisplayName({ created_at: '2026-08-20', experience_hint: '后端工程师', content_sha: 'content-aaaaaa' });
const duplicateB = resumeDisplayName({ created_at: '2026-08-20', experience_hint: '后端工程师', content_sha: 'content-bbbbbb' });
A('同提示同时间的不同简历仍可区分且不暴露摘要', duplicateA !== duplicateB && !duplicateA.includes('content-'));
A('旧 ResumeList 兼容并给出中文同步提示', ResumeList.parse({ resumes: [{ id: 'r', status: 'ingested' }] }).resumes[0]?.display_name === '简历信息同步中');
A('旧 InterviewView 兼容且保留“同步中”三态', InterviewView.parse({ id: 'i', status: 'created', current_question_index: null, issued_turns: 0, answered_turns: 0, current_turn: null, processing_turn: null }).job_title === undefined);
A('旧投递契约兼容并给出中文同步提示', MyApplications.parse({ applications: [{ id: 'a', job_id: 'j', interview_id: null, resume_id: null, status: 'invited', score: null }] }).applications[0]?.job_title === '岗位信息同步中');

console.log(failures === 0 ? '✓ 中文业务名称契约通过' : `✗ ${failures} 失败`);
process.exit(failures ? 1 : 0);
