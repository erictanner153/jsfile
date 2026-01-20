run();

async function run() {
    const count = await getBookmarksCount();

    // shadow-safe (from import script)
    const el = await waitForSelector(".bookmarks-count__number", 60000);
    if (!el) return;

    el.textContent = String(count);
}

async function getBookmarksCount() {
    const FTAPI = new fluidtopics.FluidTopicsApi();
    const all = await FTAPI.listMyBookmarks(user.profile.id);
    const filtered = (all || []).filter(b => b?.mapId === map?.id);
    return filtered.length;
}
