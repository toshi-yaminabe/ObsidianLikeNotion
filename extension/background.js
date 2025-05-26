const NOTION_VERSION = '2022-06-28';

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
  const data = await res.json();
  for (const block of data.results) {
    if (block.type.startsWith('heading')) {
      // Archive old heading
      await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ archived: true })
      });
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
      const createData = await createRes.json();
      if (block.has_children) {
        const childRes = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`, { headers });
        const childData = await childRes.json();
        for (const child of childData.results) {
          await fetch(`https://api.notion.com/v1/blocks/${child.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ parent: { block_id: createData.results[0].id } })
          });
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
