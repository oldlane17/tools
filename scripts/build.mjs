#!/usr/bin/env node
/**
 * scripts/build.mjs — Static Site Generator for tools.oldlane17.com
 * ================================================================
 * Generates all HTML pages, structure partials, JSON-LD schemas,
 * sitemap.xml, and builds/validates all assets.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import hljs from 'highlight.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const TMPL = path.join(ROOT, 'templates');
const DATA = path.join(ROOT, 'data');
const CONFIG = path.join(ROOT, 'config');
const CSS_DIR = path.join(ROOT, 'css');
const SNIPPETS_DIR = path.join(ROOT, 'snippets');

// Load configurations and datasets
const site = JSON.parse(fs.readFileSync(path.join(CONFIG, 'site.json'), 'utf8'));
const tools = JSON.parse(fs.readFileSync(path.join(DATA, 'tools.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(DATA, 'categories.json'), 'utf8'));
const promos = JSON.parse(fs.readFileSync(path.join(DATA, 'promo.json'), 'utf8'));

const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c]));
const toolMap = Object.fromEntries(tools.map(t => [t.slug, t]));

// Helper to escape HTML
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Copy recursive
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Write helper
function write(relPath, content) {
  const fullPath = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}

// Read template
function getTmpl(name) {
  return fs.readFileSync(path.join(TMPL, name), 'utf8');
}

// Extract logo SVGs matching wwwol17
function getLogoBannerSvg(cls = 'nav-logo-svg nav-logo-desktop') {
  const p = path.join(PUBLIC, 'assets', 'logos', 'logo_banner.svg');
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf8')
    .replace(/<\?xml[\s\S]*?\?>/i, '')
    .replace(/<!DOCTYPE[\s\S]*?>/i, '')
    .replace('<svg ', `<svg class="${cls}" `)
    .replace(/width="[^"]*"/i, '')
    .replace(/height="[^"]*"/i, '');
}

function getLogoSvg(cls = 'nav-logo-svg nav-logo-mobile') {
  const p = path.join(PUBLIC, 'assets', 'logos', 'logo.svg');
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf8')
    .replace(/<\?xml[\s\S]*?\?>/i, '')
    .replace(/<!DOCTYPE[\s\S]*?>/i, '')
    .replace('<svg ', `<svg class="${cls}" `)
    .replace(/width="[^"]*"/i, '')
    .replace(/height="[^"]*"/i, '');
}

// Generate structure/header.html and structure/footer.html
function generateStructure() {
  const year = new Date().getFullYear();
  let header = getTmpl('header.html');
  header = header.replaceAll('{{resourcesBase}}', site.resourcesBase);
  header = header.replaceAll('{{logoBannerSvg}}', getLogoBannerSvg());
  header = header.replaceAll('{{logoSvg}}', getLogoSvg());
  write('structure/header.html', header);

  let footer = getTmpl('footer.html');
  footer = footer.replaceAll('{{year}}', String(year));
  footer = footer.replaceAll('{{resourcesBase}}', site.resourcesBase);
  write('structure/footer.html', footer);

  console.log('  ✓ Generated /structure/header.html and /structure/footer.html');
}

// Pick deterministic promo card for tool
function getPromoForSlug(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % promos.length;
  return promos[idx];
}

function renderPromoCard(promo) {
  return `
    <div class="promo-card">
      <div class="promo-content">
        <span class="promo-icon" aria-hidden="true">${promo.icon}</span>
        <div class="promo-info">
          <h3>${esc(promo.title)}</h3>
          <p>${esc(promo.text)}</p>
        </div>
      </div>
      <div class="promo-cta">
        <a href="${esc(promo.url)}" class="btn btn-secondary" target="_blank" rel="noopener">Visit &rarr;</a>
      </div>
    </div>
  `;
}

// Wrap content in base.html
function renderPage({ title, description, canonicalUrl, content, jsonLd = null, toolScript = null, bodyAttrs = '' }) {
  let base = getTmpl('base.html');
  base = base.replaceAll('{{title}}', esc(title));
  base = base.replaceAll('{{description}}', esc(description));
  base = base.replaceAll('{{canonicalUrl}}', esc(canonicalUrl));
  base = base.replaceAll('{{ogType}}', 'website');
  base = base.replaceAll('{{ogImage}}', `${site.resourcesBase}/branding/favicon.png`);
  base = base.replaceAll('{{resourcesBase}}', site.resourcesBase);
  base = base.replaceAll('{{content}}', content);

  if (bodyAttrs) {
    base = base.replace(/\{\{#if bodyAttrs\}\}([\s\S]*?)\{\{\/if\}\}/, bodyAttrs);
  } else {
    base = base.replace(/\{\{#if bodyAttrs\}\}[\s\S]*?\{\{\/if\}\}/, '');
  }

  if (toolScript) {
    base = base.replace(/\{\{#if toolScript\}\}([\s\S]*?)\{\{\/if\}\}/, `<script src="${toolScript}" defer></script>`);
  } else {
    base = base.replace(/\{\{#if toolScript\}\}[\s\S]*?\{\{\/if\}\}/, '');
  }

  if (jsonLd) {
    base = base.replace(/\{\{#if jsonLd\}\}([\s\S]*?)\{\{\/if\}\}/, `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`);
  } else {
    base = base.replace(/\{\{#if jsonLd\}\}[\s\S]*?\{\{\/if\}\}/, '');
  }

  return base;
}

// Generate Home Page
function generateHome() {
  let homeTmpl = getTmpl('home.html');

  // Categories chips
  const catHtml = categories.map(c => `
    <a href="/category/${c.slug}/" class="category-chip">${c.icon} ${esc(c.name)}</a>
  `).join('');
  homeTmpl = homeTmpl.replace(/\{\{#each categories\}\}[\s\S]*?\{\{\/each\}\}/, catHtml);
  homeTmpl = homeTmpl.replace('{{totalToolsCount}}', String(tools.length));

  // Tools grid
  const toolsHtml = tools.map(t => {
    const cat = categoryMap[t.category] || { name: t.category };
    const typeLabel = t.type === 'external' ? 'External App' : 'Instant Tool';
    return `
      <a href="/tools/${t.slug}/" class="tool-card" data-title="${esc(t.name)}" data-keywords="${esc((t.keywords || []).join(' '))}" data-desc="${esc(t.short)}" data-category="${esc(t.category)}">
        <div class="tool-card-header">
          <span class="tool-card-icon" aria-hidden="true">${t.icon}</span>
          <h2 class="tool-card-title">${esc(t.name)}</h2>
        </div>
        <p class="tool-card-desc">${esc(t.short)}</p>
        <div class="tool-card-footer">
          <span class="category-chip" style="font-size:0.75rem;padding:0.15rem 0.5rem">${esc(cat.name)}</span>
          <span class="tool-type-badge ${t.type}">${typeLabel}</span>
        </div>
      </a>
    `;
  }).join('');
  homeTmpl = homeTmpl.replace(/\{\{#each tools\}\}[\s\S]*?\{\{\/each\}\}/, toolsHtml);

  // Promo card
  const promo = promos[0];
  homeTmpl = homeTmpl.replace('{{{promoCard}}}', renderPromoCard(promo));

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': site.name,
    'url': site.url,
    'description': site.description,
    'publisher': {
      '@type': 'Organization',
      'name': 'Old Lane 17',
      'url': site.mainSiteUrl,
      'logo': `${site.resourcesBase}/branding/favicon.png`
    }
  };

  const html = renderPage({
    title: `${site.name} – Free Online Developer Tools & Converters`,
    description: site.description,
    canonicalUrl: `${site.url}/`,
    content: homeTmpl,
    jsonLd
  });

  write('index.html', html);
  console.log('  ✓ Generated index.html');
}

// Generate Category Pages
function generateCategories() {
  const catTmpl = getTmpl('category.html');

  for (const cat of categories) {
    const catTools = tools.filter(t => t.category === cat.slug);
    let content = catTmpl;

    content = content.replaceAll('{{category.name}}', esc(cat.name));
    content = content.replaceAll('{{category.icon}}', cat.icon);
    content = content.replaceAll('{{category.short}}', esc(cat.short));
    content = content.replaceAll('{{category.slug}}', cat.slug);

    // All categories navigation
    const allCatHtml = categories.map(c => `
      <a href="/category/${c.slug}/" class="category-chip ${c.slug === cat.slug ? 'active' : ''}">${c.icon} ${esc(c.name)}</a>
    `).join('');
    content = content.replace(/\{\{#each allCategories\}\}[\s\S]*?\{\{\/each\}\}/, allCatHtml);

    // Tools
    const toolsHtml = catTools.map(t => {
      const typeLabel = t.type === 'external' ? 'External App' : 'Instant Tool';
      return `
        <a href="/tools/${t.slug}/" class="tool-card">
          <div class="tool-card-header">
            <span class="tool-card-icon" aria-hidden="true">${t.icon}</span>
            <h2 class="tool-card-title">${esc(t.name)}</h2>
          </div>
          <p class="tool-card-desc">${esc(t.short)}</p>
          <div class="tool-card-footer">
            <span class="tool-type-badge ${t.type}">${typeLabel}</span>
            <span>Open tool &rarr;</span>
          </div>
        </a>
      `;
    }).join('');
    content = content.replace(/\{\{#each categoryTools\}\}[\s\S]*?\{\{\/each\}\}/, toolsHtml);

    // Promo
    const promo = getPromoForSlug(cat.slug);
    content = content.replace('{{{promoCard}}}', renderPromoCard(promo));

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': `${cat.name} – ${site.name}`,
      'description': cat.short,
      'url': `${site.url}/category/${cat.slug}/`,
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${site.url}/` },
          { '@type': 'ListItem', 'position': 2, 'name': cat.name, 'item': `${site.url}/category/${cat.slug}/` }
        ]
      }
    };

    const html = renderPage({
      title: `${cat.name} – Free Online Tools | ${site.name}`,
      description: cat.short,
      canonicalUrl: `${site.url}/category/${cat.slug}/`,
      content,
      jsonLd
    });

    write(`category/${cat.slug}/index.html`, html);
  }
  console.log(`  ✓ Generated ${categories.length} category pages`);
}

// Generate Individual Tool Pages
function generateTools() {
  const internalTmpl = getTmpl('tool.html');
  const externalTmpl = getTmpl('external-tool.html');

  for (const tool of tools) {
    const isExternal = tool.type === 'external';
    let content = isExternal ? externalTmpl : internalTmpl;
    const cat = categoryMap[tool.category] || { name: tool.category };

    // Basic replacements
    content = content.replaceAll('{{tool.name}}', esc(tool.name));
    content = content.replaceAll('{{tool.icon}}', tool.icon);
    content = content.replaceAll('{{tool.short}}', esc(tool.short));
    content = content.replaceAll('{{tool.description}}', esc(tool.description));
    content = content.replaceAll('{{tool.category}}', tool.category);
    content = content.replaceAll('{{categoryName}}', esc(cat.name));
    content = content.replaceAll('{{tool.slug}}', tool.slug);

    if (isExternal) {
      content = content.replaceAll('{{tool.url}}', esc(tool.url));
      content = content.replaceAll('{{tool.externalHost}}', esc(tool.externalHost || ''));
      const featuresHtml = (tool.features || []).map(f => `<li>${esc(f)}</li>`).join('');
      content = content.replace(/\{\{#each tool\.features\}\}[\s\S]*?\{\{\/each\}\}/, featuresHtml);
      content = content.replace(/\{\{#if tool\.features\}\}([\s\S]*?)\{\{\/if\}\}/, '$1');
    } else {
      // Widget HTML injection
      const widgetPath = path.join(TMPL, 'widgets', `${tool.slug}.html`);
      const widgetHtml = fs.existsSync(widgetPath) ? fs.readFileSync(widgetPath, 'utf8') : '<p>Tool widget loading...</p>';
      content = content.replace('{{{widgetHtml}}}', widgetHtml);

      // Python section
      if (tool.python && tool.python.enabled) {
        content = content.replaceAll('{{tool.python.difficulty}}', esc(tool.python.difficulty));
        content = content.replaceAll('{{tool.python.intro}}', esc(tool.python.intro));
        content = content.replaceAll('{{tool.python.tip}}', esc(tool.python.tip));
        content = content.replaceAll('{{tool.python.file}}', esc(tool.python.file));
        content = content.replaceAll('{{{tool.python.exampleInput}}}', esc(tool.python.exampleInput));
        content = content.replaceAll('{{{tool.python.exampleOutput}}}', esc(tool.python.exampleOutput));

        const snippetFile = path.join(ROOT, tool.python.file);
        let rawPython = fs.existsSync(snippetFile) ? fs.readFileSync(snippetFile, 'utf8') : '# Python snippet';
        const highlighted = hljs.highlight(rawPython, { language: 'python' }).value;
        content = content.replace('{{{pythonCodeHighlighted}}}', highlighted);

        content = content.replace(/\{\{#if tool\.python\.enabled\}\}([\s\S]*?)\{\{\/if\}\}/, '$1');
        content = content.replace(/\{\{#if tool\.python\.exampleInput\}\}([\s\S]*?)\{\{\/if\}\}/, '$1');
      } else {
        content = content.replace(/\{\{#if tool\.python\.enabled\}\}[\s\S]*?\{\{\/if\}\}/, '');
      }
    }

    // How to steps
    const howToHtml = (tool.howTo || []).map(step => `
      <li>
        <strong>${esc(step.title)}:</strong> ${esc(step.text)}
      </li>
    `).join('');
    content = content.replace(/\{\{#each tool\.howTo\}\}[\s\S]*?\{\{\/each\}\}/, howToHtml);

    // FAQ items
    const faqHtml = (tool.faq || []).map(f => `
      <div class="faq-item">
        <h3 class="faq-question">${esc(f.q)}</h3>
        <p class="faq-answer">${esc(f.a)}</p>
      </div>
    `).join('');
    content = content.replace(/\{\{#each tool\.faq\}\}[\s\S]*?\{\{\/each\}\}/, faqHtml);

    // Related tools
    const relatedList = (tool.related || []).map(relSlug => toolMap[relSlug]).filter(Boolean).slice(0, 4);
    const relatedHtml = relatedList.map(rel => {
      const relCat = categoryMap[rel.category] || { name: rel.category };
      const typeLabel = rel.type === 'external' ? 'External App' : 'Instant Tool';
      return `
        <a href="/tools/${rel.slug}/" class="tool-card">
          <div class="tool-card-header">
            <span class="tool-card-icon" aria-hidden="true">${rel.icon}</span>
            <h3 class="tool-card-title">${esc(rel.name)}</h3>
          </div>
          <p class="tool-card-desc">${esc(rel.short)}</p>
          <div class="tool-card-footer">
            <span class="category-chip" style="font-size:0.75rem;padding:0.15rem 0.5rem">${esc(relCat.name)}</span>
            <span class="tool-type-badge ${rel.type}">${typeLabel}</span>
          </div>
        </a>
      `;
    }).join('');
    content = content.replace(/\{\{#each relatedTools\}\}[\s\S]*?\{\{\/each\}\}/, relatedHtml);

    // Cross-promo
    const promo = getPromoForSlug(tool.slug);
    content = content.replace('{{{promoCard}}}', renderPromoCard(promo));

    // Structured data JSON-LD (WebApplication, BreadcrumbList, FAQPage, HowTo, SoftwareSourceCode)
    const jsonLdGraph = [
      {
        '@type': 'WebApplication',
        'name': tool.name,
        'description': tool.description,
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'Any',
        'url': `${site.url}/tools/${tool.slug}/`,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${site.url}/` },
          { '@type': 'ListItem', 'position': 2, 'name': cat.name, 'item': `${site.url}/category/${tool.category}/` },
          { '@type': 'ListItem', 'position': 3, 'name': tool.name, 'item': `${site.url}/tools/${tool.slug}/` }
        ]
      }
    ];

    if (tool.faq && tool.faq.length > 0) {
      jsonLdGraph.push({
        '@type': 'FAQPage',
        'mainEntity': tool.faq.map(f => ({
          '@type': 'Question',
          'name': f.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.a
          }
        }))
      });
    }

    if (tool.howTo && tool.howTo.length > 0) {
      jsonLdGraph.push({
        '@type': 'HowTo',
        'name': `How to use ${tool.name}`,
        'step': tool.howTo.map((h, i) => ({
          '@type': 'HowToStep',
          'position': i + 1,
          'name': h.title,
          'text': h.text
        }))
      });
    }

    if (tool.python && tool.python.enabled) {
      jsonLdGraph.push({
        '@type': 'SoftwareSourceCode',
        'name': `${tool.name} in Python`,
        'programmingLanguage': 'Python',
        'codeSampleType': 'snippet'
      });
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': jsonLdGraph
    };

    const toolScript = isExternal ? null : `/assets/js/tools/${tool.slug}.js`;
    const bodyAttrs = tool.videoSlider ? 'data-videoslider="true"' : '';

    const html = renderPage({
      title: `${tool.name} – Free Online Tool | ${site.name}`,
      description: tool.description,
      canonicalUrl: `${site.url}/tools/${tool.slug}/`,
      content,
      jsonLd,
      toolScript,
      bodyAttrs
    });

    write(`tools/${tool.slug}/index.html`, html);
  }
  console.log(`  ✓ Generated ${tools.length} tool pages`);
}

// Generate Privacy & Legal Pages
function generateLegalPages() {
  const legalTmpl = getTmpl('legal.html');

  // Privacy Policy
  const privacyContent = `
    <p>Last updated: November 15, 2026</p>
    <h2>1. Data Privacy Principles</h2>
    <p>
      At <strong>Old Lane 17 Tools</strong> (<code>tools.oldlane17.com</code>), your privacy is our top priority.
      All client-side converters, encoders, hash generators, and file transformation tools execute entirely within
      your web browser via JavaScript and the HTML5 Canvas/Web Crypto APIs.
    </p>
    <p>
      <strong>Your data never leaves your device:</strong> We do not upload, transmit, store, or log your inputs,
      text strings, uploaded images, documents, or processed outputs on our servers.
    </p>

    <h2>2. Cookies & Local Storage</h2>
    <p>
      We use <code>localStorage</code> solely to remember your theme preferences and your privacy consent decisions.
      We use <code>sessionStorage</code> to prevent intrusive or duplicate advertisements (such as video sliders) during your browsing session.
    </p>

    <h2>3. Advertising Partners (Adcash)</h2>
    <p>
      To provide these developer tools free of charge to everyone worldwide without subscriptions, we display advertisements provided
      by our third-party advertising partner, Adcash. Adcash scripts only load after you have granted explicit consent via our cookie banner.
      Adcash may collect non-identifying telemetry such as IP address and browser type for ad delivery and fraud prevention in accordance
      with GDPR and applicable privacy regulations.
    </p>

    <h2>4. External Links</h2>
    <p>
      Some tools link to external sister projects within the Old Lane 17 ecosystem (e.g. <code>oldlane17.com</code>, <code>vectorcutter.com</code>).
      Each external service maintains its own privacy terms.
    </p>
  `;

  const privacyHtml = renderPage({
    title: `Privacy Policy – ${site.name}`,
    description: 'Privacy Policy for Old Lane 17 Tools. 100% in-browser processing, zero data logging.',
    canonicalUrl: `${site.url}/privacy/`,
    content: legalTmpl.replace('{{pageTitle}}', 'Privacy Policy').replace('{{{pageContent}}}', privacyContent)
  });
  write('privacy/index.html', privacyHtml);

  // Legal Notice / Imprint
  const imprintContent = `
    <h2>Information according to § 5 TMG / Swiss Law</h2>
    <p>
      <strong>Old Lane 17</strong><br>
      Website: <a href="https://www.oldlane17.com">www.oldlane17.com</a><br>
      Tools: <a href="https://tools.oldlane17.com">tools.oldlane17.com</a><br>
      Email: <a href="mailto:contact@oldlane17.com">contact@oldlane17.com</a>
    </p>

    <h2>Disclaimer</h2>
    <p>
      The tools and contents on this site are provided free of charge "as is" without warranty of any kind.
      While we strive for absolute accuracy in our conversion algorithms and cryptographic implementations,
      users should verify mission-critical calculations.
    </p>
  `;

  const imprintHtml = renderPage({
    title: `Legal Notice & Imprint – ${site.name}`,
    description: 'Legal Notice and Imprint for Old Lane 17 Tools.',
    canonicalUrl: `${site.url}/legal-notice/`,
    content: legalTmpl.replace('{{pageTitle}}', 'Legal Notice & Imprint').replace('{{{pageContent}}}', imprintContent)
  });
  write('legal-notice/index.html', imprintHtml);

  // 404 Page
  const notFoundHtml = renderPage({
    title: `Page Not Found (404) – ${site.name}`,
    description: 'The requested tool or page was not found.',
    canonicalUrl: `${site.url}/404.html`,
    content: getTmpl('404.html')
  });
  write('404.html', notFoundHtml);

  console.log('  ✓ Generated /privacy/, /legal-notice/, and /404.html');
}

// Generate Sitemap.xml & robots.txt
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: `${site.url}/`, priority: '1.0', changefreq: 'weekly' },
    ...categories.map(c => ({ loc: `${site.url}/category/${c.slug}/`, priority: '0.8', changefreq: 'weekly' })),
    ...tools.map(t => ({ loc: `${site.url}/tools/${t.slug}/`, priority: '0.9', changefreq: 'monthly', lastmod: t.dateModified || today })),
    { loc: `${site.url}/privacy/`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${site.url}/legal-notice/`, priority: '0.3', changefreq: 'yearly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of urls) {
    xml += `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`;
  }
  xml += `</urlset>\n`;

  write('sitemap.xml', xml);
  console.log(`  ✓ Generated sitemap.xml with ${urls.length} URLs`);
}

// Generate llms.txt for AI agents and search indexing
function generateLlmsTxt() {
  let doc = `# Old Lane 17 Tools (tools.oldlane17.com)\n\n`;
  doc += `> Free, fast, privacy-friendly online developer tools. 100% in-browser processing.\n\n`;
  doc += `## Tools Directory\n\n`;
  for (const t of tools) {
    doc += `- [${t.name}](${site.url}/tools/${t.slug}/): ${t.short}\n`;
  }
  doc += `\n## Categories\n\n`;
  for (const c of categories) {
    doc += `- [${c.name}](${site.url}/category/${c.slug}/): ${c.short}\n`;
  }
  write('llms.txt', doc);
  console.log('  ✓ Generated llms.txt');
}

// Main Build
async function build() {
  console.log('\n🚀 Building tools.oldlane17.com...\n');

  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  fs.mkdirSync(DIST, { recursive: true });

  // 1. Copy public assets
  copyDir(PUBLIC, DIST);
  // 2. Copy css/ to dist/css/
  copyDir(CSS_DIR, path.join(DIST, 'css'));
  console.log('  ✓ Assets copied (public/ -> dist/, css/ -> dist/css/)');

  // 3. Generate structure
  generateStructure();

  // 4. Generate pages
  generateHome();
  generateCategories();
  generateTools();
  generateLegalPages();
  generateSitemap();
  generateLlmsTxt();

  console.log('\n✨ Build complete successfully!\n');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
