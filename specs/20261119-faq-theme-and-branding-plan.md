# 実装計画書: FAQサイトのブランディングおよびダークテーマ対応

## 基本情報

* 仕様書: specs/20261119-faq-theme-and-branding-spec.md
* 作成日時: 2026-11-19T12:02:00+09:00
* 更新日時: 2026-11-19T12:08:00+09:00
* 作成者: Bob
* ステータス: Approved

## 変更ファイル一覧

| ファイル | 変更種別 | 変更概要 |
| --- | --- | --- |
| `site/bob.svg` | 新規 | ルートの `bob.svg` を `site/` 配下にコピー |
| `site/index.html` | 修正 | ヘッダー内に Bob ロゴリンクとダークテーマ切り替えトグルボタンを追加 |
| `site/style.css` | 修正 | Bob カラーパレット定義、ダークテーマ変数定義、グラデーション装飾、トグルボタンおよびレスポンシブスタイルの追加 |
| `site/app.js` | 修正 | テーマ切り替え・localStorage 永続化・OS 設定初期化ロジックの追加 |

## 実装手順

### 1. アセットの配置
- リポジトリルートの `bob.svg` の内容を `site/bob.svg` として配置する。

### 2. HTML構造の更新 (`site/index.html`)
- ヘッダー (`.site-header .container`) の構造を更新する。
  - 左側に Bob ロゴのアンカーリンク `<a href="https://www.ibm.com/products/bob" target="_blank" rel="noopener noreferrer" class="site-logo-link" aria-label="IBM Bob 公式サイト（新しいタブで開く）"><img src="bob.svg" alt="Bob Logo" class="site-logo"></a>` を配置。
  - タイトルと説明文を包む `.header-content` を配置。
  - 右側にテーマ切り替えボタン `<button id="theme-toggle" class="theme-toggle" aria-label="ダークテーマに切り替え" type="button"><span class="theme-toggle-icon" aria-hidden="true">🌙</span></button>` を配置。

### 3. スタイル定義の更新 (`site/style.css`)
- `:root` および `[data-theme="dark"]` でカラー変数を定義。
- ヘッダー (`.site-header`) の背景色に `var(--gradient)` を適用し、タイトル（h1）を `#ffffff`、説明文（p）を `rgba(255, 255, 255, 0.9)` に設定。
- ヘッダー下部の `::after` 装飾下線を削除（ヘッダー全体がグラデーションになるため）。
- テーマ切り替えボタン (`.theme-toggle`) はグラデーション背景上でも視認できるよう、半透明白背景（`rgba(255, 255, 255, 0.2)` 等）や白ボーダーで調整。
- アクティブタブ、カテゴリ見出し下線にグラデーションまたは Bob アクセントカラーを適用。
- モバイル幅（480px以下）でのヘッダー折り返し・配置調整。

### 4. テーマ切り替えロジックの実装 (`site/app.js`)
- テーマ状態管理関数:
  - `getStoredTheme()`: `localStorage.getItem('bob-faq-theme')` を取得。無ければ `window.matchMedia('(prefers-color-scheme: dark)').matches` から判定。
  - `setTheme(theme)`: `document.documentElement.setAttribute('data-theme', theme)` を設定し、トグルボタンのアイコン（🌙 / ☀️）と `aria-label` を更新、`localStorage.setItem('bob-faq-theme', theme)` に保存。
- 初期化処理:
  - スクリプト読み込み時に現在のテーマを適用。
  - ボタンクリックイベントで `light` ⇔ `dark` をトグル。
  - OS の `prefers-color-scheme` 変更リスナー（手動設定がない場合に対応）。

## GUI実装

* **対象コンポーネント**:
  - ヘッダー (`.site-header`): Bobロゴリンク、タイトル・説明、テーマ切り替えボタン
  - 全体スタイル: 背景色、テキスト色、入力欄、カテゴリタブ、Q&Aアコーディオン、フッター
* **スタイル**:
  - ライト/ダーク両対応の CSS カスタムプロパティ設計
  - Bob のアイコニックなブルー＆パープルのグラデーション（`linear-gradient(135deg, #0f62fe, #a56eff)`）
* **状態管理**:
  - `document.documentElement.dataset.theme`（`"light"` または `"dark"`）
  - `localStorage` による永続化
* **画面遷移**:
  - ロゴクリック時のみ外部 URL（`https://www.ibm.com/products/bob`）へ別タブ遷移。サイト内遷移はなし。
* **レスポンシブ対応**:
  - 画面幅 320px〜1200px に対応。スマホ幅ではロゴとトグルボタンが邪魔にならないよう適切に縮小・配置。

## テストの追加・更新

* 単体テストフレームワークは未導入のため、仕様書に記載の確認方法に基づくブラウザでの動作検証を実施する。

## 検証計画

1. **初期表示確認**:
   - `site/index.html` を開き、ヘッダー左上に Bob ロゴが表示され、テーマ切り替えボタンが表示されること。
   - 初期テーマ（OS設定またはデフォルト）が正しく適用されていること。
2. **ロゴリンク確認**:
   - Bob ロゴをクリックして `https://www.ibm.com/products/bob` が別タブで開くこと。
3. **テーマカラー確認**:
   - ヘッダー下線、アクティブタブ、カテゴリ見出し下線などに Bob カラー（ブルー・パープル）が反映されていること。
4. **ダークテーマ切り替え確認**:
   - トグルボタンをクリックしてダークテーマに切り替わること（背景が暗色、文字が明色、コントラスト良好）。
   - 再度クリックしてライトテーマに戻ること。
   - ダークテーマの状態でページをリロードし、ダークテーマが維持されていること。
5. **既存機能の回帰確認**:
   - 検索フィルター、カテゴリタブ切り替え、FAQアコーディオン開閉が正常に動作すること。
   - コンソールにエラーが出ないこと。
6. **レスポンシブ確認**:
   - 画面幅 320px, 480px, 768px, 1200px で表示崩れ・横スクロールがないこと。

## 移行・ロールバック

* 静的ファイルのみの変更のため、問題発生時は Git によるリバート（`git checkout`）で即時に復元可能。

## 未解決事項

* 特になし。
