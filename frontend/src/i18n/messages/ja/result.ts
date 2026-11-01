// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const result = {
  'result.filters.all': 'すべて',

  'result.preview.filesChanged': '変更ファイル',
  'result.preview.willReview': 'レビュー予定',
  'result.preview.sentToModel': 'モデルに送信',
  'result.preview.excluded': '除外',
  'result.preview.filteredBeforeDispatch': '送信前に除外',
  'result.preview.filesInScope': '対象範囲のファイル',
  'result.preview.noTokensSpent': 'このプレビューの生成にモデルのトークンは消費されません。',
  'result.preview.filterPlaceholder': 'ファイルを絞り込み',
  'result.preview.willReviewRow': 'レビュー対象',
  'result.preview.noFilesMatch': '一致するファイルはありません',
  'result.preview.tryClearingFilter': 'フィルターを解除してみてください。',
  'result.preview.noReviewableChanges': 'この範囲にはレビュー可能な変更がありません。',

  'result.review.filesReviewed': 'レビュー済みファイル',
  'result.review.coverageNotRecorded': 'カバレッジ未記録',
  'result.review.coverageSelected': '{completed} / {selected} 件完了',
  'result.review.findings': '指摘',
  'result.review.severityHint': '緊急 {critical} · 高 {high}',
  'result.review.tokens': 'トークン',
  'result.review.tokenHint': '入力 {input} · 出力 {output}',
  'result.review.elapsed': '経過時間',
  'result.review.modelNotRecorded': 'モデル未記録',
  'result.review.warningCount': '警告 {count} 件 | 警告 {count} 件',

  'result.findings.showing': '{shown} / {total} 件を表示',
  'result.findings.filterPlaceholder': '指摘を絞り込み',
  'result.findings.allCategories': 'すべてのカテゴリ',
  'result.findings.noMatchesTitle': '条件に一致する指摘はありません',
  'result.findings.noMatchesText': '検索条件をクリアするか、別の重大度を選択してください。',
  'result.findings.emptyTitle': '指摘はありません。問題なさそうです。',
  'result.findings.emptyText': 'レビューは完了しましたが、選択したファイルへの指摘はありませんでした。',
  'result.findings.fileCount': '{count} 件の指摘 | {count} 件の指摘',

  'result.projectSummary.title': 'プロジェクト概要',
  'result.projectSummary.subtitle': 'スキャンの概要生成フェーズで作成されます',

  'result.coverage.title': 'カバレッジ',
  'result.coverage.subtitle': 'この実行が対象とした範囲の固定マニフェスト',
  'result.coverage.selected': '選択済み',
  'result.coverage.completed': '完了',
  'result.coverage.reused': '再利用',
  'result.coverage.failed': '失敗',
  'result.coverage.waived': '免除',
  'result.coverage.runFailure': '実行失敗',

  'result.empty.title': '構造化された結果がありません',
  'result.empty.description':
    'このコマンドは JSON ドキュメントを返しませんでした。出力はアクティビティログを確認してください。',
} satisfies Record<string, string>
