// made by: @k_aljalood

const STORAGE_KEY = "roblox-custom-theme";
const ACTIVE_TAB_KEY = "roblox-active-theme-tab";
const STORAGE_CUSTOM_MAP = "roblox-custom-group-colors";
const STORAGE_LAST_NATIVE_THEME = "roblox-last-native-theme";
const STORAGE_SAVED_MODE_CLASS = "roblox-saved-mode-class";
const STORAGE_SAVED_MODE_TITLE = "roblox-saved-mode-title";

let isUpdating = false;
let isEarlyUpdating = false;
let observer = null;
let earlyObserver = null;
let earlyBodyObserver = null;
let cachedCustomColors = null;
let colorRafId = null;

const COLOR_MAP = {
  "rgb(255,255,255)": "",
  "rgb(18,18,21)": "",
  "rgb(228,39,39)": "theme-classic",

  "rgb(203,183,253)": "theme-cosmic-dust",
  "rgb(102,37,208)": "theme-cosmic-dust",

  "rgb(108,209,237)": "theme-polar-freeze",
  "rgb(6,86,132)": "theme-polar-freeze",

  "rgb(129,216,135)": "theme-super-charge",
  "rgb(4,93,74)": "theme-super-charge",

  "rgb(180,209,89)": "theme-electric-lime",
  "rgb(69,89,3)": "theme-electric-lime",

  "rgb(251,178,169)": "theme-lava-glow",
  "rgb(167,24,17)": "theme-lava-glow",

  "rgb(251,173,198)": "theme-star-burst",
  "rgb(165,9,79)": "theme-star-burst",

  "rgb(247,172,244)": "theme-pixel-pop",
  "rgb(142,31,142)": "theme-pixel-pop",

  "rgb(221,207,254)": "theme-nebula-drift",
  "rgb(72,11,152)": "theme-nebula-drift",

  "rgb(152,227,244)": "theme-nitro-frost",
  "rgb(4,59,93)": "theme-nitro-frost",

  "rgb(173,231,177)": "theme-circuit-rush",
  "rgb(4,62,50)": "theme-circuit-rush",

  "rgb(202,227,136)": "theme-kinetic-energy",
  "rgb(46,60,2)": "theme-kinetic-energy",

  "rgb(254,206,200)": "theme-inferno-blast",
  "rgb(107,15,11)": "theme-inferno-blast",

  "rgb(251,201,216)": "theme-hyper-plum",
  "rgb(113,4,55)": "theme-hyper-plum",

  "rgb(251,200,248)": "theme-quantum-pulse",
  "rgb(93,14,93)": "theme-quantum-pulse"
};

const SET1_CLASSES = [
  "theme-cosmic-dust",
  "theme-polar-freeze",
  "theme-super-charge",
  "theme-electric-lime",
  "theme-lava-glow",
  "theme-star-burst",
  "theme-pixel-pop"
];

const SET2_CLASSES = [
  "theme-nebula-drift",
  "theme-nitro-frost",
  "theme-circuit-rush",
  "theme-kinetic-energy",
  "theme-inferno-blast",
  "theme-hyper-plum",
  "theme-quantum-pulse"
];

const SET3_CLASSES = [
  "theme-classic",
  "theme-halloween-2026"
];

const isThemeClass = (cls) => {
  if (cls === "light-theme" || cls === "dark-theme" || cls === "age-roblox-theme") return false;
  return cls.startsWith("theme-") || cls.endsWith("-theme");
};

