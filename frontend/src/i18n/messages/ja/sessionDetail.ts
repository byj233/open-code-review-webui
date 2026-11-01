// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessionDetail = {
  'sessionDetail.header.back': 'セッション一覧に戻る',
  'sessionDetail.header.aborted': '中断',
  'sessionDetail.header.started': '{date} に開始',
  'sessionDetail.header.took': '所要時間 {duration}',
  'sessionDetail.header.withModel': 'モデル {model}',
  'sessionDetail.header.description': '{parts}。',

  'sessionDetail.callouts.interrupted':
    'このセッションは完了前に中断されました。中断までに保存された指摘は引き続き確認できます。',
  'sessionDetail.callouts.failureTitle': '{classification}。',
  'sessionDetail.callouts.failureFallback': '実行に失敗しました',
  'sessionDetail.callouts.failureReason': '実行マニフェストに実行レベルの失敗が記録されています。',

  'sessionDetail.actions.resume': '再開',
  'sessionDetail.actions.resumeTooltip': '新しい実行でこのレビューを続行します',
  'sessionDetail.actions.resumeDisabled': '再開できるのはコミットと範囲のセッションのみです',
  'sessionDetail.actions.copyId': 'ID をコピー',

  'sessionDetail.stats.findings': '指摘',
  'sessionDetail.stats.filesReviewed': 'レビュー済みファイル',
  'sessionDetail.stats.reusedWaived': '再利用 {reused} · 免除 {waived}',
  'sessionDetail.stats.failedFiles': '失敗ファイル',
  'sessionDetail.stats.seeCoverage': '下のカバレッジを参照',
  'sessionDetail.stats.noFileFailures': 'ファイル単位の失敗はありません',
  'sessionDetail.stats.duration': '所要時間',
  'sessionDetail.stats.severityHint': '緊急 {critical} · 高 {high} · 中 {medium}',

  'sessionDetail.tabs.findings': '指摘',
  'sessionDetail.tabs.fileItems': 'ファイル項目',
  'sessionDetail.tabs.manifest': 'マニフェスト',

  'sessionDetail.findings.searchPlaceholder': '指摘を検索',
  'sessionDetail.findings.allCategories': 'すべてのカテゴリ',
  'sessionDetail.findings.count': '{count} 件の指摘 | {count} 件の指摘',
  'sessionDetail.findings.emptyFilteredTitle': '条件に一致する指摘はありません',
  'sessionDetail.findings.emptyFilteredText': '検索条件をクリアするか、別の重大度を選択してください。',
  'sessionDetail.findings.emptyTitle': 'このセッションに指摘はありません',
  'sessionDetail.findings.emptyText': '実行は完了しましたが、レビューコメントは記録されませんでした。',

  'sessionDetail.files.noFindings': '指摘なし',
  'sessionDetail.files.emptyTitle': 'ファイル項目がありません',
  'sessionDetail.files.emptyText': 'このセッションはファイル単位のチェックポイントを記録していません。',

  'sessionDetail.coverage.selected': '選択済み',
  'sessionDetail.coverage.completed': '完了',
  'sessionDetail.coverage.reused': '再利用',
  'sessionDetail.coverage.failed': '失敗',
  'sessionDetail.coverage.waived': '免除',

  'sessionDetail.manifest.terminalState': '終了状態',
  'sessionDetail.manifest.operation': '操作',
  'sessionDetail.manifest.runId': '実行 ID',
  'sessionDetail.manifest.parentRun': '親実行',
  'sessionDetail.manifest.elapsed': 'マニフェストの経過時間',
  'sessionDetail.manifest.rawJson': '生のマニフェスト JSON',
  'sessionDetail.manifest.emptyTitle': 'マニフェストが記録されていません',
  'sessionDetail.manifest.emptyText': 'これは実行マニフェスト導入前に作成された旧形式のセッションです。',

  'sessionDetail.severity.all': 'すべて',

  'sessionDetail.delete.title': 'セッションを削除',
  'sessionDetail.delete.text':
    '保存された JSONL セッションと、そのすべての指摘をディスクから削除します。この操作は元に戻せません。',
  'sessionDetail.delete.confirm': 'セッションを削除',

  'sessionDetail.notFound.title': 'セッションが見つかりません',
  'sessionDetail.notFound.text': 'このセッションは削除されたか、コンソールが再起動された可能性があります。',
  'sessionDetail.notFound.emptyTitle': '表示する内容がありません',
  'sessionDetail.notFound.emptyText': '履歴一覧から別のセッションを選択してください。',
  'sessionDetail.notFound.browse': 'セッション一覧を見る',

  'sessionDetail.actions.copied': 'セッション ID をコピーしました',
  'sessionDetail.actions.copyFailed': 'セッション ID をコピーできませんでした',
  'sessionDetail.actions.deleted': 'セッションを削除しました',
} satisfies Record<string, string>
