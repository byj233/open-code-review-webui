// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const result = {
  'result.filters.all': '全部',

  'result.preview.filesChanged': '变更文件',
  'result.preview.willReview': '将审查',
  'result.preview.sentToModel': '已发送给模型',
  'result.preview.excluded': '已排除',
  'result.preview.filteredBeforeDispatch': '发送前已过滤',
  'result.preview.filesInScope': '范围内的文件',
  'result.preview.noTokensSpent': '生成此预览未消耗模型 Token。',
  'result.preview.filterPlaceholder': '筛选文件',
  'result.preview.willReviewRow': '将审查',
  'result.preview.noFilesMatch': '没有匹配的文件',
  'result.preview.tryClearingFilter': '尝试清除筛选条件。',
  'result.preview.noReviewableChanges': '此范围内没有可审查的改动。',

  'result.review.filesReviewed': '已审查文件',
  'result.review.coverageNotRecorded': '未记录覆盖率',
  'result.review.coverageSelected': '已完成 {completed} / {selected} 个选中文件',
  'result.review.findings': '问题',
  'result.review.severityHint': '严重 {critical} · 高危 {high}',
  'result.review.tokens': 'Token',
  'result.review.tokenHint': '输入 {input} · 输出 {output}',
  'result.review.elapsed': '耗时',
  'result.review.modelNotRecorded': '未记录模型',
  'result.review.warningCount.one': '{count} 个警告',
  'result.review.warningCount.other': '{count} 个警告',

  'result.findings.showing': '已显示 {shown} / {total}',
  'result.findings.filterPlaceholder': '筛选问题',
  'result.findings.allCategories': '全部分类',
  'result.findings.noMatchesTitle': '没有匹配的问题',
  'result.findings.noMatchesText': '清除搜索条件，或选择其他严重级别。',
  'result.findings.emptyTitle': '未发现问题，看起来不错。',
  'result.findings.emptyText': '审查已完成，所选文件没有报告任何问题。',
  'result.findings.fileCount.one': '{count} 个问题',
  'result.findings.fileCount.other': '{count} 个问题',

  'result.projectSummary.title': '项目总结',
  'result.projectSummary.subtitle': '由扫描的总结阶段生成',

  'result.coverage.title': '覆盖率',
  'result.coverage.subtitle': '本次运行覆盖范围的冻结清单',
  'result.coverage.selected': '已选中',
  'result.coverage.completed': '已完成',
  'result.coverage.reused': '已复用',
  'result.coverage.failed': '失败',
  'result.coverage.waived': '已豁免',
  'result.coverage.runFailure': '运行失败',

  'result.empty.title': '无结构化结果',
  'result.empty.description': '此命令未返回 JSON 文档，请查看活动日志中的输出。',
} satisfies Record<string, string>