const normalizeHex = (hexStr) => {
  if (!hexStr) return "#000000";
  let h = hexStr.trim();
  if (!h.startsWith("#")) h = "#" + h;
  if (h.length === 4) {
    h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  if (/^#[0-9a-fA-F]{6}$/.test(h)) {
    return h.toLowerCase();
  }
  return "#000000";
};

const rgbToHex = (colorStr) => {
  if (!colorStr) return "";
  const str = colorStr.trim();
  if (str.startsWith("#")) {
    return normalizeHex(str);
  }
  const match = str.match(/\d+/g);
  if (match && match.length >= 3) {
    const r = parseInt(match[0], 10).toString(16).padStart(2, "0");
    const g = parseInt(match[1], 10).toString(16).padStart(2, "0");
    const b = parseInt(match[2], 10).toString(16).padStart(2, "0");
    return normalizeHex(`#${r}${g}${b}`);
  }
  return "";
};

const getCurrentThemeCssVarHex = (varName, fallback) => {
  if (!document.body) return normalizeHex(fallback);
  try {
    const val = getComputedStyle(document.body).getPropertyValue(varName);
    const hex = rgbToHex(val);
    if (hex) return normalizeHex(hex);
  } catch (e) {}
  return normalizeHex(fallback);
};

const hexToRgbValues = (hex) => {
  let c = normalizeHex(hex).replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `${r},${g},${b}`;
};

const hexToRgba = (hex, alpha) => {
  return `rgba(${hexToRgbValues(hex)},${alpha})`;
};

const CUSTOM_GROUPS = [
  {
    id: "light_surface_0",
    name: "Light Surface 1",
    getFallback: () => getCurrentThemeCssVarHex("--light-mode-surface-0", "#ffffff"),
    apply: (hex, vars) => {
      vars["--light-mode-surface-0"] = hex;
      vars["--light-mode-surface-200"] = hex;
      const rgba = hexToRgba(hex, 0.92);
      vars["--light-mode-over-media-0"] = rgba;
      vars["--light-mode-over-media-200"] = rgba;
    }
  },
  {
    id: "light_surface_100",
    name: "Light Surface 2",
    getFallback: () => getCurrentThemeCssVarHex("--light-mode-surface-100", "#f2f4f5"),
    apply: (hex, vars) => {
      vars["--light-mode-surface-100"] = hex;
      vars["--light-mode-surface-300"] = hex;
      const rgba = hexToRgba(hex, 0.92);
      vars["--light-mode-over-media-100"] = rgba;
      vars["--light-mode-over-media-300"] = rgba;
    }
  },
  {
    id: "dark_surface_0",
    name: "Dark Surface 0",
    getFallback: () => getCurrentThemeCssVarHex("--dark-mode-surface-0", "#111216"),
    apply: (hex, vars) => {
      vars["--dark-mode-surface-0"] = hex;
      vars["--dark-mode-over-media-0"] = hexToRgba(hex, 0.92);
    }
  },
  {
    id: "dark_surface_100",
    name: "Dark Surface 100",
    getFallback: () => getCurrentThemeCssVarHex("--dark-mode-surface-100", "#1b1d22"),
    apply: (hex, vars) => {
      vars["--dark-mode-surface-100"] = hex;
      vars["--dark-mode-over-media-100"] = hexToRgba(hex, 0.92);
    }
  },
  {
    id: "dark_surface_200",
    name: "Dark Surface 200",
    getFallback: () => getCurrentThemeCssVarHex("--dark-mode-surface-200", "#23252b"),
    apply: (hex, vars) => {
      vars["--dark-mode-surface-200"] = hex;
      vars["--dark-mode-over-media-200"] = hexToRgba(hex, 0.92);
    }
  },
  {
    id: "dark_surface_300",
    name: "Dark Surface 300",
    getFallback: () => getCurrentThemeCssVarHex("--dark-mode-surface-300", "#2b2d34"),
    apply: (hex, vars) => {
      vars["--dark-mode-surface-300"] = hex;
      vars["--dark-mode-over-media-300"] = hexToRgba(hex, 0.92);
    }
  },
  {
    id: "light_content",
    name: "Light Text & Content",
    getFallback: () => getCurrentThemeCssVarHex("--light-mode-content-emphasis", "#19171d"),
    apply: (hex, vars) => {
      vars["--light-mode-content-emphasis"] = hex;
      vars["--light-mode-content-default"] = hexToRgba(hex, 0.75);
      vars["--light-mode-content-muted"] = hexToRgba(hex, 0.60);
    }
  },
  {
    id: "dark_content",
    name: "Dark Text & Content",
    getFallback: () => getCurrentThemeCssVarHex("--dark-mode-content-emphasis", "#ffffff"),
    apply: (hex, vars) => {
      vars["--dark-mode-content-emphasis"] = hex;
      vars["--dark-mode-content-default"] = hexToRgba(hex, 0.85);
      vars["--dark-mode-content-muted"] = hexToRgba(hex, 0.65);
    }
  },
  {
    id: "light_nav_bar",
    name: "Light Nav Bar",
    getFallback: () => getCurrentThemeCssVarHex("--light-mode-common-navigation-bar", "#ffffff"),
    apply: (hex, vars) => {
      vars["--light-mode-common-navigation-bar"] = hex;
    }
  },
  {
    id: "dark_nav_bar",
    name: "Dark Nav Bar",
    getFallback: () => getCurrentThemeCssVarHex("--dark-mode-common-navigation-bar", "#111216"),
    apply: (hex, vars) => {
      vars["--dark-mode-common-navigation-bar"] = hex;
    }
  },
  {
    id: "light_shift",
    name: "Light Shift & Stroke",
    getFallback: () => getCurrentThemeCssVarHex("--light-mode-stroke-emphasis", "#39334d"),
    apply: (hex, vars) => {
      const rgb = hexToRgbValues(hex);
      vars["--light-mode-shift-100"] = `rgba(${rgb},.04)`;
      vars["--light-mode-shift-200"] = `rgba(${rgb},.08)`;
      vars["--light-mode-shift-300"] = `rgba(${rgb},.12)`;
      vars["--light-mode-shift-400"] = `rgba(${rgb},.16)`;
      vars["--light-mode-stroke-muted"] = `rgba(${rgb},.08)`;
      vars["--light-mode-stroke-default"] = `rgba(${rgb},.12)`;
      vars["--light-mode-stroke-emphasis"] = `rgba(${rgb},.16)`;
    }
  },
  {
    id: "dark_shift",
    name: "Dark Shift & Stroke",
    getFallback: () => getCurrentThemeCssVarHex("--dark-mode-stroke-emphasis", "#eee7ff"),
    apply: (hex, vars) => {
      const rgb = hexToRgbValues(hex);
      vars["--dark-mode-shift-100"] = `rgba(${rgb},.04)`;
      vars["--dark-mode-shift-200"] = `rgba(${rgb},.08)`;
      vars["--dark-mode-shift-300"] = `rgba(${rgb},.12)`;
      vars["--dark-mode-shift-400"] = `rgba(${rgb},.16)`;
      vars["--dark-mode-stroke-muted"] = `rgba(${rgb},.08)`;
      vars["--dark-mode-stroke-default"] = `rgba(${rgb},.12)`;
      vars["--dark-mode-stroke-emphasis"] = `rgba(${rgb},.16)`;
    }
  }
];

const TITLE_TEXTS = {
  en: "Theme",
  ar: "السمة",
  id: "Tema",
  de: "Design",
  es: "Tema",
  fr: "Thème",
  it: "Tema",
  pl: "Motyw",
  pt: "Tema",
  vi: "Chủ đề",
  tr: "Tema",
  hi: "थीम",
  th: "ธีม",
  zh: "主题",
  zh_cn: "主题",
  zh_tw: "主題",
  zh_hans: "主题",
  zh_hant: "主題",
  ja: "テーマ",
  ko: "테마",
  ms: "Tema",
  nb: "Tema",
  no: "Tema",
  sr: "Тема",
  da: "Tema",
  et: "Teema",
  fil: "Tema",
  tl: "Tema",
  hr: "Tema",
  lv: "Motīvs",
  lt: "Tema",
  hu: "Téma",
  nl: "Thema",
  ro: "Temă",
  sq: "Tema",
  sl: "Tema",
  sk: "Téma",
  fi: "Teema",
  sv: "Tema",
  uk: "Тема",
  cs: "Motiv",
  el: "Θέμα",
  bs: "Tema",
  bg: "Тема",
  ru: "Тема",
  kk: "Тақырып",
  bn: "থিম",
  si: "තේමාව",
  my: "အပြင်အဆင်",
  ka: "თემა",
  km: "ស្បែក"
};

const DESCRIPTION_TEXTS = {
  en: "Select a custom theme to personalize your Roblox experience.",
  ar: "حدد سمة مخصصة لتخصيص تجربتك في روبلوكس.",
  id: "Pilih tema kustom untuk menyesuaikan pengalaman Roblox Anda.",
  de: "Wähle ein benutzerdefiniertes Design, um dein Roblox-Erlebnis anzupassen.",
  es: "Selecciona un tema personalizado para personalizar tu experiencia en Roblox.",
  fr: "Sélectionnez un thème personnalisé pour personnaliser votre expérience Roblox.",
  it: "Seleziona un tema personalizzato per personalizzare la tua esperienza su Roblox.",
  pl: "Wybierz niestandardowy motyw, aby spersonalizować swoje doświadczenie w Roblox.",
  pt: "Selecione um tema personalizado para personalizar sua experiência no Roblox.",
  vi: "Chọn chủ đề tùy chỉnh để cá nhân hóa trải nghiệm Roblox của bạn.",
  tr: "Roblox deneyiminizi özelleştirmek için özel bir tema seçin.",
  hi: "अपने Roblox अनुभव को वैयक्तिकृत करने के लिए एक कस्टम थीम चुनें।",
  th: "เลือกธีมที่กำหนดเองเพื่อปรับแต่งประสบการณ์ Roblox ของคุณ",
  zh: "选择自定义主题以个性化您的 Roblox 体验。",
  zh_cn: "选择自定义主题以个性化您的 Roblox 体验。",
  zh_tw: "選擇自訂主題以個人化您的 Roblox 體驗。",
  zh_hans: "选择自定义主题以个性化您的 Roblox 体验。",
  zh_hant: "選擇自訂主題以個人化您的 Roblox 體驗。",
  ja: "カスタムテーマを選択して、Roblox体験をカスタマイズしましょう。",
  ko: "사용자 지정 테마를 선택하여 Roblox 체험을 맞춤화하세요.",
  ms: "Pilih tema tersuai untuk memperibadikan pengalaman Roblox anda.",
  nb: "Velg et tilpasset tema for å tilpasse Roblox-opplevelsen din.",
  no: "Velg et tilpasset tema for å tilpasse Roblox-opplevelsen din.",
  sr: "Изаберите прилагођену тему да бисте персонализовали своје Roblox искуство.",
  da: "Vælg et brugerdefineret tema for at tilpasse din Roblox-oplevelse.",
  et: "Valige Robloxi kogemuse isikupärastamiseks kohandatud teema.",
  fil: "Pumili ng pasadyang tema para i-personalize ang iyong karanasan sa Roblox.",
  tl: "Pumili ng pasadyang tema para i-personalize ang iyong karanasan sa Roblox.",
  hr: "Odaberite prilagođenu temu kako biste personalizirali svoje Roblox iskustvo.",
  lv: "Atlasiet pielāgotu motīvu, lai personalizētu savu Roblox pieredzi.",
  lt: "Pasirinkite pasirinktinę temą, kad pritaikytumėte savo „Roblox“ patirtį.",
  hu: "Válasszon egy egyéni témát a Roblox-élmény testreszabásához.",
  nl: "Selecteer een aangepast thema om je Roblox-ervaring te personaliseren.",
  ro: "Selectează o temă personalizată pentru a-ți personaliza experiența Roblox.",
  sq: "Zgjidhni një temë të personalizuar për të personalizuar përvojën tuaj në Roblox.",
  sl: "Izberite temo po meri, da prilagodite svojo izkušnjo Roblox.",
  sk: "Vyberte si vlastnú tému a prispôsobte si zážitok z Robloxu.",
  fi: "Valitse mukautettu teema mukauttaaksesi Roblox-kokemustasi.",
  sv: "Välj ett anpassat tema för att anpassa din Roblox-upplevelse.",
  uk: "Виберіть власну тему, щоб налаштувати свій досвід у Roblox.",
  cs: "Vyberte si vlastní motiv a přizpůsobte si zážitek z Robloxu.",
  el: "Επιλέξτε ένα προσαρμοσμένο θέμα για να προσαρμόσετε την εμπειρία σας στο Roblox.",
  bs: "Odaberite prilagođenu temu da biste personalizirali svoje Roblox iskustvo.",
  bg: "Изберете персонализирана тема, за да персонализирате вашето изживяване в Roblox.",
  ru: "Выберите пользовательскую тему, чтобы настроить Roblox по своему вкусу.",
  kk: "Roblox тәжірибеңізді жекелендіру үшін арнайы тақырыпты таңдаңыз.",
  bn: "আপনার Roblox অভিজ্ঞতা ব্যক্তিগতকৃত করতে একটি কাস্টম থিম নির্বাচন করুন।",
  si: "ඔබගේ Roblox අත්දැකීම පුද්ගලීකරණය කිරීමට අභිරුචි තේමාව තෝරන්න.",
  my: "သင်၏ Roblox အတွေ့အကြုံကို စိတ်ကြိုက်ပြင်ဆင်ရန် စိတ်ကြိုက် အပြင်အဆင်တစ်ခုကို ရွေးချယ်ပါ။",
  ka: "აირჩიეთ პერსონალური თემა თქვენი Roblox გამოცდილების პერსონალიზაციისთვის.",
  km: "ជ្រើសរើសស្បែកផ្ទាល់ខ្លួនដើម្បីប្ដូរបទពិសោធន៍ Roblox របស់អ្នក។"
};

const CUSTOM_TAB_TEXTS = {
  en: "Custom",
  ar: "مخصص",
  id: "Kustom",
  de: "Benutzerdefiniert",
  es: "Personalizado",
  fr: "Personnalisé",
  it: "Personalizzato",
  pl: "Niestandardowy",
  pt: "Personalizado",
  vi: "Tùy chỉnh",
  tr: "Özel",
  hi: "कस्टम",
  th: "กำหนดเอง",
  zh: "自定义",
  zh_cn: "自定义",
  zh_tw: "自訂",
  zh_hans: "自定义",
  zh_hant: "自訂",
  ja: "カスタム",
  ko: "사용자 지정",
  ms: "Tersuai",
  nb: "Tilpasset",
  no: "Tilpasset",
  sr: "Прилагођено",
  da: "Brugerdefineret",
  et: "Kohandatud",
  fil: "Pasadya",
  tl: "Pasadya",
  hr: "Prilagođeno",
  lv: "Pielāgots",
  lt: "Pasirinktinis",
  hu: "Egyéni",
  nl: "Aangepast",
  ro: "Personalizat",
  sq: "E personalizuar",
  sl: "Po meri",
  sk: "Vlastné",
  fi: "Mukautettu",
  sv: "Anpassat",
  uk: "Власна",
  cs: "Vlastní",
  el: "Προσαρμοσμένο",
  bs: "Prilagođeno",
  bg: "Персонализирана",
  ru: "Пользовательская",
  kk: "Арнайы",
  bn: "কাস্টম",
  si: "අභිරුචි",
  my: "စိတ်ကြိုက်",
  ka: "პერსონალური",
  km: "ផ្ទាល់ខ្លួន"
};

const getCustomGroupColors = () => {
  if (!cachedCustomColors) {
    try {
      cachedCustomColors = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_MAP)) || {};
    } catch (e) {
      cachedCustomColors = {};
    }
  }
  return cachedCustomColors;
};

