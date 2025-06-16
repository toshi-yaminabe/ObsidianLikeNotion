document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('pageTitle');
  const msg = document.getElementById('status');


  document.getElementById('createNewPage').addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) return;
    const res = await chrome.runtime.sendMessage({ cmd: 'createNewPage', title });
    if (res && res.url) {
      chrome.tabs.create({ url: res.url });
    } else {
      msg.textContent = 'Failed to create page';
      setTimeout(() => { msg.textContent = ''; }, 1500);
    }
  });

  document.getElementById('toggle').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    const res = await chrome.tabs.sendMessage(tab.id, { cmd: 'getSelectedBlockIds' });
    if (res && Array.isArray(res.blockIds) && res.blockIds.length) {
      chrome.runtime.sendMessage({ cmd: 'toggleSelection', blockIds: res.blockIds, level: 2 });
    }
  });

  document.getElementById('register').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
