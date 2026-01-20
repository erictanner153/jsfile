run();

async function run() {
    // wait until FT theme service exists
    while (!window.FluidTopicsThemeService?.listThemes) {
        await new Promise(r => setTimeout(r, 100));
    }

    const themes = FluidTopicsThemeService.listThemes?.() || [];
    const lightThemeId = themes.find(t => t.name === "theme-light")?.id;

    const active = FluidTopicsThemeService.getActiveTheme?.();
    const isLight = !!lightThemeId && active?.id === lightThemeId;

    // use loader-provided waitForSelector (instead of FT_DOM.watchForSelector)
    const el = await waitForSelector("#backgroundImage", 15000, 150);
    if (!el) return;

    el.classList.add(isLight ? "light-theme" : "dark-theme");
    el.parentNode && (el.parentNode.style.height = "100%");
}
