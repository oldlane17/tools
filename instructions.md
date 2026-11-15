# tools.oldlane17.com – Build Instructions

> Goal: a fast, SEO-optimized collection of small online tools (text to DNA, file converters, data converters, …) that belongs visually and technically to the **Old Lane 17** family (`oldlane17.com`, repo `wwwol17`). Every tool is its own indexable page, optionally includes a "build it yourself in Python" snippet, cross-promotes my other projects and has reserved ad slots (Adcash).

---

## 0. First step: study the reference project

Before writing any code, inspect the repo **`oldlane17/wwwol17`** and mirror it:

1. How the **header** and **footer** are built and loaded (look for `header-footer.css`, `layout.js`, `app.js` or similar) and which URLs on `resources.oldlane17.com` they are imported from.
2. Which **logo file** is used (reuse exactly the same asset/URL, do not redraw or re-export it).
3. Which **build/deploy setup** is used (static files, Markdown → HTML build, Cloudflare). Reuse the same approach where sensible so that deployment feels identical.
4. Which CSS variables, fonts, breakpoints and nav links exist.

**Rule:** header, footer and logo are **imported from `resources.oldlane17.com`**, never copied into this repo. A change there must automatically change tools.oldlane17.com too.

If something in wwwol17 contradicts this document regarding header/footer/logo, **wwwol17 wins**.

---

## 1. Design system

| Token | Value | Use |
|---|---|---|
| `--bg` | `#02133e` | page background |
| `--accent` | `#a0a0ff` | links, headings accents, borders, focus rings, icons |
| `--btn` | `#182a69` | buttons, cards, inputs, panels |
| `--btn-hover` | slightly lighter than `#182a69` (derive, e.g. `#22388a`) | hover/active |
| `--text` | near-white (e.g. `#e8eaf6`) | body text |
| `--muted` | desaturated lavender (e.g. `#9aa3c7`) | secondary text |

Rules:

- Define all colors as **CSS custom properties** in `:root` in one file (`/css/tokens.css`). No hard-coded hex values elsewhere.
- Dark theme only (matches main site). Ensure text/background contrast ≥ WCAG AA; accent `#a0a0ff` on `#02133e` is fine for text, buttons use `#182a69` with accent border + light text.
- Mobile first, fully responsive, no horizontal scroll. Visible `:focus-visible` outlines in accent color.
- Buttons: `#182a69` background, `1px solid var(--accent)` border, rounded (8–10px), hover = lighter.
- Code blocks (Python snippets): darker panel than the buttons (e.g. `#0a1a4d`), monospace, copy button, horizontal scroll inside the block only.

---

## 2. Tech approach

- **Static site, no heavy framework.** Vanilla HTML/CSS/JS (ES modules). Fast first paint is an SEO and ad-revenue factor.
- **One source of truth: `/data/tools.json`.** Everything is generated from it: the tool index page, category pages, sitemap, related-tool links, structured data, cross-promo.
- A small **build script** (Node or Python, whichever matches wwwol17) generates one static HTML page per tool from a template, so every page is fully rendered HTML (crawlable without JS). The interactive logic of the tool itself is progressive enhancement in JS.
- All tools run **client-side in the browser** wherever possible (privacy: files never get uploaded; also no server cost). Say so on the page: *"Your data never leaves your browser."*
- Heavy libs (e.g. for file conversion) are **lazy loaded only on the tool page that needs them**.

### Suggested structure

```
/
├─ index.html                     # tools overview, search, categories
├─ /tools/<slug>/index.html       # one page per tool (generated)
├─ /category/<slug>/index.html    # category landing pages (generated)
├─ /css/tokens.css, base.css, tool.css, ads.css
├─ /js/site.js                    # loads header/footer from resources.oldlane17.com, search, promo
├─ /js/ads.js                     # all ad logic (see §6)
├─ /js/tools/<slug>.js            # logic of each tool
├─ /data/tools.json               # tool registry
├─ /data/promo.json               # cross-promotion entries (see §7)
├─ /config/ads.config.js          # Adcash zone IDs
├─ /scripts/build.(mjs|py)        # generator: pages, sitemap, robots, llms etc.
├─ robots.txt, sitemap.xml, ads.txt
└─ instructions.md
```

