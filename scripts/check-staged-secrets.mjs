import { execFileSync } from 'node:child_process';

const credentialPatterns = [
  { name: 'Alibaba AccessKey ID', pattern: /\bLTAI[A-Za-z0-9]{12,}\b/ },
  { name: 'AWS access key ID', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: 'GitHub token', pattern: /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}\b/ },
  { name: 'sk-style API key', pattern: /\bsk-[A-Za-z0-9._-]{16,}\b/ },
  {
    name: 'credential assignment',
    pattern:
      /\b(?:api[_-]?key|secret(?:[_-]?key)?|access[_-]?key|token|password)\s*[:=]\s*['\"]?(?!\$\{|<|your_|example|changeme|replace_me|xxx)[A-Za-z0-9._~+\/-]{16,}/i,
  },
];

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
}

if (findings.length > 0) {
  console.error('Secret gate blocked the commit. Remove the credential from the staged content and keep it in ignored local configuration or a secret manager.');
  for (const { path, rule } of findings) console.error(`- ${path}: ${rule}`);
  process.exit(1);
}

console.log('Secret gate passed: no blocked environment file or credential pattern in staged content.');
