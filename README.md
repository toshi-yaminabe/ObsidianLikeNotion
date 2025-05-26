# ObsidianLikeNotion


このリポジトリはNotionをObsidianのように使う実験的なプロジェクトです。

## Chrome拡張機能の概要

mainブランチにはNotionページを操作するChrome拡張機能の試作実装が含まれています。

### 機能
1. **見出しのトグル変換** - 現在開いているNotionページのすべての見出しブロックを同じレベルのトグル見出しに変換します。
2. **リンク付きページ作成** - Notionでテキストを選択すると、指定したデータベースにそのテキストをタイトルとする新しいページを作成し、選択部分をそのページへのリンクに置き換えます。

この拡張機能はNotion APIを利用しており、`chrome.storage.local`に`token`というキーで統合トークンを保存しておく必要があります。

`extension/` ディレクトリに拡張機能のファイルが配置されています。
=======
This repository contains a minimal Chrome extension prototype that manipulates Notion pages.

## Features

1. **Toggle Conversion** - Converts every heading block on the current Notion page into a toggle heading at the same level.
2. **Link Creation** - When text is selected in Notion, a new page is created in a specified database with that text as the title and the selection is replaced with a link to the new page.

The extension uses the Notion API and requires an integration token stored via `chrome.storage.local` under the key `token`.

Place your extension files under the `extension/` directory in this repository.
