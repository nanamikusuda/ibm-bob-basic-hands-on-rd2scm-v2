# 実装計画書: FAQサイトへのBobロゴ・テーマカラー・ダークテーマ追加

## 基本情報

* 仕様書: 20261123-faq-site-theme-spec.md
* 作成日時: 2026-11-23T20:51:32+09:00
* 更新日時: 2026-11-23T20:52:25+09:00
* 作成者: Bob
* ステータス: Approved

## 変更ファイル一覧

| ファイル                  | 変更種別 | 変更概要                                                                 |
| --------------------- | ---- | -------------------------------------------------------------------- |
| faq-site/bob.svg      | 新規   | ルートの `bob.svg` をコピー（内容は変更しない）                                       |
| faq-site/index.html   | 修正   | `<head>` にテーマ初期化用インラインスクリプト追加。ヘッダーにロゴリンクと切替ボタンを追加                |
| faq-site/style.css    | 修正   | 色をCSSカスタムプロパティ化。ダークテーマ変数、ヘッダーのグラデーション、ロゴ/切替ボタンのスタイル追加 |
| faq-site/script.js    | 修正   | テーマ切替ボタンの処理（反転、`localStorage` 保存、ラベル/`aria-pressed` 更新）を追加 |

`faq-data.js`、`qa.md`、ルートの `bob.svg`、既存仕様書・実装計画書は変更しない。

## 実装手順

1. ルートの `bob.svg` を `faq-site/bob.svg` にコピーする（`cp`）。
2. `faq-site/style.css` を修正する。
   * `:root` にライト用の変数を定義し、`:root[data-theme="dark"]` でダーク用の値を上書きする。
     * 変数: `--bg`、`--text`、`--muted`、`--border`、`--input-border`、`--input-bg`、`--code-bg`、`--accent`、`--accent-contrast`（選択中ボタンの文字色）。値は仕様書の表のとおり。
   * 既存の固定色（`#ffffff`、`#1f2328`、`#0f62fe`、`#c6c6c6`、`#e0e0e0`、`#f0f0f0`、`#57606a`）を変数に置き換える。
   * `.search-input` に `background: var(--input-bg); color: var(--text);` を追加する。
   * `.category-button` の背景は `var(--bg)`、選択時は `var(--accent)` / `var(--accent-contrast)` とする。
   * `.site-header` を `position: relative` にし、背景を `linear-gradient(90deg, #0f62fe, #a56eff)` にする（両テーマ共通。文字色は白）。
   * `.logo-link`（`position: absolute; top: 16px; left: 16px`）と、その `img`（`height: 48px; width: auto; display: block`）を追加する。
   * `.theme-toggle`（`position: absolute; top: 16px; right: 16px`）を追加する。ヘッダー上で見える半透明白の枠と文字（白）とし、フォーカス時は `:focus-visible` で視認できるよう、白系のアウトラインを指定する。
3. `faq-site/index.html` を修正する。
   * `<head>` 内、`<link rel="stylesheet">` の前に、次の処理を行うインラインスクリプトを追加する。
     * `try { localStorage.getItem("faq-theme") } catch` で保存値を取得（例外時は `null`）。
     * `light` / `dark` 以外または未保存なら `matchMedia("(prefers-color-scheme: dark)").matches` で判定。
     * 結果を `document.documentElement.dataset.theme` に設定する。
   * `<header>` の先頭に `<a class="logo-link" href="https://www.ibm.com/products/bob" target="_blank" rel="noopener noreferrer"><img src="bob.svg" alt="Bob（IBM Bobの製品ページを新しいタブで開く）" /></a>` を追加する。
   * `<header>` に `<button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">ダーク表示</button>` を追加する。
4. `faq-site/script.js` を修正する。
   * `themeToggle` 要素を取得する。
   * `applyThemeLabel()` で、現在の `document.documentElement.dataset.theme` に応じて、ラベル（ダーク時「ライト表示」、ライト時「ダーク表示」）と `aria-pressed`（ダーク時 `"true"`）を更新する。
   * クリック時に、`data-theme` を反転し、`try { localStorage.setItem("faq-theme", ...) } catch {}` で保存し、`applyThemeLabel()` を呼ぶ。
   * 起動時に `applyThemeLabel()` を1回呼ぶ。既存の検索・絞り込み・描画のコードは変更しない。
5. 検証を行う（下記）。
6. 結果をユーザーに提示し、確認を得る。

## GUI実装

* 対象コンポーネント: ヘッダー（ロゴリンク、切替ボタン、グラデーション背景）、および検索ボックス・カテゴリボタン・カテゴリ見出し・質問アコーディオン・インラインコード・空状態のテーマ対応配色
* スタイル: [`style.css`](../faq-site/style.css) のCSSカスタムプロパティ。`:root`（ライト）と `:root[data-theme="dark"]`（ダーク）で値を定義する。外部リソースは使わない。
* 状態管理: テーマは `<html data-theme>` 属性と `localStorage`（キー `faq-theme`）で管理する。初期値の決定は `<head>` のインラインスクリプトで行い、切替処理は `script.js` で行う。
* 画面遷移: ロゴのクリックで外部ページを新しいタブで開くのみ。FAQ内の遷移はない。
* レスポンシブ対応: 対象外（PCのみ）

## テストの追加・更新

* 自動テストフレームワークは導入しない（要件外）。
* 手動確認項目は、仕様書の「確認方法」に従う。

## 検証計画

* `node --check faq-site/script.js` で構文を確認する。
* `faq-site/index.html` のインラインスクリプトの構文を、Nodeで確認する（スクリプト部分を取り出して `node --check`）。
* `grep` で、`style.css` に置き換え漏れの固定色（`#ffffff`、`#1f2328`、`#e0e0e0`、`#c6c6c6`、`#f0f0f0`、`#57606a`）が `:root` 定義以外に残っていないことを確認する。
* `git status` / `git diff --stat` で、変更が `faq-site/`（`bob.svg`、`index.html`、`style.css`、`script.js`）と `specs/` のみであることを確認する。`faq-data.js`、`qa.md`、ルートの `bob.svg` が未変更であることも確認する。
* ブラウザでの手動確認（ロゴ表示とリンク、両テーマの見た目、切替と保持、OS設定追従、キーボード操作、コンソールエラー）は、ユーザー側での実施をお願いし、仕様書の確認項目を提示する。この環境で実施できない確認は、未実施として報告する。

## 移行・ロールバック

* 既存データの移行は不要。
* ロールバックは、`faq-site/bob.svg` の削除と、`index.html`、`style.css`、`script.js` の `git checkout` で行える（`faq-site/` は現在未コミットのため、`git checkout` ではなく、変更箇所の手動巻き戻しになる点に注意）。

## 未解決事項

* ダークテーマの配色値は基準値であり、手動確認で調整が必要になる可能性がある。調整が必要な場合は、仕様書の表を更新して再承認を得る。
