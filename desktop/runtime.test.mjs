// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readyURL, isLocalNavigation } from './runtime.mjs';

test('only accepts a complete loopback readiness URL', () => {
  assert.equal(readyURL('Web Console ready: http://127.0.0.1:54321\n'), 'http://127.0.0.1:54321');
  assert.equal(readyURL('Web Console ready: http://example.com:54321\n'), undefined);
  assert.equal(readyURL('Web Console ready: http://127.0.0.'), undefined);
  assert.equal(readyURL('Web Console ready: http://127.0.0.1:54'), undefined);
  assert.equal(readyURL('Web Console ready: http://127.0.0.1:54321.evil.com'), undefined);
});

test('navigation stays on the managed backend origin', () => {
  const origin = 'http://127.0.0.1:54321';
  assert.equal(isLocalNavigation(`${origin}/reviews`, origin), true);
  for (const target of ['http://127.0.0.1:1234', 'https://example.com', 'file:///etc/passwd', 'invalid']) {
    assert.equal(isLocalNavigation(target, origin), false);
  }
});
