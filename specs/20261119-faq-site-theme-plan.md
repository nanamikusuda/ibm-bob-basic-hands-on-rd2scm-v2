# 実装計画書: FAQ サイトのロゴリンク・Bobテーマカラー・ダークテーマ追加

## 基本情報

* 仕様書: 20261119-faq-site-theme-spec.md
* 作成日時: 2026-11-19T21:29:48+09:00
* 更新日時: 2026-11-19T21:36:29+09:00
* 作成者: Bob
* ステータス: Approved

## 変更ファイル一覧

| ファイル | 変更種別 | 変更概要 |
| -------- | -------- | -------- |
| faq/index.html | 修正 | ロゴを `<a>` で囲む、テーマ切り替えボタン追加、`<head>` に初回テーマ適用のインラインスクリプト追加 |
| faq/styles.css | 修正 | Bob 配色への変更、ダークテーマ用 CSS 変数、グラデーションバー・見出し下線、切り替えボタン、ダーク時のロゴ背景、ヘッダーの折り返し |
| faq/app.js | 修正 | テーマ切り替えボタンの処理（トグル、`data-theme` 更新、`localStorage` 保存、ラベル更新） |
| specs/20261119-faq-site-theme-spec.md | 修正済 | 仕様書（Approved） |
| specs/20261119-faq-site-theme-plan.md | 新規 | 本計画書 |

`faq/faq-data.js`、`qa.md`、`bob.svg` は変更しない。

## 実装手順

1. `faq/index.html` を修正する。
   * `<head>` 内、`<link rel="stylesheet">` の前に、初回テーマ適用のインラインスクリプトを追加する。
     * `localStorage.getItem("faq-theme")` が `light` / `dark` ならそれを採用する。
     * なければ `matchMedia("(prefers-color-scheme: dark)").matches` で決める。
     * 結果を `document.documentElement.dataset.theme` に設定する。
     * 例外は `try/catch` で握りつぶし、その場合は OS 設定のみで判定する。
   * ロゴの `<img>` を `<a class="logo-link" href="https://www.ibm.com/products/bob" target="_blank" rel="noopener noreferrer" aria-label="Bob の製品ページを新しいタブで開く">` で囲む。`<img>` は `alt=""` に変更し、`width` / `height` は 56 のまま維持する。
   * ヘッダー末尾にテーマ切り替えボタン `<button id="theme-toggle" class="theme-toggle" type="button"></button>` を追加する（ラベルは `app.js` が設定）。
2. `faq/styles.css` を修正する。
   * `:root` の変数を仕様書の表（ライト列）に置き換える。`--accent-dark` は `--accent-strong` に改名して `#0f62fe` とし、`--accent-sub: #a56eff` を追加する。`color-scheme: light` を設定する。
   * `:root[data-theme="dark"]` を追加し、仕様書の表（ダーク列）を定義する。`color-scheme: dark` を設定する。
   * `body::before` で、高さ4px・全幅のグラデーションバー（`linear-gradient(90deg, #0f62fe, #a56eff)`）を最上部に表示する。
   * `.category-title` の下線を `border-bottom` からグラデーションに変更する（`border-image` または `::after` を使い、サイズは現状の2pxを維持する）。
   * `.tab[aria-selected="true"]` の背景を `linear-gradient(90deg, var(--accent-strong), var(--accent-tab-end))` に変更し、境界線は `transparent` にする（文字色は `#ffffff` のまま）。`:root` と `:root[data-theme="dark"]` の両方に `--accent-tab-end: #8a3ffc` を追加する。未選択タブは変更しない。
   * `.site-header` に `flex-wrap: wrap` を追加する。ヘッダーのタイトル部分は `flex: 1` にし、`.theme-toggle` を右端に配置する。
   * `.theme-toggle` のスタイルを追加する（ボーダー、角丸、`--surface` 背景、`--text` 文字、`cursor: pointer`、`:hover`、`:focus-visible`）。
   * `.logo-link` のフォーカスアウトラインを `--accent` で追加する。
   * `:root[data-theme="dark"] .logo` に背景 `#f4f4f4` と `border-radius: 12px` を追加する。
   * 既存のハードコードされた色（選択中タブの `#ffffff` など）以外が CSS 変数経由になっていることを確認する。
