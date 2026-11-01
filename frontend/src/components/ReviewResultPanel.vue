<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="result">
    <template v-if="preview">
      <div class="summary-grid">
        <div class="summary-tile">
          <span class="summary-tile__label">{{ t('result.preview.filesChanged') }}</span>
          <span class="summary-tile__value">{{ formatCount(preview.total_files) }}</span>
          <span class="summary-tile__hint">
            <span class="add">+{{ formatCount(preview.total_insertions) }}</span>
            <span class="del">-{{ formatCount(preview.total_deletions) }}</span>
          </span>
        </div>
        <div class="summary-tile">
          <span class="summary-tile__label">{{ t('result.preview.willReview') }}</span>
          <span class="summary-tile__value">{{ formatCount(preview.reviewable_count) }}</span>
          <span class="summary-tile__hint">{{ t('result.preview.sentToModel') }}</span>
        </div>
        <div class="summary-tile">
          <span class="summary-tile__label">{{ t('result.preview.excluded') }}</span>
          <span class="summary-tile__value">{{ formatCount(preview.excluded_count) }}</span>
          <span class="summary-tile__hint">{{ t('result.preview.filteredBeforeDispatch') }}</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel__head">
          <div>
            <h3 class="panel__title">{{ t('result.preview.filesInScope') }}</h3>
            <p class="panel__sub">{{ t('result.preview.noTokensSpent') }}</p>
          </div>
          <div class="toolbar">
            <el-input v-model="previewQuery" size="small" clearable :placeholder="t('result.preview.filterPlaceholder')" class="toolbar__search" />
            <div class="segmented">
              <button
                v-for="option in previewFilters"
                :key="option.value"
                type="button"
                class="segmented__item"
                :class="{ 'is-active': previewFilter === option.value }"
                @click="previewFilter = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredPreviewFiles.length" class="preview-list">
          <div v-for="file in filteredPreviewFiles" :key="file.path" class="preview-row">
            <span class="preview-row__status" :class="previewStatusClass(file)">{{ previewStatusLetter(file.status) }}</span>
            <span class="preview-row__path mono" :title="file.path">{{ file.path }}</span>
            <span v-if="!file.will_review" class="preview-row__reason">{{ excludeReasonLabel(file.exclude_reason) }}</span>
            <span v-else class="preview-row__will">{{ t('result.preview.willReviewRow') }}</span>
            <span class="preview-row__lines">
              <span class="add">+{{ file.insertions }}</span>
              <span class="del">-{{ file.deletions }}</span>
            </span>
          </div>
        </div>
        <EmptyState
          v-else
          :title="t('result.preview.noFilesMatch')"
          :description="preview.files.length ? t('result.preview.tryClearingFilter') : t('result.preview.noReviewableChanges')"
        />
      </div>
    </template>

    <template v-else-if="review">
      <div v-if="review.message" class="result-message">
        <el-icon><InfoFilled /></el-icon>
        {{ review.message }}
      </div>

      <div class="summary-grid summary-grid--review">
        <div class="summary-tile">
          <span class="summary-tile__label">{{ t('result.review.filesReviewed') }}</span>
          <span class="summary-tile__value">{{ formatCount(review.summary?.files_reviewed ?? completedFiles) }}</span>
          <span class="summary-tile__hint">{{ coverageText }}</span>
        </div>
        <div class="summary-tile">
          <span class="summary-tile__label">{{ t('result.review.findings') }}</span>
          <span class="summary-tile__value">{{ formatCount(review.comments?.length ?? 0) }}</span>
          <span class="summary-tile__hint">
            {{ t('result.review.severityHint', { critical: severityCounts.critical, high: severityCounts.high }) }}
          </span>
        </div>
        <div class="summary-tile">
          <span class="summary-tile__label">{{ t('result.review.tokens') }}</span>
          <span class="summary-tile__value">{{ formatCompact(review.summary?.total_tokens ?? 0) }}</span>
          <span class="summary-tile__hint">
            {{ t('result.review.tokenHint', {
              input: formatCompact(review.summary?.input_tokens ?? 0),
              output: formatCompact(review.summary?.output_tokens ?? 0),
            }) }}
          </span>
        </div>
        <div class="summary-tile">
          <span class="summary-tile__label">{{ t('result.review.elapsed') }}</span>
          <span class="summary-tile__value summary-tile__value--small">{{ review.summary?.elapsed || '--' }}</span>
          <span class="summary-tile__hint">{{ review.llm?.model || t('result.review.modelNotRecorded') }}</span>
        </div>
      </div>

      <div v-if="totalComments" class="severity-bar" aria-hidden="true">
        <span
          v-for="severity in severityBreakdown"
          :key="severity.name"
          class="severity-bar__segment"
          :class="`severity-bar__segment--${severity.name}`"
          :style="{ width: `${severity.percent}%` }"
        />
      </div>

      <div v-if="review.warnings?.length" class="warnings">
        <div class="warnings__head">
          <el-icon><WarningFilled /></el-icon>
          {{ tn('result.review.warningCount', review.warnings.length) }}
        </div>
        <ul class="warnings__list">
          <li v-for="(warning, index) in review.warnings" :key="index">
            <span v-if="warning.file" class="mono">{{ warning.file }}</span>
            <span>{{ warning.message || warning.type }}</span>
          </li>
        </ul>
      </div>

      <div v-if="review.comments?.length" class="panel">
        <div class="panel__head">
          <div>
            <h3 class="panel__title">{{ t('result.review.findings') }}</h3>
            <p class="panel__sub">{{ t('result.findings.showing', { shown: filteredComments.length, total: review.comments.length }) }}</p>
          </div>
          <div class="toolbar toolbar--wrap">
            <el-input v-model="commentQuery" size="small" clearable :placeholder="t('result.findings.filterPlaceholder')" class="toolbar__search" />
            <el-select v-model="categoryFilter" size="small" class="toolbar__select" :placeholder="t('result.findings.allCategories')">
              <el-option :label="t('result.findings.allCategories')" value="" />
              <el-option v-for="category in categories" :key="category" :label="categoryLabel(category)" :value="category" />
            </el-select>
            <div class="segmented">
              <button
                v-for="option in severityFilters"
                :key="option.value"
                type="button"
                class="segmented__item"
                :class="{ 'is-active': severityFilter === option.value }"
                @click="severityFilter = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="groupedComments.length" class="file-groups">
          <section v-for="group in groupedComments" :key="group.path" class="file-group">
            <header class="file-group__head">
              <span class="file-group__path mono" :title="group.path">{{ group.path }}</span>
              <span class="file-group__count">{{ tn('result.findings.fileCount', group.comments.length) }}</span>
            </header>
            <div class="file-group__body">
              <FindingCard v-for="comment in group.comments" :key="commentKey(comment)" :comment="comment" />
            </div>
          </section>
        </div>
        <EmptyState
          v-else
          :title="t('result.findings.noMatchesTitle')"
          :description="t('result.findings.noMatchesText')"
        />
      </div>

      <EmptyState
        v-else
        :title="t('result.findings.emptyTitle')"
        :description="t('result.findings.emptyText')"
      />

      <div v-if="review.project_summary" class="panel">
        <div class="panel__head">
          <div>
            <h3 class="panel__title">{{ t('result.projectSummary.title') }}</h3>
            <p class="panel__sub">{{ t('result.projectSummary.subtitle') }}</p>
          </div>
        </div>
        <div class="panel__body">
          <MarkdownView :text="review.project_summary" />
        </div>
      </div>

      <div v-if="manifest" class="panel">
        <div class="panel__head">
          <div>
            <h3 class="panel__title">{{ t('result.coverage.title') }}</h3>
            <p class="panel__sub">{{ t('result.coverage.subtitle') }}</p>
          </div>
          <span class="chip">{{ manifestStateLabel(manifest.terminal_state) }}</span>
        </div>
        <div class="coverage">
          <div class="coverage__item">
            <span class="coverage__value">{{ manifest.coverage?.selected?.length ?? 0 }}</span>
            <span class="coverage__label">{{ t('result.coverage.selected') }}</span>
          </div>
          <div class="coverage__item">
            <span class="coverage__value">{{ manifest.coverage?.completed?.length ?? 0 }}</span>
            <span class="coverage__label">{{ t('result.coverage.completed') }}</span>
          </div>
          <div class="coverage__item">
            <span class="coverage__value">{{ manifest.coverage?.reused?.length ?? 0 }}</span>
            <span class="coverage__label">{{ t('result.coverage.reused') }}</span>
          </div>
          <div class="coverage__item" :class="{ 'coverage__item--bad': (manifest.coverage?.failed?.length ?? 0) > 0 }">
            <span class="coverage__value">{{ manifest.coverage?.failed?.length ?? 0 }}</span>
            <span class="coverage__label">{{ t('result.coverage.failed') }}</span>
          </div>
          <div class="coverage__item">
            <span class="coverage__value">{{ manifest.coverage?.waived?.length ?? 0 }}</span>
            <span class="coverage__label">{{ t('result.coverage.waived') }}</span>
          </div>
        </div>
        <div v-if="manifest.run_failure" class="coverage-failure">
          <strong>{{ manifest.run_failure.classification || t('result.coverage.runFailure') }}</strong>
          <span>{{ manifest.run_failure.reason }}</span>
        </div>
        <ul v-if="failedItems.length" class="failed-list">
          <li v-for="item in failedItems" :key="item.item_id || item.path">
            <span class="mono">{{ item.path || item.item_id }}</span>
            <span v-if="item.classification" class="chip">{{ item.classification }}</span>
            <span v-if="item.reason" class="faint">{{ item.reason }}</span>
          </li>
        </ul>
      </div>
    </template>

    <EmptyState
      v-else
      :title="t('result.empty.title')"
      :description="t('result.empty.description')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { InfoFilled, WarningFilled } from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import FindingCard from '@/components/FindingCard.vue'
