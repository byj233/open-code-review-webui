// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const overview = {
  'overview.hero.eyebrow': 'Обзор рабочей области',
  'overview.hero.headlineReview': 'Перейдём к ревью кода.',
  'overview.hero.headlineNoRepo': 'Укажите консоли репозиторий.',
  'overview.hero.descriptionLead':
    'Ревью диффа, сканирование всего репозитория и возврат к каждому замечанию. Консоль запускает те же ',
  'overview.hero.descriptionTail': ' команды, что и ваш терминал.',
  'overview.hero.changed': '{count} изменено',
  'overview.hero.scanRepo': 'Сканировать репозиторий',
  'overview.hero.branchNotGit': 'не Git-репозиторий',

  'overview.greeting.workingLate': 'Работаете допоздна',
  'overview.greeting.morning': 'Доброе утро',
  'overview.greeting.afternoon': 'Добрый день',
  'overview.greeting.evening': 'Добрый вечер',

  'overview.notGit.title': 'Эта папка — не Git-репозиторий.',
  'overview.notGit.bodyLead':
    'Для ревью кода и сканирования нужна история Git. Запустите консоль из репозитория или сначала выполните ',
  'overview.notGit.bodyTail': ' здесь.',

  'overview.model.connectTitle': 'Подключите модель, чтобы начать ревью.',
  'overview.model.connectBody':
    'Добавьте API-ключ провайдера или укажите консоли эндпоинт, совместимый с OpenAI.',
  'overview.model.chooseProvider': 'Выбрать провайдера',
  'overview.model.title': 'Модель',
  'overview.model.subtitle': 'Определена по конфигурации, окружению и настройкам провайдера',
  'overview.model.manage': 'Управление',
  'overview.model.noProvider': 'Провайдер не настроен',
  'overview.model.selectModel': 'Выберите модель, чтобы начать',
  'overview.model.auth': 'Авторизация',
  'overview.model.source': 'Источник',
  'overview.model.endpoint': 'Эндпоинт',
  'overview.model.test': 'Проверить подключение',
  'overview.model.reviewSettings': 'Настройки ревью',

  'overview.quick.reviewTitle': 'Ревью изменений',
  'overview.quick.reviewDesc': 'Рабочее дерево, коммит или диапазон веток',
  'overview.quick.scanTitle': 'Сканировать кодовую базу',
  'overview.quick.scanDesc': 'Ревью целых файлов без диффа',
  'overview.quick.modelsTitle': 'Модель и провайдеры',
  'overview.quick.connectTitle': 'Подключить модель',
  'overview.quick.manageModels': 'Управление моделями',
  'overview.quick.providerDesc': 'API-ключ, переменная окружения или собственный эндпоинт',

  'overview.stats.changedFiles': 'Изменённые файлы',
  'overview.stats.savedSessions': 'Сохранённые сеансы',
  'overview.stats.findingsRecorded': 'Зафиксированные замечания',
  'overview.stats.activeModel': 'Активная модель',
  'overview.stats.notSet': 'Не задано',
  'overview.stats.gitRequired': 'Для ревью нужен Git',
  'overview.stats.dirtySummary': '{staged} в индексе · {unstaged} вне индекса · {untracked} не отслеживается',
  'overview.stats.noHistory': 'Истории пока нет',
  'overview.stats.latest': 'Последний: {time}',
  'overview.stats.acrossSessions': 'По всем сохранённым сеансам',
  'overview.stats.latestFindings': '{count} в последнем сеансе',
  'overview.stats.modelMissing': 'Модель не настроена',

  'overview.sessions.title': 'Недавние сеансы',
  'overview.sessions.subtitle': 'Замечания сохраняются в ~/.opencodereview/sessions',
  'overview.sessions.viewAll': 'Показать все',
  'overview.sessions.modelUnknown': 'модель не записана',
  'overview.sessions.findings': '{count} замечание | {count} замечания | {count} замечаний',
  'overview.sessions.files': '{completed}/{selected} файл | {completed}/{selected} файла | {completed}/{selected} файлов',
  'overview.sessions.total': 'всего {count} сеанс | всего {count} сеанса | всего {count} сеансов',
  'overview.sessions.emptyTitle': 'Сеансов пока нет',
  'overview.sessions.emptyDesc':
    'Здесь появится ваше первое ревью, а каждое замечание будет сохранено на диск.',
  'overview.sessions.run': 'Запустить ревью',
  'overview.sessions.browse': 'Открыть историю',
  'overview.sessions.emptyHistory': 'История начинается с первого запуска',
  'overview.sessions.noRepo': 'нет репозитория',

  'overview.workspace.repoStatus': 'Состояние репозитория',
  'overview.workspace.staged': 'Проиндексированные',
  'overview.workspace.unstaged': 'Не проиндексированные',
  'overview.workspace.untracked': 'Неотслеживаемые',
  'overview.workspace.upstream': 'Upstream',
  'overview.workspace.recentCommits': 'Последние коммиты',
  'overview.workspace.noCommits': 'Коммитов пока нет.',
  'overview.workspace.emptyDesc':
    'Откройте консоль из Git-репозитория, чтобы делать ревью диффов и сохранять историю.',

  'overview.activity.title': 'Последняя активность',
  'overview.activity.subtitle': 'Команды, запущенные из этой консоли',
} satisfies Record<string, string>;
