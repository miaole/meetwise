/**
 * Honesty proof for golden-tasks:check. Does not execute mapped gates.
 * Asserts that fake-green statuses, planned-with-commands, quality-eval
 * covering gates, and doc/strategy drift fail the checker.
 */
import assert from 'node:assert/strict';
import { loadGoldenTasksFromDisk, validateGoldenTasksRegistry } from './golden-tasks-check.mjs';

const live = loadGoldenTasksFromDisk();
let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log(`PASS golden-tasks check: ${name}`);
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withTask(id, patch) {
  const input = clone(live);
  const task = input.registry.tasks.find((item) => item.id === id);
  Object.assign(task, patch);
  return input;
}

function fails(name, input, pattern) {
  test(name, () => {
    const errors = validateGoldenTasksRegistry(input);
    assert.ok(errors.length > 0, 'expected checker to fail');
    assert.ok(errors.some((error) => pattern.test(error)), `expected ${pattern} in:\n${errors.join('\n')}`);
  });
}

test('current first-batch registry is honest', () => {
  const errors = validateGoldenTasksRegistry(live);
  assert.deepEqual(errors, []);
  assert.equal(live.registry.releaseEvidence, false);
  assert.equal(live.registry.schemaVersion, 2);
  assert.ok(live.registry.tasks.every((task) => !['passed', 'green', 'release_ready', 'pass'].includes(task.status)));
  assert.ok(live.registry.tasks.filter((task) => task.subject === 'ai-output').every((task) => task.status !== 'mapped'));
  assert.ok(live.registry.tasks.every((task) => task.status !== 'mapped'), 'no mapped until isolated covering proves are re-run');
});

for (const status of ['passed', 'green', 'release_ready', 'pass']) {
  fails(
    `forbids status=${status}`,
    withTask('GT-01', { status, mappedCommands: ['scoring-golden:prove'], covers: ['fake'], uncovered: [], evidenceKind: 'deterministic-prove' }),
    new RegExp(`forbids status=${status}`),
  );
}

fails(
  'planned cannot claim mappedCommands',
  withTask('GT-01', { mappedCommands: ['e2e:isolated'] }),
  /planned must not claim mappedCommands/,
);

fails(
  'partial without uncovered is rejected (would look fully mapped)',
  withTask('GT-02', { uncovered: [] }),
  /partial requires uncovered/,
);

fails(
  'mapped without covers is rejected',
  withTask('GT-06', { status: 'mapped', covers: [], uncovered: ['still a gap'] }),
  /mapped requires covers/,
);

fails(
  'scoring:eval cannot be a covering gate',
  withTask('GT-02', { mappedCommands: ['scoring-golden:prove', 'scoring:eval'] }),
  /scoring:eval cannot be a covering gate/,
);

fails(
  'unknown package.json command is rejected',
  withTask('GT-06', { mappedCommands: ['not-a-real-gate:prove'] }),
  /mapped command missing in package.json: not-a-real-gate:prove/,
);

fails(
  'related command that is also mapped is rejected',
  withTask('GT-06', {
    relatedCommands: [{ command: 'scoring-integrity:prove', notCovered: 'same command' }],
  }),
  /cannot be both mapped and related/,
);

fails(
  'relatedCommands must explain why they are not covering',
  withTask('GT-01', { relatedCommands: [{ command: 'e2e:isolated', notCovered: '' }] }),
  /notCovered must explain/,
);

fails(
  'frontmatter status drift is rejected',
  (() => {
    const input = clone(live);
    input.docs['ai-docs/testing/golden-tasks/GT-01-frontend-project-deep-dive.md'] =
      '---\nid: GT-01\nstatus: mapped\n---\n# drift\n';
    return input;
  })(),
  /doc frontmatter status=mapped !== planned/,
);

fails(
  'README table status drift is rejected',
  (() => {
    const input = clone(live);
    input.readme = input.readme.replace(
      '| [GT-01](./GT-01-frontend-project-deep-dive.md) | 前端岗 + 有项目简历 → 8–12 题且含项目深挖 | `planned` |',
      '| [GT-01](./GT-01-frontend-project-deep-dive.md) | 前端岗 + 有项目简历 → 8–12 题且含项目深挖 | `mapped` |',
    );
    return input;
  })(),
  /README status drift/,
);

fails(
  'test-strategy status drift is rejected',
  (() => {
    const input = clone(live);
    input.strategy = input.strategy.replace('`GT-01` **planned**', '`GT-01` **mapped**');
    return input;
  })(),
  /test-strategy status drift/,
);

fails(
  'releaseEvidence cannot be flipped true',
  (() => {
    const input = clone(live);
    input.registry.releaseEvidence = true;
    return input;
  })(),
  /releaseEvidence must be false/,
);

fails(
  'mapped cannot use quality-eval evidenceKind',
  withTask('GT-06', { status: 'mapped', evidenceKind: 'quality-eval' }),
  /mapped cannot use evidenceKind=quality-eval/,
);

fails(
  'docs:check cannot be a covering gate',
  withTask('GT-06', { mappedCommands: ['docs:check'] }),
  /docs:check is a meta\/docs script/,
);

fails(
  'duplicate mappedCommands are rejected',
  withTask('GT-06', { mappedCommands: ['scoring-integrity:prove', 'scoring-integrity:prove'] }),
  /duplicate mappedCommands/,
);

fails(
  'planned cannot claim covers',
  withTask('GT-01', { covers: ['pretend'] }),
  /planned must not claim covers/,
);

fails(
  'README status column ignores decoy backticks in the last cell',
  (() => {
    const input = clone(live);
    input.readme = input.readme.replace(
      '| [GT-01](./GT-01-frontend-project-deep-dive.md) | 前端岗 + 有项目简历 → 8–12 题且含项目深挖 | `planned` |',
      '| [GT-01](./GT-01-frontend-project-deep-dive.md) | 前端岗 + 有项目简历 → 8–12 题且含项目深挖 | `planned` | decoy `mapped` |',
    );
    input.registry.tasks.find((task) => task.id === 'GT-01').status = 'mapped';
    input.registry.tasks.find((task) => task.id === 'GT-01').mappedCommands = ['scoring-golden:prove'];
    input.registry.tasks.find((task) => task.id === 'GT-01').covers = ['fake'];
    input.registry.tasks.find((task) => task.id === 'GT-01').uncovered = [];
    input.registry.tasks.find((task) => task.id === 'GT-01').evidenceKind = 'deterministic-prove';
    input.docs['ai-docs/testing/golden-tasks/GT-01-frontend-project-deep-dive.md'] = '---\nid: GT-01\nstatus: mapped\n---\n';
    input.strategy = input.strategy.replace('`GT-01` **planned**', '`GT-01` **mapped**');
    return input;
  })(),
  /README status drift/,
);

fails(
  'test-strategy rejects a conflicting extra status mention',
  (() => {
    const input = clone(live);
    input.strategy = `${input.strategy}\n\n decoy \`GT-01\` **mapped**.\n`;
    return input;
  })(),
  /test-strategy status drift/,
);

fails(
  'ai-output task cannot be mapped',
  withTask('GT-02', { status: 'mapped' }),
  /ai-output cannot be mapped/,
);

fails(
  'GT-01 cannot be labeled mechanism',
  withTask('GT-01', { subject: 'mechanism' }),
  /subject must be ai-output/,
);

fails(
  'GT-06 cannot be labeled ai-output',
  withTask('GT-06', { subject: 'ai-output' }),
  /subject must be mechanism/,
);

console.log(`\n✓ golden-tasks check honesty proof: ${passed} cases`);
