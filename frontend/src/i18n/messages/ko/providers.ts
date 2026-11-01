// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const providers = {
  'providers.page.description':
    '코드를 리뷰할 모델을 선택합니다. 키는 ~/.opencodereview/config.json에 보관되며 이 페이지로 다시 전송되지 않습니다.',
  'providers.actions.customProvider': '사용자 지정 공급자',
  'providers.actions.testConnection': '연결 테스트',

  'providers.banner.active': '활성 공급자',
  'providers.banner.noModelConfigured': '구성된 모델 없음',
  'providers.banner.choose': '아래에서 공급자를 선택하세요',
  'providers.banner.noModel': '선택된 모델 없음',
  'providers.banner.changeModel': '모델 변경',
  'providers.banner.openSettings': '설정 열기',

  'providers.toolbar.searchPlaceholder': '공급자, 모델 또는 환경 변수 검색',
  'providers.toolbar.configuredOnly': '구성된 항목만',
  'providers.toolbar.configuredCount': '{total}개 중 {configured}개 구성됨',

  'providers.builtin.title': '내장 공급자',
  'providers.builtin.subtitle': '프리셋에는 엔드포인트, 프로토콜 및 추천 모델이 포함되어 있습니다.',
  'providers.builtin.emptyTitle': '일치하는 내장 공급자가 없습니다',
  'providers.builtin.emptyDescription': '검색을 지우거나 “구성된 항목만” 필터를 끄세요.',

  'providers.card.active': '활성',
  'providers.card.noModelsYet': '아직 모델 없음',
  'providers.card.modelListNotPreset': '모델 목록 미설정',
  'providers.card.configure': '구성',
  'providers.card.use': '사용',
  'providers.card.setUp': '설정',

  'providers.custom.title': '사용자 지정 공급자',
  'providers.custom.subtitle': 'OpenAI 호환 또는 Anthropic 호환 엔드포인트라면 무엇이든 됩니다.',
  'providers.custom.addTitle': '사용자 지정 공급자 추가',
  'providers.custom.addText': '게이트웨이, 로컬 프록시 또는 비공개 OpenAI 호환 엔드포인트.',

  'providers.dialog.titleAdd': '사용자 지정 공급자 추가',
  'providers.dialog.titleActive': '활성 공급자 구성',
  'providers.dialog.titleNamed': '{name} 구성',
  'providers.dialog.titleFallback': '공급자 구성',
  'providers.dialog.introNew':
    '직접 제어하는 엔드포인트를 콘솔에 지정합니다. 프로토콜과 URL은 custom_providers에 저장됩니다.',
  'providers.dialog.introActive':
    '모델을 변경하면 활성 공급자에 기록됩니다. 새 키를 붙여넣지 않으면 저장된 키가 유지됩니다.',
  'providers.dialog.introDefault':
    '이 공급자에 사용할 모델을 선택한 다음 리뷰 및 스캔 실행에 사용하도록 활성화하세요.',
  'providers.dialog.currentlyActive': '현재 이 공급자가 활성 상태입니다.',
  'providers.dialog.nameLabel': '공급자 이름',
  'providers.dialog.nameHint': '영문자, 숫자, 마침표 및 대시를 사용할 수 있습니다. 구성 키에 사용됩니다.',
  'providers.dialog.modelLabel': '모델',
  'providers.dialog.modelPlaceholder': '모델 ID를 선택하거나 입력하세요',
  'providers.dialog.urlLabel': '엔드포인트 URL',
  'providers.dialog.protocolLabel': '프로토콜',
  'providers.dialog.apiKeyLabel': 'API 키',
  'providers.dialog.keyStoredPlaceholder': '저장된 키 있음 - 바꾸려면 붙여넣기',
  'providers.dialog.keyPlaceholder': 'API 키를 붙여넣으세요',
  'providers.dialog.keyOptionalHint': '이 단계에서는 선택 사항이며 나중에 추가할 수 있습니다.',
  'providers.dialog.keyKeepHint':
    '비워 두면 저장된 키가 유지됩니다. 키는 이 콘솔에 표시되지 않습니다.',
  'providers.dialog.ambientAuthNote':
    '이 공급자는 환경에서 제공되는 AWS 자격 증명 체인을 통해 인증합니다. 필요하면 설정에서 AWS 리전과 프로파일을 지정하세요.',
  // The edge spaces keep the inline `ocr auth login` code span spaced in the template.
  'providers.dialog.signInBefore': '이 공급자는 대화형 로그인을 사용합니다. 터미널에서 ',
  'providers.dialog.signInAfter': ' 명령을 실행한 다음 여기로 돌아오세요.',
  'providers.dialog.add': '공급자 추가',
  'providers.dialog.saveModel': '모델 저장',
  'providers.dialog.useProvider': '공급자 사용',

  'providers.protocol.anthropicMessages': 'Anthropic messages',
  'providers.protocol.openaiChat': 'OpenAI chat completions',
  'providers.protocol.openaiResponses': 'OpenAI responses',
  'providers.protocol.openaiCompatible': 'OpenAI compatible',
  'providers.protocol.bedrock': 'AWS Bedrock',
  'providers.protocol.notSet': '프로토콜 미설정',

  'providers.validation.modelRequired': '이 공급자에 사용할 모델을 선택하세요.',
  'providers.validation.urlRequired': '엔드포인트 URL이 필요합니다.',
  'providers.validation.urlInvalid': '엔드포인트는 http:// 또는 https://로 시작해야 합니다.',
  'providers.validation.nameInvalid': '공급자 이름에는 영문자, 숫자, 마침표 및 대시만 사용할 수 있습니다.',
  'providers.validation.nameReserved': '해당 이름은 내장 공급자의 이름입니다.',

  'providers.toast.added': '사용자 지정 공급자를 추가했습니다',
  'providers.toast.activated': '공급자를 활성화했습니다',
} satisfies Record<string, string>
