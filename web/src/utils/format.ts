// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('en-US')

export function formatDate(value?: string | null): string {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateTimeFormatter.format(date)
}

export function formatDateShort(value?: string | null): string {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateFormatter.format(date)
}

export function formatRelative(value?: string | null): string {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const diff = Date.now() - date.getTime()
  if (diff < 45_000) return 'just now'
  if (diff < 3_600_000) return `${Math.max(1, Math.round(diff / 60_000))}m ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`
  if (diff < 604_800_000) return `${Math.round(diff / 86_400_000)}d ago`
  return formatDateShort(value)
}

export function formatCount(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '0'
  return numberFormatter.format(value)
}

export function formatCompact(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '0'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDurationMs(ms?: number | null): string {
  if (ms == null || Number.isNaN(ms) || ms < 0) return '--'
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  if (minutes < 60) return `${minutes}m ${rest}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

export function formatDurationNs(ns?: number | null): string {
  if (ns == null) return '--'
  return formatDurationMs(ns / 1_000_000)
}

export function formatElapsed(startedAt?: string | null, endedAt?: string | null): string {
  if (!startedAt) return '--'
  const start = new Date(startedAt).getTime()
  if (Number.isNaN(start)) return '--'
  const end = endedAt ? new Date(endedAt).getTime() : Date.now()
  return formatDurationMs(Math.max(0, end - start))
}

export function shortId(id?: string | null, length = 8): string {
  if (!id) return '--'
  return id.length <= length ? id : id.slice(0, length)
}

export function fileName(path?: string): string {
  if (!path) return ''
  const parts = path.split(/[\\/]/)
  return parts[parts.length - 1] || path
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`
}

export function titleCase(value?: string | null): string {
  if (!value) return ''
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
