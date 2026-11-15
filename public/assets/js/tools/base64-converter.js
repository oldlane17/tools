// base64-converter.js — Text and Binary File Base64 Encoder / Decoder

(function() {
  const inputEl = document.getElementById("b64-input");
  const outputEl = document.getElementById("b64-output");
  const btnEncode = document.getElementById("btn-encode-b64");
  const btnDecode = document.getElementById("btn-decode-b64");
  const btnExample = document.getElementById("btn-example-b64");
  const btnCopy = document.getElementById("btn-copy-b64");
  const btnDownload = document.getElementById("btn-download-b64");
  const statusEl = document.getElementById("b64-status");
  const urlSafeEl = document.getElementById("b64-urlsafe");
  const dropzoneEl = document.getElementById("b64-dropzone");
  const fileInputEl = document.getElementById("b64-file-input");

  function toBase64(str, isUrlSafe) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    let res = btoa(bin);
    if (isUrlSafe) {
      res = res.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    return res;
  }

  function fromBase64(b64, isUrlSafe) {
    let clean = b64.trim();
    if (isUrlSafe || clean.includes("-") || clean.includes("_")) {
      clean = clean.replace(/-/g, "+").replace(/_/g, "/");
      while (clean.length % 4) clean += "=";
    }
    const bin = atob(clean);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function triggerSuccess(msg) {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("base64-converter");
    }
  }

  btnEncode?.addEventListener("click", () => {
    const val = inputEl.value;
    if (!val) return;
    const urlSafe = urlSafeEl?.checked || false;
    const res = toBase64(val, urlSafe);
    outputEl.value = res;
    triggerSuccess(`Encoded ${val.length} characters into Base64 (${res.length} chars).`);
  });

  btnDecode?.addEventListener("click", () => {
    const val = inputEl.value;
    if (!val) return;
    try {
      const urlSafe = urlSafeEl?.checked || false;
      const res = fromBase64(val, urlSafe);
      outputEl.value = res;
      triggerSuccess(`Successfully decoded Base64 string into plain text.`);
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = "Invalid Base64 string: " + e.message;
        statusEl.className = "tool-status-message error";
      }
    }
  });

  btnExample?.addEventListener("click", () => {
    inputEl.value = "The quick brown fox jumps over the lazy dog. 🦊";
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

  btnDownload?.addEventListener("click", () => {
    if (!outputEl.value) return;
    const blob = new Blob([outputEl.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "base64-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Drag and drop file handling
  dropzoneEl?.addEventListener("click", () => fileInputEl?.click());
  fileInputEl?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  });
  dropzoneEl?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzoneEl.classList.add("dragover");
  });
  dropzoneEl?.addEventListener("dragleave", () => {
    dropzoneEl.classList.remove("dragover");
  });
  dropzoneEl?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzoneEl.classList.remove("dragover");
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      outputEl.value = dataUrl;
      inputEl.value = `[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${file.type || 'application/octet-stream'})]`;
      triggerSuccess(`Converted ${file.name} to Base64 Data URL!`);
    };
    reader.readAsDataURL(file);
  }
})();
