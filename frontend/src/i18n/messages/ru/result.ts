// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const result = {
  'result.filters.all': 'Все',

  'result.preview.filesChanged': 'Изменённые файлы',
  'result.preview.willReview': 'В ревью',
  'result.preview.sentToModel': 'отправлено модели',
  'result.preview.excluded': 'Исключено',
  'result.preview.filteredBeforeDispatch': 'отфильтровано до отправки',
  'result.preview.filesInScope': 'Файлы в области',
  'result.preview.noTokensSpent':
    'При создании этого предпросмотра токены модели не расходовались.',
  'result.preview.filterPlaceholder': 'Фильтровать файлы',
  'result.preview.willReviewRow': 'в ревью',
  'result.preview.noFilesMatch': 'Нет подходящих файлов',
  'result.preview.tryClearingFilter': 'Попробуйте очистить фильтр.',
  'result.preview.noReviewableChanges': 'В этой области не найдено изменений для ревью.',

  'result.review.filesReviewed': 'Проверено файлов',
  'result.review.coverageNotRecorded': 'покрытие не записано',
  'result.review.coverageSelected': '{completed} из {selected} выбранных',
  'result.review.findings': 'Замечания',
  'result.review.severityHint': 'критичных: {critical} · высоких: {high}',
  'result.review.tokens': 'Токены',
  'result.review.tokenHint': '{input} на входе · {output} на выходе',
  'result.review.elapsed': 'Длительность',
  'result.review.modelNotRecorded': 'модель не записана',
  'result.review.warningCount': '{count} предупреждение | {count} предупреждения | {count} предупреждений',

  'result.findings.showing': 'Показано {shown} из {total}',
  'result.findings.filterPlaceholder': 'Фильтровать замечания',
  'result.findings.allCategories': 'Все категории',
  'result.findings.noMatchesTitle': 'Ничего не найдено по этим фильтрам',
  'result.findings.noMatchesText': 'Очистите поиск или выберите другую важность.',
  'result.findings.emptyTitle': 'Замечаний нет. Выглядит хорошо.',
  'result.findings.emptyText':
    'Ревью завершилось, не сообщив ни одного комментария по выбранным файлам.',
  'result.findings.fileCount': '{count} замечание | {count} замечания | {count} замечаний',

  'result.projectSummary.title': 'Сводка по проекту',
  'result.projectSummary.subtitle': 'Создано на этапе сводки при сканировании',

  'result.coverage.title': 'Покрытие',
  'result.coverage.subtitle': 'Зафиксированный манифест охвата этого запуска',
  'result.coverage.selected': 'выбрано',
  'result.coverage.completed': 'завершено',
  'result.coverage.reused': 'переиспользовано',
  'result.coverage.failed': 'сбой',
  'result.coverage.waived': 'пропущено',
  'result.coverage.runFailure': 'Сбой запуска',

  'result.empty.title': 'Нет структурированного результата',
  'result.empty.description':
    'Команда не вернула документ JSON. Вывод — в журнале активности.',
} satisfies Record<string, string>;