import MarkdownView from '@/components/MarkdownView.vue'
import {
  formatCompact,
  formatCount,
} from '@/utils/format'
import {
  categoryLabel,
  excludeReasonLabel,
  manifestStateLabel,
  normalizedSeverity,
  severityOrder,
} from '@/utils/status'
import type {
  LlmComment,
  PreviewEntry,
  PreviewResult,
  ReviewResult,
} from '@/types'
import { useI18n } from '@/i18n'

const props = defineProps<{
  result: ReviewResult | PreviewResult | null
}>()

const { t, tn } = useI18n()

const severityFilter = ref('all')
const categoryFilter = ref('')
const commentQuery = ref('')
const previewFilter = ref<'all' | 'review' | 'excluded'>('all')
const previewQuery = ref('')

const severityFilters = computed(() => [
  { value: 'all' as const, label: t('result.filters.all') },
  { value: 'critical' as const, label: t('status.severity.critical') },
  { value: 'high' as const, label: t('status.severity.high') },
  { value: 'medium' as const, label: t('status.severity.medium') },
  { value: 'low' as const, label: t('status.severity.low') },
])
const previewFilters = computed(() => [
  { value: 'all' as const, label: t('result.filters.all') },
  { value: 'review' as const, label: t('result.preview.willReview') },
  { value: 'excluded' as const, label: t('result.preview.excluded') },
])

