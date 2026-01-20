runDisclaimer();

function runDisclaimer() {
    main().catch(e => console.error("[FT][disclaimer] error", e));
}

async function main() {
    // Wait until map has the fields we need (map can be undefined early)
    const ok = await waitForMapFields(60000);
    if (!ok) return;

    const ftApi = new fluidtopics.FluidTopicsApi();

    const payload = {
        query: "",
        filters: [
            { key: "type", values: ["MAP", "DOCUMENT"] },
            { key: "ft:clusterId", values: [map.clusterId] },
            { key: "ft:locale", values: [map.lang] }
        ]
    };

    console.log("[FT][disclaimer] search payload", payload);

    const results = await ftApi.search(payload).catch(e => {
        console.error("[FT][disclaimer] search failed", e);
        return null;
    });
    if (!results?.results) return;

    // Find latest publication date in results
    let latestPublicationDate = new Date(0);

    results.results.forEach(group => {
        (group?.entries || []).forEach(entry => {
            const d = entry?.map?.lastPublicationDate;
            if (d) {
                const date = new Date(d);
                if (!isNaN(date) && date > latestPublicationDate) {
                    latestPublicationDate = date;
                }
            }
        });
    });

    // Your current map publication date (adjust field name if needed)
    const currentPublication = new Date(map.lastPublication);
    console.log("[FT][disclaimer] current=", currentPublication, "latest=", latestPublicationDate);

    if (!isNaN(currentPublication) && currentPublication < latestPublicationDate) {
        // Locate nodes (shadow-safe if helpers exist)
        const disclaimerTextEl = await getNode("#disclaimerText");
        const disclaimerContainerEl = await getNode("#disclaimerContainer");

        if (disclaimerTextEl) disclaimerTextEl.innerHTML = "Newer version available";
        if (disclaimerContainerEl) disclaimerContainerEl.style.display = "inline-block";

        console.log("[FT][disclaimer] shown");
    } else {
        console.log("[FT][disclaimer] not shown (already latest)");
    }
}

// -------- helpers (no loader changes required) --------

async function waitForMapFields(timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (map?.clusterId && map?.lang) return true;
        await sleep(150);
    }
    console.warn("[FT][disclaimer] map fields timeout", map);
    return false;
}

async function getNode(selectorOrId) {
    // Prefer loader helpers if available (shadow DOM)
    if (typeof waitForSelector === "function") {
        const el = await waitForSelector(selectorOrId, 60000).catch(() => null);
        if (el) return el;
    }

    // Fallback: try normal DOM
    if (selectorOrId[0] === "#") {
        const id = selectorOrId.slice(1);
        return document.getElementById(id);
    }
    return document.querySelector(selectorOrId);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
