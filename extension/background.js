const NOTION_VERSION = '2022-06-28';

async function notionFetch(url, options = {}, retry = 0) {
  const res = await fetch(url, options);
  if ((res.status === 202 || res.status === 429) && retry < 5) {
    const wait = parseInt(res.headers.get('Retry-After') || '1', 10) * 1000;
    await new Promise(r => setTimeout(r, wait));
    return notionFetch(url, options, retry + 1);
  }
  return res;
}

async function getToken() {
  try {
    return await chrome.identity.getAuthToken({ interactive: true });
  } catch (e) {
    return '';
  }
}

async function fetchAllChildren(blockId, headers) {
  const children = [];
  let cursor = '';
  do {
    const url = `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100${cursor}`;
    const res = await notionFetch(url, { headers });
    const data = await res.json();
    children.push(...data.results);
    cursor = data.has_more ? `&start_cursor=${data.next_cursor}` : '';
  } while (cursor);
  return children;
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
  const children = await fetchAllChildren(pageId, headers);
  for (const block of children) {
    if (block.type.startsWith('heading')) {
      const patchType = `heading_${level}`;
      await notionFetch(`https://api.notion.com/v1/blocks/${block.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          [patchType]: {
            rich_text: block[block.type].rich_text,
            is_toggleable: true
          }
        })
      });
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
    const res = await notionFetch(`https://api.notion.com/v1/blocks/${id}`, { headers });
    const block = await res.json();
    if (!block.type || !block.type.startsWith('heading')) continue;
    const patchType = `heading_${level}`;
    await notionFetch(`https://api.notion.com/v1/blocks/${block.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        [patchType]: {
          rich_text: block[block.type].rich_text,
          is_toggleable: true
        }
      })
    });
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
  const pageRes = await notionFetch('https://api.notion.com/v1/pages', {
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
  const blockRes = await notionFetch(`https://api.notion.com/v1/blocks/${blockId}`, { headers });
  const block = await blockRes.json();
  const plain = block[block.type].rich_text.map(r => r.plain_text).join('');
  const before = plain.slice(0, start);
  const after = plain.slice(end);
  const richText = [
    { text: { content: before } },
    { text: { content: title, link: { url: page.url } } },
    { text: { content: after } }
  ];
  await notionFetch(`https://api.notion.com/v1/blocks/${blockId}`, {
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
  const pageRes = await notionFetch('https://api.notion.com/v1/pages', {
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

