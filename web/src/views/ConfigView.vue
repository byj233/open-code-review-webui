<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      :eyebrow="t('nav.group.setup')"
      :title="t('nav.settings')"
      :description="t('config.page.description')"
    >
      <template #actions>
        <el-button text :loading="loading" @click="load()">
          <el-icon class="btn-icon"><Refresh /></el-icon>
          {{ t('config.actions.reload') }}
        </el-button>
        <el-button type="primary" @click="go('/providers')">
          <el-icon class="btn-icon"><Connection /></el-icon>
          {{ t('config.actions.manageProviders') }}
        </el-button>
      </template>
    </PageHeader>

    <div v-if="error" class="callout callout--error">
      <el-icon class="callout__icon"><WarningFilled /></el-icon>
      <div class="callout__content">
        <span>{{ error }}</span>
        <el-button size="small" @click="load()">{{ t('common.retry') }}</el-button>
      </div>
    </div>

    <div v-if="loading && !configView" class="settings-grid">
      <div class="stack">
        <div class="skeleton" style="height: 300px" />
        <div class="skeleton" style="height: 260px" />
      </div>
      <div class="stack">
        <div class="skeleton" style="height: 180px" />
        <div class="skeleton" style="height: 200px" />
      </div>
    </div>

    <div v-else class="settings-grid">
      <div class="stack settings-main">
        <SurfaceCard :title="t('config.model.title')" :subtitle="t('config.model.subtitle')">
          <div class="active-provider">
            <span class="active-provider__mark"><BrandMark :size="18" /></span>
            <div class="active-provider__body">
              <p class="active-provider__name">{{ configView?.active.provider_label || t('config.model.noProvider') }}</p>
              <p class="active-provider__meta">
                {{ configView?.active.model || t('config.model.noModel') }}
                <span class="sep">·</span>
                {{ authLabel(configView?.active.auth_mode) }}
                <span class="sep">·</span>
                {{ sourceLabel(configView?.active.source) }}
              </p>
            </div>
            <router-link class="text-link" to="/providers">
              {{ t('config.model.change') }}
              <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>

          <el-form label-position="top" class="settings-form" @submit.prevent="saveModel">
            <div class="form-grid">
              <el-form-item :label="t('config.model.modelLabel')">
                <el-select
                  v-model="modelForm.model"
                  class="full-width"
                  filterable
                  allow-create
                  default-first-option
                  :placeholder="t('config.model.modelPlaceholder')"
                >
                  <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model" />
                </el-select>
                <p class="field-hint">{{ t('config.model.modelHint') }}</p>
              </el-form-item>
              <el-form-item :label="t('config.model.effortLabel')">
                <el-select v-model="modelForm.effort" class="full-width" :placeholder="t('config.model.effortDefault')">
                  <el-option :label="t('config.model.effortDefault')" value="" />
                  <el-option :label="t('config.model.effortLow')" value="low" />
                  <el-option :label="t('config.model.effortMedium')" value="medium" />
                  <el-option :label="t('config.model.effortHigh')" value="high" />
                </el-select>
                <p class="field-hint">{{ t('config.model.effortHint') }}</p>
              </el-form-item>
              <el-form-item :label="t('config.model.maxTokensLabel')">
                <el-input-number v-model="modelForm.maxTokens" :min="0" :step="1000" controls-position="right" />
                <p class="field-hint">{{ t('config.model.maxTokensHint') }}</p>
              </el-form-item>
              <el-form-item :label="t('config.model.languageLabel')">
                <el-input v-model="modelForm.language" :placeholder="t('config.model.languagePlaceholder')" maxlength="80" />
                <p class="field-hint">{{ t('config.model.languageHint') }}</p>
              </el-form-item>
            </div>
            <div class="form-actions">
              <span v-if="modelDirty" class="dirty-note">{{ t('config.common.unsavedChanges') }}</span>
              <el-button type="primary" :disabled="!modelDirty" :loading="saving === 'model'" @click="saveModel">
                {{ t('config.model.save') }}
              </el-button>
            </div>
          </el-form>
        </SurfaceCard>

        <SurfaceCard
          :title="t('config.legacy.title')"
          :subtitle="t('config.legacy.subtitle')"
        >
          <div v-if="configView?.active.provider" class="callout callout--warning legacy-warning">
            <el-icon class="callout__icon"><InfoFilled /></el-icon>
            <div>
              {{ t('config.legacy.overrideBefore') }}<span class="code-inline">llm.*</span>{{ t('config.legacy.overrideAfter') }}
            </div>
          </div>

          <el-form label-position="top" class="settings-form" @submit.prevent="saveLlm">
            <div class="form-grid">
              <el-form-item :label="t('config.legacy.urlLabel')">
                <el-input v-model="llmForm.url" placeholder="https://api.example.com/v1" />
              </el-form-item>
              <el-form-item :label="t('config.legacy.modelLabel')">
                <el-input v-model="llmForm.model" :placeholder="t('config.legacy.modelPlaceholder')" />
              </el-form-item>
              <el-form-item :label="t('config.legacy.protocolLabel')">
                <el-select v-model="llmForm.protocol" class="full-width" :placeholder="t('config.legacy.protocolAnthropic')">
                  <el-option :label="t('config.legacy.protocolAnthropic')" value="anthropic" />
                  <el-option :label="t('config.legacy.protocolOpenaiChat')" value="openai" />
                  <el-option :label="t('config.legacy.protocolOpenaiResponses')" value="openai-responses" />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('config.legacy.timeoutLabel')">
                <el-input-number v-model="llmForm.timeoutSec" :min="0" :max="86400" controls-position="right" />
                <p class="field-hint">{{ t('config.legacy.timeoutHint') }}</p>
              </el-form-item>
              <el-form-item :label="t('config.legacy.authTokenLabel')">
                <el-input
                  v-model="llmForm.authToken"
                  type="password"
                  show-password
                  autocomplete="off"
                  :placeholder="configView?.llm.auth_token_set ? t('config.legacy.authTokenPlaceholderStored') : t('config.legacy.authTokenPlaceholder')"
                />
                <p class="field-hint">{{ t('config.legacy.authTokenHint') }}</p>
              </el-form-item>
              <el-form-item :label="t('config.legacy.authTokenCmdLabel')">
                <el-input v-model="llmForm.authTokenCmd" placeholder="secret-tool lookup llm token" />
                <p class="field-hint">{{ t('config.legacy.authTokenCmdHint') }}</p>
              </el-form-item>
            </div>
            <div class="form-actions form-actions--split">
              <el-button
                v-if="configView?.llm.auth_token_set"
                text
                type="danger"
                :loading="saving === 'clear-token'"
                @click="clearToken"
              >
                {{ t('config.legacy.clearToken') }}
              </el-button>
              <span class="spacer" />
              <span v-if="llmDirty" class="dirty-note">{{ t('config.common.unsavedChanges') }}</span>
              <el-button type="primary" :disabled="!llmDirty" :loading="saving === 'llm'" @click="saveLlm">
                {{ t('config.legacy.save') }}
              </el-button>
            </div>
          </el-form>
        </SurfaceCard>

        <SurfaceCard :title="t('config.telemetry.title')" :subtitle="t('config.telemetry.subtitle')">
          <el-form label-position="top" class="settings-form" @submit.prevent="saveTelemetry">
            <div class="toggle-row">
              <div>
                <p class="toggle-row__title">{{ t('config.telemetry.enableTitle') }}</p>
                <p class="toggle-row__text">{{ t('config.telemetry.enableText') }}</p>
              </div>
              <el-switch v-model="telemetryForm.enabled" />
            </div>
            <div class="form-grid telemetry-grid">
              <el-form-item :label="t('config.telemetry.exporterLabel')">
                <el-select v-model="telemetryForm.exporter" class="full-width" :placeholder="t('config.telemetry.exporterPlaceholder')">
                  <el-option :label="t('config.telemetry.exporterConsole')" value="console" />
                  <el-option :label="t('config.telemetry.exporterOtlp')" value="otlp" />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('config.telemetry.otlpLabel')">
                <el-input v-model="telemetryForm.otlpEndpoint" placeholder="http://localhost:4318" />
              </el-form-item>
            </div>
            <div class="toggle-row">
              <div>
                <p class="toggle-row__title">{{ t('config.telemetry.contentTitle') }}</p>
                <p class="toggle-row__text">{{ t('config.telemetry.contentText') }}</p>
              </div>
              <el-switch v-model="telemetryForm.contentLog" />
            </div>
            <div class="form-actions">
              <span v-if="telemetryDirty" class="dirty-note">{{ t('config.common.unsavedChanges') }}</span>
              <el-button type="primary" :disabled="!telemetryDirty" :loading="saving === 'telemetry'" @click="saveTelemetry">
                {{ t('config.telemetry.save') }}
              </el-button>
            </div>
          </el-form>
        </SurfaceCard>
      </div>

      <aside class="stack settings-rail">
        <SurfaceCard :title="t('config.file.title')" :subtitle="t('config.file.subtitle')">
          <div class="config-path">
            <el-icon><FolderOpened /></el-icon>
            <span class="mono" :title="configView?.path">{{ configView?.path || t('config.file.loading') }}</span>
          </div>
          <div class="config-meta">
            <span class="chip">
              <span class="dot" :class="configView?.exists ? 'dot--green' : 'dot--amber'" />
              {{ configView?.exists ? t('config.file.exists') : t('config.file.notCreated') }}
            </span>
            <span v-if="configView?.error" class="chip chip--accent">{{ t('config.file.parseError') }}</span>
          </div>
          <p v-if="configView?.error" class="config-error">{{ configView.error }}</p>
          <p class="config-note">
            {{ t('config.file.noteBefore') }}<span class="code-inline">ocr config set</span>{{ t('config.file.noteBetween') }}<span class="code-inline">ocr config unset</span>{{ t('config.file.noteAfter') }}
          </p>
          <div class="config-actions">
            <el-button size="small" @click="copyPath">
              <el-icon class="btn-icon"><CopyDocument /></el-icon>
              {{ t('config.file.copyPath') }}
            </el-button>
            <el-button size="small" text @click="go('/providers')">{{ t('nav.providers') }}</el-button>
          </div>
        </SurfaceCard>

        <SurfaceCard :title="t('config.mcp.title')" :subtitle="t('config.mcp.configuredCount', { count: configView?.mcp_servers?.length ?? 0 })">
          <div v-if="configView?.mcp_servers?.length" class="mcp-list">
            <div v-for="server in configView.mcp_servers" :key="server.name" class="mcp-row">
              <div class="mcp-row__body">
                <p class="mcp-row__name">{{ server.name }}</p>
                <p class="mcp-row__meta">
                  <span class="chip chip--ghost">{{ server.type || 'stdio' }}</span>
                  <span class="mono" :title="server.command || server.url">{{ server.command || server.url || t('config.mcp.noCommand') }}</span>
                </p>
              </div>
              <el-tooltip :content="t('config.mcp.removeServer')" placement="top" :show-after="300">
                <button class="icon-button" type="button" :aria-label="t('config.mcp.removeServer')" @click="removeMcp(server.name)">
                  <el-icon><Delete /></el-icon>
                </button>
              </el-tooltip>
            </div>
          </div>
          <EmptyState
            v-else
            :title="t('config.mcp.emptyTitle')"
            :description="t('config.mcp.emptyDescription')"
          />
        </SurfaceCard>

        <div class="settings-tip">
          <p class="settings-tip__title">{{ t('config.secrets.title') }}</p>
          <p class="settings-tip__text">
            {{ t('config.secrets.textBefore') }}<span class="code-inline">*_cmd</span>{{ t('config.secrets.textAfter') }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowRight,
  Connection,
  CopyDocument,
  Delete,
  FolderOpened,
  InfoFilled,
  Refresh,
  WarningFilled,
} from '@element-plus/icons-vue'
import BrandMark from '@/components/BrandMark.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import SurfaceCard from '@/components/SurfaceCard.vue'
import { api, errorMessage } from '@/api/client'
import { useI18n } from '@/i18n'
import { useMetaStore } from '@/stores/meta'
import { copyText } from '@/utils/clipboard'
import { authLabel, sourceLabel } from '@/utils/status'
import type { ConfigView } from '@/types'

