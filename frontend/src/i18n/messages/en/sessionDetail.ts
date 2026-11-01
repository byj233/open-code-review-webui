// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessionDetail = {
  'sessionDetail.header.back': 'Back to sessions',
  'sessionDetail.header.aborted': 'aborted',
  'sessionDetail.header.started': 'Started {date}',
  'sessionDetail.header.took': 'took {duration}',
  'sessionDetail.header.withModel': 'with {model}',
  'sessionDetail.header.description': '{parts}.',

  'sessionDetail.callouts.interrupted':
    'This session was interrupted before it completed. Any findings saved before the interruption are still available.',
  'sessionDetail.callouts.failureTitle': '{classification}.',
  'sessionDetail.callouts.failureFallback': 'Run failed',
  'sessionDetail.callouts.failureReason': 'The manifest recorded a run-level failure.',

  'sessionDetail.actions.resume': 'Resume',
  'sessionDetail.actions.resumeTooltip': 'Continue this review in a new run',
  'sessionDetail.actions.resumeDisabled': 'Only commit and range sessions can be resumed',
  'sessionDetail.actions.copyId': 'Copy id',

  'sessionDetail.stats.findings': 'Findings',
  'sessionDetail.stats.filesReviewed': 'Files reviewed',
  'sessionDetail.stats.reusedWaived': '{reused} reused · {waived} waived',
  'sessionDetail.stats.failedFiles': 'Failed files',
  'sessionDetail.stats.seeCoverage': 'See coverage below',
  'sessionDetail.stats.noFileFailures': 'No file-level failures',
  'sessionDetail.stats.duration': 'Duration',
  'sessionDetail.stats.severityHint': '{critical} critical · {high} high · {medium} medium',

  'sessionDetail.tabs.findings': 'Findings',
  'sessionDetail.tabs.fileItems': 'File items',
  'sessionDetail.tabs.manifest': 'Manifest',

  'sessionDetail.findings.searchPlaceholder': 'Search findings',
  'sessionDetail.findings.allCategories': 'All categories',
  'sessionDetail.findings.count': '{count} finding | {count} findings',
  'sessionDetail.findings.emptyFilteredTitle': 'Nothing matches these filters',
  'sessionDetail.findings.emptyFilteredText': 'Clear the search or choose a different severity.',
  'sessionDetail.findings.emptyTitle': 'No findings in this session',
  'sessionDetail.findings.emptyText': 'The run completed without recording a review comment.',

  'sessionDetail.files.noFindings': 'no findings',
  'sessionDetail.files.emptyTitle': 'No file items',
  'sessionDetail.files.emptyText': 'This session did not record per-file checkpoints.',

  'sessionDetail.coverage.selected': 'selected',
  'sessionDetail.coverage.completed': 'completed',
  'sessionDetail.coverage.reused': 'reused',
  'sessionDetail.coverage.failed': 'failed',
  'sessionDetail.coverage.waived': 'waived',

  'sessionDetail.manifest.terminalState': 'Terminal state',
  'sessionDetail.manifest.operation': 'Operation',
  'sessionDetail.manifest.runId': 'Run id',
  'sessionDetail.manifest.parentRun': 'Parent run',
  'sessionDetail.manifest.elapsed': 'Manifest elapsed',
  'sessionDetail.manifest.rawJson': 'Raw manifest JSON',
  'sessionDetail.manifest.emptyTitle': 'No manifest recorded',
  'sessionDetail.manifest.emptyText': 'This is a legacy session created before run manifests were introduced.',

  'sessionDetail.severity.all': 'All',

  'sessionDetail.delete.title': 'Delete session',
  'sessionDetail.delete.text':
    'This removes the saved JSONL session and all of its findings from disk. The action cannot be undone.',
  'sessionDetail.delete.confirm': 'Delete session',

  'sessionDetail.notFound.title': 'Session not found',
  'sessionDetail.notFound.text': 'The session may have been deleted or the console was restarted.',
  'sessionDetail.notFound.emptyTitle': 'Nothing to show',
  'sessionDetail.notFound.emptyText': 'Pick another session from the history list.',
  'sessionDetail.notFound.browse': 'Browse sessions',

  'sessionDetail.actions.copied': 'Session id copied',
  'sessionDetail.actions.copyFailed': 'Could not copy the session id',
  'sessionDetail.actions.deleted': 'Session deleted',
} satisfies Record<string, string>;
