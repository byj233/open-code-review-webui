// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const overview = {
  'overview.hero.eyebrow': '작업 공간 개요',
  'overview.hero.headlineReview': '코드를 리뷰해 보겠습니다.',
  'overview.hero.headlineNoRepo': '콘솔에서 리포지토리를 지정하세요.',
  'overview.hero.descriptionLead':
    '차이를 리뷰하고, 리포지토리 전체를 스캔하고, 모든 지적 사항을 다시 확인할 수 있습니다. 콘솔은 터미널과 동일한 ',
  'overview.hero.descriptionTail': ' 명령을 실행합니다.',
  'overview.hero.changed': '{count}개 변경',
  'overview.hero.scanRepo': '리포지토리 스캔',
  'overview.hero.branchNotGit': 'Git 리포지토리가 아닙니다',

  'overview.greeting.workingLate': '늦은 시간까지 수고 많으십니다',
  'overview.greeting.morning': '좋은 아침입니다',
  'overview.greeting.afternoon': '좋은 오후입니다',
  'overview.greeting.evening': '좋은 저녁입니다',

  'overview.notGit.title': '이 폴더는 Git 리포지토리가 아닙니다.',
  'overview.notGit.bodyLead':
    '코드 리뷰와 스캔에는 Git 기록이 필요합니다. 리포지토리에서 콘솔을 시작하거나 여기에서 ',
  'overview.notGit.bodyTail': ' 명령을 먼저 실행하세요.',

  'overview.model.connectTitle': '리뷰를 시작하려면 모델을 연결하세요.',
  'overview.model.connectBody':
    '공급자의 API 키를 추가하거나, 콘솔에서 OpenAI 호환 엔드포인트를 지정하세요.',
  'overview.model.chooseProvider': '공급자 선택',
  'overview.model.title': '모델',
  'overview.model.subtitle': '구성, 환경 변수 및 공급자 설정에서 결정됩니다.',
  'overview.model.manage': '관리',
  'overview.model.noProvider': '구성된 공급자 없음',
  'overview.model.selectModel': '시작하려면 모델을 선택하세요',
  'overview.model.auth': '인증',
  'overview.model.source': '소스',
  'overview.model.endpoint': '엔드포인트',
  'overview.model.test': '연결 테스트',
  'overview.model.reviewSettings': '리뷰 설정',

  'overview.quick.reviewTitle': '변경 사항 리뷰',
  'overview.quick.reviewDesc': '작업 트리, 커밋 또는 브랜치 범위',
  'overview.quick.scanTitle': '코드베이스 스캔',
  'overview.quick.scanDesc': '차이 없이 파일 전체 리뷰',
  'overview.quick.modelsTitle': '모델 및 공급자',
  'overview.quick.connectTitle': '모델 연결',
  'overview.quick.manageModels': '모델 관리',
  'overview.quick.providerDesc': 'API 키, 환경 변수 또는 사용자 지정 엔드포인트',

  'overview.stats.changedFiles': '변경된 파일',
  'overview.stats.savedSessions': '저장된 세션',
  'overview.stats.findingsRecorded': '기록된 지적 사항',
  'overview.stats.activeModel': '활성 모델',
  'overview.stats.notSet': '설정되지 않음',
  'overview.stats.gitRequired': '리뷰에는 Git이 필요합니다',
  'overview.stats.dirtySummary': '{staged}개 스테이지됨 · {unstaged}개 스테이지 안 됨 · {untracked}개 추적 안 됨',
  'overview.stats.noHistory': '아직 기록이 없습니다',
  'overview.stats.latest': '{time} 업데이트',
  'overview.stats.acrossSessions': '저장된 세션 전체 기준',
  'overview.stats.latestFindings': '최근 세션에서 {count}건',
  'overview.stats.modelMissing': '구성된 모델 없음',

  'overview.sessions.title': '최근 세션',
  'overview.sessions.subtitle': '지적 사항은 ~/.opencodereview/sessions에 저장됩니다',
  'overview.sessions.viewAll': '모두 보기',
  'overview.sessions.modelUnknown': '모델 기록 없음',
  'overview.sessions.findings': '{count}개 지적 사항 | {count}개 지적 사항',
  'overview.sessions.files': '{completed}/{selected}개 파일 | {completed}/{selected}개 파일',
  'overview.sessions.total': '총 {count}개 세션 | 총 {count}개 세션',
  'overview.sessions.emptyTitle': '아직 세션이 없습니다',
  'overview.sessions.emptyDesc':
    '첫 리뷰가 여기에 표시되며, 모든 지적 사항이 디스크에 저장됩니다.',
  'overview.sessions.run': '리뷰 실행',
  'overview.sessions.browse': '기록 둘러보기',
  'overview.sessions.emptyHistory': '첫 실행부터 기록이 시작됩니다',
  'overview.sessions.noRepo': '리포지토리 없음',

  'overview.workspace.repoStatus': '리포지토리 상태',
  'overview.workspace.staged': '스테이지됨',
  'overview.workspace.unstaged': '스테이지 안 됨',
  'overview.workspace.untracked': '추적 안 됨',
  'overview.workspace.upstream': '업스트림',
  'overview.workspace.recentCommits': '최근 커밋',
  'overview.workspace.noCommits': '아직 커밋이 없습니다.',
  'overview.workspace.emptyDesc':
    'Git 리포지토리에서 콘솔을 열면 차이를 리뷰하고 기록을 보관할 수 있습니다.',

  'overview.activity.title': '최근 활동',
  'overview.activity.subtitle': '이 콘솔에서 시작한 명령',
} satisfies Record<string, string>
