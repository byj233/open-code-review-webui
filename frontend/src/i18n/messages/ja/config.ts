// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const config = {
  'config.page.description':
    'レビューの既定値、レガシーエンドポイント設定、テレメトリ、MCP サーバーを管理します。書き込みは ocr config コマンドを経由するため、CLI とこのコンソールで設定が食い違うことはありません。',
  'config.actions.reload': '再読み込み',
  'config.actions.manageProviders': 'プロバイダーを管理',
  'config.common.unsavedChanges': '未保存の変更',

  'config.model.title': 'モデルとレビューの既定値',
  'config.model.subtitle': 'これらの値は、実行ごとに上書きしない限り、すべてのレビューとスキャンに適用されます。',
  'config.model.noProvider': 'プロバイダーが設定されていません',
  'config.model.noModel': 'モデルが選択されていません',
  'config.model.change': '変更',
  'config.model.modelLabel': 'モデル',
  'config.model.modelPlaceholder': 'プロバイダーに設定されたモデルを使用',
  'config.model.modelHint':
    '有効なプロバイダーに書き込まれます。空のままにすると、推測せずに実行が明確に失敗します。',
  'config.model.effortLabel': 'レビュー強度',
  'config.model.effortDefault': '既定（中）を使用',
  'config.model.effortLow': '低 - 1 回',
  'config.model.effortMedium': '中 - 2 回',
  'config.model.effortHigh': '高 - 3 回',
  'config.model.effortHint': 'ファイルグループごとのレビュー回数を制御します。',
  'config.model.maxTokensLabel': 'グループあたりの最大トークン数',
  'config.model.maxTokensHint': '0 を指定すると設定を解除し、組み込みテンプレートの既定値を使用します。',
  'config.model.languageLabel': '出力言語',
  'config.model.languagePlaceholder': 'English',
  'config.model.languageHint': 'モデルがレビューコメントを書く言語です。',
  'config.model.save': '既定値を保存',

  'config.legacy.title': 'レガシーエンドポイント（llm.*）',
  'config.legacy.subtitle':
    'プロバイダープリセットを使わない、OpenAI または Anthropic 互換の単一エンドポイントです。',
  // The edge spaces keep the inline `llm.*` code span spaced in the template.
  'config.legacy.overrideBefore': '有効なプロバイダーは ',
  'config.legacy.overrideAfter':
    ' の設定を上書きします。このエンドポイントを使う前に、プロバイダーページで有効なプロバイダーを削除してください。',
  'config.legacy.urlLabel': 'エンドポイント URL',
  'config.legacy.modelLabel': 'モデル',
  'config.legacy.modelPlaceholder': 'gpt-5.4 または claude-sonnet-4-6',
  'config.legacy.protocolLabel': 'プロトコル',
  'config.legacy.protocolAnthropic': 'Anthropic messages',
  'config.legacy.protocolOpenaiChat': 'OpenAI chat completions',
  'config.legacy.protocolOpenaiResponses': 'OpenAI responses',
  'config.legacy.timeoutLabel': 'リクエストのタイムアウト（秒）',
  'config.legacy.timeoutHint': '0 の場合はクライアントの既定値を使用します。',
  'config.legacy.authTokenLabel': '認証トークン',
  'config.legacy.authTokenPlaceholderStored': 'トークン保存済み - 貼り付けて置き換え',
  'config.legacy.authTokenPlaceholder': '認証トークンを貼り付け',
  'config.legacy.authTokenHint': '保存されたトークンがブラウザーに返されることはありません。',
  'config.legacy.authTokenCmdLabel': '認証トークン取得コマンド',
  'config.legacy.authTokenCmdHint': '固定のトークンが保存されていない場合にのみ実行されます。',
  'config.legacy.clearToken': '保存済みトークンをクリア',
  'config.legacy.save': 'エンドポイントを保存',
  'config.legacy.clearTokenTitle': '認証トークンをクリア',
  'config.legacy.clearTokenConfirm':
    '保存された llm.auth_token をクリアしますか？ トークン取得コマンドまたは環境変数でトークンが指定されない限り、エンドポイントは失敗します。',
  'config.legacy.clearTokenConfirmButton': 'トークンをクリア',

  'config.telemetry.title': 'テレメトリ',
  'config.telemetry.subtitle':
    '既定では無効です。コンテンツのログ記録は、テレメトリが有効な場合にのみ意味を持ちます。',
  'config.telemetry.enableTitle': 'テレメトリを有効化',
  'config.telemetry.enableText': 'レビュー実行のトレースとメトリクスをエクスポートします。',
  'config.telemetry.exporterLabel': 'エクスポーター',
  'config.telemetry.exporterPlaceholder': '既定',
  'config.telemetry.exporterConsole': 'コンソール',
  'config.telemetry.exporterOtlp': 'OTLP',
  'config.telemetry.otlpLabel': 'OTLP エンドポイント',
  'config.telemetry.contentTitle': 'コンテンツを含める',
  'config.telemetry.contentText':
    'テレメトリにプロンプトと応答を追加します。ソースコードが含まれる可能性があります。',
  'config.telemetry.save': 'テレメトリを保存',

  'config.file.title': '設定ファイル',
  'config.file.subtitle': 'CLI が引き続き信頼できる情報源です',
  'config.file.loading': '読み込み中…',
  'config.file.exists': 'ファイルあり',
  'config.file.notCreated': '未作成',
  'config.file.parseError': '解析エラー',
  'config.file.parseFailed': '設定ファイルを解析できませんでした: {error}',
  // The edge spaces keep the inline `ocr config set` and `ocr config unset` spans spaced.
  'config.file.noteBefore': '保存のたびに ',
  'config.file.noteBetween': ' または ',
  'config.file.noteAfter': ' が実行され、未知のフィールドとプロバイダーのレイアウトは保持されます。',
  'config.file.copyPath': 'パスをコピー',
  'config.file.copied': '設定ファイルのパスをコピーしました',
  'config.file.copyFailed': '設定ファイルのパスをコピーできませんでした',

  'config.mcp.title': 'MCP サーバー',
  'config.mcp.configuredCount': '{count} 件設定済み',
  'config.mcp.noCommand': 'コマンドなし',
  'config.mcp.removeServer': 'MCP サーバーを削除',
  'config.mcp.removeConfirm': '設定から MCP サーバー「{name}」を削除しますか？',
  'config.mcp.removeButton': '削除',
  'config.mcp.emptyTitle': 'MCP サーバーがありません',
  'config.mcp.emptyDescription':
    'MCP サーバーは、ターミナルで ocr config set mcp_servers.<name> を実行して管理します。',

  'config.secrets.title': 'シークレットに関する注意',
  // The edge spaces keep the inline `*_cmd` code span spaced in the template.
  'config.secrets.textBefore':
    'API キーと認証トークンは一度だけ書き込まれ、このページに返されることはありません。シークレットマネージャーを使う場合は ',
  'config.secrets.textAfter': ' 設定の使用をおすすめします。',

  'config.toast.saved': '設定を保存しました',
  'config.toast.savedPrefix': '保存しました: ',
} satisfies Record<string, string>;
