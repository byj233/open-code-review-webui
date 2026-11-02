<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div v-if="initialLoading" class="page overview">
    <div class="skeleton skeleton--text" style="width: 90px" />
    <div class="skeleton skeleton--title" style="width: 52%; height: 48px" />
    <div class="skeleton skeleton--title" style="width: 38%" />
    <div class="stat-grid">
      <div v-for="n in 4" :key="n" class="skeleton skeleton--card" />
    </div>
    <div class="overview-grid">
      <div class="skeleton" style="height: 360px" />
      <div class="skeleton" style="height: 360px" />
    </div>
  </div>

  <div v-else class="page overview">
    <header class="hero">
      <div class="hero__main">
        <p class="eyebrow eyebrow--accent">Workspace overview</p>
        <h1 class="page-title hero__title">
          {{ greeting }}.<br />
          <span class="hero__line">{{ heroLine }}</span>
        </h1>
        <p class="page-description">
          Review a diff, scan a whole repository, and revisit every finding. The console runs the
          same <span class="code-inline">ocr</span> commands as your terminal.
        </p>
        <div class="hero__meta">
          <span class="chip">
            <el-icon><Files /></el-icon>
            {{ repo?.name || 'No repository' }}
          </span>
          <span class="chip chip--mono">
            <el-icon><Share /></el-icon>
            {{ branchLabel }}
          </span>
          <span v-if="meta" class="chip chip--ghost">{{ meta.platform }}</span>
          <span v-if="repo?.is_git && repo.dirty" class="chip chip--accent">
            {{ repo.dirty }} changed
          </span>
        </div>
      </div>
      <div class="hero__actions">
        <el-button type="primary" @click="go('/review')">
          <el-icon class="btn-icon"><EditPen /></el-icon>
          New review
        </el-button>
        <el-button @click="go('/scan')">
          <el-icon class="btn-icon"><Search /></el-icon>
          Scan repository
        </el-button>
      </div>
    </header>

    <div v-if="error" class="callout callout--error">
      <el-icon class="callout__icon"><WarningFilled /></el-icon>
      <div>{{ error }}</div>
    </div>

    <div v-if="repo && !repo.is_git" class="callout callout--warning">
      <el-icon class="callout__icon"><WarningFilled /></el-icon>
      <div>
        <strong>This folder is not a git repository.</strong>
        Code review and scan need Git history. Start the console from a repository, or run
        <span class="code-inline">git init</span> here first.
      </div>
    </div>

    <div v-else-if="active && !active.configured" class="callout">
      <el-icon class="callout__icon"><MagicStick /></el-icon>
      <div class="callout__content">
        <div>
          <strong>Connect a model to start reviewing.</strong>
          Add an API key for a provider, or point the console at an OpenAI-compatible endpoint.
        </div>
        <el-button size="small" @click="go('/providers')">Choose a provider</el-button>
      </div>
    </div>

    <div class="quick-grid">
      <button class="quick-card quick-card--accent" type="button" @click="go('/review')">
        <span class="quick-card__icon"><el-icon><EditPen /></el-icon></span>
        <span class="quick-card__body">
          <span class="quick-card__title">Review changes</span>
          <span class="quick-card__desc">Working tree, a commit, or a branch range</span>
        </span>
        <el-icon class="quick-card__arrow"><ArrowRight /></el-icon>
      </button>
      <button class="quick-card" type="button" @click="go('/scan')">
        <span class="quick-card__icon"><el-icon><Search /></el-icon></span>
        <span class="quick-card__body">
          <span class="quick-card__title">Scan a codebase</span>
          <span class="quick-card__desc">Whole-file review without a diff</span>
        </span>
        <el-icon class="quick-card__arrow"><ArrowRight /></el-icon>
      </button>
      <button class="quick-card" type="button" @click="go('/providers')">
        <span class="quick-card__icon"><el-icon><Connection /></el-icon></span>
        <span class="quick-card__body">
          <span class="quick-card__title">{{ active?.configured ? 'Model & providers' : 'Connect a model' }}</span>
          <span class="quick-card__desc">{{ quickProviderDesc }}</span>
        </span>
        <el-icon class="quick-card__arrow"><ArrowRight /></el-icon>
      </button>
    </div>

    <div class="stat-grid">
      <StatTile
        label="Changed files"
        :value="repo?.is_git ? formatCount(repo.dirty) : '--'"
        :hint="changedHint"
        :icon="Files"
      />
      <StatTile
        label="Saved sessions"
        :value="formatCount(sessions.length)"
        :hint="sessionsHint"
        :icon="Collection"
      />
      <StatTile
        label="Findings recorded"
        :value="formatCount(totalFindings)"
        :hint="findingsHint"
        :icon="ChatDotRound"
      />
      <StatTile
        label="Active model"
        :value="active?.model || active?.provider_label || 'Not set'"
        :hint="providerHint"
        :icon="Connection"
        compact
      />
    </div>

    <div class="overview-grid">
      <SurfaceCard
        title="Recent sessions"
        subtitle="Findings saved under ~/.opencodereview/sessions"
        flush
      >
        <template #actions>
          <router-link class="text-link" to="/sessions">
            View all
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </template>

        <div v-if="sessionsLoading" class="session-skeleton">
          <div v-for="n in 4" :key="n" class="session-row session-row--skeleton">
            <span class="skeleton skeleton--text" style="width: 38%" />
          </div>
        </div>

        <div v-else-if="recentSessions.length" class="session-list">
          <button
            v-for="session in recentSessions"
            :key="session.session_id"
            class="session-row"
            type="button"
            @click="openSession(session.session_id)"
          >
            <span class="session-row__dot" :class="stateDot(sessionState(session).tone)" />
            <span class="session-row__main">
              <span class="session-row__title">
                {{ sessionModeLabel(session) }}
                <span class="session-row__state">{{ sessionState(session).label }}</span>
              </span>
              <span class="session-row__sub">
                {{ formatRelative(session.start_time) }}
                <span class="session-row__sep">·</span>
                {{ session.model || 'model not recorded' }}
                <span v-if="session.git_branch" class="session-row__sep">·</span>
                <span v-if="session.git_branch">{{ session.git_branch }}</span>
              </span>
            </span>
            <span class="session-row__stats">
              <span>{{ formatCount(session.total_comments) }} findings</span>
              <span>{{ session.completed_files }}/{{ session.selected_files }} files</span>
            </span>
            <el-icon class="session-row__arrow"><ArrowRight /></el-icon>
          </button>
        </div>

        <EmptyState
          v-else
          title="No sessions yet"
          description="Your first review will appear here, with every finding saved to disk."
        >
          <el-button type="primary" size="small" @click="go('/review')">Run a review</el-button>
          <el-button size="small" @click="go('/sessions')">Browse history</el-button>
        </EmptyState>

        <template #footer>
          <span class="muted">{{ sessions.length ? `${sessions.length} total sessions` : 'History starts with your first run' }}</span>
          <span class="muted mono">{{ repo?.is_git ? shortPath(repo.path) : 'no repository' }}</span>
        </template>
      </SurfaceCard>

      <div class="stack">
        <SurfaceCard title="Workspace" :subtitle="repo?.is_git ? repo.path : 'Repository status'">
          <template v-if="repo?.is_git" #actions>
            <span class="chip chip--mono">{{ branchLabel }}</span>
          </template>

          <template v-if="repo?.is_git">
            <div class="dirty-row">
              <div class="dirty">
                <span class="dirty__value">{{ repo.staged }}</span>
                <span class="dirty__label">staged</span>
              </div>
              <div class="dirty">
                <span class="dirty__value">{{ repo.unstaged }}</span>
                <span class="dirty__label">unstaged</span>
              </div>
              <div class="dirty">
                <span class="dirty__value">{{ repo.untracked }}</span>
                <span class="dirty__label">untracked</span>
              </div>
              <div v-if="repo.ahead || repo.behind" class="dirty dirty--ahead">
                <span class="dirty__value">{{ repo.ahead }}↑ {{ repo.behind }}↓</span>
                <span class="dirty__label">upstream</span>
              </div>
            </div>

            <div class="commit-list">
              <p class="section-label">Recent commits</p>
              <div v-for="commit in recentCommits" :key="commit.hash" class="commit">
                <span class="commit__hash">{{ commit.short }}</span>
                <span class="commit__subject" :title="commit.subject">{{ commit.subject }}</span>
                <span class="commit__date">{{ commit.date }}</span>
              </div>
              <p v-if="!recentCommits.length" class="faint commit-empty">No commits yet.</p>
            </div>
          </template>

          <EmptyState
            v-else
            title="No repository"
            description="Open the console from a git repository to review diffs and keep history."
          >
            <span class="code-inline">ocr web --repo ~/work/project</span>
          </EmptyState>
        </SurfaceCard>

        <SurfaceCard title="Model" subtitle="Resolved from config, environment, and provider settings">
          <template #actions>
            <router-link class="text-link" to="/providers">Manage</router-link>
          </template>

          <div class="model-card">
            <span class="model-card__mark">
              <BrandMark :size="20" />
            </span>
            <div class="model-card__body">
              <p class="model-card__name">{{ active?.provider_label || 'No provider configured' }}</p>
              <p class="model-card__model mono">{{ active?.model || 'Select a model to begin' }}</p>
            </div>
            <span class="dot" :class="active?.configured ? 'dot--green' : 'dot--amber'" />
          </div>

          <dl class="meta-list">
            <div>
              <dt>Auth</dt>
              <dd>{{ authLabel(active?.auth_mode) }}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{{ sourceLabel(active?.source) }}</dd>
            </div>
            <div v-if="active?.base_url">
              <dt>Endpoint</dt>
              <dd class="mono" :title="active.base_url">{{ active.base_url }}</dd>
            </div>
          </dl>

          <div class="model-actions">
            <el-button
              size="small"
              :loading="testing"
              :disabled="!active?.model"
              @click="testConnection"
            >
              <el-icon class="btn-icon"><VideoPlay /></el-icon>
              Test connection
            </el-button>
            <el-button size="small" @click="go('/settings')">Review settings</el-button>
          </div>
        </SurfaceCard>
      </div>
    </div>

    <SurfaceCard v-if="jobs.length" title="Recent activity" subtitle="Commands started from this console">
      <template #actions>
        <button class="text-button" type="button" @click="loadAll">
          <el-icon><Refresh /></el-icon>
          Refresh
        </button>
      </template>
      <div class="job-list">
        <button
          v-for="job in jobs"
          :key="job.id"
          class="job-row"
          type="button"
          @click="go(`/runs/${job.id}`)"
        >
          <StatusPill :status="job.status" />
          <span class="job-row__title">{{ job.title }}</span>
          <span class="job-row__meta">{{ formatRelative(job.started_at) }}</span>
          <el-icon class="job-row__arrow"><ArrowRight /></el-icon>
        </button>
      </div>
    </SurfaceCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  ChatDotRound,
  Collection,
  Connection,
  EditPen,
  Files,
  MagicStick,
  Refresh,
  Search,
  Share,
  VideoPlay,
  WarningFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import BrandMark from '@/components/BrandMark.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatTile from '@/components/StatTile.vue'
