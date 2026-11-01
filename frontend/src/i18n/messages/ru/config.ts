// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const config = {
  'config.page.description':
    'Параметры ревью по умолчанию, настройки устаревшей конечной точки, телеметрия и серверы MCP. Запись идёт через команду ocr config, поэтому CLI и эта консоль не расходятся.',
  'config.actions.reload': 'Обновить',
  'config.actions.manageProviders': 'Управление провайдерами',
  'config.common.unsavedChanges': 'Несохранённые изменения',

  'config.model.title': 'Модель и параметры ревью по умолчанию',
  'config.model.subtitle': 'Эти значения применяются ко всем ревью и сканированиям, если не переопределены для запуска.',
  'config.model.noProvider': 'Провайдер не настроен',
  'config.model.noModel': 'Модель не выбрана',
  'config.model.change': 'Изменить',
  'config.model.modelLabel': 'Модель',
  'config.model.modelPlaceholder': 'Использовать модель, заданную у провайдера',
  'config.model.modelHint':
    'Записывается в настройки активного провайдера. Пустое значение приведёт к явной ошибке запуска вместо догадок.',
  'config.model.effortLabel': 'Глубина ревью',
  'config.model.effortDefault': 'По умолчанию (средняя)',
  'config.model.effortLow': 'Низкая — один раунд',
  'config.model.effortMedium': 'Средняя — два раунда',
  'config.model.effortHigh': 'Высокая — три раунда',
  'config.model.effortHint': 'Определяет, сколько раундов ревью получает каждая группа файлов.',
  'config.model.maxTokensLabel': 'Максимум токенов на группу',
  'config.model.maxTokensHint': '0 сбрасывает настройку и использует значение по умолчанию из встроенного шаблона.',
  'config.model.languageLabel': 'Язык вывода',
  'config.model.languagePlaceholder': 'English',
  'config.model.languageHint': 'Язык, на котором модель должна писать комментарии ревью.',
  'config.model.save': 'Сохранить значения по умолчанию',

  'config.legacy.title': 'Устаревшая конечная точка (llm.*)',
  'config.legacy.subtitle':
    'Единая конечная точка, совместимая с OpenAI или Anthropic, без пресета провайдера.',
  // The edge spaces keep the inline `llm.*` code span spaced in the template.
  'config.legacy.overrideBefore': 'Активный провайдер переопределяет ',
  'config.legacy.overrideAfter':
    ' настройки. Удалите активного провайдера на странице «Провайдеры», прежде чем полагаться на эту конечную точку.',
  'config.legacy.urlLabel': 'URL конечной точки',
  'config.legacy.modelLabel': 'Модель',
  'config.legacy.modelPlaceholder': 'gpt-5.4 или claude-sonnet-4-6',
  'config.legacy.protocolLabel': 'Протокол',
  'config.legacy.protocolAnthropic': 'Anthropic messages',
  'config.legacy.protocolOpenaiChat': 'OpenAI chat completions',
  'config.legacy.protocolOpenaiResponses': 'OpenAI responses',
  'config.legacy.timeoutLabel': 'Тайм-аут запроса (секунды)',
  'config.legacy.timeoutHint': '0 — используется значение клиента по умолчанию.',
  'config.legacy.authTokenLabel': 'Токен авторизации',
  'config.legacy.authTokenPlaceholderStored': 'Сохранённый токен есть — вставьте новый, чтобы заменить',
  'config.legacy.authTokenPlaceholder': 'Вставьте токен авторизации',
  'config.legacy.authTokenHint': 'Сохранённые токены никогда не возвращаются в браузер.',
  'config.legacy.authTokenCmdLabel': 'Команда получения токена',
  'config.legacy.authTokenCmdHint': 'Выполняется, только если статический токен не сохранён.',
  'config.legacy.clearToken': 'Удалить сохранённый токен',
  'config.legacy.save': 'Сохранить конечную точку',
  'config.legacy.clearTokenTitle': 'Удаление токена авторизации',
  'config.legacy.clearTokenConfirm':
    'Удалить сохранённый llm.auth_token? Конечная точка перестанет работать, если токен не будет передаваться командой или переменной окружения.',
  'config.legacy.clearTokenConfirmButton': 'Удалить токен',

  'config.telemetry.title': 'Телеметрия',
  'config.telemetry.subtitle':
    'По умолчанию выключена. Логирование содержимого имеет смысл только при включённой телеметрии.',
  'config.telemetry.enableTitle': 'Включить телеметрию',
  'config.telemetry.enableText': 'Экспортировать трассировки и метрики запусков ревью.',
  'config.telemetry.exporterLabel': 'Экспортёр',
  'config.telemetry.exporterPlaceholder': 'По умолчанию',
  'config.telemetry.exporterConsole': 'Консоль',
  'config.telemetry.exporterOtlp': 'OTLP',
  'config.telemetry.otlpLabel': 'Конечная точка OTLP',
  'config.telemetry.contentTitle': 'Включать содержимое',
  'config.telemetry.contentText':
    'Добавлять в телеметрию запросы и ответы. Они могут содержать исходный код.',
  'config.telemetry.save': 'Сохранить телеметрию',

  'config.file.title': 'Файл конфигурации',
  'config.file.subtitle': 'CLI остаётся источником истины',
  'config.file.loading': 'Загрузка…',
  'config.file.exists': 'Файл существует',
  'config.file.notCreated': 'Ещё не создан',
  'config.file.parseError': 'ошибка разбора',
  'config.file.parseFailed': 'Не удалось разобрать файл конфигурации: {error}',
  // The edge spaces keep the inline `ocr config set` and `ocr config unset` spans spaced.
  'config.file.noteBefore': 'Каждое сохранение выполняет ',
  'config.file.noteBetween': ' или ',
  'config.file.noteAfter': ', сохраняя неизвестные поля и структуру провайдера.',
  'config.file.copyPath': 'Копировать путь',
  'config.file.copied': 'Путь к файлу конфигурации скопирован',
  'config.file.copyFailed': 'Не удалось скопировать путь к файлу конфигурации',

  'config.mcp.title': 'Серверы MCP',
  'config.mcp.configuredCount': '{count} настроено',
  'config.mcp.noCommand': 'без команды',
  'config.mcp.removeServer': 'Удалить сервер MCP',
  'config.mcp.removeConfirm': 'Удалить сервер MCP «{name}» из конфигурации?',
  'config.mcp.removeButton': 'Удалить',
  'config.mcp.emptyTitle': 'Нет серверов MCP',
  'config.mcp.emptyDescription':
    'Серверы MCP настраиваются командой ocr config set mcp_servers.<name> в терминале.',

  'config.secrets.title': 'О секретах',
  // The edge spaces keep the inline `*_cmd` code span spaced in the template.
  'config.secrets.textBefore':
    'API-ключи и токены авторизации записываются один раз и никогда не возвращаются на эту страницу. Предпочитайте ',
  'config.secrets.textAfter': ' настройки, если вы используете менеджер секретов.',

  'config.toast.saved': 'Настройки сохранены',
  'config.toast.savedPrefix': 'Сохранено: ',
} satisfies Record<string, string>;
