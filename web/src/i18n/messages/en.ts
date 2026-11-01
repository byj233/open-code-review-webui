// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { shell } from './en/shell'
import { overview } from './en/overview'
import { review } from './en/review'
import { scan } from './en/scan'
import { run } from './en/run'
import { config } from './en/config'
import { providers } from './en/providers'
import { rules } from './en/rules'
import { sessions } from './en/sessions'
import { sessionDetail } from './en/sessionDetail'
import { finding } from './en/finding'
import { result } from './en/result'
import { logs } from './en/logs'

export const en = {
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
