import { Controller, Get, Header } from '@nestjs/common';

/** 法务/隐私政策(公开)。前端注册/上传前展示;consent 记录的 policy_version 对应此处 version。 */
export const PRIVACY_POLICY = {
  version: process.env.PRIVACY_POLICY_VERSION ?? 'v1',
  title: '知面隐私政策',
  purposes: [
    { id: 'resume_processing', desc: '解析与分析你的简历,用于生成训练问题与能力评估(不伪造经历)' },
    { id: 'interview', desc: '记录面试问答与评分,用于报告与成长档案' },
  ],
  dataRights: ['数据可携(导出)', '删除权(删除简历/数据)', '撤回同意'],
  retentionDays: 365,
  pii: '简历原文加密存储;结构化档案不含明文手机号/邮箱/证件号等 PII。',
};

@Controller('legal')
export class LegalController {
  @Get('policy')
  @Header('Cache-Control', 'public, max-age=600')   // 隐私政策近静态(性能:可缓存,审计 F9)
  policy() { return PRIVACY_POLICY; }
}
