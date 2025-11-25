/* ---------------------------------------------------------
   Fluid Topics – Global JavaScript Add-on
   Version: 1.2  (mermaid + plantuml copy-block fix added)
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
       NEW FEATURE:
       Remove ft-copy-block wrappers for mermaid & plantUML
    ---------------------------------------------------------- */
    async function removeFtCopyBlockForMermaidAndPlantUML() {
        const blocks = findElementsInShadowRoots("ft-copy-block");

        blocks.forEach(block => {
            const first = block.firstElementChild;

            if (!first) return;

            // Check if <pre> is mermaid or plantuml
            if (
                first.matches("pre.mermaid, pre[class*='mermaid'], pre.plantuml, pre[class*='plantuml']")
            ) {
                const parent = block.parentNode;
                if (!parent) return;

                // Move the <pre> out of the wrapper
                parent.insertBefore(first, block);

                // Remove the FT copy wrapper
                block.remove();
            }
        });
    }

    /* ---------------------------------------------
       GLOBAL CONFIG
    ---------------------------------------------- */
    const GLOBAL_SETTINGS = {
        version: "1.2",
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

            const wrapper = document.createElement("span");
            wrapper.innerHTML = node.nodeValue.replace(regex, m =>
                `<span class="ft-custom-highlight">${m}</span>`
            );

            node.parentNode.replaceChild(wrapper, node);
        }
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
       Initialize
    ---------------------------------------------- */
    onFTReady(() => {
        console.log("[FT-GLOBAL] Fluid Topics Ready → Booting v" + GLOBAL_SETTINGS.version);

        injectGlobalCSS();
        registerTopicListener();
    });

})();