---

## 3. Tool registry (`/data/tools.json`)

Each tool is one object. Two types:

- `"type": "internal"` – the tool lives on this site as its own page.
- `"type": "external"` – the tool lives on another page of mine; this site has a **landing page** (title, description, screenshot/preview, "Open tool" button) so it is still searchable and passes link value.

```json
{
  "slug": "text-to-dna",
  "type": "internal",
  "name": "Text to DNA Converter",
  "short": "Convert any text into a DNA sequence (A, C, G, T) and back.",
  "description": "Free online text to DNA converter. Encode text as nucleotides using 2-bit binary mapping and decode it again. Runs in your browser.",
  "category": "converters",
  "keywords": ["text to dna", "dna encoder", "binary to nucleotides", "dna decoder"],
  "icon": "🧬",
  "faq": [
    { "q": "How does text get converted to DNA?", "a": "Each character is turned into bytes, then every 2 bits are mapped to one nucleotide (00=A, 01=C, 10=G, 11=T)." }
  ],
  "related": ["binary-converter", "base64-encoder"],
  "python": { "enabled": true, "file": "snippets/text-to-dna.py", "difficulty": "beginner" },
  "videoSlider": true,
  "datePublished": "2026-11-15",
  "dateModified": "2026-11-15"
}
```

External tool extras: `"url": "https://…"`, `"openInNewTab": true`, `"ogImage": "…"`.

**Starter tool list (to be built first, in this order):**

1. Text to DNA / DNA to Text
2. Base64 encode/decode
3. JSON ⇄ CSV ⇄ YAML ⇄ XML data converter
4. Image converter (PNG/JPG/WebP, via Canvas)
5. Text case converter, word/character counter
6. Binary / Hex / Decimal / Text converter
7. URL encode/decode, timestamp converter
8. Hash generator (SHA-256 etc. via Web Crypto)
9. Unit converter
10. Color converter (HEX/RGB/HSL)

Add external-linked tools (my other sites/apps) as landing-page entries as soon as the URLs are known.

---

## 4. SEO (top priority)

**Every tool = its own URL, its own page, its own meta.** Clean slugs: `/tools/text-to-dna/`.

### Per page (generated from the registry)
- `<title>`: `{Tool name} – Free Online Tool | Old Lane 17 Tools` (≤ 60 chars where possible)
- `<meta name="description">`: from `description` (≤ 155 chars)
- `<link rel="canonical">` with absolute URL, trailing slash consistent
- Open Graph + Twitter card tags (title, description, image, `og:type=website`)
- Exactly **one `<h1>`**, logical `h2`/`h3` hierarchy
- `lang="en"`, correct viewport meta, theme-color `#02133e`
- **Structured data (JSON-LD):**
  - `WebApplication` (name, description, applicationCategory `UtilitiesApplication`, operatingSystem `Any`, offers price 0)
  - `BreadcrumbList`
  - `FAQPage` generated from `faq`
  - `HowTo` where the tool has clear steps
- Visible text content, not only the widget: short intro, **How to use** (3–5 steps), **FAQ** (3–5 questions), **Related tools**, and, if enabled, the **Python section**. Aim for ≥ 300 words of useful, non-duplicated text per tool page.
- Internal links: each tool links to 3–6 related tools and its category; the home page links to all tools.

### Site level
- Auto-generated `sitemap.xml` (with `lastmod` from `dateModified`) and `robots.txt` pointing to it.
- Category pages (`/category/converters/` …) with unique intro text.
- Home page has a crawlable list of all tools (not only a JS search box).
- Performance budget: LCP < 2.0 s, CLS < 0.05, INP good. No layout shift from ads (see §6: reserve space!). Lazy-load below-the-fold stuff, `font-display: swap`, preload only critical assets.
- Add `<link rel="preconnect">` for `resources.oldlane17.com` and the Adcash CDN.
- Cross-link back to `oldlane17.com` (header/footer already does this) so the main domain benefits.
- After deploy: submit sitemap in Google Search Console and Bing Webmaster Tools (verification via DNS TXT).

