(() => {
  "use strict";

  const STORAGE_KEY = "budgetflow_experience_v2";

  const CURRENCIES = {
    USD: { symbol: "$", code: "USD" },
    EUR: { symbol: "€", code: "EUR" },
    MXN: { symbol: "$", code: "MXN" },
    COP: { symbol: "$", code: "COP" },
    ARS: { symbol: "$", code: "ARS" },
    CLP: { symbol: "$", code: "CLP" },
    PEN: { symbol: "S/", code: "PEN" },
  };

  const PERIOD_FACTORS = {
    mensual: { label: "mensual", adjective: "Mensual", perYear: 12 },
    quincenal: { label: "quincenal", adjective: "Quincenal", perYear: 24 },
    semanal: { label: "semanal", adjective: "Semanal", perYear: 52 },
    anual: { label: "anual", adjective: "Anual", perYear: 1 },
  };

  const STRATEGIES = {
    "50-30-20": {
      id: "50-30-20",
      name: "Regla 50 / 30 / 20",
      short: "50 / 30 / 20",
      tagline: "Equilibrio clásico sostenible",
      targets: { needs: 50, wants: 30, savings: 20 },
      whySummary:
        "Popularizada por Elizabeth Warren, divide tu ingreso neto en tres bloques simples para cuidar tu presente y tu futuro sin obsesionarte con cada centavo.",
      whyDetails: [
        "50% para necesidades vitales (vivienda, comida, servicios y transporte).",
        "30% para estilo de vida y disfrute, evitando la fatiga de presupuestos extremos.",
        "20% apartado primero para fondo de emergencia, inversión o metas.",
      ],
      bestFor: "Ingresos estables que buscan armonía entre bienestar actual y ahorro constante.",
    },
    "60-20-20": {
      id: "60-20-20",
      name: "Regla 60 / 20 / 20",
      short: "60 / 20 / 20",
      tagline: "Fijos controlados + ahorro firme",
      targets: { needs: 60, wants: 20, savings: 20 },
      whySummary:
        "Ideal cuando el costo de vida esencial supera la mitad de tus ingresos, pero quieres proteger intacta la meta saludable del 20% de ahorro.",
      whyDetails: [
        "Amplía el margen fijo al 60% para absorber renta y alimentación sin estrés.",
        "Acota los deseos al 20%, enfocándote solo en lo que de verdad valoras.",
        "Preserva el 20% íntegro para construir patrimonio y colchón financiero.",
      ],
      bestFor: "Ciudades de costo medio-alto o familias que no quieren sacrificar su ahorro.",
    },
    "70-20-10": {
      id: "70-20-10",
      name: "Regla 70 / 20 / 10",
      short: "70 / 20 / 10",
      tagline: "Estabilidad en etapas exigentes",
      targets: { needs: 70, wants: 20, savings: 10 },
      whySummary:
        "Pensada para momentos donde tus compromisos básicos son altos o estás pagando deudas, permitiéndote respirar sin abandonar el hábito del ahorro.",
      whyDetails: [
        "70% reconoce tus obligaciones esenciales reales sin metas irreales.",
        "20% mantiene un margen moderado para bienestar personal.",
        "10% asegura que cada periodo sigas sumando reserva o bajando deuda.",
      ],
      bestFor: "Quienes inician carrera, viven en zonas caras o salen de compromisos financieros.",
    },
    "zero-based": {
      id: "zero-based",
      name: "Plan 45 / 25 / 30",
      short: "45 / 25 / 30",
      tagline: "Ahorro e inversión acelerados",
      targets: { needs: 45, wants: 25, savings: 30 },
      whySummary:
        "Comprime los gastos fijos por debajo del 45% para liberar casi un tercio de todo lo que ganas hacia metas grandes, inversión o independencia.",
      whyDetails: [
        "Costos fijos bajos (<45%) te vuelven muy resistente ante imprevistos.",
        "25% permite disfrutar de forma intencional y consciente.",
        "30% de ahorro multiplica tu ritmo de crecimiento año tras año.",
      ],
      bestFor: "Personas enfocadas en comprar vivienda, invertir fuerte o crear libertad financiera.",
    },
    custom: {
      id: "custom",
      name: "Distribución a tu medida",
      short: "Libre",
      tagline: "Personaliza cada porcentaje",
      targets: null,
      whySummary:
        "Adapta las proporciones exactamente a tu momento de vida, ingresos variables o proyecto puntual antes de optimizar paso a paso.",
      whyDetails: [
        "Parte de tus números reales actuales sin restricciones rígidas.",
        "En el siguiente paso podrás mover cualquier barra y ver el impacto al instante.",
      ],
      bestFor: "Trabajadores independientes, metas temporales o ajustes finos mes a mes.",
    },
  };

  const DEFAULT_CATEGORIES = [
    {
      id: "needs",
      name: "Necesidades esenciales",
      description: "Vivienda, alimentación, servicios, salud y transporte básico.",
      color: "#0F766E",
      percent: 50,
      expanded: false,
      items: [
        { id: "n1", name: "Vivienda / Renta", amount: 720 },
        { id: "n2", name: "Supermercado", amount: 300 },
        { id: "n3", name: "Servicios y transporte", amount: 180 },
      ],
    },
    {
      id: "wants",
      name: "Estilo de vida y deseos",
      description: "Salidas, suscripciones, hobbies y compras opcionales.",
      color: "#D97706",
      percent: 30,
      expanded: false,
      items: [
        { id: "w1", name: "Salidas y restaurantes", amount: 420 },
        { id: "w2", name: "Suscripciones y ocio", amount: 140 },
        { id: "w3", name: "Compras personales", amount: 160 },
      ],
    },
    {
      id: "savings",
      name: "Ahorro, inversión y metas",
      description: "Fondo de emergencia, inversión, retiro o abono extra a deudas.",
      color: "#2563EB",
      percent: 20,
      expanded: false,
      items: [
        { id: "s1", name: "Fondo de emergencia", amount: 240 },
        { id: "s2", name: "Inversión / Metas", amount: 240 },
      ],
    },
  ];

  let state = loadState();
  let focusedCategoryId = null;

  const els = {
    stepper: document.getElementById("stepper"),
    progressFill: document.getElementById("progress-fill"),
    btnHomeBrand: document.getElementById("btn-home-brand"),
    btnReset: document.getElementById("btn-reset"),
    scenes: document.querySelectorAll(".scene"),

    // Escena 1
    incomeInput: document.getElementById("income-input"),
    s1CurrencySymbol: document.getElementById("s1-currency-symbol"),
    periodSelect: document.getElementById("period-select"),
    currencySelect: document.getElementById("currency-select"),
    s1Callout: document.getElementById("s1-callout"),
    btnS1Next: document.getElementById("btn-s1-next"),

    // Escena 2
    strategyGrid: document.getElementById("strategy-grid"),
    strategySpotlight: document.getElementById("strategy-spotlight"),
    btnS2Next: document.getElementById("btn-s2-next"),

    // Escena 3
    s3StrategyBadge: document.getElementById("s3-strategy-badge"),
    autobalanceCheckbox: document.getElementById("autobalance-checkbox"),
    donutSegments: document.getElementById("donut-segments"),
    centerLabel: document.getElementById("center-label"),
    centerAmount: document.getElementById("center-amount"),
    centerStatus: document.getElementById("center-status"),
    centerSubnote: document.getElementById("center-subnote"),
    chartTooltip: document.getElementById("chart-tooltip"),
    minimalSlidersList: document.getElementById("minimal-sliders-list"),
    s3LiveFeedback: document.getElementById("s3-live-feedback"),
    btnS3Next: document.getElementById("btn-s3-next"),

    // Escena 4
    s4DiagnosisContent: document.getElementById("s4-diagnosis-content"),
    btnS4Next: document.getElementById("btn-s4-next"),

    // Escena 5
    reportOwnerInput: document.getElementById("report-owner-input"),
    btnPrintNow: document.getElementById("btn-print-now"),
    docPreviewFrame: document.getElementById("doc-preview-frame"),
    printableDocument: document.getElementById("printable-document"),
  };

  function cloneDefaults() {
    return {
      currentStep: 1,
      unlockedStep: 1,
      income: 2400,
      currency: "USD",
      period: "mensual",
      strategy: "50-30-20",
      autoBalance: true,
      ownerName: "",
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefaults();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.categories) || parsed.categories.length !== 3) {
        return cloneDefaults();
      }
      const unlocked = Math.max(1, Math.min(5, Number(parsed.unlockedStep) || 1));
      const current = Math.max(1, Math.min(unlocked, Number(parsed.currentStep) || 1));
      return {
        currentStep: current,
        unlockedStep: unlocked,
        income: Number.isFinite(Number(parsed.income)) ? Math.max(0, Number(parsed.income)) : 2400,
        currency: CURRENCIES[parsed.currency] ? parsed.currency : "USD",
        period: PERIOD_FACTORS[parsed.period] ? parsed.period : "mensual",
        strategy: STRATEGIES[parsed.strategy] ? parsed.strategy : "50-30-20",
        autoBalance: typeof parsed.autoBalance === "boolean" ? parsed.autoBalance : true,
        ownerName: typeof parsed.ownerName === "string" ? parsed.ownerName : "",
        categories: parsed.categories.map((cat, idx) => ({
          ...DEFAULT_CATEGORIES[idx],
          ...cat,
          percent: Math.max(0, Math.min(100, Math.round(Number(cat.percent) || 0))),
          items: Array.isArray(cat.items) ? cat.items : DEFAULT_CATEGORIES[idx].items,
        })),
      };
    } catch {
      return cloneDefaults();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorar si almacenamiento está bloqueado
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMoney(amount, withCode = false) {
    const cur = CURRENCIES[state.currency] || CURRENCIES.USD;
    const rounded = Math.round(Number(amount) || 0);
    const formatted = Math.abs(rounded).toLocaleString("es-MX");
    const sign = rounded < 0 ? "-" : "";
    return `${sign}${cur.symbol}${formatted}${withCode ? " " + cur.code : ""}`;
  }

  function getCategoryAmount(cat) {
    return Math.round((state.income * cat.percent) / 100);
  }

  function getTotalPercent() {
    return state.categories.reduce((sum, c) => sum + c.percent, 0);
  }

  function animateValue(el, start, end, duration = 450, formatter = (v) => String(Math.round(v))) {
    if (!el) return;
    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatter(start + (end - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatter(end);
      }
    }
    requestAnimationFrame(frame);
  }

  // =========================================================================
  // Navegación entre Escenas y Desbloqueo Progresivo
  // =========================================================================

  function goToStep(step, directionOverride = null, skipAnim = false) {
    const target = Math.max(1, Math.min(5, step));
    if (target > state.unlockedStep) return;

    const prev = state.currentStep;
    const direction = directionOverride || (target >= prev ? "forward" : "backward");
    state.currentStep = target;
    saveState();

    els.scenes.forEach((sec) => {
      const sceneNum = Number(sec.getAttribute("data-scene"));
      sec.classList.remove("anim-forward", "anim-backward", "is-active");
      if (sceneNum === target) {
        sec.hidden = false;
        if (!skipAnim) {
          void sec.offsetWidth;
          sec.classList.add(direction === "forward" ? "anim-forward" : "anim-backward");
        }
        sec.classList.add("is-active");
      } else {
        sec.hidden = true;
      }
    });

    renderStepper();
    renderCurrentScene(!skipAnim);
    window.scrollTo({ top: 0, behavior: skipAnim ? "auto" : "smooth" });
  }

  function unlockAndGo(nextStep) {
    state.unlockedStep = Math.max(state.unlockedStep, Math.min(5, nextStep));
    goToStep(nextStep, "forward");
  }

  function renderStepper() {
    els.progressFill.style.width = `${(state.currentStep / 5) * 100}%`;
    els.stepper.querySelectorAll(".step-item").forEach((btn) => {
      const stepNum = Number(btn.getAttribute("data-step"));
      const isUnlocked = stepNum <= state.unlockedStep;
      const isActive = stepNum === state.currentStep;
      const isCompleted = stepNum < state.currentStep;

      btn.disabled = !isUnlocked;
      btn.classList.toggle("is-unlocked", isUnlocked);
      btn.classList.toggle("is-locked", !isUnlocked);
      btn.classList.toggle("is-active", isActive);
      btn.classList.toggle("is-completed", isCompleted);
    });
  }

  // =========================================================================
  // Escena 1: Ingreso
  // =========================================================================

  function renderScene1() {
    const cur = CURRENCIES[state.currency] || CURRENCIES.USD;
    els.s1CurrencySymbol.textContent = cur.symbol;
    els.periodSelect.value = state.period;
    els.currencySelect.value = state.currency;
    if (document.activeElement !== els.incomeInput) {
      els.incomeInput.value = state.income;
    }

    const perYear = PERIOD_FACTORS[state.period].perYear;
    const annualIncome = state.income * perYear;
    const sampleSave = Math.round(annualIncome * 0.2);

    if (state.income > 0) {
      els.s1Callout.innerHTML = `
        Tu ingreso equivale a <strong>${formatMoney(annualIncome, true)} al año</strong>.
        Con una estrategia equilibrada del 20%, podrías acumular <strong>${formatMoney(sampleSave)} cada año</strong>.
      `;
    } else {
      els.s1Callout.innerHTML = `Escribe un monto mayor a cero para comenzar a modelar tu presupuesto.`;
    }
  }

  // =========================================================================
  // Escena 2: Estrategia & Educación
  // =========================================================================

  function renderScene2() {
    els.strategyGrid.innerHTML = Object.values(STRATEGIES)
      .map((s) => {
        const selected = s.id === state.strategy;
        return `
          <button type="button" class="strategy-card ${selected ? "is-selected" : ""}" data-strategy="${s.id}" role="radio" aria-checked="${selected ? "true" : "false"}">
            <div class="strategy-card-main">
              <strong>${escapeHtml(s.name)}</strong>
              <span>${escapeHtml(s.tagline)}</span>
            </div>
            <span class="strategy-ratio-dots">${escapeHtml(s.short)}</span>
          </button>
        `;
      })
      .join("");

    els.strategyGrid.querySelectorAll(".strategy-card").forEach((card) => {
      card.addEventListener("click", () => {
        applyStrategy(card.getAttribute("data-strategy"));
        renderScene2();
      });
    });

    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    const ringPercentages = strat.targets || {
      needs: state.categories[0].percent,
      wants: state.categories[1].percent,
      savings: state.categories[2].percent,
    };

    const r = 30;
    const circ = 2 * Math.PI * r;
    const segData = [
      { color: "#0F766E", pct: ringPercentages.needs },
      { color: "#D97706", pct: ringPercentages.wants },
      { color: "#2563EB", pct: ringPercentages.savings },
    ];
    let offset = 0;
    const circles = segData
      .map((seg) => {
        const len = (seg.pct / 100) * circ;
        const gap = Math.max(0, circ - len);
        const dashOffset = -offset;
        offset += len;
        return `<circle cx="40" cy="40" r="${r}" fill="none" stroke="${seg.color}" stroke-width="11" stroke-dasharray="${len.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${dashOffset.toFixed(2)}" />`;
      })
      .join("");

    els.strategySpotlight.innerHTML = `
      <div>
        <div class="spotlight-head">
          <div class="spotlight-ring-box" aria-hidden="true">
            <svg viewBox="0 0 80 80" width="76" height="76" style="transform: rotate(-90deg);">
              <circle cx="40" cy="40" r="${r}" fill="none" stroke="#efece4" stroke-width="11" />
              ${circles}
            </svg>
          </div>
          <div>
            <span class="spotlight-kicker">¿Por qué funciona?</span>
            <h3 class="spotlight-title">${escapeHtml(strat.name)}</h3>
          </div>
        </div>
        <p class="spotlight-summary" style="margin-top:14px;">${escapeHtml(strat.whySummary)}</p>
        <ul class="spotlight-bullets" style="margin-top:10px;">
          ${strat.whyDetails.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
        </ul>
      </div>
      <div class="spotlight-bestfor">
        <strong>Ideal para:</strong> ${escapeHtml(strat.bestFor)}
      </div>
    `;
  }

  function applyStrategy(strategyId) {
    const strat = STRATEGIES[strategyId];
    if (!strat) return;
    state.strategy = strategyId;
    if (strat.targets) {
      state.categories.forEach((cat) => {
        if (typeof strat.targets[cat.id] === "number") {
          cat.percent = strat.targets[cat.id];
        }
      });
    }
    saveState();
  }

  // =========================================================================
  // Escena 3: El Centro Vivo (Gráfico Grande + Sliders Minimalistas)
  // =========================================================================

  function setCategoryPercent(catId, newPercent) {
    const clamped = Math.max(0, Math.min(100, Math.round(newPercent)));
    const targetCat = state.categories.find((c) => c.id === catId);
    if (!targetCat) return;

    if (!state.autoBalance) {
      targetCat.percent = clamped;
      detectStrategyMatch();
      saveState();
      renderScene3();
      return;
    }

    const others = state.categories.filter((c) => c.id !== catId);
    const remaining = 100 - clamped;
    const othersCurrentSum = others.reduce((sum, c) => sum + c.percent, 0);
    targetCat.percent = clamped;

    if (othersCurrentSum === 0) {
      const base = Math.floor(remaining / others.length);
      let rem = remaining - base * others.length;
      others.forEach((c) => {
        c.percent = base + (rem > 0 ? 1 : 0);
        if (rem > 0) rem--;
      });
    } else {
      let allocated = 0;
      others.forEach((c, idx) => {
        if (idx === others.length - 1) {
          c.percent = Math.max(0, remaining - allocated);
        } else {
          const share = Math.round((c.percent / othersCurrentSum) * remaining);
          c.percent = Math.max(0, Math.min(remaining - allocated, share));
          allocated += c.percent;
        }
      });
    }

    detectStrategyMatch();
    saveState();
    renderScene3();
  }

  function detectStrategyMatch() {
    const map = {};
    state.categories.forEach((c) => {
      map[c.id] = c.percent;
    });
    const matched = Object.values(STRATEGIES).find((s) => {
      if (!s.targets) return false;
      return (
        s.targets.needs === map.needs &&
        s.targets.wants === map.wants &&
        s.targets.savings === map.savings
      );
    });
    state.strategy = matched ? matched.id : "custom";
  }

  function getDonutMetrics(radius) {
    const circumference = 2 * Math.PI * radius;
    const totalPct = getTotalPercent();
    const scaleFactor = totalPct > 100 ? 100 / totalPct : 1;
    let cumulative = 0;

    return state.categories.map((cat) => {
      const effectivePct = cat.percent * scaleFactor;
      const dashLength = (effectivePct / 100) * circumference;
      const gapLength = Math.max(0, circumference - dashLength);
      const offset = -cumulative;
      cumulative += dashLength;
      return {
        cat,
        dashArray: `${dashLength.toFixed(2)} ${gapLength.toFixed(2)}`,
        dashOffset: offset.toFixed(2),
      };
    });
  }

  function buildDonutMarkup(radius, strokeWidth, centerCoord) {
    return getDonutMetrics(radius)
      .map(
        ({ cat, dashArray, dashOffset }) => `<circle
          class="donut-segment"
          data-cat-id="${cat.id}"
          cx="${centerCoord}"
          cy="${centerCoord}"
          r="${radius}"
          stroke="${cat.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${dashArray}"
          stroke-dashoffset="${dashOffset}"
        />`
      )
      .join("");
  }

  function mountChart() {
    els.donutSegments.innerHTML = buildDonutMarkup(154, 44, 210);
    els.donutSegments.querySelectorAll(".donut-segment").forEach((seg) => {
      const catId = seg.getAttribute("data-cat-id");
      seg.addEventListener("mouseenter", () => showChartHover(catId));
      seg.addEventListener("mouseleave", () => hideChartHover());
      seg.addEventListener("click", () => toggleFocusCategory(catId));
    });
  }

  function renderChart() {
    if (!els.donutSegments.querySelector(".donut-segment")) {
      mountChart();
    }
    const metrics = getDonutMetrics(154);
    metrics.forEach(({ cat, dashArray, dashOffset }) => {
      const seg = els.donutSegments.querySelector(`.donut-segment[data-cat-id="${cat.id}"]`);
      if (!seg) return;
      seg.setAttribute("stroke-dasharray", dashArray);
      seg.setAttribute("stroke-dashoffset", dashOffset);
      seg.classList.toggle("is-focused", focusedCategoryId === cat.id);
      seg.classList.toggle("is-dimmed", Boolean(focusedCategoryId && focusedCategoryId !== cat.id));
    });
    updateCenterReadout();
  }

  function updateCenterReadout(hoverCatId = null) {
    const activeId = hoverCatId || focusedCategoryId;
    const activeCat = activeId ? state.categories.find((c) => c.id === activeId) : null;

    if (activeCat) {
      els.centerLabel.textContent = activeCat.name;
      els.centerAmount.textContent = formatMoney(getCategoryAmount(activeCat));
      els.centerStatus.textContent = `${activeCat.percent}% del ingreso`;
      els.centerStatus.className = "center-status status-balanced";
      els.centerSubnote.textContent = focusedCategoryId
        ? "Toca el segmento para volver al total"
        : "Toca para enfocar esta categoría";
      return;
    }

    const totalPct = getTotalPercent();
    const diffPct = 100 - totalPct;
    const diffAmount = Math.round((state.income * diffPct) / 100);

    els.centerLabel.textContent = `Ingreso ${PERIOD_FACTORS[state.period].label}`;
    els.centerAmount.textContent = formatMoney(state.income);

    if (diffPct === 0) {
      els.centerStatus.textContent = "100% asignado";
      els.centerStatus.className = "center-status status-balanced";
      els.centerSubnote.textContent = "Toca un segmento para enfocarte";
    } else if (diffPct > 0) {
      els.centerStatus.textContent = `Te sobran ${formatMoney(diffAmount)} (${diffPct}%)`;
      els.centerStatus.className = "center-status status-surplus";
      els.centerSubnote.textContent = `Asignado: ${totalPct}%`;
    } else {
      els.centerStatus.textContent = `Excedes por ${formatMoney(Math.abs(diffAmount))}`;
      els.centerStatus.className = "center-status status-deficit";
      els.centerSubnote.textContent = `Asignado: ${totalPct}% (sobre 100%)`;
    }
  }

  function showChartHover(catId) {
    const cat = state.categories.find((c) => c.id === catId);
    if (!cat) return;
    els.chartTooltip.textContent = `${cat.name}: ${cat.percent}% · ${formatMoney(getCategoryAmount(cat))}`;
    els.chartTooltip.hidden = false;
    updateCenterReadout(catId);
  }

  function hideChartHover() {
    els.chartTooltip.hidden = true;
    updateCenterReadout(null);
  }

  function toggleFocusCategory(catId) {
    focusedCategoryId = focusedCategoryId === catId ? null : catId;
    renderChart();
    updateSlidersInPlace();
  }

  function mountMinimalSliders() {
    const curSymbol = (CURRENCIES[state.currency] || CURRENCIES.USD).symbol;

    els.minimalSlidersList.innerHTML = state.categories
      .map((cat) => {
        const amount = getCategoryAmount(cat);
        const itemsSum = cat.items.reduce((s, item) => s + (Number(item.amount) || 0), 0);
        const focusedClass = focusedCategoryId === cat.id ? "is-focused" : "";

        const itemsHtml = cat.items
          .map(
            (item) => `
            <div class="item-row" data-item-id="${item.id}">
              <input type="text" class="item-name-input" value="${escapeHtml(item.name)}" placeholder="Concepto" aria-label="Concepto de gasto" />
              <input type="number" class="item-amount-input" min="0" step="10" value="${Math.round(Number(item.amount) || 0)}" aria-label="Monto del gasto" />
              <button type="button" class="item-remove-btn" aria-label="Eliminar">&times;</button>
            </div>
          `
          )
          .join("");

        return `
          <div class="min-cat-row ${focusedClass}" data-cat-id="${cat.id}" style="--cat-color:${cat.color}">
            <div class="min-cat-head">
              <div class="min-cat-title-wrap">
                <span class="cat-dot" aria-hidden="true"></span>
                <span class="min-cat-name">${escapeHtml(cat.name)}</span>
              </div>
              <div class="min-cat-controls">
                <div class="inline-money-box">
                  <span class="amount-prefix">${curSymbol}</span>
                  <input type="number" class="cat-amount-input" min="0" step="10" value="${amount}" aria-label="Monto para ${escapeHtml(cat.name)}" />
                </div>
                <span class="cat-pct-badge">${cat.percent}%</span>
              </div>
            </div>

            <div class="min-slider-wrap">
              <input
                type="range"
                class="cat-slider"
                min="0"
                max="100"
                value="${cat.percent}"
                style="--slider-pct:${cat.percent}%"
                aria-label="Porcentaje para ${escapeHtml(cat.name)}"
              />
            </div>

            <div class="min-cat-foot">
              <button type="button" class="toggle-items-btn" aria-expanded="${cat.expanded ? "true" : "false"}">
                ${cat.expanded ? "▾ Ocultar rubros" : "▸ Detallar rubros reales"} (${cat.items.length})
              </button>
              <span style="font-size:0.76rem; color:var(--ink-muted);">Suma: <strong class="items-sum-label">${formatMoney(itemsSum)}</strong></span>
            </div>

            <div class="items-drawer" ${cat.expanded ? "" : "hidden"}>
              ${itemsHtml}
              <div class="items-drawer-actions">
                <button type="button" class="btn-mini btn-add-item">+ Añadir rubro</button>
                <button type="button" class="btn-mini btn-mini-dark btn-apply-items">Aplicar ${formatMoney(itemsSum)}</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    els.minimalSlidersList.querySelectorAll(".min-cat-row").forEach((row) => {
      const catId = row.getAttribute("data-cat-id");
      const cat = state.categories.find((c) => c.id === catId);
      if (!cat) return;

      row.querySelector(".cat-slider").addEventListener("input", (e) => {
        setCategoryPercent(catId, Number(e.target.value));
      });

      row.querySelector(".cat-amount-input").addEventListener("change", (e) => {
        const val = Math.max(0, Number(e.target.value) || 0);
        if (state.income > 0) {
          setCategoryPercent(catId, Math.round((val / state.income) * 100));
        }
      });

      row.querySelector(".toggle-items-btn").addEventListener("click", () => {
        cat.expanded = !cat.expanded;
        saveState();
        mountMinimalSliders();
      });

      row.querySelector(".btn-add-item").addEventListener("click", () => {
        cat.items.push({ id: "i_" + Date.now(), name: "Nuevo gasto", amount: 0 });
        cat.expanded = true;
        saveState();
        mountMinimalSliders();
      });

      row.querySelector(".btn-apply-items").addEventListener("click", () => {
        const sum = cat.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
        if (state.income > 0) {
          setCategoryPercent(catId, Math.round((sum / state.income) * 100));
        }
      });

      row.querySelectorAll(".item-row").forEach((itemRow) => {
        const itemId = itemRow.getAttribute("data-item-id");
        const item = cat.items.find((i) => i.id === itemId);
        if (!item) return;

        itemRow.querySelector(".item-name-input").addEventListener("input", (e) => {
          item.name = e.target.value;
          saveState();
        });

        itemRow.querySelector(".item-amount-input").addEventListener("input", (e) => {
          item.amount = Math.max(0, Number(e.target.value) || 0);
          saveState();
          const sum = cat.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
          row.querySelector(".items-sum-label").textContent = formatMoney(sum);
          row.querySelector(".btn-apply-items").textContent = `Aplicar ${formatMoney(sum)}`;
        });

        itemRow.querySelector(".item-remove-btn").addEventListener("click", () => {
          cat.items = cat.items.filter((i) => i.id !== itemId);
          saveState();
          mountMinimalSliders();
        });
      });
    });
  }

  function updateSlidersInPlace() {
    if (!els.minimalSlidersList.querySelector(".min-cat-row")) {
      mountMinimalSliders();
      return;
    }

    const curSymbol = (CURRENCIES[state.currency] || CURRENCIES.USD).symbol;
    state.categories.forEach((cat) => {
      const row = els.minimalSlidersList.querySelector(`.min-cat-row[data-cat-id="${cat.id}"]`);
      if (!row) return;

      row.classList.toggle("is-focused", focusedCategoryId === cat.id);
      row.querySelector(".amount-prefix").textContent = curSymbol;

      const amountInput = row.querySelector(".cat-amount-input");
      if (document.activeElement !== amountInput) {
        amountInput.value = getCategoryAmount(cat);
      }

      row.querySelector(".cat-pct-badge").textContent = `${cat.percent}%`;
      const slider = row.querySelector(".cat-slider");
      slider.value = cat.percent;
      slider.style.setProperty("--slider-pct", `${cat.percent}%`);

      const sum = cat.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
      row.querySelector(".items-sum-label").textContent = formatMoney(sum);
      row.querySelector(".btn-apply-items").textContent = `Aplicar ${formatMoney(sum)}`;
    });
  }

  function renderScene3LiveTip() {
    const needs = state.categories[0].percent;
    const wants = state.categories[1].percent;
    const savings = state.categories[2].percent;
    const total = needs + wants + savings;
    const perYear = PERIOD_FACTORS[state.period].perYear;
    const annualSave = Math.round((state.income * savings) / 100) * perYear;

    if (total > 100) {
      els.s3LiveFeedback.innerHTML = `<strong>Alerta:</strong> Estás asignando ${total}% de tu ingreso. Reduce ${total - 100}% para evitar déficits.`;
    } else if (total < 100) {
      els.s3LiveFeedback.innerHTML = `Tienes <strong>${100 - total}% sin asignar</strong>. Dales un destino (idealmente a ahorro) para que cada unidad trabaje por ti.`;
    } else if (savings >= 25) {
      els.s3LiveFeedback.innerHTML = `<strong>Ritmo acelerado:</strong> Con el ${savings}% en ahorro reunirás <strong>${formatMoney(annualSave)} en 1 año</strong>.`;
    } else if (needs > 65) {
      els.s3LiveFeedback.innerHTML = `<strong>Dato clave:</strong> Tus fijos ocupan el ${needs}%. En el siguiente paso veremos cómo blindar tu margen.`;
    } else {
      els.s3LiveFeedback.innerHTML = `<strong>Balance saludable:</strong> Estás proyectando ahorrar <strong>${formatMoney(annualSave)} al año</strong> manteniendo ${wants}% para disfrutar.`;
    }
  }

  function renderScene3() {
    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    els.s3StrategyBadge.textContent = `Paso 3 de 5 · Estrategia: ${strat.name}`;
    els.autobalanceCheckbox.checked = state.autoBalance;
    renderChart();
    updateSlidersInPlace();
    renderScene3LiveTip();
  }

  // =========================================================================
  // Motor de Diagnóstico & Escena 4 (Simulador de Mejoras)
  // =========================================================================

  function analyzeBudget() {
    const needs = state.categories.find((c) => c.id === "needs")?.percent || 0;
    const wants = state.categories.find((c) => c.id === "wants")?.percent || 0;
    const savings = state.categories.find((c) => c.id === "savings")?.percent || 0;
    const totalPct = needs + wants + savings;
    const diffPct = 100 - totalPct;
    const diffAmount = Math.round((state.income * diffPct) / 100);

    const savingsAmount = Math.round((state.income * savings) / 100);
    const needsAmount = Math.round((state.income * needs) / 100);
    const perYear = PERIOD_FACTORS[state.period].perYear;
    const annualSavings = savingsAmount * perYear;
    const emergencyTarget = needsAmount * 3;
    const periodsToEmergency = savingsAmount > 0 ? Math.ceil(emergencyTarget / savingsAmount) : null;

    let score = 78;
    const strengths = [];
    const improvements = [];
    const actionSteps = [];

    if (state.income <= 0) {
      score = 0;
      improvements.push({
        level: "alert",
        tag: "Ingreso en cero",
        text: "Regresa al Paso 1 para ingresar tu ingreso neto y calcular recomendaciones reales.",
        simAction: null,
      });
    } else {
      if (savings >= 25) {
        score += 18;
        strengths.push(`Ahorro sobresaliente (${savings}%), sumando ${formatMoney(annualSavings)} al año.`);
      } else if (savings >= 20) {
        score += 12;
        strengths.push(`Cumples la meta estándar del ${savings}% de ahorro (${formatMoney(annualSavings)} al año).`);
      } else if (savings >= 10) {
        score += 2;
        const boost = Math.min(5, Math.max(1, wants - 15));
        improvements.push({
          level: "warn",
          tag: "Margen de ahorro mejorable",
          text: `Ahorras ${savings}%. Subirlo un ${boost}% sumaría +${formatMoney(Math.round((state.income * boost) / 100) * perYear)} extra en 12 meses.`,
          simAction:
            wants >= 20
              ? { label: `Simular +${boost}% de Deseos a Ahorro`, deltas: { wants: -boost, savings: boost } }
              : null,
        });
        actionSteps.push(`Automatiza tu ahorro el mismo día que recibes ingresos y busca elevarlo gradualmente hacia el 20%.`);
      } else {
        score -= 22;
        const boost = Math.min(8, Math.max(5, wants - 10));
        improvements.push({
          level: "alert",
          tag: "Ahorro insuficiente",
          text: `Solo destinas ${savings}% al futuro. Sin reserva, cualquier imprevisto genera deuda.`,
          simAction:
            wants >= 15
              ? { label: `Simular +${boost}% de Deseos a Ahorro`, deltas: { wants: -boost, savings: boost } }
              : null,
        });
        actionSteps.push(`Aparta al menos ${formatMoney(state.income * 0.05)} por periodo antes de gastar en ocio.`);
      }

      if (needs <= 50) {
        score += 6;
        strengths.push(`Gastos fijos ligeros (${needs}%), lo que te da gran libertad ante imprevistos.`);
      } else if (needs <= 65) {
        improvements.push({
          level: "warn",
          tag: "Fijos moderados-altos",
          text: `Tus necesidades ocupan ${needs}%. Optimizar servicios o supermercado un 5% liberaría ${formatMoney(state.income * 0.05 * perYear)} anuales.`,
          simAction: { label: "Simular -5% en Necesidades hacia Ahorro", deltas: { needs: -5, savings: 5 } },
        });
        actionSteps.push(`Renegocia o compara tus 2 gastos fijos mayores para bajar la carga por debajo del 55%.`);
      } else {
        score -= 16;
        improvements.push({
          level: "alert",
          tag: "Sobrecarga fija",
          text: `El ${needs}% en necesidades reduce demasiado tu oxígeno financiero.`,
          simAction: { label: "Simular alivio de -5% a Ahorro", deltas: { needs: -5, savings: 5 } },
        });
        actionSteps.push(`Evita nuevas cuotas o compromisos fijos hasta reducir necesidades bajo el 60%.`);
      }

      if (wants > 35) {
        score -= 12;
        improvements.push({
          level: "warn",
          tag: "Deseos elevados",
          text: `Destinas ${wants}% a estilo de vida (${formatMoney((state.income * wants) / 100)}). Recortar 5% aquí acelera tus metas.`,
          simAction: { label: "Mover 5% a Ahorro", deltas: { wants: -5, savings: 5 } },
        });
        actionSteps.push(`Asigna un tope semanal para salidas y cancela suscripciones poco usadas.`);
      } else if (wants >= 15 && wants <= 30) {
        strengths.push(`Equilibrio sano en estilo de vida (${wants}%), sostenible sin privaciones extremas.`);
      } else if (wants < 10) {
        improvements.push({
          level: "warn",
          tag: "Presupuesto muy estricto",
          text: `Un ${wants}% de ocio suele ser difícil de mantener varios meses seguidos.`,
          simAction: null,
        });
      }

      if (diffPct < 0) {
        score -= 20;
        improvements.unshift({
          level: "alert",
          tag: "Déficit del " + Math.abs(diffPct) + "%",
          text: `Asignas ${totalPct}% del ingreso (exceso de ${formatMoney(Math.abs(diffAmount))}).`,
          simAction: { label: "Reequilibrar al 100% ahora", rebalance: true },
        });
        actionSteps.unshift(`Recorta ${formatMoney(Math.abs(diffAmount))} hoy mismo para no financiar gastos con deuda.`);
      } else if (diffPct > 0) {
        score -= 4;
        improvements.unshift({
          level: "warn",
          tag: "Excedente sin destino",
          text: `Hay ${formatMoney(diffAmount)} (${diffPct}%) sin asignar que tienden a fugarse en gastos hormiga.`,
          simAction: { label: `Enviar ${diffPct}% libre a Ahorro`, deltas: { savings: diffPct } },
        });
        actionSteps.push(`Dirige automáticamente los ${formatMoney(diffAmount)} libres a tu meta de ahorro.`);
      }
    }

    if (actionSteps.length < 3) {
      if (periodsToEmergency !== null && savingsAmount > 0) {
        actionSteps.push(
          `Con ${formatMoney(savingsAmount)} por periodo completarás tu fondo de emergencia (3x = ${formatMoney(emergencyTarget)}) en ${periodsToEmergency} ${state.period === "anual" ? "años" : "periodos"}.`
        );
      }
      actionSteps.push(`Revisa tus números el primer día de cada mes y compara lo planeado con lo real.`);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    const verdict =
      score >= 85
        ? "Estructura financiera sólida y equilibrada"
        : score >= 68
        ? "Buen punto de partida con margen de optimización"
        : "Necesita ajustes clave para proteger tu estabilidad";

    return {
      needs,
      wants,
      savings,
      totalPct,
      diffPct,
      diffAmount,
      savingsAmount,
      needsAmount,
      annualSavings,
      emergencyTarget,
      periodsToEmergency,
      score,
      verdict,
      strengths,
      improvements,
      actionSteps: actionSteps.slice(0, 4),
    };
  }

  function applySimulationAction(simAction) {
    if (!simAction) return;
    if (simAction.rebalance) {
      state.autoBalance = true;
      setCategoryPercent("needs", state.categories[0].percent);
      renderScene4(true);
      return;
    }
    if (simAction.deltas) {
      state.categories.forEach((c) => {
        if (typeof simAction.deltas[c.id] === "number") {
          c.percent = Math.max(0, Math.min(100, c.percent + simAction.deltas[c.id]));
        }
      });
      detectStrategyMatch();
      saveState();
      renderScene4(true);
    }
  }

  function renderScene4(animateScore = false) {
    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    const analysis = analyzeBudget();
    const r = 46;
    const circ = 2 * Math.PI * r;
    const targetOffset = circ * (1 - analysis.score / 100);
    const ringColor = analysis.score >= 80 ? "#0F766E" : analysis.score >= 60 ? "#D97706" : "#BE123C";

    const emergencyText =
      analysis.periodsToEmergency !== null
        ? `${analysis.periodsToEmergency} ${state.period === "anual" ? "años" : "periodos"}`
        : "Sin ahorro";

    const improveCardsHtml = analysis.improvements.length
      ? analysis.improvements
          .map((imp, idx) => {
            const badgeClass = imp.level === "alert" ? "tag-alert" : imp.level === "warn" ? "tag-warn" : "tag-ok";
            const simBtn = imp.simAction
              ? `<button type="button" class="btn-simulate" data-sim-idx="${idx}">${escapeHtml(imp.simAction.label)}</button>`
              : "";
            return `
              <div class="improve-item">
                <div class="improve-item-top">
                  <span class="tag-badge ${badgeClass}">${escapeHtml(imp.tag)}</span>
                </div>
                <div>${escapeHtml(imp.text)}</div>
                ${simBtn}
              </div>
            `;
          })
          .join("")
      : `<div class="improve-item"><span class="tag-badge tag-ok">Óptimo</span> Tu reparto actual no presenta alertas críticas. ¡Gran trabajo!</div>`;

    els.s4DiagnosisContent.innerHTML = `
      <div class="diagnosis-hero">
        <div class="score-ring-wrap">
          <svg class="score-ring-svg" viewBox="0 0 112 112" width="112" height="112">
            <circle cx="56" cy="56" r="${r}" fill="none" stroke="#efece4" stroke-width="10" />
            <circle
              id="score-ring-arc"
              class="score-ring-arc"
              cx="56"
              cy="56"
              r="${r}"
              fill="none"
              stroke="${ringColor}"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="${circ.toFixed(2)}"
              stroke-dashoffset="${animateScore ? circ.toFixed(2) : targetOffset.toFixed(2)}"
            />
          </svg>
          <div class="score-ring-center">
            <strong id="s4-score-num">${animateScore ? 0 : analysis.score}</strong>
            <span>/ 100</span>
          </div>
        </div>
        <div class="diagnosis-hero-copy">
          <h3>${escapeHtml(analysis.verdict)}</h3>
          <p>
            Con la estrategia <strong>${escapeHtml(strat.name)}</strong> sobre un ingreso ${PERIOD_FACTORS[state.period].label} de <strong>${formatMoney(state.income, true)}</strong>,
            estás protegiendo un ahorro anual proyectado de <strong>${formatMoney(analysis.annualSavings)}</strong>.
          </p>
        </div>
      </div>

      <div class="diagnosis-columns">
        <article class="diag-card">
          <h3>¿Por qué este presupuesto?</h3>
          <p style="margin:0; font-size:0.88rem; color:var(--ink-secondary);">${escapeHtml(strat.whySummary)}</p>
          <ul class="diag-list">
            ${strat.whyDetails.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
            ${analysis.strengths.map((s) => `<li><strong>Fortaleza:</strong> ${escapeHtml(s)}</li>`).join("")}
          </ul>
        </article>

        <article class="diag-card">
          <h3>Qué se puede mejorar</h3>
          ${improveCardsHtml}
        </article>
      </div>

      <div class="projection-strip">
        <div class="proj-cell">
          <span>Ahorro en 1 año</span>
          <strong>${formatMoney(analysis.annualSavings)}</strong>
        </div>
        <div class="proj-cell">
          <span>Meta fondo emergencia (3x)</span>
          <strong>${formatMoney(analysis.emergencyTarget)}</strong>
        </div>
        <div class="proj-cell">
          <span>Tiempo estimado</span>
          <strong>${emergencyText}</strong>
        </div>
      </div>
    `;

    if (animateScore) {
      requestAnimationFrame(() => {
        const arc = document.getElementById("score-ring-arc");
        const numEl = document.getElementById("s4-score-num");
        if (arc) arc.setAttribute("stroke-dashoffset", targetOffset.toFixed(2));
        if (numEl) animateValue(numEl, 0, analysis.score, 650);
      });
    }

    els.s4DiagnosisContent.querySelectorAll(".btn-simulate").forEach((btn) => {
      const idx = Number(btn.getAttribute("data-sim-idx"));
      const imp = analysis.improvements[idx];
      if (imp && imp.simAction) {
        btn.addEventListener("click", () => applySimulationAction(imp.simAction));
      }
    });
  }

  // =========================================================================
  // Escena 5: Documento Ejecutivo Imprimible
  // =========================================================================

  function buildDocumentMarkup() {
    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    const analysis = analyzeBudget();
    const perYear = PERIOD_FACTORS[state.period].perYear;
    const periodAdj = PERIOD_FACTORS[state.period].adjective;
    const today = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const ownerTitle = state.ownerName.trim()
      ? `Preparado para: <strong>${escapeHtml(state.ownerName.trim())}</strong>`
      : "Documento de planificación personal";

    const miniChartSvg = `
      <svg viewBox="0 0 220 220" width="180" height="180" style="transform: rotate(-90deg);" aria-label="Gráfico del presupuesto">
        <circle cx="110" cy="110" r="78" fill="none" stroke="#efece4" stroke-width="28" />
        ${buildDonutMarkup(78, 28, 110)}
      </svg>
    `;

    const tableRows = state.categories
      .map((cat) => {
        const amount = getCategoryAmount(cat);
        const annual = amount * perYear;
        const target = strat.targets ? `${strat.targets[cat.id]}%` : "Libre";
        return `
          <tr>
            <td><span class="doc-dot" style="background:${cat.color}"></span><strong>${escapeHtml(cat.name)}</strong></td>
            <td class="num">${cat.percent}%</td>
            <td class="num">${target}</td>
            <td class="num">${formatMoney(amount)}</td>
            <td class="num">${formatMoney(annual)}</td>
          </tr>
        `;
      })
      .join("");

    const itemizedCards = state.categories
      .map((cat) => {
        const itemsLi = cat.items.length
          ? cat.items
              .map(
                (i) =>
                  `<li><span>${escapeHtml(i.name || "Sin nombre")}</span><strong>${formatMoney(i.amount)}</strong></li>`
              )
              .join("")
          : `<li><span>Sin rubros detallados</span><span>—</span></li>`;
        return `
          <div class="doc-item-card">
            <h4><span class="doc-dot" style="background:${cat.color}"></span>${escapeHtml(cat.name)}</h4>
            <ul class="doc-item-list">${itemsLi}</ul>
          </div>
        `;
      })
      .join("");

    const improvementsList = analysis.improvements.length
      ? analysis.improvements
          .map((imp) => `<li><strong>${escapeHtml(imp.tag)}:</strong> ${escapeHtml(imp.text)}</li>`)
          .join("")
      : `<li><strong>Distribución óptima:</strong> No se detectan alertas críticas en tu estructura actual.</li>`;

    const strengthsList = analysis.strengths.map((s) => `<li>${escapeHtml(s)}</li>`).join("");

    return `
      <header class="doc-header">
        <div>
          <span class="doc-brand">BudgetFlow · Informe Personal</span>
          <h1 class="doc-title">Plan de Presupuesto Personal</h1>
          <p class="doc-subtitle">${ownerTitle} · Estrategia: <strong>${escapeHtml(strat.name)}</strong></p>
        </div>
        <div class="doc-meta-box">
          <span>Fecha: ${escapeHtml(today)}</span>
          <strong>Ingreso ${escapeHtml(periodAdj)}: ${formatMoney(state.income, true)}</strong>
          <span>Salud financiera: <strong>${analysis.score} / 100</strong></span>
        </div>
      </header>

      <section class="doc-summary-grid">
        <div class="doc-chart-box">
          ${miniChartSvg}
          <span style="font-size:0.76rem; color:#5c626e;">Asignación total: <strong>${analysis.totalPct}%</strong></span>
        </div>

        <div>
          <table class="doc-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th class="num">% Real</th>
                <th class="num">Ref.</th>
                <th class="num">Monto ${escapeHtml(periodAdj)}</th>
                <th class="num">Proyección Anual</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
            <tfoot>
              <tr>
                <td>Total asignado</td>
                <td class="num">${analysis.totalPct}%</td>
                <td class="num">100%</td>
                <td class="num">${formatMoney(Math.round((state.income * analysis.totalPct) / 100))}</td>
                <td class="num">${formatMoney(Math.round((state.income * analysis.totalPct) / 100) * perYear)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="doc-section">
        <h2 class="doc-section-title">1. ¿Por qué este tipo de presupuesto?</h2>
        <div class="doc-prose">
          <p><strong>Fundamento (${escapeHtml(strat.name)}):</strong> ${escapeHtml(strat.whySummary)}</p>
          <ul>${strat.whyDetails.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
          <p><strong>Aplicación a tu caso:</strong> ${escapeHtml(strat.bestFor)} Con tu ingreso (${formatMoney(state.income, true)} ${PERIOD_FACTORS[state.period].label}), esta estructura proyecta <strong>${formatMoney(analysis.annualSavings)}</strong> de ahorro en 12 meses.</p>
        </div>
      </section>

      <section class="doc-section">
        <h2 class="doc-section-title">2. Desglose de rubros contemplados</h2>
        <div class="doc-items-grid">${itemizedCards}</div>
      </section>

      <section class="doc-section">
        <h2 class="doc-section-title">3. Diagnóstico y qué se puede mejorar</h2>
        <div class="doc-prose">
          ${strengthsList ? `<p><strong>Fortalezas actuales:</strong></p><ul>${strengthsList}</ul>` : ""}
          <p><strong>Oportunidades de mejora:</strong></p>
          <ul>${improvementsList}</ul>
        </div>

        <div class="doc-action-box">
          <h4>Plan de acción sugerido</h4>
          <ol>${analysis.actionSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </div>
      </section>

      <footer class="doc-footer">
        <span>Generado con BudgetFlow · Presupuesto personal paso a paso</span>
        <span>Revisión sugerida: inicio de cada mes</span>
      </footer>
    `;
  }

  function renderScene5() {
    if (document.activeElement !== els.reportOwnerInput) {
      els.reportOwnerInput.value = state.ownerName;
    }
    const markup = buildDocumentMarkup();
    els.docPreviewFrame.innerHTML = markup;
    els.printableDocument.innerHTML = markup;
  }

  // =========================================================================
  // Render General & Eventos
  // =========================================================================

  function renderCurrentScene(animate = false) {
    if (state.currentStep === 1) renderScene1();
    if (state.currentStep === 2) renderScene2();
    if (state.currentStep === 3) renderScene3();
    if (state.currentStep === 4) renderScene4(animate);
    if (state.currentStep === 5) renderScene5();
  }

  function bindEvents() {
    // Stepper clicks
    els.stepper.querySelectorAll(".step-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.getAttribute("data-step"));
        if (target <= state.unlockedStep) {
          goToStep(target);
        }
      });
    });

    els.btnHomeBrand.addEventListener("click", () => goToStep(1));

    document.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(Number(btn.getAttribute("data-goto"))));
    });

    // Escena 1
    els.incomeInput.addEventListener("input", (e) => {
      state.income = Math.max(0, Number(e.target.value) || 0);
      saveState();
      renderScene1();
    });

    document.querySelectorAll(".pill-choice[data-income]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.income = Number(btn.getAttribute("data-income"));
        els.incomeInput.value = state.income;
        saveState();
        renderScene1();
      });
    });

    els.periodSelect.addEventListener("change", (e) => {
      state.period = e.target.value;
      saveState();
      renderScene1();
    });

    els.currencySelect.addEventListener("change", (e) => {
      state.currency = e.target.value;
      saveState();
      renderScene1();
    });

    els.btnS1Next.addEventListener("click", () => {
      if (state.income <= 0) {
        els.incomeInput.focus();
        els.s1Callout.innerHTML = `<strong style="color:#be123c;">Ingresa un monto mayor a cero</strong> para continuar al siguiente paso.`;
        return;
      }
      unlockAndGo(2);
    });

    // Escena 2
    els.btnS2Next.addEventListener("click", () => {
      mountMinimalSliders();
      unlockAndGo(3);
    });

    // Escena 3
    els.autobalanceCheckbox.addEventListener("change", (e) => {
      state.autoBalance = e.target.checked;
      if (state.autoBalance && getTotalPercent() !== 100) {
        setCategoryPercent(state.categories[0].id, state.categories[0].percent);
        return;
      }
      saveState();
      renderScene3();
    });

    els.btnS3Next.addEventListener("click", () => unlockAndGo(4));

    // Escena 4
    els.btnS4Next.addEventListener("click", () => unlockAndGo(5));

    // Escena 5
    els.reportOwnerInput.addEventListener("input", (e) => {
      state.ownerName = e.target.value;
      saveState();
      renderScene5();
    });

    els.btnPrintNow.addEventListener("click", () => {
      renderScene5();
      window.print();
    });

    // Reset
    els.btnReset.addEventListener("click", () => {
      state = cloneDefaults();
      focusedCategoryId = null;
      saveState();
      mountChart();
      mountMinimalSliders();
      goToStep(1, "backward");
    });
  }

  bindEvents();
  renderStepper();
  mountChart();
  mountMinimalSliders();
  goToStep(state.currentStep, "forward", true);
})();
