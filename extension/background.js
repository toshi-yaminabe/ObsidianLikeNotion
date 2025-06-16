const NOTION_VERSION = '2022-06-28';

// Load token from token.txt on first run
(async () => {
  const data = await chrome.storage.local.get('token');
  if (!data.token) {
    try {
      const url = chrome.runtime.getURL('token.txt');
      const res = await fetch(url);
      if (res.ok) {
        const text = (await res.text()).trim();
        if (text) {
          await chrome.storage.local.set({ token: text });
        }
      }
    } catch (e) {
      // ignore if file not found
    }
  }
})();

async function getToken() {
  const data = await chrome.storage.local.get('token');
  return data.token || '';
}

// Convert all heading blocks on a page to the same toggle heading level
async function convertToToggle(pageId, level = 2) {
  const token = await getToken();
  if (!token) return;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
  };
  // Retrieve child blocks
  const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
    { headers });
  if (!res.ok) {
    console.error('Failed to retrieve blocks', await res.text());
    return;
  }
  const data = await res.json();
  for (const block of data.results) {
    if (block.type.startsWith('heading')) {
      // Archive old heading
      const archiveRes = await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ archived: true })
      });
      if (!archiveRes.ok) {
        console.error('Failed to archive heading', block.id, await archiveRes.text());
        return;
      }
      // Create toggle heading with same text
      const createRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          children: [{
            object: 'block',
            type: `toggle_heading_${level}`,
            [`toggle_heading_${level}`]: {
              rich_text: block[block.type].rich_text
            }
          }]
        })
      });
      if (!createRes.ok) {
        console.error('Failed to create toggle heading', block.id, await createRes.text());
        return;
      }
      const createData = await createRes.json();
      if (block.has_children) {
        const childRes = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`, { headers });
        if (!childRes.ok) {
          console.error('Failed to retrieve child blocks', block.id, await childRes.text());
          return;
        }
        const childData = await childRes.json();
        for (const child of childData.results) {
          const moveRes = await fetch(`https://api.notion.com/v1/blocks/${child.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ parent: { block_id: createData.results[0].id } })
          });
          if (!moveRes.ok) {
            console.error('Failed to move child block', child.id, await moveRes.text());
            return;
          }
          await new Promise(r => setTimeout(r, 400));
        }
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

chrome.runtime.onMessage.addListener(async msg => {
  if (msg.cmd === 'toggle') {
    await convertToToggle(msg.pageId, msg.level);
  } else if (msg.cmd === 'createPage') {
    await createLinkedPage(msg);
  } else if (msg.cmd === 'createNewPage') {
    const url = await createPage(msg.title);
    return { url };
  }
});

// Create a new page in a database and replace selected text with link
async function createLinkedPage({ title, db, blockId, start, end }) {
  const token = await getToken();
  if (!token) return;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
  };
  const pageRes = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: { database_id: db },
      properties: {
        Name: { title: [{ text: { content: title } }] }
      }
    })
  });
  const page = await pageRes.json();
  const blockRes = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, { headers });
  const block = await blockRes.json();
  const plain = block[block.type].rich_text.map(r => r.plain_text).join('');
  const before = plain.slice(0, start);
  const after = plain.slice(end);
  const richText = [
    { text: { content: before } },
    { text: { content: title, link: { url: page.url } } },
    { text: { content: after } }
  ];
  await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ [block.type]: { rich_text: richText } })
  });
}

// Create a new page in the configured database and return its URL
async function createPage(title) {
  const token = await getToken();
  if (!token) return null;
  const data = await chrome.storage.local.get('database');
  if (!data.database) return null;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
  };
  const pageRes = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: { database_id: data.database },
      properties: {
        Name: { title: [{ text: { content: title } }] }
      }
    })
  });
  const page = await pageRes.json();
  return page.url;
}

