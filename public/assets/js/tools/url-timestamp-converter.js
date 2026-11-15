// url-timestamp-converter.js — URL Encoder/Decoder & Unix Epoch Timestamp Converter

(function() {
  // Tabs
  const tabUrl = document.getElementById("tab-btn-url");
  const tabTs = document.getElementById("tab-btn-ts");
  const panelUrl = document.getElementById("panel-url");
  const panelTs = document.getElementById("panel-ts");

  tabUrl?.addEventListener("click", () => {
    tabUrl.classList.add("active");
    tabTs.classList.remove("active");
    panelUrl.style.display = "block";
    panelTs.style.display = "none";
  });

  tabTs?.addEventListener("click", () => {
    tabTs.classList.add("active");
    tabUrl.classList.remove("active");
    panelTs.style.display = "block";
    panelUrl.style.display = "none";
  });

  // URL elements
  const inUrl = document.getElementById("url-input");
  const outUrl = document.getElementById("url-output");
  const btnEncodeComp = document.getElementById("btn-url-encode-comp");
  const btnEncodeFull = document.getElementById("btn-url-encode-full");
  const btnDecodeUrl = document.getElementById("btn-url-decode");
  const btnExampleUrl = document.getElementById("btn-url-example");
  const statusUrl = document.getElementById("url-status");

  btnEncodeComp?.addEventListener("click", () => {
    if (!inUrl.value) return;
    outUrl.value = encodeURIComponent(inUrl.value);
    showSuccess(statusUrl, "Encoded component parameter safely.");
  });

  btnEncodeFull?.addEventListener("click", () => {
    if (!inUrl.value) return;
    outUrl.value = encodeURI(inUrl.value);
    showSuccess(statusUrl, "Encoded full URL safely.");
  });

  btnDecodeUrl?.addEventListener("click", () => {
    if (!inUrl.value) return;
    try {
      outUrl.value = decodeURIComponent(inUrl.value);
      showSuccess(statusUrl, "Decoded URL successfully.");
    } catch (e) {
      if (statusUrl) {
        statusUrl.textContent = "Malformed URI: " + e.message;
        statusUrl.className = "tool-status-message error";
      }
    }
  });

  btnExampleUrl?.addEventListener("click", () => {
    inUrl.value = "https://tools.oldlane17.com/search?q=DNA to text &category=dev tools&tag=#free";
    btnEncodeComp.click();
  });

  // Timestamp elements
  const inTs = document.getElementById("ts-input");
  const outUtc = document.getElementById("ts-out-utc");
  const outLocal = document.getElementById("ts-out-local");
  const outIso = document.getElementById("ts-out-iso");
  const outRel = document.getElementById("ts-out-rel");
  const btnNow = document.getElementById("btn-ts-now");
  const inDatePicker = document.getElementById("ts-datepicker");
  const outEpochFromDate = document.getElementById("ts-out-epoch");
  const statusTs = document.getElementById("ts-status");

  function convertTimestamp(val) {
    let num = Number(val);
    if (isNaN(num) || !val) return;
    // auto detect milliseconds vs seconds
    if (val.trim().length <= 10) num *= 1000;
    const d = new Date(num);
    if (isNaN(d.getTime())) return;

    if (outUtc) outUtc.value = d.toUTCString();
    if (outLocal) outLocal.value = d.toLocaleString();
    if (outIso) outIso.value = d.toISOString();
    if (outRel) outRel.value = getRelativeTime(d);
    showSuccess(statusTs, "Timestamp parsed successfully.");
  }

  function getRelativeTime(d) {
    const deltaSec = Math.round((d.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const abs = Math.abs(deltaSec);
    if (abs < 60) return rtf.format(deltaSec, "second");
    if (abs < 3600) return rtf.format(Math.round(deltaSec / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(deltaSec / 3600), "hour");
    return rtf.format(Math.round(deltaSec / 86400), "day");
  }

  inTs?.addEventListener("input", () => convertTimestamp(inTs.value));

  btnNow?.addEventListener("click", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    inTs.value = nowSec;
    convertTimestamp(String(nowSec));
  });

  inDatePicker?.addEventListener("input", () => {
    const val = inDatePicker.value;
    if (!val) return;
    const epoch = Math.floor(new Date(val).getTime() / 1000);
    if (outEpochFromDate) outEpochFromDate.value = epoch;
    inTs.value = epoch;
    convertTimestamp(String(epoch));
  });

  function showSuccess(el, msg) {
    if (el) {
      el.textContent = msg;
      el.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("url-timestamp-converter");
    }
  }

  // Auto initialize with now
  btnNow?.click();
})();
