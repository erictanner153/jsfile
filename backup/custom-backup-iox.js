// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
// Bitte hier KEINE Änderungen am Code vornehmen!
// Alle Änderungen sollten ausschließlich im Repository vorgenommen werden:
//
// https://code.siemens.com/docs-as-code-hub/projects/fluid-topics-iox/-/tree/main/JavaScript
//
// (TIA: https://code.siemens.com/fluidtopics/tia/-/tree/main/Code)
//
// Danach per "merge.bat" die Dateien für die jeweiligen Portale erzeugen
// und den Inhalt per copy&paste im jeweiligen Portal einfügen:
// - iox-custom-javascript-merged.js
// - tia-custom-javascript-merged.js
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!https://siemens-industrialedge-staging.fluidtopics.net/
///////////////////////////////////////////////////////////////////////////////
// tools
// Load global script from GitHub/CDN
//dev loadGlobalJavascriptFile () {
// var script = document.createElement('script');
//    script.src = "https://erictanner153.github.io/jsfile/function/ft-global.js";
//    script.async = true;
//    document.head.appendChild(script);
//}
//loadGlobalJavascriptFile();
//dev loadGlobalCssFile() {
//  const link = document.createElement('link');
//  link.rel = 'stylesheet';
//  link.href = 'https://erictanner153.github.io/jsfile/compiled-styles/topic.css'; // change to your CSS URL
//  link.media = 'all';
//  document.head.appendChild(link);
//}
//loadGlobalCssFile();
function findParentNodeByTagName(node, tagName) {
    while (node = node.parentElement) {
        if (node.tagName == tagName) {
            break;
        }
    }
    return node;
}
function unescapeHTMLEntities(encodedText) {
    // create temporary textarea node to "unescape" the code
    var tempTextAreaNode = document.createElement('textarea');
    tempTextAreaNode.innerHTML = encodedText;
    const decoded = tempTextAreaNode.value;
    tempTextAreaNode.remove();
    return decoded;
}
///////////////////////////////////////////////////////////////////////////////
// Find element by querySelector in the document and all its shadow-roots
function findElementsInShadowRoots(querySelector) {
    const foundElements = [];
    function searchInNode(node) {
        if (node.shadowRoot) {
            searchInNode(node.shadowRoot);
        }
        if (node?.childNodes?.length) {
            const elements = node.querySelectorAll(querySelector);
            foundElements.push(...elements);
        }
        node.childNodes.forEach(child => searchInNode(child));
    }
    searchInNode(document);
    return foundElements;
}
///////////////////////////////////////////////////////////////////////////////
// wait functions
function waitForQuerySelector(selector, root, timeoutMs = 15000) {
    let checkFunc = function() {
        return (root || document).querySelector(selector);
    };
    return waitFor(checkFunc, timeoutMs);
}
function waitForQuerySelectorAll(selector, root, timeoutMs = 15000) {
    let checkFunc = function() {
        return (root || document).querySelectorAll(selector);
    };
    return waitFor(checkFunc, timeoutMs);
}
async function waitFor(checkFunc, timeoutMs = 5000, sleepIntervalMs = 50) {
    let startTime = Date.now();
    while(true) {
        if ((Date.now()-startTime) >= timeoutMs) {
            return undefined;
        }
        let result = checkFunc();

        let hasArrayElements = true;
        if (Array.isArray(result)) {
            hasArrayElements = result.length > 0;
        }
        if (result !== undefined && result !== null && hasArrayElements) {
            return result;
        }
        await sleep(sleepIntervalMs);
    }
}
async function sleep(delay) {
    await new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}
