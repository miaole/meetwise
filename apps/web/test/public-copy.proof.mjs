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
    forbid(`${homeZh}\n${homeEn}\n${features}`, prohibitedMarketingPhrases, 'public marketing copy');
    requireText(homeZh, '不构成能力认证', 'Chinese home copy');
    requireText(homeEn, 'not a calibrated capability assessment', 'English home copy');
  },
  'TC-PUBLIC-COPY-E1': () => {
    forbid(privacy, ['deleteResumeDataAction', '删除我的简历数据'], 'privacy page');
    requireText(privacy, '删除功能暂未开放', 'privacy page');
    forbid(resume, ['deleteResumeAction', 'pendingLabel="删除中…"'], 'resume page');
    requireText(resume, '删除功能暂未开放', 'resume page');
    forbid(settings, ['deactivateAction', '删除我的数据', '注销中…'], 'settings page');
    requireText(settings, '账户注销暂未开放', 'settings page');
    assert.equal(existsSync(resolve(repoRoot, 'apps/web/app/privacy/actions.ts')), false, 'privacy deletion action must be absent');
    requireText(faq, '完整的删除、撤回与跨存储回执流程尚未开放', 'FAQ');
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
    for (const text of [homeZh, homeEn, features, faq, privacy, pricing, legal, billing, recruiterInvite, recruiterTalent, poster, readme]) {
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