import StatusPill from '@/components/StatusPill.vue'
import SurfaceCard from '@/components/SurfaceCard.vue'
import { api, errorMessage } from '@/api/client'
import { useMetaStore } from '@/stores/meta'
import {
  formatCount,
  formatRelative,
} from '@/utils/format'
import {
  authLabel,
  sessionModeLabel,
  sessionState,
  sourceLabel,
  type Tone,
} from '@/utils/status'
import type { JobSnapshot, SessionSummary } from '@/types'

const router = useRouter()
const { meta, refresh } = useMetaStore()

const sessions = ref<SessionSummary[]>([])
const jobs = ref<JobSnapshot[]>([])
const sessionsLoading = ref(false)
const initialLoading = ref(true)
const error = ref('')
const testing = ref(false)

const repo = computed(() => meta.value?.repo)
const active = computed(() => meta.value?.config.active)
const recentSessions = computed(() => sessions.value.slice(0, 5))
const recentCommits = computed(() => (repo.value?.commits ?? []).slice(0, 5))
const totalFindings = computed(() =>
  sessions.value.reduce((total, session) => total + session.total_comments, 0),
)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 5) return 'Working late'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
const heroLine = computed(() => (repo.value?.is_git ? "Let's review some code." : 'Point the console at a repository.'))
const branchLabel = computed(() => {
  const info = repo.value
  if (!info?.is_git) return 'not a git repository'
  if (info.detached) return `detached @ ${info.head || '--'}`
  return info.branch || 'no commits yet'
})
const changedHint = computed(() => {
  const info = repo.value
  if (!info?.is_git) return 'Git is required for review'
  return `${info.staged} staged · ${info.unstaged} unstaged · ${info.untracked} untracked`
})
const sessionsHint = computed(() => {
  if (!sessions.value.length) return 'No history yet'
  return `Latest ${formatRelative(sessions.value[0].start_time)}`
})
const findingsHint = computed(() => {
  if (!sessions.value.length) return 'Across saved sessions'
  const latest = sessions.value[0]
  return `${latest.total_comments} in the latest session`
})
const providerHint = computed(() => {
  if (!active.value?.configured) return 'No model configured'
  return `${authLabel(active.value.auth_mode)} · ${sourceLabel(active.value.source)}`
})
const quickProviderDesc = computed(() => {
  if (active.value?.configured) return active.value.model || active.value.provider_label || 'Manage models'
  return 'API key, environment variable, or custom endpoint'
})

