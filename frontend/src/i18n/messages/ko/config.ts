// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const config = {
  'config.page.description':
    '리뷰 기본값, 레거시 엔드포인트 설정, 텔레메트리, MCP 서버를 관리합니다. 변경 사항은 ocr config 명령을 통해 기록되므로 CLI와 이 콘솔의 설정이 어긋나지 않습니다.',
  'config.actions.reload': '새로 고침',
  'config.actions.manageProviders': '공급자 관리',
  'config.common.unsavedChanges': '저장되지 않은 변경 사항',

  'config.model.title': '모델 및 리뷰 기본값',
  'config.model.subtitle': '이 값은 실행별로 재정의하지 않는 한 모든 리뷰와 스캔에 적용됩니다.',
  'config.model.noProvider': '구성된 공급자 없음',
  'config.model.noModel': '선택된 모델 없음',
  'config.model.change': '변경',
  'config.model.modelLabel': '모델',
  'config.model.modelPlaceholder': '공급자에 구성된 모델 사용',
  'config.model.modelHint':
    '활성 공급자에 기록됩니다. 값을 비워 두면 임의로 추측하지 않고 실행이 분명하게 실패합니다.',
  'config.model.effortLabel': '리뷰 강도',
  'config.model.effortDefault': '기본값 사용(보통)',
  'config.model.effortLow': '낮음 - 1라운드',
  'config.model.effortMedium': '보통 - 2라운드',
  'config.model.effortHigh': '높음 - 3라운드',
  'config.model.effortHint': '각 파일 그룹이 받는 리뷰 라운드 수를 제어합니다.',
  'config.model.maxTokensLabel': '그룹당 최대 토큰 수',
  'config.model.maxTokensHint': '0은 설정을 지우고 내장 템플릿의 기본값을 사용합니다.',
  'config.model.languageLabel': '출력 언어',
  'config.model.languagePlaceholder': 'English',
  'config.model.languageHint': '모델이 리뷰 코멘트를 작성할 언어입니다.',
  'config.model.save': '기본값 저장',

  'config.legacy.title': '레거시 엔드포인트(llm.*)',
  'config.legacy.subtitle': '공급자 프리셋 없이 OpenAI 또는 Anthropic과 호환되는 단일 엔드포인트입니다.',
  // The edge spaces keep the inline `llm.*` code span spaced in the template.
  'config.legacy.overrideBefore': '활성 공급자가 ',
  'config.legacy.overrideAfter':
    ' 설정을 재정의합니다. 이 엔드포인트를 사용하려면 먼저 공급자 페이지에서 활성 공급자를 제거해야 합니다.',
  'config.legacy.urlLabel': '엔드포인트 URL',
  'config.legacy.modelLabel': '모델',
  'config.legacy.modelPlaceholder': 'gpt-5.4 또는 claude-sonnet-4-6',
  'config.legacy.protocolLabel': '프로토콜',
  'config.legacy.protocolAnthropic': 'Anthropic 메시지',
  'config.legacy.protocolOpenaiChat': 'OpenAI 채팅 완성',
  'config.legacy.protocolOpenaiResponses': 'OpenAI 응답',
  'config.legacy.timeoutLabel': '요청 타임아웃(초)',
  'config.legacy.timeoutHint': '0은 클라이언트 기본값을 사용합니다.',
  'config.legacy.authTokenLabel': '인증 토큰',
  'config.legacy.authTokenPlaceholderStored': '저장된 토큰 있음 - 붙여넣어 교체',
  'config.legacy.authTokenPlaceholder': '인증 토큰 붙여넣기',
  'config.legacy.authTokenHint': '저장된 토큰은 브라우저로 다시 반환되지 않습니다.',
  'config.legacy.authTokenCmdLabel': '인증 토큰 명령',
  'config.legacy.authTokenCmdHint': '정적 토큰이 저장되어 있지 않을 때만 실행됩니다.',
  'config.legacy.clearToken': '저장된 토큰 지우기',
  'config.legacy.save': '엔드포인트 저장',
  'config.legacy.clearTokenTitle': '인증 토큰 지우기',
  'config.legacy.clearTokenConfirm':
    '저장된 llm.auth_token을 지울까요? 토큰 명령이나 환경 변수에서 토큰을 제공하지 않으면 이 엔드포인트는 실패합니다.',
  'config.legacy.clearTokenConfirmButton': '토큰 지우기',

  'config.telemetry.title': '텔레메트리',
  'config.telemetry.subtitle':
    '기본적으로 꺼져 있습니다. 콘텐츠 로깅은 텔레메트리가 활성화된 경우에만 의미가 있습니다.',
  'config.telemetry.enableTitle': '텔레메트리 사용',
  'config.telemetry.enableText': '리뷰 실행의 추적과 지표를 내보냅니다.',
  'config.telemetry.exporterLabel': '내보내기 도구',
  'config.telemetry.exporterPlaceholder': '기본값',
  'config.telemetry.exporterConsole': '콘솔',
  'config.telemetry.exporterOtlp': 'OTLP',
  'config.telemetry.otlpLabel': 'OTLP 엔드포인트',
  'config.telemetry.contentTitle': '콘텐츠 포함',
  'config.telemetry.contentText': '텔레메트리에 프롬프트와 응답을 추가합니다. 여기에는 소스 코드가 포함될 수 있습니다.',
  'config.telemetry.save': '텔레메트리 저장',

  'config.file.title': '구성 파일',
  'config.file.subtitle': 'CLI가 여전히 설정의 기준입니다',
  'config.file.loading': '불러오는 중…',
  'config.file.exists': '파일 있음',
  'config.file.notCreated': '아직 생성되지 않음',
  'config.file.parseError': '구문 분석 오류',
  'config.file.parseFailed': '구성 파일을 구문 분석할 수 없습니다: {error}',
  // The edge spaces keep the inline `ocr config set` and `ocr config unset` spans spaced.
  'config.file.noteBefore': '모든 저장은 ',
  'config.file.noteBetween': ' 또는 ',
  'config.file.noteAfter': ' 명령을 실행하며, 알 수 없는 필드와 공급자 구성을 그대로 유지합니다.',
  'config.file.copyPath': '경로 복사',
  'config.file.copied': '구성 파일 경로를 복사했습니다',
  'config.file.copyFailed': '구성 파일 경로를 복사하지 못했습니다',

  'config.mcp.title': 'MCP 서버',
  'config.mcp.configuredCount': '{count}개 구성됨',
  'config.mcp.noCommand': '명령 없음',
  'config.mcp.removeServer': 'MCP 서버 제거',
  'config.mcp.removeConfirm': '"{name}" MCP 서버를 구성에서 제거할까요?',
  'config.mcp.removeButton': '제거',
  'config.mcp.emptyTitle': 'MCP 서버 없음',
  'config.mcp.emptyDescription': 'MCP 서버는 터미널에서 ocr config set mcp_servers.<name> 명령으로 관리합니다.',

  'config.secrets.title': '비밀 정보에 대한 참고',
  // The edge spaces keep the inline `*_cmd` code span spaced in the template.
  'config.secrets.textBefore':
    'API 키와 인증 토큰은 한 번만 기록되며 이 페이지로 다시 전송되지 않습니다. 비밀 관리자를 사용한다면 ',
  'config.secrets.textAfter': ' 설정을 권장합니다.',

  'config.toast.saved': '설정을 저장했습니다',
  'config.toast.savedPrefix': '저장됨: ',
} satisfies Record<string, string>;
