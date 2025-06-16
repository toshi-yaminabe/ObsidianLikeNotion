document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('pageTitle');
  const msg = document.getElementById('status');

  document.getElementById('openPage').addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) return;
    const res = await chrome.runtime.sendMessage({ cmd: 'openPage', title });
    if (res && res.url) {
      chrome.tabs.create({ url: res.url });
    } else {
      msg.textContent = 'Page not found';
      setTimeout(() => { msg.textContent = ''; }, 1500);
    }
  });

  document.getElementById('createNewPage').addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) return;
    const res = await chrome.runtime.sendMessage({ cmd: 'createNewPage', title });
    if (res && res.url) {
      chrome.tabs.create({ url: res.url });
    }
  });

  document.getElementById('toggle').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    const pageId = url.pathname.replace(/\W/g, '');
    chrome.runtime.sendMessage({ cmd: 'toggle', pageId, level: 2 });
  });

  document.getElementById('register').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
