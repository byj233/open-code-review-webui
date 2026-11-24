// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const desktop = dirname(fileURLToPath(import.meta.url));
const root = dirname(desktop);
const { version } = JSON.parse(readFileSync(join(desktop, 'package.json'), 'utf8'));
if (process.platform !== 'win32') throw new Error('Build the Windows installer on Windows.');
execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], {
  cwd: join(root, 'frontend'), stdio: 'inherit',
});
mkdirSync(join(desktop, 'bin'), { recursive: true });
execFileSync('go', ['build', '-trimpath', '-ldflags', `-s -w -X main.Version=${version}`,
  '-o', join(desktop, 'bin', 'opencodereview.exe'), './cmd/opencodereview'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, CGO_ENABLED: '0', GOOS: 'windows', GOARCH: 'amd64' },
});
