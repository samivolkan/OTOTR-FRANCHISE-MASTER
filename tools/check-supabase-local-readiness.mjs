#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const useShell = process.platform === 'win32';
  const result = useShell
    ? spawnSync([command, ...args].join(' '), {
        encoding: 'utf8',
        timeout: options.timeout ?? 15000,
        shell: true,
      })
    : spawnSync(command, args, {
    encoding: 'utf8',
    timeout: options.timeout ?? 15000,
    shell: false,
      });
  return {
    command: [command, ...args].join(' '),
    status: result.status,
    signal: result.signal,
    stdout: clean(result.stdout),
    stderr: clean(result.stderr),
    ok: result.status === 0,
  };
}

function clean(value) {
  return (value || '').replace(/\0/g, '').trim();
}

function line(label, result) {
  const state = result.ok ? 'OK' : 'BLOCKED';
  const detail =
    result.stdout ||
    result.stderr ||
    result.error?.message ||
    result.signal ||
    `exit ${result.status}`;
  console.log(`${state} ${label}: ${detail.split(/\r?\n/)[0]}`);
}

const checks = [
  ['WSL', run('wsl', ['--status'])],
  ['Docker', run('docker', ['version', '--format', '{{.Server.Version}}'])],
  ['Supabase CLI', run('npx.cmd', ['supabase', '--version'], { timeout: 30000 })],
  ['Supabase status', run('npx.cmd', ['supabase', 'status'], { timeout: 30000 })],
];

for (const [label, result] of checks) {
  line(label, result);
}

const required = checks.slice(0, 3).every(([, result]) => result.ok);
if (!required) {
  console.error('Local Supabase prerequisites are not ready.');
  process.exitCode = 1;
} else if (!checks[3][1].ok) {
  console.error('Prerequisites are present, but the local Supabase stack is not running.');
  process.exitCode = 2;
} else {
  console.log('Local Supabase stack appears ready.');
}
