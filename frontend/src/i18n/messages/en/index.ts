// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { shell } from './shell';
import { overview } from './overview';
import { review } from './review';
import { scan } from './scan';
import { run } from './run';
import { config } from './config';
import { providers } from './providers';
import { rules } from './rules';
import { sessions } from './sessions';
import { sessionDetail } from './sessionDetail';
import { finding } from './finding';
import { result } from './result';
import { logs } from './logs';

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
};
