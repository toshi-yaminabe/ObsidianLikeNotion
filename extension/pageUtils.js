function extractPageId(urlString) {
  const match = urlString.replace(/-/g, '').match(/[0-9a-f]{32}/i);
  return match ? match[0] : '';
}

if (typeof module !== 'undefined') {
  module.exports = { extractPageId };
} else {
  window.extractPageId = extractPageId;
}
