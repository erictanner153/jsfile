(() => {
    console.log("[bookmarks] script.js loaded");
    main().catch(err => console.error("[bookmarks] main failed:", err));
})();

function deepQuerySelector(selector, root = document) {
    // Try direct query on the current root (document or shadowRoot)
    const direct = root.querySelector?.(selector);
    if (direct) return direct;

    // Walk the tree and recurse into any shadow roots
    const all = root.querySelectorAll?.("*") || [];
    for (const node of all) {
        if (node.shadowRoot) {
            const found = deepQuerySelector(selector, node.shadowRoot);
            if (found) return found;
        }
    }
    return null;
}

async function waitForSelectorDeep(selector, { timeoutMs = 10000 } = {}) {
    console.log("[bookmarks] waiting (deep) for", selector);

    const existing = deepQuerySelector(selector);
    if (existing) return existing;

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            obs.disconnect();
            reject(new Error(`Timeout waiting (deep) for ${selector}`));
        }, timeoutMs);

        const obs = new MutationObserver(() => {
            const el = deepQuerySelector(selector);
            if (el) {
                clearTimeout(timeout);
                obs.disconnect();
                resolve(el);
            }
        });

        obs.observe(document.documentElement || document, { subtree: true, childList: true });
    });
}

async function main() {
    const { user, map } = globalThis.FT_CTX || {};
    if (!user || !map) {
        console.warn("[bookmarks] Missing FT context (user/map).");
        return;
    }

    const count = await getBookmarksCount(user, map);
    console.log("[bookmarks] count =", count);

    const el = await waitForSelectorDeep(".bookmarks-count__number");
    console.log("[bookmarks] found el:", el);

    el.textContent = String(count);
}

async function getBookmarksCount(user, map) {
    const FTAPI = new fluidtopics.FluidTopicsApi();
    let bookmarks = await FTAPI.listMyBookmarks(user.profile.id);
    bookmarks = (bookmarks || []).filter(b => b.mapId === map.id);
    return bookmarks.length;
}
