import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const skipChecks = args.has('--skip-checks');
const shell = process.platform === 'win32';

function run(cmdArgs, stdio = 'inherit') {
  const res = spawnSync('pnpm', cmdArgs, { stdio, encoding: 'utf8', shell });
  if (stdio === 'inherit' && res.status !== 0) {
    process.exit(res.status ?? 1);
  }
  return res;
}

function assertContains(filePath, expected) {
  const fullPath = resolve(filePath);
  if (!existsSync(fullPath)) {
    console.error(`Missing build artifact: ${filePath}`);
    process.exit(1);
  }
  if (!readFileSync(fullPath, 'utf8').includes(expected)) {
    console.error(`Expected "${expected}" in ${filePath}`);
    process.exit(1);
  }
}

if (!dryRun && !process.env.CLOUDFLARE_API_TOKEN) {
  const auth = run(['exec', 'wrangler', 'whoami'], 'pipe');
  const out = `${auth.stdout ?? ''}${auth.stderr ?? ''}`;
  if (auth.status !== 0 || /not authenticated/i.test(out)) {
    if (!process.stdin.isTTY || process.env.CI) {
      console.error('Missing Cloudflare credentials. Set CLOUDFLARE_API_TOKEN or run `pnpm cf:login`.');
      process.exit(1);
    }
    run(['exec', 'wrangler', 'login']);
  }
}

if (!skipChecks) {
  run(['lint']);
  run(['typecheck']);
  run(['test']);
}

run(['build']);
assertContains('dist/index.html', "connect-src 'none'");
assertContains('dist/_headers', "connect-src 'none'");

const deployArgs = ['exec', 'wrangler', 'deploy'];
if (dryRun) deployArgs.push('--dry-run');
run(deployArgs);
