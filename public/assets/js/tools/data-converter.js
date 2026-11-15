// data-converter.js — JSON ⇄ CSV ⇄ YAML ⇄ XML Data Converter

(function() {
  const inputEl = document.getElementById("data-input");
  const outputEl = document.getElementById("data-output");
  const selectFrom = document.getElementById("data-from");
  const selectTo = document.getElementById("data-to");
  const btnConvert = document.getElementById("btn-convert-data");
  const btnExample = document.getElementById("btn-example-data");
  const btnCopy = document.getElementById("btn-copy-data");
  const btnDownload = document.getElementById("btn-download-data");
  const statusEl = document.getElementById("data-status");

  // --- Converters ---
  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const headers = splitCSVLine(lines[0]);
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVLine(lines[i]);
      const obj = {};
      headers.forEach((h, idx) => {
        let val = values[idx] !== undefined ? values[idx] : "";
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(val) && val !== "") val = Number(val);
        obj[h] = val;
      });
      results.push(obj);
    }
    return results;
  }

  function splitCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  function toCSV(data) {
    if (!Array.isArray(data)) data = [data];
    if (!data.length) return "";
    const headers = Array.from(new Set(data.flatMap(d => Object.keys(d))));
    const rows = [headers.join(",")];
    for (const item of data) {
      const row = headers.map(h => {
        let val = item[h] !== undefined ? item[h] : "";
        if (typeof val === "object") val = JSON.stringify(val);
        val = String(val).replace(/"/g, '""');
        return val.includes(",") || val.includes("\n") || val.includes('"') ? `"${val}"` : val;
      });
      rows.push(row.join(","));
    }
    return rows.join("\n");
  }

  function toYAML(obj, indent = 0) {
    const spaces = " ".repeat(indent);
    if (obj === null) return "null\n";
    if (typeof obj !== "object") return `${JSON.stringify(obj)}\n`;
    let yaml = "";
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === "object" && item !== null) {
          yaml += `${spaces}- ${toYAML(item, indent + 2).trimStart()}`;
        } else {
          yaml += `${spaces}- ${JSON.stringify(item)}\n`;
        }
      }
    } else {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "object" && v !== null) {
          yaml += `${spaces}${k}:\n${toYAML(v, indent + 2)}`;
        } else {
          yaml += `${spaces}${k}: ${JSON.stringify(v)}\n`;
        }
      }
    }
    return yaml;
  }

  function parseYAML(yaml) {
    // Basic multi-level YAML parser for common structures
    const lines = yaml.split(/\r?\n/);
    const root = {};
    let currentArray = null;
    let arrayKey = null;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (trimmed.startsWith("- ")) {
        const itemVal = trimmed.slice(2).trim();
        if (!currentArray) {
          currentArray = [];
          if (arrayKey) root[arrayKey] = currentArray;
        }
        currentArray.push(tryParseVal(itemVal));
      } else if (trimmed.includes(":")) {
        const idx = trimmed.indexOf(":");
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (v === "") {
          arrayKey = k;
          currentArray = [];
          root[k] = currentArray;
        } else {
          root[k] = tryParseVal(v);
          arrayKey = null;
          currentArray = null;
        }
      }
    }
    return root;
  }

  function tryParseVal(v) {
    if (v === "true") return true;
    if (v === "false") return false;
    if (v === "null") return null;
    if (!isNaN(v) && v !== "") return Number(v);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }
    return v;
  }

  function toXML(obj, rootName = "root") {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
    function serialize(val, tag, ind = 2) {
      const sp = " ".repeat(ind);
      if (Array.isArray(val)) {
        return val.map(v => serialize(v, tag.replace(/s$/, '') || "item", ind)).join("");
      } else if (typeof val === "object" && val !== null) {
        let inner = "";
        for (const [k, v] of Object.entries(val)) {
          inner += serialize(v, k, ind + 2);
        }
        return `${sp}<${tag}>\n${inner}${sp}</${tag}>\n`;
      } else {
        return `${sp}<${tag}>${escapeXML(String(val))}</${tag}>\n`;
      }
    }
    if (Array.isArray(obj)) {
      for (const item of obj) xml += serialize(item, "item", 2);
    } else {
      for (const [k, v] of Object.entries(obj)) xml += serialize(v, k, 2);
    }
    xml += `</${rootName}>`;
    return xml;
  }

  function escapeXML(str) {
    return str.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function parseXML(xmlStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, "application/xml");
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) throw new Error("XML Parse Error: " + errorNode.textContent);
    function domToObj(node) {
      if (node.children.length === 0) return tryParseVal(node.textContent.trim());
      const obj = {};
      for (const child of node.children) {
        const name = child.nodeName;
        const val = domToObj(child);
        if (obj[name] !== undefined) {
          if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
          obj[name].push(val);
        } else {
          obj[name] = val;
        }
      }
      return obj;
    }
    return domToObj(doc.documentElement);
  }

  function triggerSuccess(msg) {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("data-converter");
    }
  }

  btnConvert?.addEventListener("click", () => {
    const raw = inputEl.value.trim();
    if (!raw) return;
    const from = selectFrom.value;
    const to = selectTo.value;

    try {
      let intermediate = null;
      if (from === "json") intermediate = JSON.parse(raw);
      else if (from === "csv") intermediate = parseCSV(raw);
      else if (from === "yaml") intermediate = parseYAML(raw);
      else if (from === "xml") intermediate = parseXML(raw);

      let result = "";
      if (to === "json") result = JSON.stringify(intermediate, null, 2);
      else if (to === "csv") result = toCSV(intermediate);
      else if (to === "yaml") result = toYAML(intermediate);
      else if (to === "xml") result = toXML(intermediate);

      outputEl.value = result;
      triggerSuccess(`Converted ${from.toUpperCase()} to ${to.toUpperCase()} successfully.`);
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = "Conversion failed: " + e.message;
        statusEl.className = "tool-status-message error";
      }
    }
  });

  btnExample?.addEventListener("click", () => {
    selectFrom.value = "json";
    selectTo.value = "csv";
    inputEl.value = JSON.stringify([
      { "id": 1, "name": "Text to DNA", "category": "encoding", "free": true },
      { "id": 2, "name": "Image Converter", "category": "media", "free": true },
      { "id": 3, "name": "Hash Generator", "category": "security", "free": true }
    ], null, 2);
    btnConvert.click();
  });

  btnCopy?.addEventListener("click", async () => {
    if (!outputEl.value) return;
    try {
      await navigator.clipboard.writeText(outputEl.value);
      const prev = btnCopy.textContent;
      btnCopy.textContent = "Copied!";
      setTimeout(() => btnCopy.textContent = prev, 1800);
    } catch (e) {
      outputEl.select();
      document.execCommand("copy");
    }
  });

  btnDownload?.addEventListener("click", () => {
    if (!outputEl.value) return;
    const ext = selectTo.value;
    const mime = ext === "json" ? "application/json" : ext === "xml" ? "application/xml" : "text/plain";
    const blob = new Blob([outputEl.value], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  });
})();
