function loadGlobalCssFile() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://erictanner153.github.io/jsfile/compiled-styles/topic.css'; // change to your CSS URL
  link.media = 'all';
  document.head.appendChild(link);
}

loadGlobalCssFile();