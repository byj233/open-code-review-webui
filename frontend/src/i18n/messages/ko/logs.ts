// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const logs = {
  'logs.header.title': '활동 로그',
  'logs.header.live': '실시간',

  'logs.actions.follow': '따라가기',
  'logs.actions.following': '따라가는 중',
  'logs.actions.copy': '로그 복사',
  'logs.actions.copied': '로그를 복사했습니다',
  'logs.actions.copyFailed': '로그를 복사하지 못했습니다',
  'logs.actions.jumpToLatest': '최신으로 이동',

  'logs.empty.starting': '명령을 시작하는 중이며 출력을 기다리고 있습니다…',
  'logs.empty.none': '이 실행에는 출력이 기록되지 않았습니다.',

  'logs.footer.lineCount': '{count}줄 | {count}줄',
  'logs.footer.trimmed': '이전 출력이 잘렸습니다',
  'logs.footer.running': '명령 실행 중',
  'logs.footer.complete': '출력 완료',
} satisfies Record<string, string>;
