// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const providers = {
  'providers.page.description':
    'Choose the model that reviews your code. Keys stay in ~/.opencodereview/config.json and are never returned to this page.',
  'providers.actions.customProvider': 'Custom provider',
  'providers.actions.testConnection': 'Test connection',

  'providers.banner.active': 'Active provider',
  'providers.banner.noModelConfigured': 'No model configured',
  'providers.banner.choose': 'Choose a provider below',
  'providers.banner.noModel': 'No model selected',
  'providers.banner.changeModel': 'Change model',
  'providers.banner.openSettings': 'Open settings',

  'providers.toolbar.searchPlaceholder': 'Search providers, models, or env vars',
  'providers.toolbar.configuredOnly': 'Configured only',
  'providers.toolbar.configuredCount': '{configured} of {total} configured',

  'providers.builtin.title': 'Built-in providers',
  'providers.builtin.subtitle': 'Presets ship with endpoints, protocol, and suggested models.',
  'providers.builtin.emptyTitle': 'No built-in providers match',
  'providers.builtin.emptyDescription': 'Clear the search or turn off the configured-only filter.',

  'providers.card.active': 'Active',
  'providers.card.noModelsYet': 'No models yet',
  'providers.card.modelListNotPreset': 'Model list not preset',
  'providers.card.configure': 'Configure',
  'providers.card.use': 'Use',
  'providers.card.setUp': 'Set up',

  'providers.custom.title': 'Custom providers',
  'providers.custom.subtitle': 'Any OpenAI-compatible or Anthropic-compatible endpoint.',
  'providers.custom.addTitle': 'Add a custom provider',
  'providers.custom.addText': 'Gateway, local proxy, or a private OpenAI-compatible endpoint.',

  'providers.dialog.titleAdd': 'Add custom provider',
  'providers.dialog.titleActive': 'Configure active provider',
  'providers.dialog.titleNamed': 'Configure {name}',
  'providers.dialog.titleFallback': 'Configure provider',
  'providers.dialog.introNew':
    'Point the console at an endpoint you control. Protocol and URL are stored in custom_providers.',
  'providers.dialog.introActive':
    'Changing the model writes it to the active provider. Stored keys are kept unless you paste a new one.',
  'providers.dialog.introDefault':
    'Select the model to use for this provider, then enable it for review and scan runs.',
  'providers.dialog.currentlyActive': 'This provider is currently active.',
  'providers.dialog.nameLabel': 'Provider name',
  'providers.dialog.nameHint': 'Letters, digits, dots, and dashes. Used in config keys.',
  'providers.dialog.modelLabel': 'Model',
  'providers.dialog.modelPlaceholder': 'Select or type a model id',
  'providers.dialog.urlLabel': 'Endpoint URL',
  'providers.dialog.protocolLabel': 'Protocol',
  'providers.dialog.apiKeyLabel': 'API key',
  'providers.dialog.keyStoredPlaceholder': 'Stored key present - paste to replace',
  'providers.dialog.keyPlaceholder': 'Paste an API key',
  'providers.dialog.keyOptionalHint': 'Optional at this step; you can add it later.',
  'providers.dialog.keyKeepHint':
    'Leave blank to keep the stored key. Keys are never shown in this console.',
  'providers.dialog.ambientAuthNote':
    'This provider authenticates through the ambient AWS credential chain. Set your AWS region and profile in Settings if needed.',
  // The edge spaces keep the inline `ocr auth login` code span spaced in the template.
  'providers.dialog.signInBefore': 'This provider uses an interactive sign-in. Run ',
  'providers.dialog.signInAfter': ' in a terminal, then return here.',
  'providers.dialog.add': 'Add provider',
  'providers.dialog.saveModel': 'Save model',
  'providers.dialog.useProvider': 'Use provider',

  'providers.protocol.anthropicMessages': 'Anthropic messages',
  'providers.protocol.openaiChat': 'OpenAI chat completions',
  'providers.protocol.openaiResponses': 'OpenAI responses',
  'providers.protocol.openaiCompatible': 'OpenAI compatible',
  'providers.protocol.bedrock': 'AWS Bedrock',
  'providers.protocol.notSet': 'Protocol not set',

  'providers.validation.modelRequired': 'Choose a model for this provider.',
  'providers.validation.urlRequired': 'An endpoint URL is required.',
  'providers.validation.urlInvalid': 'The endpoint must start with http:// or https://.',
  'providers.validation.nameInvalid': 'Provider names may contain letters, digits, dots, and dashes.',
  'providers.validation.nameReserved': 'That name belongs to a built-in provider.',

  'providers.toast.added': 'Custom provider added',
  'providers.toast.activated': 'Provider activated',
} satisfies Record<string, string>
