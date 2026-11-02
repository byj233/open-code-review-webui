// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type { JobStatus, SessionSummary, Severity } from '@/types'

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export interface StatusMeta {
  label: string
  tone: Tone
  pulse: boolean
}

const jobStatusMap: Record<JobStatus, StatusMeta> = {
  queued: { label: 'Queued', tone: 'neutral', pulse: false },
  running: { label: 'Running', tone: 'accent', pulse: true },
  canceling: { label: 'Stopping', tone: 'warning', pulse: true },
  succeeded: { label: 'Completed', tone: 'success', pulse: false },
  failed: { label: 'Failed', tone: 'danger', pulse: false },
  canceled: { label: 'Canceled', tone: 'neutral', pulse: false },
}

export function jobStatusMeta(status?: string): StatusMeta {
  return jobStatusMap[(status as JobStatus) ?? 'queued'] ?? jobStatusMap.queued
}

export interface SessionStateMeta extends StatusMeta {
  key: string
}

export function sessionState(summary: SessionSummary): SessionStateMeta {
  if (summary.aborted && !summary.end_time) {
    return { key: 'interrupted', label: 'Interrupted', tone: 'danger', pulse: false }
  }
  const terminal = summary.run_manifest?.terminal_state
  switch (terminal) {
    case 'complete':
      return { key: 'complete', label: 'Complete', tone: 'success', pulse: false }
    case 'partial':
      return { key: 'partial', label: 'Partial', tone: 'warning', pulse: false }
    case 'failed':
      return { key: 'failed', label: 'Failed', tone: 'danger', pulse: false }
    case 'skipped':
      return { key: 'skipped', label: 'Skipped', tone: 'neutral', pulse: false }
    default:
      break
  }
  if (summary.aborted) {
    return { key: 'aborted', label: 'Interrupted', tone: 'warning', pulse: false }
  }
  if (summary.legacy) {
    return { key: 'legacy', label: 'Legacy', tone: 'neutral', pulse: false }
  }
  return { key: 'recorded', label: 'Recorded', tone: 'neutral', pulse: false }
}

export function sessionModeLabel(summary: SessionSummary): string {
  if (summary.review_mode === 'scan') {
    return 'Repository scan'
  }
  if (summary.review_mode === 'commit' && summary.diff_commit) {
    return `Commit ${summary.diff_commit.slice(0, 10)}`
  }
  if (summary.review_mode === 'range' && summary.diff_from && summary.diff_to) {
    return `${summary.diff_from}..${summary.diff_to}`
  }
  if (summary.diff_from && summary.diff_to) {
    return `${summary.diff_from}..${summary.diff_to}`
  }
  return 'Workspace changes'
}

export function authLabel(mode?: string): string {
  switch (mode) {
    case 'api_key':
      return 'API key stored'
    case 'env':
      return 'Environment variable'
    case 'ambient':
      return 'Cloud credentials'
    case 'sign_in':
      return 'Sign-in required'
    default:
      return 'Not configured'
  }
}

export function sourceLabel(source?: string): string {
  switch (source) {
    case 'provider':
      return 'Provider'
    case 'legacy':
      return 'Custom endpoint'
    case 'ocr-env':
      return 'OCR environment'
    case 'claude-env':
      return 'Claude Code environment'
    default:
      return 'Not configured'
  }
}

export function modeLabel(mode?: string): string {
  switch (mode) {
    case 'commit':
      return 'Commit'
    case 'range':
      return 'Branch range'
    default:
      return 'Working tree'
  }
}

export const severityOrder: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function normalizedSeverity(severity?: string): Severity | 'unknown' {
  const value = (severity ?? '').toLowerCase()
  if (value === 'critical' || value === 'high' || value === 'medium' || value === 'low') {
    return value
  }
  return 'unknown'
}

export function severityLabel(severity?: string): string {
  const normalized = normalizedSeverity(severity)
  return normalized === 'unknown' ? 'Note' : normalized
}

export function categoryLabel(category?: string): string {
  return (category || 'other').replace(/[_-]+/g, ' ')
}

export function excludeReasonLabel(reason?: string): string {
  switch (reason) {
    case 'user_exclude':
      return 'Excluded by rule'
    case 'unsupported_ext':
      return 'Unsupported extension'
    case 'default_path':
      return 'Default path filter'
    case 'secret_exclude':
      return 'Secret path'
    case 'provider_directory':
      return 'Vendor directory'
    case 'deleted':
      return 'Deleted file'
    case 'binary':
      return 'Binary file'
    case 'too_large':
      return 'Too large'
    default:
      return reason ? reason.replace(/[_-]+/g, ' ') : ''
  }
}

export function manifestStateLabel(state?: string): string {
  switch (state) {
    case 'complete':
      return 'Complete'
    case 'partial':
      return 'Partial'
    case 'failed':
      return 'Failed'
    case 'skipped':
      return 'Skipped'
    default:
      return state || 'Unknown'
  }
}
