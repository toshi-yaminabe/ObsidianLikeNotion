# 改善履歴

- 初期コミットでREADMEを追加。
- Chrome拡張プロトタイプを導入し、Notionページ作成機能を実装。
- 日本語READMEの整備とインテグレーション登録UIを追加。
- データベースIDを設定できるようにし、トークンとともに `chrome.storage.local` に保存。
- token.txt を読み込んで初回トークン設定を自動化。
- Alt+L ショートカットで選択テキストを新規ページへリンク化する機能を追加。
- popup.js を外部ファイルに分離し、コード構成を整理。
- NotionページIDの抽出ロジックを修正してハイフンなしURLに対応。
- MITライセンスを追加し、未使用機能を削除。
- 見出しをトグル見出しへ変換する機能を実装。
- fetch 呼び出しを try/catch で囲み、通信失敗時のログを強化。
- プロジェクトコンテキストやドキュメントを随時拡充。