const setCustomGroupColorInMemory = (groupId, hex) => {
  const map = getCustomGroupColors();
  map[groupId] = normalizeHex(hex);
};

const saveCustomGroupColorsToStorage = () => {
  if (cachedCustomColors) {
    localStorage.setItem(STORAGE_CUSTOM_MAP, JSON.stringify(cachedCustomColors));
  }
};

const populateCustomColorsFromCurrentTheme = () => {
  const map = getCustomGroupColors();
  let changed = false;

  CUSTOM_GROUPS.forEach((group) => {
    if (!map[group.id]) {
      map[group.id] = normalizeHex(group.getFallback());
      changed = true;
    }
  });

  if (changed) {
    cachedCustomColors = map;
    localStorage.setItem(STORAGE_CUSTOM_MAP, JSON.stringify(map));
  }
};

const updateCustomThemeCSS = () => {
  const savedMap = getCustomGroupColors();
  const vars = {};

  CUSTOM_GROUPS.forEach((group) => {
    const hex = normalizeHex(savedMap[group.id] || group.getFallback());
    group.apply(hex, vars);
  });

  let rules = "body.custom-user-theme {\n";
  for (const [k, v] of Object.entries(vars)) {
    rules += `  ${k}: ${v};\n`;
  }
  rules += "}\n";

  let styleEl = document.getElementById("roblox-custom-user-theme-variables");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "roblox-custom-user-theme-variables";
    (document.head || document.documentElement).appendChild(styleEl);
  }

  if (styleEl.textContent !== rules) {
    styleEl.textContent = rules;
  }
};

