import { Controller, Get, Header } from '@nestjs/common';

/**
 * Conservative public-preview boundary. Complete deletion, withdrawal and
 * sink-level receipts are not available, so this endpoint cannot advertise
 * them as a data-rights workflow.
 */
export const PRIVACY_POLICY = {
  version: process.env.PRIVACY_POLICY_VERSION ?? 'preview-v1',
  title: '知面预览环境数据处理边界',
  purposes: [
    { id: 'preview_boundary', desc: '公开预览不接收真实简历、身份信息、面试回答、录音或访问密钥。' },
    { id: 'capability_notice', desc: '页面只说明项目边界，不构成正式服务、支付或招聘决策。' },
  ],
  dataRights: ['完整删除、撤回同意和跨存储回执流程当前未开放。', '请勿通过公开预览提交个人或机密内容。'],
  retentionDays: 0,
  pii: '公开预览不承诺处理或留存真实个人信息。',
};

@Controller('legal')
export class LegalController {
  @Get('policy')
  @Header('Cache-Control', 'public, max-age=600')   // 隐私政策近静态(性能:可缓存,审计 F9)
  policy() { return PRIVACY_POLICY; }
}
