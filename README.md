# ObsidianLikeNotion

NotionをObsidianのように操作するための実験的なChrome拡張機能です。 
This repository provides a prototype extension that manipulates Notion pages.

## 使い方 / Usage
1. このページ右上の **Code** から **Download ZIP** を選び、ファイルを展開します。
2. Chromeの拡張機能ページを開き、デベロッパーモードをオンにして「パッケージ化されていない拡張機能を読み込む」で展開したフォルダを指定します。
3. Notionの `token_v2` を取得し、`token.txt` に貼り付けるか拡張機能の設定画面から保存します。

## 主な機能 / Features
- Notionページを素早く開いたり作成できます。
- 見出しブロックを同レベルのトグル見出しに変換します。
- 選択したテキストをタイトルとするページを作成し、選択部分をそのページへのリンクに置き換えます。

拡張機能はNotion APIを利用し、`chrome.storage.local` に `token` として統合トークンを保存しておく必要があります。 
`extension/` ディレクトリにすべてのファイルが含まれています。

※ このプロジェクトは実験段階のため、予期しない動作をすることがあります。
