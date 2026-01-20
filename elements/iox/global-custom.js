/* ============================================================================
   DO NOT EDIT HERE
   Edit in repo and merge.bat generates portal files.
   ========================================================================== */

// ------------------------------------------------------------
// Optional fallback if loader does NOT provide loadExternalScript
// ------------------------------------------------------------
if (typeof loadExternalScript !== "function") {
    async function loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = reject;
            (document.head || document.documentElement).appendChild(s);
        });
    }
}

// ------------------------------------------------------------
// tools
// ------------------------------------------------------------
function findParentNodeByTagName(node, tagName) {
    while ((node = node.parentElement)) {
        if (node.tagName == tagName) break;
    }
    return node;
}

function unescapeHTMLEntities(encodedText) {
    const ta = document.createElement("textarea");
    ta.innerHTML = encodedText;
    const decoded = ta.value;
    ta.remove();
    return decoded;
}

// Find element by querySelector in the document + open shadow roots
function findElementsInShadowRoots(querySelector) {
    const foundElements = [];
    function searchInNode(node) {
        if (!node) return;

        // search current node/root (document or shadowRoot)
        try {
            if (node.querySelectorAll) {
                const elements = node.querySelectorAll(querySelector);
                foundElements.push(...elements);
            }
        } catch (_) {}

        // recurse into shadow root
        if (node.shadowRoot) searchInNode(node.shadowRoot);

        // recurse into children
        if (node.childNodes && node.childNodes.length) {
            node.childNodes.forEach((child) => searchInNode(child));
        }
    }
    searchInNode(document);
    return foundElements;
}

// ------------------------------------------------------------
// wait helpers
// ------------------------------------------------------------
function waitForQuerySelector(selector, root, timeoutMs = 15000) {
    return waitFor(() => (root || document).querySelector(selector), timeoutMs);
}

function waitForQuerySelectorAll(selector, root, timeoutMs = 15000) {
    return waitFor(() => (root || document).querySelectorAll(selector), timeoutMs);
}

