<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      :eyebrow="t('nav.group.history')"
      :title="t('nav.sessions')"
      :description="t('sessions.header.description')"
    >
      <template #actions>
        <el-button text :loading="loading" @click="load">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          {{ t('common.refresh') }}
        </el-button>
        <el-button type="primary" @click="go('/reviews')">
          <el-icon class="btn-icon"><EditPen /></el-icon>
          {{ t('topbar.newReview') }}
        </el-button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatTile
        :label="t('nav.sessions')"
        :value="formatCount(total)"
        :hint="latestHint"
        :icon="Collection"
      />
      <StatTile
        :label="t('sessions.stat.findings')"
        :value="formatCount(totalFindings)"
        :hint="t('sessions.stat.findingsHint')"
        :icon="ChatDotRound"
      />
      <StatTile
        :label="t('sessions.stat.files')"
        :value="formatCount(totalFiles)"
        :hint="t('sessions.stat.filesHint')"
        :icon="Files"
      />
      <StatTile
        :label="t('sessions.stat.average')"
        :value="averageFindings"
        :hint="t('sessions.stat.averageHint')"
        :icon="DataLine"
        compact
      />
    </div>

    <div v-if="error" class="callout callout--error">
      <el-icon class="callout__icon"><WarningFilled /></el-icon>
      <div class="callout__content">
        <span>{{ error }}</span>
        <el-button size="small" @click="load">{{ t('common.retry') }}</el-button>
      </div>
    </div>

    <section class="card sessions-card">
      <div class="toolbar">
        <div class="toolbar__search">
          <el-input v-model="query" clearable :placeholder="t('sessions.toolbar.searchPlaceholder')">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <div class="segmented">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            class="segmented__item"
            :class="{ 'is-active': statusFilter === option.value }"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <span class="toolbar__count">{{ t('sessions.toolbar.shown', { count: filtered.length }) }}</span>
      </div>

      <div class="session-table">
        <div class="session-table__head">
          <span>{{ t('nav.session') }}</span>
          <span>{{ t('sessions.table.started') }}</span>
          <span class="col-model">{{ t('sessions.table.model') }}</span>
          <span class="col-scope">{{ t('sessions.table.scope') }}</span>
          <span>{{ t('sessions.table.files') }}</span>
          <span>{{ t('sessions.table.findings') }}</span>
          <span>{{ t('sessions.table.duration') }}</span>
          <span />
        </div>

        <div v-if="loading" class="session-skeleton">
          <div v-for="n in 6" :key="n" class="session-skeleton__row">
            <span class="skeleton skeleton--text" style="width: 55%" />
            <span class="skeleton skeleton--text" style="width: 30%" />
          </div>
        </div>

        <template v-else-if="paginated.length">
          <button
            v-for="session in paginated"
            :key="session.session_id"
            class="session-row"
            type="button"
            @click="openSession(session.session_id)"
          >
            <span class="session-cell session-cell--main">
              <span class="session-cell__title">
                <span class="dot" :class="stateDot(sessionState(session).tone)" />
                {{ sessionModeLabel(session) }}
              </span>
              <span class="session-cell__sub mono">
                {{ shortId(session.session_id, 12) }}
                <span v-if="session.resumed_from" class="session-cell__resume">{{ t('sessions.row.resumed') }}</span>
              </span>
            </span>
            <span class="session-cell">
              <span :title="formatDate(session.start_time)">{{ formatRelative(session.start_time) }}</span>
              <span class="session-cell__sub">{{ sessionState(session).label }}</span>
            </span>
            <span class="session-cell col-model" :title="session.model || ''">
              <span class="mono">{{ session.model || '--' }}</span>
            </span>
            <span class="session-cell col-scope" :title="session.git_branch || ''">
              <span>{{ session.git_branch || '--' }}</span>
              <span class="session-cell__sub">{{ scopeRefs(session) }}</span>
            </span>
            <span class="session-cell">
              <span>{{ session.completed_files }} / {{ session.selected_files }}</span>
              <span class="progress" aria-hidden="true">
                <span class="progress__bar" :style="{ width: `${filePercent(session)}%` }" />
              </span>
            </span>
            <span class="session-cell session-cell--findings">
              <span :class="{ 'has-findings': session.total_comments > 0 }">{{ formatCount(session.total_comments) }}</span>
            </span>
            <span class="session-cell mono">{{ formatDurationNs(session.duration_ns) }}</span>
            <span class="session-cell session-cell--actions">
              <el-tooltip :content="t('sessions.delete.action')" placement="top" :show-after="300">
                <button class="row-action" type="button" :aria-label="t('sessions.delete.action')" @click.stop="askDelete(session)">
                  <el-icon><Delete /></el-icon>
                </button>
              </el-tooltip>
              <el-icon class="row-arrow"><ArrowRight /></el-icon>
            </span>
          </button>
        </template>

        <EmptyState
          v-else
          :title="sessions.length ? t('sessions.empty.noMatch') : t('sessions.empty.none')"
          :description="sessions.length ? t('sessions.empty.noMatchHint') : t('sessions.empty.noneHint')"
        >
          <el-button v-if="!sessions.length" type="primary" size="small" @click="go('/reviews')">
            {{ t('sessions.empty.runReview') }}
          </el-button>
          <el-button v-else size="small" @click="clearFilters">{{ t('sessions.empty.clearFilters') }}</el-button>
        </EmptyState>
      </div>

      <footer v-if="filtered.length > pageSize" class="sessions-footer">
        <span class="muted">{{ t('sessions.footer.summary', { count: filtered.length, page: page }) }}</span>
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="filtered.length"
          layout="prev, pager, next"
          small
          background
        />
      </footer>
    </section>

    <el-dialog v-model="deleteOpen" :title="t('sessions.delete.dialogTitle')" width="430px" append-to-body>
      <p class="dialog-text">
        {{ t('sessions.delete.description') }}
      </p>
      <p v-if="deleteTarget" class="dialog-session mono">{{ deleteTarget.session_id }}</p>
      <template #footer>
        <el-button :disabled="deleting" @click="deleteOpen = false">{{ t('common.cancel') }}</el-button>
        <el-button type="danger" :loading="deleting" @click="confirmDelete">{{ t('sessions.delete.action') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ArrowRight,
  ChatDotRound,
  Collection,
  DataLine,
  Delete,
  EditPen,
  Files,
  Refresh,
  Search,
  WarningFilled,
} from '@element-plus/icons-vue';
import EmptyState from '@/components/EmptyState.vue';
import PageHeader from '@/components/PageHeader.vue';
import StatTile from '@/components/StatTile.vue';
import { api } from '@/api/client';
import { describeError } from '@/utils/format';
import { useI18n } from '@/i18n';
import {
  formatCount,
  formatDate,
  formatDurationNs,
  formatRelative,
  shortId,
} from '@/utils/format';
import { sessionModeLabel, sessionState, type Tone } from '@/utils/status';
import type { SessionSummary } from '@/types';

const router = useRouter();
const { t, tn } = useI18n();
const sessions = ref<SessionSummary[]>([]);
const total = ref(0);
const loading = ref(true);
const error = ref('');
const query = ref('');
const statusFilter = ref('all');
const page = ref(1);
const pageSize = 12;
const deleteOpen = ref(false);
const deleteTarget = ref<SessionSummary | null>(null);
const deleting = ref(false);

const statusOptions = computed(() => [
  { value: 'all', label: t('sessions.filter.all') },
  { value: 'complete', label: t('status.complete') },
  { value: 'partial', label: t('status.partial') },
  { value: 'failed', label: t('status.failed') },
  { value: 'interrupted', label: t('status.interrupted') },
]);

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase();
  return sessions.value.filter((session) => {
    const state = sessionState(session);
    if (statusFilter.value !== 'all') {
      if (statusFilter.value === 'interrupted' && state.key !== 'interrupted' && state.key !== 'aborted') {
        return false;
      }
      if (statusFilter.value !== 'interrupted' && state.key !== statusFilter.value) return false;
    }
    if (!term) return true;
    const haystack = [
      session.session_id,
      session.model,
      session.git_branch,
      session.review_mode,
      session.diff_from,
      session.diff_to,
      session.diff_commit,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });
});

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const totalFindings = computed(() => sessions.value.reduce((sum, session) => sum + session.total_comments, 0));
const totalFiles = computed(() => sessions.value.reduce((sum, session) => sum + session.completed_files, 0));
const averageFindings = computed(() => {
  if (!sessions.value.length) return '--';
  return (totalFindings.value / sessions.value.length).toFixed(1);
});
const latestHint = computed(() =>
  sessions.value.length
    ? t('sessions.stat.latest', { when: formatRelative(sessions.value[0].start_time) })
    : t('sessions.stat.noHistory'),
);

