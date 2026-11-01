// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { ref } from 'vue'
import { api } from '@/api/client'
import { describeError } from '@/utils/format'
import type { MetaResponse } from '@/types'

const meta = ref<MetaResponse | null>(null)
const loading = ref(false)
const error = ref('')
let lastLoaded = 0
let inflight: Promise<void> | null = null

async function fetchMeta(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    meta.value = await api.meta()
    lastLoaded = Date.now()
  } catch (err) {
    error.value = describeError(err)
  } finally {
    loading.value = false
    inflight = null
  }
}

export function useMetaStore() {
  async function refresh(force = false): Promise<void> {
    if (!force && meta.value && Date.now() - lastLoaded < 5000) return
    if (inflight) return inflight
    inflight = fetchMeta()
    return inflight
  }

  return { meta, loading, error, refresh }
}
