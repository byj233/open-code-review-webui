<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      eyebrow="Diff review"
      title="Review code changes"
      description="Send a working-tree diff, a single commit, or a branch range to your configured model. The console runs the same agentic review as the CLI."
    >
      <template #actions>
        <el-button text @click="resetForm">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          Reset
        </el-button>
        <router-link class="ghost-link" to="/sessions">Session history</router-link>
      </template>
    </PageHeader>

    <div v-if="resumeId" class="callout resume-callout">
      <el-icon class="callout__icon"><Refresh /></el-icon>
      <div class="resume-callout__body">
        <span>
          Resuming session <span class="mono">{{ resumeId }}</span>. Reused file checkpoints are
          kept; the provider and model must still match the previous run.
        </span>
        <el-button size="small" text @click="clearResume">Clear</el-button>
      </div>
    </div>

    <div class="split review-layout">
      <form class="card form-card" @submit.prevent="submit(false)">
        <section class="form-section">
          <div class="section-heading">
            <span class="section-number">1</span>
            <div>
              <h2 class="section-title">Choose the scope</h2>
              <p class="section-sub">What should the review look at?</p>
            </div>
          </div>

          <div class="mode-cards">
            <button
              v-for="mode in modes"
              :key="mode.value"
              class="mode-card"
              :class="{ 'is-active': form.mode === mode.value }"
              type="button"
              @click="form.mode = mode.value"
            >
              <span class="mode-card__title">
                <el-icon><component :is="mode.icon" /></el-icon>
                {{ mode.label }}
              </span>
              <span class="mode-card__desc">{{ mode.description }}</span>
            </button>
          </div>

          <div v-if="form.mode === 'commit'" class="scope-fields">
            <label class="field-label" for="review-commit">Commit or tag</label>
            <el-select
              id="review-commit"
              v-model="form.commit"
              class="full-width"
              filterable
              allow-create
              default-first-option
              placeholder="abc1234, v1.2.0, or HEAD~1"
            >
              <el-option
                v-for="option in commitOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <p class="field-hint">The parent commit is used as the base for the diff.</p>
          </div>

          <div v-else-if="form.mode === 'range'" class="scope-fields range-fields">
            <div>
              <label class="field-label" for="review-from">From ref</label>
              <el-select
                id="review-from"
                v-model="form.from"
                class="full-width"
                filterable
                allow-create
                default-first-option
                placeholder="main"
              >
                <el-option v-for="ref in refOptions" :key="ref" :label="ref" :value="ref" />
              </el-select>
            </div>
            <button class="swap-button" type="button" title="Swap refs" aria-label="Swap refs" @click="swapRefs">
              <el-icon><Switch /></el-icon>
            </button>
            <div>
              <label class="field-label" for="review-to">To ref</label>
              <el-select
                id="review-to"
                v-model="form.to"
                class="full-width"
                filterable
                allow-create
                default-first-option
                placeholder="feature/my-branch"
              >
                <el-option v-for="ref in refOptions" :key="ref" :label="ref" :value="ref" />
              </el-select>
            </div>
          </div>

          <div v-else class="scope-summary">
            <div class="scope-summary__icon"><el-icon><Monitor /></el-icon></div>
            <div>
              <p class="scope-summary__title">
                {{ repo?.is_git ? `${formatCount(repo.dirty)} changed ${repo.dirty === 1 ? 'file' : 'files'} in the working tree` : 'No repository detected' }}
              </p>
              <p class="scope-summary__text">
                {{
                  repo?.is_git
                    ? `${repo.staged} staged · ${repo.unstaged} unstaged · ${repo.untracked} untracked`
                    : 'Start the console from a git repository to review changes.'
                }}
              </p>
            </div>
          </div>

          <p v-if="scopeError" class="scope-error">{{ scopeError }}</p>
        </section>

        <section class="form-section">
          <div class="section-heading">
            <span class="section-number">2</span>
            <div>
              <h2 class="section-title">Add context</h2>
              <p class="section-sub">Optional, but it sharpens the review.</p>
            </div>
          </div>
          <el-input
            v-model="form.background"
            type="textarea"
            :rows="4"
            maxlength="20000"
            show-word-limit
            resize="vertical"
            placeholder="What is this change trying to do? For example: adding rate limiting to the login API, or migrating billing to the new schema."
          />
          <p class="field-hint">
            Describe the intent, constraints, or migration notes. Do not paste secrets.
          </p>
        </section>

        <section class="form-section form-section--flush">
          <el-collapse v-model="advancedPanels">
            <el-collapse-item name="advanced">
              <template #title>
                <span class="collapse-title">
                  <el-icon><Setting /></el-icon>
                  Advanced options
                  <span v-if="overrideSummary" class="collapse-note">{{ overrideSummary }}</span>
                </span>
              </template>

              <div class="advanced">
                <div class="field">
                  <label class="field-label">Review effort</label>
                  <div class="segmented effort-segments">
                    <button
                      v-for="option in effortOptions"
                      :key="option.value"
                      type="button"
                      class="segmented__item"
                      :class="{ 'is-active': form.effort === option.value }"
                      @click="form.effort = option.value"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                  <p class="field-hint">{{ effortHint }}</p>
                </div>

                <div class="form-grid">
                  <div class="field">
                    <label class="field-label" for="review-provider">Provider override</label>
                    <el-select
                      id="review-provider"
                      v-model="form.provider"
                      class="full-width"
                      clearable
                      filterable
                      placeholder="Use configured provider"
                    >
                      <el-option
                        v-for="provider in providerOptions"
                        :key="provider.name"
                        :label="provider.display_name"
                        :value="provider.name"
                      />
                    </el-select>
                    <p class="field-hint">Only for this run.</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="review-model">Model override</label>
                    <el-select
                      id="review-model"
                      v-model="form.model"
                      class="full-width"
                      clearable
                      filterable
                      allow-create
                      default-first-option
                      placeholder="Use configured model"
                    >
                      <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model" />
                    </el-select>
                    <p class="field-hint">Only for this run.</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="review-concurrency">Concurrency</label>
                    <el-input-number
                      id="review-concurrency"
                      v-model="form.concurrency"
                      :min="1"
                      :max="64"
                      controls-position="right"
                    />
                    <p class="field-hint">Parallel review subtasks.</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="review-timeout">Task timeout (minutes)</label>
                    <el-input-number
                      id="review-timeout"
                      v-model="form.timeout"
                      :min="0"
                      :max="1440"
                      controls-position="right"
                    />
                    <p class="field-hint">0 means no per-task limit.</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="review-max-tokens">Max tokens per group</label>
                    <el-input-number
                      id="review-max-tokens"
                      v-model="form.max_tokens"
                      :min="0"
                      :step="1000"
                      controls-position="right"
                    />
                    <p class="field-hint">0 uses the configured default.</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="review-budget">Token budget</label>
                    <el-input-number
                      id="review-budget"
                      v-model="form.max_tokens_budget"
                      :min="0"
                      :step="10000"
                      controls-position="right"
                    />
                    <p class="field-hint">0 means unlimited.</p>
                  </div>
                  <div class="field full">
                    <label class="field-label" for="review-exclude">Exclude patterns</label>
                    <el-input
                      id="review-exclude"
                      v-model="form.exclude"
                      maxlength="4000"
                      placeholder="**/generated/*, **/testdata/*"
                    />
                    <p class="field-hint">Comma-separated gitignore-style patterns, merged with project rules.</p>
                  </div>
                </div>

                <div class="switch-row">
                  <div>
                    <p class="switch-row__title">Skip post-filtering</p>
                    <p class="switch-row__text">Keep every comment the agent submits, including lower-confidence notes.</p>
                  </div>
                  <el-switch v-model="form.no_filter" />
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </section>

        <footer class="form-footer">
          <div class="form-footer__command">
            <span class="form-footer__label">
              <el-icon><Operation /></el-icon>
              Equivalent command
            </span>
            <CommandBar :command="commandPreview" />
          </div>
          <div class="form-footer__actions">
            <el-button
              :loading="submitting === 'preview'"
              :disabled="!canRun || submitting !== null"
              @click="submit(true)"
            >
              <el-icon class="btn-icon"><View /></el-icon>
              Preview scope
            </el-button>
            <el-button
              type="primary"
              native-type="submit"
              :loading="submitting === 'run'"
              :disabled="!canRun || submitting !== null"
            >
              <el-icon class="btn-icon"><VideoPlay /></el-icon>
              Start review
            </el-button>
          </div>
        </footer>
      </form>

      <aside class="rail">
        <SurfaceCard title="Active model" subtitle="Resolved for this run">
          <div class="rail-model">
            <div class="rail-model__mark"><BrandMark :size="20" /></div>
            <div class="rail-model__body">
              <p class="rail-model__name">{{ effectiveProviderLabel }}</p>
              <p class="rail-model__value mono">{{ effectiveModel }}</p>
            </div>
            <span class="dot" :class="effectiveConfigured ? 'dot--green' : 'dot--amber'" />
          </div>
          <dl class="rail-meta">
            <div>
              <dt>Auth</dt>
              <dd>{{ authLabel(effectiveAuthMode) }}</dd>
            </div>
            <div>
              <dt>Effort</dt>
              <dd>{{ form.effort || 'Configured default' }}</dd>
            </div>
            <div v-if="form.resume">
              <dt>Resume</dt>
              <dd class="mono">{{ form.resume.slice(0, 12) }}…</dd>
            </div>
          </dl>
          <p v-if="!effectiveConfigured" class="rail-warning">
            No model is configured. Choose a provider before running the review.
          </p>
          <router-link class="rail-link" to="/providers">
            Manage providers
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </SurfaceCard>

        <SurfaceCard title="Review pipeline" subtitle="What happens after you start">
          <ol class="pipeline">
            <li v-for="(step, index) in pipeline" :key="step.title">
              <span class="pipeline__index">{{ index + 1 }}</span>
              <div>
                <p class="pipeline__title">{{ step.title }}</p>
                <p class="pipeline__text">{{ step.description }}</p>
              </div>
            </li>
          </ol>
        </SurfaceCard>

        <div class="tip-card">
          <p class="tip-card__label">A good review starts with intent</p>
          <p class="tip-card__text">
            Add the background behind the change. The agent uses it to tell a deliberate trade-off
            from a bug, which cuts down noisy findings.
          </p>
          <p class="tip-card__foot">Preview costs no model tokens.</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  Clock,
  Connection,
  Monitor,
  Operation,
  Refresh,
  Setting,
  Switch,
  VideoPlay,
  View,
} from '@element-plus/icons-vue'
import BrandMark from '@/components/BrandMark.vue'
import CommandBar from '@/components/CommandBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import SurfaceCard from '@/components/SurfaceCard.vue'
import { api, errorMessage } from '@/api/client'
import { useMetaStore } from '@/stores/meta'
import { createReviewForm, reviewCommand } from '@/utils/command'
import { formatCount } from '@/utils/format'
import { authLabel } from '@/utils/status'
import type { ProviderCard, ProvidersResponse, ReviewFormState, ReviewRequest } from '@/types'

