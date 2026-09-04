import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(webRoot, '../..');

function read(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), 'utf8');
}

function forbid(text, phrases, label) {
  for (const phrase of phrases) assert.equal(text.includes(phrase), false, `${label} must not contain: ${phrase}`);
}

function requireText(text, phrase, label) {
  assert.equal(text.includes(phrase), true, `${label} must contain: ${phrase}`);
}

const homeZh = read('apps/web/messages/zh.json');
const homeEn = read('apps/web/messages/en.json');
const home = read('apps/web/app/page.tsx');
const layout = read('apps/web/app/layout.tsx');
const sitemap = read('apps/web/app/sitemap.ts');
const robots = read('apps/web/app/robots.ts');
const features = read('apps/web/app/features/page.tsx');
const faq = read('apps/web/app/faq/page.tsx');
const privacy = read('apps/web/app/privacy/page.tsx');
const resume = read('apps/web/app/resume/page.tsx');
const resumeForms = read('apps/web/app/resume/ResumeUploadForms.tsx');
const resumeActions = read('apps/web/app/resume/actions.ts');
const resumeOcrUi = read('apps/web/lib/resume/ocr-preview-ui.ts');
const resumeOcrPreview = read('apps/web/lib/ocr-preview.ts');
const settings = read('apps/web/app/settings/page.tsx');
const pricing = read('apps/web/app/pricing/page.tsx');
const legal = read('apps/web/app/legal/page.tsx');
const legalApi = read('apps/api/src/modules/legal/legal.controller.ts');
const billing = read('apps/web/app/billing/page.tsx');
const billingAction = read('apps/web/app/billing/actions.ts');
const interviewAction = read('apps/web/app/interviews/actions.ts');
const quizAction = read('apps/web/app/quiz/actions.ts');
const diagnosisAction = read('apps/web/app/diagnosis/actions.ts');
const jobsAction = read('apps/web/app/jobs/actions.ts');
const recruiterInvite = read('apps/web/components/InviteCandidateDialog.tsx');
const recruiterTalent = read('apps/web/app/recruiter/talent/page.tsx');
const poster = read('apps/web/components/SharePoster.tsx');
const publicSite = read('apps/web/lib/public-site.ts');
const readme = read('README.md');
const pagesHtml = read('docs/index.html');
const pagesCss = read('docs/styles.css');
const pagesWorkflow = read('.github/workflows/pages.yml');
const prohibitedAttribution = ['参', '考', '至'].join('');
const prohibitedAdaptations = [
  ['改', '编', '自'].join(''),
  ['移', '植', '自'].join(''),
  ['照', '搬', '自'].join(''),
  ['借', '鉴', '自'].join(''),
  prohibitedAttribution,
  ['参', '照', '至'].join(''),
];
const prohibitedMarketingPhrases = [
  ['骗过', '面试官'].join(''),
  ['fool', ' the interviewer'].join(''),
  ['直到你', '拿到 offer'].join(''),
  ['until you ', 'land the offer'].join(''),
  ['更靠近', ' offer'].join(''),
  ['closer to ', 'an offer'].join(''),
  ['从简历到', ' offer'].join(''),
  ['生产级', '可靠'].join(''),
  ['全链路持久化', '不丢数据'].join(''),
];