async function waitFor(checkFunc, timeoutMs = 5000, sleepIntervalMs = 50) {
    const startTime = Date.now();
    while (true) {
        if (Date.now() - startTime >= timeoutMs) return undefined;

        let result;
        try {
            result = checkFunc();
        } catch (_) {}

        let hasArrayElements = true;
        if (Array.isArray(result)) hasArrayElements = result.length > 0;

        if (result !== undefined && result !== null && hasArrayElements) return result;

        await sleep(sleepIntervalMs);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------------------------------------------------
// reader header bar tools
// ------------------------------------------------------------
async function getHeaderBarElement() {
    let el = findElementsInShadowRoots("#designed-header-custom-controls")?.[0];
    if (!el) el = await waitForQuerySelector(".header-actions.header-page-actions");
    return el;
}

async function addElementToHeaderBar(element) {
    const headerBar = await getHeaderBarElement();
    if (!headerBar) {
        console.log("no header actions element!");
        return;
    }
    if (element.id && findElementsInShadowRoots("#" + element.id)?.[0]) return; // already exists
    headerBar.appendChild(element);
}

// ------------------------------------------------------------
// last visited page
// ------------------------------------------------------------
let g_lastVisitedNonReaderPage = undefined;

function storeLastVisitedNonReaderPage(event) {
    const url = event.detail[0].parameters.page.url;
    const title = event.detail[0].parameters.page.name;

    if (url === "/" || url === "/home" || url?.startsWith("/p")) {
        g_lastVisitedNonReaderPage = { url, title };
        localStorage.setItem("lastVisitedNonReaderPage", JSON.stringify(g_lastVisitedNonReaderPage));
    }
}

function updateBreadcrumbs(event) {
    if (document.querySelector(".ft-largepopup")) return;

    const breadcrumbs = [];
    if (g_lastVisitedNonReaderPage) breadcrumbs.push(g_lastVisitedNonReaderPage);

    const docTitle = event.detail[0].parameters?.document?.title;
    if (docTitle) breadcrumbs.push({ url: undefined, title: docTitle });

    setBreadcumbs(breadcrumbs);
}

function setBreadcumbs(breadcrumbs) {
    const subHeader = document.querySelector("div.coverbar-header span.coverbar-title");
    if (!subHeader) return;

    const breadcrumbSeparator = document.createElement("span");
    breadcrumbSeparator.classList.add("breadcrumb-separator");
    breadcrumbSeparator.textContent = " > ";

    const breadcrumbsContainer = document.createElement("span");
    breadcrumbsContainer.classList.add("coverbar-title");

    for (const breadcrumb of breadcrumbs) {
        const breadcrumbElement = document.createElement("span");
        breadcrumbElement.classList.add("breadcrumb-item");
        if (breadcrumb?.url) breadcrumbElement.addEventListener("click", () => FluidTopicsRouterService.navigateTo(breadcrumb.url));
        breadcrumbElement.textContent = breadcrumb.title;

        if (breadcrumbsContainer.children.length == 0) {
            breadcrumbElement.classList.add("non-reader-page");
        } else {
            breadcrumbsContainer.appendChild(breadcrumbSeparator.cloneNode(true));
        }
        breadcrumbsContainer.appendChild(breadcrumbElement);
    }

    subHeader.replaceWith(breadcrumbsContainer);
}

async function updateSearchPageBackButton(event) {
    const existingButton = document.querySelector(".searchresults-back-button");
    if (!g_lastVisitedNonReaderPage) {
        existingButton?.remove();
        return;
    } else if (existingButton) {
        return;
    }

    const headerLogo = await waitForQuerySelector("a.backtohomelogo-container img.backtohomelogo-image");
    headerLogo?.classList.add("backtohomelogo-only-on-small-viewports");

    const targetElement = document.querySelector("section.header-left-side");
    if (!targetElement) return;

    targetElement.appendChild(await createSearchPageBackButton(g_lastVisitedNonReaderPage));
}

async function createSearchPageBackButton(lastVisitedNonReaderPage) {
    const backToSearchResultsContainer = document.createElement("div");
    backToSearchResultsContainer.className = "backtosearchresults-container searchresults-back-button";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "ft-btn ft-btn-no-bg ft-btn-no-border";

    const icon = document.createElement("i");
    icon.className = "ft-icon ft-icon-no-icon ft-icon-back";
    icon.ariaHidden = true;

    const span = document.createElement("span");
    span.className = "ft-btn-inner-text";
    span.innerHTML = "Back";

    backButton.onclick = function () {
        window.location.href = lastVisitedNonReaderPage.url;
    };

    backButton.appendChild(icon);
    backButton.appendChild(span);
    backToSearchResultsContainer.appendChild(backButton);

    return backToSearchResultsContainer;
}

// ------------------------------------------------------------
// localization tools (ORIGINAL behavior + robust back/forward)
// - retry scheduler (same as your original)
// - plus watcher that re-runs if _URL links appear after back/forward
// ------------------------------------------------------------
const I18N_MAX_RETRIES = 10;
const I18N_RETRY_DELAY_MS = 300;
let i18nRetryCount = 0;
let i18nRetryTimeoutId = null;

function scheduleLocalizedLinksRetry() {
    if (i18nRetryCount >= I18N_MAX_RETRIES) return;
    if (i18nRetryTimeoutId) clearTimeout(i18nRetryTimeoutId);
    i18nRetryTimeoutId = setTimeout(() => {
        i18nRetryCount++;
        replaceLocalizedLinks();
    }, I18N_RETRY_DELAY_MS);
}

async function replaceLocalizedLinks() {
    const svc = window.FluidTopicsCustomI18nService;

    // If service not ready yet -> behave like original "keep trying"
    if (!svc?.prepareContext || !svc?.resolveMessage) {
        scheduleLocalizedLinksRetry();
        return;
    }

    const localizedLinks = findElementsInShadowRoots('a[href$="_URL"]');

    // NEW (same idea as your original file): if none yet -> retry
    if (localizedLinks.length === 0) {
        scheduleLocalizedLinksRetry();
        return;
    }

    let unresolved = 0;

    // prepare each context once (faster + more reliable)
    const work = [];
    const contexts = new Set();

    for (const link of localizedLinks) {
        const href = link.getAttribute("href");
        const parts = href?.split(".");
        if (!parts || parts.length !== 2) continue;

        const [context, key] = parts;
        contexts.add(context);
        work.push({ link, context, key, href });
    }

    await Promise.all(
        Array.from(contexts).map((ctx) => svc.prepareContext(ctx, {}).catch(() => null))
    );

    for (const item of work) {
        try {
            const url = svc.resolveMessage(item.context, item.key);
            if (url) {
                item.link.href = url;
            } else {
                unresolved++;
            }
        } catch (_) {
            unresolved++;
        }
    }

    // keep trying until all resolved (same behavior as original)
    if (unresolved > 0) {
        scheduleLocalizedLinksRetry();
    } else {
        i18nRetryCount = 0;
        if (i18nRetryTimeoutId) clearTimeout(i18nRetryTimeoutId);
    }
}

// ---- watcher that fixes: click converted link -> browser back -> _URL not replaced ----
let __FT_I18N_WATCH_INTERVAL__ = null;
let __FT_I18N_WATCH_OBS__ = null;
let __FT_I18N_SCHEDULED__ = false;

function __ftScheduleReplace() {
    if (__FT_I18N_SCHEDULED__) return;
    __FT_I18N_SCHEDULED__ = true;

    Promise.resolve().then(async () => {
        __FT_I18N_SCHEDULED__ = false;

        const hasLinks = findElementsInShadowRoots('a[href$="_URL"]').length > 0;
        if (!hasLinks) return;

        await replaceLocalizedLinks();
        // run again after paint (FT often swaps DOM async)
        requestAnimationFrame(() => replaceLocalizedLinks());
    });
}

function startLinkLocalizationCheck() {
    // interval scan (shadow DOM safe)
    if (!__FT_I18N_WATCH_INTERVAL__) {
        __FT_I18N_WATCH_INTERVAL__ = setInterval(() => {
            const hasLinks = findElementsInShadowRoots('a[href$="_URL"]').length > 0;
            if (hasLinks) __ftScheduleReplace();
        }, 500);
    }

    // mutation observer "signal" (fast when light DOM changes)
    if (!__FT_I18N_WATCH_OBS__) {
        __FT_I18N_WATCH_OBS__ = new MutationObserver(() => __ftScheduleReplace());
        const root = document.body || document.documentElement;
        if (root) __FT_I18N_WATCH_OBS__.observe(root, { childList: true, subtree: true });
    }

    // kick immediately
    __ftScheduleReplace();
}

// BFCache restore (browser back/forward in same tab)
window.addEventListener("pageshow", () => {
    startLinkLocalizationCheck();
});

// Optional: SPA back sometimes triggers popstate
window.addEventListener("popstate", () => {
    startLinkLocalizationCheck();
});

let g_lastVisitedNonReaderPageTitle = undefined;
async function localizePageTitleReaderBreadcrumb() {
    g_lastVisitedNonReaderPageTitle = undefined;
    const localizedLinks = await waitFor(() => findElementsInShadowRoots('ft-localized-label[key="pageTitle"]'), 60000);
    const link = localizedLinks?.[0];
    if (link) {
        const context = link.getAttribute("context");
        const contextAndKey = `${context}.pageTitle`;

        const pageTitle = await waitFor(() => {
            const v = FluidTopicsCustomI18nService.resolveMessage(context, "pageTitle");
            if (v && v !== contextAndKey && v !== g_lastVisitedNonReaderPageTitle) return v;
            return undefined;
        }, 60000);

        if (pageTitle) g_lastVisitedNonReaderPageTitle = pageTitle;
    }
}

// ------------------------------------------------------------
// Change BackButton to Browser back
// ------------------------------------------------------------
function changeReaderPageBackToBrowserBack() {
    function changeBackButton() {
        backButton.onclick = () => history.go(-1);
    }

    const appContent = document.querySelector(".coverbar-back-container");
    if (appContent == null) return;

    const backButtonSelector = "button";
    let backButton = appContent.querySelector(backButtonSelector);

    if (backButton != null) {
        changeBackButton();
        return;
    }

    function backButtonLoaded() {
        backButton = document.querySelector(backButtonSelector);
        if (backButton == null) return;
        changeBackButton();
        observer.disconnect();
    }

    const observer = new MutationObserver(backButtonLoaded);
    observer.observe(appContent, { childList: true, subtree: true });
}

// ------------------------------------------------------------
// Add resize handle to right side of reader page
// ------------------------------------------------------------
async function addReaderContentContainerResizeHandle() {
    const readerContentContainers = findElementsInShadowRoots("#readerContentResizeContainer");
    readerContentContainers.forEach((readerContentContainer) => {
        const readerContentContainerResizer = readerContentContainer?.querySelector("#readerContentResizeContainertResizer");
        if (!readerContentContainer || !readerContentContainerResizer) return;

        readerContentContainerResizer.addEventListener("mouseenter", () => {
            readerContentContainerResizer.style.backgroundColor = "black";
        });
        readerContentContainerResizer.addEventListener("mouseleave", () => {
            readerContentContainerResizer.style.backgroundColor = "transparent";
        });

        const minWidth = readerContentContainer?.style?.minWidth || 100;
        const maxWidth = readerContentContainer?.style?.maxWidth || 4096;

        readerContentContainerResizer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = readerContentContainer.offsetWidth;

            function onMouseMove(ev) {
                const newWidth = startWidth + (ev.clientX - startX);
                if (newWidth >= minWidth && newWidth <= maxWidth) {
                    readerContentContainer.style.width = newWidth + "px";
                }
            }
            function onMouseUp() {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
            }

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        });
    });
}

