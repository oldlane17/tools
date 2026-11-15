import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wranglerBinPath = path.resolve(__dirname, '../node_modules/wrangler/bin/wrangler.js');

if (fs.existsSync(wranglerBinPath)) {
  let content = fs.readFileSync(wranglerBinPath, 'utf8');
  const patchCode = `
// [Auto-shim for Cloudflare Pages deploy command]
if (process.argv[2] === 'deploy') {
  process.argv.splice(2, 1, 'pages', 'deploy', 'dist');
}
`;
  if (!content.includes('Auto-shim for Cloudflare Pages deploy command')) {
    content = content.replace('function runWrangler() {', patchCode + '\nfunction runWrangler() {');
    fs.writeFileSync(wranglerBinPath, content, 'utf8');
    console.log('✓ Wrangler shim applied: "wrangler deploy" -> "wrangler pages deploy dist"');
  }
}
