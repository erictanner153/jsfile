(() => {
    console.log("[videos] script.js loaded");
    boot().catch(err => console.error("[videos] boot failed", err));
})();

// Deep find: searches light DOM + all shadow roots
function deepFindAll(selector, root = document) {
    const results = [];
    const direct = root.querySelectorAll?.(selector);
    if (direct && direct.length) results.push(...direct);

    const all = root.querySelectorAll?.("*") || [];
    for (const node of all) {
        if (node.shadowRoot) {
            results.push(...deepFindAll(selector, node.shadowRoot));
        }
    }
    return results;
}

async function waitFor(selector, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const found = deepFindAll(selector);
        if (found.length) return found;
        await new Promise(r => setTimeout(r, 150));
    }
    throw new Error(`Timeout waiting for ${selector}`);
}

async function boot() {
    // Your wrapper exists in HTML
    const wrappers = await waitFor(".categories-container");
    console.log("[videos] wrappers found:", wrappers.length);

    for (const wrapper of wrappers) initOne(wrapper);
}

function initOne(wrapper) {
    // prevent double-init
    if (wrapper.__videosInited) return;
    wrapper.__videosInited = true;

    const categoriesDiv = wrapper.querySelector("#categories");
    const iFrameContainer = wrapper.querySelector("#iframe-container");

    console.log("[videos] initOne containers:", !!categoriesDiv, !!iFrameContainer);
    if (!categoriesDiv || !iFrameContainer) return;

    const videoCategories = [
        {
            id: 'category1',
            en_US: { title: "What's new" },
            de_DE: { title: "Was ist neu" },
            es_ES: { title: "Novedades" },
            fr_FR: { title: "Nouveautés" },
            it_IT: { title: "Novità" },
            zh_CN: { title: "新增功能" }
        },
        {
            id: 'category2',
            en_US: { title: "Key functions" },
            de_DE: { title: "Schlüsselfunktionen" },
            es_ES: { title: "Funciones clave" },
            fr_FR: { title: "Fonctions clés" },
            it_IT: { title: "Funzioni chiave" },
            zh_CN: { title: "主要功能" }
        },
        {
            id: 'category3',
            en_US: { title: "Further insights" },
            de_DE: { title: "Weitere Einblicke" },
            es_ES: { title: "Más detalles" },
            fr_FR: { title: "Plus d'aperçu" },
            it_IT: { title: "Ulteriori approfondimenti" },
            zh_CN: { title: "更多见解" }
        },
    ];

// maintain 'labelId' & 'descriptionLabelId' in xml translations / "custom-xx-XX-messages.xml"
// examples for thumbnailUrl:
// 'thumbnailUrl': { en_US: '', de_DE: ''}
// 'thumbnailUrl': { en_US: '', it_IT: ''}
// 'thumbnailUrl': { en_US: ''}
    const videos = [
        {
            categoryId: 'category1',
            en_US: { id: 6385608890112 },
            de_DE: { id: 6385608890112 },
            labelId: 'tia.VideoTitle_1_5',
            descriptionLabelId: 'tia.VideoDescription_1_5'
        },
        {
            categoryId: 'category1',
            en_US: { id: 6385258071112 },
            de_DE: { id: 6385258948112 },
            labelId: 'tia.VideoTitle_1_1',
            descriptionLabelId: 'tia.VideoDescription_1_1'
        },
        {
            categoryId: 'category1',
            en_US: { id: 6385314092112 },
            de_DE: { id: 6385314796112 },
            labelId: 'tia.VideoTitle_1_2',
            descriptionLabelId: 'tia.VideoDescription_1_2'
        },
        {
            categoryId: 'category1',
            en_US: { id: 6385313897112 },
            de_DE: { id: 6385314795112 },
            labelId: 'tia.VideoTitle_1_3',
            descriptionLabelId: 'tia.VideoDescription_1_3'
        },
        {
            categoryId: 'category1',
            en_US: { id: 6385258763112 },
            de_DE: { id: 6385260417112 },
            labelId: 'tia.VideoTitle_1_4',
            descriptionLabelId: 'tia.VideoDescription_1_4'
        },
        /*
       {
          categoryId: 'category1',
          en_US: { id: 6296740966001 },
          de_DE: { id: 6296740966001 },
          labelId: 'tia.VideoTitle_1_5',
          descriptionLabelId: 'tia.VideoDescription_1_5'
        }, */
        {
            categoryId: 'category2',
            en_US: { id: 6188401618001 },
            de_DE: { id: 6188401618001 },
            labelId: 'tia.VideoTitle_2_1',
            descriptionLabelId: 'tia.VideoDescription_2_1'
        },
        {
            categoryId: 'category2',
            en_US: { id: 6144858930001 },
            de_DE: { id: 6144858930001 },
            labelId: 'tia.VideoTitle_2_2',
            descriptionLabelId: 'tia.VideoDescription_2_2'
        },
        {
            categoryId: 'category2',
            en_US: { id: 6129694127001 },
            de_DE: { id: 6129694127001 },
            labelId: 'tia.VideoTitle_2_3',
            descriptionLabelId: 'tia.VideoDescription_2_3'
        },
        {
            categoryId: 'category2',
            en_US: { id: 6187316175001 },
            de_DE: { id: 6187316175001 },
            labelId: 'tia.VideoTitle_2_4',
            descriptionLabelId: 'tia.VideoDescription_2_4'
        },
        {
            categoryId: 'category2',
            en_US: { id: 6189530731001 },
            de_DE: { id: 6189530731001 },
            labelId: 'tia.VideoTitle_2_5',
            descriptionLabelId: 'tia.VideoDescription_2_5'
        },
        {
            categoryId: 'category2',
            en_US: { id: 6130392312001 },
            de_DE: { id: 6130392312001 },
            labelId: 'tia.VideoTitle_2_6',
            descriptionLabelId: 'tia.VideoDescription_2_6'
        },
        {
            categoryId: 'category3',
            en_US: { id: 4867852950001 },
            de_DE: { id: 4867852950001 },
            labelId: 'tia.VideoTitle_3_1',
            descriptionLabelId: 'tia.VideoDescription_3_1'
        },
        {
            categoryId: 'category3',
            en_US: { id: 4663888973001 },
            de_DE: { id: 4663888973001 },
            labelId: 'tia.VideoTitle_3_2',
            descriptionLabelId: 'tia.VideoDescription_3_2'
        },
        {
            categoryId: 'category3',
            en_US: { id: 5371027180001 },
            de_DE: { id: 5371027180001 },
            labelId: 'tia.VideoTitle_3_3',
            descriptionLabelId: 'tia.VideoDescription_3_3'
        },
        {
            categoryId: 'category3',
            en_US: { id: 6361438475112 },
            de_DE: { id: 6361438475112 },
            labelId: 'tia.VideoTitle_1_6',
            descriptionLabelId: 'tia.VideoDescription_1_6'
        },
    ];

    console.log("[videos] data lengths:", videoCategories.length, videos.length);
    if (!videos.length) {
        categoriesDiv.textContent = "videos[] is empty in external script.";
        return;
    }

    const accountId = "1813624294001";
    const guid = "f83fb7f6-75c0-411c-872c-ab6095a19211";

    function getLocaleKeyOfObject(obj) {
        const k = window?.FluidTopicsI18nService?.currentUiLocale?.replace("-", "_");
        return obj?.[k] ? k : "en_US";
    }

    function createVideoIFrame(videoId) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://players.brightcove.net/${accountId}/${guid}_default/index.html?videoId=${videoId}`;
        iframe.className = "video-iframe";
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("webkitallowfullscreen", "");
        iframe.setAttribute("mozallowfullscreen", "");
        return iframe;
    }

    function showVideosOfCategory(categoryId) {
        iFrameContainer.innerHTML = "";
        const list = videos.filter(v => v.categoryId === categoryId);
        for (const v of list) {
            const localeKey = getLocaleKeyOfObject(v);
            iFrameContainer.appendChild(createVideoIFrame(v[localeKey].id));
        }
    }

    function onSelectCategory(cat) {
        [...categoriesDiv.children].forEach(c => c.classList.toggle("active", c.id === cat.id));
        showVideosOfCategory(cat.id);
    }

    categoriesDiv.innerHTML = "";
    for (const cat of videoCategories) {
        const div = document.createElement("div");
        div.id = cat.id;
        div.className = "category";
        div.textContent = cat[getLocaleKeyOfObject(cat)].title;
        div.addEventListener("click", () => onSelectCategory(cat));
        categoriesDiv.appendChild(div);
    }

    onSelectCategory(videoCategories[0]);
    console.log("[videos] initialized ✅");
}
