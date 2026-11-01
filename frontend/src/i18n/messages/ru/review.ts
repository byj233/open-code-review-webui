// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const review = {
  'review.header.eyebrow': 'Ревью диффа',
  'review.header.title': 'Ревью изменений кода',
  'review.header.description':
    'Отправьте дифф рабочего дерева, один коммит или диапазон веток настроенной модели. Консоль запускает то же агентное ревью, что и CLI.',
  'review.header.sessionHistory': 'История сеансов',

  'review.resume.lead': 'Возобновление сеанса ',
  'review.resume.tail':
    '. Повторно используемые контрольные точки файлов сохраняются; провайдер и модель должны по-прежнему совпадать с прошлым запуском.',
  'review.resume.clear': 'Очистить',

  'review.scope.title': 'Выберите область',
  'review.scope.subtitle': 'Что должно охватить ревью?',

  'review.mode.workspace.label': 'Рабочее дерево',
  'review.mode.workspace.description': 'Проиндексированные, непроиндексированные и неотслеживаемые файлы',
  'review.mode.commit.label': 'Один коммит',
  'review.mode.commit.description': 'Дифф коммита с его родителем',
  'review.mode.range.label': 'Диапазон веток',
  'review.mode.range.description': 'Сравнение двух ссылок через базу слияния',

  'review.commit.label': 'Коммит или тег',
  'review.commit.placeholder': 'abc1234, v1.2.0 или HEAD~1',
  'review.commit.hint': 'Родительский коммит используется как база для диффа.',

  'review.range.from': 'Начальная ссылка',
  'review.range.fromPlaceholder': 'main',
  'review.range.to': 'Конечная ссылка',
  'review.range.toPlaceholder': 'feature/my-branch',
  'review.range.swap': 'Поменять ссылки местами',

  'review.workspace.changed': '{count} изменённый файл в рабочем дереве | {count} изменённых файла в рабочем дереве | {count} изменённых файлов в рабочем дереве',
  'review.workspace.noRepo': 'Репозиторий не обнаружен',
  'review.workspace.counts': '{staged} проиндексировано · {unstaged} не проиндексировано · {untracked} не отслеживается',
  'review.workspace.noRepoHint': 'Запустите консоль из git-репозитория, чтобы проверять изменения.',

  'review.context.title': 'Добавьте контекст',
  'review.context.subtitle': 'Необязательно, но делает ревью точнее.',
  'review.context.placeholder':
    'Что пытается сделать это изменение? Например: добавить ограничение частоты запросов к API входа или перенести биллинг на новую схему.',
  'review.context.hint': 'Опишите замысел, ограничения или заметки о миграции. Не вставляйте секреты.',

  'review.advanced.title': 'Дополнительные параметры',

  'review.effort.label': 'Глубина ревью',
  'review.effort.default': 'По умолчанию',
  'review.effort.low': 'Низкая',
  'review.effort.medium': 'Средняя',
  'review.effort.high': 'Высокая',
  'review.effort.hint.default': 'Использовать настроенную глубину (средняя, если в настройках не указано иное).',
  'review.effort.hint.low': 'Один раунд ревью на группу. Самый быстрый вариант, подходит для небольших изменений.',
  'review.effort.hint.medium': 'Два раунда ревью на группу. Сбалансированный вариант по умолчанию.',
  'review.effort.hint.high': 'До трёх раундов на группу. Медленнее, подходит для тонких или рискованных изменений.',

  'review.override.provider': 'Переопределение провайдера',
  'review.override.providerPlaceholder': 'Использовать настроенного провайдера',
  'review.override.model': 'Переопределение модели',
  'review.override.modelPlaceholder': 'Использовать настроенную модель',
  'review.override.hint': 'Только для этого запуска.',
  'review.override.summaryBoth': 'переопределение провайдера и модели',
  'review.override.summaryProvider': 'переопределение провайдера',
  'review.override.summaryModel': 'переопределение модели',
  'review.override.concurrency': 'Параллелизм',
  'review.override.concurrencyHint': 'Параллельные подзадачи ревью.',
  'review.override.timeout': 'Тайм-аут задачи (минуты)',
  'review.override.timeoutHint': '0 — без ограничения на задачу.',
  'review.override.maxTokens': 'Максимум токенов на группу',
  'review.override.maxTokensHint': '0 — используется настроенное значение по умолчанию.',
  'review.override.budget': 'Бюджет токенов',
  'review.override.budgetHint': '0 — без ограничений.',
  'review.override.exclude': 'Шаблоны исключений',
  'review.override.excludePlaceholder': '**/generated/*, **/testdata/*',
  'review.override.excludeHint':
    'Шаблоны в стиле gitignore через запятую, объединяются с правилами проекта.',

  'review.filter.title': 'Без постфильтрации',
  'review.filter.description':
    'Сохранять все комментарии, которые отправляет агент, включая замечания с меньшей уверенностью.',

  'review.command.label': 'Эквивалентная команда',
  'review.actions.preview': 'Предпросмотр области',
  'review.actions.start': 'Запустить ревью',

  'review.model.title': 'Активная модель',
  'review.model.subtitle': 'Выбрана для этого запуска',
  'review.model.auth': 'Авторизация',
  'review.model.effort': 'Глубина',
  'review.model.resume': 'Возобновление',
  'review.model.configuredDefault': 'Значение по умолчанию',
  'review.model.noProvider': 'Провайдер не настроен',
  'review.model.selectModel': 'Выберите модель',
  'review.model.noModel': 'Модель не выбрана',
  'review.model.warning': 'Модель не настроена. Выберите провайдера, прежде чем запускать ревью.',
  'review.model.manage': 'Управление провайдерами',

  'review.pipeline.title': 'Конвейер ревью',
  'review.pipeline.subtitle': 'Что происходит после запуска',
  'review.pipeline.select.title': 'Отбор и фильтрация',
  'review.pipeline.select.description':
    'Читает дифф, применяет правила и отбрасывает бинарные файлы, секреты и слишком большие файлы.',
  'review.pipeline.group.title': 'Группировка связанных файлов',
  'review.pipeline.group.description':
    'Объединяет логически связанные файлы, чтобы у каждой единицы ревью был полный контекст.',
  'review.pipeline.review.title': 'Ревью агентом',
  'review.pipeline.review.description':
    'Агент читает код, ищет по репозиторию и отправляет замечания с привязкой к строкам.',
  'review.pipeline.save.title': 'Фильтрация и сохранение',
  'review.pipeline.save.description':
    'Комментарии с низкой уверенностью отфильтровываются, затем замечания и покрытие сохраняются.',

  'review.tip.title': 'Хорошее ревью начинается с замысла',
  'review.tip.text':
    'Добавьте предысторию изменения. Агент использует её, чтобы отличить осознанный компромисс от ошибки, и это снижает шум в замечаниях.',
  'review.tip.foot': 'Предпросмотр не расходует токены модели.',

  'review.error.noRepo': 'Откройте консоль из git-репозитория, чтобы запустить ревью.',
  'review.error.commit': 'Выберите коммит или тег для ревью.',
  'review.error.refs': 'Укажите обе ссылки: начальную и конечную.',
  'review.error.sameRefs': 'Начальная и конечная ссылки должны различаться.',
  'review.error.busy': 'Ревью уже запускается.',
} satisfies Record<string, string>
