function extractPageId(urlString) {
  const url = new URL(urlString);
  return url.pathname.replace(/\W/g, '');
}

if (typeof module !== 'undefined') {
  module.exports = { extractPageId };
} else {
  window.extractPageId = extractPageId;
}