const checks = {
  'TC-PUBLIC-COPY-main': () => {
    forbid(`${homeZh}\n${homeEn}\n${features}\n${pagesHtml}`, prohibitedMarketingPhrases, 'public marketing copy');
    requireText(homeZh, '不构成能力认证', 'Chinese home copy');
    requireText(homeEn, 'not a calibrated capability assessment', 'English home copy');
    requireText(homeZh, '真实经历 → 自适应面试 → 可复盘成长', 'Chinese home story');
    requireText(homeEn, 'Real experience → adaptive interview → reviewable growth', 'English home story');
  },
  'TC-PUBLIC-COPY-E1': () => {
    const privacyAction = read('apps/web/app/privacy/actions.ts');
    forbid(privacy, ['deleteResumeDataAction', '删除我的简历数据'], 'privacy page');
    requireText(privacy, '预览版', 'privacy page');
    requireText(privacy, '不替代完整数据权利或跨存储生产删除', 'privacy page');
    requireText(privacy, '生产 `DELETE /privacy/*` 仍关闭', 'privacy page');
    forbid(resume, ['deleteResumeAction', 'pendingLabel="删除中…"'], 'resume page');
    requireText(resume, '删除功能暂未开放', 'resume page');
    forbid(settings, ['deactivateAction', '删除我的数据', '注销中…'], 'settings page');
    requireText(settings, '账户注销暂未开放', 'settings page');
    assert.equal(existsSync(resolve(repoRoot, 'apps/web/app/privacy/actions.ts')), true, 'preview receipt action must exist');
    forbid(privacyAction, ['deleteResumeDataAction', '/privacy/resume-data', '/privacy/interview-data'], 'privacy preview action');
    requireText(privacyAction, '/privacy/erasure-preview', 'privacy preview action');
    requireText(privacyAction, 'preview_incomplete', 'privacy preview action');
    requireText(faq, '完整的删除、撤回与跨存储回执流程尚未开放', 'FAQ');
    requireText(faq, '预览版删除回执', 'FAQ');
  },
  'TC-PUBLIC-COPY-E2': () => {
    forbid(pricing, ["serverGet(", "'/billing'", '购买</Link>', '¥'], 'credits page');
    requireText(pricing, '不提供支付、购买、退款或自动扣费服务', 'credits page');
  },
  'TC-PUBLIC-COPY-E3': () => {
    requireText(recruiterInvite, '不得用于自动筛选、排名、拒绝或录用决定', 'recruiter invite');
    forbid(recruiterInvite, ['状态与评分'], 'recruiter invite');
  },
  'TC-PUBLIC-COPY-E4': () => {
    forbid(home, ['https://meetwise.example', "offers: { '@type': 'Offer'"], 'homepage metadata');
    requireText(home, 'publicSiteHref', 'homepage metadata');
    for (const [label, text, resolver] of [['layout', layout, 'resolvePublicSiteUrl'], ['sitemap', sitemap, 'publicSiteHref'], ['robots', robots, 'publicSiteHref']]) {
      forbid(text, ['https://meetwise.example'], label);
      requireText(text, resolver, label);
    }
    requireText(publicSite, 'TRUSTED_PUBLIC_ORIGINS', 'public-site resolver');
    requireText(publicSite, 'Keep this empty until', 'public-site resolver');
  },
  'TC-PUBLIC-COPY-E5': () => {
    requireText(readme, '不是已经部署的在线服务', 'README');
    requireText(readme, '不承诺面试、录用或 offer 结果', 'README');
    requireText(readme, '不启动本地数据面服务', 'README');
    forbid(readme, ['Docker。', '全栈端到端', prohibitedMarketingPhrases[7]], 'README');
  },
  'TC-PUBLIC-COPY-E6': () => {
    for (const text of [homeZh, homeEn, features, faq, privacy, pricing, legal, billing, recruiterInvite, recruiterTalent, poster, readme, pagesHtml]) {
      forbid(text, prohibitedAdaptations, 'public copy');
    }
  },
  'TC-PUBLIC-COPY-E7': () => {
    forbid(legal, ['serverGet(', '到期或经你申请后删除', 'retentionDays'], 'public legal page');
    requireText(legal, '完整删除、撤回同意、跨存储删除回执', 'public legal page');
    forbid(legalApi, ['删除权(删除简历/数据)', 'retentionDays: 365'], 'public legal API');
    requireText(legalApi, '当前未开放', 'public legal API');
  },
  'TC-PUBLIC-COPY-E8': () => {
    forbid(billing, ['serverGet(', 'BuyButton', '¥'], 'billing page');
    forbid(billingAction, ['serverFetch(', '/commerce/orders'], 'billing action');
    requireText(billingAction, '未开放订单、支付或额度购买', 'billing action');
    for (const action of [interviewAction, quizAction, diagnosisAction, jobsAction]) {
      forbid(action, ["'/billing?need=", '`/billing?need='], 'credit exhaustion action');
    }
    assert.equal(existsSync(resolve(repoRoot, 'apps/web/app/billing/BuyButton.tsx')), false, 'buy button must be absent');
  },
  'TC-PUBLIC-COPY-E9': () => {
    requireText(poster, '非能力认证 · 不得用于招聘、资格或录用判断', 'downloadable poster');
    requireText(recruiterTalent, '不提供自动筛选、排名、拒绝或录用决定', 'recruiter talent page');
    forbid(features, ['CRAG', '自动触发再检索', '自主探索'], 'feature claims');
  },
  'TC-PUBLIC-COPY-E11': () => {
    forbid(`${resume}\n${resumeForms}\n${resumeOcrUi}`, ['求职者', '面试官'], 'resume OCR preview copy');
    forbid(resumeForms, ['OCR 接线中', 'image/*'], 'closed resume file input');
    requireText(resumeOcrUi, '不是生产视觉质量承诺', 'resume OCR preview copy');
    requireText(resumeOcrUi, '不会编造文字', 'resume OCR preview copy');
    requireText(resumeOcrUi, '图片识别未开放', 'resume OCR closed copy');
    requireText(resumeOcrPreview, "OCR_ENABLED === '1' && env.OCR_PREVIEW === '1'", 'resume OCR preview flags');
    requireText(resumeOcrPreview, "MEETWISE_PUBLIC_PREVIEW === '1'", 'resume OCR public-preview lock');
    requireText(resume, 'isOcrPreviewEnabled', 'resume page wires the preview gate');
    requireText(resume, 'ocrPreview={ocrPreview}', 'resume page passes the gate into the form');
    requireText(resumeActions, 'resumeImageRefusedLocally', 'resume file action local refuse');
    requireText(resumeActions, 'isPreviewOcrImage', 'resume file action preview allowlist');
    requireText(resumeActions, 'mapResumeUploadError', 'resume file action error mapping');
    forbid(resumeActions, ['ocr.text', 'transcript'], 'resume file action must not invent transcripts');
    forbid(resumeOcrUi, ['扫描型 PDF 请改传清晰图片', '仅预览环境'], 'no unwired scanned-PDF OCR promise');
    requireText(pagesHtml, '真实经历 → 自适应面试 → 可复盘成长', 'Pages showcase');
    requireText(pagesHtml, '不是已经部署的在线服务', 'Pages showcase');
    requireText(pagesHtml, '不启动本地数据面服务', 'Pages showcase');
    requireText(pagesHtml, '合成截图', 'Pages showcase');
    requireText(pagesHtml, '不提供支付、购买、退款或自动扣费', 'Pages showcase');
    requireText(pagesHtml, 'https://github.com/miaole/meetwise', 'Pages showcase');
    requireText(pagesWorkflow, "github.ref == 'refs/heads/main'", 'Pages workflow');
    requireText(pagesWorkflow, 'docs/index.html', 'Pages workflow');
    requireText(pagesCss, 'prefers-reduced-motion', 'Pages stylesheet');
    requireText(pagesCss, 'PingFang SC', 'Pages type stack');
    requireText(pagesCss, 'Source Han Sans SC', 'Pages type stack');
    requireText(pagesCss, 'Source Han Serif SC', 'Pages hero serif');
    requireText(pagesCss, '.hero {', 'Pages hero layout');
    requireText(pagesHtml, 'class="hero"', 'Pages hero layout');
    requireText(pagesHtml, 'class="report"', 'Pages annotation card');
    requireText(pagesHtml, '点评', 'Pages annotation card');
    forbid(pagesCss, ['Inter', 'Roboto', 'Geist'], 'Pages type stack');
    forbid(pagesHtml, ['<script', 'fetch(', 'XMLHttpRequest', '预览环境准备中'], 'Pages showcase');
    forbid(pagesHtml, ['支付服务已开放', '完整删除已开放', 'OCR 已开放', '语音已开放'], 'Pages showcase');
    forbid(pagesHtml, ['承重件', '四张 LangGraph', 'AI 驱动'], 'Pages brochure tone');
    assert.equal(/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/.test(pagesHtml), false, 'Pages showcase must not embed a bare IP');
  },
  'TC-PUBLIC-COPY-E10': () => {
    const retiredAssets = [
      '01-landing.png', '02-login.png', '03-dashboard.png', '04-resume.png', '04a-resume-consent.png', '05-interviews.png',
      '06-pricing.png', '07-features.png', '08-growth.png', 'm1-landing-mobile.png', 'm2-dashboard-mobile.png',
    ];
    for (const asset of retiredAssets) {
      assert.equal(existsSync(resolve(repoRoot, 'docs/screenshots', asset)), false, `retired public screenshot must be absent: ${asset}`);
    }
  },
};

const selectedIndex = process.argv.indexOf('--case');
const selected = selectedIndex >= 0 ? process.argv[selectedIndex + 1] : undefined;
const selectedChecks = selected ? [[selected, checks[selected]]] : Object.entries(checks);
if (selected && !checks[selected]) throw new Error(`unknown_public_copy_case:${selected}`);

for (const [id, check] of selectedChecks) {
  check();
  console.log(`✓ ${id}`);
}
console.log(`static_preflight_valid: selected=${selectedChecks.length}/${Object.keys(checks).length}; releaseEvidence=false`);
