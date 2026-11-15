// image-converter.js — In-browser Canvas Image Converter & Compressor

(function() {
  const dropzoneEl = document.getElementById("img-dropzone");
  const fileInputEl = document.getElementById("img-file-input");
  const formatSelect = document.getElementById("img-format");
  const qualitySlider = document.getElementById("img-quality");
  const qualityVal = document.getElementById("img-quality-val");
  const btnConvert = document.getElementById("btn-convert-img");
  const btnDownload = document.getElementById("btn-download-img");
  const btnExample = document.getElementById("btn-example-img");
  const statusEl = document.getElementById("img-status");
  const statsEl = document.getElementById("img-stats");
  const previewImg = document.getElementById("img-preview");
  const previewCard = document.getElementById("img-preview-card");

  let currentImage = null;
  let currentFile = null;
  let convertedBlob = null;

  qualitySlider?.addEventListener("input", () => {
    if (qualityVal) qualityVal.textContent = qualitySlider.value + "%";
  });

  dropzoneEl?.addEventListener("click", () => fileInputEl?.click());
  fileInputEl?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
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
    if (file) loadImage(file);
  });

  function loadImage(file) {
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        if (statusEl) {
          statusEl.textContent = `Loaded ${file.name} (${img.width}×${img.height}px, ${(file.size / 1024).toFixed(1)} KB)`;
          statusEl.className = "tool-status-message success";
        }
        btnConvert.click();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  btnConvert?.addEventListener("click", () => {
    if (!currentImage) {
      if (statusEl) {
        statusEl.textContent = "Please select or drop an image first.";
        statusEl.className = "tool-status-message error";
      }
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    const ctx = canvas.getContext("2d");

    const targetFormat = formatSelect.value; // image/webp, image/jpeg, image/png
    const quality = parseFloat(qualitySlider.value) / 100.0;

    // For JPEG, fill transparent background with white
    if (targetFormat === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(currentImage, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      convertedBlob = blob;
      const url = URL.createObjectURL(blob);
      if (previewImg) previewImg.src = url;
      if (previewCard) previewCard.style.display = "block";

      const origSize = currentFile ? currentFile.size : 10000;
      const newSize = blob.size;
      const diff = (((origSize - newSize) / origSize) * 100).toFixed(1);
      const isSmaller = newSize < origSize;

      if (statsEl) {
        statsEl.innerHTML = `
          <div style="display:flex;flex-wrap:wrap;gap:1.5rem;font-size:0.9rem;color:var(--text-bright);margin-top:0.5rem">
            <span>Original Size: <strong>${(origSize / 1024).toFixed(1)} KB</strong></span>
            <span>Converted Size: <strong>${(newSize / 1024).toFixed(1)} KB</strong></span>
            <span style="color:${isSmaller ? 'var(--success)' : 'var(--muted)'}">
              ${isSmaller ? `🎉 Saved ${diff}%` : `+${Math.abs(diff)}%`}
            </span>
          </div>
        `;
      }
      if (statusEl) {
        statusEl.textContent = "Image converted successfully!";
        statusEl.className = "tool-status-message success";
      }
      btnDownload.disabled = false;
      if (window.maybeRunVideoSlider) {
        window.maybeRunVideoSlider("image-converter");
      }
    }, targetFormat, quality);
  });

  btnDownload?.addEventListener("click", () => {
    if (!convertedBlob) return;
    const ext = formatSelect.value.split("/")[1] || "webp";
    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "converted";
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnExample?.addEventListener("click", () => {
    // Generate a colorful sample canvas image
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 300;
    const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, "#02133e");
    grad.addColorStop(1, "#182a69");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = "#a0a0ff";
    ctx.font = "bold 24px Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Old Lane 17 Tools", 200, 140);
    ctx.fillStyle = "#e8eaf6";
    ctx.font = "16px Roboto, sans-serif";
    ctx.fillText("Sample Canvas Image", 200, 175);

    c.toBlob((b) => {
      currentFile = new File([b], "sample-banner.png", { type: "image/png" });
      loadImage(currentFile);
    }, "image/png");
  });
})();
