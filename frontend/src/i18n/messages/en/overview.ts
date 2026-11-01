// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const overview = {
  'overview.hero.eyebrow': 'Workspace overview',
  'overview.hero.headlineReview': "Let's review some code.",
  'overview.hero.headlineNoRepo': 'Point the console at a repository.',
  'overview.hero.descriptionLead':
    'Review a diff, scan a whole repository, and revisit every finding. The console runs the same ',
  'overview.hero.descriptionTail': ' commands as your terminal.',
  'overview.hero.changed': '{count} changed',
  'overview.hero.scanRepo': 'Scan repository',
  'overview.hero.branchNotGit': 'not a git repository',

  'overview.greeting.workingLate': 'Working late',
  'overview.greeting.morning': 'Good morning',
  'overview.greeting.afternoon': 'Good afternoon',
  'overview.greeting.evening': 'Good evening',

  'overview.notGit.title': 'This folder is not a git repository.',
  'overview.notGit.bodyLead':
    'Code review and scan need Git history. Start the console from a repository, or run ',
  'overview.notGit.bodyTail': ' here first.',

  'overview.model.connectTitle': 'Connect a model to start reviewing.',
  'overview.model.connectBody':
    'Add an API key for a provider, or point the console at an OpenAI-compatible endpoint.',
  'overview.model.chooseProvider': 'Choose a provider',
  'overview.model.title': 'Model',
  'overview.model.subtitle': 'Resolved from config, environment, and provider settings',
  'overview.model.manage': 'Manage',
  'overview.model.noProvider': 'No provider configured',
  'overview.model.selectModel': 'Select a model to begin',
  'overview.model.auth': 'Auth',
  'overview.model.source': 'Source',
  'overview.model.endpoint': 'Endpoint',
  'overview.model.test': 'Test connection',
  'overview.model.reviewSettings': 'Review settings',

  'overview.quick.reviewTitle': 'Review changes',
  'overview.quick.reviewDesc': 'Working tree, a commit, or a branch range',
  'overview.quick.scanTitle': 'Scan a codebase',
  'overview.quick.scanDesc': 'Whole-file review without a diff',
  'overview.quick.modelsTitle': 'Model & providers',
  'overview.quick.connectTitle': 'Connect a model',
  'overview.quick.manageModels': 'Manage models',
  'overview.quick.providerDesc': 'API key, environment variable, or custom endpoint',

  'overview.stats.changedFiles': 'Changed files',
  'overview.stats.savedSessions': 'Saved sessions',
  'overview.stats.findingsRecorded': 'Findings recorded',
  'overview.stats.activeModel': 'Active model',
  'overview.stats.notSet': 'Not set',
  'overview.stats.gitRequired': 'Git is required for review',
  'overview.stats.dirtySummary': '{staged} staged · {unstaged} unstaged · {untracked} untracked',
  'overview.stats.noHistory': 'No history yet',
  'overview.stats.latest': 'Latest {time}',
  'overview.stats.acrossSessions': 'Across saved sessions',
  'overview.stats.latestFindings': '{count} in the latest session',
  'overview.stats.modelMissing': 'No model configured',

  'overview.sessions.title': 'Recent sessions',
  'overview.sessions.subtitle': 'Findings saved under ~/.opencodereview/sessions',
  'overview.sessions.viewAll': 'View all',
  'overview.sessions.modelUnknown': 'model not recorded',
  'overview.sessions.findings': '{count} finding | {count} findings',
  'overview.sessions.files': '{completed}/{selected} file | {completed}/{selected} files',
  'overview.sessions.total': '{count} total session | {count} total sessions',
  'overview.sessions.emptyTitle': 'No sessions yet',
  'overview.sessions.emptyDesc':
    'Your first review will appear here, with every finding saved to disk.',
  'overview.sessions.run': 'Run a review',
  'overview.sessions.browse': 'Browse history',
  'overview.sessions.emptyHistory': 'History starts with your first run',
  'overview.sessions.noRepo': 'no repository',

  'overview.workspace.repoStatus': 'Repository status',
  'overview.workspace.staged': 'staged',
  'overview.workspace.unstaged': 'unstaged',
  'overview.workspace.untracked': 'untracked',
  'overview.workspace.upstream': 'upstream',
  'overview.workspace.recentCommits': 'Recent commits',
  'overview.workspace.noCommits': 'No commits yet.',
  'overview.workspace.emptyDesc':
    'Open the console from a git repository to review diffs and keep history.',

  'overview.activity.title': 'Recent activity',
  'overview.activity.subtitle': 'Commands started from this console',
} satisfies Record<string, string>