watch([query, statusFilter], () => {
  page.value = 1;
});

function stateDot(tone: Tone): string {
  switch (tone) {
    case 'success':
      return 'dot--green';
    case 'warning':
      return 'dot--amber';
    case 'danger':
      return 'dot--red';
    case 'accent':
      return 'dot--accent';
    default:
      return '';
  }
}

function scopeRefs(session: SessionSummary): string {
  if (session.review_mode === 'scan') return t('sessions.scope.wholeRepository');
  if (session.review_mode === 'commit') {
    return session.diff_commit
      ? t('sessions.scope.commit', { id: session.diff_commit.slice(0, 10) })
      : t('sessions.scope.commitOnly');
  }
  if (session.diff_from && session.diff_to) return `${session.diff_from}..${session.diff_to}`;
  return session.review_mode === 'workspace'
    ? t('sessions.scope.workingTree')
    : session.review_mode || '--';
}

function filePercent(session: SessionSummary): number {
  if (!session.selected_files) return 0;
  return Math.min(100, Math.round((session.completed_files / session.selected_files) * 100));
}

function openSession(id: string): void {
  void router.push(`/sessions/${encodeURIComponent(id)}`);
}

function go(path: string): void {
  void router.push(path);
}

function clearFilters(): void {
  query.value = '';
  statusFilter.value = 'all';
}

