# 実装計画書: FAQサイトへのBobロゴ・テーマカラー変更・ダークテーマ追加

## 基本情報

* 仕様書: 20261124-faq-site-brand-theme-spec.md
* 作成日時: 2026-11-24T15:06:59+09:00
* 更新日時: 2026-11-24T15:18:39+09:00
* 作成者: Bob
* ステータス: Approved

## 変更ファイル一覧

| ファイル | 変更種別 | 変更概要 |
| ------------ | ------------ | ---- |
| `index.html` | 修正 | ヘッダー構造の変更(ロゴリンク、タイトル群、テーマ切替ボタン)。`<head>`に保存済みテーマを適用する最小限のインラインスクリプトを追加 |
| `style.css` | 修正 | CSS変数をライト新配色に更新、ダーク配色を追加、グラデーションの適用、ヘッダーのレイアウト、切替ボタンのスタイル、色の直書きを変数化 |
| `script.js` | 修正 | テーマ切替ボタンの動作、`localStorage`への保存、OS設定変化への追従を追加(既存の検索・絞り込み・開閉のロジックは変更しない) |

`bob.svg`、`faq-data.js`、`qa.md`、既存の仕様書・計画書は変更しない。

## 実装手順

1. **`index.html`の変更**
   * `<head>`の`<link rel="stylesheet">`の前に、インラインスクリプトを追加する。`localStorage`の`bob-faq-theme`を読み、`light`または`dark`なら`document.documentElement.setAttribute("data-theme", 値)`を行う。`try/catch`で例外を握りつぶす。
   * `.site-header`内を、`.container`の中に`.header-inner`(flex)を置く構成にする。
     * `<a class="brand-logo" href="https://www.ibm.com/products/bob" target="_blank" rel="noopener noreferrer">`の中に`<img src="bob.svg" alt="Bob(IBM Bobの製品ページへ)">`
     * `.header-text`の中に既存の`h1`と`p.lead`
     * `<button type="button" id="theme-toggle" class="theme-toggle" aria-pressed="false">ダークテーマ</button>`
2. **`style.css`のライト配色の更新**(`:root`)
   * `--bg: #ffffff`、`--surface: #f4f4f4`、`--border: #e0e0e0`、`--text: #262626`、`--muted: #525252`、`--accent: #0f62fe`、`--hover: #e0e0e0`、`--gradient: linear-gradient(135deg, #0f62fe, #a56eff)`を定義する。
   * 既存の`--accent-dark`は廃止し、選択中ボタンのホバーは`filter: brightness(0.92)`など変数に依存しない方法にする(要:実装時に見た目を確認)。
   * `--accent`の用途は、フォーカスリング、`.faq-question::after`の「+」アイコンに限る。
3. **`style.css`のダーク配色の追加**
   * `:root[data-theme="dark"]`に、`--bg: #161616`、`--surface: #262626`、`--border: #393939`、`--text: #f4f4f4`、`--muted: #c6c6c6`、`--accent: #78a9ff`、`--hover: #393939`を定義する。
   * `@media (prefers-color-scheme: dark)`の中に`:root:not([data-theme="light"])`で同じ変数を定義する(OS追従。`data-theme="light"`の手動選択時は適用しない)。
   * 変数の重複定義は、`data-theme`と`prefers-color-scheme`の両立のために必要なため許容する。
4. **`style.css`のコンポーネント変更**
   * `.site-header`: 背景を`var(--gradient)`(上に黒12%のオーバーレイ。補足文のコントラスト確保のため実装中に追加、ユーザー承認済み)、文字色を白、下線は不要なら削除。
   * `.header-inner`: `display: flex; align-items: center; gap: 16px;`。`.header-text`は`flex: 1`。
   * `.brand-logo img`: `height: 56px; width: auto; display: block;`。`.brand-logo`にフォーカス表示(白のアウトライン)を設定する。
   * `.site-header h1`、`.site-header .lead`: 白系の文字色にする。補足文は不透明度を上げて可読性を確保する(実装時にコントラストを測定)。
   * `.theme-toggle`: 半透明の白背景または白枠、白文字、角丸、`cursor: pointer`。ホバー・フォーカス表示を付ける。
   * `.category-btn[aria-pressed="true"]`: 背景を`var(--gradient)`、文字白。ホバー指定は手順2の方針に合わせる。
   * `.faq-category-title`: `border-bottom`を、`border-image: var(--gradient) 1`または`background`による下線(`linear-gradient`+`background-size`)でグラデーションにする。どちらがスマホで崩れないか実装時に確認する。
   * `.faq-question:hover`の`#eceff3`を`var(--hover)`に変更する。
   * 検索ボックス、カテゴリボタン、FAQアイテム、`code`、該当なし、フッターが変数に従うことを確認し、直書きの色を残さない。
   * `color-scheme`プロパティをライトは`light`、ダークは`dark`にして、入力欄(`type="search"`の標準UI)も追従させる。
5. **`style.css`のレスポンシブ**
   * 600px以下: `.brand-logo img { height: 44px; }`。`.header-inner`を`flex-wrap: wrap`にし、`.theme-toggle`が収まらない場合は折り返す(横スクロールを出さない)。
