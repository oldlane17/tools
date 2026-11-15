// binary-hex-converter.js — Multidirectional Radix & Text Converter

(function() {
  const inText = document.getElementById("num-text");
  const inBin = document.getElementById("num-bin");
  const inHex = document.getElementById("num-hex");
  const inDec = document.getElementById("num-dec");
  const inOct = document.getElementById("num-oct");
  const chkSpacing = document.getElementById("num-spacing");
  const btnExample = document.getElementById("btn-example-num");
  const btnClear = document.getElementById("btn-clear-num");
  const statusEl = document.getElementById("num-status");

  let activeSource = null;

  function formatBinary(binStr) {
    if (!chkSpacing?.checked) return binStr;
    return binStr.replace(/(.{8})/g, "$1 ").trim();
  }

  function formatHex(hexStr) {
    if (!chkSpacing?.checked) return hexStr.toUpperCase();
    return hexStr.toUpperCase().replace(/(.{2})/g, "$1 ").trim();
  }

  function updateFromText(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    let hex = "";
    for (let b of bytes) {
      bin += b.toString(2).padStart(8, "0");
      hex += b.toString(16).padStart(2, "0");
    }
    inBin.value = formatBinary(bin);
    inHex.value = formatHex(hex);

    try {
      if (hex) {
        const big = BigInt("0x" + hex);
        inDec.value = big.toString(10);
        inOct.value = big.toString(8);
      } else {
        inDec.value = "";
        inOct.value = "";
      }
    } catch {
      inDec.value = "";
      inOct.value = "";
    }
  }

  function updateFromNumeric(big, skipField) {
    if (skipField !== "dec") inDec.value = big.toString(10);
    if (skipField !== "bin") inBin.value = formatBinary(big.toString(2));
    if (skipField !== "hex") inHex.value = formatHex(big.toString(16));
    if (skipField !== "oct") inOct.value = big.toString(8);

    // Try text decode
    try {
      let hex = big.toString(16);
      if (hex.length % 2 !== 0) hex = "0" + hex;
      const byteCount = hex.length / 2;
      const bytes = new Uint8Array(byteCount);
      for (let i = 0; i < byteCount; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      }
      inText.value = new TextDecoder().decode(bytes);
    } catch {
      inText.value = "";
    }
  }

  inText?.addEventListener("input", () => {
    activeSource = "text";
    updateFromText(inText.value);
    triggerSuccess();
  });

  inBin?.addEventListener("input", () => {
    activeSource = "bin";
    const clean = inBin.value.replace(/\s+/g, "");
    if (!clean) { clearAll(); return; }
    try {
      const big = BigInt("0b" + clean);
      updateFromNumeric(big, "bin");
      triggerSuccess();
    } catch {
      showError("Invalid binary format. Use 0 and 1 only.");
    }
  });

  inHex?.addEventListener("input", () => {
    activeSource = "hex";
    const clean = inHex.value.replace(/\s+|0x/g, "");
    if (!clean) { clearAll(); return; }
    try {
      const big = BigInt("0x" + clean);
      updateFromNumeric(big, "hex");
      triggerSuccess();
    } catch {
      showError("Invalid hexadecimal characters.");
    }
  });

  inDec?.addEventListener("input", () => {
    activeSource = "dec";
    const clean = inDec.value.trim();
    if (!clean) { clearAll(); return; }
    try {
      const big = BigInt(clean);
      updateFromNumeric(big, "dec");
      triggerSuccess();
    } catch {
      showError("Invalid decimal number.");
    }
  });

  inOct?.addEventListener("input", () => {
    activeSource = "oct";
    const clean = inOct.value.trim();
    if (!clean) { clearAll(); return; }
    try {
      const big = BigInt("0o" + clean);
      updateFromNumeric(big, "oct");
      triggerSuccess();
    } catch {
      showError("Invalid octal digit (0-7).");
    }
  });

  chkSpacing?.addEventListener("change", () => {
    if (inText.value) updateFromText(inText.value);
  });

  function clearAll() {
    [inText, inBin, inHex, inDec, inOct].forEach(el => { if (el) el.value = ""; });
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "tool-status-message";
    }
  }

  btnClear?.addEventListener("click", clearAll);

  btnExample?.addEventListener("click", () => {
    inText.value = "Old Lane 17";
    updateFromText(inText.value);
    triggerSuccess();
  });

  function triggerSuccess() {
    if (statusEl) {
      statusEl.textContent = "All radices synchronized in real time.";
      statusEl.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("binary-hex-converter");
    }
  }

  function showError(msg) {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.className = "tool-status-message error";
    }
  }

  // Copy buttons
  document.querySelectorAll("[data-copy-target]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      if (!target || !target.value) return;
      try {
        await navigator.clipboard.writeText(target.value);
        const prev = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = prev, 1800);
      } catch {
        target.select();
        document.execCommand("copy");
      }
    });
  });
})();
