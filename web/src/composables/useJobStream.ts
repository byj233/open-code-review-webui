// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { onBeforeUnmount, ref } from 'vue'
import { api, errorMessage } from '@/api/client'
import type { JobSnapshot } from '@/types'

function isTerminal(job: JobSnapshot | null): boolean {
  return !job || ['succeeded', 'failed', 'canceled'].includes(job.status)
}

export function useJobStream(jobId: string) {
  const job = ref<JobSnapshot | null>(null)
  const connected = ref(false)
  const error = ref('')
  let source: EventSource | null = null
  let pollTimer: number | undefined
  let stopped = false

  function closeSource(): void {
    if (source) {
      source.close()
      source = null
    }
    connected.value = false
  }

  function stopPolling(): void {
    if (pollTimer !== undefined) {
      window.clearTimeout(pollTimer)
      pollTimer = undefined
    }
  }

  async function refresh(): Promise<void> {
    try {
      job.value = await api.job(jobId)
      error.value = ''
    } catch (err) {
      error.value = errorMessage(err)
    }
  }

  function startPolling(): void {
    stopPolling()
    const tick = async (): Promise<void> => {
      if (stopped) return
      await refresh()
      if (stopped || isTerminal(job.value)) return
      pollTimer = window.setTimeout(tick, 1600)
    }
    void tick()
  }

  function connect(): void {
    if (stopped || isTerminal(job.value) || typeof EventSource === 'undefined') {
      if (!isTerminal(job.value)) startPolling()
      return
    }
    closeSource()
    source = new EventSource(api.eventsUrl(jobId))
    source.addEventListener('open', () => {
      connected.value = true
    })
    source.addEventListener('job', (event) => {
      try {
        job.value = JSON.parse((event as MessageEvent<string>).data) as JobSnapshot
        connected.value = true
        error.value = ''
      } catch {
        // A malformed frame is dropped; the next one replaces the whole snapshot.
      }
    })
    source.addEventListener('done', () => {
      closeSource()
      void refresh()
    })
    source.onerror = () => {
      closeSource()
      if (!isTerminal(job.value)) startPolling()
    }
  }

  async function start(): Promise<void> {
    await refresh()
    connect()
  }

  function stop(): void {
    stopped = true
    closeSource()
    stopPolling()
  }

  onBeforeUnmount(stop)

  return { job, connected, error, start, refresh, stop }
}
