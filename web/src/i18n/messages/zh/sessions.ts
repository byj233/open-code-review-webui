// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export const sessions = {
  'sessions.header.description':
    '每一次审查和扫描都会以 JSONL 会话的形式保存到 ~/.opencodereview/sessions 下。打开一个会话即可查看问题、覆盖情况和运行清单。',

  'sessions.stat.findings': '问题',
  'sessions.stat.files': '已审查文件',
  'sessions.stat.average': '平均问题数',
  'sessions.stat.latest': '最新会话 {when}',
  'sessions.stat.noHistory': '暂无历史',
  'sessions.stat.findingsHint': '来自已保存的会话',
  'sessions.stat.filesHint': '已完成的文件项',
  'sessions.stat.averageHint': '每个已保存会话',

  'sessions.toolbar.searchPlaceholder': '搜索 ID、模型、分支或 ref',
  'sessions.toolbar.shown': '显示 {count} 项',

  'sessions.filter.all': '全部',

  'sessions.table.started': '开始时间',
  'sessions.table.model': '模型',
  'sessions.table.scope': '分支 / 范围',
  'sessions.table.files': '文件',
  'sessions.table.findings': '问题',
  'sessions.table.duration': '耗时',

  'sessions.row.resumed': '已恢复',

  'sessions.scope.wholeRepository': '整个仓库',
  'sessions.scope.commit': '提交 {id}',
  'sessions.scope.commitOnly': '提交',
  'sessions.scope.workingTree': '工作区',

  'sessions.empty.noMatch': '没有匹配的会话',
  'sessions.empty.none': '暂无会话',
  'sessions.empty.noMatchHint': '试试其他搜索词或状态筛选。',
  'sessions.empty.noneHint': '运行一次审查或扫描，结果会保存在这里。',
  'sessions.empty.runReview': '运行审查',
  'sessions.empty.clearFilters': '清除筛选',

  'sessions.footer.summary': '共 {count} 个会话 · 第 {page} 页',

  'sessions.delete.dialogTitle': '删除会话',
  'sessions.delete.action': '删除会话',
  'sessions.delete.description': '这会从磁盘删除已保存的会话及其问题。审查本身不受影响，但历史记录将无法恢复。',
  'sessions.delete.success': '会话已删除',
} satisfies Record<string, string>