const preview = computed<PreviewResult | null>(() => {
  const value = props.result as PreviewResult | null
  return value && Array.isArray(value.files) ? value : null
})

const review = computed<ReviewResult | null>(() => {
  const value = props.result as ReviewResult | null
  if (!value || preview.value) return null
  if (Array.isArray(value.comments) || value.summary || value.manifest) return value
  return null
})

const comments = computed<LlmComment[]>(() => review.value?.comments ?? [])
const totalComments = computed(() => comments.value.length)
const manifest = computed(() => review.value?.manifest ?? null)
const completedFiles = computed(() => manifest.value?.coverage?.completed?.length ?? 0)
const failedItems = computed(() => (manifest.value?.coverage?.failed ?? []).slice(0, 12))

const coverageText = computed(() => {
  if (!manifest.value?.coverage) return t('result.review.coverageNotRecorded')
  const selected = manifest.value.coverage.selected?.length ?? 0
  const completed = manifest.value.coverage.completed?.length ?? 0
  return t('result.review.coverageSelected', { completed, selected })
})

const severityCounts = computed(() => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 }
  for (const comment of comments.value) {
    counts[normalizedSeverity(comment.severity)] += 1
  }
  return counts
})

const severityBreakdown = computed(() => {
  const total = totalComments.value || 1
  return (['critical', 'high', 'medium', 'low'] as const)
    .map((name) => ({
      name,
      count: severityCounts.value[name],
      percent: (severityCounts.value[name] / total) * 100,
    }))
    .filter((entry) => entry.count > 0)
})