// ------------------------------------------------------------
// theme toggle button
// ------------------------------------------------------------
let isThemeInitialized = false;

async function setupThemeToggleButton() {
    const docElement = document.documentElement;

    const themes = FluidTopicsThemeService.listThemes();
    const lightThemeId = themes?.find((t) => t.name === "theme-light")?.id;
    const darkThemeId = themes?.find((t) => t.name === "theme-dark")?.id;

    if (!lightThemeId || !darkThemeId) {
        console.error("Themes not found! Theme toggle button will be removed.", lightThemeId, darkThemeId);
    }

    const forceLightMode = document.querySelector(".readercontent-papyrus-sheet") !== null;

    const setTheme = (darkMode) => {
        const themeIdToSet = darkMode && !forceLightMode ? darkThemeId : lightThemeId;
        FluidTopicsThemeService.setTheme(themeIdToSet);
    };

    const setIcon = (icon, darkMode) => {
        const effectiveDarkMode = darkMode && !forceLightMode;
        if (!!icon) icon.value = effectiveDarkMode ? "dark_mode" : "light_mode";

        if (!effectiveDarkMode) {
            docElement.classList.remove("theme-dark");
            docElement.classList.add("theme-light");
        } else {
            docElement.classList.remove("theme-light");
            docElement.classList.add("theme-dark");
        }
    };

    const activeTheme = FluidTopicsThemeService.getActiveTheme();

    if (forceLightMode && !isThemeInitialized && activeTheme.id !== lightThemeId) {
        setTheme(false);
        isThemeInitialized = true;
        return;
    }
    if (forceLightMode && !isThemeInitialized) isThemeInitialized = true;

    const containers = findElementsInShadowRoots("#themeToggleContainer");
    for (const container of containers) {
        if (!lightThemeId || !darkThemeId) {
            container.remove();
            continue;
        }

        if (forceLightMode) {
            container.style.opacity = "0.5";
            container.style.pointerEvents = "none";
            container.title = "Theme switching is disabled on this page";
        }

        const icon = container?.querySelector("ft-icon");
        if (!container || !icon) continue;

        const hasClickHandler = container.getAttribute("has-click-handler") === "true";
        if (!hasClickHandler) {
            container.addEventListener("click", function () {
                if (forceLightMode) return;
                const isDarkMode = activeTheme.id == lightThemeId;
                setTheme(isDarkMode);
                setIcon(icon, isDarkMode);
            });

            container.setAttribute("has-click-handler", "true");
            setIcon(icon, activeTheme.id == lightThemeId);
        }
    }
}

