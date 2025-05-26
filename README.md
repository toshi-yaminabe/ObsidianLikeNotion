# ObsidianLikeNotion

This repository contains a minimal Chrome extension prototype that manipulates Notion pages.

## Features

1. **Toggle Conversion** - Converts every heading block on the current Notion page into a toggle heading at the same level.
2. **Link Creation** - When text is selected in Notion, a new page is created in a specified database with that text as the title and the selection is replaced with a link to the new page.

The extension uses the Notion API and requires an integration token stored via `chrome.storage.local` under the key `token`.

Place your extension files under the `extension/` directory in this repository.
