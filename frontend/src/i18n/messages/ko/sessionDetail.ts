// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessionDetail = {
  'sessionDetail.header.back': '세션으로 돌아가기',
  'sessionDetail.header.aborted': '중단됨',
  'sessionDetail.header.started': '{date}에 시작',
  'sessionDetail.header.took': '{duration} 소요',
  'sessionDetail.header.withModel': '{model} 사용',
  'sessionDetail.header.description': '{parts}.',

  'sessionDetail.callouts.interrupted':
    '이 세션은 완료되기 전에 중단되었습니다. 중단 전에 저장된 지적 사항은 계속 확인할 수 있습니다.',
  'sessionDetail.callouts.failureTitle': '{classification}.',
  'sessionDetail.callouts.failureFallback': '실행 실패',
  'sessionDetail.callouts.failureReason': '매니페스트에 실행 수준 실패가 기록되었습니다.',

  'sessionDetail.actions.resume': '재개',
  'sessionDetail.actions.resumeTooltip': '새 실행에서 이 리뷰를 계속합니다',
  'sessionDetail.actions.resumeDisabled': '커밋 세션과 범위 세션만 재개할 수 있습니다',
  'sessionDetail.actions.copyId': 'ID 복사',

  'sessionDetail.stats.findings': '지적 사항',
  'sessionDetail.stats.filesReviewed': '리뷰한 파일',
  'sessionDetail.stats.reusedWaived': '{reused}개 재사용 · {waived}개 면제',
  'sessionDetail.stats.failedFiles': '실패한 파일',
  'sessionDetail.stats.seeCoverage': '아래 커버리지 참고',
  'sessionDetail.stats.noFileFailures': '파일 수준 실패 없음',
  'sessionDetail.stats.duration': '소요 시간',
  'sessionDetail.stats.severityHint': '심각 {critical} · 높음 {high} · 보통 {medium}',

  'sessionDetail.tabs.findings': '지적 사항',
  'sessionDetail.tabs.fileItems': '파일 항목',
  'sessionDetail.tabs.manifest': '매니페스트',

  'sessionDetail.findings.searchPlaceholder': '지적 사항 검색',
  'sessionDetail.findings.allCategories': '모든 카테고리',
  'sessionDetail.findings.count': '{count}개 지적 사항 | {count}개 지적 사항',
  'sessionDetail.findings.emptyFilteredTitle': '이 필터와 일치하는 항목이 없습니다',
  'sessionDetail.findings.emptyFilteredText': '검색을 지우거나 다른 심각도를 선택하세요.',
  'sessionDetail.findings.emptyTitle': '이 세션에 지적 사항이 없습니다',
  'sessionDetail.findings.emptyText': '실행이 완료되었지만 리뷰 의견이 기록되지 않았습니다.',

  'sessionDetail.files.noFindings': '지적 사항 없음',
  'sessionDetail.files.emptyTitle': '파일 항목 없음',
  'sessionDetail.files.emptyText': '이 세션에는 파일별 체크포인트가 기록되지 않았습니다.',

  'sessionDetail.coverage.selected': '선택됨',
  'sessionDetail.coverage.completed': '완료',
  'sessionDetail.coverage.reused': '재사용',
  'sessionDetail.coverage.failed': '실패',
  'sessionDetail.coverage.waived': '면제',

  'sessionDetail.manifest.terminalState': '종료 상태',
  'sessionDetail.manifest.operation': '작업',
  'sessionDetail.manifest.runId': '실행 ID',
  'sessionDetail.manifest.parentRun': '상위 실행',
  'sessionDetail.manifest.elapsed': '매니페스트 소요 시간',
  'sessionDetail.manifest.rawJson': '원본 매니페스트 JSON',
  'sessionDetail.manifest.emptyTitle': '매니페스트 기록 없음',
  'sessionDetail.manifest.emptyText': '실행 매니페스트가 도입되기 전에 생성된 레거시 세션입니다.',

  'sessionDetail.severity.all': '전체',

  'sessionDetail.delete.title': '세션 삭제',
  'sessionDetail.delete.text':
    '디스크에서 저장된 JSONL 세션과 해당 세션의 모든 지적 사항을 삭제합니다. 이 작업은 되돌릴 수 없습니다.',
  'sessionDetail.delete.confirm': '세션 삭제',

  'sessionDetail.notFound.title': '세션을 찾을 수 없음',
  'sessionDetail.notFound.text': '세션이 삭제되었거나 콘솔이 다시 시작되었을 수 있습니다.',
  'sessionDetail.notFound.emptyTitle': '표시할 내용 없음',
  'sessionDetail.notFound.emptyText': '기록 목록에서 다른 세션을 선택하세요.',
  'sessionDetail.notFound.browse': '세션 둘러보기',

  'sessionDetail.actions.copied': '세션 ID를 복사했습니다',
  'sessionDetail.actions.copyFailed': '세션 ID를 복사하지 못했습니다',
  'sessionDetail.actions.deleted': '세션을 삭제했습니다',
} satisfies Record<string, string>;
