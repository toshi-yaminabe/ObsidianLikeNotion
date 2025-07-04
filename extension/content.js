// Trigger page creation and link insertion when Alt+L is pressed
// after selecting text in a Notion block
document.addEventListener('keydown', async e => {
  if (!(e.altKey && e.key.toLowerCase() === 'l')) return;
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (!text) return;
  const anchor = sel.anchorNode && sel.anchorNode.parentElement.closest('[data-block-id]');
  if (!anchor) return;
  const blockId = anchor.dataset.blockId;
  const start = sel.anchorOffset;
  const end = start + text.length;
  const data = await chrome.storage.local.get('database');
  if (!data.database) return;
  chrome.runtime.sendMessage({
    cmd: 'createPage',
    title: text,
    db: data.database,
    blockId,
    start,
    end
  });
});

// Provide selected block IDs when requested by the extension
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.cmd === 'getSelectedBlockIds') {
    const sel = window.getSelection();
    const ids = [];
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      let ancestor = range.commonAncestorContainer;
      if (ancestor.nodeType !== 1) ancestor = ancestor.parentElement;
      const elements = ancestor.querySelectorAll('[data-block-id]');
      elements.forEach(el => {
        if (range.intersectsNode(el)) ids.push(el.dataset.blockId);
      });
    }
    sendResponse({ blockIds: Array.from(new Set(ids)) });
  }
});
