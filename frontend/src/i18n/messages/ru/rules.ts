// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const rules = {
  'rules.header.eyebrow': 'Справочник',
  'rules.header.description':
    'Встроенные правила для языков определяют, на что обращает внимание модель. Правила проекта и глобальные правила могут их переопределять; на этой странице показан системный уровень, а путь проверяется по всем уровням.',
  'rules.header.reload': 'Обновить',

  'rules.list.title': 'Встроенные правила',
  'rules.list.subtitle': 'Шаблонов: {count} и резервный вариант по умолчанию',
  'rules.list.searchPlaceholder': 'Поиск по шаблонам или тексту правил',
  'rules.list.defaultTitle': 'Резервное правило по умолчанию',
  'rules.list.defaultHint': 'Используется, когда ни один шаблон не совпадает',
  'rules.list.emptyTitle': 'Нет подходящих правил',
  'rules.list.emptyDescription': 'Очистите поиск, чтобы увидеть все встроенные правила.',
  'rules.list.footer': 'Встроенных шаблонов: {count}',

  'rules.lookup.title': 'Какое правило применяется?',
  'rules.lookup.subtitle':
    'Проверка пути по пользовательскому, проектному, глобальному и системному уровням',
  'rules.lookup.placeholder': 'например, src/main/java/com/example/Foo.java',
  'rules.lookup.submit': 'Найти правило',
  'rules.lookup.hint': 'Используется тот же сопоставитель, что и в ревью. Запрос к модели не выполняется.',
  'rules.lookup.contentSniff': 'определение по содержимому: {value}',
  'rules.lookup.empty':
    'Введите путь к файлу относительно репозитория, чтобы увидеть, какое правило применит агент.',

  'rules.detail.copy': 'Копировать правило',
  'rules.detail.defaultTitle': 'Резервное правило по умолчанию',
  'rules.detail.defaultSubtitle': 'Применяется, когда ни один шаблон пути не совпадает',
  'rules.detail.patternSubtitle': 'Встроенный шаблон {pattern}',
  'rules.detail.genericTitle': 'Правило',
  'rules.detail.emptyTitle': 'Выберите правило',
  'rules.detail.emptyDescription': 'Выберите шаблон в списке, чтобы прочитать его рекомендации.',

  'rules.hint.braceExpanded': 'Раскрывается в несколько шаблонов путей',
  'rules.hint.projectManifest': 'Рекомендации по манифестам проекта',
  'rules.hint.xmlMapping': 'Рекомендации по XML-сопоставлению',
  'rules.hint.firstMatch': 'Срабатывает первый совпавший шаблон',

  'rules.source.custom': 'Пользовательское правило',
  'rules.source.project': 'Правило проекта',
  'rules.source.global': 'Глобальное правило',
  'rules.source.system': 'Встроенное системное правило',
  'rules.source.fallback': 'Правило',

  'rules.message.copied': 'Правило скопировано',
  'rules.message.copyFailed': 'Не удалось скопировать правило',
} satisfies Record<string, string>
