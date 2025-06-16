document.addEventListener('DOMContentLoaded', async () => {
  const dbInput = document.getElementById('database');
  const status = document.getElementById('status');
  const data = await chrome.storage.local.get('database');
  if (data.database) dbInput.value = data.database;
  document.getElementById('auth').addEventListener('click', async () => {
    try {
      await chrome.identity.getAuthToken({ interactive: true });
      status.textContent = '認証しました';
    } catch (e) {
      status.textContent = '認証に失敗';
    }
    setTimeout(() => { status.textContent = ''; }, 1500);
  });
  document.getElementById('save').addEventListener('click', async () => {
    await chrome.storage.local.set({
      database: dbInput.value.trim()
    });
    status.textContent = '保存しました';
    setTimeout(() => { status.textContent = ''; }, 1500);
  });
});
