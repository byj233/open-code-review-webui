// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const overview = {
  'overview.hero.eyebrow': 'ワークスペース概要',
  'overview.hero.headlineReview': 'コードをレビューしましょう。',
  'overview.hero.headlineNoRepo': 'コンソールをリポジトリに向けてください。',
  'overview.hero.descriptionLead':
    '差分をレビューし、リポジトリ全体をスキャンし、すべての指摘を見返せます。コンソールはターミナルと同じ ',
  'overview.hero.descriptionTail': ' コマンドを実行します。',
  'overview.hero.changed': '{count} 件の変更',
  'overview.hero.scanRepo': 'リポジトリをスキャン',
  'overview.hero.branchNotGit': 'Git リポジトリではありません',

  'overview.greeting.workingLate': '夜遅くまでお疲れさまです',
  'overview.greeting.morning': 'おはようございます',
  'overview.greeting.afternoon': 'こんにちは',
  'overview.greeting.evening': 'こんばんは',

  'overview.notGit.title': 'このフォルダは Git リポジトリではありません。',
  'overview.notGit.bodyLead':
    'コードレビューとスキャンには Git の履歴が必要です。リポジトリからコンソールを起動するか、先にここで ',
  'overview.notGit.bodyTail': ' を実行してください。',

  'overview.model.connectTitle': 'モデルを接続してレビューを始めましょう。',
  'overview.model.connectBody':
    'プロバイダーの API キーを追加するか、コンソールを OpenAI 互換のエンドポイントに向けてください。',
  'overview.model.chooseProvider': 'プロバイダーを選択',
  'overview.model.title': 'モデル',
  'overview.model.subtitle': '設定ファイル、環境変数、プロバイダー設定から解決されます',
  'overview.model.manage': '管理',
  'overview.model.noProvider': 'プロバイダーが設定されていません',
  'overview.model.selectModel': 'モデルを選択して開始',
  'overview.model.auth': '認証',
  'overview.model.source': '取得元',
  'overview.model.endpoint': 'エンドポイント',
  'overview.model.test': '接続をテスト',
  'overview.model.reviewSettings': 'レビュー設定',

  'overview.quick.reviewTitle': '変更をレビュー',
  'overview.quick.reviewDesc': '作業ツリー、コミット、ブランチ範囲',
  'overview.quick.scanTitle': 'コードベースをスキャン',
  'overview.quick.scanDesc': '差分なしでファイル全体をレビュー',
  'overview.quick.modelsTitle': 'モデルとプロバイダー',
  'overview.quick.connectTitle': 'モデルを接続',
  'overview.quick.manageModels': 'モデルを管理',
  'overview.quick.providerDesc': 'API キー、環境変数、カスタムエンドポイント',

  'overview.stats.changedFiles': '変更ファイル',
  'overview.stats.savedSessions': '保存済みセッション',
  'overview.stats.findingsRecorded': '記録済みの指摘',
  'overview.stats.activeModel': '使用中のモデル',
  'overview.stats.notSet': '未設定',
  'overview.stats.gitRequired': 'レビューには Git が必要です',
  'overview.stats.dirtySummary': '{staged} ステージ済み · {unstaged} 未ステージ · {untracked} 未追跡',
  'overview.stats.noHistory': '履歴はまだありません',
  'overview.stats.latest': '最新 {time}',
  'overview.stats.acrossSessions': '保存済みセッション全体',
  'overview.stats.latestFindings': '最新セッションで {count} 件',
  'overview.stats.modelMissing': 'モデルが設定されていません',

  'overview.sessions.title': '最近のセッション',
  'overview.sessions.subtitle': '指摘は ~/.opencodereview/sessions に保存されます',
  'overview.sessions.viewAll': 'すべて表示',
  'overview.sessions.modelUnknown': 'モデル未記録',
  'overview.sessions.findings': '{count} 件の指摘 | {count} 件の指摘',
  'overview.sessions.files': '{completed}/{selected} ファイル | {completed}/{selected} ファイル',
  'overview.sessions.total': '全 {count} セッション | 全 {count} セッション',
  'overview.sessions.emptyTitle': 'セッションはまだありません',
  'overview.sessions.emptyDesc':
    '最初のレビューがここに表示され、すべての指摘がディスクに保存されます。',
  'overview.sessions.run': 'レビューを実行',
  'overview.sessions.browse': '履歴を参照',
  'overview.sessions.emptyHistory': '履歴は最初の実行から始まります',
  'overview.sessions.noRepo': 'リポジトリなし',

  'overview.workspace.repoStatus': 'リポジトリの状態',
  'overview.workspace.staged': 'ステージ済み',
  'overview.workspace.unstaged': '未ステージ',
  'overview.workspace.untracked': '未追跡',
  'overview.workspace.upstream': '上流',
  'overview.workspace.recentCommits': '最近のコミット',
  'overview.workspace.noCommits': 'まだコミットがありません。',
  'overview.workspace.emptyDesc':
    'Git リポジトリからコンソールを開くと、差分のレビューと履歴の保存ができます。',

  'overview.activity.title': '最近のアクティビティ',
  'overview.activity.subtitle': 'このコンソールから開始したコマンド',
} satisfies Record<string, string>;
