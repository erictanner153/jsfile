// run();
//
// async function run() {
//     // i18n (optional)
//     try {
//         await customI18n?.fetchContext?.("Reader");
//     } catch (_) {}
//
//     // Wait for container (shadow-safe helper from import script)
//     const container = await waitForSelector("#bookmarks", 60000);
//     if (!container) return;
//
//     // Only "View bookmarks" link
//     const link = document.createElement("a");
//     link.href = `/mylibrary/bookmarks?map-id=${map.id}`;
//     link.textContent = "View bookmarks";
//     link.addEventListener("click", (e) => {
//         e.preventDefault();
//         router?.navigateTo ? router.navigateTo(link.getAttribute("href")) : (window.location.href = link.href);
//     });
//
//     container.innerHTML = "";
//     container.append(link);
// }


main();

async function main() {
    let FTAPI = new fluidtopics.FluidTopicsApi();
    let bookmarks = await FTAPI.listMyBookmarks(user.profile.id);
    let mapBookmarks = bookmarks.filter((bookmark) => bookmark.mapId === map.id);
    if (mapBookmarks.length === 0) {
        return;
    }

    const bookmarksLink = document.createElement('a');
    bookmarksLink.setAttribute('href', `/mylibrary/bookmarks?map-id=${map.id}`);
    bookmarksLink.textContent = 'View bookmarks';
    bookmarksLink.addEventListener('click', (e) => {
        e.preventDefault();
        FluidTopicsRouterService.navigateTo(e.target.getAttribute('href'));
    });

    const bookmarksContainer = document.querySelector('#bookmarks');
    bookmarksContainer.innerHTML = '';
    bookmarksContainer.append(bookmarksLink);
}

