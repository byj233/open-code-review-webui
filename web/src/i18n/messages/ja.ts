// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type { MessageKey } from '../index'
import { shell } from './ja/shell'
import { overview } from './ja/overview'
import { review } from './ja/review'
import { scan } from './ja/scan'
import { run } from './ja/run'
import { config } from './ja/config'
import { providers } from './ja/providers'
import { rules } from './ja/rules'
import { sessions } from './ja/sessions'
import { sessionDetail } from './ja/sessionDetail'
import { finding } from './ja/finding'
import { result } from './ja/result'
import { logs } from './ja/logs'

export const ja: Record<MessageKey, string> = {
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