---

## 5. Python "build it yourself" section (per tool)

Every tool page gets, if possible, a section **"Build it yourself in Python"**:

- Short intro (1–2 sentences: what the idea is / why it works).
- A **complete, runnable, commented snippet** (ideally ≤ 40 lines, standard library only; if a package is needed, say `pip install …`).
- A tiny example input and the expected output.
- A one-line **"Learning tip"**, e.g. what concept the snippet teaches.
- Copy button. Snippet files live in `/snippets/<slug>.py` and are **injected at build time** (single source, also testable).
- Mark `difficulty`: beginner / intermediate.
- If a tool does not make sense in Python (e.g. pure visual tool), set `"python.enabled": false` and omit the section.
- Add `SoftwareSourceCode` JSON-LD (`programmingLanguage: Python`) for this block.
- Every snippet must be **executed in CI/at build** (simple smoke test: run it, check exit code 0) so no broken code gets published.

Example (`/snippets/text-to-dna.py`):

```python
# Text -> DNA: every byte = 8 bits = 4 nucleotides (2 bits each)
MAP = {"00": "A", "01": "C", "10": "G", "11": "T"}
REV = {v: k for k, v in MAP.items()}

def text_to_dna(text: str) -> str:
    bits = "".join(f"{b:08b}" for b in text.encode("utf-8"))
    return "".join(MAP[bits[i:i + 2]] for i in range(0, len(bits), 2))

def dna_to_text(dna: str) -> str:
    bits = "".join(REV[n] for n in dna)
    data = bytes(int(bits[i:i + 8], 2) for i in range(0, len(bits), 8))
    return data.decode("utf-8")

if __name__ == "__main__":
    dna = text_to_dna("Hi")
    print(dna)               # CAGACGGC
    print(dna_to_text(dna))  # Hi
```

---

## 6. Ads (Adcash)

### 6.1 Principles
- Ads must **never break the tool UX**. The tool is above the fold; ads are around it.
- **Reserve space** for every slot with fixed `min-height`/`width` to avoid layout shift (CLS).
- **Max 3 static banner slots per page** + the video slider. Fewer on small/simple pages.
- All ad code lives in `/js/ads.js` + `/config/ads.config.js`. Tool pages only contain empty slot containers like `<div class="ad-slot" data-ad="rect-300x250"></div>`.
- Ads load **after** the main content (idle/after `load`) and only after the cookie/consent decision (see §8).
- Label slots subtly with "Advertisement" in `--muted`.
- No ads on: legal pages (imprint, privacy), 404, and the first screen of the home page on mobile.

### 6.2 Reserved slot sizes
These are the sizes Adcash offers. Create a CSS class and a config key for each, but **only use the ones that fit**:

| Key | Size | Name | Planned placement |
|---|---|---|---|
| `leaderboard` | 728×90 | Leaderboard | Desktop only, below header, above tool title (≥ 768 px wide) |
| `full-display` | 468×60 | Full Display | Tablet fallback instead of leaderboard (480–767 px) |
| `header-300x100` | 300×100 | Header | Mobile: below header (< 480 px) |
| `wide-skyscraper` | 160×600 | Wide Skyscraper | Desktop sidebar, sticky (≥ 1200 px) |
| `skyscraper` | 120×600 | Skyscraper | Optional alternative for narrow sidebars; unused by default |
| `large-rect` | 336×280 | Large Rectangle | Desktop, between tool and "How to use" |
| `medium-rect` | 300×250 | Medium Rectangle | Main in-content slot (all devices), after the tool result |
| `square` | 250×250 | Square | Category/overview pages, in grids, or sidebar on tablets |

