// color-converter.js — Color Format Converter (HEX, RGB, HSL, CMYK) & WCAG Contrast Checker

(function() {
  const inPicker = document.getElementById("color-picker");
  const inHex = document.getElementById("color-hex");
  const inRgb = document.getElementById("color-rgb");
  const inHsl = document.getElementById("color-hsl");
  const inCmyk = document.getElementById("color-cmyk");
  const previewBox = document.getElementById("color-preview-box");
  const contrastLight = document.getElementById("contrast-light");
  const contrastDark = document.getElementById("contrast-dark");
  const btnCopyCss = document.getElementById("btn-copy-color-css");
  const statusEl = document.getElementById("color-status");

  function hexToRgb(hex) {
    let clean = hex.replace(/^#/, "");
    if (clean.length === 3) clean = clean.split("").map(c => c + c).join("");
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);
    return { c, m, y, k };
  }

  // Relative luminance for WCAG contrast
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrast(rgb1, rgb2) {
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  function updateAllFromRgb(rgb, source = "") {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    if (source !== "picker" && inPicker) inPicker.value = hex;
    if (source !== "hex" && inHex) inHex.value = hex;
    if (source !== "rgb" && inRgb) inRgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    if (source !== "hsl" && inHsl) inHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    if (source !== "cmyk" && inCmyk) inCmyk.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    if (previewBox) previewBox.style.backgroundColor = hex;

    // WCAG contrast
    const crWhite = getContrast(rgb, { r: 255, g: 255, b: 255 }).toFixed(2);
    const crBlack = getContrast(rgb, { r: 0, g: 0, b: 0 }).toFixed(2);

    if (contrastLight) {
      contrastLight.innerHTML = `On White: <strong>${crWhite}:1</strong> ${crWhite >= 4.5 ? '✅ AA' : '❌ Fail'}`;
    }
    if (contrastDark) {
      contrastDark.innerHTML = `On Black: <strong>${crBlack}:1</strong> ${crBlack >= 4.5 ? '✅ AA' : '❌ Fail'}`;
    }

    if (statusEl) {
      statusEl.textContent = "Color formats synchronized.";
      statusEl.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("color-converter");
    }
  }

  inPicker?.addEventListener("input", () => {
    updateAllFromRgb(hexToRgb(inPicker.value), "picker");
  });

  inHex?.addEventListener("input", () => {
    const val = inHex.value.trim();
    if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      updateAllFromRgb(hexToRgb(val), "hex");
    }
  });

  inRgb?.addEventListener("input", () => {
    const m = inRgb.value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
      updateAllFromRgb({ r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) }, "rgb");
    }
  });

  btnCopyCss?.addEventListener("click", async () => {
    const code = `/* Color values */\n--brand-hex: ${inHex.value};\n--brand-rgb: ${inRgb.value};\n--brand-hsl: ${inHsl.value};`;
    try {
      await navigator.clipboard.writeText(code);
      const prev = btnCopyCss.textContent;
      btnCopyCss.textContent = "Copied CSS!";
      setTimeout(() => btnCopyCss.textContent = prev, 1800);
    } catch {
      inHex.select();
      document.execCommand("copy");
    }
  });

  // Palette swatches
  document.querySelectorAll("[data-color-preset]").forEach(swatch => {
    swatch.addEventListener("click", () => {
      updateAllFromRgb(hexToRgb(swatch.dataset.colorPreset));
    });
  });

  // Initialize with brand accent #a0a0ff
  updateAllFromRgb(hexToRgb("#a0a0ff"));
})();
