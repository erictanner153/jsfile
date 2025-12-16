(() => {
    const cssUrl = "https://erictanner153.github.io/jsfile/elements/categories/style.css"; //change based on each component
    const jsUrl  = "https://erictanner153.github.io/jsfile/elements/categories/script.js"; //change based on each component

    // ---- Expose ALL Fluid Topics context safely if needed ----
    globalThis.FT_CTX = {
        // core
        user: typeof user !== "undefined" ? user : undefined,
        map: typeof map !== "undefined" ? map : undefined,

        // i18n
        i18n: window.FluidTopicsI18nService,
        customI18n: window.FluidTopicsCustomI18nService,

        // APIs / SDK
        fluidtopics: window.fluidtopics,

        // environment / window (sometimes useful)
        location: window.location,
        navigator: window.navigator
    };

    // ---- Load CSS ----
    fetch(cssUrl, { cache: "no-cache" })
        .then(r => r.text())
        .then(css => {
            const style = document.createElement("style");
            style.textContent = css;
            (document.querySelector("*") || document.documentElement).appendChild(style);
        });

    // ---- Load + eval JS ----
    fetch(jsUrl, { cache: "no-cache" })
        .then(r => r.text())
        .then(code => (0, eval)(code))
        .catch(e => console.error("[FT] load failed", e));
})();
