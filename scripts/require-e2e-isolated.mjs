#!/usr/bin/env node
/**
 * Fail-closed guard for package.json `:raw` scripts. Bare `pnpm <name>:raw`
 * must not talk to a developer or cloud database. The isolated runner sets
 * E2E_ISOLATED=1 before it spawns the inner command.
 */
if (String(process.env.E2E_ISOLATED ?? '') !== '1') {
  console.error(
    '[require-e2e-isolated] refuse bare :raw (E2E_ISOLATED!=1). ' +
      'Use the isolated wrapper (pnpm <script> without :raw), not pnpm <script>:raw. ' +
      'releaseEvidence=false · Not HA.',
  );
  process.exit(1);
}
const args = process.argv.slice(2);
if (args[0] === '--') args.shift();
if (args.length === 0) process.exit(0);
const { spawn } = await import('node:child_process');
const child = spawn(args[0], args.slice(1), { stdio: 'inherit', env: process.env });
child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 1));
});
