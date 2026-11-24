// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export function readyURL(output) {
  return output.match(/Web Console ready: (http:\/\/127\.0\.0\.1:\d+)(?=\s)/)?.[1];
}

export function isLocalNavigation(target, origin) {
  try {
    return new URL(target).origin === origin;
  } catch {
    return false;
  }
}
