boot();

async function boot() {
    console.log("[FT][attachments] boot start");

    try {
        const endpoint = map?.attachmentsApiEndpoint;
        console.log("[FT][attachments] endpoint:", endpoint);

        if (!endpoint) {
            console.warn("[FT][attachments] no endpoint yet -> retry in 300ms");
            setTimeout(boot, 300);
            return;
        }

        const api = new fluidtopics.FluidTopicsApi();
        const data = await api.get(endpoint);
        const count = Array.isArray(data) ? data.length : Object.keys(data || {}).length;
        console.log("[FT][attachments] api count:", count, "data:", data);

        const apply = (reason) => {
            const nodes =
                typeof deepQuerySelectorAll === "function"
                    ? deepQuerySelectorAll(".nbr-attachements-text", document)
                    : [typeof deepQuerySelector === "function" ? deepQuerySelector(".nbr-attachements-text", document) : null];

            const filtered = (nodes || []).filter(Boolean);
            console.log("[FT][attachments] apply", reason, "nodes=", filtered.length);

            filtered.forEach((n) => {
                try { n.textContent = String(count); } catch (_) {}
            });
        };

        // 1) apply now
        apply("initial");

        // 2) keep applying during hydration (active tab rerenders)
        const root = document.documentElement || document.body;
        if (root) {
            let t;
            const obs = new MutationObserver(() => {
                clearTimeout(t);
                t = setTimeout(() => apply("mutation"), 120);
            });
            obs.observe(root, { childList: true, subtree: true });
            console.log("[FT][attachments] observer attached");
        } else {
            console.warn("[FT][attachments] no root to observe");
        }

        // 3) short keep-alive (covers the “active tab” rebuild window)
        const start = Date.now();
        const keep = setInterval(() => {
            apply("keepAlive");
            if (Date.now() - start > 6000) clearInterval(keep);
        }, 250);

    } catch (e) {
        console.error("[FT][attachments] boot error", e);
    }
}
