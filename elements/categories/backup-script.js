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

//const videoCategories = videos.filter((c, index) => (videos.indexOf(videos.find(v => v.categoryId == c.categoryId)) == index)).map(c => c.categoryId);

const accountId = '1813624294001';
const guid = 'f83fb7f6-75c0-411c-872c-ab6095a19211';

let categoriesDiv = document.getElementById('categories');

clearCategories();
for (const videoCategory of videoCategories) {
    let categoryDiv = createCategory(videoCategory);
}

onSelectCategory(undefined, videoCategories[0])

function showVideosOfCategory(categoryId) {
    let iFrameContainer = document.getElementById('iframe-container');
    iFrameContainer.innerHTML = '';
    const videosOfCategory = videos.filter(v => v.categoryId == categoryId);
    for (const video of videosOfCategory) {
        const localeKey = getLocaleKeyOfObject(video);
        if (video?.labelId/* && video?.[localeKey]?.thumbnailUrl*/) {
            iFrameContainer.appendChild(createVideoCard(video, localeKey));
        } else {
            iFrameContainer.appendChild(createVideoIFrame(video[localeKey].id));
        }
    }
}

function getLocaleKeyOfObject(obj) {
    const currentUiLocaleKey = window?.FluidTopicsI18nService?.currentUiLocale?.replace('-', '_');
    if (obj?.[currentUiLocaleKey]) {
        return currentUiLocaleKey;
    }
    return 'en_US'; // fallback language
}

function clearCategories() {
    let categories = document.getElementById('categories');
    categories.innerHTML = '';
}

function onSelectCategory(evt, category) {
    categoriesDiv.childNodes.forEach(c => {
        if (c.id === category.id) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
    showVideosOfCategory(category.id);
}

function createCategory(category) {
    let categoryDiv = document.createElement('div');
    categoryDiv.id = category.id;
    categoryDiv.classList.add('category');

    const localeKey = getLocaleKeyOfObject(category);
    categoryDiv.innerHTML = category[localeKey].title;

    categoryDiv.addEventListener('click', (evt) => onSelectCategory(evt, category));

    categoriesDiv.appendChild(categoryDiv);

    return categoryDiv;
}

function createVideoIFrame(videoId) {
    let iframe = document.createElement('iframe');
//  iframe.classList.add('video-iframe');
    //iframe.src = `https://players.brightcove.net/${accountId}/default_default/index.html?videoId=${videoId}`;
    iframe.src = `https://players.brightcove.net/${accountId}/${guid}_default/index.html?videoId=${videoId}`;
    iframe.classList.add('video-iframe');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('webkitallowfullscreen', '');
    iframe.setAttribute('mozallowfullscreen', '');
    return iframe;
}

function createVideoCard(video, localeKey) {
//  let card = document.createElement('ft-designed-component');
//  card.setAttribute('data-gjs-highlightable', 'true')
//  card.setAttribute('data-gjs-type', 'ft-designed-component')
//  card.setAttribute('draggable', 'true')
//  card.setAttribute('component-id', '82947a33-057d-47b1-8c25-5c5e9b5270c5')
//  card.className = 'gjs-selected';
    let link = document.createElement('a');
    link.href = `https://players.brightcove.net/${accountId}/${guid}_default/index.html?videoId=${video[localeKey].id}`;

    let card = document.createElement('div');
    card.className = 'video-card';
    link.appendChild(card);

    let cardColumnContainer = document.createElement('div');
    card.appendChild(cardColumnContainer);

    let cardImageContainer = document.createElement('div');
    cardColumnContainer.appendChild(cardImageContainer);

    let cardImage;
    if (video[localeKey].thumbnailUrl) {
        cardImage = document.createElement('img');
        cardImage.src = video[localeKey].thumbnailUrl;
    } else {
        cardImage = createVideoIFrame(video[localeKey].id)
    }
    cardImageContainer.appendChild(cardImage);

    let cardTextContainer = document.createElement('div');
    cardColumnContainer.appendChild(cardTextContainer);

    cardTextContainer.appendChild(createLocalizedLabel(video.labelId));
    cardTextContainer.appendChild(createLocalizedLabel(video.descriptionLabelId));

    //let learnMoreContainer = document.createElement('div');
    //learnMoreContainer.className = 'learn-more';
    //learnMoreContainer.appendChild(createLocalizedLabel("tia.learnMore"));
    //let arrowRight = document.createElement('img');
    //arrowRight.src = '/portal-asset/Arrow-Right-Link';
    //arrowRight.style.marginLeft = '8px';
    //learnMoreContainer.appendChild(arrowRight);
    //cardTextContainer.appendChild(learnMoreContainer);

    return link;
}

function createLocalizedLabel(contextAndKeyString) {
    const contextAndKeyParts = contextAndKeyString.split('.');
    const context = contextAndKeyParts[0];
    const key = contextAndKeyParts[1];

    let localizedLabel = document.createElement('span');
    localizedLabel.innerHTML = window.FluidTopicsCustomI18nService.resolveMessage(context, key);
    /*
      let localizedLabel = document.createElement('ft-localized-label');
      localizedLabel.setAttribute('data-gjs-highlightable', 'true')
      localizedLabel.setAttribute('data-gjs-type', 'ft-i18n')
      localizedLabel.setAttribute('draggable', 'true')
      localizedLabel.setAttribute('context', context)
      localizedLabel.setAttribute('key', key)
      localizedLabel.setAttribute('defaultmessage', contextAndKeyString)
    */
    return localizedLabel;
}
