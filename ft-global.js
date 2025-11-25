/* ---------------------------------------------------------
   Fluid Topics – Global JavaScript Add-on
   Safe & optimized for all FT portals
   Version: 1.1
---------------------------------------------------------- */

(function () {
    console.log("[FT-GLOBAL] Script Loaded");

    /* ---------------------------------------------
       Utility: Wait for Fluid Topics to be ready
    ---------------------------------------------- */
    function onFTReady(callback) {
        if (window.FT?.hasLoaded) {
            callback();
        } else {
            document.addEventListener("ft-event-ready", callback, { once: true });
        }
    }

    /* ---------------------------------------------
       GLOBAL CONFIG
    ---------------------------------------------- */
    const GLOBAL_SETTINGS = {
        version: "1.1",
        enableHighlighting: true,
        highlightTerms: ["RDS", "sample", "clarification"],
    };

    /* ---------------------------------------------
       Inject global CSS only once
    ---------------------------------------------- */
    function injectGlobalCSS() {
        if (document.getElementById("ft-global-style")) return;

        const style = document.createElement("style");
        style.id = "ft-global-style";
        style.textContent = `
            .ft-custom-highlight {
                background: #ffeb3b;
                padding: 2px 4px;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    /* ---------------------------------------------
       Safe text-based keyword highlighter
       (does NOT break HTML tags)
    ---------------------------------------------- */
    function highlightKeywords() {
        if (!GLOBAL_SETTINGS.enableHighlighting) return;

        const article = document.querySelector("article");
        if (!article) return;

        const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);

        const terms = GLOBAL_SETTINGS.highlightTerms
            .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("|");

        if (!terms) return;

        const regex = new RegExp(`\\b(${terms})\\b`, "gi");

        let node;
        while ((node = walker.nextNode())) {
            if (!regex.test(node.nodeValue)) continue;

            const span = document.createElement("span");
            span.innerHTML = node.nodeValue.replace(regex, m =>
                `<span class="ft-custom-highlight">${m}</span>`
            );

            node.parentNode.replaceChild(span, node);
        }
    }

    /* ---------------------------------------------
       Trigger when a topic is opened
    ---------------------------------------------- */
    function registerTopicListener() {
        document.addEventListener("ft-event-topic-opened", () => {
            console.log("[FT-GLOBAL] Topic Loaded → Apply global logic");
            highlightKeywords();
        });
    }

    /* ---------------------------------------------
       Initialize
    ---------------------------------------------- */
    onFTReady(() => {
        console.log("[FT-GLOBAL] Fluid Topics Ready → Booting v" + GLOBAL_SETTINGS.version);

        injectGlobalCSS();
        registerTopicListener();
    });

})();
