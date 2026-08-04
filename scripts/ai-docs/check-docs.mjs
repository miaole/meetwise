import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../..", import.meta.url).pathname;

// 公开文档必须第一手、无对其它/源项目的指涉、无本地路径泄漏。
// task-sop.md 记录文字治理规则，故只对其进行结构检查。
const FORBIDDEN = [
  { re: /源项目|源\u53c2\u8003|照搬源|纠正源|取代源项目|借鉴了|\u53c2\u8003了\s*[A-Za-z一-龥]+\s*(项目|库|仓)/, why: "外部项目指涉(须改为第一手陈述)" },
  { re: /\/Users\/|\/private\/tmp\/|claude-501/, why: "本地绝对路径/会话目录泄漏" },
];
const SCAN_ROOTS = ["ai-docs", "AGENTS.md", "README.md", "CLAUDE.md"];
const SCAN_EXEMPT = new Set(["ai-docs/meta/task-sop.md"]);
const PUBLIC_TEXT_ROOTS = ["ai-docs", "apps", "packages", "scripts", "README.md"];
const PUBLIC_TEXT_EXTENSIONS = new Set([".md", ".mjs", ".json", ".sql", ".ts", ".tsx"]);
const OSS_LANGUAGE_FORBIDDEN = [
  { re: new RegExp("\\u53c2\\u8003"), why: "公开仓库禁止的外部指涉文字" },
  { re: new RegExp("\\u9762\\u8bd5\\u9898"), why: "公开仓库禁止的训练场景旧称" },
];
function walkMd(p, acc) {
  const abs = join(root, p);
  if (!existsSync(abs)) return;
  if (statSync(abs).isDirectory()) { for (const c of readdirSync(abs)) walkMd(join(p, c), acc); return; }
  if (p.endsWith(".md")) acc.push(p);
}
function walkPublicText(p, acc) {
  const abs = join(root, p);
  if (!existsSync(abs)) return;
  if (statSync(abs).isDirectory()) {
    for (const child of readdirSync(abs)) {
      if (child === "node_modules" || child === "dist" || child === "coverage") continue;
      walkPublicText(join(p, child), acc);
    }
    return;
  }
  const extension = p.slice(p.lastIndexOf("."));
  if (PUBLIC_TEXT_EXTENSIONS.has(extension)) acc.push(p);
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

// P0 readability contract: expert-interview materials must not assume the reader already knows acronyms.
// We enforce a visible first-use terminology section; detailed vocabulary lives in product/glossary.md.
const coachDocsWithTerminology = [
  "ai-docs/requirements/use-cases/expert-interview-coach-agent-graph.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-rag-runtime.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-evaluation.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-product-reliability.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-rag-ingestion-finetuning.md",
];

// A question bank is teaching material, not only an interviewer rubric. Each outline-style answer must have at
// least one corresponding speakable answer. This ratio gate prevents later edits from silently reverting to bullets.
const questionBanksWithSpeakableAnswerGate = [
  "ai-docs/requirements/use-cases/interview-question-bank-agent-rag.md",
  "ai-docs/requirements/use-cases/interview-question-bank-product-bend.md",
  "ai-docs/requirements/use-cases/interview-question-bank-reliability-security.md",
];

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

for (const file of coachDocsWithTerminology) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) continue;
  const content = readFileSync(absolutePath, "utf8");
  if (!/(缩略语阅读卡|缩写与英文术语表|首次术语表)/.test(content)) {
    errors.push(`${file} must contain a first-use acronym terminology section`);
  }
  if (!content.includes("统一术语")) {
    errors.push(`${file} must link readers to the canonical Chinese terminology glossary`);
  }
}

for (const file of questionBanksWithSpeakableAnswerGate) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) continue;
  const content = readFileSync(absolutePath, "utf8");
  const outlineCount = [...content.matchAll(/\*\*标准(?:答案)?要点\*\*|\*\*标准答案\*\*/g)].length;
  const speakableCount = [...content.matchAll(/\*\*90 秒可口述完整答案\*\*/g)].length;
  if (outlineCount > speakableCount) {
    errors.push(`${file} has ${outlineCount} answer outlines but only ${speakableCount} speakable answers`);
  }
}

// 受限文字扫描
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

const publicTextFiles = [];
for (const scanRoot of PUBLIC_TEXT_ROOTS) walkPublicText(scanRoot, publicTextFiles);
for (const file of publicTextFiles) {
  const lines = readFileSync(join(root, file), "utf8").split("\n");
  lines.forEach((line, index) => {
    for (const { re, why } of OSS_LANGUAGE_FORBIDDEN) {
      if (re.test(line)) errors.push(`${file}:${index + 1} 公开文字门禁命中(${why})`);
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
