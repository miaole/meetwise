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
const recruiterHow = read('apps/web/app/recruiter/how-it-works/page.tsx');
const recruiterReview = read('apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx');
const recruiterJobCandidates = read('apps/web/app/recruiter/jobs/[id]/page.tsx');
const recruiterJobs = read('apps/web/app/recruiter/jobs/page.tsx');
const recruiterSurface = read('apps/web/lib/recruiter/surface.ts');
const candidateJobs = read('apps/web/app/jobs/page.tsx');
const recruiterHighlights = read('apps/web/components/recruiter/ArchitectureHighlights.tsx');
const poster = read('apps/web/components/SharePoster.tsx');
const publicSite = read('apps/web/lib/public-site.ts');
const readme = read('README.md');
const pagesHtml = read('docs/index.html');
const pagesCss = read('docs/styles.css');
const pagesWorkflow = read('.github/workflows/pages.yml');
const runtimeTruth = read('ai-docs/architecture/current-runtime-truth.md');
const frontendBlueprint = read('ai-docs/architecture/frontend/frontend-blueprint.md');
const localDemo = read('ai-docs/architecture/devops/local-demo-deployment.md');
const pagesDirectoryChecklist = read('ai-docs/delivery/execution-master-checklist.md');
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
    requireText(pagesHtml, '招聘不在本预览范围', 'Pages hiring out-of-scope');
    requireText(homeZh, '招聘不在本预览范围', 'Chinese home hiring out-of-scope');
    requireText(homeEn, 'Hiring is out of scope', 'English home hiring out-of-scope');
    assert.equal((pagesHtml.match(/招聘不在本预览范围/g) ?? []).length, 1, 'Pages may state hiring is out of scope once');
    forbid(`${homeZh}\n${homeEn}\n${features}\n${pagesHtml}\n${readme}\n${runtimeTruth}\n${frontendBlueprint}\n${localDemo}\n${pagesDirectoryChecklist}`, [
      '双受众定位',
      '招聘侧是后续方向',
      '招聘侧往后排',
      '不是已经能用来招人',
      '求职者练得清',
      '面试官问得深',
      '用同一套追问看岗位',
      'Interviewers and recruiters use the same follow-ups',
      'Recruiting is a later direction',
      'id="rec"',
      'href="#rec"',
    ], 'dual-role / dual-audience marketing');
    forbid(pagesHtml, [
      '>求职者<',
      '>面试官<',
      'href="#path">求职者',
      'href="#rec">面试官',
      'kicker">求职者',
      'kicker">面试官',
      'kicker">招聘方向',
    ], 'Pages dual-role nav');
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
  'TC-PUBLIC-COPY-E12': () => {
    forbid(`${features}\n${homeZh}\n${homeEn}`, ['预览版语音可在面试页'], 'features must not claim public-preview interview voice');
    requireText(homeZh, '公开展示站与公开只读预览不开放语音作答', 'features voice honesty');
    requireText(homeZh, '不编造内容', 'features fail-closed voice');
    requireText(homeZh, 'GitHub Pages / Web 公开展示站不接收作答', 'Chinese home answers honesty');
    requireText(homeEn, 'The GitHub Pages / Web showcase does not accept answers', 'English home answers honesty');
    requireText(homeZh, '公开只读预览 API 仅允许受控账本 POST', 'Chinese home API allowlist');
    requireText(homeEn, 'A public-preview API may allow one controlled ledger POST', 'English home API allowlist');
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
    requireText(runtimeTruth, '仅面试练习', 'Pages runtime truth');
    requireText(runtimeTruth, '招聘不在本预览范围', 'Pages runtime truth');
    requireText(frontendBlueprint, '仅面试练习', 'Pages frontend blueprint');
    requireText(frontendBlueprint, '招聘不在本预览范围', 'Pages frontend blueprint');
    requireText(localDemo, '仅面试练习', 'Pages local-demo preview directory');
    requireText(localDemo, '招聘不在本预览范围', 'Pages local-demo preview directory');
    requireText(pagesDirectoryChecklist, '仅面试练习', 'Pages directory checklist');
    requireText(pagesDirectoryChecklist, '招聘不在本预览范围', 'Pages directory checklist');
    requireText(pagesWorkflow, "github.ref == 'refs/heads/main'", 'Pages workflow');
    requireText(pagesWorkflow, 'docs/index.html', 'Pages workflow');
    requireText(pagesWorkflow, "cp docs/index.html docs/styles.css docs/.nojekyll .pages-dist/", 'Pages workflow stages docs/ only');
    forbid(pagesWorkflow, ['preview-site/', '求职者', '面试官', '双受众'], 'Pages workflow');
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
  'TC-PUBLIC-COPY-E12': () => {
    requireText(recruiterHow, '怎么评估', 'recruiter architecture page');
    requireText(recruiterHighlights, '不构成能力认证', 'recruiter architecture highlights');
    requireText(recruiterHighlights, '不提供自动筛选、排名、拒绝或录用决定', 'recruiter architecture highlights');
    requireText(recruiterSurface, '下一题跟着回答走', 'recruiter architecture copy');
    requireText(recruiterSurface, '进度写在服务端', 'recruiter architecture copy');
    requireText(recruiterSurface, '关键保护可以核对', 'recruiter architecture copy');
    requireText(recruiterSurface, '证据不够就不给分', 'recruiter architecture copy');
    requireText(recruiterSurface, '两边分开记账', 'recruiter architecture copy');
    requireText(recruiterSurface, '不是高峰容量保证', 'recruiter architecture copy');
    requireText(recruiterSurface, '检索只在授权范围内', 'recruiter architecture copy');
    requireText(recruiterSurface, '不会用 0 分凑数', 'recruiter architecture copy');
    forbid(recruiterHow + recruiterHighlights + recruiterSurface, ['Grok', '生产级可靠', '自动录用已开放'], 'recruiter architecture copy');
    requireText(recruiterReview, '看不到面试内容', 'recruiter review page');
    requireText(recruiterReview, '不提供数值评分', 'recruiter review page');
    requireText(recruiterReview, '待人工复核', 'recruiter review page');
    forbid(recruiterReview, ['综合评分', '我的回答'], 'recruiter review page');
    requireText(recruiterJobCandidates, '查看复核', 'recruiter job candidates');
    requireText(recruiterTalent, '查看复核', 'recruiter talent page');
    requireText(recruiterJobs, 'ArchitectureHighlights', 'recruiter jobs page');
    forbid(candidateJobs, ['评分 {'], 'candidate applications must not render application.score');
    forbid(recruiterJobCandidates + recruiterTalent + recruiterReview, ['评分 {'], 'recruiter pages must not render application.score');
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
