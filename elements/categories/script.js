(() => {
    console.log("[videos] script.js loaded");
    main().catch(err => console.error("[videos] main failed", err));
})();

function deepFindShadowRootContaining(selector) {
    // returns { host, root } where root is the ShadowRoot containing selector
    for (const host of document.querySelectorAll("*")) {
        if (!host.shadowRoot) continue;
        const match = host.shadowRoot.querySelector(selector);
        if (match) return { host, root: host.shadowRoot, match };
    }
    // also try light DOM
    const light = document.querySelector(selector);
    if (light) return { host: null, root: document, match: light };
    return null;
}

async function main() {
    // Find the ShadowRoot where this component is rendered
    const located = deepFindShadowRootContaining("#categories");
    if (!located) {
        console.warn("[videos] Could not find #categories (component not rendered yet)");
        return;
    }

    const root = located.root; // ShadowRoot or document
    console.log("[videos] using root:", root);

    // ---------------------------
    // Data
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
        {
            categoryId: "category1",
            en_US: { id: 6385608890112 },
            de_DE: { id: 6385608890112 },
            labelId: "tia.VideoTitle_1_5",
            descriptionLabelId: "tia.VideoDescription_1_5"
        },
        {
            categoryId: "category1",
            en_US: { id: 6385258071112 },
            de_DE: { id: 6385258948112 },
            labelId: "tia.VideoTitle_1_1",
            descriptionLabelId: "tia.VideoDescription_1_1"
        },
        {
            categoryId: "category1",
            en_US: { id: 6385314092112 },
            de_DE: { id: 6385314796112 },
            labelId: "tia.VideoTitle_1_2",
            descriptionLabelId: "tia.VideoDescription_1_2"
        },
        {
            categoryId: "category1",
            en_US: { id: 6385313897112 },
            de_DE: { id: 6385314795112 },
            labelId: "tia.VideoTitle_1_3",
            descriptionLabelId: "tia.VideoDescription_1_3"
        },
        {
            categoryId: "category1",
            en_US: { id: 6385258763112 },
            de_DE: { id: 6385260417112 },
            labelId: "tia.VideoTitle_1_4",
            descriptionLabelId: "tia.VideoDescription_1_4"
        },
        {
            categoryId: "category2",
            en_US: { id: 6188401618001 },
            de_DE: { id: 6188401618001 },
            labelId: "tia.VideoTitle_2_1",
            descriptionLabelId: "tia.VideoDescription_2_1"
        },
        {
            categoryId: "category2",
            en_US: { id: 6144858930001 },
            de_DE: { id: 6144858930001 },
            labelId: "tia.VideoTitle_2_2",
            descriptionLabelId: "tia.VideoDescription_2_2"
        },
        {
            categoryId: "category2",
            en_US: { id: 6129694127001 },
            de_DE: { id: 6129694127001 },
            labelId: "tia.VideoTitle_2_3",
            descriptionLabelId: "tia.VideoDescription_2_3"
        },
        {
            categoryId: "category2",
            en_US: { id: 6187316175001 },
            de_DE: { id: 6187316175001 },
            labelId: "tia.VideoTitle_2_4",
            descriptionLabelId: "tia.VideoDescription_2_4"
        },
        {
            categoryId: "category2",
            en_US: { id: 6189530731001 },
            de_DE: { id: 6189530731001 },
            labelId: "tia.VideoTitle_2_5",
            descriptionLabelId: "tia.VideoDescription_2_5"
        },
        {
            categoryId: "category2",
            en_US: { id: 6130392312001 },
            de_DE: { id: 6130392312001 },
            labelId: "tia.VideoTitle_2_6",
            descriptionLabelId: "tia.VideoDescription_2_6"
        },
        {
            categoryId: "category3",
            en_US: { id: 4867852950001 },
            de_DE: { id: 4867852950001 },
            labelId: "tia.VideoTitle_3_1",
            descriptionLabelId: "tia.VideoDescription_3_1"
        },
        {
            categoryId: "category3",
            en_US: { id: 4663888973001 },
            de_DE: { id: 4663888973001 },
            labelId: "tia.VideoTitle_3_2",
            descriptionLabelId: "tia.VideoDescription_3_2"
        },
        {
            categoryId: "category3",
            en_US: { id: 5371027180001 },
            de_DE: { id: 5371027180001 },
            labelId: "tia.VideoTitle_3_3",
            descriptionLabelId: "tia.VideoDescription_3_3"
        },
        {
            categoryId: "category3",
            en_US: { id: 6361438475112 },
            de_DE: { id: 6361438475112 },
            labelId: "tia.VideoTitle_1_6",
            descriptionLabelId: "tia.VideoDescription_1_6"
        }
    ];

    const accountId = "1813624294001";
    const guid = "f83fb7f6-75c0-411c-872c-ab6095a19211";

    // ---------------------------
    // DOM (scoped to ShadowRoot!)
    // ---------------------------
    const categoriesDiv = root.querySelector("#categories");
    const iFrameContainer = root.querySelector("#iframe-container");

    if (!categoriesDiv || !iFrameContainer) {
        console.warn("[videos] Missing #categories or #iframe-container in component HTML");
        return;
    }

    // ---------------------------
    // Helpers
    // ---------------------------
    function getLocaleKeyOfObject(obj) {
        const currentUiLocaleKey = window?.FluidTopicsI18nService?.currentUiLocale?.replace("-", "_");
        if (obj?.[currentUiLocaleKey]) return currentUiLocaleKey;
        return "en_US"; // fallback language
    }

    function clearCategories() {
        categoriesDiv.innerHTML = "";
    }

    function onSelectCategory(category) {
        [...categoriesDiv.children].forEach(c => {
            c.classList.toggle("active", c.id === category.id);
        });
        showVideosOfCategory(category.id);
    }

    function createCategory(category) {
        const div = root.ownerDocument.createElement("div");
        div.id = category.id;
        div.classList.add("category");

        const localeKey = getLocaleKeyOfObject(category);
        div.textContent = category[localeKey].title;

        div.addEventListener("click", () => onSelectCategory(category));
        categoriesDiv.appendChild(div);
        return div;
    }

    function createVideoIFrame(videoId) {
        const iframe = root.ownerDocument.createElement("iframe");
        iframe.src = `https://players.brightcove.net/${accountId}/${guid}_default/index.html?videoId=${videoId}`;
        iframe.classList.add("video-iframe");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("webkitallowfullscreen", "");
        iframe.setAttribute("mozallowfullscreen", "");
        return iframe;
    }

    function createLocalizedLabel(contextAndKeyString) {
        const [context, key] = contextAndKeyString.split(".");
        const span = root.ownerDocument.createElement("span");
        span.innerHTML = window.FluidTopicsCustomI18nService.resolveMessage(context, key);
        return span;
    }

    function createVideoCard(video, localeKey) {
        const link = root.ownerDocument.createElement("a");
        link.href = `https://players.brightcove.net/${accountId}/${guid}_default/index.html?videoId=${video[localeKey].id}`;

        const card = root.ownerDocument.createElement("div");
        card.className = "video-card";
        link.appendChild(card);

        const col = root.ownerDocument.createElement("div");
        card.appendChild(col);

        const imgWrap = root.ownerDocument.createElement("div");
        col.appendChild(imgWrap);

        let media;
        if (video[localeKey].thumbnailUrl) {
            media = root.ownerDocument.createElement("img");
            media.src = video[localeKey].thumbnailUrl;
        } else {
            media = createVideoIFrame(video[localeKey].id);
        }
        imgWrap.appendChild(media);

        const textWrap = root.ownerDocument.createElement("div");
        col.appendChild(textWrap);

        textWrap.appendChild(createLocalizedLabel(video.labelId));
        textWrap.appendChild(createLocalizedLabel(video.descriptionLabelId));

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

    // ---------------------------
    // Run
    // ---------------------------
    clearCategories();
    videoCategories.forEach(createCategory);
    onSelectCategory(videoCategories[0]);
}
