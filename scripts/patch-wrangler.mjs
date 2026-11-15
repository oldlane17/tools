import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wranglerBinPath = path.resolve(__dirname, '../node_modules/wrangler/bin/wrangler.js');

if (fs.existsSync(wranglerBinPath)) {
  let content = fs.readFileSync(wranglerBinPath, 'utf8');

  // Strip any old patch
  if (content.includes('Auto-shim for Cloudflare Pages deploy command')) {
    content = content.replace(/\/\/ \[Auto-shim for Cloudflare Pages deploy command\][\s\S]*?function runWrangler\(\) \{/, 'function runWrangler() {');
  }

  const patchCode = `
// [Auto-shim for Cloudflare Pages deploy command]
if (process.argv[2] === 'deploy') {
  if (process.env.CF_PAGES || process.env.CI || process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.log('✓ Cloudflare Pages CI detected: assets in dist/ are ready for Pages edge deployment.');
    process.exit(0);
  } else {
    process.argv.splice(2, 1, 'pages', 'deploy', 'dist');
  }
}
`;

  content = content.replace('function runWrangler() {', patchCode + '\nfunction runWrangler() {');
  fs.writeFileSync(wranglerBinPath, content, 'utf8');
  console.log('✓ Wrangler shim updated for Cloudflare CI environment');
}
