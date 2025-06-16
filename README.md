# ObsidianLikeNotion

NotionをObsidianのように操作するための実験的なChrome拡張機能です。 
This repository provides a prototype extension that manipulates Notion pages.

## 使い方 / Usage
1. このページ右上の **Code** から **Download ZIP** を選び、ファイルを展開します。
2. Chromeの拡張機能ページを開き、デベロッパーモードをオンにして「パッケージ化されていない拡張機能を読み込む」で展開したフォルダを指定します。
3. Notionで作成したインテグレーションのトークンを `token.txt` に保存するか拡張機能の設定画面から登録します。
4. 同じ設定画面で、リンク先を作成したいデータベースのIDも保存します。

## 主な機能 / Features
- Notionページを素早く開いたり作成できます。
- 見出しブロックを同レベルのトグル見出しに変換します。
- 選択したテキストをタイトルとするページを作成し、選択部分をそのページへのリンクに置き換えます。

拡張機能はNotion APIを利用し、`chrome.storage.local` に `token` として統合トークン、`database` としてデータベースIDを保存しておく必要があります。
`extension/` ディレクトリにすべてのファイルが含まれています。

※ このプロジェクトは実験段階のため、予期しない動作をすることがあります。