function stateDot(tone: Tone): string {
  switch (tone) {
    case 'success':
      return 'dot--green'
    case 'warning':
      return 'dot--amber'
    case 'danger':
      return 'dot--red'
    case 'accent':
      return 'dot--accent'
    default:
      return ''
  }
}

function shortPath(path?: string): string {
  if (!path) return ''
  const compact = path
    .replace(/\\/g, '/')
    .replace(/^[A-Za-z]:\/Users\/[^/]+\//, '~/')
    .replace(/^\/home\/[^/]+\//, '~/')
  return compact.length > 46 ? `${compact.slice(0, 22)}…${compact.slice(-20)}` : compact
}

function go(path: string): void {
  void router.push(path)
}

function openSession(id: string): void {
  void router.push(`/sessions/${encodeURIComponent(id)}`)
}

async function loadSessions(): Promise<void> {
  sessionsLoading.value = true
  try {
    const response = await api.sessions(100)
    sessions.value = response.sessions
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    sessionsLoading.value = false
  }
}

async function loadJobs(): Promise<void> {
  try {
    const response = await api.jobs()
    jobs.value = response.jobs.slice(0, 4)
  } catch {
    jobs.value = []
  }
}

async function loadAll(): Promise<void> {
  error.value = ''
  await refresh(true)
  await Promise.all([loadSessions(), loadJobs()])
}

async function testConnection(): Promise<void> {
  testing.value = true
  try {
    const job = await api.testConnection()
    await router.push(`/runs/${job.id}`)
  } catch (err) {
    ElMessage.error(errorMessage(err))
  } finally {
    testing.value = false
  }
}

onMounted(async () => {
  await loadAll()
  initialLoading.value = false
})
</script>

<style scoped>
.overview {
  gap: 24px;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding: 6px 0 6px;
}

.hero__main {
  min-width: 0;
}

.hero__title {
  margin-top: 12px;
  font-size: clamp(36px, 4.3vw, 50px);
  line-height: 1.04;
}

.hero__line {
  color: var(--ink-muted);
  font-style: italic;
  font-weight: 400;
}

.hero__meta {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-bottom: 8px;
  flex-wrap: wrap;
}

.btn-icon {
  margin-right: 5px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 15px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-xs);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
}

.quick-card:hover {
  border-color: var(--line-strong);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.quick-card--accent {
  border-color: rgba(201, 100, 66, 0.2);
  background: var(--accent-softer);
}

.quick-card--accent:hover {
  border-color: rgba(201, 100, 66, 0.38);
}

.quick-card__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink-muted);
  font-size: 16px;
  flex: none;
}

