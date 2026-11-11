/**
 * Bounded local child-process execution for the isolation runner.
 *
 * This module returns only a small stdout buffer on success. Callers must
 * not put captured stderr/stdout in receipts or thrown errors: a failed test
 * may have printed a fixture, endpoint, token or user content. On failure the
 * helper prints a bounded, redacted stderr tail to the operator sink so the
 * exit is diagnosable; the Error itself stays a fixed code. The printed label
 * is only `basename(command)` plus the first subcommand — never raw argv,
 * `--eval` source, or `-e K=V` assignments.
 */
import { spawn, spawnSync } from 'node:child_process';
import { basename } from 'node:path';
import { CREDENTIAL_RULES } from './e2e-static-guards.mjs';

const DEFAULT_MAX_OUTPUT_BYTES = 128 * 1024;
const DEFAULT_STDERR_TAIL_BYTES = 8 * 1024;
const SIGNAL_EXIT_CODES = Object.freeze({ SIGINT: 130, SIGTERM: 143 });
const URL_USERINFO_PATTERN = /\/\/([^/\s:@]+):([^/\s@]+)@/g;
const CREDENTIAL_ASSIGNMENT_PATTERN = /(KEY|TOKEN|SECRET|PASSWORD|AUTHORIZATION)\s*[:=]\s*\S+(?:\s+\S+)?/gi;
const BEARER_PATTERN = /\bBearer\s+\S+/gi;

/** Shared compose files whose named data volumes the isolated runner must never `down -v`. */
export const PROTECTED_NAMED_VOLUME_COMPOSE = Object.freeze(['docker/compose.mysql-local.yml']);

export class BoundedCommandError extends Error {
  constructor(code) {
    super(code);
    this.name = 'BoundedCommandError';
    this.code = code;
  }
}

/**
 * Operator-safe command label: basename plus the first non-option subcommand.
 * Never include later argv, `--eval` source, or `-e K=V` values.
 */
export function commandLabel(command, args = []) {
  const raw = String(command ?? '').trim() || 'child';
  const name = basename(raw);
  const list = Array.isArray(args) ? args : [];
  const first = list.find((arg) => (
    typeof arg === 'string'
    && /^[A-Za-z0-9][A-Za-z0-9:_-]*$/.test(arg)
  ));
  return first ? `${name} ${first}` : name;
}

/**
 * Redact credential-shaped text before any operator/CI sink sees it.
 * Applies URL userinfo, CREDENTIAL_RULES, KEY/TOKEN/SECRET/PASSWORD/
 * AUTHORIZATION assignments, and Bearer tokens.
 */
export function redactFailureText(input) {
  let text = String(input ?? '');
  text = text.replace(URL_USERINFO_PATTERN, '//$1:***@');
  for (const { pattern } of CREDENTIAL_RULES) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    text = text.replace(new RegExp(pattern.source, flags), '[REDACTED]');
  }
  text = text.replace(BEARER_PATTERN, 'Bearer [REDACTED]');
  text = text.replace(CREDENTIAL_ASSIGNMENT_PATTERN, (match) => {
    const sep = match.includes('=') ? '=' : ':';
    const key = match.split(/[:=]/)[0];
    return `${key}${sep}[REDACTED]`;
  });
  return text;
}

/**
 * Keep only the trailing bytes of untrusted child stderr for a failure tail.
 */
export function appendStderrTail(current, chunk, maxBytes = DEFAULT_STDERR_TAIL_BYTES) {
  if (!Number.isInteger(maxBytes) || maxBytes <= 0) throw new BoundedCommandError('bounded_command_stderr_tail_limit_invalid');
  const next = `${current ?? ''}${chunk == null ? '' : chunk.toString('utf8')}`;
  return next.length <= maxBytes ? next : next.slice(next.length - maxBytes);
}

/**
 * Print a bounded, redacted stderr tail on failure. Never attach the tail to
 * thrown errors or receipts. `sink` is injectable so proves can capture the text.
 */
