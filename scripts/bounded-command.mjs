/**
 * Bounded local child-process execution for the isolation runner.
 *
 * This module deliberately returns only a small stdout buffer.  Callers must
 * not put captured stderr/stdout in receipts or thrown errors: a failed test
 * may have printed a fixture, endpoint, token or user content.
 */
import { spawn } from 'node:child_process';

const DEFAULT_MAX_OUTPUT_BYTES = 128 * 1024;

export class BoundedCommandError extends Error {
  constructor(code) {
    super(code);
    this.name = 'BoundedCommandError';
    this.code = code;
  }
}

function terminateProcessGroup(child, signal) {
  try {
    if (child.pid && process.platform !== 'win32') process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch {
    // The child may already have exited between the timeout and the signal.
  }
}

/**
 * Runs one local, non-shell command with a hard deadline.
 *
 * POSIX commands run in their own process group so a wrapper such as Docker
 * cannot leave a local descendant alive after its caller timed out.  A Docker
 * container created by the caller is cleaned by that caller's `finally` block;
 * this helper never enumerates or kills unrelated containers/processes.
 */
export function captureBounded(command, args, {
  cwd,
  env,
  timeoutMs,
  maxOutputBytes = DEFAULT_MAX_OUTPUT_BYTES,
} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) throw new BoundedCommandError('bounded_command_timeout_invalid');
  if (!Number.isInteger(maxOutputBytes) || maxOutputBytes <= 0) throw new BoundedCommandError('bounded_command_output_limit_invalid');

  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(command, args, {
        cwd,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
        detached: process.platform !== 'win32',
      });
    } catch {
      reject(new BoundedCommandError('bounded_command_spawn_failed'));
      return;
    }

    let stdout = '';
    let stdoutBytes = 0;
    let settled = false;
    let timedOut = false;
    const settle = (outcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      clearTimeout(forceKill);
      if (outcome instanceof Error) reject(outcome);
      else resolve(outcome);
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      terminateProcessGroup(child, 'SIGTERM');
    }, timeoutMs);
    const forceKill = setTimeout(() => {
      if (timedOut) terminateProcessGroup(child, 'SIGKILL');
    }, timeoutMs + 1_000);
    forceKill.unref();

    child.stdout.on('data', (chunk) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes <= maxOutputBytes) stdout += chunk.toString('utf8');
    });
    // Drain stderr so a noisy child cannot block. It is intentionally never
    // retained, printed or returned by this low-level helper.
    child.stderr.on('data', () => {});
    child.once('error', () => settle(new BoundedCommandError('bounded_command_spawn_failed')));
    child.once('close', (code) => {
      if (timedOut) return settle(new BoundedCommandError('bounded_command_timeout'));
      if (stdoutBytes > maxOutputBytes) return settle(new BoundedCommandError('bounded_command_output_exceeded'));
      if (code !== 0) return settle(new BoundedCommandError('bounded_command_exit_nonzero'));
      settle(stdout.trim());
    });
  });
}
