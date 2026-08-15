/** Parse the cloud-only compose file with deterministic non-secret placeholders.
 * This validates YAML/interpolation without asking a developer to export real
 * production credentials or creating any container. */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const compose = readFileSync('docker/compose.prod.yml', 'utf8');
const env = { ...process.env };
for (const match of compose.matchAll(/\$\{([A-Z][A-Z0-9_]*):\?/g)) {
  const name = match[1];
  if (name) env[name] = env[name] || `compose-contract-${name.toLowerCase()}`;
}
try {
  execFileSync('docker', ['compose', '-f', 'docker/compose.prod.yml', 'config', '--quiet'], { env, stdio: 'pipe' });
  console.log('✓ production compose parses with non-secret contract placeholders');
} catch (error) {
  const stderr = error && typeof error === 'object' && 'stderr' in error ? String(error.stderr) : String(error);
  throw new Error(`production_compose_invalid:${stderr.slice(-1000)}`);
}
