runDeprecatedDisclaimer();

function runDeprecatedDisclaimer() {
    main().catch(e => console.error("[FT][deprecated] error", e));
}

async function main() {
    // Wait for metadata to exist
    const md = await waitForValue(() => map?.metadata, 60000);
    if (!Array.isArray(md)) {
        console.warn("[FT][deprecated] map.metadata not ready");
        return;
    }

    const values = (md.find(x => x?.key === "LifeCycleStatus")?.values) || [];
    const isDeprecated = Array.isArray(values) && values.includes("Deprecated");

    console.log("[FT][deprecated] LifeCycleStatus=", values, "isDeprecated=", isDeprecated);

    if (!isDeprecated) return;

    // Localized label (best effort)
    let text = "This document is deprecated";
    try {
        const l = window.FluidTopicsCustomI18nService?.resolveMessage?.("Reader", "header_document_deprecated");
        if (l) text = l;
    } catch (_) {}

    // Find nodes (shadow-safe if waitForSelector exists)
    const disclaimerTextEl = await getNode("#disclaimerText");
    const disclaimerContainerEl = await getNode("#disclaimerContainer");

    if (disclaimerTextEl) disclaimerTextEl.innerHTML = text;
    if (disclaimerContainerEl) disclaimerContainerEl.style.display = "inline-block";

    console.log("[FT][deprecated] shown");
}

// ---------- helpers (no loader changes needed) ----------

async function waitForValue(getter, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        let val = null;
        try { val = getter(); } catch (_) {}
        if (val) return val;
        await sleep(150);
    }
    return null;
}

async function getNode(selector) {
    // Prefer loader helper (shadow DOM aware)
    if (typeof waitForSelector === "function") {
        const el = await waitForSelector(selector, 60000).catch(() => null);
        if (el) return el;
    }

    // Fallback: normal DOM
    if (selector.startsWith("#")) return document.getElementById(selector.slice(1));
    return document.querySelector(selector);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