const route = useRoute()
const router = useRouter()
const { meta, refresh } = useMetaStore()

const form = reactive<ReviewFormState>(createReviewForm())
const providers = ref<ProvidersResponse | null>(null)
const advancedPanels = ref<string[]>([])
const submitting = ref<'run' | 'preview' | null>(null)
const resumeId = ref('')

const modes = [
  { value: 'workspace', label: 'Working tree', description: 'Staged, unstaged, and untracked files', icon: Monitor },
  { value: 'commit', label: 'Single commit', description: 'Diff a commit against its parent', icon: Clock },
  { value: 'range', label: 'Branch range', description: 'Compare two refs with a merge base', icon: Connection },
] as const

const effortOptions = [
  { value: '', label: 'Default' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const pipeline = [
  { title: 'Select and filter', description: 'Reads the diff, applies rules, and drops binaries, secrets, and oversized files.' },
  { title: 'Group related files', description: 'Bundles files that belong together so each review unit has full context.' },
  { title: 'Agent review', description: 'The agent reads code, searches the repo, and submits line-precise findings.' },
  { title: 'Filter and save', description: 'Low-confidence comments are filtered, then findings and coverage are persisted.' },
]

const repo = computed(() => meta.value?.repo)
const active = computed(() => meta.value?.config.active)
const canRun = computed(() => Boolean(repo.value?.is_git) && !scopeError.value && submitting.value === null)
const scopeError = computed(() => {
  if (!repo.value?.is_git) return 'Open the console from a git repository to run a review.'
  if (form.mode === 'commit' && !form.commit.trim()) return 'Choose a commit or tag to review.'
  if (form.mode === 'range') {
    if (!form.from.trim() || !form.to.trim()) return 'Choose both a from and a to ref.'
    if (form.from.trim() === form.to.trim()) return 'The from and to refs must be different.'
  }
  return ''
})

const refOptions = computed(() => {
  const values = [...(repo.value?.branches ?? []), ...(repo.value?.tags ?? [])]
  return Array.from(new Set(values))
})
const commitOptions = computed(() =>
  (repo.value?.commits ?? []).map((commit) => ({
    value: commit.hash || commit.short,
    label: `${commit.short} · ${commit.subject}`,
  })),
)

const providerOptions = computed<ProviderCard[]>(() => {
  if (!providers.value) return []
  return [...(providers.value.providers ?? []), ...(providers.value.custom ?? [])]
})

const selectedProvider = computed(() =>
  providerOptions.value.find((provider) => provider.name === form.provider) ?? null,
)

const modelOptions = computed(() => {
  const source = selectedProvider.value ?? providerCard(active.value?.provider)
  const models = [...(source?.models ?? [])]
  if (form.model && !models.includes(form.model)) models.unshift(form.model)
  const activeModel = active.value?.model
  if (activeModel && !models.includes(activeModel)) models.unshift(activeModel)
  return models
})

const effectiveProviderLabel = computed(() => {
  if (form.provider) return selectedProvider.value?.display_name || form.provider
  return active.value?.provider_label || 'No provider configured'
})
const effectiveModel = computed(() => {
  if (form.model) return form.model
  if (selectedProvider.value) return selectedProvider.value.model || 'Select a model'
  return active.value?.model || 'No model selected'
})
const effectiveAuthMode = computed(() => selectedProvider.value?.auth_mode ?? active.value?.auth_mode)
const effectiveConfigured = computed(() =>
  form.provider ? Boolean(selectedProvider.value?.configured) : Boolean(active.value?.configured),
)
const overrideSummary = computed(() => {
  if (form.provider && form.model) return 'provider + model override'
  if (form.provider) return 'provider override'
  if (form.model) return 'model override'
  return ''
})
const effortHint = computed(() => {
  switch (form.effort) {
    case 'low':
      return 'One review round per group. Fastest, best for small changes.'
    case 'high':
      return 'Up to three rounds per group. Slower, best for subtle or risky changes.'
    case 'medium':
      return 'Two review rounds per group. The default balance.'
    default:
      return 'Use the configured effort (medium unless changed in Settings).'
  }
})

const commandPreview = computed(() => reviewCommand({ ...form, preview: false }))

function providerCard(name?: string): ProviderCard | undefined {
  if (!name) return undefined
  return providerOptions.value.find((provider) => provider.name === name)
}

function swapRefs(): void {
  const from = form.from
  form.from = form.to
  form.to = from
}

function clearResume(): void {
  resumeId.value = ''
  form.resume = ''
  void router.replace('/review')
}

function resetForm(): void {
  const pristine = createReviewForm()
  Object.assign(form, pristine)
  resumeId.value = ''
  void router.replace('/review')
}

function payload(preview: boolean): ReviewRequest {
  return {
    mode: form.mode,
    from: form.mode === 'range' ? form.from.trim() : '',
    to: form.mode === 'range' ? form.to.trim() : '',
    commit: form.mode === 'commit' ? form.commit.trim() : '',
    resume: form.resume.trim(),
    background: form.background.trim(),
    exclude: form.exclude.trim(),
    provider: form.provider.trim(),
    model: form.model.trim(),
    effort: form.effort,
    concurrency: Number(form.concurrency) || 8,
    timeout: Number(form.timeout) || 0,
    max_tokens: Number(form.max_tokens) || 0,
    max_tokens_budget: Number(form.max_tokens_budget) || 0,
    no_filter: form.no_filter,
    preview,
  }
}

async function submit(preview: boolean): Promise<void> {
  if (!canRun.value) {
    ElMessage.warning(scopeError.value || 'The review is already starting.')
    return
  }
  submitting.value = preview ? 'preview' : 'run'
  try {
    const job = await api.startReview(payload(preview))
    await router.push(`/runs/${job.id}`)
  } catch (error) {
    ElMessage.error(errorMessage(error))
  } finally {
    submitting.value = null
  }
}

async function loadProviders(): Promise<void> {
  try {
    providers.value = await api.providers()
  } catch {
    providers.value = null
  }
}

function applyQuery(): void {
  const query = route.query
  const mode = query.mode
  if (mode === 'commit' || mode === 'range' || mode === 'workspace') {
    form.mode = mode
  }
  if (typeof query.commit === 'string') form.commit = query.commit
  if (typeof query.from === 'string') form.from = query.from
  if (typeof query.to === 'string') form.to = query.to
  if (typeof query.resume === 'string') {
    form.resume = query.resume
    resumeId.value = query.resume
    if (form.mode === 'workspace') form.mode = query.commit ? 'commit' : 'range'
  }
  if (typeof query.background === 'string') form.background = query.background
}

watch(
  () => form.provider,
  (name, previous) => {
    if (name === previous) return
    if (!name) {
      form.model = ''
      return
    }
    const card = providerCard(name)
    if (card) form.model = card.model || card.models[0] || ''
  },
)

onMounted(async () => {
  applyQuery()
  await Promise.all([refresh(true), loadProviders()])
})
</script>

<style scoped>
.review-layout {
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.86fr);
}

.form-card {
  overflow: hidden;
}

.form-section {
  padding: 22px 24px;
  border-bottom: 1px solid var(--line);
}

.form-section--flush {
  padding-bottom: 6px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-bottom: 16px;
}

.section-number {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--bg-tint);
  color: var(--ink-faint);
  font-family: var(--font-mono);
  font-size: 10px;
  flex: none;
}