6. **`script.js`の変更**
   * 既存のIIFE内に、テーマ切替の処理を追加する。既存コードは変更しない。
   * 追加する処理:
     * `isDark()`: `data-theme`が`dark`ならtrue、`light`ならfalse、なければ`matchMedia("(prefers-color-scheme: dark)").matches`。
     * `updateToggle()`: `#theme-toggle`の`aria-pressed`を`String(isDark())`に更新する。
     * クリックハンドラ: `data-theme`を`isDark() ? "light" : "dark"`に設定し、`localStorage.setItem("bob-faq-theme", 値)`を`try/catch`で行い、`updateToggle()`する。
     * `matchMedia`の`change`イベントで`updateToggle()`する(`data-theme`がなければ表示はCSSで追従する)。`addEventListener`が使えない古い環境への対応は行わない。
     * 初期化時に`updateToggle()`を一度呼ぶ。
7. **動作確認と調整**
   * ブラウザでの確認結果に応じ、コントラスト(ヘッダー補足文、切替ボタン)、ロゴの見え方、検索ボックスの枠線を調整する。
   * 調整が仕様の範囲を超える場合(ロゴ背景を追加するなど)は、実装を止めてユーザーに確認し、仕様書・計画書を更新して再承認を得る。

## GUI実装

* 対象コンポーネント:
  * ヘッダー(`index.html`の`.site-header`): ロゴリンク`.brand-logo`、タイトル群`.header-text`、切替ボタン`#theme-toggle`
  * 配色は全体(`style.css`の変数)に及ぶ
* スタイル:
  * CSS変数による配色の一元管理(`--bg`、`--surface`、`--border`、`--text`、`--muted`、`--accent`、`--hover`、`--gradient`)
  * グラデーションの適用先: ヘッダー背景、選択中のカテゴリボタン、カテゴリ見出しの下線
  * ダークテーマは`:root[data-theme="dark"]`と`@media (prefers-color-scheme: dark)`の`:root:not([data-theme="light"])`で定義
* 状態管理:
  * テーマ: `<html data-theme>`属性(`light` / `dark`、なければOS設定)。保存先は`localStorage`の`bob-faq-theme`。
  * 切替ボタンの`aria-pressed`で現在のダーク状態を示す。
  * 既存の検索・カテゴリ・開閉の状態管理(`state`、`aria-expanded`)は変更しない。
* 画面遷移:
  * ロゴクリックで外部URLを新しいタブで開く(ページ内遷移はない)。
* レスポンシブ対応:
  * PC幅: ロゴ高さ56px。ロゴ、タイトル群、切替ボタンを横並び。
  * 600px以下: ロゴ高さ44px。切替ボタンは必要に応じて折り返す。375px幅で横スクロールが出ないこと。

## テストの追加・更新

* 自動テストは追加しない(既存にテスト環境がなく、静的サイトのため)。
* 手動確認項目は検証計画に従う。

## 検証計画

仕様書の完了条件との照合として、以下を確認する。

1. **構文・読み込み**
   * `node --check script.js`で構文を確認する。
   * ブラウザでコンソールエラーがないことを確認する。
2. **ロゴ・リンク**
   * ヘッダー左にロゴが表示される。クリックで`https://www.ibm.com/products/bob`が新しいタブで開く。`rel`属性を確認する。
3. **テーマ**
   * ライト表示で配色(グラデーション、グレー)が適用されている。
   * 開発者ツールの`prefers-color-scheme`切替で、初期表示がOSに追従する。
   * 切替ボタンで手動切替でき、`localStorage`の`bob-faq-theme`が保存される。再読み込み後も維持される。
   * 保存済みの値がOS設定より優先される。
   * `localStorage`が使えない場合に例外が出ない(可能な範囲で確認)。
4. **既存機能**
   * 検索、カテゴリ絞り込み、併用、アコーディオン、該当なし表示、件数表示を両テーマで確認する。
5. **レスポンシブ・アクセシビリティ**
   * PC幅と375px幅で表示が崩れず、横スクロールがない。
   * キーボードのみで、ロゴリンク、切替ボタン、既存操作ができる。フォーカス表示が両テーマで見える。
   * 主要な文字と背景(本文、補助文字、ヘッダーのタイトル・補足文、切替ボタン、選択中ボタン、`code`)のコントラスト比を計算する。
6. **外部通信**
   * ページ読み込み時に外部リクエストがないことをネットワークタブで確認する。

ブラウザでの手動確認が自動化できない項目は、実施できなかった場合に理由と残るリスクを報告する。

## 移行・ロールバック

* データ移行なし。
* これらは未コミットのため、実装前に`index.html`、`style.css`、`script.js`を`.bob/tmp/backup/`へコピーして退避する(ユーザー承認済み)。コミットや別ブランチは作らない。
* ロールバックは、退避したコピーを元の位置に戻す。
* `localStorage`に保存されたキー`bob-faq-theme`は、ロールバック後は参照されないため、残っても影響はない。

## 未解決事項

* (解決済み)ロールバック手段は`.bob/tmp/backup/`への退避コピーとする。
* ヘッダーのグラデーション上の白文字コントラスト(特に紫側)、ロゴ帽子の見え方は、実装後に測定・確認して判断する。
* グラデーション下線(`border-image`または`background`)のどちらを使うかは、実装時の見え方で決める。