// ------------------------------------------------------------
// staging banner
// ------------------------------------------------------------
async function addStagingBanner() {
    if (document.getElementById("stagingBanner")) return;

    const ftApi = new window.fluidtopics.FluidTopicsApi();
    if (ftApi?.tenantBaseUrl?.indexOf("-staging.fluidtopics.net") > 0) {
        const bannerElement = document.createElement("span");
        bannerElement.id = "stagingBanner";
        bannerElement.style.fontSize = "24px";
        bannerElement.style.color = "black";
        bannerElement.style.height = "fit-content";
        bannerElement.style.alignSelf = "center";
        bannerElement.style.margin = "0px 16px 0px 16px";
        bannerElement.style.padding = "4px 8px 4px 8px";
        bannerElement.style.border = "2px solid red";
        bannerElement.style.borderRadius = "8px";
        bannerElement.style.backgroundColor = "#FFA0A0";
        bannerElement.innerHTML = "Staging";
        await addElementToHeaderBar(bannerElement);
    }
}

// ------------------------------------------------------------
// dynamic table helpers
// ------------------------------------------------------------
function onDynamicTableChangeFunction(e, tablesGUID) {
    const selectElement = e.target;
    showOnlyThisTable(tablesGUID, selectElement.options[selectElement.options.selectedIndex].value);
}