const categories = computed(() =>
  Array.from(new Set(comments.value.map((comment) => (comment.category || 'other').toLowerCase()))).sort(),
)

const filteredComments = computed(() => {
  const query = commentQuery.value.trim().toLowerCase()
  return comments.value
    .filter((comment) => {
      if (severityFilter.value !== 'all' && normalizedSeverity(comment.severity) !== severityFilter.value) {
        return false
      }
      if (categoryFilter.value && (comment.category || 'other').toLowerCase() !== categoryFilter.value) {
        return false
      }
      if (query) {
        const haystack = `${comment.path} ${comment.content} ${comment.suggestion_code ?? ''}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
    .sort((left, right) => {
      if (left.path !== right.path) return left.path.localeCompare(right.path)
      const severityDelta = severityOrder[normalizedSeverity(left.severity) as keyof typeof severityOrder] ?? 9
      const rightSeverity = severityOrder[normalizedSeverity(right.severity) as keyof typeof severityOrder] ?? 9
      if (severityDelta !== rightSeverity) return severityDelta - rightSeverity
      return (left.start_line ?? 0) - (right.start_line ?? 0)
    })
})

const groupedComments = computed(() => {
  const groups = new Map<string, LlmComment[]>()
  for (const comment of filteredComments.value) {
    const list = groups.get(comment.path) ?? []
    list.push(comment)
    groups.set(comment.path, list)
  }
  return Array.from(groups.entries()).map(([path, items]) => ({ path, comments: items }))
})

const filteredPreviewFiles = computed<PreviewEntry[]>(() => {
  if (!preview.value) return []
  const query = previewQuery.value.trim().toLowerCase()
  return preview.value.files.filter((file) => {
    if (previewFilter.value === 'review' && !file.will_review) return false
    if (previewFilter.value === 'excluded' && file.will_review) return false
    if (query && !file.path.toLowerCase().includes(query)) return false
    return true
  })
})

function previewStatusClass(file: PreviewEntry): string {
  switch (normalizedPreviewStatus(file.status)) {
    case 'A':
      return 'preview-row__status--add'
    case 'D':
      return 'preview-row__status--delete'
    case 'R':
      return 'preview-row__status--rename'
    default:
      return 'preview-row__status--modify'
  }
}

function normalizedPreviewStatus(status?: string): string {
  const value = (status ?? '').trim().toLowerCase()
  switch (value) {
    case 'a':
    case 'added':
    case 'add':
      return 'A'
    case 'd':
    case 'deleted':
    case 'delete':
      return 'D'
    case 'r':
    case 'renamed':
    case 'rename':
      return 'R'
    case 'c':
    case 'copied':
    case 'copy':
      return 'C'
    default:
      return 'M'
  }
}

function previewStatusLetter(status?: string): string {
  return normalizedPreviewStatus(status)
}

function commentKey(comment: LlmComment): string {
  return `${comment.path}:${comment.start_line}:${comment.end_line}:${comment.content.slice(0, 24)}`
}
</script>

<style scoped>
.result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-grid--review {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-tile {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px 15px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: var(--surface);
}

.summary-tile__label {
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-tile__value {
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: 26px;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.summary-tile__value--small {
  font-family: var(--font-sans);
  font-size: 17px;
  font-weight: 650;
}

.summary-tile__hint {
  color: var(--ink-faint);
  font-size: 10.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-tile__hint .add {
  margin-right: 6px;
}

.add {
  color: var(--green);
}

.del {
  color: var(--red);
}

.result-message {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--bg-tint);
  color: var(--ink-muted);
  font-size: 12px;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
  overflow: hidden;
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.panel__title {
  color: var(--ink-strong);
  font-size: 13.5px;
  font-weight: 650;
}

.panel__sub {
  margin-top: 3px;
  color: var(--ink-faint);
  font-size: 11px;
}

.panel__body {
  padding: 16px 18px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 7px;
}

.toolbar--wrap {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.toolbar__search {
  width: 170px;
}

.toolbar__select {
  width: 150px;
}

.toolbar .segmented__item {
  height: 27px;
  padding: 0 9px;
  font-size: 11px;
}

.severity-bar {
  display: flex;
  gap: 3px;
  height: 6px;
  margin: -4px 0 2px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg-sunken);
}

.severity-bar__segment {
  height: 100%;
  border-radius: 999px;
}

.severity-bar__segment--critical {
  background: var(--red);
}

.severity-bar__segment--high {
  background: var(--accent);
}

.severity-bar__segment--medium {
  background: #c99a3b;
}

.severity-bar__segment--low {
  background: #84938a;
}

.warnings {
  padding: 12px 14px;
  border: 1px solid rgba(168, 120, 35, 0.24);
  border-radius: 10px;
  background: var(--amber-soft);
  color: var(--amber);
  font-size: 11.5px;
}

.warnings__head {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 650;
}

.warnings__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
  padding-left: 17px;
  list-style: disc;
}

.warnings__list li {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.file-groups {
  display: flex;
  flex-direction: column;
}

.file-group {
  border-top: 1px solid var(--line);
}

.file-group:first-child {
  border-top: 0;
}

.file-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px;
  background: var(--bg-tint);
}

.file-group__path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-muted);
  font-size: 11px;
}

.file-group__count {
  flex: none;
  color: var(--ink-faint);
  font-size: 10px;
}

.file-group__body {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 12px 14px 14px;
  background: var(--bg);
}

.preview-list {
  display: flex;
  flex-direction: column;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  border-top: 1px solid var(--line);
  font-size: 11.5px;
}

.preview-row:first-child {
  border-top: 0;
}

.preview-row__status {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  flex: none;
}

.preview-row__status--add {
  background: var(--green-soft);
  color: var(--green);
}

.preview-row__status--delete {
  background: var(--red-soft);
  color: var(--red);
}

.preview-row__status--rename {
  background: var(--accent-soft);
  color: var(--accent-ink);
}

.preview-row__status--modify {
  background: var(--amber-soft);
  color: var(--amber);
}

.preview-row__path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-muted);
}

.preview-row__reason {
  flex: none;
  color: var(--ink-faint);
  font-size: 10.5px;
}

.preview-row__will {
  flex: none;
  color: var(--green);
  font-size: 10px;
  font-weight: 600;
}

.preview-row__lines {
  display: flex;
  gap: 7px;
  flex: none;
  font-family: var(--font-mono);
  font-size: 10.5px;
}

.coverage {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding: 14px 18px;
}

.coverage__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-tint);
}

.coverage__item--bad {
  border-color: rgba(171, 66, 56, 0.24);
  background: var(--red-soft);
}

.coverage__value {
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: 19px;
  line-height: 1.1;
}

.coverage__label {
  color: var(--ink-faint);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.coverage-failure {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 0 18px 12px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
}

.failed-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0 18px 15px;
  padding: 0;
  list-style: none;
  font-size: 10.5px;
}

.failed-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--ink-muted);
}

@media (max-width: 960px) {
  .summary-grid--review {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .summary-grid,
  .summary-grid--review {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .coverage {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    width: 100%;
    flex-wrap: wrap;
  }

  .toolbar__search,
  .toolbar__select {
    width: 100%;
  }
}
</style>
