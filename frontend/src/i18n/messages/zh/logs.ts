// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const logs = {
  'logs.header.title': '活动日志',
  'logs.header.live': '实时',

  'logs.actions.follow': '跟随',
  'logs.actions.following': '跟随中',
  'logs.actions.copy': '复制日志',
  'logs.actions.copied': '日志已复制',
  'logs.actions.copyFailed': '无法复制日志',
  'logs.actions.jumpToLatest': '跳到最新',

  'logs.empty.starting': '正在启动命令，等待输出…',
  'logs.empty.none': '本次运行未记录任何输出。',

  'logs.footer.lineCount': '{count} 行 | {count} 行',
  'logs.footer.trimmed': '较早的输出已被截断',
  'logs.footer.running': '命令运行中',
  'logs.footer.complete': '输出已完成',
} satisfies Record<string, string>;
