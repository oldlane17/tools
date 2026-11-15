# tools.oldlane17.com

[![Build & Test](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Cloudflare Pages](https://img.shields.io/badge/deployed%20on-Cloudflare%20Pages-f38020.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A fast, privacy-first, SEO-optimized collection of online developer tools and data converters that belongs visually and technically to the **Old Lane 17** ecosystem ([oldlane17.com](https://www.oldlane17.com)).

Every tool has its own indexable page, structured JSON-LD data, a *"Build it yourself in Python"* educational section, and runs **100% client-side** in your browser.

> **Privacy guarantee:** *"Your data never leaves your browser."* No files, inputs, text, or cryptographic keys are ever transmitted to or stored on any server.

---

## 🎨 Design System

All styling is built upon the Old Lane 17 dark theme palette using pure CSS variables in [`css/tokens.css`](css/tokens.css):

| CSS Variable | Hex Value | Role & Usage |
|---|---|---|
| `--bg` | `#02133e` | Primary deep navy page background |
| `--accent` | `#a0a0ff` | Links, focus rings, headings accents, active badges |
| `--btn` | `#182a69` | Interactive buttons, cards, input panels |
| `--btn-hover` | `#22388a` | Button hover and active states |
| `--code-bg` | `#0a1a4d` | Monospace code block and output containers |
| `--text` | `#e8eaf6` | High-contrast body text (WCAG AA compliant) |
| `--muted` | `#9aa3c7` | Desaturated lavender secondary text & labels |

The global header, footer, navigation scripts, and brand SVG logos are directly integrated with [`ressources.oldlane17.com/ressources`](https://ressources.oldlane17.com/ressources) to maintain perfect visual parity with the main blog.

---

## 🛠️ Tool Registry

All pages are generated from a single source of truth: [`data/tools.json`](data/tools.json).

| Tool | Slug | Category | Type | Python Section |
|---|---|---|---|:---:|
| 🧬 **Text to DNA / DNA to Text** | `/tools/text-to-dna/` | Encoding & Hashing | Instant | ✅ |
| 📦 **Base64 Encoder & Decoder** | `/tools/base64-converter/` | Encoding & Hashing | Instant | ✅ |
| 📊 **JSON ⇄ CSV ⇄ YAML ⇄ XML** | `/tools/data-converter/` | Converters | Instant | ✅ |
| 🖼️ **Image Converter & Compressor** | `/tools/image-converter/` | Converters | Instant | ✅ |
| 🔤 **Text Case Converter & Counter** | `/tools/text-case-converter/` | Text & Dev | Instant | ✅ |
| 0️⃣ **Binary / Hex / Dec / Text** | `/tools/binary-hex-converter/` | Converters | Instant | ✅ |
| ⏱️ **URL & Unix Timestamp** | `/tools/url-timestamp-converter/` | Text & Dev | Instant | ✅ |
| 🔑 **Cryptographic Hash Generator** | `/tools/hash-generator/` | Encoding & Hashing | Instant | ✅ |
| 📏 **Universal Unit Converter** | `/tools/unit-converter/` | Converters | Instant | ✅ |
| 🎨 **Color Converter (HEX/RGB/HSL)** | `/tools/color-converter/` | Converters | Instant | ✅ |
| 📐 **VectorCutter (Laser / CNC Box)** | `/tools/vectorcutter/` | Design & Maker | External | Landing |
| 🕹️ **BoredLoot Arcade** | `/tools/boredloot-arcade/` | Design & Maker | External | Landing |

---

## 🔍 SEO & Structured Data

- **Clean indexable URLs:** Every tool has its own static HTML page at `/tools/<slug>/`.
- **JSON-LD Schema Markup:**
  - `WebApplication` (free utility application specification)
  - `BreadcrumbList` (Home › Category › Tool)
  - `FAQPage` (indexed directly in Google search result rich snippets)
  - `HowTo` (step-by-step guides for Google Rich Results)
  - `SoftwareSourceCode` (for the Python implementation snippets)
- **Crawlability:**
  - Auto-generated `sitemap.xml` with dynamic `lastmod` timestamps
  - `robots.txt` pointing to `sitemap.xml`
  - `llms.txt` for AI agent discovery and indexing

---

## 🐍 Python "Build It Yourself" Section

Each internal tool includes a complete, fully runnable, commented Python snippet in [`snippets/`](snippets/).

All snippets are written using only the Python standard library (or Pillow for images) and are automatically smoke-tested during every build:

```bash
npm test
```

This ensures that broken or outdated code is never published.

---

## 💰 Monetization & Adcash Configuration

Ad placements are strictly engineered to preserve tool UX and eliminate Cumulative Layout Shift (CLS):

- **Fixed Dimensions:** All ad containers have reserved CSS dimensions (`min-height` and `width`).
- **Responsive Slots:**
  - `leaderboard` (728×90) for desktop (≥ 768px)
  - `full-display` (468×60) for tablets (480px–767px)
  - `header-300x100` (300×100) for mobile (< 480px)
  - `wide-skyscraper` (160×600) for desktop sticky sidebar (≥ 1200px)
  - `medium-rect` (300×250) & `large-rect` (336×280) for in-content
- **Video Slider (Zone ID `12449470`):**
  - Triggers at most once per session (`sessionStorage` flag `olt_vs_shown`)
  - Only executes after explicit tool interaction or after ≥ 20s and ≥ 50% scroll
  - Never interrupts typing inside input fields
  - Disabled on small screens (< 480px) and when reduced motion is preferred
  - Global kill switch in config
- **Consent Gating:** Adcash library `//acscdn.com/script/aclib.js` only loads after explicit user consent via the cookie banner.

### Updating Adcash Zone IDs:

Edit [`config/ads.config.js`](config/ads.config.js) to replace `"TODO"` with your live zone IDs:

```javascript
export const ADS = {
  enabled: true,
  libSrc: "//acscdn.com/script/aclib.js",
  zones: {
    leaderboard:       { zoneId: "YOUR_ZONE_ID" },
    "full-display":    { zoneId: "YOUR_ZONE_ID" },
    "header-300x100":  { zoneId: "YOUR_ZONE_ID" },
    "wide-skyscraper": { zoneId: "YOUR_ZONE_ID" },
    "large-rect":      { zoneId: "YOUR_ZONE_ID" },
    "medium-rect":     { zoneId: "YOUR_ZONE_ID" },
    square:            { zoneId: "YOUR_ZONE_ID" },
    videoSlider:       { zoneId: "12449470", enabled: true }
  }
};
```

---

## 📁 Repository Structure

```
tools.oldlane17.com/
├── config/
│   ├── site.json               # Domain, metadata, navigation links
│   └── ads.config.js           # Adcash zone IDs & placement settings
├── css/
│   ├── tokens.css              # Canonical CSS variables (#02133e, #a0a0ff, #182a69)
│   ├── base.css                # Typography, responsive layout, search, cards
│   ├── tool.css                # Tool workspace, form inputs, code cards
│   ├── ads.css                 # Fixed reserved slots & labels (CLS prevention)
│   └── consent.css             # Privacy consent modal styling
├── data/
│   ├── tools.json              # Single source of truth for all tools
│   ├── categories.json         # Category registry
│   └── promo.json              # Cross-promotion cards (YouTube, Blog, Tutorials)
├── public/
│   ├── ads.txt                 # Ad network verification file
│   ├── robots.txt              # Search crawler directives
│   └── assets/
│       ├── js/
│       │   ├── site.js         # Search, copy buttons, consent banner
│       │   ├── ads.js          # Adcash loader, video slider trigger
│       │   ├── theme-init.js   # Fast dark mode enforcer
│       │   ├── fhinclude.js    # Header/footer fallback loader
│       │   └── tools/          # Individual tool progressive enhancement logic
│       └── logos/              # Official Old Lane 17 SVG brand assets
├── scripts/
│   ├── build.mjs               # Static HTML, sitemap & schema generator
│   └── test-snippets.mjs       # Automated Python snippet runner
├── snippets/                   # Runnable Python scripts for each tool
├── templates/
│   ├── base.html               # Base layout shell
│   ├── header.html             # Topnav and sidenav template
│   ├── footer.html             # Footer template
│   ├── home.html               # Homepage with live search & tool grid
│   ├── tool.html               # Tool layout (workspace, HowTo, Python, FAQ)
│   ├── external-tool.html      # External tool landing page template
│   ├── category.html           # Category landing page template
│   ├── legal.html              # Privacy and Legal Notice layout
│   └── widgets/                # Modular interactive HTML for each tool
├── wrangler.toml               # Cloudflare Pages configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.9 or higher, for running snippet smoke tests)

### Installation

```bash
git clone https://github.com/oldlane17/tools.git
cd tools
npm install
```

### Build & Smoke Test

```bash
# Build static site to dist/
npm run build

# Run automated smoke test across all Python snippets
npm test
```

### Local Development Preview

```bash
# Runs the build and launches Cloudflare Pages local preview
npm run dev
```

---

## ☁️ Cloudflare Pages Deployment

This repository is ready to be connected directly to Cloudflare Pages:

1. Log into your **Cloudflare Dashboard** &rarr; **Workers & Pages** &rarr; **Create application** &rarr; **Pages**.
2. Connect your GitHub repository: `oldlane17/tools`.
3. Configure the build settings:
   - **Framework preset:** `None`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Under **Custom domains**, attach `tools.oldlane17.com`.
5. Cloudflare will automatically provision an SSL/TLS certificate and deploy previews on every `git push` to `main`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

© 2024–2026 Old Lane 17 · Developer & Online Tools.