3. `faq/app.js` を修正する。
   * `FAQ_DATA` を参照する既存の IIFE 内に、テーマ切り替え処理を追加する。既存の検索・タブ・開閉ロジックは変更しない。
   * `applyThemeLabel()`: `data-theme` の現在値から、ボタンの表示ラベルと `aria-label` を更新する（ライト時「ダークテーマ」/「ダークテーマに切り替え」、ダーク時「ライトテーマ」/「ライトテーマに切り替え」）。
   * ボタンの `click` で `data-theme` をトグルし、`localStorage.setItem("faq-theme", ...)` を `try/catch` 付きで実行してから、`applyThemeLabel()` を呼ぶ。
   * 初期化時にも `applyThemeLabel()` を呼ぶ。
4. 検証計画に従い確認し、問題があれば修正する。
5. 検証後、計画書のステータスを更新する（承認後に `Approved`）。

## GUI実装

* 対象コンポーネント: `index.html` のヘッダー（ロゴリンク、テーマ切り替えボタン）、`styles.css` の全体配色、`app.js` のテーマ切り替え処理
* スタイル: 外部CSS（`styles.css`）の CSS 変数で、ライト・ダークを `data-theme` 属性により切り替える。外部ライブラリ・CDN は不使用
* 状態管理: テーマは `document.documentElement` の `data-theme` 属性と `localStorage`（キー `faq-theme`）で保持する。FAQ の既存状態（`selectedCategory`、`query`）には影響しない
* 画面遷移: ロゴのクリックで外部ページを新しいタブで開く。それ以外の画面遷移はなし
* レスポンシブ対応: ヘッダーを `flex-wrap` で折り返し、狭い幅でもボタンがはみ出さないようにする。既存の `@media (max-width: 600px)` は維持する

## テストの追加・更新

* 自動テストフレームワークは導入しない（既存計画と同様、要件にない）。
* テーマ切り替えは DOM と `localStorage` に依存するため、自動テストはリポジトリに追加しない。ブラウザでの手動確認で検証する。

## 検証計画

* `node --check faq/app.js` で構文を確認する。
* `grep` で、ロゴのリンク先 URL、`target="_blank"`、`rel="noopener noreferrer"`、`#0f62fe`、`#a56eff`、`data-theme="dark"` が期待どおりに含まれていることを確認する。
* `git status` で、変更が `faq/index.html`、`faq/styles.css`、`faq/app.js` と `specs/` 配下のみであること、`faq-data.js`・`qa.md`・`bob.svg` が未変更であることを確認する。
* 利用可能であれば、ブラウザで `faq/index.html` を開き、以下を確認する。
  * ロゴのクリックで IBM Bob のページが新しいタブで開く
  * テーマ切り替えと、再読み込み後の保持
  * 保存値を消した状態での OS 設定追従
  * 両テーマでの表示（ヘッダー、検索、タブ、質問の開閉、空状態、インラインコード）
  * ダーク時のロゴの視認性
  * キーボード操作（ロゴ、切り替えボタン）
  * 狭い画面幅
  * 既存機能（検索、タブ、開閉、件数）の回帰確認
* ブラウザでの確認ができない場合は、未実施として報告し、ユーザーに手動確認を依頼する。

## 移行・ロールバック

* データ移行は不要。
* ロールバックは、`faq/index.html`、`faq/styles.css`、`faq/app.js` を `git checkout` で変更前に戻し、`specs/20261119-faq-site-theme-*.md` を削除することで行える。

## 未解決事項

* ダーク時のロゴ背景（`#f4f4f4`）の見え方は目視確認が必要。
* 目視確認が環境上できない場合は、未実施として明示する。
