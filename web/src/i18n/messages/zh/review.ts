// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const review = {
  'review.header.eyebrow': 'Diff 审查',
  'review.header.title': '审查代码改动',
  'review.header.description':
    '将工作区 diff、单个 commit 或分支区间发送给已配置的模型。控制台运行与 CLI 相同的智能体审查。',
  'review.header.sessionHistory': '会话历史',

  'review.resume.lead': '正在恢复会话 ',
  'review.resume.tail': '。已复用的文件检查点会保留，供应商和模型仍需与上次运行一致。',
  'review.resume.clear': '清除',

  'review.scope.title': '选择范围',
  'review.scope.subtitle': '审查要关注哪些内容？',

  'review.mode.workspace.label': '工作区',
  'review.mode.workspace.description': '已暂存、未暂存和未跟踪的文件',
  'review.mode.commit.label': '单个 commit',
  'review.mode.commit.description': '将 commit 与其父提交进行 diff',
  'review.mode.range.label': '分支区间',
  'review.mode.range.description': '基于合并基比较两个 ref',

  'review.commit.label': 'Commit 或标签',
  'review.commit.placeholder': 'abc1234、v1.2.0 或 HEAD~1',
  'review.commit.hint': '以父提交作为 diff 的基准。',

  'review.range.from': '起始 ref',
  'review.range.fromPlaceholder': 'main',
  'review.range.to': '目标 ref',
  'review.range.toPlaceholder': 'feature/my-branch',
  'review.range.swap': '交换 ref',

  'review.workspace.changed.one': '工作区中有 {count} 个文件发生改动',
  'review.workspace.changed.other': '工作区中有 {count} 个文件发生改动',
  'review.workspace.noRepo': '未检测到仓库',
  'review.workspace.counts': '{staged} 已暂存 · {unstaged} 未暂存 · {untracked} 未跟踪',
  'review.workspace.noRepoHint': '请从 Git 仓库启动控制台以审查改动。',

  'review.context.title': '补充上下文',
  'review.context.subtitle': '可选，但能让审查更精准。',
  'review.context.placeholder':
    '这次改动要达成什么目标？例如：为登录 API 增加限流，或将计费迁移到新的 schema。',
  'review.context.hint': '描述意图、约束或迁移说明。请勿粘贴密钥。',

  'review.advanced.title': '高级选项',

  'review.effort.label': '审查强度',
  'review.effort.default': '默认',
  'review.effort.low': '低',
  'review.effort.medium': '中',
  'review.effort.high': '高',
  'review.effort.hint.default': '使用已配置的强度(默认为中，可在设置中修改)。',
  'review.effort.hint.low': '每组一轮审查。速度最快，适合较小的改动。',
  'review.effort.hint.medium': '每组两轮审查。默认的平衡选项。',
  'review.effort.hint.high': '每组最多三轮审查。速度较慢，适合细微或有风险的改动。',

  'review.override.provider': '供应商覆盖',
  'review.override.providerPlaceholder': '使用已配置的供应商',
  'review.override.model': '模型覆盖',
  'review.override.modelPlaceholder': '使用已配置的模型',
  'review.override.hint': '仅对本次运行生效。',
  'review.override.summaryBoth': '供应商 + 模型覆盖',
  'review.override.summaryProvider': '供应商覆盖',
  'review.override.summaryModel': '模型覆盖',
  'review.override.concurrency': '并发数',
  'review.override.concurrencyHint': '并行执行的审查子任务数。',
  'review.override.timeout': '任务超时(分钟)',
  'review.override.timeoutHint': '0 表示不限制单个任务。',
  'review.override.maxTokens': '每组最大 Token 数',
  'review.override.maxTokensHint': '0 表示使用已配置的默认值。',
  'review.override.budget': 'Token 预算',
  'review.override.budgetHint': '0 表示不限制。',
  'review.override.exclude': '排除模式',
  'review.override.excludePlaceholder': '**/generated/*, **/testdata/*',
  'review.override.excludeHint': '逗号分隔的 gitignore 风格模式，会与项目规则合并。',

  'review.filter.title': '跳过后置过滤',
  'review.filter.description': '保留智能体提交的每一条评论，包括置信度较低的提示。',

  'review.command.label': '等价命令',
  'review.actions.preview': '预览范围',
  'review.actions.start': '开始审查',

  'review.model.title': '当前模型',
  'review.model.subtitle': '本次运行解析结果',
  'review.model.auth': '认证',
  'review.model.effort': '强度',
  'review.model.resume': '恢复',
  'review.model.configuredDefault': '已配置的默认值',
  'review.model.noProvider': '未配置供应商',
  'review.model.selectModel': '选择模型',
  'review.model.noModel': '未选择模型',
  'review.model.warning': '尚未配置模型。请先选择供应商再运行审查。',
  'review.model.manage': '管理供应商',

  'review.pipeline.title': '审查流程',
  'review.pipeline.subtitle': '开始后会发生什么',
  'review.pipeline.select.title': '选择并过滤',
  'review.pipeline.select.description': '读取 diff,应用规则，并剔除二进制文件、密钥和过大的文件。',
  'review.pipeline.group.title': '对相关文件分组',
  'review.pipeline.group.description': '将相关联的文件打包，使每个审查单元都有完整的上下文。',
  'review.pipeline.review.title': '智能体审查',
  'review.pipeline.review.description': '智能体读取代码、检索仓库，并提交精确到行的审查问题。',
  'review.pipeline.save.title': '过滤并保存',
  'review.pipeline.save.description': '过滤置信度较低的评论，然后保存审查问题与覆盖率。',

  'review.tip.title': '好的审查始于意图',
  'review.tip.text':
    '补充这次改动的背景。智能体借此区分有意的取舍与真正的缺陷，从而减少干扰性的问题。',
  'review.tip.foot': '预览不消耗模型 Token。',

  'review.error.noRepo': '请从 Git 仓库打开控制台以运行审查。',
  'review.error.commit': '请选择要审查的 commit 或标签。',
  'review.error.refs': '请同时选择起始 ref 和目标 ref。',
  'review.error.sameRefs': '起始 ref 和目标 ref 必须不同。',
  'review.error.busy': '审查已经在启动中。',
} satisfies Record<string, string>
