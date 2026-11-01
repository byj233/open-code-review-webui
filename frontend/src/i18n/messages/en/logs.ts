// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const logs = {
  'logs.header.title': 'Activity log',
  'logs.header.live': 'live',

  'logs.actions.follow': 'Follow',
  'logs.actions.following': 'Following',
  'logs.actions.copy': 'Copy log',
  'logs.actions.copied': 'Log copied',
  'logs.actions.copyFailed': 'Could not copy the log',
  'logs.actions.jumpToLatest': 'Jump to latest',

  'logs.empty.starting': 'Starting the command, waiting for output…',
  'logs.empty.none': 'No output was recorded for this run.',

  'logs.footer.lineCount': '{count} line | {count} lines',
  'logs.footer.trimmed': 'Older output was trimmed',
  'logs.footer.running': 'Command running',
  'logs.footer.complete': 'Output complete',
} satisfies Record<string, string>
