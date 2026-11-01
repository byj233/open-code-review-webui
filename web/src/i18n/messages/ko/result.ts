// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const result = {
  'result.filters.all': '전체',

  'result.preview.filesChanged': '변경된 파일',
  'result.preview.willReview': '리뷰 예정',
  'result.preview.sentToModel': '모델로 전송',
  'result.preview.excluded': '제외됨',
  'result.preview.filteredBeforeDispatch': '전송 전 필터링됨',
  'result.preview.filesInScope': '범위 내 파일',
  'result.preview.noTokensSpent': '이 미리보기를 생성하는 데 모델 토큰이 사용되지 않았습니다.',
  'result.preview.filterPlaceholder': '파일 필터',
  'result.preview.willReviewRow': '리뷰 예정',
  'result.preview.noFilesMatch': '일치하는 파일 없음',
  'result.preview.tryClearingFilter': '필터를 지워 보세요.',
  'result.preview.noReviewableChanges': '이 범위에서 리뷰할 변경 사항을 찾지 못했습니다.',

  'result.review.filesReviewed': '리뷰한 파일',
  'result.review.coverageNotRecorded': '커버리지 기록 없음',
  'result.review.coverageSelected': '{completed}개 완료 · {selected}개 선택',
  'result.review.findings': '지적 사항',
  'result.review.severityHint': '심각 {critical} · 높음 {high}',
  'result.review.tokens': '토큰',
  'result.review.tokenHint': '입력 {input} · 출력 {output}',
  'result.review.elapsed': '소요 시간',
  'result.review.modelNotRecorded': '모델 기록 없음',
  'result.review.warningCount.one': '{count}개 경고',
  'result.review.warningCount.other': '{count}개 경고',

  'result.findings.showing': '{shown} / {total} 표시',
  'result.findings.filterPlaceholder': '지적 사항 필터',
  'result.findings.allCategories': '모든 카테고리',
  'result.findings.noMatchesTitle': '이 필터와 일치하는 항목이 없습니다',
  'result.findings.noMatchesText': '검색을 지우거나 다른 심각도를 선택하세요.',
  'result.findings.emptyTitle': '지적 사항이 없습니다. 문제가 없어 보입니다.',
  'result.findings.emptyText': '리뷰가 완료되었지만 선택한 파일에 대한 의견이 보고되지 않았습니다.',
  'result.findings.fileCount.one': '{count}개 지적 사항',
  'result.findings.fileCount.other': '{count}개 지적 사항',

  'result.projectSummary.title': '프로젝트 요약',
  'result.projectSummary.subtitle': '스캔의 요약 단계에서 작성',

  'result.coverage.title': '커버리지',
  'result.coverage.subtitle': '이 실행이 다룬 범위를 고정해 둔 매니페스트',
  'result.coverage.selected': '선택됨',
  'result.coverage.completed': '완료',
  'result.coverage.reused': '재사용',
  'result.coverage.failed': '실패',
  'result.coverage.waived': '면제',
  'result.coverage.runFailure': '실행 실패',

  'result.empty.title': '구조화된 결과 없음',
  'result.empty.description':
    '이 명령은 JSON 문서를 반환하지 않았습니다. 출력은 활동 로그에서 확인하세요.',
} satisfies Record<string, string>