const router = useRouter()
const { t, tn } = useI18n()
const { refresh } = useMetaStore()

const configView = ref<ConfigView | null>(null)
const loading = ref(true)
const error = ref('')
const saving = ref('')

const modelForm = reactive({
  model: '',
  effort: '',
  maxTokens: 0,
  language: '',
})
const initialModel = reactive({ ...modelForm })

const llmForm = reactive({
  url: '',
  model: '',
  protocol: '',
  timeoutSec: 0,
  authToken: '',
  authTokenCmd: '',
})
const initialLlm = reactive({ ...llmForm })

const telemetryForm = reactive({
  enabled: false,
  exporter: '',
  otlpEndpoint: '',
  contentLog: false,
})
const initialTelemetry = reactive({ ...telemetryForm })

const modelOptions = computed(() => {
  const view = configView.value
  const options = new Set<string>()
  if (view?.active.model) options.add(view.active.model)
  for (const entry of Object.values(view?.providers ?? {})) {
    for (const model of entry.models ?? []) options.add(model)
    if (entry.model) options.add(entry.model)
  }
  for (const entry of Object.values(view?.custom_providers ?? {})) {
    for (const model of entry.models ?? []) options.add(model)
    if (entry.model) options.add(entry.model)
  }
  if (modelForm.model) options.add(modelForm.model)
  return Array.from(options)
})