Responsive logic (example): mobile → `header-300x100` + `medium-rect`; tablet → `full-display` + `medium-rect`; desktop → `leaderboard` + `large-rect` + sticky `wide-skyscraper`. Only render the slots for the current breakpoint (don't load hidden ones).

### 6.3 Config

`/config/ads.config.js`:

```js
export const ADS = {
  enabled: true,
  libSrc: "//acscdn.com/script/aclib.js",
  zones: {
    // Banner zone IDs: create the zones in the Adcash dashboard and paste the IDs / snippets here.
    leaderboard:       { zoneId: "TODO" },
    "full-display":    { zoneId: "TODO" },
    "header-300x100":  { zoneId: "TODO" },
    "wide-skyscraper": { zoneId: "TODO" },
    skyscraper:        { zoneId: "TODO" },
    "large-rect":      { zoneId: "TODO" },
    "medium-rect":     { zoneId: "TODO" },
    square:            { zoneId: "TODO" },
    videoSlider:       { zoneId: "12449470" }
  }
};
```

Note: the banner zones' exact tag code is shown by Adcash after creating each zone ("Step 2"). Use the snippet format Adcash gives for each zone type; do not guess it. Until a zone ID exists, the slot renders as an empty reserved box (or nothing in production, see `enabled`).

### 6.4 Adcash library
Include the library **once**, as high as possible in `<head>` (Adcash requirement), via `ads.js` only after consent:

```html
<script id="aclib" type="text/javascript" src="//acscdn.com/script/aclib.js"></script>
```

If the lib is already on the page, **do not include it a second time**.

### 6.5 Video Slider (zone `12449470`) – use sparingly

Tag from Adcash (below the library script):

```html
<script type="text/javascript">
    aclib.runVideoSlider({
        zoneId: '12449470',
    });
</script>
```

Rules so it stays tasteful:

1. **At most once per page view**, and **at most once per session** (use `sessionStorage` flag), never on every navigation.
2. Only on pages with `"videoSlider": true` in the registry, i.e. **tool pages with real content**, not on the home page, category pages, legal pages, 404.
3. **Trigger late**: only after the user has actually used the tool (e.g. first successful conversion) **or** after ≥ 20 s on page **and** ≥ 50% scroll. Never on page load.
4. **Never while the user is typing/working** in an input; never overlapping the tool result or a download button.
5. **Not on small mobile screens** (< 480 px) where it would cover content, unless tested to be non-intrusive.
6. Respect "reduced motion" and a user-dismissed state (if dismissed, don't show again in this session).
7. Global kill switch: `ADS.zones.videoSlider.enabled = false`.

Implementation sketch:

```js
export function maybeRunVideoSlider(tool) {
  const key = "olt_vs_shown";
  if (!tool.videoSlider || sessionStorage.getItem(key)) return;
  if (!window.aclib || !consentGiven()) return;
  sessionStorage.setItem(key, "1");
  aclib.runVideoSlider({ zoneId: ADS.zones.videoSlider.zoneId });
}
// call after the first successful tool action, or after the time+scroll condition
```

---

## 7. Automatic cross-promotion (own stuff + soft monetization)

A small `promo.json` + component that adds links to my other projects automatically:

```json
[
  { "id": "youtube",  "title": "Old Lane 17 on YouTube", "text": "Tutorials and tech videos.", "url": "https://www.youtube.com/@TODO", "icon": "▶️", "placement": ["tool-footer", "home"] },
  { "id": "blog",     "title": "Old Lane 17 Blog",       "text": "Tech news and coding tutorials.", "url": "https://oldlane17.com", "icon": "📰", "placement": ["tool-footer", "home", "python-section"] },
  { "id": "learn",    "title": "Learn to code",          "text": "Free step-by-step coding tutorials.", "url": "https://oldlane17.com/learn/", "icon": "🎓", "placement": ["python-section"] }
]
```

Behavior:

- Each tool page shows **one promo card** after the "How to use" section and **one inline link** inside the Python section (e.g. "More Python tutorials on Old Lane 17").
- Tool-specific mapping is possible (`"promoFor": ["python-section"]`, or a `relatedLearnUrl` per tool pointing to the matching tutorial under `oldlane17.com/learn/<language>/`).
- Rotate/choose promos deterministically per tool (hash of slug) so pages stay stable for crawlers.
- External links to my own sites: normal `rel` (no nofollow). Third-party/ad links: `rel="sponsored noopener"`.
- Fill in the real YouTube URL and other links; **ask me if unknown**, never invent URLs.
- Optional later: affiliate links in a dedicated "Recommended" block, clearly marked.

---

## 8. Legal / privacy (needed because of ads, EU/CH audience)

- Cookie/consent banner (CMP or a simple own banner): **ads and the Adcash script load only after consent**.
- Pages: **Privacy Policy**, **Imprint/Legal notice**, linked in the (shared) footer. Mention Adcash and that tools run locally in the browser.
- Add `ads.txt` at the site root with the line Adcash provides for the publisher account (get it from the Adcash dashboard, don't invent it).
- "Advertisement" label on slots.

---

## 9. Accessibility & quality

- Semantic HTML (`header`, `main`, `nav`, `footer`, `section`), labels for all inputs, keyboard usable, ARIA live region for results/errors.
- Every tool: clear input → action button → result area → copy/download buttons; useful error messages; sample data button ("Try an example").
- Lighthouse targets (mobile): Performance ≥ 90, Accessibility ≥ 95, SEO = 100, Best Practices ≥ 95.
- Test with ads enabled and disabled; no console errors if an ad blocker blocks the script (all ad code must fail silently).

---

## 10. Tool page template (what the generator outputs)

```
[shared header from resources.oldlane17.com]
[ad: leaderboard / full-display / header-300x100 by breakpoint]

breadcrumb: Home › Category › Tool
<h1> Tool name </h1>
short intro (1–2 sentences, contains main keyword)

┌ tool widget ───────────────────────────────┐  [sticky ad: wide-skyscraper, desktop sidebar]
│ input → button → result, copy/download     │
└────────────────────────────────────────────┘

[ad: medium-rect (mobile/tablet) or large-rect (desktop)]

## How to use         (3–5 steps)
## Build it yourself in Python   (snippet + tip + learn-more link)  ← if enabled
[promo card]
## FAQ
## Related tools      (3–6 links)

[shared footer from resources.oldlane17.com]
```

---

## 11. Deployment

- Hosting analogous to wwwol17 (Cloudflare Pages), custom domain **tools.oldlane17.com** (CNAME), HTTPS only, HTTP → HTTPS redirect, `www`-less.
- Build command runs the generator, then validates: all tools in `tools.json` have a page, sitemap contains every URL, all Python snippets execute, no broken internal links.
- Cache headers: long cache for hashed assets, short for HTML.

---

## 12. Definition of done (first release)

- [ ] Header, footer and logo are imported from `resources.oldlane17.com` and look identical to wwwol17
- [ ] Colors only via tokens: `#02133e` / `#a0a0ff` / `#182a69`
- [ ] Home page with search, categories and a crawlable list of all tools
- [ ] At least the first 6 starter tools live, each with how-to, FAQ, related tools, JSON-LD
- [ ] Python section with tested snippet on every tool where it makes sense
- [ ] At least one external-link tool landing page working
- [ ] Sitemap, robots.txt, canonical, OG tags verified
- [ ] Ad slots reserved for all 8 Adcash sizes, no layout shift; consent-gated
- [ ] Video slider: once per session, late trigger, only on flagged tool pages, kill switch works
- [ ] Promo cards linking to YouTube / blog work
- [ ] Privacy + imprint pages, `ads.txt` in place
- [ ] Lighthouse targets met

---

## 13. Open points to confirm with me

1. Exact YouTube channel URL and other links for `promo.json`.
2. Adcash zone IDs (or tags) for the 8 banner sizes (only the Video Slider ID `12449470` exists so far) and the `ads.txt` line.
3. Which external tools (URLs) should get landing pages first.
4. Confirm that `resources.oldlane17.com` is the correct import host (spelled "ressoureces" in my notes).


And I want to post in on github and then connect the repo to cloudflare.