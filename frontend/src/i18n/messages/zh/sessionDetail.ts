// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessionDetail = {
  'sessionDetail.header.back': '返回会话列表',
  'sessionDetail.header.aborted': '已中断',
  'sessionDetail.header.started': '开始于 {date}',
  'sessionDetail.header.took': '用时 {duration}',
  'sessionDetail.header.withModel': '使用 {model}',
  'sessionDetail.header.description': '{parts}。',

  'sessionDetail.callouts.interrupted': '本次会话在完成前被中断。中断前保存的问题仍然可用。',
  'sessionDetail.callouts.failureTitle': '{classification}。',
  'sessionDetail.callouts.failureFallback': '运行失败',
  'sessionDetail.callouts.failureReason': '运行清单记录了一次运行级失败。',

  'sessionDetail.actions.resume': '恢复',
  'sessionDetail.actions.resumeTooltip': '在新的运行中继续本次审查',
  'sessionDetail.actions.resumeDisabled': '只有提交和分支区间的会话可以恢复',
  'sessionDetail.actions.copyId': '复制 ID',

  'sessionDetail.stats.findings': '问题',
  'sessionDetail.stats.filesReviewed': '已审查文件',
  'sessionDetail.stats.reusedWaived': '{reused} 个已复用 · {waived} 个已豁免',
  'sessionDetail.stats.failedFiles': '失败文件',
  'sessionDetail.stats.seeCoverage': '见下方覆盖情况',
  'sessionDetail.stats.noFileFailures': '没有文件级失败',
  'sessionDetail.stats.duration': '耗时',
  'sessionDetail.stats.severityHint': '严重 {critical} · 高危 {high} · 中危 {medium}',

  'sessionDetail.tabs.findings': '问题',
  'sessionDetail.tabs.fileItems': '文件项',
  'sessionDetail.tabs.manifest': '运行清单',

  'sessionDetail.findings.searchPlaceholder': '搜索问题',
  'sessionDetail.findings.allCategories': '全部分类',
  'sessionDetail.findings.count': '{count} 个问题 | {count} 个问题',
  'sessionDetail.findings.emptyFilteredTitle': '没有匹配的问题',
  'sessionDetail.findings.emptyFilteredText': '清除搜索条件，或选择其他严重级别。',
  'sessionDetail.findings.emptyTitle': '本次会话没有问题',
  'sessionDetail.findings.emptyText': '运行已完成，但未记录任何审查意见。',

  'sessionDetail.files.noFindings': '无问题',
  'sessionDetail.files.emptyTitle': '没有文件项',
  'sessionDetail.files.emptyText': '本次会话未记录任何文件级检查点。',

  'sessionDetail.coverage.selected': '已选中',
  'sessionDetail.coverage.completed': '已完成',
  'sessionDetail.coverage.reused': '已复用',
  'sessionDetail.coverage.failed': '失败',
  'sessionDetail.coverage.waived': '已豁免',

  'sessionDetail.manifest.terminalState': '终态',
  'sessionDetail.manifest.operation': '操作',
  'sessionDetail.manifest.runId': '运行 ID',
  'sessionDetail.manifest.parentRun': '父运行',
  'sessionDetail.manifest.elapsed': '清单记录耗时',
  'sessionDetail.manifest.rawJson': '原始运行清单 JSON',
  'sessionDetail.manifest.emptyTitle': '未记录运行清单',
  'sessionDetail.manifest.emptyText': '这是引入运行清单之前创建的旧版会话。',

  'sessionDetail.severity.all': '全部',

  'sessionDetail.delete.title': '删除会话',
  'sessionDetail.delete.text': '这会从磁盘上删除已保存的 JSONL 会话及其全部问题。此操作无法撤销。',
  'sessionDetail.delete.confirm': '删除会话',

  'sessionDetail.notFound.title': '未找到会话',
  'sessionDetail.notFound.text': '该会话可能已被删除，或控制台已重启。',
  'sessionDetail.notFound.emptyTitle': '暂无内容',
  'sessionDetail.notFound.emptyText': '请从历史列表中选择其他会话。',
  'sessionDetail.notFound.browse': '浏览会话',

  'sessionDetail.actions.copied': '会话 ID 已复制',
  'sessionDetail.actions.copyFailed': '无法复制会话 ID',
  'sessionDetail.actions.deleted': '会话已删除',
} satisfies Record<string, string>