const modelDirty = computed(
  () =>
    modelForm.model.trim() !== initialModel.model ||
    modelForm.effort !== initialModel.effort ||
    Number(modelForm.maxTokens || 0) !== initialModel.maxTokens ||
    modelForm.language.trim() !== initialModel.language,
)

const llmDirty = computed(
  () =>
    llmForm.url.trim() !== initialLlm.url ||
    llmForm.model.trim() !== initialLlm.model ||
    llmForm.protocol !== initialLlm.protocol ||
    Number(llmForm.timeoutSec || 0) !== initialLlm.timeoutSec ||
    llmForm.authToken.trim() !== '' ||
    llmForm.authTokenCmd.trim() !== initialLlm.authTokenCmd,
)

const telemetryDirty = computed(
  () =>
    telemetryForm.enabled !== initialTelemetry.enabled ||
    telemetryForm.exporter !== initialTelemetry.exporter ||
    telemetryForm.otlpEndpoint.trim() !== initialTelemetry.otlpEndpoint ||
    telemetryForm.contentLog !== initialTelemetry.contentLog,
)

async function load(silent = false): Promise<void> {
  if (!silent) loading.value = true
  error.value = ''
  try {
    const view = await api.config()
    configView.value = view
    if (view.error) error.value = t('config.file.parseFailed', { error: view.error })
    modelForm.model = view.active.model || view.providers?.[view.active.provider || '']?.model || ''
    modelForm.effort = view.effort || ''
    modelForm.maxTokens = view.max_tokens || 0
    modelForm.language = view.language || ''
    Object.assign(initialModel, {
      model: modelForm.model,
      effort: modelForm.effort,
      maxTokens: modelForm.maxTokens,
      language: modelForm.language,
    })

    llmForm.url = view.llm.url || ''
    llmForm.model = view.llm.model || ''
    llmForm.protocol = view.llm.protocol || 'anthropic'
    llmForm.timeoutSec = view.llm.timeout_sec || 0
    llmForm.authToken = ''
    llmForm.authTokenCmd = view.llm.auth_token_cmd || ''
    Object.assign(initialLlm, {
      url: llmForm.url,
      model: llmForm.model,
      protocol: llmForm.protocol,
      timeoutSec: llmForm.timeoutSec,
      authToken: '',
      authTokenCmd: llmForm.authTokenCmd,
    })

    telemetryForm.enabled = view.telemetry?.enabled ?? false
    telemetryForm.exporter = view.telemetry?.exporter || ''
    telemetryForm.otlpEndpoint = view.telemetry?.otlp_endpoint || ''
    telemetryForm.contentLog = view.telemetry?.content_logging ?? false
    Object.assign(initialTelemetry, { ...telemetryForm })
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    if (!silent) loading.value = false
  }
}

