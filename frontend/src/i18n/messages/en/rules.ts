// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const rules = {
  'rules.header.eyebrow': 'Reference',
  'rules.header.description':
    'Built-in language rules decide what the model pays attention to. Project and global rules can override them; this page shows the system layer and resolves a path against every layer.',
  'rules.header.reload': 'Reload',

  'rules.list.title': 'Built-in rules',
  'rules.list.subtitle': '{count} patterns plus the default fallback',
  'rules.list.searchPlaceholder': 'Search patterns or rule text',
  'rules.list.defaultTitle': 'Default fallback',
  'rules.list.defaultHint': 'Used when no pattern matches',
  'rules.list.emptyTitle': 'No rules match',
  'rules.list.emptyDescription': 'Clear the search to see every built-in rule.',
  'rules.list.footer': '{count} built-in patterns',

  'rules.lookup.title': 'Which rule applies?',
  'rules.lookup.subtitle': 'Resolve a path across custom, project, global, and system layers',
  'rules.lookup.placeholder': 'e.g. src/main/java/com/example/Foo.java',
  'rules.lookup.submit': 'Find rule',
  'rules.lookup.hint': 'Reads the same resolver the review uses. No model call is made.',
  'rules.lookup.contentSniff': 'content sniff: {value}',
  'rules.lookup.empty': 'Enter a repo-relative file path to see which rule the agent would use.',

  'rules.detail.copy': 'Copy rule',
  'rules.detail.defaultTitle': 'Default fallback rule',
  'rules.detail.defaultSubtitle': 'Applies when no path pattern matches',
  'rules.detail.patternSubtitle': 'Built-in pattern {pattern}',
  'rules.detail.genericTitle': 'Rule',
  'rules.detail.emptyTitle': 'Select a rule',
  'rules.detail.emptyDescription': 'Choose a pattern from the list to read its guidance.',

  'rules.hint.braceExpanded': 'Brace-expanded into multiple path patterns',
  'rules.hint.projectManifest': 'Project manifest guidance',
  'rules.hint.xmlMapping': 'XML mapping guidance',
  'rules.hint.firstMatch': 'First matching pattern wins',

  'rules.source.custom': 'Custom rule',
  'rules.source.project': 'Project rule',
  'rules.source.global': 'Global rule',
  'rules.source.system': 'Built-in system rule',
  'rules.source.fallback': 'Rule',

  'rules.message.copied': 'Rule copied',
  'rules.message.copyFailed': 'Could not copy the rule',
} satisfies Record<string, string>
