// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type { JobKind } from '@/types'

// Reviews and scans are addressed under the resource that started them; a job
// with no owning resource (the connection test) stays on the generic run path.
export function jobPath(id: string, kind: JobKind): string {
  switch (kind) {
    case 'review':
      return `/reviews/${id}`
    case 'scan':
      return `/scans/${id}`
    default:
      return `/runs/${id}`
  }
}
