#!/usr/bin/env node
/**
 * FIX-G3：conflict-marker-scan 行为证明（种植临时 git 仓，不碰本仓）。
 * 断言：三种标记各自命中；二进制、vendor 类目录、近似但非标记的行不命中；干净仓退出 0、有命中退出 1。
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SCAN = resolve(new URL('./conflict-marker-scan.mjs', import.meta.url).pathname);
const L = '<'.repeat(7), E = '='.repeat(7), R = '>'.repeat(7);
let failures = 0;
const A = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : ` — ${detail}`}`); if (!ok) failures++; };
const git = (cwd, ...args) => {
  const r = spawnSync('git', ['-c', 'user.email=proof@example.invalid', '-c', 'user.name=proof', ...args], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
};
const run = (root) => {
  const r = spawnSync(process.execPath, [SCAN, '--root', root], { encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: '' } });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};
const mkRepo = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'cms-proof-'));
  git(dir, 'init', '-q');
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(join(dir, rel, '..'), { recursive: true });
    writeFileSync(join(dir, rel), body);
  }
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'seed', '--allow-empty');
  return dir;
};

const dirs = [];
try {
  // 干净仓：近似但不是标记的行都不应命中
  const clean = mkRepo({
    'README.md': ['Title', E + '=', '', `${L}<`, `x ${L} y`, `${E} trailing`, `${R}x`, ' ' + E, ''].join('\n'),
    'src/a.ts': 'export const a = 1;\n',
  });
  dirs.push(clean);
  const c = run(clean);
  A('干净仓（含 8 个 =、行内/缩进/后缀粘连的近似串）→ 退出 0', c.code === 0, c.out);

  // 三种标记各自独立命中
  for (const [label, line] of [['ours', `${L} HEAD`], ['ours（行尾）', L], ['separator', E], ['theirs', `${R} feature/x`], ['theirs（行尾）', R]]) {
    const d = mkRepo({ 'pkg/x.json': `{\n${line}\n}\n` });
    dirs.push(d);
    const r = run(d);
    A(`单独种植 ${label} 标记 → 退出 1 且报 pkg/x.json:2`, r.code === 1 && r.out.includes('pkg/x.json:2'), r.out);
  }

  // 完整冲突块 + CRLF
  const full = mkRepo({ 'docs/conflict.md': [`${L} HEAD`, 'a', E, 'b', `${R} other`, ''].join('\r\n') });
  dirs.push(full);
  const f = run(full);
  A('完整冲突块（CRLF）→ 退出 1，三行全报', f.code === 1 && ['docs/conflict.md:1', 'docs/conflict.md:3', 'docs/conflict.md:5'].every((s) => f.out.includes(s)), f.out);
  A('输出不回显冲突块正文（只报 文件:行号:类型）', !f.out.includes('feature') && !f.out.includes('other\n'), f.out);

  // 排除面：二进制与 vendor 类目录
  const body = `${L} HEAD\na\n${E}\nb\n${R} x\n`;
  const excluded = mkRepo({
    'assets/blob.bin': Buffer.concat([Buffer.from([0, 1, 2, 0]), Buffer.from(body)]),
    'vendor/lib/a.js': body,
    'packages/p/node_modules/dep/index.js': body,
    'third_party/t.c': body,
    'third-party/t.c': body,
    'src/ok.ts': 'export {};\n',
  });
  dirs.push(excluded);
  const x = run(excluded);
  A('二进制（含 NUL）与 vendor/node_modules/third_party/third-party 内的标记 → 不命中，退出 0', x.code === 0, x.out);

  // 非 git 目录 → 退出 2（fail-loud，不假绿）
  const notGit = mkdtempSync(join(tmpdir(), 'cms-proof-nogit-'));
  dirs.push(notGit);
  const n = run(notGit);
  A('非 git 目录 → 退出 2（git 调用失败即红，不当作干净）', n.code === 2, n.out);
} finally {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
}
console.log(`\n${failures === 0 ? '✓ conflict-marker-scan proof passed' : `✗ ${failures} failed`}`);
process.exit(failures === 0 ? 0 : 1);