.quick-card--accent .quick-card__icon {
  border-color: rgba(201, 100, 66, 0.2);
  background: var(--surface);
  color: var(--accent);
}

.quick-card__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.quick-card__title {
  color: var(--ink-strong);
  font-size: 12.5px;
  font-weight: 650;
}

.quick-card__desc {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-card__arrow {
  color: var(--ink-faint);
  font-size: 13px;
  flex: none;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(290px, 0.95fr);
  gap: 20px;
  align-items: start;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--accent-ink);
  font-size: 11.5px;
  font-weight: 600;
}

.text-link:hover {
  color: var(--accent);
}

.text-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  color: var(--ink-faint);
  font-size: 11.5px;
  cursor: pointer;
}

.text-button:hover {
  color: var(--accent);
}

.session-list {
  display: flex;
  flex-direction: column;
}

.session-row {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 12px 22px;
  border: 0;
  border-top: 1px solid var(--line);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.14s ease;
}

.session-row:hover {
  background: var(--bg-tint);
}

.session-row__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--ink-faint);
  flex: none;
}

.session-row__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.session-row__title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-strong);
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-row__state {
  color: var(--ink-faint);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.session-row__sub {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-row__sep {
  margin: 0 4px;
  color: var(--line-strong);
}

.session-row__stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  color: var(--ink-faint);
  font-size: 10.5px;
  white-space: nowrap;
}

.session-row__arrow {
  color: var(--ink-faint);
  font-size: 12px;
  transition: transform 0.16s ease, color 0.16s ease;
}

.session-row:hover .session-row__arrow {
  color: var(--accent);
  transform: translateX(2px);
}

.session-row--skeleton {
  cursor: default;
}

.session-skeleton {
  padding-top: 1px;
}

.dirty-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.dirty {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--bg-tint);
}

