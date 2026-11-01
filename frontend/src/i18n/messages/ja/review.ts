// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const review = {
  'review.header.eyebrow': '差分レビュー',
  'review.header.title': 'コード変更をレビュー',
  'review.header.description':
    '作業ツリーの差分、単一のコミット、ブランチ範囲のいずれかを、設定済みのモデルに送信します。コンソールは CLI と同じエージェントによるレビューを実行します。',
  'review.header.sessionHistory': 'セッション履歴',

  'review.resume.lead': 'セッション ',
  'review.resume.tail':
    ' を再開しています。再利用されたファイルチェックポイントは保持されます。プロバイダーとモデルは前回の実行と一致している必要があります。',
  'review.resume.clear': 'クリア',

  'review.scope.title': 'スコープを選択',
  'review.scope.subtitle': 'レビューの対象を選びます',

  'review.mode.workspace.label': '作業ツリー',
  'review.mode.workspace.description': 'ステージ済み、未ステージ、未追跡のファイル',
  'review.mode.commit.label': '単一コミット',
  'review.mode.commit.description': 'コミットを親コミットと比較',
  'review.mode.range.label': 'ブランチ範囲',
  'review.mode.range.description': 'マージベースを使って 2 つの ref を比較',

  'review.commit.label': 'コミットまたはタグ',
  'review.commit.placeholder': 'abc1234、v1.2.0、HEAD~1',
  'review.commit.hint': '親コミットが差分のベースとして使われます。',

  'review.range.from': '開始 ref',
  'review.range.fromPlaceholder': 'main',
  'review.range.to': '終了 ref',
  'review.range.toPlaceholder': 'feature/my-branch',
  'review.range.swap': 'ref を入れ替え',

  'review.workspace.changed': '作業ツリー内の変更ファイル {count} 件 | 作業ツリー内の変更ファイル {count} 件',
  'review.workspace.noRepo': 'リポジトリが見つかりません',
  'review.workspace.counts': '{staged} ステージ済み · {unstaged} 未ステージ · {untracked} 未追跡',
  'review.workspace.noRepoHint': '変更をレビューするには、git リポジトリからコンソールを起動してください。',

  'review.context.title': 'コンテキストを追加',
  'review.context.subtitle': '任意ですが、レビューの精度が上がります。',
  'review.context.placeholder':
    'この変更の目的は何ですか？ 例：ログイン API へのレート制限の追加、請求処理の新しいスキーマへの移行。',
  'review.context.hint': '意図、制約、移行に関する注意点を記述してください。シークレットは貼り付けないでください。',

  'review.advanced.title': '詳細オプション',

  'review.effort.label': 'レビュー強度',
  'review.effort.default': '既定',
  'review.effort.low': '低',
  'review.effort.medium': '中',
  'review.effort.high': '高',
  'review.effort.hint.default': '設定済みの強度を使用します（設定で変更しない限り「中」）。',
  'review.effort.hint.low': 'グループごとに 1 回のレビュー。最速で、小さな変更向きです。',
  'review.effort.hint.medium': 'グループごとに 2 回のレビュー。既定のバランスです。',
  'review.effort.hint.high': 'グループごとに最大 3 回のレビュー。時間はかかりますが、繊細な変更やリスクの高い変更向きです。',

  'review.override.provider': 'プロバイダーの上書き',
  'review.override.providerPlaceholder': '設定済みのプロバイダーを使用',
  'review.override.model': 'モデルの上書き',
  'review.override.modelPlaceholder': '設定済みのモデルを使用',
  'review.override.hint': 'この実行にのみ適用されます。',
  'review.override.summaryBoth': 'プロバイダー + モデルを上書き',
  'review.override.summaryProvider': 'プロバイダーを上書き',
  'review.override.summaryModel': 'モデルを上書き',
  'review.override.concurrency': '並列数',
  'review.override.concurrencyHint': '並列に実行するレビューのサブタスク数。',
  'review.override.timeout': 'タスクのタイムアウト（分）',
  'review.override.timeoutHint': '0 の場合はタスクごとの制限なし。',
  'review.override.maxTokens': 'グループあたりの最大トークン数',
  'review.override.maxTokensHint': '0 の場合は設定済みの既定値を使用します。',
  'review.override.budget': 'トークン予算',
  'review.override.budgetHint': '0 の場合は無制限。',
  'review.override.exclude': '除外パターン',
  'review.override.excludePlaceholder': '**/generated/*, **/testdata/*',
  'review.override.excludeHint':
    'カンマ区切りの gitignore 形式のパターン。プロジェクトのルールとマージされます。',

  'review.filter.title': '後段のフィルタリングをスキップ',
  'review.filter.description':
    'エージェントが送信したすべてのコメントを、確信度の低い指摘も含めて保持します。',

  'review.command.label': '同等のコマンド',
  'review.actions.preview': 'スコープをプレビュー',
  'review.actions.start': 'レビューを開始',

  'review.model.title': '使用中のモデル',
  'review.model.subtitle': 'この実行で確定した設定',
  'review.model.auth': '認証',
  'review.model.effort': '強度',
  'review.model.resume': '再開',
  'review.model.configuredDefault': '設定済みの既定値',
  'review.model.noProvider': 'プロバイダーが設定されていません',
  'review.model.selectModel': 'モデルを選択',
  'review.model.noModel': 'モデルが選択されていません',
  'review.model.warning': 'モデルが設定されていません。レビューを実行する前にプロバイダーを選択してください。',
  'review.model.manage': 'プロバイダーを管理',

  'review.pipeline.title': 'レビューの流れ',
  'review.pipeline.subtitle': '開始後に実行される内容',
  'review.pipeline.select.title': '選択とフィルタリング',
  'review.pipeline.select.description':
    '差分を読み取り、ルールを適用して、バイナリ、シークレット、サイズ超過のファイルを除外します。',
  'review.pipeline.group.title': '関連ファイルをグループ化',
  'review.pipeline.group.description':
    '関連するファイルをまとめ、レビュー単位ごとに十分なコンテキストを確保します。',
  'review.pipeline.review.title': 'エージェントによるレビュー',
  'review.pipeline.review.description':
    'エージェントはコードを読み、リポジトリを検索して、行単位で正確な指摘を送信します。',
  'review.pipeline.save.title': 'フィルタリングと保存',
  'review.pipeline.save.description':
    '確信度の低いコメントを除外したうえで、指摘とカバレッジを保存します。',

  'review.tip.title': '良いレビューは意図の共有から始まります',
  'review.tip.text':
    '変更の背景を追加してください。エージェントはそれを手がかりに、意図的なトレードオフとバグを区別するため、ノイズの多い指摘を減らせます。',
  'review.tip.foot': 'プレビューではモデルのトークンを消費しません。',

  'review.error.noRepo': 'レビューを実行するには、git リポジトリからコンソールを開いてください。',
  'review.error.commit': 'レビューするコミットまたはタグを選択してください。',
  'review.error.refs': '開始 ref と終了 ref の両方を選択してください。',
  'review.error.sameRefs': '開始 ref と終了 ref は異なるものを指定してください。',
  'review.error.busy': 'レビューはすでに開始されています。',
} satisfies Record<string, string>
