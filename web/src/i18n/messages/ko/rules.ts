// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const rules = {
  'rules.header.eyebrow': '참고',
  'rules.header.description':
    '내장 언어 규칙은 모델이 어떤 부분에 주목할지 결정합니다. 프로젝트 규칙과 전역 규칙이 이를 재정의할 수 있습니다. 이 페이지는 시스템 계층을 보여 주고, 경로를 모든 계층에 대해 확인합니다.',
  'rules.header.reload': '다시 불러오기',

  'rules.list.title': '내장 규칙',
  'rules.list.subtitle': '패턴 {count}개와 기본 폴백',
  'rules.list.searchPlaceholder': '패턴 또는 규칙 텍스트 검색',
  'rules.list.defaultTitle': '기본 폴백',
  'rules.list.defaultHint': '일치하는 패턴이 없을 때 사용됩니다',
  'rules.list.emptyTitle': '일치하는 규칙 없음',
  'rules.list.emptyDescription': '검색을 지우면 모든 내장 규칙을 볼 수 있습니다.',
  'rules.list.footer': '내장 패턴 {count}개',

  'rules.lookup.title': '어떤 규칙이 적용되나요?',
  'rules.lookup.subtitle': '사용자 지정, 프로젝트, 전역 및 시스템 계층에서 경로를 확인합니다',
  'rules.lookup.placeholder': '예: src/main/java/com/example/Foo.java',
  'rules.lookup.submit': '규칙 찾기',
  'rules.lookup.hint': '리뷰에서 사용하는 것과 동일한 리졸버를 읽습니다. 모델 호출은 발생하지 않습니다.',
  'rules.lookup.contentSniff': '콘텐츠 스니핑: {value}',
  'rules.lookup.empty': '리포지토리 기준 파일 경로를 입력하면 에이전트가 사용할 규칙을 확인할 수 있습니다.',

  'rules.detail.copy': '규칙 복사',
  'rules.detail.defaultTitle': '기본 폴백 규칙',
  'rules.detail.defaultSubtitle': '경로 패턴이 일치하지 않을 때 적용됩니다',
  'rules.detail.patternSubtitle': '내장 패턴 {pattern}',
  'rules.detail.genericTitle': '규칙',
  'rules.detail.emptyTitle': '규칙 선택',
  'rules.detail.emptyDescription': '목록에서 패턴을 선택하면 해당 안내를 볼 수 있습니다.',

  'rules.hint.braceExpanded': '중괄호가 여러 경로 패턴으로 확장되었습니다',
  'rules.hint.projectManifest': '프로젝트 매니페스트 안내',
  'rules.hint.xmlMapping': 'XML 매핑 안내',
  'rules.hint.firstMatch': '첫 번째로 일치하는 패턴이 적용됩니다',

  'rules.source.custom': '사용자 지정 규칙',
  'rules.source.project': '프로젝트 규칙',
  'rules.source.global': '전역 규칙',
  'rules.source.system': '내장 시스템 규칙',
  'rules.source.fallback': '규칙',

  'rules.message.copied': '규칙을 복사했습니다',
  'rules.message.copyFailed': '규칙을 복사하지 못했습니다',
} satisfies Record<string, string>