function setDynamicTableChangeEvents() {
    const selectElements = document.querySelectorAll(".dynamictable select");
    for (const selectElement of selectElements) {
        const tablesGUID = selectElement.id?.split("_")?.[1];
        selectElement.addEventListener("change", (e) => onDynamicTableChangeFunction(e, tablesGUID));
    }
}

function showOnlyThisTable(blockId, selectionId) {
    const elements = document.querySelectorAll("[id^='" + blockId + "']");
    if (selectionId == "all") {
        for (const element of elements) {
            element.classList.remove("dynamicblock");
            element.classList.add("dynamicexpandedblock");
        }
    } else {
        for (const element of elements) {
            if (element.id == selectionId) {
                element.classList.remove("dynamicblock");
                element.classList.add("dynamicexpandedblock");
            } else {
                element.classList.add("dynamicblock");
                element.classList.remove("dynamicexpandedblock");
            }
        }
    }
}

// ------------------------------------------------------------
// button to copy first column to clipboard
// ------------------------------------------------------------
function setTableFirstRowCopyButtonHandlers() {
    const imgElements = findTableFirstRowCopyButtons();
    for (const aElement of imgElements) {
        aElement.addEventListener("click", () => copyFirstColumnToClipboardFunction(aElement));
        aElement.setAttribute("href", "javascript:;");
    }
}

function findTableFirstRowCopyButtons() {
    const results = [];
    const imageButtonsInTableHeaders = findElementsInShadowRoots('thead a.ft-internal-link:has(img)');
    for (const aElement of imageButtonsInTableHeaders) {
        const imgEl = aElement.querySelector("img");
        if (imgEl?.src?.endsWith("/portal-asset/iconCopy")) results.push(aElement);
    }
    return results;
}

function copyFirstColumnToClipboardFunction(aElement) {
    const tableNode = findParentNodeByTagName(aElement, "TABLE");
    const firstRowCodeContents = tableNode?.querySelectorAll('tbody tr td:first-child p.p_table_l_code');
    let clipboardContent = "";
    for (const firstRowCodeContent of firstRowCodeContents || []) {
        const decoded = unescapeHTMLEntities(firstRowCodeContent.innerHTML);
        clipboardContent += decoded + "\n";
    }
    if (clipboardContent.length > 0) navigator.clipboard.writeText(clipboardContent);
}

