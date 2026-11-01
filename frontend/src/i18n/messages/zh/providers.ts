// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const providers = {
  'providers.page.description':
    '选择用于审查代码的模型。密钥保存在 ~/.opencodereview/config.json 中，绝不会返回此页面。',
  'providers.actions.customProvider': '自定义供应商',
  'providers.actions.testConnection': '测试连接',

  'providers.banner.active': '当前启用的供应商',
  'providers.banner.noModelConfigured': '未配置模型',
  'providers.banner.choose': '从下方选择一个供应商',
  'providers.banner.noModel': '未选择模型',
  'providers.banner.changeModel': '更改模型',
  'providers.banner.openSettings': '打开设置',

  'providers.toolbar.searchPlaceholder': '搜索供应商、模型或环境变量',
  'providers.toolbar.configuredOnly': '仅显示已配置',
  'providers.toolbar.configuredCount': '已配置 {configured}/{total}',

  'providers.builtin.title': '内置供应商',
  'providers.builtin.subtitle': '预设自带端点、协议和建议模型。',
  'providers.builtin.emptyTitle': '没有匹配的内置供应商',
  'providers.builtin.emptyDescription': '清除搜索内容，或关闭“仅显示已配置”筛选。',

  'providers.card.active': '使用中',
  'providers.card.noModelsYet': '暂无模型',
  'providers.card.modelListNotPreset': '未预设模型列表',
  'providers.card.configure': '配置',
  'providers.card.use': '使用',
  'providers.card.setUp': '设置',

  'providers.custom.title': '自定义供应商',
  'providers.custom.subtitle': '任何 OpenAI 兼容或 Anthropic 兼容的端点。',
  'providers.custom.addTitle': '添加自定义供应商',
  'providers.custom.addText': '网关、本地代理或私有的 OpenAI 兼容端点。',

  'providers.dialog.titleAdd': '添加自定义供应商',
  'providers.dialog.titleActive': '配置当前启用的供应商',
  'providers.dialog.titleNamed': '配置 {name}',
  'providers.dialog.titleFallback': '配置供应商',
  'providers.dialog.introNew':
    '将控制台指向由你掌控的端点。协议和 URL 会保存在 custom_providers 中。',
  'providers.dialog.introActive':
    '更改模型会将其写入当前启用的供应商。除非粘贴新密钥，否则已保存的密钥会保留。',
  'providers.dialog.introDefault':
    '选择该供应商要使用的模型，然后在审查和扫描运行中启用它。',
  'providers.dialog.currentlyActive': '该供应商当前处于启用状态。',
  'providers.dialog.nameLabel': '供应商名称',
  'providers.dialog.nameHint': '只能包含字母、数字、点和短横线，将用于配置键。',
  'providers.dialog.modelLabel': '模型',
  'providers.dialog.modelPlaceholder': '选择或输入模型 ID',
  'providers.dialog.urlLabel': '端点 URL',
  'providers.dialog.protocolLabel': '协议',
  'providers.dialog.apiKeyLabel': 'API Key',
  'providers.dialog.keyStoredPlaceholder': '已有保存的 Key - 粘贴以替换',
  'providers.dialog.keyPlaceholder': '粘贴 API Key',
  'providers.dialog.keyOptionalHint': '此步骤可选；你也可以稍后再添加。',
  'providers.dialog.keyKeepHint': '留空则保留已保存的 Key。密钥不会在此控制台中显示。',
  'providers.dialog.ambientAuthNote':
    '该供应商通过环境中的 AWS 凭证链进行认证。如有需要，请在“设置”中配置 AWS 区域和配置文件。',
  // The edge spaces keep the inline `ocr auth login` code span spaced in the template.
  'providers.dialog.signInBefore': '该供应商使用交互式登录。请在终端运行 ',
  'providers.dialog.signInAfter': '，然后返回此页面。',
  'providers.dialog.add': '添加供应商',
  'providers.dialog.saveModel': '保存模型',
  'providers.dialog.useProvider': '使用供应商',

  'providers.protocol.anthropicMessages': 'Anthropic messages',
  'providers.protocol.openaiChat': 'OpenAI chat completions',
  'providers.protocol.openaiResponses': 'OpenAI responses',
  'providers.protocol.openaiCompatible': 'OpenAI compatible',
  'providers.protocol.bedrock': 'AWS Bedrock',
  'providers.protocol.notSet': '未设置协议',

  'providers.validation.modelRequired': '请为该供应商选择一个模型。',
  'providers.validation.urlRequired': '必须填写端点 URL。',
  'providers.validation.urlInvalid': '端点必须以 http:// 或 https:// 开头。',
  'providers.validation.nameInvalid': '供应商名称只能包含字母、数字、点和短横线。',
  'providers.validation.nameReserved': '该名称已被内置供应商占用。',

  'providers.toast.added': '已添加自定义供应商',
  'providers.toast.activated': '供应商已启用',
} satisfies Record<string, string>;
