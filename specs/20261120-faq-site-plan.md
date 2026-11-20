# 実装計画書: 日本語FAQサイト（バックエンドなし）

## 基本情報

* 仕様書: 20261120-faq-site-spec.md
* 作成日時: 2026-11-20T09:53:56+09:00
* 更新日時: 2026-11-20T09:54:51+09:00
* 作成者: Bob
* ステータス: Approved

## 変更ファイル一覧

| ファイル | 変更種別 | 変更概要 |
| --- | --- | --- |
| faq-site/index.html | 新規 | ページ骨格（ヘッダー、検索、タブ、一覧、フッター）。`lang="ja"` |
| faq-site/style.css | 新規 | ライト基調IBMブルー系のスタイル、レスポンシブ、フォーカス表示 |
| faq-site/app.js | 新規 | 検索・カテゴリ絞り込み・アコーディオン・空状態の描画ロジック |
| faq-site/faq-data.js | 新規 | カテゴリ定義と全17問の日本語FAQデータ（グローバル変数 `FAQ_CATEGORIES` / `FAQ_ITEMS`） |
| faq-site/bob.svg | 新規 | ルート直下の `bob.svg` のコピー（ロゴ用） |
| specs/20261120-faq-site-spec.md | 新規 | 仕様書（作成済み） |
| specs/20261120-faq-site-plan.md | 新規 | 本計画書 |

`qa.md`、`bob.svg`（ルート）、`README.md` などの既存ファイルは変更しない。

## 実装手順

1. `faq-site/` を作成し、`bob.svg` をコピーする。
2. `faq-data.js` を作成する。
   * `FAQ_CATEGORIES`: `[{id, label}]`（general=一般、usage=使い方、advanced=高度な機能、troubleshooting=トラブルシューティング）
   * `FAQ_ITEMS`: `[{id, category, question, answer(HTML文字列)}]` を `qa.md` の順に17件。
   * 翻訳方針は仕様書に従う（固有名詞・コマンド・パスは原文維持）。
3. `index.html` を作成する。
   * `<script src="faq-data.js">` → `<script src="app.js">` の順に読み込む（`type="module"` は使わない）。
   * 検索ボックス（`<label>` + `<input type="search">`）、タブ用コンテナ（`role="tablist"`）、件数表示（`aria-live="polite"`）、一覧コンテナ、空状態要素、フッターを配置する。
4. `style.css` を作成する。
   * 配色: アクセント `#0f62fe`、本文 `#161616`、背景 `#ffffff` / `#f4f4f4`、枠線 `#e0e0e0`。
   * 最大幅800px中央寄せ、`@media (max-width: 600px)` でヘッダー縦積み・余白縮小・タブ横スクロール。
   * `:focus-visible` のアウトライン、質問ボタンの矢印（CSS）、`[hidden]` で回答を非表示、インラインコードの等幅表示。
5. `app.js` を作成する。
   * 状態: `query`、`category`、`openIds`（Set）。
   * `normalize(s)`: `trim` → `normalize("NFKC")` → `toLowerCase`。
   * 検索対象テキスト: 質問 + 回答（HTMLタグを除いたテキスト）を事前に正規化して保持する。
   * `matches(item)`: カテゴリ一致 かつ 空白区切りの全語が対象テキストに含まれる。
   * `renderTabs()`: タブをボタンで生成（`role="tab"`、`aria-selected`）。
   * `renderList()`: 絞り込み結果を描画。各項目は `<h2>` 内の `<button aria-expanded aria-controls>` と回答 `<div id hidden>`。開閉状態は `openIds` から復元。件数表示と空状態の表示切替。
   * イベント: 検索 `input`、タブ `click`、質問 `click`（Enter/Space は `<button>` の標準動作）。
6. 検証（下記）を実施し、不具合があれば修正する。
7. 仕様書の完了条件と照合し、結果を報告する。

## GUI実装

* 対象コンポーネント: `index.html` の静的要素と、`app.js` が生成するタブ・FAQ項目（素のDOM操作）
* スタイル: `style.css` の単一ファイル（BEM風の簡易クラス名）。外部リソースなし
* 状態管理: `app.js` 内のモジュールスコープ変数（`query`、`category`、`openIds`）。永続化なし
* 画面遷移: なし（単一ページ）
* レスポンシブ対応: 600px以下でレイアウト調整、タブは横スクロール。375px幅で確認する

## テストの追加・更新

* 自動テストフレームワークは導入しない（ビルド不要・最小構成の方針のため）。
* 検証用として、`node` のワンライナーで `faq-data.js` を読み込み、件数・カテゴリ別件数・ID重複・必須項目の欠落を確認する（リポジトリにはファイルを追加しない）。

## 検証計画

1. データ検証（`node`）: 17件、カテゴリ別 5/8/2/2、ID重複なし、`category` が定義済みIDに含まれる。
2. `qa.md` の `###` 見出し数（17）と一致することの照合。
3. `app.js` の構文確認（`node --check faq-site/app.js`）。
4. `app.js` の検索ロジック（`normalize` / `matches`）を `node` で簡易確認（「MCP」「mcp」「ＭＣＰ」「コマンド 承認」、存在しない語）。
5. ブラウザでの手動確認項目の提示（ユーザーに依頼）: `file://` で開く、初期表示、検索、タブ、開閉、空状態、375px幅、キーボード操作、コンソールエラーなし。
6. 既存ファイル（`qa.md` など）に差分がないこと（`git status`）の確認。

実ブラウザでの確認はAgent環境では実施できない可能性があるため、その場合は未実施項目として明示し、ユーザーによる確認を依頼する。

## 移行・ロールバック

* 新規ファイルのみ。ロールバックは `faq-site/` と、本件の仕様書・計画書の削除で完了する。
* データ移行なし。

## 未解決事項

* なし（翻訳の訳語はレビューで確認する）。
