// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const review = {
  'review.header.eyebrow': 'Diff review',
  'review.header.title': 'Review code changes',
  'review.header.description':
    'Send a working-tree diff, a single commit, or a branch range to your configured model. The console runs the same agentic review as the CLI.',
  'review.header.sessionHistory': 'Session history',

  'review.resume.lead': 'Resuming session ',
  'review.resume.tail':
    '. Reused file checkpoints are kept; the provider and model must still match the previous run.',
  'review.resume.clear': 'Clear',

  'review.scope.title': 'Choose the scope',
  'review.scope.subtitle': 'What should the review look at?',

  'review.mode.workspace.label': 'Working tree',
  'review.mode.workspace.description': 'Staged, unstaged, and untracked files',
  'review.mode.commit.label': 'Single commit',
  'review.mode.commit.description': 'Diff a commit against its parent',
  'review.mode.range.label': 'Branch range',
  'review.mode.range.description': 'Compare two refs with a merge base',

  'review.commit.label': 'Commit or tag',
  'review.commit.placeholder': 'abc1234, v1.2.0, or HEAD~1',
  'review.commit.hint': 'The parent commit is used as the base for the diff.',

  'review.range.from': 'From ref',
  'review.range.fromPlaceholder': 'main',
  'review.range.to': 'To ref',
  'review.range.toPlaceholder': 'feature/my-branch',
  'review.range.swap': 'Swap refs',

  'review.workspace.changed': '{count} changed file in the working tree | {count} changed files in the working tree',
  'review.workspace.noRepo': 'No repository detected',
  'review.workspace.counts': '{staged} staged · {unstaged} unstaged · {untracked} untracked',
  'review.workspace.noRepoHint': 'Start the console from a git repository to review changes.',

  'review.context.title': 'Add context',
  'review.context.subtitle': 'Optional, but it sharpens the review.',
  'review.context.placeholder':
    'What is this change trying to do? For example: adding rate limiting to the login API, or migrating billing to the new schema.',
  'review.context.hint': 'Describe the intent, constraints, or migration notes. Do not paste secrets.',

  'review.advanced.title': 'Advanced options',

  'review.effort.label': 'Review effort',
  'review.effort.default': 'Default',
  'review.effort.low': 'Low',
  'review.effort.medium': 'Medium',
  'review.effort.high': 'High',
  'review.effort.hint.default': 'Use the configured effort (medium unless changed in Settings).',
  'review.effort.hint.low': 'One review round per group. Fastest, best for small changes.',
  'review.effort.hint.medium': 'Two review rounds per group. The default balance.',
  'review.effort.hint.high': 'Up to three rounds per group. Slower, best for subtle or risky changes.',

  'review.override.provider': 'Provider override',
  'review.override.providerPlaceholder': 'Use configured provider',
  'review.override.model': 'Model override',
  'review.override.modelPlaceholder': 'Use configured model',
  'review.override.hint': 'Only for this run.',
  'review.override.summaryBoth': 'provider + model override',
  'review.override.summaryProvider': 'provider override',
  'review.override.summaryModel': 'model override',
  'review.override.concurrency': 'Concurrency',
  'review.override.concurrencyHint': 'Parallel review subtasks.',
  'review.override.timeout': 'Task timeout (minutes)',
  'review.override.timeoutHint': '0 means no per-task limit.',
  'review.override.maxTokens': 'Max tokens per group',
  'review.override.maxTokensHint': '0 uses the configured default.',
  'review.override.budget': 'Token budget',
  'review.override.budgetHint': '0 means unlimited.',
  'review.override.exclude': 'Exclude patterns',
  'review.override.excludePlaceholder': '**/generated/*, **/testdata/*',
  'review.override.excludeHint':
    'Comma-separated gitignore-style patterns, merged with project rules.',

  'review.filter.title': 'Skip post-filtering',
  'review.filter.description':
    'Keep every comment the agent submits, including lower-confidence notes.',

  'review.command.label': 'Equivalent command',
  'review.actions.preview': 'Preview scope',
  'review.actions.start': 'Start review',

  'review.model.title': 'Active model',
  'review.model.subtitle': 'Resolved for this run',
  'review.model.auth': 'Auth',
  'review.model.effort': 'Effort',
  'review.model.resume': 'Resume',
  'review.model.configuredDefault': 'Configured default',
  'review.model.noProvider': 'No provider configured',
  'review.model.selectModel': 'Select a model',
  'review.model.noModel': 'No model selected',
  'review.model.warning': 'No model is configured. Choose a provider before running the review.',
  'review.model.manage': 'Manage providers',

  'review.pipeline.title': 'Review pipeline',
  'review.pipeline.subtitle': 'What happens after you start',
  'review.pipeline.select.title': 'Select and filter',
  'review.pipeline.select.description':
    'Reads the diff, applies rules, and drops binaries, secrets, and oversized files.',
  'review.pipeline.group.title': 'Group related files',
  'review.pipeline.group.description':
    'Bundles files that belong together so each review unit has full context.',
  'review.pipeline.review.title': 'Agent review',
  'review.pipeline.review.description':
    'The agent reads code, searches the repo, and submits line-precise findings.',
  'review.pipeline.save.title': 'Filter and save',
  'review.pipeline.save.description':
    'Low-confidence comments are filtered, then findings and coverage are persisted.',

  'review.tip.title': 'A good review starts with intent',
  'review.tip.text':
    'Add the background behind the change. The agent uses it to tell a deliberate trade-off from a bug, which cuts down noisy findings.',
  'review.tip.foot': 'Preview costs no model tokens.',

  'review.error.noRepo': 'Open the console from a git repository to run a review.',
  'review.error.commit': 'Choose a commit or tag to review.',
  'review.error.refs': 'Choose both a from and a to ref.',
  'review.error.sameRefs': 'The from and to refs must be different.',
  'review.error.busy': 'The review is already starting.',
} satisfies Record<string, string>
