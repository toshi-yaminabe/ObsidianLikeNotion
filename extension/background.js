// Updated to latest Notion API version
const NOTION_VERSION = '2025-06-19';

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
      console.error('Failed to load default token:', e);
    }
  }
})();

async function getToken() {
  const data = await chrome.storage.local.get('token');
  return data.token || '';
}

function notifyError(message) {
  chrome.runtime.sendMessage({ error: message });
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429) {
      return res;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  return fetch(url, options);
}

async function safeFetch(url, options, errorMessage) {
  try {
    const res = await fetchWithRetry(url, options);
    if (!res.ok) throw new Error(res.statusText);
    return res;
  } catch (e) {
    console.error(errorMessage, e);
    notifyError(errorMessage);
    throw e;
  }
}

async function buildBlockCopy(id, headers) {
  const res = await safeFetch(
    `https://api.notion.com/v1/blocks/${id}`,
    { headers },
    'Failed to fetch block'
  );
  const block = await res.json();
  const copy = { object: 'block', type: block.type, [block.type]: block[block.type] };
  if (block.has_children) {
    const childRes = await safeFetch(
      `https://api.notion.com/v1/blocks/${id}/children?page_size=100`,
      { headers },
      'Failed to fetch child blocks'
    );
    const childData = await childRes.json();
    copy.children = [];
    for (const child of childData.results) {
      const nested = await buildBlockCopy(child.id, headers);
      copy.children.push(nested);
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return copy;
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
  let data;
  try {
    const res = await safeFetch(
      `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
      { headers },
      'Failed to retrieve child blocks'
    );
    data = await res.json();
  } catch {
    return;
  }
  for (const block of data.results) {
    if (block.type.startsWith('heading')) {
      // Archive old heading
      try {
        await safeFetch(
          `https://api.notion.com/v1/blocks/${block.id}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ archived: true })
          },
          'Failed to archive heading'
        );
      } catch {
        continue;
      }
      // Create toggle heading with same text
      let createData;
      try {
        const createRes = await safeFetch(
          `https://api.notion.com/v1/blocks/${pageId}/children`,
          {
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
          },
          'Failed to create toggle heading'
        );
        createData = await createRes.json();
      } catch {
        continue;
      }
      if (block.has_children) {
        let childData;
        try {
          const childRes = await safeFetch(
            `https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`,
            { headers },
            'Failed to fetch nested blocks'
          );
          childData = await childRes.json();
        } catch {
          continue;
        }
        for (const child of childData.results) {
          try {
            const copy = await buildBlockCopy(child.id, headers);
            await safeFetch(
              `https://api.notion.com/v1/blocks/${createData.results[0].id}/children`,
              {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ children: [copy] })
              },
              'Failed to append block'
            );
            await safeFetch(
              `https://api.notion.com/v1/blocks/${child.id}`,
              {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ archived: true })
              },
              'Failed to archive child block'
            );
          } catch {
          }
          await new Promise(r => setTimeout(r, 400));
        }
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

// Convert specific heading blocks to toggle headings
async function convertBlocksToToggle(blockIds, level = 2) {
  const token = await getToken();
  if (!token) return;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
  };
  for (const id of blockIds) {
    const res = await safeFetch(
      `https://api.notion.com/v1/blocks/${id}`,
      { headers },
      'Failed to fetch block'
    );
    const block = await res.json();
    if (!block.type || !block.type.startsWith('heading')) continue;
    const parentId = block.parent.block_id || block.parent.page_id;
    await safeFetch(
      `https://api.notion.com/v1/blocks/${block.id}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ archived: true })
      },
      'Failed to archive heading'
    );
    const createRes = await safeFetch(
      `https://api.notion.com/v1/blocks/${parentId}/children`,
      {
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
      },
      'Failed to create toggle heading'
    );
    const createData = await createRes.json();
    if (block.has_children) {
      const childRes = await safeFetch(
        `https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`,
        { headers },
        'Failed to fetch nested blocks'
      );
      const childData = await childRes.json();
      for (const child of childData.results) {
        try {
          const copy = await buildBlockCopy(child.id, headers);
          await safeFetch(
            `https://api.notion.com/v1/blocks/${createData.results[0].id}/children`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ children: [copy] })
            },
            'Failed to append block'
          );
          await safeFetch(
            `https://api.notion.com/v1/blocks/${child.id}`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ archived: true })
            },
            'Failed to archive child block'
          );
        } catch {}
        await new Promise(r => setTimeout(r, 400));
      }
    }
    await new Promise(r => setTimeout(r, 400));
  }
}

chrome.runtime.onMessage.addListener(async msg => {
  if (msg.cmd === 'toggle') {
    await convertToToggle(msg.pageId, msg.level);
  } else if (msg.cmd === 'toggleSelection') {
    await convertBlocksToToggle(msg.blockIds, msg.level);
  } else if (msg.cmd === 'createPage') {
    await createLinkedPage(msg);
  } else if (msg.cmd === 'createNewPage') {
    const url = await createPage(msg.title);
    if (url) {
      return { url };
    }
    return { error: 'Failed to create page' };
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
  let page;
  try {
    const pageRes = await safeFetch(
      'https://api.notion.com/v1/pages',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: db },
          properties: {
            Name: { title: [{ text: { content: title } }] }
          }
        })
      },
      'Failed to create page'
    );
    page = await pageRes.json();
  } catch {
    return;
  }
  let block;
  try {
    const blockRes = await safeFetch(
      `https://api.notion.com/v1/blocks/${blockId}`,
      { headers },
      'Failed to retrieve block'
    );
    block = await blockRes.json();
  } catch {
    return;
  }
  const plain = block[block.type].rich_text.map(r => r.plain_text).join('');
  const before = plain.slice(0, start);
  const after = plain.slice(end);
  const richText = [
    { text: { content: before } },
    { text: { content: title, link: { url: page.url } } },
    { text: { content: after } }
  ];
  try {
    await safeFetch(
      `https://api.notion.com/v1/blocks/${blockId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ [block.type]: { rich_text: richText } })
      },
      'Failed to update block text'
    );
  } catch {}
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
  try {
    const pageRes = await safeFetch(
      'https://api.notion.com/v1/pages',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: data.database },
          properties: {
            Name: { title: [{ text: { content: title } }] }
          }
        })
      },
      'Failed to create page'
    );
    const page = await pageRes.json();
    return page.url;
  } catch {
    return null;
  }
}

