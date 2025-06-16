# ObsidianLikeNotion

NotionをObsidianのように操作するための実験的なChrome拡張機能です。 
This repository provides a prototype extension that manipulates Notion pages.

## 使い方 / Usage
1. このページ右上の **Code** から **Download ZIP** を選び、ファイルを展開します。
2. Chromeの拡張機能ページを開き、デベロッパーモードをオンにして「パッケージ化されていない拡張機能を読み込む」で展開したフォルダを指定します。
3. 拡張機能の設定画面で Chrome の認証ボタンを押し、Notion インテグレーションのトークンを取得します。合わせてページを作成したいデータベースの ID を登録します。データベースはインテグレーションと共有しておく必要があります。

## 主な機能 / Features
- Notionページを素早く作成できます。
- 見出しブロックをトグル見出しに変換します。ポップアップのセレクトボックスでレベルを H1/H2/H3 から選べます。
- 選択したテキストをタイトルとするページを作成し、選択部分をそのページへのリンクに置き換えます。
  選択後に **Alt+L** を押すとリンク化が実行されます。

拡張機能は Notion API を利用し、トークンは Chrome Identity API により暗号化保存されます。設定画面ではデータベース ID のみ `chrome.storage.local` に保存します。
`extension/` ディレクトリにすべてのファイルが含まれています。

※ このプロジェクトは実験段階のため、予期しない動作をすることがあります。
