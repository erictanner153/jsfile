(() => {
    console.log("[videos] script.js loaded");
    runAllInstances().catch(err => console.error("[videos] init failed", err));
})();

function findAllShadowRootsContaining(selector) {
    const roots = [];

    // light DOM
    if (document.querySelector(selector)) roots.push(document);

    // shadow DOM
    for (const host of document.querySelectorAll("*")) {
        if (!host.shadowRoot) continue;
        if (host.shadowRoot.querySelector(selector)) roots.push(host.shadowRoot);
    }

    return roots;
}

async function runAllInstances() {
    // Use a stable wrapper from your HTML
    const roots = findAllShadowRootsContaining(".categories-container");

    if (!roots.length) {
        console.warn("[videos] No .categories-container found (component not rendered yet)");
        return;
    }

    console.log("[videos] instances found:", roots.length);

    // Initialize each instance separately
    for (const root of roots) {
        initOne(root);
    }
}

function initOne(root) {
    // ---------------------------
    // Data (keep yours)
    // ---------------------------
    const videoCategories = [
        {
            id: "category1",
            en_US: { title: "What's new" },
            de_DE: { title: "Was ist neu" },
            es_ES: { title: "Novedades" },
            fr_FR: { title: "Nouveautés" },
            it_IT: { title: "Novità" },
            zh_CN: { title: "新增功能" }
        },
        {
            id: "category2",
            en_US: { title: "Key functions" },
            de_DE: { title: "Schlüsselfunktionen" },
            es_ES: { title: "Funciones clave" },
            fr_FR: { title: "Fonctions clés" },
            it_IT: { title: "Funzioni chiave" },
            zh_CN: { title: "主要功能" }
        },
        {
            id: "category3",
            en_US: { title: "Further insights" },
            de_DE: { title: "Weitere Einblicke" },
            es_ES: { title: "Más detalles" },
            fr_FR: { title: "Plus d'aperçu" },
            it_IT: { title: "Ulteriori approfondimenti" },
            zh_CN: { title: "更多见解" }
        }
    ];

    const videos = [
        // ... keep your big list here ...
    ];

    const accountId = "1813624294001";
    const guid = "f83fb7f6-75c0-411c-872c-ab6095a19211";

    // ---------------------------
    // DOM scoped to THIS component
    // ---------------------------
    // IMPORTANT: query inside this root (ShadowRoot or document)
    const wrapper = root.querySelector(".categories-container");
    if (!wrapper) return;

    const categoriesDiv = wrapper.querySelector("#categories");
    const iFrameContainer = wrapper.querySelector("#iframe-container");

    if (!categoriesDiv || !iFrameContainer) {
        console.warn("[videos] Missing #categories or #iframe-container in this instance");
        return;
    }

    // ---------------------------
    // Helpers
    // ---------------------------
    function getLocaleKeyOfObject(obj) {
        const currentUiLocaleKey = window?.FluidTopicsI18nService?.currentUiLocale?.replace("-", "_");
        if (obj?.[currentUiLocaleKey]) return currentUiLocaleKey;
        return "en_US";
    }

    function clearCategories() {
        categoriesDiv.innerHTML = "";
    }

    function createLocalizedLabel(contextAndKeyString) {
        const [context, key] = contextAndKeyString.split(".");
        const span = document.createElement("span");
        span.innerHTML = window.FluidTopicsCustomI18nService.resolveMessage(context, key);
        return span;
    }

    function createVideoIFrame(videoId) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://players.brightcove.net/${accountId}/${guid}_default/index.html?videoId=${videoId}`;
        iframe.classList.add("video-iframe");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("webkitallowfullscreen", "");
        iframe.setAttribute("mozallowfullscreen", "");
        return iframe;
    }

    function createVideoCard(video, localeKey) {
        const link = document.createElement("a");
        link.href = `https://players.brightcove.net/${accountId}/${guid}_default/index.html?videoId=${video[localeKey].id}`;

        const card = document.createElement("div");
        card.className = "video-card";
        link.appendChild(card);

        const col = document.createElement("div");
        card.appendChild(col);

        const imgWrap = document.createElement("div");
        col.appendChild(imgWrap);

        let media;
        if (video[localeKey].thumbnailUrl) {
            media = document.createElement("img");
            media.src = video[localeKey].thumbnailUrl;
        } else {
            media = createVideoIFrame(video[localeKey].id);
        }
        imgWrap.appendChild(media);

        const textWrap = document.createElement("div");
        col.appendChild(textWrap);

        if (video.labelId) textWrap.appendChild(createLocalizedLabel(video.labelId));
        if (video.descriptionLabelId) textWrap.appendChild(createLocalizedLabel(video.descriptionLabelId));

        return link;
    }

    function showVideosOfCategory(categoryId) {
        iFrameContainer.innerHTML = "";
        const videosOfCategory = videos.filter(v => v.categoryId === categoryId);

        for (const video of videosOfCategory) {
            const localeKey = getLocaleKeyOfObject(video);
            if (video?.labelId) {
                iFrameContainer.appendChild(createVideoCard(video, localeKey));
            } else {
                iFrameContainer.appendChild(createVideoIFrame(video[localeKey].id));
            }
        }
    }

    function onSelectCategory(category) {
        [...categoriesDiv.children].forEach(c => {
            c.classList.toggle("active", c.id === category.id);
        });
        showVideosOfCategory(category.id);
    }

    function createCategory(category) {
        const div = document.createElement("div");
        div.id = category.id;
        div.classList.add("category");

        const localeKey = getLocaleKeyOfObject(category);
        div.textContent = category[localeKey].title;

        div.addEventListener("click", () => onSelectCategory(category));
        categoriesDiv.appendChild(div);
    }

    // ---------------------------
    // Run this instance
    // ---------------------------
    clearCategories();
    videoCategories.forEach(createCategory);
    onSelectCategory(videoCategories[0]);

    console.log("[videos] initialized one instance");
}
