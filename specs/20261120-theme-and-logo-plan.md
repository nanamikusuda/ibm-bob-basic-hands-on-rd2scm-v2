# 実装計画書: FAQサイトのBobロゴリンク化・テーマカラー変更・ダークテーマ追加

## 基本情報

* 仕様書: 20261120-theme-and-logo-spec.md
* 作成日時: 2026-11-20T01:02:34Z
* 更新日時: 2026-11-20T01:14:38Z
* 作成者: IBM Bob
* ステータス: Approved

## 変更ファイル一覧

| ファイル | 変更種別 | 変更概要 |
| --- | --- | --- |
| `faq-site/index.html` | 修正 | ロゴ画像のリンク化（`<a>`タグ追加）、テーマ切り替えボタンの配置 |
| `faq-site/style.css` | 修正 | Bobカラー（グラデーション等）の定義、ダークテーマ用CSS変数・スタイルの追加、テーマボタンのスタイリング |
| `faq-site/app.js` | 修正 | テーマ初期化（OS設定/localStorageの適用）、テーマ切り替えボタンのイベントハンドラ追加 |

## 実装手順

### 1. HTML構造の更新 (`faq-site/index.html`)
1. ヘッダー上部（またはタイトル横）にテーマ切り替えボタン `<button id="theme-toggle" class="theme-toggle" type="button" aria-label="ダークテーマに切り替え">` を追加。
2. ヘッダー内のロゴ画像 `<img class="site-logo" src="bob.svg" ...>` を `<a class="site-logo-link" href="https://www.ibm.com/products/bob" target="_blank" rel="noopener noreferrer" aria-label="IBM Bob 公式サイト（新しいタブで開きます）">` でラップ。

### 2. スタイルの更新とダークテーマ定義 (`faq-site/style.css`)
1. `:root` にBobカラー用の変数（`--accent-grad: linear-gradient(135deg, #0f62fe, #a56eff)`, `--accent-purple: #a56eff`, `--accent-blue: #0f62fe` など）を追加。
2. `[data-theme="dark"]` セレクタを定義し、ダークテーマ用のCSS変数（`--bg`, `--bg-sub`, `--text`, `--muted`, `--border` 等）を設定。
3. ヘッダー全体の背景を `var(--accent-grad)` に変更し、ヘッダー内のタイトル・検索ラベルの文字色を `#ffffff` に設定。
4. テーマ切り替えボタン（`.theme-toggle`）のスタイルを、グラデーション背景上で見やすい半透明白背景（`rgba(255,255,255,0.2)` 等）およびホバー効果に調整。
5. 検索インプット（`.search-input`）の背景や境界線をグラデーションヘッダー上で際立つようにスタイル調整。
6. 選択中タブ（`.tab[aria-selected="true"]`）の背景をBobグラデーションに変更し、ホバー時のスタイルも調整。
7. ダークテーマ時のアコーディオントグル（`.faq-toggle`）、インラインコード（`code`）、空状態メッセージ（`.empty`）のスタイルを微調整。

### 3. JavaScriptによるテーマ切り替えロジック実装 (`faq-site/app.js`)
1. `initTheme()` 関数を実装:
   - `localStorage.getItem("theme")` をチェック。
   - 保存されていない場合は `window.matchMedia("(prefers-color-scheme: dark)").matches` を判定。
   - `document.documentElement.setAttribute("data-theme", theme)` を設定。
   - テーマ切り替えボタンのアイコンおよび `aria-label` を現在のテーマに応じて更新。
2. テーマ切り替えボタンのクリックイベントを設定:
   - 現在のテーマが `dark` なら `light` に、`light` なら `dark` にトグル。
   - `data-theme` 属性を更新し、`localStorage.setItem("theme", newTheme)` に保存。
   - ボタンの表示（アイコン・`aria-label`）を更新。
3. OSのテーマ変更リスナー（`matchMedia.addEventListener("change", ...)`）を追加（手動設定がない場合の追従）。

## GUI実装

* **対象コンポーネント**:
  - ヘッダー (`.site-header`): ロゴリンク、タイトル、テーマ切り替えボタン
  - タブ (`.tabs`, `.tab`): Bobグラデーション適用
  - 検索欄、FAQリスト、アコーディオン、フッター: ダークテーマ対応
* **スタイル**:
  - ライトテーマ: 白・明るいグレー基調 + Bobグラデーションアクセント
  - ダークテーマ: `#161616` / `#262626` 基調 + Bobグラデーションアクセント
* **状態管理**:
  - テーマ状態: `localStorage`（キー: `theme`、値: `dark` または `light`）および `<html>` の `data-theme` 属性
* **画面遷移**:
  - Bobロゴクリック時に別タブで `https://www.ibm.com/products/bob` を表示
* **レスポンシブ対応**:
  - ヘッダー内のタイトルとテーマ切り替えボタンがスマートフォン幅（max-width: 600px）でも重ならず綺麗に並ぶようFlexbox配置を調整。

## テストの追加・更新

* バニラJS・静的サイトのため、手動ブラウザ検証およびDOM属性・スタイル・ストレージの確認を行う。

## 検証計画

1. **ロゴリンク検証**:
   - ロゴをクリックし、別タブで `https://www.ibm.com/products/bob` が開くことを確認。
   - `target="_blank"` および `rel="noopener noreferrer"` が正しく設定されていることを確認。
2. **テーマカラー検証**:
   - ヘッダー下部や選択中タブにBobグラデーションカラー（ブルー〜パープル）が反映されていることを確認。
3. **ダークテーマ動作検証**:
   - テーマ切り替えボタンを押してダークテーマへ切り替わることを確認。
   - 背景色、文字色、枠線、アコーディオン、検索入力欄の視認性が確保されていることを確認。
   - 再度押してライトテーマへ戻ることを確認。
4. **永続化検証**:
   - ダークテーマにした状態でページをリロードし、ダークテーマのまま維持されることを確認。
   - `localStorage` に `theme: "dark"` が記録されていることを確認。
5. **既存機能の回帰テスト**:
   - カテゴリタブの切り替え、検索キーワードの入力、FAQアイテムの開閉がライト/ダーク両方で正常に動くことを確認。

## 移行・ロールバック

* 単一コミット/変更前のファイルバックアップ（Git）により、不具合発生時は即時ロールバック可能。

## 未解決事項

* なし
