// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessionDetail = {
  'sessionDetail.header.back': 'Назад к сеансам',
  'sessionDetail.header.aborted': 'прерван',
  'sessionDetail.header.started': 'Начат {date}',
  'sessionDetail.header.took': 'занял {duration}',
  'sessionDetail.header.withModel': 'с моделью {model}',
  'sessionDetail.header.description': '{parts}.',

  'sessionDetail.callouts.interrupted':
    'Этот сеанс был прерван до завершения. Замечания, сохранённые до прерывания, по-прежнему доступны.',
  'sessionDetail.callouts.failureTitle': '{classification}.',
  'sessionDetail.callouts.failureFallback': 'Сбой запуска',
  'sessionDetail.callouts.failureReason': 'В манифесте зафиксирован сбой на уровне запуска.',

  'sessionDetail.actions.resume': 'Возобновить',
  'sessionDetail.actions.resumeTooltip': 'Продолжить это ревью в новом запуске',
  'sessionDetail.actions.resumeDisabled':
    'Возобновление доступно только для сеансов коммита и диапазона веток',
  'sessionDetail.actions.copyId': 'Копировать идентификатор',

  'sessionDetail.stats.findings': 'Замечания',
  'sessionDetail.stats.filesReviewed': 'Проверено файлов',
  'sessionDetail.stats.reusedWaived': '{reused} переиспользовано · {waived} пропущено',
  'sessionDetail.stats.failedFiles': 'Файлы с ошибками',
  'sessionDetail.stats.seeCoverage': 'См. покрытие ниже',
  'sessionDetail.stats.noFileFailures': 'Ошибок на уровне файлов нет',
  'sessionDetail.stats.duration': 'Длительность',
  'sessionDetail.stats.severityHint':
    'критичных: {critical} · высоких: {high} · средних: {medium}',

  'sessionDetail.tabs.findings': 'Замечания',
  'sessionDetail.tabs.fileItems': 'Элементы по файлам',
  'sessionDetail.tabs.manifest': 'Манифест',

  'sessionDetail.findings.searchPlaceholder': 'Поиск замечаний',
  'sessionDetail.findings.allCategories': 'Все категории',
  'sessionDetail.findings.count.one': '{count} замечание',
  'sessionDetail.findings.count.few': '{count} замечания',
  'sessionDetail.findings.count.many': '{count} замечаний',
  'sessionDetail.findings.count.other': '{count} замечаний',
  'sessionDetail.findings.emptyFilteredTitle': 'Ничего не найдено по этим фильтрам',
  'sessionDetail.findings.emptyFilteredText': 'Очистите поиск или выберите другую важность.',
  'sessionDetail.findings.emptyTitle': 'В этом сеансе нет замечаний',
  'sessionDetail.findings.emptyText':
    'Запуск завершился, не сохранив ни одного комментария ревью.',

  'sessionDetail.files.noFindings': 'замечаний нет',
  'sessionDetail.files.emptyTitle': 'Элементов по файлам нет',
  'sessionDetail.files.emptyText': 'Сеанс не сохранил контрольные точки по файлам.',

  'sessionDetail.coverage.selected': 'выбрано',
  'sessionDetail.coverage.completed': 'завершено',
  'sessionDetail.coverage.reused': 'переиспользовано',
  'sessionDetail.coverage.failed': 'сбой',
  'sessionDetail.coverage.waived': 'пропущено',

  'sessionDetail.manifest.terminalState': 'Конечное состояние',
  'sessionDetail.manifest.operation': 'Операция',
  'sessionDetail.manifest.runId': 'Идентификатор запуска',
  'sessionDetail.manifest.parentRun': 'Родительский запуск',
  'sessionDetail.manifest.elapsed': 'Длительность по манифесту',
  'sessionDetail.manifest.rawJson': 'Исходный JSON манифеста',
  'sessionDetail.manifest.emptyTitle': 'Манифест не записан',
  'sessionDetail.manifest.emptyText':
    'Это устаревший сеанс, созданный до появления манифестов запусков.',

  'sessionDetail.severity.all': 'Все',

  'sessionDetail.delete.title': 'Удалить сеанс',
  'sessionDetail.delete.text':
    'Сохранённый сеанс JSONL и все его замечания будут удалены с диска. Действие нельзя отменить.',
  'sessionDetail.delete.confirm': 'Удалить сеанс',

  'sessionDetail.notFound.title': 'Сеанс не найден',
  'sessionDetail.notFound.text': 'Возможно, сеанс был удалён или консоль была перезапущена.',
  'sessionDetail.notFound.emptyTitle': 'Нечего показать',
  'sessionDetail.notFound.emptyText': 'Выберите другой сеанс в списке истории.',
  'sessionDetail.notFound.browse': 'Перейти к сеансам',

  'sessionDetail.actions.copied': 'Идентификатор сеанса скопирован',
  'sessionDetail.actions.copyFailed': 'Не удалось скопировать идентификатор сеанса',
  'sessionDetail.actions.deleted': 'Сеанс удалён',
} satisfies Record<string, string>
