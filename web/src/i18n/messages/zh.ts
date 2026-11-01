// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type { MessageKey } from '../index'
import { shell } from './zh/shell'
import { overview } from './zh/overview'
import { review } from './zh/review'
import { scan } from './zh/scan'
import { run } from './zh/run'
import { config } from './zh/config'
import { providers } from './zh/providers'
import { rules } from './zh/rules'
import { sessions } from './zh/sessions'
import { sessionDetail } from './zh/sessionDetail'
import { finding } from './zh/finding'
import { result } from './zh/result'
import { logs } from './zh/logs'

export const zh: Record<MessageKey, string> = {
  ...shell,
  ...overview,
  ...review,
  ...scan,
  ...run,
  ...config,
  ...providers,
  ...rules,
  ...sessions,
  ...sessionDetail,
  ...finding,
  ...result,
  ...logs,
}
