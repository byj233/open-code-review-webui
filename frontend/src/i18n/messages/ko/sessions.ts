// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessions = {
  'sessions.header.description':
    '모든 리뷰와 스캔은 ~/.opencodereview/sessions 아래에 JSONL 세션으로 저장됩니다. 세션을 열면 지적 사항, 커버리지 및 실행 매니페스트를 확인할 수 있습니다.',

  'sessions.stat.findings': '지적 사항',
  'sessions.stat.files': '리뷰한 파일',
  'sessions.stat.average': '평균 지적 사항',
  'sessions.stat.latest': '최근 세션 {when}',
  'sessions.stat.noHistory': '기록 없음',
  'sessions.stat.findingsHint': '저장된 세션 전체',
  'sessions.stat.filesHint': '완료된 파일 항목',
  'sessions.stat.averageHint': '저장된 세션당',

  'sessions.toolbar.searchPlaceholder': 'ID, 모델, 브랜치 또는 ref 검색',
  'sessions.toolbar.shown': '{count}개 표시',

  'sessions.filter.all': '전체',

  'sessions.table.started': '시작 시간',
  'sessions.table.model': '모델',
  'sessions.table.scope': '브랜치 / 범위',
  'sessions.table.files': '파일',
  'sessions.table.findings': '지적 사항',
  'sessions.table.duration': '소요 시간',

  'sessions.row.resumed': '재개됨',

  'sessions.scope.wholeRepository': '전체 리포지토리',
  'sessions.scope.commit': '커밋 {id}',
  'sessions.scope.commitOnly': '커밋',
  'sessions.scope.workingTree': '작업 트리',

  'sessions.empty.noMatch': '일치하는 세션 없음',
  'sessions.empty.none': '세션 없음',
  'sessions.empty.noMatchHint': '다른 검색어나 상태 필터를 사용해 보세요.',
  'sessions.empty.noneHint': '리뷰나 스캔을 실행하면 그 지적 사항이 여기에 저장됩니다.',
  'sessions.empty.runReview': '리뷰 실행',
  'sessions.empty.clearFilters': '필터 지우기',

  'sessions.footer.summary': '세션 {count}개 · 페이지 {page}',

  'sessions.delete.dialogTitle': '세션 삭제',
  'sessions.delete.action': '세션 삭제',
  'sessions.delete.description':
    '디스크에서 저장된 세션과 지적 사항을 삭제합니다. 리뷰 자체에는 영향이 없지만 기록은 복구할 수 없습니다.',
  'sessions.delete.success': '세션을 삭제했습니다',
} satisfies Record<string, string>;
