// unit-converter.js — Universal Unit & Measurement Converter

(function() {
  const categorySelect = document.getElementById("unit-category");
  const inVal = document.getElementById("unit-from-val");
  const unitFrom = document.getElementById("unit-from");
  const outVal = document.getElementById("unit-to-val");
  const unitTo = document.getElementById("unit-to");
  const precisionSelect = document.getElementById("unit-precision");
  const btnSwap = document.getElementById("btn-unit-swap");
  const statusEl = document.getElementById("unit-status");
  const formulaEl = document.getElementById("unit-formula");

  const UNITS = {
    length: {
      name: "Length",
      base: "m",
      factors: {
        mm: 0.001,
        cm: 0.01,
        m: 1.0,
        km: 1000.0,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        mi: 1609.344,
        nmi: 1852.0
      },
      labels: {
        mm: "Millimeters (mm)",
        cm: "Centimeters (cm)",
        m: "Meters (m)",
        km: "Kilometers (km)",
        in: "Inches (in)",
        ft: "Feet (ft)",
        yd: "Yards (yd)",
        mi: "Miles (mi)",
        nmi: "Nautical Miles (nmi)"
      }
    },
    mass: {
      name: "Mass & Weight",
      base: "kg",
      factors: {
        mg: 0.000001,
        g: 0.001,
        kg: 1.0,
        t: 1000.0,
        oz: 0.028349523125,
        lb: 0.45359237,
        st: 6.35029318
      },
      labels: {
        mg: "Milligrams (mg)",
        g: "Grams (g)",
        kg: "Kilograms (kg)",
        t: "Metric Tons (t)",
        oz: "Ounces (oz)",
        lb: "Pounds (lb)",
        st: "Stone (st)"
      }
    },
    digital: {
      name: "Digital Storage",
      base: "B",
      factors: {
        B: 1,
        KB: 1000,
        MB: 1000000,
        GB: 1000000000,
        TB: 1000000000000,
        KiB: 1024,
        MiB: 1048576,
        GiB: 1073741824,
        TiB: 1099511627776
      },
      labels: {
        B: "Bytes (B)",
        KB: "Kilobytes (KB, 10³)",
        MB: "Megabytes (MB, 10⁶)",
        GB: "Gigabytes (GB, 10⁹)",
        TB: "Terabytes (TB, 10¹²)",
        KiB: "Kibibytes (KiB, 2¹⁰)",
        MiB: "Mebibytes (MiB, 2²⁰)",
        GiB: "Gibibytes (GiB, 2³⁰)",
        TiB: "Tebibytes (TiB, 2⁴⁰)"
      }
    },
    speed: {
      name: "Speed",
      base: "m_s",
      factors: {
        m_s: 1.0,
        km_h: 0.2777777777777778,
        mph: 0.44704,
        knot: 0.5144444444444445
      },
      labels: {
        m_s: "Meters / second (m/s)",
        km_h: "Kilometers / hour (km/h)",
        mph: "Miles / hour (mph)",
        knot: "Knots (kn)"
      }
    },
    area: {
      name: "Area",
      base: "m2",
      factors: {
        m2: 1.0,
        km2: 1000000.0,
        ft2: 0.09290304,
        yd2: 0.83612736,
        ac: 4046.8564224,
        ha: 10000.0
      },
      labels: {
        m2: "Square Meters (m²)",
        km2: "Square Kilometers (km²)",
        ft2: "Square Feet (ft²)",
        yd2: "Square Yards (yd²)",
        ac: "Acres (ac)",
        ha: "Hectares (ha)"
      }
    },
    temperature: {
      name: "Temperature",
      isSpecial: true,
      labels: {
        C: "Celsius (°C)",
        F: "Fahrenheit (°F)",
        K: "Kelvin (K)"
      }
    }
  };

  function populateUnitDropdowns() {
    const cat = categorySelect.value;
    const def = UNITS[cat];
    if (!def) return;

    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";

    const keys = Object.keys(def.labels);
    keys.forEach((k, idx) => {
      const opt1 = document.createElement("option");
      opt1.value = k;
      opt1.textContent = def.labels[k];
      unitFrom.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = k;
      opt2.textContent = def.labels[k];
      unitTo.appendChild(opt2);
    });

    if (keys.length > 1) unitTo.selectedIndex = 1;
    calculate();
  }

  function calculate() {
    const raw = inVal.value;
    if (raw === "" || isNaN(Number(raw))) {
      outVal.value = "";
      if (formulaEl) formulaEl.textContent = "";
      return;
    }

    const val = Number(raw);
    const cat = categorySelect.value;
    const from = unitFrom.value;
    const to = unitTo.value;
    const prec = parseInt(precisionSelect.value, 10);

    let result = 0;

    if (cat === "temperature") {
      let celsius = 0;
      if (from === "C") celsius = val;
      else if (from === "F") celsius = (val - 32) * 5 / 9;
      else if (from === "K") celsius = val - 273.15;

      if (to === "C") result = celsius;
      else if (to === "F") result = (celsius * 9 / 5) + 32;
      else if (to === "K") result = celsius + 273.15;
    } else {
      const def = UNITS[cat];
      const baseVal = val * def.factors[from];
      result = baseVal / def.factors[to];
    }

    outVal.value = Number(result.toFixed(prec)).toString();
    if (formulaEl) {
      formulaEl.textContent = `1 ${from} = ${(result / (val || 1)).toPrecision(6)} ${to}`;
    }
    if (statusEl) {
      statusEl.textContent = "Calculated in real time.";
      statusEl.className = "tool-status-message success";
    }
    if (window.maybeRunVideoSlider) {
      window.maybeRunVideoSlider("unit-converter");
    }
  }

  categorySelect?.addEventListener("change", populateUnitDropdowns);
  unitFrom?.addEventListener("change", calculate);
  unitTo?.addEventListener("change", calculate);
  precisionSelect?.addEventListener("change", calculate);
  inVal?.addEventListener("input", calculate);

  btnSwap?.addEventListener("click", () => {
    const temp = unitFrom.value;
    unitFrom.value = unitTo.value;
    unitTo.value = temp;
    calculate();
  });

  populateUnitDropdowns();
})();
