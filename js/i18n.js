const LANG_KEY = "app_lang";
let translations = {};

async function initI18n() {
    let currentLang = localStorage.getItem(LANG_KEY) || "vi";

    try {
        const response = await fetch(`../locales/${currentLang}.json`);
        translations = await response.json();
        applyTranslations();
        updateLangToggleBtn(currentLang);
    } catch (error) {
        console.error("Lỗi khi tải ngôn ngữ:", error);
    }
}

function applyTranslations() {
    // Translate text content
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (translations[key]) {
            element.innerText = translations[key];
        }
    });

    // Translate placeholders
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach(element => {
        const key = element.getAttribute("data-i18n-placeholder");
        if (translations[key]) {
            element.placeholder = translations[key];
        }
    });

    // Make available globally if needed by script.js (eg. alerts)
    window.translations = translations;
}

window.toggleLang = function () {
    const currentLang = localStorage.getItem(LANG_KEY) || "vi";
    const newLang = currentLang === "vi" ? "en" : "vi";
    localStorage.setItem(LANG_KEY, newLang);
    initI18n(); // Reload with new lang
}

function updateLangToggleBtn(lang) {
    const btn = document.getElementById("lang-toggle");
    if (btn) {
        btn.innerHTML = lang === "vi" ? "🇬🇧 EN" : "🇻🇳 VI";
    }
}

// Expose globally so components can translate strings
window.t = function (key) {
    return translations[key] || key;
}

// Chạy hàm khởi tạo
initI18n();
