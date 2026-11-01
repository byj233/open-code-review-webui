<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <template v-if="loading">
      <div class="skeleton skeleton--text" style="width: 90px" />
      <div class="skeleton skeleton--title" style="width: 44%; height: 42px" />
      <div class="stat-grid">
        <div v-for="n in 4" :key="n" class="skeleton skeleton--card" />
      </div>
      <div class="skeleton" style="height: 420px" />
    </template>

    <template v-else-if="summary">
      <PageHeader
        :eyebrow="t('nav.session')"
        :title="headerTitle"
        :description="headerDescription"
        back-to="/sessions"
        :back-label="t('sessionDetail.header.back')"
      >
        <template #meta>
          <StatusPill :label="state.label" :tone="state.tone" />
          <span class="chip chip--mono">{{ shortId(summary.session_id, 16) }}</span>
          <span v-if="summary.model" class="chip">{{ summary.model }}</span>
          <span v-if="summary.git_branch" class="chip">{{ summary.git_branch }}</span>
          <span v-if="summary.aborted" class="chip chip--accent">{{ t('sessionDetail.header.aborted') }}</span>
        </template>
        <template #actions>
          <el-tooltip
            :content="
              canResume
                ? t('sessionDetail.actions.resumeTooltip')
                : t('sessionDetail.actions.resumeDisabled')
            "
            placement="top"
          >
            <el-button :disabled="!canResume" @click="resumeReview">
              <el-icon class="btn-icon"><RefreshRight /></el-icon>
              {{ t('sessionDetail.actions.resume') }}
            </el-button>
          </el-tooltip>
          <el-button type="danger" plain @click="deleteOpen = true">
            <el-icon class="btn-icon"><Delete /></el-icon>
            {{ t('common.delete') }}
          </el-button>
        </template>
      </PageHeader>

      <div v-if="summary.aborted" class="callout callout--warning">
        <el-icon class="callout__icon"><WarningFilled /></el-icon>
        <div>{{ t('sessionDetail.callouts.interrupted') }}</div>
      </div>

      <div v-if="manifest?.run_failure" class="callout callout--error">
        <el-icon class="callout__icon"><WarningFilled /></el-icon>
        <div>
          <strong>{{ failureTitle }}</strong>
          {{ manifest.run_failure.reason || t('sessionDetail.callouts.failureReason') }}
        </div>
      </div>

      <div class="stat-grid">
        <StatTile
          :label="t('sessionDetail.stats.findings')"
          :value="formatCount(comments.length)"
          :hint="severityHint"
          :icon="ChatDotRound"
        />
        <StatTile
          :label="t('sessionDetail.stats.filesReviewed')"
          :value="`${summary.completed_files}/${summary.selected_files}`"
          :hint="
            t('sessionDetail.stats.reusedWaived', {
              reused: summary.reused_files,
              waived: summary.waived_files,
            })
          "
          :icon="Files"
        />
        <StatTile
          :label="t('sessionDetail.stats.failedFiles')"
          :value="formatCount(summary.failed_files)"
          :hint="
            summary.failed_files
              ? t('sessionDetail.stats.seeCoverage')
              : t('sessionDetail.stats.noFileFailures')
          "
          :icon="WarningFilled"
          compact
        />
        <StatTile
          :label="t('sessionDetail.stats.duration')"
          :value="formatDurationNs(summary.duration_ns)"
          :hint="formatDate(summary.start_time)"
          :icon="Timer"
          compact
        />
      </div>

      <section class="card session-detail">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="tabs__item"
            :class="{ 'is-active': activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span class="tabs__count">{{ tab.count }}</span>
          </button>
          <span class="spacer" />
          <button class="icon-text-button" type="button" @click="copySessionId">
            <el-icon><CopyDocument /></el-icon>
            {{ t('sessionDetail.actions.copyId') }}
          </button>
        </div>

        <div v-if="activeTab === 'findings'" class="tab-body">
          <div v-if="comments.length" class="findings-toolbar">
            <el-input
              v-model="query"
              clearable
              :placeholder="t('sessionDetail.findings.searchPlaceholder')"
              class="findings-toolbar__search"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select
              v-model="categoryFilter"
              clearable
              :placeholder="t('sessionDetail.findings.allCategories')"
              class="findings-toolbar__select"
            >
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

          <div v-if="groupedComments.length" class="file-groups">
            <section v-for="group in groupedComments" :key="group.path" class="file-group">
              <header class="file-group__head">
                <span class="file-group__path mono" :title="group.path">{{ group.path }}</span>
                <span class="file-group__count">{{ tn('sessionDetail.findings.count', group.comments.length) }}</span>
              </header>
              <div class="file-group__body">
                <FindingCard v-for="comment in group.comments" :key="commentKey(comment)" :comment="comment" />
              </div>
            </section>
          </div>
          <EmptyState
            v-else-if="comments.length"
            :title="t('sessionDetail.findings.emptyFilteredTitle')"
            :description="t('sessionDetail.findings.emptyFilteredText')"
          />
          <EmptyState
            v-else
            :title="t('sessionDetail.findings.emptyTitle')"
            :description="t('sessionDetail.findings.emptyText')"
          />
        </div>

        <div v-else-if="activeTab === 'files'" class="tab-body tab-body--flush">
          <div v-if="items.length" class="item-list">
            <div v-for="(item, index) in items" :key="`${item.file_path}-${index}`" class="item-row">
              <span class="item-row__type" :class="itemTone(item)">{{ itemTypeLabel(item.type) }}</span>
              <span class="item-row__path mono" :title="item.file_path">{{ item.file_path }}</span>
              <span v-if="item.comments" class="item-row__comments">{{ tn('sessionDetail.findings.count', item.comments) }}</span>
              <span v-else class="item-row__comments item-row__comments--empty">{{ t('sessionDetail.files.noFindings') }}</span>
              <span class="item-row__time">{{ formatRelative(item.timestamp) }}</span>
              <span v-if="item.error" class="item-row__error" :title="item.error">{{ item.error }}</span>
            </div>
          </div>
          <EmptyState
            v-else
            :title="t('sessionDetail.files.emptyTitle')"
            :description="t('sessionDetail.files.emptyText')"
          />
        </div>

        <div v-else class="tab-body">
          <template v-if="manifest">
            <div class="coverage">
              <div class="coverage__item">
                <span class="coverage__value">{{ manifest.coverage?.selected?.length ?? 0 }}</span>
                <span class="coverage__label">{{ t('sessionDetail.coverage.selected') }}</span>
              </div>
              <div class="coverage__item">
                <span class="coverage__value">{{ manifest.coverage?.completed?.length ?? 0 }}</span>
                <span class="coverage__label">{{ t('sessionDetail.coverage.completed') }}</span>
              </div>
              <div class="coverage__item">
                <span class="coverage__value">{{ manifest.coverage?.reused?.length ?? 0 }}</span>
                <span class="coverage__label">{{ t('sessionDetail.coverage.reused') }}</span>
              </div>
              <div class="coverage__item" :class="{ 'coverage__item--bad': (manifest.coverage?.failed?.length ?? 0) > 0 }">
                <span class="coverage__value">{{ manifest.coverage?.failed?.length ?? 0 }}</span>
                <span class="coverage__label">{{ t('sessionDetail.coverage.failed') }}</span>
              </div>
              <div class="coverage__item">
                <span class="coverage__value">{{ manifest.coverage?.waived?.length ?? 0 }}</span>
                <span class="coverage__label">{{ t('sessionDetail.coverage.waived') }}</span>
              </div>
            </div>

            <dl class="manifest-meta">
              <div>
                <dt>{{ t('sessionDetail.manifest.terminalState') }}</dt>
                <dd>{{ manifestStateLabel(manifest.terminal_state) }}</dd>
              </div>
              <div>
                <dt>{{ t('sessionDetail.manifest.operation') }}</dt>
                <dd>{{ manifest.operation || '--' }}</dd>
              </div>
              <div>
                <dt>{{ t('sessionDetail.manifest.runId') }}</dt>
                <dd class="mono">{{ manifest.run_id || '--' }}</dd>
              </div>
              <div>
                <dt>{{ t('sessionDetail.manifest.parentRun') }}</dt>
                <dd class="mono">{{ manifest.parent_run_id || '--' }}</dd>
              </div>
              <div>
                <dt>{{ t('sessionDetail.manifest.elapsed') }}</dt>
                <dd>{{ formatDurationMs(manifest.elapsed_ms) }}</dd>
              </div>
            </dl>

            <ul v-if="failedItems.length" class="failed-list">
              <li v-for="item in failedItems" :key="item.item_id || item.path">
                <span class="mono">{{ item.path || item.item_id }}</span>
                <span v-if="item.classification" class="chip">{{ item.classification }}</span>
                <span v-if="item.reason" class="faint">{{ item.reason }}</span>
              </li>
            </ul>

            <details class="manifest-json">
              <summary>{{ t('sessionDetail.manifest.rawJson') }}</summary>
              <pre>{{ manifestJson }}</pre>
            </details>
          </template>
          <EmptyState
            v-else
            :title="t('sessionDetail.manifest.emptyTitle')"
            :description="t('sessionDetail.manifest.emptyText')"
          />
        </div>
      </section>

      <el-dialog v-model="deleteOpen" :title="t('sessionDetail.delete.title')" width="430px" append-to-body>
        <p class="dialog-text">{{ t('sessionDetail.delete.text') }}</p>
        <p class="dialog-session mono">{{ summary.session_id }}</p>
        <template #footer>
          <el-button :disabled="deleting" @click="deleteOpen = false">{{ t('common.cancel') }}</el-button>
          <el-button type="danger" :loading="deleting" @click="confirmDelete">{{ t('sessionDetail.delete.confirm') }}</el-button>
        </template>
      </el-dialog>
    </template>

    <template v-else>
      <PageHeader
        :eyebrow="t('nav.session')"
        :title="t('sessionDetail.notFound.title')"
        :description="error || t('sessionDetail.notFound.text')"
        back-to="/sessions"
        :back-label="t('sessionDetail.header.back')"
      />
      <EmptyState
        :title="t('sessionDetail.notFound.emptyTitle')"
        :description="t('sessionDetail.notFound.emptyText')"
      >
        <el-button type="primary" size="small" @click="router.push('/sessions')">{{ t('sessionDetail.notFound.browse') }}</el-button>
      </EmptyState>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  CopyDocument,
  Delete,
  Files,
  RefreshRight,
  Search,
  Timer,
  WarningFilled,
} from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import FindingCard from '@/components/FindingCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatTile from '@/components/StatTile.vue'
import StatusPill from '@/components/StatusPill.vue'
import { api, errorMessage } from '@/api/client'
import { useI18n } from '@/i18n'
import {
  formatCount,
  formatDate,
  formatDurationMs,
  formatDurationNs,
  formatRelative,
  shortId,
} from '@/utils/format'
import { copyText } from '@/utils/clipboard'
import {
  categoryLabel,
  manifestStateLabel,
  normalizedSeverity,
  sessionModeLabel,
  sessionState,
  severityLabel,
  severityOrder,
} from '@/utils/status'
import type { LlmComment, SessionDetailResponse, SessionItem } from '@/types'

