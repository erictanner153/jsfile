(() => {
    // Change those Urls to match the exact uploaded files
    const cssUrl = "https://siemens-fa-staging.fluidtopics.net/portal/custom-code/fa-reader-view-bookmarks.css";
    const jsUrl  = "https://siemens-fa-staging.fluidtopics.net/portal/custom-code/fa-reader-view-bookmarks.js";

    // auto style id from css filename (no hash)
    const styleId = "ft-style-" + cssUrl
        .split("?")[0]
        .split("/")
        .pop()
        .replace(/[^a-zA-Z0-9_-]/g, "-");

    // ---- Context for external JS ----
    globalThis.__FT_LOADER_CTX__ = {
        user: (typeof user !== "undefined") ? user : undefined,
        map: (typeof map !== "undefined") ? map : undefined,
        i18n: window.FluidTopicsI18nService,
        customI18n: window.FluidTopicsCustomI18nService,
        fluidtopics: window.fluidtopics,
        router: window.FluidTopicsRouterService,
        location: window.location,
        navigator: window.navigator
    };

    // ---- Shadow DOM aware selector (NO TreeWalker) ----
    function deepQuerySelector(selector, root) {
        const r = root || document;

        try {
            const direct = r.querySelector?.(selector);
            if (direct) return direct;
        } catch (_) {}

        let scanRoot = r;
        if (scanRoot && scanRoot.nodeType === 9) scanRoot = scanRoot.documentElement || scanRoot.body;
        if (!scanRoot?.querySelectorAll) return null;

        const all = scanRoot.querySelectorAll("*");
        for (let i = 0; i < all.length; i++) {
            const el = all[i];
            if (el?.shadowRoot) {
                const found = deepQuerySelector(selector, el.shadowRoot);
                if (found) return found;
            }
        }
        return null;
    }

    function waitForSelector(selector, timeout = 60000, interval = 150) {
        return new Promise((resolve) => {
            const start = Date.now();
            (function tick() {
                const el = deepQuerySelector(selector, document);
                if (el) return resolve(el);
                if (Date.now() - start >= timeout) return resolve(null);
                setTimeout(tick, interval);
            })();
        });
    }

    // ---- CSS injection into document + open shadow roots ----
    function injectStyleInto(node, cssText) {
        const container = node.head || node;
        if (!container?.appendChild) return;

        const existing =
            (node.getElementById && node.getElementById(styleId)) ||
            container.querySelector?.(`#${styleId}`);
        if (existing) return;

        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = cssText;
        container.appendChild(style);
    }

    function injectCssEverywhere(cssText) {
        injectStyleInto(document, cssText);

        const root = document.documentElement || document.body;
        if (root?.querySelectorAll) {
            const all = root.querySelectorAll("*");
            for (let i = 0; i < all.length; i++) {
                if (all[i].shadowRoot) injectStyleInto(all[i].shadowRoot, cssText);
            }
        }
    }

    function ensureCssObserver(cssText) {
        if (globalThis.__FT_CSS_OBSERVER__) return;

        globalThis.__FT_CSS_OBSERVER__ = new MutationObserver(() => {
            injectCssEverywhere(cssText);
        });

        const root = document.documentElement || document.body;
        if (root) globalThis.__FT_CSS_OBSERVER__.observe(root, { childList: true, subtree: true });
    }

    // ---- Load CSS then JS ----
    fetch(cssUrl, { cache: "no-cache" })
        .then(r => r.text())
        .then(cssText => {
            injectCssEverywhere(cssText);
            ensureCssObserver(cssText);
        })
        .catch(e => console.error("[FT] CSS load failed", e))
        .finally(() => {
            fetch(jsUrl, { cache: "no-cache" })
                .then(r => r.text())
                .then(code => {
                    (0, eval)(`
            (async () => {
              try {
                const CTX = globalThis.__FT_LOADER_CTX__ || {};
                const { user, map, i18n, customI18n, fluidtopics, router, location, navigator } = CTX;

                const deepQuerySelector = ${deepQuerySelector.toString()};
                const waitForSelector = ${waitForSelector.toString()};

                ${code}
              } catch (e) {
                console.error("[FT] external js error", e);
              }
            })();
          `);
                })
                .catch(e => console.error("[FT] JS load failed", e));
        });
})();