.dirty--ahead {
  grid-column: span 3;
}

.dirty__value {
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: 20px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.dirty__label {
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.commit-list {
  padding-top: 15px;
}

.commit-list .section-label {
  margin-bottom: 7px;
}

.commit {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 5px 0;
  min-width: 0;
}

.commit__hash {
  flex: none;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--bg-sunken);
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: 9.5px;
}

.commit__subject {
  flex: 1;
  min-width: 0;
  color: var(--ink-muted);
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.commit__date {
  flex: none;
  color: var(--ink-faint);
  font-size: 9.5px;
}

.commit-empty {
  padding: 4px 0;
  font-size: 11.5px;
}

.model-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--line);
}

.model-card__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: var(--bg-tint);
  flex: none;
}

.model-card__body {
  min-width: 0;
  flex: 1;
}

.model-card__name {
  color: var(--ink-strong);
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card__model {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 10.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 13px 0 0;
}

.meta-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
}

.meta-list dt {
  color: var(--ink-faint);
  font-size: 10.5px;
  font-weight: 600;
  flex: none;
}

.meta-list dd {
  margin: 0;
  min-width: 0;
  color: var(--ink-muted);
  font-size: 10.5px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-actions {
  display: flex;
  gap: 7px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.job-list {
  display: flex;
  flex-direction: column;
}

.job-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 0;
  border: 0;
  border-top: 1px solid var(--line);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.job-row:first-child {
  border-top: 0;
}

.job-row:hover .job-row__title {
  color: var(--accent-ink);
}

.job-row__title {
  flex: 1;
  min-width: 0;
  color: var(--ink-muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-row__meta {
  color: var(--ink-faint);
  font-size: 10.5px;
}

.job-row__arrow {
  color: var(--ink-faint);
  font-size: 11px;
}

.callout__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: 1;
  flex-wrap: wrap;
}

@media (max-width: 1180px) {
  .overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 980px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .hero__actions {
    padding-bottom: 0;
  }

  .quick-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 760px) {
  .session-row__stats {
    display: none;
  }

  .dirty-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dirty--ahead {
    grid-column: span 2;
  }
}
</style>