const route = useRoute()
const router = useRouter()
const sessionId = String(route.params.id ?? '')
const { t, tn } = useI18n()

const detail = ref<SessionDetailResponse | null>(null)
const loading = ref(true)
const error = ref('')
const activeTab = ref<'findings' | 'files' | 'manifest'>('findings')
const query = ref('')
const categoryFilter = ref('')
const severityFilter = ref('all')
const deleteOpen = ref(false)
const deleting = ref(false)

const severityFilters = computed(() => [
  { value: 'all', label: t('sessionDetail.severity.all') },
  { value: 'critical', label: severityLabel('critical') },
  { value: 'high', label: severityLabel('high') },
  { value: 'medium', label: severityLabel('medium') },
  { value: 'low', label: severityLabel('low') },
])

const summary = computed(() => detail.value?.summary ?? null)
const items = computed<SessionItem[]>(() => detail.value?.items ?? [])
const comments = computed<LlmComment[]>(() => detail.value?.comments ?? [])
const state = computed(() =>
  summary.value
    ? sessionState(summary.value)
    : { key: 'unknown', label: t('common.unknown'), tone: 'neutral' as const, pulse: false },
)
const manifest = computed(() => summary.value?.run_manifest ?? null)
const failedItems = computed(() => (manifest.value?.coverage?.failed ?? []).slice(0, 20))
const manifestJson = computed(() => JSON.stringify(manifest.value, null, 2))
const failureTitle = computed(() =>
  t('sessionDetail.callouts.failureTitle', {
    classification:
      manifest.value?.run_failure?.classification || t('sessionDetail.callouts.failureFallback'),
  }),
)

