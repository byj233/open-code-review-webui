// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const providers = {
  'providers.page.description':
    'コードをレビューするモデルを選択します。キーは ~/.opencodereview/config.json に保存され、このページに返されることはありません。',
  'providers.actions.customProvider': 'カスタムプロバイダー',
  'providers.actions.testConnection': '接続をテスト',

  'providers.banner.active': '使用中のプロバイダー',
  'providers.banner.noModelConfigured': 'モデルが設定されていません',
  'providers.banner.choose': '以下からプロバイダーを選択してください',
  'providers.banner.noModel': 'モデルが選択されていません',
  'providers.banner.changeModel': 'モデルを変更',
  'providers.banner.openSettings': '設定を開く',

  'providers.toolbar.searchPlaceholder': 'プロバイダー、モデル、環境変数を検索',
  'providers.toolbar.configuredOnly': '設定済みのみ',
  'providers.toolbar.configuredCount': '{configured}/{total} 件設定済み',

  'providers.builtin.title': '組み込みプロバイダー',
  'providers.builtin.subtitle': 'プリセットにはエンドポイント、プロトコル、推奨モデルが付属します。',
  'providers.builtin.emptyTitle': '一致する組み込みプロバイダーがありません',
  'providers.builtin.emptyDescription': '検索をクリアするか、設定済みのみのフィルターをオフにしてください。',

  'providers.card.active': '使用中',
  'providers.card.noModelsYet': 'モデルはまだありません',
  'providers.card.modelListNotPreset': 'モデル一覧は未設定',
  'providers.card.configure': '設定',
  'providers.card.use': '使用',
  'providers.card.setUp': 'セットアップ',

  'providers.custom.title': 'カスタムプロバイダー',
  'providers.custom.subtitle': 'OpenAI 互換または Anthropic 互換の任意のエンドポイント。',
  'providers.custom.addTitle': 'カスタムプロバイダーを追加',
  'providers.custom.addText': 'ゲートウェイ、ローカルプロキシ、プライベートな OpenAI 互換エンドポイントなど。',

  'providers.dialog.titleAdd': 'カスタムプロバイダーを追加',
  'providers.dialog.titleActive': '使用中のプロバイダーを設定',
  'providers.dialog.titleNamed': '{name} を設定',
  'providers.dialog.titleFallback': 'プロバイダーを設定',
  'providers.dialog.introNew':
    '管理下のエンドポイントをコンソールに指定します。プロトコルと URL は custom_providers に保存されます。',
  'providers.dialog.introActive':
    'モデルを変更すると、使用中のプロバイダーに書き込まれます。新しいキーを貼り付けない限り、保存済みのキーは保持されます。',
  'providers.dialog.introDefault':
    'このプロバイダーで使用するモデルを選択し、レビューとスキャンの実行で有効にします。',
  'providers.dialog.currentlyActive': 'このプロバイダーは現在使用中です。',
  'providers.dialog.nameLabel': 'プロバイダー名',
  'providers.dialog.nameHint': '英字、数字、ドット、ハイフンが使えます。設定キーにも使われます。',
  'providers.dialog.modelLabel': 'モデル',
  'providers.dialog.modelPlaceholder': 'モデル ID を選択または入力',
  'providers.dialog.urlLabel': 'エンドポイント URL',
  'providers.dialog.protocolLabel': 'プロトコル',
  'providers.dialog.apiKeyLabel': 'API キー',
  'providers.dialog.keyStoredPlaceholder': '保存済みのキーがあります。置き換えるには貼り付けてください。',
  'providers.dialog.keyPlaceholder': 'API キーを貼り付け',
  'providers.dialog.keyOptionalHint': 'この手順では任意です。後から追加できます。',
  'providers.dialog.keyKeepHint':
    '空欄のままにすると保存済みのキーを保持します。キーがこのコンソールに表示されることはありません。',
  'providers.dialog.ambientAuthNote':
    'このプロバイダーは AWS の既定の認証情報チェーンで認証します。必要に応じて、設定で AWS リージョンとプロファイルを指定してください。',
  // The edge spaces keep the inline `ocr auth login` code span spaced in the template.
  'providers.dialog.signInBefore': 'このプロバイダーは対話式サインインを使用します。ターミナルで ',
  'providers.dialog.signInAfter': ' を実行してから、ここに戻ってください。',
  'providers.dialog.add': 'プロバイダーを追加',
  'providers.dialog.saveModel': 'モデルを保存',
  'providers.dialog.useProvider': 'プロバイダーを使用',

  'providers.protocol.anthropicMessages': 'Anthropic messages',
  'providers.protocol.openaiChat': 'OpenAI chat completions',
  'providers.protocol.openaiResponses': 'OpenAI responses',
  'providers.protocol.openaiCompatible': 'OpenAI 互換',
  'providers.protocol.bedrock': 'AWS Bedrock',
  'providers.protocol.notSet': 'プロトコル未設定',

  'providers.validation.modelRequired': 'このプロバイダーのモデルを選択してください。',
  'providers.validation.urlRequired': 'エンドポイント URL は必須です。',
  'providers.validation.urlInvalid': 'エンドポイントは http:// または https:// で始まる必要があります。',
  'providers.validation.nameInvalid': 'プロバイダー名には英字、数字、ドット、ハイフンを使用できます。',
  'providers.validation.nameReserved': 'その名前は組み込みプロバイダーで使用されています。',

  'providers.toast.added': 'カスタムプロバイダーを追加しました',
  'providers.toast.activated': 'プロバイダーを有効化しました',
} satisfies Record<string, string>;
