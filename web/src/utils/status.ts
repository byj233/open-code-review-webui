// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { t } from '@/i18n'
import type { MessageKey } from '@/i18n'
import type { JobStatus, SessionSummary, Severity } from '@/types'

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export interface StatusMeta {
  label: string
  tone: Tone
  pulse: boolean
}

function meta(key: MessageKey, tone: Tone, pulse = false): StatusMeta {
  return { label: t(key), tone, pulse }
}

export function jobStatusMeta(status?: string): StatusMeta {
  switch ((status as JobStatus) ?? 'queued') {
    case 'running':
      return meta('status.running', 'accent', true)
    case 'canceling':
      return meta('status.canceling', 'warning', true)
    case 'succeeded':
      return meta('status.succeeded', 'success')
    case 'failed':
      return meta('status.failed', 'danger')
    case 'canceled':
      return meta('status.canceled', 'neutral')
    default:
      return meta('status.queued', 'neutral')
  }
}

export interface SessionStateMeta extends StatusMeta {
  key: string
}

export function sessionState(summary: SessionSummary): SessionStateMeta {
  if (summary.aborted && !summary.end_time) {
    return { key: 'interrupted', ...meta('status.interrupted', 'danger') }
  }
  const terminal = summary.run_manifest?.terminal_state
  switch (terminal) {
    case 'complete':
      return { key: 'complete', ...meta('status.complete', 'success') }
    case 'partial':
      return { key: 'partial', ...meta('status.partial', 'warning') }
    case 'failed':
      return { key: 'failed', ...meta('status.failed', 'danger') }
    case 'skipped':
      return { key: 'skipped', ...meta('status.skipped', 'neutral') }
    default:
      break
  }
  if (summary.aborted) {
    return { key: 'aborted', ...meta('status.interrupted', 'warning') }
  }
  if (summary.legacy) {
    return { key: 'legacy', ...meta('status.legacy', 'neutral') }
  }
  return { key: 'recorded', ...meta('status.recorded', 'neutral') }
}

export function sessionModeLabel(summary: SessionSummary): string {
  if (summary.review_mode === 'scan') {
    return t('status.mode.scan')
  }
  if (summary.review_mode === 'commit' && summary.diff_commit) {
    return t('status.mode.commit', { id: summary.diff_commit.slice(0, 10) })
  }
  if (summary.review_mode === 'range' && summary.diff_from && summary.diff_to) {
    return `${summary.diff_from}..${summary.diff_to}`
  }
  if (summary.diff_from && summary.diff_to) {
    return `${summary.diff_from}..${summary.diff_to}`
  }
  return t('status.mode.workspace')
}

export function authLabel(mode?: string): string {
  switch (mode) {
    case 'api_key':
      return t('status.auth.apiKey')
    case 'env':
      return t('status.auth.env')
    case 'ambient':
      return t('status.auth.ambient')
    case 'sign_in':
      return t('status.auth.signIn')
    default:
      return t('status.auth.none')
  }
}

export function sourceLabel(source?: string): string {
  switch (source) {
    case 'provider':
      return t('status.source.provider')
    case 'legacy':
      return t('status.source.legacy')
    case 'ocr-env':
      return t('status.source.ocrEnv')
    case 'claude-env':
      return t('status.source.claudeEnv')
    default:
      return t('status.source.none')
  }
}

export function modeLabel(mode?: string): string {
  switch (mode) {
    case 'commit':
      return t('status.reviewMode.commit')
    case 'range':
      return t('status.reviewMode.range')
    default:
      return t('status.reviewMode.workspace')
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
  switch (normalizedSeverity(severity)) {
    case 'critical':
      return t('status.severity.critical')
    case 'high':
      return t('status.severity.high')
    case 'medium':
      return t('status.severity.medium')
    case 'low':
      return t('status.severity.low')
    default:
      return t('status.severity.note')
  }
}

export function categoryLabel(category?: string): string {
  return (category || 'other').replace(/[_-]+/g, ' ')
}

export function excludeReasonLabel(reason?: string): string {
  switch (reason) {
    case 'user_exclude':
      return t('status.exclude.userExclude')
    case 'unsupported_ext':
      return t('status.exclude.unsupportedExt')
    case 'default_path':
      return t('status.exclude.defaultPath')
    case 'secret_exclude':
      return t('status.exclude.secretExclude')
    case 'provider_directory':
      return t('status.exclude.providerDirectory')
    case 'deleted':
      return t('status.exclude.deleted')
    case 'binary':
      return t('status.exclude.binary')
    case 'too_large':
      return t('status.exclude.tooLarge')
    default:
      return reason ? reason.replace(/[_-]+/g, ' ') : ''
  }
}

export function manifestStateLabel(state?: string): string {
  switch (state) {
    case 'complete':
      return t('status.complete')
    case 'partial':
      return t('status.partial')
    case 'failed':
      return t('status.failed')
    case 'skipped':
      return t('status.skipped')
    default:
      return state || t('common.unknown')
  }
}
