// 测试用的小工具：把浏览器里用的普通 <script> 文件加载进 Node 的沙箱里
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');

export function loadSandbox(files) {
  const sandbox = { console };
  vm.createContext(sandbox);
  for (const rel of files) {
    const file = path.join(ROOT, rel);
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  return sandbox;
}

export function loadCC(extra) {
  const files = ['assets/js/interpreter.js'].concat(extra || []);
  return loadSandbox(files).CC;
}

let passed = 0;
let failed = 0;
const failures = [];
let group = '';

export function describe(name, fn) {
  group = name;
  process.stdout.write('\n\u25b8 ' + name + '\n');
  fn();
}

export function test(name, fn) {
  try {
    fn();
    passed++;
    process.stdout.write('  \u2713 ' + name + '\n');
  } catch (e) {
    failed++;
    process.stdout.write('  \u2717 ' + name + '\n');
    failures.push({ group, name, error: e });
  }
}

export function ok(cond, msg) {
  if (!cond) throw new Error(msg || 'expected truthy');
}

export function eq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error((msg ? msg + ': ' : '') + 'expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
  }
}

export function contains(haystack, needle, msg) {
  if (String(haystack).indexOf(needle) < 0) {
    throw new Error((msg ? msg + ': ' : '') + 'expected to contain ' + JSON.stringify(needle) + ' but got ' + JSON.stringify(String(haystack).slice(0, 400)));
  }
}

export function summary() {
  process.stdout.write('\n' + (failed === 0 ? '\u2705 ' : '\u274c ') + passed + ' passed, ' + failed + ' failed\n');
  for (const f of failures) {
    process.stdout.write('\n--- ' + f.group + ' / ' + f.name + '\n' + (f.error && f.error.stack || f.error) + '\n');
  }
  if (failed > 0) process.exitCode = 1;
  return failed === 0;
}