// ------------------------------------------------------------
// page render complete event (same as original)
// ------------------------------------------------------------
const OnPageRenderedEvent = "pageRendered";
const RenderedPageType = { HomeOrCustom: "homeOrCustom", Reader: "reader", Search: "search" };

function isHomeOrCustomPageEvent(event) {
    return event.detail?.[0]?.name == "page.display";
}

function isReaderPageEvent(event) {
    return event?.detail?.[0]?.name === "topic.start_display";
}

function isSearchPageEvent(event) {
    return event?.detail?.[0]?.parameters?.searchQuery !== undefined;
}

function dispatchPageRenderedEvent(event) {
    if (isHomeOrCustomPageEvent(event)) {
        addPageRenderCompletedEventListener(function (mutations) {
            const homeOrCustomPageRenderedEvent = new CustomEvent(OnPageRenderedEvent, {
                detail: { type: RenderedPageType.HomeOrCustom, event: event, mutations: mutations },
            });
            document.dispatchEvent(homeOrCustomPageRenderedEvent);
            return true;
        });
    } else if (isReaderPageEvent(event)) {
        const readerPageRenderedEvent = new CustomEvent(OnPageRenderedEvent, {
            detail: { type: RenderedPageType.Reader, event: event, mutations: undefined },
        });
        document.dispatchEvent(readerPageRenderedEvent);
    } else if (isSearchPageEvent(event)) {
        const searchPageRenderedEvent = new CustomEvent(OnPageRenderedEvent, {
            detail: { type: RenderedPageType.Search, event: event, mutations: undefined },
        });
        document.dispatchEvent(searchPageRenderedEvent);
    }
}

document.addEventListener("ft:analytics:userevents", function (event) {
    dispatchPageRenderedEvent(event);
});

function addPageRenderCompletedEventListener(eventFunc) {
    const observer = new MutationObserver(function (mutations) {
        if (document.getElementById("custom-page-designed-content") || document.getElementById("homepage-designed-content")) {
            if (!eventFunc(mutations)) observer.disconnect();
        }
    });
    observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
}

// ------------------------------------------------------------
// chat-bot
// ------------------------------------------------------------
async function injectChatBot() {
    if (document.getElementById("siemens-akg-widget")) return;

    const bot = document.createElement("div");
    bot.id = "siemens-akg-widget";
    bot.setAttribute("data-app-name", "Online Docs");
    bot.setAttribute("data-app-filter", "OnlineDocs");
    document.querySelector(".component-content")?.append(bot);

    try {
        await loadExternalScript("https://saprodchatwidgetfeapps.z28.web.core.windows.net");
        const event = document.createEvent("HTMLEvents");
        event.initEvent("DOMContentLoaded", true, true);
        event.eventName = "DOMContentLoaded";
        document.dispatchEvent(event);
    } catch (e) {
        console.warn("[FT][chatbot] load failed", e);
    }
}

// ------------------------------------------------------------
// Mermaid + PlantUML (same logic as original)
// ------------------------------------------------------------
var mermaid_config = {
    startOnLoad: false,
    securityLevel: "loose",
    logLevel: "trace",
    theme: "base",
    themeVariables: {
        fontFamily: "Siemens Sans",
        primaryColor: "#000028",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#00CCCC",
        lineColor: "#00CCCC",
        secondaryColor: "#23233C",
        tertiaryColor: "#00002880",
        tertiaryBorderColor: "#e0e0e0",
        tertiaryTextColor: "#ffffff",
    },
    flowchart: { htmlLabels: true },
    er: { useMaxWidth: false },
    sequence: { useMaxWidth: false },
};

function normalizeMermaid(text) {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^---[\s\S]*?---\s*/g, "");
    cleaned = cleaned.replace(/^\s*\n+/g, "");
    cleaned = cleaned.replace(/^flowchart\s*$(?![\s\S]*?(TB|TD|LR|RL|BT))/m, "flowchart TB");
    cleaned = cleaned.replace(/^flowchart\s*[\r\n]+(?=subgraph|[a-zA-Z])/m, "flowchart TB\n");
    cleaned = cleaned.replace(/-->\s*$/gm, "");
    cleaned = cleaned.replace(/-->/g, " --> ").replace(/<-->/g, " <--> ").replace(/<--/g, " <-- ");
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    return cleaned.trim();
}

