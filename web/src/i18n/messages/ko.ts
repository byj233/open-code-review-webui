// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type { MessageKey } from '../index'
import { shell } from './ko/shell'
import { overview } from './ko/overview'
import { review } from './ko/review'
import { scan } from './ko/scan'
import { run } from './ko/run'
import { config } from './ko/config'
import { providers } from './ko/providers'
import { rules } from './ko/rules'
import { sessions } from './ko/sessions'
import { sessionDetail } from './ko/sessionDetail'
import { finding } from './ko/finding'
import { result } from './ko/result'
import { logs } from './ko/logs'

export const ko: Record<MessageKey, string> = {
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