async function applyChanges(set: Record<string, string>, unset: string[] = []): Promise<void> {
  const response = await api.applyConfig(set, unset)
  await Promise.all([load(true), refresh(true)])
  const first = response.messages.find(Boolean)
  ElMessage.success(first ? first.replace(/^Set /, t('config.toast.savedPrefix')) : t('config.toast.saved'))
}

async function saveModel(): Promise<void> {
  const set: Record<string, string> = {}
  const unset: string[] = []
  if (modelForm.model.trim() !== initialModel.model) set.model = modelForm.model.trim()
  if (modelForm.effort !== initialModel.effort) {
    if (modelForm.effort) set.effort = modelForm.effort
    else unset.push('effort')
  }
  const maxTokens = Number(modelForm.maxTokens || 0)
  if (maxTokens !== initialModel.maxTokens) {
    if (maxTokens > 0) set.max_tokens = String(maxTokens)
    else unset.push('max_tokens')
  }
  if (modelForm.language.trim() !== initialModel.language) set.language = modelForm.language.trim()
  if (!Object.keys(set).length && !unset.length) return
  saving.value = 'model'
  try {
    await applyChanges(set, unset)
  } catch (err) {
    ElMessage.error(errorMessage(err))
  } finally {
    saving.value = ''
  }
}

