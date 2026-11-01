// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type { MessageKey } from '../index'
import { shell } from './ru/shell'
import { overview } from './ru/overview'
import { review } from './ru/review'
import { scan } from './ru/scan'
import { run } from './ru/run'
import { config } from './ru/config'
import { providers } from './ru/providers'
import { rules } from './ru/rules'
import { sessions } from './ru/sessions'
import { sessionDetail } from './ru/sessionDetail'
import { finding } from './ru/finding'
import { result } from './ru/result'
import { logs } from './ru/logs'

export const ru: Record<MessageKey, string> = {
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
