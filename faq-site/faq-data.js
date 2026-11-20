/* FAQデータ（qa.md の日本語訳）。answer は固定データのHTML文字列。 */
var FAQ_CATEGORIES = [
  { id: "general", label: "一般" },
  { id: "usage", label: "使い方" },
  { id: "advanced", label: "高度な機能" },
  { id: "troubleshooting", label: "トラブルシューティング" }
];

var FAQ_ITEMS = [
  /* 一般 */
  {
    id: "what-is-bob",
    category: "general",
    question: "Bobとは何ですか？",
    answer:
      "<p>Bobは、コードの作成、既存コードのリファクタリング、さまざまなタスクの実行を支援する、AI搭載のコーディングパートナーです。カスタムモードやカスタム指示によって、Bobの機能を拡張できます。</p>"
  },
  {
    id: "how-bob-works",
    category: "general",
    question: "Bobはどのように動作しますか？",
    answer:
      "<p>Bobは大規模言語モデル（LLM）を使用して、あなたのリクエストを理解し、アクションに変換します。次のことができます。</p>" +
      "<ul>" +
      "<li>プロジェクト内のファイルの読み取りと書き込み</li>" +
      "<li>ターミナルでのコマンド実行</li>" +
      "<li>インターネットの閲覧（有効にした場合）</li>" +
      "<li>Model Context Protocol（MCP）を介した外部ツールの利用</li>" +
      "</ul>" +
      "<p>チャットインターフェースを通じて指示を出し、Bobが提案するアクションを確認・承認します。</p>"
  },
  {
    id: "what-bob-can-do",
    category: "general",
    question: "Bobは何ができますか？",
    answer:
      "<p>Bobは、次のようなさまざまなコーディングタスクを支援できます。</p>" +
      "<ul>" +
      "<li>自然言語による説明からのコード生成</li>" +
      "<li>既存コードのリファクタリング</li>" +
      "<li>バグの修正</li>" +
      "<li>ドキュメントの作成</li>" +
      "<li>コードの解説</li>" +
      "<li>コードベースに関する質問への回答</li>" +
      "<li>繰り返し作業の自動化</li>" +
      "<li>新しいファイルやプロジェクトの作成</li>" +
      "</ul>"
  },
  {
    id: "data-restrictions",
    category: "general",
    question: "Bobで処理してはいけないデータの種類はありますか？",
    answer:
      "<p>次の種類のデータは、Bobで処理しないでください。</p>" +
      "<ul>" +
      "<li>SPI</li>" +
      "<li>個人の健康情報（PHI）</li>" +
      "<li>輸出規制対象データ（ITAR、APP など）</li>" +
      "<li>規制対象の金融データ（銀行口座番号、PAN、非公開の財務データ）</li>" +
      "</ul>"
  },
  {
    id: "risks",
    category: "general",
    question: "Bobを使用するリスクは何ですか？",
    answer:
      "<p>Bobは強力なツールであるため、責任を持って使用することが重要です。次の点に注意してください。</p>" +
      "<ul>" +
      "<li><strong>Bobは間違えることがあります。</strong>Bobが提案する変更は、承認する前に必ず慎重に確認してください。</li>" +
      "<li><strong>Bobはコマンドを実行できます。</strong>特に自動承認を使用している場合は、Bobにコマンドの実行を依頼する際に注意してください。</li>" +
      "</ul>"
  },

  /* 使い方 */
  {
    id: "start-task",
    category: "usage",
    question: "新しいタスクを開始するには、どうすればよいですか？",
    answer:
      "<p>Bobパネルを開き、チャットボックスにタスクを入力します。Bobにしてほしいことを、明確かつ具体的に伝えてください。</p>"
  },
  {
    id: "switch-modes",
    category: "usage",
    question: "モードを切り替えるには、どうすればよいですか？",
    answer:
      "<p>チャット入力エリアのドロップダウンメニューから別のモードを選択するか、<code>/</code> コマンドを使って特定のモードに切り替えます。</p>"
  },
  {
    id: "tools",
    category: "usage",
    question: "ツールとは何ですか？どのように使いますか？",
    answer:
      "<p>ツールは、Bobがあなたのシステムと連携するための手段です。Bobはタスクを完了するために、適切なツールを自動的に選択して使用します。ツールを直接呼び出す必要はありません。ツールが使われる際は、そのつど承認または拒否を求められます。</p>"
  },
  {
    id: "context-mentions",
    category: "usage",
    question: "コンテキストメンションとは何ですか？",
    answer:
      "<p>コンテキストメンションは、ファイル、フォルダー、問題など、プロジェクトに関する特定の情報をBobに渡す方法です。<code>@</code> に続けて、指定したいものを入力します（例: <code>@/src/file.ts</code>、<code>@problems</code>）。</p>"
  },
  {
    id: "run-commands",
    category: "usage",
    question: "Bobは私のターミナルでコマンドを実行できますか？",
    answer:
      "<p>はい、Bobはコマンドを実行できます。コマンドの自動承認を有効にしていない限り、各コマンドの実行前に承認を求められます。コマンドを自動承認する場合は、細心の注意を払ってください。</p>"
  },
  {
    id: "feedback",
    category: "usage",
    question: "Bobにフィードバックするには、どうすればよいですか？",
    answer:
      "<p>Bobが提案したアクションを承認または拒否することで、フィードバックできます。フィードバック欄を使えば、追加のフィードバックも伝えられます。</p>"
  },
  {
    id: "customize",
    category: "usage",
    question: "Bobの動作をカスタマイズできますか？",
    answer:
      "<p>はい、次のような方法でBobをカスタマイズできます。</p>" +
      "<ul>" +
      "<li><strong>カスタム指示:</strong> すべてのモードに適用される一般的な指示や、モード固有の指示を設定します。</li>" +
      "<li><strong>カスタムモード:</strong> 独自のプロンプトと一部のツール権限を持つ、オリジナルのモードを作成します。</li>" +
      "<li><strong>Bobルール:</strong> プロジェクトのルートにある <code>.bob/rules/</code> フォルダーにMarkdownのルールファイルを作成して、追加のガイドラインを提供します。</li>" +
      "<li><strong>設定:</strong> 自動承認、差分編集など、さまざまな設定を調整します。</li>" +
      "</ul>"
  },
  {
    id: "auto-approval",
    category: "usage",
    question: "Bobに自動承認の設定はありますか？",
    answer:
      "<p>はい、有効にするとアクションを自動的に承認する設定がいくつかあります。</p>"
  },

  /* 高度な機能 */
  {
    id: "what-is-mcp",
    category: "advanced",
    question: "MCP（Model Context Protocol）とは何ですか？",
    answer:
      "<p>MCPは、Bobが外部サーバーと通信できるようにするプロトコルです。カスタムのツールやリソースによって、Bobの機能を拡張します。</p>"
  },
  {
    id: "create-mcp-server",
    category: "advanced",
    question: "独自のMCPサーバーを作成できますか？",
    answer:
      "<p>はい、独自のMCPサーバーを作成して、Bobにカスタム機能を追加できます。</p>"
  },

  /* トラブルシューティング */
  {
    id: "not-responding",
    category: "troubleshooting",
    question: "Bobが応答しません。どうすればよいですか？",
    answer:
      "<ul>" +
      "<li>APIキーが正しく、有効期限が切れていないことを確認してください。</li>" +
      "<li>インターネット接続を確認してください。</li>" +
      "<li>VS Codeを再起動してみてください。</li>" +
      "</ul>"
  },
  {
    id: "undo-changes",
    category: "troubleshooting",
    question: "Bobが意図しない変更を加えました。元に戻すには、どうすればよいですか？",
    answer:
      "<p>BobはVS Code組み込みのファイル編集機能を使用します。標準の「元に戻す」コマンド（Ctrl/Cmd + Z）で変更を取り消せます。チェックポイントを使って、ファイルに加えられた変更を元に戻すこともできます。</p>"
  }
];