.section-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 550;
  letter-spacing: -0.015em;
  color: var(--ink-strong);
  line-height: 1.25;
}

.section-sub {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 11.5px;
}

.scope-fields {
  margin-top: 15px;
}

.scope-fields.range-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr);
  align-items: end;
  gap: 8px;
}

.swap-button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-bottom: 1px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink-faint);
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease;
}

.swap-button:hover {
  border-color: var(--line-strong);
  color: var(--accent);
}

.field-label {
  display: block;
  margin-bottom: 6px;
  color: var(--ink-muted);
  font-size: 11.5px;
  font-weight: 600;
}

.full-width {
  width: 100%;
}

.scope-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px dashed var(--line-strong);
  border-radius: 11px;
  background: var(--bg-tint);
}

.scope-summary__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  color: var(--ink-faint);
  flex: none;
}

.scope-summary__title {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 600;
}

.scope-summary__text {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 11px;
}

.scope-error {
  margin-top: 10px;
  color: var(--red);
  font-size: 11.5px;
}

.collapse-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.collapse-note {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: 0;
  text-transform: none;
}

.advanced {
  padding-top: 4px;
}

.field {
  min-width: 0;
}

.effort-segments {
  margin-bottom: 7px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 6px;
  padding: 12px 0 4px;
  border-top: 1px dashed var(--line);
}