async function saveLlm(): Promise<void> {
  const set: Record<string, string> = {}
  if (llmForm.url.trim() !== initialLlm.url) set['llm.url'] = llmForm.url.trim()
  if (llmForm.model.trim() !== initialLlm.model) set['llm.model'] = llmForm.model.trim()
  if (llmForm.protocol !== initialLlm.protocol) set['llm.protocol'] = llmForm.protocol
  if (Number(llmForm.timeoutSec || 0) !== initialLlm.timeoutSec) {
    set['llm.timeout_sec'] = String(Number(llmForm.timeoutSec || 0))
  }
  if (llmForm.authToken.trim()) set['llm.auth_token'] = llmForm.authToken.trim()
  if (llmForm.authTokenCmd.trim() !== initialLlm.authTokenCmd) {
    set['llm.auth_token_cmd'] = llmForm.authTokenCmd.trim()
  }
  if (!Object.keys(set).length) return
  saving.value = 'llm'
  try {
    await applyChanges(set)
    llmForm.authToken = ''
  } catch (err) {
    ElMessage.error(errorMessage(err))
  } finally {
    saving.value = ''
  }
}

async function clearToken(): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('config.legacy.clearTokenConfirm'),
      t('config.legacy.clearTokenTitle'),
      { confirmButtonText: t('config.legacy.clearTokenConfirmButton'), cancelButtonText: t('common.cancel'), type: 'warning' },
    )
  } catch {
    return
  }
  saving.value = 'clear-token'
  try {
    await applyChanges({ 'llm.auth_token': '' })
  } catch (err) {
    ElMessage.error(errorMessage(err))
  } finally {
    saving.value = ''
  }
}

async function saveTelemetry(): Promise<void> {
  const set: Record<string, string> = {
    'telemetry.enabled': String(telemetryForm.enabled),
    'telemetry.content_logging': String(telemetryForm.contentLog),
  }
  if (telemetryForm.exporter) set['telemetry.exporter'] = telemetryForm.exporter
  if (telemetryForm.otlpEndpoint.trim() !== initialTelemetry.otlpEndpoint) {
    set['telemetry.otlp_endpoint'] = telemetryForm.otlpEndpoint.trim()
  }
  saving.value = 'telemetry'
  try {
    await applyChanges(set)
  } catch (err) {
    ElMessage.error(errorMessage(err))
  } finally {
    saving.value = ''
  }
}

