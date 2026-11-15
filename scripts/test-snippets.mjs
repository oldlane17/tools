import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SNIPPETS_DIR = path.join(ROOT, 'snippets');

console.log('🧪 Testing Python snippets in snippets/...\n');

const files = fs.readdirSync(SNIPPETS_DIR).filter(f => f.endsWith('.py'));
let passed = 0;
let failed = 0;

for (const f of files) {
  const filePath = path.join(SNIPPETS_DIR, f);
  // Try 'py' or 'python'
  let res = spawnSync('py', [filePath], { encoding: 'utf8' });
  if (res.error) {
    res = spawnSync('python', [filePath], { encoding: 'utf8' });
  }

  if (res.status === 0) {
    console.log(`  ✓ ${f}`);
    passed++;
  } else {
    console.error(`  ✗ ${f} failed with exit code ${res.status}`);
    if (res.stderr) console.error(`    ${res.stderr.trim()}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
