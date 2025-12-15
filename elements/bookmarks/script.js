main();
async function main() {
    const bookmarksCount = await getBookmarksCount();
    const bookmarksCountNumber = document.querySelector('.bookmarks-count__number');
    bookmarksCountNumber.textContent = bookmarksCount;
}
async function getBookmarksCount() {
    const FTAPI = new fluidtopics.FluidTopicsApi();
    let bookmarks = await FTAPI.listMyBookmarks(user.profile.id);
    console.log(bookmarks); bookmarks = bookmarks.filter((bookmark) => bookmark.mapId === map.id);
    return bookmarks.length;
}