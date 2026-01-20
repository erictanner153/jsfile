(() => {
    // =========================================================
    //  CONFIG (only change these 2)
    // =========================================================
    const cssUrl = "https://siemens-fa-staging.fluidtopics.net/portal/custom-code/fa-reader-view-attachments.css";
    const jsUrl  = "https://siemens-fa-staging.fluidtopics.net/portal/custom-code/fa-reader-view-attachments-inactive.js";

    // =========================================================
    //  CONTEXT (available to external JS)
    // =========================================================
    globalThis.__FT_LOADER_CTX__ = {
        map: (typeof map !== "undefined") ? map : undefined,
        user: (typeof user !== "undefined") ? user : undefined,
        fluidtopics: window.fluidtopics,
        customI18n: window.FluidTopicsCustomI18nService
    };

    const styleId =
        "ft-style-" +
        cssUrl.split("?")[0].split("/").pop().replace(/[^a-zA-Z0-9_-]/g, "-");

    // =========================================================
    //  SHADOW DOM HELPERS
    // =========================================================
    function deepQuerySelector(sel, root) {
        const r = root || document;
        try { const hit = r.querySelector?.(sel); if (hit) return hit; } catch (_) {}
        let scan = r;
        if (scan && scan.nodeType === 9) scan = scan.documentElement || scan.body;
        if (!scan?.querySelectorAll) return null;

        const all = scan.querySelectorAll("*");
        for (let i = 0; i < all.length; i++) {
            const sr = all[i].shadowRoot;
            if (sr) {
                const hit = deepQuerySelector(sel, sr);
                if (hit) return hit;
            }
        }
        return null;
    }

    function deepQuerySelectorAll(sel, root, acc) {
        acc = acc || [];
        const r = root || document;

        try {
            const hits = r.querySelectorAll?.(sel);
            if (hits && hits.length) acc.push(...hits);
        } catch (_) {}

        let scan = r;
        if (scan && scan.nodeType === 9) scan = scan.documentElement || scan.body;
        if (!scan?.querySelectorAll) return acc;

        const all = scan.querySelectorAll("*");
        for (let i = 0; i < all.length; i++) {
            const sr = all[i].shadowRoot;
            if (sr) deepQuerySelectorAll(sel, sr, acc);
        }
        return acc;
    }

    function waitForSelector(sel, timeout = 60000, interval = 150) {
        return new Promise((resolve) => {
            const start = Date.now();
            (function tick() {
                const el = deepQuerySelector(sel, document);
                if (el) return resolve(el);
                if (Date.now() - start >= timeout) return resolve(null);
                setTimeout(tick, interval);
            })();
        });
    }

    // =========================================================
    //  CSS INJECTION (doc + open shadow roots + keep alive)
    // =========================================================
    function injectStyleInto(node, cssText) {
        const container = node.head || node;
        if (!container?.appendChild) return;

        const existing =
            (node.getElementById && node.getElementById(styleId)) ||
            container.querySelector?.("#" + styleId);
        if (existing) return;

        const st = document.createElement("style");
        st.id = styleId;
        st.textContent = cssText;
        container.appendChild(st);
    }

    function injectCssEverywhere(cssText) {
        injectStyleInto(document, cssText);
        const root = document.documentElement || document.body;
        if (!root?.querySelectorAll) return;

        const all = root.querySelectorAll("*");
        for (let i = 0; i < all.length; i++) {
            if (all[i].shadowRoot) injectStyleInto(all[i].shadowRoot, cssText);
        }
    }

    function ensureCssObserver(cssText) {
        if (globalThis.__FT_CSS_OBSERVER__) return;
        globalThis.__FT_CSS_OBSERVER__ = new MutationObserver(() => injectCssEverywhere(cssText));
        const root = document.documentElement || document.body;
        if (root) globalThis.__FT_CSS_OBSERVER__.observe(root, { childList: true, subtree: true });
    }

    // =========================================================
    //  LOAD CSS THEN LOAD+RUN EXTERNAL JS
    // =========================================================
    fetch(cssUrl, { cache: "no-cache" })
        .then(r => r.text())
        .then(cssText => {
            injectCssEverywhere(cssText);
            ensureCssObserver(cssText);
        })
        .catch(e => console.error("[FT][loader] css failed", e))
        .finally(() => {
            fetch(jsUrl, { cache: "no-cache" })
                .then(r => r.text())
                .then(code => {
                    (0, eval)(`
            (async () => {
              try {
                const CTX = globalThis.__FT_LOADER_CTX__ || {};
                const { map, user, fluidtopics, customI18n } = CTX;

                const deepQuerySelector = ${deepQuerySelector.toString()};
                const deepQuerySelectorAll = ${deepQuerySelectorAll.toString()};
                const waitForSelector = ${waitForSelector.toString()};

                ${code}
              } catch (e) {
                console.error("[FT][loader] external js error", e);
              }
            })();
          `);
                })
                .catch(e => console.error("[FT][loader] js failed", e));
        });
})();