export function writeFailureStderrTail(tail, { exitCode, command } = {}, sink = process.stderr) {
  const text = redactFailureText(String(tail ?? ''));
  if (!text) return;
  const label = redactFailureText(String(command ?? 'child'));
  const bytes = Buffer.byteLength(text);
  const write = typeof sink?.write === 'function' ? (chunk) => sink.write(chunk) : (chunk) => process.stderr.write(chunk);
  write(`ISOLATED_CHILD_STDERR_TAIL exit=${exitCode ?? 'unknown'} command=${label} bytes=${bytes}\n`);
  write(text);
  if (!text.endsWith('\n')) write('\n');
  write('ISOLATED_CHILD_STDERR_TAIL_END\n');
}

/**
 * `docker rm` args for disposable isolated-runner containers.
 * `-v` removes anonymous volumes attached to those containers only.
 * Named volumes (including compose.mysql-local data volumes) are not deleted.
 */
export function disposableDockerRmArgs(names) {
  const list = Array.isArray(names) ? names : [names];
  if (list.length === 0) throw new BoundedCommandError('disposable_docker_rm_names_missing');
  for (const name of list) {
    if (typeof name !== 'string' || !name.trim() || name.startsWith('-') || /\s/.test(name)) {
      throw new BoundedCommandError('disposable_docker_rm_name_invalid');
    }
  }
  return ['rm', '-f', '-v', ...list];
}

function normalizeContainerNames(names) {
  const list = Array.isArray(names) ? names : (names ? [names] : []);
  return list.filter((name) => typeof name === 'string' && name.trim() && !name.startsWith('-') && !/\s/.test(name));
}

/**
 * Synchronously `docker rm -f -v` the disposable containers named by
 * `getContainerNames()`. Used by both SIGINT/SIGTERM handlers and the
 * runner `finally` block so a signal exit takes the same cleanup path.
 * Returns only those named volumes; never prunes and never enumerates
 * unrelated `meetwise-e2e-*` containers.
 */
export function cleanupDisposableContainersSync(names) {
  const list = normalizeContainerNames(names);
  if (list.length === 0) return;
  spawnSync('docker', disposableDockerRmArgs(list), { stdio: 'ignore', timeout: 20_000 });
}

/**
 * Install SIGINT/SIGTERM handlers that clean disposable containers, then
 * exit 130/143. `getContainerNames` is called at signal time so a container
 * created after install is still covered.
 */
export function installDisposableContainerSignalCleanup({ getContainerNames, cleanup } = {}) {
  if (typeof getContainerNames !== 'function') {
    throw new BoundedCommandError('disposable_signal_cleanup_getter_invalid');
  }
  const runCleanup = typeof cleanup === 'function'
    ? cleanup
    : () => cleanupDisposableContainersSync(getContainerNames());
  const handle = (signal) => {
    try { runCleanup(); } catch { /* still exit with the signal code */ }
    process.exit(SIGNAL_EXIT_CODES[signal] ?? 1);
  };
  process.on('SIGINT', () => handle('SIGINT'));
  process.on('SIGTERM', () => handle('SIGTERM'));
  return runCleanup;
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
  stderrSink = process.stderr,
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
    let stderrTail = '';
    let settled = false;
    let timedOut = false;
    const label = commandLabel(command, args);
    const emitFailureTail = (exitCode) => {
      writeFailureStderrTail(stderrTail, { exitCode, command: label }, stderrSink);
    };
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
    // Drain stderr so a noisy child cannot block. Keep only a bounded tail
    // and print it on failure; never return it from this helper or attach it
    // to BoundedCommandError (receipts stay free of raw child output).
    child.stderr.on('data', (chunk) => {
      stderrTail = appendStderrTail(stderrTail, chunk);
    });
    child.once('error', () => settle(new BoundedCommandError('bounded_command_spawn_failed')));
    child.once('close', (code) => {
      if (timedOut) {
        emitFailureTail('bounded_command_timeout');
        return settle(new BoundedCommandError('bounded_command_timeout'));
      }
      if (stdoutBytes > maxOutputBytes) return settle(new BoundedCommandError('bounded_command_output_exceeded'));
      if (code !== 0) {
        emitFailureTail(code);
        return settle(new BoundedCommandError('bounded_command_exit_nonzero'));
      }
      settle(stdout.trim());
    });
  });
}
