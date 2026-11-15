// ads.js — Adcash banner slot management & non-intrusive Video Slider

(function() {
  const ADS_CONFIG = {
    enabled: true,
    libSrc: "//acscdn.com/script/aclib.js",
    zones: {
      leaderboard:       { zoneId: "TODO", width: 728, height: 90 },
      "full-display":    { zoneId: "TODO", width: 468, height: 60 },
      "header-300x100":  { zoneId: "TODO", width: 300, height: 100 },
      "wide-skyscraper": { zoneId: "TODO", width: 160, height: 600 },
      skyscraper:        { zoneId: "TODO", width: 120, height: 600 },
      "large-rect":      { zoneId: "TODO", width: 336, height: 280 },
      "medium-rect":     { zoneId: "TODO", width: 300, height: 250 },
      square:            { zoneId: "TODO", width: 250, height: 250 },
      videoSlider:       { zoneId: "12449470", enabled: true }
    }
  };

  function consentGiven() {
    return localStorage.getItem("olt_cookie_consent") === "granted";
  }

  // Load Adcash script once after consent
  window.loadAdcash = function() {
    if (!ADS_CONFIG.enabled || !consentGiven()) return;
    if (document.getElementById("aclib")) return;

    const script = document.createElement("script");
    script.id = "aclib";
    script.type = "text/javascript";
    script.src = ADS_CONFIG.libSrc;
    script.async = true;
    script.onerror = () => {
      // Adblocker blocked the script; fail silently
    };
    script.onload = () => {
      initBannerSlots();
    };
    document.head.appendChild(script);
  };

  function initBannerSlots() {
    if (!window.aclib) return;
    const slots = document.querySelectorAll(".ad-slot[data-ad]");
    slots.forEach(slot => {
      const adKey = slot.dataset.ad;
      const zone = ADS_CONFIG.zones[adKey];
      if (zone && zone.zoneId && zone.zoneId !== "TODO") {
        try {
          if (typeof window.aclib.runBanner === "function") {
            window.aclib.runBanner({
              zoneId: zone.zoneId,
              container: slot
            });
          }
        } catch (e) {
          // Fail silently on ad rendering error
        }
      }
    });
  }

  // Video Slider implementation adhering strictly to §6.5 rules
  window.maybeRunVideoSlider = function(toolSlug) {
    const VS_SESSION_KEY = "olt_vs_shown";
    const zoneCfg = ADS_CONFIG.zones.videoSlider;

    // Rule 1 & 7: kill switch or already shown in this session
    if (!ADS_CONFIG.enabled || !zoneCfg.enabled) return;
    if (sessionStorage.getItem(VS_SESSION_KEY)) return;

    // Rule 2: only on consent
    if (!consentGiven() || !window.aclib || typeof window.aclib.runVideoSlider !== "function") return;

    // Rule 5: not on small mobile (< 480px)
    if (window.innerWidth < 480) return;

    // Rule 6: respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Rule 4: never while typing in an input
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;

    try {
      sessionStorage.setItem(VS_SESSION_KEY, "1");
      window.aclib.runVideoSlider({
        zoneId: zoneCfg.zoneId
      });
    } catch (e) {
      // Fail silently
    }
  };

  // Fallback trigger: late time (20s) AND 50% scroll on tool pages with data-videoslider="true"
  let hasScrolled50 = false;
  window.addEventListener("scroll", () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && (window.scrollY / docHeight) >= 0.5) {
      hasScrolled50 = true;
    }
  }, { passive: true });

  setTimeout(() => {
    const isToolPage = document.body.dataset.videoslider === "true";
    if (isToolPage && hasScrolled50) {
      window.maybeRunVideoSlider();
    }
  }, 20000);

  // If consent was previously granted, initialize ads on window load
  window.addEventListener("load", () => {
    if (consentGiven()) {
      window.loadAdcash();
    }
  });
})();
