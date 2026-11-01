<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      :eyebrow="t('nav.scan')"
      :title="t('scan.header.title')"
      :description="t('scan.header.description')"
    >
      <template #actions>
        <el-button text @click="resetForm">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          {{ t('common.reset') }}
        </el-button>
        <router-link class="ghost-link" to="/sessions">{{ t('scan.header.sessionHistory') }}</router-link>
      </template>
    </PageHeader>

    <div class="split scan-layout">
      <form class="card form-card" @submit.prevent="submit(false)">
        <section class="form-section">
          <div class="section-heading">
            <span class="section-number">1</span>
            <div>
              <h2 class="section-title">{{ t('scan.scope.title') }}</h2>
              <p class="section-sub">{{ t('scan.scope.subtitle') }}</p>
            </div>
          </div>
          <label class="field-label" for="scan-paths">{{ t('scan.scope.paths') }}</label>
          <el-input
            id="scan-paths"
            v-model="form.paths"
            placeholder="src/, internal/agent, cmd/opencodereview"
            maxlength="4000"
          />
          <p class="field-hint">{{ t('scan.scope.pathsHint') }}</p>
          <p v-if="pathsError" class="scope-error">{{ pathsError }}</p>

          <div class="scan-scope">
            <div class="scan-scope__item">
              <span class="scan-scope__value">{{ repo?.is_git ? formatCount(repo.dirty) : '--' }}</span>
              <span class="scan-scope__label">{{ t('scan.scope.changedFiles') }}</span>
            </div>
            <div class="scan-scope__item">
              <span class="scan-scope__value">{{ repo?.is_git ? repo.branches.length : '--' }}</span>
              <span class="scan-scope__label">{{ t('scan.scope.refsAvailable') }}</span>
            </div>
            <div class="scan-scope__item scan-scope__item--wide">
              <span class="scan-scope__value mono">{{ form.paths ? t('scan.scope.selectedPaths') : t('scan.scope.wholeRepository') }}</span>
              <span class="scan-scope__label">{{ t('scan.scope.valueLabel') }}</span>
            </div>
          </div>
        </section>

        <section class="form-section">
          <div class="section-heading">
            <span class="section-number">2</span>
            <div>
              <h2 class="section-title">{{ t('scan.context.title') }}</h2>
              <p class="section-sub">{{ t('scan.context.subtitle') }}</p>
            </div>
          </div>
          <el-input
            v-model="form.background"
            type="textarea"
            :rows="4"
            maxlength="20000"
            show-word-limit
            resize="vertical"
            :placeholder="t('scan.context.placeholder')"
          />
        </section>

        <section class="form-section form-section--flush">
          <el-collapse v-model="advancedPanels">
            <el-collapse-item name="advanced">
              <template #title>
                <span class="collapse-title">
                  <el-icon><Setting /></el-icon>
                  {{ t('scan.advanced.title') }}
                  <span v-if="form.provider || form.model" class="collapse-note">{{ t('scan.advanced.overrideNote') }}</span>
                </span>
              </template>

              <div class="advanced">
                <div class="form-grid">
                  <div class="field">
                    <label class="field-label" for="scan-batch">{{ t('scan.advanced.batch') }}</label>
                    <el-select id="scan-batch" v-model="form.batch" class="full-width">
                      <el-option :label="t('scan.advanced.batchDefault')" value="" />
                      <el-option :label="t('scan.advanced.batchNone')" value="none" />
                      <el-option :label="t('scan.advanced.batchByLanguage')" value="by-language" />
                      <el-option :label="t('scan.advanced.batchByDirectory')" value="by-directory" />
                    </el-select>
                    <p class="field-hint">{{ batchHint }}</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="scan-exclude">{{ t('scan.advanced.exclude') }}</label>
                    <el-input
                      id="scan-exclude"
                      v-model="form.exclude"
                      maxlength="4000"
                      placeholder="**/generated/*, **/vendor/*"
                    />
                    <p class="field-hint">{{ t('scan.advanced.excludeHint') }}</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="scan-provider">{{ t('scan.advanced.provider') }}</label>
                    <el-select
                      id="scan-provider"
                      v-model="form.provider"
                      class="full-width"
                      clearable
                      filterable
                      :placeholder="t('scan.advanced.providerPlaceholder')"
                    >
                      <el-option
                        v-for="provider in providerOptions"
                        :key="provider.name"
                        :label="provider.display_name"
                        :value="provider.name"
                      />
                    </el-select>
                  </div>
                  <div class="field">
                    <label class="field-label" for="scan-model">{{ t('scan.advanced.model') }}</label>
                    <el-select
                      id="scan-model"
                      v-model="form.model"
                      class="full-width"
                      clearable
                      filterable
                      allow-create
                      default-first-option
                      :placeholder="t('scan.advanced.modelPlaceholder')"
                    >
                      <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model" />
                    </el-select>
                  </div>
                  <div class="field">
                    <label class="field-label" for="scan-concurrency">{{ t('scan.advanced.concurrency') }}</label>
                    <el-input-number
                      id="scan-concurrency"
                      v-model="form.concurrency"
                      :min="1"
                      :max="64"
                      controls-position="right"
                    />
                  </div>
                  <div class="field">
                    <label class="field-label" for="scan-timeout">{{ t('scan.advanced.timeout') }}</label>
                    <el-input-number
                      id="scan-timeout"
                      v-model="form.timeout"
                      :min="0"
                      :max="1440"
                      controls-position="right"
                    />
                  </div>
                  <div class="field">
                    <label class="field-label" for="scan-max-tokens">{{ t('scan.advanced.maxTokens') }}</label>
                    <el-input-number
                      id="scan-max-tokens"
                      v-model="form.max_tokens"
                      :min="0"
                      :step="1000"
                      controls-position="right"
                    />
                    <p class="field-hint">{{ t('scan.advanced.maxTokensHint') }}</p>
                  </div>
                  <div class="field">
                    <label class="field-label" for="scan-budget">{{ t('scan.advanced.budget') }}</label>
                    <el-input-number
                      id="scan-budget"
                      v-model="form.max_tokens_budget"
                      :min="0"
                      :step="10000"
                      controls-position="right"
                    />
                    <p class="field-hint">{{ t('scan.advanced.budgetHint') }}</p>
                  </div>
                </div>

                <div class="toggle-list">
                  <div class="switch-row">
                    <div>
                      <p class="switch-row__title">{{ t('scan.advanced.planTitle') }}</p>
                      <p class="switch-row__text">{{ t('scan.advanced.planText') }}</p>
                    </div>
                    <el-switch v-model="form.no_plan" />
                  </div>
                  <div class="switch-row">
                    <div>
                      <p class="switch-row__title">{{ t('scan.advanced.dedupTitle') }}</p>
                      <p class="switch-row__text">{{ t('scan.advanced.dedupText') }}</p>
                    </div>
                    <el-switch v-model="form.no_dedup" />
                  </div>
                  <div class="switch-row">
                    <div>
                      <p class="switch-row__title">{{ t('scan.advanced.summaryTitle') }}</p>
                      <p class="switch-row__text">{{ t('scan.advanced.summaryText') }}</p>
                    </div>
                    <el-switch v-model="form.no_summary" />
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </section>

        <footer class="form-footer">
          <div class="form-footer__command">
            <span class="form-footer__label">
              <el-icon><Operation /></el-icon>
              {{ t('scan.footer.equivalentCommand') }}
            </span>
            <CommandBar :command="commandPreview" />
          </div>
          <div class="form-footer__actions">
            <el-button
              :loading="submitting === 'preview'"
              :disabled="submitting !== null || Boolean(pathsError)"
              @click="submit(true)"
            >
              <el-icon class="btn-icon"><View /></el-icon>
              {{ t('scan.footer.preview') }}
            </el-button>
            <el-button
              type="primary"
              native-type="submit"
              :loading="submitting === 'run'"
              :disabled="submitting !== null || Boolean(pathsError)"
            >
              <el-icon class="btn-icon"><VideoPlay /></el-icon>
              {{ t('scan.footer.start') }}
            </el-button>
          </div>
        </footer>
      </form>

      <aside class="rail">
        <SurfaceCard :title="t('scan.rail.activeModel')" :subtitle="t('scan.rail.activeModelSubtitle')">
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
              <dt>{{ t('scan.rail.auth') }}</dt>
              <dd>{{ authLabel(active?.auth_mode) }}</dd>
            </div>
            <div>
              <dt>{{ t('scan.rail.scope') }}</dt>
              <dd>{{ form.paths ? t('scan.scope.selectedPaths') : t('scan.scope.wholeRepository') }}</dd>
            </div>
            <div>
              <dt>{{ t('scan.rail.batching') }}</dt>
              <dd>{{ batchLabel }}</dd>
            </div>
          </dl>
          <p v-if="!effectiveConfigured" class="rail-warning">
            {{ t('scan.rail.warning') }}
          </p>
          <router-link class="rail-link" to="/providers">
            {{ t('scan.rail.manageProviders') }}
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </SurfaceCard>

        <SurfaceCard :title="t('scan.rail.whenToScan')" :subtitle="t('scan.rail.whenToScanSubtitle')">
          <ul class="reason-list">
            <li>
              <span class="reason-list__icon"><el-icon><FolderOpened /></el-icon></span>
              <div>
                <p class="reason-list__title">{{ t('scan.rail.reasonUnfamiliar') }}</p>
                <p class="reason-list__text">{{ t('scan.rail.reasonUnfamiliarText') }}</p>
              </div>
            </li>
            <li>
              <span class="reason-list__icon"><el-icon><Document /></el-icon></span>
              <div>
                <p class="reason-list__title">{{ t('scan.rail.reasonHistory') }}</p>
                <p class="reason-list__text">{{ t('scan.rail.reasonHistoryText') }}</p>
              </div>
            </li>
            <li>
              <span class="reason-list__icon"><el-icon><Compass /></el-icon></span>
              <div>
                <p class="reason-list__title">{{ t('scan.rail.reasonFocused') }}</p>
                <p class="reason-list__text">{{ t('scan.rail.reasonFocusedText') }}</p>
              </div>
            </li>
          </ul>
        </SurfaceCard>

        <div class="tip-card">
          <p class="tip-card__label">{{ t('scan.rail.tipLabel') }}</p>
          <p class="tip-card__text">{{ t('scan.rail.tipText') }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  Compass,
  Document,
  FolderOpened,
  Operation,
  Refresh,
  Setting,
  VideoPlay,
  View,
} from '@element-plus/icons-vue'
import BrandMark from '@/components/BrandMark.vue'
import CommandBar from '@/components/CommandBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import SurfaceCard from '@/components/SurfaceCard.vue'
import { useI18n } from '@/i18n'
import { api, errorMessage } from '@/api/client'
import { useMetaStore } from '@/stores/meta'
import { createScanForm, scanCommand } from '@/utils/command'
import { formatCount } from '@/utils/format'
import { jobPath } from '@/utils/routes'
import { authLabel } from '@/utils/status'
import type { ProviderCard, ProvidersResponse, ScanFormState, ScanRequest } from '@/types'

