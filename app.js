(() => {
  "use strict";

  const STORAGE_KEY = "budgetflow_experience_v3";

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
        "Divide tu ingreso en tres bloques fáciles de entender para cubrir tu casa y servicios, disfrutar tu presente y ahorrar sin estrés.",
      whyDetails: [
        "50% para casa, luz, agua, comida y transporte esencial.",
        "30% para salidas, gustos y entretenimiento sin culpa.",
        "20% apartado primero para emergencia, metas o inversión.",
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
        "Ideal cuando la renta y los servicios básicos ocupan algo más de la mitad de tu ingreso, pero quieres mantener intacto tu 20% de ahorro.",
      whyDetails: [
        "Amplía el margen de necesidades al 60% para vivienda, luz, agua y comida.",
        "Acota los deseos al 20%, priorizando lo que de verdad disfrutas.",
        "Protege el 20% completo para construir tu colchón financiero.",
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
        "Pensada para momentos donde tus compromisos básicos son altos o estás pagando deudas, permitiéndote respirar sin dejar de ahorrar.",
      whyDetails: [
        "70% reconoce tus obligaciones esenciales reales sin metas imposibles.",
        "20% conserva un espacio moderado para bienestar personal.",
        "10% asegura que cada periodo sigas sumando reserva.",
      ],
      bestFor: "Quienes inician carrera, tienen costos fijos altos o salen de deudas.",
    },
    "zero-based": {
      id: "zero-based",
      name: "Plan 45 / 25 / 30",
      short: "45 / 25 / 30",
      tagline: "Ahorro e inversión acelerados",
      targets: { needs: 45, wants: 25, savings: 30 },
      whySummary:
        "Mantiene tus gastos fijos por debajo del 45% para liberar casi un tercio de tu ingreso hacia metas grandes, inversión o libertad financiera.",
      whyDetails: [
        "Gastos fijos bajos (<45%) te dan mucha tranquilidad ante imprevistos.",
        "25% permite disfrutar con intención y sin culpas.",
        "30% de ahorro multiplica tu patrimonio año con año.",
      ],
      bestFor: "Quienes desean ahorrar rápido para vivienda, emprender o invertir.",
    },
    custom: {
      id: "custom",
      name: "Distribución a tu medida",
      short: "Libre",
      tagline: "Basada 100% en tus gastos",
      targets: null,
      whySummary:
        "Parte directamente de lo que pagas hoy en servicios, comida y gustos para armar un presupuesto realista paso a paso.",
      whyDetails: [
        "No te fuerza a una fórmula fija: refleja tu realidad exacta.",
        "Luego te muestra qué porcentaje ocupa cada bloque y cómo optimizarlo.",
      ],
      bestFor: "Ingresos variables, metas puntuales o ajustes finos mes a mes.",
    },
  };

  // Pesos base dentro de cada categoría (suman 1.0 por categoría)
  const DEFAULT_CATEGORIES = [
    {
      id: "needs",
      tabName: "Casa y Servicios",
      name: "Necesidades esenciales",
      description: "Vivienda, luz, agua, gas, internet, comida y transporte.",
      color: "#0E6B5E",
      percent: 50,
      items: [
        { id: "n_home", name: "Vivienda / Renta", icon: "home", weight: 0.56, amount: 680 },
        { id: "n_bolt", name: "Luz / Electricidad", icon: "bolt", weight: 0.05, amount: 55 },
        { id: "n_drop", name: "Agua", icon: "drop", weight: 0.02, amount: 25 },
        { id: "n_flame", name: "Gas / Calefacción", icon: "flame", weight: 0.025, amount: 30 },
        { id: "n_wifi", name: "Internet y telefonía", icon: "wifi", weight: 0.04, amount: 45 },
        { id: "n_cart", name: "Supermercado y comida", icon: "cart", weight: 0.205, amount: 245 },
        { id: "n_car", name: "Transporte / Gasolina", icon: "car", weight: 0.1, amount: 120 },
      ],
    },
    {
      id: "wants",
      tabName: "Gustos y Ocio",
      name: "Estilo de vida y deseos",
      description: "Salidas, suscripciones, hobbies y compras opcionales.",
      color: "#D94E2A",
      percent: 30,
      items: [
        { id: "w_food", name: "Salidas y restaurantes", icon: "utensils", weight: 0.5, amount: 360 },
        { id: "w_play", name: "Suscripciones y streaming", icon: "play", weight: 0.085, amount: 60 },
        { id: "w_bag", name: "Compras y gustos", icon: "bag", weight: 0.415, amount: 300 },
      ],
    },
    {
      id: "savings",
      tabName: "Ahorro y Metas",
      name: "Ahorro, inversión y metas",
      description: "Fondo de emergencia, inversión o metas futuras.",
      color: "#1D4ED8",
      percent: 20,
      items: [
        { id: "s_shield", name: "Fondo de emergencia", icon: "shield", weight: 0.5, amount: 240 },
        { id: "s_trend", name: "Inversión / Metas", icon: "trend", weight: 0.5, amount: 240 },
      ],
    },
  ];

  const ICONS = {
    home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
    bolt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    drop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    wifi: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    cart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    car: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
    utensils: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10 9 16 12 10 15 10 9"/></svg>',
    bag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    trend: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    tag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  };

  let state = loadState();
  let focusedCategoryId = null;

  const els = {
    stepper: document.getElementById("stepper"),
    dockGlider: document.getElementById("dock-glider"),
    mastheadFolio: document.getElementById("masthead-folio"),
    mastheadReadoutText: document.getElementById("masthead-readout-text"),
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

    // Escena 3 (Gastos detallados)
    btnSyncStrategy: document.getElementById("btn-sync-strategy"),
    s3Thermometer: document.getElementById("s3-thermometer"),
    s3SectionTabs: document.getElementById("s3-section-tabs"),
    s3ItemsPanel: document.getElementById("s3-items-panel"),
    s3VisualPanel: document.getElementById("s3-visual-panel"),
    btnS3Next: document.getElementById("btn-s3-next"),

    // Escena 4 (Gráficos grandes)
    s4StrategyBadge: document.getElementById("s4-strategy-badge"),
    chartModeSwitch: document.querySelector(".chart-mode-switch"),
    modeSwitchGlider: document.getElementById("mode-switch-glider"),
    chartStageViewport: document.getElementById("chart-stage-viewport"),
    viewDonut: document.getElementById("view-donut"),
    viewBars: document.getElementById("view-bars"),
    autobalanceCheckbox: document.getElementById("autobalance-checkbox"),
    donutBezelTicks: document.getElementById("donut-bezel-ticks"),
    donutSegments: document.getElementById("donut-segments"),
    centerLabel: document.getElementById("center-label"),
    centerAmount: document.getElementById("center-amount"),
    centerStatus: document.getElementById("center-status"),
    centerSubnote: document.getElementById("center-subnote"),
    chartTooltip: document.getElementById("chart-tooltip"),
    minimalSlidersList: document.getElementById("minimal-sliders-list"),
    s4LiveFeedback: document.getElementById("s4-live-feedback"),
    btnS4Next: document.getElementById("btn-s4-next"),

    // Escena 5 (Diagnóstico)
    s5DiagnosisContent: document.getElementById("s5-diagnosis-content"),
    btnS5Next: document.getElementById("btn-s5-next"),

    // Escena 6 (Documento)
    reportOwnerInput: document.getElementById("report-owner-input"),
    btnPrintNow: document.getElementById("btn-print-now"),
    docPreviewFrame: document.getElementById("doc-preview-frame"),
    printableDocument: document.getElementById("printable-document"),
  };

  function cloneDefaults() {
    return {
      currentStep: 1,
      unlockedStep: 1,
      activeExpenseTab: "needs",
      chartMode: "donut",
      itemsTouched: false,
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
      const unlocked = Math.max(1, Math.min(6, Number(parsed.unlockedStep) || 1));
      const current = Math.max(1, Math.min(unlocked, Number(parsed.currentStep) || 1));
      return {
        currentStep: current,
        unlockedStep: unlocked,
        activeExpenseTab: parsed.activeExpenseTab || "needs",
        chartMode: parsed.chartMode === "bars" ? "bars" : "donut",
        itemsTouched: Boolean(parsed.itemsTouched),
        income: Number.isFinite(Number(parsed.income)) ? Math.max(0, Number(parsed.income)) : 2400,
        currency: CURRENCIES[parsed.currency] ? parsed.currency : "USD",
        period: PERIOD_FACTORS[parsed.period] ? parsed.period : "mensual",
        strategy: STRATEGIES[parsed.strategy] ? parsed.strategy : "50-30-20",
        autoBalance: typeof parsed.autoBalance === "boolean" ? parsed.autoBalance : true,
        ownerName: typeof parsed.ownerName === "string" ? parsed.ownerName : "",
        categories: parsed.categories.map((cat, idx) => ({
          ...DEFAULT_CATEGORIES[idx],
          ...cat,
          color: DEFAULT_CATEGORIES[idx].color,
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

  function getItemsSum(cat) {
    return cat.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  function getTotalPercent() {
    return state.categories.reduce((sum, c) => sum + c.percent, 0);
  }

  function scaleItemsToTargets() {
    state.categories.forEach((cat) => {
      const targetCatAmount = (state.income * cat.percent) / 100;
      const totalWeight = cat.items.reduce((s, i) => s + (i.weight || 0), 0) || cat.items.length;
      let allocated = 0;
      cat.items.forEach((item, idx) => {
        if (idx === cat.items.length - 1) {
          item.amount = Math.max(0, Math.round(targetCatAmount - allocated));
        } else {
          const share = item.weight ? item.weight / totalWeight : 1 / cat.items.length;
          item.amount = Math.max(0, Math.round(targetCatAmount * share));
          allocated += item.amount;
        }
      });
    });
  }

  function syncPercentsFromItems() {
    if (state.income <= 0) return;
    state.categories.forEach((cat) => {
      const sum = getItemsSum(cat);
      cat.percent = Math.max(0, Math.min(100, Math.round((sum / state.income) * 100)));
    });
    const total = getTotalPercent();
    state.autoBalance = total === 100;
    detectStrategyMatch();
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
  // Helpers de Animación Out -> In & Navegación entre las 6 Escenas
  // =========================================================================

  const sceneTransition = { token: 0, anim: null };
  const strategySwap = { token: 0, anims: [] };
  const expenseTabSwap = { token: 0, anim: null, heightTimer: null };
  const chartModeSwap = { token: 0, anim: null, heightTimer: null };

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function runSingleAnim(el, keyframes, options, tracker) {
    if (!el || typeof el.animate !== "function" || prefersReducedMotion()) {
      return Promise.resolve({ finished: true, anim: null });
    }
    const anim = el.animate(keyframes, options);
    if (tracker) tracker.anim = anim;
    return anim.finished
      .then(() => ({ finished: true, anim }))
      .catch(() => ({ finished: false, anim }))
      .finally(() => {
        if (tracker && tracker.anim === anim) {
          tracker.anim = null;
        }
      });
  }

  function resetContainerHeight(container, tracker) {
    if (!container) return;
    if (tracker && tracker.heightTimer) {
      clearTimeout(tracker.heightTimer);
      tracker.heightTimer = null;
    }
    container.style.height = "";
    container.style.overflow = "";
    container.style.transition = "";
  }

  function animateContainerHeight(container, updateDomFn, tracker) {
    if (!container) {
      updateDomFn();
      return;
    }
    if (tracker && tracker.heightTimer) {
      clearTimeout(tracker.heightTimer);
      tracker.heightTimer = null;
    }
    const startHeight = container.getBoundingClientRect().height;
    updateDomFn();

    if (prefersReducedMotion()) {
      resetContainerHeight(container, tracker);
      return;
    }

    container.style.transition = "none";
    container.style.height = "auto";
    container.style.overflow = "hidden";
    const endHeight = container.getBoundingClientRect().height;

    if (Math.abs(endHeight - startHeight) < 2) {
      resetContainerHeight(container, tracker);
      return;
    }

    container.style.height = `${startHeight}px`;
    void container.offsetHeight;
    container.style.transition = "height 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
    container.style.height = `${endHeight}px`;

    const timerId = setTimeout(() => {
      if (tracker && tracker.heightTimer !== timerId) return;
      container.style.height = "";
      container.style.overflow = "";
      container.style.transition = "";
      if (tracker) tracker.heightTimer = null;
    }, 300);
    if (tracker) tracker.heightTimer = timerId;
  }

  function getVisibleSceneEl() {
    return (
      Array.from(els.scenes).find((sec) => !sec.hidden && sec.classList.contains("is-active")) ||
      Array.from(els.scenes).find((sec) => !sec.hidden) ||
      null
    );
  }

  async function goToStep(step, directionOverride = null, skipAnim = false) {
    const target = Math.max(1, Math.min(6, step));
    if (target > state.unlockedStep) return;

    const prev = state.currentStep;
    if (target === prev && !skipAnim) return;

    const direction = directionOverride || (target >= prev ? "forward" : "backward");
    const dirSign = direction === "forward" ? 1 : -1;
    const token = ++sceneTransition.token;

    const targetSec = Array.from(els.scenes).find((sec) => Number(sec.getAttribute("data-scene")) === target);
    const visibleSec = getVisibleSceneEl();

    let startOpacity = 1;
    let startTransform = "translateX(0px) scale(1)";
    if (visibleSec) {
      const cs = getComputedStyle(visibleSec);
      startOpacity = Number.isFinite(parseFloat(cs.opacity)) ? parseFloat(cs.opacity) : 1;
      startTransform = cs.transform === "none" ? "translateX(0px) scale(1)" : cs.transform;
    }

    if (sceneTransition.anim) {
      sceneTransition.anim.cancel();
      sceneTransition.anim = null;
    }

    state.currentStep = target;
    saveState();
    renderStepper();

    if (skipAnim || prefersReducedMotion() || !targetSec) {
      els.scenes.forEach((sec) => {
        const isTarget = sec === targetSec;
        sec.hidden = !isTarget;
        sec.classList.toggle("is-active", isTarget);
      });
      renderCurrentScene(false);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (window.scrollY > 40) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Caso 1: Volver a la misma escena que todavía estaba saliendo
    if (visibleSec === targetSec) {
      targetSec.hidden = false;
      targetSec.classList.add("is-active");
      renderCurrentScene(false);
      const res = await runSingleAnim(
        targetSec,
        [
          { opacity: startOpacity, transform: startTransform },
          { opacity: 1, transform: "translateX(0px) scale(1)" },
        ],
        { duration: 190, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" },
        sceneTransition
      );
      if (res.finished && token === sceneTransition.token && res.anim) {
        res.anim.cancel();
      }
      return;
    }

    // Asegurar que solo una escena sea visible durante la salida
    els.scenes.forEach((sec) => {
      if (sec !== visibleSec) {
        sec.hidden = true;
        sec.classList.remove("is-active");
      }
    });

    // Fase 1: Salida limpia de la escena actual (sin superposición)
    if (visibleSec) {
      const exitDur = Math.max(80, Math.round(160 * Math.max(0.2, startOpacity)));
      const exitRes = await runSingleAnim(
        visibleSec,
        [
          { opacity: startOpacity, transform: startTransform },
          { opacity: 0, transform: `translateX(${-16 * dirSign}px) scale(0.992)` },
        ],
        { duration: exitDur, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
        sceneTransition
      );
      if (token !== sceneTransition.token) {
        return;
      }
      visibleSec.hidden = true;
      visibleSec.classList.remove("is-active");
      if (exitRes.anim) exitRes.anim.cancel();
    }

    // Fase 2: Montaje y entrada limpia de la nueva escena
    targetSec.hidden = false;
    targetSec.classList.add("is-active");
    renderCurrentScene(true);

    const enterRes = await runSingleAnim(
      targetSec,
      [
        { opacity: 0, transform: `translateX(${18 * dirSign}px) scale(0.99)` },
        { opacity: 1, transform: "translateX(0px) scale(1)" },
      ],
      { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" },
      sceneTransition
    );
    if (enterRes.finished && token === sceneTransition.token && enterRes.anim) {
      enterRes.anim.cancel();
    }
  }

  function unlockAndGo(nextStep) {
    state.unlockedStep = Math.max(state.unlockedStep, Math.min(6, nextStep));
    goToStep(nextStep, "forward");
  }

  function updateMasthead() {
    if (els.mastheadFolio) {
      els.mastheadFolio.textContent = `FOLIO 0${state.currentStep} / 06`;
    }
    if (els.mastheadReadoutText) {
      const periodLabel = PERIOD_FACTORS[state.period].adjective.toUpperCase();
      els.mastheadReadoutText.textContent = `${formatMoney(state.income)} · ${periodLabel}`;
    }
  }

  function updateDockGlider(instant = false) {
    if (!els.dockGlider || !els.stepper) return;
    const activeBtn = els.stepper.querySelector(".step-item.is-active");
    if (!activeBtn || activeBtn.offsetWidth === 0) return;

    if (instant) {
      els.dockGlider.style.transition = "none";
    }
    els.dockGlider.style.width = `${activeBtn.offsetWidth}px`;
    els.dockGlider.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    if (instant) {
      void els.dockGlider.offsetWidth;
      els.dockGlider.style.transition = "";
    }
  }

  function buildDialTicksMarkup(cx, cy, count, rInner, rOuter, majorEvery) {
    const lines = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const isMajor = i % majorEvery === 0;
      const r1 = isMajor ? rInner - 3 : rInner;
      const x1 = cx + Math.cos(angle) * r1;
      const y1 = cy + Math.sin(angle) * r1;
      const x2 = cx + Math.cos(angle) * rOuter;
      const y2 = cy + Math.sin(angle) * rOuter;
      lines.push(
        `<line class="${isMajor ? "is-major" : ""}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${isMajor ? "1.6" : "1"}" />`
      );
    }
    return lines.join("");
  }

  function renderStepper(instantGlider = false) {
    els.progressFill.style.width = `${(state.currentStep / 6) * 100}%`;
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
    updateMasthead();
    requestAnimationFrame(() => updateDockGlider(instantGlider));
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

    document.querySelectorAll(".pill-choice[data-income]").forEach((btn) => {
      btn.classList.toggle("is-current", Number(btn.getAttribute("data-income")) === state.income);
    });
    updateMasthead();

    const perYear = PERIOD_FACTORS[state.period].perYear;
    const annualIncome = state.income * perYear;
    const sampleSave = Math.round(annualIncome * 0.2);

    if (state.income > 0) {
      els.s1Callout.innerHTML = `
        Tu ingreso equivale a <strong>${formatMoney(annualIncome, true)} al año</strong>.
        Con una regla equilibrada del 20%, ahorrarías <strong>${formatMoney(sampleSave)} cada año</strong>.
      `;
    } else {
      els.s1Callout.innerHTML = `Escribe un monto mayor a cero para comenzar a repartir tu presupuesto.`;
    }
  }

  // =========================================================================
  // Escena 2: Estrategia
  // =========================================================================

  async function renderScene2(animateSwap = false) {
    if (!els.strategyGrid.querySelector(".strategy-card")) {
      els.strategyGrid.innerHTML = Object.values(STRATEGIES)
        .map((s, idx) => {
          const selected = s.id === state.strategy;
          return `
            <button type="button" class="strategy-card ${selected ? "is-selected" : ""}" data-strategy="${s.id}" role="radio" aria-checked="${selected ? "true" : "false"}">
              <span class="strategy-index">0${idx + 1}</span>
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
          const nextStrat = card.getAttribute("data-strategy");
          if (nextStrat === state.strategy) return;
          applyStrategy(nextStrat);
          renderScene2(true);
        });
      });
    } else {
      els.strategyGrid.querySelectorAll(".strategy-card").forEach((card) => {
        const selected = card.getAttribute("data-strategy") === state.strategy;
        card.classList.toggle("is-selected", selected);
        card.setAttribute("aria-checked", selected ? "true" : "false");
      });
    }

    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    const ringPercentages = strat.targets || {
      needs: state.categories[0].percent,
      wants: state.categories[1].percent,
      savings: state.categories[2].percent,
    };

    const r = 28;
    const circ = 2 * Math.PI * r;
    const segData = [
      { color: "#0E6B5E", pct: ringPercentages.needs },
      { color: "#D94E2A", pct: ringPercentages.wants },
      { color: "#1D4ED8", pct: ringPercentages.savings },
    ];
    let offset = 0;
    const computedSegs = segData.map((seg, idx) => {
      const len = (seg.pct / 100) * circ;
      const gap = Math.max(0, circ - len);
      const dashOffset = -offset;
      offset += len;
      return {
        idx,
        color: seg.color,
        dashArray: `${len.toFixed(2)} ${gap.toFixed(2)}`,
        dashOffset: dashOffset.toFixed(2),
      };
    });

    const existingSvg = els.strategySpotlight.querySelector(".spotlight-ring-svg");
    if (!existingSvg) {
      const circles = computedSegs
        .map(
          (seg) =>
            `<circle class="spotlight-ring-arc" data-seg-idx="${seg.idx}" cx="44" cy="44" r="${r}" fill="none" stroke="${seg.color}" stroke-width="10" stroke-dasharray="${seg.dashArray}" stroke-dashoffset="${seg.dashOffset}" />`
        )
        .join("");
      const miniTicks = buildDialTicksMarkup(44, 44, 24, 37.5, 41, 6);

      els.strategySpotlight.innerHTML = `
        <div>
          <div class="spotlight-head">
            <div aria-hidden="true">
              <svg class="spotlight-ring-svg" viewBox="0 0 88 88" width="84" height="84" style="transform: rotate(-90deg);">
                <g class="donut-bezel-ticks">${miniTicks}</g>
                <circle cx="44" cy="44" r="${r}" fill="none" stroke="#ece8df" stroke-width="10" />
                ${circles}
              </svg>
            </div>
            <div class="spotlight-copy-block">
              <span class="spotlight-kicker">¿Por qué funciona?</span>
              <h3 class="spotlight-title" id="spotlight-title">${escapeHtml(strat.name)}</h3>
            </div>
          </div>
          <div class="spotlight-body-copy">
            <p class="spotlight-summary" style="margin-top:14px;">${escapeHtml(strat.whySummary)}</p>
            <ul class="spotlight-bullets" style="margin-top:10px;">
              ${strat.whyDetails.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
            </ul>
          </div>
        </div>
        <div class="spotlight-bestfor">
          <strong>Ideal para:</strong> ${escapeHtml(strat.bestFor)}
        </div>
      `;
      return;
    }

    computedSegs.forEach((seg) => {
      const arc = existingSvg.querySelector(`.spotlight-ring-arc[data-seg-idx="${seg.idx}"]`);
      if (arc) {
        arc.setAttribute("stroke-dasharray", seg.dashArray);
        arc.setAttribute("stroke-dashoffset", seg.dashOffset);
      }
    });

    const titleEl = els.strategySpotlight.querySelector("#spotlight-title");
    const bodyCopyEl = els.strategySpotlight.querySelector(".spotlight-body-copy");
    const bestForEl = els.strategySpotlight.querySelector(".spotlight-bestfor");
    const swapTargets = [titleEl, bodyCopyEl, bestForEl].filter(Boolean);

    const token = ++strategySwap.token;
    strategySwap.anims.forEach((a) => a.cancel());
    strategySwap.anims = [];

    const writeSpotlightCopy = () => {
      if (titleEl) titleEl.textContent = strat.name;
      if (bodyCopyEl) {
        bodyCopyEl.innerHTML = `
          <p class="spotlight-summary" style="margin-top:14px;">${escapeHtml(strat.whySummary)}</p>
          <ul class="spotlight-bullets" style="margin-top:10px;">
            ${strat.whyDetails.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
          </ul>
        `;
      }
      if (bestForEl) {
        bestForEl.innerHTML = `<strong>Ideal para:</strong> ${escapeHtml(strat.bestFor)}`;
      }
    };

    if (!animateSwap || prefersReducedMotion() || typeof HTMLElement.prototype.animate !== "function") {
      writeSpotlightCopy();
      return;
    }

    const exitAnims = swapTargets.map((el) =>
      el.animate(
        [
          { opacity: parseFloat(getComputedStyle(el).opacity) || 1, transform: "translateY(0px)" },
          { opacity: 0, transform: "translateY(-4px)" },
        ],
        { duration: 105, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
      )
    );
    strategySwap.anims = exitAnims;
    await Promise.all(exitAnims.map((a) => a.finished.catch(() => null)));
    if (token !== strategySwap.token) return;

    writeSpotlightCopy();

    const enterAnims = swapTargets.map((el) =>
      el.animate(
        [
          { opacity: 0, transform: "translateY(6px)" },
          { opacity: 1, transform: "translateY(0px)" },
        ],
        { duration: 200, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" }
      )
    );
    strategySwap.anims = enterAnims;
    await Promise.all(enterAnims.map((a) => a.finished.catch(() => null)));
    if (token === strategySwap.token) {
      enterAnims.forEach((a) => a.cancel());
      exitAnims.forEach((a) => a.cancel());
      strategySwap.anims = [];
    }
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
      if (!state.itemsTouched) {
        scaleItemsToTargets();
      }
    }
    saveState();
  }

  // =========================================================================
  // Escena 3: Gastos Detallados (Luz, Agua, Electricidad...) + Regla + Top Barras
  // =========================================================================

  function renderScene3Thermometer() {
    const totalSpent = state.categories.reduce((sum, cat) => sum + getItemsSum(cat), 0);
    const diff = state.income - totalSpent;
    const base = Math.max(state.income, totalSpent, 1);

    let headline = "";
    let badgeText = "";
    let badgeClass = "status-balanced";

    if (diff > 0) {
      headline = `Llevas ${formatMoney(totalSpent)} repartidos de ${formatMoney(state.income)}`;
      badgeText = `Te quedan ${formatMoney(diff)} libres`;
      badgeClass = "status-surplus";
    } else if (diff === 0) {
      headline = `¡Exacto! Repartiste los ${formatMoney(state.income)} completos`;
      badgeText = "100% asignado";
      badgeClass = "status-balanced";
    } else {
      headline = `Tus gastos suman ${formatMoney(totalSpent)} (sobre ${formatMoney(state.income)})`;
      badgeText = `Te pasaste por ${formatMoney(Math.abs(diff))}`;
      badgeClass = "status-deficit";
    }

    const segmentsHtml = state.categories
      .map((cat) => {
        const sum = getItemsSum(cat);
        const w = (sum / base) * 100;
        return `<div class="thermo-fill-seg" style="width:${w.toFixed(2)}%; background:${cat.color};" title="${escapeHtml(cat.tabName)}: ${formatMoney(sum)}"></div>`;
      })
      .join("");

    const legendHtml = state.categories
      .map((cat) => {
        const sum = getItemsSum(cat);
        const pct = state.income > 0 ? Math.round((sum / state.income) * 100) : 0;
        return `
          <span class="thermo-legend-item">
            <span class="thermo-dot" style="background:${cat.color}"></span>
            <span>${escapeHtml(cat.tabName)}: <strong>${formatMoney(sum)}</strong> (${pct}%)</span>
          </span>
        `;
      })
      .join("");

    els.s3Thermometer.innerHTML = `
      <div class="thermo-header">
        <span class="thermo-headline">${headline}</span>
        <span class="thermo-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="thermo-track" role="img" aria-label="Termómetro visual de gastos">${segmentsHtml}</div>
      <div class="thermo-scale" aria-hidden="true">
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>
      <div class="thermo-legend">${legendHtml}</div>
    `;
  }

  function renderScene3Tabs() {
    const existingTabs = els.s3SectionTabs.querySelectorAll(".section-tab");
    if (existingTabs.length === state.categories.length) {
      state.categories.forEach((cat) => {
        const btn = els.s3SectionTabs.querySelector(`.section-tab[data-tab-id="${cat.id}"]`);
        if (!btn) return;
        const active = cat.id === state.activeExpenseTab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        const amountEl = btn.querySelector("strong");
        if (amountEl) amountEl.textContent = formatMoney(getItemsSum(cat));
      });
      return;
    }

    els.s3SectionTabs.innerHTML = state.categories
      .map((cat) => {
        const active = cat.id === state.activeExpenseTab;
        const sum = getItemsSum(cat);
        return `
          <button
            type="button"
            class="section-tab ${active ? "is-active" : ""}"
            data-tab-id="${cat.id}"
            style="--tab-color:${cat.color}"
            role="tab"
            aria-selected="${active ? "true" : "false"}"
          >
            <span class="section-tab-top">
              <span class="thermo-dot" style="background:${cat.color}"></span>
              <span>${escapeHtml(cat.tabName)}</span>
            </span>
            <strong>${formatMoney(sum)}</strong>
          </button>
        `;
      })
      .join("");

    els.s3SectionTabs.querySelectorAll(".section-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        switchExpenseTab(tab.getAttribute("data-tab-id"));
      });
    });
  }

  async function switchExpenseTab(nextTabId) {
    if (!nextTabId || nextTabId === state.activeExpenseTab) return;

    const oldIdx = state.categories.findIndex((c) => c.id === state.activeExpenseTab);
    const newIdx = state.categories.findIndex((c) => c.id === nextTabId);
    const dirSign = newIdx >= oldIdx ? 1 : -1;

    state.activeExpenseTab = nextTabId;
    saveState();
    renderScene3Tabs();

    const token = ++expenseTabSwap.token;
    const oldStage = els.s3ItemsPanel.querySelector(".expense-items-stage");

    let startOpacity = 1;
    let startTransform = "translateX(0px)";
    if (oldStage) {
      const cs = getComputedStyle(oldStage);
      startOpacity = Number.isFinite(parseFloat(cs.opacity)) ? parseFloat(cs.opacity) : 1;
      startTransform = cs.transform === "none" ? "translateX(0px)" : cs.transform;
    }

    if (expenseTabSwap.anim) {
      expenseTabSwap.anim.cancel();
      expenseTabSwap.anim = null;
    }

    if (prefersReducedMotion() || typeof HTMLElement.prototype.animate !== "function") {
      mountScene3Items(false);
      return;
    }

    if (oldStage) {
      const exitDur = Math.max(70, Math.round(140 * Math.max(0.2, startOpacity)));
      const exitRes = await runSingleAnim(
        oldStage,
        [
          { opacity: startOpacity, transform: startTransform },
          { opacity: 0, transform: `translateX(${-12 * dirSign}px)` },
        ],
        { duration: exitDur, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
        expenseTabSwap
      );
      if (token !== expenseTabSwap.token) {
        return;
      }
      if (exitRes.anim) exitRes.anim.cancel();
    }

    animateContainerHeight(
      els.s3ItemsPanel,
      () => mountScene3Items(true),
      expenseTabSwap
    );

    const newStage = els.s3ItemsPanel.querySelector(".expense-items-stage");
    if (newStage) {
      const enterRes = await runSingleAnim(
        newStage,
        [
          { opacity: 0, transform: `translateX(${14 * dirSign}px)` },
          { opacity: 1, transform: "translateX(0px)" },
        ],
        { duration: 240, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" },
        expenseTabSwap
      );
      if (enterRes.finished && token === expenseTabSwap.token && enterRes.anim) {
        enterRes.anim.cancel();
      }
    }
  }

  function mountScene3Items(animateItems = false) {
    resetContainerHeight(els.s3ItemsPanel, expenseTabSwap);
    const cat = state.categories.find((c) => c.id === state.activeExpenseTab) || state.categories[0];
    const curSymbol = (CURRENCIES[state.currency] || CURRENCIES.USD).symbol;
    const sliderMax = Math.max(100, Math.round(state.income * 0.8));

    const rowsHtml = cat.items
      .map((item, idx) => {
        const val = Math.round(Number(item.amount) || 0);
        const sharePct = state.income > 0 ? Math.round((val / state.income) * 100) : 0;
        const sliderPct = Math.min(100, Math.round((val / sliderMax) * 100));
        const iconSvg = ICONS[item.icon] || ICONS.tag;
        const staggerClass = animateItems ? "is-stagger-in" : "";

        return `
          <div class="expense-item-row ${staggerClass}" data-item-id="${item.id}" style="--cat-color:${cat.color}; --item-index:${idx}">
            <div class="expense-row-top">
              <div class="expense-name-wrap">
                <span class="expense-icon-badge" aria-hidden="true">${iconSvg}</span>
                <input
                  type="text"
                  class="expense-name-input"
                  value="${escapeHtml(item.name)}"
                  placeholder="Nombre del gasto"
                  aria-label="Nombre del gasto"
                />
              </div>
              <div class="expense-row-right">
                <div class="expense-money-box">
                  <span>${curSymbol}</span>
                  <input
                    type="number"
                    class="expense-amount-input"
                    min="0"
                    step="5"
                    value="${val}"
                    aria-label="Monto de ${escapeHtml(item.name)}"
                  />
                </div>
                <button type="button" class="expense-delete-btn" title="Quitar gasto" aria-label="Quitar gasto">&times;</button>
              </div>
            </div>
            <div class="expense-slider-wrap">
              <input
                type="range"
                class="cat-slider expense-slider"
                min="0"
                max="${sliderMax}"
                step="5"
                value="${Math.min(sliderMax, val)}"
                style="--slider-pct:${sliderPct}%; --cat-color:${cat.color}"
                aria-label="Deslizador para ${escapeHtml(item.name)}"
              />
              <span class="expense-share-label">${sharePct}%</span>
            </div>
          </div>
        `;
      })
      .join("");

    els.s3ItemsPanel.innerHTML = `
      <div class="expense-items-stage">
        ${rowsHtml}
        <button type="button" class="btn-add-expense" id="btn-add-expense-item">
          + Añadir otro gasto en ${escapeHtml(cat.tabName)}
        </button>
      </div>
    `;

    els.s3ItemsPanel.querySelectorAll(".expense-item-row").forEach((row) => {
      const itemId = row.getAttribute("data-item-id");
      const item = cat.items.find((i) => i.id === itemId);
      if (!item) return;

      const nameInput = row.querySelector(".expense-name-input");
      const amountInput = row.querySelector(".expense-amount-input");
      const slider = row.querySelector(".expense-slider");
      const shareLabel = row.querySelector(".expense-share-label");
      const deleteBtn = row.querySelector(".expense-delete-btn");

      nameInput.addEventListener("input", (e) => {
        item.name = e.target.value;
        saveState();
        renderScene3VisualPanel();
      });

      const updateItemAmount = (newAmount, source) => {
        const clean = Math.max(0, Math.round(Number(newAmount) || 0));
        item.amount = clean;
        state.itemsTouched = true;
        syncPercentsFromItems();
        saveState();

        if (source !== "input") amountInput.value = clean;
        if (source !== "slider") slider.value = Math.min(sliderMax, clean);
        const pctWidth = Math.min(100, Math.round((clean / sliderMax) * 100));
        slider.style.setProperty("--slider-pct", `${pctWidth}%`);
        shareLabel.textContent = `${state.income > 0 ? Math.round((clean / state.income) * 100) : 0}%`;

        renderScene3Thermometer();
        renderScene3Tabs();
        renderScene3VisualPanel();
      };

      amountInput.addEventListener("input", (e) => updateItemAmount(e.target.value, "input"));
      slider.addEventListener("input", (e) => updateItemAmount(e.target.value, "slider"));

      deleteBtn.addEventListener("click", () => {
        cat.items = cat.items.filter((i) => i.id !== itemId);
        state.itemsTouched = true;
        syncPercentsFromItems();
        saveState();
        renderScene3Thermometer();
        renderScene3Tabs();
        mountScene3Items(false);
        renderScene3VisualPanel();
      });
    });

    document.getElementById("btn-add-expense-item").addEventListener("click", () => {
      cat.items.push({
        id: "custom_" + Date.now() + "_" + Math.floor(Math.random() * 100),
        name: "Otro gasto",
        icon: "tag",
        weight: 0,
        amount: 0,
      });
      state.itemsTouched = true;
      saveState();
      mountScene3Items(false);
      renderScene3VisualPanel();
    });
  }

  function renderScene3VisualPanel() {
    const allItems = [];
    state.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if ((Number(item.amount) || 0) > 0) {
          allItems.push({
            name: item.name || "Sin nombre",
            amount: Number(item.amount) || 0,
            color: cat.color,
          });
        }
      });
    });

    allItems.sort((a, b) => b.amount - a.amount);
    const topItems = allItems.slice(0, 6);
    const maxAmt = topItems[0] ? topItems[0].amount : 1;

    // Sumar servicios del hogar (luz, agua, gas, internet)
    const utilityIds = new Set(["n_bolt", "n_drop", "n_flame", "n_wifi"]);
    const utilitiesSum = state.categories[0].items
      .filter((i) => utilityIds.has(i.id))
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const utilitiesPct = state.income > 0 ? Math.round((utilitiesSum / state.income) * 100) : 0;

    const barsHtml = topItems.length
      ? topItems
          .map((item) => {
            const w = Math.max(6, Math.round((item.amount / maxAmt) * 100));
            return `
              <div class="top-bar-item">
                <div class="top-bar-meta">
                  <span>${escapeHtml(item.name)}</span>
                  <strong>${formatMoney(item.amount)}</strong>
                </div>
                <div class="top-bar-track">
                  <div class="top-bar-fill" style="width:${w}%; background:${item.color};"></div>
                </div>
              </div>
            `;
          })
          .join("")
      : `<p style="font-size:0.84rem; color:var(--ink-muted); margin:0;">Agrega montos a tus gastos para ver en qué se va más dinero.</p>`;

    els.s3VisualPanel.innerHTML = `
      <div>
        <h3 class="visual-panel-title">¿En qué se te va más dinero?</h3>
        <p class="visual-panel-sub">Tus mayores gastos ordenados de mayor a menor</p>
      </div>
      <div class="top-bars-list">${barsHtml}</div>
      <div class="utilities-mini-summary">
        <strong>Servicios del hogar</strong> (luz, agua, gas e internet):
        <strong>${formatMoney(utilitiesSum)}</strong> (${utilitiesPct}% de tu ingreso).
      </div>
    `;
  }

  function renderScene3(animateItems = false) {
    renderScene3Thermometer();
    renderScene3Tabs();
    mountScene3Items(animateItems);
    renderScene3VisualPanel();
  }

  // =========================================================================
  // Escena 4: Gráficos Grandes (Anillo + Barras Fáciles)
  // =========================================================================

  function setCategoryPercent(catId, newPercent) {
    const clamped = Math.max(0, Math.min(100, Math.round(newPercent)));
    const targetCat = state.categories.find((c) => c.id === catId);
    if (!targetCat) return;

    if (!state.autoBalance) {
      targetCat.percent = clamped;
      detectStrategyMatch();
      saveState();
      renderScene4();
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
    renderScene4();
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
    if (els.donutBezelTicks) {
      els.donutBezelTicks.innerHTML = buildDialTicksMarkup(210, 210, 60, 185, 195, 5);
    }
    els.donutSegments.innerHTML = buildDonutMarkup(146, 40, 210);
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
    const metrics = getDonutMetrics(146);
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

  function renderEasyBars(animateFromZero = false) {
    const strat = STRATEGIES[state.strategy];
    const refTargets = (strat && strat.targets) || { needs: 50, wants: 30, savings: 20 };

    const getBarStatus = (cat, targetPct) => {
      const diff = cat.percent - targetPct;
      if (cat.id === "savings") {
        if (diff >= 0) {
          return {
            statusText: diff === 0 ? "En la meta" : `¡+${diff}% extra de ahorro!`,
            statusClass: "status-balanced",
          };
        }
        return {
          statusText: `Te faltan ${Math.abs(diff)}% para tu meta`,
          statusClass: "status-surplus",
        };
      }
      if (diff <= 0) {
        return {
          statusText: diff === 0 ? "En la meta" : `Muy bien (${Math.abs(diff)}% debajo)`,
          statusClass: "status-balanced",
        };
      }
      if (diff <= 10) {
        return {
          statusText: `Un poco arriba (+${diff}%)`,
          statusClass: "status-surplus",
        };
      }
      return {
        statusText: `Muy alto (+${diff}% sobre la meta)`,
        statusClass: "status-deficit",
      };
    };

    const existingCards = els.viewBars.querySelectorAll(".easy-bar-card[data-cat-id]");
    if (!animateFromZero && existingCards.length === state.categories.length) {
      state.categories.forEach((cat) => {
        const card = els.viewBars.querySelector(`.easy-bar-card[data-cat-id="${cat.id}"]`);
        if (!card) return;
        const targetPct = refTargets[cat.id];
        const actualPct = Math.min(100, cat.percent);
        const { statusText, statusClass } = getBarStatus(cat, targetPct);

        const statusEl = card.querySelector(".easy-bar-status");
        if (statusEl) {
          statusEl.textContent = statusText;
          statusEl.className = `easy-bar-status ${statusClass}`;
        }
        const targetFill = card.querySelector(".easy-track-fill.is-target");
        const targetVal = card.querySelector(".easy-track-val.is-target-val");
        const actualFill = card.querySelector(".easy-track-fill.is-actual");
        const actualVal = card.querySelector(".easy-track-val.is-actual-val");

        if (targetFill) targetFill.style.width = `${targetPct}%`;
        if (targetVal) targetVal.textContent = `${targetPct}%`;
        if (actualFill) actualFill.style.width = `${actualPct}%`;
        if (actualVal) actualVal.textContent = `${cat.percent}% · ${formatMoney(getCategoryAmount(cat))}`;
      });
      return;
    }

    const cardsHtml = state.categories
      .map((cat, idx) => {
        const targetPct = refTargets[cat.id];
        const actualPct = Math.min(100, cat.percent);
        const { statusText, statusClass } = getBarStatus(cat, targetPct);

        const staggerClass = animateFromZero ? "is-stagger-in" : "";
        const targetWidth = animateFromZero ? "0%" : `${targetPct}%`;
        const actualWidth = animateFromZero ? "0%" : `${actualPct}%`;

        return `
          <div class="easy-bar-card ${staggerClass}" data-cat-id="${cat.id}" style="--item-index:${idx}">
            <div class="easy-bar-head">
              <span class="easy-bar-title">
                <span class="cat-dot" style="background:${cat.color}"></span>
                <span>${escapeHtml(cat.tabName)}</span>
              </span>
              <span class="easy-bar-status ${statusClass}">${statusText}</span>
            </div>

            <div class="easy-bar-tracks">
              <div class="easy-track-row">
                <span class="easy-track-label">Lo ideal</span>
                <div class="easy-track-outer">
                  <div class="easy-track-fill is-target" data-target-width="${targetPct}%" style="width:${targetWidth}"></div>
                </div>
                <span class="easy-track-val is-target-val">${targetPct}%</span>
              </div>
              <div class="easy-track-row">
                <span class="easy-track-label">Lo tuyo</span>
                <div class="easy-track-outer">
                  <div class="easy-track-fill is-actual" data-target-width="${actualPct}%" style="width:${actualWidth}; background:${cat.color}"></div>
                </div>
                <span class="easy-track-val is-actual-val">${cat.percent}% · ${formatMoney(getCategoryAmount(cat))}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    els.viewBars.innerHTML = `<div class="easy-bars-board">${cardsHtml}</div>`;

    if (animateFromZero) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          els.viewBars.querySelectorAll(".easy-track-fill[data-target-width]").forEach((fill) => {
            fill.style.width = fill.getAttribute("data-target-width");
          });
        });
      });
    }
  }

  function mountMinimalSliders() {
    const curSymbol = (CURRENCIES[state.currency] || CURRENCIES.USD).symbol;

    els.minimalSlidersList.innerHTML = state.categories
      .map((cat) => {
        const amount = getCategoryAmount(cat);
        const focusedClass = focusedCategoryId === cat.id ? "is-focused" : "";
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
          </div>
        `;
      })
      .join("");

    els.minimalSlidersList.querySelectorAll(".min-cat-row").forEach((row) => {
      const catId = row.getAttribute("data-cat-id");
      row.querySelector(".cat-slider").addEventListener("input", (e) => {
        setCategoryPercent(catId, Number(e.target.value));
      });
      row.querySelector(".cat-amount-input").addEventListener("change", (e) => {
        const val = Math.max(0, Number(e.target.value) || 0);
        if (state.income > 0) {
          setCategoryPercent(catId, Math.round((val / state.income) * 100));
        }
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
    });
  }

  function renderScene4LiveTip() {
    const needs = state.categories[0].percent;
    const wants = state.categories[1].percent;
    const savings = state.categories[2].percent;
    const total = needs + wants + savings;
    const perYear = PERIOD_FACTORS[state.period].perYear;
    const annualSave = Math.round((state.income * savings) / 100) * perYear;

    if (total > 100) {
      els.s4LiveFeedback.innerHTML = `<strong>Alerta:</strong> Estás asignando ${total}% de tu ingreso. Reduce ${total - 100}% para no gastar más de lo que entra.`;
    } else if (total < 100) {
      els.s4LiveFeedback.innerHTML = `Tienes <strong>${100 - total}% libre sin asignar</strong>. Puedes moverlo a ahorro o regresar a tus gastos.`;
    } else if (savings >= 25) {
      els.s4LiveFeedback.innerHTML = `<strong>Ritmo acelerado:</strong> Con el ${savings}% en ahorro reunirás <strong>${formatMoney(annualSave)} en 1 año</strong>.`;
    } else if (needs > 65) {
      els.s4LiveFeedback.innerHTML = `<strong>Dato clave:</strong> Tus fijos ocupan el ${needs}%. En el siguiente paso revisamos cómo optimizar servicios y vivienda.`;
    } else {
      els.s4LiveFeedback.innerHTML = `<strong>Balance saludable:</strong> Proyectas ahorrar <strong>${formatMoney(annualSave)} al año</strong> conservando ${wants}% para gustos.`;
    }
  }

  function updateModeSwitchGlider(instant = false) {
    if (!els.modeSwitchGlider || !els.chartModeSwitch) return;
    const activeTab = els.chartModeSwitch.querySelector(".mode-tab.is-active");
    if (!activeTab || activeTab.offsetWidth === 0) return;

    if (instant) {
      els.modeSwitchGlider.style.transition = "none";
    }
    els.modeSwitchGlider.style.width = `${activeTab.offsetWidth}px`;
    els.modeSwitchGlider.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    if (instant) {
      void els.modeSwitchGlider.offsetWidth;
      els.modeSwitchGlider.style.transition = "";
    }
  }

  async function switchChartMode(nextMode) {
    if (!nextMode || nextMode === state.chartMode) return;

    const dirSign = nextMode === "bars" ? 1 : -1;
    state.chartMode = nextMode;
    saveState();

    els.chartModeSwitch.querySelectorAll(".mode-tab").forEach((tab) => {
      const active = tab.getAttribute("data-chart-mode") === state.chartMode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    updateModeSwitchGlider(false);

    const token = ++chartModeSwap.token;
    const inPanel = nextMode === "bars" ? els.viewBars : els.viewDonut;
    const outPanel = !els.viewDonut.hidden ? els.viewDonut : els.viewBars;

    let startOpacity = 1;
    let startTransform = "translateX(0px) scale(1)";
    if (outPanel) {
      const cs = getComputedStyle(outPanel);
      startOpacity = Number.isFinite(parseFloat(cs.opacity)) ? parseFloat(cs.opacity) : 1;
      startTransform = cs.transform === "none" ? "translateX(0px) scale(1)" : cs.transform;
    }

    if (chartModeSwap.anim) {
      chartModeSwap.anim.cancel();
      chartModeSwap.anim = null;
    }

    if (prefersReducedMotion() || typeof HTMLElement.prototype.animate !== "function") {
      els.viewDonut.hidden = nextMode === "bars";
      els.viewBars.hidden = nextMode !== "bars";
      if (nextMode === "bars") renderEasyBars(false);
      else renderChart();
      resetContainerHeight(els.chartStageViewport, chartModeSwap);
      return;
    }

    // Si vuelve rápido al mismo panel que estaba saliendo
    if (outPanel === inPanel) {
      inPanel.hidden = false;
      if (nextMode === "bars") renderEasyBars(false);
      else renderChart();
      const backRes = await runSingleAnim(
        inPanel,
        [
          { opacity: startOpacity, transform: startTransform },
          { opacity: 1, transform: "translateX(0px) scale(1)" },
        ],
        { duration: 190, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" },
        chartModeSwap
      );
      if (backRes.finished && token === chartModeSwap.token && backRes.anim) {
        backRes.anim.cancel();
      }
      return;
    }

    if (outPanel) {
      const exitDur = Math.max(75, Math.round(150 * Math.max(0.2, startOpacity)));
      const exitRes = await runSingleAnim(
        outPanel,
        [
          { opacity: startOpacity, transform: startTransform },
          { opacity: 0, transform: `translateX(${-14 * dirSign}px) scale(0.988)` },
        ],
        { duration: exitDur, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
        chartModeSwap
      );
      if (token !== chartModeSwap.token) {
        return;
      }
      if (exitRes.anim) exitRes.anim.cancel();
    }

    animateContainerHeight(
      els.chartStageViewport,
      () => {
        els.viewDonut.hidden = nextMode === "bars";
        els.viewBars.hidden = nextMode !== "bars";
        if (nextMode === "bars") renderEasyBars(true);
        else renderChart();
      },
      chartModeSwap
    );

    const enterRes = await runSingleAnim(
      inPanel,
      [
        { opacity: 0, transform: `translateX(${16 * dirSign}px) scale(0.988)` },
        { opacity: 1, transform: "translateX(0px) scale(1)" },
      ],
      { duration: 250, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" },
      chartModeSwap
    );
    if (enterRes.finished && token === chartModeSwap.token && enterRes.anim) {
      enterRes.anim.cancel();
    }
  }

  function renderScene4(animateBarsFromZero = false, snapGlider = false) {
    resetContainerHeight(els.chartStageViewport, chartModeSwap);
    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    els.s4StrategyBadge.textContent = `04 · Estrategia: ${strat.name}`;
    els.autobalanceCheckbox.checked = state.autoBalance;

    els.chartModeSwitch.querySelectorAll(".mode-tab").forEach((tab) => {
      const active = tab.getAttribute("data-chart-mode") === state.chartMode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    const showBars = state.chartMode === "bars";
    els.viewDonut.hidden = showBars;
    els.viewBars.hidden = !showBars;

    renderChart();
    renderEasyBars(animateBarsFromZero && showBars);
    updateSlidersInPlace();
    renderScene4LiveTip();

    requestAnimationFrame(() => updateModeSwitchGlider(snapGlider));
  }

  // =========================================================================
  // Motor de Diagnóstico & Escena 5
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

    // Análisis específico de servicios del hogar (luz, agua, gas, internet)
    const utilityIds = new Set(["n_bolt", "n_drop", "n_flame", "n_wifi"]);
    const utilitiesSum = state.categories[0].items
      .filter((i) => utilityIds.has(i.id))
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const utilitiesPct = state.income > 0 ? Math.round((utilitiesSum / state.income) * 100) : 0;

    let score = 78;
    const strengths = [];
    const improvements = [];
    const actionSteps = [];

    if (state.income <= 0) {
      score = 0;
      improvements.push({
        level: "alert",
        tag: "Ingreso en cero",
        text: "Regresa al Paso 1 para ingresar tu ingreso neto.",
        simAction: null,
      });
    } else {
      if (savings >= 25) {
        score += 18;
        strengths.push(`Ahorro sobresaliente (${savings}%), sumando ${formatMoney(annualSavings)} al año.`);
      } else if (savings >= 20) {
        score += 12;
        strengths.push(`Cumples la meta saludable del ${savings}% de ahorro (${formatMoney(annualSavings)} al año).`);
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
        actionSteps.push(`Automatiza tu ahorro el mismo día que recibes ingresos y busca acercarte al 20%.`);
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
          text: `Tus necesidades ocupan ${needs}%. Optimizar servicios (luz/internet) o supermercado un 5% liberaría ${formatMoney(state.income * 0.05 * perYear)} al año.`,
          simAction: { label: "Simular -5% en Necesidades hacia Ahorro", deltas: { needs: -5, savings: 5 } },
        });
        actionSteps.push(`Revisa tus recibos de luz, internet y supermercado para recuperar un 5% hacia tu ahorro.`);
      } else {
        score -= 16;
        improvements.push({
          level: "alert",
          tag: "Sobrecarga fija",
          text: `El ${needs}% en necesidades reduce demasiado tu oxígeno financiero.`,
          simAction: { label: "Simular alivio de -5% a Ahorro", deltas: { needs: -5, savings: 5 } },
        });
        actionSteps.push(`Evita nuevas cuotas fijas hasta bajar necesidades por debajo del 60%.`);
      }

      if (utilitiesPct > 12) {
        improvements.push({
          level: "warn",
          tag: "Servicios básicos altos",
          text: `Luz, agua, gas e internet suman ${formatMoney(utilitiesSum)} (${utilitiesPct}% de tu ingreso). Revisa tarifas de internet/telefonía o consumo eléctrico.`,
          simAction: null,
        });
      } else if (utilitiesSum > 0) {
        strengths.push(`Tus servicios del hogar (luz, agua, gas e internet) están bien controlados en ${utilitiesPct}% (${formatMoney(utilitiesSum)}).`);
      }

      if (wants > 35) {
        score -= 12;
        improvements.push({
          level: "warn",
          tag: "Deseos elevados",
          text: `Destinas ${wants}% a gustos (${formatMoney((state.income * wants) / 100)}). Recortar 5% aquí acelera tus metas.`,
          simAction: { label: "Mover 5% a Ahorro", deltas: { wants: -5, savings: 5 } },
        });
        actionSteps.push(`Fija un tope semanal para salidas y revisa suscripciones poco usadas.`);
      } else if (wants >= 15 && wants <= 30) {
        strengths.push(`Equilibrio sano en estilo de vida (${wants}%), sostenible sin privaciones.`);
      }

      if (diffPct < 0) {
        score -= 20;
        improvements.unshift({
          level: "alert",
          tag: "Déficit del " + Math.abs(diffPct) + "%",
          text: `Asignas ${totalPct}% del ingreso (exceso de ${formatMoney(Math.abs(diffAmount))}).`,
          simAction: { label: "Reequilibrar al 100% ahora", rebalance: true },
        });
        actionSteps.unshift(`Recorta ${formatMoney(Math.abs(diffAmount))} hoy mismo para no financiarte con deuda.`);
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
      actionSteps.push(`Revisa tus recibos y gastos reales el primer día de cada mes.`);
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
      utilitiesSum,
      utilitiesPct,
      score,
      verdict,
      strengths,
      improvements,
      actionSteps: actionSteps.slice(0, 4),
    };
  }

  function applySimulationAction(simAction) {
    if (!simAction) return;
    const prevScore = analyzeBudget().score;
    if (simAction.rebalance) {
      state.autoBalance = true;
      setCategoryPercent("needs", state.categories[0].percent);
      renderScene5(true, prevScore);
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
      renderScene5(true, prevScore);
    }
  }

  function renderScene5(animateScore = false, fromScore = 0) {
    const strat = STRATEGIES[state.strategy] || STRATEGIES.custom;
    const analysis = analyzeBudget();
    const r = 42;
    const circ = 2 * Math.PI * r;
    const initialScore = animateScore ? fromScore : analysis.score;
    const startOffset = circ * (1 - initialScore / 100);
    const targetOffset = circ * (1 - analysis.score / 100);
    const ringColor = analysis.score >= 80 ? "#0E6B5E" : analysis.score >= 60 ? "#D94E2A" : "#BE123C";
    const gaugeTicks = buildDialTicksMarkup(59, 59, 28, 52, 56, 7);

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

    els.s5DiagnosisContent.innerHTML = `
      <div class="diagnosis-hero">
        <div class="score-ring-wrap">
          <svg class="score-ring-svg" viewBox="0 0 118 118" width="118" height="118">
            <g class="donut-bezel-ticks">${gaugeTicks}</g>
            <circle cx="59" cy="59" r="${r}" fill="none" stroke="#ece8df" stroke-width="9" />
            <circle
              id="score-ring-arc"
              class="score-ring-arc"
              cx="59"
              cy="59"
              r="${r}"
              fill="none"
              stroke="${ringColor}"
              stroke-width="9"
              stroke-linecap="butt"
              stroke-dasharray="${circ.toFixed(2)}"
              stroke-dashoffset="${startOffset.toFixed(2)}"
            />
          </svg>
          <div class="score-ring-center">
            <strong id="s5-score-num">${initialScore}</strong>
            <span>/ 100</span>
          </div>
        </div>
        <div class="diagnosis-hero-copy">
          <h3>${escapeHtml(analysis.verdict)}</h3>
          <p>
            Con la estrategia <strong>${escapeHtml(strat.name)}</strong> sobre tu ingreso ${PERIOD_FACTORS[state.period].label} de <strong>${formatMoney(state.income, true)}</strong>,
            proyectas un ahorro anual de <strong>${formatMoney(analysis.annualSavings)}</strong>.
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
        const numEl = document.getElementById("s5-score-num");
        if (arc) arc.setAttribute("stroke-dashoffset", targetOffset.toFixed(2));
        if (numEl) animateValue(numEl, fromScore, analysis.score, 600);
      });
    }

    els.s5DiagnosisContent.querySelectorAll(".btn-simulate").forEach((btn) => {
      const idx = Number(btn.getAttribute("data-sim-idx"));
      const imp = analysis.improvements[idx];
      if (imp && imp.simAction) {
        btn.addEventListener("click", () => applySimulationAction(imp.simAction));
      }
    });
  }

  // =========================================================================
  // Escena 6: Documento Ejecutivo Imprimible
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
        <h2 class="doc-section-title">2. Desglose detallado (servicios y vida diaria)</h2>
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

  function renderScene6() {
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
    if (state.currentStep === 2) renderScene2(animate);
    if (state.currentStep === 3) renderScene3(animate);
    if (state.currentStep === 4) renderScene4(animate && state.chartMode === "bars", true);
    if (state.currentStep === 5) renderScene5(animate);
    if (state.currentStep === 6) renderScene6();
  }

  function bindEvents() {
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
      if (!state.itemsTouched) scaleItemsToTargets();
      saveState();
      renderScene1();
    });

    document.querySelectorAll(".pill-choice[data-income]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.income = Number(btn.getAttribute("data-income"));
        els.incomeInput.value = state.income;
        if (!state.itemsTouched) scaleItemsToTargets();
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
      if (!state.itemsTouched) scaleItemsToTargets();
      unlockAndGo(3);
    });

    // Escena 3
    els.btnSyncStrategy.addEventListener("click", () => {
      const strat = STRATEGIES[state.strategy];
      if (strat && strat.targets) {
        state.categories.forEach((c) => {
          c.percent = strat.targets[c.id];
        });
      }
      state.itemsTouched = false;
      scaleItemsToTargets();
      saveState();
      renderScene3(true);
    });

    els.btnS3Next.addEventListener("click", () => {
      syncPercentsFromItems();
      saveState();
      unlockAndGo(4);
    });

    // Escena 4
    els.chartModeSwitch.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        switchChartMode(tab.getAttribute("data-chart-mode"));
      });
    });

    window.addEventListener("resize", () => {
      updateDockGlider(true);
      if (state.currentStep === 4) {
        updateModeSwitchGlider(true);
      }
    });

    els.autobalanceCheckbox.addEventListener("change", (e) => {
      state.autoBalance = e.target.checked;
      if (state.autoBalance && getTotalPercent() !== 100) {
        setCategoryPercent(state.categories[0].id, state.categories[0].percent);
        return;
      }
      saveState();
      renderScene4();
    });

    els.btnS4Next.addEventListener("click", () => unlockAndGo(5));

    // Escena 5
    els.btnS5Next.addEventListener("click", () => unlockAndGo(6));

    // Escena 6
    els.reportOwnerInput.addEventListener("input", (e) => {
      state.ownerName = e.target.value;
      saveState();
      renderScene6();
    });

    els.btnPrintNow.addEventListener("click", () => {
      renderScene6();
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
  renderStepper(true);
  mountChart();
  mountMinimalSliders();
  goToStep(state.currentStep, "forward", true);
})();
