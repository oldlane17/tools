// text-case-converter.js — Text Casing Transformations & Real-time Text Statistics

(function() {
  const inputEl = document.getElementById("case-input");
  const btnCopy = document.getElementById("btn-copy-case");
  const btnExample = document.getElementById("btn-example-case");
  const btnClear = document.getElementById("btn-clear-case");
  const statusEl = document.getElementById("case-status");

  // Counter elements
  const cntWords = document.getElementById("cnt-words");
  const cntChars = document.getElementById("cnt-chars");
  const cntCharsNoSpaces = document.getElementById("cnt-chars-nospace");
  const cntSentences = document.getElementById("cnt-sentences");
  const cntParagraphs = document.getElementById("cnt-paragraphs");
  const cntReadTime = document.getElementById("cnt-readtime");

  function updateCounts() {
    const text = inputEl.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.trim() ? (text.match(/[.!?]+(\s|$)/g) || []).length || 1 : 0;
    const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
    const readingTimeSec = Math.ceil((words / 200) * 60);

    if (cntWords) cntWords.textContent = words;
    if (cntChars) cntChars.textContent = chars;
    if (cntCharsNoSpaces) cntCharsNoSpaces.textContent = charsNoSpace;
    if (cntSentences) cntSentences.textContent = sentences;
    if (cntParagraphs) cntParagraphs.textContent = paragraphs;
    if (cntReadTime) cntReadTime.textContent = readingTimeSec < 60 ? `${readingTimeSec}s` : `${Math.ceil(readingTimeSec / 60)}m`;
  }

  inputEl?.addEventListener("input", updateCounts);

  function splitTokens(s) {
    s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    s = s.replace(/[_\-]+/g, " ");
    return s.trim().split(/\s+/).filter(Boolean);
  }

  function transform(type) {
    const text = inputEl.value;
    if (!text) return;
    let res = "";

    switch (type) {
      case "upper":
        res = text.toUpperCase();
        break;
      case "lower":
        res = text.toLowerCase();
        break;
      case "title":
        res = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
        break;
      case "sentence":
        res = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        break;
      case "camel": {
        const tokens = splitTokens(text);
        if (!tokens.length) break;
        res = tokens[0].toLowerCase() + tokens.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
        break;
      }
      case "pascal": {
        const tokens = splitTokens(text);
        res = tokens.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
        break;
      }
      case "snake": {
        const tokens = splitTokens(text);
        res = tokens.map(w => w.toLowerCase()).join("_");
        break;
      }
      case "kebab": {
        const tokens = splitTokens(text);
        res = tokens.map(w => w.toLowerCase()).join("-");
        break;
      }
      case "constant": {
        const tokens = splitTokens(text);
        res = tokens.map(w => w.toUpperCase()).join("_");
        break;
      }
    }

    inputEl.value = res;
    updateCounts();
    if (statusEl) {
      statusEl.textContent = `Applied ${type.toUpperCase()} transform.`;
      statusEl.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("text-case-converter");
    }
  }

  document.querySelectorAll("[data-case]").forEach(btn => {
    btn.addEventListener("click", () => transform(btn.dataset.case));
  });

  btnExample?.addEventListener("click", () => {
    inputEl.value = "tools.oldlane17.com provides free, SEO-friendly online developer tools. Every single tool runs client-side inside your browser!";
    updateCounts();
  });

  btnClear?.addEventListener("click", () => {
    inputEl.value = "";
    updateCounts();
  });

  btnCopy?.addEventListener("click", async () => {
    if (!inputEl.value) return;
    try {
      await navigator.clipboard.writeText(inputEl.value);
      const prev = btnCopy.textContent;
      btnCopy.textContent = "Copied!";
      setTimeout(() => btnCopy.textContent = prev, 1800);
    } catch (e) {
      inputEl.select();
      document.execCommand("copy");
    }
  });

  updateCounts();
})();