async function removeMcp(name: string): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('config.mcp.removeConfirm', { name }),
      t('config.mcp.removeServer'),
      { confirmButtonText: t('config.mcp.removeButton'), cancelButtonText: t('common.cancel'), type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await applyChanges({}, [`mcp_servers.${name}`])
  } catch (err) {
    ElMessage.error(errorMessage(err))
  }
}

async function copyPath(): Promise<void> {
  const copied = await copyText(configView.value?.path ?? '')
  if (copied) ElMessage.success(t('config.file.copied'))
  else ElMessage.error(t('config.file.copyFailed'))
}

function go(path: string): void {
  void router.push(path)
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.8fr);
  gap: 18px;
  align-items: start;
}

.settings-main {
  gap: 18px;
}

.settings-rail {
  gap: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 20px);
}

.active-provider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--bg-tint);
}

.active-provider__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  flex: none;
}

.active-provider__body {
  min-width: 0;
  flex: 1;
}

.active-provider__name {
  color: var(--ink-strong);
  font-size: 11.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-provider__meta {
  margin-top: 1px;
  color: var(--ink-faint);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-provider__meta .sep {
  margin: 0 4px;
  color: var(--line-strong);
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--accent-ink);
  font-size: 11px;
  font-weight: 600;
  flex: none;
}

.settings-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.full-width {
  width: 100%;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.form-actions--split {
  justify-content: flex-start;
}

.dirty-note {
  color: var(--accent-ink);
  font-size: 10.5px;
  font-weight: 600;
}

.legacy-warning {
  margin-bottom: 15px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 11px 0;
  border-top: 1px dashed var(--line);
}

.toggle-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.toggle-row__title {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 600;
}

.toggle-row__text {
  margin-top: 2px;
  color: var(--ink-faint);
  font-size: 10.5px;
  line-height: 1.5;
}

.telemetry-grid {
  margin-top: 6px;
}

.config-path {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-tint);
  color: var(--ink-muted);
  font-size: 10px;
}

.config-path .mono {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.config-error {
  margin-top: 9px;
  padding: 8px 9px;
  border-radius: 7px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 10.5px;
  line-height: 1.5;
}

.config-note {
  margin-top: 10px;
  color: var(--ink-faint);
  font-size: 10.5px;
  line-height: 1.6;
}

.config-actions {
  display: flex;
  gap: 6px;
  margin-top: 11px;
}

.mcp-list {
  display: flex;
  flex-direction: column;
}

.mcp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border-top: 1px solid var(--line);
}

.mcp-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.mcp-row__body {
  min-width: 0;
  flex: 1;
}

.mcp-row__name {
  color: var(--ink-strong);
  font-size: 11.5px;
  font-weight: 600;
}

.mcp-row__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
  min-width: 0;
  color: var(--ink-faint);
  font-size: 9.5px;
}

.mcp-row__meta .mono {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-faint);
  font-size: 12px;
  cursor: pointer;
  flex: none;
}

.icon-button:hover {
  background: var(--red-soft);
  color: var(--red);
}

.settings-tip {
  padding: 16px 17px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    radial-gradient(180px 100px at 100% 0%, rgba(201, 100, 66, 0.07), transparent 70%),
    var(--bg-tint);
}

.settings-tip__title {
  color: var(--accent-ink);
  font-family: var(--font-display);
  font-size: 14px;
  font-style: italic;
}

.settings-tip__text {
  margin-top: 5px;
  color: var(--ink-muted);
  font-size: 10.8px;
  line-height: 1.65;
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

@media (max-width: 1060px) {
  .settings-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .settings-rail {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-tip {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .settings-rail {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
