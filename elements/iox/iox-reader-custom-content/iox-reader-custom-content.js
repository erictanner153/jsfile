run();
async function run() {
    const themes = FluidTopicsThemeService.listThemes();
    const lightThemeId = themes?.find(t => t.name === "theme-light")?.id;
    const darkThemeId  = themes?.find(t => t.name === "theme-dark")?.id;

    const activeTheme = FluidTopicsThemeService.getActiveTheme();
    const isLightMode = activeTheme?.id === lightThemeId;

    // Wait until the element exists (works even if rendered later)
    const el = await globalThis.FT_DOM.watchForSelector("#backgroundImage", { timeout: 15000 })
        .catch(() => null);

    if (!el) return; // component/page may not have it

    const themeClass = isLightMode ? "light-theme" : "dark-theme";
    el.classList.add(themeClass);

    if (el.parentNode) el.parentNode.style.height = "100%";
}
