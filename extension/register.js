document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('token');
  const status = document.getElementById('status');
  const data = await chrome.storage.local.get('token');
  if (data.token) input.value = data.token;
  document.getElementById('save').addEventListener('click', async () => {
    await chrome.storage.local.set({ token: input.value.trim() });
    status.textContent = '登録しました';
    setTimeout(() => { status.textContent = ''; }, 1500);
  });
});