///////////////////////////////////////////////////////////////////////////////
// reader header bar tools
async function getHeaderBarElement() {
    let el = findElementsInShadowRoots('#designed-header-custom-controls')?.[0];
    if (!el) {
        el = await waitForQuerySelector('.header-actions.header-page-actions');
    }
    return el;
}
async function addElementToHeaderBar(element) {
    let headerBar = await getHeaderBarElement()
    if (!headerBar) {
        console.log('no header actions element!');
        return;
    }
    if (element.id && /*document.getElementById(element.id)*/findElementsInShadowRoots('#' + element.id)?.[0]) {
        // element already exists
        return;
    }
    headerBar?.appendChild(element);
}
///////////////////////////////////////////////////////////////////////////////
// last visited page
let g_lastVisitedNonReaderPage = undefined;
function storeLastVisitedNonReaderPage(event) {
    //const url = window.history?.state?.token;
    //const title = ;
    const url = event.detail[0].parameters.page.url;
    const title = event.detail[0].parameters.page.name;
    if (url === '/' || url === '/home' || url?.startsWith('/p')) {
        g_lastVisitedNonReaderPage = { url: url, title: title };
        localStorage.setItem('lastVisitedNonReaderPage', JSON.stringify(g_lastVisitedNonReaderPage));
    }
}
function updateBreadcrumbs(event) {
    let isPreviewFromDifferentBook = document.querySelector('.ft-largepopup');
    if (isPreviewFromDifferentBook) {
        return;
    }
    let breadcrumbs = [];
    if (g_lastVisitedNonReaderPage) {
        breadcrumbs.push(g_lastVisitedNonReaderPage);
    }
    let docTitle;
    /*const ftBreadcrumbs = event.detail[0].parameters?.breadcrumb;
    if (ftBreadcrumbs?.length > 0) {
      let lastFtBreadcrumb;
      if (ftBreadcrumbs.length > 1) {
        lastFtBreadcrumb = ftBreadcrumbs[ftBreadcrumbs.length-2];
      } else {
        lastFtBreadcrumb = ftBreadcrumbs[ftBreadcrumbs.length-1];
      }
      docTitle = lastFtBreadcrumb.title;
    } else */{
        docTitle = event.detail[0].parameters?.document?.title;
    }
    //  console.log('docTitle: ' + docTitle);
    if (docTitle) {
        breadcrumbs.push({ url: undefined, title: docTitle });
    }
    setBreadcumbs(breadcrumbs);
}
function setBreadcumbs(breadcrumbs) {
    let subHeader = document.querySelector('div.coverbar-header span.coverbar-title');
    if (!subHeader) {
        return;
    }
    let breadcrumbSeparator = document.createElement('span');
    breadcrumbSeparator.classList.add('breadcrumb-separator');
    breadcrumbSeparator.textContent = ' > ';
    let breadcrumbsContainer = document.createElement('span');
    breadcrumbsContainer.classList.add('coverbar-title');
    for (const breadcrumb of breadcrumbs) {
        let breadcrumbElement = document.createElement('span');
        breadcrumbElement.classList.add('breadcrumb-item');
        if (breadcrumb?.url) {
            breadcrumbElement.addEventListener('click', () => FluidTopicsRouterService.navigateTo(breadcrumb.url));
        }
        breadcrumbElement.textContent = breadcrumb.title;
        if (breadcrumbsContainer.children.length == 0) {
            breadcrumbElement.classList.add('non-reader-page');
        } else {
            breadcrumbsContainer.appendChild(breadcrumbSeparator.cloneNode(true));
        }
        breadcrumbsContainer.appendChild(breadcrumbElement);
    }
    subHeader.replaceWith(breadcrumbsContainer);
}
async function updateSearchPageBackButton(event) {
    let existingButton = document.querySelector('.searchresults-back-button');
    if (!g_lastVisitedNonReaderPage/* || !isSearchPageEvent(event)*/) {
        existingButton?.remove();
        return;
    } else if (existingButton) {
        return;
    }
    // wait for logo in header so our button is appended right to it
    let headerLogo = await waitForQuerySelector('a.backtohomelogo-container img.backtohomelogo-image');
    headerLogo.classList.add('backtohomelogo-only-on-small-viewports');
    //const targetElement = document.querySelector('nav.fluid-aside-tabs-inner-wrapper[role="tablist"]');
    const targetElement = document.querySelector('section.header-left-side');
    if (!targetElement) {
        return;
    }
    targetElement.appendChild(await createSearchPageBackButton(g_lastVisitedNonReaderPage))
}
async function createSearchPageBackButton(lastVisitedNonReaderPage) {
    var backToSearchResultsContainer = document.createElement('div');
    backToSearchResultsContainer.className = 'backtosearchresults-container searchresults-back-button';
    /*backToSearchResultsContainer.style.color = 'var(--ft-theme-secondary)';
    backToSearchResultsContainer.style.height = '100%';
    backToSearchResultsContainer.style.display = 'flex';
    backToSearchResultsContainer.style.display = 'flex';
    backToSearchResultsContainer.style.justifyContent = 'center';
    backToSearchResultsContainer.style.alignItems = 'center';*/
    var backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'ft-btn ft-btn-no-bg ft-btn-no-border';
    //backButton.ariaLabel = 'Go to Search page';
    //backButton.title = '';
    let icon = document.createElement('i');
    icon.className = 'ft-icon ft-icon-no-icon ft-icon-back';
    icon.ariaHidden = true;
    let span = document.createElement('span');
    span.className = 'ft-btn-inner-text';
    span.innerHTML = 'Back';
    backButton.onclick = function(e) {
        window.location.href = lastVisitedNonReaderPage.url;
    };
    backButton.appendChild(icon);
    backButton.appendChild(span);
    backToSearchResultsContainer.appendChild(backButton);
    return backToSearchResultsContainer;
}
// async dev updateReaderPageBackButton(event) {
//   if (!g_lastVisitedNonReaderPage/* || !isReaderPageEvent(event)*/) {
//     return;
//   }
//   let button = document.querySelector('.backtosearchresults-button');
//   if (button) {
//     button = findElementsInShadowRoots('#back-to-search')?.[0];
//   }
//   if (!button?.onclick) {
//     console.error('Back button not found!');
//     return;
//   }
//   button.onclick = (e) => {
//     if (g_lastVisitedNonReaderPage?.url) {
//       window.location.href = g_lastVisitedNonReaderPage.url;
//     }
//   };
// }
///////////////////////////////////////////////////////////////////////////////
// localization tools
// =====================================================
// Retry configuration
// =====================================================
const I18N_MAX_RETRIES = 10;          // number of attempts before giving up
const I18N_RETRY_DELAY_MS = 300;      // delay between retries (ms)
let i18nRetryCount = 0;
let i18nRetryTimeoutId = null;
function scheduleLocalizedLinksRetry() {
    if (i18nRetryCount >= I18N_MAX_RETRIES) {
        return;
    }
    if (i18nRetryTimeoutId) clearTimeout(i18nRetryTimeoutId);
    i18nRetryTimeoutId = setTimeout(() => {
        i18nRetryCount++;
        replaceLocalizedLinks();
    }, I18N_RETRY_DELAY_MS);
}
// =====================================================
// Modified replaceLocalizedLinks()
// =====================================================
async function replaceLocalizedLinks() {
    const localizedLinks = findElementsInShadowRoots('a[href$="_URL"]');
    console.log('debug_1 (links found):', localizedLinks);
    // NEW: if links not detected yet → retry instead of exiting immediately
    if (localizedLinks.length === 0) {
        scheduleLocalizedLinksRetry();
        return;
    }
    let unresolved = 0;
    await Promise.all(
        localizedLinks.map(async (link) => {
            const href = link.getAttribute('href');
            const parts = href?.split('.');
            if (!parts || parts.length !== 2) {
                console.log('[i18n] Ignored — unexpected href format:', href);
                return;
            }
            const [context, key] = parts;
            await FluidTopicsCustomI18nService.prepareContext(context, {});
            const url = FluidTopicsCustomI18nService.resolveMessage(context, key);
            if (url) {
                link.href = url;
            } else {
                console.log('[i18n] Attempting to resolve:', { context, key });
                console.log('[i18n] Not resolved yet:', href);
                unresolved++;
            }
        })
    );
    // NEW: retry again if unresolved placeholders remain
    if (unresolved > 0) {
        scheduleLocalizedLinksRetry();
    } else {
        i18nRetryCount = 0;
        if (i18nRetryTimeoutId) clearTimeout(i18nRetryTimeoutId);
    }
}
let g_lastVisitedNonReaderPageTitle = undefined;
async function localizePageTitleReaderBreadcrumb() {
    g_lastVisitedNonReaderPageTitle = undefined;
    const localizedLinks = await waitFor(() => findElementsInShadowRoots('ft-localized-label[key="pageTitle"]'), 60000);
    const link = localizedLinks?.[0];
    if (link) {
        const context = link.getAttribute('context');
        const contextAndKey = `${context}.pageTitle`;
        let checkFunc = function() {
            const pageTitle = FluidTopicsCustomI18nService.resolveMessage(context, 'pageTitle');
            if (pageTitle && pageTitle !== contextAndKey && pageTitle !== g_lastVisitedNonReaderPageTitle) {
                return pageTitle;
            }
            return undefined;
        };
        const pageTitle = await waitFor(checkFunc, 60000);
        if (pageTitle) {
            g_lastVisitedNonReaderPageTitle = pageTitle;
        }
    }
}
///////////////////////////////////////////////////////////////////////////////
// Change BackButton to Browser back
function changeReaderPageBackToBrowserBack() {
    function changeBackButton() {
        backButton.onclick = () => {
            history.go(-1);
        };
    }
    //look for the back button container, if the code does not work, it might be because the container is not loaded yet.
    let appContent = document.querySelector(".coverbar-back-container");
    if (appContent == null) {
        return;
    }
    // try to find the button
    let backButtonSelector = "button";
    let backButton = appContent.querySelector(backButtonSelector);
    //the button is there, change the beaviour
    if (backButton != null) {
        changeBackButton();
        return;
    }
    function backButtonLoaded() {
        //something changed in the container
        backButton = document.querySelector(backButtonSelector);
        if (backButton == null) {
            //it was not the button, keep observing
            return;
        }
        //the button is there, change the beaviour
        changeBackButton();
        //stop observing the container
        observer.disconnect();
    }
    //the button is not there, observe the container until you find the button
    let observer = new MutationObserver(backButtonLoaded);
    let config = {
        childList: true,
        subtree: true,
    };
    observer.observe(appContent, config);
}
///////////////////////////////////////////////////////////////////////////////
// Add resize handle to right side of reader page
async function addReaderContentContainerResizeHandle() {
    let readerContentContainers = findElementsInShadowRoots('#readerContentResizeContainer');
    readerContentContainers.forEach(readerContentContainer => {
        let readerContentContainerResizer = readerContentContainer?.querySelector('#readerContentResizeContainertResizer');
        if (!readerContentContainer || !readerContentContainerResizer) {
            return;
        }
        readerContentContainerResizer.addEventListener('mouseenter', function (e) {
            readerContentContainerResizer.style.backgroundColor = 'black';
        });
        readerContentContainerResizer.addEventListener('mouseleave', function (e) {
            readerContentContainerResizer.style.backgroundColor = 'transparent';
        });
        const minWidth = readerContentContainer?.style?.minWidth || 100;
        const maxWidth = readerContentContainer?.style?.maxWidth || 4096;
        readerContentContainerResizer.addEventListener('mousedown', function (e) {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = readerContentContainer.offsetWidth;
            function onMouseMove(e) {
                const newWidth = startWidth + (e.clientX - startX);
                // Optional: enforce min and max width
                if (newWidth >= minWidth && newWidth <= maxWidth) {
                    readerContentContainer.style.width = newWidth + 'px';
                }
            }
            function onMouseUp() {
                // Clean up
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            }
            // Set up event listeners
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    });
}
///////////////////////////////////////////////////////////////////////////////
// theme (light/dark mode) toggle button
let isThemeInitialized = false;
async function setupThemeToggleButton() {
    const docElement = document.documentElement;
    const themes = FluidTopicsThemeService.listThemes();
    const lightThemeId = themes?.find(t => t.name === 'theme-light')?.id;
    const darkThemeId = themes?.find(t => t.name === 'theme-dark')?.id;
    if (!lightThemeId || !darkThemeId) {
        console.error('Themes not found! Theme toggle button will be removed.', lightThemeId , darkThemeId);
    }
    // Check if page requires light mode
    const forceLightMode = document.querySelector('.readercontent-papyrus-sheet') !== null;
    const setTheme = (darkMode) => {
        const themeIdToSet = (darkMode && !forceLightMode) ? darkThemeId : lightThemeId;
        FluidTopicsThemeService.setTheme(themeIdToSet);
    }
    const setIcon = (icon, darkMode) => {
        const effectiveDarkMode = darkMode && !forceLightMode;

        if (!!icon) {
            icon.value = effectiveDarkMode ? 'dark_mode' : 'light_mode';
        }
        if (!effectiveDarkMode) {
            docElement.classList.remove('theme-dark');
            docElement.classList.add('theme-light');
        } else {
            docElement.classList.remove('theme-light');
            docElement.classList.add('theme-dark');
        }
    }
    const activeTheme = FluidTopicsThemeService.getActiveTheme();
    // Force light mode ONLY once and ONLY if not already light mode
    if (forceLightMode && !isThemeInitialized && activeTheme.id !== lightThemeId) {
        setTheme(false);
        isThemeInitialized = true;
        return; // Exit early to prevent further processing during reload
    }

    // Mark as initialized even if theme didn't need changing
    if (forceLightMode && !isThemeInitialized) {
        isThemeInitialized = true;
    }
    let containers = findElementsInShadowRoots('#themeToggleContainer');
    for (const container of containers) {
        if (!lightThemeId || !darkThemeId) {
            container.remove();
            continue;
        }
        // Disable toggle button if light mode is forced
        if (forceLightMode) {
            container.style.opacity = '0.5';
            container.style.pointerEvents = 'none';
            container.title = 'Theme switching is disabled on this page';
        }
        let icon = container?.querySelector('ft-icon');
        if (!container || !icon) {
            return;
        }
        const hasClickHandler = container.getAttribute('has-click-handler') === "true";
        if (!hasClickHandler) {
            container.addEventListener('click', function(e) {
                if (forceLightMode) return; // Prevent switching if forced

                const isDarkMode = (activeTheme.id == lightThemeId);
                setTheme(isDarkMode);
                setIcon (icon, isDarkMode);
            });
            container.setAttribute('has-click-handler', "true");
            setIcon (icon, activeTheme.id == lightThemeId);
        }
    }
}
///////////////////////////////////////////////////////////////////////////////
// staging banner
async function addStagingBanner() {
    if (document.getElementById('stagingBanner')) {
        return;
    }
    const ftApi = new window.fluidtopics.FluidTopicsApi();
    if (ftApi?.tenantBaseUrl?.indexOf('-staging.fluidtopics.net') > 0) {
        const bannerElement = document.createElement('span');
        bannerElement.id = 'stagingBanner';
        bannerElement.style.fontSize = '24px';
        bannerElement.style.color = 'black';
        bannerElement.style.height = 'fit-content';
        bannerElement.style.alignSelf = 'center';
        bannerElement.style.margin = '0px 16px 0px 16px';
        bannerElement.style.padding = '4px 8px 4px 8px';
        bannerElement.style.border = '2px solid red';
        bannerElement.style.borderRadius = '8px';
        bannerElement.style.backgroundColor = '#FFA0A0';
        bannerElement.innerHTML = 'Staging';
        await addElementToHeaderBar(bannerElement);
    }
}
///////////////////////////////////////////////////////////////////////////////
// Show a dynamic table and hide all other dynamic tables
function onDynamicTableChangeFunction(e, tablesGUID) {
    const selectElement = e.target;
    showOnlyThisTable(tablesGUID, selectElement.options[selectElement.options.selectedIndex].value)
}
function setDynamicTableChangeEvents() {
    let selectElements = document.querySelectorAll('.dynamictable select');
    for (let selectElement of selectElements) {
        let tablesGUID = selectElement.id?.split('_')?.[1];
        selectElement.addEventListener("change", (e) => onDynamicTableChangeFunction(e, tablesGUID));
    }
}
function showOnlyThisTable(blockId, selectionId) {
    const elements = document.querySelectorAll("[id^='" + blockId + "']");
    if (selectionId == "all") {
        for (const element of elements) {
            element.classList.remove('dynamicblock');
            element.classList.add('dynamicexpandedblock');
        }
    } else {
        for (const element of elements) {
            if (element.id == selectionId) {
                element.classList.remove('dynamicblock');
                element.classList.add('dynamicexpandedblock');
            } else {
                element.classList.add('dynamicblock');
                element.classList.remove('dynamicexpandedblock')
            }
        }
    }
}
///////////////////////////////////////////////////////////////////////////////
// button to copy first column to clipboard
function setTableFirstRowCopyButtonHandlers() {
    const imgElements = findTableFirstRowCopyButtons();
    for (const aElement of imgElements) {
        aElement.addEventListener("click", (e) => copyFirstColumnToClipboardFunction(aElement));
        aElement.setAttribute("href", "javascript:;");
    }
}
function findTableFirstRowCopyButtons() {
    results = [];
    const imageButtonsInTableHeaders = findElementsInShadowRoots('thead a.ft-internal-link:has(img)');
    for (const aElement of imageButtonsInTableHeaders) {
        const imgEl = aElement.querySelector('img');
        if (imgEl?.src?.endsWith('/portal-asset/iconCopy')) {
            results.push(aElement);
        }
    }
    return results;
}
function copyFirstColumnToClipboardFunction(aElement) {
    const tableNode = findParentNodeByTagName(aElement, 'TABLE');
    const firstRowCodeContents = tableNode?.querySelectorAll('tbody tr td:first-child p.p_table_l_code');
    let clipboardContent = "";
    for (const firstRowCodeContent of firstRowCodeContents) {
        const decoded = unescapeHTMLEntities(firstRowCodeContent.innerHTML);
        clipboardContent += decoded + '\n';
    }
    if (clipboardContent.length > 0) {
        navigator.clipboard.writeText(clipboardContent);
    }
}
///////////////////////////////////////////////////////////////////////////////
// page render complete event
const OnPageRenderedEvent = "pageRendered";
const RenderedPageType = {
    HomeOrCustom: 'homeOrCustom',
    Reader: 'reader',
    Search: 'search',
};
// --------------------------------------------------------------------------
// Gibt true zurück, wenn die besuchte Seite eine Home- oder Custom-Page (und keine Search- oder Reader-Page) ist
function isHomeOrCustomPageEvent(event) {
    return event.detail?.[0]?.name == 'page.display';
}
// --------------------------------------------------------------------------
// Gibt true zurück, wenn die besuchte Seite die Reader-Page ist
function isReaderPageEvent(event) {
    return event?.detail?.[0]?.name === 'topic.start_display';
}
// --------------------------------------------------------------------------
// Gibt true zurück, wenn die besuchte Seite die Search-Page ist
function isSearchPageEvent(event) {
    //return event.detail?.[0]?.name == 'khub.search';
    return event?.detail?.[0]?.parameters?.searchQuery !== undefined;
}
let g_dispatchPageRenderedEventCalled = false;
function dispatchPageRenderedEvent(event) {
    g_dispatchPageRenderedEventCalled = true;
    if (isHomeOrCustomPageEvent(event)) {
        addPageRenderCompletedEventListener(function (mutations)  {
            const homeOrCustomPageRenderedEvent = new CustomEvent(OnPageRenderedEvent, { detail: { type: RenderedPageType.HomeOrCustom, event: event, mutations: mutations, }, });
            document.dispatchEvent(homeOrCustomPageRenderedEvent);
            return true; /* return false to stop listening to the event */
        });
    } else if (isReaderPageEvent(event)) {
        const readerPageRenderedEvent = new CustomEvent(OnPageRenderedEvent, { detail: { type: RenderedPageType.Reader, event: event, mutations: undefined, }, });
        document.dispatchEvent(readerPageRenderedEvent);
    } else if (isSearchPageEvent(event)) {
        const searchPageRenderedEvent = new CustomEvent(OnPageRenderedEvent, { detail: { type: RenderedPageType.Search, event: event, mutations: undefined, }, });
        document.dispatchEvent(searchPageRenderedEvent);
    }
}
let g_dispatchPageRenderedEventTimeoutId = undefined;
document.addEventListener('ft:analytics:userevents', async function(event) {
    // only fire once
    //if (g_dispatchPageRenderedEventCalled) {
    //  return;
    //}
    // "low pass filter" / prevent duplicate calls
    // if (g_dispatchPageRenderedEventTimeoutId) {
    // clearTimeout(g_dispatchPageRenderedEventTimeoutId);
    // }
    dispatchPageRenderedEvent(event);
});
// ----------------------------------------------------------------------------
function addPageRenderCompletedEventListener(eventFunc) {
    var observer = new MutationObserver(function(mutations) {
        //if (document.contains(element)) {
        if (document.getElementById('custom-page-designed-content') || document.getElementById('homepage-designed-content')) {
            if (!eventFunc(mutations)) {
                observer.disconnect();
            }
        }
    });
    observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
}
///////////////////////////////////////////////////////////////////////////////
// chat-bot
async function injectChatBot() {
    if (document.getElementById("siemens-akg-widget")) {
        return;
    }
    /*
      var script = document.createElement('script');
      script.setAttribute('src', 'https://saprodchatwidgetfeapps.z28.web.core.windows.net');
      script.setAttribute('type', 'text/javascript');
      document.getElementsByTagName('head')[0].appendChild(script);
    //console.log(script);
    */
    var bot = document.createElement('div');
    bot.id = "siemens-akg-widget";
    bot.setAttribute('data-app-name', "Online Docs");
    bot.setAttribute('data-app-filter', "OnlineDocs");
    //document.body.appendChild(bot);
    //console.log(bot);
    document.querySelector('.component-content').append(bot);
    await loadExternalScript('https://saprodchatwidgetfeapps.z28.web.core.windows.net');
    let event = document.createEvent("HTMLEvents");
    event.initEvent('DOMContentLoaded', true, true)
    event.eventName = "DOMContentLoaded";
    document.dispatchEvent(event);
}
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Industrial Edge
const initHighlightJS = () => {
    // Highlight JS
    let hljsScriptLoaded = false;
    document.addEventListener('ft:reader:topicsloaded', () => {
        if (!hljsScriptLoaded) {
            var hljsScript = document.createElement('script');
            hljsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            hljsScript.async = true;
            hljsScript.onload = function() {
                // Only apply the highlighting after the script has loaded
                document.querySelectorAll('pre.codeblock p, pre.codeblock, div.highlight pre').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            };
            document.head.appendChild(hljsScript);
            var hljsStyle = document.createElement('link');
            hljsStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/nord.css';
            hljsStyle.rel = "stylesheet";
            document.head.appendChild(hljsStyle);
            hljsScriptLoaded = true;
        } else {
            // If script is already loaded, just apply the highlighting
            document.querySelectorAll('pre.codeblock p, pre.codeblock, div.highlight pre').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }
    });
}
// deactivate for now because I want to check why the language information is not there
// initHighlightJS();
///////////////////////////////////////////////////////////////////////////////
// --------------MKDOCS: Mermaid Extension------------------------------------------------------
var mermaid_config = {
    startOnLoad: false,
    securityLevel: 'loose',
    logLevel: 'trace',
    theme: "base",
    themeVariables: {
        fontFamily: 'Siemens Sans',
        primaryColor: '#000028',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#00CCCC',
        lineColor: '#00CCCC',
        secondaryColor: '#23233C',
        tertiaryColor: '#00002880',
        tertiaryBorderColor: "#e0e0e0",
        tertiaryTextColor: "#ffffff"
    },
    flowchart: { htmlLabels: true },
    er: { useMaxWidth: false },
    sequence: { useMaxWidth: false }
};
// ------------------------
//  NORMALIZER FOR MERMAID
// ------------------------
function normalizeMermaid(text) {
    let cleaned = text.trim();
    // Remove YAML front matter
    cleaned = cleaned.replace(/^---[\s\S]*?---\s*/g, "");
    // Remove leading blank lines
    cleaned = cleaned.replace(/^\s*\n+/g, "");
    // Ensure flowchart has direction
    cleaned = cleaned.replace(
        /^flowchart\s*$(?![\s\S]*?(TB|TD|LR|RL|BT))/m,
        "flowchart TB"
    );
    // Fix flowchart followed by empty lines
    cleaned = cleaned.replace(
        /^flowchart\s*[\r\n]+(?=subgraph|[a-zA-Z])/m,
        "flowchart TB\n"
    );
    // Remove dangling arrows: A -->
    cleaned = cleaned.replace(/-->\s*$/gm, "");
    // Normalize arrow spacing
    cleaned = cleaned.replace(/-->/g, " --> ")
        .replace(/<-->/g, " <--> ")
        .replace(/<--/g, " <-- ");
    // Collapse excessive empty lines
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    return cleaned.trim();
}
// ------------------------
//  LOAD MERMAID
// ------------------------
var mermaidScript = document.createElement('script');
mermaidScript.type = 'text/javascript';
mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
mermaidScript.onload = function () {
    mermaid.initialize(mermaid_config);
    renderMermaid();
};
document.head.appendChild(mermaidScript);
// ------------------------
//  EXTRACT MERMAID SOURCE
// ------------------------
function extractMermaidSource(block) {
    if (block.tagName === "CODE") {
        return block.textContent;
    }
    const code = block.querySelector("code");
    if (code) return code.textContent;
    const pre = block.querySelector("pre");
    if (pre && !code) return pre.textContent;
    return [...block.childNodes]
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent)
        .join("\n");
}
// ----------------------------------------------------
//  FIX: Universal Mermaid Block Finder (important!)
// ----------------------------------------------------
function getAllMermaidBlocks() {
    // Case 1: <div class="mermaid">
    const blocks1 = findElementsInShadowRoots('.mermaid:not(.rendered)');
    // Case 2: <pre><code class="language-mermaid">
    const blocks2 = findElementsInShadowRoots('code.language-mermaid:not(.rendered)')
        .map(code => code.parentElement);
    // Case 3: <pre class="language-mermaid">
    const blocks3 = findElementsInShadowRoots('pre.language-mermaid:not(.rendered)');
    // Merge unique
    return Array.from(new Set([...blocks1, ...blocks2, ...blocks3]));
}
// ------------------------
//  RENDER MERMAID
// ------------------------
async function renderMermaid() {
    const blocks = getAllMermaidBlocks();
    for (const [index, block] of blocks.entries()) {
        const uid = "aGraph" + Date.now() + index;
        try {
            let raw = extractMermaidSource(block);
            if (!raw || raw.trim() === "") {
                console.warn("No Mermaid text found:", block);
                block.classList.add("rendered");
                continue;
            }
            const graphDefinition = normalizeMermaid(raw);
            const { svg, bindFunctions } = await mermaid.render(uid, graphDefinition);
            // Replace code block with SVG
            block.innerHTML = svg;
            if (bindFunctions)
                bindFunctions(block);
            block.classList.add("rendered");
        } catch (error) {
            console.error(`Mermaid render error (${uid}):`, error);
            block.classList.add("rendered");
        }
    }
}
//document.addEventListener('ft:reader:topicsloaded', renderMermaid);
//document.addEventListener('ft:reader:topicsloaded', ApplyMermaid);
///////////////////////////////////////////////////////////////////////////////
// Add support for plantuml diagrams
var plantumlScript = document.createElement('script');
plantumlScript.type = 'text/javascript';
plantumlScript.src = 'https://cdn.jsdelivr.net/npm/plantuml-encoder/dist/plantuml-encoder.min.js';
document.head.appendChild(plantumlScript);
async function renderPlantUMLDiagrams() {
    const plantumlDiagram = findElementsInShadowRoots('.plantuml:not(.rendered)');
    for (const block of plantumlDiagram) {
        var plantumlCode = block.textContent;
        var encoded = plantumlEncoder.encode(plantumlCode);
        var imgUrl = 'https://code.siemens.com/api/kroki/plantuml/svg/' + encoded;
        fetch(imgUrl)
            .then(response => response.text())
            .then(svgContent => {
                block.innerHTML = svgContent;
                // mark the node as rendered to avoid several rendering
                block.classList.add("rendered");
            })
            .catch(error => console.error('Error fetching SVG:', error));
    }
}
///////////////////////////////////////////////////////////////////////////////
// This code adds the copy button to Code blocks in SIMATIC AX documentation
async function addFtCopyBlockToHighlightsEls(event) {
    // Use findElementsInShadowRoots instead of document.querySelectorAll
    const highlightElements = findElementsInShadowRoots('.simatic-ax .highlight');

    highlightElements.forEach((highlightDiv) => {
        // Check if ft-copy-block already exists inside this highlight div
        const existingFtCopyBlock = highlightDiv.querySelector('ft-copy-block');
        // Only proceed if ft-copy-block doesn't exist
        if (!existingFtCopyBlock) {
            // Get the content inside the highlight div
            const content = highlightDiv.innerHTML;
            // Create the new ft-copy-block element
            const ftCopyBlock = document.createElement('ft-copy-block');
            // Set the content inside ft-copy-block
            ftCopyBlock.innerHTML = content;
            // Clear the highlight div
            highlightDiv.innerHTML = '';
            // Append ft-copy-block as the only child
            highlightDiv.appendChild(ftCopyBlock);
        }
    });
}
async function removeFtCopyBlockForMermaidAndPlantUML(event) {
    const blocks = findElementsInShadowRoots('ft-copy-block');
    blocks.forEach(block => {
        const first = block.firstElementChild;
        // Check if the copy block wraps a <pre class="mermaid ..."> or a <pre class="plantuml ...">
        if (first && first.matches('pre.mermaid, pre[class*="mermaid"], pre.plantuml, pre[class*="plantuml"]')) {
            const parent = block.parentNode;
            if (!parent) return;
            // Move the <pre> out before removing wrapper
            parent.insertBefore(first, block);
            // Now remove the wrapper
            block.remove();
        }
    });
}
///////////////////////////////////////////////////////////////////////////////
/**************************************************************************/
/**************** URL management with Custom Javascript *******************/
/************* Format: https://doc.fluidtopics.com/keyword ****************/
/**************************************************************************/
function runRedirections(useRouterService = false) {
    let docsLink = {
        //*******Quick Setup Tutorials******
        "r/deeplink/unresolved?ft%25253AclusterId=%252Fsetup_with_installer%252F_entering-your-ie-hub-credentials": "r/en-us/v1.0.3/getting-started-with-production-optimization-tutorial/setting-up-your-system-with-the-industrial-edge-quick-setup-tool/executing-the-industrial-edge-quick-setup-tool/entering-your-ie-hub-credentials",
        "r/deeplink/unresolved?ft%25253AclusterId=%252Fsetup_with_installer%252F_validating-the-outcome": "r/en-us/v1.0.3/getting-started-with-production-optimization-tutorial/setting-up-your-system-with-the-industrial-edge-quick-setup-tool/validating-the-outcome",
        "ie-quick-setup-v1.1.0/ie-hub-credentials": "access?ft:clusterId=/02-setting-up/02-setting-up/_entering-your-ie-hub-credentials",
        "ie-quick-setup-v1.1.0/validate": "access?ft:clusterId=/02-setting-up/02-setting-up/_validating-the-outcome",
        // IIH redirects for 2.2.0 and 2.1.0
        "r/en-us/v2.2.0/industrial-information-hub": "r/en-us/v2.2/industrial-information-hub",
        "r/en-us/v2.1.0/industrial-information-hub": "r/en-us/v2.1/industrial-information-hub",
        // IIH Essentials redirects for 2.2.0 and 2.1.0
        "r/en-us/v2.2.0/industrial-information-hub-essentials": "r/en-us/v2.2/industrial-information-hub-essentials",
        "r/en-us/v2.1.0/industrial-information-hub-essentials": "r/en-us/v2.1/industrial-information-hub-essentials"
    };
    let FTAPI = new fluidtopics.FluidTopicsApi();
    FTAPI["Ft-Calling-App"] = "Your-Calling-App";
    let splitedPathname = window.location.href.split(FTAPI.tenantBaseUrl);
    if (splitedPathname.length != 2 || !(splitedPathname[1] in docsLink)) {
        return;
    }
    if (useRouterService) {
        FluidTopicsRouterService.navigateTo(`/${docsLink[splitedPathname[1]]}`);
    } else {
        window.location.href = `${FTAPI.tenantBaseUrl}${docsLink[splitedPathname[1]]}`;
    }
}
// Run redirection when comming from outside of FluidTopics
runRedirections();
// Run redirection when comming from inside of FluidTopics
window.addEventListener('load', observeUrlChange);
function observeUrlChange() {
    let oldHref = document.location.href;
    const body = document.querySelector('body');
    const observer = new MutationObserver((mutations) => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            runRedirections(true);
        }
    });
    observer.observe(body, { childList: true, subtree: true });
}
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// IOX / Industrial Edge
// Wird ausgeführt, wenn die Seite aufgebaut wird
document.addEventListener('ft:analytics:userevents', async function(event) {
    if (isHomeOrCustomPageEvent(event)) {
        await storeLastVisitedNonReaderPage(event);
    }
});
// Wird ausgeführt, wenn die Seite fertig geladen und aufgebaut ist
document.addEventListener(OnPageRenderedEvent, async (e) => {
    switch(e.detail.type) {
        case RenderedPageType.HomeOrCustom:
            await onHomeOrCustomPageRendered(e.detail.event, e.detail.mutations);
            break;
        case RenderedPageType.Reader:
            await onReaderPageRendered(e.detail.event, e.detail.mutations);
            break;
        case RenderedPageType.Search:
            await onSearchPageRendered(e.detail.event, e.detail.mutations);
            break;
    }
});
// ----------------------------------------------------------------------------
// Wird einmalig nach dem dem vollständigen Seitenaufbau (Home- oder Sub-Page) aufgerufen
async function onHomeOrCustomPageRendered(event, mutations) {
    await replaceLocalizedLinks();
    await addStagingBanner(event);
    injectChatBot();
    startLinkLocalizationCheck();
}
///////////////////////////////////////////////////////////////////////////////
// Set the background image for the reader content
async function setReaderContentBackground(event) {
    console.log('AAAA');
    let containers = findElementsInShadowRoots('#readerContentContainer');
    console.log('BBBB');
    const FTAPI = new fluidtopics.FluidTopicsApi();
    console.log('CCCC');
    const map = await FTAPI.getCurrentSession();
    console.log('##############MAP', containers, map);
    //  containers.forEach(container => {
    //    console.log('##############MAP', map);
    //  });
}
// ----------------------------------------------------------------------------
// Wird einmalig nach dem dem vollständigen Seitenaufbau (Reader-Page) aufgerufen
async function onReaderPageRendered(event, mutations) {
    await updateBreadcrumbs(event);
    await addReaderContentContainerResizeHandle();
    await setupThemeToggleButton();
    await addStagingBanner(event);
    await addFtCopyBlockToHighlightsEls(event);
    await renderMermaid(event);
    await renderPlantUMLDiagrams(event);
    await removeFtCopyBlockForMermaidAndPlantUML(event);
    //await setReaderContentBackground(event);
}
// ----------------------------------------------------------------------------
// Wird einmalig nach dem dem vollständigen Seitenaufbau (Search-Page) aufgerufen
async function onSearchPageRendered(event, mutations) {
    await updateSearchPageBackButton(event);
    await addStagingBanner(event);
}