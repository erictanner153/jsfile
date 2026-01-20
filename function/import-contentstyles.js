// Topic content scripts -> Custom script
export default function loadTopicCss(map, topic, container) {
    const cssUrls = [
        "https://erictanner153.github.io/jsfile/compiled-styles/topic.css",
        "https://erictanner153.github.io/jsfile/compiled-styles/title.css",
    ];

    const doc = (container && container.ownerDocument) || document;

    const buildImportCss = (urls) =>
        urls.map((u) => `@import url("${u}");`).join("\n");

    // Inject a <style> with @import rules into the component's shadowRoot
    const injectImportsIntoShadow = (hostEl, styleId, urls) => {
        const root = hostEl?.shadowRoot;
        if (!root) return;

        // Avoid duplicates
        if (root.getElementById(styleId)) return;

        const styleEl = doc.createElement("style");
        styleEl.id = styleId;

        // IMPORTANT: @import must come before any other CSS rules in this <style>
        styleEl.textContent = buildImportCss(urls);

        root.appendChild(styleEl);
    };

    const applyNow = () => {
        // topic content
        doc.querySelectorAll("ft-reader-topic-content").forEach((el) => {
            injectImportsIntoShadow(el, "ft-topic-content-external-imports", [
                "https://erictanner153.github.io/jsfile/compiled-styles/topic.css",
            ]);
        });

        // topic title
        doc.querySelectorAll("ft-reader-topic-title").forEach((el) => {
            injectImportsIntoShadow(el, "ft-topic-title-external-imports", [
                "https://erictanner153.github.io/jsfile/compiled-styles/title.css",
            ]);
        });
    };

    // Run once
    applyNow();
    console.log('load script ran');
    // Re-apply on navigation / dynamic loads
    const obsKey = "__ft_external_css_imports_observer__";
    if (!doc[obsKey]) {
        const target =
            doc.documentElement || doc.body || (container && container.parentNode);
        if (!target) return;

        doc[obsKey] = new MutationObserver(() => applyNow());
        doc[obsKey].observe(target, {childList: true, subtree: true});
    }
}
