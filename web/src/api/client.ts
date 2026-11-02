// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type {
  ActivateProviderResponse,
  ConfigApplyResponse,
  ConfigView,
  JobSnapshot,
  JobsResponse,
  MetaResponse,
  ProvidersResponse,
  RepoInfo,
  ReviewRequest,
  RulesResponse,
  RuleCheckResponse,
  ScanRequest,
  SessionDetailResponse,
  SessionsResponse,
} from '@/types'

const token =
  typeof document === 'undefined'
    ? ''
    : document.querySelector<HTMLMetaElement>('meta[name="ocr-console-token"]')?.content ?? ''

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('X-OCR-Token', token)
  }

  let response: Response
  try {
    response = await fetch(path, { ...init, method, headers })
  } catch {
    throw new ApiError('The console server is unreachable. Is `ocr web` still running?', 0)
  }

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) message = payload.error
    } catch {
      const text = await response.text().catch(() => '')
      if (text) message = text
    }
    throw new ApiError(message, response.status)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  meta(): Promise<MetaResponse> {
    return request('/api/meta')
  },
  repo(): Promise<RepoInfo> {
    return request('/api/repo')
  },
  config(): Promise<ConfigView> {
    return request('/api/config')
  },
  applyConfig(set: Record<string, string>, unset: string[] = []): Promise<ConfigApplyResponse> {
    return request('/api/config/apply', {
      method: 'POST',
      body: JSON.stringify({ set, unset }),
    })
  },
  providers(): Promise<ProvidersResponse> {
    return request('/api/providers')
  },
  activateProvider(payload: {
    name: string
    model: string
    api_key?: string
    url?: string
    protocol?: string
    create_custom?: boolean
  }): Promise<ActivateProviderResponse> {
    return request('/api/providers/activate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  sessions(limit = 100, query = ''): Promise<SessionsResponse> {
    const params = new URLSearchParams({ limit: String(limit) })
    if (query.trim()) params.set('q', query.trim())
    return request(`/api/sessions?${params.toString()}`)
  },
  session(id: string): Promise<SessionDetailResponse> {
    return request(`/api/sessions/${encodeURIComponent(id)}`)
  },
  deleteSession(id: string): Promise<{ ok: boolean }> {
    return request(`/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  rules(): Promise<RulesResponse> {
    return request('/api/rules')
  },
  checkRule(path: string): Promise<RuleCheckResponse> {
    return request('/api/rules/check', {
      method: 'POST',
      body: JSON.stringify({ path }),
    })
  },
  startReview(payload: ReviewRequest): Promise<JobSnapshot> {
    return request('/api/review', { method: 'POST', body: JSON.stringify(payload) })
  },
  startScan(payload: ScanRequest): Promise<JobSnapshot> {
    return request('/api/scan', { method: 'POST', body: JSON.stringify(payload) })
  },
  testConnection(): Promise<JobSnapshot> {
    return request('/api/llm/test', { method: 'POST', body: '{}' })
  },
  jobs(): Promise<JobsResponse> {
    return request('/api/jobs')
  },
  job(id: string): Promise<JobSnapshot> {
    return request(`/api/jobs/${encodeURIComponent(id)}`)
  },
  cancelJob(id: string): Promise<JobSnapshot> {
    return request(`/api/jobs/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      body: '{}',
    })
  },
  eventsUrl(id: string): string {
    return `/api/jobs/${encodeURIComponent(id)}/events`
  },
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return String(error)
}
