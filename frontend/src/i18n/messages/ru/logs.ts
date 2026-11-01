// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const logs = {
  'logs.header.title': 'Журнал активности',
  'logs.header.live': 'прямой поток',

  'logs.actions.follow': 'Следить',
  'logs.actions.following': 'Слежение',
  'logs.actions.copy': 'Копировать журнал',
  'logs.actions.copied': 'Журнал скопирован',
  'logs.actions.copyFailed': 'Не удалось скопировать журнал',
  'logs.actions.jumpToLatest': 'К последним строкам',

  'logs.empty.starting': 'Команда запускается, ожидание вывода…',
  'logs.empty.none': 'Для этого запуска вывод не записан.',

  'logs.footer.lineCount': '{count} строка | {count} строки | {count} строк',
  'logs.footer.trimmed': 'Старый вывод обрезан',
  'logs.footer.running': 'Команда выполняется',
  'logs.footer.complete': 'Вывод завершён',
} satisfies Record<string, string>;