function askDelete(session: SessionSummary): void {
  deleteTarget.value = session;
  deleteOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  const target = deleteTarget.value;
  if (!target) return;
  deleting.value = true;
  try {
    await api.deleteSession(target.session_id);
    deleteOpen.value = false;
    deleteTarget.value = null;
    ElMessage.success(t('sessions.delete.success'));
    await load();
    if (!paginated.value.length && page.value > 1) page.value -= 1;
  } catch (err) {
    ElMessage.error(describeError(err));
  } finally {
    deleting.value = false;
  }
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.sessions(500);
    sessions.value = response.sessions;
    total.value = response.total;
  } catch (err) {
    error.value = describeError(err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.sessions-card {
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.toolbar__search {
  width: 290px;
  max-width: 100%;
}

.toolbar .segmented__item {
  height: 30px;
  padding: 0 10px;
  font-size: 11.5px;
}

.toolbar__count {
  margin-left: auto;
  color: var(--ink-faint);
  font-size: 10.5px;
}

.session-table__head {
  display: grid;
  grid-template-columns:
    minmax(200px, 1.35fr) 104px minmax(110px, 0.85fr) minmax(140px, 1fr)
    100px 70px 80px 54px;
  align-items: center;
  gap: 12px;
  padding: 9px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-tint);
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.session-row {
  display: grid;
  grid-template-columns:
    minmax(200px, 1.35fr) 104px minmax(110px, 0.85fr) minmax(140px, 1fr)
    100px 70px 80px 54px;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 18px;
  border: 0;
  border-top: 1px solid var(--line);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.14s ease;
}

.session-row:first-of-type {
  border-top: 0;
}

.session-row:hover {
  background: var(--bg-tint);
}

.session-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  color: var(--ink-muted);
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-cell__title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-cell__sub {
  color: var(--ink-faint);
  font-size: 9.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-cell__resume {
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-family: var(--font-sans);
  font-size: 8.5px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.session-cell .mono {
  font-size: 10.5px;
}

.session-cell--findings span {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-faint);
}

.session-cell--findings .has-findings {
  color: var(--accent-ink);
}

.session-cell--actions {
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  overflow: visible;
}

.row-action,
.row-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-faint);
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.14s ease, color 0.14s ease, background-color 0.14s ease;
}

.session-row:hover .row-action,
.session-row:hover .row-arrow,
.row-action:focus-visible {
  opacity: 1;
}

.row-action:hover {
  background: var(--red-soft);
  color: var(--red);
}

.row-arrow {
  opacity: 0;
}

.progress {
  display: block;
  width: 100%;
  max-width: 70px;
  height: 3px;
  margin-top: 3px;
  border-radius: 999px;
  background: var(--line);
  overflow: hidden;
}

.progress__bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--accent);
}

.sessions-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 18px;
  border-top: 1px solid var(--line);
  background: var(--bg-tint);
}

.session-skeleton__row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 15px 18px;
  border-top: 1px solid var(--line);
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

.callout__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex: 1;
}

@media (max-width: 1120px) {
  .session-table__head,
  .session-row {
    grid-template-columns: minmax(190px, 1.4fr) 100px 100px 70px 80px 54px;
  }

  .col-model,
  .col-scope {
    display: none;
  }
}

@media (max-width: 760px) {
  .session-table__head,
  .session-row {
    grid-template-columns: minmax(160px, 1.5fr) 90px 60px 54px;
  }

  .session-table__head span:nth-child(2),
  .session-row .session-cell:nth-child(2),
  .session-table__head span:nth-child(7),
  .session-row .session-cell:nth-child(7) {
    display: none;
  }

  .toolbar__search {
    width: 100%;
  }
}
</style>
