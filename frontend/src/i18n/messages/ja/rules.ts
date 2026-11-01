// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const rules = {
  'rules.header.eyebrow': 'リファレンス',
  'rules.header.description':
    '組み込みの言語ルールが、モデルが注目する内容を決めます。プロジェクトルールとグローバルルールで上書きでき、このページではシステム層を表示し、パスを各層に照らして解決します。',
  'rules.header.reload': '再読み込み',

  'rules.list.title': '組み込みルール',
  'rules.list.subtitle': '{count} 件のパターンとデフォルトフォールバック',
  'rules.list.searchPlaceholder': 'パターンまたはルール本文を検索',
  'rules.list.defaultTitle': 'デフォルトフォールバック',
  'rules.list.defaultHint': 'どのパターンにも一致しない場合に使用されます',
  'rules.list.emptyTitle': '一致するルールがありません',
  'rules.list.emptyDescription': '検索をクリアすると、すべての組み込みルールを表示できます。',
  'rules.list.footer': '組み込みパターン {count} 件',

  'rules.lookup.title': 'どのルールが適用される？',
  'rules.lookup.subtitle': 'カスタム、プロジェクト、グローバル、システムの各層にわたってパスを解決します',
  'rules.lookup.placeholder': '例: src/main/java/com/example/Foo.java',
  'rules.lookup.submit': 'ルールを検索',
  'rules.lookup.hint': 'レビューと同じリゾルバーを読み取ります。モデル呼び出しは行われません。',
  'rules.lookup.contentSniff': 'コンテンツ判定: {value}',
  'rules.lookup.empty': 'リポジトリからの相対パスを入力すると、エージェントがどのルールを使うかを確認できます。',

  'rules.detail.copy': 'ルールをコピー',
  'rules.detail.defaultTitle': 'デフォルトフォールバックルール',
  'rules.detail.defaultSubtitle': 'パスのパターンが一致しない場合に適用されます',
  'rules.detail.patternSubtitle': '組み込みパターン {pattern}',
  'rules.detail.genericTitle': 'ルール',
  'rules.detail.emptyTitle': 'ルールを選択',
  'rules.detail.emptyDescription': '一覧からパターンを選ぶと、そのガイダンスを表示します。',

  'rules.hint.braceExpanded': '波かっこ展開により複数のパスパターンに展開されます',
  'rules.hint.projectManifest': 'プロジェクトマニフェストのガイダンス',
  'rules.hint.xmlMapping': 'XML マッピングのガイダンス',
  'rules.hint.firstMatch': '最初に一致したパターンが優先されます',

  'rules.source.custom': 'カスタムルール',
  'rules.source.project': 'プロジェクトルール',
  'rules.source.global': 'グローバルルール',
  'rules.source.system': '組み込みシステムルール',
  'rules.source.fallback': 'ルール',

  'rules.message.copied': 'ルールをコピーしました',
  'rules.message.copyFailed': 'ルールをコピーできませんでした',
} satisfies Record<string, string>;
