// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const review = {
  'review.header.eyebrow': '차이 리뷰',
  'review.header.title': '코드 변경 사항 리뷰',
  'review.header.description':
    '작업 트리 차이, 단일 커밋 또는 브랜치 범위를 구성된 모델로 보냅니다. 콘솔은 CLI와 동일한 에이전트 리뷰를 실행합니다.',
  'review.header.sessionHistory': '세션 기록',

  'review.resume.lead': '세션 재개: ',
  'review.resume.tail':
    '. 재사용된 파일 체크포인트는 유지되며, 공급자와 모델은 이전 실행과 일치해야 합니다.',
  'review.resume.clear': '지우기',

  'review.scope.title': '범위 선택',
  'review.scope.subtitle': '리뷰에서 무엇을 살펴볼까요?',

  'review.mode.workspace.label': '작업 트리',
  'review.mode.workspace.description': '스테이지된 파일, 스테이지되지 않은 파일, 추적되지 않은 파일',
  'review.mode.commit.label': '단일 커밋',
  'review.mode.commit.description': '커밋과 부모를 비교해 차이를 확인합니다.',
  'review.mode.range.label': '브랜치 범위',
  'review.mode.range.description': '머지 베이스를 기준으로 두 ref를 비교합니다.',

  'review.commit.label': '커밋 또는 태그',
  'review.commit.placeholder': 'abc1234, v1.2.0 또는 HEAD~1',
  'review.commit.hint': '부모 커밋이 차이의 기준으로 사용됩니다.',

  'review.range.from': '시작 ref',
  'review.range.fromPlaceholder': 'main',
  'review.range.to': '대상 ref',
  'review.range.toPlaceholder': 'feature/my-branch',
  'review.range.swap': 'ref 교체',

  'review.workspace.changed': '작업 트리에서 변경된 파일 {count}개 | 작업 트리에서 변경된 파일 {count}개',
  'review.workspace.noRepo': '리포지토리를 찾을 수 없습니다',
  'review.workspace.counts': '{staged}개 스테이지됨 · {unstaged}개 스테이지되지 않음 · {untracked}개 추적되지 않음',
  'review.workspace.noRepoHint': '변경 사항을 리뷰하려면 git 리포지토리에서 콘솔을 시작해야 합니다.',

  'review.context.title': '컨텍스트 추가',
  'review.context.subtitle': '선택 사항이지만 리뷰를 더 정확하게 만듭니다.',
  'review.context.placeholder':
    '이번 변경으로 무엇을 달성하려는지 적어 주세요. 예: 로그인 API에 요청 제한 추가, 결제를 새 스키마로 이전.',
  'review.context.hint': '의도, 제약 조건, 마이그레이션 참고 사항을 적어 주세요. 비밀 정보는 붙여넣지 마세요.',

  'review.advanced.title': '고급 옵션',

  'review.effort.label': '리뷰 강도',
  'review.effort.default': '기본값',
  'review.effort.low': '낮음',
  'review.effort.medium': '보통',
  'review.effort.high': '높음',
  'review.effort.hint.default': '구성된 강도를 사용합니다(설정에서 변경하지 않으면 보통).',
  'review.effort.hint.low': '그룹당 한 번의 리뷰 라운드를 진행합니다. 가장 빠르며 작은 변경에 적합합니다.',
  'review.effort.hint.medium': '그룹당 두 번의 리뷰 라운드를 진행합니다. 기본 균형 설정입니다.',
  'review.effort.hint.high': '그룹당 최대 세 번의 리뷰 라운드를 진행합니다. 느리지만 미묘하거나 위험한 변경에 적합합니다.',

  'review.override.provider': '공급자 재정의',
  'review.override.providerPlaceholder': '구성된 공급자 사용',
  'review.override.model': '모델 재정의',
  'review.override.modelPlaceholder': '구성된 모델 사용',
  'review.override.hint': '이번 실행에만 적용됩니다.',
  'review.override.summaryBoth': '공급자 + 모델 재정의',
  'review.override.summaryProvider': '공급자 재정의',
  'review.override.summaryModel': '모델 재정의',
  'review.override.concurrency': '동시 실행 수',
  'review.override.concurrencyHint': '병렬로 실행되는 리뷰 하위 작업 수입니다.',
  'review.override.timeout': '작업 타임아웃(분)',
  'review.override.timeoutHint': '0은 작업별 제한이 없음을 의미합니다.',
  'review.override.maxTokens': '그룹당 최대 토큰 수',
  'review.override.maxTokensHint': '0은 구성된 기본값을 사용합니다.',
  'review.override.budget': '토큰 예산',
  'review.override.budgetHint': '0은 무제한을 의미합니다.',
  'review.override.exclude': '제외 패턴',
  'review.override.excludePlaceholder': '**/generated/*, **/testdata/*',
  'review.override.excludeHint': '쉼표로 구분된 gitignore 스타일 패턴으로, 프로젝트 규칙과 병합됩니다.',

  'review.filter.title': '사후 필터링 건너뛰기',
  'review.filter.description': '신뢰도가 낮은 참고 사항을 포함해 에이전트가 제출한 모든 코멘트를 유지합니다.',

  'review.command.label': '동일한 명령',
  'review.actions.preview': '범위 미리보기',
  'review.actions.start': '리뷰 시작',

  'review.model.title': '활성 모델',
  'review.model.subtitle': '이번 실행에서 결정된 값',
  'review.model.auth': '인증',
  'review.model.effort': '강도',
  'review.model.resume': '재개',
  'review.model.configuredDefault': '구성된 기본값',
  'review.model.noProvider': '구성된 공급자 없음',
  'review.model.selectModel': '모델 선택',
  'review.model.noModel': '선택된 모델 없음',
  'review.model.warning': '구성된 모델이 없습니다. 리뷰를 실행하기 전에 공급자를 선택하세요.',
  'review.model.manage': '공급자 관리',

  'review.pipeline.title': '리뷰 파이프라인',
  'review.pipeline.subtitle': '시작한 뒤 진행되는 과정',
  'review.pipeline.select.title': '선택 및 필터링',
  'review.pipeline.select.description': '차이를 읽고 규칙을 적용하며, 바이너리 파일, 비밀 정보, 크기가 너무 큰 파일을 제외합니다.',
  'review.pipeline.group.title': '관련 파일 그룹화',
  'review.pipeline.group.description': '함께 다뤄야 할 파일을 묶어 각 리뷰 단위가 충분한 컨텍스트를 갖도록 합니다.',
  'review.pipeline.review.title': '에이전트 리뷰',
  'review.pipeline.review.description': '에이전트가 코드를 읽고 리포지토리를 검색하며, 행 단위로 정확한 지적 사항을 제출합니다.',
  'review.pipeline.save.title': '필터링 및 저장',
  'review.pipeline.save.description': '신뢰도가 낮은 코멘트를 필터링한 뒤 지적 사항과 커버리지를 저장합니다.',

  'review.tip.title': '좋은 리뷰는 의도에서 시작됩니다',
  'review.tip.text': '변경의 배경을 추가하면 도움이 됩니다. 에이전트는 이를 바탕으로 의도적인 트레이드오프와 버그를 구분하므로 불필요한 지적 사항이 줄어듭니다.',
  'review.tip.foot': '미리보기는 모델 토큰을 소모하지 않습니다.',

  'review.error.noRepo': '리뷰를 실행하려면 git 리포지토리에서 콘솔을 열어야 합니다.',
  'review.error.commit': '리뷰할 커밋 또는 태그를 선택해야 합니다.',
  'review.error.refs': '시작 ref와 대상 ref를 모두 선택해야 합니다.',
  'review.error.sameRefs': '시작 ref와 대상 ref는 달라야 합니다.',
  'review.error.busy': '리뷰가 이미 시작 중입니다.',
} satisfies Record<string, string>
