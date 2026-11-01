// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const result = {
  'result.filters.all': 'All',

  'result.preview.filesChanged': 'Files changed',
  'result.preview.willReview': 'Will review',
  'result.preview.sentToModel': 'sent to the model',
  'result.preview.excluded': 'Excluded',
  'result.preview.filteredBeforeDispatch': 'filtered before dispatch',
  'result.preview.filesInScope': 'Files in scope',
  'result.preview.noTokensSpent': 'No model tokens were spent generating this preview.',
  'result.preview.filterPlaceholder': 'Filter files',
  'result.preview.willReviewRow': 'will review',
  'result.preview.noFilesMatch': 'No files match',
  'result.preview.tryClearingFilter': 'Try clearing the filter.',
  'result.preview.noReviewableChanges': 'No reviewable changes were found for this scope.',

  'result.review.filesReviewed': 'Files reviewed',
  'result.review.coverageNotRecorded': 'coverage not recorded',
  'result.review.coverageSelected': '{completed} of {selected} selected',
  'result.review.findings': 'Findings',
  'result.review.severityHint': '{critical} critical · {high} high',
  'result.review.tokens': 'Tokens',
  'result.review.tokenHint': '{input} in · {output} out',
  'result.review.elapsed': 'Elapsed',
  'result.review.modelNotRecorded': 'model not recorded',
  'result.review.warningCount': '{count} warning | {count} warnings',

  'result.findings.showing': '{shown} of {total} shown',
  'result.findings.filterPlaceholder': 'Filter findings',
  'result.findings.allCategories': 'All categories',
  'result.findings.noMatchesTitle': 'Nothing matches these filters',
  'result.findings.noMatchesText': 'Clear the search or choose a different severity.',
  'result.findings.emptyTitle': 'No findings. Looks good to me.',
  'result.findings.emptyText': 'The review completed without reporting a comment for the selected files.',
  'result.findings.fileCount': '{count} finding | {count} findings',

  'result.projectSummary.title': 'Project summary',
  'result.projectSummary.subtitle': "Written by the scan's summary pass",

  'result.coverage.title': 'Coverage',
  'result.coverage.subtitle': 'Frozen manifest of what this run covered',
  'result.coverage.selected': 'selected',
  'result.coverage.completed': 'completed',
  'result.coverage.reused': 'reused',
  'result.coverage.failed': 'failed',
  'result.coverage.waived': 'waived',
  'result.coverage.runFailure': 'Run failure',

  'result.empty.title': 'No structured result',
  'result.empty.description':
    'This command did not return a JSON document. Check the activity log for its output.',
} satisfies Record<string, string>;
