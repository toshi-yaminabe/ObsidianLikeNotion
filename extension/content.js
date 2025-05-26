document.addEventListener('mouseup', () => {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (!text) return;
  const anchor = sel.anchorNode && sel.anchorNode.parentElement.closest('[data-block-id]');
  if (!anchor) return;
  const blockId = anchor.dataset.blockId;
  const start = sel.anchorOffset;
  const end = start + text.length;
  chrome.runtime.sendMessage({
    cmd: 'createPage',
    title: text,
    db: '<DATABASE_ID>', // replace with your DB ID
    blockId,
    start,
    end
  });
});