var mermaidScript = document.createElement("script");
mermaidScript.type = "text/javascript";
mermaidScript.src = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js";
mermaidScript.onload = function () {
    mermaid.initialize(mermaid_config);
    renderMermaid();
};
(document.head || document.documentElement).appendChild(mermaidScript);

function extractMermaidSource(block) {
    if (block.tagName === "CODE") return block.textContent;
    const code = block.querySelector("code");
    if (code) return code.textContent;
    const pre = block.querySelector("pre");
    if (pre && !code) return pre.textContent;
    return [...block.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join("\n");
}

function getAllMermaidBlocks() {
    const blocks1 = findElementsInShadowRoots(".mermaid:not(.rendered)");
    const blocks2 = findElementsInShadowRoots("code.language-mermaid:not(.rendered)").map((code) => code.parentElement);
    const blocks3 = findElementsInShadowRoots("pre.language-mermaid:not(.rendered)");
    return Array.from(new Set([...blocks1, ...blocks2, ...blocks3]));
}

async function renderMermaid() {
    const blocks = getAllMermaidBlocks();
    for (const [index, block] of blocks.entries()) {
        const uid = "aGraph" + Date.now() + index;
        try {
            const raw = extractMermaidSource(block);
            if (!raw || raw.trim() === "") {
                block.classList.add("rendered");
                continue;
            }
            const graphDefinition = normalizeMermaid(raw);
            const { svg, bindFunctions } = await mermaid.render(uid, graphDefinition);
            block.innerHTML = svg;
            if (bindFunctions) bindFunctions(block);
            block.classList.add("rendered");
        } catch (error) {
            console.error(`Mermaid render error (${uid}):`, error);
            block.classList.add("rendered");
        }
    }
}

var plantumlScript = document.createElement("script");
plantumlScript.type = "text/javascript";
plantumlScript.src = "https://cdn.jsdelivr.net/npm/plantuml-encoder/dist/plantuml-encoder.min.js";
(document.head || document.documentElement).appendChild(plantumlScript);

async function renderPlantUMLDiagrams() {
    const plantumlDiagram = findElementsInShadowRoots(".plantuml:not(.rendered)");
    for (const block of plantumlDiagram) {
        const plantumlCode = block.textContent;
        const encoded = plantumlEncoder.encode(plantumlCode);
        const imgUrl = "https://code.siemens.com/api/kroki/plantuml/svg/" + encoded;

        fetch(imgUrl)
            .then((response) => response.text())
            .then((svgContent) => {
                block.innerHTML = svgContent;
                block.classList.add("rendered");
            })
            .catch((error) => console.error("Error fetching SVG:", error));
    }
}

// ------------------------------------------------------------
// SIMATIC AX copy-block wrapper
// ------------------------------------------------------------
async function addFtCopyBlockToHighlightsEls() {
    const highlightElements = findElementsInShadowRoots(".simatic-ax .highlight");
    highlightElements.forEach((highlightDiv) => {
        const existing = highlightDiv.querySelector("ft-copy-block");
        if (existing) return;

        const content = highlightDiv.innerHTML;
        const ftCopyBlock = document.createElement("ft-copy-block");
        ftCopyBlock.innerHTML = content;

        highlightDiv.innerHTML = "";
        highlightDiv.appendChild(ftCopyBlock);
    });
}

async function removeFtCopyBlockForMermaidAndPlantUML() {
    const blocks = findElementsInShadowRoots("ft-copy-block");
    blocks.forEach((block) => {
        const first = block.firstElementChild;
        if (first && first.matches('pre.mermaid, pre[class*="mermaid"], pre.plantuml, pre[class*="plantuml"]')) {
            const parent = block.parentNode;
            if (!parent) return;
            parent.insertBefore(first, block);
            block.remove();
        }
    });
}

// ------------------------------------------------------------
// URL redirections (same as original)
// ------------------------------------------------------------
function runRedirections(useRouterService = false) {
    const docsLink = {
        "r/deeplink/unresolved?ft%25253AclusterId=%252Fsetup_with_installer%252F_entering-your-ie-hub-credentials":
            "r/en-us/v1.0.3/getting-started-with-production-optimization-tutorial/setting-up-your-system-with-the-industrial-edge-quick-setup-tool/executing-the-industrial-edge-quick-setup-tool/entering-your-ie-hub-credentials",
        "r/deeplink/unresolved?ft%25253AclusterId=%252Fsetup_with_installer%252F_validating-the-outcome":
            "r/en-us/v1.0.3/getting-started-with-production-optimization-tutorial/setting-up-your-system-with-the-industrial-edge-quick-setup-tool/validating-the-outcome",
        "ie-quick-setup-v1.1.0/ie-hub-credentials":
            "access?ft:clusterId=/02-setting-up/02-setting-up/_entering-your-ie-hub-credentials",
        "ie-quick-setup-v1.1.0/validate":
            "access?ft:clusterId=/02-setting-up/02-setting-up/_validating-the-outcome",
        "r/en-us/v2.2.0/industrial-information-hub": "r/en-us/v2.2/industrial-information-hub",
        "r/en-us/v2.1.0/industrial-information-hub": "r/en-us/v2.1/industrial-information-hub",
        "r/en-us/v2.2.0/industrial-information-hub-essentials": "r/en-us/v2.2/industrial-information-hub-essentials",
        "r/en-us/v2.1.0/industrial-information-hub-essentials": "r/en-us/v2.1/industrial-information-hub-essentials",
    };

    const FTAPI = new fluidtopics.FluidTopicsApi();
    FTAPI["Ft-Calling-App"] = "Your-Calling-App";

    const splitedPathname = window.location.href.split(FTAPI.tenantBaseUrl);
    if (splitedPathname.length != 2 || !(splitedPathname[1] in docsLink)) return;

    if (useRouterService) {
        FluidTopicsRouterService.navigateTo(`/${docsLink[splitedPathname[1]]}`);
    } else {
        window.location.href = `${FTAPI.tenantBaseUrl}${docsLink[splitedPathname[1]]}`;
    }
}

runRedirections();

window.addEventListener("load", observeUrlChange);
function observeUrlChange() {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver(() => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            runRedirections(true);
        }
    });
    observer.observe(body, { childList: true, subtree: true });
}