const { meta, refresh } = useMetaStore()
const router = useRouter()
const { t, tn } = useI18n()
const form = reactive<ScanFormState>(createScanForm())
const providers = ref<ProvidersResponse | null>(null)
const advancedPanels = ref<string[]>([])
const submitting = ref<'run' | 'preview' | null>(null)

const repo = computed(() => meta.value?.repo)
const active = computed(() => meta.value?.config.active)
const pathsError = computed(() => {
  for (const raw of form.paths.split(',')) {
    const path = raw.trim()
    if (!path) continue
    const normalized = path.replace(/\\/g, '/')
    if (normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized)) return t('scan.scope.errorRelative')
    if (normalized.split('/').includes('..')) return t('scan.scope.errorInside')
  }
  return ''
})

const providerOptions = computed<ProviderCard[]>(() => {
  if (!providers.value) return []
  return [...(providers.value.providers ?? []), ...(providers.value.custom ?? [])]
})
const selectedProvider = computed(() =>
  providerOptions.value.find((provider) => provider.name === form.provider) ?? null,
)
const modelOptions = computed(() => {
  const source = selectedProvider.value ?? providerOptions.value.find((provider) => provider.name === active.value?.provider)
  const models = [...(source?.models ?? [])]
  if (active.value?.model && !models.includes(active.value.model)) models.unshift(active.value.model)
  if (form.model && !models.includes(form.model)) models.unshift(form.model)
  return models
})
const effectiveProviderLabel = computed(() =>
  form.provider
    ? selectedProvider.value?.display_name || form.provider
    : active.value?.provider_label || t('scan.rail.noProvider'),
)
const effectiveModel = computed(() => {
  if (form.model) return form.model
  if (selectedProvider.value) return selectedProvider.value.model || t('scan.rail.selectModel')
  return active.value?.model || t('scan.rail.noModelSelected')
})
const effectiveConfigured = computed(() =>
  form.provider ? Boolean(selectedProvider.value?.configured) : Boolean(active.value?.configured),
)
const batchLabel = computed(() => {
  switch (form.batch) {
    case 'none':
      return t('scan.advanced.batchNone')
    case 'by-language':
      return t('scan.advanced.batchByLanguage')
    case 'by-directory':
      return t('scan.advanced.batchByDirectory')
    default:
      return t('scan.advanced.batchDefault')
  }
})
const batchHint = computed(() => {
  switch (form.batch) {
    case 'none':
      return t('scan.advanced.batchHintNone')
    case 'by-language':
      return t('scan.advanced.batchHintLanguage')
    case 'by-directory':
      return t('scan.advanced.batchHintDirectory')
    default:
      return t('scan.advanced.batchHintDefault')
  }
})
const commandPreview = computed(() => scanCommand({ ...form, preview: false }))

