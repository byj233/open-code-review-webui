// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const config = {
  'config.page.description':
    'Review defaults, legacy endpoint settings, telemetry, and MCP servers. Writes go through the ocr config command, so the CLI and this console never disagree.',
  'config.actions.reload': 'Reload',
  'config.actions.manageProviders': 'Manage providers',
  'config.common.unsavedChanges': 'Unsaved changes',

  'config.model.title': 'Model and review defaults',
  'config.model.subtitle': 'These values apply to every review and scan unless overridden per run.',
  'config.model.noProvider': 'No provider configured',
  'config.model.noModel': 'No model selected',
  'config.model.change': 'Change',
  'config.model.modelLabel': 'Model',
  'config.model.modelPlaceholder': "Use the provider's configured model",
  'config.model.modelHint':
    'Written to the active provider. An empty value leaves runs to fail loudly instead of guessing.',
  'config.model.effortLabel': 'Review effort',
  'config.model.effortDefault': 'Use default (medium)',
  'config.model.effortLow': 'Low - one round',
  'config.model.effortMedium': 'Medium - two rounds',
  'config.model.effortHigh': 'High - three rounds',
  'config.model.effortHint': 'Controls how many review rounds each file group gets.',
  'config.model.maxTokensLabel': 'Max tokens per group',
  'config.model.maxTokensHint': '0 clears the setting and uses the embedded template default.',
  'config.model.languageLabel': 'Output language',
  'config.model.languagePlaceholder': 'English',
  'config.model.languageHint': 'Language the model should write review comments in.',
  'config.model.save': 'Save defaults',

  'config.legacy.title': 'Legacy endpoint (llm.*)',
  'config.legacy.subtitle':
    'A single OpenAI- or Anthropic-compatible endpoint without a provider preset.',
  // The edge spaces keep the inline `llm.*` code span spaced in the template.
  'config.legacy.overrideBefore': 'The active provider overrides ',
  'config.legacy.overrideAfter':
    ' settings. Remove the active provider on the Providers page before relying on this endpoint.',
  'config.legacy.urlLabel': 'Endpoint URL',
  'config.legacy.modelLabel': 'Model',
  'config.legacy.modelPlaceholder': 'gpt-5.4 or claude-sonnet-4-6',
  'config.legacy.protocolLabel': 'Protocol',
  'config.legacy.protocolAnthropic': 'Anthropic messages',
  'config.legacy.protocolOpenaiChat': 'OpenAI chat completions',
  'config.legacy.protocolOpenaiResponses': 'OpenAI responses',
  'config.legacy.timeoutLabel': 'Request timeout (seconds)',
  'config.legacy.timeoutHint': '0 uses the client default.',
  'config.legacy.authTokenLabel': 'Auth token',
  'config.legacy.authTokenPlaceholderStored': 'Stored token present - paste to replace',
  'config.legacy.authTokenPlaceholder': 'Paste an auth token',
  'config.legacy.authTokenHint': 'Stored tokens are never returned to the browser.',
  'config.legacy.authTokenCmdLabel': 'Auth token command',
  'config.legacy.authTokenCmdHint': 'Runs only when no static token is stored.',
  'config.legacy.clearToken': 'Clear stored token',
  'config.legacy.save': 'Save endpoint',
  'config.legacy.clearTokenTitle': 'Clear auth token',
  'config.legacy.clearTokenConfirm':
    'Clear the stored llm.auth_token? The endpoint will fail unless a token command or environment variable supplies one.',
  'config.legacy.clearTokenConfirmButton': 'Clear token',

  'config.telemetry.title': 'Telemetry',
  'config.telemetry.subtitle':
    'Off by default. Content logging is only meaningful when telemetry is enabled.',
  'config.telemetry.enableTitle': 'Enable telemetry',
  'config.telemetry.enableText': 'Export traces and metrics for review runs.',
  'config.telemetry.exporterLabel': 'Exporter',
  'config.telemetry.exporterPlaceholder': 'Default',
  'config.telemetry.exporterConsole': 'Console',
  'config.telemetry.exporterOtlp': 'OTLP',
  'config.telemetry.otlpLabel': 'OTLP endpoint',
  'config.telemetry.contentTitle': 'Include content',
  'config.telemetry.contentText':
    'Add prompts and responses to telemetry. This can contain source code.',
  'config.telemetry.save': 'Save telemetry',

  'config.file.title': 'Config file',
  'config.file.subtitle': 'The CLI remains the source of truth',
  'config.file.loading': 'Loading…',
  'config.file.exists': 'File exists',
  'config.file.notCreated': 'Not created yet',
  'config.file.parseError': 'parse error',
  'config.file.parseFailed': 'The config file could not be parsed: {error}',
  // The edge spaces keep the inline `ocr config set` and `ocr config unset` spans spaced.
  'config.file.noteBefore': 'Every save runs ',
  'config.file.noteBetween': ' or ',
  'config.file.noteAfter': ', preserving unknown fields and provider layout.',
  'config.file.copyPath': 'Copy path',
  'config.file.copied': 'Config path copied',
  'config.file.copyFailed': 'Could not copy the config path',

  'config.mcp.title': 'MCP servers',
  'config.mcp.configuredCount': '{count} configured',
  'config.mcp.noCommand': 'no command',
  'config.mcp.removeServer': 'Remove MCP server',
  'config.mcp.removeConfirm': 'Remove MCP server "{name}" from the configuration?',
  'config.mcp.removeButton': 'Remove',
  'config.mcp.emptyTitle': 'No MCP servers',
  'config.mcp.emptyDescription':
    'MCP servers are managed with ocr config set mcp_servers.<name> in the terminal.',

  'config.secrets.title': 'A note on secrets',
  // The edge spaces keep the inline `*_cmd` code span spaced in the template.
  'config.secrets.textBefore':
    'API keys and auth tokens are written once and never sent back to this page. Prefer ',
  'config.secrets.textAfter': ' settings if you use a secret manager.',

  'config.toast.saved': 'Settings saved',
  'config.toast.savedPrefix': 'Saved: ',
} satisfies Record<string, string>