// ------------------------------------------------------------
// IOX / Industrial Edge bindings (match original behavior)
// ------------------------------------------------------------

// When page is being built
document.addEventListener("ft:analytics:userevents", async function (event) {
    if (isHomeOrCustomPageEvent(event)) {
        storeLastVisitedNonReaderPage(event);
    }
});

// When page is fully rendered (our synthetic event)
document.addEventListener(OnPageRenderedEvent, async (e) => {
    switch (e.detail.type) {
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

// Home/Sub page
async function onHomeOrCustomPageRendered(event, mutations) {
    startLinkLocalizationCheck(); // critical: keep watching across back/forward + late renders
    await replaceLocalizedLinks();

    await addStagingBanner(event);
    injectChatBot();
}

// Reader page
async function onReaderPageRendered(event, mutations) {
    startLinkLocalizationCheck(); // ensure back/forward + reader swaps keep working
    await replaceLocalizedLinks();

    await updateBreadcrumbs(event);
    await addReaderContentContainerResizeHandle();
    await setupThemeToggleButton();
    await addStagingBanner(event);

    await addFtCopyBlockToHighlightsEls(event);
    await renderMermaid(event);
    await renderPlantUMLDiagrams(event);
    await removeFtCopyBlockForMermaidAndPlantUML(event);
}

// Search page
async function onSearchPageRendered(event, mutations) {
    startLinkLocalizationCheck();
    await replaceLocalizedLinks();

    await updateSearchPageBackButton(event);
    await addStagingBanner(event);
}
