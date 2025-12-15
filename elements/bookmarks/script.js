main();

async function main() {
    const { user, map } = globalThis.FT_CTX || {};
    if (!user || !map) {
        console.warn("[bookmarks] Missing FT context (user/map).");
        return;
    }
    console.log('user', user);
    console.log('map', map);
    const bookmarksCount = await getBookmarksCount(user, map);
    const el = document.querySelector(".bookmarks-count__number");
    if (el) el.textContent = String(bookmarksCount);
}

async function getBookmarksCount(user, map) {
    const FTAPI = new fluidtopics.FluidTopicsApi();
    let bookmarks = await FTAPI.listMyBookmarks(user.profile.id);
    bookmarks = (bookmarks || []).filter(b => b.mapId === map.id);
    return bookmarks.length;
}