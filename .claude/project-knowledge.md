# プロジェクト知識

- Chrome 拡張機能は Manifest V3 を採用し、`background.js` がサービスワーカーとして動作する。
- Notion API との通信には `fetch` を使用し、レートリミットを考慮して適宜 `setTimeout` で待機する。
- インテグレーションのトークンとデータベース ID は `chrome.storage.local` に保存し、`register.html` から入力できる。
- 初回起動時は `token.txt` からトークンを読み込んで `chrome.storage.local` へ保存する仕組みを持つ。
- `content.js` では Alt+L キーで選択テキストを新規ページ化し、元のテキストをそのページへのリンクに置き換える。
- ポップアップ (`popup.html`) からはページ作成や見出し変換を実行できるボタンを提供する。
- 見出しトグル化では対象ブロックを取得してアーカイブし、新しい `toggle_heading` ブロックを作成して子ブロックを移動させる。
- すべての拡張機能ファイルは `extension/` ディレクトリ以下に配置されている。
