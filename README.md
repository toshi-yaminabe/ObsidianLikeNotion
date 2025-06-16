# ObsidianLikeNotion

NotionをObsidianのように操作するための実験的なChrome拡張機能です。 
This repository provides a prototype extension that manipulates Notion pages.

## 使い方 / Usage
1. このページ右上の **Code** から **Download ZIP** を選び、ファイルを展開します。
2. Chromeの拡張機能ページを開き、デベロッパーモードをオンにして「パッケージ化されていない拡張機能を読み込む」で展開したフォルダを指定します。
3. 拡張機能の設定画面から、Notionで作成したインテグレーションのトークンとページを作成したいデータベースのIDを登録します。データベースはインテグレーションと共有しておく必要があります。

## 主な機能 / Features
- Notionページを素早く作成できます。
- 見出しブロックを同レベルのトグル見出しに変換します。
- 選択したテキストをタイトルとするページを作成し、選択部分をそのページへのリンクに置き換えます。
  選択後に **Alt+L** を押すとリンク化が実行されます。

拡張機能はNotion APIを利用し、`chrome.storage.local` に `token` として統合トークン、`database` としてデータベースIDを保存しておく必要があります。これらは設定画面から入力できます。
`extension/` ディレクトリにすべてのファイルが含まれています。

※ このプロジェクトは実験段階のため、予期しない動作をすることがあります。
