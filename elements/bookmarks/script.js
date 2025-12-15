(() => {
    console.log("[bookmarks] script.js loaded");
    main().catch(err => console.error("[bookmarks] main failed", err));
})();

async function waitForSelector(selector, { timeoutMs = 5000 } = {}) {
    // 1) fast path
    const existing = document.querySelector(selector);
    if (existing) return existing;

    // 2) observe DOM changes
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            obs.disconnect();
            reject(new Error(`Timeout waiting for ${selector}`));
        }, timeoutMs);

        const obs = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearTimeout(timeout);
                obs.disconnect();
                resolve(el);
            }
        });

        obs.observe(document, { subtree: true, childList: true });
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

    // ✅ wait until the component HTML is actually in the DOM
    const el = await waitForSelector(".bookmarks-count__number");
    console.log("[bookmarks] found el?", !!el);

    el.textContent = String(count);
}

async function getBookmarksCount(user, map) {
    const FTAPI = new fluidtopics.FluidTopicsApi();
    let bookmarks = await FTAPI.listMyBookmarks(user.profile.id);
    bookmarks = (bookmarks || []).filter(b => b.mapId === map.id);
    return bookmarks.length;
}
