// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessions = {
  'sessions.header.description':
    'すべてのレビューとスキャンは JSONL セッションとして ~/.opencodereview/sessions に保存されます。セッションを開くと、指摘、カバレッジ、実行マニフェストを確認できます。',

  'sessions.stat.findings': '指摘',
  'sessions.stat.files': 'レビュー済みファイル',
  'sessions.stat.average': '平均指摘数',
  'sessions.stat.latest': '最新 {when}',
  'sessions.stat.noHistory': '履歴はまだありません',
  'sessions.stat.findingsHint': '保存済みセッション全体',
  'sessions.stat.filesHint': '完了したファイル項目',
  'sessions.stat.averageHint': '保存済みセッションあたり',

  'sessions.toolbar.searchPlaceholder': 'ID、モデル、ブランチ、ref で検索',
  'sessions.toolbar.shown': '{count} 件を表示',

  'sessions.filter.all': 'すべて',

  'sessions.table.started': '開始日時',
  'sessions.table.model': 'モデル',
  'sessions.table.scope': 'ブランチ / 範囲',
  'sessions.table.files': 'ファイル',
  'sessions.table.findings': '指摘',
  'sessions.table.duration': '所要時間',

  'sessions.row.resumed': '再開済み',

  'sessions.scope.wholeRepository': 'リポジトリ全体',
  'sessions.scope.commit': 'コミット {id}',
  'sessions.scope.commitOnly': 'コミット',
  'sessions.scope.workingTree': '作業ツリー',

  'sessions.empty.noMatch': '一致するセッションはありません',
  'sessions.empty.none': 'セッションはまだありません',
  'sessions.empty.noMatchHint': '検索語やステータスフィルターを変更してみてください。',
  'sessions.empty.noneHint': 'レビューまたはスキャンを実行すると、その指摘がここに保存されます。',
  'sessions.empty.runReview': 'レビューを実行',
  'sessions.empty.clearFilters': 'フィルターをクリア',

  'sessions.footer.summary': '{count} 件のセッション · {page} ページ',

  'sessions.delete.dialogTitle': 'セッションを削除',
  'sessions.delete.action': 'セッションを削除',
  'sessions.delete.description':
    '保存されたセッションとその指摘をディスクから削除します。レビュー自体には影響しませんが、履歴は復元できません。',
  'sessions.delete.success': 'セッションを削除しました',
} satisfies Record<string, string>
