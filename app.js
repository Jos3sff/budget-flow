(() => {
  "use strict";

  const STORAGE_KEY = "budgetflow_state_v1";

  const CURRENCIES = {
    USD: { symbol: "$", code: "USD", decimals: 0 },
    EUR: { symbol: "€", code: "EUR", decimals: 0 },
    MXN: { symbol: "$", code: "MXN", decimals: 0 },
    COP: { symbol: "$", code: "COP", decimals: 0 },
    ARS: { symbol: "$", code: "ARS", decimals: 0 },
    CLP: { symbol: "$", code: "CLP", decimals: 0 },
    PEN: { symbol: "S/", code: "PEN", decimals: 0 },
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
      tagline: "Equilibrio clásico",
      targets: { needs: 50, wants: 30, savings: 20 },
      whySummary:
        "Popularizada por la profesora de finanzas Elizabeth Warren, la regla 50/30/20 divide tu ingreso neto en tres grandes bloques fáciles de sostener a largo plazo sin necesidad de rastrear cada centavo.",
      whyDetails: [
        "El 50% cubre tu base vital (vivienda, comida, servicios y transporte) para mantener tus compromisos fijos bajo control.",
        "El 30% protege tu calidad de vida (ocio, salidas, hobbies), evitando el agotamiento financiero que hace fracasar a los presupuestos demasiado estrictos.",
        "El 20% se aparta primero para tu futuro: fondo de emergencia, retiro, inversiones o pago acelerado de deudas.",
      ],
      bestFor: "Personas con ingresos estables que buscan un balance sano entre disfrutar el presente y construir patrimonio.",
    },
    "70-20-10": {
      id: "70-20-10",
      name: "Regla 70 / 20 / 10",
      tagline: "Estabilidad & reducción de deudas",
      targets: { needs: 70, wants: 20, savings: 10 },
      whySummary:
        "Diseñada para etapas donde el costo de vida esencial es alto (ciudades costosas, familia o deudas activas) y necesitas margen realista para cubrir lo básico sin caer en atrasos.",
      whyDetails: [
        "El 70% reconoce que tus gastos esenciales o compromisos mínimos ocupan la mayor parte del ingreso actual.",
        "El 20% conserva un espacio moderado para bienestar y gastos personales sin culpa.",
        "El 10% garantiza que, incluso en meses ajustados, el hábito del ahorro o amortización de deuda nunca se detenga.",
      ],
      bestFor: "Quienes viven en zonas de renta elevada, están saliendo de deudas o inician su carrera profesional.",
    },
    "60-20-20": {
      id: "60-20-20",
      name: "Regla 60 / 20 / 20",
      tagline: "Fijos controlados y ahorro sólido",
      targets: { needs: 60, wants: 20, savings: 20 },
      whySummary:
        "Un punto intermedio muy práctico cuando tus gastos básicos superan el 50%, pero no quieres sacrificar la meta recomendada de ahorrar al menos el 20% de tus ingresos.",
      whyDetails: [
        "Amplía el margen de necesidades al 60% para absorber vivienda y alimentación sin presión excesiva.",
        "Limita los deseos al 20%, priorizando solo lo que realmente aporta valor a tu semana.",
        "Mantiene intacto el 20% de ahorro e inversión, preservando tu velocidad de crecimiento financiero.",
      ],
      bestFor: "Hogares con costos fijos moderados-altos que desean mantener una tasa de ahorro disciplinada del 20%.",
    },
    "zero-based": {
      id: "zero-based",
      name: "Plan 45 / 25 / 30 (Ahorro Acelerado)",
      tagline: "Crecimiento patrimonial rápido",
      targets: { needs: 45, wants: 25, savings: 30 },
      whySummary:
        "Este esquema prioriza la libertad financiera temprana comprimiendo los gastos fijos por debajo del 45% para liberar casi un tercio del ingreso hacia inversión, metas grandes o independencia.",
      whyDetails: [
        "Mantener necesidades bajo el 45% te vuelve resiliente ante imprevistos o cambios laborales.",
        "El 25% permite disfrutar con intención, evitando compras impulsivas.",
        "Destinar el 30% a ahorro e inversión acelera drásticamente metas como comprar vivienda, emprender o invertir.",
      ],
      bestFor: "Personas con margen de ahorro alto que desean construir un fondo sólido o acelerar inversiones.",
    },
    custom: {
      id: "custom",
      name: "Distribución Personalizada",
      tagline: "Adaptada a tu realidad",
      targets: null,
      whySummary:
        "Un presupuesto personalizado adapta los porcentajes a tu contexto específico (metas a corto plazo, ingresos variables o proyectos puntuales) en lugar de forzar una fórmula genérica.",
      whyDetails: [
        "Te permite asignar exactamente cuánto necesitas en cada bloque según tus compromisos reales de este periodo.",
        "Sirve como punto de partida honesto: primero ves dónde estás hoy y luego decides qué porcentaje mover gradualmente.",
      ],
      bestFor: "Ingresos variables, metas puntuales (viaje, estudios, negocio) o ajustes finos mes a mes.",
    },
  };

  const DEFAULT_CATEGORIES = [
    {
      id: "needs",
      name: "Necesidades esenciales",
      description: "Vivienda, alimentación básica, servicios, salud y transporte indispensable.",
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
      description: "Restaurantes, entretenimiento, suscripciones, viajes y compras opcionales.",
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
      description: "Fondo de emergencia, inversión a largo plazo, retiro o abono extra a deudas.",
      color: "#2563EB",
      percent: 20,
      expanded: false,
      items: [
        { id: "s1", name: "Fondo de emergencia", amount: 240 },
        { id: "s2", name: "Inversión / Metas", amount: 240 },
      ],
    },
  ];

  // Estado principal
  let state = loadState();
  let focusedCategoryId = null;

  // Referencias DOM
  const els = {
    incomeInput: document.getElementById("income-input"),
    currencyPrefix: document.getElementById("currency-prefix"),
    currencySelect: document.getElementById("currency-select"),
    periodSelect: document.getElementById("period-select"),
    strategyPills: document.getElementById("strategy-pills"),
    donutSegments: document.getElementById("donut-segments"),
    chartCenterReadout: document.getElementById("chart-center-readout"),
    centerLabel: document.getElementById("center-label"),
    centerAmount: document.getElementById("center-amount"),
    centerStatus: document.getElementById("center-status"),
    centerSubnote: document.getElementById("center-subnote"),
    chartTooltip: document.getElementById("chart-tooltip"),
    chartLegend: document.getElementById("chart-legend"),
    autobalanceCheckbox: document.getElementById("autobalance-checkbox"),
    categoriesStack: document.getElementById("categories-stack"),
    liveWhyContent: document.getElementById("live-why-content"),
    liveImproveContent: document.getElementById("live-improve-content"),
    healthScoreBadge: document.getElementById("health-score-badge"),
    scoreNumber: document.getElementById("score-number"),
    projectionBanner: document.getElementById("projection-banner"),
    btnReset: document.getElementById("btn-reset"),
    btnOpenReport: document.getElementById("btn-open-report"),
    btnPreviewReport: document.getElementById("btn-preview-report"),
    btnDirectPrint: document.getElementById("btn-direct-print"),
    reportModal: document.getElementById("report-modal"),
    btnCloseReport: document.getElementById("btn-close-report"),
    btnModalPrint: document.getElementById("btn-modal-print"),
    reportOwnerInput: document.getElementById("report-owner-input"),
    printableDocument: document.getElementById("printable-document"),
  };

  function cloneDefaults() {
    return {
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
      return {
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

  // =========================================================================
  // Lógica de Auto-Balanceo al 100%
  // =========================================================================

  function setCategoryPercent(catId, newPercent) {
    const clamped = Math.max(0, Math.min(100, Math.round(newPercent)));
    const targetCat = state.categories.find((c) => c.id === catId);
    if (!targetCat) return;

    if (!state.autoBalance) {
      targetCat.percent = clamped;
      detectStrategyMatch();
      saveState();
      renderAll();
      return;
    }

    const others = state.categories.filter((c) => c.id !== catId);
    const remaining = 100 - clamped;
    const othersCurrentSum = others.reduce((sum, c) => sum + c.percent, 0);

    targetCat.percent = clamped;

    if (othersCurrentSum === 0) {
      // Repartir equitativamente el restante
      const base = Math.floor(remaining / others.length);
      let rem = remaining - base * others.length;
      others.forEach((c) => {
        c.percent = base + (rem > 0 ? 1 : 0);
        if (rem > 0) rem--;
      });
    } else {
      // Repartir proporcionalmente manteniendo la suma exacta en 100
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
    renderAll();
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
    renderAll();
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

  // =========================================================================
  // Motor de Diagnóstico Financiero ("Por qué" & "Qué se puede mejorar")
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
    const annualIncome = state.income * perYear;

    // Meses para juntar 3 meses de necesidades esenciales
    const emergencyTarget = needsAmount * 3;
    const periodsToEmergency = savingsAmount > 0 ? Math.ceil(emergencyTarget / savingsAmount) : null;

    // Puntuación 0-100
    let score = 78;
    const strengths = [];
    const improvements = [];
    const actionSteps = [];

    if (state.income <= 0) {
      score = 0;
      improvements.push({
        level: "alert",
        tag: "Ingreso en cero",
        text: "Introduce tu ingreso neto para calcular montos reales y recomendaciones precisas.",
      });
    } else {
      // Evaluación de ahorro
      if (savings >= 25) {
        score += 18;
        strengths.push(
          `Excelente tasa de ahorro (${savings}%). Acumularás ${formatMoney(annualSavings)} al año.`
        );
      } else if (savings >= 20) {
        score += 12;
        strengths.push(
          `Cumples con el estándar saludable del ${savings}% de ahorro (${formatMoney(annualSavings)} al año).`
        );
      } else if (savings >= 10) {
        score += 2;
        improvements.push({
          level: "warn",
          tag: "Ahorro moderado",
          text: `Tu ahorro es del ${savings}%. Subirlo al menos al 20% (${formatMoney(state.income * 0.2)} por periodo) aceleraría tu estabilidad.`,
        });
        actionSteps.push(
          `Programa una transferencia automática del ${savings}% nada más recibir tu ingreso y busca elevarla 2% cada trimestre hasta llegar al 20%.`
        );
      } else {
        score -= 22;
        improvements.push({
          level: "alert",
          tag: "Ahorro crítico",
          text: `Destinas solo ${savings}% al ahorro. Sin un colchón mínimo, cualquier imprevisto te obligará a endeudarte.`,
        });
        actionSteps.push(
          `Recorta al menos un 5% de gastos opcionales (${formatMoney(state.income * 0.05)}) para iniciar un fondo de emergencia intocable.`
        );
      }

      // Evaluación de necesidades
      if (needs <= 50) {
        score += 6;
        strengths.push(
          `Tus gastos esenciales (${needs}%) están por debajo del límite recomendado del 50%, dándote gran flexibilidad.`
        );
      } else if (needs <= 65) {
        improvements.push({
          level: "warn",
          tag: "Fijos moderados-altos",
          text: `Tus necesidades ocupan el ${needs}%. Revisa si vivienda, planes telefónicos o transporte pueden optimizarse un 5%.`,
        });
        actionSteps.push(
          `Audita tus 3 gastos fijos más altos (renta, servicios, alimentación) para recuperar ${formatMoney(state.income * 0.05)} hacia tus metas.`
        );
      } else {
        score -= 16;
        improvements.push({
          level: "alert",
          tag: "Sobrecarga fija",
          text: `El ${needs}% en necesidades deja poco oxígeno ante emergencias o inflación.`,
        });
        actionSteps.push(
          `Evita adquirir nuevos pagos fijos o cuotas hasta bajar tus necesidades esenciales por debajo del 60%.`
        );
      }

      // Evaluación de deseos
      if (wants > 35) {
        score -= 12;
        improvements.push({
          level: "warn",
          tag: "Estilo de vida elevado",
          text: `Tus deseos representan el ${wants}% (${formatMoney((state.income * wants) / 100)}). Reducir 5 puntos en ocio o suscripciones mejoraría tu flujo de ahorro.`,
        });
        actionSteps.push(
          `Revisa suscripciones recurrentes y fija un tope semanal en efectivo o tarjeta prepaga para salidas.`
        );
      } else if (wants >= 15 && wants <= 30) {
        strengths.push(
          `Asignación equilibrada en estilo de vida (${wants}%), suficiente para disfrutar sin desbalancear tu futuro.`
        );
      } else if (wants < 10) {
        improvements.push({
          level: "warn",
          tag: "Margen muy estricto",
          text: `Un ${wants}% en ocio puede volverse difícil de sostener varios meses seguidos. Permite un pequeño margen de disfrute realista.`,
        });
      }

      // Evaluación de balance total (cuando auto-balance está desactivado)
      if (diffPct < 0) {
        score -= 20;
        improvements.push({
          level: "alert",
          tag: "Déficit proyectado",
          text: `Estás asignando ${totalPct}% del ingreso (exceso de ${formatMoney(Math.abs(diffAmount))}). Este presupuesto genera deuda si no ajustas.`,
        });
        actionSteps.unshift(
          `Elimina ${formatMoney(Math.abs(diffAmount))} de tus categorías hoy mismo para regresar al 100% de tu ingreso real.`
        );
      } else if (diffPct > 0) {
        score -= 4;
        improvements.push({
          level: "warn",
          tag: "Dinero sin asignar",
          text: `Tienes un ${diffPct}% (${formatMoney(diffAmount)}) libre sin destino. El dinero sin etiqueta suele gastarse por impulso.`,
        });
        actionSteps.push(
          `Asigna ese ${diffPct}% sobrante (${formatMoney(diffAmount)}) directamente a ahorro o inversión para completar el 100%.`
        );
      }
    }

    // Asegurar al menos 3 pasos concretos
    if (actionSteps.length < 3) {
      if (periodsToEmergency !== null && savingsAmount > 0) {
        actionSteps.push(
          `Mantén este ritmo de ${formatMoney(savingsAmount)} por periodo para completar un fondo de emergencia de 3 meses de gastos esenciales (${formatMoney(emergencyTarget)}) en aproximadamente ${periodsToEmergency} ${state.period === "anual" ? "años" : "periodos"}.`
        );
      }
      actionSteps.push(
        `Revisa este presupuesto el primer día de cada mes y compara tus gastos reales frente a los porcentajes objetivo.`
      );
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

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
      annualIncome,
      emergencyTarget,
      periodsToEmergency,
      score,
      strengths,
      improvements,
      actionSteps: actionSteps.slice(0, 4),
    };
  }

  // =========================================================================
  // Renderizado del Gráfico SVG Céntrico (actualización en sitio para animar)
  // =========================================================================

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
    renderLegend();
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
        ? "Clic en el segmento para volver al total"
        : "Haz clic para enfocar esta categoría";
      return;
    }

    const totalPct = getTotalPercent();
    const diffPct = 100 - totalPct;
    const diffAmount = Math.round((state.income * diffPct) / 100);
    const periodLabel = PERIOD_FACTORS[state.period].label;

    els.centerLabel.textContent = `Ingreso ${periodLabel}`;
    els.centerAmount.textContent = formatMoney(state.income);

    if (diffPct === 0) {
      els.centerStatus.textContent = "100% asignado";
      els.centerStatus.className = "center-status status-balanced";
      els.centerSubnote.textContent = "Distribución equilibrada";
    } else if (diffPct > 0) {
      els.centerStatus.textContent = `Te sobran ${formatMoney(diffAmount)} (${diffPct}%)`;
      els.centerStatus.className = "center-status status-surplus";
      els.centerSubnote.textContent = `Asignado: ${totalPct}% de tu ingreso`;
    } else {
      els.centerStatus.textContent = `Excedes por ${formatMoney(Math.abs(diffAmount))}`;
      els.centerStatus.className = "center-status status-deficit";
      els.centerSubnote.textContent = `Total asignado: ${totalPct}% (sobre 100%)`;
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
    updateCategoriesInPlace();
    if (focusedCategoryId) {
      const card = document.querySelector(`.category-card[data-cat-id="${focusedCategoryId}"]`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  function renderLegend() {
    els.chartLegend.innerHTML = state.categories
      .map((cat) => {
        const amount = getCategoryAmount(cat);
        const focusedClass = focusedCategoryId === cat.id ? "is-focused" : "";
        return `
          <button type="button" class="legend-pill ${focusedClass}" data-cat-id="${cat.id}">
            <span class="legend-dot" style="background:${cat.color}"></span>
            <span class="legend-name">${escapeHtml(cat.name)}</span>
            <span class="legend-values">${cat.percent}% · ${formatMoney(amount)}</span>
          </button>
        `;
      })
      .join("");

    els.chartLegend.querySelectorAll(".legend-pill").forEach((pill) => {
      pill.addEventListener("click", () => toggleFocusCategory(pill.getAttribute("data-cat-id")));
    });
  }

  // =========================================================================
  // Renderizado de Controles de Categorías (mantiene foco y drag en sliders)
  // =========================================================================

  function mountCategories() {
    const curSymbol = (CURRENCIES[state.currency] || CURRENCIES.USD).symbol;

    els.categoriesStack.innerHTML = state.categories
      .map((cat) => {
        const amount = getCategoryAmount(cat);
        const itemsSum = cat.items.reduce((s, item) => s + (Number(item.amount) || 0), 0);
        const focusedClass = focusedCategoryId === cat.id ? "is-focused" : "";

        const itemsHtml = cat.items
          .map(
            (item) => `
            <div class="item-row" data-item-id="${item.id}">
              <input
                type="text"
                class="item-name-input"
                value="${escapeHtml(item.name)}"
                placeholder="Concepto del gasto"
                aria-label="Concepto de ${escapeHtml(cat.name)}"
              />
              <input
                type="number"
                class="item-amount-input"
                min="0"
                step="10"
                value="${Math.round(Number(item.amount) || 0)}"
                aria-label="Monto de ${escapeHtml(item.name)}"
              />
              <button type="button" class="item-remove-btn" title="Eliminar rubro" aria-label="Eliminar rubro">&times;</button>
            </div>
          `
          )
          .join("");

        return `
          <div class="category-card ${focusedClass}" data-cat-id="${cat.id}" style="--cat-color:${cat.color}">
            <div class="category-card-top">
              <div class="category-identity">
                <span class="category-swatch" aria-hidden="true"></span>
                <div>
                  <h3 class="category-title">${escapeHtml(cat.name)}</h3>
                  <p class="category-desc">${escapeHtml(cat.description)}</p>
                </div>
              </div>

              <div class="category-numbers">
                <div class="amount-input-box">
                  <span class="amount-input-prefix">${curSymbol}</span>
                  <input
                    type="number"
                    class="cat-amount-input"
                    min="0"
                    step="10"
                    value="${amount}"
                    aria-label="Monto para ${escapeHtml(cat.name)}"
                  />
                </div>
                <span class="cat-percent-pill">${cat.percent}%</span>
              </div>
            </div>

            <div class="category-slider-row">
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

            <div class="category-items-bar">
              <button type="button" class="toggle-items-btn" aria-expanded="${cat.expanded ? "true" : "false"}">
                <span>${cat.expanded ? "▾ Ocultar desglose de rubros" : "▸ Detallar rubros reales"} (${cat.items.length})</span>
              </button>
              <span class="items-summary-hint">Suma detallada: <strong>${formatMoney(itemsSum)}</strong></span>
            </div>

            <div class="items-panel" ${cat.expanded ? "" : "hidden"}>
              ${itemsHtml}
              <div class="items-footer-actions">
                <button type="button" class="btn-mini btn-add-item">+ Añadir gasto</button>
                <button type="button" class="btn-mini btn-mini-accent btn-apply-items">
                  Aplicar suma (${formatMoney(itemsSum)}) a esta categoría
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    els.categoriesStack.querySelectorAll(".category-card").forEach((card) => {
      const catId = card.getAttribute("data-cat-id");
      const cat = state.categories.find((c) => c.id === catId);
      if (!cat) return;

      const slider = card.querySelector(".cat-slider");
      const amountInput = card.querySelector(".cat-amount-input");
      const toggleItemsBtn = card.querySelector(".toggle-items-btn");
      const addItemBtn = card.querySelector(".btn-add-item");
      const applyItemsBtn = card.querySelector(".btn-apply-items");

      slider.addEventListener("input", (e) => {
        setCategoryPercent(catId, Number(e.target.value));
      });

      amountInput.addEventListener("change", (e) => {
        const val = Math.max(0, Number(e.target.value) || 0);
        if (state.income > 0) {
          const pct = Math.round((val / state.income) * 100);
          setCategoryPercent(catId, pct);
        }
      });

      toggleItemsBtn.addEventListener("click", () => {
        cat.expanded = !cat.expanded;
        saveState();
        mountCategories();
      });

      addItemBtn.addEventListener("click", () => {
        cat.items.push({
          id: "i_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          name: "Nuevo gasto",
          amount: 0,
        });
        cat.expanded = true;
        saveState();
        mountCategories();
      });

      applyItemsBtn.addEventListener("click", () => {
        const sum = cat.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
        if (state.income > 0) {
          const pct = Math.round((sum / state.income) * 100);
          setCategoryPercent(catId, pct);
        }
      });

      card.querySelectorAll(".item-row").forEach((row) => {
        const itemId = row.getAttribute("data-item-id");
        const item = cat.items.find((i) => i.id === itemId);
        if (!item) return;

        row.querySelector(".item-name-input").addEventListener("input", (e) => {
          item.name = e.target.value;
          saveState();
        });

        row.querySelector(".item-amount-input").addEventListener("input", (e) => {
          item.amount = Math.max(0, Number(e.target.value) || 0);
          saveState();
          const newSum = cat.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
          card.querySelector(".items-summary-hint strong").textContent = formatMoney(newSum);
          card.querySelector(".btn-apply-items").textContent = `Aplicar suma (${formatMoney(newSum)}) a esta categoría`;
        });

        row.querySelector(".item-remove-btn").addEventListener("click", () => {
          cat.items = cat.items.filter((i) => i.id !== itemId);
          saveState();
          mountCategories();
        });
      });
    });
  }

  function updateCategoriesInPlace() {
    if (!els.categoriesStack.querySelector(".category-card")) {
      mountCategories();
      return;
    }

    const curSymbol = (CURRENCIES[state.currency] || CURRENCIES.USD).symbol;

    state.categories.forEach((cat) => {
      const card = els.categoriesStack.querySelector(`.category-card[data-cat-id="${cat.id}"]`);
      if (!card) return;

      card.classList.toggle("is-focused", focusedCategoryId === cat.id);

      const amount = getCategoryAmount(cat);
      const itemsSum = cat.items.reduce((s, item) => s + (Number(item.amount) || 0), 0);

      card.querySelector(".amount-input-prefix").textContent = curSymbol;

      const amountInput = card.querySelector(".cat-amount-input");
      if (document.activeElement !== amountInput) {
        amountInput.value = amount;
      }

      card.querySelector(".cat-percent-pill").textContent = `${cat.percent}%`;

      const slider = card.querySelector(".cat-slider");
      slider.value = cat.percent;
      slider.style.setProperty("--slider-pct", `${cat.percent}%`);

      card.querySelector(".items-summary-hint strong").textContent = formatMoney(itemsSum);
      card.querySelector(".btn-apply-items").textContent = `Aplicar suma (${formatMoney(itemsSum)}) a esta categoría`;
    });
  }

  function renderCategories() {
    updateCategoriesInPlace();
  }

  // =========================================================================
  // Renderizado de Insights ("El Porqué" & "Qué Mejorar" & Proyección)
  // =========================================================================

  function renderInsights() {
    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    const analysis = analyzeBudget();

    // El porqué
    els.liveWhyContent.innerHTML = `
      <p><strong>${escapeHtml(strat.name)}:</strong> ${escapeHtml(strat.whySummary)}</p>
      <ul class="insight-list">
        ${strat.whyDetails.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
      </ul>
      <p><strong>Ideal para:</strong> ${escapeHtml(strat.bestFor)}</p>
    `;

    // Score badge
    els.scoreNumber.textContent = analysis.score;
    els.healthScoreBadge.className = "health-score-badge";
    if (analysis.score < 60) {
      els.healthScoreBadge.classList.add("score-low");
    } else if (analysis.score < 80) {
      els.healthScoreBadge.classList.add("score-medium");
    }

    // Qué mejorar + fortalezas
    const improvItems = analysis.improvements
      .map((imp) => {
        const tagClass =
          imp.level === "alert" ? "tag-alert" : imp.level === "warn" ? "tag-warn" : "tag-ok";
        return `<li><span class="diagnosis-tag ${tagClass}">${escapeHtml(imp.tag)}</span>${escapeHtml(imp.text)}</li>`;
      })
      .join("");

    const strengthItems = analysis.strengths
      .map((st) => `<li><span class="diagnosis-tag tag-ok">Fortaleza</span>${escapeHtml(st)}</li>`)
      .join("");

    els.liveImproveContent.innerHTML = `
      <ul class="insight-list">
        ${improvItems}
        ${strengthItems}
      </ul>
      <p><strong>Siguiente paso recomendado:</strong> ${escapeHtml(analysis.actionSteps[0] || "")}</p>
    `;

    // Banner de proyección anual
    const emergencyText =
      analysis.periodsToEmergency !== null
        ? `${analysis.periodsToEmergency} ${state.period === "anual" ? "años" : "periodos"}`
        : "Sin ahorro activo";

    els.projectionBanner.innerHTML = `
      <div class="proj-metric">
        <span class="proj-label">Ahorro acumulado en 1 año</span>
        <strong class="proj-value">${formatMoney(analysis.annualSavings)}</strong>
        <span class="proj-note">Al ${analysis.savings}% de ${formatMoney(state.income)} ${PERIOD_FACTORS[state.period].label}</span>
      </div>
      <div class="proj-metric">
        <span class="proj-label">Meta fondo emergencia (3x)</span>
        <strong class="proj-value">${formatMoney(analysis.emergencyTarget)}</strong>
        <span class="proj-note">Cubre 3 periodos de gastos esenciales</span>
      </div>
      <div class="proj-metric">
        <span class="proj-label">Tiempo para lograr tu fondo</span>
        <strong class="proj-value">${emergencyText}</strong>
        <span class="proj-note">Con tu ritmo actual de ahorro</span>
      </div>
    `;
  }

  // =========================================================================
  // Documento Formal Imprimible ("Imprimir / Guardar PDF")
  // =========================================================================

  function buildPrintableDocument() {
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
      <svg viewBox="0 0 220 220" width="190" height="190" style="transform: rotate(-90deg);" aria-label="Gráfico de distribución del presupuesto">
        <circle cx="110" cy="110" r="78" fill="none" stroke="#efece4" stroke-width="28" />
        ${buildDonutMarkup(78, 28, 110, true)}
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

    els.printableDocument.innerHTML = `
      <header class="doc-header">
        <div>
          <span class="doc-brand">BudgetFlow · Informe Personal</span>
          <h1 class="doc-title">Plan de Presupuesto Personal</h1>
          <p class="doc-subtitle">${ownerTitle} · Estrategia: <strong>${escapeHtml(strat.name)}</strong></p>
        </div>
        <div class="doc-meta-box">
          <span>Fecha: ${escapeHtml(today)}</span>
          <strong>Ingreso ${escapeHtml(periodAdj)}: ${formatMoney(state.income, true)}</strong>
          <span>Índice de salud financiera: <strong>${analysis.score} / 100</strong></span>
        </div>
      </header>

      <section class="doc-summary-grid">
        <div class="doc-chart-box">
          ${miniChartSvg}
          <span style="font-size:0.78rem; color:#5c626e;">Asignación total: <strong>${analysis.totalPct}%</strong></span>
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
            <tbody>
              ${tableRows}
            </tbody>
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
          <p><strong>Fundamento de la estrategia (${escapeHtml(strat.name)}):</strong> ${escapeHtml(strat.whySummary)}</p>
          <ul>
            ${strat.whyDetails.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
          </ul>
          <p><strong>Por qué funciona para tu caso:</strong> ${escapeHtml(strat.bestFor)} Con tu nivel de ingreso (${formatMoney(state.income, true)} ${PERIOD_FACTORS[state.period].label}), mantener claras estas proporciones evita que los gastos cotidianos absorban tu capacidad de ahorro anual (${formatMoney(analysis.annualSavings)} proyectados en 12 meses).</p>
        </div>
      </section>

      <section class="doc-section">
        <h2 class="doc-section-title">2. Desglose de rubros contemplados</h2>
        <div class="doc-items-grid">
          ${itemizedCards}
        </div>
      </section>

      <section class="doc-section">
        <h2 class="doc-section-title">3. Diagnóstico y qué se puede mejorar</h2>
        <div class="doc-prose">
          ${
            strengthsList
              ? `<p><strong>Puntos fuertes actuales:</strong></p><ul>${strengthsList}</ul>`
              : ""
          }
          <p><strong>Oportunidades de mejora detectadas:</strong></p>
          <ul>${improvementsList}</ul>
        </div>

        <div class="doc-action-box">
          <h4>Plan de acción sugerido para este periodo</h4>
          <ol>
            ${analysis.actionSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </div>
      </section>

      <footer class="doc-footer">
        <span>Generado con BudgetFlow · Herramienta de presupuesto personal</span>
        <span>Revisión sugerida: inicio de cada mes</span>
      </footer>
    `;
  }

  function openReportModal() {
    buildPrintableDocument();
    els.reportOwnerInput.value = state.ownerName;
    els.reportModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeReportModal() {
    els.reportModal.hidden = true;
    document.body.style.overflow = "";
  }

  function triggerPrint() {
    buildPrintableDocument();
    els.reportModal.hidden = false;
    setTimeout(() => {
      window.print();
    }, 80);
  }

  // =========================================================================
  // Render Global & Eventos
  // =========================================================================

  function renderHeaderControls() {
    const cur = CURRENCIES[state.currency] || CURRENCIES.USD;
    els.currencyPrefix.textContent = cur.symbol;
    els.currencySelect.value = state.currency;
    els.periodSelect.value = state.period;
    els.autobalanceCheckbox.checked = state.autoBalance;

    if (document.activeElement !== els.incomeInput) {
      els.incomeInput.value = state.income;
    }

    els.strategyPills.querySelectorAll(".strategy-pill").forEach((pill) => {
      const active = pill.getAttribute("data-strategy") === state.strategy;
      pill.classList.toggle("active", active);
      pill.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function renderAll() {
    renderHeaderControls();
    renderChart();
    renderCategories();
    renderInsights();
  }

  function bindGlobalEvents() {
    els.incomeInput.addEventListener("input", (e) => {
      const val = Math.max(0, Number(e.target.value) || 0);
      state.income = val;
      saveState();
      renderChart();
      renderCategories();
      renderInsights();
    });

    document.querySelectorAll(".chip-btn[data-income]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.income = Number(btn.getAttribute("data-income"));
        els.incomeInput.value = state.income;
        saveState();
        renderAll();
      });
    });

    els.currencySelect.addEventListener("change", (e) => {
      state.currency = e.target.value;
      saveState();
      renderAll();
    });

    els.periodSelect.addEventListener("change", (e) => {
      state.period = e.target.value;
      saveState();
      renderAll();
    });

    els.autobalanceCheckbox.addEventListener("change", (e) => {
      state.autoBalance = e.target.checked;
      if (state.autoBalance && getTotalPercent() !== 100) {
        // Reajustar suavemente para sumar 100%
        const needsCat = state.categories[0];
        setCategoryPercent(needsCat.id, needsCat.percent);
        return;
      }
      saveState();
      renderAll();
    });

    els.strategyPills.querySelectorAll(".strategy-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        applyStrategy(pill.getAttribute("data-strategy"));
      });
    });

    els.btnReset.addEventListener("click", () => {
      state = cloneDefaults();
      focusedCategoryId = null;
      saveState();
      mountCategories();
      renderAll();
    });

    els.btnOpenReport.addEventListener("click", openReportModal);
    els.btnPreviewReport.addEventListener("click", openReportModal);
    els.btnDirectPrint.addEventListener("click", triggerPrint);
    els.btnCloseReport.addEventListener("click", closeReportModal);
    els.btnModalPrint.addEventListener("click", () => window.print());

    els.reportOwnerInput.addEventListener("input", (e) => {
      state.ownerName = e.target.value;
      saveState();
      buildPrintableDocument();
    });

    els.reportModal.addEventListener("click", (e) => {
      if (e.target === els.reportModal || e.target.classList.contains("printable-document-wrap")) {
        closeReportModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !els.reportModal.hidden) {
        closeReportModal();
      }
    });
  }

  bindGlobalEvents();
  renderAll();
})();
