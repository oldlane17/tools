// site.js — Core client interactions: search, navigation, code copying, consent

(function() {
  // --- Navigation & Sidenav support ---
  window.toggleNav = function() {
    const nav = document.getElementById("mySidenav");
    const burger = document.querySelector(".hamburger");
    if (!nav) return;
    const isHidden = nav.getAttribute("aria-hidden") === "true";
    nav.setAttribute("aria-hidden", !isHidden);
    nav.classList.toggle("open", isHidden);
    if (burger) {
      burger.setAttribute("aria-expanded", isHidden);
      burger.classList.toggle("open", isHidden);
    }
  };

  window.closeNav = function() {
    const nav = document.getElementById("mySidenav");
    const burger = document.querySelector(".hamburger");
    if (!nav) return;
    nav.setAttribute("aria-hidden", "true");
    nav.classList.remove("open");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.classList.remove("open");
    }
  };

  // Close sidenav on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeNav();
  });

  // --- Smart Header scroll hide/show ---
  let lastScrollTop = 0;
  const delta = 10;
  window.addEventListener("scroll", () => {
    const topnav = document.querySelector(".topnav");
    if (!topnav) return;
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (Math.abs(lastScrollTop - st) <= delta) return;
    if (st > lastScrollTop && st > 90) {
      topnav.classList.add("nav-up");
    } else {
      topnav.classList.remove("nav-up");
    }
    lastScrollTop = st;
  }, { passive: true });

  // --- Real-time Tool Search on Overview & Category Pages ---
  const searchInput = document.getElementById("tool-search-input");
  const toolCards = document.querySelectorAll(".tool-card");
  const emptySearchMsg = document.getElementById("tool-search-empty");

  if (searchInput && toolCards.length > 0) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      let matchCount = 0;

      toolCards.forEach(card => {
        const title = (card.dataset.title || "").toLowerCase();
        const keywords = (card.dataset.keywords || "").toLowerCase();
        const desc = (card.dataset.desc || "").toLowerCase();
        const category = (card.dataset.category || "").toLowerCase();

        const matches = !query || title.includes(query) || keywords.includes(query) || desc.includes(query) || category.includes(query);
        card.style.display = matches ? "flex" : "none";
        if (matches) matchCount++;
      });

      if (emptySearchMsg) {
        emptySearchMsg.style.display = matchCount === 0 ? "block" : "none";
      }
    });
  }

  // --- Copy Button for Python Snippets and Code Blocks ---
  document.querySelectorAll(".btn-copy-code").forEach(btn => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".python-code-card") || btn.closest(".code-block-wrapper");
      const codeEl = card ? card.querySelector("pre code") : null;
      if (!codeEl) return;
      const text = codeEl.innerText;
      try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = originalText, 1800);
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(codeEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("copy");
      }
    });
  });

  // --- Cookie / Privacy Consent Banner ---
  const CONSENT_KEY = "olt_cookie_consent";

  function initConsent() {
    const existing = localStorage.getItem(CONSENT_KEY);
    if (!existing) {
      showConsentBanner();
    } else if (existing === "granted") {
      if (window.loadAdcash) window.loadAdcash();
    }
  }

  function showConsentBanner() {
    if (document.getElementById("olt-consent-banner")) return;
    const banner = document.createElement("div");
    banner.id = "olt-consent-banner";
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Privacy and Cookie Preferences");
    banner.innerHTML = `
      <div class="consent-content">
        <h3>Privacy & Cookie Notice</h3>
        <p>
          We value your privacy. All tools run 100% locally in your browser — your data never leaves your device.
          We use functional cookies and display privacy-friendly advertisements to keep this service completely free.
          Learn more in our <a href="/privacy/">Privacy Policy</a>.
        </p>
      </div>
      <div class="consent-actions">
        <button id="btn-consent-essential" class="btn btn-secondary" type="button">Essential Only</button>
        <button id="btn-consent-accept" class="btn btn-primary" type="button">Accept All</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("btn-consent-accept")?.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "granted");
      banner.remove();
      if (window.loadAdcash) window.loadAdcash();
    });

    document.getElementById("btn-consent-essential")?.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "denied");
      banner.remove();
    });
  }

  window.reopenConsentModal = function() {
    showConsentBanner();
  };

  // Re-open consent on footer "Cookie Settings" click
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "cookie-settings-btn") {
      e.preventDefault();
      window.reopenConsentModal();
    }
  });

  // Run consent init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initConsent);
  } else {
    initConsent();
  }
})();
