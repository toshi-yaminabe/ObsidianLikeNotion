document.addEventListener('DOMContentLoaded', async () => {
  const tokenInput = document.getElementById('token');
  const dbInput = document.getElementById('database');
  const status = document.getElementById('status');
  const data = await chrome.storage.local.get(['token', 'database']);
  if (data.token) tokenInput.value = data.token;
  if (data.database) dbInput.value = data.database;
  document.getElementById('save').addEventListener('click', async () => {
    await chrome.storage.local.set({
      token: tokenInput.value.trim(),
      database: dbInput.value.trim()
    });
    status.textContent = '登録しました';
    setTimeout(() => { status.textContent = ''; }, 1500);
  });
});
