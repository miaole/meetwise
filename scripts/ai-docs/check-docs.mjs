import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../..", import.meta.url).pathname;

// 禁词扫描:committed 文档必须第一手、无对其它/源项目的指涉、无本地路径泄漏。
// task-sop.md 是**规则条文本身**(它必须引用这些禁词来定义政策),故豁免。
const FORBIDDEN = [
  { re: /源项目|源参考|照搬源|纠正源|取代源项目|借鉴了|参考了\s*[A-Za-z一-龥]+\s*(项目|库|仓)/, why: "参考性/源项目指涉(须改为第一手陈述)" },
  { re: /\/Users\/|\/private\/tmp\/|claude-501/, why: "本地绝对路径/会话目录泄漏" },
];
const SCAN_ROOTS = ["ai-docs", "AGENTS.md", "README.md", "CLAUDE.md"];
const SCAN_EXEMPT = new Set(["ai-docs/meta/task-sop.md"]);
function walkMd(p, acc) {
  const abs = join(root, p);
  if (!existsSync(abs)) return;
  if (statSync(abs).isDirectory()) { for (const c of readdirSync(abs)) walkMd(join(p, c), acc); return; }
  if (p.endsWith(".md")) acc.push(p);
}

const requiredFiles = [
  "README.md",
  "AGENTS.md",
  "ai-docs/README.md",
  "ai-docs/meta/index.md",
  "ai-docs/meta/directory-boundaries.md",
  "ai-docs/product/vision.md",
  "ai-docs/product/glossary.md",
  "ai-docs/product/domain-models/interview-career-domain.md",
  "ai-docs/product/workflows/core-workflows.md",
  "ai-docs/requirements/epics/mvp-interview-career-platform.md",
  "ai-docs/architecture/system-blueprint.md",
  "ai-docs/architecture/ai/langgraph-blueprint.md",
  "ai-docs/architecture/ai/agent-runtime.md",
  "ai-docs/architecture/backend/data-model.md",
  "ai-docs/architecture/backend/module-boundaries.md",
  "ai-docs/architecture/backend/rls-isolation.md",
  "ai-docs/architecture/backend/commerce-saga.md",
  "ai-docs/architecture/backend/domain-events-catalog.md",
  "ai-docs/architecture/devops/local-demo-deployment.md",
  "ai-docs/observability/observability-strategy.md",
  "ai-docs/rules/global/status-machine.md",
  "ai-docs/rules/global/production-invariants.md",
  "ai-docs/rules/ai/structured-output-and-safety.md",
  "ai-docs/testing/strategy/test-strategy.md",
  "ai-docs/delivery/roadmap.md",
  "docker/compose.dev.yml",
  "docker/compose.demo.yml",
  "docker/env/api.env.example",
  "docker/env/web.env.example",
  "docker/env/worker.env.example",
];

const requiredTerms = new Map([
  ["README.md", ["Meetwise", "知面"]],
  ["AGENTS.md", ["文档先行", "契约先行", "测试先行"]],
  ["ai-docs/product/vision.md", ["面试", "职业路径"]],
  ["ai-docs/architecture/system-blueprint.md", ["Next.js", "NestJS", "LangGraph", "Postgres"]],
  ["ai-docs/architecture/ai/langgraph-blueprint.md", ["checkpoint", "thread_id"]],
  ["ai-docs/architecture/devops/local-demo-deployment.md", ["docker compose", "compose.demo.yml"]],
  ["ai-docs/testing/strategy/test-strategy.md", ["contract", "E2E", "golden"]],
  ["ai-docs/observability/observability-strategy.md", ["SLO", "降级", "恢复", "脱敏", "threadId"]],
]);

const errors = [];

for (const file of requiredFiles) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) {
    errors.push(`missing required file: ${file}`);
  }
}

for (const [file, terms] of requiredTerms) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) continue;

  const content = readFileSync(absolutePath, "utf8");
  for (const term of terms) {
    if (!content.includes(term)) {
      errors.push(`${file} should mention "${term}"`);
    }
  }
}

// 禁词扫描
const scanFiles = [];
for (const r of SCAN_ROOTS) walkMd(r, scanFiles);
for (const file of scanFiles) {
  if (SCAN_EXEMPT.has(file)) continue;
  const lines = readFileSync(join(root, file), "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const { re, why } of FORBIDDEN) {
      if (re.test(line)) errors.push(`${file}:${i + 1} 禁词命中(${why}): ${line.trim().slice(0, 80)}`);
    }
  });
}

if (errors.length > 0) {
  console.error("ai-docs check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`ai-docs check passed: ${requiredFiles.length} required files verified`);
