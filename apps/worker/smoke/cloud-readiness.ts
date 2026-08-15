/**
 * `pnpm cloud:smoke --run <run-id>`
 *
 * A read-only validation to be run from the dedicated VPC test runner.  It
 * deliberately makes no schema, object-storage, queue, model or cache writes.
 */
import { cloudSmokeFailure, runCloudSmoke } from '../src/cloud-smoke-runner.ts';
const runIndex = process.argv.indexOf('--run');
const argvRunId = runIndex >= 0 ? process.argv[runIndex + 1] : undefined;

async function main(): Promise<void> {
  try {
    console.log(JSON.stringify(await runCloudSmoke(argvRunId)));
  } catch (error) {
    console.error(JSON.stringify({ kind: 'cloud_connectivity_receipt', status: 'failed', code: cloudSmokeFailure(error) }));
    process.exitCode = 1;
  }
}

void main();
