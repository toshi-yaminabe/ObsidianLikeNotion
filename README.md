# ObsidianLikeNotion

Notion を Obsidian のように操作するための実験的な Chrome 拡張機能です。
`extension/` ディレクトリに拡張機能のすべてのファイルが含まれています。

## 拡張機能の読み込み
1. このリポジトリを **Code → Download ZIP** からダウンロードして解凍します。
2. Chrome で `chrome://extensions/` を開き、右上の **デベロッパーモード** を有効にします。
3. **パッケージ化されていない拡張機能を読み込む** をクリックし、解凍したフォルダ内の `extension` を選択します。

## 初期設定
ポップアップで **Setup Integration** ボタンを押すと設定ページが開きます。
ここで Notion のインテグレーショントークンとページ作成先のデータベース ID を入力して保存してください。
これらの情報は `chrome.storage.local` に保存され、API 呼び出しに必須です。

## 主な機能
- 現在開いているページの見出しブロックをトグル見出しに変換
- 選択したテキストをタイトルとするページを作成し、選択部分をそのリンクに置換（**Alt+L**）

## ポップアップのボタン
- **Convert headings** – 現在の Notion ページ内の見出しをすべてトグル見出しに変換します。
- **Setup Integration** – インテグレーションのトークンとデータベース ID を登録するためのオプションページを開きます。

## ライセンス
本プロジェクトは [MIT License](LICENSE) の下で公開されています。

### 権限と Notion API の利用
拡張機能は次の権限を要求します:
`activeTab`, `scripting`, `storage`
および `https://www.notion.so/*` と `https://api.notion.com/*` へのホストアクセス。

※ このプロジェクトは実験段階のため、予期しない動作をすることがあります。
