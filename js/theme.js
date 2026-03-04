const THEME_KEY = "app_theme";

function initTheme() {
    // 1. Check local storage
    let currentTheme = localStorage.getItem(THEME_KEY);

    // 2. If not in local storage, check system preference
    if (!currentTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = "dark";
        } else {
            currentTheme = "light";
        }
    }

    // 3. Apply theme
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggleBtn(theme);
}

function updateThemeToggleBtn(theme) {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
        btn.innerHTML = theme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

document.addEventListener("click", (e) => {
    if (e.target.closest("#theme-toggle")) {
        const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(newTheme);
    }
});

// Chạy hàm khởi tạo theme khi load file
initTheme();