const headerTitle = computed(() => {
  if (!summary.value) return t('nav.session')
  return sessionModeLabel(summary.value)
})
const headerDescription = computed(() => {
  if (!summary.value) return ''
  const parts = [t('sessionDetail.header.started', { date: formatDate(summary.value.start_time) })]
  if (summary.value.duration_ns) {
    parts.push(t('sessionDetail.header.took', { duration: formatDurationNs(summary.value.duration_ns) }))
  }
  if (summary.value.model) parts.push(t('sessionDetail.header.withModel', { model: summary.value.model }))
  return t('sessionDetail.header.description', { parts: parts.join(' · ') })
})
const severityHint = computed(() => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const comment of comments.value) {
    const severity = normalizedSeverity(comment.severity)
    if (severity !== 'unknown') counts[severity] += 1
  }
  return t('sessionDetail.stats.severityHint', {
    critical: counts.critical,
    high: counts.high,
    medium: counts.medium,
  })
})
const canResume = computed(() =>
  Boolean(summary.value && ['commit', 'range'].includes(summary.value.review_mode ?? '')),
)

const categories = computed(() =>
  Array.from(new Set(comments.value.map((comment) => (comment.category || 'other').toLowerCase()))).sort(),
)

const filteredComments = computed(() => {
  const term = query.value.trim().toLowerCase()
  return comments.value
    .filter((comment) => {
      if (severityFilter.value !== 'all' && normalizedSeverity(comment.severity) !== severityFilter.value) {
        return false
      }
      if (categoryFilter.value && (comment.category || 'other').toLowerCase() !== categoryFilter.value) {
        return false
      }
      if (term) {
        const haystack = `${comment.path} ${comment.content} ${comment.suggestion_code ?? ''}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
    .sort((left, right) => {
      if (left.path !== right.path) return left.path.localeCompare(right.path)
      const leftSeverity = severityOrder[normalizedSeverity(left.severity) as keyof typeof severityOrder] ?? 9
      const rightSeverity = severityOrder[normalizedSeverity(right.severity) as keyof typeof severityOrder] ?? 9
      if (leftSeverity !== rightSeverity) return leftSeverity - rightSeverity
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
  return Array.from(groups.entries()).map(([path, grouped]) => ({ path, comments: grouped }))
})

const tabs = computed(() => [
  { value: 'findings' as const, label: t('sessionDetail.tabs.findings'), count: comments.value.length },
  { value: 'files' as const, label: t('sessionDetail.tabs.fileItems'), count: items.value.length },
  { value: 'manifest' as const, label: t('sessionDetail.tabs.manifest'), count: manifest.value ? 1 : 0 },
])

function commentKey(comment: LlmComment): string {
  return `${comment.path}:${comment.start_line}:${comment.end_line}:${comment.content.slice(0, 24)}`
}

function itemTypeLabel(type: string): string {
  return (type || 'item').replace(/^review_/, '').replace(/_/g, ' ') || 'item'
}

function itemTone(item: SessionItem): string {
  if (item.error) return 'item-row__type--bad'
  if (item.type.includes('failed')) return 'item-row__type--bad'
  if (item.type.includes('done') || item.comments) return 'item-row__type--good'
  return ''
}

function resumeReview(): void {
  if (!summary.value) return
  const query: Record<string, string> = { resume: summary.value.session_id }
  if (summary.value.review_mode === 'commit') {
    query.mode = 'commit'
    if (summary.value.diff_commit) query.commit = summary.value.diff_commit
  } else {
    query.mode = 'range'
    if (summary.value.diff_from) query.from = summary.value.diff_from
    if (summary.value.diff_to) query.to = summary.value.diff_to
  }
  void router.push({ path: '/review', query })
}

async function copySessionId(): Promise<void> {
  const copied = await copyText(summary.value?.session_id ?? '')
  if (copied) ElMessage.success(t('sessionDetail.actions.copied'))
  else ElMessage.error(t('sessionDetail.actions.copyFailed'))
}

async function confirmDelete(): Promise<void> {
  if (!summary.value) return
  deleting.value = true
  try {
    await api.deleteSession(summary.value.session_id)
    ElMessage.success(t('sessionDetail.actions.deleted'))
    await router.push('/sessions')
  } catch (err) {
    ElMessage.error(errorMessage(err))
  } finally {
    deleting.value = false
  }
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    detail.value = await api.session(sessionId)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.session-detail {
  overflow: hidden;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-tint);
  flex-wrap: wrap;
}

.tabs__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.tabs__item:hover {
  color: var(--ink-strong);
}

.tabs__item.is-active {
  border-color: var(--line);
  background: var(--surface);
  color: var(--ink-strong);
  box-shadow: var(--shadow-xs);
}

.tabs__count {
  padding: 0 5px;
  border-radius: 999px;
  background: var(--bg-sunken);
  color: var(--ink-faint);
  font-size: 9px;
  font-weight: 650;
}

.tabs__item.is-active .tabs__count {
  background: var(--accent-softer);
  color: var(--accent-ink);
}

.icon-text-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--ink-faint);
  font-size: 10.5px;
  cursor: pointer;
}

.icon-text-button:hover {
  border-color: var(--line);
  background: var(--surface);
  color: var(--ink);
}

.tab-body {
  padding: 16px 18px 18px;
}

.tab-body--flush {
  padding: 0;
}

.findings-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.findings-toolbar__search {
  width: 230px;
}

.findings-toolbar__select {
  width: 150px;
}

.findings-toolbar .segmented__item {
  height: 31px;
  padding: 0 9px;
  font-size: 11px;
}

.file-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-group {
  border: 1px solid var(--line);
  border-radius: 11px;
  overflow: hidden;
}

.file-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  background: var(--bg-tint);
}

.file-group__path {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-muted);
  font-size: 10.5px;
}

.file-group__count {
  flex: none;
  color: var(--ink-faint);
  font-size: 9.5px;
}

.file-group__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: var(--bg);
}

.item-list {
  display: flex;
  flex-direction: column;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  border-top: 1px solid var(--line);
  font-size: 11px;
}

.item-row:first-child {
  border-top: 0;
}

.item-row__type {
  flex: none;
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--bg-sunken);
  color: var(--ink-faint);
  font-size: 9px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.item-row__type--good {
  background: var(--green-soft);
  color: var(--green);
}

.item-row__type--bad {
  background: var(--red-soft);
  color: var(--red);
}

.item-row__path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink-muted);
}

.item-row__comments {
  flex: none;
  color: var(--accent-ink);
  font-size: 10px;
}

.item-row__comments--empty {
  color: var(--ink-faint);
}

.item-row__time {
  flex: none;
  color: var(--ink-faint);
  font-size: 9.5px;
}

.item-row__error {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--red);
  font-size: 9.5px;
}

.coverage {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.coverage__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 11px;
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
  font-size: 20px;
  line-height: 1.1;
}

.coverage__label {
  color: var(--ink-faint);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.manifest-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
  margin: 16px 0 0;
}

.manifest-meta > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 5px;
  border-bottom: 1px dashed var(--line);
}

.manifest-meta dt {
  color: var(--ink-faint);
  font-size: 10.5px;
}

.manifest-meta dd {
  margin: 0;
  min-width: 0;
  color: var(--ink-muted);
  font-size: 10.5px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
}

.failed-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 14px 0 0;
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

.manifest-json {
  margin-top: 16px;
}

.manifest-json summary {
  color: var(--ink-faint);
  font-size: 10.5px;
  cursor: pointer;
}

.manifest-json pre {
  max-height: 420px;
  margin: 8px 0 0;
  padding: 12px;
  overflow: auto;
  border-radius: 9px;
  background: var(--code-bg);
  color: var(--code-ink);
  font-family: var(--font-mono);
  font-size: 10.5px;
  line-height: 1.6;
}

.dialog-text {
  color: var(--ink-muted);
  font-size: 12.5px;
  line-height: 1.65;
}

.dialog-session {
  margin-top: 12px;
  padding: 9px 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-tint);
  color: var(--ink-muted);
  font-size: 11px;
  word-break: break-all;
}

.btn-icon {
  margin-right: 5px;
}

@media (max-width: 900px) {
  .coverage {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .manifest-meta {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 760px) {
  .findings-toolbar__search,
  .findings-toolbar__select {
    width: 100%;
  }

  .item-row__error,
  .item-row__time {
    display: none;
  }

  .coverage {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