.switch-row__title {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 600;
}

.switch-row__text {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 11px;
  line-height: 1.5;
}

.form-footer {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 16px 24px 18px;
  background: var(--bg-tint);
}

.form-footer__command {
  width: 100%;
}

.form-footer__label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.form-footer__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-icon {
  margin-right: 5px;
}

.ghost-link {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 12px;
  border-radius: 9px;
  color: var(--ink-muted);
  font-size: 12.5px;
  font-weight: 550;
}

.ghost-link:hover {
  background: var(--bg-tint);
  color: var(--ink);
}

.resume-callout {
  align-items: center;
}

.resume-callout__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex: 1;
  flex-wrap: wrap;
}

.rail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: calc(var(--topbar-height) + 20px);
}

.rail-model {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.rail-model__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: var(--bg-tint);
  flex: none;
}

.rail-model__body {
  min-width: 0;
  flex: 1;
}

.rail-model__name {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rail-model__value {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 10.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rail-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 12px 0 0;
}

.rail-meta > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.rail-meta dt {
  color: var(--ink-faint);
  font-size: 10.5px;
}

.rail-meta dd {
  margin: 0;
  color: var(--ink-muted);
  font-size: 10.5px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rail-warning {
  margin-top: 12px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--amber-soft);
  color: var(--amber);
  font-size: 10.5px;
  line-height: 1.5;
}

.rail-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 13px;
  color: var(--accent-ink);
  font-size: 11.5px;
  font-weight: 600;
}

.pipeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
}

.pipeline li {
  display: flex;
  gap: 10px;
  padding: 9px 0;
  border-top: 1px dashed var(--line);
}

.pipeline li:first-child {
  padding-top: 0;
  border-top: 0;
}

.pipeline li:last-child {
  padding-bottom: 0;
}

.pipeline__index {
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  margin-top: 1px;
  border-radius: 999px;
  background: var(--accent-softer);
  color: var(--accent-ink);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 650;
  flex: none;
}

.pipeline__title {
  color: var(--ink-strong);
  font-size: 11.5px;
  font-weight: 600;
}

.pipeline__text {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 10.5px;
  line-height: 1.55;
}

.tip-card {
  padding: 18px 19px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    radial-gradient(180px 120px at 100% 0%, rgba(201, 100, 66, 0.08), transparent 70%),
    var(--bg-tint);
}

.tip-card__label {
  color: var(--accent-ink);
  font-family: var(--font-display);
  font-size: 14px;
  font-style: italic;
}

.tip-card__text {
  margin-top: 6px;
  color: var(--ink-muted);
  font-size: 11.5px;
  line-height: 1.65;
}

.tip-card__foot {
  margin-top: 9px;
  color: var(--ink-faint);
  font-size: 10px;
}

@media (max-width: 1060px) {
  .review-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .rail {
    position: static;
  }
}

@media (max-width: 760px) {
  .form-section {
    padding: 18px 16px;
  }

  .form-footer {
    padding: 14px 16px 16px;
  }

  .scope-fields.range-fields {
    grid-template-columns: minmax(0, 1fr);
  }

  .swap-button {
    display: none;
  }

  .form-footer__actions {
    width: 100%;
  }

  .form-footer__actions .el-button {
    flex: 1;
  }
}
</style>