injectCustomStyles();

function injectCustomStyles() {
  if (document.getElementById("roblox-custom-theme-style")) return;
  const style = document.createElement("style");
  style.id = "roblox-custom-theme-style";
  style.textContent = `
    button[data-testid="app-theme-card"] .icon-regular-roblox-plus,
    div:has(> .icon-regular-roblox-plus),
    [data-testid="app-theme-upsell"],
    div:has(> [data-testid="app-theme-upsell"]),
    div:has(> div > [data-testid="app-theme-upsell"]) {
      display: none !important;
    }
    .roblox-custom-picker-overlay {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      opacity: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      outline: none !important;
      background: transparent !important;
      cursor: pointer !important;
      z-index: 10 !important;
    }
    div[data-testid="custom-theme-grid"] {
      margin-bottom: 40px !important;
    }
    .settings-container-v2,
    #react-user-account-base {
      height: auto !important;
      min-height: min-content !important;
      overflow: visible !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

const getLangCode = () => {
  let code = "";
  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    code = htmlLang.toLowerCase().replace("-", "_");
  } else {
    const meta = document.querySelector('meta[name="locale-data"]');
    if (meta) {
      code = (meta.getAttribute("data-language-code") || "").toLowerCase().replace("-", "_");
    }
  }
  return code;
};

const getAppThemeSection = () => {
  const tabGroup = document.querySelector('div[role="group"][aria-label="App theme"], div[role="group"]');
  if (tabGroup) {
    const subSection = tabGroup.closest("section");
    if (subSection && subSection.parentElement) {
      const outerSection = subSection.parentElement.closest("section:not(.settings-container-v2)");
      if (outerSection) return outerSection;
    }
    if (subSection && !subSection.classList.contains("settings-container-v2")) {
      return subSection;
    }
  }
  const card = document.querySelector('button[data-testid="app-theme-card"]:not([data-custom-card="true"])');
  if (card) {
    const subSection = card.closest("section:not(.settings-container-v2)");
    if (subSection && subSection.parentElement) {
      const outerSection = subSection.parentElement.closest("section:not(.settings-container-v2)");
      if (outerSection) return outerSection;
    }
    return subSection;
  }
  return null;
};

const getExclusiveGrid = () => {
  const section = getAppThemeSection();
  if (!section) return null;
  const tabGroup = section.querySelector('div[role="group"][aria-label="App theme"], div[role="group"]');
  if (tabGroup) {
    const parent = tabGroup.closest("section") || tabGroup.parentElement;
    if (parent) {
      const grid = parent.querySelector('div.grid:not([data-testid="custom-theme-grid"])');
      if (grid) return grid;
    }
  }
  const grids = section.querySelectorAll('div.grid:not([data-testid="custom-theme-grid"])');
  if (grids.length > 1) {
    return grids[grids.length - 1];
  }
  return grids[0] || null;
};

const updateTitleText = () => {
  const section = getAppThemeSection();
  const titleEl = section ? section.querySelector("h3, .text-title-large") : null;
  if (!titleEl) return;
  const fullCode = getLangCode();
  const baseCode = fullCode.split("_")[0];
  const text = TITLE_TEXTS[fullCode] || TITLE_TEXTS[baseCode] || TITLE_TEXTS.en;
  if (text && titleEl.textContent !== text) {
    titleEl.textContent = text;
  }
};

const updateDescriptionText = () => {
  const section = getAppThemeSection();
  if (!section) return;
  const p = section.querySelector("p");
  if (!p) return;
  const fullCode = getLangCode();
  const baseCode = fullCode.split("_")[0];
  const text = DESCRIPTION_TEXTS[fullCode] || DESCRIPTION_TEXTS[baseCode] || DESCRIPTION_TEXTS.en;
  if (text && p.textContent !== text) {
    p.textContent = text;
  }
};

const updateCustomTabText = () => {
  const tabSpan = document.querySelector('button[data-custom-tab="true"] span.padding-y-xsmall');
  if (!tabSpan) return;
  const fullCode = getLangCode();
  const baseCode = fullCode.split("_")[0];
  const text = CUSTOM_TAB_TEXTS[fullCode] || CUSTOM_TAB_TEXTS[baseCode] || CUSTOM_TAB_TEXTS.en;
  if (text && tabSpan.textContent !== text) {
    tabSpan.textContent = text;
  }
};

const applyEarlyTheme = () => {
  if (isEarlyUpdating) return;
  isEarlyUpdating = true;

  try {
    const currentTheme = localStorage.getItem(STORAGE_KEY);
    if (currentTheme === "custom-user-theme") {
      updateCustomThemeCSS();
    }
    if (!document.body) return;

    const list = document.body.classList;
    Array.from(list).forEach((cls) => {
      if (isThemeClass(cls) && cls !== currentTheme) {
        list.remove(cls);
      }
    });

    if (currentTheme && !list.contains(currentTheme)) {
      list.add(currentTheme);
    }

    if (currentTheme === "theme-halloween-2026") {
      if (list.contains("light-theme")) {
        list.remove("light-theme");
        list.add("dark-theme");
      }
    } else {
      const savedMode = localStorage.getItem(STORAGE_SAVED_MODE_CLASS);
      if (savedMode && !list.contains(savedMode)) {
        list.remove("light-theme", "dark-theme");
        list.add(savedMode);
      }
    }
  } finally {
    isEarlyUpdating = false;
  }
};

const onBodyAvailable = () => {
  applyEarlyTheme();
  if (!earlyBodyObserver && document.body) {
    earlyBodyObserver = new MutationObserver(() => {
      applyEarlyTheme();
    });
    earlyBodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }
};

applyEarlyTheme();

if (!document.body) {
  earlyObserver = new MutationObserver(() => {
    if (document.body) {
      onBodyAvailable();
    }
  });
  earlyObserver.observe(document.documentElement, { childList: true });
} else {
  onBodyAvailable();
}

const getCardThemeClass = (card) => {
  if (card.querySelector('[class*="e92127"], [class*="0242dc"]')) {
    return "theme-halloween-2026";
  }

  const colorSpan = card.querySelector("span[style*='background-color']") ||
                    card.querySelector(".radius-circle span") ||
                    card.querySelector(".radius-circle");
  if (colorSpan) {
    let bg = colorSpan.style.backgroundColor;
    if (!bg) {
      try {
        bg = window.getComputedStyle(colorSpan).backgroundColor;
      } catch (e) {}
    }
    if (!bg) {
      bg = colorSpan.getAttribute("style") || "";
    }
    const match = bg.match(/rgb\(\s*\d+\s*,\s*\d+\s*\)/i);
    if (match) {
      const normalized = match[0].replace(/\s+/g, "").toLowerCase();
      if (normalized in COLOR_MAP) {
        return COLOR_MAP[normalized];
      }
    }
  }

  const label = (card.querySelector(".content-default, span:last-child")?.textContent || "").trim().toLowerCase();
  if (label === "default") return "";
  if (label === "the hollow" || label.includes("hollow")) return "theme-halloween-2026";
  if (label === "classic") return "theme-classic";
  if (label === "cosmic dust") return "theme-cosmic-dust";
  if (label === "polar freeze") return "theme-polar-freeze";
  if (label === "super charge") return "theme-super-charge";
  if (label === "electric lime") return "theme-electric-lime";
  if (label === "lava glow") return "theme-lava-glow";
  if (label === "star burst") return "theme-star-burst";
  if (label === "pixel pop") return "theme-pixel-pop";
  if (label === "nebula drift") return "theme-nebula-drift";
  if (label === "nitro frost") return "theme-nitro-frost";
  if (label === "circuit rush") return "theme-circuit-rush";
  if (label === "kinetic energy") return "theme-kinetic-energy";
  if (label === "inferno blast") return "theme-inferno-blast";
  if (label === "hyper plum") return "theme-hyper-plum";
  if (label === "quantum pulse") return "theme-quantum-pulse";

  const parent = card.parentElement;
  if (parent) {
    const exclusiveGrid = getExclusiveGrid();
    const cards = Array.from(parent.querySelectorAll('button[data-testid="app-theme-card"]'));
    const index = cards.indexOf(card);
    if (index >= 0) {
      if (exclusiveGrid && parent !== exclusiveGrid) {
        if (index === 0) return "";
        if (index === 1) return "theme-halloween-2026";
      }
      const section = getAppThemeSection();
      const tabGroup = section ? section.querySelector('div[role="group"]') : null;
      if (tabGroup) {
        const tabs = tabGroup.querySelectorAll('button:not([data-custom-tab="true"])');
        if (tabs.length >= 3 && tabs[2].getAttribute("aria-pressed") === "true") {
          return SET3_CLASSES[index] || "";
        }
        if (tabs.length >= 2 && tabs[1].getAttribute("aria-pressed") === "true") {
          return SET2_CLASSES[index] || "";
        }
      }
      return SET1_CLASSES[index] || "";
    }
  }

  return "";
};

const updateModeUI = () => {
  const modeBtn = document.querySelector('button[role="combobox"][aria-labelledby="app-theme-mode-heading"]');
  if (!modeBtn) return;
  const modeContainer = modeBtn.closest(".fill.basis-0") || modeBtn.parentElement;
  const modeLabel = modeBtn.querySelector(".foundation-web-menu-item-title");
  const isHollow = (localStorage.getItem(STORAGE_KEY) === "theme-halloween-2026");

  if (isHollow) {
    if (modeContainer) {
      modeContainer.classList.add("opacity-[0.5]", "pointer-events-none");
    }
    if (!modeBtn.hasAttribute("disabled")) {
      modeBtn.setAttribute("disabled", "");
    }
    if (!modeBtn.hasAttribute("data-disabled")) {
      modeBtn.setAttribute("data-disabled", "");
    }
    if (modeLabel && modeLabel.textContent !== "Dark") {
      modeLabel.textContent = "Dark";
    }
    if (document.body && document.body.classList.contains("light-theme")) {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
    }
  } else {
    if (modeContainer) {
      modeContainer.classList.remove("opacity-[0.5]", "pointer-events-none");
    }
    if (modeBtn.hasAttribute("disabled")) {
      modeBtn.removeAttribute("disabled");
    }
    if (modeBtn.hasAttribute("data-disabled")) {
      modeBtn.removeAttribute("data-disabled");
    }

    const savedTitle = localStorage.getItem(STORAGE_SAVED_MODE_TITLE);
    const savedClass = localStorage.getItem(STORAGE_SAVED_MODE_CLASS);

    let targetTitle = savedTitle;
    if (!targetTitle && savedClass) {
      targetTitle = savedClass === "light-theme" ? "Light" : "Dark";
    }

    if (targetTitle && modeLabel && modeLabel.textContent !== targetTitle) {
      modeLabel.textContent = targetTitle;
    }

    if (savedClass && document.body && !document.body.classList.contains(savedClass)) {
      document.body.classList.remove("light-theme", "dark-theme");
      document.body.classList.add(savedClass);
    }

    if (savedTitle) {
      localStorage.removeItem(STORAGE_SAVED_MODE_TITLE);
    }
    if (savedClass) {
      localStorage.removeItem(STORAGE_SAVED_MODE_CLASS);
    }
  }
};

const applyTheme = () => {
  if (!document.body) return;
  const currentTheme = localStorage.getItem(STORAGE_KEY);

  const customClasses = Array.from(document.body.classList).filter(
    (cls) => isThemeClass(cls)
  );

  if (currentTheme) {
    if (currentTheme === "custom-user-theme") {
      updateCustomThemeCSS();
    }
    customClasses.forEach((cls) => {
      if (cls !== currentTheme) document.body.classList.remove(cls);
    });
    if (!document.body.classList.contains(currentTheme)) {
      document.body.classList.add(currentTheme);
    }
    if (currentTheme === "theme-halloween-2026") {
      if (document.body.classList.contains("light-theme")) {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
      }
    }
  } else {
    customClasses.forEach((cls) => document.body.classList.remove(cls));
  }
};

const updateTabStyles = (group) => {
  const activeTab = localStorage.getItem(ACTIVE_TAB_KEY) || "native";
  const tabs = Array.from(group.querySelectorAll("button"));
  const nativeTabs = tabs.filter((t) => t.getAttribute("data-custom-tab") !== "true");
  const hasActiveNative = nativeTabs.some((t) => t.getAttribute("aria-pressed") === "true");

  const activeClass = "bg-inverse-surface-0 content-inverse-emphasis relative clip group/interactable focus-visible:outline-focus disabled:outline-none cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium";
  const inactiveClass = "bg-shift-300 content-action-utility relative clip group/interactable focus-visible:outline-focus disabled:outline-none cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium";

  tabs.forEach((tab) => {
    const isCustom = tab.getAttribute("data-custom-tab") === "true";
    let isActive = false;

    if (activeTab === "custom") {
      isActive = isCustom;
      if (!isCustom) {
        tab.className = inactiveClass;
        return;
      }
    } else {
      if (!isCustom) {
        if (!hasActiveNative && tab === nativeTabs[0]) {
          isActive = true;
        } else {
          isActive = tab.getAttribute("aria-pressed") === "true";
        }
      } else {
        isActive = false;
      }
    }

    tab.setAttribute("aria-pressed", isActive ? "true" : "false");
    tab.className = isActive ? activeClass : inactiveClass;
  });
};

const renderCustomCardsGrid = (container) => {
  const savedMap = getCustomGroupColors();
  const stateKey = JSON.stringify(savedMap);

  if (container.getAttribute("data-state-key") === stateKey) return;
  container.setAttribute("data-state-key", stateKey);

  const existingCards = container.querySelectorAll('[data-custom-card="true"]');
  if (existingCards.length === CUSTOM_GROUPS.length) {
    CUSTOM_GROUPS.forEach((group, index) => {
      const card = existingCards[index];
      const currentHex = normalizeHex(savedMap[group.id] || group.getFallback());
      const input = card.querySelector("input.roblox-custom-picker-overlay");
      if (input && input.value !== currentHex) {
        input.value = currentHex;
      }
      const span = card.querySelector("span.radius-circle");
      if (span) {
        span.style.backgroundColor = currentHex;
      }
    });
    return;
  }

  container.innerHTML = "";

  CUSTOM_GROUPS.forEach((group) => {
    const currentHex = normalizeHex(savedMap[group.id] || group.getFallback());

    const btn = document.createElement("div");
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("data-testid", "app-theme-card");
    btn.setAttribute("data-custom-card", "true");
    btn.setAttribute("data-group-id", group.id);
    btn.setAttribute("aria-pressed", "false");
    btn.className = "relative overflow-hidden flex items-center gap-small width-full padding-medium radius-medium text-align-x-start stroke-standard cursor-pointer bg-none stroke-emphasis";

    btn.innerHTML = `
      <input type="color" value="${currentHex}" data-group-id="${group.id}" class="roblox-custom-picker-overlay">
      <span aria-hidden="true" class="shrink-0 size-800 radius-circle stroke-standard stroke-muted" style="background-color: ${currentHex};"></span>
      <span class="fill basis-0 min-width-0 text-no-wrap text-truncate-end text-body-medium content-default">${group.name}</span>
    `;

    container.appendChild(btn);
  });
};

const setupCustomTabAndGrid = () => {
  const section = getAppThemeSection();
  if (!section) return;

  const tabGroup = section.querySelector('div[role="group"][aria-label="App theme"], div[role="group"]');
  if (tabGroup) {
    let customTab = tabGroup.querySelector('button[data-custom-tab="true"]');
    if (!customTab) {
      customTab = document.createElement("button");
      customTab.type = "button";
      customTab.setAttribute("data-custom-tab", "true");
      customTab.setAttribute("aria-pressed", "false");
      customTab.style.textDecoration = "none";
      customTab.className = "bg-shift-300 content-action-utility relative clip group/interactable focus-visible:outline-focus disabled:outline-none cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium";
      customTab.innerHTML = `
        <div aria-hidden="true" data-testid="foundation-web-state-layer" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none"></div>
        <span class="padding-y-xsmall text-no-wrap text-truncate-end">Custom</span>
      `;
      tabGroup.appendChild(customTab);
    }
    updateTabStyles(tabGroup);
  }

  const nativeGrid = getExclusiveGrid();
  if (!nativeGrid) return;

  const allGrids = section.querySelectorAll('div.grid:not([data-testid="custom-theme-grid"])');
  allGrids.forEach((g) => {
    if (g !== nativeGrid && g.style.display === "none") {
      g.style.display = "";
    }
  });

  let customGrid = document.querySelector('div[data-testid="custom-theme-grid"]');
  if (!customGrid) {
    customGrid = document.createElement("div");
    customGrid.className = "grid gap-medium [grid-template-columns:repeat(2,minmax(0,1fr))]";
    customGrid.setAttribute("data-testid", "custom-theme-grid");
  }
  if (nativeGrid.nextSibling !== customGrid) {
    nativeGrid.parentNode.insertBefore(customGrid, nativeGrid.nextSibling);
  }

  const activeTab = localStorage.getItem(ACTIVE_TAB_KEY) || "native";
  if (activeTab === "custom") {
    nativeGrid.style.display = "none";
    customGrid.style.display = "grid";
    renderCustomCardsGrid(customGrid);
  } else {
    nativeGrid.style.display = "";
    customGrid.style.display = "none";
  }
};

const updateCardsUI = () => {
  const cards = document.querySelectorAll('button[data-testid="app-theme-card"]:not([data-custom-card="true"])');
  if (!cards.length) return;
  const savedClass = localStorage.getItem(STORAGE_KEY) || "";

  cards.forEach((card) => {
    const themeClass = getCardThemeClass(card);
    const isSelected = savedClass ? themeClass === savedClass : themeClass === "";

    if (isSelected) {
      if (card.getAttribute("aria-pressed") !== "true") card.setAttribute("aria-pressed", "true");
      if (!card.classList.contains("bg-shift-200")) card.classList.add("bg-shift-200", "stroke-[var(--color-system-neutral)]");
      if (card.classList.contains("bg-none")) card.classList.remove("bg-none", "stroke-emphasis");
    } else {
      if (card.getAttribute("aria-pressed") !== "false") card.setAttribute("aria-pressed", "false");
      if (!card.classList.contains("bg-none")) card.classList.add("bg-none", "stroke-emphasis");
      if (card.classList.contains("bg-shift-200")) card.classList.remove("bg-shift-200", "stroke-[var(--color-system-neutral)]");
    }
  });
};

const init = () => {
  if (isUpdating) return;
  isUpdating = true;

  if (observer) {
    observer.disconnect();
  }

  try {
    injectCustomStyles();
    updateModeUI();
    applyTheme();
    setupCustomTabAndGrid();
    updateCardsUI();
    updateDescriptionText();
    updateTitleText();
    updateCustomTabText();
  } finally {
    if (observer) {
      observer.takeRecords();
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }
    isUpdating = false;
  }
};

window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_CUSTOM_MAP) {
    cachedCustomColors = null;
  }
  if (e.key === STORAGE_KEY || e.key === ACTIVE_TAB_KEY || e.key === STORAGE_CUSTOM_MAP || e.key === STORAGE_LAST_NATIVE_THEME || e.key === STORAGE_SAVED_MODE_CLASS) {
    init();
  }
});

document.addEventListener("click", (e) => {
  const customTab = e.target.closest('button[data-custom-tab="true"]');
  if (customTab) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    populateCustomColorsFromCurrentTheme();
    localStorage.setItem(ACTIVE_TAB_KEY, "custom");
    localStorage.setItem(STORAGE_KEY, "custom-user-theme");
    init();
    return;
  }

  const customCard = e.target.closest('[data-custom-card="true"]');
  if (customCard) {
    localStorage.setItem(STORAGE_KEY, "custom-user-theme");
    applyTheme();
    const input = customCard.querySelector("input.roblox-custom-picker-overlay");
    if (input && e.target !== input) {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.click();
      }
    }
    return;
  }

  const card = e.target.closest('button[data-testid="app-theme-card"]:not([data-custom-card="true"])');
  if (card) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const themeClass = getCardThemeClass(card);

    if (themeClass === "theme-halloween-2026") {
      if (!localStorage.getItem(STORAGE_SAVED_MODE_CLASS)) {
        const modeLabel = document.querySelector('button[role="combobox"][aria-labelledby="app-theme-mode-heading"] .foundation-web-menu-item-title');
        const isLight = (document.body && document.body.classList.contains("light-theme")) || (modeLabel && modeLabel.textContent.trim().toLowerCase() === "light");
        const curMode = isLight ? "light-theme" : "dark-theme";
        localStorage.setItem(STORAGE_SAVED_MODE_CLASS, curMode);
        if (modeLabel) {
          const txt = modeLabel.textContent.trim();
          if (txt && txt.toLowerCase() !== "dark") {
            localStorage.setItem(STORAGE_SAVED_MODE_TITLE, txt);
          } else {
            localStorage.setItem(STORAGE_SAVED_MODE_TITLE, isLight ? "Light" : "Dark");
          }
        } else {
          localStorage.setItem(STORAGE_SAVED_MODE_TITLE, isLight ? "Light" : "Dark");
        }
      }
    }

    if (themeClass) {
      localStorage.setItem(STORAGE_KEY, themeClass);
      localStorage.setItem(STORAGE_LAST_NATIVE_THEME, themeClass);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_LAST_NATIVE_THEME);
    }
    init();
    return;
  }

  const group = e.target.closest('div[role="group"]');
  const isThemeGroup = group && (
    group.getAttribute("aria-label") === "App theme" ||
    group.querySelector('button[data-custom-tab="true"]') ||
    (group.closest("section") && group.closest("section").querySelector('button[data-testid="app-theme-card"]'))
  );

  if (isThemeGroup) {
    const nativeTab = e.target.closest('button:not([data-custom-tab="true"])');
    if (nativeTab && group.contains(nativeTab)) {
      group.querySelectorAll('button:not([data-custom-tab="true"])').forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === nativeTab ? "true" : "false");
      });
      localStorage.setItem(ACTIVE_TAB_KEY, "native");
      const lastNative = localStorage.getItem(STORAGE_LAST_NATIVE_THEME) || "";
      if (lastNative) {
        localStorage.setItem(STORAGE_KEY, lastNative);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      init();
      return;
    }
  }
}, true);

document.addEventListener("input", (e) => {
  if (e.target && e.target.classList.contains("roblox-custom-picker-overlay")) {
    const groupId = e.target.getAttribute("data-group-id");
    const hex = normalizeHex(e.target.value);
    setCustomGroupColorInMemory(groupId, hex);
    localStorage.setItem(STORAGE_KEY, "custom-user-theme");

    const card = e.target.closest('[data-custom-card="true"]');
    if (card) {
      const span = card.querySelector("span.radius-circle");
      if (span) span.style.backgroundColor = hex;
    }

    if (!colorRafId) {
      colorRafId = requestAnimationFrame(() => {
        colorRafId = null;
        updateCustomThemeCSS();
      });
    }
  }
});

document.addEventListener("change", (e) => {
  if (e.target && e.target.classList.contains("roblox-custom-picker-overlay")) {
    saveCustomGroupColorsToStorage();
    init();
  }
});

observer = new MutationObserver((mutations) => {
  if (isUpdating) return;

  let shouldUpdate = false;
  for (const m of mutations) {
    if (m.target.closest && (m.target.closest('[data-testid="custom-theme-grid"]') || m.target.closest('button[data-custom-tab="true"]'))) {
      continue;
    }
    if (m.target === document.body && m.attributeName === "class") {
      shouldUpdate = true;
      break;
    }
    if (m.addedNodes.length > 0) {
      shouldUpdate = true;
      break;
    }
  }

  if (shouldUpdate) {
    init();
  }
});

const startObserver = () => {
  if (earlyObserver) {
    earlyObserver.disconnect();
    earlyObserver = null;
  }
  if (earlyBodyObserver) {
    earlyBodyObserver.disconnect();
    earlyBodyObserver = null;
  }
  init();
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startObserver);
} else {
  startObserver();
}