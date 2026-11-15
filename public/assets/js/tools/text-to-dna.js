// text-to-dna.js — Client-side Text to DNA & DNA to Text Converter

(function() {
  const MAP = { "00": "A", "01": "C", "10": "G", "11": "T" };
  const REV = { "A": "00", "C": "01", "G": "10", "T": "11" };

  const inputEl = document.getElementById("dna-input");
  const outputEl = document.getElementById("dna-output");
  const btnEncode = document.getElementById("btn-encode-dna");
  const btnDecode = document.getElementById("btn-decode-dna");
  const btnExample = document.getElementById("btn-example-dna");
  const btnCopy = document.getElementById("btn-copy-dna");
  const statusEl = document.getElementById("dna-status");
  const statsEl = document.getElementById("dna-stats");

  function textToDna(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let dna = "";
    for (let i = 0; i < bytes.length; i++) {
      const byteStr = bytes[i].toString(2).padStart(8, "0");
      for (let j = 0; j < 8; j += 2) {
        dna += MAP[byteStr.slice(j, j + 2)];
      }
    }
    return dna;
  }

  function dnaToText(dna) {
    const clean = dna.toUpperCase().replace(/[^ACGT]/g, "");
    if (clean.length === 0) return "";
    let bits = "";
    for (let i = 0; i < clean.length; i++) {
      bits += REV[clean[i]];
    }
    const byteCount = Math.floor(bits.length / 8);
    const bytes = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  function updateStats(dna) {
    if (!statsEl) return;
    const clean = dna.toUpperCase().replace(/[^ACGT]/g, "");
    if (!clean) {
      statsEl.innerHTML = "";
      return;
    }
    const counts = { A: 0, C: 0, G: 0, T: 0 };
    for (const char of clean) {
      if (counts[char] !== undefined) counts[char]++;
    }
    const gcContent = (((counts.C + counts.G) / clean.length) * 100).toFixed(1);
    statsEl.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:0.5rem;font-size:0.85rem;color:var(--muted)">
        <span>Length: <strong>${clean.length} bp</strong></span>
        <span>GC Content: <strong>${gcContent}%</strong></span>
        <span>A: <strong>${counts.A}</strong></span>
        <span>C: <strong>${counts.C}</strong></span>
        <span>G: <strong>${counts.G}</strong></span>
        <span>T: <strong>${counts.T}</strong></span>
      </div>
    `;
  }

  function triggerSuccess(msg) {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("text-to-dna");
    }
  }

  btnEncode?.addEventListener("click", () => {
    const val = inputEl.value;
    if (!val) {
      if (statusEl) {
        statusEl.textContent = "Please enter text to convert.";
        statusEl.className = "tool-status-message error";
      }
      return;
    }
    const res = textToDna(val);
    outputEl.value = res;
    updateStats(res);
    triggerSuccess(`Successfully encoded ${val.length} characters into ${res.length} nucleotides.`);
  });

  btnDecode?.addEventListener("click", () => {
    const val = inputEl.value;
    if (!val) {
      if (statusEl) {
        statusEl.textContent = "Please enter a DNA sequence to decode.";
        statusEl.className = "tool-status-message error";
      }
      return;
    }
    try {
      const res = dnaToText(val);
      outputEl.value = res;
      updateStats(val);
      triggerSuccess(`Decoded ${val.trim().length} nucleotides back into text.`);
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = "Error decoding DNA: " + e.message;
        statusEl.className = "tool-status-message error";
      }
    }
  });

  btnExample?.addEventListener("click", () => {
    inputEl.value = "Old Lane 17 – Privacy First Developer Tools";
    btnEncode.click();
  });

  btnCopy?.addEventListener("click", async () => {
    if (!outputEl.value) return;
    try {
      await navigator.clipboard.writeText(outputEl.value);
      const originalText = btnCopy.textContent;
      btnCopy.textContent = "Copied!";
      setTimeout(() => btnCopy.textContent = originalText, 1800);
    } catch (e) {
      outputEl.select();
      document.execCommand("copy");
    }
  });
})();
