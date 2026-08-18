import { execFileSync } from 'node:child_process';
import { CLOUD_IDENTIFIER_RULES, PUBLIC_TEXT_POLICY_CODES, isSyntheticIdentifier } from './ai-docs/public-text-policy.mjs';

const credentialPatterns = [
  { name: 'Alibaba AccessKey ID', pattern: /\bLTAI[A-Za-z0-9]{12,}\b/ },
  { name: 'AWS access key ID', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: 'GitHub token', pattern: /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}\b/ },
  {
    name: 'sk-style API key',
    // 排除自描述占位值(sk-example-*/sk-test-*/…)：真实 sk- 密钥是随机串，不以这些词开头。
    pattern: /\bsk-(?!example|test|xxx|placeholder|changeme|dummy|fake|your_)[A-Za-z0-9._-]{16,}\b/,
  },
  {
    name: 'credential assignment',
    // 只抓"写死的字面量密钥"，两类常见误报放行：
    //  ① 值必须带引号 → process.env.X / 变量 / 类型注解 / config 字段 / 函数调用等"引用"不是泄漏。
    //  ② 值不得自描述 → 合成测试夹具(*-proof-2026 / *-candidate-password / 全零 UUID 等)含
    //     password/token/test/proof/fixture/dummy/placeholder/example/changeme/replace_me/xxx/your_ 或年份戳 -\d{4}。
    // 真实密钥晦涩随机，几乎不会自我描述；宁可误放行一个自描述夹具，也不误报引用类代码。
    pattern:
      /\b(?:api[_-]?key|secret(?:[_-]?key)?|access[_-]?key|token|password)\s*[:=]\s*['"](?![A-Za-z0-9._~+\/-]*(?:password|token|test|proof|fixture|dummy|placeholder|example|changeme|replace_me|xxx|your_|-\d{4}))[A-Za-z0-9._~+\/-]{16,}/i,
  },
];

// 云端标识兜底：gitleaks 抓不到的「标识」而非「秘密」。复用 public-text-policy.mjs 的
// CLOUD_IDENTIFIER_RULES(单一事实源，避免两处正则漂移)。API_KEY 类(LTAI/AKIA/sk-)已由上方
// credentialPatterns 覆盖，这里只补私钥 PEM 与实例/网络标识；合成夹具经 isSyntheticIdentifier 放行。
const IDENTIFIER_RULE_NAMES = {
  [PUBLIC_TEXT_POLICY_CODES.PRIVATE_KEY]: 'private key PEM',
  [PUBLIC_TEXT_POLICY_CODES.CLOUD_IDENTIFIER]: 'cloud identifier (instance/tailnet/RDS hostname)',
};
const cloudIdentifierPatterns = CLOUD_IDENTIFIER_RULES
  .filter(({ code }) => code === PUBLIC_TEXT_POLICY_CODES.PRIVATE_KEY || code === PUBLIC_TEXT_POLICY_CODES.CLOUD_IDENTIFIER)
  .map(({ code, re }) => ({ name: IDENTIFIER_RULE_NAMES[code], pattern: re }));

function stagedFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], {
    encoding: 'buffer',
  });
  return output
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
}

function isForbiddenEnvironmentFile(path) {
  const name = path.split('/').at(-1) ?? path;
  return (name === '.env' || name.startsWith('.env.')) && !name.endsWith('.example');
}

function stagedContent(path) {
  try {
    return execFileSync('git', ['show', `:${path}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

const findings = [];
for (const path of stagedFiles()) {
  if (isForbiddenEnvironmentFile(path)) {
    findings.push({ path, rule: 'environment file must stay local' });
    continue;
  }

  const content = stagedContent(path);
  if (content === null || content.includes('\0')) continue;
  for (const { name, pattern } of credentialPatterns) {
    if (pattern.test(content)) findings.push({ path, rule: name });
  }
  for (const { name, pattern } of cloudIdentifierPatterns) {
    // matchAll 要求 global 标志；CLOUD_IDENTIFIER_RULES 的 re 无 g，这里补上（与 public-text-policy.mjs 一致）。
    const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    for (const match of content.matchAll(global)) {
      if (isSyntheticIdentifier(match[0])) continue;
      findings.push({ path, rule: name });
      break;
    }
  }
}

if (findings.length > 0) {
  console.error('Secret gate blocked the commit. Remove the credential from the staged content and keep it in ignored local configuration or a secret manager.');
  for (const { path, rule } of findings) console.error(`- ${path}: ${rule}`);
  process.exit(1);
}

console.log('Secret gate passed: no blocked environment file or credential pattern in staged content.');