function payload(preview: boolean): ScanRequest {
  return {
    paths: form.paths.trim(),
    background: form.background.trim(),
    exclude: form.exclude.trim(),
    provider: form.provider.trim(),
    model: form.model.trim(),
    batch: form.batch,
    concurrency: Number(form.concurrency) || 8,
    timeout: Number(form.timeout) || 0,
    max_tokens: Number(form.max_tokens) || 0,
    max_tokens_budget: Number(form.max_tokens_budget) || 0,
    no_plan: form.no_plan,
    no_dedup: form.no_dedup,
    no_summary: form.no_summary,
    preview,
  }
}

async function submit(preview: boolean): Promise<void> {
  if (pathsError.value) {
    ElMessage.warning(pathsError.value)
    return
  }
  submitting.value = preview ? 'preview' : 'run'
  try {
    const job = await api.startScan(payload(preview))
    await router.push(jobPath(job.id, job.kind))
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

function resetForm(): void {
  Object.assign(form, createScanForm())
}

watch(
  () => form.provider,
  (name, previous) => {
    if (name === previous) return
    if (!name) {
      form.model = ''
      return
    }
    const card = providerOptions.value.find((provider) => provider.name === name)
    if (card) form.model = card.model || card.models[0] || ''
  },
)

onMounted(async () => {
  await Promise.all([refresh(true), loadProviders()])
})
</script>

<style scoped>
.scan-layout {
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

.scope-error {
  margin-top: 8px;
  color: var(--red);
  font-size: 11.5px;
}

.scan-scope {
  display: grid;
  grid-template-columns: 1fr 1fr 1.4fr;
  gap: 8px;
  margin-top: 16px;
}

.scan-scope__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 11px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--bg-tint);
}

.scan-scope__value {
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: 19px;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scan-scope__value.mono {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 650;
}

.scan-scope__label {
  color: var(--ink-faint);
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: 0.07em;
  text-transform: uppercase;
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
  text-transform: none;
}

.advanced {
  padding-top: 4px;
}

.field {
  min-width: 0;
}

.toggle-list {
  display: flex;
  flex-direction: column;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 11px 0;
  border-top: 1px dashed var(--line);
}

.switch-row:first-child {
  margin-top: 4px;
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

.reason-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
}

.reason-list li {
  display: flex;
  gap: 9px;
}

.reason-list__icon {
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-tint);
  color: var(--ink-faint);
  font-size: 13px;
  flex: none;
}

.reason-list__title {
  color: var(--ink-strong);
  font-size: 11.5px;
  font-weight: 600;
}

.reason-list__text {
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

@media (max-width: 1060px) {
  .scan-layout {
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

  .scan-scope {
    grid-template-columns: 1fr 1fr;
  }

  .scan-scope__item--wide {
    grid-column: span 2;
  }

  .form-footer__actions {
    width: 100%;
  }

  .form-footer__actions .el-button {
    flex: 1;
  }
}
</style>
