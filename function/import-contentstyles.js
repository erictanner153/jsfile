// Topic content scripts -> Custom script
export default function loadTopicCss({ container }) {
    const cssUrls = [
        "https://erictanner153.github.io/jsfile/compiled-styles/topic.css",
        "https://erictanner153.github.io/jsfile/compiled-styles/title.css" // <-- put your 2nd URL here
    ];

    const doc = container?.ownerDocument || document;

    cssUrls.forEach((href, i) => {
        const id = `external-topic-css-erictanner153-${i}`;

        // avoid adding it multiple times (navigation between topics)
        if (doc.getElementById(id)) return;

        const link = doc.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;

        doc.head.appendChild(link);
    });
}
