boot();

function boot() {
    console.log("[FT][related] boot");

    // Run once now
    run();

    // Re-apply if FT re-renders / replaces the node(s)
    watchRerenders(() => run());
}

async function run() {
    try {
        const md = await waitForMetadata(60000);
        const count = getRelatedCount(md);

        console.log("[FT][related] count =", count);

        // Apply to ALL matching nodes (handles 2 copies + shadow DOM)
        applyCount(count, "run");

        // Keep alive briefly to survive hydration window
        keepAliveApply(count, 6000);
    } catch (e) {
        console.error("[FT][related] run error", e);
    }
}

function getRelatedCount(metadata) {
    const relatedMD = metadata?.find(x => x?.key === "RelatedDocs");
    return relatedMD?.values?.length || 0;
}

async function waitForMetadata(timeout = 60000) {
    const start = Date.now();
    let tries = 0;

    while (Date.now() - start < timeout) {
        tries++;
        const md = map?.metadata;
        if (Array.isArray(md)) {
            console.log("[FT][related] metadata ready (tries:", tries, ")");
            return md;
        }
        await sleep(150);
    }

    console.warn("[FT][related] metadata timeout");
    return null;
}

function applyCount(count, reason) {
    const nodes =
        (typeof deepQuerySelectorAll === "function"
                ? deepQuerySelectorAll(".count-text", document)
                : [typeof deepQuerySelector === "function"
                    ? deepQuerySelector(".count-text", document)
                    : null]
        ).filter(Boolean);

    console.log("[FT][related] apply", reason, "nodes=", nodes.length);

    nodes.forEach(n => {
        try { n.textContent = String(count); } catch (_) {}
    });
}

function watchRerenders(rerun) {
    const root = document.documentElement || document.body;
    if (!root) return;

    let t;
    const obs = new MutationObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => {
            // If any node exists but is empty -> rerun
            const nodes = (typeof deepQuerySelectorAll === "function")
                ? deepQuerySelectorAll(".count-text", document).filter(Boolean)
                : [];

            const needs = nodes.some(n => (n.textContent || "").trim() === "");
            if (needs) {
                console.log("[FT][related] node emptied/replaced -> rerun");
                rerun();
            }
        }, 120);
    });

    obs.observe(root, { childList: true, subtree: true });
    console.log("[FT][related] observer attached");
}

function keepAliveApply(count, ms) {
    const start = Date.now();
    const timer = setInterval(() => {
        applyCount(count, "keepAlive");
        if (Date.now() - start > ms) clearInterval(timer);
    }, 250);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
