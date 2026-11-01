// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const logs = {
  'logs.header.title': 'アクティビティログ',
  'logs.header.live': 'ライブ',

  'logs.actions.follow': '追従',
  'logs.actions.following': '追従中',
  'logs.actions.copy': 'ログをコピー',
  'logs.actions.copied': 'ログをコピーしました',
  'logs.actions.copyFailed': 'ログをコピーできませんでした',
  'logs.actions.jumpToLatest': '最新へ移動',

  'logs.empty.starting': 'コマンドを開始し、出力を待っています…',
  'logs.empty.none': 'この実行では出力が記録されませんでした。',

  'logs.footer.lineCount': '{count} 行 | {count} 行',
  'logs.footer.trimmed': '古い出力は切り捨てられました',
  'logs.footer.running': 'コマンド実行中',
  'logs.footer.complete': '出力完了',
} satisfies Record<string, string>
