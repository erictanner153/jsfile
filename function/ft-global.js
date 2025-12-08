/* ---------------------------------------------------------
   Fluid Topics – Global JavaScript Add-on
   Version: 1.3  (fixed: highlightKeywords + testability)
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

    /* ---------------------------------------------------------
       Utility: Deep search inside ShadowRoots
       (FluidTopics uses heavy shadow DOM → required)
    ---------------------------------------------------------- */
    function findElementsInShadowRoots(selector, root = document) {
        const results = [];

        function recursiveSearch(node) {
            if (!node) return;

            if (node.querySelectorAll) {
                results.push(...node.querySelectorAll(selector));
            }
            if (node.shadowRoot) {
                recursiveSearch(node.shadowRoot);
            }
            node.childNodes.forEach(recursiveSearch);
        }

        recursiveSearch(root);
        return results;
    }

    /* ---------------------------------------------------------
       Remove ft-copy-block wrappers for mermaid & plantUML
    ---------------------------------------------------------- */
    async function removeFtCopyBlockForMermaidAndPlantUML() {
        console.log("[FT-GLOBAL] Running removeFtCopyBlockForMermaidAndPlantUML()");

        const blocks = findElementsInShadowRoots("ft-copy-block");
        console.log("[FT-GLOBAL] Found ft-copy-block:", blocks.length);

        blocks.forEach(block => {
            const first = block.firstElementChild;

            if (!first) return;

            // Check if <pre> is mermaid or plantuml
            if (
                first.matches("pre.mermaid, pre[class*='mermaid'], pre.plantuml, pre[class*='plantuml']")
            ) {
                console.log("[FT-GLOBAL] Removing wrapper for", first);

                const parent = block.parentNode;
                if (!parent) return;

                parent.insertBefore(first, block);
                block.remove();
            }
        });
    }

    /* ---------------------------------------------
       GLOBAL CONFIG
    ---------------------------------------------- */
    const GLOBAL_SETTINGS = {
        version: "1.3",
        enableHighlighting: true,
        highlightTerms: ["RDS", "sample", "clarification"],
    };

    /* ---------------------------------------------
       Safe keyword highlighter (MISSING BEFORE!)
    ---------------------------------------------- */
    function highlightKeywords() {
        console.log("[FT-GLOBAL] Running highlightKeywords()");

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

            const wrapper = document.createElement("span");
            wrapper.innerHTML = node.nodeValue.replace(regex, m =>
                `<span class="ft-custom-highlight">${m}</span>`
            );

            node.parentNode.replaceChild(wrapper, node);
        }
    }

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
       Trigger logic when a topic is opened
    ---------------------------------------------- */
    function registerTopicListener() {
        document.addEventListener("ft-event-topic-opened", async () => {
            console.log("[FT-GLOBAL] Topic Loaded → Running global logic");

            highlightKeywords();
            await removeFtCopyBlockForMermaidAndPlantUML();
        });
    }

    /* ---------------------------------------------
       Expose test function so you can run it manually
    ---------------------------------------------- */
    window.FTGLOBAL = window.FTGLOBAL || {};
    window.FTGLOBAL.removeFtCopyBlockForMermaidAndPlantUML = removeFtCopyBlockForMermaidAndPlantUML;

    /* ---------------------------------------------
       Initialize
    ---------------------------------------------- */
    onFTReady(() => {
        console.log("[FT-GLOBAL] Fluid Topics Ready → Booting v" + GLOBAL_SETTINGS.version);

        injectGlobalCSS();
        registerTopicListener();
    });

})();
