// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const rules = {
  'rules.header.eyebrow': '参考',
  'rules.header.description':
    '内置语言规则决定模型关注的内容。项目和全局规则可以覆盖它们。本页展示系统层，并针对每一层解析路径。',
  'rules.header.reload': '重新加载',

  'rules.list.title': '内置规则',
  'rules.list.subtitle': '{count} 条路径模式，外加默认兜底规则',
  'rules.list.searchPlaceholder': '搜索路径模式或规则文本',
  'rules.list.defaultTitle': '默认兜底规则',
  'rules.list.defaultHint': '没有任何模式匹配时使用',
  'rules.list.emptyTitle': '没有匹配的规则',
  'rules.list.emptyDescription': '清空搜索即可查看全部内置规则。',
  'rules.list.footer': '{count} 条内置路径模式',

  'rules.lookup.title': '哪条规则适用？',
  'rules.lookup.subtitle': '在自定义、项目、全局和系统层之间解析路径',
  'rules.lookup.placeholder': '例如 src/main/java/com/example/Foo.java',
  'rules.lookup.submit': '查找规则',
  'rules.lookup.hint': '使用与审查相同的解析器，不会发起模型调用。',
  'rules.lookup.contentSniff': '内容识别： {value}',
  'rules.lookup.empty': '输入仓库内的相对文件路径，查看会命中哪条规则。',

  'rules.detail.copy': '复制规则',
  'rules.detail.defaultTitle': '默认兜底规则',
  'rules.detail.defaultSubtitle': '没有路径模式匹配时适用',
  'rules.detail.patternSubtitle': '内置模式 {pattern}',
  'rules.detail.genericTitle': '规则',
  'rules.detail.emptyTitle': '选择一条规则',
  'rules.detail.emptyDescription': '从列表中选择一个模式，阅读它的指导内容。',

  'rules.hint.braceExpanded': '通过花括号展开为多个路径模式',
  'rules.hint.projectManifest': '项目清单文件指导',
  'rules.hint.xmlMapping': 'XML 映射指导',
  'rules.hint.firstMatch': '首个匹配的模式生效',

  'rules.source.custom': '自定义规则',
  'rules.source.project': '项目规则',
  'rules.source.global': '全局规则',
  'rules.source.system': '内置系统规则',
  'rules.source.fallback': '规则',

  'rules.message.copied': '规则已复制',
  'rules.message.copyFailed': '无法复制规则',
} satisfies Record<string, string>;
