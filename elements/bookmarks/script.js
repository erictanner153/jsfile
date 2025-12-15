(() => {
    // Always show something immediately
    try { console.log("[bookmarks] script.js loaded"); } catch (_) {}

    // Catch async errors too
    window.addEventListener?.("error", (e) => console.error("[bookmarks] window error", e?.error || e));
    window.addEventListener?.("unhandledrejection", (e) => console.error("[bookmarks] unhandledrejection", e?.reason || e));

    main().catch(err => console.error("[bookmarks] main failed", err));
})();

async function main() {
    const ctx = globalThis.FT_CTX;
    console.log("[bookmarks] FT_CTX =", ctx);

    const { user, map } = ctx || {};
    if (!user || !map) {
        console.warn("[bookmarks] Missing FT context (user/map).");
        return;
    }

    console.log("[bookmarks] user =", user);
    console.log("[bookmarks] map  =", map);

    const bookmarksCount = await getBookmarksCount(user, map);
    console.log("[bookmarks] count =", bookmarksCount);

    const el = document.querySelector(".bookmarks-count__number");
    if (el) el.textContent = String(bookmarksCount);
}

async function getBookmarksCount(user, map) {
    const FTAPI = new fluidtopics.FluidTopicsApi();
    let bookmarks = await FTAPI.listMyBookmarks(user.profile.id);
    bookmarks = (bookmarks || []).filter(b => b.mapId === map.id);
    return bookmarks.length;
}
