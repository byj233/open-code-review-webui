// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessions = {
  'sessions.header.description':
    'Каждое ревью и сканирование сохраняется как сеанс JSONL в ~/.opencodereview/sessions. Откройте сеанс, чтобы просмотреть замечания, покрытие и манифест запуска.',

  'sessions.stat.findings': 'Замечания',
  'sessions.stat.files': 'Проверено файлов',
  'sessions.stat.average': 'В среднем замечаний',
  'sessions.stat.latest': 'Последний: {when}',
  'sessions.stat.noHistory': 'Истории пока нет',
  'sessions.stat.findingsHint': 'По всем сохранённым сеансам',
  'sessions.stat.filesHint': 'Завершённые элементы по файлам',
  'sessions.stat.averageHint': 'На сохранённый сеанс',

  'sessions.toolbar.searchPlaceholder': 'Поиск по идентификатору, модели, ветке или ссылке',
  'sessions.toolbar.shown': 'Показано {count}',

  'sessions.filter.all': 'Все',

  'sessions.table.started': 'Начало',
  'sessions.table.model': 'Модель',
  'sessions.table.scope': 'Ветка / область',
  'sessions.table.files': 'Файлы',
  'sessions.table.findings': 'Замечания',
  'sessions.table.duration': 'Длительность',

  'sessions.row.resumed': 'возобновлён',

  'sessions.scope.wholeRepository': 'весь репозиторий',
  'sessions.scope.commit': 'коммит {id}',
  'sessions.scope.commitOnly': 'коммит',
  'sessions.scope.workingTree': 'рабочее дерево',

  'sessions.empty.noMatch': 'Нет подходящих сеансов',
  'sessions.empty.none': 'Сеансов пока нет',
  'sessions.empty.noMatchHint': 'Попробуйте другой запрос или фильтр по статусу.',
  'sessions.empty.noneHint': 'Запустите ревью или сканирование — замечания сохранятся здесь.',
  'sessions.empty.runReview': 'Запустить ревью',
  'sessions.empty.clearFilters': 'Сбросить фильтры',

  'sessions.footer.summary': 'Сеансов: {count} · страница {page}',

  'sessions.delete.dialogTitle': 'Удалить сеанс',
  'sessions.delete.action': 'Удалить сеанс',
  'sessions.delete.description':
    'Сохранённый сеанс и его замечания будут удалены с диска. Само ревью не затрагивается, но историю восстановить не удастся.',
  'sessions.delete.success': 'Сеанс удалён',
} satisfies Record<string, string>
