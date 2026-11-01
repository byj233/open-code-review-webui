// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessions = {
  'sessions.header.description':
    'Every review and scan is persisted as a JSONL session under ~/.opencodereview/sessions. Open one to inspect findings, coverage, and the run manifest.',

  'sessions.stat.findings': 'Findings',
  'sessions.stat.files': 'Files reviewed',
  'sessions.stat.average': 'Average findings',
  'sessions.stat.latest': 'Latest {when}',
  'sessions.stat.noHistory': 'No history yet',
  'sessions.stat.findingsHint': 'Across saved sessions',
  'sessions.stat.filesHint': 'Completed file items',
  'sessions.stat.averageHint': 'Per saved session',

  'sessions.toolbar.searchPlaceholder': 'Search id, model, branch, or ref',
  'sessions.toolbar.shown': '{count} shown',

  'sessions.filter.all': 'All',

  'sessions.table.started': 'Started',
  'sessions.table.model': 'Model',
  'sessions.table.scope': 'Branch / scope',
  'sessions.table.files': 'Files',
  'sessions.table.findings': 'Findings',
  'sessions.table.duration': 'Duration',

  'sessions.row.resumed': 'resumed',

  'sessions.scope.wholeRepository': 'whole repository',
  'sessions.scope.commit': 'commit {id}',
  'sessions.scope.commitOnly': 'commit',
  'sessions.scope.workingTree': 'working tree',

  'sessions.empty.noMatch': 'No sessions match',
  'sessions.empty.none': 'No sessions yet',
  'sessions.empty.noMatchHint': 'Try a different search term or status filter.',
  'sessions.empty.noneHint': 'Run a review or scan and its findings will be saved here.',
  'sessions.empty.runReview': 'Run a review',
  'sessions.empty.clearFilters': 'Clear filters',

  'sessions.footer.summary': '{count} sessions · page {page}',

  'sessions.delete.dialogTitle': 'Delete session',
  'sessions.delete.action': 'Delete session',
  'sessions.delete.description':
    'This removes the saved session and its findings from disk. The review itself is not affected, but the history cannot be recovered.',
  'sessions.delete.success': 'Session deleted',
} satisfies Record<string, string>;
