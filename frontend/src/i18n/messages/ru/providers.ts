// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const providers = {
  'providers.page.description':
    'Выберите модель, которая проверяет ваш код. Ключи хранятся в ~/.opencodereview/config.json и никогда не возвращаются на эту страницу.',
  'providers.actions.customProvider': 'Собственный провайдер',
  'providers.actions.testConnection': 'Проверить подключение',

  'providers.banner.active': 'Активный провайдер',
  'providers.banner.noModelConfigured': 'Модель не настроена',
  'providers.banner.choose': 'Выберите провайдера ниже',
  'providers.banner.noModel': 'Модель не выбрана',
  'providers.banner.changeModel': 'Сменить модель',
  'providers.banner.openSettings': 'Открыть настройки',

  'providers.toolbar.searchPlaceholder': 'Поиск провайдеров, моделей и переменных окружения',
  'providers.toolbar.configuredOnly': 'Только настроенные',
  'providers.toolbar.configuredCount': '{configured} из {total} настроено',

  'providers.builtin.title': 'Встроенные провайдеры',
  'providers.builtin.subtitle': 'Пресеты уже включают эндпоинт, протокол и рекомендованные модели.',
  'providers.builtin.emptyTitle': 'Подходящих встроенных провайдеров нет',
  'providers.builtin.emptyDescription': 'Очистите поиск или отключите фильтр «Только настроенные».',

  'providers.card.active': 'Активный',
  'providers.card.noModelsYet': 'Моделей пока нет',
  'providers.card.modelListNotPreset': 'Список моделей не задан',
  'providers.card.configure': 'Настроить',
  'providers.card.use': 'Использовать',
  'providers.card.setUp': 'Подключить',

  'providers.custom.title': 'Собственные провайдеры',
  'providers.custom.subtitle': 'Любой эндпоинт, совместимый с OpenAI или Anthropic.',
  'providers.custom.addTitle': 'Добавить собственного провайдера',
  'providers.custom.addText': 'Шлюз, локальный прокси или частный эндпоинт, совместимый с OpenAI.',

  'providers.dialog.titleAdd': 'Добавление собственного провайдера',
  'providers.dialog.titleActive': 'Настройка активного провайдера',
  'providers.dialog.titleNamed': 'Настройка {name}',
  'providers.dialog.titleFallback': 'Настройка провайдера',
  'providers.dialog.introNew':
    'Укажите консоли эндпоинт, который вы контролируете. Протокол и URL сохраняются в custom_providers.',
  'providers.dialog.introActive':
    'Новая модель сохраняется для активного провайдера. Сохранённые ключи остаются, пока вы не вставите новый.',
  'providers.dialog.introDefault':
    'Выберите модель для этого провайдера, затем включите её для запусков ревью и сканирования.',
  'providers.dialog.currentlyActive': 'Этот провайдер сейчас активен.',
  'providers.dialog.nameLabel': 'Имя провайдера',
  'providers.dialog.nameHint': 'Буквы, цифры, точки и дефисы. Используется в ключах конфигурации.',
  'providers.dialog.modelLabel': 'Модель',
  'providers.dialog.modelPlaceholder': 'Выберите или введите ID модели',
  'providers.dialog.urlLabel': 'URL эндпоинта',
  'providers.dialog.protocolLabel': 'Протокол',
  'providers.dialog.apiKeyLabel': 'API-ключ',
  'providers.dialog.keyStoredPlaceholder': 'Ключ сохранён — вставьте новый, чтобы заменить',
  'providers.dialog.keyPlaceholder': 'Вставьте API-ключ',
  'providers.dialog.keyOptionalHint': 'Необязательно на этом шаге; можно добавить позже.',
  'providers.dialog.keyKeepHint':
    'Оставьте пустым, чтобы сохранить текущий ключ. Ключи никогда не показываются в этой консоли.',
  'providers.dialog.ambientAuthNote':
    'Этот провайдер аутентифицируется через цепочку учётных данных AWS из окружения. При необходимости укажите регион и профиль AWS в разделе «Настройки».',
  // The edge spaces keep the inline `ocr auth login` code span spaced in the template.
  'providers.dialog.signInBefore': 'Этот провайдер использует интерактивный вход. Выполните ',
  'providers.dialog.signInAfter': ' в терминале, затем вернитесь сюда.',
  'providers.dialog.add': 'Добавить провайдера',
  'providers.dialog.saveModel': 'Сохранить модель',
  'providers.dialog.useProvider': 'Использовать провайдера',

  'providers.protocol.anthropicMessages': 'Anthropic messages',
  'providers.protocol.openaiChat': 'OpenAI chat completions',
  'providers.protocol.openaiResponses': 'OpenAI responses',
  'providers.protocol.openaiCompatible': 'OpenAI-совместимый',
  'providers.protocol.bedrock': 'AWS Bedrock',
  'providers.protocol.notSet': 'Протокол не задан',

  'providers.validation.modelRequired': 'Выберите модель для этого провайдера.',
  'providers.validation.urlRequired': 'Укажите URL эндпоинта.',
  'providers.validation.urlInvalid': 'URL эндпоинта должен начинаться с http:// или https://.',
  'providers.validation.nameInvalid': 'Имя провайдера может содержать буквы, цифры, точки и дефисы.',
  'providers.validation.nameReserved': 'Это имя занято встроенным провайдером.',

  'providers.toast.added': 'Собственный провайдер добавлен',
  'providers.toast.activated': 'Провайдер активирован',
} satisfies Record<string, string>
