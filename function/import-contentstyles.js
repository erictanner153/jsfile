// Topic content scripts -> Custom script
export default function loadTopicCss({ container }) {
    const cssUrl = "https://erictanner153.github.io/jsfile/compiled-styles/topic.css";
    const id = "external-topic-css-erictanner153";

    const doc = container?.ownerDocument || document;

    // avoid adding it multiple times (navigation between topics)
    if (doc.getElementById(id)) return;

    const link = doc.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = cssUrl;

    doc.head.appendChild(link);
}
